# SEO publication and indexing handoff — The Sound Question

Date: November 16, 2026
Canonical website: https://thesoundquestion.pages.dev/
Authoritative branch for staged SEO work: `seo/published-pages-20261116`.
Supersedes the **stale** `seo/discovery-foundations-20261116` branch. DO NOT merge the stale SEO branch, which diverged before the labs were made public and contained a `noindex` change for Mixing Lab.

## Current release status

Project owner confirmed there are **no longer any review or draft public pages**.

The latest `main` branch, at branch creation SHA `942bf7bb88dca3465fd6e75856b4b2908f69eb47`, already:
- Removes outdated review/draft wording from public lab pages.
- Uses `index,follow` on the Mixing Lab, Mastering Lab, Listening Labs and Tools hubs.
- Lists 46 public HTML routes in `sitemap.xml` including `/lab/`, `/lab/mastering/`, `/labs/`, `/labs/formats/`, `/tools/` and `/system-builder/`.
- Has `tests/public-page-readiness.test.mjs` guarding release copy, indexing and sitemap coverage.
These release changes were NOT reverted or re-authored in this SEO branch.

## Changes staged on the new branch

- Adds self-referencing canonical tags to `/lab/`, `/lab/mastering/`, `/labs/` and `/tools/`.
- Retains and improves five beginner-friendly metadata descriptions where the previous text exceeded 160 characters.
- Shortens/clarifies 14 long page titles. The visible educational headings and lesson contents are unchanged.
- Leaves `sitemap.xml`, `robots.txt`, all lab audio/interactive controls, attribution and copyright text unchanged.

## First-party Google Search Console evidence

Search Console connected through OpenSEO for `https://thesoundquestion.pages.dev/`.
At first inspection on November 16, homepage was submitted and indexed with a crawl on November 12. Interior lessons and hubs were "URL is unknown to Google" rather than specifically blocked. Oct 17–Nov 13 performance: three homepage impressions, no clicks. These are early observations only.

## Free crawl

OpenSEO basic crawl ID `759e3f80-6947-40b8-84a9-efd3a8240140`, 50-URL cap, no paid JS rendering or Lighthouse. No broken internal links, server errors or missing titles/H1s reported in the crawled sample. Reported 14 titles >60 characters, five descriptions >160, three heading-level skips, one short Contact page. Four filter URLs correctly canonicalize to the Compare My Gear hub. This crawl was done before the final publication update, so its noindex findings for hubs are now stale.

## Important distinction

Public release status does not prove every page has been indexed by Google. No API in this workflow can force Google to index a URL. Continue monitoring Search Console and sitemap ingestion after release; avoid paid keyword research until the site develops meaningful impressions.

## Release guardrails

- Keep all already-published lab pages indexable; do not reinstate review or draft labels.
- Preserve the existing permission/attribution documentation, author credits and release-check records.
- Verify `node --test tests/*.test.mjs` and regression/build checks before merging to `main`.
- Do not push this branch to `main` or trigger Cloudflare builds without review.
- URL inspection and Search Console performance reads are free and consume no OpenSEO research credits.
- The OpenSEO editorial guide supplied by the owner: https://openseo.so/blogs/how-to-prompt-claude-code-for-seo
