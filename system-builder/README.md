# System Builder v0.4 | ownership-first, compact named-equipment preview branch

This is a static, zero-backend, browser-only preview for **Recording to Room → System Builder**. The Cloudflare **feature-branch preview is live** at https://feature-system-builder-previ.thesoundquestion.pages.dev/system-builder/ but the production `main` branch is unchanged. The original System Check, Compare My Gear, gear catalog and validated calculations are not modified.

## Scope

- Seven listening goals; one primary plus at most two secondary; faithful-source vs preferred sound character.
- Separate passive, consumer powered, active studio, headphone and party/PA routes.
- Existing speaker, amp, source and headphone selection bridged **read-only** from the 130 source presets and supplemental Compare My Gear specs. Unlisted model support with explicit unknowns.
- Separate no-sub, sub+verified mains HPF, sub+full-range mains and unknown-routing branches; never assume a SUB OUT creates HPF or automatic headroom.
- Checks for complete signal path, battery vs mains, published speaker nominal impedance vs amp ratings, whole-system cost, sources and setup-first.
- The first named shortlist is now shown **above** the long technical report. It contains 12 editorial system examples (budget/step-up passive pairs, powered stereo pairs, two separate active monitor alternatives, open-back headphones, battery and mains party PA, a used watchlist) plus optional named subwoofer research leads, all with individual source links and candid cautions.
- Prices are individually verified Canadian offer/list snapshots checked 2026-11-12, not representative averages or completed systems. A strict budget blocks examples with known listed component subtotal already above the ceiling. Unknown source/volume/control/sub/taxes/transport costs are NOT treated as zero.
- Selecting an already-owned amplifier **without speakers** now changes the actual recommendation strategy to *speaker pairs for that amp*, not full packages with another amplifier. Curated, source-linked candidates resolve from the read-only 59-speaker System Check catalog; the owned amplifier has **zero incremental purchase cost**. The shortlist screens conservatively using published continuous-load ratings and explicit manufacturer restrictions where available (not burst power or nominal impedance alone). It remains conditional pending the full impedance/phase and amplifier manual, input path and actual level. Price examples currently include dated CAD pair listings for Polk ES15, Polk ES20 and Klipsch R-50M; no unpriced/used speaker is claimed to be within budget. If a visitor instead explicitly requests powered speakers, party, headphones or battery operation, the output says the existing amplifier is not reused for that route.
- The short results preview shows up to **3 compact product cards** by default, displaying model names, observed partial prices, one brief reason and urgent incompatibility warnings. Extra candidates, each card's full parts/trade-offs/sources, the individual chapters of the compatibility audit, and methodology use native keyboard-operable <details>/<summary> disclosures. Original rationale remains available untruncated in the expanded cards. Safety-critical speaker/amp load warnings remain visibly prominent even while cards are collapsed.
- The detailed ownership, headroom and bass audit is behind an accessible expandable section; a model and a claimed source input do not certify impedance, level or full-system compatibility.
- All outcomes qualitative and conditional; no product scores, scraping, retailer APIs, login, local storage or transmitted form data.
- Independent data can be cited as links under its reuse policy; numerical catalog scoring remains gated by rights and comparable methodology.

## Engineering ownership

The pure policy module `engine.mjs` adapts the private research `system-builder-prototype/engine.mjs` while preserving its eligibility functions. It is **not** a new power/headroom calculator. For electrical output at distance, visitors use existing `/system-check/`.

`catalog-adapter.js` is intentionally a classic script loaded *after* existing `gear.js` and `compare/specs.js`. It reads their global lexical `const` objects and creates a separate frozen `window.systemBuilderInventory`; it never edits the originals. No research-only products automatically become published recommendations. The 63 candidate research records and 18 pilot model sample remain private/unapproved.

Future normalized catalog data should carry model revision, evidence tier, method/test conditions, rights, currency, typical regional price (not isolated listing), availability date, safety recall scope, and actual user-configured subwoofer routing. The qualitative UI must remain usable if pricing is unknown.

## Test

```sh
node --test tests/system-builder-eligibility.test.mjs tests/system-builder-data.test.mjs tests/system-builder-recommendations.test.mjs tests/system-builder-compact-results.test.mjs tests/system-builder-owned-amp.test.mjs
node --test tests/*.test.mjs
```

133 / 133 top-level Node tests pass with 16 new owned-amplifier matching tests (previous 117 unchanged). An additional headless Edge QA run on a local HTTP-served branch checkout submitted four real form scenarios successfully: CAD 200 wired desk, battery PA, passive dynamic with used watchlist, and battery headphone with suitable source required. The feature-branch Cloudflare preview is live. Additional headless Edge smoke checks confirmed 7/7 compact-display behaviours including first-three cards, closed native details, safety warning visibility, and expandable audit chapters, plus 7/7 owned-amplifier browser scenarios for A-720, budget filtering and R-S202 impedance caution. These tests verify the core gate invariants and read-only 130-preset import. They do not claim the 32 synthetic research acceptance fixtures have all been automated, nor do they replace a real browser/screen-reader QA or Cloudflare deployment check.

## Release barriers

1. Review preview language, evidence provenance and model revision handling.
2. Test responsive widths 320/390/768/1280 px, keyboard navigation, focus order, input validation, no-JS fallback and different form states in a browser.
3. Run all original System Check, Compare My Gear and general site regression tests.
4. Preview deployment already verified on Cloudflare, but production `main` is intentionally unchanged. Do not merge for public release without owner review.
5. Do not add 1–100 match ratings, global value rankings, auto-approved catalog expansion or third-party measurements without permission and method compatibility.

Research baseline: Recording to Room v0.9, Equipment Research Plan v1.6, Weighting Research v1.3 and Subwoofer Research v1.1 (private `thesoundquestion/research`, 2026-11-12). Source policy: https://www.erinsaudiocorner.com/measurement-data-policy/ (effective 2026-10-29).
