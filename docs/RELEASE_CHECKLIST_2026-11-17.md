# The Sound Question — coordinated site release checklist

**Baseline:** November 17, 2026 pre-release audit. **Branch:** `draft/abx-shared-framework-20261116`. Production `main` and Cloudflare Pages are unchanged until deliberate approval.

### A. Visitor-facing release blockers
- [x] ABX scored-repeat state resets after a completed session, and new session requires a fresh optional statistics opt-in.
- [x] A user-initiated Prepare recordings request works even on Data Saver; only speculative preloading is suppressed.
- [x] ABX copy no longer contradicts the Challenge/Advanced modes actually offered.
- [ ] Release and verify the scored Worker with D1, rate limits, retention cron, secure secret and `ABX_PUBLIC_ENABLED=true` only at coordinated launch.
- [ ] Release and verify community submissions, approved-only display, review/deletion and CORS before enabling the community flag.
- [ ] Real backend test: scoring and score recovery, 10/20 rounds, no duplicate answers, repeat attempts, public results.
- [ ] Verify audio permissions, external citations/attribution and site privacy before deployment.
- [ ] Verify the actual free-tier Worker+KV+D1 request budget, mobile playback, offline recovery and accessibility.
- [ ] Run final production smoke test after deliberate merge/manual Pages deployment.

### B. Improvements for this update
- [x] Replace Mastering's three page-load FLAC downloads with original source-measured static stereo SVGs (960 min/max/RMS bins; matching shared amplitude scale), and retain hashes in provenance.
- [x] Retire the hidden duplicate Mastering ABX controls and listeners, leaving the dedicated ABX Lab link.
- [ ] Investigate PR #11 Formats Web Audio switching; integrate only if the newer browser fallback and caching stay reliable.
- [x] Add ABX, community, share, waveform and readiness files to required Pages build and validate waveform SVG checksums.
- [x] Source-level internal link and anchor integrity covers 1000+ hrefs; normalize Mastering logo, main navigation and mobile menu to the site's shared labels. Final visual review remains separate.
- [x] Direct Content Use rights questions to the project email while preserving the contact page and permission terms.
- [x] Add regression for Mastering static waveforms, source provenance, old ABX absence and zero initial waveform decoding.

### C. Editorial and continuity
- [x] Pre-release audit checked 47 sitemap routes and the existing 24-lesson sequence.
- [x] Current build checks approved MP3 hashes and the illustrated handbook; retired quick-guide PDF is omitted.
- [x] Add plain-language introductory summaries to the longest frequency response, mixing and mastering lessons; preserve advanced sections for interested readers.
- [ ] Ensure the first use of specialist vocabulary is explained with a short real-life example.
- [x] Explain 51 curated selections versus 53 tracks: a three-song suite appears as one curated entry.
- [ ] Review real mobile layout and final lesson flow.

### D. Admin follow-up, **not a release blocker**
- [ ] Authorize Gmail native filters if desired; scheduled inbox triage already runs.
- [ ] Authorize optional daily moderation reminder email when convenient. The community can be moderated directly in D1 without email alerts.
- [ ] Review pending posts and permissions periodically through the existing administrative workflow.

### E. Related draft reconciliation, no blind branch merges
- [ ] PR #11: compare older synchronous Formats player with current runtime.
- [ ] PR #10: 59-page handbook already present in `main`; reconcile/close outdated draft.
- [ ] PR #1: old System Builder draft; `main` already has the tool.

**No automatic Cloudflare Pages deployments. No paid upgrades as a shortcut.**
