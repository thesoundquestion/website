# The Sound Question — ABX Lab implementation and future-lab handoff

**Status, November 17, 2026: next-release draft; NOT publicly deployed.** Draft PR #15 on draft/abx-shared-framework-20261116. The public Pages site remains unchanged, with automatic Pages builds disabled. Cloudflare free-tier D1 score storage is provisioned and its schema is initialized; the scored Worker has NOT been deployed or given its secret. Its checked-in ABX_PUBLIC_ENABLED flag is false.

This is a **fun, informal, voluntary community listening experiment**, not an accredited hearing test, clinical assessment, or controlled scientific experiment. It is not cheat-proof. We preserve reasonable fairness without delaying the site indefinitely for laboratory perfection.

## Architecture and navigation

- **One dedicated ABX Lab:** /labs/abx/ (labs/abx/index.html), served by assets/abx-lab.js and assets/abx-lab.css with the common bounded local-cache helper assets/lab-readiness.js.
- **Original educational lessons:** Mixing /lab/, Mastering /lab/mastering/, and MP3 vs Lossless /labs/formats/. These link to the relevant ABX comparison, without embedding the full ABX player.
- **Every ABX comparison has an explicit lessonUrl.** The “Explore the original [lesson] Lab” link opens its original lesson in another tab so the active test remains intact. Mastering EQ links straight to ?experiment=eq, matched masters to ?experiment=matched, and MP3 comparisons to ?song=light or ?song=diva. Source overviews carry recording credits and explanations.
- The current selection is encoded in a shareable ABX URL: ?test=versioned-id&mode=training|challenge|advanced. Browser history is updated without placing any session credential or answer key in the URL.
- The previous small inline Mastering ABX control is hidden, retained only for a separately reviewed cleanup. It is not an additional public ABX destination.

## Curated test catalogue

| Mode | Examples | Result |
| --- | --- | --- |
| Training | Exaggerated stereo mixes, loudness-matched contrasting masters, EQ on/off, MP3 examples | Ten rounds, immediate feedback, no public scoring |
| Challenge | Mastering EQ; Let The Light In and Diva: lossless versus 128 kbps MP3 | Ten randomized rounds, result at the end, optional anonymous sharing |
| Advanced | Let The Light In and Diva: lossless versus 320 kbps MP3 | Twenty randomized rounds, result at the end, optional anonymous sharing |

Difficulty is a property of the *game*, not the person or their gear. Visitors can select any category without passing Training. The deliberately **unmatched-loudness mastering progression is excluded** from ABX; it stays a sighted lesson. Compared recordings derive from the same existing source performance and were prepared for the original lessons. The MP3 manifest pins hashes, offsets and decoded sample counts. The ~0.44 dB RMS difference of the 128 kbps examples is acknowledged; Training applies its existing gain compensation. Scored comparisons are informal demonstrations rather than tightly calibrated, definitive findings.

## Browser playback, caching, free-tier budget

- No ABX audio loads until the listener starts preparation or begins a scored session.
- Training downloads only the two unique recordings into bounded local Blob URLs, then attempts synchronized Web Audio preparation **from those local Blobs** (no second public audio download). A, B and X share one audio clock; X aliases A or B, and switching labels changes gain rather than restarting audio. The existing 14 MiB compressed / 48 MiB decoded limits apply inside the synchronized engine. If decoding is unavailable or the size cap is reached, Training falls back to cached native `<audio>` playback; switching source files in fallback mode can still pause. **One shared Ready indicator** appears after preparation.
- Scored sessions use server-owned random X and an A/B permutation, cache both references for the full session, and load one mystery X per new round. The active comparison is bounded to three cached audio files and ~25 MiB. Scored sessions still use native media-source changes while the Worker is unreleased, so scored switching gaps and physical-device fairness remain release checks. Cache entries are discarded and Blob URLs revoked when the experiment changes or ends.
- Sighted lessons consistently use only Offline, Please wait and Ready; idle files have no misleading status. The scored ABX screen suppresses timing-based readiness labels that might identify X. Browser file lengths, formats, and enablement timing can still be inspected by determined visitors. We do not claim cheating resistance beyond basic protections.
- Counting both the score Worker and upstream audio Worker, an ideal 20-round Advanced session can require approximately **43–65 Worker requests**, depending on which files come from static Pages versus the audio Worker. Retries, Range requests and non-ABX traffic increase actual usage. Measure Cloudflare Worker/KV/D1 quotas before activating score sharing. Never buy paid services or enable automatic Pages deployments to solve playback issues.
- Details and prior benchmark guidance: docs/lab-playback-free-tier/README.md.

## Scoring protocol and privacy

The Worker source is workers/abx/index.mjs, D1 schema workers/abx/schema.sql, release config workers/abx/wrangler.toml.

