---
noteId: "df354c00555111f1848bc726d9dbe469"
tags: []

---

# Publishing a Stencil issue

Stencil is the open journal at `/blog/`. Every essay is a citable journal
article with a Zenodo DOI, indexed by Google Scholar via citation meta tags.

This is the full workflow for publishing a new issue. Follow it end to end —
each step matters for citation, discovery, and the journal's open ethos.

## Conventions

- One **volume per calendar year** (Vol. 1 = 2026, Vol. 2 = 2027, ...)
- Sequential **issue numbers** within the volume
- **License**: CC-BY 4.0 (open, attribution-only)
- **License**: source files, diagrams, and data committed to this public repo
- **Resource type on Zenodo**: `Preprint`

## Step 1 — Write the essay

Create `src/pages/blog/<slug>.astro` from the template of an existing issue
(e.g. `toward-a-simulation-ai-organism.astro`).

Required pieces in the frontmatter:

```ts
const title = '...';
const subtitle = '...';
const date = 'YYYY-MM-DD';
const dateLabel = 'Month YYYY';
const readTime = 'N min read';
const canonicalUrl = 'https://pouriamistani.com/blog/<slug>/';
const shareTextX = '...';            // ~190 char hook for X
const doi = '';                      // empty until step 3
const doiUrl = doi ? `https://doi.org/${doi}` : '';
```

The post body should include:

- `<header class="post-hero">` with `print-only print-journal-line`
  ("Stencil · Vol. N · No. M · Month YYYY"), the hero eyebrow/title/subtitle,
  the post-meta line, the `post-doi` line (rendered conditionally on `doi`),
  and the `print-only print-source-line`
- The share/cite/export aside (`.post-actions`)
- The prose body (use the prose styles from the existing issue as a baseline)
- The "Back to Stencil" footer link
- The inline script that wires Copy BibTeX / Copy link / Export PDF
- The full `<style>` block including the `@media print` academic stylesheet

## Step 2 — Custom OG image (1200×630 PNG)

Every issue MUST have its own social share image so LinkedIn and X don't
fall back to Pouria's portrait.

1. Draft the design as an HTML file in `/tmp/og-<slug>.html`. Use:
   - Background: `#0B0C0F` with a subtle warm radial gradient
   - Typography: Fraunces (display serif, italic accent in `#E6A23C`) +
     JetBrains Mono (eyebrow/meta) via Google Fonts `@import`
   - Layout: left text column (eyebrow → title → subtitle → byline);
     right column with a thematic schematic SVG tied to the essay's
     argument
   - Border: hairline `rgba(242,239,232,0.10)` 28px inset

2. Render with headless Chrome:

   ```bash
   google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars \
     --window-size=1200,630 \
     --screenshot=img/og-<slug>.png \
     file:///tmp/og-<slug>.html
   ```

3. Reference in the post:

   ```astro
   <Base image="/img/og-<slug>.png" ogType="article" ... >
   ```

## Step 3 — Mint the DOI on Zenodo

Pouria has a Zenodo account.

1. Open the (built) post in a real browser and **Export PDF**
   (uses the `@media print` stylesheet to render an academic-format paper)
2. Go to https://zenodo.org → **New upload**
3. Drop the PDF in
4. Fill metadata:
   - **Resource type**: `Preprint`
   - **Title**: <essay title>
   - **Authors**: `Mistani, Pouria` (linked to ORCID `0000-...`)
   - **Description**: paste the subtitle as the abstract, then the first
     paragraph of the essay
   - **Publication date**: `YYYY-MM-DD`
   - **Version**: `1.0.0`
   - **License**: `Creative Commons Attribution 4.0 International (CC-BY 4.0)`
   - **Keywords**: essay-specific tags
     (e.g. for Vol. 1 No. 1: `physics simulation`, `AI for science`,
     `scientific computing`, `agentic systems`, `exascale`,
     `neural operators`, `Claude Code`)
   - **Publishing information → Journal**:
     - Title: **Stencil**
     - ISSN: leave blank (Stencil has no ISSN yet)
     - Volume: <N>
     - Issue: <M>
     - Pages: `1-<final page>` (matches the PDF page count)
   - **Related identifiers**:
     - Identifier: `https://pouriamistani.com/blog/<slug>/`
     - Scheme: `URL`
     - Relation: `Is identical to`
   - Skip Alternate identifiers, Imprint, Thesis
5. Click **Publish** → record the DOI (looks like `10.5281/zenodo.XXXXXXXX`)

## Step 4 — Wire the DOI into the site

In `src/pages/blog/<slug>.astro`:

1. Set the DOI const:
   ```ts
   const doi = '10.5281/zenodo.XXXXXXXX';
   const doiUrl = `https://doi.org/${doi}`;
   ```

2. Confirm the `.post-doi` line renders (it reads `doi` from the const)

3. Confirm the `.print-source-line` includes the DOI in the printed source line

4. Confirm the Copy BibTeX `data-bibtex` attribute uses `@article` format and
   includes the `doi = {...}` field

5. Pass the full citation metadata to `<Base>` so the
   `<meta name="citation_*">` tags are emitted for Google Scholar:

   ```astro
   <Base
     ...
     citation={{
       title: 'Essay Title',
       authors: ['Mistani, Pouria'],
       publicationDate: 'YYYY/MM/DD',          // note: slashes, not dashes
       journalTitle: 'Stencil',
       volume: N,
       issue: M,
       firstPage: 1,
       lastPage: <final page>,
       doi: doi,
       abstractHtmlUrl: canonicalUrl,
       publisher: 'Stencil',
     }}
   >
   ```

## Step 5 — List the essay on Stencil

Add an entry to the `posts` array at the top of
`src/pages/blog/index.astro` (most recent first).

## Step 6 — Verify

Run `npm run build` then check `dist/blog/<slug>/index.html` for:

```bash
grep -oE 'citation_[a-z_]+[^>]*' dist/blog/<slug>/index.html
grep -oE 'property="og:[a-z]+"[^>]*' dist/blog/<slug>/index.html
```

You should see all 11 `citation_*` tags and the OG/Twitter card tags
referencing the custom OG image.

## Step 7 — Commit + push (auto-deploys to pouriamistani.com)

```bash
git add ...
git commit -m "stencil: publish Vol. N No. M — <title>"
git push origin master
```

## Step 8 — Add to Google Scholar

Google Scholar will auto-discover the post within 2–8 weeks via the
`citation_*` meta tags (Step 4). To get on the profile immediately:

1. https://scholar.google.com → your profile → click the **+** icon
2. **Add article manually**
3. Type: `Journal`
4. Fill: title, authors (match the spelling on your profile, e.g.
   `Pouria Mistani`), date, Journal=`Stencil`, Volume, Issue, Pages
5. Paste DOI + URL in the **Description** field (Scholar has no dedicated
   DOI field on the manual form — the auto-discovered entry will attach
   the DOI later and the two records will merge)
6. Save

## Step 9 — Share

- **LinkedIn**: paste the canonical URL; the share preview pulls the custom
  OG image. If the cache shows the old generic image, force a refresh at
  https://www.linkedin.com/post-inspector/
- **X**: use the in-post X share button (prefills with `shareTextX` from
  the frontmatter)

## Reference: Vol. 1 No. 1 (May 2026)

- Slug: `toward-a-simulation-ai-organism`
- DOI: `10.5281/zenodo.20331251`
- OG image: `/img/og-simulation-organism.png`
- Figures: `/img/simulation-ai-organism.svg`,
  `/img/claude-code-plugin-architecture.svg`
- Pages: 1–8
