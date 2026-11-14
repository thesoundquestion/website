# Original cymbal recording archive (13 November 2026)

## Status

**All WAV and MP3 audio binaries are currently in the owner's persistent ChatGPT Library, not this public GitHub repository or Cloudflare Pages.** Do not assume the binary audio paths exist here. This note is a retrieval/provenance handoff, not a public website publishing step.

Library folder: `/The Sound Question/Audio/Cymbal Ride 2026-11-13/`

Available Library archives:
- `tsq-cymbal-trimmed-audio.zip`: four aligned 16-bit/44.1-kHz PCM CD-style WAVs plus five aligned 32-bit-float working WAVs (36 seconds each).
- `tsq-cymbal-raw-48k-masters.zip`: full-length 48-kHz floating-point original working versions.
- `tsq-cymbal-raw-cd-44k16.zip`: original full-length 16-bit/44.1-kHz CD-style processed exports.
- `tsq-cymbal-raw-192k-working-export.zip`: untrimmed 192-kHz/32-bit floating working file, an **upsampled export**; not proof of 192-kHz hardware acquisition.
- `tsq-cymbal-mp3-comparisons.zip`: six MP3 constant-bitrate (32, 64, 96, 128, 192 and 320 kbps) mono 44.1-kHz versions from the **same** trimmed normalized 16-bit PCM source, plus the 16-bit WAV reference and generated 8-bit WAV reference.
- `README.md`, `manifest.json`, `mp3-README.md` and `mp3-manifest.json`: source details and SHA-256 hashes.

Source recording: original user-recorded 20-inch Zildjian A Custom Ping Ride, FIFINE K669D microphone into M-Audio M-Track Solo, 48-kHz mono digital capture. Windows input set to 2-channel 32-bit/48-kHz; this does not guarantee native 32-bit converter resolution. No commercial music has been used.

## Interpretation and future publishing

- **Mastering**: the base, normalized, compressed and heavily compressed variants reflect different processing; source/normalized comparisons show gain without compression. Do not claim the heavy variant is necessarily the loudest.
- **PCM resolution**: `CD` in source filenames means 16-bit/44.1-kHz **mono** PCM, not literal two-channel audio CD. The separately generated 8-bit reference uses noise-shaped dither; it is not the user's own 8-bit export.
- **MP3**: the 32–320 kbps versions share the exact same normalized WAV; their bitrate is a lossy coding rate, *not* PCM bit depth. Avoid introducing new mastering differences in the comparison. Confirm timing/encoder padding and match playback loudness when appropriate.
- The current full archives and floating masters are too large to publish casually on the public website. Choose short excerpts and web-friendly formats before copying public files into `assets/audio/`; confirm user approval for publication and test playback first.
- GitHub connected tooling in this session supports text file writes but not direct binary file uploads from the working container. The actual WAVs and MP3s were successfully preserved in the Library; to make them live site assets, transfer the chosen binaries separately through a supported binary upload channel.

Keep the original capture unchanged. Generate all format comparisons from one matched reference.
