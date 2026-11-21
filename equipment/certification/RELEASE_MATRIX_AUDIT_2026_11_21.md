# System Builder Release Matrix | 2026-11-21

**Scope:** Draft PR #39 only. Not deployed. This is a repeatable release gate, not another round of original specification research.

## Objective
Prove that beginner-facing recommendations survive realistic cross-products of listening preferences, space, distance, connection requirements, ownership, budget and subwoofer routing. **Do not recommend unsafe or unresolved safety-critical equipment combinations**, do not fabricate loudness numbers, and do not clutter eligible cards with prominent technical alerts.

## Automated coverage and results

The committed `tests/system-builder-release-matrix.test.mjs` runs under the existing Site regression GitHub Action. Its coverage includes:

| Coverage | Cases | Dimensions and invariants |
| --- | ---: | --- |
| New-system requests | **15,120** | 7 goals × 5 venues × 6 architectures × 3 listening preferences × 4 distances (3/6/10/15 ft) × 6 input requests. Reject blocked products, bad/missing part counts, incorrect specified architecture, duplicate candidates, invented numerical acoustic claims, powered-to-passive-calculator links, out-of-scope results. |
| Owned equipment | **972** | Nine ownership patterns × three listening levels × four distances × three goals × three inputs. Includes a known Yamaha R-S202/ELAC nominal-load conflict, missing unlisted speaker identification, source/headphone ownership and amplifier-only or speaker-only routes. Reject any selected owned equipment pairing with known safety blockers. |
| Regional/budget references | **1,024** | CA/US/GB/AU × four budgets × strict/flexible × four architectures × four inputs × current/expired reference dates. Forbid made-up market prices, expired numbers or invented prices for missing adapters. Regionally sourced Edifier R1280DBs pricing remains valid in its documented markets. |
| Focused crossover & electrical gates | **Dedicated tests** | Battery requirement, Fosi/Polk blocked-pair rule, 2.1 routing isolation, unknown owned-sub connection and named manufacturer load floors. |

**Total wide-matrix combinations: 17,116.** Additional targeted assertions run within the release test and existing `tests/*.test.mjs` suite. Combinations are automated software checks, NOT 17,116 independently measured acoustic setups or guarantees of real-world loudness.

## Corrections discovered while auditing
1. The 15,120-case scan originally had an incorrect expected test count. Corrected to the exact cross product. The complete scan itself did not expose a blocked selection or unsupported loudness assertion.
2. Existing studio/portable and ownership paths were included in the 972-case safety check; this is intended to remain a permanent regression guard.
3. On eligible cards, a required input adapter was hidden after removal of the yellow warning. The card now shows a **neutral one-line disclosure**: “Connection: an additional adapter or source device is needed (not priced).” It does not claim the extra hardware is included.
4. The optional details previously duplicated one battery source/output caveat. Removed the duplicate.
5. The additional price test initially assumed only Canadian examples could have credible numeric prices. Corrected: the original Edifier R1280DBs example has separately documented US and UK regional reference prices too. The test must preserve them, not falsely treat them as currency leakage.

## Beginner UI contract
A recommendation card should answer, in ordinary language:
- **Why this equipment** for the stated goals and listening place.
- **Will it be loud enough?** A useful *qualitative* fit at the selected distance and level, without pretending to have actual verified seat SPL.
- **Will it connect?** If an additional unpriced component is essential for the selected input, disclose it plainly.
- **What does it cost?** Preserve known component prices only in the correct dated region and currency.
- **What is included?** Complete components, any known required extra equipment and source links in collapsible detail.

Power tests, frequency/phase/burst conditions, original owner sources and bass-management engineering stay in collapsed `details`, not a yellow banner. A known unsafe/mismatched load goes to **excluded** and must never be a highlighted purchase.

## Important remaining boundaries
- Qualitative “reasonable at 6 ft” is editorial guidance based on product category, intended use and known limits; **not a tested or guaranteed clean SPL**. The programme cannot prove a speaker is loud enough for every listener without calibrated data.
- The test covers recommendations emitted by the editorial examples and scripted owned-gear paths. It does **not** cover every possible freeform text input, field-verified subwoofer signal path, serial-specific recall, local installation or all browser rendering combinations.
- Published asking-price snapshots are not current prices, installed-system totals, or representative transactions. Confirm when shopping. A strict budget is not automatically a hard block when only nonrepresentative asking references are available.
- Power/impedance estimates and speaker maximum-sound-level labels are not independently rechecked by this matrix. Continue to use historical evidence, engineering reviews and explicit change gates.
- Manual/mobile UX inspection and final GitHub-only browser preflight are distinct from Node regression. No public release or Cloudflare deployment is authorized by this document.

## Ongoing rule
**Run this matrix for every meaningful recommendation, equipment-source, connection, price or UI change in GitHub CI.** New recommendation types must be represented in both matrix dimensions and focused case assertions. Preserve existing earlier research and source provenance; verify only changed or contradictory claims. Do not deploy when the site regression or browser preflight fails.
