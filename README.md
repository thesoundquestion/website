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
- `decoder/index.html` — independent Spec Sheet Decoder, beginner-first amplifier and speaker examples
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

The decoder is deliberately separate from the reference library. The initial example values are entirely **fictional** and are marked as such; they are not manufacturer claims or instrument measurements. It is built with native HTML `<details>` elements to work on phones without JavaScript. Technical notes are optional, and all buying advice is qualified.

## Brand direction (November 2026)

**The Sound Question: From the microphone to your ears.** The website is a beginner-first guide to the complete music and audio journey: performance, capture, mixing, mastering, formats, sources and conversion, amplification, speakers/headphones, rooms, hearing and personal preferences. Not every recording begins with a microphone or follows one identical signal path. The homepage and `journey/` provide the broad map; `decoder/` remains the dedicated equipment-specification teaching tool, and `library/` is reserved for supporting materials and reviewed downloads.

Writing standard: Begin with familiar listening experiences, then detailed plain-language explanation, contrast neutral vs deliberate coloration vs genuine limitations, include common enthusiast claims and evidence limits, and offer technical details only after the basics. This project does not equate preference with objective accuracy, and never promotes unvalidated simulation results as measurements.

Add new topic modules without claiming that planned lessons, PDFs or audio experiments have already been published. Public website material is separate from the private research repo.

## Spec Sheet Decoder overhaul: graph-based lessons

- `decoder/` presents five in-depth lessons and compact visual navigation.
- `decoder/quick-reference/` preserves the original brief 15-spec index.
- `decoder/speaker-frequency-response/`, `bass-extension/`, `speaker-sensitivity/`, `amplifier-power/`, `amplifier-distortion/` are full lessons.
- `assets/decoder-lessons.css` is scoped visual styling; `assets/decoder-lessons.js` runs interactive curve switching locally and performs no network calls.

### Data integrity

All lesson graphs are generated **synthetic illustrations**, not actual measured equipment, simulated amplifier circuitry or extracted manufacturer plots. Never present them as sourced data. The lessons distinguish tonal preference, objective performance evidence, poor documentation, and genuine engineering limitations. The harmonic distortion bars show relative harmonic patterns only, not auditory loudness or real signal data. Graph controls preserve a readable first scenario with JavaScript disabled.

Citation and measurement-source URLs live in each lesson's further-reading section. The public site is distinct from the private research workspace.
