# System Builder Release Matrix | 2026-11-21

**Mandatory companion:** [Full cross-tool integration contract](CROSS_TOOL_INTEGRATION_CONTRACT.md). This is an established release requirement and every new recommendation pathway must prove the complete context-preserving Builder → checker workflow; no empty generic tools.

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

## 2026-11-21 | Numerical loudness verdict regression: Yamaha A-S301 + PSB Alpha P5

**Critical user-observed failure:** The Builder displayed `Loud enough for you? Louder peaks depend on the exact speaker-and-amp pairing.` for a pairing whose relevant manufacturer ratings had **already been researched**. That is not a useful beginner recommendation and should never have passed acceptance as a completed loudness answer.

**Fix committed:** `system-builder/recommendations.mjs` carries the source-qualified speaker-plus-amp acoustic evidence for the exact A-S301/P5 pairing (PSB Alpha P5 87 dB/1 W/1 m anechoic; Yamaha A-S301 60 W/ch continuous at 8 Ω, full band). `system-builder/headroom-evidence.mjs` now calculates a listening-distance estimate using that evidence, 3 dB stereo allowance and inverse-distance loss, and compares with a defined 90 dB short peak comfortable / 95 dB occasional-loud scenario. The result states **Yes / Probably with limited reserve / Not confidently at this distance** as warranted. Estimated output, margins, original values, and approximation limits remain behind the technical dropdown, not in yellow warning boxes.

**Example:** A-S301/P5 at 6 ft, occasional-loud preference: approximately 103 dB theoretical peak versus 95 dB chosen brief target, giving about 8 dB arithmetic reserve. Main card says: **"Yes. It should have good reserve for occasional loud listening at 6 ft."** At 15 ft the predicted output is only around 95 dB before losses/uncertainty and is appropriately not called "good reserve." Deep-bass and room-dependent limits are not guaranteed by this midband model. Do not interpret numerical estimates as verified clean maximum SPL or as unsafe SPL exposure targets.

