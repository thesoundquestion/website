# Phase 2 equipment comparison: pre-preview engineering handoff

**Date:** 2026-11-18
**Draft:** PR #24 stacked on PR #23; no merge, deploy, public navigation link or approved release.

## Built

- Shared-registry comparison model: `equipment/comparison-model.mjs`.
- Isolated noindex review route: `tools/equipment-comparison-preview/`.
- Nine function categories, searchable two-model selectors, regional pricing option, opt-in relative price order, plain-language verified differences, evidence links and test-condition warnings.
- The static site builder includes the comparison module as an explicit runtime allowlist item and requires three preview assets. It still excludes the editorial source master and research documents.
- Price positioning is independent of actual affordability and sound quality. Only sampled CA USB interfaces and wired headphones currently receive labels; other regions and expired sources have none.

## Checks performed without an interactive browser

1. Retrieved actual branch version of `catalog.generated.json` with **173 unique records** and executed the actual comparison-model JavaScript in an isolated JS runtime.
2. Exhaustively generated **3,997 same-category equipment pairs**; comparison results returned rows with valid string displays and did not throw.
3. Checked concrete examples: M-Track Solo vs Scarlett 2i2 (4th gen), Grado SR80e vs HD 600, Yamaha A-720 vs Panasonic SA-HE100, Yamaha MG10XU vs Zoom L-12 and incompatible amplifier vs microphone.
4. Verified full module parsing of review-page JavaScript and pricing modules in isolated JavaScript; no injected `innerHTML`.
5. Verified Canada ten-model limited sample, blank US/GB/EU/AU tiers, correct expiry and stable price-position sorting without dropping unknown models.
6. Code-level checks for document `noindex,nofollow`, required selectors, source links, public build allowlist inclusion and expected static paths.
7. Added Node regression tests for power-rating measurement bases, headphone and speaker sensitivity reference mismatches, setup-only bit depth, unverified values, preview accessibility, optional price tiers and publication guard.

**Important:** These isolated JS checks are **not** a substitute for `node --test` over the full checked-out repository or for browser/mobile testing. GitHub currently reports no CI result on the newest draft commits. Desktop Commander remote execution is unavailable at the account's monthly limit; do not repeatedly retry it.

## Editorial risk gates

- Manufacturer-rated numbers are source-stated, not independent bench measurements.
- Amplifier ratings are not numerically ranked when test conditions differ; headphone ratings retain their measured load and output path.
- Speaker sensitivity comparisons need the same confirmed 1 W or 2.83 V reference and distance. Headphones need the same dB/mW or dB/V basis.
- Software-documented bit depth is not assumed to establish hardware/driver maximum. M-Track Solo maximum remains unverified.
- A missing physical connector in the shared schema may mean not yet researched; never claim the device lacks that connector.
- Sources are displayed per product, but a source URL does not establish every fact on that product; field-specific manufacturer evidence remains desirable.
- Relative regional price-tier category does **not** imply a quality tier, value-for-money ranking, live price, inventory availability or compatibility.
- Selecting two copies of the same model is allowed for inspection, but yields no upgrade conclusion.

## Remaining owner-facing preview gates

1. Run full CI and `node --test tests/equipment-comparison-model.test.mjs tests/equipment-comparison-preview.test.mjs` in a normal checkout, plus `node scripts/build-public-site.mjs`.
2. Review mobile dropdowns, keyboard focus, table horizontal scrolling, VoiceOver/screen-reader labels and real-world connection quality.
3. Review technical copy for beginner clarity and evidence sufficiency, especially manufacturer headphone specifications and power rating rendering.
4. Review comparison defaults for studio monitors, mixers and microphone inputs; do not expose automatic compatibility verdicts.
5. Approve an eventual public Compare My Gear integration; until then **no merge/deployment**.

## After preview

Migrate approved controls to the existing `/system-check/compare/` page without breaking legacy amplifier/speaker calculations, then connect approved specialized recording/headphone checkers to the goal-first homepage.
