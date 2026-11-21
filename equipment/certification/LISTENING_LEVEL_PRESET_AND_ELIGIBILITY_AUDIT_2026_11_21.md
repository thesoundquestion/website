# Listening-level preset and eligibility audit
**2026-11-21 | Draft PR #39 | No Cloudflare build or deployment**

## Questions
Are the initial listening presets realistic? Does selecting "occasionally loud" discard gear too aggressively?

## Findings
1. **Listening Builder labels were descriptive, not calibrated SPL requirements**: `quiet`, `moderate`, `high`. Its default was `moderate`, with an editable 8 ft seat distance. Neither `moderate` nor `high` initially mapped to a user-approved measured target.
2. **System Check's numerical starting example was 80 dB SPL average / 95 dB SPL peaks / 15 dB gap**. This is a *demanding but plausible louder listening scenario*, not a good universal normal-listening default. It can exaggerate perceived equipment inadequacy if a novice accepts the example without changing it.
3. **High selection had undocumented ranking pressure**: `shortlistExamples` changed product order, `compareExamplePriorities` demoted any category-labelled nearfield/active speaker beyond 12 ft without model-specific clean SPL evidence, `assessAmplifierCandidate` reduced points for lower-wattage amps, and `shortlistAmpsForOwnedSpeakers` skipped a compact-amp comparison for loud listeners. These were softer than actual safety exclusions, but made the list narrower/more expensive without adequate proof. The user should not be told "high" automatically requires a large passive amp.
4. **True hard gates remain**: incompatible architecture explicitly requested, mandatory battery operation, known unsafe/incompatible input configuration or actual electrical restriction, confirmed recall, documented insufficient clean output and region-matched firm budget when representative. A lack of rated SPL remains *unknown*, not "fails".
5. **Strong caveats still matter**: low nominal impedance, unknown impedance minima/phase, powered-monitor line-level input and safe amplifier connection, missing amplifier output at the speaker nominal load and party venue coverage are important irrespective of volume preference.

## Changes
- Qualitative listening labels explicitly say *preference*, not validated SPL threshold. Examples at the seat (not guaranteed user levels): quiet/background roughly 50–65 dB SPL average; comfortable dedicated listening roughly 65–75 dB SPL average; occasional louder listening may exceed that, with short musical peaks much higher. This guide is not a measurement or hearing-exposure allowance.
- System Check numerical default: **75 dB SPL average + 15 dB = 90 dB SPL short peak**, instead of 80/95. Both inputs remain editable. For true demanding listening, choose a scenario such as 95–105 dB peaks when warranted; **105 dB is never a safety target for sustained listening**.
- Removed special-case `level === high` reordering in editorial examples, high-level penalty in amplifier sorting, blanket category-level nearfield/distance demotion, and the high-level exclusion of compact-amp comparative alternatives. Speaker size, power, impedance and maximum clean output must be judged from model-specific evidence.
- Added/updated tests: `tests/system-builder-listening-levels.test.mjs` and `tests/system-builder-input-interactions.test.mjs`. Check consistent eligibility across quiet/moderate/high, unchanged known hard gates, clear caution at longer distances, and realistic editable calculator defaults.
- This **does not assert** that every small speaker or compact amplifier delivers any particular peak. Without model-specific clean maximum SPL/output evidence, its loud-use suitability remains conditional.

## Evidence and limits
- WHO safe-listening guidance: **80 dB(A) average up to 40 hours/week**, with permitted exposure falling as average increases. https://www.who.int/news-room/questions-and-answers/item/deafness-and-hearing-loss-safe-listening
- U.S. NIDCD: normal conversation commonly **60–70 dBA** and decibel levels depend on measurement method. https://www.nidcd.nih.gov/health/how-sound-measured
- Listening averages, sound level at seat, brief peak SPL, weighted exposure averages, recording crest factors and the amplifier's rated power are **different quantities**. Music genre, master compression, background noise, duration, room and personal preference mean there is no defensible single listening SPL everyone should use.
- Illustrative 65–75 dB dedicated listening is a pragmatic UI starting scenario, **not** a scientific preferred-level distribution or health guarantee. 75 dB average may still be too loud for some listeners or situations. Do not use microphone/smartphone readings as calibrated acoustic evidence without proper equipment.

## Remaining validation
Run full Node regression and packaged browser tests on latest draft commit. Confirm all test scenarios for powered MR4/ORA, studio monitors, owned passive speakers with small amps, and 2.1/subwoofer paths. Numerical headroom for powered speakers remains unverified unless exact usable clean maximum SPL/distance conditions justify an estimate. No production deployment is authorized.
