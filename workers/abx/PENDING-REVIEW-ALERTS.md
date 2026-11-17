# Pending-approval email digest: free Gmail / Apps Script setup

**Status: prepared, not activated.** The Cloudflare Worker is not deployed
and the daily Gmail script has not been installed or authorized. The
public website and new comment boards remain unchanged until the coordinated
manual release. The email digest does **not** use a paid email API.

## How it works

- A private Worker route, \`GET /v1/moderation/pending-counts\`, queries
  the existing D1 database **once per daily check**.
- The response contains only three pending-entry counts (Listening Room
  suggestions, Listening Room comments, ABX Lab comments) and a total.
  It never returns comment content, receipt IDs, user details or approval controls.
- The route requires a separate \`MODERATION_READ_SECRET\` bearer secret of at
  least 32 characters, and \`MODERATION_ALERTS_ENABLED=true\`. It does not
  allow browser cross-origin access. Missing/invalid credentials return 404.
- A Google Apps Script owned by \`thesoundquestion@gmail.com\` calls it
  around **9 a.m. Atlantic time**, once per day. If the count is zero it
  sends nothing. Otherwise it emails \`thesoundquestion@gmail.com\` a count
  and a short reminder about the D1 moderation console.
- Only you can approve/reject entries manually via the Cloudflare D1 console.
  The notifier has no edit permissions, no privileged D1 API key and no
  ability to publish comments. A user submitting an entry never triggers email.
- This costs one Worker invocation and a small D1 query per day, plus a
  single free Gmail email on days with pending entries. Check Google's
  Apps Script quotas if the account changes. Google may deliver time-based
  triggers within a one-hour window, rather than at an exact minute.

## Set up at the coordinated release

1. Generate one strong random secret, at least 32 characters. **Never commit
   it, share it in chat or place it in website JavaScript.** The secret must
   be separate from the ABX answer-randomization secret.
2. In Cloudflare's Worker configuration, set
   \`MODERATION_READ_SECRET\` as a *secret* and
   \`MODERATION_ALERTS_ENABLED="true"\` as a variable. The repository's
   Wrangler configuration defaults the alert switch to \`false\`.
3. Deploy the Worker deliberately with working D1 binding. Verify that an
   unauthorized request to \`/v1/moderation/pending-counts\` returns 404,
   and an authorized request returns only aggregate counts.
4. At https://script.google.com/ create a **private** Apps Script project
   while signed in as \`thesoundquestion@gmail.com\`. Copy
   \`workers/abx/pending-review-digest.gs\` into it. Set the project timezone
   to \`America/Halifax\`.
5. Under **Project Settings > Script Properties**, add
   \`MODERATION_READ_SECRET\` and
   \`MODERATION_ENDPOINT=https://tsq-abx.thesoundquestion.workers.dev/v1/moderation/pending-counts\`.
   Save them there, **not in script source code**.
6. Run \`installDailyPendingDigest\` once to create the recurring reminder.
   Grant the required Google permissions. Run \`sendPendingReviewDigest\`
   manually once during release testing with a test pending entry, then
   delete that entry after moderation testing.
7. Verify no email is sent when there are zero pending entries. Check the
   Apps Script Executions page for failures if alerts stop arriving.
8. Keep pending counts private. The public community API continues to show
   **only approved** posts and never exposes this read-only counter.
9. When the workflow is no longer needed, disable the Apps Script trigger
   and set \`MODERATION_ALERTS_ENABLED=false\` on the Worker.

## Visitors should see

Each submission form now states that the project is free and independently
run, that approval happens periodically and is not immediate, and that
repeated submissions are unnecessary. **Do not promise an approval time.**
For actual moderation, see \`COMMUNITY-REVIEW.md\`.
