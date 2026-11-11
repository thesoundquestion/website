# Ask The Sound Question development handoff

## Current release

The 18 published Spec Sheet Decoder lessons use the prepared-answer bank and local text matching. Each lesson has five prepared explanations and a graph question that follows the selected example. An inline disclosure keeps the panel small until a reader opens it. The shortcut below each interactive plot opens the tutor with that plot selected. Section links, illustrations and navigation belong to the original lesson pages.

The [frontend flag](../../assets/lesson-tutor/config.js) is off and the public site has no tutor API route. The current incremental inference and database cost is **$0**. The answer bank loads on demand from the website. The visitor’s typed question stays in the browser.

## Maintain the answers

- [The approved bank](../../assets/lesson-tutor/approved-answers.json) is shared by the browser and the server. Keep each key aligned with the slug in [curriculum.json](../../decoder/curriculum.json). Copy the exact printed specification and choose the sections that explain it.
- Write the simple, specification, listening, buying and related answers first. Keep the direct explanation short, define unfamiliar words and explain the conditions that affect what a person hears. Identify fictional and calculated examples. Link the [Ohm’s law reference](../../decoder/ohms-law/index.html) where voltage, current, impedance and power meet.
- Use the page’s existing section IDs, plot keys and example IDs. Each plot needs a short description of its axes or scale and one interpretation per option. The first two preferred reference cases supply the comparison question.
- When an approved answer can address a recurring question, add its common phrasings, text and section under that lesson’s questions. Use feedback readers volunteer through the site’s existing contact channels. The tutor does not log questions for review.
- On a new lesson, include the shared Decoder graph script and the same lesson header. Update the bank and run the tests below in the same change. The browser reads selected examples from the graph controls’ pressed state and resolves the last selected figure or the section named in the URL.
- The teaching format is a short explanation, the evidence behind it and a route into the lesson. Site-specific facts, examples and links come from reviewed material.

## Optional backend and its limits

The [Pages adapter](pages-function.js) calls [the request handler](handler.js). Its provider function receives bounded messages and returns plain text or a failure. The handler owns scope, quotas, prompt construction and section links. A provider change needs a fresh review of the model’s availability, token limits and allowance before it is enabled.

Reviewed 2026-11-11 against Cloudflare’s published limits.

| Resource | Published Free allowance | Tutor allowance if enabled |
| --- | --- | --- |
| Workers AI | 10,000 neurons per day across the account. Free requests fail at the allowance. | 40 reserved requests per UTC day, with a modeled budget of 3,280 neurons. |
| Pages Functions | 100,000 requests per day, shared with Workers. | Only the tutor API route invokes a Function. A rejected API request still counts toward the platform request allowance. |
| D1 | 5 million rows read per day, 100,000 rows written per day and 5 GB of total storage. | One small indexed table holds request reservations. At most 40 new reservations per UTC day. |
| Browser | No inference or database calls for prepared answers or local matches. | Unlimited prepared answers and local matching. |

The candidate model is Cloudflare-hosted [Gemma 4 26B A4B IT](https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/). It is listed in the catalog and absent from the current paid-only list. Current rates are 9,091 neurons per million input tokens and 27,273 per million output tokens. The code checks that serialized messages are at most 7,000 UTF-8 bytes and sets the provider’s completion cap to 256 tokens. The daily reservation calculation allows 8,192 input tokens to leave room for chat formatting and rounds up to 82 neurons per call. Cloudflare meters actual tokens and applies the account-wide Free cutoff. On a Paid plan, usage above the free allocation is priced at USD $0.011 per 1,000 neurons. Keep the tutor disabled on Paid.

The handler atomically reserves capacity in D1 before calling the model. A browser and a network each get up to two attempts per UTC day, including a clarification. A shared IPv4 address or IPv6 /64 shares the network allowance. The network has a five-second throttle and one outstanding request. The site has two outstanding requests at a time. Duplicate questions for the same lesson and example are rejected. A timeout keeps the reservation until the call settles or the two-minute stale window passes. Failed calls spend their reservation. The request accepts up to 260 characters and a 4,096-byte JSON body. Answers are capped at 180 words and 1,350 UTF-8 bytes.

The handler requires a same-origin JSON POST and uses a first-party signed, HttpOnly cookie scoped to the API and expiring at the UTC reset. It stores only daily keyed hashes and reservation metadata in D1. Older metadata is pruned when the API next reserves quota, retaining the current and previous UTC day during use. The prior question and answer for a clarification are in a ten-minute encrypted token held in page memory and tied to the browser, day, lesson and graph. The server enforces one use. The direct Workers AI binding uses standard inference with output storage disabled. Cloudflare’s data policy describes its limited retention exceptions.

