# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Pouria Mistani's personal/academic website. Plain static HTML served by GitHub Pages from the `master` branch of `pourion/pourion.github.io` — no Jekyll config, no build step, no package manager, no tests. Edits to HTML/CSS/JS go live on push.

## Local preview

Open any `.html` directly in a browser, or serve the directory to make relative paths resolve identically to production:

```
python3 -m http.server 8000
# then visit http://localhost:8000/
```

## Deployment

`git push origin master` publishes to https://pourion.github.io/. There is no CI; GitHub Pages rebuilds the site on push.

## Architecture

Each top-level page (`index.html`, `about.html`, `research.html`, `pubs.html`, `blogs.html`, `teaching.html`, `references.html`, `avicenna.html`) is a standalone Bootstrap 4 page. There is **no templating** — the `<head>`, navbar, and footer are duplicated across pages. When changing site-wide elements (nav links, analytics tag, fonts, Bootstrap version), edit every page.

CSS/JS layout:

- `assets/css/`, `assets/js/` — vendored Bootstrap 4 + Popper. Page `<head>`s reference `assets/css/bootstrap.min.css` and `assets/css/justified-nav.css`.
- `css/` — project-specific stylesheets (`events.css` for the card components on the home page, `announcements.css`, `academicons.min.css` for academic icon font).
- jQuery 3.2.1 slim is loaded from `code.jquery.com` with a local fallback in `assets/js/`. Font Awesome 4.7 is pulled from `cdnjs`.
- Google Analytics tag `UA-113698782-1` is inlined at the top of every page.

Content directories:

- `img/` — all images referenced by pages (carousel slides, headshots, figures). `img/backup/` holds archived versions.
- `blogs/` — individual long-form posts as standalone HTML (e.g. `domain_decomposition.html`), linked from `blogs.html`.
- `fonts/` — webfont files for `academicons`.

## Editing conventions observed in the existing pages

- Inline styles and `<font color="...">` tags are used throughout — match the surrounding style rather than refactoring to external CSS or semantic markup unless asked.
- The accent color is `rgb(178, 2, 194)` (purple), used for links and the `.event-button` background. The button's hover state is black background with `#f1e100` text (see `css/events.css`).
- External links use `target="_blank"`.
- New blog posts: add a file under `blogs/` and link it from `blogs.html`.
- Bootstrap classes (`row`, `col-lg-*`, `carousel`, `navbar`) are the layout primitives — keep using them rather than introducing a new framework.
