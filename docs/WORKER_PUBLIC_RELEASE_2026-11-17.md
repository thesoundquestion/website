# TSQ public Worker feature release — November 17, 2026 (Atlantic)

**Owner direction:** Public ABX scoring, moderated community suggestions/comments and equipment recommendations may go live. Cloudflare Worker API was activated and tested on November 17 Atlantic / November 18 UTC. This does **not** merge draft PR #15, deploy its updated Pages HTML, or waive final editorial and physical-device review.

## Live Cloudflare state

- Account script: `tsq-abx`, public endpoint `https://tsq-abx.thesoundquestion.workers.dev`.
- `ABX_PUBLIC_ENABLED=true`, `COMMUNITY_PUBLIC_ENABLED=true`, `GEAR_SUBMISSIONS_ENABLED=true`, `MODERATION_ALERTS_ENABLED=true`, all re-read from Cloudflare API after change.
- `ABX_SECRET`: distinct 96-character cryptographically generated value, stored as **secret_text**, never published or committed. Existing private `MODERATION_READ_SECRET` retained and private endpoint inaccessible without the key.
- D1 `tsq-abx-scores`: original `abx_sessions`, `community_posts`, `gear_suggestions` tables and all indexes checked. Three per-IP/location rate-limit bindings remain present. Internal `AUDIO_SERVICE` binding remains present.
- Cron `17 4 * * *` UTC installed and verified by API, runs deletion of expired ABX sessions, pending/rejected community posts and gear nominations. Cron **schedule presence** verified; future first execution and retention effects still need observing.
- Corrected Worker source for custom `.com` origin deployed before flags were enabled. **Mastering EQ is intentionally excluded from public scored allowlist**, because only its local synchronized playback has passed the answer-cue listening tests. EQ Training and Challenge are **private practice**; eligible MP3 tests can be server scored. Default local/preview host stays private practice. No intentionally unmatched-loudness comparison is scored.

## Live external acceptance evidence

- Preflight in closed state: [run 44220306216](https://github.com/thesoundquestion/website/actions/runs/44220306216), **passed**.
- First enabled production API full smoke: [run 44220509527](https://github.com/thesoundquestion/website/actions/runs/44220509527), **passed**. GitHub-hosted runner used curl-compatible User-Agent because Cloudflare's edge rejected the Python-urllib default User-Agent. This was not a failure of the Worker service.
- Health HTTP 200, with scoring ready; protected moderation endpoint returns HTTP 404 without key; `.com` CORS preflight HTTP 204, `pages.dev` origin denied HTTP 403.
- Community approved GET HTTP 200; consent error HTTP 400; valid test comment HTTP 202/pending; that pending text **did not appear in public listing**.
- Gear invalid request HTTP 400, valid recommendation HTTP 202/pending, identical duplicate HTTP 409.
- Scored EQ challenge rejected HTTP 409 by deliberate fairness gate.
- ABX `/v1/start` HTTP 200; `/v1/resume` HTTP 200; signed audio Range HTTP 206 with **128 bytes** and canonical CORS; 10 atomic answer requests HTTP 200. Interim responses excluded score, completion reported score, with `share=false`. Stats minimum aggregation threshold of 10 confirmed.
- The test's one community comment, one equipment nomination and one private completed ABX session were verified by exact IDs and immediately deleted using the Cloudflare D1 admin API. Verified zero matching rows. Subsequent D1 totals: **0 pending community, 0 pending gear, 0 shared completed sessions**.
- GitHub site regression and Chrome desktop/mobile-emulated Listening Lab playback smoke passed at commit `126424f0c0980de6c630fb19c53093e87df7bfd9`. Re-run on later commits.

## Remaining publication and support tasks

- **Pages HTML still uses the previous production deployment:** current `.com` domain is online, but unpublished draft `/labs/abx/`, `/tools/recommend-gear/`, community JS, public mailtos, canonical metadata and 59-page updated PDF require the deliberate PR #15 Pages release. Do not imply the visitor-facing features are discoverable until then.
- When Pages draft is released, manually smoke-test scored browser UX (including the audio switching behavior), gear form enabled state, community forms, approved-only displays, mobile and keyboard support, privacy and attribution links. **Do not treat API-level smoke as human playback acceptance.**
- Site editorial and rights/privacy owner sign-off remain open. The existing Gmail backend is unchanged. A Google Apps Script private moderation digest was prepared by the owner, but its scheduled trigger has not been independently verified as enabled. This is admin follow-up, not a reason to expose unreviewed posts.
- Monitor Worker/D1 quotas and errors after site launch. At observed quota distress or submission abuse, set the appropriate `ABX_PUBLIC_ENABLED`, `COMMUNITY_PUBLIC_ENABLED` or `GEAR_SUBMISSIONS_ENABLED` flag to `false` independently; do not delete the D1 database. Existing moderation counts can stay on.
- Live endpoint smoke workflow is **manual dispatch only after its initial acceptance** to avoid repeatedly creating fake D1 records on ordinary pushes. Any future manual smoke must delete its `TSQSMOKE-` test rows as in this report. No secrets in CI.
