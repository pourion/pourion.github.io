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
