# The Sound Question — Beginner-first website draft review

**Date:** 2026-11-19
**Branch:** `draft/beginner-entry-and-refreshers-20261119`
**Status:** GitHub-only functional prototype; NOT merged and NOT Cloudflare-deployed.

## Purpose

Test the source-reviewed editorial strategy without rebuilding the whole site: visitors should start with their *question*, skip formal lessons when appropriate, and use the existing Decoder pages as everyday explanations, recaps and evidence-based refreshers. The site must not turn uncertain equipment information into a confident purchase recommendation.

Private source plans:
- `thesoundquestion/research/BEGINNER_SITE_NAVIGATION_AND_GOAL_ROUTING_PLAN_2026_11_19.md`
- `thesoundquestion/research/BEGINNER_BUILDER_DECISION_LOGIC_UPGRADE_PLAN_2026_11_19.md`
- `thesoundquestion/research/TSQ01_BEGINNER_HIFI_FRICTIONS_RESEARCH_2026_11_19.md`

## Functional changes staged for review

1. Homepage **preserves the previously approved opening, Jump Straight In section and six-card Choose Your Path layout**. It adds a compact row of direct shortcuts for amp/speaker matching, vinyl, digital sources and improving owned equipment; the Lessons shortcut now explicitly welcomes refreshers. Creators keep their six prominent original goal cards. This is intentionally a smaller experiment than a homepage redesign.
2. Decoder landing explicitly serves absolute beginners and returning enthusiasts. Lessons do not have to be followed in sequence; short explanations and sources are emphasized. All existing 27 lessons and technical calculations remain unchanged.
3. Find My Setup preserves the eleven existing educational routes and adds four:
   - `match`: recognize powered vs passive, defer exact electrical/clean SPL checks to System Check.
   - `vinyl`: turntable/phono stage and powered/passive/receiver signal path, with unknowns shown rather than guessed.
   - `digital`: source output to receiver/powered/passive playback, no compulsory separate DAC.
   - `improve`: start with no-cost listening, positioning and source checks rather than a mandatory upgrade.
4. Guide results direct to appropriate existing sources, System Check or Builder. There is **no automatic pass-through of equipment facts into the Builder**, no hidden user data upload, and no suggestion that a generic route certifies a model-specific connection.
5. Browser-only regression tests cover all guide-answer combinations and specific high-risk connection examples. The GitHub-only PR release preflight now runs these checks.

## Preserved on purpose

- Listening/Creating Builder recommendation math, candidate list, prices and catalog.
- System Check engineering formulas, impedance/load caveats and unknown-data behaviour.
- Existing lesson content and canonicals, source provenance and visual claims.
- Homepage existing styles and the simple sitewide navigation.
- Free-only Cloudflare release controls.
- No new paid APIs, affiliate offers, tracking, accounts or forced lesson prerequisites.

## First user-testing checklist

- New to stereo: can a visitor find an optional explanation or an actual complete listening route in one or two choices?
- Vinyl: with powered speakers and LINE turntable output, does it correctly avoid an unnecessary phono preamp or separate amplifier?
- Vinyl: for raw phono output, does it flag the phono-stage requirement and the possibility that an appropriate PHONO receiver input already supplies it?
- Digital: does the route distinguish an existing analogue output or built-in DAC from a genuinely digital-only connection?
- Speakers: does a powered speaker route warn against connecting the external amplifier speaker terminals?
- Existing system: does the visitor reach setup/recording checks without a forced shopping suggestion?
- Experienced listener: is the Decoder immediately recognizable as a quick refresher, not a mandatory class?
- Mobile/keyboard: check 320px, 390px, 768px and desktop; no overwhelming card wall, clipping or inaccessible focus.
- Creator: ensure existing vocal, band, streaming and live-sound routes remain easy to find in the guide.
- Check each guide CTA actually lands at the promised published page; the detailed Builder engine upgrade is intentionally a separate phase.

## Current validation and unresolved gaps

