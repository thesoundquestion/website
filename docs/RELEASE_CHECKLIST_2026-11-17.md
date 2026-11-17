# The Sound Question — coordinated site release checklist

**Baseline:** November 17, 2026 pre-release audit. **Branch:** `draft/abx-shared-framework-20261116`. Production `main` and Cloudflare Pages are unchanged until deliberate approval.

### A. Visitor-facing release blockers
- [x] ABX scored-repeat state resets after a completed session, and new session requires a fresh optional statistics opt-in.
- [x] A user-initiated Prepare recordings request works even on Data Saver; only speculative preloading is suppressed.
- [x] ABX copy no longer contradicts the Challenge/Advanced modes actually offered.
- [ ] Release and verify the scored Worker with D1, rate limits, retention cron, secure secret and `ABX_PUBLIC_ENABLED=true` only at coordinated launch.
- [ ] Release and verify community submissions, approved-only display, review/deletion and CORS before enabling the community flag.
- [~] Mock scored ABX browser test now verifies ten rounds, a failed X download, server resume, second attempt and consent reset; Node tests verify 20 rounds, duplicate-answer protection and group stats. Real Cloudflare D1/Worker testing remains a release gate.
- [ ] Final manual permissions/credits/privacy spot-check before deployment. Content Use has direct contact email and research credit tests already pass; keep this as a real publishing review.
- [~] Document Workers/D1 free-tier quotas, request-per-session budget and existing cache protections in `docs/abx-labs/FREE_TIER_CAPACITY_2026-11.md`; mock recovery and desktop/mobile-emulated playback pass. Actual account metrics, live Worker and physical-device checks remain open.
- [ ] Run final production smoke test after deliberate merge/manual Pages deployment.

### B. Improvements for this update
- [x] Replace Mastering's three page-load FLAC downloads with original source-measured static stereo SVGs (960 min/max/RMS bins; matching shared amplitude scale), and retain hashes in provenance.
- [x] Retire the hidden duplicate Mastering ABX controls and listeners, leaving the dedicated ABX Lab link.
- [x] Reconcile PR #11: retain on-demand Formats playback for launch; document optional future synchronized mode rather than forcing three downloads on every first Play.
- [x] Add ABX, community, share, waveform and readiness files to required Pages build and validate waveform SVG checksums.
- [x] Source-level internal link and anchor integrity covers 1000+ hrefs; normalize Mastering logo, main navigation and mobile menu to the site's shared labels. Final visual review remains separate.
- [x] Direct Content Use rights questions to the project email while preserving the contact page and permission terms.
- [x] Add regression for Mastering static waveforms, source provenance, old ABX absence and zero initial waveform decoding.

### C. Editorial and continuity
- [x] Pre-release audit checked 47 sitemap routes and the existing 24-lesson sequence.
- [x] Current build checks approved MP3 hashes and the illustrated handbook; retired quick-guide PDF is omitted.
- [x] Add plain-language introductory summaries to the longest frequency response, mixing and mastering lessons; preserve advanced sections for interested readers.
- [~] Add plain-English definitions for LUFS, crest factor and dBTP in Mastering, and kbps/RMS in Formats. Full cross-site first-use vocabulary review still outstanding.
- [x] Explain 51 curated selections versus 53 tracks: a three-song suite appears as one curated entry.
- [~] Desktop and mobile-emulated Chrome browser tests pass on Formats, Mastering, ABX training and community UI; verify an actual phone before calling the device review complete.

### D. Admin follow-up, **not a release blocker**
- [ ] Authorize Gmail native filters if desired; scheduled inbox triage already runs.
- [ ] Authorize optional daily moderation reminder email when convenient. The community can be moderated directly in D1 without email alerts.
- [ ] Review pending posts and permissions periodically through the existing administrative workflow.

### E. Related draft reconciliation, no blind branch merges
- [x] PR #11 compared: synchronized engine is valid but eager 3-track decode is not the free-tier default. Decision and future opt-in path saved in `docs/formats-lab/README.md` (old PR remains open; do not merge wholesale).
- [ ] PR #10: 59-page handbook already present in `main`; reconcile/close outdated draft.
- [ ] PR #1: old System Builder draft; `main` already has the tool.

**No automatic Cloudflare Pages deployments. No paid upgrades as a shortcut.**

## Current test evidence

- Unit test workflow and desktop/mobile-emulated browser workflow green at this draft's latest validated head. Recheck the final commit before release.
- Scored ABX mock browser regression: 10 rounds, one deliberately failed X request recovered through `/v1/resume`, no new Worker requests from repeated A/B/X, another attempt starts with consent OFF. This is **not** the live scoring backend.
- Formats browser regression: zero media requests before Play, including switching tracks and song; on-demand audio playback still succeeds.
- Detailed Mastering waveform SVGs load without downloading FLAC data, with verified source-file hashes.
- GitHub PR #11 remains open, intentionally unmerged pending a separately tested opt-in synchronized mode.

