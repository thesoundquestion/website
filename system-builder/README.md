# System Builder v1.0 preview | practical owner-evidence fallback preview branch

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

**Validation:** 14 new owner-fallback policy tests cover exact-model evidence, mixed positive/negative reports, priority-sensitive ordering, no-data recommendations, load restrictions, unknown nominal impedance, unpriced regions, and compact expandable source links. The full Node suite passed **176/176** after updating the earlier "unknown sound" visibility assertion. Headless Edge validated owner-first flows; R-S202 visible shortlist excludes KEF Q150 even though a separate owner source link **mentions** that model in a comparison. A follow-up headless Edge form-submission pass confirmed **9/9** browser checks for A-720 and R-S202 speaker selection, multiple owner-source links, collapsed details, load cautions and unpriced-budget fallbacks. Cloudflare feature-branch deployment succeeded; app, owner-evidence, sound-profile and owned-amplifier modules each returned HTTP 200. Full manual mobile/screen-reader QA and production approval are still pending.

Research authority: private `thesoundquestion/research/SYSTEM_BUILDER_OWNER_EVIDENCE_FALLBACK_BATCH_08_2026_11_12.md` and companion source-ledger JSON. The private research documents are not copied to the public repo, and this small linked editorial module does not import their raw content.

## Amplifier power, distortion and model-specific reviews (12 Nov 2026)

