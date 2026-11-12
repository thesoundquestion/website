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

The Decoder's 18 lessons include a compact tutor with prepared answers and local typed-question matching. The tutor reads each lesson's selected graph and links to the relevant explanation. The answer bank loads when the panel is opened. Typed questions stay in the browser in the current release.

Maintain the [approved answers](assets/lesson-tutor/approved-answers.json) alongside the lessons. Run the [tutor tests](deployment/lesson-tutor/README.md#verification) when changing lesson specifications, example IDs or anchors. The [development handoff](deployment/lesson-tutor/README.md) covers editorial changes, privacy, operating limits and the optional Cloudflare Workers AI setup.

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