Known unrelated and unsafe repair requests, instruction overrides, malformed input and missing selections for graph questions are handled before inference. The model receives the resolved lesson, approved explanations, the relevant graph and directly linked concepts. The handler filters ungrounded numeric claims and model-supplied citations, then supplies a real section link. Scope and evidence filters are heuristic. Review actual answers before opening the feature to visitors.

Sources: [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [Workers AI data use](https://developers.cloudflare.com/workers-ai/platform/data-usage/), [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/) and [Pages routing](https://developers.cloudflare.com/pages/functions/routing/).

## Other free options reviewed

| Option | What it offers | Decision |
| --- | --- | --- |
| WebLLM | Inference on the visitor’s device with a WebGPU browser and downloaded model assets. | Possible opt-in experiment. Model downloads and hardware support vary, especially on phones. |
| Gemini API Free | Some models can be used without linked billing, subject to model and project limits. Free-tier data-use terms differ from paid. | Revisit the terms and availability if a replacement is needed. |
| Hugging Face Inference Providers | Current pricing requires credit purchases for free users. | Exclude from free operation. |

Sources: [WebLLM requirements](https://webllm.mlc.ai/docs/user/get_started.html), [Gemini billing tiers and data use](https://aistudio.google.com/docs/billing?hl=en) and [Hugging Face inference pricing](https://huggingface.co/docs/inference-providers/main/en/pricing).

## Free connection procedure

Live inference awaits a Cloudflare account owner who can verify the actual Workers Free plan and add the bindings. The environment’s free-plan flag records the operator’s verification of the subscription.

1. In the Cloudflare dashboard, confirm the project’s account uses Workers Free and the chosen model is available without a payment method. Check account-wide quota use. Keep paid services and billing disabled.
2. Create a Free D1 database for tutor quotas. Apply [schema.sql](schema.sql) using the D1 console or the authorized Wrangler account. Add the Pages D1 binding as **TUTOR_DB** and the Workers AI binding as **TUTOR_AI**. Set **TUTOR_SECRET** as an encrypted secret using a random 64-character hex value generated with the command below. Use a separate Preview secret and database if running a preview.

   ~~~sh
   openssl rand -hex 32
   ~~~

3. Set **TUTOR_ORIGIN** to the environment’s exact HTTPS origin with no trailing slash, and **TUTOR_WORKERS_PLAN** to **free**. Set **TUTOR_ENABLED** to **true** for the environment used in the smoke test. Keep the frontend flag off while checking the API. Leave Workers Logs and request-body capture off for the tutor.
4. Copy [pages-function.js](pages-function.js) to **functions/api/lesson-tutor.js** and [_routes.example.json](_routes.example.json) to **_routes.json** in the publish root. Merge the single API path into any future routing file. Deploy from the project root so the adapter can import the shared bank. The route must cover only the tutor API.
5. Test in Preview first. Use a same-origin POST with an unmatched lesson question, verify the response and the model’s actual use against the quota dashboard, then exercise one clarification and a refusal. Check whether the model returns complete responses under the token cap. Run the local tests and manually check mobile and keyboard use before production activation. The Wrangler AI binding uses the real account even in local development, so use stand-ins for routine local tests.
6. Before publishing the enabled browser flag, update the privacy notice to say that pressing **Ask AI** sends the question to Cloudflare and describe the quota cookie and short clarification token. Verify the production bindings and exact origin. Set **AI_ENABLED** in [config.js](../../assets/lesson-tutor/config.js) after those checks. Disable **TUTOR_ENABLED** and redeploy to stop inference if the Free plan or model availability changes. The static tutor can run independently.

Turnstile is optional if abuse later warrants an extra check. The initial integration uses the origin check, per-network limits, duplicate protection and the daily budget.

## Verification

Run from the repository root with Node 24 or newer.

~~~sh
node --test tests/lesson-tutor/*.test.mjs
~~~

The suite validates all 18 lesson specifications, plot cases, prompt answers and target anchors. It exercises the SQLite reservation SQL through a D1-shaped test binding and uses a stand-in for Workers AI. Coverage includes disabled and paid settings, invalid requests, scope and safety refusals, graph context, inaccurate premises, invented figures, quota exhaustion, duplicate and concurrent requests, expiring clarification tokens, provider failures and timeouts.

Browser checks on the static build covered desktop keyboard operation, the two amplifier power plots, 320 px and 390 px layouts, headphone jack context, local typed matching and section links. Live model behavior and account quotas still require the Free-plan smoke test.
