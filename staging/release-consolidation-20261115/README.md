# The Sound Question — consolidated release candidate (2026-11-15)

**Branch:** `draft/release-consolidation-20261115` (NONPRODUCTION)
**Source:** `draft/site-hub-curator-lab-notes-20261115`, itself based on the Mixing Lab and newer Content Use work.
**Cloudflare:** Automatic production and preview deployments are disabled. Do not re-enable or deploy without explicit owner approval. Use `[CF-Pages-Skip]` for draft commits.

## Consolidated in this pass

- Preserved the latest site-hub work: six-point navigation, curator note, evidence article, neutral Content Use policy, relevant external measurement links and offline Mixing Lab.
- Cross-checked the repository's file trees rather than blindly merging old branches: current `main` and site hub **already contain** the System Builder and decoder-waveform implementations. Merging the outdated release/feature branch wholesale would risk replacing newer changes.
- Added a general `/labs/` landing page, independent of any single dataset. Introduced AlbumDB and its real album, individual recording stages, full attribution and non-endorsement language, plus space for future original/family recordings. Linked the homepage to the labs hub; the existing `/lab/` remains the Mixing Lab experiment.
- Changed the Mixing Lab's visitor-facing publication warning into a neutral recording credit and moved permissions checks to this release checklist. **No audio was added or licensed by that edit.**
- Staged the 59-page illustrated handbook's manuscript and release instructions as archival text; the public PDF remains unavailable in the website repository, and the existing download remains unchanged.
- Added checks for the Labs hub, attribution and navigation updates.

## Publication gates, not automatically fulfilled

1. **No audio-hosting authorization:** The AlbumDB manuscript expressly supports mixing/mastering education and identifies CC BY 4.0, but underlying composition, performance and third-party sample rights for public streaming remain to be confirmed. Do not add third-party WAV files to the public static site without a verified reuse decision. The creator has been contacted.
2. **Labs functionality:** `/lab/` is an offline file-picker prototype, not a publicly listenable demo without local WAVs. `/labs/` remains `noindex,nofollow`; do not release it as a finished general listening destination until the linked experiments work for visitors and the robots tag is intentionally reviewed.
3. **Mastering Lab:** The separate standalone offline package and measurement manifest must be ported, tested and credited before the public site can claim a completed Mastering Lab. Recorded accepted quantitative gates do not replace the curator's artistic acceptance.
4. **Handbook:** Retrieve the archived PDF and image bundle, verify SHA-256 recorded in `staging/handbook-20261114/README.md`, review author-approved assets and forward links, check each Cloudflare Pages asset against 25 MiB max, and replace the existing download only with permission.
5. **Cross-branch freshness:** Current production `main` already has System Builder, decoder tests, new waveforms and lesson updates. Keep their newer implementations when reconciling, not old branched copies. Re-run full repository `node --test tests/*.test.mjs` plus manual mobile/desktop and keyboard navigation review on a local checkout.
6. **Production checks:** Verify all HTML links, accessibility, sitemap, CSP/assets, mobile widths 320/390/768/1280, and zero restricted or private files committed. Confirm test results before requesting one controlled production build.
7. **Costs:** Free Pages documents 500 builds per month. The account had 504 deployment records as of 2026-11-15, of which 455 succeeded, 3 failed, 37 skipped and 9 had not begun. That does not equal remaining build quota. Do not use production builds as regression tests.

## Why a straightforward merge was avoided

- `release/system-builder-20261113` and `feature/decoder-realistic-waveforms-20261113` diverged from current `main`. Their implemented application files are already available in the current site tree.
- The site-hub branch has the latest neutral attribution policy; the older content-use branch would overwrite it.
- The handbook branch contains editable text, not the released PDF or artwork binaries.
- The Mastering Lab's standalone offline package was created outside the GitHub website repo and cannot be represented as merged until its HTML/JS is actually staged and reviewed.

## Next work sequence (offline only)

1. Port and validate the Mastering Lab preview into a versioned site route without copying restricted audio.
2. Supply and verify the handbook's PDF/images from its archival package, decide what to publish.
3. Run full tests, manual responsive/keyboard/audio interaction review and source/rights acceptance.
4. Reconcile `/labs/` noindex policy and release navigation with genuinely playable public examples.
5. Obtain owner approval for one `main` release commit and one Cloudflare production deployment. Then disable auto builds again and verify the release.

## Nov 15: revised information hierarchy and consent for personal examples

- Removed a named Grado/Paradigm listening anecdote from the public experiment evidence. The replacement explains spatial playback differences generally, without representing private listening notes as a controlled study. No unapproved private gear or family example should appear in educational content.
- The complete autobiographical curator excerpt remains on About because it was explicitly requested; any new identifiable personal anecdotes, family projects or equipment case studies require owner approval before publication.
- Homepage now has an About action near the top. Main homepage cards cover Lessons, Labs, System Check, System Builder, Compare My Gear and the Library; Behind the Experiments is linked from within Labs and Library.
- Mixing and Mastering have two peer cards on the Labs hub; the full standalone offline Mastering Lab with local WAV picker, real waveform rendering, sound comparisons and simple ABX UI is staged at `/lab/mastering/`.
- Staged Mastering HTML does not include licensed WAV bytes, is `noindex,nofollow`, and remains a review artifact. Real public audio and final changes require rights/curator approval. No live Cloudflare deployment authorized.
- Longer-term design proposal: unify navigation on ALL pages, reduce scrolling on mobile, keep mixing/mastering experiments as first-class destinations, and link evidence/source detail contextually. Do not silently implement that sitewide overhaul without user design review.
