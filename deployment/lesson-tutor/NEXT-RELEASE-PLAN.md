# Ask TSQ AI search: next-release gate (staged, not live)

Updated 2026-11-17. Feature branch: `feature/ask-tsq-free-ai-next-release-20261117`.

## Scope

The public Decoder already has a **23-lesson prepared-answer tutor**, local matching, graph-aware prompts and links. This feature is not unrestricted web search or a general-purpose chatbot. The optional server inference only answers unanswered questions about the current lesson and its approved examples. Prepared answers remain free and work even if AI is disabled.

## Code prepared on this branch

- `functions/api/lesson-tutor.js` installs the existing reviewed tutor handler as a Cloudflare Pages Function.
- `_routes.json` allows Functions only on `/api/lesson-tutor`; other site files stay on static Pages delivery.
- The production build copies `_routes.json` into `site-dist` and refuses a routing file that invokes Functions outside that path.
- `assets/lesson-tutor/config.js` deliberately remains `AI_ENABLED = false`. The public interface must not offer live inference until setup, live checks and a privacy-notice update are complete.

## Verified service information, not account authorization

Cloudflare docs checked 2026-11-17: Workers AI on **Workers Free** offers **10,000 Neurons/day across the account**, resets at 00:00 UTC, and stops rather than billing past the free allocation. The preselected `@cf/google/gemma-4-26b-a4b-it` model is supported on the Free plan. Limits/rates/model availability can change; check again before activation. Pages Functions consume Workers requests and a matching D1 quota is required.

The updated backend imposes **40 AI reservations/day maximum**, **82 estimated neurons/reservation**, and a **3,280-neuron local daily reservation ceiling**. Capacity is paced: one initial slot at UTC midnight and one additional slot every 36 minutes; unused unlocked capacity rolls forward to later hours in the same UTC day. Each browser has **one new AI question per UTC day**, plus one optional context-bound clarification if a slot is available. At most **eight of the 40 daily slots** are clarifications, preserving at least 32 for first questions. Each IPv4 address / IPv6 /64 can use **six requests per UTC day**, accommodating multiple browsers behind a household or shared network. Network throttling and in-flight limits still apply. These are anonymous-browser/network limits, not a reliable unique-human identity system. The reservation model is conservative, but it is **not an account-wide hard budget**. Other applications sharing Workers AI may consume the same Free allocation; unexpected errors must fall back to prepared answers. Never activate on a paid Workers plan or assume a free allocation prevents charges on paid.

Current Cloudflare project configuration read on 2026-11-17:
- Pages project: `thesoundquestion`, publishing from `site-dist`, build command `node scripts/build-public-site.mjs`, source `main`.
- Production and preview Pages binding lists were empty; no tutor AI or D1 binding configured.
- Existing D1 list contains `tsq-abx-scores`, not a tutor quota database.
- Cloudflare subscription/plan endpoint was permission denied, so **Workers Free plan not independently confirmed**.
- Automatic production/preview deployments were disabled, reducing unintended build consumption.

## Checklist before any activation

1. Confirm from the account dashboard that the active Workers plan is **Free**; verify the AI model is permitted and current account-wide usage is safely below 10,000 Neurons/day. No billing or paid upgrades.
2. Prepare a separate Free D1 database `tsq-tutor-quotas` (do not reuse ABX score tables), and apply `deployment/lesson-tutor/schema.sql`. The database and schema are NOT created by this branch.
3. Configure the Pages production bindings **TUTOR_AI** (Workers AI) and **TUTOR_DB** (D1). Set encrypted **TUTOR_SECRET** (64 random hex characters) in Cloudflare, never in GitHub; production vars **TUTOR_ORIGIN=https://thesoundquestion.com**, **TUTOR_WORKERS_PLAN=free**, and **TUTOR_ENABLED=true** only when ready to test. Never enable against the legacy `pages.dev` origin.
4. Validate `node --test tests/lesson-tutor/*.test.mjs` plus the site's ordinary build and regression tests, and inspect generated `site-dist/_routes.json`.
5. Smoke-test one unmatched question through the live same-origin API, a follow-up, an out-of-scope refusal, a quota exhaustion case and a disabled-backend case. Measure actual Workers AI usage; confirm static content is not served by Functions. Do not load-test by consuming the free daily AI allowance.
6. Before exposing the Ask AI button, expand `privacy/index.html` to explain that optional AI submissions go to Cloudflare for processing, the short-lived protected browser token and quota cookie, and that prepared answers keep questions in the browser. Then change `AI_ENABLED` from false to true in an intentionally reviewed release; test mobile and keyboard use.
7. Monitor the account-wide free quota. If costs or limits become uncertain, disable the backend via `TUTOR_ENABLED=false`, leaving prepared answers available.

### Deployment economy

Keep this branch out of `main` until the release bundle is approved. The infrastructure/secret setup and checks are separate and require owner authorization. Merging files alone will **not** enable live inference. Cloudflare might need a controlled deployment after bindings are configured. Do not promise a one-build live launch before verifying the deployment settings and runtime.

## Later scope (separate feature)

Site-wide searchable lessons, labs, the library and tools would require a curated content index and appropriate source links. Keep that separate from the existing **lesson-only** tutor fallback to avoid implying the AI has browsed the entire website.

## References

- [Cloudflare Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Gemma 4 26B](https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/)
- [Cloudflare Pages Functions bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Cloudflare Pages Functions routing](https://developers.cloudflare.com/pages/functions/routing/)
- [Existing tutor handoff](README.md)
