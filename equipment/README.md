# The Sound Question | Shared equipment catalogue (Phase 1)

**Status: draft, not published, no Cloudflare deployment.** The first implementation
preserves the existing 130 System Check presets, includes 29 sourced research
profiles and 17 Builder-only profiles, and produces a single **read-only normalized
catalogue** of **173 distinct physical devices**. A device may have multiple
functions/categories, so category totals intentionally exceed the model count.

## Working files

- `catalog.generated.json`: shared catalogue read model, produced from sources; **never edit by hand**.
- `catalog-core.mjs`: deterministic source-preserving normalization, explicit
  same-product joins and stable model IDs.
- `catalog-client.mjs`: lazy browser reader for the future Builder, Checker,
  comparisons and goal guide; not wired to those screens yet.
- `../scripts/build-equipment-catalog.mjs`: generate and check data.
- `../tests/equipment-catalog-unified.test.mjs`: identity, source provenance,
  same-device roles, user comparison anchors, manufacturer test bases and unknowns.

Run:

```sh
node scripts/build-equipment-catalog.mjs
node scripts/build-equipment-catalog.mjs --check
node --test tests/equipment-catalog-unified.test.mjs
```

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

The original System Check records remain authoritative for its existing
speaker/amp calculations during this transition. The shared catalogue gives
future features one normalized way to read the original facts without
duplicating their maintenance. No calculator, recommendation, or homepage
is changed in this PR.

Current category coverage includes passive speakers, powered studio monitors, portable PA speakers, amplifiers/receivers,
sources, wired headphones, microphones, USB interfaces, mixers/recorders,
computer audio and headphone amplifiers. Existing personal comparison
examples include Yamaha A-720, Panasonic SA-HE100, Yamaha HTR-4063,
Paradigm Phantom v1, Paradigm Titan v3, Grado SR80e and Creative Titanium HD,
plus FIFINE K669D and M-Audio M-Track Solo.

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
4. **Review shared catalogue size and load policy**. Keep it lazy-load-only
   for comparison/checker tools, not a forced homepage download.
5. Before deployment, deliberately include the `equipment` runtime route
   in `scripts/build-public-site.mjs`, and add public build/reader tests.
   This route is *currently excluded*, intentionally keeping all Phase 1
   research data off the live site until approval.

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
