# Direction C Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home hero with a live Allen–Cahn simulation on an adaptive quadtree mesh, draw a still adaptive mesh behind every page, and switch the site typeface to Source Serif 4.

**Architecture:** Three DOM-free modules (`sat.js`, `allenCahn.js`, `quadtree.js`) carry the numerics and are unit-tested with Vitest. Two DOM modules (`textMask.js`, `meshLayer.js`) rasterize the page text and draw the mesh. Two Astro components (`MeshLayer.astro` in `Base.astro`, `SimHero.astro` on the home page) wire them into the site. The base mesh is drawn on one fixed canvas behind the content; the hero draws its own part of the mesh on a canvas inside the hero, above the simulation.

**Tech Stack:** Astro 6 (static output), plain JavaScript modules with JSDoc, Canvas 2D, Vitest (dev only), `@fontsource-variable/source-serif-4`, Python 3 with NumPy and Pillow for the one-off fallback image.

**Spec:** `docs/superpowers/specs/2026-10-19-direction-c-redesign-design.md`

## Global Constraints

- No runtime dependencies are added. Vitest is a dev dependency only.
- The modules and components added by this plan stay below 15 KB of JavaScript before compression.
- One simulation step batch plus one draw stays below 6 ms on a recent laptop.
- Typeface: Source Serif 4 (`'Source Serif 4 Variable'`) for all text, JetBrains Mono for labels. Fraunces is removed, including every `SOFT` and `WONK` axis setting. Only the `opsz` axis may be set.
- Display text weight 300, body text weight 400.
- Palette unchanged: background `#0B0C0F`, text `#F2EFE8`, accent `#E6A23C`. Constellation lane colours unchanged.
- Mesh line colour `rgba(242,239,232,α)`: α = 0.07 for the page mesh, 0.10 for the hero mesh. Cells smaller than 24 px are drawn fainter, down to 0.4 α.
- Smallest mesh cell: 4 px on desktop, 8 px when `(max-width: 640px)` matches. Font-size caps: 4 px for text ≥ 36 px, 8 px for text ≥ 22 px, 16 px otherwise. Images, iframes and videos: 8 px.
- Graded band: the text predicate looks 0.75 × cell size past each cell edge; the interface predicate looks 0.25 × cell size past each edge and stops at 8 px cells.
- Allen–Cahn: u_t = Δu + k(u − u³), unit grid spacing, dt = 0.2, k = 0.25, about 210 000 cells, three steps per drawn frame, at most 30 drawn frames per second, restart after 24 000 steps.
- The hero caption states the real grid size and says the PDE is solved with explicit finite differences in the browser and that the quadtree is refined on the interface u = 0 and on the text.
- Copy rules: no content changes. Captions and labels added by this plan use plain scientific wording, with no "not X but Y" constructions.
- External links keep `target="_blank" rel="noopener"`.
- Work happens on the branch `direction-c`. Nothing is pushed to `master` until Pouria approves.

## Review Focus

- A page opened already scrolled (an anchor such as `/#foundings`, or a back navigation): the mesh must line up with the text, because rasterization uses document coordinates. Pinned in Task 5, Step 7.
- The page layout changes after the first build (late images, web-font swap): the mesh must rebuild and line up again. Pinned in Task 5, Step 8.
- A phone's URL bar showing and hiding changes only the viewport height: the mesh must redraw without rebuilding. Pinned in Task 5, Step 9.
- The hero is off-screen at load or the tab is hidden: the simulation must not run. Pinned in Task 6, Step 9.
- A very long page (the Stencil essay): the mesh must build and draw without errors. Pinned in Task 7, Step 3.

---

### Task 1: Branch, Vitest and summed-area tables

**Files:**
- Modify: `package.json` (add `test` script and `vitest` dev dependency)
- Create: `src/scripts/mesh/sat.js`
- Test: `tests/sat.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `summedArea(values: ArrayLike<number>, width: number, height: number): Uint32Array` — table of size `(width + 1) * (height + 1)`, row-major.
  - `rectSum(sat: Uint32Array, width: number, height: number, x0: number, y0: number, x1: number, y1: number): number` — sum over `[x0, x1) × [y0, y1)` after rounding outward and clamping to the array.
  - `rectFraction(sat, width, height, x0, y0, x1, y1): number` — `rectSum / area` of the clamped rectangle, or 0 when the clamped area is 0.

- [ ] **Step 1: Create the branch and install Vitest**

```bash
cd /home/pmistani/Documents/pourion.github.io
git checkout -b direction-c
npm install --save-dev vitest
npm pkg set scripts.test="vitest run"
```

- [ ] **Step 2: Write the failing test**

Create `tests/sat.test.js`:

```js
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run tests/sat.test.js`
Expected: FAIL with an error that `../src/scripts/mesh/sat.js` cannot be resolved.

- [ ] **Step 4: Implement `sat.js`**

Create `src/scripts/mesh/sat.js`:

```js
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tests/sat.test.js`
Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/scripts/mesh/sat.js tests/sat.test.js
git commit -m "test: add Vitest and summed-area table helpers for the mesh"
```

---

### Task 2: Allen–Cahn solver

