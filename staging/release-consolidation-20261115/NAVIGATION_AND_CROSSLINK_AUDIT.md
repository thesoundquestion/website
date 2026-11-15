# Site information architecture and internal-link audit (November 15, 2026)

## Publishing status
This is a *draft-only* working checklist for the GitHub branch `draft/release-consolidation-20261115`. Sitewide navigation and contextual links are not approved for public deployment yet. Cloudflare Pages automatic deployments remain disabled.

## Five-category navigation
Every core page now uses **Lessons** (`/decoder/`), **Labs** (`/labs/`), **Tools** (`/tools/`), **Library** (`/library/`) and **About** (`/about/`). The logo returns home. A native HTML `<details>` menu provides mobile navigation without JavaScript; the existing page-specific lesson breadcrumbs remain in place.

The Tools hub gathers three existing utilities:
- System Check `/system-check/`
- System Builder `/system-builder/`
- Compare My Gear `/system-check/compare/`

The homepage now presents four clear purpose-based cards (Lessons, Labs, Tools, Library). About appears in the first-screen hero and in the header. The large conceptual waveform graphic is hidden on narrow mobile screens to bring useful navigation higher up, but remains on desktop.

## High-value contextual links newly added or verified

| Page | Relevant content | Reason |
|---|---|---|
| Mixing & soundstage lesson | `/lab/` and `/library/behind-the-experiments/` | Hear different mixes, then inspect experiment methods |
| Mastering & dynamic-range lesson | `/lab/mastering/` and evidence article | Hear dynamic/moderate/brickwalled treatments and matched comparisons |
| Audiophile glossary | Mixing/soundstage lesson and Mixing Lab | Relate descriptive terminology to an audible example |
| Labs home | Both Mixing and Mastering experiments | Treat two completed interface prototypes as equal experiments |
| Behind the Experiments | Mastering Lab | Connect measurement discussion to the interactive controls |
| Tools home | Amplifier power, speaker impedance and speaker sensitivity | Explain what feeds the calculators |

## Already useful, intentionally not duplicated

- Amplifier-power and speaker-sensitivity lessons already link to System Check and/or Compare My Gear.
- Speaker-impedance lesson already links to System Check and amplifier comparison.
- Speaker-frequency-response lesson already links to bass extension, dispersion and relevant gear tools.
- Decoder lesson pages retain their previous/next lesson links, breadcrumbs, sources and inline explanations.

## Further editorial review

- Audit footer and breadcrumb patterns on older lesson templates, keeping the header consistent without rewriting substantive educational material.
- Review mobile page lengths and on-page navigation. Hide source-stage detail behind a disclosure where it makes the Labs home easier to scan, but keep credits visible.
- Add cross-links only where the reader can take a useful next step. Do not scatter promotional links in every paragraph.
- Avoid publishing anecdotes about the curator's gear, home listening setup or family recordings without prior owner approval. The requested autobiographical curator note remains an approved exception.
- No externally hosted AlbumDB audio is added. Rights review, final editorial sign-off, and browser-level responsive/interactions testing are still outstanding.
