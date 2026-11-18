# System Builder / Checker: recording-equipment catalogue, evidence and migration plan

**Research batch 1 · November 18, 2026**  
**Status:** research-only GitHub draft. No change to live System Builder, System Check calculations, ownership UI, published search lists or Cloudflare.  
**Data file:** `research/recording-input-catalog-v1.json` (structured source-evidenced records, not a final public recommendation list).

## Why the existing owned equipment is a required part of this catalogue
The owner has a **FIFINE K669D XLR dynamic microphone**, an **M-Audio M-Track Solo USB interface** and a **Creative Sound Blaster X-Fi Titanium HD** card. These were added as three direct comparison anchors. The software distinguishes them by physical socket and purpose, rather than claiming everything labelled “audio interface” is interchangeable.

- **FIFINE K669D**: XLR moving-coil dynamic microphone; not the separate K669 USB microphone. It does not need phantom power. Record `xlr_3pin` and dynamic capsule category rather than a guessed USB capability. Source: FIFINE official product and published K669D user guide.
- **M-Audio M-Track Solo**: two simultaneous analogue recording channels, **one microphone preamp**, a separate line/instrument path, 48 V phantom support, direct-monitor switch, RCA playback outputs and headphone jack. Manufacturer lists 54 dB of mic gain and −128 dBu EIN under stated test conditions. Maximum 48 kHz. Retailer indicates 16-bit format; verify against the device-specific manufacturer manual before using bit depth as a public comparison verdict. Two recorded channels **do not equal two XLR microphone preamps**.
- **Creative X-Fi Titanium HD**: both playback DAC and analogue RCA stereo line-input/ADC function. It is not a substitute for a dedicated XLR microphone preamp. Manufacturer cites 24-bit/96 kHz conversion on the RCA recording input. Revision/header/driver details need their own documented check; do not assume every older X-Fi Titanium is the Titanium **HD**.

### More of the owner's existing equipment already in the shared catalog
Existing `system-check/gear.js` presets were validated for **Yamaha A-720**, **Panasonic SA-HE100**, **Yamaha HTR-4063 (US/Canada)**, **Paradigm Phantom v1**, **Paradigm Titan v3**, **Grado SR80e**, and **Creative Titanium HD (RCA)**. The new research file references those **seven existing records** instead of creating duplicates or accidentally replacing their data. **Pioneer SP-FS52** is added as a missing comparison candidate with numeric specs explicitly unknown pending research. A manufacturer's facts and a user's ownership are different pieces of information: a model can be in the public catalogue without publicly labelling someone as its owner.

## First batch: 16 model profiles
| Category | Research records |
| --- | --- |
| Microphones, 6 | FIFINE K669D (comparison anchor), Shure SM58, Shure SM57, RØDE PodMic (XLR), Audio-Technica AT2020 (XLR), Shure MV7+ (USB/XLR) |
| Audio interfaces, 6 | M-Audio M-Track Solo (comparison anchor), Focusrite Scarlett Solo 4th Gen, Scarlett 2i2 4th Gen, Audient iD4 MkII, Arturia MiniFuse 2, Behringer UMC202HD |
| Mixers/multitrack, 3 | Yamaha MG10XU, Behringer XENYX 1204USB, Zoom LiveTrak L-12 |
| Computer sound card, 1 | Creative X-Fi Titanium HD (comparison anchor) |

This is **representative model selection**, not a claim that these are the 16 bestselling units in Canada. Reliable ranked sales figures across stores were not available. Specific models/versions matter; notably Audient's 2026 revised iD series is not interchangeable with the historical iD4 **MkII** entry.

## Data schema, evidence and honest unknowns
Every model has `id`, model name, class, version as appropriate, source URLs and cited manufacturer fields, an evidence date, and explicit `null` values for unverified specifications. Price and inventory availability are **null for all 16**. The existing site already requires date/region/currency/normal-retail evidence and expires price references at 30 days; introducing static prices here would violate that policy.

**Microphones:** capsule mechanism, pickup direction, connector and power; later add measured/specified sensitivity in common units with conditions, output impedance, published maximum sound pressure, frequency response curve with method, contact and USB/digital path differences, and accessories when documented.

**Interfaces:** independently usable microphone preamps, simultaneous analogue inputs, instrument/line channels, **computer recording input channels** and playback outputs, headphone capabilities, 48 V, direct versus software monitor paths, loopback, MIDI and digital expansion. Treat conversion format (16/24/32 bit and sample rates) as **one** capability, not a numeric fidelity score. A two-in/two-out can have only one mic preamp, as the M-Track Solo and Audient iD4 MkII demonstrate.

