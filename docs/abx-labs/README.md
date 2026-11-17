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

- The Worker derives each hidden X assignment and A/B label permutation from a secret HMAC. Audio URLs contain a per-round token, but **not** the separate, unguessable session-control credential needed to submit answers or resume. The client never receives correctness until completion.
- Each answer advances the session through a **single conditional D1 UPDATE**. Repeated or concurrent submissions for the same round return the already-committed state rather than increasing the score; the client can call `/v1/resume` to recover after a dropped connection. Session totals: 10 (Challenge), 20 (Advanced). Per-round correctness stays secret; only final results include the count and an exact binomial chance-of-guessing tail.
- Sessions expire after **2 hours**. Completed sessions that were not opted into community statistics are marked for deletion after **24 hours**; completed opt-in sessions after **180 days**. Unfinished sessions expire and are marked for deletion. Periodic cleanup requires a separately enabled scheduled Worker trigger. Only completed opt-in sessions count in public statistics, grouped by versioned test ID, difficulty and trial count; suppress cells with fewer than 10 sessions. No names, emails or IP addresses are stored in D1 by this app.
- **The validation allowlist is intentionally empty** (`VALIDATED = new Set([])`). All scored starts return 409 until approved. This is a safety gate, not a defect to “fix” by changing the set to every test.
- Exact source version and level-matching information must be bound to a **versioned test ID** before accepting real submissions. On any asset/algorithm change, start a new aggregate; never merge old and new scores blindly.

## Mandatory source and playback validation gate

Before enabling a single Challenge or Advanced test:

1. Verify both files originate from the **same specific source/master** except the treatment under test. Record source fingerprint, delivery codec, sample rate, channel count, duration and processing notes.
2. Measure and document levels using an appropriate method. Control unintended gain differences, including browser volume adjustments, metadata replay gain and codec decode offsets. Never ABX the unmatched “loudness progression.”
3. Verify sample/time alignment, start/end boundaries, silence and fades; ensure A/B/X navigation preserves position without causing unique clicks, buffering, delays or visual clues. Prefer one consistent decode/container/rendering path for all reference choices.
4. **Inspect response side channels:** file extension, MIME, size/Content-Length, Content-Range, transfer timings, metadata, URL, cache behavior and network fingerprint. Opaque URLs alone do **not** prevent source-reading cheats. Current direct FLAC-vs-MP3 sources have distinguishable sizes and MIME types, so they are **NOT approved for scored tests**. Consider controlled, equivalently packaged/encrypted chunks and server-side decoding/transcoding where legal and practical. A determined client can always capture and compare audio.
5. Verify the server-owned HMAC assignment, credential separation, atomic D1 compare-and-swap, idempotent retries, expiry, and final-only answer disclosure using real D1 in staging. The draft now requires Cloudflare Workers rate-limit bindings for API requests and new sessions, but rate limits are approximate and location-specific. Additional abuse prevention and optional Turnstile checks require review. This remains a **staging prototype**, not hardened production software.
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

**Outstanding before any scored release:** live-D1 concurrency/retention validation; source equivalence; approved level-matched and aligned audio; side-channel review and reduction (especially distinguishing formats); broader multi-browser playback validation; anti-abuse testing and possibly Turnstile; approved privacy-policy wording and retention schedule; real D1 and secret bindings; review of the legacy Mastering Lab ABX duplication; a public aggregates UI reviewed for statistical clarity. The current draft has an aggregate table, not a finished analytical dashboard. Do not describe the system as fully secure or community scoring as live before those gates are closed.

## Engineering hardening pass — November 16, 2026

Changes on this draft branch, after the initial shared-player implementation:

- **Replay/races:** Replaced separate round/session writes with one compare-and-swap update in D1. Two simultaneous answers cannot both increase the score. Retrying a committed token or resuming gives the current state without revealing the answer to that individual round.
- **Credential separation:** Audio requests carry only session ID, round index, and per-round HMAC token. Submitting an answer or recovering a session requires an additional random control credential, stored in D1 only as SHA-256. A leaked audio URL is insufficient to submit a guess.
- **Deterministic, secret X:** HMAC-derived trial decisions, reference-label permutation, and URL tokens use a Cloudflare Worker secret of at least 32 characters. Secret rotation invalidates active sessions. The Worker refuses to serve scoring without required bindings.
- **Versioned trials:** `-v1` suffixes are mandatory for server-scored IDs. New source/master revision means a new version ID and new statistics, not overwriting old sessions.
- **Limits and retention:** Worker code requires `API_LIMITER` and `START_LIMITER` bindings; currently unconfigured D1 and secret keep it non-deployable. Scheduled purge is implemented but its cron is intentionally disabled. Limits are only an abuse deterrent, not proof of a unique visitor.
- **Training playback:** The documented approximately 0.436 dB decoded RMS loss of the 128 kbps examples is compensated with a 0.951 reference gain (Training only). The MP3/FLAC manifest SHA-256, frame count, alignment and RMS differences are now checked automatically. This is *not* a loudness-matched, independently verified scored ABX path.
- **Client interruption handling:** Scored sessions require an explicit Start; user opt-in is fixed at session creation, mode changes are blocked mid-session, stale start replies are ignored, and a failed answer can recover with `POST /v1/resume`.
- **Statistical interpretation:** Final session feedback includes the binomial probability of guessing at least that many correct answers. It is descriptive, not a hearing certification or correction for optional stopping, repeated attempts or unsupervised conditions.
- **Real behavior tests:** `tests/abx-service.test.mjs` exercises fake-D1 API transactions including racing answers, wrong credentials, duplicate/replayed tokens, final-only correctness, 20-round sessions, server binding failures, audio URL expiry and minimum community sample size. `tests/abx-source-readiness.test.mjs` checks source manifests; the Formats Chrome smoke test covers actual ABX media playback on desktop and mobile viewports.

