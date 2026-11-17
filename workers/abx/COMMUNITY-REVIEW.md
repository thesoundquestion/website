# Community moderation — Listening Room and ABX discussion

**Status:** 2026-11-17 draft. Moderation UI is intentionally not publicly accessible.
The community system uses the existing Cloudflare D1 database `tsq-abx-scores`,
table `community_posts`. Its separate launch switch `COMMUNITY_PUBLIC_ENABLED`
remains `false` in `workers/abx/wrangler.toml`. The database schema has already
been applied; the Worker and website have **not** been deployed.

## What visitors can do

- Listening Room: nominate **one recording** (artist, title, one of seven existing categories, a 20–280-character listening cue) and leave a 5–280-character comment.
- ABX Lab: leave a 5–280-character comment about listening experiences and test ideas.
- Submissions require agreement that the text may be published after review. No accounts or real names required. Links, uploads, embedded HTML and media files are not accepted.
- The browser receives a random receipt identifier; it can be supplied when requesting removal via thesoundquestion@gmail.com.

All submissions begin with `status='pending'`. The public GET endpoint returns
**only approved** rows, ten at a time, newest reviewed first. Visitors can
filter track suggestions by category and see more entries with a pagination
button. Approved suggestions have a site-generated Spotify *search* link;
a suggestion is **not** automatically added to the official playlist.

## Manual review through Cloudflare D1

Open Cloudflare Dashboard → Workers & Pages → D1 → `tsq-abx-scores` → Console.
Run these SQL statements one at a time. Moderation actions require your Cloudflare
account; the website has **no publicly reachable admin or approval endpoint**.

View recent pending entries:
```sql
SELECT id,section,kind,category,artist,title,body,
       datetime(created_at/1000,'unixepoch') AS received_utc
FROM community_posts WHERE status='pending'
ORDER BY created_at ASC LIMIT 50;
```

Before approving, check for spam, hate/harassment, identifying information,
copyrighted lyrics, URLs disguised as text, duplicate nominations, misleading
attribution, irrelevant material and excessive profanity. The Listening Room
is meant to encourage *unique or lesser-known recordings*, but popular music
can qualify when the explanation is worthwhile.

Approve one entry:
```sql
UPDATE community_posts SET status='approved',
 reviewed_at=(unixepoch('now')*1000)
WHERE id='PASTE_RECEIPT_ID' AND status='pending';
```

Reject one entry:
```sql
UPDATE community_posts SET status='rejected',
 reviewed_at=(unixepoch('now')*1000)
WHERE id='PASTE_RECEIPT_ID' AND status='pending';
```

Remove an approved entry, or honor a contributor deletion request:
```sql
DELETE FROM community_posts WHERE id='PASTE_RECEIPT_ID';
```

Verify what the public site would show:
```sql
SELECT section,kind,category,artist,title,body
FROM community_posts WHERE status='approved'
ORDER BY reviewed_at DESC LIMIT 20;
```

Do not approve by inserting directly or changing D1 constraints. Avoid public
lists of pending entries. A receipt cannot authenticate the submitter, so
handle takedown requests reasonably and avoid promising proof of ownership.

## Retention, safety and free-tier use

- Unreviewed pending rows automatically delete after **90 days**.
- Rejected rows automatically delete after **30 days** from review.
- Approved rows remain public until removed by moderation or a deletion request.
- The daily Worker cron runs cleanup alongside ABX session retention; the
  cron starts only when the Worker is deliberately deployed.
- No IP address, email, name or user-account ID is saved with D1 submissions.
  Cloudflare's Rate Limiting binding uses temporary per-IP/location counters
  outside the database. The limit is **3 submissions/minute per location/IP key**.
  This is an abuse deterrent, not a guarantee against bots.
- The frontend requests approved entries only when visitors scroll to the section;
  it uses two small paginated queries for the Listening Room and one for ABX.
  No third-party comment service or database is needed.
- The same free-tier D1 account also stores ABX scores; monitor row reads/writes
  and keep `COMMUNITY_PUBLIC_ENABLED=false` if the quota or moderation workload
  becomes excessive.

## Pre-release checks

1. Unit-test valid/invalid submissions, consent, categories, duplicate recordings,
   pending invisibility, approved-only pagination and rejected posts.
2. Verify browser forms remain disabled while the Worker is not enabled.
3. Check 280-character counters, category labels, mobile layout, form keyboard
   accessibility and public results rendered only via `textContent`, never
   untrusted `innerHTML`.
4. Confirm privacy notice and reviewer email are current.
5. Manually deploy the Worker first with both flags disabled, verify D1 binding
   and rate-limit bindings, then enable community by an **explicit** deliberate
   Worker configuration change. Keep ABX scoring separately toggleable.
6. Submit a controlled sample, ensure it remains pending, approve via the D1
   Console, verify it appears on the website, then delete the sample.
7. Only after a functioning Worker is verified, merge/deploy the Pages update
   manually once. Verify links and traffic quotas. No automatic build.

## Visitor-facing moderation expectations

Each community submission form now contains a quiet notice that this is a free, independently run site and entries are approved periodically. Comments and nominations remain pending until review; visitors are asked not to send duplicates just because an entry has not appeared yet. This note must not promise a specific response time or imply that submission guarantees approval.
