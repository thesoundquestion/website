# ABX architecture note (2026-11-17)

ABX is centralized at /labs/abx/ in the next-release draft. Repeated A/B/X presses reuse locally cached files. Counting both the score Worker and public FLAC Worker, a 20-trial session can take roughly 43–65 Worker requests before retries. The D1 database is provisioned; the Worker is not deployed. Earlier text below about ABX embedded in the three lessons or scoring DB not existing is superseded by docs/abx-labs/README.md.

# Listening Labs playback: Cloudflare Free-tier resource policy

**Status:** Design rule and pre-release budget, 2026-11-17. Not deployed. Applies to Mixing, Mastering, Formats, shared ABX and future labs. Refer also to [ABX engineering handoff](../abx-labs/README.md).

## Hard constraints

**Free plan is a release requirement.** Do not upgrade Cloudflare, enable paid services, or deploy an architecture that assumes paid overages. Keep automatic Pages deployments OFF. Confirm pricing and account-wide usage from Cloudflare documentation/dashboard again immediately before deployment because limits change.

Verified Cloudflare documentation (2026-11-17):
- Workers Free: **100,000 incoming Worker requests per day per account**, shared with Pages Functions; resets 00:00 UTC. An invocation is counted even if its code gets a cache hit. https://developers.cloudflare.com/workers/platform/limits/ and https://developers.cloudflare.com/pages/functions/pricing/
- Workers KV Free: **100,000 key reads/day**, **1,000 writes/day**, **1 GB storage**. Exceeding a daily KV operation allowance fails further operations of that type; KV local caching can lower latency without implying that a new `get()` doesn't count as a read. https://developers.cloudflare.com/kv/platform/pricing/
- Cloudflare Pages **static assets** are free/unlimited when requests do not invoke Pages Functions; this does not make Worker-proxied FLAC free. https://developers.cloudflare.com/pages/functions/pricing/
- Workers KV uses a network cache via `cacheTtl`, but this is not the same as browser caching or bypassing the Worker. https://developers.cloudflare.com/kv/api/read-key-value-pairs/

## Existing implementation and source of avoidable usage

- Public FLAC audio is served by `tsq-lab-audio.thesoundquestion.workers.dev`. The live Worker reads the **entire** FLAC KV value using `env.AUDIO_KV.get(path,{type:'arrayBuffer',cacheTtl:60})` and **then** slices it for Range requests. Every browser Range request invokes a Worker and one KV `get`, potentially retrieving the whole object internally. This needs measurement and eventual redesign, not more aggressive preloading layered on top.
- Mastering's original eager three-FLAC page-load waveform decoding has been replaced **in the draft** with measured static stereo SVGs. The browser regression requires zero initial Mastering Worker audio requests. Preserve this change during release; the live production site may still run the older behavior until approved deployment.
- Mixing and normal Formats playback still use `audio.src` replacement and approximate seek. The Formats draft additionally offers a **user-clicked, explicitly prepared** synchronized Web Audio comparison; never prepare it at page load. Shared ABX uses its own cache and media element. Normal player Range requests, retries and switches may invoke the audio Worker.
- The four approved MP3s in Formats are static Pages assets and therefore do **not** invoke the FLAC audio Worker. Preserve the existing deliberate media split unless a full throughput, deployment and delivery review justifies a change.

## Playback policy for all future labs

1. **Zero media Worker requests at idle:** The target for a visitor simply opening a lab page is zero FLAC audio requests. Serve preview waveforms as precomputed, small, static SVG/JSON/PNG assets in Pages, rather than fetching full FLAC files to draw them. Existing Mastering is an exception that must be fixed, not a pattern to replicate.
2. **User-initiated loading:** Load the selected recording when Play or an explicit listening action occurs. After playback begins, prepare at most **one other variant at a time**, only within the active test. Cancel lower-priority warm-up work if playback stalls, network is slow, the user switches experiments, or the page becomes hidden.
3. **Bounded prefetch:** Start with at most **one alternate clip** per active experiment (two total clips in memory including current), unless a benchmark proves a higher bound is worthwhile on mobile connections. No entire-site or cross-lab prefetch; no downloading all 8 Mastering FLACs for one play. Cap in-memory bytes and release unused buffers.
4. **Avoid repeated requests:** Reuse a prepared buffer or browser cache when the same recording is selected again; deduplicate in-flight fetches. Preserve source revisions in immutable filenames or hashed manifests so long-lived caches do not serve outdated audio. Be aware that HTTP media Range caching can vary by browser; don't infer a cache hit from a `Cache-Control` header.
5. **Worker execution minimization:** Prefer direct static asset delivery when the published asset is suitable and safely deployable, otherwise investigate a cacheable asset endpoint / storage option whose responses do **not** invoke a Worker on each cache hit. Cloudflare Cache API *inside* a Worker may reduce KV reads, but cannot eliminate the initial Worker invocation. Do not add another Worker per audio clip or extra telemetry requests.
6. **Keep audio quality and fairness:** No automatic lossy re-encoding for a lossless reference just to optimize cost. For ABX, A, B and X need equivalent preparation and no trivial seek/cache timing cues. Distinguish educational Training (unscored) from Challenge/Advanced (currently release-locked).
7. **Progressive enhancement:** Slow or capped networks should still have explicit Play and manual switching with honest loading status. Do not force a large background download for users who only want to read the lesson.
8. **No visitor tracking for optimization:** Measure aggregate Worker request/bytes/errors via Cloudflare observability and reproducible browser tests. Do not add per-person analytics, cookies or browser fingerprinting to budget the free tier.

