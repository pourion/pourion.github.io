import { describe, it, expect } from 'vitest';
import { buildQuadtree } from '../src/scripts/mesh/quadtree.js';

const leavesOf = (flat) => {
  const out = [];
  for (let i = 0; i < flat.length; i += 3) out.push({ x: flat[i], y: flat[i + 1], s: flat[i + 2] });
  return out;
};
const contains = (x, y, s, px, py) => px >= x && px < x + s && py >= y && py < y + s;

describe('buildQuadtree', () => {
  it('returns the root cells when nothing is refined', () => {
    const leaves = leavesOf(buildQuadtree({ x0: 0, y0: 0, width: 512, height: 256, root: 128, minSize: 4, shouldRefine: () => false }));
    expect(leaves.length).toBe(8);
    expect(leaves.every((l) => l.s === 128)).toBe(true);
  });

  it('refines only around a point, down to the minimum size', () => {
    const px = 100.5, py = 100.5;
    const leaves = leavesOf(buildQuadtree({
      x0: 0, y0: 0, width: 512, height: 512, root: 128, minSize: 4,
      shouldRefine: (x, y, s) => contains(x, y, s, px, py),
    }));
    // 15 untouched root cells, and one root cell split five times: 1 + 3 × 5 leaves.
    expect(leaves.length).toBe(31);
    expect(leaves.filter((l) => contains(l.x, l.y, l.s, px, py))).toEqual([{ x: 100, y: 100, s: 4 }]);
    expect(leaves.filter((l) => l.s === 128).length).toBe(15);
  });

  it('tiles the rectangle without gaps or overlaps', () => {
    const hash = (x, y, s) => ((x * 73856093) ^ (y * 19349663) ^ (s * 83492791)) >>> 0;
    const leaves = leavesOf(buildQuadtree({
      x0: 0, y0: 0, width: 256, height: 256, root: 128, minSize: 8,
      shouldRefine: (x, y, s) => hash(x, y, s) % 3 !== 0,
    }));
    const area = leaves.reduce((a, l) => a + l.s * l.s, 0);
    expect(area).toBe(256 * 256);
    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        const a = leaves[i], b = leaves[j];
        const overlap = a.x < b.x + b.s && b.x < a.x + a.s && a.y < b.y + b.s && b.y < a.y + a.s;
        expect(overlap).toBe(false);
      }
    }
  });

  it('aligns root cells to multiples of the root size', () => {
    // [130, 230) × [10, 60) lies inside the root cell at (128, 0).
    const leaves = leavesOf(buildQuadtree({ x0: 130, y0: 10, width: 100, height: 50, root: 128, minSize: 4, shouldRefine: () => false }));
    expect(leaves).toEqual([{ x: 128, y: 0, s: 128 }]);
  });

  it('leaves out root cells for which skipRoot is true', () => {
    const leaves = leavesOf(buildQuadtree({
      x0: 0, y0: 0, width: 512, height: 512, root: 128, minSize: 4,
      shouldRefine: () => false, skipRoot: (x, y) => x === 0 && y === 0,
    }));
    expect(leaves.length).toBe(15);
    expect(leaves.some((l) => l.x === 0 && l.y === 0)).toBe(false);
  });
});