- A server secret determines X, reference-label permutation and per-round tokens. The client never receives an explicit answer variable in scored mode. A separate session-control credential, stored only as a hash in D1, authorizes answers and recovery.
- One atomic conditional D1 update accepts the current trial. Duplicate submissions and retries cannot increase the score twice. The server reveals correctness only after the full 10 or 20 trials.
- Listeners choose whether to include a *completed* score in community statistics. The checkbox is OFF by default. Scores are grouped by versioned comparison, mode and trial count, not by distinct people. Groups with fewer than 10 shared completed sessions are suppressed.
- Final results report correct answers and the binomial probability of that score or higher under random guessing. They do not correct for repeated attempts, playback gear, preference or participant selection. There are no personal leaderboards.
- No account, name or email is stored with a score. D1 does not save IP addresses; short-lived IP rate-limit keys are used by Cloudflare. Unfinished sessions expire after 2 hours; completed private scores are scheduled for deletion after 24 hours, opted-in sessions after 180 days. Daily cleanup runs only once the Worker is deployed.
- Privacy and community-result wording appears in privacy/index.html. The public site contact is thesoundquestion@gmail.com; visitors may suggest test ideas and offer permission to use recordings.

## Adding future ABX comparisons

1. Obtain or verify the right to use the recording. Preserve its source and credits in the original lesson.
2. Identify the musical or production change and whether it is suited to Training, Challenge or Advanced. **Never include an intentionally unequal-loudness demonstration as a scored ABX comparison.**
3. Verify both recordings actually play, have comparable timing and meaningful source continuity, and do not have obvious unintended silence/clicks or wildly unequal playback levels. Keep reasonable controls; document limitations instead of claiming an academic experiment.
4. Give the comparison a **new versioned ID**, such as stereo-width-v1. Any material audio revision uses a new version so community statistics cannot be merged incorrectly.
5. Add the comparison to assets/abx-lab.js with its ID, lab category, explicit lessonUrl, permitted modes, two recording URLs and a clear one-sentence explanation.
6. If it should be scored, add the same ID and sources to workers/abx/index.mjs and explicitly specify permitted scored modes in its curated VALIDATED map. Never accept arbitrary file URLs from visitors.
7. Add a link to the right comparison on the original lesson page. Confirm that the ABX “Explore the original lesson” link returns to the right mode or song. Include new lesson pages in the directory and sitemap.
8. Run the Node unit tests and desktop/mobile browser smoke tests. Verify no unnecessary audio on page view, reliable buffered switching, local cache cleanup, and no additional Worker request from repeated A/B/X presses.
9. Confirm the free-tier request and storage budget, privacy notice, opt-in logic, stats threshold, recording permission and source credits. Keep unverified community claims modest.
10. Merge only after review, deploy the scored Worker and its secret deliberately, verify real D1 operations, then manually publish Pages in a single planned build.

## Release inventory and remaining operations

- [x] Dedicated ABX Lab, three categories, curated tests and links in both directions
- [x] Per-test lesson deep links; URLs preserving selected comparison
- [x] Homepage share controls and public contact email
- [x] Anonymous opt-in tracker, server-generated X and score-state recovery
- [x] Bounded browser-local playback cache and no repeated audio request per A/B/X click
- [x] Cloudflare free-tier D1 database created and SQL schema initialized
- [x] Wrangler database binding and retention cron configured; ABX_PUBLIC_ENABLED is OFF by default
- [ ] Configure the Worker ABX_SECRET through Cloudflare, deploy the Worker manually, then deliberately enable the public score service for the coordinated site update
- [ ] Test actual Cloudflare D1 /start, /answer, /resume, /audio and /stats responses, and verify request quotas, retention, mobile playback and failure recovery
- [ ] Complete final link/content review, merge draft PR, and manually deploy Pages once; verify public site paths afterwards

**Do not release only the static ABX page with a nonfunctional score API while claiming that community scoring works.** See workers/abx/RELEASE.md.

Historical research and earlier draft plans are archived in docs/abx-labs/PRIOR_DRAFT_HANDOFF.md. This README is the authoritative current handoff.

## Community input (17 November 2026)

The next draft adds a **moderated Listening Room nomination and discussion board**, plus short discussion comments in the ABX Lab. The Listening Room reuses the existing **seven category identifiers**, including their current label names. Visitors suggest **one recording per entry** (artist 64 characters, title 100, one category, explanation 20–280 characters) and are encouraged to share overlooked, lesser-known and distinctive recordings. Freeform comments are 5–280 characters. No direct uploads, contributor accounts or arbitrary HTML/links.

`assets/community-board.js` and `assets/community-board.css` implement the lightweight UI. Approved suggestions display as plain cards with a site-generated Spotify search URL; approved comments appear below. Unreviewed entries do not appear. The API `workers/abx/community.mjs` handles `/v1/community/submit` and `/v1/community/approved` using the **existing free-tier D1 database**, not an added paid storage service. Manual moderation uses the Cloudflare D1 console, with SQL workflow in `workers/abx/COMMUNITY-REVIEW.md`. `COMMUNITY_PUBLIC_ENABLED` is a separate release flag, currently **false**.

To extend this to another lesson, add a `data-community-scope` section only after defining an approved section and adjusting server permissions, privacy text, rate limits and review workflow. Do not expose unreviewed rows or add visitor-supplied links.
