# The Sound Question — Compact Builder Sound-First Preview Handoff

Status: GitHub draft preview only. **Not deployed to Cloudflare or merged to main.**

Branch: `draft/magicpath-compact-full-site-20261120`
Base: `draft/consolidated-prelaunch-20261119`

## Owner-directed UI contract

- The leading recommendation answers **which item matches and why**.
- Each alternative describes **how that alternative sounds, on its own terms**. Do not require direct head-to-head comparisons or describe differences from the primary recommendation as a prerequisite for presenting listening notes.
- Use exact-model, source-linked firsthand owner/listener reports. Prefer concise audible descriptions: bass weight, vocals, guitars, treble energy, dynamics, imaging, etc.
- If owner impressions are unavailable, **omit** unsupported listening copy rather than filling the card with a warning or a generic "no tonal direction" sentence.
- Keep practical fit and complete specifications in optional disclosures. Do not duplicate main recommendation copy in every alternative.
- Present headroom as a compact status; the real System Check remains the calculation authority, not a second integrated technical manual.
- Provide an **always-visible, prefilled System Check link on the leading result**. Send model identities, any available distance and illustrative average/peak values through the existing URL handoff; never invent missing model specifications.
- Use existing TSQ dark navy/cyan design tokens, compact spacing and responsive row layout. Do not replace the audio matching or verification engine with MagicPath's sample React state.

## Files involved

- `system-builder/app.mjs`: native result/alternative rendering, owner impressions and checker URL.
- `system-builder/compact-preview.css`: preview-only compact brand styling.
- `system-builder/index.html`: revised entry, results headings and cache versions.
- `system-builder/tonal-impressions.mjs`: no fabricated empty relative-tonality fallback.
- `tests/system-builder-tonal-impressions.test.mjs`, `tests/system-builder-alternative-comparisons.test.mjs`, `tests/listening-builder-headroom-handoff.test.mjs`: updated assertions.

## Validation / outstanding gates

- Source-level JavaScript syntax and structure checks: passed.
- 15 sound-impression unit scenarios: passed in an in-memory JS harness.
- Full Node/browser regression and responsive visual QA: **not run** on the remote checkout. Run before release; verify all intent categories, selected models, source links, checker transfer, keyboard disclosure navigation and mobile width.
- Do not use Cloudflare builds to review. Open the full-site branch locally via `PREVIEW_FULL_SITE_WINDOWS.cmd`.

## Acceptance examples

- First match: model, why suitable, source-backed "What owners say", compact headroom and visible `Open System Check with this gear`.
- Alternatives: model and one independent, source-backed "What owners say" sentence; optional setup details.
- No "How it may sound different" or "No clear tonal direction is established ..." repeated across cards.
- The same site navigation, palette and component density as the full TSQ site.

## Context-specific listening assumptions (2026-11-20)

The room selector now initializes **editable** listening-distance and relative-level suggestions:

| Use case | Starting distance | Level category | Illustrative System Check average/peak |
| --- | ---: | --- | --- |
| Living room | 8 ft | normal | 80 / 95 dB |
| Bedroom | 6 ft | quiet | 65 / 80 dB |
| Desk / nearfield | 2 ft | quiet | 65 / 80 dB |
| Outdoors, patio or lawn | 15 ft | normal | 80 / 95 dB |
| Gathering / event / party | 20 ft | higher-output scenario | 85 / 105 dB |

These distances are editorial planning examples, not measured population averages, fixed venue-coverage assumptions or claims that all listeners require those levels. The party profile is **not** a recommended continuous listening level. WHO / NIOSH safe-listening guidance and exposure duration should govern actual volume choices.

- The two values update independently on room selection until manually changed; manual overrides remain intact across subsequent room selections.
- A reset restores automatic defaults. A `Find My Setup` handoff selecting a desk initializes its distance and level accordingly.
- The Builder uses the live selected values in results and in the prefilled System Check URL. All amplifier, speaker and safety gates remain authoritative.
- Outdoor and party handoffs use `preferRoom=0`, so a documented in-room sensitivity isn't substituted for an anechoic figure by the model-handoff helper.
- Site-relative comparisons do not assume a universal free-field correction. Outdoor sound falls approximately 6 dB per doubling of distance under ideal free-field conditions; audience coverage, noise, source size and actual conditions vary. Do not silently invent room gain.
- Acceptance suite: `tests/system-builder-room-distance.test.mjs` and additional outdoor/party tests in `tests/listening-builder-headroom-handoff.test.mjs`.


## Full-site preview loader and complete-system repair

Date: 2026-11-20. Same review-only branch, not production.

The local preview now uses **127.0.0.1:8877** (the older preview uses 8765).
The Windows launcher refuses an occupied 8877 port, checks the expected Git
branch and verifies the equipment and Builder files before opening a browser.
A subtle visible build label in the Builder distinguishes this version from
an older cached checkout.

Confirmed issues and fixes:

1. **Complete-system intent hid listening distance.** Its quick fields now include
   `distanceFt`, following the selected room defaults or manual entry.