**Mixers:** advertised strip/channel count, mono versus stereo input groups, actual mic preamps, **USB channel count and whether it is stereo-only vs multitrack**, main/aux routes, local recorder, loopback and standalone operation. Yamaha MG10XU: 10 mixer channels, 4 mic inputs, USB **2-in/2-out** stereo. Zoom L-12: 12 mixer input channels (8 mono + 2 stereo), eight mic preamps, USB **14-in/4-out** multitrack. Never infer that 14 computer input channels are 14 XLR sockets.

**Comparable measured performance:** manufacturer's noise/dynamic-range/THD figures are allowed as **descriptive source-specific values** with conditions, not normalized sound-quality rankings. Gain, EIN and maximum input level are not directly comparable if method, termination, weighting or gain differs.

## Integration architecture and explicit safety rules
1. Maintain a **shared normalized equipment registry**, but keep current `system-check/gear.js` authoritative for the existing 130 playback presets. The new research catalog is an adjacent module, not an edit to their power and sensitivity tables.
2. Distinguish `category` and `function`: microphone → preamp/ADC recording path; XLR vs USB mic; keyboard/guitar line or Hi-Z; mixer stereo main vs per-input multitrack; interface output → powered monitors or receiver/PA.
3. Build an **input-chain compatibility checker** separately from the amplifier headroom calculator. Start with strong logical checks: whether a mic can physically connect to a verified mic input, whether required phantom is available, source count vs independent preamps/inputs and whether recorded channels remain separate. Missing answers produce **conditional/unverified**, never “fully compatible.”
4. Include adapters and basic accessories (XLR lead, mic stand, headphones, USB cable) as optional or required path components only with known specifications. Do not treat an external adapter as changing a line input into a noise-controlled mic preamp.
5. Next, add a model-selectable, read-only “compare your gear” workflow and goal-first chooser integration. The public System Builder listens to hi-fi pathways today; no recorded-music or PA calculation should claim to work until dedicated tests confirm its logic.
6. Publish specifications, not automatic purchase rankings. Used/older/discontinued gear remains a valuable entry in a long-lived inventory. Price data requires independent expiry and geography.

## Research backlog after this seed batch
- **Microphone variants:** Shure SM7B, Electro-Voice RE20, Sennheiser e 835, RØDE NT1 5th Gen (distinguish USB 32-bit float from XLR), AKG P120, sE V7, pencil condensers such as AT2021, lavalier/wireless and drum mic sets.
- **Interfaces:** Focusrite Scarlett 4i4, 18i20 (explicitly distinguish its eight onboard mic preamps from digital expanded I/O); Behringer UMC404HD and UMC1820; MOTU M2/M4; SSL 2+, Universal Audio Volt, Audient iD14 MkII and current Mk3 versions.
- **Mixers:** Yamaha MG06X, MG12XU; Mackie ProFX USB variants; Allen & Heath ZED-10FX, CQ-12T; Zoom PodTrak P4, LiveTrak L-8; RØDECaster Duo/Pro II; Tascam Model 12; Soundcraft Signature 12 MTK. Verify actual multitrack outputs independently for **each variant**.
- **PA/signal accessories:** powered speakers, stage wedges, DI boxes, mic stands, headphones and headphone distribution amps. Do not reproduce existing powered-speaker records if present.
- **Owner comparisons:** verify specific Pioneer SP-FS52 technical data, then cross-reference the other owned playback gear already in System Check. The user's Panasonic/Yamaha comparison work is valuable for teaching input/output distinctions but is not evidence about microphone preamp performance.

## First batch acceptance tests
`tests/recording-inventory-research.test.mjs` ensures distinct stable IDs, known physical microphone connections, evidence URLs, accurate channel-count distinctions for M-Track Solo, Audient iD4, Yamaha MG10XU and Zoom L-12, reuse of existing personal playback comparison models, null prices, and no invented automatic recommendation scores.

**Pending:** Final owner review of which additional models to prioritize and public UI implementation. This plan is data groundwork, **not** the completed expanded System Builder/Checker feature.


## Batch 2 — Headphones and headphone amplification (2026-11-18)
Owner specifically requested headphone models and headphone amplifiers as inventory components. **The catalogue is now 24 new research records**: original 16 + 3 headphone models + 5 headphone amplifiers. This remains research-only with no published Builder or Checker changes.

