# The Sound Question: shared ABX listening-lab framework

**Status (2026-11-16): DRAFT / NOT DEPLOYED / SCORED MODE LOCKED.** Branch: `draft/abx-shared-framework-20261116`. Production remains unchanged. No Cloudflare Pages builds should be triggered for draft revisions.

## Principles

ABX means listeners hear known references **A** and **B**, then identify whether mystery **X** matches A or B. This is **discrimination**, not a preference or equipment-quality ranking.

- **Training:** Guided, beginner-friendly, immediate correctness feedback, 10 rounds, browser-only practice. Exaggerated stereo mixes and level-matched but dramatically compressed masters are suitable examples. No community scores.
- **Challenge:** Carefully verified, smaller differences, 10 rounds, no correctness feedback until the full session ends. Server checks all answers; optional anonymous contribution to a community aggregate.
- **Advanced:** Particularly demanding, separately vetted comparisons, 20 rounds and no mid-session answer feedback. No title of “pro,” no claimed hearing certification.
- Levels describe the **comparison**, not the person's capability. Visitors can enter any available level without prerequisites.
- **Unmatched deliberately loud masters are never ABX eligible.** Preserve their sighted learning demonstration.
- Strongly contrasting mixes/mastering treatments are Training, even when level-matched. A fair but obvious difference is not an invalid ABX comparison.
- Never compare two distinct musical performances/masters as a codec test. Keep source, timing and mastering controlled.

## Current implementation

### Public-facing reusable renderer

`assets/abx-lab.js` + `assets/abx-lab.css`, embedded by:
- `lab/index.html`: Mixing Training (narrow/reference, reference/creative).
- `lab/mastering/index.html`: Mastering Training (matched dynamic/moderate, matched moderate/brickwalled, EQ off/on); existing legacy local ABX is retained pending integration.
- `labs/formats/index.html`: per-song codec Training (FLAC vs 128/320 kbps).

The engine displays all three modes, an explicit scored-session Start button after the opt-in choice, and a read-only community results panel (minimum 10 completed opt-in sessions per result cell). The scoring service is not yet deployed; these features must explain unavailability rather than imply scores are live. The engine explains why scored modes are unavailable until protected delivery has been approved. On Training, A/B/X run only in the user's browser and **scores are never sent**. On Challenge/Advanced, the engine requires an authenticated response from a dedicated scoring Worker. The proposed Worker is not deployed.

**Important:** Training currently uses the existing streams and approximate-position source switching, so it is an educational experience, not a tightly controlled laboratory ABX environment. Validate playback synchronization and switching artifacts before claiming technical precision. Users can inspect source URLs in Training; those results have no public ranking.

### Proposed independently deployable score API

`workers/abx/index.mjs`: `POST /v1/start`, `POST /v1/answer`, `GET /v1/audio/:session/:round/:token/:slot`, `GET /v1/stats`, `GET /v1/health`.

`workers/abx/schema.sql`: Cloudflare D1 database tables for sessions and trial answers.

`workers/abx/wrangler.toml`: **placeholder** configuration. No database ID, secret, or live deployment.

- The Worker owns the random X assignment; the browser receives only a session ID, single-use round token and opaque playback URLs.
- Completed rounds cannot be submitted repeatedly. Session totals: 10 (Challenge), 20 (Advanced). The API reveals only the final correct count, with optional aggregate reporting.
- Each session expires after 45 minutes; only completed, opt-in sessions count in public statistics, grouped by test ID, difficulty and trial count. Suppress aggregates with fewer than 10 opted-in sessions. No names/emails/IP addresses stored in D1 by this app.
- **The validation allowlist is intentionally empty** (`VALIDATED = new Set([])`). All scored starts return 409 until approved. This is a safety gate, not a defect to “fix” by changing the set to every test.
- Exact source version and level-matching information must be bound to a **versioned test ID** before accepting real submissions. On any asset/algorithm change, start a new aggregate; never merge old and new scores blindly.

## Mandatory source and playback validation gate