### Still not solved by opaque delivery

The decoded audio necessarily reaches the visitor's device. Filename masking, Worker proxying, randomized URL tokens and hiding JavaScript answer variables do **not** stop a determined visitor from comparing the decoded data for X against A and B. The Worker currently also relays source MIME, content length/range and timing information, providing easier side-channel clues. **All scored comparisons remain on an empty allowlist.** Before opening any, prepare equivalent delivery representations, audit network clues, and explicitly label community results *unsupervised and unverified*. Do not present the dashboard as cheat-proof or as measurements of individual hearing acuity.

### Minimum deployment gate

No D1 database has been created, no secret has been set and no Worker has been deployed in this pass. Do not merge this draft until the requested hands-on playback review is complete. The site's Cloudflare Pages project has automatic deployments disabled; release must remain a deliberate single build after a passing test suite and file/link audit.

## Cloudflare Free-tier playback budget (mandatory)

Playback and server-scored ABX must obey the [shared Cloudflare Free-tier playback resource policy](../lab-playback-free-tier/README.md). All existing source and fairness gates still apply. The current ABX proxy invokes a Worker for *every* A/B/X audio request; a 20-round Advanced session can use at least 81 Worker requests before Range retries. **Do not enable scored results** until per-session Worker/KV/D1 consumption is benchmarked and contained. Avoid eager full-file preloading; the live Mastering page currently loads three original FLACs for waveforms even when nobody presses Play. Preserve the zero-automatic-Pages-builds policy.

## Repeated-listening optimization requirement — November 17, 2026

ABX listeners may replay A/B/X dozens or hundreds of times. Each listening-button press **must not** create a Worker/KV request. The scored API still has server-owned per-round X assignment; clients must not infer or locally select X.

Implementation targets: Training fetches each distinct source once per comparison; scored sessions reuse A/B audio throughout the session and fetch a new opaque X only once per round, then replay all three from bounded local memory. This suggests 12 audio requests for ten scored rounds or 22 for twenty scored rounds under ideal conditions. For Advanced this is **43 total Worker requests minimum** including 20 answer submissions and one start, rather than the current 81+ uncached minimum. This is a *target only*, not a shipped optimization or a measured quota reduction.

Require real browser network instrumentation, cache/Range audits, cold first-play and switching benchmarks, mobile memory tests, no answer timing cues, bounded memory and cleanup before shipping. See the detailed [Cloudflare Free-tier repeated-ABX policy](../lab-playback-free-tier/README.md#repeated-abx-listening-request-caps-local-cache-and-fairness). Public results remain disabled pending technical validation.

## Readiness timing and answer side channels — November 17, 2026

The only user-facing track-status words are **Offline**, **Please wait**, and **Ready**, with consistent meanings across Listening Labs. Idle tracks show no status instead of a misleading "Please wait". In ordinary sighted experiments, Ready means the selected recording has playable buffered audio or the alternate has a complete reusable in-memory copy. It does **not** promise uninterrupted playback for the entire clip.

**ABX safety exception:** Training uses **one whole-trial indicator**, never a separate A/B/X loading label. All of A and B are fetched to bounded local blobs before the trial becomes Ready; X aliases one of them locally, and repeated A/B/X clicks do not fetch files anew. Individual play buttons never reveal which recording was prepared faster.

**Even a single per-round Ready transition is a clue in scored ABX** if the time to fetch X depends on whether X matches source A or B. The staged interface therefore **suppresses visible readiness indicators for Challenge and Advanced**. That does NOT eliminate timing differences in button enablement, download lengths, MIME responses, direct source fingerprinting or network inspection. Release remains blocked until scored delivery is explicitly reviewed for these side channels. An unsupervised browser ABX test cannot be made cheat-proof. Do not describe a group-level Ready label as proof of statistical fairness.

**Audio focus:** When Training starts preparing or any lab player begins playing, other same-page players are paused, avoiding competing audio and needless prefetch bandwidth. Browser tests verify actual full-file Training preparation and repeated A/B/X replay without extra audio Worker requests.
