# The Sound Question — ABX Lab implementation and future-lab handoff

**Status, November 18, 2026: public baseline launched; next full-site update remains draft.** PR #15 was merged and deployed on November 17 Atlantic time, with a successful read-only public smoke run (see `docs/PRODUCTION_LAUNCH_2026-11-17.md`). The ABX Worker is live; its D1, signed-answer secret, rate limiters and daily cleanup cron are configured. A previous 10-round live service acceptance passed ([evidence](https://github.com/thesoundquestion/website/actions/runs/44220509527)) and its test records were removed. Current release candidate PR #32 remains unpublished. The ABX evidence matrix was reconciled with the client mode map, server scoring allowlist and read-only Cloudflare Worker flags; real-device scored audio fairness and the new release's owner acceptance remain mandatory.

This is a **fun, informal, voluntary community listening experiment**, not an accredited hearing test, clinical assessment, or controlled scientific experiment. It is not cheat-proof. We preserve reasonable fairness without delaying the site indefinitely for laboratory perfection.

## Architecture and navigation

- **One dedicated ABX Lab:** /labs/abx/ (labs/abx/index.html), served by assets/abx-lab.js and assets/abx-lab.css with the common bounded local-cache helper assets/lab-readiness.js.
- **Original educational lessons:** Mixing /lab/, Mastering /lab/mastering/, and MP3 vs Lossless /labs/formats/. These link to the relevant ABX comparison, without embedding the full ABX player.
- **Every ABX comparison has an explicit lessonUrl.** The “Explore the original [lesson] Lab” link opens its original lesson in another tab so the active test remains intact. Mastering EQ links straight to ?experiment=eq, matched masters to ?experiment=matched, and MP3 comparisons to ?song=light or ?song=diva. Source overviews carry recording credits and explanations.
- The current selection is encoded in a shareable ABX URL: ?test=versioned-id&mode=training|challenge|advanced. Browser history is updated without placing any session credential or answer key in the URL.
- The previous small inline Mastering ABX control is hidden, retained only for a separately reviewed cleanup. It is not an additional public ABX destination.

## Mandatory ABX evidence-status review before public release

**Release blocker.** The five-row “What is actually tested?” matrix in `library/behind-the-experiments/index.html` (the `#abx` section) reflects the current **draft implementation**, not a promise of what will be available after final validation. Its “Available procedure” column must be reconciled with actual release conditions **immediately before merging or publishing**, because those statuses may change as comparisons complete fairness testing.

- Verify both **Mixing/stereo-width** comparisons: are they still Training only, or have any additional modes and scored paths been implemented and verified?
- Verify both **Mastering dynamics** comparisons: keep the intentionally unequal-volume mastering demonstrations excluded from scored ABX; inspect any new loudness-matched eligible tests.
- Verify **Mastering EQ**: private synchronized Challenge remains the only validated non-Training option as of this draft. Do not promote it to server-scored until native scored playback's answer-correlated audio gaps, levels and timing have been assessed on real devices and the live worker allowlist updated.
- Verify the two **128 kbps MP3** comparisons for Training and 10-trial Challenge, and both **320 kbps MP3** comparisons for Training and 20-trial Advanced. Confirm versioned source assets, source hashes, matching, actual server allowlist and Worker feature flag.
- Compare the browser catalogue (`assets/abx-lab.js`), scoring allowlist (`workers/abx/index.mjs`), **deployed** Cloudflare Worker configuration/health, canonical-origin behavior and a clean preview/practice run. A GitHub commit alone does not update the Worker.
- Update the **five table rows**, caption and surrounding “How do the three modes work?” explanations together. Update the Lab landing page and `docs/abx-labs/README.md` / `workers/abx/RELEASE.md` if any availability changes. Review the privacy and public-statistics statements if scoring or consent behavior changes.
- Run the full site regression, ABX browser smoke and real desktop/mobile audio checks before release. Record the final supported modes and evidence in PR #32; do not infer “scored” from the presence of a mode button or working practice UI.

