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
