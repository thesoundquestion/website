# Phase 3: Recording and Headphone Chain Pre-Preview Handoff

**Date:** 2026-11-18 | **Draft only** | stacked on equipment inventory and comparison drafts.

## Work completed in this draft

- `equipment/recording-chain-check.mjs`: Conservative capacity/evidence model for selected microphones and exact USB interfaces/mixers.
  - Separates analogue microphone preamps from physical jack count, computer capture channels and independently editable tracks.
  - Handles summed stereo USB output correctly: an MG10XU can record a multi-microphone stereo mix but **cannot** send the individual microphones as isolated USB tracks.
  - Preserves known requirements for phantom power and explicitly requests cable/phantom verification.
  - Does not infer routing or gain from XLR plug appearance, or treat nominal channel counts as proof of compatibility.
- `equipment/headphone-chain-check.mjs`: Exact-load headphone-output evidence reader.
  - Manufacturer published power at **32 Ω** is not extrapolated to **300 Ω**.
  - FiiO K11 high-gain 4.4 mm balanced rating is **not** assigned to the original Grado SR80e single-ended cable; its 6.35 mm rating remains separate.
  - Original/revised HD 600 plug variants remain connector-unverified until the user's real cable is inspected.
  - Reported output impedance/ceiling and headphone sensitivity basis are advisory facts, not a predicted SPL or quality/safety certification.
- `tools/chain-check-preview/`: Unlisted, noindex review interface with recording and headphone workflows; responsive controls, source-derived checks and separate applicable vs other-load headphone ratings.
- `tests/recording-chain-check.test.mjs`, `tests/headphone-chain-check.test.mjs`, `tests/chain-check-preview.test.mjs`: regression gates.
- `scripts/build-public-site.mjs` explicitly allowlists the two new runtime modules, requires the review route assets, and still excludes the editable equipment master.

## Verification performed without computer/browser preview

- Executed actual repository JS model modules against the generated shared 173-model catalogue in isolated JavaScript.
- Exhaustively evaluated **108** combinations of one selected microphone, interface/mixer and record mode, plus **320** documented headphone-to-output selections, with no exceptions.
- Concrete scenario checks:
  - FIFINE K669D + M-Track Solo: one microphone fits the published single microphone-preamp count.
  - Two microphones + M-Track Solo: known microphone-preamp shortfall.
  - Multiple microphones + Yamaha MG10XU: one shared stereo mix possible; separate USB tracks not documented/known stereo-only limitation.
  - Two microphones + Zoom LiveTrak L-12: multitrack mode exists, but routing and sampling mode still need verification.
  - Grado SR80e + M-Track Solo: 60 mW/ch at documented 32 Ω reference; no loudness prediction.
  - HD 600 + M-Track Solo: no verified 300 Ω power rating; 32 Ω reference must not be reused.
  - Grado SR80e + FiiO K11: only single-ended 6.35 mm 520 mW/ch rating applies to the documented adapter path; the separate balanced 1400 mW/ch claim remains in other-path evidence.
  - HD 600 + JDS Labs Atom Amp 2: manufacturer published 286 mW/ch at 300 Ω is load-matched evidence; not a guaranteed SPL result.
- Parsed review JavaScript, checked selected DOM IDs and build asset allowlist; no `innerHTML` injection.

**Limitations:** These isolated checks are not Node test-runner results, complete checked-out site builds, physical wiring validation or actual mobile/browser reviews. No successful GitHub CI run is reported for this branch. Desktop Commander cannot be used again until its account usage resets.

## Required manual acceptance later

1. Run full Node tests and public static build on a proper checkout or confirmed GitHub Actions run.
2. Review chain-check preview in desktop and mobile browsers and with keyboard/VoiceOver.
3. Verify physical microphone and headphone connector variants, cable/adapter details, phantom routing, and test-basis labels with owner equipment.
4. Verify all lead-ins explain that documented capacity does **not** certify connection safety or guarantee recordings.
5. Keep specialist preview unlinked from navigation, homepage, sitemap and original Checker until editorial approval.
6. Do not merge/deploy without the owner's release decision.

## Architecture for subsequent integration

The specialist modules are independent pure functions over `equipment/catalog.generated.json`; they can be migrated to dedicated System Check workflows without altering the existing amplifier/speaker calculator. No account, paid API, local storage or microphone-audio upload is required.
