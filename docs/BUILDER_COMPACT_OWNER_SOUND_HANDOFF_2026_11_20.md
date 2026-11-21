# The Sound Question — Compact Builder Sound-First Preview Handoff

Status: GitHub draft preview only. **Not deployed to Cloudflare or merged to main.**

Branch: `draft/magicpath-compact-full-site-20261120`
Base: `draft/consolidated-prelaunch-20261119`

## Owner-directed UI contract

- The leading recommendation answers **which item matches and why**.
- Each alternative describes **how that alternative sounds, on its own terms**. Do not require direct head-to-head comparisons or describe differences from the primary recommendation as a prerequisite for presenting listening notes.
- Use exact-model, source-linked firsthand owner/listener reports. Prefer concise audible descriptions: bass weight, vocals, guitars, treble energy, dynamics, imaging, etc.
- If owner impressions are unavailable, **omit** unsupported listening copy rather than filling the card with a warning or a generic "no tonal direction" sentence.
- Keep practical fit and complete specifications in optional disclosures. Do not duplicate main recommendation copy in every alternative.
- Present headroom as a compact status; the real System Check remains the calculation authority, not a second integrated technical manual.
- Provide an **always-visible, prefilled System Check link on the leading result**. Send model identities, any available distance and illustrative average/peak values through the existing URL handoff; never invent missing model specifications.
- Use existing TSQ dark navy/cyan design tokens, compact spacing and responsive row layout. Do not replace the audio matching or verification engine with MagicPath's sample React state.

## Files involved

- `system-builder/app.mjs`: native result/alternative rendering, owner impressions and checker URL.
- `system-builder/compact-preview.css`: preview-only compact brand styling.
- `system-builder/index.html`: revised entry, results headings and cache versions.
- `system-builder/tonal-impressions.mjs`: no fabricated empty relative-tonality fallback.
- `tests/system-builder-tonal-impressions.test.mjs`, `tests/system-builder-alternative-comparisons.test.mjs`, `tests/listening-builder-headroom-handoff.test.mjs`: updated assertions.

## Validation / outstanding gates

- Source-level JavaScript syntax and structure checks: passed.
- 15 sound-impression unit scenarios: passed in an in-memory JS harness.
- Full Node/browser regression and responsive visual QA: **not run** on the remote checkout. Run before release; verify all intent categories, selected models, source links, checker transfer, keyboard disclosure navigation and mobile width.
- Do not use Cloudflare builds to review. Open the full-site branch locally via `PREVIEW_FULL_SITE_WINDOWS.cmd`.

## Acceptance examples

- First match: model, why suitable, source-backed "What owners say", compact headroom and visible `Open System Check with this gear`.
- Alternatives: model and one independent, source-backed "What owners say" sentence; optional setup details.
- No "How it may sound different" or "No clear tonal direction is established ..." repeated across cards.
- The same site navigation, palette and component density as the full TSQ site.
