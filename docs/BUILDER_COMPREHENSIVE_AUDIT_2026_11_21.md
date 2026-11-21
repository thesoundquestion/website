# The Sound Question | Listening Builder integrated audit

**Date:** November 21, 2026  
**Status:** draft preview branch only, no merge or Cloudflare deployment  
**Repository:** `thesoundquestion/website`  
**Branch:** `draft/magicpath-compact-full-site-20261120`  

## Why this audit exists

Owner found repeated defects in successive manual preview iterations. This pass checks the underlying catalog, recommendation selection, output evidence, calculator links and rendered paths before another manual design review.

## Verified coverage

- **197 catalog records:** structural scan for unique IDs and exact model/category identities, presence of relevant facts and sanity of reported speaker loads/sensitivities. Not an independent remeasurement or source-by-source manufacturer specification audit.
- **4,500 complete-system recommendation requests:** crossing architecture, location, primary listening goal, requested source input, level and budget. For each returned recommendation, checked native requested connection, safety gate, nonduplicated identity, relevant headroom route, and nonnegative known price.
- **931 automated Node checks passed in the first full green GitHub Actions run (commit `adb5a36c7d13078c1b3346649bed36ebf4381668`, run `44903340954`),** together with the desktop/mobile packaged-site browser preflight and successful static build. Re-run on final branch tip is required after any subsequent commit.
- Browser preflight covered desktop/mobile, creating and listening builders, compact complete systems, owned amplifier and headphone paths, exact and unlisted gear, model-aware System Check handoff, beginner lessons/labs and 320/768-pixel horizontal-overflow checks.
- Existing amp and speaker headroom tests remain authoritative for numeric power/load results; no acoustic max SPL has been invented for low-cost powered speakers.

## Fixes carried through on the draft

1. **Unusable signal paths**: complete systems are not called ready to connect when the specified source output is unsupported by the proposed setup. A converter is no longer waved through as unspecified, unpriced equipment; the choice is excluded with a clear reason. Real optical/USB paths retain eligible models.
2. **Missing powered headroom**: original Kanto ORA and Edifier MR4 now provide source-backed practical listening guidance and keep their numerical peak margins explicitly unknown. Added routes for Edifier R1280T, R1280DB, R1280DBs, R1700BTs, MR3 and M60 so their cards do not omit headroom entirely.
3. **Missing listening notes**: six budget Edifier pairs now have concise model-specific text and links to published independent reviews, without imputing a subjective amplifier sound signature.
4. **Lesson tutor control mismatch**: the speaker-driver lesson exposed Horn-loaded as a graph option but omitted it from the approved Q&A cases. Added the explanation and synchronized the generated runtime module.
5. **Regression blind spots**: added a draft-only GitHub Actions workflow, extensive combination tests, and updated stale layout assertions to match the explicitly approved sound-first compact interface, rather than relaxing engineering constraints.
6. **Browser preflight selectors**: narrowed the original System Check input selector so powered/provisional forms do not create ambiguous matches; tested the actual compact-card structure.

## Known remaining evidence limits

- **Published amplifier wattage is not clean acoustic SPL.** Where a manufacturer or independent review does not give a comparable maximum SPL with appropriate distance and distortion conditions, no numerical headroom is claimed.
- **Not all 197 catalog entries have independently verified sound profiles, current regional prices, or complete high-level output tests.** The Builder must omit unsupported sonic certainty and mark price observations as dated.
- **4,500 scenarios are not every possible configuration.** Owned-gear, subwoofer, recording and headphone special routes also have separate focused tests, but future additions still require new regression cases.
- **Automated browser checks are not an owner's final visual/style approval.** No claim of pixel-perfect mobile UI or universal cross-device sound compatibility.
- Do not merge or publish while tests are red. The work remains in the isolated preview branch pending review.

## Repeatable verification

Run the draft-only GitHub Actions workflow:
`/.github/workflows/builder-draft-integrity.yml`

The workflow performs source syntax checks, the full `node --test tests/*.test.mjs tests/lesson-tutor/*.test.mjs` suite, static build and desktop/mobile browser preflight **without deployment**.

Only after a clean run at the reviewed branch tip and owner approval should the release candidate be considered for merging.
