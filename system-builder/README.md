# System Builder v0.7 | practical owner-evidence fallback preview branch

This is a static, zero-backend, browser-only preview for **Recording to Room → System Builder**. The Cloudflare **feature-branch preview is live** at https://feature-system-builder-previ.thesoundquestion.pages.dev/system-builder/ but the production `main` branch is unchanged. The original System Check, Compare My Gear, gear catalog and validated calculations are not modified.

## Scope

- Seven listening goals; one primary plus at most two secondary; faithful-source vs preferred sound character.
- Separate passive, consumer powered, active studio, headphone and party/PA routes.
- Existing speaker, amp, source and headphone selection bridged **read-only** from the 130 source presets and supplemental Compare My Gear specs. Unlisted model support with explicit unknowns.
- Separate no-sub, sub+verified mains HPF, sub+full-range mains and unknown-routing branches; never assume a SUB OUT creates HPF or automatic headroom.
- Checks for complete signal path, battery vs mains, published speaker nominal impedance vs amp ratings, whole-system cost, sources and setup-first.
- The first named shortlist is now shown **above** the long technical report. It contains 12 editorial system examples (budget/step-up passive pairs, powered stereo pairs, two separate active monitor alternatives, open-back headphones, battery and mains party PA, a used watchlist) plus optional named subwoofer research leads, all with individual source links and candid cautions.
- Prices are individually verified Canadian offer/list snapshots checked 2026-11-12, not representative averages or completed systems. A strict budget blocks examples with known listed component subtotal already above the ceiling. Unknown source/volume/control/sub/taxes/transport costs are NOT treated as zero.
- Selecting an already-owned amplifier **without speakers** now changes the actual recommendation strategy to *speaker pairs for that amp*, not full packages with another amplifier. Curated, source-linked candidates resolve from the read-only 59-speaker System Check catalog; the owned amplifier has **zero incremental purchase cost**. The shortlist screens conservatively using published continuous-load ratings and explicit manufacturer restrictions where available (not burst power or nominal impedance alone). It remains conditional pending the full impedance/phase and amplifier manual, input path and actual level. Price examples currently include dated CAD pair listings for Polk ES15, Polk ES20 and Klipsch R-50M; no unpriced/used speaker is claimed to be within budget. If a visitor instead explicitly requests powered speakers, party, headphones or battery operation, the output says the existing amplifier is not reused for that route.
- The short results preview shows up to **3 compact product cards** by default, displaying model names, observed partial prices, an **individualized 'Why this one' explanation** based on actual selected goal tags, room context, secondary priorities and retained amp, a **short model-specific sound description** (or explicit unknown) and urgent incompatibility warnings. Sound notes link to their review, lab interpretation, or manufacturer provenance in each card's expansion. They never manufacture acoustic precision or imply that preference tags are measured performance. Extra candidates, each card's full parts/trade-offs/sources, the individual chapters of the compatibility audit, and methodology use native keyboard-operable <details>/<summary> disclosures. Original rationale remains available untruncated in the expanded cards. Safety-critical speaker/amp load warnings remain visibly prominent even while cards are collapsed.
- The detailed ownership, headroom and bass audit is behind an accessible expandable section; a model and a claimed source input do not certify impedance, level or full-system compatibility.
- All outcomes qualitative and conditional; no product scores, scraping, retailer APIs, login, local storage or transmitted form data.
- Independent data can be cited as links under its reuse policy; numerical catalog scoring remains gated by rights and comparable methodology.

## Engineering ownership

The pure policy module `engine.mjs` adapts the private research `system-builder-prototype/engine.mjs` while preserving its eligibility functions. It is **not** a new power/headroom calculator. For electrical output at distance, visitors use existing `/system-check/`.

`catalog-adapter.js` is intentionally a classic script loaded *after* existing `gear.js` and `compare/specs.js`. It reads their global lexical `const` objects and creates a separate frozen `window.systemBuilderInventory`; it never edits the originals. No research-only products automatically become published recommendations. The 63 candidate research records and 18 pilot model sample remain private/unapproved.

Future normalized catalog data should carry model revision, evidence tier, method/test conditions, rights, currency, typical regional price (not isolated listing), availability date, safety recall scope, and actual user-configured subwoofer routing. The qualitative UI must remain usable if pricing is unknown.

## Test

