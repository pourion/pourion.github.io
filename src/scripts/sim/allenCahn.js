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

/** Grid cell budget: phones get fewer cells because their main thread is several times slower. */
export function cellBudget(isPhone) {
  return isPhone ? 90000 : 210000;
}

/**
 * Solver steps per drawn frame (1, 2 or 3) from the mean full-tick time in ms:
 * above 8 ms step down one level, below 4 ms step up one level, otherwise keep.
 */
export function stepsPerFrame(meanTickMs, current) {
  if (meanTickMs > 8) return Math.max(1, current - 1);
  if (meanTickMs < 4) return Math.min(3, current + 1);
  return current;
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
