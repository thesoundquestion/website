# The Sound Question — Full Builder / Checker Integration Contract

**Status: mandatory, permanent, release-blocking.** This is the established design requirement, NOT a new optional enhancement. Applies to Listening Builder, Creating Builder, System Check, Compare My Gear, connections, subwoofer routing, product cards, source data and all future builder/validator modules.

## The core rule

**A recommendation must connect directly to the relevant check with the exact selected equipment and available user inputs already transferred. A generic link to a blank tool is not integration.** The listener is not asked to repeat known equipment models, distance, listening level, required connection or existing setup. The check remains editable and separates manufacturer's facts from estimates.

Every newly added equipment entry or recommendation path must prove, in the SAME change:
1. The recommendation is appropriate for the goal and has passed hard safety/electrical gates; a do-not-connect result is excluded before being called a recommendation.
2. A useful, plain-language **Loud enough for you?** response is supplied wherever loudness is relevant, without fake measurements or technical-warning clutter. Passive predictions use documented sensitivity basis and matching-load continuous amplifier output. Powered predictions cannot borrow passive watts.
3. If **System Check** can actually evaluate it, the card links to the **prefilled** checker with exact model(s), sourced relevant ratings, distance, user-selected target level, and known connection context. Unknown values remain blank. No mismatched load or burst rating becomes continuous watts.
4. If **Compare My Gear** supports its equipment category, the exact saved model ID or known canonical preset model is preselected. Side-by-side alternatives are selected only if the exact model/category is compatible with the comparison engine. Show source evidence and actual inputs/outputs.
5. **Creating Builder** model-specific microphone, interface, mixer/recorder, studio monitor and PA stage links must use source-registry IDs into appropriate Compare categories. A generic “compare equipment” footer is forbidden in place of these links.
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
| Creating powered studio monitor stage | Compare powered studio monitors | exact registry model ID and optional similar alternative | browser selected model |
| Creating powered PA stage | Compare powered PA speakers | exact registry model ID and optional similar alternative | browser selected model |

**Important limits / outstanding capabilities:** Compare My Gear is a **specification and connector evidence comparison**, not a proof of end-to-end safe electrical compatibility. It does not verify max clean SPL or room coverage for powered speakers. System Check currently computes passive-speaker power/headroom estimates; it is not an appropriate max-SPL validator for powered monitors, powered PA or headphones. The existing Builder subwoofer routing is model-specific guidance, not a dedicated standalone subwoofer checker for arbitrary owned hardware. Those are real capability gaps and cannot be marked fully certified by merely adding a link. When the user requires these capabilities, extend the correct underlying engine and its tests, not just the UI.

## Required CI

- Site regression includes source-data, category and matching safety gates.
- Release candidate browser preflight navigates **real rendered** Builder -> Check/Compare paths in both desktop and mobile emulation, confirms incoming selections and runs the destination tool.
- Browser preflight triggers on **all** `system-check/**` and `system-builder/**` changes, not just the compare directory.
- Explicit release acceptance: **no blank checker link on any recommendation**; no invalid type; no source context lost; no false safety claims; no source-less numeric capability or loudness guarantee.

## Handoff instruction to future AI/release agents

Read this contract and `equipment/certification/RELEASE_MATRIX_AUDIT_2026_11_21.md` **before** touching Builder, System Check, comparison or equipment catalog code. Plan changes to both sides of the transfer together. Add an automated end-to-end regression in the same commit sequence. Keep draft PR and source branch intact and do not deploy without owner authorization and all four release gates passing. Do not misdescribe partial feature support as “fully integrated.”
