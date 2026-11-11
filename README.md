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
- `library/index.html` — technical reference library (not yet populated)
- `decoder/index.html` — Spec Sheet Decoder with speaker, amplifier and headphone lessons
- `connect/index.html` — official account links
- `privacy/index.html` — website privacy notice
- `404.html` — not-found page

Shared styles are at `assets/styles.css`; the source-identifying graphic is `assets/mark.svg`.

## Important boundaries

The `thesoundquestion/research` repository is **private**. Nothing from it is automatically published here. Public studies, supporting files and source notes should only be copied to the website once explicitly reviewed and approved.

The site currently contains **no analytics scripts, third-party embeds, forms or advertising**. Please update the privacy notice if that changes.

## Updating

Edit and commit files to `main`. Cloudflare Pages should automatically deploy. If the build configuration is edited in Cloudflare, ensure that this plain HTML site continues to publish the repository root.

Use relative-to-root links (`/library/`, `/assets/styles.css`) so page paths work on all devices.

## Spec Sheet Decoder

The decoder teaches through labelled **fictional specifications**, calculated examples and synthetic plots. Native HTML and `<details>` keep the lessons and engineering notes readable without JavaScript. JavaScript adds scenario switching to the plots and earcup illustrations.

## Brand direction (November 2026)

**The Sound Question: From the microphone to your ears.** The website is a beginner-first guide to the complete music and audio journey: performance, capture, mixing, mastering, formats, sources and conversion, amplification, speakers/headphones, rooms, hearing and personal preferences. Not every recording begins with a microphone or follows one identical signal path. The homepage and `journey/` provide the broad map; `decoder/` remains the dedicated equipment-specification teaching tool, and `library/` is reserved for supporting materials and reviewed downloads.

Writing standard: Begin with familiar listening experiences, then detailed plain-language explanation, contrast neutral vs deliberate coloration vs genuine limitations, include common enthusiast claims and evidence limits, and offer technical details only after the basics. This project does not equate preference with objective accuracy, and never promotes unvalidated simulation results as measurements.

Add new topic modules without claiming that planned lessons, PDFs or audio experiments have already been published. Public website material is separate from the private research repo.

## Spec Sheet Decoder overhaul: graph-based lessons

- `decoder/` presents twelve in-depth lessons and compact visual navigation.
- `decoder/quick-reference/` preserves the original brief 15-spec index.
- `decoder/curriculum.json` lists the speaker, amplifier and headphone lessons in order.
- `assets/decoder-lessons.css` is scoped visual styling; `assets/decoder-lessons.js` runs interactive curve switching locally and performs no network calls.

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
