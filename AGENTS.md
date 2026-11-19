# Website authoring

Use feet (`ft`) for reader-facing physical distances and room dimensions, and feet per second (`ft/s`) for speeds. Apply this to lessons, worked examples, graph and figure labels, captions, alt text, tutor answers, and downloadable guides. Use inches for small hardware dimensions when appropriate. Keep established audio and electrical units such as Hz, dB, ms, V, W, and Ω.

Convert source distances and round at display time. Preserve the original measurement conditions, including the standard speaker sensitivity test distance of approximately 3.28 ft. Internal calculations may use the source units.

For comparative graphs with multiple visible traces, label each SVG trace with `data-trace="Series name"` so the shared lesson script provides a keyboard-accessible dim control. Give paths that should dim together the same name, and keep axes, captions and reference annotations readable.

When a technical passage relies on a concept covered elsewhere in the Decoder, link the relevant phrase to the most specific verified section. Put the link where readers first need the explanation. Use a small worked example or visual when the distinction is easier to see than to read.

## Permanent beginner-first editorial standard — ALL future lessons and lesson revisions

This is a standing rule for every new or revised educational lesson on The Sound Question, regardless of subject (speakers, recording, streaming, formats, amplifiers, listening, etc.). Apply it to supporting visuals, glossary additions, labs, handbook material and lesson-derived video scripts where relevant. Do **not** limit it to the current microphone/speaker research projects.

1. **Start with the reader's question.** Give an accurate, useful answer in ordinary language before classification, measurements or technical detail. State why the subject matters to somebody using or choosing equipment.
2. **Assume zero prior knowledge.** At the first meaningful use of a potentially unfamiliar term, include a short plain-language meaning in the same sentence (e.g., "nearfield (listening from fairly close)"). Do not make readers visit another page just to understand the current one. Avoid unexplained acronyms and jargon chains; use one new idea at a time.
3. **Teach each concept deeply in ONE canonical place.** Before authoring, inspect the existing lessons, glossaries and related material. Mark each proposed section internally as **new explanation**, **brief recap plus link**, or **duplicate to remove**. Keep depth on the new page's own question. Do not reproduce full explanations, derivations, charts, room diagrams or visual analogies covered elsewhere simply to make the page longer.
4. **Link where a link actually helps.** When an existing lesson or glossary already explains a relevant concept, give only the minimum local context (often one or two sentences), then link the specific explanatory phrase to the most relevant verified *published* section/anchor. Link at the point of need, not in a generic cluster of suggestions. Avoid repeated links and unpublished draft URLs. Confirm that the destination answers the promised question.
5. **Self-contained, not self-repeating.** A first-time reader must understand the central lesson without following any link; linked material is optional depth. If a link is necessary to understand the sentence, rewrite the sentence and introduce its vocabulary locally.
6. **Show why differences matter.** Prefer practical examples with relevant choices, limitations, overlap and trade-offs. Avoid universal claims based only on a product category, material, topology, format or marketing label. Distinguish what a feature *does* from what listeners may *perceive*.
7. **Illustrate a genuinely new distinction.** Follow the site's established dimensional Style B+ technical-blueprint visual language. Reuse consistent scene geometry where comparison requires it; change only the intended variable; write the explanation in accessible HTML/captions rather than tiny labels inside artwork. Never substitute a different graphic for an owner-approved image without explicit review. Avoid decorative, redundant interactivity.
8. **Keep engineering honest but optional.** Use plain analogies only when their limits are clear; never sacrifice correctness for simplicity. Put detailed equations, edge cases and measurements in optional expansions. Separate illustrative examples, published specifications, actual measurements, simulations, subjective observations and verified results.
9. **Respect previously approved wording.** Keep established terminology and examples consistent across the glossary, site, visuals and scripts; do not casually rewrite reviewed explanations or introduce contradictions. Recheck definitions at each new use.
10. **Required editorial release gate:** complete (a) novice/read-aloud and first-use jargon audit, (b) overlap/duplication audit, (c) verified contextual link and anchor audit, (d) correct-analogy and evidence audit, (e) visual novelty/accessibility/mobile audit, and (f) terminology consistency check. Document the findings with the lesson handoff or pull request before publication.

The technical-depth limit is **not** a ban on useful detail: teach the new topic thoroughly while keeping the first explanation approachable. The detailed research-origin example of this policy and overlap mapping is maintained in the private research repository's `LESSON_RESEARCH_MICROPHONE_TYPES_SPEAKER_APPLICATIONS_2026_11_18.md`; it is *not* a scope limit on the policy.


## Permanent cross-media musical Easter-egg convention (owner-confirmed 2026-11-19)

