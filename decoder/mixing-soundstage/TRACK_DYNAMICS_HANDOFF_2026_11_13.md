# Mixing lesson: track-by-track dynamics and mastering connection

**Status:** Added to `feature/system-builder-preview-20261112` on 2026-11-13. Production `main` unchanged. A complete, current preview-browser/Cloudflare deployment verification has not been established just from GitHub test success.

## Teaching goal

Novice readers should learn that compression is a **separate mixing choice for each recorded track**, not an automatic equal amount of processing on every instrument and not only a mastering operation on the finished song. State first what happens to loud and quiet moments in familiar language; define "peak", "average", "crest factor", "RMS", or "LUFS" only where the later lesson needs them. A compressed guitar or bass can provide a consistent bed, while snare accents and cymbal decays remain more expressive. Conversely, some snare peaks can be controlled while cymbal overheads are left largely open.

**Nuance:** Distorted guitars already tend to have reduced dynamic range; compression does not automatically remove punch (attack/release influence results); snare/cymbals bleed between drum microphones, so "different tracks" does not mean perfectly separate physical sounds. A premixed stereo drum loop offers less isolation than close-mic / overhead multitracks.

## Implementation

- `decoder/mixing-soundstage/index.html#track-dynamics` adds an editor-style four-track visual after the existing placement/EQ demo. Each instrument has the same horizontal time scale; each before/after view uses the same vertical scale for that instrument. Across-instrument heights cannot be compared as measured sound levels.
- `assets/mixing-track-dynamics.mjs` generates deterministic synthetic, audio-editor-like waveforms for rhythm guitar, bass, snare mic, and cymbal/overhead mic. The fictional phrase shares a 0.5-second quarter-note pulse, eighth-note guitar figures, snare accents on beats 2 and 4, and cymbal accents near bar starts. Buttons choose **Before** or **After: each track handled differently**. In the latter mode guitar/bass body is steadier, the snare's tallest hits are controlled, and cymbal dynamics are intentionally unchanged.
- These generated paths are **visual illustrations only**. They are not waveform measurements of copyrighted music, not actual source multitracks, not an implemented physical compressor algorithm, and not an audio playback tool. The text explicitly says so. No objective sound-quality comparison is claimed.
- `assets/mixing-soundstage.css` supplies responsive dark DAW-style rows and visible keyboard focus. Each SVG has a descriptive accessible label updated for the selected state; button `aria-pressed`, a live region and a no-script explanation are included.
- The mixing section links to `/decoder/mastering-dynamic-range/#same-recording`. The mastering lesson now links back to this specific section and explains that the usual mastering pass acts on the combined stereo mix, not independently on original snare mic.
- `tests/mixing-track-dynamics.test.mjs` verifies independent track behavior, visual determinism, coherent beat accents, visible markup/copy, controls, responsive CSS and lesson crosslinks. It runs with the entire existing `node --test tests/*.test.mjs` suite.

## Follow-on work (not part of this change)

1. Update Lesson 23's existing three-version graph to more realistic **stereo-song waveforms** displayed like an audio editor, with clearly distinct dynamic, moderate, and heavily limited masters from the **same performance**.
2. Rename its comparison controls in plain language: **At the same stereo volume setting** versus **Turn them up/down until they sound similarly loud**. Explain why a dynamic version may sound quieter until the volume is raised, and why preserving stronger musical peaks can then call for more brief amplifier headroom.
3. Retain the existing electrical examples and measured-method source notes in advanced disclosures; do not imply that early vinyl automatically means more dynamic, or that a denser waveform alone proves poor sound.
4. If new waveforms are derived from existing sample-generation scripts, maintain an unmodified reference and identical time scale. Document any peak/average normalization so visual changes are not attributed to wrong causes.

Do not add extra paid APIs, scraped music waveform data, or sound-quality match percentages. Respect the website's free-only and evidence-driven boundaries.