- A code-level function evaluation has tested **all 303 answer combinations** across 15 guide goals, with no thrown error or empty result, on the proposed branch source. This is not yet evidence of physical mobile usability. An initial GitHub regression run flagged six-card/wording constraints from the previous approved homepage; the draft was corrected to preserve them and its existing fixed-count goal test was updated to retain the original eleven while adding four.
- The new Node test file is `tests/beginner-entry-paths.test.mjs`, integrated into `release-browser-preflight.yml`; GitHub PR run is required for official build/browser status.
- These routes do **not** yet implement shared typed intent state between Find My Setup and the Builders, complete product-level phono/DAC/adapter verification, or model-specific "safe matching". Those are described and gated in the separate private engineering plan.
- The new quick-link labels and discoverability are **hypotheses** to test with newcomers, not validated conversion improvements. The homepage card count and original curiosity-led introduction were preserved after existing CI checks flagged their approved constraints.

**Hard release boundary:** no merge to `main` and no Cloudflare build/deployment without explicit owner authorization for that specific action.


## 2026-11-19 follow-on: direct Builder handoff and beginner listening-level references

**Original usability feedback:** The first guide draft produced general equipment-role explanations but did not actually retain the answers when opening a Builder. Beginners already know they have an amplifier or turntable; explaining that fact and restarting a long form is not an actionable result.

**Second functional pass on same draft PR #35:**
- `system-builder/guide-handoff.mjs`: explicit allowlisted link contract, `guideBuilderHref()` and `guideBuilderContext()`, for existing listening/headphone/TV and four new beginner intents. Only selected enum categories are passed in a URL, **not** model names, prices, or free-form data. Unknown/invalid/duplicate parameters fail closed to normal Builder defaults.
- `tools/find-my-setup/app.mjs`: a primary **Continue in Listening Builder with my choices** link appears at the answer, before optional educational reading. Existing creator-specific routes still go to Creating Builder.
- `system-builder/app.mjs`: validates and conditionally preselects supported architecture/listening preference; announces the carried-over context and unresolved limits. Model selection remains manual/reviewable. Exact source-chain, phono stages, adapters and amp/speaker safety are not declared verified. The Builder recommendation/math engine is untouched.
- **Vinyl cost gate:** the Builder does not include turntables/cartridges/phono-preamp costs in displayed example subtotals; the relevant handoff now says so both before and after results.
- `system-builder/index.html` and `system-builder/style.css`: **listening level dropdown** now has immediately adjacent everyday-language approximate 60–70, 80, 85 dBA and 110 dB **brief peak** references. This is a semantic aid; the Builder's quiet/moderate/high choices are still qualitative, not calibrated numeric dB measurements. The source-cited expanded phone-app guide explains LAeq versus maximum, A/C/Z weighting, measurement at the actual listening seat, and iOS versus Android accuracy limits.
- `tests/beginner-entry-paths.test.mjs`: validates allowlisted handoffs, unknowns, source/price safeguards and everyday sound-level content.

**Critical facts, not guarantees:** CDC/NIOSH's official SLM app is **iOS-only**; Android apps such as NoiseCapture exist but microphone/algorithm accuracy differs between devices and must not be sold as certified SPL, music transient, hearing exposure or headphone output measurements. A **dBA LAeq average** is not interchangeable with a 110 dB **instantaneous peak**, or with the System Check's assumed unweighted dB SPL target. Household equipment sound levels depend on model/distance; examples are approximate ranges, not calibrations. WHO safe listening exposure depends on **level AND duration**.

**External references used in content draft:** 
- https://www.cdc.gov/niosh/noise/about/app.html
- https://www.cdc.gov/niosh/noise/prevent/understand.html
- https://www.who.int/news-room/questions-and-answers/item/deafness-and-hearing-loss-safe-listening
- https://f-droid.org/en/packages/org.noise_planet.noisecapture/
- https://nepis.epa.gov/Exe/ZyPURL.cgi?Dockey=5000208G.TXT

**Review / test still required:** physical Android layout and guide→Builder transfer verification, especially mobile, phono warning placement, back/edit behavior and unexpected URL parameters; no suggestion that phone readings confirm an 110 dB peak. GitHub-only CI status must be checked at last draft commit, not inferred from older pass.

**Still deferred:** complete shared typed inventory/model transfer, source-chain/cable/adapter certification, actual phono or source pricing and the deep Builder requirements engine. No public deploy or Cloudflare build.


## Follow-up: required vs optional fields now match the user's goal (2026-11-19)

Owner feedback: "All dropdowns and input boxes should also be labelled required and optional, as needed depending on the match." This is implemented in the same private website PR.