Until that review is completed and the site owner approves publication, **do not merge the release-candidate branch or deploy production**.

## Curated test catalogue

| Mode | Examples | Result |
| --- | --- | --- |
| Training | Exaggerated stereo mixes, loudness-matched contrasting masters, EQ on/off, MP3 examples | Ten rounds, immediate feedback, no public scoring |
| Challenge | Mastering EQ private practice; Let The Light In and Diva: lossless versus 128 kbps MP3 scored | Ten rounds; MP3 comparisons server-scored with optional opt-in community result, EQ remains private |
| Advanced | Let The Light In and Diva: lossless versus 320 kbps MP3 | Twenty rounds server-scored on canonical site; opt-in result aggregation only |

Difficulty is a property of the *game*, not the person or their gear. Visitors can select any category without passing Training. The deliberately **unmatched-loudness mastering progression is excluded** from ABX; it stays a sighted lesson. Compared recordings derive from the same existing source performance and were prepared for the original lessons. The MP3 manifest pins hashes, offsets and decoded sample counts. The ~0.44 dB RMS difference of the 128 kbps examples is acknowledged; Training applies its existing gain compensation. Scored comparisons are informal demonstrations rather than tightly calibrated, definitive findings.

## Browser playback, caching, free-tier budget

- No ABX audio loads until the listener deliberately prepares Training, starts a private practice challenge, or starts a server-scored session on the canonical website.
- Training downloads only the two unique recordings into bounded local Blob URLs, then attempts synchronized Web Audio preparation **from those local Blobs** (no second public audio download). A, B and X share one audio clock; X aliases A or B, and switching labels changes gain rather than restarting audio. The existing 14 MiB compressed / 48 MiB decoded limits apply inside the synchronized engine. If decoding is unavailable or the size cap is reached, Training falls back to cached native `<audio>` playback; switching source files in fallback mode can still pause. **One shared Ready indicator** appears after preparation.
- **Server-scored comparisons:** scored sessions use server-owned random X and an A/B permutation, cache both references for the full session, and load one mystery X per new round. The active comparison is bounded to three cached audio files and ~25 MiB. Scored sessions still use native media-source changes; therefore the mastering EQ scored challenge remains disabled pending its separate answer-cue listening validation. The EQ challenge stays available as private local practice. Cache entries are discarded and Blob URLs revoked when the experiment changes or ends.
- Sighted lessons consistently use only Offline, Please wait and Ready; idle files have no misleading status. The scored ABX screen suppresses timing-based readiness labels that might identify X. Browser file lengths, formats, and enablement timing can still be inspected by determined visitors. We do not claim cheating resistance beyond basic protections.
- Counting both the score Worker and upstream audio Worker, an ideal 20-round Advanced session can require approximately **43–65 Worker requests**, depending on which files come from static Pages versus the audio Worker. Retries, Range requests and non-ABX traffic increase actual usage. Measure Cloudflare Worker/KV/D1 quotas before activating score sharing. Never buy paid services or enable automatic Pages deployments to solve playback issues.
- Details and prior benchmark guidance: docs/lab-playback-free-tier/README.md.

## Public scoring and private practice

The canonical `https://thesoundquestion.com` site supports server-scored Challenge and Advanced sessions for curated, eligible MP3 comparisons. The server signs answer mappings and round tokens; participation in the anonymized community statistics requires separate optional consent, off by default. Training is always private practice. Mastering EQ Challenge remains private practice because only the local synchronized playback has passed the owner's answer-cue listening tests, not the independent scored native playback path.

When run from localhost, alternate hosts or preview branches, `PRACTICE_ONLY` remains true to avoid accidentally writing real scores during testing. The new PR #32 release candidate has not been published; the existing November 17 public site is live. Worker and database flags are independent of Cloudflare Pages publication.

## Scoring protocol and privacy

The Worker source is workers/abx/index.mjs, D1 schema workers/abx/schema.sql, release config workers/abx/wrangler.toml.

