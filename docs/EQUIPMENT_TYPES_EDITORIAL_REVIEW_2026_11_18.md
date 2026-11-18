# Microphone types and speaker types — draft editorial review (2026-11-18)

**Scope:** Two stand-alone review drafts on `draft/microphone-speaker-types-20261118`. These do **not** modify `main`, the published curriculum, sitemap or decoder course index. Cloudflare is not being deployed. Exact route numbers and navigation placement need approval before publication.

## Research / existing material checked
- `thesoundquestion/research/LESSON_RESEARCH_MICROPHONE_TYPES_SPEAKER_APPLICATIONS_2026_11_18.md` defines scope, technical cautions and Style B+ visual direction.
- Website `AGENTS.md` is the global mandatory absolute-beginner and no-duplication standard.
- Existing published `decoder/recording-sources/`, `recording-resolution/`, `speaker-drivers/`, `speaker-dispersion/`, `speaker-impedance/`, `speaker-sensitivity/`, `amplifier-power/`, `bass-extension/` were consulted for linking and to avoid repeating their explanations.

## New material actually added
1. `decoder/microphone-types/index.html`: mechanism (moving-coil, condenser, ribbon); taxonomy (element vs pattern vs use vs connection); shotgun/lavalier/headset/handheld/boundary/contact/measurement/stereo/MEMS; power and phantom caveats; microphones for stream, vocal, acoustic and amplified instruments, drums, live and film; beginner specs checklist and comparisons.
2. `decoder/speaker-types/index.html`: “loudspeaker” umbrella; function (hi-fi, studio, PA) vs listening distance vs box form vs amplification; near/mid/far; stage wedges, point source, arrays, architectural/outdoor/party/soundbar/sub; common use cases, types and overlaps.
3. Shared `assets/equipment-types.css`: responsive B+ dark-blue/cyan panel system, no required JS.
4. New vector conceptual diagrams: `assets/illustrations/mic-types-mechanisms.svg` and `assets/illustrations/speaker-types-settings.svg`. The mic cutaways and scene coverage are *illustrative only, not scale models nor measurements*; captions and alt text spell this out.
5. `tests/equipment-types-lessons.test.mjs`: link/anchor, image, essential concepts, navigation, no-course-publish guard.

## Precise crosslinks (never re-teach detailed concepts)
**Microphone types:** recording sources `/#mic` for patterns, `/#room` for mic placement, `/#paths` for recording input flow; recording resolution `/#gain` for levels and gain.
**Speaker types:** speaker drivers `/#ways-explained` for frequency roles, `/#subwoofers` for subs; speaker dispersion `/#understand` for off-axis and reflections; impedance, amplifier power `/#headroom`, sensitivity, bass extension and System Builder.

## Review gates still open
- Owner review of all prose for unnecessary technical detail, awkward wording, overexplanation or duplicates.
- Illustration accuracy/style review, especially cutaway labels and PA audience geometry. SVGs are engineered **conceptual** vector art, not factory schematics or measured dispersion.
- Verify external research links in live browser and make editorial source corrections if needed. Source-derived claims have short outbound reading references.
- Manual browser/mobile viewport check at 360/390 px, iOS/Android device and keyboard/reader-friendly flow; automated static checks alone aren't visual QA.
- Confirm course lesson order and whether speaker-types follows dispersion and microphone-types follows recording-sources, then run `scripts/sync_decoder_navigation.py`, update `decoder/curriculum.json`, the Decoder hub and `sitemap.xml`, regenerate journey links and run full regression.
- Publish only after deliberate branch review/merge and manual Cloudflare release authorization. No draft branch previews are assumed available.