- The first **What are you looking for?** choice is explicitly **Required**.
- **Find an amplifier for my speakers** requires *identifying the owned speaker model*; use the speaker dropdown OR type an unlisted model. Both fields display their role and a one-of-two explanation; neither is individually marked required in native HTML, because that would falsely prevent the other valid route.
- **Find speakers for my amplifier** mirrors that behavior for the owned amplifier or receiver.
- **Complete system, improve owned gear, headphones and subwoofer wiring** have optional model/connection/budget entries, because useful conditional results can be produced without pretending unknown answers are known.
- Every labelled select/text/number field shows an inline **Required** or **Optional** role. An explicit alternative-field status says **Optional: type instead**. Labels update when the visitor changes tasks and stay associated with their actual controls for assistive technology.
- The old HTML `required` constraint on defaulted `distanceFt` was removed because it could block otherwise valid submissions when that field is tucked into advanced options.
- `builderFieldRequirement()` provides a single policy used by UI labelling; `validateBuilderIntent()` remains the separate final OR-group check, with a plain-language correction.
- Added focused regression fixtures for required vs optional mapping, select-or-type equivalence, missing model errors and no hidden mandatory distance.

**Important:** The task-specific field labels are integrated without touching amplifier power, electrical compatibility, speaker ranking, subwoofer signal checking or pricing calculations. The release stays **draft only**, not merged to main or deployed. At this checkpoint, GitHub's focused beginner guide checks and static build passed; wider site regression still includes failures from earlier output-card redesign and needs separate reconciliation before merge.


## Follow-up: replace name-only unlisted fields with source-first gear search

**Owner correction:** A free-text "enter your model" box is not a workable match input by itself. The old Builder set its record to `null` for custom names, so it could display an ownership label but had no usable impedance, power or connection figures. The previous OR-group validation incorrectly allowed name-only entries to unlock a model-specific shortlist.

**Current GitHub-only implementation:**
- The existing amplifier and speaker presets remain the primary trusted fast path.
- Each unlisted speaker/amplifier input is now labelled as a search, with **Search for my gear** checking the actually loaded catalogue selections and presenting matching models as one-click preset choices.
- For a missing model, a separate, user-initiated **Google manufacturer-specification search** opens externally. The search is not an importer; no scraping, paid API or inferred fields.
- A compact, task-specific manual/specification entry captures an exact HTTPS source URL. Speaker-to-amp shopping requires the owned speaker's **nominal impedance**; optional minimum impedance and sensitivity are accepted only with an identified sensitivity basis. Amp-to-speaker shopping requires the owned amplifier's **permitted nominal load**, **continuous watts/channel** and **rating test load**. This is the smallest currently usable subset for *provisional* screening, not proof of clean headroom or safe real-reactive-load operation.
- `system-builder/unlisted-gear.mjs` validates the source link and numeric ranges and creates a temporary, browser-only `record` that the existing `chosenGear()`, ownership routing, amplifier comparison and speaker shortlist functions can consume.
- Names without sufficient specs no longer pass the two specific shopping intents. Optional improvement/subwoofer workflows can still describe general possibilities but do not assert missing specifications.
- The Required/Optional tags update when a visitor selects a goal or starts typing an unlisted model. Required fields in the manual entry remain behind a deliberate unlisted-model choice; choosing a supported preset needs no additional spec entry.
- Provisional imported-by-hand figures retain `userEntered:true` and `evidence:'user_entered_unverified'` status; manufacturer permission flags, the basic-match badge and automatic verified-power claims cannot be awarded to visitor-supplied records. A visible report warning and cited user-supplied source distinguish them from reviewed presets.
- Regression coverage includes missing-figure failure, verified-catalogue route, temporary numeric record creation, conservative pairing and local/manual search. Browser preflight now exercises a custom speaker with source and nominal load on desktop/mobile emulation.

**Deliberate boundary:** Neither Google nor a manufacturer's page can be reliably scraped directly from this no-backend Pages form. A search link does **not** populate specs by itself. True automatic source extraction would need a separately approved retrieval/verification service, provenance review and quota/privacy safeguards. Do not market this as automatic lookup. Search + exact manual entry is the free, honest fallback.

**Review gates:** Real Android interaction, UI clarity, explicit evidence wording and full GitHub CI are still required. Existing unrelated Builder-card copy assertions must be reconciled rather than waived. All changes stay on the draft branch, with no merge, Cloudflare preview or production deployment.
