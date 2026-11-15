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

**Audio stays local.** The file picker creates temporary `blob:` URLs for browser playback. No audio is sent to GitHub, Cloudflare or another service. This branch contains **zero full-band copyrighted audio bytes**. The dataset's CC BY 4.0 attribution is documented below; public hosting remains gated on confirming its scope for the underlying music and recording.

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

## Recording credit and thank-you

The excerpt is **“Let The Light In” by Tom McKenzie**, from the album *Extraordinary* (released 2025). Original album: https://tommckenzie.bandcamp.com/album/extraordinary

The three 30-second teaching mixes are independently edited versions of **14 mixed-dry / processed-dry stems** from **AlbumDB: A multitrack dataset of a ten-song album with stereo and immersive 7.1.4 masters**, version 1.0 (2026). The dataset's listed creators are **Thomas McKenzie, Eloi Moliner Juanpere and Alec Wright**.

- Original research dataset and source: https://zenodo.org/records/19683001
- Specific-version DOI: https://doi.org/10.5281/zenodo.19683001
- Dataset license recorded by Aalto University: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), also catalogued at https://research.aalto.fi/en/datasets/albumdb-a-multitrack-dataset-of-a-ten-song-album-with-stereo-and-/
- Modification statement: we selected a 0:40–1:10 excerpt and made three independent educational mixes, altering track balances, width, panning, EQ, ambience, automation and other effects. The original commercial stereo master was not used as a remix input. All comparison masters were gain-matched only, without mastering compression or limiting.
- Thanks to the musician and research collaborators for making real multitracks available for learning and experimentation. No artist or researcher endorsement is implied.

**Publication distinction:** The commercial Bandcamp release displays an "all rights reserved" notice, while the AlbumDB dataset is separately listed as CC BY 4.0. The public audio-hosting step should confirm the dataset's licensing scope and whether any distinct recording/composition rights require additional permission. **Do not remove the audio publication gate based on attribution alone.**

## Publishing gate

Before making this live: confirm the scope of the dataset's CC BY 4.0 licence for derivative audio and any separate commercial-album rights, review the attribution wording, and finalize the hosting plan; optimize the 30-second recordings (WAV archive vs compressed streaming delivery) while preserving fair comparison; connect validated audio URLs; review UI on headphones and stereo loudspeakers; confirm legal/policy copy; and explicitly approve a deploy.

## Quality checks

Run `node --test tests/mixing-lab-preview.test.mjs` from the repository root. The preview is plain HTML/CSS/JavaScript, uses no paid services or build tools, and makes no network calls itself.
