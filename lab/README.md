# ABX architecture update, 2026-11-17

The draft now uses a single dedicated /labs/abx/ page rather than separate embedded player widgets. The individual lessons link into the ABX Lab, and each comparison links back to its relevant original lesson/mode/song. See docs/abx-labs/README.md for authoritative future-test and release instructions. Production and automatic Pages deployments are unchanged.

# Mixing Lab — online listening implementation

Route: `/lab/` from `/labs/`. Three independently produced, 30-second stereo educational mixes of “Let The Light In” by Tom McKenzie, made from 14 processed-dry AlbumDB stems covering song time 0:40–1:10.

- Online lossless FLAC streams: `https://tsq-lab-audio.thesoundquestion.workers.dev/mixing/{narrow,reference,polished}.flac`.
- Browser file pickers optionally replace audio with local WAV or FLAC. User files are not uploaded.
- The player keeps a shared position and includes quick cues. Headphones are recommended for depth demonstrations.
- The examples are gain-only matched to −20 LUFS without final-stage mastering compression.
- Side/mid ratios: Narrow −42.77 dB; Reference −14.61 dB; Polished −9.68 dB. These are measurements, not quality rankings.

## Research and rights

Original artist: Tom McKenzie; song “Let The Light In”; album *Extraordinary*. Original record: https://tommckenzie.bandcamp.com/album/extraordinary

AlbumDB creators: Thomas McKenzie, Eloi Moliner Juanpere, Alec Wright. Dataset v1.0: https://zenodo.org/records/19683001 ; licence: https://creativecommons.org/licenses/by/4.0/ ; paper: https://aes.org/publications/elibrary/elibrary-page/?id=23185 (AES 160th Convention, 2026, Paper 10278).

On 2026-11-16, the artist responded affirmatively to the request of 2026-11-15 for publicly streaming independently edited and mastered educational excerpts, including the underlying composition and recordings, asking to cite the paper and artist. Preserve the full source emails in the project mailbox. This permission does not establish unrestricted redistribution of raw stems, standalone commercial sales or endorsement.

## Quality and release

Run `node --test tests/*.test.mjs` plus `python3 scripts/sync_journey_topics.py --check`. Then verify browser playback and mobile usability before production approval. `node scripts/build-public-site.mjs` publishes only allowlisted media and excludes stems. Cloudflare automatic builds are disabled; do not merge or deploy without authorization.

## Shared ABX framework (draft)

Training, Challenge and Advanced implementation, source-validation gates, proposed Worker/D1 scoring and required release tests are documented in [`docs/abx-labs/README.md`](../docs/abx-labs/README.md). The separate ABX framework is **not deployed** and server scoring is **disabled pending validation**. Training examples must not be treated as independently verified hearing measurements. New listening experiments should reuse this framework and its versioned comparison catalogue rather than adding a bespoke ABX scorer.

## Free-tier playback cost requirement

Do not standardize eager Mastering waveform downloads into other labs. The live original Mastering experiment fetches three FLACs for waveform rendering on page load, unlike Fair/EQ. Future playback improvements must first respect [the Cloudflare Free-tier playback policy](../docs/lab-playback-free-tier/README.md), minimize Worker/KV calls and compare real P50/P95 switch times, request counts and transferred bytes. No deployment from the draft branch.

## Community submissions (draft)

The Curator's Listening Room accepts anonymous single-recording nominations with a dropdown for its existing seven categories; its comment section and the ABX Lab comments are moderated. They use the existing D1 database with `COMMUNITY_PUBLIC_ENABLED=false` until the coordinated manual release. See `workers/abx/COMMUNITY-REVIEW.md` and `docs/abx-labs/README.md` for storage, moderation, privacy and future expansions.
