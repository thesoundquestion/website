# System Builder input-combination policy (13 November 2026)

## Scope and release boundary

Implemented on the feature/system-builder-preview-20261112 branch only, not production main. The policy is a source-linked, transparent editorial decision aid. It must **not** claim a mathematical sound-quality score, guaranteed SPL, calibrated psychoacoustic fit, verified amplifier safety, or a representative average market price without the underlying evidence.

The core pure policy lives in `decision-context.mjs`. Existing editorial examples live in `recommendations.mjs`. Owned-amplifier speaker shortlists live in `owned-amp-speakers.mjs`; ownership routing stays in `owned-gear-options.mjs`.

## Decision hierarchy

1. **Hard gates first:** apply the selected architecture, mandatory battery operation, known incompatible speaker/amp loads and documented safety restrictions. Treat missing prices and measurements as unknown.
2. **Retain working owned equipment:** an existing suitable amplifier is not rebought for a party listening goal. An explicit portable/PA system or battery requirement may be a separate route, with the old equipment retained for other use. Full electrical/thermal compatibility still needs verification.
3. **Primary listening goal:** candidates tagged for the primary editorial priority appear before otherwise equivalent goal-mismatched candidates. This tag is a research lead, not a laboratory proof.
4. **Combination-specific cautions:** high-output listening at distances over 12 ft deprioritizes compact nearfield choices with no substantiated far-field clean-output evidence, without declaring that any remaining choice achieves a target SPL. Deep-bass requests without a verified high-pass demote the exact-model Kanto ORA original, because its three-inch mains cannot be assumed to provide deep bass unaided.
5. **Use case and source connection:** favor venue suitability and native connections. Show what hardware an adapter-dependent route needs. Check weather protection, mounting and power separately for outdoor use.
6. **Secondary listening goals:** compare the number of genuinely matching editorial goal tags after safety and practical needs.
7. **Regional budget evidence:** a regular price reference from the previous 30 calendar dates, including today, can break a practical tie under a firm spending ceiling. It needs the visitor’s region and currency. Save the observation date and source links. Keep expired links available and hide the amounts automatically. The buyer confirms the total at current prices, including missing components, delivery and taxes.
8. **Stable fallback:** keep the previous editorial ordering for otherwise equivalent candidates; never invent extra objective precision to break ties.

## Example input combinations

| Combination | Consequence | Unresolved checks |
| --- | --- | --- |
| Living room + loud + 16 ft | Compact nearfield examples move down | Actual clean headroom/coverage, system check |
| Desk + USB + moderate level | Native USB examples move up against adapter-dependent examples | Input type, source control, pricing |
| Bass + no sub | Known original Kanto ORA low-bass caveat demotes it | Bass extension of alternatives |
| Bass + declared verified mains high-pass | No ORA bass-without-sub demotion | Exact routing, HPF settings and sub capability |
| Party priority + owned Yamaha amp | Keep amplifier and show higher-sensitivity passive candidates, if electrical screening allows | Load minimum/phase, sustained output |
| Party/PA architecture + owned stereo | Keep stereo as a separate reusable pathway | Full PA system cost, coverage |
| 8 Ω-only Yamaha R-S202 + 6 Ω party tower | Exclude that specific pairing | No favorable preference overrides known load rule |
| Outdoor + battery required | Mains-only options excluded | Battery runtime at level, safety, weather/coverage |
| Firm budget + recent, local regular price | Reference can break a tie between otherwise suitable examples | Check today’s price for the complete path |

## What is NOT implemented yet

- A rights-cleared and acoustically comparable model-wide **max clean SPL / compression / distortion** catalog; sensitivity does not substitute.
- Verified level and distance calculations inside Builder; use the existing System Check headroom model for eligible passive systems. Never duplicate its formula with weaker assumptions.
- A true room and speaker directivity model, measured low-frequency extension, thermal compression, bass-management implementation, outdoor coverage map, or speaker-specific amplifier impedance/phase verification.
- A representative regional price model from sufficiently sampled ordinary selling prices and completed used transactions. Existing retailer prices remain partial examples.
- A verified tonal-character mapping from the `character` selector to actual comparative acoustic measurements. Continue to disclose this.
- A calibrated personalized sound-quality numeric score or percentage match. None should be generated from editorial tags or a few owner anecdotes.

## Verification and regression

`tests/system-builder-input-interactions.test.mjs` covers secondary goals, native input, high output at distance, recent-price tie-breaking, subwoofers, battery and party gates. `tests/system-builder-price-references.test.mjs` covers the expiry boundary and retained links. `tests/system-builder-party-speakers.test.mjs` verifies owned amplifier reuse for party priorities and explicit PA architectures. The suite also covers compatibility, pricing provenance, equipment ownership and page output.

Run `node --check system-builder/*.mjs`, then `node --test tests/*.test.mjs`. Review the GitHub Actions run for the final head. Full browser-accessibility and deployment smoke tests are still a release gate; do not merge into main solely because Node tests pass.
