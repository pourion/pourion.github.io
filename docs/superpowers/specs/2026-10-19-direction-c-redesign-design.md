# Direction C redesign: Allen–Cahn hero and adaptive mesh

Date: 2026-10-19
Status: approved in conversation, pending review of this document

## Goal

Give pouriamistani.com the look of a computational physics group site, in the spirit of the
Lars Hernquist group site, where the output of a simulation is the main visual element. The
site keeps its content, its constellation timeline and its dark palette with the amber accent.

## Decisions made during brainstorming

1. The home hero is a live Allen–Cahn phase-field simulation computed in the visitor's browser.
2. An adaptive quadtree mesh is drawn over the hero. It is refined on the moving phase
   interface and on the text of the page.
3. The mesh uses a graded band around each interface, and the smallest cell depends on the
   font size of the text it resolves (4 px for large headings, 8 px for subheadings, 16 px
   for body text).
4. Every other page has a still adaptive mesh behind its content, refined on its headings and
   text ("mesh everywhere").
5. The typeface is Source Serif 4 for all text. JetBrains Mono remains for labels, dates and
   captions. Fraunces is removed.
6. The palette stays: near-black background, warm off-white text, one amber accent. The
   constellation keeps its five lane colours.
7. Copy stays in the scientific register agreed earlier. There are no metric tiles and no
   employer-name strips.

## Architecture

The work adds two client-side modules and two components. No runtime libraries are added.

### Modules (plain JavaScript with JSDoc types, under `src/scripts/`)

- `sim/allenCahn.js` solves u_t = Δu + k(u − u³) with explicit finite differences on a periodic
  grid. It exposes `create({ nx, ny, dt, k, seed })`, `step(n)` and the field array. The initial
  condition is a smooth random field (bilinear upsampling of a coarse random grid plus small
  noise), so the first visible frame already has well-separated domains. The module has no DOM
  dependencies and can be imported by tests.
- `mesh/quadtree.js` builds the leaves of a non-graded quadtree over a rectangle. Refinement is
  decided by two predicates supplied by the caller: a text-mask predicate (the mask fraction in
  the cell, expanded by the graded band, lies strictly between 0 and 1, and the cell is larger
  than the font-size cap) and an interface predicate (the cell, expanded by a narrower band,
  contains interface cells of the simulation). The module has no DOM dependencies.
- `mesh/textMask.js` rasterizes the text and images of a page into a mask with a summed-area
  table, and records the font-size cap per pixel. Text is drawn word by word from
  `Range.getBoundingClientRect()` and the computed font of each text node. Images and figures
  are drawn as filled boxes. Elements with `data-mesh-skip` are ignored.
- `mesh/meshLayer.js` owns one fixed, viewport-sized canvas behind the content. It computes the
  quadtree for the whole document once, stores the leaves in document coordinates, and on
  scroll redraws only the leaves that intersect the viewport. Finer cells are drawn fainter.

### Components

- `src/components/MeshLayer.astro` is included once in `Base.astro`. It renders the canvas
  (`aria-hidden="true"`) and starts `meshLayer.js` after `document.fonts.ready`.
- `src/components/SimHero.astro` replaces the current home hero. It contains the simulation
  canvas, the hero text, the caption, and a `<noscript>`/CSS fallback background image. It
  passes an interface predicate for its region to the mesh layer, which rebuilds the tree for
  the hero region every five drawn frames.

### Text mask resolution

The mask is rasterized at half the CSS resolution, so a page 8000 px tall needs about 3 million
mask pixels and a 32-bit summed-area table of about 12 MB. The 4 px minimum cell is two mask
pixels.

## Home hero

- Grid: 640 × 328 on desktop (about 210 000 cells). On phones nx and ny follow the hero's
  aspect ratio and keep about 210 000 cells.
- Integration: dt = 0.2, k = 0.25, three steps per drawn frame, about 30 drawn frames per
  second. The simulation restarts from a new initial condition after about 24 000 steps.
- Rendering: the field is drawn at grid resolution and scaled by the browser. Bulk phases are
  near-black and dark brown, and the interface is a thin amber line.
- Caption, bottom right, in JetBrains Mono: "Allen–Cahn phase separation, 640 × 328 grid /
  explicit finite differences, computed in this browser / quadtree refined on the interface
  u = 0 and on the text". The grid size in the caption is filled in from the actual grid.

## Behaviour

- The simulation pauses when the hero leaves the viewport (`IntersectionObserver`) and when the
  tab is hidden (`visibilitychange`).
- With `prefers-reduced-motion: reduce`, the hero shows the pre-rendered frame
  (`img/allen-cahn-frame.jpg`), and the hero mesh is refined on the text only. Computing an
  evolved state in the browser takes about 1500 steps, which blocks the page for one to two
  seconds.
- Without JavaScript, the hero shows `public/img/allen-cahn-frame.jpg`, rendered by
  `scripts/render_allen_cahn_frame.py`, and no mesh is drawn.
- On phones the smallest mesh cell is 8 px.
- The mesh recomputes after a resize (debounced) and after web fonts finish loading.

## Typography

- Replace `@fontsource-variable/fraunces` with `@fontsource-variable/source-serif-4`.
- `--font-display` in `global.css` becomes Source Serif 4. Remove every Fraunces-specific
  `font-variation-settings` (the `SOFT` and `WONK` axes) in `global.css`, `index.astro`,
  `publications.astro`, `open-source.astro` and `blog/index.astro`. Use the `opsz` axis only.
- Display text uses weight 300; body text uses weight 400.

## Pages

- Home: `SimHero` replaces the hero; the announcement band, constellation, team section,
  current focus, projects, talks and contact keep their content and adopt the new type.
- About, Publications, Open source, Stencil index and the essay page: new type and the mesh
  layer. The essay's print stylesheet hides the mesh canvas, and the PDF export is checked.
- The constellation keeps its lane colours and interactions.

## Accessibility and performance

- Both canvases are decorative and hidden from assistive technology. Mesh lines are drawn at
  low opacity (about 0.06 to 0.10 on the dark background) and do not reduce text contrast below
  the current values.
- No new runtime dependencies. The two modules and two components together should stay below
  15 KB of JavaScript before compression.
- The simulation step should take less than 6 ms per drawn frame on a recent laptop.

## Testing and verification

- Add Vitest as a development dependency for the DOM-free modules:
  - `allenCahn.js`: the field stays within [−1.05, 1.05]; the discrete Ginzburg–Landau free
    energy does not increase over 500 steps; a uniform field u = ±1 is stationary.
  - `quadtree.js`: with no interface and no text the leaves are the root cells; a single
    interface cell produces leaves down to the minimum size around it and nowhere else; the
    leaves tile the rectangle without overlap.
- `npm run build` passes.
- Headless Chrome screenshots of every page at 1440 px and 390 px, checked by eye.
- The reduced-motion and no-JavaScript paths are checked in the browser.
- Simulation frame time is measured in the browser console.

## Out of scope

- A true adaptive-mesh solve of the PDE. The PDE is solved on a uniform grid, and the quadtree
  shows the refinement criterion. The caption says so.
- Changes to the content of any page.
- A light theme.
