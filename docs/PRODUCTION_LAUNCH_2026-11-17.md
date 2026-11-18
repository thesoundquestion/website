# The Sound Question — Public launch record

**Launch date:** November 17, 2026 in Nova Scotia (November 18 UTC)  
**Public website:** https://thesoundquestion.com/  
**GitHub release:** PR #15 merged into `main` as `4ba273ebfdde88164dcb153fc0a68df31a73fb12`  
**Cloudflare Pages production deployment:** `f70bbc13-f2c8-417f-be12-73bfe74c3afb`  
**Immutable deployment URL:** https://f70bbc13.thesoundquestion.pages.dev/  
**Full public smoke:** https://github.com/thesoundquestion/website/actions/runs/44223261377 — **success**  
**Previous API smoke:** https://github.com/thesoundquestion/website/actions/runs/44220509527 — **success**  
**Release CI:** Site regression and Listening Labs browser playback/ABX both passed on the merge candidate.

## Verified live and operational

- The `.com` custom domain, hostname verification and certificate are active; Cloudflare Pages cloned, built (`node scripts/build-public-site.mjs`) and deployed the approved merge successfully. The custom-domain alias points to the approved production deployment.
- Read-only external public smoke verified HTTP 200, HTTPS and correct `.com` canonical links on home, ABX, gear recommendations, Contact, Privacy, Tools, Listening Room and Lesson 9 amplifier classes.
- ABX/gear/community JavaScript assets served; gear form HTML has `data-submissions-enabled="true"`; scored ABX copy is published. The ABX Worker health reports **ready** with community enabled.
- Live sitemap has **48 unique `.com` URLs**; robots.txt references the new sitemap. Updated 59-page illustrated handbook served as PDF with exact **12,018,958-byte** approved size. Its 47 former `pages.dev` links and last-page printed address had been migrated before launch.
- Cloudflare old production `thesoundquestion.pages.dev` 301 redirects and `www.thesoundquestion.com` 301 redirect preserve paths and query strings; tested old homepage and deep links plus a www query-string example. Preview deployment subdomains are not captured.
- Cloudflare zone **Email Address Obfuscation remains on**. Edge HTML replaces visible `contact@thesoundquestion.com` addresses and mailto URLs with `/cdn-cgi/l/email-protection` markup, decoded for ordinary JS browsers. The source and direct deployment contain the real contact address. External smoke recognizes this as intentional anti-harvesting protection, not missing email. Free Email Routing continues to forward `contact@thesoundquestion.com` to existing `thesoundquestion@gmail.com`; outgoing mail is unchanged.
- Public Worker flags: `ABX_PUBLIC_ENABLED=true`, `COMMUNITY_PUBLIC_ENABLED=true`, `GEAR_SUBMISSIONS_ENABLED=true`, `MODERATION_ALERTS_ENABLED=true`. Each API validated with a real Cloudflare D1 transaction before Pages release; smoke records removed. HMAC and moderation keys are stored privately; daily D1 cleanup cron `17 4 * * *` UTC installed. No public API exposes pending community or gear records.
- **Mastering EQ Challenge remains private on-device practice**, not server-scored, because the server-scored audio switching implementation is distinct from the user's locally approved synchronized EQ ABX. Four curated MP3 comparisons can be server-scored with separate opt-in public statistics.

## Deployment policy and immediate follow-ups

- **Cloudflare Pages GitHub automatic deployments were disabled again immediately after success**, including production and preview. Later repository handoff/test commits do not trigger Pages builds. Future website edits require a deliberate manual release/deploy.
- Human physical-mobile listening/scored-ABX switching, accessible keyboard/screen-reader interaction and full editorial/permissions review have not been independently certified by this HTTP smoke. Track fixes normally if visitors report them.
- Google Search Console should use the new `.com` domain property: verify access, submit `https://thesoundquestion.com/sitemap.xml`, inspect Google-selected canonicals and monitor old-to-new redirects. The live sitemap is now ready for submission.
- **Private moderation digest trigger** means the optional Google Apps Script scheduled daily email of pending submission counts. It is *not* the moderation system or a site launch gate. Its Apps Script trigger was not independently verified; public submissions still save to D1 and can be reviewed manually without it.
- Monitor usage on `tsq-abx` and `tsq-lab-audio` Workers, Cloudflare D1, R2/KV if applicable, and error logs. Individual flags can disable ABX scoring, community intake or gear suggestions independently without unpublishing the educational site.
- Use `docs/WORKER_PUBLIC_RELEASE_2026-11-17.md` and `workers/abx/RELEASE.md` for API acceptance/rollback, `workers/abx/COMMUNITY-REVIEW.md` and `docs/GEAR_SUGGESTION_REVIEW_2026-11-17.md` for curation, and this record for current site-release status.