2. **Half-width primary recommendation.** The original recommendations grid had
   two equal columns even when it contained just one primary card; the
   latest compact CSS gives the primary one full column and gives the alternatives
   a separate narrower column on wide screens, stacking them on mobile.
3. **Shared catalogue adapter discarded valid specs.** The new
   `system-builder/shared-gear-adapter.mjs` preserves exact original profiles,
   8/6-ohm continuous or burst amp-test rows, speaker loads, sensitivity references,
   source voltage data and reviewed metadata, while retaining unknown values.
4. **Async catalogue refresh could remove selected old-model options.**
   It now preserves a selected model when still present in the source-verified
   legacy, supplement or shared catalogue.
5. **Silent catalogue failures.** The quick form now shows an explicit warning
   if the canonical data file cannot load; the legacy fallback stays available.
6. **Saved specs not inspectable from complete-system cards.** A compact
   collapsed `Saved amplifier & speaker specifications` disclosure shows the
   stored power ratings and speaker values, and identifies incomplete source
   facts without fabricating measurements.
7. **Embedded headroom status.** Keep the source-calculator iframe mounted
   and visually tiny, not `display:none`, so the status can load.
   The separate System Check link stays visible and prefilled.

Concrete source-data distinctions:

- Yamaha A-S301: original catalogue preserves five separately categorized
  continuous/burst rating rows; 60 W/channel at 8 ohms continuous is present.
- Polk Monitor XT15: nominal 8 ohms, minimum 4.1 ohms and published sensitivity
  86 dB at 2.83 V/1 m are structured.
- PSB Alpha P5: nominal 8 Ω, minimum 4 Ω, recommended amp 10–90 W,
  now with manufacturer-datasheet-confirmed 87 dB anechoic sensitivity at
  2.83 V/1 m (89 dB quoted as typical in-room). This resolves the previously
  unresolved basis; the numeric signal is manufacturer-published, not an
  independently measured clean-output limit.
- Fosi Audio BT20A Pro with the specified 32 V/5 A supply: no equivalent,
  qualifying continuous watts-per-channel test is saved. Its headline output
  figure MUST NOT be silently used as continuous power.

Verification: 16 source-level integration and syntax checks passed, and the
seven shared-gear-adapter tests passed using the actual 197-record catalogue.
The complete browser/mobile screenshot regression suite remains pending, and
the preview branch must not be considered release ready until it passes.

Files added: `system-builder/shared-gear-adapter.mjs`,
`tests/system-builder-shared-specs.test.mjs`,
`tests/system-builder-fullsite-preview.test.mjs`.

For review, use a fresh checkout of
`draft/magicpath-compact-full-site-20261120` and
`PREVIEW_FULL_SITE_WINDOWS.cmd`; the local Builder opens at
`http://127.0.0.1:8877/system-builder/`.

## PSB Alpha P3/P5 shared-data repair (2026-11-20)

**Root cause:** The Builder used PSB P3/P5 as canonical supplement records,
but its previous sensitivity values had no admitted voltage/power basis.
System Check's legacy speaker preset list also lacked both models, so a
Builder-to-Checker handoff carried model names but filled no speaker specs.

**Manufacturer verification:** Original PSB P3 and P5 datasheets define sensitivity
as `1 W (2.83 V) at 1 m`, IEC-filtered pink noise, C-weighted. The anechoic
figures are **P3: 85 dB** and **P5: 87 dB**; PSB also quotes 87 and 89 dB
for a typical listening room. Both are 8 Ω nominal and 4 Ω minimum.
The published 10–80 W / 10–90 W figures are *recommended amplifier ranges*,
not continuous or peak speaker handling. The 60 W 'program' figure remains
distinct and is not used as continuous handling.

Sources:
- P3: https://psbspeakers.in/wp-content/uploads/2024/01/Alpha-P3-Data-Sheet.pdf
- P5: https://content-psbspeakers-com.s3.amazonaws.com/uploads/2021/03/PSB_Alpha_P5_DataSheet_Revised.pdf
- PSB product: https://www.psbspeakers.com/products/alpha-p5-bookshelf

**Changes made, all on the preview branch:**
- Canonical `equipment/source-master.json`: admit verified exact-model sensitivity and voltage reference.
- Deterministically regenerated `equipment/catalog.generated.json` and
  `system-builder/catalog-supplements.generated.mjs`; price tier, classic,
  and comparison projections remain unchanged by this amendment.
- `system-check/verified-speaker-supplements.js`: register both exact PSB Alpha
  models without duplicates; preserve separate amplifier power and speaker handling semantics.
- `system-check/index.html`: version the verified preset script.
- `system-builder/index.html` and `system-builder/app.mjs`: refresh
  app version and fetch the new canonical JSON on this preview.

**Validation:** In-process generator recomposition exactly reproduces the
updated 197-model catalogue; the generated Builder supplements and regional
price tiers match their deterministic expected outputs; System Check
runtime models load P3/P5 once each with 85/87 dB anechoic voltage basis.
The Yamaha A-S301 pairing has its 60 W at 8 Ω continuous source rating.
Full Node and actual-browser acceptance still need a real execution pass.
No Cloudflare deployment or production change.

