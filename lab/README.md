# Mixing Lab — preview-only GitHub branch

A standalone `/lab/` prototype for **The Sound Question**. It is **not a public release** and is not linked from the live site's primary navigation.

## Review locally

From the repository root:

```sh
python -m http.server 8000
```

Open `http://localhost:8000/lab/` in a browser. Select the three approved **30-second, gain-matched WAVs** from the owner's machine using **Choose WAV files**:

- `TSQ_30SEC_NARROW_GAIN_MATCHED_FINAL.wav`
- `TSQ_30SEC_REFERENCE_GAIN_MATCHED_FINAL.wav`
- `TSQ_30SEC_POLISHED_GAIN_MATCHED_FINAL.wav`

They will be matched to their mix automatically by filename. A separate “Load just this WAV” control is provided for arbitrary filenames.

The page has a **single shared playhead**. Choose Narrow, Reference, or Polished at any point without navigating back to the transport controls; playback position is retained when switching. Quick cue buttons jump to selected moments. Explanatory notes are directly next to the player. Headphones are recommended but not mandatory.

**Audio stays local.** The file picker creates temporary `blob:` URLs for browser playback. No audio is sent to GitHub, Cloudflare or another service. This branch contains **zero full-band copyrighted audio bytes**. The WAVs must not be uploaded for public hosting until the underlying recording licence and attribution have been verified.

## Scope

- One experiment, based on song 0:40–1:10 from **14 processed-dry stems**; not untreated raw recording tracks.
- Three mixes: intentionally near-mono (Utility Width 1% on each track), conventional processed-dry reference, and deliberately theatrical/polished.
- All three final listening WAVs were **−20 LUFS gain-only matched**, without mastering compression, limiting, EQ or other post-mix processing.
- Stereo measures: side/mid −42.77 dB (Narrow), −14.61 dB (Reference), −9.68 dB (Polished); not a quality ranking.
- Existing source choices clearly attributed: shaker stereo drift was already baked into source stems, and the backing-vocal reinforcement was deliberate in the reference mix.
- Polished mix features close strummed guitar near clip 0:17 and Leslie-inspired accelerating synth modulation at clip 0:26–0:30.
- No audio playback is possible until the owner chooses local files. This is intentional, not a broken embedded player.
- The earlier *Listening Lab* cymbal/ABX prototype remains a separate experiment; this preview doesn't replace its code or claim to improve its ABX implementation.
- No main-branch nav update, sitemap update, deployment, or public page is included.

## Publishing gate

Before making this live: verify the stems' licence, derivatives/redistribution permission, credit wording, and hosting plan; optimize the 30-second recordings (WAV archive vs compressed streaming delivery) while preserving fair comparison; connect validated audio URLs; review UI on headphones and stereo loudspeakers; confirm legal/policy copy; and explicitly approve a deploy.

## Quality checks

Run `node --test tests/mixing-lab-preview.test.mjs` from the repository root. The preview is plain HTML/CSS/JavaScript, uses no paid services or build tools, and makes no network calls itself.
