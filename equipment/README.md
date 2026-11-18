# The Sound Question | Shared equipment catalogue (Phase 1)

**Status: draft, not published, no Cloudflare deployment.** The first implementation
preserves the existing 130 System Check presets, includes 29 sourced research
profiles and 17 Builder-only profiles, and produces a single **read-only normalized
catalogue** of **173 distinct physical devices**. A device may have multiple
functions/categories, so category totals intentionally exceed the model count.

## Canonical editable source and migration boundary

The primary editable catalogue is now `source-master.json`. It combines
the 130 original listening presets, 29 newly researched profiles, 17
Builder-only profiles, and the existing supplemental comparison information.
It is **not published** in the static website; only generated runtime
projections are published. Make catalogue data edits there first.

During the migration, the legacy source files still exist because their
modules also contain existing logic/recommendation exports. The build
checks that their equipment data matches the master and rejects drift. To
synchronize the data-only legacy files after editing the master, run:

```sh
node scripts/sync-equipment-source-mirrors.mjs --check
node scripts/sync-equipment-source-mirrors.mjs --write
node scripts/build-equipment-catalog.mjs
node scripts/build-equipment-catalog.mjs --check
node --test tests/equipment-catalog-*.test.mjs
```

The sync tool covers the classic Checker preset, Compare details and
research JSON mirrors. **All 17 Builder-only model profiles now come directly
from the master** via `system-builder/catalog-supplements.generated.mjs`.
The original speaker, amplifier, headphone and budget-headphone modules are
thin, backward-compatible exports containing no independent model lists.
Their existing lookup functions remain unchanged. The generator checks the
generated module and blocks stale output.

## Working files

- `catalog.generated.json`: shared catalogue read model, produced from sources; **never edit by hand**.
- `catalog-core.mjs`: deterministic source-preserving normalization, explicit
  same-product joins and stable model IDs.
- `catalog-client.mjs`: lazy full-catalogue reader for future recording,
  headphone and live-sound workflows. Not loaded on the homepage.
- `catalog-legacy-adapters.mjs`: read-only compatibility views reconstruct
  all original Checker presets and supplemental comparison details, plus
  neutral goal-category candidates, with no calculation or suitability claim.
- `../tests/equipment-catalog-adapters.test.mjs`: verifies that every legacy
  numeric rating, note, link and comparison detail survives conversion.
- `../system-builder/catalog-supplements.generated.mjs`: generated speaker,
  amplifier, headphone and budget-headphone data, with original module APIs
  kept as thin re-exports.
- `legacy-presets.generated.js` / `compare-details.generated.js`: exact,
  source-preserving classic-script projections consumed by the existing
  Builder, Checker and Compare pages without rewriting calculations.
- `../scripts/build-equipment-catalog.mjs`: generate and check all three
  synchronized runtime files.
- `../tests/equipment-catalog-unified.test.mjs`: identity, source provenance,
  same-device roles, user comparison anchors, manufacturer test bases and unknowns.

Run:

```sh
node scripts/build-equipment-catalog.mjs
node scripts/build-equipment-catalog.mjs --check
node --test tests/equipment-catalog-unified.test.mjs tests/equipment-catalog-adapters.test.mjs tests/equipment-catalog-runtime.test.mjs
```

## Regional descriptive pricing bands (new draft pilot)

`equipment/price-tiers.mjs` classifies exact models by the mean of recent,
regular new-retail asking prices from at least two distinct retailers per
model, and by price tertile among comparable products **within each region**.
Tiers are **Budget pricing**, **Mid-priced** and **Premium pricing**: they
are *not equipment grades or quality/accuracy scores*. Stale (over 45 days),
unavailable or insufficiently evidenced market cohorts produce no label.

Two Canadian category samples now contain five models apiece: wired
headphones and USB recording interfaces. Both are marked `limited_sample`;
other regional/category price tiers remain unclassified.
Raw price observations stay in the editorial master rather than the public
generated snapshot. No existing Builder affordability calculations or price
estimates were rewritten. See `REGIONAL_PRICE_TIERS_2026_11_18.md`.

