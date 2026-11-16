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