**Evidence:** [PSB P5 87 dB/2.83 V/m anechoic specifications](https://www.stereophile.com/content/psb-alpha-p5-loudspeaker-specifications), [Yamaha Canada A-S301 60 W/ch full-band continuous specs](https://ca.yamaha.com/en/audio/home-audio/products/hifi-components/a-s301/). The older Builder `source-master.json` already documented the sensitivity and amp rating, but the display code failed to use them.

**Permanent test:** `tests/system-builder-headroom-evidence.test.mjs` now demands an affirmative supported verdict at 6 ft and restrained status at 15 ft. Prior vague placeholder wording cannot return for this equipment combination. More source-qualified pairs should enter `acousticEvidence` at the time their model combination is added, not after repeated user previews. No source-free watts or maximum SPL may be fabricated.

**Limit:** This patch fixes the concrete confirmed failure and creates the generic numerical evaluator for *other* explicitly sourced pairings. It does **not** make up measured powered-speaker headroom for models without independent acoustic capability evidence. Remaining models must be migrated by evidence quality; the test suite does not certify every verdict.

### Follow-through: reuse database values for *owned* speaker/amp pairings

After the P5 incident, the numerical estimator was connected to **existing owned-equipment recommendation generation**, not kept as a one-off hardcoded pair. `system-builder/acoustic-evidence.mjs` reads catalog speaker sensitivity, its 1 W versus 2.83 V measurement basis, nominal load, and the proposed amplifier's matching-load **full-band continuous** output rating. It normalizes the 2.83 V basis for nominal loads other than 8 Ω. `owned-gear-options.mjs` and `owned-amp-speakers.mjs` now pass the resulting evidence directly into the same audience-facing assessment. Missing, burst-only, or different-impedance output ratings cannot create unsupported "yes" verdicts. Tests cover valid 8 Ω and 6 Ω cases, plus missing/burst-only rejection.

For powered recommendations without reliable numeric max-output evidence, the on-card statement is now an **actionable suitability judgment** for everyday or louder use at the selected distance rather than "worth considering, check the specs"; the optional details still distinguish intended use from laboratory verification. At long distances with a loud-use goal, the card explicitly advises choosing a more suitable high-output option rather than pretending unknown maximum SPL is an automatic pass.

**Regression rule:** A high-priority, source-qualified passive equipment recommendation must not emit "louder peaks depend on the exact pairing" or any equivalent indefinite placeholder. Every future new researched combination must pass numeric inputs at first entry where the basis is available.

### Visible System Check link is mandatory on passive recommendations

Every passive speaker/amplifier recommendation with a `Loud enough for you?` answer must show a **Check your exact listening levels** link directly beneath it, outside the collapsed technical explanation. The link goes to `/system-check/` where the listener can enter an exact listening level, distance, speaker rating and amplifier conditions. Avoid claiming the general estimate itself is a personalized clean SPL measurement. Powered and headphone systems must not be sent to a passive-only calculator as though it validated their acoustic output. Enforced by `tests/system-builder-headroom-evidence.test.mjs`.

### Critical Builder → System Check integration correction

**User-found gap:** Prior "Check your exact listening levels" linked to `/system-check/` with no context, meaning the user had to re-enter the complete recommendation and selected listening conditions. The Calculator had already supported exact-model `speaker` and `amp` URL preselection, but the Builder **never used the existing mechanism**. The PSB Alpha P5 is in the original Builder-only source master, not the System Check preset list, so a model-name URL alone still could not populate its sourced sensitivity.

**Implemented:**
- `system-builder/checker-handoff.mjs` constructs the link using exact recommended speaker/amp model, listening distance, default goal-based peak+average targets, and source-backed sensitivity/impedance/continuous amplifier rating when available.
- `system-builder/app.mjs` places this populated, same-origin link beneath **Loud enough for you?** on the card.
- `system-check/calculator.js` reads the Builder handoff on initial load, preserving its own exact-model factory presets where available; when the speaker is *not* in System Check's preset list (e.g. PSB Alpha P5), it fills the available Builder-source sensitivity/basis/nominal load into manual fields and shows an explanation. It only accepts plausible finite numeric values and doesn't silently invent power-handling data. Non-preset amplifiers can be prefilled with the source-qualified published continuous power rating.
- `system-check/index.html` displays a simple confirmation that the recommendation and listening targets were transferred.
- Regression test checks Yamaha A-S301 + PSB Alpha P5 at 6 ft and “occasionally loud” transfers `speaker=PSB Alpha P5`, `amp=Yamaha A-S301`, `distance=6`, `peak=95`, `average=80`, `builderSensitivity=87`, `builderBasis=power`, `builderLoad=8` and `builderAmpWatts=60`.

**Non-negotiable:** A generic link to an empty calculator is **not** integration. Future Builder and System Check changes must preserve and test complete, equipment-specific handoff. Powered and headphone recommendation cards must not be sent to this passive speaker calculator as if it certified powered maximum acoustic output. Users must be free to edit the prefilled targets.

**Limit:** This sends meaningful preset values and allows detailed calculation; it doesn't mean a manufacturer-rated estimate has become an exact clean-SPL measurement. Manual/full-browser testing and final release CI remain distinct.

## 2026-11-21 | First-class powered/SUB validation integration

The older statement that powered-speaker SPL and subwoofer signal/routing capabilities were not implemented is superseded by the implementations listed below. **Do not delete earlier discussion or mistake these new estimates for independently measured clean maximum output.**

- First-class **Powered Speaker Loudness Checker** at `/system-check/powered/`, using `system-builder/powered-output-evidence.mjs` and the same evaluator embedded in Listening Builder recommendations. Preserves exact model, listening distance, preference and cabinet count on the link. Creating Builder passes exact model and cabinet count and explicitly **leaves the unknown listening distance blank**.
- Full continuous-and-peak manufacturer acoustic evidence: JBL 305P MkII and QSC K12.2. Peak-only documented figures: Kali Audio LP-6 V2 (2nd Wave), Yamaha DZR15. Where continuous SPL is missing, the checker gives a peak-only judgment and **no rated continuous or clean headroom pass**. Unlisted powered models can enter the actual published peak/continuous SPL plus reference distance; their result is labelled user-reported, never manufacturer-verified. All output tiers include their evidence conditions and original source links. Do not infer SPL from internal amplifier wattage.
- First-class **Subwoofer Connection Checker** at `/system-check/subwoofer/`, using `engine.mjs` for separate source-output and sub-input evidence. Source-side documented examples are Edifier R1280DBs, original Kanto ORA, original WiiM Amp and Denon AVR-S650H (North America). Input-side exact-model fixture Edifier T5. The checker shows correct line-level cable, main-speaker filter behavior, and one of documented / unverified / incompatible / user-reported possible. It identifies **speaker-level → line-level** as an incompatible direct connection. Unlisted owners can optionally enter documented port signal roles/connectors; matching user-entered labels never creates a manufacturer-verified pass, especially with bridged power amplifier outputs.
- Listening Builder cards now present a simple subwoofer connection explanation and a prefilled crossover/connection-check link for the supported 2.1 examples, while owned sub routes with unknown input specs retain an honest unverified outcome. Creating studio/PA stages with documented acoustic data also link to the powered checker.
- Both are discoverable at `/tools/`; all checked paths are tested in `tests/builder-subwoofer-powered-integration.test.mjs` and in the desktop/mobile browser preflight. These browser tests must submit the real calculator, flip listening distance, toggle unfamiliar sub signal types and verify unknown equipment is not misrepresented as compatible.

**Permanent new-model gate:** Before a product is called output-rated or sub-compatible, add its exact specification evidence and the applicable focused unit/browser tests in the same PR. A catalogue entry may exist without acoustic data or a proven subwoofer signal route, but its recommendation cannot claim facts that have not been established. Existing 197-record research remains intact. No automatic link alone proves acoustic or electrical safety.
