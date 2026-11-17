# MP3 vs lossless Listening Lab — actual source, encoding and publication record

**Page:** `/labs/formats/`  
**Staging branch:** `draft/mp3-lossless-beginner-lab-20261115`  
**Status:** MP3 encoding and static source regression completed. Public publication requires one controlled Cloudflare Pages deployment of the approved `main` commit. Automatic deploys remain OFF.

## For first-time visitors

The page asks **Can you hear the difference?** before explaining technical terms. Visitors pick one of two songs, press Play and switch between **Original (lossless)**, **MP3 128 kbps** and **MP3 320 kbps**. Brief tips mention cymbals, soft sounds and tails. Terms such as FLAC, MP3 and bitrate have short plain-English explanations, with detailed methods tucked behind a disclosure.

No browser-side encoder, MP3 library, user upload, Web Audio API, account, paywall or blind-test claim is required. MP3 files are ordinary static site assets, while existing FLAC originals continue to stream from the audio Worker.

## Provenance and processing

- **Let The Light In:** The Sound Question's existing 30-second **educational reference mix** of music from Tom McKenzie's *Extraordinary*, hosted at `https://tsq-lab-audio.thesoundquestion.workers.dev/mixing/reference.flac`. This is NOT the original artist's final master.
- **Diva:** The Sound Question's existing 40-second **educational dynamic master** of music from the same album, hosted at `https://tsq-lab-audio.thesoundquestion.workers.dev/mastering/dynamic.flac`. This is NOT the original artist's official release master.
- **Source dataset:** AlbumDB (https://zenodo.org/records/19683001), credited to Thomas McKenzie, Eloi Moliner Juanpere and Alec Wright; listed as CC BY 4.0. We independently adapted the tracks for our previous lessons. Credit and modified-example disclaimer are visible on the format page. Further rights concerns should be reviewed before broad public distribution.

The four MP3s were built in one successful GitHub Actions run at https://github.com/thesoundquestion/website/actions/runs/43797182071 using Ubuntu FFmpeg 8.0.1, libmp3lame, stereo 44.1 kHz constant bitrate at 128 and 320 kbps. **Every MP3 originates from its exact referenced hosted FLAC**, without a separate mix, mastering pass, EQ, or gain adjustment during encoding. No desktop remote session was needed; Desktop Commander was at its monthly limit.

The full `assets/audio/formats/manifest.json` records each original FLAC's SHA-256, duration and size; all four MP3 SHA-256 values, bitrates, sample counts, decoded offsets, correlation and peak/RMS changes.

| Source | MP3 | Bytes | Decoded offset | RMS relative to FLAC |
|---|---|---:|---:|---:|
| Let The Light In | 128 kbps | 481,070 | 0 samples | −0.4358 dB |
| Let The Light In | 320 kbps | 1,202,676 | 0 samples | −0.0004 dB |
| Diva | 128 kbps | 641,148 | 0 samples | −0.4363 dB |
| Diva | 320 kbps | 1,602,872 | 0 samples | +0.0005 dB |

The browser uses a small **playback-only** volume reduction (approximately 0.951 for lossless and 320 kbps; 1.0 for 128 kbps) so the versions have nearly matched sample RMS. This reduces the chance that a small level difference affects the listener's comparison. It is not the same as a LUFS/controlled-laboratory equal-loudness ABX test. Switching is approximate-position A/B, not instantaneous sample-accurate switching.

## Build and quality controls

- The page is linked from the `/labs/` hub and `/decoder/lossy-lossless/`, and included in `sitemap.xml`.
- `scripts/build-public-site.mjs` **continues to deny all audio/video files by default** and allows only the exact four MP3 paths whose SHA-256 hashes are explicitly pinned in source. Each must be smaller than 2 MiB. Any unexpected/new/replaced audio is rejected.
- `tests/formats-lab-source.test.mjs` checks audio files, correct bitrates, decoded alignment and beginner content. `tests/public-build-output.test.mjs` checks the four approved MP3s and no other published audio.
- The existing site-wide Node tests and standard mobile navigation must pass on the GitHub pull request, including public build filtering. Runtime listening on Android/iOS and cross-origin FLAC fetch still warrants post-deployment confirmation.
- No API key, premium service or additional Cloudflare R2 bucket is required. All four MP3 assets are small enough to serve with the existing static Pages build.

## Deployment safety

Cloudflare automatic Git deployments are intentionally OFF. A normal GitHub commit does not publish the new page. When CI is green and the merge is approved, create **one ad hoc Cloudflare Pages production deployment** for the exact merged `main` commit. Record deployment ID and verify the public MP3 URLs, page and links. Do not re-enable automatic builds, upload raw audio/stems, or run repeated deployments merely to test content.

## PR #11 reconciliation — November 17, 2026

**Decision for the coordinated site release:** preserve the current native-on-demand Formats Lab player as the default. Do **not** bulk-merge `feature/seamless-formats-switching-20261116` into the shared ABX release branch.

PR #11's `assets/format-comparison-engine.js` is genuine synchronized Web Audio. After preparing **all three tracks**, it plays them against one AudioContext clock and switches by changing gains, avoiding source restarts. It has a native fallback. That is technically useful, but **its default workflow waits to fetch and decode all three complete files before first playback**, consuming additional memory and bandwidth even for visitors who only want to hear the original. This conflicts with the current free-tier/on-demand goals. It also predates the shared `Offline` / `Please wait` / `Ready` labels and the stand-alone ABX Lab.

The current draft's native player preserves fast Play, with up to one alternate track prefetched **only after** the listener has begun and enough audio is buffered. No media requests are made when loading Formats or changing songs/versions before the first Play. It resumes near the same position when selecting another format, but **it is not gapless or sample-aligned**. The lesson explicitly calls it an approximate-position comparison. This is an accurate, release-appropriate compromise.

**Staged optional development (not yet production validated, November 17):**
The shared release draft now includes `assets/format-comparison-engine.js` adapted
from PR #11, but **does not make it the default player**. Initial Play still uses
the ordinary `<audio>` streaming path; a separate **Prepare instant switching
(optional)** button intentionally downloads/decodes the three variants of the
selected song. After successful preparation they start at one AudioContext time
and offset, and format buttons change gains without changing sources.
Preparation is tied to one selected song, aborts on song change, and is
capped at **14 MiB total compressed download** and **48 MiB decoded stereo
float PCM**. Readiness is shown once for the entire prepared group, not as
independent timing clues. Any error leaves ordinary streaming available.
Visitors can return to normal playback.

This costs additional data and roughly 35–46 MB of decoded PCM per song
at browser sample rates. The limits are safety bounds, **not measurements of
peak browser memory**. CORS, FLAC decode support, real device resource use,
rapid-switch audio gaps, and Worker/KV request counts still need release
validation. Do not describe this as guaranteed gapless across browsers.

The original PR #11 remains separate and open until the coordinated release
is verified. Its old eager first-Play logic must not replace the native
on-demand default. The staged source tests, browser smoke and Cloudflare
build-file gate have been updated; inspect their latest CI results before
marking this complete.