### Don't duplicate existing headphone inventory
`system-check/gear.js` already has **nine** relevant passive headphone/earphone records: Grado SR80e (**user-owned anchor**), Grado SR80x and SR60x, Audio-Technica ATH-M50x, beyerdynamic DT 770 PRO 80Ω, Sennheiser HD 560S and HD 600, Sony MDR-7506 and Moondrop Chu II. Use those existing specifications (and preserve their sensitivity unit and conditions), not imported duplicate copies. The existing source preset `FiiO K11 (RCA line out)` is an **analogue source output**, not a model of its headphone-amplifier output; the new K11 headphone-amplification profile represents the other function of the same product.

### Additional headphones (3)
- **AKG K371:** closed-back studio/recording over-ear; manufacturer **32 Ω, 114 dB SPL per V at 1 kHz**. That sensitivity figure is voltage-referenced and cannot be directly compared numerically to Grado's dB/mW figure without converting units. Source: https://www.akg.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw374aeecb/pdfs/AKG_K371_Sell_Sheet.pdf
- **Audio-Technica ATH-M40x:** common studio closed-back monitoring example, differentiated from existing ATH-M50x. Model-specific impedance/sensitivity remain `null` until verified against a matching manufacturer sheet. Source: https://docs.audio-technica.com/eu/M-Series_leaflet_ENG_L00053_V1.0.pdf
- **Shure SRH440A:** closed-back studio/podcast tracking, not previous-generation SRH440. Manufacturer confirms 40 mm dynamic driver, detachable cable and 6.35 mm adapter; other figures `null` pending documentation. Source: https://www.shure.com/en-US/products/headphones/srh440?variant=SRH440A

### Headphone amps and DAC/amp combinations (5)
- **JDS Labs Atom Amp 2**: *analogue-only* desktop headphone amplifier; manufacturer **2.65 W/channel at 32 Ω**, **286 mW/channel at 300 Ω**, output impedance **0.7 Ω**, with stated continuous/load conditions. Needs suitable analogue source, does not convert USB audio by itself. https://jdslabs.com/product/atom-amp-2/
- **Topping L30 II**: *analogue-only* desktop amplifier; RCA line input/pre-out, 6.35 mm headphone jack, gain −14 / 0 / +16.5 dB. Avoid confusing first-gen L30 with L30 II. Manufacturer manual: https://dl.topping.audio/usermanual/l30ii.pdf
- **FiiO K11**: combined USB/optical/coaxial DAC and headphone amplifier. **520 mW/ch at 32 Ω** from **6.35 mm SE**, and **1400 mW/ch at 32 Ω** from **4.4 mm balanced**, both at manufacturer's stated THD+N <1% limit. Different outputs have different power and output-impedance specifications; do not blend the numbers. https://www.fiio.com/k11_parameters
- **FiiO Q11**: portable USB DAC + headphone amp. Some power figures verified in manufacturer's parameters, but output-specific coverage remains partial; model is NOT a microphone interface. https://www.fiio.com/q11_parameters
- **Schiit Magni 6**: current analogue headphone amplifier without the optional digital DAC board; rated **3.0 W/ch at 32 Ω**, 6.35 mm SE output with <0.1 Ω specified output impedance. **Do not copy the older Magni Unity specification sheet**: the Unity product page redirects to the newer Magni 6. Model/option-specific 4.4 mm Halo output differs. https://www.schiit.com/products/magni-6

### Separate compatibility engineering, not amplifier marketing
The future Checker needs:
1. Headphone impedance **and sensitivity including the reference basis** (dB SPL/mW or dB SPL/V), plus reasonable peak-level target.
2. Source or dedicated headphone amplifier power **at relevant load** or voltage/current performance, including stated distortion and gain/source-signal conditions.
3. Amplifier output impedance, output noise for very sensitive headphones, practical low-volume control, compatible physical socket and *actual* single-ended or balanced wiring topology.
4. Safe listening levels and explicit uncertainty for unknown headphone sensitivity/output capabilities.

**Never infer:** headphones with high ohms automatically require a separate amplifier; an output quoted at 32 Ω delivers the same power at 300 Ω; a 4.4 mm jack is always balanced; a headphones' maximum input power is a safe listening recommendation; or buying a headphone amp automatically improves sound on a sufficiently capable existing output.

**Grado SR80e anchor:** this comparison exists so the user can see whether their current equipment already drives their actual headphones adequately before being directed to purchase anything. Different headphone 'presentation' is not an amplifier specification. Use the existing Grado preset's verified sensitivity/impedance and compare genuine output requirements when source measurements are available.

### New regression gates
`tests/recording-inventory-research.test.mjs` now validates 24 unique typed records, category-count separation, user Grado reuse, manufacturer-linked AKG sensitivity reference, separate 32 Ω K11 power per output, and the absence of any published headphone compatibility calculator.
