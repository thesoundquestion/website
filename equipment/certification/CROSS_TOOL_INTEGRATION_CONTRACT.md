# The Sound Question — Full Builder / Checker Integration Contract

**Status: mandatory, permanent, release-blocking.** This is the established design requirement, NOT a new optional enhancement. Applies to Listening Builder, Creating Builder, System Check, Compare My Gear, connections, subwoofer routing, product cards, source data and all future builder/validator modules.

## The core rule

**A recommendation must connect directly to the relevant check with the exact selected equipment and available user inputs already transferred. A generic link to a blank tool is not integration.** The listener is not asked to repeat known equipment models, distance, listening level, required connection or existing setup. The check remains editable and separates manufacturer's facts from estimates.

Every newly added equipment entry or recommendation path must prove, in the SAME change:
1. The recommendation is appropriate for the goal and has passed hard safety/electrical gates; a do-not-connect result is excluded before being called a recommendation.
2. A useful, plain-language **Loud enough for you?** response is supplied wherever loudness is relevant, without fake measurements or technical-warning clutter. Passive predictions use documented sensitivity basis and matching-load continuous amplifier output. Powered predictions cannot borrow passive watts.
3. If **System Check** can actually evaluate it, the card links to the **prefilled** checker with exact model(s), sourced relevant ratings, distance, user-selected target level, and known connection context. Unknown values remain blank. No mismatched load or burst rating becomes continuous watts.
4. If **Compare My Gear** supports its equipment category, the exact saved model ID or known canonical preset model is preselected. Side-by-side alternatives are selected only if the exact model/category is compatible with the comparison engine. Show source evidence and actual inputs/outputs.
5. **Creating Builder** model-specific microphone, interface, mixer/recorder, recording headphone, studio monitor and PA stage links must use source-registry IDs into appropriate Compare categories. A generic “compare equipment” footer is forbidden in place of these links.
6. Subwoofer and connection advice must be calculated from actual source outputs, amplifier/active-speaker outputs, subwoofer input types, crossover/high-pass behavior, known cables and required extras. **Never claim a connection or high-pass exists without evidence.** Unknown sub inputs mean no certified connection route. Do not point powered systems or headphones at the passive watt calculator as though it measured their maximum acoustic output.
7. An unsupported checker capability **must not** be represented as functional integration: omit false links, preserve a concise plain-language limitation in the context, and record the remaining work as a release blocker if the user's intended workflow requires that check.
8. Changes to **either** builder, either checker, generated equipment data, catalogue adapters or linked URL schema require full browser end-to-end tests on desktop and mobile. Tests must click actual rendered links and assert the destination selected models AND relevant field values, not merely check strings or existence of a generic URL.
9. New pathways must extend the integration test matrix immediately, before being considered release-ready. Broken handoffs block merge even if the individual tools' unit tests pass.
10. Preserve all earlier manufacturer/independent/source research and these handoffs, rather than recomputing an audit from scratch every release.

## Implemented routes in draft PR #39 (November 21, 2026)

| Source | Destination | Data to carry | Test |
| --- | --- | --- | --- |
| Listening passive recommendation | System Check | speaker/amp, saved sensitivity, load/continuous watts, distance, target average/peak | browser desktop/mobile Yamaha A-S301/PSB Alpha P5 |
| Listening passive recommendation with canonical preset | Compare My Gear | exact canonical amp or speaker model | browser/UI regression; source-specific availability |
| Creating microphone/interface/mixer/recorder stage | Compare My Gear expanded category | exact registry ID as left; matched alternative where available | browser actual selected model |
| Creating recording headphone stage | Compare catalogued headphones | exact registry model ID and alternate where supported | browser/UI regression |
| Creating powered studio monitor stage | Compare powered studio monitors | exact registry model ID and optional similar alternative | browser selected model |
| Creating powered PA stage | Compare powered PA speakers | exact registry model ID and optional similar alternative | browser selected model |

**Engineering boundary:** Compare My Gear is a specification/connector comparison, not a certified electrical-safety or acoustic test. The newer powered and subwoofer evaluators described below *add actual model-specific calculations*, but they cannot turn undocumented products into measured or electrically certified equipment. Unknown source/input levels remain unverified. Manufacturer peak SPL cannot establish sustained clean output or hearing safety.

## Required CI

- Site regression includes source-data, category and matching safety gates.
- Release candidate browser preflight navigates **real rendered** Builder -> Check/Compare paths in both desktop and mobile emulation, confirms incoming selections and runs the destination tool.
- Browser preflight triggers on **all** `system-check/**` and `system-builder/**` changes, not just the compare directory.
- Explicit release acceptance: **no blank checker link on any recommendation**; no invalid type; no source context lost; no false safety claims; no source-less numeric capability or loudness guarantee.

## Handoff instruction to future AI/release agents

Read this contract and `equipment/certification/RELEASE_MATRIX_AUDIT_2026_11_21.md` **before** touching Builder, System Check, comparison or equipment catalog code. Plan changes to both sides of the transfer together. Add an automated end-to-end regression in the same commit sequence. Keep draft PR and source branch intact and do not deploy without owner authorization and all four release gates passing. Do not misdescribe partial feature support as “fully integrated.”

