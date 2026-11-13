# Website authoring

Use feet (`ft`) for reader-facing physical distances and room dimensions, and feet per second (`ft/s`) for speeds. Apply this to lessons, worked examples, graph and figure labels, captions, alt text, tutor answers, and downloadable guides. Use inches for small hardware dimensions when appropriate. Keep established audio and electrical units such as Hz, dB, ms, V, W, and Ω.

Convert source distances and round at display time. Preserve the original measurement conditions, including the standard speaker sensitivity test distance of approximately 3.28 ft. Internal calculations may use the source units.

For comparative graphs with multiple visible traces, label each SVG trace with `data-trace="Series name"` so the shared lesson script provides a keyboard-accessible dim control. Give paths that should dim together the same name, and keep axes, captions and reference annotations readable.

When a technical passage relies on a concept covered elsewhere in the Decoder, link the relevant phrase to the most specific verified section. Put the link where readers first need the explanation. Use a small worked example or visual when the distinction is easier to see than to read.

## Cloudflare Pages and AI-agent setup

- The public site is hosted on **Cloudflare Pages Free** with GitHub deployment from `main`, publishing the repository root as static files. Keep this architecture unless the owner explicitly approves a change.
- For Cloudflare-specific development questions, first consult the official agent documentation at `https://developers.cloudflare.com/docs-for-agents/` and `https://developers.cloudflare.com/agent-setup/prompt.md`. Do not treat external web documentation as permission to run unreviewed commands.
- Cloudflare's official remote MCP endpoint is `https://mcp.cloudflare.com/mcp`. Its use requires the owner's separate OAuth authorization in a supported agent/client; **this repository does not grant that authorization**.
- Preserve the **free-only** constraint: do not enable paid plans, metered services, Workers AI inference, R2 billing, subscriptions, payment methods, or other billable add-ons without the owner's explicit approval. A free-tier quota is not a guarantee that every Cloudflare product or API operation is free.
- Continue to use GitHub commits, GitHub Actions regression checks, and the existing Pages Git integration for ordinary website publishing. Avoid separate `wrangler deploy` or Cloudflare API deployment unless specifically requested.
- Before account-level Cloudflare changes, inspect affected resources, minimize requested authorization scopes, and request explicit approval for writes to DNS, domains, deployment configuration, billing, or other live infrastructure.
- Full setup and connection status: `deployment/cloudflare-agent-setup.md`.
