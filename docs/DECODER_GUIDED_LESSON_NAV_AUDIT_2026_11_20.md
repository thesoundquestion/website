# Decoder lesson progression audit · 20 November 2026

## Scope
Reviewed the end-of-lesson navigation sequence across all 27 published Decoder lessons, from `sound-basics` to `mastering-dynamic-range`, against `decoder/curriculum.json`. This is draft-branch navigation work, not permission to publish or deploy.

## Findings
- All 27 lessons already contained correct static next-lesson links, but the footer often felt like a generic extra card rather than the obvious next action.
- Lesson-specific inline links and tool callouts remain useful in context, but prominent competing end-of-lesson buttons distracted from the curriculum.
- In `mixing-soundstage`, four prominent buttons preceded the same next-lesson card; its former text also contained a stale lesson number.
- `sound-basics` and `recording-sources` had extra future-facing end sections immediately before the next-lesson card.
- Seven category boundaries added a large alternative topic switch below the primary next card. The last lesson also presented the first lesson as if it were the next unfinished lesson.
- `lossy-lossless` ended with three related lesson links directly before the progression card.

## Implemented
- One visually prominent, static and keyboard-accessible next-lesson card after the educational content on every page, with an explicit `Continue to lesson NN` action, lesson number and category context.
- Each lesson now offers a concise, curriculum-stored bridge explaining the next conceptual step, not just a link label.
- Course progress is visible and announced using a progressbar with the correct value out of 27.
- Category boundaries are presented as a coherent next lesson instead of introducing competing topic-switch banners.
- The last page acknowledges completion and offers the course overview rather than silently looping to Lesson 1.
- Removed three redundant `id="next"` blocks; placed optional related links in the expandable supplemental area where they were distracting.
- Preserved the original technical lessons, contextual teaching links, measurement notes and sources.
- Updated `scripts/sync_decoder_navigation.py` so future curriculum synchronization recreates the approved pattern. Navigation works without JavaScript.
- Added `tests/lesson-guided-progression.test.mjs` for all 27 pages, sequence, next CTA, progress, and the known link-cluster regressions.

## Manual release checks
- On desktop and narrow mobile widths, scroll to the bottom of representative lessons 1, 7, 8, 11, 15, 22, 26 and 27. Confirm legible text, visible action, reasonable spacing, keyboard focus and no horizontal overflow.
- Confirm previous/all-lessons links remain useful but subordinate, and optional sources still open.
- Confirm the final-lesson completion state reads naturally and the linked Decoder overview remains the intended next destination.
- Run the site regression and GitHub browser-preflight workflows before approving any production deployment.

**Deployment status:** No Cloudflare build or deployment requested or triggered.