## Evidence-aware recommendation order and PowerShell preview

**Question resolved:** How can a strongest-match recommendation lack enough specifications for headroom? Previous ranking used editorial goal/use-case/connection/price ordering. Documented electrical load support did not guarantee a tested continuous wattage or clean SPL measurement.

New `system-builder/passive-evidence-readiness.mjs` distinguishes:
- `calculable`: saved speaker nominal impedance, sensitivity with an explicit voltage/power 1 m reference, and amplifier continuous rating at that same speaker nominal load.
- `incomplete`: one of those numeric inputs is absent; list each actual missing input.
- `unknown`: source registry not yet loaded; this must NOT masquerade as measured failure.
- `not_applicable`: powered speakers/headphones are not penalized for missing external amplifier ratings.

Within otherwise comparable passive options targeting the same primary purpose and listening setting, candidates with calculable headroom inputs appear ahead of incomplete ones. A declared restrictive budget is not overruled by data completeness. Calculable means *possible to estimate*, not a guarantee of adequate clean output.

Concrete validated shortlist: living-room, no budget => Yamaha A-S301 + PSB Alpha P5 leads (verified source continuous 60 W/8 Ω; P5 sensitivity 87 dB at 2.83 V/1 m). Fosi BT20A Pro + Polk XT15 remains a conditional option, missing a comparable continuous amplifier power test. At a strict CAD 500 budget, cheaper Fosi option can lead but is identified as missing the continuous-power figure. Source registry now finishes loading before results are ranked, to avoid a race that could select the old ranking order.

**Preview command repair:** `PREVIEW_FULL_SITE_WINDOWS.ps1` starts a Python local server and validates source branch, required files, and HTTP 200 responses from the full site, Builder, System Check, Builder JavaScript and catalog before opening the browser. `PREVIEW_FULL_SITE_WINDOWS.cmd` delegates to it. Launcher uses port 8877 and errors explicitly when occupied; it does not open a stale prior preview. Users should update their existing preview checkout and run the new PowerShell script from that directory. No Cloudflare publication was made.

Test module: `tests/system-builder-passive-evidence-readiness.test.mjs`.

## Beginner complete-system result overhaul (November 20, 2026)

**Reproduced problem:** A visitor selected `Build a complete listening system`,
left the system approach `open`, chose `bedroom`, with an imaging/spaciousness
priority. The old UI led with "A possible setup, with details to check",
did not use the exact example's `why`, hid JBL's independently reviewed
listening impression inside a technical disclosure, offered an empty generic
System Check link for powered monitors, duplicated verification disclaimers,
and generated many empty/irrelevant-looking expanded disclosure headings.
The site looked like a technical report rather than a listening recommendation.

**New focused rendering:** The exact no-owned-gear `complete_system` and
`no_sub` entry route uses a separate, compact output in `system-builder/app.mjs`
and `system-builder/simple-system-summary.mjs`, styled through
`system-builder/compact-preview.css`. The existing source-verified shortlist
still chooses eligible products and ranks them; the new layer does not
calculate new watts, assign subjective scores or invent compatibility.

- First card: exact model, specific room/listening-priority rationale,
  sourced listening description, connection route, purchased parts and optional
  trade-off/source disclosure.
- Alternatives: each model's *own* audible character and supporting listening
  review link, with brief fit rationale. No head-to-head requirement.
- Review eligibility: actual subjective owner experiences or an independent
  review containing real listening observations. Mere manufacturer marketing
  and measurement-only interpretation do not qualify as listening impressions.
  When no qualifying listening source exists, the alternative is not presented
  as one of the few sound-first options in this simplified results view.
- No full `renderCard`/secondary audit/used-gear technical tree and no
  alarming generic "A possible setup" status for this introductory path.
- The amplifier + passive speaker system can link to prefilled System Check,
  showing the exact models and room-specific distance/level. Powered JBL,
  Kanto and similar systems **do not** receive a distance-only System Check
  link, because that passive-amplifier headroom calculator is inapplicable.
- Correct JBL/Kanto `soundTarget` model identities make their existing
  source-backed auditory summaries visible in the main view.

**Validated real example:** Bedroom, 6 ft, open system choice, imaging
priority. First JBL 305P MkII pair, linked listening review reports a
broad stereo image, punchy bass and some forward upper mids. Alternatives
shown with source-backed sound descriptions are Kanto ORA (clear mids,
even presentation, softer upper treble) and Yamaha A-S301 + PSB Alpha P5
(natural vocals, smooth treble, warmer balance). Kali LP-6 V2 is not
promoted as a sound-described option where only measurement interpretation
is available. For default balanced music priority, the well-documented
Yamaha/PSB pairing leads the same room's examples.

**Tests:** `tests/system-builder-simple-complete-results.test.mjs`.
Six in-memory tests of the exact real shortlist, source links, sound
descriptions, page branch, correct powered/passive System Check handling,
and CSS structure passed. Full cross-browser and visual QA are still
required before production promotion. Existing complex owned-equipment
and deliberate subwoofer flows retain their established detailed logic.
No published site or Cloudflare deployment changed.
