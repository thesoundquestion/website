# Gear suggestions: private D1 intake and verified preset review (draft only)

## Goal

Let System Check visitors suggest audio equipment **without** giving strangers
write access to the published System Check or System Builder catalogue.
Submission is a research lead, not a verified model record or recommendation.
No login, email, name, serial number, or user-uploaded file is requested.

### Existing shared catalogue

- `system-check/gear.js` contains the curated `systemCheckGear` arrays:
  `speaker`, `amp`, `headphone`, and `source`.
- `system-builder/catalog-adapter.js` uses these same arrays read-only, so
  publishing a properly verified catalogue addition supports both tools.
- DACs are filed as `source` entries, with the actual analogue output clearly
  identified. No headphone-output rating is silently applied to an RCA output.
- The `other` category needs deliberate classification before any preset can be published.

## Staged technical design (NOT deployed)

- `tools/recommend-gear/index.html`: dedicated **Recommend your gear** page, linked from System Check, Compare My Gear, System Builder and Tools, with an explicitly disabled draft form (`data-submissions-enabled="false"`).
- `tools/recommend-gear/app.js`: on direct submit, POST
  `/v1/gear/submit`; never transmits calculator values, audio, an email or a user ID.
- `workers/abx/gear-suggestions.mjs`: validates category, manufacturer,
  exact model, optional version/year/region and notes/reference URL, then inserts a row with
  status `pending`. It does **not** expose a public GET/list/approve endpoint.
  Abuse is limited with the existing `COMMUNITY_LIMITER`. It does not
  fetch user-provided URLs, and the table has no IP/name/email columns.
- `workers/abx/gear-schema.sql`: **not applied to live D1**. Run only during
  a separately approved Worker/database release. Table is in existing
  `tsq-abx-scores` D1 database, no new account or separate database.
- `workers/abx/wrangler.toml`: independent
  `GEAR_SUBMISSIONS_ENABLED = "false"`; do not open with the ABX/Community flags
  automatically. Public site and Worker must be coordinated before turning on.
- Pending entries expire after 90 days without review; rejected entries 30 days
  after rejection. Accepted/added rows may remain as a reviewer trail.

## Assistant review access

The connected Cloudflare D1 API has been tested via a read-only
`sqlite_master` query against the existing authorized database.
After approved schema application and public intake, the assistant can retrieve
pending models with a **read-only D1 SELECT** through the connected account.
This is an admin-only connector action; the site does not expose pending records.

Example read query, for authorized maintainer use:

```sql
SELECT id, category, brand, model, variant, approx_year, region, specifications, reference_url, created_at
FROM gear_suggestions
WHERE status = 'pending'
ORDER BY created_at ASC
LIMIT 30;
```

Do not call the above until the schema exists. Missing table today is expected.
Never expose the full pending queue publicly. Do not automatically run a SELECT
every time somebody opens System Check; it is an admin review workflow.

### Per-submission research checklist

1. Normalize maker and exact model/variant/year, checking for duplicates already
   in `gear.js`. Treat similarly named models as distinct unless verified.
2. Prefer official manuals and spec sheets; then credible independent bench tests.
   Search for dated sources and preserve URLs and which specific test yielded
   each number. An owner assertion is not independent verification.
3. Record only relevant, supported fields, with units and conditions:
   - **Amplifiers/receivers:** continuous **watts per channel**, stated load
     (4/6/8 ohms), number of channels driven, test bandwidth, THD/THD+N
     threshold, input impedance/gain/sensitivity when available, real
     measurement curves only if measured.
   - **Passive speakers:** sensitivity and whether it is 1 W or 2.83 V at
     1 m, nominal impedance and measured minimum when supported, published
     continuous/peak/recommended power kept in distinct categories.
   - **Headphones/IEMs:** impedance, sensitivity with exact reference
     (dB/mW versus dB/V), impedance variant, open/closed/in-ear design,
     independent output loading where available.
   - **DACs/sources:** connection/analogue output used, V RMS and output
     impedance if published, test conditions of SNR/THD+N. Do not confuse
     digital input ratings with analogue output levels.
4. Mark any conflict, unverifiable claim or missing condition as **unverified**;
   omit from numeric presets instead of inventing a value. Provide a short
   beginner-friendly note explaining limitations.
5. Produce a proposed `gear.js` record and source-by-source explanation.
   Do not automatically approve or publish. Curator reviews the proposed
   numbers and source links before a GitHub draft commit.
6. Run System Check and System Builder regression tests, confirm calculators
   still distinguish manufacturer ratings from measured points, and confirm
   existing records were not overwritten.
7. Only after verified publication, mark the D1 submission `added` (or
   `approved` if verified but not yet added); keep the related GitHub
   commit and supporting URLs in the review notes. A record is never
   promoted by changing D1 status alone.

### Daily email notifications

The private `workers/abx/moderation-summary.mjs` route now counts pending
`gear_suggestions` when the independent `GEAR_SUBMISSIONS_ENABLED` flag is true.
The existing 9 a.m. Google Apps Script digest (`workers/abx/pending-review-digest.gs`)
includes that count alongside Listening Room and ABX discussions and sends
nothing if the entire queue is empty. It never includes unreviewed model text.
No second daily script or Gmail filter is needed. This is staged and disabled
until the D1 table, Worker and Gmail authorization are intentionally released.

### Operational status

- Connected Cloudflare D1 read query: **verified** on 2026-11-17.
- Public standalone `/tools/recommend-gear/` form: **staged in PR #15, inactive**.
- Worker endpoint: **staged, not deployed**.
- D1 gear table: **not yet created**.
- No live submissions, public API or public preset modifications from this work.
- Do not represent this feature as available at release until the
  independent gate and end-to-end D1, privacy, abuse, UI and calculator checks pass.

### Release checklist

- [ ] Approval to apply `gear-schema.sql` to D1 and verify correct indexes.
- [ ] Confirm real D1 INSERT, validation, duplicate handling, rate limits and no public pending GET.
- [ ] Confirm pending queue read through connected Cloudflare D1 account.
- [ ] Confirm privacy and retention wording, review/delete permissions and receipt process.
- [ ] Enable Worker flag separately; test cross-origin requests and errors.
- [ ] Enable `/tools/recommend-gear/` form in approved site build only when Worker is healthy; verify all three tool links and Tools hub.
- [ ] Test real mobile and desktop form accessibility and error messages.
- [ ] Ensure preview-only / unavailable wording is removed from the final
      visitor experience when the feature becomes operational.
- [ ] Keep all submitted specifications out of the public preset files
      until the review process above is completed.
