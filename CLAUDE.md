---
noteId: "f0c1ca20555111f1848bc726d9dbe469"
tags: []

---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pouria Mistani's personal/academic website at `pouriamistani.com` (served from `pourion/pourion.github.io` via GitHub Pages). Built with **Astro 6** — static-output, zero-JS by default. The home page centerpiece is a hand-rolled SVG constellation that plots Pouria's career trajectory (2013 → now) across five thematic threads.

## Local development

```bash
npm install        # first time only
npm run dev        # http://localhost:4321
npm run build      # writes static HTML to dist/
npm run preview    # serves the built site
```

Node 22+ required.

## Deployment

`git push origin master` → GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the site, copies the `CNAME` file into `dist/`, and publishes to GitHub Pages. The repo's Pages source must be set to "GitHub Actions" (not "Deploy from a branch").

## Architecture

```
src/
  pages/
    index.astro          # home: hero + constellation + foundings + projects + talks + contact
    about.astro          # narrative, education, awards, teaching
    publications.astro   # papers, patents, preprints, book chapters, conferences, OSS, talks
    blog/index.astro     # blog index (placeholder)
  components/
    Constellation.astro  # SVG trajectory viz — 5 lanes × time × 14 milestones (centerpiece)
    Nav.astro
    Footer.astro
  layouts/
    Base.astro           # shared head/nav/footer, GA tag
  data/
    milestones.ts        # SINGLE SOURCE OF TRUTH for the trajectory data
  styles/
    global.css           # design tokens, typography, reset
public/
  favicon.{svg,ico}
  img/                   # symlink to ../img — preserves URLs from the old site
img/                     # actual image files (referenced as /img/...)
```

### The constellation (`src/components/Constellation.astro`)

The home page centerpiece. Renders an SVG with five horizontal lanes (astrophysics, HPC, AI-for-simulation, biophysics, chip design) across a time axis, with milestone nodes plotted on their primary lane and secondary markers on cross-lanes. Multi-year "chapter" milestones render as low-opacity bars; the biophysics lane has a dashed "passive monitoring" continuation from 2024 forward (configured via `LANES.bio.passiveAfter`). Founding-engineer milestones get a slowly-rotating dashed outer ring (`founding: true` on the milestone).

To add or edit a milestone: edit `src/data/milestones.ts` only — the component renders straight from that array. Every milestone has `year`, optional `endYear` (renders a bar), `lanes`, `primaryLane`, `title`, `org`, `short`, `long`, optional `image`, optional `links`, and optional `founding: true`. The constellation, mobile fallback timeline, and detail drawer are all generated from this data.

## Editing conventions

- **Typography**: Fraunces Variable (display serif) + JetBrains Mono (technical labels). No Inter, no Roboto, no system sans. Body text and headlines both use Fraunces; mono is reserved for years, eyebrows, code, and labels.
- **Color**: deep near-black background (`#0B0C0F`) with warm off-white text (`#F2EFE8`). Single warm-amber accent (`#E6A23C`) — never reintroduce the legacy purple. Constellation lane colors are reserved for the constellation only.
- **Atmosphere**: subtle SVG-noise grain overlay + soft radial gradients on the body — don't replace with flat colors.
- **External links**: always `target="_blank"` with `rel="noopener"`.
- **Images**: store in `img/` at repo root (preserves URLs from the old site). Reference as `/img/<file>` in Astro — the `public/img` symlink resolves them.
- **Content updates**: prefer editing `src/data/milestones.ts` (trajectory) and `src/pages/publications.astro` (papers data) over hand-editing JSX in each page.

## Notes on content accuracy

The publications page must mirror Pouria's [Google Scholar profile](https://scholar.google.com/citations?user=2Uos2_gAAAAJ&hl=en) — when adding new papers, check Scholar first. The career trajectory in `milestones.ts` should match his current resume; canonical PDF lives at `/home/pmistani/Documents/Pouria_Mistani_Resume_2026.pdf` (not in the repo).

## Stencil — the open journal at `/blog/`

The blog is published as **Stencil**, a self-published open journal. Every essay is a citable journal article with a Zenodo DOI, indexed by Google Scholar via `<meta name="citation_*">` tags emitted by `Base.astro`'s `citation` prop. License is CC-BY 4.0; everything is open source.

**When publishing a new issue, follow [`docs/STENCIL.md`](docs/STENCIL.md) end to end.** That doc captures the full workflow: writing the essay, generating a custom 1200×630 OG image, exporting the PDF, minting the DOI on Zenodo (resource type = `Preprint`, journal title = `Stencil`, one volume per year), wiring the DOI into the page + BibTeX + print source line + `citation` prop on `Base`, adding to Google Scholar, and sharing. Don't invent a new procedure each time — that's the whole point of the doc.

Convention: one volume per calendar year. Vol. 1 = 2026, sequential issue numbers within the year. Vol. 1 No. 1 is `toward-a-simulation-ai-organism` (DOI `10.5281/zenodo.20331251`).
