# Equipment record certification and legacy risk audit

**2026-11-21 baseline:** 197 unique IDs in `equipment/catalog.generated.json` on commit `fe50810f62fd47f8c8a0cf05e540e769e0780090`. Prior references to 173 are stale. The 130 classic presets, 53 research profiles and 17 Builder-only profiles are **profile counts**, not distinct model totals, because sources overlap.

## Rules

- The 197 existing records are **grandfathered, not certified**. Previous structural, mirror, generator and calculation regression tests continue to apply.
- Every **new or modified normalized record** requires a matching editorial approval in `reviews.json`. Deletions require a dated removal approval.
- The risk register prioritizes validation; **high/medium/lower** is triage only and is not a product safety or engineering verdict.
- An approval must be specific to one record fingerprint, name a reviewer, include dated field-specific primary evidence, and attest to exact variant, source/test conditions, connections/use, and recommendation safety. A source URL alone is not verification.
- Do not mark a source-backed specification as independently measured. Unknown values remain unknown. A missing verified power rating means numerical headroom is unavailable, not zero or automatically sufficient.
- Existing grandfathered recommendations are **not newly certified** and must not be advertised as verified. Any discovered safety issue is a release blocker, regardless of grandfathering.
- Never automatically change `legacy-baseline.json` on subsequent catalogue builds; it is a frozen historical audit boundary.
- Do not manually edit generated runtime outputs. Edit `equipment/source-master.json`, synchronize mirrors, regenerate, then review the affected records and add approvals.

## Workflow

1. Run `node scripts/sync-equipment-source-mirrors.mjs --check`.
2. Run `node scripts/build-equipment-catalog.mjs --check`.
3. Run `node scripts/audit-equipment-certification.mjs --write-report --check` to generate the local, non-public `equipment/certification/risk-register.generated.json` and fail any unapproved new/modified/deleted records.
4. Run `node --test tests/equipment-catalog-*.test.mjs` and relevant Builder/Checker preview tests.
5. Review high-risk items influencing impedance, continuous versus peak amplifier output, speaker sensitivity basis, powered-speaker maximum SPL, connections and subwoofer input/output wiring, headphones and audio interface output conditions.
6. Record evidence and justified unknowns in the master; add review attestation against the exact current fingerprint. Re-run gates. Do not use `reviewedOn` or an old certificate to validate a changed record.

Example approval (illustrative only, not approval):

```json
{
  "approved": {
    "some/stable-id": {
      "fingerprint": "from generated risk register",
      "reviewer": "actual reviewer",
      "reviewedOn": "YYYY-MM-DD",
      "evidence": [{"url": "https://manufacturer.example/manual", "fields": "exact rated output, load and duration"}],
      "checks": {
        "exact_model_variant": "pass",
        "source_and_measurement_conditions": "pass",
        "connections_and_use": "pass",
        "recommendation_safety": "pass"
      },
      "decisionNote": "Explain approved use, limitations and unresolved unknowns."
    }
  }
}
```

## Known limitations and next phase

The gate certifies **record-level editorial review**, not independent laboratory measurements or the full recommendation engine. A record can be accurately transcribed and still be used incorrectly in a pairing, headroom or subwoofer recommendation. Separate scenario-based regression tests must check the consuming logic, especially powered monitors with unknown SPL capability, partial amp power ratings and speaker nominal versus minimum impedance.

This first implementation does not rewrite legacy output logic or automatically suppress grandfathered models. Such behavior requires careful compatibility testing. No release/deployment is authorized by this handoff.
