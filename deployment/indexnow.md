# IndexNow setup and post-release submissions

This implementation is for the canonical site **https://thesoundquestion.com/**, not the historical `pages.dev` URL.

## Prepared files

- `d4c6d4d6b0f543328922f93a80145ba7.txt`: the IndexNow verification key, copied verbatim from the site owner's Bing-generated file. It must resolve publicly at `https://thesoundquestion.com/d4c6d4d6b0f543328922f93a80145ba7.txt`.
- `scripts/submit-indexnow.mjs`: validates locally and refuses to submit unless the live verification file is reachable and correct.
- `.github/workflows/indexnow-submit.yml`: manual post-deployment GitHub Action. It cannot deploy the website.

The existing `scripts/build-public-site.mjs` already includes root-level 32-character hexadecimal `.txt` files in `site-dist`, so no publishing allowlist changes are necessary.

## Owner's one-time Bing setup

1. In [Bing Webmaster Tools](https://www.bing.com/webmasters/), add `https://thesoundquestion.com/` (import its ownership from Google Search Console if available).
2. Submit `https://thesoundquestion.com/sitemap.xml` in **Sitemaps**.
3. Review and explicitly approve a separate production deployment that includes the verification file.
4. After that authorized deployment succeeds, open the public verification URL above. It must display the 32-character key and nothing else.
5. In GitHub **Actions** > **Submit URLs to IndexNow (after approved production deployment)** > **Run workflow**, enter `@sitemap` for a one-time full sitemap notification. After subsequent releases, enter only the changed canonical paths, such as `/decoder/` or `/library/curators-listening-room/`.

To inspect a request without submitting anything, run locally:

```sh
INDEXNOW_PATHS="/ /decoder/" node scripts/submit-indexnow.mjs --dry-run
```

To submit *only after the public verification URL is live*:

```sh
INDEXNOW_PATHS="/ /decoder/" node scripts/submit-indexnow.mjs --submit
```

The script submits HTTPS canonical URLs through `https://api.indexnow.org/indexnow`. HTTP 200 means URLs were received; HTTP 202 means verification is pending. Neither guarantees indexing or ranking. Check Bing Webmaster Tools > **IndexNow** for submission reporting.

## Deployment and safety gates

- The workflow is **manual only**. It does not run on every commit or publish unbuilt code.
- Do not enable automated Cloudflare builds, submit preview URLs, merge this draft PR, or trigger Cloudflare Pages deployments without explicit owner authorization.
- Do not repeatedly submit unchanged sitemap URLs; use `@sitemap` only for initial setup or a justified full refresh.
- If a later release process can reliably signal **successful production deployment**, consider connecting IndexNow to that event. Do not claim automatic notifications are operational until that integration is verified.
- The verification key is intentionally public and is not a login credential; no GitHub or Cloudflare secrets are required.

Official protocol: https://www.indexnow.org/documentation