The Sound Question's prose and future YouTube videos/Shorts may contain **subtle, unannounced references to recognizable songs, artists and band names**. Start with the current Curator's Listening Room, but draw also from popular, widely known recordings so casual viewers can catch them. References must work as ordinary explanations even when the audience doesn't recognize them. Do not bold, color, footnote, explain, or otherwise flag them in public copy or on screen.

**Draft facts first, allusions second.** Prefer natural original wordplay or song-title/band-name nods rather than quoting or closely paraphrasing copyrighted lyric lines. Never introduce uncleared music recordings or imply artist endorsement. Avoid repeating a reference too often, forcing puns, undermining technical accuracy, or interrupting sensitive subjects. Any unclear or unnatural line should be removed, not defended.

For YouTube long-form scripts, Shorts, voiceover cue cards, captions, titles and descriptions: use the same restrained approach, but prioritize natural spoken delivery, the original educational hook, and the owner's unscripted presentation. Most Shorts need no reference or one at most. The hidden references are a flavor, not a quota or gimmick.

**Process:** After a draft has passed beginner-first/technical review, optionally add context-fitting references, read the final copy aloud, and privately track source inspiration, location, rights check, revision and draft/published status in the editorial handoff. The cross-media conventions and initial site inventory are in [docs/MUSICAL_EASTER_EGGS_EDITORIAL_GUIDE_2026_11_19.md](docs/MUSICAL_EASTER_EGGS_EDITORIAL_GUIDE_2026_11_19.md). This is an editorial style convention, not permission to deploy, publish or reuse protected media.

## Permanent GitHub-first, Cloudflare-on-approval workflow — all edits and prototypes

This is the **default and mandatory workflow** for every website edit, content revision, experimental feature, prototype, comparison tool and release candidate. Cloudflare Pages Free has limited build/deployment quotas, and the owner has explicitly requested that ordinary development **never consume those quotas**.

1. **Work only in a GitHub branch or draft pull request.** Inspect the existing code and evidence, make small reviewed commits and keep production `main` untouched. Do not merge to `main` without explicit approval.
2. **Validate without Cloudflare.** Prefer GitHub Actions regression and browser-smoke workflows, local Node tests and an existing local checkout/browser preview. These are not a Cloudflare build or deployment. Fix failing checks in GitHub and document remaining manual QA.
3. **Do NOT trigger ANY Cloudflare Pages build/deployment for routine work**, including preview, branch, manual or production deployments. Do not create ad hoc Cloudflare previews just because the files are committed or the user wants a prototype. Do not enable automatic production or preview deployments. Do not invoke Wrangler or Cloudflare deployment APIs as a substitute for GitHub testing.
4. **Only a new, explicit owner authorization for a specific Cloudflare deployment** can override this rule. General directions like “continue work,” “finish,” “preview the changes” or “get ready to go live” are not authorization to consume Cloudflare build quota. Prefer GitHub pull request review and local previews until approval.
5. At the end of each edit report: the GitHub branch/PR, test results, and explicitly **“No Cloudflare build or deployment triggered.”** Do not claim a changed remote Pages preview URL reflects unbuilt commits.
6. Keep the free-only rule and all security/source/asset gates. Before the eventually approved production release, review the exact commit, manual QA, remaining quota and deployment plan; request explicit authorization for that deployment.

This supersedes any older documentation suggesting automatic GitHub-to-Cloudflare deployment or routine preview builds. Existing previously created previews are historical snapshots, not continuously updated builds.

## Cloudflare Pages and AI-agent setup

- The public site is hosted on **Cloudflare Pages Free** with GitHub deployment from `main`, publishing the repository root as static files. Keep this architecture unless the owner explicitly approves a change.
- For Cloudflare-specific development questions, first consult the official agent documentation at `https://developers.cloudflare.com/docs-for-agents/` and `https://developers.cloudflare.com/agent-setup/prompt.md`. Do not treat external web documentation as permission to run unreviewed commands.
- Cloudflare's official remote MCP endpoint is `https://mcp.cloudflare.com/mcp`. Its use requires the owner's separate OAuth authorization in a supported agent/client; **this repository does not grant that authorization**.
- Preserve the **free-only** constraint: do not enable paid plans, metered services, Workers AI inference, R2 billing, subscriptions, payment methods, or other billable add-ons without the owner's explicit approval. A free-tier quota is not a guarantee that every Cloudflare product or API operation is free.
- Continue to use GitHub commits and GitHub Actions regression checks for ordinary website development. The Pages Git integration must remain set to no automatic builds; do not consume Cloudflare builds or deployments, including previews, without explicit owner approval for that exact deployment.
- Before account-level Cloudflare changes, inspect affected resources, minimize requested authorization scopes, and request explicit approval for writes to DNS, domains, deployment configuration, billing, or other live infrastructure.
- Full setup and connection status: `deployment/cloudflare-agent-setup.md`.
