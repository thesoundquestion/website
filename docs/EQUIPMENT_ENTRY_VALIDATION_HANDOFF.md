# The Sound Question | Permanent Equipment Entry Validation Handoff

**Effective:** 2026-11-21. **Scope:** EVERY future equipment model, revision, equipment profile correction, curated Builder system and consequential product-data update. **Status:** ongoing engineering standard, not approval to deploy.

## Why this exists

Repeated pre-release discovery of missing headroom, unsupported source connections, misleading retail price evidence, and unreviewed listening claims is expensive and avoidable. **Research once when entering the device. Do not push uncertainty into the first public recommendation or leave it for release-day QA.** Passing unit tests does not independently verify source truth. This process joins an auditable editorial sign-off with automated admission and scenario tests.

## Ownership, source of truth, and non-negotiable boundaries

1. Edit **`equipment/source-master.json` first** for devices. Do not edit generated `equipment/catalog.generated.json`, `system-builder/catalog-supplements.generated.mjs`, or legacy mirror files independently. Maintain exact variant identity, stable ID, family/edition, and documented unknowns. One physical device may have separate typed functions, but do not merge variant models.
2. New curated system ideas live in `system-builder/recommendations.mjs`, `system-builder/budget-examples.mjs` and `system-builder/stereo-subwoofer-examples.mjs`. System-level assertions belong in `curated-pairing-evidence.mjs`, `recommendation-safety-gate.mjs`, `recommendation-headroom.mjs`, `stereo-subwoofer-examples.mjs` and dedicated tests.
3. **Evidence is claim-specific.** A product page establishes manufacturer assertions, not independent sound judgment or clean SPL. Independently checked manufacturer manuals/published specifications are preferred for electrical facts, exact ports, speaker-load requirements, power test conditions, limits, warnings, crossover and signal roles. Individual reviews are evidence for listening impressions, not consensus or measured universal performance. Retain source link, revision and wording/conditions. If a source disappears, mark unknown or find a reliable replacement rather than copying unsourced claims.
4. Never treat nominal ohms as the minimum impedance, rated amplifier watts as the speaker's clean SPL or damage threshold, an advertised *peak/dynamic* rating as a continuous power test, or headphone sensitivity in dB/mW as dB/V. For powered speakers, **acoustic maximum SPL requires an explicit measurement distance and compatible test definition** before a distance-based numerical margin can be presented. Do not assume 1m from a nearby input-sensitivity specification. Use nonnumeric practical guidance where acoustic limits are unknown.
5. Typed connections must describe **signal direction and electrical role**, not just matching connector shapes. A USB power port is not a USB audio input; a headphone output is not a speaker output; analog RCA does not imply an optical/HDMI/USB input. Any external converter becomes a separately documented and priced component, not a magic free adapter.
6. Subwoofer routes must establish amplifier output (mono line-level Sub Out, pre-out, speaker level), subwoofer accepted input, need for line/speaker cables, optional splitter if actually supported, actual main-speaker high-pass vs unfiltered full-range, crossover controls, subwoofer low-pass, wiring and remaining source/volume control. Do **not** assume plugging in any powered sub automatically high-passes the main speakers. Keep ORA original vs ORA4, R1280DB vs DBs, WiiM Amp vs Amp Pro and firmware/setting distinctions explicit.
7. Strict-budget results must **exclude known over-budget current subtotal**. Unknown regional price is **not free and not evidence of affordability**. Preserve currency, region, quote date, tax/shipping omissions, package quantity, supply, cables, stands, accessories and (for two separate monitors) *two unit prices*. Expired prices remain null and keep links only. Flexible-budget shopping comparisons can show higher-price items but must label them.
8. Every recommendation must have a sensible room, source and goal; when a leading option lacks the specific editorial room/goal evidence it is a **research lead**, not a certified fit. Hard power/environment/load/recall/connection restrictions exclude the option. If no model qualifies, tell the visitor **which known constraint failed**, not a vague “try again.”

## Admission gate: required on the same change as the new or edited record