## How the model avoids bad comparisons

- Every device has one stable ID, zero or more exact model-name aliases and
  one or more **source-specific profiles**. Existing `gear.js` records and
  `compare/specs.js` details are retained without discarding unknown fields.
- The exact Creative X-Fi Titanium HD's RCA source and computer-recording
  functions link to one physical product; original FiiO K11's RCA line output
  and headphone amplification link to one product. The different **output
  paths keep their different specifications**. K11 R2R is a different model.
- AKG K371 is one device even though both recording research and the Builder
  describe it. This is **exact-variant identity matching**, not fuzzy
  model-name matching.
- Amplifier power is stored with the load, test condition and duration.
  Speaker sensitivity keeps its **1 W versus 2.83 V** reference.
  Headphone sensitivity keeps **dB SPL per mW versus per V**.
  No automatic matching verdict follows from impedance alone.
- Interfaces keep separate mic-preamp counts, simultaneous physical inputs
  and recording channel counts; a 10-channel mixer is not automatically a
  10-track USB recorder. The catalogue does not claim a microphone with an
  XLR plug can use any XLR-looking input.
- Known physical connections are recorded by signal role, not just plug shape.
Existing legacy devices may receive separate `curatedConnections` overlays
in the master with an exact model ID, dated evidence, an electrical role and
an explicit adapter caveat. Original legacy calculations remain unchanged.
  **Unknown connections remain absent/unverified**. Do not fill them from
  a category stereotype. Where the evidence only describes a cable in prose,
  the description remains prose rather than an invented structured port.
- External research fields retain source URLs and declared uncertainties.
  Missing numeric specifications remain null or absent. Prices and live
  availability are *always* null in the generated shared view; independent
  region/date-specific market evidence is required before public prices.
- The catalogue does **not** claim personal ownership in the public
  schema; comparison anchors are neutral examples.

## What is already covered

The Builder, Checker and Compare **draft HTML entrypoints now load generated
compatibility views of the shared registry**. Exact legacy preset ordering,
all fields (including `extra` and `distortionResearch`), test conditions,
supplemental comparison notes and citations are retained. The existing
calculation, comparison and recommendation JavaScript engines are unchanged.
The original editable `system-check/gear.js`, `compare/specs.js` and Builder
supplements are **still source inputs** during this migration. Thus there is
one shared read model for all three pages, but source authoring is not yet
consolidated into a single editable master file. Do not misrepresent this as
completed source consolidation.

The static release builder has an exact generated-file freshness gate and
publishes only six approved `equipment/` runtime assets, excluding this
handoff and research plans. This is still a draft-only change, not deployed.

Current category coverage includes passive speakers, powered studio monitors, portable PA speakers, amplifiers/receivers,
sources, wired headphones, microphones, USB interfaces, mixers/recorders,
computer audio and headphone amplifiers. Existing personal comparison
examples include Yamaha A-720, Panasonic SA-HE100, Yamaha HTR-4063,
Paradigm Phantom v1, Paradigm Titan v3, Grado SR80e and Creative Titanium HD,
plus FIFINE K669D and M-Audio M-Track Solo.

## Documented legacy signal-path integration (draft)

Manual-backed `curatedConnections` overlays now cover the original Yamaha
A-720, Panasonic SA-HE100, Yamaha HTR-4063 (North American model), Pioneer
SP-FS52 and Paradigm Titan v3. This does not change any of their 130
original System Check preset values. Typed speaker outputs, line-level
pre-outs, RCA tape/line/phono inputs, digital inputs, the Panasonic's
six-channel analogue DVD input and Yamaha's surround-back PRE OUT remain
different roles. The A-720's speaker A/B/C terminals are switching banks,
not independent amplifiers.

All three existing mixer/recorder examples now have individually typed
input/output roles. The Behringer XENYX 1204USB's USB is stereo, even though
its analogue ALT 3-4 outputs allow additional external routing. The Zoom
LiveTrak L-12's 14-channel 44.1/48-kHz USB capture must not be conflated
with 96-kHz standalone SD recording, which has a lower simultaneous track
limit. Numerical claims are backed by their original manual URLs in the
research records.

