// Leaves of a non-graded quadtree. Neighbouring leaves may differ in size by more than a
// factor of two, as in the island dynamics model on non-graded quadtree grids.

/**
 * @param {{
 *   x0: number, y0: number, width: number, height: number,
 *   root: number, minSize: number,
 *   shouldRefine: (x: number, y: number, size: number) => boolean,
 *   skipRoot?: (x: number, y: number) => boolean,
 * }} options
 * @returns {number[]} flat list x, y, size, x, y, size, …
 */
export function buildQuadtree({ x0, y0, width, height, root, minSize, shouldRefine, skipRoot }) {
  const out = [];
  const refine = (x, y, s) => {
    if (s > minSize && shouldRefine(x, y, s)) {
      const h = s / 2;
      refine(x, y, h);
      refine(x + h, y, h);
      refine(x, y + h, h);
      refine(x + h, y + h, h);
    } else {
      out.push(x, y, s);
    }
  };
  const gx = Math.floor(x0 / root) * root;
  const gy = Math.floor(y0 / root) * root;
  for (let y = gy; y < y0 + height; y += root) {
    for (let x = gx; x < x0 + width; x += root) {
      if (skipRoot && skipRoot(x, y)) continue;
      refine(x, y, root);
    }
  }
  return out;
}
