# Unified Equipment Inventory: Connectivity and Evidence Coverage Audit

**Date:** 2026-11-18 · **Scope:** PR #23 · **Status:** draft, not a public product recommendation list

The generated catalog contains **173 distinct physical device identities**. Original
Checker/Builder data and verified manufacturer claims are preserved. Automated
regression checks pass at the latest audited commit. This review counts **typed
connection fields in the normalized shared catalogue**, not the number of physical
connectors actually found on equipment or the amount of data buried in free-text
manufacturer notes. A zero here is a migration/documentation gap, **not a claim
that a product lacks the connection**.

| Type | Models | Typed inputs | Typed outputs | Text connection descriptions |
| --- | ---: | ---: | ---: | ---: |
| Speaker (including passive/studio/PA) | 73 | 5 | 1 | 0 |
| Amplifier / AVR | 46 | 0 | 0 | 0 |
| Line source / DAC | 19 | 2 | 19 | 0 |
| Headphones | 16 | 0 | 0 | 14 |
| Microphones | 6 | 0 | 6 | 0 |
| USB audio interfaces | 6 | 0 | 1 | 0 |
| Mixers / recorders | 3 | 0 | 0 | 0 |
| Dedicated headphone amps | 5 | 5 | 5 | 0 |
| Computer sound-card functions | 1 | 1 | 1 | 0 |

Category totals exceed the 173 distinct devices because some multi-function
devices (Creative X-Fi Titanium HD, FiiO K11) have two roles.

## Editorial priorities before Phase 2

### Priority A: Strong examples with verified input/output topology

1. **M-Audio M-Track Solo and Scarlett 2i2 4th Gen.** Explicitly model
   the number of microphone preamps, input socket functions (mic, line,
   instrument), simultaneous recorded input channels, playback outputs,
   phantom supply, monitor controls, headphone capability and published
   output ratings. Official M-Audio specs show **60 mW per channel into
   32 Ω** at the headphone jack; never treat that 32 Ω rating as a
   verified result into the 300 Ω Sennheiser HD 600.
   A documented 16-bit Windows setup does **not**, by itself, establish
   an absolute highest supported bit depth in every driver mode.
2. **Yamaha MG10XU versus Zoom LiveTrak L-12.** The mixer strips, microphone
   preamps and digital USB recording channels must remain distinct.
   Ten-channel mixing does not imply ten independently recorded computer
   tracks, nor does a 14-input USB stream imply 14 XLR mic preamps.
3. **Grado SR80e and Sennheiser HD 600.** Fill exact physical plugs/cabling
   and manufacturer sensitivity references; preserve dB/mW vs dB/V,
   impedance and potential headphone-amplifier noise/dynamic limitations.
   These are candidate comparisons, not upgrade endorsements.
4. **Yamaha A-720, Panasonic SA-HE100, Yamaha HTR-4063 and common modern
   amplifier/receiver choices.** Preserve existing amplifier power
   engineering and model **actual selected input and output types**
   in their own scope, without importing unsupported phone-jack or
   reactive-load assumptions.
5. **Passive vs powered speaker chains:** Paradigm Phantom v1/Titan v3,
   Pioneer SP-FS52, Yamaha HS5, JBL 305P MkII and PA speakers. Do not
   treat external speaker-level terminals as equivalent to studio XLR
   line inputs or PA microphone inputs. Do not use amplifier wattage as a
   stand-in for SPL.

### Priority B: Expand verified representative coverage

- Additional mic types and exact versions; condenser phantom requirements,
  USB microphones vs XLR microphones and passive ribbons
- Affordable and multichannel interfaces, including independent mic preamps
  and digital expansion vs on-board inputs
- Headphone amp voltage/power/output-impedance at **specified headphone
  load**, separating SE and balanced ports
- Powered monitors, portable PA loudspeakers, DI boxes, mic stands, patch
  cables and monitoring accessories only when their function matters
- Used/vintage equipment is retained; current price/availability must remain
  null without dated regional evidence

## How to close gaps without inventing specifications

- Record a typed signal role for each verified port: `mic_in`,
  `line_in`, `instrument_hiz_in`, `speaker_level_out`,
  `line_out`, `headphone_out`, `usb_audio`, or equivalent detailed
  type with independent direction and conditions
- Differentiate an advertised model feature from a measured specification;
  preserve source URL, dated review, variant and measurement conditions
- Prefer `null` / `unverified` to invented values. Do not infer a
  microphone preamp just because an input takes a quarter-inch plug
- For multi-function devices, make one physical identity with separate
  source, headphone amplification, line capture or speaker functions
- Do not auto-certify a connection solely from matching connector shapes

## Release gates remaining

1. Manufacturer/manual verification and structured-port mapping for the
   Priority A models; record meaningful unknowns explicitly
2. Site/browser regression with actual mobile screen and listening tests,
   despite passing automated Node tests
3. Full visual + accessible path review when comparison selectors are built
4. Owner approval before merging PR #23 or invoking Cloudflare deployment

The existing System Check numeric calculations have not been changed.
The catalog and compatibility projections now share a canonical editable
source at `equipment/source-master.json`, with all 17 Builder-only
profiles generated from that master, and a controlled sync for legacy
research/Checker source mirrors.