**Files:**
- Create: `src/scripts/sim/allenCahn.js`
- Test: `tests/allenCahn.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `gridFor(width: number, height: number, cells?: number): { nx: number, ny: number }` — grid with about `cells` cells (default 210 000) and the aspect ratio of `width / height` (clamped to [0.2, 5]).
  - `createAllenCahn({ nx, ny, dt = 0.2, k = 0.25, seed = 1 }): Sim` where `Sim` has
    - `nx`, `ny` (numbers),
    - `field` (getter, `Float32Array` of length `nx * ny`, row-major; the array object changes after each step),
    - `steps` (getter, number of steps since the last reset),
    - `reset(seed: number): void` — smooth random initial condition, `steps` set to 0,
    - `step(n?: number): void` — `n` explicit steps (default 1),
    - `freeEnergy(): number` — Σ [½|∇u|² + (k/4)(u² − 1)²] with forward differences.

- [ ] **Step 1: Write the failing test**

Create `tests/allenCahn.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { createAllenCahn, gridFor } from '../src/scripts/sim/allenCahn.js';

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/allenCahn.test.js`
Expected: FAIL, `../src/scripts/sim/allenCahn.js` cannot be resolved.

- [ ] **Step 3: Implement the solver**

Create `src/scripts/sim/allenCahn.js`:

```js
// Allen–Cahn equation u_t = Δu + k (u − u³) on a periodic grid with unit spacing,
// integrated with the five-point Laplacian and forward Euler. With dt = 0.2 the step
// is a gradient-descent step on the discrete Ginzburg–Landau free energy, so the
// energy does not increase.

/** Mulberry32 pseudo-random generator, so a seed gives a reproducible initial condition. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Grid with about `cells` cells and the aspect ratio of the element it is drawn into.
 * @returns {{ nx: number, ny: number }}
 */
export function gridFor(width, height, cells = 210000) {
  const aspect = Math.max(0.2, Math.min(5, width / Math.max(1, height)));
  const nx = Math.max(16, Math.round(Math.sqrt(cells * aspect)));
  const ny = Math.max(16, Math.round(cells / nx));
  return { nx, ny };
}

/**
 * @param {{ nx: number, ny: number, dt?: number, k?: number, seed?: number }} options
 */
