# TSQ input-equipment lesson — editorial handoff and QA
**Date:** 2026-11-18 · **Status:** REVIEW DRAFT; not numbered, in curriculum, published or deployed.

## Existing material actually consulted
- `AGENTS.md` standing editorial standard, mandatory for all future lessons.
- `decoder/recording-sources/#paths` (recording routes and microphones/DI/virtual instruments).
- `decoder/microphone-types/#power` (USB vs XLR microphones, phantom power and use cases).
- `decoder/recording-resolution/#chain`, `#gain` (mic preamp/ADC and recording level).
- `decoder/dac-specifications/` (playback converter performance).
- `decoder/source-levels/` (signal levels).
- `decoder/mixing-soundstage/#multitrack` (mixing separately recorded tracks).
- `decoder/speaker-types/#jobs` (live/PA speaker applications).
- Current curriculum (26 approved lessons), index cards, tutor bank, Journey and SEO files read but not modified.

## Draft created
- `decoder/audio-interfaces-mixers/index.html`: 11 sections, deeply developed beginner-first explanation of audio interface vs mixer vs hybrid, complete input and monitoring signal paths, stereo-vs-multitrack USB distinction, channel-strip controls, live monitor routing, home/solo/band/drums/podcast/stream scenarios, latency and loopback, physical input types, technical specifications and purchase checklist, with official manufacturer references.
- `assets/audio-inputs-mixers.css`: responsive local CSS leveraging the approved `assets/equipment-types.css` design language.
- `assets/illustrations/input-interface-and-mixer-routes.svg`: original conceptual signal journey and live routing comparison.
- `assets/illustrations/input-stereo-vs-multitrack.svg`: original visual showing a combined stereo recording vs separate tracks from the same four sources.
- `tests/audio-interfaces-mixers-draft.test.mjs`: crosslink, assets, no-duplicate IDs, technical distinction, draft publication gate tests.

## Editorial overlap matrix
| New lesson topic | Canonical previous lesson | Treatment |
| --- | --- | --- |
| Mic types / XLR / phantom | Microphone Types `#power` | Short recap and link where first needed; no duplicated capsule illustrations |
| Recording routes / DI / software instruments | Recording Sources `#paths` | Only signal-flow context, then link; no duplicate recording-route widget |
| Setting input gain and clipping | Recording Resolution `#gain` | Small explanation of control purpose, existing lesson for measurement |
| ADC/DAC dynamic range theory | Recording Resolution `#chain`, DAC Specifications | One-sentence definitions, links, no duplicated converter curves |
| Multitrack mixing/panning | Mixing Soundstage `#multitrack` | Distinguishes *recordability* vs *later editing*, link for mixing technique |
| Electrical source signal levels | Source Levels | Necessary socket compatibility only; link for deeper definition |
| PA speaker role | Speaker Types `#jobs` | Mentions live system direction, links to existing speaker lessons |

## Verified source-based examples
Yamaha MG10XU 10-channel analogue mixer with USB 2-in/2-out (manufacturer specifications); Zoom LiveTrak L-12 combines mixer/multitrack recorder and USB 14-in/4-out (manufacturer specifications). These are illustrative *published specifications*, not invented measurements or shopping picks. Manufacturer references appear in lesson sources and in private research doc `thesoundquestion/research/LESSON_RESEARCH_AUDIO_INTERFACES_MIXERS_2026_11_18.md`.

## Novice language and technical constraints
- Explain audio interface, mixer, channel, preamp, ADC, DAC, aux, buffer, Hi-Z, EIN and MIDI locally.
- Never equate mixer channels, physical mic preamps, USB recording inputs and independently recorded tracks.
- Don't claim direct monitoring is universally zero-delay or that high rates guarantee sound quality.
- Do not equate finishing a song with needing a matching number of simultaneous inputs.
- Two real DIY/garage examples distinguish a rapper using one mic with software beat vs a drummer needing many simultaneous mic inputs; single-mic drummer option is valid.
- Stage and remote-guest scenarios teach separate audience/performer/stream mixes and risk of loopback echo.
- All new diagrams say conceptual rather than measured.
- No JS interactivity. No invented prices.

## Review gate checklist
- [x] Draft research completed and evidence references inventoried.
- [x] Beginner-first explanation and first-use definitions drafted.
- [x] Duplicate vs recap + link mapped.
- [x] Technical categories, use cases, source examples and published/spec caveats mapped.
- [x] Two distinct original contextual visuals with alt text and captions.
- [x] Automated regression suite and real static public build check on draft branch. [Site regression 44362439487](https://github.com/thesoundquestion/website/actions/runs/44362439487) passed **441 / 441 tests**. Initial two overly broad assertions in draft test code were corrected without weakening the educational cautions.
- [ ] Manual phone-width/device illustration review; SVGs on narrow devices may need revised geometry/text arrangement.
- [ ] Owner editorial approval and lesson position decision.
- [ ] Upon approval only: assign number (provisionally following microphone-types), update `decoder/curriculum.json`, syllabus cards, all numbered next/previous/progress, Journey topics, tutor answer bank, sitemap, noindex removal, public-build test; rerun full suite.
- [ ] Separate approved main merge and Cloudflare production publish/verification. Cloudflare automatic deployments were disabled at last check.


### Draft technical QA verification — 2026-11-18
- GitHub branch `draft/audio-interfaces-mixers-20261118`, PR #20 draft/unmerged. No public curriculum, sitemap, Journey or approved tutor-bank mutation. Existing 26-lesson progression unaffected.
- Regression [run #44362439487](https://github.com/thesoundquestion/website/actions/runs/44362439487): **441/441 tests pass**, including JavaScript syntax, linked Journey stages and full public-site build safeguards.
- Technical/source review targeted real manufacturer examples of a 10-channel mixer with only two USB recording channels and a genuine multi-channel recording mixer. No claim these numbers are universal. Audio interface output DAC and headphone monitoring functions correctly acknowledged rather than treating interface as strictly input-only.
- Static tests do not verify pixel-level readability or actual screen-reader usability. Two new SVGs have descriptive title/description/HTML alt and caption; narrow-screen visual comparison is a review gate.
- Next release gate is owner approval of wording, visuals and planned position before course numbering/publishing. Cloudflare deployment has **not** been requested or triggered.
