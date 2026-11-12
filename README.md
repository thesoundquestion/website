# The Sound Question — Website

Public website for **The Sound Question** at https://thesoundquestion.pages.dev/.

## Setup

- **Hosting:** Cloudflare Pages (free tier)
- **Deployment:** Automatic from the `main` branch of this GitHub repository
- **Framework:** Plain HTML and CSS, no build dependencies
- **Build output:** repository root (`.`)

## Pages

- `index.html` — homepage: from microphone to ears
- `journey/index.html` — guided 9-stage overview of the sound journey
- `about/index.html` — about
- `library/index.html` — reference library with an introductory guide, glossary, methods and sources
- `library/make-audio-make-sense/` — first reference article and downloadable PDF handbook
- `decoder/index.html` — Spec Sheet Decoder with speaker, amplifier, headphone and source/DAC lessons
- `connect/index.html` — official account links
- `privacy/index.html` — website privacy notice
- `404.html` — not-found page

Shared styles are at `assets/styles.css`; the source-identifying graphic is `assets/mark.svg`.

## Important boundaries

The `thesoundquestion/research` repository is **private**. Nothing from it is automatically published here. Public studies, supporting files and source notes should only be copied to the website once explicitly reviewed and approved.

The site currently contains **no analytics scripts, third-party embeds, contact forms or advertising**. Please update the privacy notice if that changes.

## Updating

Edit and commit files to `main`. Cloudflare Pages should automatically deploy. If the build configuration is edited in Cloudflare, ensure that this plain HTML site continues to publish the repository root.

Use relative-to-root links (`/library/`, `/assets/styles.css`) so page paths work on all devices.

## Spec Sheet Decoder

The decoder teaches through labelled **fictional specifications**, calculated examples and synthetic plots. Native HTML and `<details>` keep the lessons and engineering notes readable without JavaScript. JavaScript adds scenario switching to the plots and earcup illustrations.

## Ask The Sound Question

The Decoder’s 23 lessons include a compact tutor with prepared answers and local typed-question matching. The tutor reads each lesson’s selected example and links to the relevant explanation. The answer bank loads when the panel is opened. Typed questions stay in the browser in the current release.

