# The Sound Question — Beginner-First Language Audit
**Date:** 2026-11-17 · **GitHub draft:** `draft/abx-shared-framework-20261116` · **No Cloudflare deployment**
 
## Editorial standard
- Start with what a visitor hears, sees or wants to decide.
- Explain the physical or practical idea in familiar language, then introduce the correct technical term once.
- Define symbols and units (e.g. Ω, Hz, kHz, SPL, THD, RMS, LUFS, DAC) at first meaningful use or provide a nearby lesson link.
- Leave maths, test methods, data limitations, citations and exact values intact. Simplifying a statement must **not** turn an estimate into a certainty.
- Keep personal music commentary informal, and preserve rights/privacy disclosures where accuracy requires precise wording.
- Treat fictional curves as fictional; never claim product measurements without evidence.
- Do not increase autoplay, preloading, Cloudflare usage or publish paid/blocked content to improve prose.

## Route-level first pass
Scanned the **47 published sitemap routes** for introductory wording and first-use jargon; inspected relevant body copy on technical routes. **37 routes had targeted prose edits** and **10 were reviewed without new edits**. A route being marked edited is **not a claim that every sentence, generated tool message or accessibility announcement received a manual line-by-line rewrite**.

| Route | Status | Scope |
| --- | --- | --- |
| `/` | Reviewed; no new edit | Homepage already opens with questions and accessible choices; no new edits |
| `/about/` | Reviewed; no new edit | Project mission and curator story are already conversational; no unnecessary rewrite |
| `/content-use/` | Reviewed; no new edit | Rights and attribution policy uses plain opening summary; avoid weakening legal meaning |
| `/library/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/library/curators-listening-room/` | Reviewed; no new edit | Personal music notes are intentionally informal; no forced technical rewrite |
| `/connect/` | Reviewed; no new edit | Outreach and Ko-fi descriptions recently simplified; preserve business disclosures |
| `/privacy/` | Reviewed; no new edit | Retain accurate hosting and privacy disclosures despite removing provider names from lessons |
| `/decoder/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/sound-basics/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/journey/` | Reviewed; no new edit | Narrative explanation already follows performance-to-playback sequence |
| `/decoder/quick-reference/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/audiophile-glossary/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/playback-sources/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/source-levels/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/dac-specifications/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/sample-rate/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/bit-depth/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/lossy-lossless/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/labs/formats/` | Reviewed; no new edit | MP3, bitrate and lossless definitions already appear beside listening controls |
| `/labs/abx/` | Reviewed; no new edit | A/B/X is already explained in ordinary language; avoid changing game mechanics |
| `/decoder/ohms-law/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/speaker-frequency-response/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/bass-extension/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/speaker-sensitivity/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/amplifier-power/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/amplifier-distortion/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/speaker-impedance/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/amplifier-classes/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/speaker-drivers/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/speaker-dispersion/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/headphone-types/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/headphone-frequency-response/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/headphone-sensitivity/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/headphone-output-impedance/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/library/make-audio-make-sense/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/library/behind-the-experiments/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/system-check/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/system-check/compare/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/recording-sources/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/recording-resolution/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/mixing-soundstage/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/decoder/mastering-dynamic-range/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/labs/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/lab/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/lab/mastering/` | Reviewed; no new edit | Mastering introduction was simplified in preceding draft pass; detailed formulas remain in method sections |
| `/tools/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |
| `/system-builder/` | Edited this pass | Targeted first-use/body wording revision; examples and published measurements retained |

## Continuity corrections made
- Library card claimed **38 selections** when current Listening Room describes **51 selections / 53 tracks**. The card now matches the current collection.
- Mixing Lab said FLAC files "stream automatically" after the performance fix intentionally delayed requests until the first Play. It now explains the explicit Play action and local-file privacy accurately.
- Tool help now distinguishes **per-speaker** power handling, amplifier output, continuous versus peak watts, and what a headroom calculation actually estimates.
- Introductory Decoder cards now explain ohms, crossovers, DAC noise and off-axis listening without assuming technical vocabulary.
- Recording and mastering explanations distinguish bit depth, sample rate, internal floating point, source overload and compression without changing engineering calculations.
- Relevant headphone examples distinguish output voltage, current, sensitivity and the effect of pad seal.

## Still-open editorial and validation checks
- [ ] Exhaustive sentence-level proofread across long, graph-heavy pages, including interactive JS-generated labels, computed results and error strings.
- [ ] Real mobile layout, screen-reader order, alternative text and focus movement for expandable technical sections.
- [ ] Review all lesson-to-lesson crosslinks in the final generated site (automated href tests are already separate).
- [ ] Recheck exact rights, music-source credits, listening-safety copy and privacy disclosures manually just before release.
- [ ] Re-run site regression, browser playback, waveform and publish-package checks at the *final* draft commit; old green checks are not release approval.
- [ ] No production deployment or scored ABX Worker until the existing release gates are met.

## Source of truth
This report records the editorial pass against the draft files and complements `docs/RELEASE_CHECKLIST_2026-11-17.md`. Keep the main release checklist open until the remaining checks above are complete.
