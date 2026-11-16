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