**Deliberate unknown:** The original Paradigm Phantom v1 terminal hardware
has conflicting model/version descriptions. Do not claim it accepts banana
plugs or five-way binding posts until the exact original unit or an
unambiguous original model manual establishes the actual terminals. Its
passive speaker-level electrical role is known, but terminal hardware
and adapter suitability are pending.

## Additional common-equipment connector batch

Source-linked connector overlays now cover nine amplifier models (including
Yamaha A-S301/A-S501/A-S701, R-S202, Denon PMA-600NE and Cambridge AXA35)
and ten speaker models. Polk ES15/ES20, Klipsch R-50M and Paradigm Monitor
SE Atom retain passive **speaker-level** input roles. The Yamaha A-S siblings
share relevant input/output connectors, but **not their per-model electrical
ratings**. The R-S202 has no phono cartridge stage; a line input does not
perform RIAA equalization. Cambridge AXA35's rear USB port supplies power,
not digital audio. This matters for the beginner recording and listening
system builders.

Typed connectors are **source-backed connection descriptions**, not an
automatic guarantee of safe amplifier/speaker pairing. Future specialized
checkers must still evaluate impedance minima, rated loads, amplifier
conditions, signal level, cable wiring and required gain.

## Phase 1 still to do before sign-off

1. **Broaden source-verified model coverage**, especially recording microphone variants,
   PA systems, accessory paths, additional headphones/headphone amps and exact
   recording interfaces. Five documented additions (Pioneer SP-FS52, Yamaha
   HS5, JBL 305P MkII, QSC K12.2 and Electro-Voice ZLX-12P-G2) are now present.
   The original Pioneer manual gives 6 Ω nominal and 87 dB at 2.83 V,
   but does not state a frequency-range tolerance or continuous power duration.
   The Yamaha HS5 / JBL 305P MkII are sold as single powered monitors,
   while QSC/EV are portable PA. Different SPL and amplifier ratings are not
   interchangeable. EV's onboard 24 V phantom supply is *not* generic 48 V.
2. **Resolve unknown connection topology** on existing models and research
   records with exact manufacturer manuals. In particular, distinguish
   microphone inputs, line inputs, instrument/Hi-Z inputs, balanced outputs,
   USB stereo mix versus genuine multitrack, headphone SE versus balanced,
   and the actual headphone jack/power rating of sources.
3. **Review confidence for each quantitative spec**, prioritizing the M-Track
   Solo 16-bit claim, which still requires device-specific manufacturer
   confirmation rather than a definitive public comparison.
4. **Review shared catalogue size and load policy.** Existing listening tools
   load only their compact classic-script projections; future specialist
   tools may lazy-load the complete catalogue, not the homepage.
5. **Authoring consolidation complete for current catalogue models.**
   The canonical editable master contains all 130 original Checker presets,
   29 research profiles and 17 Builder-only profiles. Legacy research/Checker
   files remain guarded mirrors for old workflows; Builder-only exports are
   generated directly. Do not edit generated files or legacy mirrors as new
   independent sources. Future model evidence is edited in the master first.
6. **Manual mobile and browser regression, source-confidence review and
   deliberate release approval.** The static builder now includes approved
   catalogue runtime assets and will fail if generated output is stale.
   Draft PR #23 is not merged, and no Cloudflare publication is performed.

## Later phases, in agreed order

**Phase 2: side-by-side equipment comparisons.** Build model selection on
this catalogue, then interpret real trade-offs and unknowns, rather than
rank nominal wattage or quoted frequency endpoints.

**Phase 3: separate compatibility checks.** Recording chain, headphone
and amplifier pairings, then live-sound coverage. Preserve all existing
speaker/amp engineering and do not claim verified links from absent facts.

**Phase 4: goal-first entry.** Connect the simpler homepage / “What am I
looking to do?” guide to relevant lessons, comparisons and specialized
checkers after those routes and data have passed owner review.