```sh
node --test tests/system-builder-eligibility.test.mjs tests/system-builder-data.test.mjs tests/system-builder-recommendations.test.mjs tests/system-builder-compact-results.test.mjs tests/system-builder-owned-amp.test.mjs
node --test tests/*.test.mjs
```

133 / 133 top-level Node tests pass with 16 new owned-amplifier matching tests (previous 117 unchanged). An additional headless Edge QA run on a local HTTP-served branch checkout submitted four real form scenarios successfully: CAD 200 wired desk, battery PA, passive dynamic with used watchlist, and battery headphone with suitable source required. The feature-branch Cloudflare preview is live. Additional headless Edge smoke checks confirmed 7/7 compact-display behaviours including first-three cards, closed native details, safety warning visibility, and expandable audit chapters, plus 7/7 owned-amplifier browser scenarios for A-720, budget filtering and R-S202 impedance caution. These tests verify the core gate invariants and read-only 130-preset import. They do not claim the 32 synthetic research acceptance fixtures have all been automated, nor do they replace a real browser/screen-reader QA or Cloudflare deployment check.

## Release barriers

1. Review preview language, evidence provenance and model revision handling.
2. Test responsive widths 320/390/768/1280 px, keyboard navigation, focus order, input validation, no-JS fallback and different form states in a browser.
3. Run all original System Check, Compare My Gear and general site regression tests.
4. Preview deployment already verified on Cloudflare, but production `main` is intentionally unchanged. Do not merge for public release without owner review.
5. Do not add 1–100 match ratings, global value rankings, auto-approved catalog expansion or third-party measurements without permission and method compatibility.

Research baseline: Recording to Room v0.9, Equipment Research Plan v1.6, Weighting Research v1.3 and Subwoofer Research v1.1 (private `thesoundquestion/research`, 2026-11-12). Source policy: https://www.erinsaudiocorner.com/measurement-data-policy/ (effective 2026-10-29).

## v0.5 · Explainable preference matching and sound descriptions (2026-11-12)

- `sound-profiles.mjs` provides reviewed, source-linked editorial notes for all 12 system examples and 12 owned-amp speaker leads. A fallback explicitly says when no dependable model-specific profile exists. An independent review impression is never represented as a guaranteed room result, nor is manufacturer marketing presented as independent evidence.
- `recommendationWhy()` names the primary goal only if the item was actually tagged for it; names only matching secondary goals; identifies the selected use case; identifies an already-owned amp without charging for it; and flags known incomplete input/budget conditions. This is a transparent editorial explanation, **not** a score, calibrated preference-to-sound relationship, or verified electrical pairing.
- The card keeps price, individualized reason, sonic description and urgent warnings visible. Detailed explanations, evidence links, parts and trade-offs remain in the existing native disclosures. The `character` choice is not yet a ranking input and the UI admits this explicitly.
- Review descriptions are original short paraphrases with links, not copied source charts or numerical rankings. The separate rights and comparability gate remains unchanged. Prioritization is unchanged.
- Check `node --test tests/system-builder-*.test.mjs`, full regression suite, small screens, keyboard access and live preview before merging. Production remains untouched.

## v0.6 · Owned gear is the starting point (2026-11-12)

- The ownership-first planner in `owned-gear-options.mjs` runs whenever **any** owned speaker, amplifier, source/DAC or headphones are entered. Every owned component is either included in the proposed path or named as retained for a separate listening use. The keep/setup checkbox does not disable ownership consideration.
- Owned speakers alone: shortlist actual catalog amplifiers, retaining the speakers. Owned amplifier alone: shortlist speakers, retaining the amplifier. Both: keep the actual pair first; assess published compatibility caveats and show partial-reuse alternatives if a concrete manufacturer load restriction is identified.
- Owned source: include and explain its output connection in new-system suggestions, without silently charging for or replacing it. Owned headphones: retain the headphones first in a headphone path; verify output/drive rather than assuming an RCA DAC line out is a headphone jack.
- Mixed equipment and an explicitly different system architecture (powered, party/PA or battery) still produce an acknowledged compatible reuse route, clearly labelled as **not** meeting that new format automatically.
- Complete new systems remain available **only as a collapsed comparison** under reasons that could justify replacement (load restriction, missing input, inadequate clean output, event/battery requirement or demonstrated listening limitation). Neither a model name nor a listening-preference tag proves a product sounds better.
- Unknown input voltage, speaker load curve, safe headroom, local purchase price or exact revision stay unresolved. No invented measured scores, no full speaker/amp pair compatibility certification, and no source/earphone direct-drive assumptions.
- Run `node --test tests/system-builder-*.test.mjs` and full site suite. Test presets and unlisted entries, four owned-component combinations, opposite architectures and low budgets in real browser before merging to main.

