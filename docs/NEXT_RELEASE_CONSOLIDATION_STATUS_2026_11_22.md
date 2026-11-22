# The Sound Question | Next-release consolidation and release acceptance
**Updated:** 2026-11-22  
**Repository:** `thesoundquestion/website`  
**Integrated branch:** `release/consolidated-next-20261122`  
**Review PR:** [#43](https://github.com/thesoundquestion/website/pull/43), DRAFT, targeted at production `main`  
**Release decision:** NOT YET AUTHORIZED. No production merge, Cloudflare deployment, IndexNow production submission or optional AI activation has been performed.

## Consolidated features and source branches

- Started from `draft/magicpath-compact-full-site-20261120`, which had already incorporated beginner-friendly navigation, compact/sound-first recommendations, revised lessons and musical references from the consolidated prelaunch work.
- Adapted `audit/legacy-197-risk-gates-20261121` / PR #39's source-conscious equipment certification, evidence-preserving headroom analysis, Builder-to-System-Check handoffs, new powered-loudness and subwoofer-connection checkers, Compare categories, and safety/evidence tests. These were carefully rebased around the newer compact Builder instead of wholesale replacing its HTML and recommendation UI.
- Included the Spotify app-first Listening Room handler from PR #41. All 55 original `open.spotify.com` destinations remain plain HTTPS fallbacks. Desktop `spotify:` custom URI launch uses a best-effort delayed fallback; Android/iOS retain OS-handled HTTPS links. A browser cannot reliably detect app installation and may display a protocol confirmation prompt.
- Included the IndexNow verification file, submission helper and post-deployment instructions from PR #38. **Submit only after the approved live domain is actually deployed and checked.**
- Included the separate video intro/soundtrack production handoff from PR #40; it does not add autoplay audio, live video or a new website animation.
- AI backend remains disabled; Ask TSQ continues using its free, prepared lesson-aware answer model. No affiliate scripts or sponsored links have been activated. Unapproved engineering preview tools remain unlisted.

## Integrated workflow and safety contract

1. **Listening/Creating Builders:** preserve listener's existing equipment, requested room/distance and source requirements; dynamically distinguish required from optional fields. Use a documented exact equipment record or editable visitor-supplied specifications; a model name alone never fabricates values.
2. **Passive headroom:** transfer exact models, distance and target average/brief peak into System Check. Only documented, relevant sensitivity and same-load continuous amplifier output may support a numeric theoretical estimate. Speaker impedance, room response, phase, burst behavior and clean bass output remain distinct limitations. Unknown values stay unknown; a 2.83 V sensitivity is not universally 1 W.
3. **Powered speakers:** no electrical amplifier-wattage-to-SPL conversion. Standalone checker uses documented acoustic reference distance or clearly reports an unverified result. JBL 305P MkII 94/108 dB manufacturer maxima do NOT have a confirmed microphone distance in the cited reference, so no seat-distance max-SPL margin is calculated. Kali LP-6 V2's published 115 dB peak at 1 m is not a source-qualified maximum continuous SPL; the earlier compact calculator separately discusses the manufacturer's 85 dB continuous reference listening capability at its specified distance. These different statements and test conditions must not be represented as interchangeable clean-output maxima.
4. **Subwoofer signal path:** require actual source output and sub input types; use confirmed RCA/3.5 mm routes where documented. An unlisted/unknown subwoofer never inherits Edifier T5 wiring, filtering, controls or a certified connection. Main-speaker high-pass claims require exact model/settings evidence.
5. **Comparison handoff:** the reusable `exactRecommendedCompareHandoff` only creates a preselected comparison when exactly one qualifying catalogue identity matches the recommended product. Current Compare has 12 categories, including powered studio, powered PA and catalogue headphones. Empty generic or lookalike-variant links are not valid integration.
6. **Safety gates:** unsafe load/speaker-level-to-line-level connections and missing nominal speaker ratings do not become ready-to-connect recommendations. A technically possible pairing does not imply guaranteed clean headroom. A powered pair does not accept external amplifier speaker outputs. An additional source converter/adapter must be disclosed and never silently priced as included.
7. **Pricing:** manufacturer and dealer references are dated component asking prices, not live stock, a guaranteed complete budget or an automatically updated feed. Local currency and incomplete totals must stay visible.

## Manufacturer source reviews and registry status

- The **197 frozen legacy record IDs are preserved**: 195 unchanged grandfathered, plus 2 changed PSB speaker records given fingerprint-specific **AI-assisted manufacturer-source technical review**. Exactly **0 outstanding review-required changes**, 0 removals. The high/medium/lower register is triage, not proof of safe pairing.
- PSB Alpha P3: published 85 dB anechoic/87 dB typical room sensitivity; P5: 87/89 dB. Their cited datasheets specify 1 W (2.83 V) at 1 m with IEC-filtered C-weighted pink noise, nominal 8 Ω, minimum 4 Ω. The 60 W program rating is not a continuous damage threshold. Formal field-specific evidence and review limitations are recorded in `equipment/certification/reviews.json` against the exact current fingerprints.
- Those reviewer entries explicitly say **AI-assisted manufacturer-source review, no human production approval or independent bench test**. Do not describe the 197 as all certified, or the two reviewed records as third-party laboratory verified.
- Fosi BT20A Pro (32 V/5 A adapter) + Polk Monitor XT15: the two manufacturers state compatible nominal speaker-load permissions (Fosi 2–8 Ω, Polk compatible with 4/8 Ω amplifier loads, documented 4.1 Ω minimum). This **does not** verify a matched full-band continuous clean-output rating or unrestricted high-volume operation. The example is retained as a load-permitted, evidence-qualified budget option, not an electrically unsafe combination and not a guaranteed clean 300 W/channel system.
- Do not reset `equipment/certification/legacy-baseline.json`, invent unavailable measurements or bypass certification by changing tests to suppress genuine safety failures.

## GitHub validation, exact commits

- **`ebab2dc9844faff4db6dc49fbcb04317ed118c25`**: all 6 GitHub workflows completed successfully on the *exact same commit*, including site regression **983/983 passing**, equipment certification, permanent catalog admission, Ask TSQ free-only release checks, packaged desktop/mobile browser preflight and Listening Labs/ABX browser smoke.
- Subsequent preflight additions exercise standalone powered and subwoofer checkers on desktop/mobile plus narrow viewport routes. Their exact-head CI must be reviewed again before final release sign-off; do not reuse a previous green result as proof for later commits.
- GitHub-only `scripts/build-public-site.mjs` enforces certification and the generated-output contract. It is NOT a Cloudflare deployment. Where relevant, also verify the audio lab, homepage/Decoder navigation, mobile widths at 320/390/768 px and keyboard interaction.
- Historical CI failures (16, then 7, then 2) were reconciled by source review, safe ownership gating, and updating assertions for the new UI rather than reverting working compact features.

## Final go-live acceptance checklist

- [x] Consolidated Builder, lesson, listening, Spotify, tools, evidence, SEO and handoff code staged in PR #43.
- [x] Certification and catalog admission controls enforced without overwriting the 197 legacy baseline.
- [x] Exact full GitHub suite green at `ebab2dc9` (983 tests and 6 workflows).
- [ ] All workflows green on the **final exact PR #43 HEAD** after the latest browser additions/document edits.
- [ ] Owner acceptance: visually review mobile and desktop compact recommendations, lessons, navigation, room/loudness examples and source limitations. Test protocol/app handoff on actual Spotify-installed and uninstalled devices where possible.
- [ ] Verify real model-specific headroom, 2.1 signal wiring, safe unknown-input behavior and cross-tool links on the exact packaged release candidate. Manual review of any claimed powered continuous acoustic output is mandatory before promoting it as clean SPL.
- [ ] Explicit owner authorization to merge approved PR into `main` and carry out one separately authorized production deployment.
- [ ] Post-deployment HTTPS/navigation/robots/site maps/structured data inspection, then manually submit IndexNow URLs if desired. No evergreen price/stock claims.

**Release boundary:** Keep PR #43 a draft, preserve other development branches, never automatically merge `main`, never deploy to Cloudflare and never submit live IndexNow until the user explicitly authorizes those actions.