## Scored ABX has a particularly large request multiplier

The staged `/v1/audio/:session/:round/:token/:slot` proxy sends *each* A, B and X playback request through a Worker and D1 session lookup. A 20-trial Advanced test with **only one request for each of A, B and X per trial** already needs at least **60 audio Worker invocations**, plus **20 answers and 1 start**, or **81+ Worker requests per completed test**. Browser Range requests, retries, switching and the optional results call increase that figure. At 1,000 completed Advanced sessions, that baseline alone is 81,000 Worker requests, before any other site traffic. This is a *lower bound*, not a forecast.

**Release block:** No scored ABX rollout until the delivery design demonstrates an acceptable per-completed-session Worker/KV/D1 budget, with stress tests for repeated switching and real browser Range patterns. Hiding answer keys and serving public audio cheaply must be balanced against source inspection risk: a browser-based unsupervised test cannot be made completely cheat-proof.

## Required measurements, implementation and release review

- Record for each comparison: cold first-play latency, warm first-play latency, P50/P95 switch latency, rebuffer count, HTTP request count, Worker executions, KV reads, total transferred bytes, cache hit rate, browser peak memory and mobile data usage.
- Test 3G/slow 4G, Wi-Fi, desktop/mobile, back-and-forth switching, quick tab changes, seek/restart, and repeat site visits. Separate Worker traffic from free Pages-static requests.
- Benchmark the proposed shared engine against current Mastering (all three modes), Mixing and Formats before replacing the existing players; treat the first Mastering mode's eager waveforms as an uncontrolled advantage.
- Use Cloudflare Workers & Pages **Observability/Analytics** to see actual request trends. Monitor both Worker invocations and KV operations. Establish conservative internal alert thresholds **below** the account-wide 100k/day limits, with capacity reserved for other site Workers and score APIs.
- Reject a change if it improves average switching time while meaningfully increasing unrequested downloads, cost per listening session or error rates. Any larger audio-host redesign needs a separate bandwidth/storage and rights review.
- Existing GitHub automated checks do not currently benchmark actual Worker/KV usage. Add an explicit playback-budget regression/measurement phase before permitting production release.

## Repeated ABX listening: request caps, local cache and fairness

ABX must be designed around **repeated A/B/X listening**, not one playback of each file. In a well-run test the visitor may switch dozens of times per trial. We must not incur a new Cloudflare Worker invocation for each press.

### Draft implementation target, not yet implemented or benchmarked

| Test | Network fetch goal per fresh comparison/session | What can be replayed without network |
| --- | --- | --- |
| Training | At most one full fetch per **unique source recording** (two per comparison); X is a local alias of A or B | A, B, X for the whole practice block |
| Scored Challenge (10 trials) | Two reference fetches for the session + at most one *fresh* opaque X fetch per trial: **12 audio fetches** | A and B throughout session; X within its own trial |
| Scored Advanced (20 trials) | Two reference fetches + one X per trial: **22 audio fetches** | A and B throughout session; X within its own trial |

These are **engineering targets, not actual measured Worker usage**. They assume stable A/B identity for the session, one full successful HTTP request per asset, and successful in-browser blob/buffer reuse with no extra Range requests. The scored endpoint currently issues separate per-round A/B/X URLs; client-side caching must make reference reuse explicit. Source files must remain versioned.

Under those ideal assumptions, an Advanced session uses **22 audio Worker requests + 20 answer requests + 1 start request = 43 Worker invocations**. Compared with the **81-request** uncached minimum, that cuts the idealized floor by about 47%. It is still not free, and real use could require more. Keep the 81+ number above as the *existing uncached path* baseline, not the optimized target.

### Cache design and guardrails

