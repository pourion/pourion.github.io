import { describe, it, expect } from 'vitest';
import { summedArea, rectSum, rectFraction } from '../src/scripts/mesh/sat.js';

// 3 × 2 array
// 1 0 1
// 1 1 0
const values = [1, 0, 1, 1, 1, 0];

describe('summed-area table', () => {
  const sat = summedArea(values, 3, 2);

  it('has (width + 1) × (height + 1) entries', () => {
    expect(sat.length).toBe(12);
  });

  it('sums the whole array', () => {
    expect(rectSum(sat, 3, 2, 0, 0, 3, 2)).toBe(4);
  });

  it('sums a sub-rectangle', () => {
    expect(rectSum(sat, 3, 2, 1, 0, 3, 2)).toBe(2);
    expect(rectSum(sat, 3, 2, 0, 1, 2, 2)).toBe(2);
  });

  it('rounds coordinates outward', () => {
    expect(rectSum(sat, 3, 2, 0.5, 0.2, 1.2, 0.9)).toBe(rectSum(sat, 3, 2, 0, 0, 2, 1));
  });

  it('clamps rectangles that extend past the array', () => {
    expect(rectSum(sat, 3, 2, -5, -5, 10, 10)).toBe(4);
  });

  it('returns 0 for an empty or outside rectangle', () => {
    expect(rectSum(sat, 3, 2, 2, 1, 2, 1)).toBe(0);
    expect(rectSum(sat, 3, 2, 5, 5, 9, 9)).toBe(0);
    expect(rectFraction(sat, 3, 2, 5, 5, 9, 9)).toBe(0);
  });

  it('returns the fraction of ones in a rectangle', () => {
    expect(rectFraction(sat, 3, 2, 0, 0, 3, 2)).toBeCloseTo(4 / 6);
    expect(rectFraction(sat, 3, 2, 0, 0, 1, 2)).toBe(1);
  });
});
