# Beginner-first MP3 versus lossless Lab: unpublished review

**Status:** Standalone draft at `/labs/formats/` on this branch. This is **not** public or release-ready. Production branch `main` and the live navigation were not changed.

## What has been prepared

A self-contained, standalone HTML/CSS/JS page asks a single beginner-friendly question: **Can you hear the difference?** It reuses existing hosted FLAC samples already used by other The Sound Question labs:

- `/mixing/reference.flac`: “Let The Light In”, the existing 30-second educational reference *mix*.
- `/mastering/dynamic.flac`: “Diva”, the existing educational dynamic *master*.

The full source URLs are recorded directly in `labs/formats/index.html`, under the established `https://tsq-lab-audio.thesoundquestion.workers.dev` host.

The page presents **Original (lossless)**, **MP3 128 kbps** and **MP3 320 kbps** as choices. The user selects a song, then clicks a single preparation button. In this preview only, JavaScript fetches the original FLAC, decodes it, and uses **lamejs 1.2.1** to derive matching stereo MP3 clips from the *same audio*, with no different mix, EQ, mastering, added gain or other source alterations. The encoder library is loaded from a version-pinned public CDN under its upstream LGPL-3.0 terms (https://github.com/zhuker/lamejs). MP3 data is created in the listener's browser without uploads; optional download links help the owner export files for quality checks and future prehosting.

Basic sighted A/B switching, same nominal playhead time, a short listen-for guide and easy everyday-language explanations are included. More detailed methods and credits are collapsed. There is **no unvalidated ABX test** or claim that listeners can always hear a difference. The file deliberately has `noindex,nofollow` and offline-review language. No paid service was added.

## What was verified

- Plain JavaScript parsed with Node 22.
- Three local Node source tests passed.
- Chromium DOM/visual snapshot renders at desktop and 390 px mobile widths; tested mobile viewport has no horizontal overflow.
- **Not verified:** actual network audio fetch, Cross-Origin Resource Sharing headers from the audio Worker, third-party CDN delivery, browser FLAC decoding, generated MP3 audio fidelity, exact time alignment, loudness differences, or mobile playback. This environment cannot directly fetch the existing hosted audio URL. Do not claim live audio playback is QA-approved.

The conversation-local preview files are:

- `TSQ_MP3_vs_Lossless_Preview.html` (one-file HTML preview, source FLAC and encoder still require internet);
- `TSQ_MP3_vs_Lossless_Source_Preview.zip` (separated source HTML/CSS/JS/tests and documentation; original audio binaries are not included).

## Required work before publication

1. Verify licensing/permissions for deriving and hosting audio from AlbumDB-based adaptations, including underlying compositions and original sound recordings; credit original song/album, dataset creators, CC BY 4.0 licence, and modifications as applicable.
2. Use the existing audio hosting solution to **pre-encode and host the MP3** files once so ordinary visitors don't wait for browser conversions or load a third-party MP3 library. Replace the preparation step with direct play.
3. Check exact source files, hashes, actual encoded bitrates, decoded duration, MP3 encoder delay/padding, matching time positions, loudness, peak levels and objective source differences. Prefer an original fixed commercial-format stereo master over one of our already remixed or mastered adaptations if licence and bytes are available. Until then clearly label the source for each song as the educational version currently hosted.
4. Test real listening on Android/iPhone, desktop browsers and headphones with actual source media. Test keyboard/touch/accessibility and error recovery.
5. Add a Labs hub card and a contextual link from the lossy-versus-lossless lesson **only when the public player is functional**, then update the sitemap and final editorial copy. Keep the copy beginner-first; put any true technical detail behind an optional disclosure.
6. Align this branch with the latest production `main`, which has advanced concurrently. Run site-wide regression tests before considering any integration.
7. Keep Cloudflare Git automatic production/preview deploys **OFF** and do not manually deploy without specific owner authorization. Source-only GitHub commits on this draft are not a publishing signal.