**Files:**
- `equipment/entry-gate-baseline.json` freezes **197 existing normalized records** by stable ID and content fingerprint, plus **22 existing curated system example IDs**. Historical baseline entries are NOT individually certified. **Never regenerate this baseline to make a failing review disappear.**
- `equipment/entry-review-ledger.json` stores newly completed model/revision reviews.
- `scripts/validate-equipment-entry-gates.mjs` compares the current generated catalog against the frozen baseline and current ledger. A new or materially changed device is blocked without an exact current record fingerprint. A new curated system ID also requires evidence review and an executable scenario test. Existing curated systems continue to be covered by the general suites; changes to them must still be reviewed under the editorial protocol.
- `tests/equipment-entry-gate.test.mjs` verifies real and simulated changes, including stale approvals, missing manufacturer evidence, unidentified model revisions and incomplete tests.
- `.github/workflows/builder-draft-integrity.yml` runs synchronization and generated-data checks, then the entry gate and complete Node/browser preflight on the **draft branch**. All validation stays in GitHub, never Cloudflare.

**For each device entry or changed existing device:**
1. Establish exact `id`, manufacturer/model, physical revision, region and functions. Research the primary manual/spec sheet and record the exact relevant claim(s). Verify which figures are *measured*, *manufacturer rated*, *reviewer impressions* or *unknown*.
2. Record speaker/amplifier/headphone electrical conditions: load nominal/minimum, wattage at a specified impedance and duration, sensitivity basis/distance, source output/input levels, required power supply and manufacturer restrictions. Do not create a “safe” pairing from unmatched output ratings.
3. Record signal path at both ends: actual input/output, connector and level, speaker vs line, phono requirement, HDMI ARC/PCM conditions, USB audio vs USB power, controls, adapters/cables, powered vs passive speakers, subwoofer crossover behavior, high-pass status and unknowns. Keep optional accessories outside included bundle until priced or explicitly included.
4. Determine whether numeric headroom is defensible using measured/published acoustic references. For passive systems independently reproduce theoretical dB at the selected distance (single speaker, no fictitious stereo/room gain), and follow real published amplifier load and continuous-power limits. For powered speakers require a documented max acoustic SPL *and its reference distance*, or show only qualified practical guidance. Unknowns must remain visible.
5. Attach listening impressions **only for the exact model** from identified independent reviews/owners, with nuanced and nonuniversal language. Separate manufacturer marketing from independent listening. Do not manufacture amplifier/DAC “sound signatures.”
6. Determine local dated costs, quantities, the date/region/currency of each observation and accessories. Either establish a documented subtotal or explicitly leave it unknown. Run strict-budget negative tests and flexible-budget comparisons.
7. Write/extend **negative and positive scenarios**: at least one usable native input, incompatible input, unusual/specified speaker load, honest high-volume and long-distance headroom boundary, owned gear sequencing, optional sub routing, cheapest feasible setup, missing or expired price, deliberate no-match explanation, and 320px + mobile path when interface changes. Test the **actual page**, not only the helper function.
8. Regenerate mirrors/catalog, inspect output changes, then record the actual attestation in `entry-review-ledger.json`. Use **exact current fingerprint** obtained from `node scripts/validate-equipment-entry-gates.mjs --pending`; re-review after *every subsequent data modification* since old fingerprints will fail. For a curated system, ledger `testedScenarios` must name actual runnable tests.
9. Commit data, ledger and tests **together** before seeking a preview or release. A green CI is required but cannot replace an independent source truth check.

### Ledger record format (example template only; never paste as a false completed review)

```json
{
  "fingerprint": "exact value from --pending",
  "model": "Exact model (revision)",
  "reviewedOn": "YYYY-MM-DD",
  "releaseDecision": "accepted_with_unknowns",
  "evidence": [
    {
      "type": "manufacturer",
      "url": "https://manufacturer.example/exact-manual",
      "claims": "Exact page/section for ports, electrical limits and specified conditions"
    }
  ],
  "checks": {
    "identity": "verified",
    "manufacturerSpecs": "verified",
    "signalRoles": "verified",
    "loadsAndSafety": "verified",
    "acousticHeadroom": "unknown",
    "regionalPricing": "unknown",
    "soundClaims": "not_applicable",
    "accessoriesAndSubRouting": "not_applicable",
    "outputAndRegression": "verified"
  },
  "unknowns": [
    "Maximum acoustic SPL at a documented distance and distortion condition not available",
    "No current comparable local retail price"
  ]
}
```

