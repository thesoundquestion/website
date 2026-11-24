# The Sound Question — Video Intro and Brand Continuity Handoff

**Owner decision:** 2026-11-22  
**Status:** Owner-approved v8 video intro direction and render. This document is **documentation only**. It is not a live website feature, does not upload the video, and does not authorize YouTube publication or a Cloudflare build.

## Current approved production reference
- **Intro:** TSQ Intro v8, **7.7 seconds**, native **3840 × 2160**, **30 fps**, H.264 video, AAC audio (~256 kbps); an independent Full HD (1920 × 1080) export exists in the production workflow.
- **Music:** *Algorithm* by Jason Shaw / Audionautix. Source recording and licensed music evidence are kept with the owner’s video-production materials, **not** in this public website repo. *Azitmuth* (sometimes named `Azimuth.mp3` locally) is an atmospheric background reference and is **not** added to the intro as a second track.
- **Visual identity:** retain the existing brand mark at [`assets/mark.svg`](../assets/mark.svg) and palette from [`assets/styles.css`](../assets/styles.css). The original wave-mark is still present in the website source; it should **not** be reinvented. Homepage wordmark renders `The Sound` in light lettering and `Question` with the site’s `.gradient-text` blue/cyan gradient.

## Approved animation treatment
1. Start completely black. A central horizontal flatline emerges with a very brief overall fade.
2. First small electronic clicks/sounds produce **actual source-audio min/max positive and negative waveform peaks**, Audacity-style, not generic ornamental ripples.
3. Fade in a blue/navy technical-grid background **after the initial peaks**, darkest in the upper text/logo region and subtly lighter in the waveform band.
4. At about **2.4–2.5 seconds on the edited track**, introduce a smooth continuous rolling/undulating movement to the source-derived waveform. The rolling displacement is **artistic**; original PCM extrema provide the peaks. The sound does not crash.
5. Fade in the elevated title **before** the waveform-mark logo. Put both on a higher compositing layer than the wave. The waveform must not draw over letters.
6. Fade out audio, waveform movement, lettering, logo, and backdrop gradually **within the original 7.7-second duration**. Let the line settle to the opening’s flatline position, briefly remain, then fade to black.

**Source-script time anchors from approved v8:** overall fade-in 0.34s; backdrop 1.22s + 2.05s fade; rolling effect ~2.43s; title 3.26s + 2.1s fade; logo 4.20s + 2.4s fade; outro audio/wave damping 6.05s + 1.48s, lettering/logo fade 6.55s + 1.12s, background 6.10s + 1.57s, flatline fades 7.22s–7.70s.

**Revision constraints:** v5 was accepted as prototype; v6 (9.6 s) was rejected as too long; v7 kept 7.7 s but faded too quickly; **v8** is the approved 7.7-second fade treatment. Do not repeat these rejected regressions.

## Licensing and attribution gate
The intro's early electronic sounds and rolling surf-like sound are part of the same *Algorithm* recording, not separate inserted samples. **Music is copyrighted, not public-domain, but Audionautix publishes it under a Creative Commons attribution license permitting commercial adaptations with credit.**

- Official music catalog: https://audionautix.com/free-music/electronic
- Official licensing statement: https://audionautix.com/creative-commons-music
- CC BY 4.0 terms: https://creativecommons.org/licenses/by/4.0/
- Archived Algorithm recording (older CC BY 3.0 attribution): https://commons.wikimedia.org/wiki/File:Audionautix-com-ccby-algorithm.mp3

**Required draft description credit (adapt if publisher terms change):**  
“Music: *Algorithm* by Jason Shaw (Audionautix). Source: https://audionautix.com/ . License: CC BY 4.0 https://creativecommons.org/licenses/by/4.0/ . Edited: shortened, trimmed and faded for The Sound Question intro.”

Copyright claims can still be issued in error; perform an unlisted Content ID check before public use and preserve source/license evidence. Independently audit every additional sound effect, sample, background track or cover. Recording a cover yourself does not grant composition rights automatically.

## Video production library and content alignment
- Build a small bank of free, **properly licensed** intro, narration, transition and test/demo music. Prefer source-tracked CC BY / CC0 with explicit commercial, derivative/edit/loop and cross-platform rights; retain hashes and attribution/licensing evidence. Never equate “free download” with permission.
- Owner’s specific music preferences: recognizably repeating motifs, weighty yet tasteful rhythmic anchors, gradually evolving layered textures, space, and earned musical payoff. *Algorithm* is the **intro** reference; *Azitmuth* is the **general background** reference. Use much quieter arrangements or no music during voiceover and critical-listening comparisons.
- This is an identity for **website-led educational content**, not an invitation to put music behind calibrated listening tests. Maintain beginner-first explanations, sourced measurements and links back to the relevant published lessons and system tools.

## Authoritative private handoff
More complete file provenance, detailed render script names, source SHA-256 hashes and the owner’s local-media location are kept in the **private** companion repository at `thesoundquestion/research/TSQ_VIDEO_PRODUCTION_AND_SOUNDTRACK_HANDOFF_2026_11_22.md`. Future production work must inspect that and the actual files; do **not** mistake this public document for a replicated media archive.

## Deployment guard
This is a source/documentation-only draft. Follow [`AGENTS.md`](../AGENTS.md): GitHub branch/pull request and tests before an owner-approved merge; **no Cloudflare build, preview or production deployment without specific owner authorization**.
