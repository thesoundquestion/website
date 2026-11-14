# Content Use & Attribution: staged release notes

**Status:** Draft staged on a non-production GitHub branch. Not approved for publication.

## Branch and deployment policy

- Branch: `draft/content-use-attribution-20261114`.
- Site route when eventually published: `/content-use/`.
- Cloudflare Pages project: `thesoundquestion`, production branch `main`.
- Cloudflare was checked on 2026-11-14: automatic preview deployments are configured as `none`; production deployments remain enabled for `main`.
- The draft commits also use the `[CF-Pages-Skip]` commit-message prefix as an additional skip instruction.
- **Do not merge into `main` until publication is expressly approved.** No automatic deployment is necessary for editorial review.

## Files

- `content-use/index.html`: the standalone policy page, using existing site CSS and logo.
- `docs/content-use-policy-draft.md`: editable copy.

The offline preview package also contained stand-in `assets/styles.css` and `assets/mark.svg`. Do **not** overwrite real site assets with those preview files.

## When publishing is approved

1. Recheck policy wording and confirm a usable contact method for rights and licensing queries.
2. Update the site-wide footer to link to `/content-use/` next to Privacy. This change is intentionally not made in this draft.
3. Consider adding the new route to `sitemap.xml`.
4. Confirm that links, mobile layout, accessibility, and visible source attribution work on the deployed site.
5. Merge only as part of an approved scheduled release to minimize build usage.

This policy communicates the site's intentions; it does not grant rights to third-party media used in future labs or replace legal advice.