1. Use a small **per-comparison, per-session browser cache** of loaded audio (e.g. Blob/Object URL cache where supported), keyed by versioned test and reference identity; not a second Cloudflare storage service. HTTP cache headers alone are insufficient because browser media playback may send repeated Range requests.
2. Preserve a single active decoded/playback path and bounded memory. A 40-second 44.1 kHz stereo uncompressed float32 buffer takes roughly **14.1 MB**; three decoded copies would need **42.3 MB** before other browser overhead. Prefer caching compressed media blobs and decoding only the audio actively playing if this proves reliable on target browsers.
3. De-duplicate in-flight requests; never fire duplicate downloads for multiple simultaneous button presses. Explicitly revoke old Object URLs and release cached items when test selection changes, a session finishes, or the page is unloaded. Do not persist scored asset data or session secrets in shared or persistent caches.
4. **Do not preload on page visit.** Begin only after the user starts a comparison. For scored tests, prepare A, B and X to equivalent ready states before enabling the trial. Later trials prepare just the next opaque X while retaining the same two references. The UI must not let the timing of an X fetch disclose the answer.
5. An ABX Training interface **may** map X to locally cached A/B, because its score is not public; that mapping must **never** be done by the scored client. For scored tests, obtain X only from a protected server endpoint and do not expose an answer-key variable. Even so, a sufficiently determined visitor can compare downloaded content, and the feature is not cheat-proof.
6. Validate the initial-play trade-off. Downloading a full FLAC before first play could make repeat switching fast but worsen time-to-first-audio on a slow phone. Benchmark a bounded progressive-start strategy against Blob caching before choosing the shared implementation. No speculative eager full-file downloads.
7. **Regression threshold:** run a synthetic 20-trial session with 100+ random A/B/X plays, measure actual Worker invocations and KV reads, and confirm network usage stays nearly constant as replay presses increase. Test quick switching, aborted preloads, Wi-Fi/mobile, Range responses, source version changes, interrupted network, tab backgrounding, and memory cleanup. A test that hits the audio Worker for each replay fails the release gate.
8. Cache misses or memory pressure must degrade gracefully to ordinary streaming, with an honest performance note. The hard requirement is safe and fair playback, followed by bounded resource usage, not disguising loading errors.

**Do not enable Challenge/Advanced merely because the request-count target passes.** Fairness, source side-channel audits, privacy and statistical limitations remain separate release gates.

## Consistent, actionable track labels (November 17, 2026 draft)

The entire Listening Labs UI uses exactly **Offline**, **Please wait**, and **Ready** for track readiness. No "Online", "Available online", "Playing", "Buffering", "Loaded" or other pseudo-readiness statuses on track cards. Initially hide idle track statuses: possessing an audio URL is not evidence of buffered audio or rapid switching.

- **Please wait** appears when a user has requested listening/preparation but the selected media is not sufficiently buffered, has stalled, or an alternate full-file prefetch has not completed.
- **Ready** requires an actively playable buffered segment (at least approximately 4 seconds ahead, adapting near the end) or a complete locally reusable audio object. A URL and metadata-only load never qualify.
- **Offline** requires absence of a usable source or a confirmed media load/decode failure. Avoid treating a minor buffering delay as Offline.
- Only one alternate in an active sighted experiment may be prefetched, **after** user playback begins and the active track is sufficiently buffered; prefetch uses a bounded in-memory cache and does not automatically retry failed downloads on every progress event.
- On normal labs, a Ready label on another row means the bytes are held locally, not simply that a remote URL exists. Network/browser failures can still cause playback errors, so do not claim zero-stutter guarantees.
- **ABX:** never show per-A/B/X status labels or timed readiness hints identifying which candidate takes longer. Training has one group-level readiness gate after both source files have finished downloading, and replay is entirely local. Scored-mode timing indicators remain hidden, and scored testing is blocked pending source and timing side-channel review.
- Only one media player on a lab page owns audio focus. Starting ABX preparation pauses the main lesson player, and starting the lesson playback pauses ABX; avoid needless simultaneous streams.

## Optional synchronized Formats mode staged, pending real-device confirmation

- The default native player still fetches only on Play. Only an explicit **Prepare instant switching** tap fetches all three recordings of the chosen short song. This is a conscious exception to the one-alternate speculative prefetch limit, not permission to fetch entire labs.
- Its bounded engine rejects preparations above **14 MiB total source bytes** or **48 MiB decoded stereo PCM** and aborts when the visitor changes songs. Browser memory overhead can exceed these theoretical buffer figures.
- After a successful prepare, all three sources run on one audio clock; changing gain does not create another Worker request. The UI switches to one group-level Ready state. FLAC CORS/decoder/network failures fall back to normal streaming, rather than breaking the basic lab.
- Browser smoke and engine tests have been added; confirm results and physically listen for discontinuities before approving the feature. Real Cloudflare Analytics/KV usage, mobile RAM and cellular data consumption must be checked separately. No paid services or default eager loads.
