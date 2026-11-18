# The Sound Question — Technical Claims & Evidence Audit
**Review date:** 2026-11-17 (Nova Scotia)  
**Base:** `thesoundquestion/website`, production branch `main`  
**Status:** Editorial review only. No public page, calculator or hosting setting changed.

## Scope and standard of proof

Read the published HTML prose of the 24 lessons in `decoder/curriculum.json`, the stand-alone Ohm's Law/quick reference/glossary, the mixing, mastering, format and ABX labs, and the main reference/decision pages. Inspected the underlying System Check formula and a number of System Builder scoring and product-reference modules. Cross-checked sampled calculations manually and named sources against primary documentation, relevant technical standards and established audio-engineering references.

**Review levels:**
- **Supported:** the statement follows from reliable source material or straightforward arithmetic under stated assumptions.
- **Needs qualification:** basically defensible but may encourage an unjustified conclusion.
- **Not independently reproduced:** a precise original measurement for which the cited underlying data or full test logs were not available for verification.
- **Not covered:** the 59-page illustrated PDF handbook, every external product link and every graphical/interactive runtime state. The audit is broad, but it is **not** a certification of every number and every deployed asset.

The live `.com` host could not be fetched by this review environment; checking the source branch does not prove the production deployment contains exactly these files. A later live smoke check is needed.

## Confirmed credible material

1. **Digital audio fundamentals:** `decoder/sample-rate`, `decoder/bit-depth`, `decoder/lossy-lossless`, and `decoder/recording-resolution` correctly distinguish Nyquist bandwidth, quantization precision, audible program dynamics and codec compression. Specific sample checks: 44.1 kHz → 22.05 kHz Nyquist; 48 kHz → 24 kHz; 16-bit = 65,536 integer values; 24-bit = 16,777,216 values; a third harmonic of 10 kHz at a 48 kHz working rate can alias from 30 kHz to 18 kHz. All correct for the specified idealized examples. The dither/SQNR caveats correctly note that hardware and recording noise matter.
2. **Amplifier, DAC and impedance basics:** 2 V RMS vs 0.2 V RMS is a 20 dB voltage difference; 110 dB SNR relative to 2 V corresponds to approximately 6.32 μV RMS; 0.001% THD+N corresponds to about 100 dB SINAD under matching definitions. For a fixed resistor at constant voltage, 4 Ω takes twice the current and power of 8 Ω. The amplifier THD and headroom lessons generally warn against comparing incomparable published test conditions. These arithmetic examples check out.
3. **Headphones:** the 300 Ω / 1 V / 102 dB SPL teaching example is compatible with approximately 96.77 dB SPL at 1 mW. Source output impedance and a frequency-varying headphone load can change response. The 1:8 recommendation is presented as a rule of thumb, not as an absolute requirement.
4. **Speakers and rooms:** `decoder/speaker-impedance` treats nominal impedance as a designation rather than a constant and cites the IEC minimum impedance convention. `speaker-frequency-response`, `speaker-dispersion` and `speaker-drivers` carefully distinguish invented simulations, measurement geometry, frequency response and personal listening preferences; driver material and amplifier class are not claimed to guarantee sound quality. The imaginary 12 × 15 ft room's axial bass-mode examples around 38/47 Hz are plausible for those lengths.
5. **Recorded-media source provenance:** AlbumDB's ten-song *Extraordinary* research dataset, named authors, 2026 AES Paper 10278 and CC BY 4.0 license match the research publisher and the dataset record. Princeton 3D3A provides independent KEF LS50 and Genelec 8030A measurements. Steven Wilson's 2026 *Raven* Atmos/binaural release is documented by the artist's own store; the 1992 Roger Waters QSound and 2015 surround release distinctions are supported by discographic/label records.

## Prioritized corrections and verification requests

### P1 — System Builder: speaker-power-handling matching is given too much ranking authority
**Location:** `system-builder/amplifier-fit.mjs`, `assessAmplifierCandidate`, particularly the `ratio = amp.watts / sp.watts` scoring branches.

The algorithm awards three relative points when an amplifier's continuous watt rating is 70–150% of a speaker's nominal power-handling specification and fewer points outside that range. A speaker's power-handling rating is **not** a target amplifier size, an audibility score or a verification of a safe electrical match. Different speaker ratings reflect different methods (continuous, AES, program, peak, etc.). The code contains sensible caveats, but the numerical ranking still gives the ratio unjustified weight.

**Change proposed:** Remove nominal power-handling proximity from the primary ranking, or move it to a clearly named, low-confidence editorial note. Prioritize whether the needed clean level and peak voltage at the seat can be supported, with amplifier stability at actual load and impedance/phase verified separately. Speaker thermal/mechanical handling is an independent risk check, not a sound-quality indicator.