- `amplifier-fit.mjs` adds conservative ordering for amplifier suggestions paired with an owned speaker. Existing hard load and budget gates stay. The model weighs source connections, actual continuous amp rating **at the speaker's nominal impedance**, broad proximity to documented speaker handling, and evidence for full-band low-THD output. Never extrapolate 8-ohm power to 6 ohms.
- Use `speakerPowerNominal` ahead of `speakerPowerMaxInput`, whose test method can be unknown. A recommended amplifier maximum is not speaker power handling. A peak rating is not comparable to amplifier continuous watts. Extra power is not automatically dangerous or acoustically beneficial; safe volume, clipping and mechanical/thermal limits matter.
- A published full-band THD ceiling <=0.1% at matching load improves evidence, but non-identical conditions do not support precise comparisons and small numerical THD differences do not imply audibility. Missing THD evidence is uncertainty, not poor sound.
- Model-specific listening impressions are optional, attributed and labelled as uncontrolled listening experience. They do not create a Yamaha/Marantz/etc house sound or affect order without a meaningful, model-specific sound preference. Reviews of discontinued equipment are not evidence of current stock.
- The default stays three cards, with explanation first and detailed source/review links under disclosures. No visible numeric fit scores. Use System Check for listening-position headroom rather than inventing an extra power/SPL model.
- Background: FTC 2024 Amplifier Rule (https://www.ftc.gov/news-events/news/press-releases/2024/06/ftc-issues-final-amendments-amplifier-rule-make-testing-methods-more-useful-consumers); Crown (https://www.crownaudio.com/en-US/how-much-amplifier-power); JBL (https://jblpro.com/en-US/site_elements/danger-low-power).


## v0.8 · Expanded owner experience and real Canadian price references (2026-11-12)

- **12 exact passive speaker owner-context profiles** now cover Polk ES15/ES20, ELAC DB63/B6.2, KEF Q150, Q Acoustics 3020i, Paradigm Monitor SE Atom/Titan v3, Wharfedale Diamond 12.2 (original), DALI Oberon 1, JBL Stage 250B and Klipsch R-50M. Each has linked original analysis of firsthand setup reports; user disagreements, vintage condition, model revisions and missing evidence remain visible. No copied owner posts, numerical preference scores or third-party raw measurements.
- **Canadian pair-price source pilot:** new market-price-context.mjs distinguishes regular three-merchant Paradigm Monitor SE Atom pair prices around CAD 360, temporary sale observations around CAD 270, and vintage Titan v3 used asking examples of CAD 125–150 from two dated listings. These are **not transaction medians or normal used-price averages**. Additional single-listing ES20 and self-reported Wharfedale 12.2 examples appear in the expandable details, not as guaranteed typical prices.
- Monitor SE Atom now has an actual dated regular pair-price reference instead of unknown cost. Other unpriced models remain discoverable but are never assigned zero cost.
- When used equipment is enabled and a Canadian budget is especially tight, the used Titan can be a leading *conditional used discovery* candidate with refoaming/condition caveats. No availability or completed-sale price is promised. Missing comparable acoustic measurements do not remove otherwise sensible suggestions; known electrical and safety restrictions still screen the actual pairing.
- The top compact card names the specific speaker reason even if the user already owns an amplifier. Full source links and price observations remain inside the disclosure, not an expanded beginner-facing wall of warnings.
- Original System Check and Compare My Gear data and calculators are unchanged; no production merge.

**Validation status:** Earlier full website Node suite passed 176/176. This update adds 11 price-context test cases and 2 additional exact-model owner-evidence tests. A separate exact-current-GitHub-source evaluation against the original System Check speaker/amp catalog verified **14/14** cases including regular-vs-sale price separation, model identity, used budget path, and R-S202 load restrictions. A remote checkout using the mutable branch ref had stale module content during rapid updates; a **fresh exact-head full Node test run and responsive/manual accessibility QA are still required before release**. Do not claim a new all-tests-passed count without that run.

Private [Batch 09 research report](https://github.com/thesoundquestion/research/blob/main/SYSTEM_BUILDER_OWNER_MARKET_RESEARCH_BATCH_09_2026_11_12.md) and [machine-readable evidence ledger](https://github.com/thesoundquestion/research/blob/main/SYSTEM_BUILDER_OWNER_MARKET_EVIDENCE_BATCH_09_2026_11_12.json) document the 12 models, 32 linked discussion observations, and Canadian price/source classifications. Keep raw research private and evaluate advertising rights before monetized use of third-party endorsements.


## v0.9 · Realistic entry-budget options and automated regression (2026-11-12)

The user now receives usable named speaker options at much lower budgets, not only unpriced high-tier gear or generic "try used" advice. **Missing measurements are not an automatic rejection, but known safety and real price limits remain meaningful.**

- Two **Builder-only supplemental passive pairs**, Polk Monitor XT15 (regular CA$249 pair) and Polk Monitor XT20 (regular CA$349 pair), with source-checked manufacturer minimum impedance **4.1Ω / 4.3Ω** and independently sourced **8Ω nominal** listings. The supplemental file does not touch the 130 original System Check presets, calculations or Compare My Gear records. Both models can be selected as already owned inside Builder.
- XT15 has a carefully qualified independent listening review; XT20 has contrasting actual owner experiences in two discussions. The curated model-selection scope rises to **14 passive speaker suggestions**, with **13 exact-model source-linked owner-context entries**. We do not create a numeric fidelity, match or owner sentiment score.
- Canadian regular-price references for XT15 from three sellers at CA$249/pair and XT20 from three at CA$349/pair, with the maker's separate CA$279 XT20 promotion kept distinct.
- Paradigm Monitor SE Atom's **seasonal, multi-dealer CA$269.99 pair offer** is eligible while the externally announced Oct 16, 2026–Jan 4, 2027 promotion is in force, with at least two independent dealers corroborating the price. Its **~CA$360 regular asking benchmark** remains separate, and the seasonal price automatically stops qualifying after Jan 4. There is no ordinary-market "cheapest listing anywhere" rule.
- Vintage Paradigm Titan v3 research now contains three Canadian seller asking examples **CA$125–195**. None is called a completed-sale amount, an available listing or a representative used-price median. Low budgets below those examples do not receive a false affordable used-price claim.
- For a firm CAD budget, a priced new pair or validated broad seasonal offer ranks ahead of unpriced alternatives after listening-priority/room eligibility. Owner reports remain useful where prices/performance measurements are limited. Explicit manufacturer electrical restrictions still exclude unsuitable speaker/amp combinations (especially 8Ω-only R-S202 with near-4Ω-minimum Polk XT models).
- Cards remain compact, with the specific speaker's reason visible and further pricing/source evidence in collapsed details. Already-owned amplifier remains at zero incremental purchase cost.
- A small .github/workflows/system-builder-preview-tests.yml action now runs ALL Node site tests on pushes to this preview branch, replacing many resource-heavy remote desktop test sessions. The action does not merge or deploy production.

**Current head regression:** **211/211 tests PASS**, zero failures on GitHub Actions. Verified run [43316705547](https://github.com/thesoundquestion/website/actions/runs/43316705547). The earlier 176-test and 14 direct cases are superseded as release evidence. Cloudflare Pages also reported a successful feature-branch deployment. **Manual latest-revision small-screen, keyboard and screen-reader QA remains outstanding**; draft PR stays unmerged.

Private governing research: [Batch 10 affordable speaker coverage](https://github.com/thesoundquestion/research/blob/main/SYSTEM_BUILDER_AFFORDABLE_SPEAKER_COVERAGE_BATCH_10_2026_11_12.md). Original third-party owner review posts/measurements are never scraped or reproduced; commercial publishing of third-party endorsements remains subject to rights and advertising review.


## v1.0 preview · Practical US and UK budgets + actual frontend repair (2026-11-12)

**Purpose:** Move beyond Canada with real regional *ordinary advertised stereo-pair* price references and new source-linked models, without inventing measured acoustic ratings or a local market transaction average.

- **US:** Polk Monitor XT15 **US$179/pair**, Monitor XT20 **US$279/pair**, Signature Elite ES15 **US$299/pair**, with at least two genuinely independent seller/manufacturer sources at ordinary price per exact model. Individual sales do not become normal prices.
- **UK:** original Q Acoustics 3010i **£169/pair** (new isolated Builder-only source catalog record, 6Ω nominal/4Ω minimum); original 3020i **£199/pair**; original Wharfedale Diamond 12.1 **~£249/pair** (existing System Check preset, 8Ω compatible but 4Ω actual minimum). Explicitly separate later 3010c/3020c and 12.1i variants.
- **Buyer value:** A firm budget now puts a real within-budget named speaker ahead of five unpriced possibilities. Candidate selection still retains the owned amplifier (no new amp charge), declared listening goal, room caveats, and genuine load checks. US/UK/EU never inherit Canadian prices or inferred currency conversion.
- **Source standard:** international-price-context.mjs records two or more independent seller domains and close published regular pair asking prices. It segregates one-shop promotions, historic Wharfedale discounts and unknown used transactions. Price ≠ verified stock or amount paid.
- **Editorial evidence:** Wharfedale Diamond 12.1 and Q Acoustics 3010i have linked original summaries of actual owner experiences with relevant positives/limitations; quantitative audio preference scores are still forbidden.
- **Scope:** **16 curated speaker discovery models**, **15 exact-model firsthand-owner evidence records** (plus other limited editorial audition profiles) and **3 Builder-only supplemental speaker identity records**. The original 130 System Check records and engineering code are unchanged.

**Critical functional repair:** The previous app.mjs preview file had a malformed truncated price line and duplicated trailing content. It could not be parsed as a browser JavaScript module, even though old unit tests passed. The file was repaired and shortened to one complete event-handler/card renderer. Native Intl.NumberFormat now respects actual CAD, USD and GBP. The preview workflow now runs node --check on every Builder .mjs before full regression tests, so syntax errors can't hide behind passing logic assertions.

**CI:** An early current-turn run had 224/227 passing because three older assertions assumed outdated UI text or expected all models visible in a top-five shortlist with no budget. Tests were corrected to exercise actual firm-budget logic. The subsequent GitHub Actions run (2026-11-12; https://github.com/thesoundquestion/website/actions/runs/43321834985 was earlier failed and superseded) has **227/227 passing** at commit 4d92c07, as confirmed from job logs, along with the new module syntax check. Later exact source-link updates and subsequent changes must pass CI again at their final HEAD before release; don't claim head green until confirmed.

**Release boundary:** Feature branch only, PR #1 remains draft/unmerged. Production site and System Check calculators were not changed. Latest-revision real mobile, keyboard and screen-reader/browser-flow checks and rights/advertising review are still outstanding.

Private report: https://github.com/thesoundquestion/research/blob/main/SYSTEM_BUILDER_REGIONAL_PRICING_AND_BROWSER_FIX_BATCH_11_2026_11_12.md .
