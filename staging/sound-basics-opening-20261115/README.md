# Sound Basics opening lesson: release checkpoint
Last revised: 2026-11-15

Status: draft branch only, NOT merged into main or deployed.

Branch: `draft/sound-basics-opening-lesson`
Route after release: `/decoder/sound-basics/`
Lesson order: 24 lessons, Sound Basics first, Speaker Frequency Response second.

## Delivered
- Introductory chapter: hertz, typical human hearing, instrument overlap, dB versus perceived loudness, EQ/mixing, speaker frequency-response interpretation, harmonics and nonlinear distortion, tactile bass and ultrasonic “air” claims.
- An original fictional response graph and two modes (speaker / speaker + EQ). Clearly not a measurement of a real loudspeaker.
- An original schematic source-versus-clipped waveform illustration. No audio is synthesized or played.
- Fully updated 24-lesson curriculum and next/previous navigation, homepage lesson badges, Decoder hub's first lesson, Journey topic links, sitemap, prepared helper-answer bank and tests.
- Browser Rendering checked on the draft HTML without deploying a Pages preview; response-curve EQ overlay, legend and button state toggle in both directions. Fixed the SVG hidden-attribute issue found by that check.
- Structural review verified all 24 lesson next/previous links and progress counters.

## Remaining before publishing
- Run complete `node --test` in a current local checkout, plus `python3 scripts/sync_decoder_navigation.py` (and review the diff), `python3 scripts/sync_journey_topics.py --check` and `node scripts/build-public-site.mjs`.
- Inspect desktop/mobile layout in a full preview with the site-wide stylesheet.
- Merge only after editorial review.
- Do not confuse this with the separate `staging/handbook-replacement-20261115` branch. That branch is missing the final approved 59-page PDF binary and is deliberately gated against deployment.
- Keep automatic Cloudflare builds disabled; schedule one manual deployment only after all release work is consolidated and verified.
