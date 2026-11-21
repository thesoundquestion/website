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

## Context-specific listening assumptions (2026-11-20)

The room selector now initializes **editable** listening-distance and relative-level suggestions:

| Use case | Starting distance | Level category | Illustrative System Check average/peak |
| --- | ---: | --- | --- |
| Living room | 8 ft | normal | 80 / 95 dB |
| Bedroom | 6 ft | quiet | 65 / 80 dB |
| Desk / nearfield | 2 ft | quiet | 65 / 80 dB |
| Outdoors, patio or lawn | 15 ft | normal | 80 / 95 dB |
| Gathering / event / party | 20 ft | higher-output scenario | 85 / 105 dB |

These distances are editorial planning examples, not measured population averages, fixed venue-coverage assumptions or claims that all listeners require those levels. The party profile is **not** a recommended continuous listening level. WHO / NIOSH safe-listening guidance and exposure duration should govern actual volume choices.

- The two values update independently on room selection until manually changed; manual overrides remain intact across subsequent room selections.
- A reset restores automatic defaults. A `Find My Setup` handoff selecting a desk initializes its distance and level accordingly.
- The Builder uses the live selected values in results and in the prefilled System Check URL. All amplifier, speaker and safety gates remain authoritative.
- Outdoor and party handoffs use `preferRoom=0`, so a documented in-room sensitivity isn't substituted for an anechoic figure by the model-handoff helper.
- Site-relative comparisons do not assume a universal free-field correction. Outdoor sound falls approximately 6 dB per doubling of distance under ideal free-field conditions; audience coverage, noise, source size and actual conditions vary. Do not silently invent room gain.
- Acceptance suite: `tests/system-builder-room-distance.test.mjs` and additional outdoor/party tests in `tests/listening-builder-headroom-handoff.test.mjs`.