Maintain the [approved answers](assets/lesson-tutor/approved-answers.json) alongside the lessons. Run the [tutor tests](deployment/lesson-tutor/README.md#verification) when changing lesson specifications, example IDs or anchors. The [development handoff](deployment/lesson-tutor/README.md) covers editorial changes, privacy, operating limits and the optional Cloudflare Workers AI setup.

## Audiophile Decoder: spatial visual comparisons (11 November 2026)

The listening glossary at `/decoder/audiophile-glossary/` now includes a **Visual listening glossary** directly after the search section, showing an unchanged stereo room and an illustrated ghost band in contrasting examples. Five accessible comparison topics: **narrow/wide soundstage**, **diffuse/precise imaging**, **crowded/clear separation**, **flat/layered depth**, and **forward/laid-back presentation**.

- Ten **original, locally hosted SVG illustrations** are in `assets/glossary-visuals/`; no third-party image embeds, licensing or paid services. SVG images have their own text alternative via page <img> alt and an SVG description.
- `assets/audiophile-glossary.js` progressively enhances five comparisons into a compact selector with `aria-pressed`, term-specific deep links and glossary-search synchronization. Without JavaScript, all five comparisons remain visible and the existing 32 glossary definitions/search semantics are preserved.
- `assets/audiophile-glossary.css` supplies mobile-friendly two-image cards that stack on smaller screens. Leave the original typography and causes sections intact. Avoid using visual proximity, blurring or size as proof that an amplifier caused the perception: the figures illustrate language, not verified acoustical measurements.
- Direct illustration links appear on **soundstage, imaging, separation, congestion, holographic, forward, laid-back** entries. Keep link destinations and tab IDs aligned if adding or renaming scenes. Regression tests are in `tests/glossary-visuals.test.mjs` (run `node --test tests/glossary-visuals.test.mjs`).

## Brand direction (November 2026)

**The Sound Question: From the microphone to your ears.** The website is a beginner-first guide to the complete music and audio journey: performance, capture, mixing, mastering, formats, sources and conversion, amplification, speakers/headphones, rooms, hearing and personal preferences. Not every recording begins with a microphone or follows one identical signal path. The homepage and `journey/` provide the broad map; `decoder/` remains the dedicated equipment-specification teaching tool, and `library/` publishes supporting materials and reviewed downloads.

Writing standard: Begin with familiar listening experiences, then detailed plain-language explanation, contrast neutral vs deliberate coloration vs genuine limitations, include common enthusiast claims and evidence limits, and offer technical details only after the basics. This project does not equate preference with objective accuracy, and never promotes unvalidated simulation results as measurements.

Add new topic modules without claiming that planned lessons, PDFs or audio experiments have already been published. Public website material is separate from the private research repo.

## Spec Sheet Decoder overhaul: graph-based lessons

- `decoder/` presents eighteen in-depth lessons and compact visual navigation.
- `decoder/quick-reference/` preserves the original brief 15-spec index.
- `decoder/ohms-law/` is a standalone reference for volts, amps, ohms and watts, with examples linked from the relevant lessons.
- `decoder/curriculum.json` lists speaker, amplifier, headphone and source/DAC lessons in order.
- `assets/decoder-lessons.css` is scoped visual styling; `assets/decoder-lessons.js` runs interactive curve switching locally and mounts the lesson tutor.

### Data integrity

All lesson graphs are generated **synthetic illustrations**, not actual measured equipment, simulated amplifier circuitry or extracted manufacturer plots. Never present them as sourced data. The lessons distinguish tonal preference, objective performance evidence, poor documentation, and genuine engineering limitations. The harmonic distortion bars show relative harmonic patterns only, not auditory loudness or real signal data. Graph controls preserve a readable first scenario with JavaScript disabled.

Citation and measurement-source URLs live in each lesson's further-reading section. The public site is distinct from the private research workspace.

### Lesson navigation and publication rule

The canonical order of all published lessons is `decoder/curriculum.json`. Each lesson **must** have:

1. A small, top-of-page "Next lesson" quick link.
2. A prominent bottom "Up next" link and previous/all-lessons navigation.
3. On the final lesson of a category, a separate "Want to learn about amplifiers?" or "Want to learn about speakers?" card linking to the opposite category.
4. Correct adjacent links when the curriculum changes, without any dependency on JavaScript.

**Every time a lesson is added, removed or reordered**: edit `decoder/curriculum.json`, make sure the lesson's HTML is in place, run `python3 scripts/sync_decoder_navigation.py`, and commit the updated pages with the curriculum file. This helper uses only Python's standard library and updates all lesson navigation from one central order. The last lesson links back to the first to avoid a dead end. New categories should be given appropriate category prompts instead of assuming there are only speakers and amplifiers.

The lesson index cards at `decoder/index.html` must also be updated for any newly published lesson.

When a new equipment category is introduced, add its label, singular adjective, landing-page anchor, and transition description to `decoder/curriculum.json` under `categories`; the navigation generator then creates the right category-switch prompt automatically.

## Responsive layout principles

The site's general layout is content-first, not a full-screen title showcase. On desktop, avoid huge blank sections: navigation, lessons and practical material should be visible early. Use the width available on desktop to place graphs alongside explanations, while preserving the mobile stacked layout. The homepage now offers direct learning choices before the longer journey overview. Do not reduce lesson depth just to reduce scroll.

## Decoder lesson layout v2 (desktop and mobile)

Each lesson must show a prominent sample specification and navigation near the compact title, then the **interactive graph immediately**, followed by the longer plain-language explanation, listening effects, audiophile claims and evidence, and buying checklist. On wider viewports the selected case explanation appears **beside** its graph instead of under it. On mobile the chart and text stack. Long-form teaching content is preserved; the title is not allowed to dominate the first viewport. Every new lesson must use the same #compare, #understand, #listening and #buying anchors. Keep the curriculum previous/next links intact.

The three fictional THD spec charts are prominently placed at the top of `/decoder/amplifier-distortion/`, before the main interactive distortion curve. Never bury primary examples behind lengthy introductory sections. The detailed comparison of what test conditions mean follows the curve at `#rating-context`.

### THD+N lesson extension and secondary-chart sizing
THD+N now has a focused illustrated section under `#thd-plus-noise` with synthetic THD/THD+N curves, a bandwidth caveat, plain-language stages and evidence references. Its illustrative fixed noise and test load are not actual measurements. Supplementary three-rating charts are slightly smaller on desktop, and the interactive main distortion chart remains full size. Keep the THD and THD+N differences clear and the reading order intact.

### Critical publishing rule: teach every example stat explicitly
Any example specification prominently shown at the beginning of a Decoder lesson must have a corresponding chart or diagram that visualizes **that exact quantity and measurement convention**, with a plain-English explanation of each component. Use the dedicated `#decode-the-spec` section to identify test points, sweeps, limits and unspecified conditions. For example, the distortion lesson marks its 0.09% at 1 kHz rating as a single point.

Link to [the Ohm’s law example](https://thesoundquestion.pages.dev/decoder/ohms-law/#same-voltage) where a lesson first uses a lower-ohm load to explain current or watts, including in a chart’s explanation. Name the condition in plain language. At the same voltage, fewer ohms draw more current. In amplifier lessons, connect that extra current to what the power supply and output circuitry can deliver. Link to another lesson where it answers the reader’s next question.

## Speaker, amplifier and headphone lessons

The five speaker lessons cover response, bass extension, sensitivity, impedance, and drivers and crossovers. The three amplifier lessons cover power and headroom, distortion and THD+N, and output-stage classes and devices. The classes lesson explains why buyers may choose Class A, AB, D or G/H and what measurements can establish.

The four headphone lessons follow design and fit through to electrical matching.

- `headphone-types` uses seven local WebP illustrations in `assets/headphones/` to teach earcup enclosure and pad or tip placement.
- `headphone-frequency-response` decodes a 20 Hz–20 kHz rating without a stated tolerance and compares seated fit, intentional bass tuning and a pad leak.
- `headphone-sensitivity` converts a rating at 1 V RMS to its equivalent at 1 mW and compares voltage, current and power at a shared hypothetical test point.
- `headphone-output-impedance` shows a calculated 10 Ω source at 1 kHz and compares a varying headphone load with a flat load.

Add each lesson to `decoder/curriculum.json`, the decoder index and the sitemap, then regenerate navigation. Check graph selection, keyboard access, mobile legibility and the static fallback before publishing. For the earcup comparison all three designs remain visible with JavaScript disabled.

### Amplifier headroom lesson (2026-11-10)

The amplifier-power lesson uses a fictional 25 W, 80 W and 200 W comparison in `#headroom`. A separate THD+N chart compares the 80 W and 200 W examples at the same 70 W demand. It shows how an amplifier can pass a peak below its clipping limit while operating where its distortion is already rising. Load, distortion, power supply, heat and protection all inform how much usable power a rating represents.

## Decoder source and DAC lessons (2026-11-11)
- Lesson 13: source output level versus amplifier input sensitivity and the separate maximum clean input, with three conditional examples.
- Lesson 14: DAC SNR example of 110 dB A-weighted relative to 2 V RMS, plus three noise-separation comparisons and THD+N/SINAD explanations.
- Both use fictional specifications and labelled original diagrams; no actual product measurements or auditory proof are claimed. The existing local case switcher progressively enhances the graphs.
- The curriculum now contains 14 lessons with a new Sources & DACs category; regenerate adjacent navigation for all previous lessons when adding any lesson.

## Lesson 15: sample rates and bandwidth (2026-11-11)
- `decoder/sample-rate/` gives a 48 kHz PCM, 48,000 samples per second per channel example with exactly 48 sample instants illustrated in a 1 ms mathematical sine-wave window and a clearly labeled 24 kHz Nyquist boundary.
- The interactive comparison preserves the same 0–100 kHz scale for 44.1, 48, 96, 192 kHz; sample counts are for a consistent 10 ms interval. A separate 30 kHz/48 kHz example explains how an unfiltered signal can alias to 18 kHz.
- The diagrams are mathematical/illustrative rather than real product measurements or proof of audibility. Related DAC and listening-glossary lessons are linked. Scoped CSS lives in `assets/sample-rate.css` and the existing `decoder-lessons.js` adds progressive enhancement to the comparison.
- Curriculum, sitemap, landing page and previous/next links must all be updated together when this lesson is published.

## Lesson 16: bit depth, noise and dynamic range (2026-11-11)
- `decoder/bit-depth/` starts with an exact 16-bit signed linear PCM example: 2^16 = 65,536 numeric codes (−32768..32767). An original SVG illustrates 16 binary positions and a separately labeled magnified near-zero rounding example with six invented amplitude samples. Do not infer that a DAC connects levels into a stepped waveform.
- The progressive-enhancement compare UI offers 8-, 16- and 24-bit hypothetical ideal quantization SNR figures of ~49.9 / 98.1 / 146.2 dB (6.02N + 1.76 dB for the stated model), with a fixed 0–160 dB axis. The digital theoretical value is NOT a measured converter dynamic range and cannot diagnose audibility.
- Dither and noise shaping are explained separately from bit-depth value counts, with practical choices for recording, mastering and listening; audible musical dynamics are distinguished from bit-depth dynamic range. Analog Devices and iZotope references are included.
- New responsive styling in `assets/bit-depth.css`; the existing local case selector handles comparisons, while the first case is readable without JavaScript. Course navigation, curriculum, index, sitemap and README must be published atomically.

## Lesson 17: lossy vs lossless audio (2026-11-11)
- `decoder/lossy-lossless/` begins with the exact example “MP3 stereo 320 kb/s CBR”: one second 320,000 bits = 40,000 bytes = 40 kB, a four-minute data approximation of 9.60 decimal MB before tags. Its spec illustration shows the 320 kb/s mark on a 0–400 kb/s ruler; eight conceptual 40-kilobit blocks explicitly do not depict MP3 frames.
- The switchable chart uses one fixed 0–1500 kb/s horizontal scale for 320 and 128 kb/s CBR MP3, hypothetical 256 kb/s AAC, and 16-bit/44.1 kHz stereo PCM at 1411.2 kb/s. Four-minute data estimates 9.60 / 3.84 / 7.68 / 42.34 decimal MB before overhead. Crucially, storage ratio is NOT a loss-of-audible-quality ratio. FLAC is deliberately not assigned a fake fixed bitrate.
- Side-by-side PCM/WAV vs FLAC vs MP3/AAC descriptions distinguish identical decoded PCM from irreversible lossy approximation, and codec from container. The lesson covers sample-master comparability, ABX testing limits, lossy artifacts, conversions and library archiving. No commercial recordings were used as test material.
- New CSS in `assets/lossy-lossless.css`, shared progressive local selector, sourced public links to Xiph.Org and Hydrogenaudio. Integrate in curriculum, index, sitemap, and regenerate all lesson navigation.

## Lesson 18: speaker dispersion and off-axis response (2026-11-11)
- `decoder/speaker-dispersion/` is Lesson 18, classified in the Speakers category. The exact fictional spec “8 kHz · 30° horizontal: −6 dB relative to 0°” is mapped to an approximately 50% pressure amplitude bar vs a 100% on-axis reference; it never suggests that -6dB means half the subjective loudness.
- Four selectable simulated horizontal angles 0°/15°/30°/60° plot a fixed 500 Hz–16 kHz log/octave x axis and 0..−18 dB relative to on-axis y axis. At 30°/8 kHz the graph explicitly agrees with −6 dB in the opening spec. The on-axis 0 dB *difference* curve is not falsely presented as an absolutely flat frequency response. The initial 30° case renders without JS.
- Explains horizontal and vertical directivity separately; broad/narrow/uneven coverage, first reflections, ear-height/crossover lobing, toe-in and room interactions, avoiding one-direction “better” claims. Links to speaker response/driver lessons and Audiophile Glossary.
- Includes credible reference links to Klippel, Erin's Audio Corner and CTA-2034 guide. All graphs are synthetic teaching data, never measured from a commercial loudspeaker. Site remains dependency-free; uses shared local case-switch JS and scoped new `assets/speaker-dispersion.css`.
- When publishing, update the last Lesson 17 navigation and every prior course progress counter to 18, curriculum, index and sitemap together.

## 2026-11-11 Measurement reuse correction: speaker-frequency-response
- At the measurement owner's explicit request, removed both interactive traces derived from Erin's Audio Corner ELAC DBR62 / Klipsch RP-600M dataset (on-axis and listening-window). Never recreate, redistribute, or reuse those data in this project or PDF/video adaptations without fresh permission. Original reviews may be linked and discussed in original words, per the owner's response.
- Preserved the educational comparison with **two unmodified CC BY 4.0 research contour plots** from Princeton 3D3A's loudspeaker survey: original KEF LS50 and Ascend CBM-170 SE. The plots show relative horizontal dispersion vs frequency, not absolute on-axis frequency response and not a CTA-2034 listening-window pair. Source/creator, licence, original study URLs, lack of endorsement, and absence of graphic modification are cited alongside the plots; source metadata in assets/open-measurements/README.md. The comparison's selectors switch between side-by-side and individual enlargement, with static two-chart fallback.
- Removed other derived numeric data from two System Check presets for Klipsch RP-600M II / RP-8000F II until independent properly reusable/compatible sensitivities can be sourced. Manufacturer rating conventions cannot simply be substituted into free-field estimation formulas. Preserved other speaker presets supported by manufacturer or other source data. No source content from third-party measurements is included in site code beyond the expressly CC BY research images.

## 2026-11-11 Frequency response lesson: realistic-looking synthetic speaker curves
- Replaced the licensed Princeton directivity charts in `decoder/speaker-frequency-response/` with five entirely original, simulated 20 Hz–20 kHz frequency responses: Balanced, Bright/forward, Warm/full, V-shaped, Uneven/resonant. No third-party measurement curves are reconstructed. The original, simpler introductory sketch remains and is explicitly identified as an initial simplification.
- Each profile has a fictional speaker-alone on-axis trace (dashed) and an additional schematic listening-seat response (solid) in the same 12 × 15 ft room; the room illustration keeps speaker and seat locations the same. Naturalistic broad voicing, bass low-frequency rolloff, crossover features and small irregularities, plus stylized low-frequency room peaks/dips, are reproducible mathematical functions. All graph cases share logarithmic 20–20,000 Hz axes and fixed +12 to −24 dB reference-to-1 kHz scale.
- Bass modal centres reflect approximate room-floor axial dimensions (15ft length ~38Hz, 12ft width ~47Hz), but the entire room curve is explicitly illustrative, not a prediction, because height/locations/boundaries are not specified. Compare on-axis response versus room-at-one-seat instead of implying the simulated bass is a property of the speaker.
- Accessible no-JS Balanced fallback with five interactive case buttons and four conditional listening notes per profile. New `assets/simulated-room-response.css` is scoped. Unused Princeton images/CSS/provenance are removed from the repository in this revision (the original Princeton CC BY 4.0 licence still permits lawful use elsewhere).
- This educational simulation makes no audible guarantees or manufacturer claims and does not derive data from Erin's restricted measurements.

### Room effect overlay and realistic curve calibration (2026-11-11)
- The five synthetic speaker curves have a persistent Room effects On/Off control consistent with lesson trace buttons. Default on: show both the speaker-alone curve (dashed) and simulated listening-seat curve (solid). Off: hide the solid room trace, leave the speaker-alone curve visible and emphasize it as a solid line. Switching between five profiles does not reset the room choice. With JavaScript off, both are visible.
- The speaker-only midrange/treble features were moderated: Balanced approx 2–3 dB across those bands, deliberately uneven up to approx 7 dB; broad Bright/Warm/V differences remain instructional, but no regular 12 dB on-axis mid/treble oscillation is presented as normal. The room trace retains stronger bass modal peaks and nulls at a single listening seat and scales down added ripple above roughly 300 Hz, illustrating different real-world measurement contexts.
- All paths remain fully invented deterministic mathematical illustrations, not measured loudspeakers or modeled transfer functions. Shared chart axes remain 20 Hz–20 kHz log and +12 to −24 dB referenced to 1 kHz. The room simulation retains explicitly unknown ceiling height and boundary conditions; it cannot predict a real room.
- The one local script `assets/simulated-room-response.js` provides keyboard-operable button state, accessibility labels and status announcement. No other lesson code changed.

## Amp/speaker output-impedance interaction diagrams (2026-11-11)
- Reworked the “Understand where a tonal change can come from” section inside `decoder/speaker-frequency-response/`, preserving `#amp-load-visual`. Four fictional speaker impedance scenarios (Bass/Midrange/Treble/Minimal) each show a detailed log-axis 20Hz–20kHz impedance magnitude trace (0–30Ω scale) and a calculated level-shift comparison for the same speaker at 0.05Ω vs 2Ω amplifier output impedance, matched at 1kHz (common ±3 dB axis), plus four conditional listening observations.
- All example curves are independently generated deterministic mathematical functions, NOT real amplifier/speaker measurements or original Erin/Spinorama curves. The 2Ω amp is purposefully high, unlike many solid-state amps. Frequency-dependent change is calculated using the purely resistive approximation Rload/(Rload+Rout), with results in dB relative to 1kHz. Real speakers include impedance phase; full sound pressure and room effects are not implied by these *electrical relative-level* curves.
- The 2Ω trace is an optional overlay, persistent across the four scenario selector buttons. Native keyboard operation, aria pressed and offscreen live status are included in `assets/amp-load-effects.js`. All JS is local. The static Bass case remains visible when JS is disabled. New CSS is scoped in `assets/amp-load-effects.css`.

## Sound-card expansion in Compare My Gear (2026-11-11)
- Expanded the DAC/source selector from 7 to 19 models, including 12 sourced internal PCIe or external USB sound cards. Current selection spans classic Creative X-Fi Titanium (standard and HD), Z SE, Audigy Rx, AE-5 Plus / AE-7 / AE-9, X3 / X4 / X5, Sound BlasterX G6, and ASUS Xonar SE / Essence STX II.
- Corrected existing X-Fi Titanium HD detail row: Creative's original 2010 brochure states 24-bit/192 kHz DAC for the front RCA output, 2 Vrms, 122 dB A-weighted SNR with 20-kHz LPF, 0.001% THD+N, and 10 Hz–90 kHz at −3.5 dB. Creative's launch announcement says 24/96, so BOTH manufacturer sources and the conflict appear in the page notes. Burr-Brown PCM1794A is a secondary contemporary-review identification, not credited to Creative; link preserved. Driver/OS support is not presumed.
- Added **device/interface type, analogue channel support and a distinct DAC dynamic-range (DNR) row**, avoiding DNR/SNR conflation. USB and PCIe playback formats are labelled separately. Line output voltages and line output impedances remain blank when not supported by a line-output-specific source; never transfer 1Ω/10Ω headphone output impedance or 2V/7V headphone output voltage to line outputs. Most new source models intentionally lack verified line voltage.
- Manufacturer-source URLs and per-model caveats are provided, no invented measured specs. Test coverage includes all newly added devices, the HD manufacturer disagreement, the identity of specific line and headphone outputs, and comparisons with existing DACs and speaker/headphone/amp regressions.

### System Check: explicit load-by-load headroom verdicts (2026-11-11)
- The `/system-check/` result panel now shows three distinct cards for the user's nominal speaker load and two reference loads chosen from 4, 6 and 8 Ω. The user's actual selection is prominently labelled **Your Speakers**, highlighted and shown first; alternatives are labelled **Estimated Performance with [X] Ω Speakers** and never presented as real measured speakers. For unusual speaker impedances, the tool chooses the two closest standard loads from 4/6/8 Ω.
- For each load, the page displays the required short-peak wattage per channel and (when average level is enabled) average wattage, available rating/projection and provenance, **signed power headroom in dB** `10 log10(available/required)`, and **signed percentage of capacity unused** `100×(1−required/available)`. A negative percentage means additional power needed relative to available power, not a negative wattage.
- On a failure, the panel additionally calculates the model's approximate SPL limit at the seat `target SPL + headroom dB`, with a clear label for whether the boundary derives from the entered continuous or burst rating, or is a projected voltage-equivalent estimate. This is a *rated-power threshold*, not a laboratory-proven clipping onset.
- When no burst rating is supplied, exceeding continuous output is **Unverified**, never an asserted short-burst clipping **Fail**; when peak demands remain under a continuous rating, Pass is conservative. A prominent disclaimer appears when no short-burst entries were made and per-load notes remain visible if burst data are absent at a specific impedance.
- Alternative-impedance cards assume identical terminal voltage to the user's speaker, **not equal acoustic performance of arbitrary different loudspeakers**. Where no direct amplifier power test exists at that load, same-voltage projections are explicitly Unverified. Test coverage lives in `tests/system-check-results.test.mjs` and includes known burst failures, missing-burst limitations, projections, nonstandard nominal loads and upgrade mode.

### Speaker power-handling autofill and amplifier load-stress warnings (2026-11-11)
- The speaker input section now accepts five **distinct optional model-specific ratings**, in watts per speaker: published continuous handling, published peak handling, nominal input handling, maximum input (duration unspecified), and the *upper end of a recommended amplifier power range*. Never treat the last as speaker damage threshold. Leaving a field blank is intentional when the exact model doesn't publish its value.
- **30 of 59** speaker presets were enriched from manufacturer/period documentation; a provenance register with model-by-model data, URLs, uncertainties and licensing is in `system-check/speaker-power-sources.md`. Historic Paradigm Phantom v1 / Titan v3 values remain blank until original-period sources can be verified. Sources remain attached to autofilled fields; manual overrides are not falsely represented as manufacturer values.
- System Check now displays a highlighted **Speaker power handling · Your Speakers** block. It warns where target *average wattage* exceeds explicit continuous or nominal handling, and when target *peak wattage* exceeds explicit peak or maximum-input handling, with cautious language about duration. If there are only recommended amplifier wattages, speaker damage safety remains **Unverified**, with the recommendation separately labelled as amplifier-selection guidance. Peak above continuous alone does not establish speaker damage.
- Per load, an **Amplifier load-stress warning** appears when the hypothetical impedance is lower than the amplifier's **lowest explicitly entered continuous/short-burst tested load**; includes the target RMS current demand and protection/thermal/clipping risks. Even if nominal impedance passes, a **measured speaker impedance minimum below the lowest tested amplifier load** triggers a warning on the user's actual speaker card. Neither warning is a measured instability threshold nor a claim that a lower-ohm speaker definitely damages an amp. Watt extrapolations remain Unverified.
- The estimates use a fixed nominal resistance and voltage, and do not model impedance phase, programme duration, EQ boost, low-frequency cone excursion, driver distribution, fuse/protection circuitry or actual clipping onset. A higher amplifier nameplate output doesn't automatically stress a speaker; only the *delivered wattage requested by the listening target* is assessed.

## 2026-11-11: Lesson 20, how recording sources enter the mix
- Published `/decoder/recording-sources/` as the first recording/production lesson. Curriculum now 20 lessons with new recording category and course-index card. All course navigation reflects the 20-lesson count and Lesson 19 → 20 → Lesson 01 wrap.
- Three no-JavaScript-readable, keyboard-accessible inline interactions share the local `assets/decoder-lessons.js` controller: four typical recording routes (mic, guitar/bass DI, hardware synth, MIDI-controlled software instrument), three microphone positions in a fictional 12 × 15 ft room, and three idealized microphone polar patterns (cardioid, omni and figure-eight).
- DI is NOT a digital signal; software instruments turn MIDI into generated/sampled digital audio. The capture path highlights when an ADC is required, and the room illustration explicitly avoids a claim of measured room response. Technical content crosslinks the listening glossary and the next recording-resolution/mixing/mastering plans.
- Original CSS and SVG diagrams; no copyrighted recordings, manufacturer measurements or third-party images reused. Sources link to Shure, Focusrite and Ableton's official educational materials; no paid APIs.
- This lesson is the first of the proposed four recording-chain chapters. Private canonical planning handoff should be maintained in `thesoundquestion/research/RECORDING_CHAIN_SECTION_HANDOFF.md`, separate from initial research brief.

## Recording Lesson 21: gain, resolution and oversampling (2026-11-11)
- Published `decoder/recording-resolution/` as Lesson 21 in Recording & Production, directly following Lesson 20's microphone/DI paths. Full course navigation and counters updated to 21 lessons, plus index card and sitemap.
- Three interactive original mathematical illustrations: 4 recording peak gain states (−24, −12, −3, +3 dBFS), 4 32-bit-float/analogue-overload scenarios, and 3 alias/oversampling working-rate cases. Overlay controls let readers independently hide/show calculated traces and keep their states while switching examples. All remain intelligible with JavaScript disabled (default case). Equal fixed axes per chart family.
- Engineering: ideal full-scale-sine 6.02N+1.76 dB noise convention (98.1 dB/146.2 dB) explicitly distinguished from hardware SNR; 24-bit relative precision and actual analogue noise limitations; float file vs multi-ADC recorder; mathematically correct 10 kHz 3rd harmonic at 30 kHz folding to 18 kHz at 48 kHz, whereas 96 kHz internal oversampling followed by appropriate filtering avoids that alias. Downsampled audio does not need ultrasonics. Source-labelled 24-bit 44.1/48/96 kHz starting-point table and PCM storage math.
- Links to Focusrite 2024 gain-staging support, iZotope 2025 digital audio primer and RX resampling docs, Sound Devices 2026 32-bit float hardware, and FabFilter Pro-L 2 oversampling. All cited with external links, not republished media, graphics or commercial audio.
- Canonical private section research and release record lives in `thesoundquestion/research/RECORDING_CHAIN_SECTION_HANDOFF.md`. Next planned chapter is mixing and soundstage/spatial processing; dedicated mastering/remastering deep dive remains high priority.

## Lesson 22: Mixing, soundstage and spatial production (2026-11-12)
- Published `/decoder/mixing-soundstage/` as Recording & Production Lesson 22 after the recording-resolution chapter. Lesson 23 continues the series with mastering and dynamic range.
- Three original visual comparisons: (a) four mixes of the same hypothetical vocal/guitar/bass/drum stems (crowded center, pan, EQ+balance, added ambience), with consistent schematic stereo stage and fictional overlapping relative-frequency-energy traces; independently toggleable stem and ambience overlays; (b) mathematically calculated mono cancellation for two equal correlated signals at 0 / 0.25 / 1 ms delay using 20log10|cos(πfΔt)|, 50Hz–12kHz, -30dB graph floor and independent baseline/result overlays; (c) stereo/binaural/QSound/discrete 5.1/Dolby Atmos beds+objects format diagrams and explanations.
- Four edition-specific external listening research examples: Roger Waters *Amused to Death* original 1992 QSound (2015 has different 5.1), Madonna 1990 *The Immaculate Collection* QSound, Pearl Jam 2000 *Binaural*, Steven Wilson *The Raven That Refused To Sing* 2013 96/24 5.1 versus distinct 2026 Atmos and binaural editions. Sources include release docs and contemporaneous ads. There is no commercial audio played, downloaded or republished.
- Scoped original SVG and CSS, local-only JS controls; native button/aria pressed and no-JS content fallback. Graphs are clearly marked synthetic and not an audible equivalence proof. Stereo playback perception, headphones and mono-sum distinctions explained; mixing and mastering not conflated.

## Lesson 23 · Mastering, remastering and dynamic range

- Published `/decoder/mastering-dynamic-range/` as the fourth Recording & Production lesson. The curriculum, index, sitemap and navigation cover 23 lessons.
- One original stereo phrase powers the restrained, moderate and heavily limited examples, the peak/RMS comparisons, and the same-mix remaster. Voltage ranges, RMS, sample peak, crest factor and ideal 8 Ω power all come from the displayed signals. The EQ plot shows the applied filter gain. Vinyl and digital paths use original diagrams.
- The lesson links to exact releases and engineer accounts for Yes, Clapton, Elbow, Dire Straits, Metallica and Daft Punk. Playback normalization is tied to current platform documentation and ITU/EBU standards.
- Run `python3 scripts/sync_mastering_examples.py` after changing the synthetic signal, processing or plot settings. It regenerates the marked HTML sections with standard-library Python. Deployment still serves the committed static files directly.

### System Check Google lookup cleanup (2026-11-12)
System Check now opens targeted **ordinary Google searches** only. Removed embedded Google CSE loader, results UI and engine ID. See `system-check/SPEC_SEARCH_EXTERNAL_GOOGLE_2026_11_12.md` for search categories, tested source models and limitations. The calculation engine and equipment database are preserved. Run `node --test tests/system-check-results.test.mjs tests/system-check-search.test.mjs`.

### Model-specific speaker power autofill (2026-11-12)
- Exact typed manufacturer/model matches in System Check now select the existing speaker preset and populate all available numeric fields, including published power handling and recommended amplifier upper wattage. The model field provides native datalist suggestions. Partial or ambiguous model matches do not trigger autofill, and variants/revisions are not conflated.
- If the visitor changes away from a matched model, stale unedited preset values are cleared, while fields they changed manually are preserved. Power-source provenance is shown with the published field's original meaning; a vintage secondary transcription is not labelled manufacturer verified.
- Manual selection from the saved speaker dropdown continues to work. No Google results are scraped or auto-imported. Unknown numeric values remain blank and speaker safety verdicts continue to distinguish nominal, continuous, peak, maximum input and amplifier recommendation.

Additional 2026-11-12 sources: original JBL L100 Century 50 W continuous program handling and Polk ES60 300 W recommended-amplifier upper range. Catalogue coverage is 50/59 speaker presets for at least one published power-related value; unknown revisions remain blank.

### 2026-11-12 result-link regression fix
The embedded Google CSE removal inadvertently also removed `searchLink()`, which the output generator still uses to offer speaker-impedance and lower-load amplifier searches. Restored as an ordinary encoded Google link with `target=_blank` and `rel=noopener noreferrer`. This function has no search API, credentials, scraping, data imports or effect on engineering formulas. Added regression coverage, and bumped calculator cache version.

### System Check amplifier distortion audit and output qualification (2026-11-12)
System Check now surfaces the exact published THD/THD+N test conditions in the primary result, including the difference between a one-frequency and a stated multi-frequency power rating. It does **not** infer listening-level distortion or clipping from a power rating. Four catalogued amplifiers now link to genuine independent published measurement material; numeric curve points remain blank until a compatible verified measurement series is available. See `system-check/AMPLIFIER_DISTORTION_RESEARCH_2026_11_12.md`.

### Amplifier model input presets (2026-11-12)
Entering an exact catalogued amplifier model now selects its existing preset, including published power ratings, stated THD test conditions and any independent laboratory reading link. Approximate/partial names or unknown revisions do not select another model. On leaving a match, untouched catalogue-sourced power rows and electrical values are cleared, while visitor-edited rows and values are preserved. All 42 amplifier presets currently have **no verified numeric distortion-versus-power points**; this remains intentionally unpopulated.

### 2026-11-12 System Check average versus peak output-distortion interpretation
The displayed **average listening demand** and **short musical peaks** now have separate qualitative operating-region notes in each applicable load card. These notes compare the modeled wattage with the amp's **direct same-load rated power**, never estimate THD% or a clipping voltage. Average output ≤10% of rated continuous output is labelled a low-demand, generally favorable operating region; 10–50% a moderate demand; >50% elevated. Musical peaks are compared to continuous rating where available: ≤50% has at least 3 dB reserve, 50–80% has limited reserve, ≥80% is within about 1 dB, and beyond rated continuous output is explicitly unsupported unless a separate burst rating qualifies only short duration. **These thresholds are presentation heuristics, not measured onset of distortion, engineering safety thresholds, or a guarantee of clean sound.** Projected ratings from another impedance and burst-only cases never assert normal low-distortion operation. No validated power or speaker-safety calculation has changed.