Before enabling a single Challenge or Advanced test:

1. Verify both files originate from the **same specific source/master** except the treatment under test. Record source fingerprint, delivery codec, sample rate, channel count, duration and processing notes.
2. Measure and document levels using an appropriate method. Control unintended gain differences, including browser volume adjustments, metadata replay gain and codec decode offsets. Never ABX the unmatched “loudness progression.”
3. Verify sample/time alignment, start/end boundaries, silence and fades; ensure A/B/X navigation preserves position without causing unique clicks, buffering, delays or visual clues. Prefer one consistent decode/container/rendering path for all reference choices.
4. **Inspect response side channels:** file extension, MIME, size/Content-Length, Content-Range, transfer timings, metadata, URL, cache behavior and network fingerprint. Opaque URLs alone do **not** prevent source-reading cheats. Current direct FLAC-vs-MP3 sources have distinguishable sizes and MIME types, so they are **NOT approved for scored tests**. Consider controlled, equivalently packaged/encrypted chunks and server-side decoding/transcoding where legal and practical. A determined client can always capture and compare audio.
5. Verify that the server, not client code, chooses X, calculates correctness, enforces trials and limits request abuse. Add D1 transaction/concurrency safeguards and proper rate limiting/Turnstile checks before opening scores. Current Worker source is a **staging prototype**, not hardened production software.
6. Test actual desktop/mobile browsers, headphones/Bluetooth, autoplay restrictions, latency, bandwidth, loading failures, Safari/Chromium/Firefox, and accessibility.
7. Review use rights and public playback authorization for each asset. Never upload a visitor's optional local WAV/FLAC to server scoring.
8. Obtain explicit opt-in for anonymous community aggregates. Update `privacy/index.html` **before** any server scoring goes live, explaining score collection, retention, sharing and user choices. Keep all non-opted-in trials out of published aggregates.
9. Add automated regression tests for answer secrecy, duplicate submissions, expiry, response-status handling, score totals, aggregation minimums, broken audio URLs and file integrity. Manually audit the live release with browser developer tools.
10. Only after QA and privacy approval, create a D1 database, apply `schema.sql`, configure the binding, set the allowlist for exactly verified versioned comparisons and deploy the Worker deliberately. Verify HTTPS/CORS, then deploy the Pages UI in one controlled production build.

## Community statistics design

Group by **comparison ID + asset revision + difficulty + trial count**; report unique completed session count, mean and histogram of correct guesses, and binomial chance interpretation. Treat multiple submissions as *sessions*, never as independent unique people (no accounts). Optional self-reported device/setup filters require a separate privacy review and data-quality disclaimer.

Suggested copy: “Community results are voluntary, unsupervised listening sessions. They do not establish anyone's hearing ability or prove universal audibility.” Avoid a personal leaderboard and avoid any claim that a high score proves preference, quality, price-performance or playback gear superiority.

## Repeatability for future labs

1. Prepare and rights-check two variants.
2. Measure levels and timing; write a versioned source manifest.
3. Decide whether the comparison is **Training** only or eligible for scored Challenge/Advanced *after* technical review.
4. Add the comparison to the shared catalogue; no separate ABX widget or bespoke scorer.
5. Update the Worker asset allowlist only for approved scored tests, then add tests for it.
6. Verify public page copy, audio route, sitemap if a page is added, link targets and existing lab functionality.
7. Run `node --test` and `node scripts/build-public-site.mjs`. Ensure `site-dist` includes runtime JS/CSS and **excludes workers, tests, docs, private audio and databases**.
8. Obtain release approval, deploy intentionally and verify the actual site URLs after Cloudflare success.

**Outstanding before any scored release:** hardened anti-replay transactions, anti-abuse layer, source equivalence, side-channel-resistant delivery, all-browser playback validation, privacy policy and retention rules, real D1 binding, review of legacy Mastering Lab ABX duplication, user-facing aggregate graph. Do not describe the system as fully secure or community scoring as live before those gates are closed.
