import { describe, it, expect } from 'vitest';
import { createAllenCahn, gridFor, cellBudget, stepsPerFrame } from '../src/scripts/sim/allenCahn.js';

const maxAbs = (a) => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

describe('gridFor', () => {
  it('gives 640 × 328 for the desktop hero aspect ratio', () => {
    expect(gridFor(1280, 656)).toEqual({ nx: 640, ny: 328 });
  });

  it('follows a portrait aspect ratio with about 210 000 cells', () => {
    const { nx, ny } = gridFor(390, 700);
    expect(nx).toBeLessThan(ny);
    expect(Math.abs(nx * ny - 210000) / 210000).toBeLessThan(0.01);
  });
});

describe('Allen–Cahn solver', () => {
  it('is reproducible for a given seed', () => {
    const a = createAllenCahn({ nx: 64, ny: 48, seed: 7 });
    const b = createAllenCahn({ nx: 64, ny: 48, seed: 7 });
    a.step(10);
    b.step(10);
    expect(Array.from(a.field)).toEqual(Array.from(b.field));
  });

  it('keeps the field within [-1.05, 1.05]', () => {
    const sim = createAllenCahn({ nx: 64, ny: 64, seed: 3 });
    sim.step(2000);
    expect(maxAbs(sim.field)).toBeLessThanOrEqual(1.05);
  });

  it('separates into phases near ±1', () => {
    const sim = createAllenCahn({ nx: 64, ny: 64, seed: 3 });
    sim.step(2000);
    const nearWell = sim.field.filter((v) => Math.abs(Math.abs(v) - 1) < 0.1).length;
    expect(nearWell / sim.field.length).toBeGreaterThan(0.5);
  });

  it('does not increase the free energy', () => {
    const sim = createAllenCahn({ nx: 64, ny: 64, seed: 11 });
    let previous = sim.freeEnergy();
    for (let n = 0; n < 500; n++) {
      sim.step(1);
      const current = sim.freeEnergy();
      expect(current).toBeLessThanOrEqual(previous + 1e-5 * Math.abs(previous));
      previous = current;
    }
  });

  it('leaves the uniform states u = 1 and u = -1 unchanged', () => {
    for (const value of [1, -1]) {
      const sim = createAllenCahn({ nx: 16, ny: 16, seed: 1 });
      sim.field.fill(value);
      sim.step(5);
      expect(Array.from(sim.field).every((v) => v === value)).toBe(true);
    }
  });

  it('counts steps and resets the count', () => {
    const sim = createAllenCahn({ nx: 16, ny: 16, seed: 1 });
    sim.step(3);
    expect(sim.steps).toBe(3);
    sim.reset(2);
    expect(sim.steps).toBe(0);
  });
});

describe('cellBudget', () => {
  it('gives about 90 000 cells on phones and 210 000 elsewhere', () => {
    expect(cellBudget(true)).toBe(90000);
    expect(cellBudget(false)).toBe(210000);
  });
});

describe('stepsPerFrame', () => {
  it('steps down one level above 8 ms', () => {
    expect(stepsPerFrame(9, 3)).toBe(2);
    expect(stepsPerFrame(9, 2)).toBe(1);
    expect(stepsPerFrame(9, 1)).toBe(1);
  });
  it('steps up one level below 4 ms, up to 3', () => {
    expect(stepsPerFrame(3, 1)).toBe(2);
    expect(stepsPerFrame(3, 2)).toBe(3);
    expect(stepsPerFrame(3, 3)).toBe(3);
  });
  it('keeps the level between 4 and 8 ms', () => {
    expect(stepsPerFrame(4, 2)).toBe(2);
    expect(stepsPerFrame(6, 3)).toBe(3);
    expect(stepsPerFrame(8, 1)).toBe(1);
  });
});
