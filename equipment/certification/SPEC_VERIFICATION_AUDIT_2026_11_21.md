# Equipment catalogue | Consolidated specification verification pass
**2026-11-21 | Draft PR #39 | 197 unique models | No deployment**

## Scope and evidentiary boundary
Every one of the 197 records was included in a **mechanical field-coverage and evidence-risk scan** (see `spec-verification-pass-2026-11-21.json`). This does **not** mean the cited manuals for all 197 were read or that their specifications are factually certified. Thirteen exact model records had specific claims compared against primary manufacturer publications or, for WiiM, an explicitly identified independent bench test. No full-record approvals were issued.

Avoid the false implication that a passing test or attached source URL proves the whole product specification. Old records remain grandfathered and uncertified. Do not turn these 10 partial checks into review approvals.

## Whole-catalogue flags (overlapping populations)
| Risk/evidence flag | Records | Meaning |
|---|---:|---|
| No structured amplifier/speaker connector topology | 100 | No verified ports in normalized mapping; NOT proof connections do not exist |
| Secondary/archival source needs editorial trace | 19 | Exact claim and original model/version should be checked |
| Burst rating present | 15 | Keep dynamic power separate from continuous headroom |
| Speaker sensitivity unknown | 11 | A reliable numerical speaker SPL estimate is not supported |
| Speaker nominal impedance unknown | 9 | No default guessed impedance or compatibility assurance |
| Speaker peak power without continuous field | 7 | Do not treat peak wattage as continuous |
| Amplifier without comparable rated power | 3 | No numerical continuous-output headroom from those entries |

**All 197 have at least one evidence URL**, but existence of a URL does not mean it was inspected, correct, available, or matched to the exact claim.

## Field-level crosschecks
- Yamaha **A-S301/A-S501/A-S701**: Yamaha's shared specifications table confirms their distinct 8 Ω continuous ratings (60/85/100 W), 6 Ω ratings (70/100/120 W), matching THD/frequency test conditions and separate IHF dynamic values. The source explicitly excludes some regions for 6 Ω ratings. https://fr.yamaha.com/files/download/other_assets/0/332210/web_VEX7920_A-S701_A-S501_A-S301_om_G_EnFrDeSvItEsNlRu_A0.pdf
- **Denon AVR-S650H, North America**: Denon confirms 75 W + 75 W at 8 Ω, 20 Hz–20 kHz, 0.08% THD and 4–16 Ω output terminal specification. These facts do not independently establish satisfactory driving of any selected loudspeaker. https://manuals.denon.com/avrs650h/na/en/GFNFSYbsjxinov.php
- **FiiO FT1**: maker confirms 32 Ω, 98 dB/mW and 113 dB/Vrms at 1 kHz, which are distinct reporting bases. https://fiio.com/ft1
- **WiiM Amp**: third-party lab lists 64 W at 8 Ω and 125 W at 4 Ω below 1% THD. Keep manufacturer and lab provenance distinct. https://www.hifinews.com/content/wiim-amp-lab-report
- **Fosi BT20A Pro**: maker lists 32 V/5 A bundled adapter and 300 W × 2 @ 4 Ω *maximum*. Do not use that maximum for verified continuous output, headroom or a safe recommendation. https://fosiaudio.com/products/bt20a-pro-2-channel-bluetooth-power-amplifier
- **Polk Monitor XT15**: official documentation describes compatibility with 4/8 Ω amplifier outputs. That wording is not itself a measured nominal impedance and cannot independently verify a claimed impedance minimum. https://www.polkaudio.com/en-ca/product/home-speakers/satellite-surround/monitor-xt15/300147.html
- **Yamaha HS5**: Yamaha confirms 45 W LF + 25 W HF internal power, 74 Hz–24 kHz (-3 dB) and 54 Hz–30 kHz (-10 dB). One powered enclosure is not a stereo pair; summed amp watts are not verified SPL capability. https://ca.yamaha.com/en/audio/music-audio-production/products/studio-monitors/hs-series/specs.html
- **Yamaha R-S202**: 100 W/ch at 8 Ω, 40 Hz–20 kHz, 0.2% THD confirmed by Yamaha Canada; must not be compared unqualified against a 20 Hz–20 kHz low-THD rating. https://ca.yamaha.com/en/audio/home-audio/products/hifi-components/r-s202/specs.html

### Additional verified source conditions
- **Yamaha HS7/HS8**: Yamaha publishes 95 W (60 W LF + 35 W HF) and 120 W (75 W LF + 45 W HF) internal amplification respectively. These are bi-amplifier allocations for single active enclosures, not safe maximum-SPL or room headroom ratings. https://usa.yamaha.com/products/proaudio/speakers/hs_series/specs.html
- **AIYIMA A07 MAX**: Maker’s 300 W × 2 at 4 Ω maximum is conditioned on **48 V / 12 A** and stereo mode. Listed retail bundles include other power supplies; therefore the rated continuous output remains unverified. https://www.aiyima.com/products/aiyima-a07-max
- **Polk XT15 update**: The actual Polk primary owner’s manual directly establishes **86 dB at 2.83 V/1 m**, **4.1 Ω minimum impedance** and **73 Hz–26 kHz (-3 dB)**. Its separate 4/8 Ω amplifier-compatibility language does **not** prove that it is a flat 8 Ω load. The catalogue’s nominal 8 Ω is sourced separately to a retailer, and still deserves an exact-model check. https://www.polkaudio.com/on/demandware.static/-/Library-Sites-polk_northamerica_shared/default/dw9cd07cce/downloads/monitor-xt-series-owners-manual-global.pdf

**Machine-checkable crosschecks:** `verified-field-assertions.json` now pins 41 independently compared values/conditions across 13 products. `tests/equipment-spec-evidence.test.mjs` detects drift and guards against promoting marketing peak watts or active-monitor internal amplification to comparable continuous ratings. These tests confirm transcription and preservation of checked fields, not full product safety or recommendation suitability.

## Release implications and next checks
1. **No blanket certification.** Finish field-by-field source crosschecks and date them before approving affected model records.
2. **Do not compute a definitive powered-speaker headroom estimate from onboard amp wattage** without verified output SPL assumptions. Use an explicit qualified estimate or unknown.
3. **Keep dynamic and peak amplifier figures out of continuous headroom calculations**, and refuse an invented wattage on Fosi and AIYIMA profiles with no comparable rated output.
4. **Safety claims are use-case-specific.** Manufacturer *compatible with 4/8 Ω outputs* is not a guarantee for any particular nominal/minimum speaker impedance or load interaction.
5. **Missing typed connectors are research gaps**, not necessarily pairing failures. Map only supported signal types and physical ports.
6. **Test the recommendation output separately**. Record-level factual accuracy does not establish pairing, clipping, volume or subwoofer connection correctness.
7. **Keep verification proportional**: the 100 missing port mappings and 19 secondary citations are investigation queues, not automatic release failures until the field is required by a given user-facing claim.

## Engineering workflow
Every release and preview must run the certification fingerprint gate. Editors must update the master, generate projections, inspect the changed model evidence and add a fingerprint-specific approval. The evidence-gap report is a triage record with deliberately distinct statuses: `source_not_independently_crosschecked` versus `selected_fields_corroborated`. Full `certified` remains **zero** pending all applicable checks.

No Cloudflare build or deployment authorized or triggered.
