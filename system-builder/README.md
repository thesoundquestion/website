# System Builder v0.1 | guarded preview branch

This is a static, zero-backend, browser-only preview for **Recording to Room → System Builder**. It is not published until this branch is reviewed and merged. The original System Check, Compare My Gear, gear catalog and validated calculations are not modified.

## Scope

- Seven listening goals; one primary plus at most two secondary; faithful-source vs preferred sound character.
- Separate passive, consumer powered, active studio, headphone and party/PA routes.
- Existing speaker, amp, source and headphone selection bridged **read-only** from the 130 source presets and supplemental Compare My Gear specs. Unlisted model support with explicit unknowns.
- Separate no-sub, sub+verified mains HPF, sub+full-range mains and unknown-routing branches; never assume a SUB OUT creates HPF or automatic headroom.
- Checks for complete signal path, battery vs mains, published speaker nominal impedance vs amp ratings, whole-system cost, sources and setup-first.
- All outcomes qualitative and conditional; no product scores, scraping, retailer APIs, login, local storage or transmitted form data.
- Independent data can be cited as links under its reuse policy; numerical catalog scoring remains gated by rights and comparable methodology.

## Engineering ownership

The pure policy module `engine.mjs` adapts the private research `system-builder-prototype/engine.mjs` while preserving its eligibility functions. It is **not** a new power/headroom calculator. For electrical output at distance, visitors use existing `/system-check/`.

`catalog-adapter.js` is intentionally a classic script loaded *after* existing `gear.js` and `compare/specs.js`. It reads their global lexical `const` objects and creates a separate frozen `window.systemBuilderInventory`; it never edits the originals. No research-only products automatically become published recommendations. The 63 candidate research records and 18 pilot model sample remain private/unapproved.

Future normalized catalog data should carry model revision, evidence tier, method/test conditions, rights, currency, typical regional price (not isolated listing), availability date, safety recall scope, and actual user-configured subwoofer routing. The qualitative UI must remain usable if pricing is unknown.

## Test

```sh
node --test tests/system-builder-eligibility.test.mjs tests/system-builder-data.test.mjs
node --test tests/*.test.mjs
```

These tests verify the core gate invariants and read-only 130-preset import. They do not claim the 32 synthetic research acceptance fixtures have all been automated, nor do they replace a real browser/screen-reader QA or Cloudflare deployment check.

## Release barriers

1. Review preview language, evidence provenance and model revision handling.
2. Test responsive widths 320/390/768/1280 px, keyboard navigation, focus order, input validation, no-JS fallback and different form states in a browser.
3. Run all original System Check, Compare My Gear and general site regression tests.
4. Verify deployment source matches Cloudflare live HTTPS content only after explicit approval and merge.
5. Do not add 1–100 match ratings, global value rankings, auto-approved catalog expansion or third-party measurements without permission and method compatibility.

Research baseline: Recording to Room v0.9, Equipment Research Plan v1.6, Weighting Research v1.3 and Subwoofer Research v1.1 (private `thesoundquestion/research`, 2026-11-12). Source policy: https://www.erinsaudiocorner.com/measurement-data-policy/ (effective 2026-10-29).
