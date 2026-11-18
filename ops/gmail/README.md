# The Sound Question — project Gmail inbox

**Account:** thesoundquestion@gmail.com  
**Last structured:** November 17, 2026

The real connected Gmail inbox has been organized with **Gmail labels** (the
Gmail equivalent of folders). Existing permission conversations, outgoing
permission requests, Search Console notices, and historical GitHub test-failure
messages were backfilled. No messages were deleted, archived, forwarded or
marked read by this work.

## Labels already created in Gmail

| Label | Use |
| --- | --- |
| TSQ/01 Pending Approvals | Daily summary mail for website comments and Listening Room submissions awaiting moderation |
| TSQ/02 Needs Reply | Manually mark meaningful incoming correspondence requiring a reply |
| TSQ/03 Waiting on Reply | Outgoing creator/rights inquiries awaiting a response |
| TSQ/10 Content Permissions | All rights/permission/license correspondence, regardless of outcome |
| TSQ/11 Permission Confirmed | **Only after the rights holder explicitly grants the relevant use; scope-specific** |
| TSQ/12 Permission Restricted | Explicit refusals, conditions or removal requests |
| TSQ/20 Ideas & Feedback | Content and experiment ideas, correction requests |
| TSQ/21 Listening Room | Email suggestions about recordings and the Listening Room; website form entries remain in D1 |
| TSQ/30 Creators & Outreach | Collaborators, people who offer material, brand/manufacturer outreach |
| TSQ/40 Search & SEO | Google Search Console, indexing, SEO and audit messages |
| TSQ/41 Hosting & Cloudflare | Account, Pages, Workers, D1 and other infrastructure notices |
| TSQ/50 Routine Notifications | Routine successes, optional lower-priority automation mail |
| Automation / GitHub Actions failures | Existing original label, reused rather than creating a duplicate TSQ one |

**The two action labels, Needs Reply and Waiting on Reply, are manual.**
Automated filters only categorize mail by topic. They NEVER infer permission
granted/restricted on the basis of the word "permission". The existing
correspondence includes both explicit written permission for defined uses and
an explicit refusal of reproduction rights; preserve that distinction.

## Future automatic routing

The Gmail connector supports searching, labels and backfills, but it does not
offer Gmail's **Create filter** action. A one-time, safe Gmail filter installer
is staged at \`ops/gmail/INSTALL_FILTERS.gs\` with its Apps Script manifest
\`ops/gmail/appsscript.json\`. It uses the official Google Gmail API; no outside
filter service or paid connector is necessary.

The user reported completing the filter installer on November 17, 2026;
its final rule count has not been independently inspected with a Gmail filter
listing tool. The labels and historical labeling were already in place. A separate daily ChatGPT inbox triage task was created to route
new mail and alert only on genuinely important issues.

### Install Gmail's native filters once

1. Sign into **thesoundquestion@gmail.com** and open
   https://script.google.com/.
2. Create a new private Apps Script project, e.g. "TSQ Gmail Inbox Rules".
   Paste \`INSTALL_FILTERS.gs\` into its script editor.
3. Open **Project Settings > Show 'appsscript.json' manifest**, then replace
   its content with the supplied \`appsscript.json\` (or enable the Gmail API
   under **Services + Add a service** and let Apps Script request the necessary
   scopes). Do not publish the Apps Script project publicly.
4. Run \`previewTSQGmailFilters\` to validate the account, existing labels
   and planned routing without changing anything.
5. Run \`installTSQGmailFilters\` and approve the requested Gmail permission
   scopes. The script only creates missing, label-only filters and checks
   exact criteria before installing, so rerunning does not intentionally
   duplicate filters.
6. Inspect Gmail **Settings > See all settings > Filters and Blocked
   Addresses**. Confirm the nine rules are installed and future messages
   receive the intended labels.
7. Optionally use Gmail's "Also apply filter to matching conversations" for
   older messages not already labeled. Avoid changing "Skip Inbox" or
   "Mark as read" until the workflow proves reliable.

The native filters run as new messages arrive, without a daily Worker or
Cloudflare quota. All remain in the Inbox unless you deliberately archive
them. GitHub failures retain their original visible failure label.
The initial backfill has not changed unread state.

## Moderation email notifications

The website's separate D1 moderation digest (see
\`workers/abx/PENDING-REVIEW-ALERTS.md\`) is currently *staged and inactive*.
The Worker itself has been deployed with moderation turned off; the user
created the dedicated Google Apps Script project but has not run it or configured
its protected Script Properties. After the security key and endpoint are authorized, it will
email a summary only when pending website comments, nominations or gear recommendations exist.
The "Pending community approvals" Gmail filter recognizes those digests and
puts them under \`TSQ/01 Pending Approvals\`, without automatically archiving
or marking them read. The D1 queue remains the source of truth for approval.

## Suggested reading order

1. **01 Pending Approvals** for moderation requests.
2. **02 Needs Reply** for correspondence requiring your response.
3. **12 Permission Restricted** and **10 Content Permissions** before
   reusing external material.
4. **03 Waiting on Reply** for outstanding outbound rights inquiries.
5. **20 Ideas & Feedback** and **21 Listening Room** for community contributions.
6. **30 Creators & Outreach** for collaborations.
7. Site and automation labels for technical maintenance.

Email remains the correspondence record. Record permission scope explicitly
in the site handoff and attribution logs before publishing external assets.
Don't automatically classify a request as permission even if it mentions
"Creative Commons" or "fair use".
