// Summed-area tables over 0/1 arrays, used to count mask pixels in a rectangle in O(1).

/**
 * @param {ArrayLike<number>} values row-major, width × height
 * @param {number} width
 * @param {number} height
 * @returns {Uint32Array} (width + 1) × (height + 1), row-major
 */
export function summedArea(values, width, height) {
  const w1 = width + 1;
  const sat = new Uint32Array(w1 * (height + 1));
  for (let y = 1; y <= height; y++) {
    let row = 0;
    const src = (y - 1) * width;
    for (let x = 1; x <= width; x++) {
      row += values[src + x - 1];
      sat[y * w1 + x] = sat[(y - 1) * w1 + x] + row;
    }
  }
  return sat;
}

function clampRect(width, height, x0, y0, x1, y1) {
  const a = Math.max(0, Math.min(width, Math.floor(x0)));
  const b = Math.max(0, Math.min(width, Math.ceil(x1)));
  const c = Math.max(0, Math.min(height, Math.floor(y0)));
  const d = Math.max(0, Math.min(height, Math.ceil(y1)));
  return [a, b, c, d];
}

/** Sum over [x0, x1) × [y0, y1), rounded outward and clamped to the array. */
export function rectSum(sat, width, height, x0, y0, x1, y1) {
  const [a, b, c, d] = clampRect(width, height, x0, y0, x1, y1);
  if (a >= b || c >= d) return 0;
  const w1 = width + 1;
  return sat[d * w1 + b] - sat[c * w1 + b] - sat[d * w1 + a] + sat[c * w1 + a];
}

/** Fraction of ones in the clamped rectangle, or 0 when it is empty. */
export function rectFraction(sat, width, height, x0, y0, x1, y1) {
  const [a, b, c, d] = clampRect(width, height, x0, y0, x1, y1);
  if (a >= b || c >= d) return 0;
  const w1 = width + 1;
  const sum = sat[d * w1 + b] - sat[c * w1 + b] - sat[d * w1 + a] + sat[c * w1 + a];
  return sum / ((b - a) * (d - c));
}
