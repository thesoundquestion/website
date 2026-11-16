# The Sound Question — Search Discovery Audit & Optimization Handoff
Date: 2026-11-16
Project: https://thesoundquestion.pages.dev/
SEO branch: `seo/discovery-foundations-20261116`
Main branch: unchanged. Do not merge or deploy without full regression and rights checks.

## Source of evidence
- First-party Google Search Console via connected OpenSEO property `https://thesoundquestion.pages.dev/`.
- OpenSEO free basic crawl of up to 50 pages. Audit ID `759e3f80-6947-40b8-84a9-efd3a8240140`.
- GitHub source inspection against `main`; no paid research, JavaScript-rendering, or Lighthouse audits were used.
- Google Search Console performance was only three homepage impressions and zero clicks through 2026-11-13, insufficient for conclusions about keyword demand.

## Google discovery snapshot
- Homepage: "Submitted and indexed", crawled 2026-11-12 (UTC).
- Decoder, MP3/lossless, mastering, System Check, Sound Basics, speaker response, amplifier power, glossary and other checked interior pages: "URL is unknown to Google" as of the audit.
- "Unknown" does not mean a penalty, block, or indexing rejection. Google discovery is the immediate priority.

## Crawl findings
- 50 URLs fetched successfully; crawler stopped at free cap, with one discovered URL uncrawled. The 50 include query-parameter versions of Compare My Gear and one PDF; do not claim 50 unique HTML pages were exhaustively audited.
- No broken internal links, missing titles, missing H1s or server errors reported in the crawled sample.
- 14 informational title-length notices; five overly long descriptions; three heading-order skips; two intentionally noindexed hubs; four query-parameter URLs canonically pointing at /system-check/compare/ (normal).
- One thin-content warning at /connect/ (125 words). Do NOT pad a contact page merely to meet a minimum word count.
- The labs homepage and tools homepage had noindex/nofollow in source. Lab publication/rights status is separate from SEO readiness.

## Staged changes (branch only)
1. sitemap.xml: add the public /tools/ and /system-builder/ hubs; sitemap increases from 41 to 43 URLs.
2. tools/index.html: change noindex,nofollow to index,follow and add self canonical because the public tools hub is useful, substantial, and links to three working tools.
3. lab/index.html: change index,follow to noindex,follow because the page itself is explicitly labeled REVIEW DRAFT · NOT PUBLISHED. This does NOT secure or unpublish the page.
4. Five too-long meta descriptions shortened, preserving the factual novice-friendly explanations.
5. Fourteen long document titles clarified and shortened, retaining the detailed teaching headings in page content.
6. Update relevant existing regression tests to encode the indexing decisions and the two new sitemap URLs.
7. No audio, calculator, lesson engineering, or source-reuse claims were altered.

## Unchanged or unresolved
- /labs/ remains noindex,nofollow intentionally pending publication/rights decisions; do not automatically expose.
- /lab/mastering/ and /labs/formats/ require independent release/rights and functionality confirmation before SEO promotion. /labs/formats/ is in the existing sitemap. No changes to their rights gates.
- Heading-order notices for /decoder/mastering-dynamic-range/, /decoder/speaker-dispersion/, and /system-check/ remain low priority because HTML heading changes could affect existing CSS and interactions; review with visual checks.
- /connect/ is a contact page, where concise copy is natural.
- Google Search Console sitemap submission status could not be read through the available connected API; check it in the Search Console UI after release.
- Existing latest main run may pass, but full Node regression tests were NOT run on this SEO branch. The CI suite should pass before merging. Metadata was statically checked via GitHub.

## Post-merge steps
1. Verify page availability, canonical, title, description, sitemap.xml and robots.txt on live production.
2. In Google Search Console, inspect sitemap.xml status and submit it if necessary; Google does not offer guaranteed indexing.
3. Inspect representative interior URLs after Google has had time to crawl. Distinguish 'unknown', 'discovered but not indexed', and 'crawled but not indexed'.
4. Monitor Search Console queries, pages, impressions, and clicks; with nearly no traffic, avoid claiming keyword optimization outcomes.
5. Prefer real beginner questions and valuable demonstrations to arbitrary keyword stuffing or mass AI page creation.
6. Retain the public site and audio rights gates, and avoid consuming paid SEO API credits or unnecessary Cloudflare builds.

## External reading provided by project owner
https://openseo.so/blogs/how-to-prompt-claude-code-for-seo
Useful principles: pick the highest-impact action, verify first-party numbers, give the counterargument, and keep human editorial judgment.