Every checklist value must be `verified`, `unknown` or `not_applicable`; `unknown` requires explanatory `unknowns` and cannot be called fully verified. Use `research_only` for unqualified devices and never present research-only entries as ready-to-buy matched configurations. An example record also requires a nonempty `testedScenarios` array identifying its executable test(s). A manufacturer source and description are mandatory. The ledger is an accountable **human/editorial attestation**, not automatic proof that an external page tells the truth. Check that evidence actually supports claims.

### Repeatable commands

```sh
node scripts/sync-equipment-source-mirrors.mjs --write
node scripts/build-equipment-catalog.mjs
node scripts/sync-equipment-source-mirrors.mjs --check
node scripts/build-equipment-catalog.mjs --check
node scripts/validate-equipment-entry-gates.mjs --pending
node scripts/validate-equipment-entry-gates.mjs
node --test tests/equipment-entry-gate.test.mjs tests/system-builder-release-acceptance.test.mjs
node --test tests/*.test.mjs tests/lesson-tutor/*.test.mjs
node scripts/build-public-site.mjs
```

**Do not automatically accept generated output.** Before the final gate, review how new records appear in all relevant Builder/Checker/Compare paths, including headroom, sound notes, signal routing, missing prices and System Check links. If an entry is intentionally removed, do not silently rewrite the frozen baseline: document the removal/migration and update the policy deliberately with owner review.

## Source review snapshots from the November 21 pass

- **WiiM original Amp:** official advanced Subwoofer Bypass / Main Speakers Output Bass documentation distinguishes default high-passed main speakers from options that send bass to them or bypass the sub's low-pass. Its actual settings must be represented before describing a wired route as high-passed. `https://faq.wiimhome.com/en/support/solutions/articles/72000634761-subwoofer-advanced-options-subwoofer-bypass-mode-main-speakers-output-bass`
- **Kanto original ORA:** Kanto documents an automatic 100 Hz high-/low-pass when sub connected. Do not copy to ORA4 or assume this proves increased clean acoustic SPL. `https://kantoaudio.com/powered-speakers/ora/`
- **Edifier R1280DBs:** manual states the main speakers' bass is reduced when a sub is attached; **no validated numeric crossover frequency** in the referenced manual. Preserve this uncertainty; do not infer an exact high-pass slope. `https://ca.edifier.com/products/r1280dbs`
- **JBL 305P MkII:** JBL's maximum output specification omits explicit measurement distance (even though its separate input sensitivity has 1m). Do not manufacture numerical distance-scaled headroom. The correction is in `system-check/powered-headroom-model.mjs`.
- **Yamaha A-S301 / PSB Alpha P5:** independently cross-checked the model's 60W/8Ω continuous specification and 87dB/2.83V/1m sensitivity. Keep the single-speaker theoretical projection distinctly labelled.
- **Pricing and scenario history:** the 4,500-case acceptance matrix exposed 687 known over-budget leaders before the strict budget gate. This was corrected to zero; many empty results were genuine unsupported scenarios. The source-to-output audit lives in `docs/BUILDER_COMPREHENSIVE_AUDIT_2026_11_21.md`.

## Final release gate (separate from entry gate)

A review of **new data at insertion** greatly reduces the release workload; it does not eliminate the need to check integration and real devices. Before deploying: verify merged branch/tree, changed generated outputs, full CI at the exact head commit, primary/alternative claims, owner-facing screen flow on physical mobile, audio labs/ABX fairness, privacy/rights, live services and a specific rollback target. Keep production `main` and Cloudflare Pages unchanged until the owner explicitly authorizes that exact merge and deployment.

**Current status:** draft only, no Cloudflare build/deploy authorization. Future assistants: start here and in `AGENTS.md` BEFORE adding equipment, sound profiles or new complete-system examples.
