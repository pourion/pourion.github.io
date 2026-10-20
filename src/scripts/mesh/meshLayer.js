// One document-wide adaptive mesh. The page mesh is drawn on a fixed, viewport-sized
// canvas behind the content and redrawn on scroll. A region (the home hero) draws its
// part of the mesh on its own canvas and can add a refinement predicate of its own.
import { buildQuadtree } from './quadtree.js';
import { rasterizeText } from './textMask.js';

const ROOT = 128;
const BAND = 0.75;
const INK = '242,239,232';
const PAGE_ALPHA = 0.07;

let instance = null;

export function getMeshLayer() {
  if (!instance) instance = createMeshLayer();
  return instance;
}

function docRect(el) {
  const r = el.getBoundingClientRect();
  const left = r.left + window.scrollX;
  const top = r.top + window.scrollY;
  return { left, top, right: left + r.width, bottom: top + r.height, width: r.width, height: r.height };
}

function strokeLeaves(ctx, leaves, ox, oy, alpha, view) {
  const dpr = window.devicePixelRatio || 1;
  const paths = new Map();
  for (let i = 0; i < leaves.length; i += 3) {
    const x = leaves[i];
    const y = leaves[i + 1];
    const s = leaves[i + 2];
    if (view && (x > view.right || x + s < view.left || y > view.bottom || y + s < view.top)) continue;
    const a = Math.round(alpha * Math.min(1, Math.max(0.4, s / 24)) * 1000); // finer cells are fainter
    let path = paths.get(a);
    if (!path) paths.set(a, (path = new Path2D()));
    path.rect(Math.round(x - ox) + 0.5 / dpr, Math.round(y - oy) + 0.5 / dpr, s, s);
  }
  ctx.lineWidth = 1 / dpr;
  for (const [a, path] of paths) {
    ctx.strokeStyle = `rgba(${INK},${a / 1000})`;
    ctx.stroke(path);
  }
}

function sizeCanvas(canvas, w, h) {
  const dpr = window.devicePixelRatio || 1;
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  return ctx;
}

function createMeshLayer() {
  let canvas = null;
  let mask = null;
  let page = [];
  let builds = 0;
  let builtSize = '';
  let drawQueued = false;
  let rebuildTimer = 0;
  const regions = new Map();

  const minSize = () => (window.matchMedia('(max-width: 640px)').matches ? 8 : 4);
  const intersects = (x, y, s, r) => x < r.right && x + s > r.left && y < r.bottom && y + s > r.top;
  const docSize = () =>
    `${document.documentElement.clientWidth}x${Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)}`;

  function textRefine(x, y, s) {
    const m = s * BAND;
    const f = mask.frac(x - m, y - m, x + s + m, y + s + m);
    return f > 0.002 && f < 0.998 && s > Math.min(mask.capIn(x, y, s), ROOT);
  }

  function drawPage() {
    drawQueued = false;
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const ctx = sizeCanvas(canvas, w, h);
    const ox = window.scrollX;
    const oy = window.scrollY;
    strokeLeaves(ctx, page, ox, oy, PAGE_ALPHA, { left: ox, top: oy, right: ox + w, bottom: oy + h });
  }

  function queueDraw() {
    if (drawQueued) return;
    drawQueued = true;
    requestAnimationFrame(drawPage);
  }

  function buildRegion(r) {
    const rect = r.rect;
    r.leaves = buildQuadtree({
      x0: rect.left, y0: rect.top, width: rect.width, height: rect.height,
      root: ROOT, minSize: minSize(),
      shouldRefine: (x, y, s) => textRefine(x, y, s) || r.refine(x, y, s, rect),
    });
  }

  function drawRegion(r) {
    const ctx = sizeCanvas(r.canvas, Math.round(r.rect.width), Math.round(r.rect.height));
    strokeLeaves(ctx, r.leaves, r.rect.left, r.rect.top, r.alpha, null);
  }

  function rebuildAll() {
    if (!canvas) return;
    mask = rasterizeText({ root: document.body });
    builtSize = docSize();
    for (const r of regions.values()) r.rect = docRect(r.element);
    const rects = [...regions.values()].map((r) => r.rect);
    page = buildQuadtree({
      x0: 0, y0: 0, width: mask.width, height: mask.height,
      root: ROOT, minSize: minSize(),
      skipRoot: (x, y) => rects.some((rc) => intersects(x, y, ROOT, rc)),
      shouldRefine: textRefine,
    });
    let leaves = page.length / 3;
    for (const r of regions.values()) {
      buildRegion(r);
      drawRegion(r);
      leaves += r.leaves.length / 3;
    }
    builds++;
    document.documentElement.dataset.meshLeaves = String(leaves);
    document.documentElement.dataset.meshBuilds = String(builds);
    drawPage();
  }

  function scheduleRebuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(rebuildAll, 250);
  }

  return {
    mount(c) {
      canvas = c;
      const start = () => {
        rebuildAll();
        // Rebuild only when the document's size changes. A phone's URL bar changes the
        // viewport height, not the document, so it only triggers a redraw.
        new ResizeObserver(() => {
          if (docSize() !== builtSize) scheduleRebuild();
        }).observe(document.body);
      };
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
      window.addEventListener('scroll', queueDraw, { passive: true });
      window.addEventListener('resize', queueDraw);
    },
    setRegion(id, { element, canvas: regionCanvas, refine, alpha = 0.1 }) {
      regions.set(id, { element, canvas: regionCanvas, refine, alpha, rect: null, leaves: [] });
      if (mask) rebuildAll();
    },
    rebuildRegion(id) {
      const r = regions.get(id);
      if (!r || !mask || !r.rect) return;
      buildRegion(r);
      drawRegion(r);
    },
  };
}