**Cross-check:** [Yamaha Pro loudspeaker power specifications](https://ca.yamaha.com/en/business/audio/resources/self-training/micro-tutorial/20180222/), [Audioholics explanation of amplifier/speaker matching](https://www.audioholics.com/loudspeaker-design/truth-about-matching-amplifier-power).

### P1 — System Check: prominent hearing-exposure context needed
**Location:** `system-check/index.html` target SPL fields and `system-check/calculator.js` (`calculate` accepts peaks up to 135 dB SPL).

The site distinguishes example targets from recommended listening levels, which is good. But it lets a reader calculate high average and peak levels without a prominent, specific explanation of the difference between **short peaks** and **sustained A-weighted exposure**. Someone could confuse 'technically achievable' with 'safe for listening'. The model cannot infer personal sound exposure or hearing risk from generic SPL estimates.

**Change proposed:** Add an immediately visible statement beside target fields and a contextual warning for high *average* target levels. Explain that **85 dBA as an eight-hour time-weighted average** is NIOSH's recommended occupational exposure threshold and that allowable duration declines as level rises. Do not apply time-exposure tables directly to unweighted, instantaneous musical peaks. Include a source link and note that a calculation is not a hearing-safety assessment.

**Cross-check:** [CDC/NIOSH Understanding Noise Exposure](https://www.cdc.gov/niosh/noise/prevent/understand.html), [NIOSH comparison of workplace and general environmental guidance](https://www.cdc.gov/niosh/bulletin/2016/noise.html).

### P2 — System Check: binary “Pass” should be labelled as rated-power coverage, not proven cleanliness
**Location:** `system-check/calculator.js`, `metricLine()` within `summarizePower()`.

An entered watt rating at the nominal test load can yield a green-style `Pass` when greater than calculated demand, even when distortion-versus-power curves, burst limits, speaker phase and amplifier stability remain unverified. Explanations below it qualify this, but the headline wording may be taken as a verified physical outcome.

**Change proposed:** Rename the status to **“Within entered watt rating”** or **“Rated-power coverage only”**. Do not imply measured peak cleanliness or loudspeaker safety from the watt number alone. Keep the existing 'unverified' treatment where load or duration are extrapolated.

### P2 — Listening Labs: reproduce exact numbers from the actual files before signing off
**Locations:** `lab/mastering/index.html`, `lab/index.html`, `labs/formats/index.html`, `assets/waveforms/mastering-provenance.json`.

The site makes precise first-party measurement statements such as mastering levels of −20.98/−13.83/−8.48 LUFS, published crest-factor changes and estimated reconstructed true peak, three Mixing Lab excerpts reportedly matched to −20 LUFS, and a decoded 128 kb/s MP3 signal 0.44 dB below the source RMS.

The checked waveform manifest is useful provenance: it records the published 40-second FLAC URLs, sample count, SHA-256 digests and graphic SVG digests. That supports accountability **but does not by itself validate the LUFS, crest factor, true-peak figures or processing histories**. No full reproducible audio analysis was performed in this pass.

**Change proposed:** Store a machine-readable audit log with the precise file hashes, measurement tool/version, ITU-R BS.1770 variant, sample/true-peak method, gating, stereo weighting, crest-factor convention, exact excerpt time range and raw numerical outputs. Re-run these claims on the shipped audio and review them before approving them as independently checked measurements.

**Cross-check:** [AES Loudness Basics](https://aes.org/resources/audio-topics/loudness-project/loudness-basics/).

### P2 — Product references and prices require freshness and identity control
**Locations:** `system-check/gear.js`, `system-builder/recommendations.mjs`, `system-builder/market-price-context.mjs`, `decoder/speaker-dispersion/index.html`.

The code often distinguishes manufacturer ratings from independent measurements, and old prices are explicitly dated (example: November 12, 2026), a good practice. Nevertheless, model revisions, individual-vs-pair pricing, promotional discounts and changing store stock mean a model-specific price or rating should not be treated as timeless. The KEF/Genelec plot readings are digitized approximations, not replacements for the original measurement graphs.

**Change proposed:** Where money or specs drive a recommendation, show source date, country, whether price is per speaker or pair, model revision, and manufacturer/independent evidence tier. Verify all specific product rows and outward citations before next release. Treat the plotted KEF/Genelec dB comparison figures as approximate digitizations and keep the underlying primary plots linked.

**Cross-check:** [Princeton KEF LS50](https://3d3a.princeton.edu/kef-ls50), [Princeton Genelec 8030A](https://3d3a.princeton.edu/genelec-8030a).

### P3 — Editorial guardrails
The site's main claims are appropriately cautious. Preserve the site's explicit distinctions:
- **A computed illustration is not a measurement.**
- **A manufacturer's specification is not an independent test.**
- **A subjective description (“holographic”, “fast”, “warm”) is not a proven causal explanation.**
- **Equal peak, equal RMS and equal perceived loudness are different comparison conditions.**
- **A valid power rating or equipment compatibility match does not establish safe listening exposure.**

Keep links tied to the closest supported assertion rather than burying the source in a general 'Further reading' section.

## Important exclusions and next release gates
- The illustrated **59-page PDF handbook** was not readable through the available source connector; its prose, image labels and equations are **not yet certified**.
- Hosted audio stems, streamed FLAC/MP3 masters and any derivative waveforms were **not independently downloaded and remeasured**; source-provenance records were reviewed.
- The review does **not** verify every URL's current availability, every gear preset against its manufacturer PDF, or how the production build exactly matches the `main` branch. A live full-page link scan and runtime integration test are still necessary.
- None of the findings above is a demonstrated core digital-audio mathematical falsehood. The strongest recommendations concern **interpretation and trustworthiness of equipment-selection results**, **safety context**, and **reproducibility of precise measurements**.
- Do **not** edit or deploy live copy from this report without specific editorial review. Prepare any fixes on a separate branch and batch them into a controlled future release.

## Outcome
**Initial technical credibility: strong, with meaningful decision-tool and evidence-provenance improvements needed.** No blanket claim that every word on the entire website was verified.

*Audit sources: public `main` repository text and code plus independently published primary research, NIOSH guidance, and reference audio-engineering material linked above.*