- A server secret determines X, reference-label permutation and per-round tokens. The client never receives an explicit answer variable in scored mode. A separate session-control credential, stored only as a hash in D1, authorizes answers and recovery.
- One atomic conditional D1 update accepts the current trial. Duplicate submissions and retries cannot increase the score twice. The server reveals correctness only after the full 10 or 20 trials.
- Listeners choose whether to include a *completed* score in community statistics. The checkbox is OFF by default. Scores are grouped by versioned comparison, mode and trial count, not by distinct people. Groups with fewer than 10 shared completed sessions are suppressed.
- Final results report correct answers and the binomial probability of that score or higher under random guessing. They do not correct for repeated attempts, playback gear, preference or participant selection. There are no personal leaderboards.
- No account, name or email is stored with a score. D1 does not save IP addresses; short-lived IP rate-limit keys are used by Cloudflare. Unfinished sessions expire after 2 hours; completed private scores are scheduled for deletion after 24 hours, opted-in sessions after 180 days. A daily cleanup cron is now installed; observe the first scheduled execution and quota usage.
- Privacy and community-result wording appears in privacy/index.html. The public site contact is contact@thesoundquestion.com (forwarded to the existing thesoundquestion@gmail.com inbox); visitors may suggest test ideas and offer permission to use recordings.

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
10. The scored Worker, secret and live D1 protocol have been deployed and verified. Merge only after remaining editorial/device checks and explicit release approval, then manually publish Pages in a single planned build.

## Release inventory and remaining operations

- [x] Dedicated ABX Lab, three categories, curated tests and links in both directions
- [x] Per-test lesson deep links; URLs preserving selected comparison
- [x] Homepage share controls and public contact email
- [x] Anonymous opt-in tracker, server-generated X and score-state recovery
- [x] Bounded browser-local playback cache and no repeated audio request per A/B/X click
- [x] Cloudflare free-tier D1 database created and SQL schema initialized
- [x] Wrangler database binding, installed cron, secret and active ABX_PUBLIC_ENABLED flag verified
- [x] Configure ABX_SECRET securely, deploy current Worker and enable scored MP3 comparisons with Mastering EQ scored path excluded
- [~] Live D1 /start, /answer, /resume, signed /audio Range and /stats tests passed, with session recovery and 10-round completion. Actual retention cron run, sustained quotas, mobile scored playback and failure recovery under poor networks still need monitoring.
- [ ] Complete final link/content review, merge draft PR, and manually deploy Pages once; verify public site paths afterwards

**Do not release only the static ABX page with a nonfunctional score API while claiming that community scoring works.** See workers/abx/RELEASE.md.

Historical research and earlier draft plans are archived in docs/abx-labs/PRIOR_DRAFT_HANDOFF.md. This README is the authoritative current handoff.

## Community input (17 November 2026)

The next draft adds a **moderated Listening Room nomination and discussion board**, plus short discussion comments in the ABX Lab. The Listening Room reuses the existing **seven category identifiers**, including their current label names. Visitors suggest **one recording per entry** (artist 64 characters, title 100, one category, explanation 20–280 characters) and are encouraged to share overlooked, lesser-known and distinctive recordings. Freeform comments are 5–280 characters. No direct uploads, contributor accounts or arbitrary HTML/links.

`assets/community-board.js` and `assets/community-board.css` implement the lightweight UI. Approved suggestions display as plain cards with a site-generated Spotify search URL; approved comments appear below. Unreviewed entries do not appear. The API `workers/abx/community.mjs` handles `/v1/community/submit` and `/v1/community/approved` using the **existing free-tier D1 database**, not an added paid storage service. Manual moderation uses the Cloudflare D1 console, with SQL workflow in `workers/abx/COMMUNITY-REVIEW.md`. `COMMUNITY_PUBLIC_ENABLED` is a separate release flag, currently **true**; API pending-only and listing tests passed. The visitor-facing forms from the November 17 release are already live; manual moderation remains necessary.

To extend this to another lesson, add a `data-community-scope` section only after defining an approved section and adjusting server permissions, privacy text, rate limits and review workflow. Do not expose unreviewed rows or add visitor-supplied links.
