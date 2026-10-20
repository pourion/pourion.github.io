// Rasterizes the visible text and media of the page into a half-resolution mask in
// document coordinates, and records the smallest mesh cell allowed near each word.
import { summedArea, rectFraction } from './sat.js';

const CAP_NONE = 255;
const SKIP = '[data-mesh-skip], [aria-hidden="true"], script, style, noscript, template, canvas, svg';

/** Smallest mesh cell, in CSS px, for text of a given font size. */
export function capForFont(px) {
  return px >= 36 ? 4 : px >= 22 ? 8 : 16;
}

/**
 * @param {{ root?: Element, scale?: number }} [options]
 */
export function rasterizeText({ root = document.body, scale = 0.5 } = {}) {
  const width = document.documentElement.clientWidth;
  const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
  const mw = Math.max(1, Math.ceil(width * scale));
  const mh = Math.max(1, Math.ceil(height * scale));
  const ox = window.scrollX;
  const oy = window.scrollY;

  const surface = document.createElement('canvas');
  surface.width = mw;
  surface.height = mh;
  const ctx = surface.getContext('2d', { willReadFrequently: true });
  ctx.scale(scale, scale);
  ctx.fillStyle = '#fff';

  const cap = new Uint8Array(mw * mh).fill(CAP_NONE);
  const setCap = (x0, y0, x1, y1, value) => {
    const a = Math.max(0, Math.floor(x0 * scale));
    const b = Math.min(mw, Math.ceil(x1 * scale));
    const c = Math.max(0, Math.floor(y0 * scale));
    const d = Math.min(mh, Math.ceil(y1 * scale));
    for (let y = c; y < d; y++) {
      for (let x = a; x < b; x++) {
        const i = y * mw + x;
        if (value < cap[i]) cap[i] = value;
      }
    }
  };

  // Images, video and embedded frames are filled boxes; only their outline is refined.
  for (const el of root.querySelectorAll('img, iframe, video')) {
    if (el.closest(SKIP)) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const x = r.left + ox;
    const y = r.top + oy;
    ctx.fillRect(x, y, r.width, r.height);
    setCap(x - 24, y - 24, x + r.width + 24, y + r.height + 24, 8);
  }

  // Text is drawn word by word at the position and in the font the browser used.
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      !n.textContent.trim() || !n.parentElement || n.parentElement.closest(SKIP)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  const range = document.createRange();
  const word = /\S+/g;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const cs = getComputedStyle(node.parentElement);
    if (cs.visibility === 'hidden') continue;
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const fontPx = parseFloat(cs.fontSize);
    const capValue = capForFont(fontPx);
    const pad = fontPx * 0.6;
    const upper = cs.textTransform === 'uppercase';
    const text = node.textContent;
    word.lastIndex = 0;
    for (let m = word.exec(text); m; m = word.exec(text)) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const r = range.getClientRects()[0];
      if (!r || !r.width) continue;
      const x = r.left + ox;
      const y = r.top + oy;
      const glyphs = upper ? m[0].toUpperCase() : m[0];
      const metrics = ctx.measureText(glyphs);
      setCap(x - pad, y - pad, x + r.width + pad, y + r.height + pad, capValue);
      ctx.save();
      ctx.translate(x, y + metrics.fontBoundingBoxAscent);
      ctx.scale(r.width / Math.max(1, metrics.width), 1); // absorbs letter-spacing
      ctx.fillText(glyphs, 0, 0);
      ctx.restore();
    }
  }

  const pixels = ctx.getImageData(0, 0, mw, mh).data;
  const bits = new Uint8Array(mw * mh);
  for (let i = 0; i < bits.length; i++) bits[i] = pixels[4 * i + 3] > 96 ? 1 : 0;
  const sat = summedArea(bits, mw, mh);

  const capAt = (x, y) => {
    const mx = Math.min(mw - 1, Math.max(0, Math.floor(x * scale)));
    const my = Math.min(mh - 1, Math.max(0, Math.floor(y * scale)));
    return cap[my * mw + mx];
  };

  return {
    width,
    height,
    frac: (x0, y0, x1, y1) => rectFraction(sat, mw, mh, x0 * scale, y0 * scale, x1 * scale, y1 * scale),
    capIn: (x, y, s) =>
      Math.min(capAt(x, y), capAt(x + s - 1, y), capAt(x, y + s - 1), capAt(x + s - 1, y + s - 1), capAt(x + s / 2, y + s / 2)),
  };
}
