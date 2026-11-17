# Manual ABX Worker release runbook — Cloudflare Free plan

Public site: https://thesoundquestion.pages.dev/
Worker endpoint: https://tsq-abx.thesoundquestion.workers.dev
D1 database: tsq-abx-scores (cbc80c8b-457e-496a-be9b-621d99f1cfd3), shared by ABX and moderated community entries
Status: database created and schema initialized, **Worker not deployed**, config disabled until next coordinated release. No Cloudflare Pages deployment has occurred.

## Before launch

1. Review PR #15 and require the Node regression and Chrome desktop/mobile playback workflows to pass. Ensure the Pages output includes /labs/abx/, /assets/abx-lab.js, /assets/abx-lab.css, /assets/lab-readiness.js, homepage sharing code, and updated privacy/contact pages. Never publish workers/abx, docs, tests, private audio or secrets in Pages.
2. Confirm Cloudflare Workers and D1 are on a free tier with daily headroom. Current quota budget must consider both the ABX Worker and public FLAC audio Worker requests. Target ≤65 Worker invocations for an ideal 20-trial Advanced session, plus retries and Range reads.
3. From the workers/abx directory, deploy the Worker with ABX_PUBLIC_ENABLED=false in wrangler.toml first. Use a recent supported Wrangler release and confirm its bindings are accepted. This is a **manual Worker deploy**, not an automatic Pages build.
4. Generate an unpredictable secret of at least 32 characters securely and set it with Wrangler secret put ABX_SECRET. Do not print the secret to the repository, commit it, or share it in a chat. Secret rotation invalidates active sessions.
5. Check /v1/health shows scoring disabled, and a scored start returns an expected error while disabled. Confirm the D1 binding, all three rate-limit bindings (API, session starts and audio) and daily cleanup cron are available.
6. In the approved release branch, change ABX_PUBLIC_ENABLED to true and deploy the Worker intentionally. Check /v1/health reports enabled, then test the actual API using a controlled 10-trial session, including retries, recovery, expiry, correct end-of-session disclosure, optional score sharing, and results suppression under 10 sessions. Keep test scores private so they do not contaminate public aggregates.
7. Only when the Worker is healthy, manually merge the Pages changes and trigger one approved Pages deployment. Verify /labs/abx/, per-test overview links, homepage contact and share controls, all three original lessons, Google sitemap, privacy notice and the new API connection.
8. Confirm account-wide Worker + KV + D1 usage and errors after release. Monitor free-tier quota margins. On a problem, switch ABX_PUBLIC_ENABLED back to false or roll back the Worker while leaving sighted lessons functioning.

## Failure and fairness expectations

This is a fun social listening experiment, not a controlled scientific hearing test. Determined users can compare audio files or inspect metadata and network traffic; no client-side browser test can fully eliminate these clues. Keep clear disclaimer copy and no individual ranking.

The scored comparison allowlist contains only published EQ and MP3 comparisons; intentional loudness-progression examples are excluded. Future changes to a source/master require a versioned test ID and a newly grouped community aggregate.

Rate-limit and anonymous-scores rules must remain active before opening the service; opt-in is off by default. D1 retention cron runs daily when deployed. Store no personal email or user-uploaded audio with scores.

## Internal FLAC service binding

The Worker configuration now binds AUDIO_SERVICE to the existing tsq-lab-audio Worker. On a supported Standard usage model, internal Worker-to-Worker Service Binding fetches can avoid additional incoming Worker request charges. Confirm this on the actual Cloudflare Free account rather than treating it as a guaranteed free-tier discount. Keep direct-fetch fallback only for environments without this binding; monitor upstream Worker activity and database reads. Each A/B/X button press after local preparation should still produce **zero** new Worker requests.

## Moderated community launch (same Worker, no extra database)

- The separate `COMMUNITY_PUBLIC_ENABLED=false` flag keeps comments and nominations closed until deliberately opened. No secret is required to display already approved entries, but real D1 and both rate-limit bindings are mandatory. The public Worker still requires manual deployment; do not enable submissions on Pages before the Worker supports them.
- The **community_posts** table and its indexes were added to the existing D1 database on November 17, 2026 using `workers/abx/community-schema.sql`. There are no users, accounts, emails or IP columns.
- Public interface: `/library/curators-listening-room/#community-listening-room` for track nominations and short comments, and `/labs/abx/#community-abx` for ABX comments. The browser loads the latest approved entries only after scrolling to the section. No third-party comment widget is used.
- API: `GET /v1/community/approved?section=room&kind=suggestion&category=&offset=0` returns at most 10 moderated entries; `POST /v1/community/submit` accepts one entry (artist/title/category/280-character explanation for songs; 280-character comment for discussion). The submission endpoint returns a receipt reference and `pending` status, not a live public entry.
- **Moderation is required**. Before turning `COMMUNITY_PUBLIC_ENABLED` on, read `workers/abx/COMMUNITY-REVIEW.md`, test that pending entries never appear, review HTML/text safety, and inspect the dashboard for submission spikes. The API has a per-IP/location limiter, a hidden honeypot, short fields and no arbitrary user links.
- Update the privacy notice to describe manual review, storage and retention. Pending entries purge after 90 days; rejected after 30 days. Approved posts persist until editorial removal or a contributor's emailed request using the receipt ID.
- Keep `COMMUNITY_PUBLIC_ENABLED` independent of ABX scoring so one feature can be disabled without hiding the other. Both are disabled in the checked-in Wrangler file.

**Release sequence:** deploy Worker with both flags off, run server tests, enable community and/or ABX only after verifying the real API and privacy notice, then manually release Pages once. The free plan must remain sufficient.
