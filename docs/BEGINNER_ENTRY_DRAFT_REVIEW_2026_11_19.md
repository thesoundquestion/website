# The Sound Question — Beginner-first website draft review

**Date:** 2026-11-19
**Branch:** `draft/beginner-entry-and-refreshers-20261119`
**Status:** GitHub-only functional prototype; NOT merged and NOT Cloudflare-deployed.

## Purpose

Test the source-reviewed editorial strategy without rebuilding the whole site: visitors should start with their *question*, skip formal lessons when appropriate, and use the existing Decoder pages as everyday explanations, recaps and evidence-based refreshers. The site must not turn uncertain equipment information into a confident purchase recommendation.

Private source plans:
- `thesoundquestion/research/BEGINNER_SITE_NAVIGATION_AND_GOAL_ROUTING_PLAN_2026_11_19.md`
- `thesoundquestion/research/BEGINNER_BUILDER_DECISION_LOGIC_UPGRADE_PLAN_2026_11_19.md`
- `thesoundquestion/research/TSQ01_BEGINNER_HIFI_FRICTIONS_RESEARCH_2026_11_19.md`

## Functional changes staged for review

1. Homepage **preserves the previously approved opening, Jump Straight In section and six-card Choose Your Path layout**. It adds a compact row of direct shortcuts for amp/speaker matching, vinyl, digital sources and improving owned equipment; the Lessons shortcut now explicitly welcomes refreshers. Creators keep their six prominent original goal cards. This is intentionally a smaller experiment than a homepage redesign.
2. Decoder landing explicitly serves absolute beginners and returning enthusiasts. Lessons do not have to be followed in sequence; short explanations and sources are emphasized. All existing 27 lessons and technical calculations remain unchanged.
3. Find My Setup preserves the eleven existing educational routes and adds four:
   - `match`: recognize powered vs passive, defer exact electrical/clean SPL checks to System Check.
   - `vinyl`: turntable/phono stage and powered/passive/receiver signal path, with unknowns shown rather than guessed.
   - `digital`: source output to receiver/powered/passive playback, no compulsory separate DAC.
   - `improve`: start with no-cost listening, positioning and source checks rather than a mandatory upgrade.
4. Guide results direct to appropriate existing sources, System Check or Builder. There is **no automatic pass-through of equipment facts into the Builder**, no hidden user data upload, and no suggestion that a generic route certifies a model-specific connection.
5. Browser-only regression tests cover all guide-answer combinations and specific high-risk connection examples. The GitHub-only PR release preflight now runs these checks.

## Preserved on purpose

- Listening/Creating Builder recommendation math, candidate list, prices and catalog.
- System Check engineering formulas, impedance/load caveats and unknown-data behaviour.
- Existing lesson content and canonicals, source provenance and visual claims.
- Homepage existing styles and the simple sitewide navigation.
- Free-only Cloudflare release controls.
- No new paid APIs, affiliate offers, tracking, accounts or forced lesson prerequisites.

## First user-testing checklist

- New to stereo: can a visitor find an optional explanation or an actual complete listening route in one or two choices?
- Vinyl: with powered speakers and LINE turntable output, does it correctly avoid an unnecessary phono preamp or separate amplifier?
- Vinyl: for raw phono output, does it flag the phono-stage requirement and the possibility that an appropriate PHONO receiver input already supplies it?
- Digital: does the route distinguish an existing analogue output or built-in DAC from a genuinely digital-only connection?
- Speakers: does a powered speaker route warn against connecting the external amplifier speaker terminals?
- Existing system: does the visitor reach setup/recording checks without a forced shopping suggestion?
- Experienced listener: is the Decoder immediately recognizable as a quick refresher, not a mandatory class?
- Mobile/keyboard: check 320px, 390px, 768px and desktop; no overwhelming card wall, clipping or inaccessible focus.
- Creator: ensure existing vocal, band, streaming and live-sound routes remain easy to find in the guide.
- Check each guide CTA actually lands at the promised published page; the detailed Builder engine upgrade is intentionally a separate phase.

## Current validation and unresolved gaps

- A code-level function evaluation has tested **all 303 answer combinations** across 15 guide goals, with no thrown error or empty result, on the proposed branch source. This is not yet evidence of physical mobile usability. An initial GitHub regression run flagged six-card/wording constraints from the previous approved homepage; the draft was corrected to preserve them and its existing fixed-count goal test was updated to retain the original eleven while adding four.
- The new Node test file is `tests/beginner-entry-paths.test.mjs`, integrated into `release-browser-preflight.yml`; GitHub PR run is required for official build/browser status.
- These routes do **not** yet implement shared typed intent state between Find My Setup and the Builders, complete product-level phono/DAC/adapter verification, or model-specific "safe matching". Those are described and gated in the separate private engineering plan.
- The new quick-link labels and discoverability are **hypotheses** to test with newcomers, not validated conversion improvements. The homepage card count and original curiosity-led introduction were preserved after existing CI checks flagged their approved constraints.

**Hard release boundary:** no merge to `main` and no Cloudflare build/deployment without explicit owner authorization for that specific action.
