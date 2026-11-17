# The Sound Question — Cloudflare Free-plan release budget

**Prepared November 17, 2026.** This is an engineering estimate, **not an account-usage measurement**. Production release is manual only.

## Official published limits (November 2026)

- Workers Free: **100,000 inbound Worker/Pages Function requests per UTC day**, shared across Workers and Pages Functions. A static Pages asset without Functions does not consume that allowance.
- D1 Workers Free: **5 million rows read/day**, **100,000 rows written/day**, **5 GB total stored**, up to ten D1 databases. D1 free-tier row limits have been enforced since September 2026.
- Official references: Cloudflare Workers pricing, https://developers.cloudflare.com/workers/platform/pricing/ ; Cloudflare Pages Functions pricing, https://developers.cloudflare.com/pages/functions/pricing/ ; D1 pricing, https://developers.cloudflare.com/d1/platform/pricing/ .
- Service Binding calls from one Worker to another **do not incur additional request fees only when using Workers Standard pricing**. This is a documented distinction; verify the account usage model before treating the internal AUDIO_SERVICE binding as free of a second incoming request. The backend retains a public-fetch fallback.
- Worker rate limiting is approximate and per Cloudflare location. These limits deter spam but do not absolutely prevent abuse from many locations or identities.

## Cost of a **completed 20-round Advanced ABX session**, one listener

| Request source | Typical number | Why |
| --- | ---: | --- |
| Start scored API | 1 | Create anonymous session with D1 row |
| Answer scored API | 20 | One submission per trial, including D1 atomic updates |
| Protected audio fetches | 22 | Two reference recordings once plus one X for each of 20 rounds |
| Optional stats lookup | 0–1 | On request, not automatically for every trial |
| **ABX Worker inbound requests** | **43–44** | Before retries, additional audio Range requests, or refreshes |
| Potential upstream audio Worker invocation | **0–22** | Depends on formats (MP3 static Pages), Service Binding usage model and whether a public fallback is needed |
| **Budget range for this ideal session** | **~43–66 Worker invocations** | Upper figure includes optional stats + 22 potentially billable upstream calls |

**Important caveat:** This is a request-count model, not a guarantee. An unfinished session uses fewer requests; retries, Range seeks, unsupported codecs, restarts, abuse and network instability increase counts. Audio source lengths vary. Browser-local Blob playback uses **no Worker request per A/B/X click** after the trial has been prepared.

| Completed Advanced sessions/day | Estimated ABX-related requests/day | Interpretation |
| ---: | ---: | --- |
| 100 | 4,300–6,600 | About 4–7% of the Workers Free daily request allotment, **before any other site traffic** |
| 500 | 21,500–33,000 | About 22–33% before baseline audio Workers and other activities |
| 1,000 | 43,000–66,000 | Significant risk of exhausting the shared limit with existing audio visitors or retries |

The existing audio Worker serves Mixing, Mastering and Formats independently; its traffic must be accounted for, not counted as 'free' by default. The new community D1 board also uses the same account, but requests are limited and approved entries are fetched in small paginated batches after scroll.

## Protections already present in the **draft**

1. Source-measured Mastering SVG waveforms are static and generate **zero FLAC requests** on page view, verified in desktop and mobile-emulated browser tests.
2. Formats does not request audio until Play; choosing songs or formats before Play also makes **zero audio requests**, verified in both browser modes.
3. Ordinary Labs prefetch a maximum of one alternate once playback is underway and buffered, and suppress optional preloading on Data Saver or very slow networks.
4. Training downloads each of the two reference files once and aliases X locally. Repeated switching has **zero additional Worker requests**.
5. Scored ABX caches the two references for the whole session and each new X for its round only. The cache is bounded to 3 files and approximately 25 MiB/client session.
6. The scored audio route has its own rate limiter. All scored API requests are limited; starts have a tighter limiter. Anonymous submissions have another tight limiter and must be approved before display.
7. The free-tier D1 database is already initialized. No new billable service, paid tier or database is necessary.
8. The Worker is **still disabled and not deployed**. Its release flags, rate limiter and D1 binding must be verified in the actual Cloudflare account.

## Release gates

- [ ] Check **Workers & Pages > Analytics** for recent real request counts, especially peak days on the existing \`tsq-lab-audio\` Worker, and record account-wide traffic before enabling ABX.
- [ ] Check **D1 > tsq-abx-scores > Metrics** for row reads/writes and storage. The schema was initialized, but production query volume has not been measured.
- [ ] Manually deploy the Worker with all public feature flags OFF, configure its secrets and bindings, then enable scoring/community deliberately in the approved release. Do **not** deploy a public scored UI before the API is healthy.
- [ ] Verify full 10-round and 20-round sessions against live D1 with non-shared test scores, including resume after one X preparation failure, repeat attempts, moderation approval/rejection and expiry.
- [ ] Test Android real device playback on Wi-Fi and cellular/Data Saver, then review Worker counts and D1 metrics.
- [ ] If the Worker approaches free-tier limits, disable optional community/scoring features while preserving ordinary lessons and the Listening Room's curated content. Never force a paid upgrade as the default response.

**This is a fun community listening game, not an audibility study.** The privacy notice and public explanation must not describe unverified community results as scientific measurements.
