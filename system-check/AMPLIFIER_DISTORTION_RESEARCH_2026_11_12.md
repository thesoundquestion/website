# System Check amplifier distortion: research and injection audit
Date: 2026-11-12
Repository: thesoundquestion/website

## Catalogue audit (snapshot)
- **42** amplifier presets; **108** stored power-rating rows.
- **34/42** presets contain a numerical THD statement in at least one rated-power condition.
- **0/42** presets contain numeric points in `values.curve`, and none contains a complete verified single-condition curve with load, frequency, input path and numeric coordinates.
- Eight models have no numerical THD statement *in the rated-power fields*: Cambridge AXA35, AXR100D, CXA61, CXA81, CXA81 Mk II, Marantz 2230, Marantz 2270, NAD 3020 (original). They may have independent or separate distortion specifications elsewhere.
- Selecting an amplifier preset currently populates every published rating row (watts, load, duration and original text test conditions) and any supported `inputZ`, `inputSensitivity`, `gain`, `outputZ`, `curveLoad`, `curveHz`, `curveType`, `curve` values. The latter four are empty for all current amplifier presets, so curve analysis is not automatically active.
- Distortion information in rating-condition strings was previously repeated only in secondary technical output. The new main results panel explains the exact rating condition at the speaker's nominal load without turning it into a measured listening-level distortion value.

## Verified independent measurement sources
| Exact catalogued model | Primary research source | Evidence | Action |
| --- | --- | --- | --- |
| Cambridge Audio AXA35 | https://www.hifinews.com/content/cambridge-audio-axc35-axa35-cd-playeramplifier-lab-report | Hi-Fi News has dynamic power vs distortion graph for 8/4/2/1-ohm loads and other amplifier metrics. | Link in preset; do not infer or digitize full trace from summary. |
| WiiM Amp (original) | https://www.hifinews.com/content/wiim-amp-lab-report | Hi-Fi News Graph 1 dynamic power vs distortion for 8/4/2/1-ohm loads; a *separate* frequency-dependent 1-watt distortion range is reported for analogue and digital inputs. | Link; don't combine analogue and digital results into one curve. |
| Yamaha A-S801 | https://www.audioholics.com/amplifier-reviews/yamaha-a-s801-amplifier-review/yamaha-a-s801-measurements | Audioholics independent amplifier test page is cited by period forum discussions with two-channel 8/4-ohm power distortion tests. Direct automated fetch returned 403, so its individual graph coordinates were **not** independently extracted. | Link only; flag review access limitations. |
| Yamaha A-S3200 | https://www.hifinews.com/node/131918 | Hi-Fi News lab describes approximate distortion vs output (roughly 0.006% at 1–20 W/8-ohm and ~0.0035%/100 W) plus dynamic power vs distortion and frequency curves. | Link; approximate prose values do not constitute measured point series. |

## Other research checks
- Yamaha A-S801 official specification: https://ca.yamaha.com/en/audio/home-audio/products/hifi-components/a-s801/specs.html lists 0.019% THD at 50 W/8 Ω as a **separate test**, not a 1-kHz distortion-power sweep.
- NAD C 316BEE V2 official specification: https://nadelectronics.com/products/c-316bee-v2-stereo-integrated-amplifier gives THD over stated output and frequency ranges, but no machine-readable distortion-versus-power point series.
- Marantz PM6007 official manual: https://manuals.marantz.com/PM6007/EU/EN/DNTXSYnslltjoe.php states 0.08% THD with 20 Hz–20 kHz simultaneous channel conditions at 8 Ω; it does not provide a plotted distortion curve.
- Yamaha R-S202: https://ca.yamaha.com/en/audio/home-audio/products/hifi-components/r-s202/specs.html includes a 0.2% THD full-band rated-power statement, not a distortion-versus-power series.
- Yamaha A-720, Panasonic SA-HE100, Yamaha HTR-4063: original manufacturer rating data in the catalogue; no independent numeric distortion curve confirmed in this pass. Do not confuse circuit simulation or forum speculation with an empirical test.

## Interpretation policy
1. Never convert a *limit at rated watts* or a frequency-band rating into one or more plotted actual measurement values.
2. Keep THD separate from THD+N; differences in test load, frequency, bandwidth, input path and channel count make ratings non-interchangeable.
3. A visually presented graph owned by an independent publisher should be linked, not copied or blindly digitized without permission and reliable axes.
4. Actual curve auto-injection is permitted **only** after a reproducible table of power/percentage points from the same bench test has been verified, with source, channel count, load, frequency, measurement type and measurement bandwidth recorded.
5. A rated-power Pass remains a **power-rating** result, not proof of low actual distortion at that listening level or clipping onset.

## Future tasks
- Research the remaining 38 catalogued models in a model-specific programme, favoring original manufacturer service manuals and independent laboratory measurements.
- For models with reliable published numeric sweeps, add the points and complete test provenance; test exact-load/frequency matching.
- Add preference-aware filtering of power ratings if the user wants a user-selectable clean-power benchmark (for example, only ratings meeting a chosen THD ceiling). Do not silently reduce wattage using an isolated THD spec.
