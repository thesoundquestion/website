# Manual ABX Worker release runbook — Cloudflare Free plan

Public site: https://thesoundquestion.com/ (Cloudflare Pages custom domain active; HTML meta/URL edits staged in PR #15)
Worker endpoint: https://tsq-abx.thesoundquestion.workers.dev
D1 database: tsq-abx-scores (cbc80c8b-457e-496a-be9b-621d99f1cfd3), shared by ABX and moderated community entries
Status (2026-11-17 Atlantic): **Public scoring, moderated community submissions and gear nominations are operational in Cloudflare.** All three feature flags and private moderation alerts are `true`. ABX_SECRET and MODERATION_READ_SECRET are separate registered Worker secrets. D1, ratelimits, audio Service Binding and a daily `17 4 * * *` UTC purge cron are installed. The [external live Worker acceptance run](https://github.com/thesoundquestion/website/actions/runs/44220509527) passed health, CORS/privacy, pending-only community and gear submissions, duplicate rejection, signed audio Range, 10-round ABX start/resume/answers, withheld interim scores and stats. All isolated test D1 rows removed. Scored Mastering EQ remains deliberately disabled: local synchronized EQ playback was approved, but the separate scored native switching path has not been checked for answer-correlated cues. **The new Pages HTML remains in draft PR #15 and has not been deployed or merged.** See `docs/WORKER_PUBLIC_RELEASE_2026-11-17.md` for full details.

## Before launch

1. Review PR #15 and require the Node regression and Chrome desktop/mobile playback workflows to pass. Ensure the Pages output includes /labs/abx/, /assets/abx-lab.js, /assets/abx-lab.css, /assets/lab-readiness.js, homepage sharing code, and updated privacy/contact pages. Never publish workers/abx, docs, tests, private audio or secrets in Pages.
2. Confirm Cloudflare Workers and D1 are on a free tier with daily headroom. Current quota budget must consider both the ABX Worker and public FLAC audio Worker requests. Target ≤65 Worker invocations for an ideal 20-trial Advanced session, plus retries and Range reads.
3. **Initial and public Worker deployments complete.** Future Worker code updates must still be manually deployed; draft GitHub commits alone do not update the Cloudflare Worker. All four service flags currently are `true`, and each may be disabled independently during an incident.
4. **ABX_SECRET installed** as a 96-character cryptographic secret in Cloudflare, separate from the moderation key. Never print it, commit it or share it in chat. Rotation invalidates active sessions.
5. **Closed preflight and open live-smoke completed.** The API health returns ready and live D1 scoring was tested; all bindings and the retention cron confirmed. Manual browser/audio fairness and post-release quotas remain.
6. **Live API checked:** a private-consent 10-trial session completed, true ABX answer/recovery/audio and suppression tested. Expiry and actual opt-in publishing still require post-release validation. Test session and pending posts were deleted from D1.
7. Only when the Worker is healthy, manually merge the Pages changes and trigger one approved Pages deployment. Verify /labs/abx/, per-test overview links, homepage contact and share controls, all three original lessons, Google sitemap, privacy notice and the new API connection.
8. Confirm account-wide Worker + KV + D1 usage and errors after release. Monitor free-tier quota margins. On a problem, switch ABX_PUBLIC_ENABLED back to false or roll back the Worker while leaving sighted lessons functioning.

## Failure and fairness expectations

This is a fun social listening experiment, not a controlled scientific hearing test. Determined users can compare audio files or inspect metadata and network traffic; no client-side browser test can fully eliminate these clues. Keep clear disclaimer copy and no individual ranking.

The scored comparison allowlist currently includes **four MP3 comparisons** (128/320 kbps for Light and Diva); **mastering EQ stays private practice** pending scored-switching fairness validation. Intentionally unequal-loudness examples are excluded. Future changes to a source/master require a versioned test ID and a newly grouped community aggregate.

Rate-limit and anonymous-scores rules must remain active before opening the service; opt-in is off by default. **Daily retention cron is installed**, but its first scheduled purge and usage should still be observed. Store no personal email or user-uploaded audio with scores.

## Internal FLAC service binding

The Worker configuration now binds AUDIO_SERVICE to the existing tsq-lab-audio Worker. On a supported Standard usage model, internal Worker-to-Worker Service Binding fetches can avoid additional incoming Worker request charges. Confirm this on the actual Cloudflare Free account rather than treating it as a guaranteed free-tier discount. Keep direct-fetch fallback only for environments without this binding; monitor upstream Worker activity and database reads. Each A/B/X button press after local preparation should still produce **zero** new Worker requests.

## Moderated community launch (same Worker, no extra database)

- `COMMUNITY_PUBLIC_ENABLED=true`. The live community API was tested on D1, including an anonymously submitted pending comment that was not returned as approved, and the isolated test row was deleted. Actual moderation remains manual, and Pages forms still await publication.
- The **community_posts** table and its indexes were added to the existing D1 database on November 17, 2026 using `workers/abx/community-schema.sql`. There are no users, accounts, emails or IP columns.
- Public interface: `/library/curators-listening-room/#community-listening-room` for track nominations and short comments, and `/labs/abx/#community-abx` for ABX comments. The browser loads the latest approved entries only after scrolling to the section. No third-party comment widget is used.
- API: `GET /v1/community/approved?section=room&kind=suggestion&category=&offset=0` returns at most 10 moderated entries; `POST /v1/community/submit` accepts one entry (artist/title/category/280-character explanation for songs; 280-character comment for discussion). The submission endpoint returns a receipt reference and `pending` status, not a live public entry.
- **Moderation is required**. Before turning `COMMUNITY_PUBLIC_ENABLED` on, read `workers/abx/COMMUNITY-REVIEW.md`, test that pending entries never appear, review HTML/text safety, and inspect the dashboard for submission spikes. The API has a per-IP/location limiter, a hidden honeypot, short fields and no arbitrary user links.
- Update the privacy notice to describe manual review, storage and retention. Pending entries purge after 90 days; rejected after 30 days. Approved posts persist until editorial removal or a contributor's emailed request using the receipt ID.
- Keep `COMMUNITY_PUBLIC_ENABLED` independent of ABX scoring so one feature can be disabled without hiding the other. Both are disabled in the checked-in Wrangler file.

**Release sequence:** disabled Worker deploy completed; run live server tests, enable community, gear and/or ABX only after verifying the real API and privacy notice, then manually release Pages once. The free plan must remain sufficient.

## Gmail organization and triage

The connected `thesoundquestion@gmail.com` inbox now has TSQ project labels for moderation, needs-reply/waiting-on-reply, content permissions (confirmed and restricted separately), ideas, Listening Room, creators, SEO and hosting. Existing conversations and historic GitHub workflow failures have been labeled. A daily ChatGPT inbox triage task is scheduled (America/Halifax, approximately 8 a.m.) to categorize new mail and highlight urgent correspondence. The user reports completing the native Gmail filter installer; installer and guide are saved in `ops/gmail/`. The separate moderation digest Google Apps Script has been copied into a new project, and the user reports both protected Script Properties are configured. The Worker secret and private-alert flag are set. The next step is to run `sendPendingReviewDigest` manually, then `installDailyPendingDigest` once; end-to-end verification is pending. Native label rules do not grant permissions, approve D1 comments, or archive messages automatically.
