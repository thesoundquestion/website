# Cloudflare agent setup for The Sound Question

Status: **Cloudflare Pages settings read-only verified 2026-11-14; earlier connection instructions below retained for historical reference.**
Updated: 2026-11-14

## Current production architecture

- Repository: `thesoundquestion/website`
- Website: `https://thesoundquestion.pages.dev/`
- Hosting: Cloudflare Pages Free
- Source of truth: `main` on GitHub
- Deployment: GitHub-to-Pages integration, build output `.` (repository root)
- CI: GitHub Actions site regression tests
- No Cloudflare CLI, paid service, or account permissions are required to edit and publish the existing static site through GitHub.

## Why use the Cloudflare agent integration

- Access current Cloudflare platform documentation from an AI coding assistant.
- After **separate OAuth authorization**, inspect Cloudflare-side Pages deploys, settings and diagnostics when needed.
- Keep the GitHub-first source-edit/deployment process intact.

Official source:
- https://developers.cloudflare.com/agent-setup/prompt.md
- https://developers.cloudflare.com/agent-setup/codex/
- https://developers.cloudflare.com/docs-for-agents/
- https://mcp.cloudflare.com/mcp

## Connecting ChatGPT itself

Search in ChatGPT Settings > Plugins for an official Cloudflare plugin. On 2026-11-13, no matching standard installable plugin was returned in this assistant's plugin search.

If the account's Plugins UI supports **Add custom MCP server**, register Cloudflare's official URL:

```text
https://mcp.cloudflare.com/mcp
```

Use the host-provided authorization flow, verify the publisher and requested permissions, and grant only required capabilities. OAuth/consent must be performed by the account owner. The repository configuration cannot authenticate this ChatGPT session by itself. If the account does not offer custom MCP registration, use a supported agent below instead; do not improvise an API token.

## Optional Codex CLI setup (only on a machine with Codex installed)

Cloudflare documents these commands for Codex:

```sh
codex mcp add cloudflare --url https://mcp.cloudflare.com/mcp
codex mcp login cloudflare
codex mcp list
```

The first command registers the remote server. Login requires the owner to finish OAuth in a browser. Another supported path is to install the Cloudflare plugin from Codex's `/plugins` menu; Cloudflare says it bundles Skills and MCP.

Do **not** automatically run a global `npx skills add ... --global` on the user's general-purpose machines. First confirm the target agent/OS and evaluate the package scope. The site itself does not require those skills to function.

## Publishing and costs

1. Make code/content changes in GitHub, with review where appropriate.
2. Run normal test workflows; do not bypass failures.
3. Push to `main` through the established workflow and inspect Cloudflare Pages status if Cloudflare has been connected and access is authorized.
4. Do not enable optional Workers AI, analytics, D1, R2 or any other service solely because a Cloudflare agent suggests one. Features and limits should be checked against current official pricing before explicit approval.
5. Do not change Cloudflare billing, plan, credentials, DNS, routes or production settings on behalf of the user without specific authorization.

## Boundaries

- The `thesoundquestion/research` repository is private and must not be automatically published.
- No secrets or OAuth tokens belong in this public repository.
- A Cloudflare connection was available for a **read-only Pages project configuration check on 2026-11-14**. No Cloudflare settings or deployments were changed; this does not claim an OAuth login procedure or a new production deployment.

## 2026-11-14 — Verified Pages settings and build-budget workflow

Read-only inspection through an authenticated Cloudflare connection on 2026-11-14 confirmed project `thesoundquestion` uses GitHub `thesoundquestion/website`: production branch `main` with automatic production deployments **enabled**, and preview deployment setting `none` (automatic preview branch deployments **disabled**). This supersedes the historical connection-status warning above only for this verified session; it does **not** mean settings will never change. No settings were modified, and this document update remains on the nonproduction review branch.

**Conserve builds:** keep manuscript, policy, publication and audio-lab work on draft branches while previews remain disabled. For nonrelease commits to the Pages-linked repository, use a commit subject starting with `[CF-Pages-Skip]` to request no build; Cloudflare recognizes this exact skip flag. Read the active project settings before relying on either safeguard. Avoid unneeded commits to `main` and avoid publishing temporary files solely for archive housekeeping.

**Intentional release:** confirm the owner approved the exact content/diff and monthly quota, pass local QA, then publish a single reviewed production change on `main` **without** a skip flag. Verify that Cloudflare actually built and deployed the intended SHA; a GitHub push, archive, preview or deployment-status assumption is not proof of production delivery. Record deployment ID and build usage. Cloudflare Pages Free documentation (checked 2026-11-14) lists **500 builds/month** and **25 MiB maximum size per individual deployed file**. Do not upload the full 62 MB handbook source archive as a Pages asset; preserve it in the Library, verify the selected PDF/images and size-check each actual deliverable. Do not pay for alternate storage without approval.

The handbook-specific publication checklist and the separation of binary Library assets from GitHub text staging live in `staging/handbook-20261114/README.md` on `draft/handbook-review-20261114`. The private master handoff `thesoundquestion/research/WEBSITE_BUILD_MASTER_HANDOFF.md` summarizes the coordinated release gate. The separate `/lab/` route and rights/attribution policy must not be represented as published until verified.

Official references:
- https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/
- https://developers.cloudflare.com/pages/configuration/branch-build-controls/
- https://developers.cloudflare.com/pages/platform/limits/
