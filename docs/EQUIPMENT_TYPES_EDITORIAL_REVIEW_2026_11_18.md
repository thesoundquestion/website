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


## Owner approval and site integration update (2026-11-18)
The user explicitly approved both lesson drafts and requested numbering, complete Decoder integration, regression and a redundancy/flow audit.
**Chosen order:** keep original Lessons 01–20 unchanged, Speaker Types = 21 (directly after dispersion), existing Recording Sources = 22, Microphone Types = 23, Recording Resolution = 24, Mixing = 25, Mastering = 26. The recording topics retain their natural capture → microphone-choice → recording levels → mixing → mastering order. Speaker Types comes after the existing dispersion lesson because its practical focus complements the prior measurement chapter.
**Integration scope:** curriculum, hub cards, sitemap, Journey topic links, all numbered headers, course progress/next/previous navigation, minimal contextual links in the canonical older lessons, and regression tests. Do not reintroduce polar-pattern diagrams or two/three-way speaker descriptions. No cloud deployment action by this integration alone.


## Integration completion and regression results (2026-11-18)

**Owner approval:** Both draft lessons approved, including first-use **Dynamic (moving-coil)** terminology. Permission covers numbering and integration. This is an evidence-based code/editorial audit; no claim of manual physical-phone screenshot review.

### Exact course structure after insertion
- 01–19 unchanged.
- 20 speaker dispersion → **21 speaker types** → 22 recording sources → **23 microphone types** → 24 recording resolution → 25 mixing → 26 mastering.
- Recording chapter part numbers: recording sources = Part 1, microphone types = Part 2, recording resolution = Part 3, mixing = Part 4, mastering = Part 5.
- `decoder/curriculum.json` is the sequence source of truth. Static top/bottom next/previous/progress was generated on **all 26** lesson pages, including explicit progress “Lesson NN of 26”.
- Added the two numbered `decoder/index.html` cards in their respective speaker/recording categories, updated 24→26 headline metadata, added both `sitemap.xml` canonical routes.
- `journey/topic-links.json` points microphone-type questions to the new `#inside` explanation and speaker-role questions to new `#jobs`. `journey/index.html` regenerated. `scripts/sync_journey_topics.py --check` passes.
- All 26 lessons have corresponding prepared-answer tutor data ordered exactly as curriculum: `assets/lesson-tutor/approved-answers.json`. New entries give beginner-focused answers to specific terms, use cases and limitations; new visual figures are static, not fake interactive graphs.
- The existing public release builder `scripts/build-public-site.mjs` supports these routes and asset types. The actual `tests/public-build-output.test.mjs` builds the static public package and now explicitly requires both lesson pages, `assets/equipment-types.css` and both illustrations in `site-dist`.

### Overlap and redundancy verdict
| Concern | Existing canonical teaching home | What new page does instead | Result |
| --- | --- | --- | --- |
| Mic polar patterns and graphical pickup diagrams | `recording-sources/#mic` | Defines pattern only for the current selection issue, links to existing lesson | No repeated polar widget |
| Mic-to-room ratio and illustrated distance effects | `recording-sources/#room` | Explains one-sentence consequence and links to placement illustration | No duplicated room demo |
| Input gain and recording converters | `recording-resolution/#gain`, `recording-sources/#paths` | Briefly defines preamp/USB/XLR as necessary to make a decision, links to recording chain and gain lesson | No redundant level meter |
| Speaker driver count and crossovers | `speaker-drivers/#ways-explained` | Notes two/three-way as a separate design classification and links | No duplicate driver charts |
| Off-axis response/reflection graphs | `speaker-dispersion/#understand` | Discusses practical seating and coverage, links to original measurement lesson | No repeated dispersion curves |
| Impedance, sensitivity and amp headroom | `speaker-impedance/`, `speaker-sensitivity/`, `amplifier-power/#headroom` | Practical checklists only, links at decision point | No repeated formulas or power calculations |

**Short recaps in earlier lessons are intentional, not full duplication:** Recording Sources retains its existing short three-microphone-category orientation; it now links readers to Microphone Types for detailed explanation, while retaining its actual polar-pattern demonstration. Dispersion retains measurements; Speaker Types focuses on which uses benefit from different designs. No existing detailed figures were copied.

**Navigation cleanup:** Removing the new drafts' redundant footer “All lessons” link and filler text was necessary once full course progress navigation was added. The new footer's remaining action is useful rather than duplicating the next-lesson control: microphone placement on the former, System Builder on the latter.

**Terminology/claims:** New page leads with “Dynamic (moving-coil)” at the first classification, main card and diagram. Ribbon dynamic induction relationship retained but explained separately. No dynamic automatically rejecting room sound, no condenser automatically better detail, no studio monitor automatically flat, no PA automatically low quality, no line array exempt from level/distance physics. All illustration coverage shapes explicitly identified as conceptual, not measured.

### Actual verified automated checks
- Site regression CI run https://github.com/thesoundquestion/website/actions/runs/44357961349 : **437/437 tests passed**, no skips/failures.
- Node/frontend syntax: passed. Journey link sync and published curriculum link verification: passed.
- Comprehensive `tests/decoder-26-lesson-release.test.mjs`: checks 26 ordered cards/meta/sitemap, internal links and image paths across all 26 pages, and redundant footers.
- `tests/lesson-tutor/bank.test.mjs` and playback/source/opening tests: pass with 26 source-ordered tutor entries, preserved baseline and correct new slots.
- Static Pages builder: **build passed** under existing public-build test and includes both pages, CSS, SVG masters; existing approved media/handbook production safeguards remain intact.

### Limits and final release steps
- Automated checks cannot substitute for an actual 360/390 px phone, iOS/Android viewport, keyboard/screen-reader or visual illustration inspection. The previous owner preview was reviewed before approval; no new browser/device render is claimed after lesson numbering.
- No unrelated website copy was altered beyond required cross-links and renumbering. Footer overlap was removed, not restyled across the whole site.
- Merge to `main` and Cloudflare live deployment are distinct states; verify their actual status rather than inferring production from GitHub CI.