## 2026-11-21 — Implemented powered-output and subwoofer compatibility engines

The requirement to integrate these validators was established before this pass; generic links and qualitative placeholders were never adequate.

### Powered loudness validation
- Engine: `system-builder/powered-output-evidence.mjs`; dedicated editable checker: `/system-check/powered/`.
- The Listening Builder's `Loud enough for you?` cards use the **same model-qualified acoustic engine** and link directly to the checker with the **selected model, number of cabinets, listening distance and preference**. The Creating Builder links source-qualified powered monitor/PA stages to the same checker. Because the Creating Builder does not collect a listening distance, that input is left blank until the visitor provides one.
- Source-backed acoustic records: **JBL 305P MkII** (94 dB continuous / 108 dB peak at 1 m, JBL; high-distortion peak limit), **QSC K12.2** (126 continuous / 132 peak at 1 m, QSC). **Kali Audio LP-6 V2** (115 dB peak at 1 m; published continuous acoustic output unavailable) and **Yamaha DZR15** (139 dB peak at 1 m, continuous unavailable) have a *peak-only* evidence tier. Do not substitute amplifier wattage or invent a continuous SPL for these.
- Distance attenuation and pair allowance are mathematically testable, but frequency-dependent acoustic compression, clean deep-bass limit, calibrated room response and hearing exposure are not determined by those ratings. `peak_only_uncertain` must never produce a verified Yes. For arbitrary unlisted powered models, the optional published-SPL input produces an explicitly **user-reported, unverified estimate**, never a certified model verdict.
- Reference sources: https://jblpro.com/en-US/products/305p-mkii ; https://www.qscaudio.com/solutions-products/loudspeakers/portable/powered/portable-pa/k2-series/k122/ ; https://www.kaliaudio.com/lone-pine-studio-monitors ; https://ca.yamaha.com/en/audio/portable-pa/products/speakers/dzr/specs.html .
- **New-entry requirement:** Record exact model/revision, acoustic quantity type (continuous, peak-only, independently measured), reference distance, source URL, distortion/processing conditions, and per-cabinet vs stereo-pair basis. Only then connect it to quantitative output guidance. Absent acoustic evidence must not be replaced by electrical power.

### Subwoofer connection and crossover validation
- Engine: `system-check/subwoofer/engine.mjs`; dedicated editable checker: `/system-check/subwoofer/`.
- Documented output-side routes: Edifier R1280DBs Sub Out (3.5 mm line; main-bass reduction with unspecified crossover), original Kanto ORA Sub Out (RCA line; documented 100 Hz main-speaker high-pass), original WiiM Amp Sub Out (RCA line; configurable main-bass routing), North American Denon AVR-S650H Subwoofer Pre Out (RCA line; Front Small receiver crossover).
- The exact **Edifier T5** is the initial fully documented line-level input-side record. Line-level + line-level matches produce an actual cable recommendation and describe whether the mains have verified high-pass filtering. Speaker outputs must never be mistaken for RCA line-level signals. The recommendation and retained-subwoofer UI transfer the exact chosen route and crossover mode into this checker.
- Arbitrary unlisted equipment can use optional **user-reported** output/input signal classes and connectors to test for a mismatch, with `reported_possible` status **never counted as a verified compatible recommendation**. Bridged speaker-level outputs require additional maker-specific safety confirmation. No input-side ratings or crossover behavior may be borrowed from Edifier T5 for other subs.
- **New-entry requirement:** Record actual output signal role and connector, actual sub input signal role and connector, high-pass/crossover mode including control location, source/manual URLs, required separate leads, and the safety of intended topology. Only fully documented paths get `documented_line_route`.
- Initial source documents are retained in the source fixture for every model. Do not conflate an RCA connector with compatible voltage/headroom under every source condition; these are documented signal-path matches, not fault-safe electrical certification.

### Required automatic verification
- Unit: `tests/builder-subwoofer-powered-integration.test.mjs` verifies published acoustic tiers, distance, stereo allowance, unknown models, revision isolation, real source/sub signal matches, RCA vs 3.5 mm leads, high-pass on/off, and speaker-level-to-line-level rejection.
- Real UI: `tests/release-browser-preflight.mjs` must follow **actual Builder-generated links** on desktop and mobile: powered model + distance/preference to the editable result, known 2.1 route to a prefilled model/crossover result, unknown input with no fake compatibility, and arbitrary manually entered signal/SPL data with no certified result. Creating Builder powered output must preserve the selected model while leaving the unknown distance empty.
- Both checkers are independently discoverable on the Tools hub. They must stay available to the user as free local calculations without a paid API or backend.
- Every addition to the equipment catalogue must update applicable evidence records, the actual checker and its tests **at the time of entry**, not after repeated release-preview complaints.

**Unresolved factual limitations:** The source-backed acoustic list is currently smaller than the full 197-model equipment database, and full **physical measured clean SPL** for every powered speaker is unavailable. The subwoofer input-side verified fixture set initially covers Edifier T5; other exact models require their own documented input/crossover specifications. These are evidence-coverage gaps, not missing ability to perform calculations or missing navigation.