## v0.6.1 · Specific amplifier explanations (2026-11-12)

- In owned-speakers/missing-amplifier scenarios, each amplifier card now says **Why this amplifier**, based on its own documented continuous power and test load, the owned speaker's known nominal load, the user's requested connection type, and a clear statement of remaining unknowns. Individual details show the actual test-condition note and a link to the original catalog specification source.
- These are **initial checks**, not a claim that a published resistive-load rating certifies speaker compatibility, that power ratings predict vocal timbre/imaging, or that the suggested amp can play cleanly at the requested seat/level.
- For a keep-speakers amplifier recommendation, a non-verified listening profile is no longer rendered as a generic **Sound** statement about the amplifier. A model-specific *speaker* profile is labelled as such where actually available. Amplifiers receive electrical/source justification instead.
- Keep all original named product and source links, electrical safety cautions, ownership paths, and the optional full-system comparison.


## v0.7 · Source-linked owner experiences are a real recommendation fallback (2026-11-12)

**Problem addressed:** Missing standardized acoustic measurements or thin exact-model reviews must not cause the Builder to fail to recommend otherwise viable speaker candidates. The primary user experience remains 2–3 specific compact equipment cards, with technical detail behind disclosures.

- New `owner-evidence.mjs` contains a small **manually curated, exact-model** set of six passive speakers: Polk Signature Elite ES15/ES20, ELAC Debut 3.0 DB63, KEF Q150, Q Acoustics 3020i, Paradigm Monitor SE Atom. Each has independently written brief summaries, critical counterexamples/uncertainty, owner-discussion URLs and qualitative evidence-availability tiers. No copied user posts, username databases, API access, scraping or numerical preference scores.
- `sound-profiles.mjs` now prefers the manually reviewed **owner experience** notes for the precise speaker model over lab references that do not qualify a listening-preference claim. The UI says "Owner experiences" and links to multiple source discussions under **What is included, drawbacks & sources**. It still uses existing editorial/manufacturer descriptions when firsthand reviews are missing.
- `owned-amp-speakers.mjs` ranks candidates **lexicographically**, first by declared listening goal and use case, next by the availability of relevant repeat owner experiences, and finally by stable editorial order. The tier is evidence context, **not** an 0–100 sound-quality score or numerical weighting coefficient. Known 8 Ω-only amplifier restrictions still exclude a demanding speaker as a suggested pairing; review praise never overrides a hard safety gate.
- A missing speaker nominal impedance value is now **conditional rather than a silent exclusion**. It carries an explicit prominent **do not connect before verifying** notice. Fully known incompatible loads are still rejected for that pairing.
- Speaker cards with no credible model-specific sound evidence avoid an additional unhelpful "unknown sound" paragraph. That is a display simplification, not a reason to remove the model.
- Completely new system bundles, used equipment prices, active speakers and measurement-based quantitative scoring remain gated by their own sourcing/eligibility work. This is a **limited first pilot**, not evidence that the full catalog has been independently reviewed.
- The primary legal/provenance constraints from research Batch 06–08 continue to apply. Linked owner posts are not rehosted testimonials. Before commercial/affiliate reliance on third-party testimonial-based promotional representations, seek the appropriate rights and advertising-law review.

**Validation:** 14 new owner-fallback policy tests cover exact-model evidence, mixed positive/negative reports, priority-sensitive ordering, no-data recommendations, load restrictions, unknown nominal impedance, unpriced regions, and compact expandable source links. The full Node suite passed **176/176** after updating the earlier "unknown sound" visibility assertion. Headless Edge validated owner-first flows; R-S202 visible shortlist excludes KEF Q150 even though a separate owner source link **mentions** that model in a comparison. Final deployed revision and full accessibility still require release QA.

Research authority: private `thesoundquestion/research/SYSTEM_BUILDER_OWNER_EVIDENCE_FALLBACK_BATCH_08_2026_11_12.md` and companion source-ledger JSON. The private research documents are not copied to the public repo, and this small linked editorial module does not import their raw content.