export function createAllenCahn({ nx, ny, dt = 0.2, k = 0.25, seed = 1 }) {
  let u = new Float32Array(nx * ny);
  let v = new Float32Array(nx * ny);
  let steps = 0;

  // Smooth random initial condition: bilinear upsampling of a coarse random grid plus
  // small noise. The coarse grid has one node per about 46 × 41 cells, so the first
  // frames already show separated domains.
  function reset(s) {
    const rand = mulberry32(s);
    const cx = Math.max(3, Math.round(nx / 46));
    const cy = Math.max(3, Math.round(ny / 41));
    const g = new Float32Array(cx * cy);
    for (let i = 0; i < g.length; i++) g[i] = rand() - 0.5;
    for (let y = 0; y < ny; y++) {
      const fy = (y / ny) * (cy - 1);
      const y0 = Math.min(cy - 2, fy | 0);
      const ty = fy - y0;
      for (let x = 0; x < nx; x++) {
        const fx = (x / nx) * (cx - 1);
        const x0 = Math.min(cx - 2, fx | 0);
        const tx = fx - x0;
        const a = g[y0 * cx + x0];
        const b = g[y0 * cx + x0 + 1];
        const c = g[(y0 + 1) * cx + x0];
        const d = g[(y0 + 1) * cx + x0 + 1];
        const smooth = (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
        u[y * nx + x] = 0.6 * smooth + (rand() - 0.5) * 0.05;
      }
    }
    steps = 0;
  }

  function step(n = 1) {
    for (let s = 0; s < n; s++) {
      for (let y = 0; y < ny; y++) {
        const yc = y * nx;
        const ym = ((y + ny - 1) % ny) * nx;
        const yp = ((y + 1) % ny) * nx;
        for (let x = 0; x < nx; x++) {
          const i = yc + x;
          const c = u[i];
          const xl = x === 0 ? nx - 1 : x - 1;
          const xr = x === nx - 1 ? 0 : x + 1;
          const lap = u[ym + x] + u[yp + x] + u[yc + xl] + u[yc + xr] - 4 * c;
          v[i] = c + dt * (lap + k * (c - c * c * c));
        }
      }
      const t = u;
      u = v;
      v = t;
      steps++;
    }
  }

  function freeEnergy() {
    let e = 0;
    for (let y = 0; y < ny; y++) {
      const yc = y * nx;
      const yp = ((y + 1) % ny) * nx;
      for (let x = 0; x < nx; x++) {
        const c = u[yc + x];
        const gx = u[yc + (x === nx - 1 ? 0 : x + 1)] - c;
        const gy = u[yp + x] - c;
        const w = c * c - 1;
        e += 0.5 * (gx * gx + gy * gy) + 0.25 * k * w * w;
      }
    }
    return e;
  }

  reset(seed);
  return {
    nx,
    ny,
    get field() { return u; },
    get steps() { return steps; },
    reset,
    step,
    freeEnergy,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run tests/allenCahn.test.js`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/sim/allenCahn.js tests/allenCahn.test.js
git commit -m "feat: Allen–Cahn solver for the home hero"
```

---

### Task 3: Quadtree builder

**Files:**
- Create: `src/scripts/mesh/quadtree.js`
- Test: `tests/quadtree.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `buildQuadtree({ x0, y0, width, height, root, minSize, shouldRefine, skipRoot? }): number[]` — flat list `[x, y, size, x, y, size, …]` of leaves. Root cells of size `root` are aligned to multiples of `root` and cover every root cell that intersects `[x0, x0 + width) × [y0, y0 + height)`. A cell is split into four while `size > minSize` and `shouldRefine(x, y, size)` is true. A root cell is left out when `skipRoot(x, y)` is true. `root / minSize` must be a power of two.

- [ ] **Step 1: Write the failing test**

Create `tests/quadtree.test.js`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/quadtree.test.js`
Expected: FAIL, `../src/scripts/mesh/quadtree.js` cannot be resolved.

- [ ] **Step 3: Implement the quadtree builder**

Create `src/scripts/mesh/quadtree.js`:

```js
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, all tests in `tests/sat.test.js`, `tests/allenCahn.test.js` and `tests/quadtree.test.js`.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/mesh/quadtree.js tests/quadtree.test.js
git commit -m "feat: non-graded quadtree builder for the adaptive mesh"
```

---

### Task 4: Source Serif 4 typography

**Files:**
- Modify: `package.json` (swap font packages)
- Modify: `src/styles/global.css:1-3` (font imports), `:31` (`--font-display`), `body` block, heading block, `em, i` rule
- Modify: `src/pages/index.astro`, `src/pages/publications.astro`, `src/pages/open-source.astro`, `src/pages/blog/index.astro` (delete `font-variation-settings` lines)

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom property `--font-display: 'Source Serif 4 Variable', 'Source Serif 4', Georgia, serif`. Later tasks read text fonts from computed styles, so nothing else depends on the name.

- [ ] **Step 1: Swap the font packages**

```bash
npm uninstall @fontsource-variable/fraunces
npm install @fontsource-variable/source-serif-4
ls node_modules/@fontsource-variable/source-serif-4/opsz.css node_modules/@fontsource-variable/source-serif-4/opsz-italic.css
```

Expected: both files listed. `opsz.css` declares `font-family: 'Source Serif 4 Variable'`.

- [ ] **Step 2: Update `global.css`**

Replace the first line:

```css
@import '@fontsource-variable/fraunces/index.css';
```

with:

```css
@import '@fontsource-variable/source-serif-4/opsz.css';
@import '@fontsource-variable/source-serif-4/opsz-italic.css';
```

Replace:

```css
  --font-display: 'Fraunces Variable', Fraunces, 'Iowan Old Style', Georgia, serif;
```

with:

```css
  --font-display: 'Source Serif 4 Variable', 'Source Serif 4', Georgia, serif;
```

In the `body` rule, replace:

```css
  font-variation-settings: 'opsz' 14, 'SOFT' 30;
  font-weight: 380;
```

with:

```css
  font-weight: 400;
```

Replace the heading block and the `h1`–`h4` and `em, i` rules:

```css
h1, h2, h3, h4, h5 {
  font-family: var(--font-display);
  font-variation-settings: 'opsz' 144, 'SOFT' 60, 'WONK' 1;
  font-weight: 380;
  letter-spacing: -0.025em;
  line-height: 1.02;
  color: var(--ink-strong);
}

h1 { font-size: clamp(3rem, 7.5vw, 6.5rem); font-weight: 350; }
h2 { font-size: clamp(2rem, 4vw, 3.25rem); font-weight: 380; }
h3 { font-size: clamp(1.4rem, 2vw, 1.85rem); font-weight: 420; }
h4 { font-size: 1.15rem; font-weight: 500; letter-spacing: 0; }

em, i { font-style: italic; font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1; }
```

with:

```css
h1, h2, h3, h4, h5 {
  font-family: var(--font-display);
  font-weight: 300;
  letter-spacing: -0.02em;
  line-height: 1.06;
  color: var(--ink-strong);
}

h1 { font-size: clamp(3rem, 7.5vw, 6.5rem); }
h2 { font-size: clamp(2rem, 4vw, 3.25rem); }
h3 { font-size: clamp(1.4rem, 2vw, 1.85rem); font-weight: 400; }
h4 { font-size: 1.15rem; font-weight: 500; letter-spacing: 0; }

em, i { font-style: italic; }
```

- [ ] **Step 3: Remove the Fraunces axis settings from the pages**

```bash
sed -i "/font-variation-settings: 'opsz' 144, 'SOFT'/d" src/pages/index.astro src/pages/publications.astro src/pages/open-source.astro src/pages/blog/index.astro
grep -rn "SOFT\|WONK\|Fraunces\|fraunces" src package.json
```

Expected: the `grep` prints nothing.

- [ ] **Step 4: Build and check the pages**

Run: `npm run build`
Expected: `Complete!` with 6 pages.

With the dev server running (`npm run dev` on port 4321), take screenshots:

```bash
S=/tmp/claude-1000/-home-pmistani-Documents-pourion-github-io/5d1d59fa-b2f8-4afb-907a-8c4e45835650/scratchpad
for p in "" about/ publications/ open-source/ blog/; do
  google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars --virtual-time-budget=5000 \
    --window-size=1440,1800 --screenshot=$S/t4-${p//\//_}.png "http://localhost:4321/$p" >/dev/null 2>&1
done
```

Open each screenshot. Expected: every heading and paragraph is set in Source Serif 4 (no Fraunces ball terminals), italics render in Source Serif 4 Italic, labels stay in JetBrains Mono.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/styles/global.css src/pages/index.astro src/pages/publications.astro src/pages/open-source.astro src/pages/blog/index.astro
git commit -m "style: switch the site typeface to Source Serif 4"
```

---

### Task 5: Adaptive mesh behind every page

**Files:**
- Create: `src/scripts/mesh/textMask.js`
- Create: `src/scripts/mesh/meshLayer.js`
- Create: `src/components/MeshLayer.astro`
- Modify: `src/layouts/Base.astro` (render `<MeshLayer />` first inside `<body>`)
- Modify: `src/components/Nav.astro:11` (add `data-mesh-skip`)

**Interfaces:**
- Consumes: `summedArea`, `rectFraction` from `src/scripts/mesh/sat.js`; `buildQuadtree` from `src/scripts/mesh/quadtree.js`.
- Produces:
  - `capForFont(px: number): number` — 4, 8 or 16.
  - `rasterizeText({ root?: Element, scale?: number }): { width: number, height: number, frac(x0, y0, x1, y1): number, capIn(x, y, s): number }` — document coordinates in CSS px. `capIn` returns 255 where no text or image sets a cap.
  - `getMeshLayer(): MeshLayer` with
    - `mount(canvas: HTMLCanvasElement): void`,
    - `setRegion(id: string, { element: Element, canvas: HTMLCanvasElement, refine: (x: number, y: number, s: number, rect: DocRect) => boolean, alpha?: number }): void`,
    - `rebuildRegion(id: string): void` — rebuilds and redraws one region with the current text mask.
  - `DocRect = { left, top, right, bottom, width, height }` in document coordinates.
  - Debug attributes on `<html>`: `data-mesh-leaves` (number of leaves) and `data-mesh-builds` (number of full rebuilds).

- [ ] **Step 1: Implement the text mask**

Create `src/scripts/mesh/textMask.js`:

```js
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
```

- [ ] **Step 2: Implement the mesh layer**

Create `src/scripts/mesh/meshLayer.js`:

```js
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
```

- [ ] **Step 3: Create the component**

Create `src/components/MeshLayer.astro`:

```astro
---
// Fixed canvas behind the page content that shows the adaptive mesh.
---

<canvas class="mesh-layer" aria-hidden="true" data-mesh-layer></canvas>

<script>
  import { getMeshLayer } from '../scripts/mesh/meshLayer.js';

  const canvas = document.querySelector('[data-mesh-layer]');
  if (canvas instanceof HTMLCanvasElement) getMeshLayer().mount(canvas);
</script>

<style>
  .mesh-layer {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
  }
  @media print {
    .mesh-layer { display: none; }
  }
</style>
```

- [ ] **Step 4: Add the component to the layout and skip the sticky nav**

In `src/layouts/Base.astro`, add the import after `import Footer from '../components/Footer.astro';`:

```astro
import MeshLayer from '../components/MeshLayer.astro';
```

and replace:

```astro
  <body>
    {!hideNav && <Nav />}
```

with:

```astro
  <body>
    <MeshLayer />
    {!hideNav && <Nav />}
```

In `src/components/Nav.astro`, replace `<header class="nav">` with:

```astro
<header class="nav" data-mesh-skip>
```

The nav is sticky, so its document position depends on the scroll position at build time. It has its own blurred background and needs no mesh.

- [ ] **Step 5: Build and run the unit tests**

Run: `npm run build && npm test`
Expected: build `Complete!` with 6 pages; all tests pass.

- [ ] **Step 6: Check that every page builds a mesh**

```bash
for p in "" about/ publications/ open-source/ blog/ blog/toward-a-simulation-ai-organism/; do
  printf "%-40s " "/$p"
  google-chrome --headless=new --disable-gpu --no-sandbox --virtual-time-budget=6000 --window-size=1440,1000 \
    --dump-dom "http://localhost:4321/$p" 2>/dev/null | grep -o 'data-mesh-leaves="[0-9]*"'
done
```

Expected: each line shows `data-mesh-leaves="N"` with N > 100. Take a 1440 × 1800 screenshot of `/publications/` and `/about/` (as in Task 4, Step 4). Expected: a faint quadtree behind the page, finest around headings, coarser around body text, coarse cells in empty margins, and no mesh over the nav.

- [ ] **Step 7: Review Focus — page opened already scrolled**

```bash
S=/tmp/claude-1000/-home-pmistani-Documents-pourion-github-io/5d1d59fa-b2f8-4afb-907a-8c4e45835650/scratchpad
google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars --virtual-time-budget=6000 \
  --window-size=1440,1000 --screenshot=$S/t5-anchor.png "http://localhost:4321/#foundings" >/dev/null 2>&1
```

Open `t5-anchor.png`. Expected: the fine cells sit on the "Teams and platforms" heading and the list text, not offset above or below them.

- [ ] **Step 8: Review Focus — layout changes after the first build**

In a desktop browser on `http://localhost:4321/about/`, open the console and run:

```js
const before = document.documentElement.dataset.meshBuilds;
document.querySelector('main').insertAdjacentHTML('afterbegin', '<div id="probe" style="height:300px"></div>');
setTimeout(() => console.log('builds', before, '->', document.documentElement.dataset.meshBuilds), 600);
```

Expected: the build count increases by 1, and after scrolling the mesh lines up with the shifted text. Remove the probe with `document.getElementById('probe').remove()`; the count increases by 1 again.

- [ ] **Step 9: Review Focus — viewport-only resize redraws without rebuilding**

In the same console, run:

```js
const b = document.documentElement.dataset.meshBuilds;
window.dispatchEvent(new Event('resize'));
setTimeout(() => console.log('builds unchanged:', b === document.documentElement.dataset.meshBuilds), 600);
```

Expected: `builds unchanged: true`. Then open the browser's device toolbar at 390 × 844, change only the height to 700, and confirm in the console that `data-mesh-builds` is unchanged while the mesh still covers the viewport.

- [ ] **Step 10: Commit**

```bash
git add src/scripts/mesh/textMask.js src/scripts/mesh/meshLayer.js src/components/MeshLayer.astro src/layouts/Base.astro src/components/Nav.astro
git commit -m "feat: adaptive mesh refined on the page text behind every page"
```

---

### Task 6: Allen–Cahn hero on the home page

**Files:**
- Create: `scripts/render_allen_cahn_frame.py`
- Create: `img/allen-cahn-frame.jpg` (generated, 1600 × 820)
- Create: `src/components/SimHero.astro`
- Modify: `src/pages/index.astro` (hero markup and hero CSS)
- Modify: `docs/superpowers/specs/2026-10-19-direction-c-redesign-design.md` (reduced-motion line)

**Interfaces:**
- Consumes: `createAllenCahn`, `gridFor` from `src/scripts/sim/allenCahn.js`; `summedArea`, `rectSum` from `src/scripts/mesh/sat.js`; `getMeshLayer().setRegion`, `getMeshLayer().rebuildRegion` from `src/scripts/mesh/meshLayer.js`.
- Produces: `<SimHero>` with a default slot for the hero content. Debug attributes on `<html>`: `data-sim-steps` (steps since the last reset) and `data-sim-ms` (mean milliseconds per step batch plus draw over the last 30 frames).

- [ ] **Step 1: Render the fallback frame**

Create `scripts/render_allen_cahn_frame.py`:

```python
"""Render one evolved Allen–Cahn frame for the home hero.

The image is shown when JavaScript is off and to visitors who prefer reduced motion.
It uses the same equation, parameters and colours as src/scripts/sim/allenCahn.js
and src/components/SimHero.astro.

Usage: python3 scripts/render_allen_cahn_frame.py img/allen-cahn-frame.jpg
"""
import sys

import numpy as np
from PIL import Image

NX, NY, DT, K, STEPS = 640, 328, 0.2, 0.25, 1500


def initial_condition(rng):
    cx, cy = max(3, round(NX / 46)), max(3, round(NY / 41))
    g = rng.random((cy, cx)) - 0.5
    fy = np.arange(NY) / NY * (cy - 1)
    fx = np.arange(NX) / NX * (cx - 1)
    y0 = np.minimum(cy - 2, fy.astype(int))
    x0 = np.minimum(cx - 2, fx.astype(int))
    ty = (fy - y0)[:, None]
    tx = (fx - x0)[None, :]
    a, b = g[y0][:, x0], g[y0][:, x0 + 1]
    c, d = g[y0 + 1][:, x0], g[y0 + 1][:, x0 + 1]
    smooth = (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty
    return 0.6 * smooth + (rng.random((NY, NX)) - 0.5) * 0.05


def main(out):
    u = initial_condition(np.random.default_rng(7))
    for _ in range(STEPS):
        lap = np.roll(u, 1, 0) + np.roll(u, -1, 0) + np.roll(u, 1, 1) + np.roll(u, -1, 1) - 4 * u
        u = u + DT * (lap + K * (u - u ** 3))
    c = np.clip(u, -1, 1)
    e0 = 1 - c * c
    edge = (e0 * e0) ** 2
    p = (c + 1) / 2
    rgb = np.stack([10 + 22 * p + 130 * edge, 11 + 16 * p + 90 * edge, 16 + 10 * p + 32 * edge], -1)
    Image.fromarray(rgb.astype(np.uint8)).resize((1600, 820), Image.BICUBIC).save(out, quality=86)


if __name__ == "__main__":
    main(sys.argv[1])
```

Run:

```bash
python3 -I scripts/render_allen_cahn_frame.py img/allen-cahn-frame.jpg
python3 -c "from PIL import Image; print(Image.open('img/allen-cahn-frame.jpg').size)"
```

Expected: `(1600, 820)`. Open the image: dark domains separated by thin amber interfaces.

- [ ] **Step 2: Create the hero component**

Create `src/components/SimHero.astro`:

```astro
---
// Home hero: an Allen–Cahn simulation computed in the browser, with the adaptive mesh
// refined on its interface and on the hero text.
---

<section class="sim-hero" data-sim-hero>
  <canvas class="sim-canvas" aria-hidden="true"></canvas>
  <canvas class="sim-mesh" aria-hidden="true"></canvas>
  <div class="sim-shade" aria-hidden="true"></div>
  <div class="container-wide sim-inner">
    <slot />
  </div>
  <p class="sim-caption mono">
    Allen–Cahn phase separation, <span data-sim-grid>640 × 328</span> grid<br />
    explicit finite differences, computed in this browser<br />
    quadtree refined on the interface u = 0 and on the text
  </p>
</section>

<script>
  import { createAllenCahn, gridFor } from '../scripts/sim/allenCahn.js';
  import { summedArea, rectSum } from '../scripts/mesh/sat.js';
  import { getMeshLayer } from '../scripts/mesh/meshLayer.js';

  const hero = document.querySelector('[data-sim-hero]');
  if (hero) start(hero);

  function start(hero) {
    const simCanvas = hero.querySelector('.sim-canvas');
    const meshCanvas = hero.querySelector('.sim-mesh');
    const layer = getMeshLayer();
    const root = document.documentElement;

    // Reduced motion: keep the pre-rendered frame and refine the hero mesh on the text only.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hero.classList.add('is-static');
      layer.setRegion('hero', { element: hero, canvas: meshCanvas, refine: () => false });
      return;
    }

    const box = hero.getBoundingClientRect();
    const { nx, ny } = gridFor(box.width, box.height);
    hero.querySelector('[data-sim-grid]').textContent = `${nx} × ${ny}`;
    const sim = createAllenCahn({ nx, ny, seed: 1 + Math.floor(Math.random() * 1e9) });
    sim.step(120);

    simCanvas.width = nx;
    simCanvas.height = ny;
    const ctx = simCanvas.getContext('2d');
    const image = ctx.createImageData(nx, ny);
    const interfaceCells = new Uint8Array(nx * ny);
    let sat = null;

    function draw() {
      const d = image.data;
      const u = sim.field;
      for (let i = 0; i < u.length; i++) {
        const c = u[i] > 1 ? 1 : u[i] < -1 ? -1 : u[i];
        const e0 = 1 - c * c;
        const e2 = e0 * e0;
        const edge = e2 * e2; // bright only close to u = 0
        const p = (c + 1) / 2;
        d[4 * i] = 10 + 22 * p + 130 * edge;
        d[4 * i + 1] = 11 + 16 * p + 90 * edge;
        d[4 * i + 2] = 16 + 10 * p + 32 * edge;
        d[4 * i + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    }

    function updateInterface() {
      const u = sim.field;
      for (let i = 0; i < u.length; i++) interfaceCells[i] = u[i] > -0.5 && u[i] < 0.5 ? 1 : 0;
      sat = summedArea(interfaceCells, nx, ny);
    }

    // Refine a hero cell when it, widened by a quarter of its size on each side, contains
    // interface cells of the simulation. The interface is refined down to 8 px cells.
    layer.setRegion('hero', {
      element: hero,
      canvas: meshCanvas,
      refine(x, y, s, rect) {
        if (!sat || s <= 8) return false;
        const m = s * 0.25;
        const sx = nx / rect.width;
        const sy = ny / rect.height;
        return rectSum(sat, nx, ny,
          (x - m - rect.left) * sx, (y - m - rect.top) * sy,
          (x + s + m - rect.left) * sx, (y + s + m - rect.top) * sy) > 0;
      },
    });

    let running = false;
    let onScreen = true;
    let last = 0;
    let frame = 0;
    const timings = [];

    function tick(t) {
      if (!running) return;
      requestAnimationFrame(tick);
      if (t - last < 33) return; // at most 30 drawn frames per second
      last = t;
      const t0 = performance.now();
      sim.step(3);
      if (sim.steps > 24000) {
        sim.reset(1 + Math.floor(Math.random() * 1e9));
        sim.step(120);
      }
      draw();
      timings.push(performance.now() - t0);
      if (timings.length > 30) timings.shift();
      if (++frame % 5 === 0) {
        updateInterface();
        layer.rebuildRegion('hero');
      }
      root.dataset.simSteps = String(sim.steps);
      root.dataset.simMs = (timings.reduce((a, b) => a + b, 0) / timings.length).toFixed(2);
    }

    function update() {
      const on = onScreen && !document.hidden;
      if (on === running) return;
      running = on;
      if (on) requestAnimationFrame(tick);
    }

    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    }).observe(hero);
    document.addEventListener('visibilitychange', update);

    draw();
    updateInterface();
    layer.rebuildRegion('hero');
    root.dataset.simSteps = String(sim.steps);
  }
</script>

<style>
  .sim-hero {
    position: relative;
    min-height: min(86vh, 820px);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    overflow: hidden;
    border-bottom: 1px solid var(--hairline);
    background: #07080b url('/img/allen-cahn-frame.jpg') center / cover no-repeat;
  }
  .sim-canvas,
  .sim-mesh,
  .sim-shade {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .sim-canvas { z-index: 0; }
  .sim-mesh { z-index: 1; pointer-events: none; }
  .sim-shade {
    z-index: 2;
    pointer-events: none;
    background: linear-gradient(to top, rgba(7, 8, 11, 0.9) 0%, rgba(7, 8, 11, 0.25) 50%, rgba(7, 8, 11, 0) 72%);
  }
  .is-static .sim-canvas { display: none; }
  .sim-inner {
    position: relative;
    z-index: 3;
    width: 100%;
    padding-block: var(--s-24) var(--s-12);
  }
  .sim-caption {
    position: absolute;
    right: var(--s-6);
    bottom: var(--s-6);
    z-index: 3;
    max-width: none;
    font-size: 0.66rem;
    line-height: 1.7;
    letter-spacing: 0.04em;
    text-align: right;
    color: rgba(242, 239, 232, 0.55);
  }
  @media (max-width: 900px) {
    .sim-caption {
      position: relative;
      right: auto;
      bottom: auto;
      padding: 0 var(--s-6) var(--s-6);
      text-align: left;
    }
  }
</style>
```

- [ ] **Step 3: Use the hero on the home page**

In `src/pages/index.astro`, add the import after `import Constellation from '../components/Constellation.astro';`:

```astro
import SimHero from '../components/SimHero.astro';
```

Replace the hero section:

```astro
  {/* Hero */}
  <section class="hero">
    <div class="container-wide hero-inner">
      <p class="eyebrow hero-eyebrow">
```

with:

```astro
  {/* Hero */}
  <SimHero>
      <p class="eyebrow hero-eyebrow">
```

and replace its closing lines:

```astro
      </div>
    </div>
    <div class="hero-grid" aria-hidden="true"></div>
  </section>
```

with:

```astro
      </div>
  </SimHero>
```

In the `<style>` block of `index.astro`, delete the `.hero`, `.hero-grid` and `.hero-inner` rules (from `  /* Hero */` up to the line before `  .hero-eyebrow {`) and insert `  /* Hero content (inside SimHero) */` in their place. Then replace:

```css
  .hero-title {
    font-size: clamp(2.5rem, 6.4vw, 5.6rem);
    line-height: 1.02;
    font-weight: 320;
    letter-spacing: -0.03em;
    max-width: 19ch;
    margin-bottom: var(--s-8);
  }
```

with:

```css
  .hero-title {
    font-size: clamp(2.4rem, 5vw, 4.4rem);
    line-height: 1.05;
    font-weight: 300;
    letter-spacing: -0.02em;
    max-width: 20ch;
    margin-bottom: var(--s-6);
  }
```

and in the `.hero-eyebrow` rule replace `margin-bottom: var(--s-12);` with `margin-bottom: var(--s-6);`, and in the `.hero-lede` rule replace `margin-bottom: var(--s-12);` with `margin-bottom: var(--s-8);`.

- [ ] **Step 4: Record the reduced-motion decision in the spec**

In `docs/superpowers/specs/2026-10-19-direction-c-redesign-design.md`, replace:

```markdown
- With `prefers-reduced-motion: reduce`, the simulation advances to an evolved state once,
  draws it, and stops. The mesh is drawn once.
```

with:

```markdown
- With `prefers-reduced-motion: reduce`, the hero shows the pre-rendered frame
  (`img/allen-cahn-frame.jpg`), and the hero mesh is refined on the text only. Computing an
  evolved state in the browser takes about 1500 steps, which blocks the page for one to two
  seconds.
```

- [ ] **Step 5: Build and run the unit tests**

Run: `npm run build && npm test`
Expected: build `Complete!`; all tests pass.

- [ ] **Step 6: Check the hero at desktop and phone widths**

```bash
S=/tmp/claude-1000/-home-pmistani-Documents-pourion-github-io/5d1d59fa-b2f8-4afb-907a-8c4e45835650/scratchpad
google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars --virtual-time-budget=8000 \
  --window-size=1440,1000 --screenshot=$S/t6-desktop.png http://localhost:4321/ >/dev/null 2>&1
google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars --virtual-time-budget=8000 \
  --window-size=390,900 --screenshot=$S/t6-phone.png http://localhost:4321/ >/dev/null 2>&1
```

Expected, desktop: amber interfaces on dark domains; the quadtree refined along the interfaces and on the hero text; the caption at the bottom right shows `640 × 328` or the grid for the window's hero; the headline and lede are legible over the bottom shade. Phone: the caption sits below the hero text; the grid in the caption is taller than wide; the smallest cells are 8 px.

- [ ] **Step 7: Check that the simulation runs and measure its cost**

```bash
google-chrome --headless=new --disable-gpu --no-sandbox --virtual-time-budget=8000 --window-size=1440,1000 \
  --dump-dom http://localhost:4321/ 2>/dev/null | grep -o 'data-sim-[a-z]*="[0-9.]*"'
```

Expected: `data-sim-steps` greater than 120 and `data-sim-ms` printed. Open `http://localhost:4321/` in a desktop browser, wait five seconds, and run `document.documentElement.dataset.simMs` in the console. Expected: below 6.

- [ ] **Step 8: Check reduced motion and no JavaScript**

```bash
google-chrome --headless=new --disable-gpu --no-sandbox --force-prefers-reduced-motion --virtual-time-budget=6000 \
  --window-size=1440,1000 --dump-dom http://localhost:4321/ 2>/dev/null | grep -o 'class="sim-hero[^"]*"\|data-sim-steps="[0-9]*"'
google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars --blink-settings=scriptEnabled=false \
  --window-size=1440,1000 --screenshot=$S/t6-nojs.png http://localhost:4321/ >/dev/null 2>&1
```

Expected: the first command prints a `sim-hero` class containing `is-static` and no `data-sim-steps`. `t6-nojs.png` shows the pre-rendered Allen–Cahn frame behind the hero text and no mesh.

- [ ] **Step 9: Review Focus — no simulation while the hero is off-screen**

```bash
google-chrome --headless=new --disable-gpu --no-sandbox --virtual-time-budget=8000 --window-size=1440,1000 \
  --dump-dom "http://localhost:4321/#foundings" 2>/dev/null | grep -o 'data-sim-steps="[0-9]*"'
```

Expected: `data-sim-steps="120"` (the warm-up only), because the hero was never on screen. In a desktop browser, open the home page, note `document.documentElement.dataset.simSteps`, switch to another tab for ten seconds, return, and check that the count advanced by no more than one frame's worth (3 steps) during the time away.

- [ ] **Step 10: Commit**

```bash
git add scripts/render_allen_cahn_frame.py img/allen-cahn-frame.jpg src/components/SimHero.astro src/pages/index.astro docs/superpowers/specs/2026-10-19-direction-c-redesign-design.md
git commit -m "feat: Allen–Cahn hero on an adaptive mesh"
```

---

### Task 7: Whole-site verification, print check and documentation

**Files:**
- Modify: `CLAUDE.md` (typography rule and architecture list)

**Interfaces:**
- Consumes: everything above.
- Produces: verified branch `direction-c`, ready for Pouria's review.

- [ ] **Step 1: Screenshots of every page at two widths**

```bash
S=/tmp/claude-1000/-home-pmistani-Documents-pourion-github-io/5d1d59fa-b2f8-4afb-907a-8c4e45835650/scratchpad
for p in "" about/ publications/ open-source/ blog/ blog/toward-a-simulation-ai-organism/; do
  for w in 1440,2400 390,2400; do
    google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars --virtual-time-budget=8000 \
      --window-size=$w --screenshot="$S/t7-${p//\//_}-${w%%,*}.png" "http://localhost:4321/$p" >/dev/null 2>&1
  done
done
ls $S/t7-*.png | wc -l
```

Expected: 12 files. Open each. Expected: Source Serif 4 throughout; the mesh visible and faint on every page; no horizontal scroll at 390 px; the constellation keeps its five lane colours; the nav row fits at 390 px.

- [ ] **Step 2: Check the essay PDF export**

```bash
google-chrome --headless=new --disable-gpu --no-sandbox --virtual-time-budget=8000 \
  --print-to-pdf=$S/t7-essay.pdf http://localhost:4321/blog/toward-a-simulation-ai-organism/ >/dev/null 2>&1
pdftoppm -png -r 60 -f 1 -l 2 $S/t7-essay.pdf $S/t7-essay
```

Open `t7-essay-1.png` and `t7-essay-2.png`. Expected: white paper, dark text, no mesh lines, no nav or footer.

- [ ] **Step 3: Review Focus — very long page**

```bash
google-chrome --headless=new --disable-gpu --no-sandbox --virtual-time-budget=8000 --window-size=1440,1000 \
  --dump-dom http://localhost:4321/blog/toward-a-simulation-ai-organism/ 2>/dev/null | grep -o 'data-mesh-[a-z]*="[0-9]*"'
```

Expected: `data-mesh-leaves` greater than 100 and `data-mesh-builds="1"`. In a desktop browser, open the essay, scroll to the bottom, and confirm that the mesh is still drawn and that the console shows no errors.

- [ ] **Step 4: Check the JavaScript size**

```bash
npm run build
cat src/scripts/sim/allenCahn.js src/scripts/mesh/*.js | wc -c
ls -l dist/_astro/*.js
```

Expected: the source total is below 15 000 bytes, and the built scripts that contain the mesh and simulation code are below 15 KB together.

- [ ] **Step 5: Update `CLAUDE.md`**

Replace the typography bullet:

```markdown
- **Typography**: Fraunces Variable (display serif) + JetBrains Mono (technical labels). No Inter, no Roboto, no system sans. Body text and headlines both use Fraunces; mono is reserved for years, eyebrows, code, and labels.
```

with:

```markdown
- **Typography**: Source Serif 4 Variable (all text; display weight 300, body 400; only the `opsz` axis) + JetBrains Mono (technical labels). No Inter, no Roboto, no system sans. Mono is reserved for years, eyebrows, code, captions and labels.
- **Simulation and mesh**: the home hero (`src/components/SimHero.astro`) runs an Allen–Cahn simulation (`src/scripts/sim/allenCahn.js`) in the browser. Every page draws an adaptive quadtree mesh refined on its text (`src/components/MeshLayer.astro`, `src/scripts/mesh/`). Elements with `data-mesh-skip` are left out of the mesh. Unit tests: `npm test`. The no-JS and reduced-motion frame is `img/allen-cahn-frame.jpg`, rendered by `scripts/render_allen_cahn_frame.py`.
```

and in the `## Architecture` file tree, after the line `    Constellation.astro  # SVG trajectory viz — 5 lanes × time × 14 milestones (centerpiece)`, add:

```
    SimHero.astro        # home hero: Allen–Cahn simulation + adaptive mesh
    MeshLayer.astro      # fixed canvas with the page's adaptive mesh
  scripts/
    sim/allenCahn.js     # Allen–Cahn solver (DOM-free, unit-tested)
    mesh/                # sat.js, quadtree.js (unit-tested), textMask.js, meshLayer.js
```

- [ ] **Step 6: Final test run and commit**

```bash
npm test && npm run build
git add CLAUDE.md
git commit -m "docs: document the simulation hero and the adaptive mesh"
git log --oneline master..direction-c
```

Expected: tests pass, build `Complete!`, and the log lists the commits of Tasks 1–7.

- [ ] **Step 7: Hand over for review**

Report to Pouria: the branch `direction-c`, the screenshots from Step 1, the measured `data-sim-ms`, and the JavaScript size. Do not merge or push until he approves. After approval: `git checkout master && git merge --ff-only direction-c && git push origin master`, then watch the deploy with `gh run watch`.
