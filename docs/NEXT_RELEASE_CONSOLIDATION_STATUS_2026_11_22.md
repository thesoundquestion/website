# TSQ consolidated next release: integration checkpoint (2026-11-22)

**Repository:** `thesoundquestion/website`  
**Branch:** `release/consolidated-next-20261122`  
**Review:** draft PR #43 targeting `main`  
**Release status:** NOT APPROVED; do not merge or deploy.  
**Source branches:** `draft/magicpath-compact-full-site-20261120` (includes prelaunch/Builder/Decoder work), `audit/legacy-197-risk-gates-20261121` (PR #39), Spotify PR #41, IndexNow PR #38, video intro documentation PR #40.

## What has been staged and integrated

- Starts from the sound-first compact Listening Builder and completed developer/UI work on the compact draft. Preserve its beginner-facing summary, owner-specific listening evidence, optional technical detail, room-level suggestions, existing lessons and validated calculations.
- Imported non-overlapping audit files (equipment certification evidence and test gates, added subwoofer and powered speaker standalone checkers, Builder→Checker handoff modules, comparison handoff, test coverage and build checks), plus Spotify app-first handler, IndexNow verification/submission scripts, and video intro documentation.
- Rebased source-specific Creating Builder linking and core recommendation code without replacing the newer compact UI.
- Integrated exact passive Builder→System Check links using manufacturer-compatible sensitivity basis and same-load continuous power **only where available**. Includes model identity, user-selected distance, average/peak targets; missing equipment fields stay unknown and editable. `system-check/calculator.js` can now calculate using supported Builder-transferred specs for Builder-only models not already present in the original calculator preset list; original exact factory presets still take precedence.
- Linked the dedicated powered and subwoofer checkers from Tools, and selected model-aware output/wiring paths from Listening Builder. Creating Builder source-to-Compare handoffs are staged.
- Prevented arbitrary unlisted subwoofers from inheriting the Edifier T5's exact wiring or filtering and excluded unknown-nominal-impedance speakers from ready-to-connect owned-amplifier shortlists.
- Kept unsupported Fosi BT20A Pro (32 V / 5 A) + Polk XT15 as a **blocked ready-to-buy example pending claim-specific evidence review**. This is **not** an assertion that its physical pairing is inherently unsafe; older draft tests treated manufacturer general load permissions as sufficient, whereas the audit branch demands further qualification. Reconcile evidence and editorial policy before restoring a recommendation.
- Corrected JBL 305P MkII maximum acoustic SPL treatment: maker quotes maximum peak/continuous numbers but the cited sell sheet does not verify a reference microphone distance for those maxima, so no numeric distance-scaled headroom may be asserted. The dedicated powered checker now explains this explicitly.
- Every Listening Room Spotify HTTPS destination is preserved; desktop app URI attempt and web fallback are staged. Mobile retains OS-handled HTTPS app links. Browser UX remains best-effort, not perfect app-install detection.
- IndexNow remains a **post-approved-deployment manual step**; no live submission has been sent.
- No Cloudflare build, preview or production deployment was triggered.

## Required corrections and hard release blockers

1. **197-record certification gate:** exactly 197 current records, of which 195 match the pinned legacy baseline and **two changed PSB Alpha P3/P5 source records require review**. No blanket approval or baseline reset is permitted. Review exact changed fields against primary datasheets, any variant/source conditions, and prove their builder/output effects; then record an accountable approval only if substantiated. The generated risk register was refreshed against the combined catalogue without fabricating certificates.
2. **Unresolved overlapping implementations:** the two source branches diverged on approximately 21 source/test files. Some substantive overlaps have been adapted; the compact primary result renderer, source evidence and System Check interfaces must be checked end to end, not replaced with an older source file. Preserve new audio presentation and all safety constraints.
3. **Powered-speaker model consistency:** the compact Builder's `system-check/powered-headroom-model.mjs` and new dedicated checker `system-builder/powered-output-evidence.mjs` have overlapping evidence maps. Consolidate proven shared facts without inventing microphone distances, clean SPL, or pair gain. JBL and Kali test conditions need special care.
4. **Test expectation conflict:** audit tests expected brief high target 95 dB and 75/90 dB default System Check in some cases; the compact Builder currently uses 85/105 dB high and original 80/95 dB illustrative standalone defaults, with expanded levels guidance. Keep accurate, editable semantics. Tests should verify actual intended behavior, not merely literal older wording.
5. **Fosi/Polk source conflict:** older compact tests treat an Fosi/XT15 example as manufacturer-permitted and eligible, whereas the audit branch blocks that curated purchase example due to unresolved exact performance evidence. Verify the manufacturer load permission and stock-supply circumstances; distinguish electrical safety from lack of measured continuous clean headroom. Do not bypass the release gate by weakening a test.
6. **Other regressions:** inspect current GitHub Actions run logs for strict budget, first-pick completeness, owned-pair blockers, source citations and powered/passive correct checker routing. The main browser preflight/Pages static build is expected to fail until certification and integration are corrected.
7. **Final acceptance:** full Node suite + equipment admission and certification + static build + desktop/mobile browser preflight + ABX/audio labs + real model→checker URL handoff validation on the **exact combined branch tip**. Confirm navigational links, 320px/mobile widths, keyboard, blocked pair disclosure, unknown powered SPL, unknown subwoofer input and real source connections.

### Historical CI checkpoint, not a current result

At commit `595d1af3`, before later integrations, **982 tests / 965 passing / 17 failing**. Listening Labs playback/ABX workflow passed on multiple intermediate commits. GitHub regression and static release build were red, mainly due PSB certification gate, older UI test assumptions and outstanding safety/integration contracts. Any later CI must be read on its own commit SHA. Do **not** report this as a final passing release.

## Next integration pass

- Inspect the latest exact-head GitHub CI logs, classify actual defects versus outdated assertions.
- Resolve PSB P3/P5 source review and Fosi/XT15 evidence policy before changing release assertions.
- Unify powered speaker evidence and test both normal/unknown-distance cases across standalone and Builder.
- Verify passive full custom-spec handoff and Creating studio/PA and subwoofer handoff in browser preflight; reject empty generic links.
- Only after green combined tests, owner visual approval and explicit deployment authorization: merge final approved change into `main` and deploy once. Run manual IndexNow submission after verifying live key URL.

**Permanent boundary:** Draft GitHub review only. No Cloudflare build or deployment for previews, tests or this integration until the owner explicitly approves that exact deployment.
