# Website Release Integration Plan: Equipment, Lessons, Homepage and Tools

**Date:** 2026-11-18 | **Status:** planning only, no branch merged or Cloudflare deploy triggered by this audit.

## Confirmed GitHub status

- PR #19 (microphone and speaker lessons) is **merged** into main; do not re-implement its changes.
- PR #23 (unified equipment master) is open/draft against main.
- PR #24 (comparisons) is open/draft against #23's branch.
- PR #25 (recording/headphone chain checkers) is open/draft against #24's branch.
- PR #21 (simpler goal-first homepage) is open/draft against main; it predates public integration of the specialist tools.
- PR #20 (audio interfaces/mixers lesson), PR #18 (technical glossary and approved pump PNG), PR #17 (search favicon), PR #16 (Ask TSQ AI) are independently open drafts.
- PR #1 is an older System Builder draft; treat as potentially superseded or conflicting, not something to merge automatically.

## Safe review sequence

1. **Do not merge or deploy yet.** Production Cloudflare Pages may deploy on a main-branch update. Confirm its configured production branch before the first approved merge.
2. Reconcile current main and PR #23 after all latest merges; confirm that #19's lesson pages and tested assets survive. Run master mirror and generated-catalogue freshness checks.
3. Review PR #24 comparisons against the approved #23 source master. Its base must move with the actual merged source; preserve original Checker/Builder numeric logic.
4. Review PR #25 specialist checkers against #24. No automatic compatibility verdicts. Confirm true source-specific manufacturer evidence before public navigation.
5. Integrate #20 lesson and #18 glossary with their exact illustration assets, preserving beginner-first writing and approved analogies.
6. Merge #21 homepage/goal guide only after target routes are approved. It must not link to unreviewed specialist tools or imply recording and live tools are universally available.
7. Integrate #17 favicon and any selected #16 Ask TSQ work as distinct gates; do not make Gmail authentication a release blocker.
8. Compare the resulting tree to the audited PRs, check broken/duplicate links and nav/sitemap continuity, then obtain the owner's full pre-release preview approval before any final deploy.

## Expected conflict hot spots

- `scripts/build-public-site.mjs` is modified by equipment and feature work; carefully combine runtime allowlists and required route checks rather than choosing one PR's version.
- `tests/public-build-output.test.mjs` receives overlapping requirements; merge all intended published files and asset exclusions.
- Homepage `index.html`, `tools/index.html`, `sitemap.xml`, `decoder/index.html` and shared CSS/assets are likely cross-feature surfaces.
- The new preview routes `/tools/equipment-comparison-preview/` and `/tools/chain-check-preview/` should remain noindex and **unlisted** until validated; they are included as draft build files strictly to permit review.
- The original `/system-check/compare/` engine, classic amplifier/speaker System Check calculations and regional numerical System Builder affordability functions must stay intact through integration.
- `equipment/source-master.json` is canonical. Do not edit generated equipment files or the legacy mirror inputs independently.
- Owned-device comparison examples must not imply public claims about the site owner's private purchases or physical cable variants.

## Mandatory non-interactive preflight

```sh
node scripts/sync-equipment-source-mirrors.mjs --check
node scripts/build-equipment-catalog.mjs --check
node --test tests/equipment-comparison-model.test.mjs tests/equipment-comparison-preview.test.mjs tests/recording-chain-check.test.mjs tests/headphone-chain-check.test.mjs tests/chain-check-preview.test.mjs
node scripts/build-public-site.mjs
```

Then run the **full** website test suite (not only these additions), inspect the browser console and public build output, and verify no internal source master, unlicensed raw audio or editorial handoff documents are published. These commands are release gates, not claimed completed CI steps.

## Owner preview checklist

- Mobile and desktop navigation remains short, with About / Share / Donate / Contact easy to reach.
- Recording goals distinguish one vocal over a beat, voice + guitar, drum kit, full band multitrack, and live PA.
- Hi-fi goals point to the actual legacy speaker/amplifier System Builder and Check; headphone goals use exact load/path evidence.
- Comparison regional tiers explicitly describe **price position**, not audio quality or brand prestige.
- Sound, amplifier, speaker and recording lessons use plain language, examples and links with no new walls of text.
- Mastering/ABX labs preserve credits, source evidence and headphone listening disclaimer as agreed.
- Verify mobile accessibility, keyboard navigation, missing/unknown data messages, actual audio samples, graphs, and download links.

**No publication authorization is implied by this document.**
