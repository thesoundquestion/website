# System Check: External Google specification searches

## Scope
Removed the embedded Google Programmable Search Engine (CSE) UI and loader from System Check only. The calculator, manual fields, equipment presets, engineering formulas, compare tool, and source citations remain unchanged.

## Workflow
Open "Find my speaker specs" or "Find my amplifier specs" and enter **manufacturer + exact model**. Four ordinary Google links appear. Each opens in a separate tab. Nothing is fetched, parsed or automatically added to the calculator. Users review manufacturer manuals or credible measurements, distinguish test conditions and enter relevant values manually. Missing information stays blank.

## Queries (only System Check inputs)
- **Speaker:** official spec/manual; sensitivity + whether 2.83 V or 1 W with nominal impedance; distinct power handling categories (continuous, peak, nominal, maximum input and recommended amplifier range); optional independently measured minimum/maximum impedance and phase. **No default frequency-response search**, because System Check has no such field.
- **Amplifier:** official specification/manual; continuous output watts per channel with rated load and THD; other 4/6/8-ohm output / THD+N bench measurements; optional input sensitivity, input impedance and voltage gain.
- Input sanitization preserves revision and model identifiers, normalizes typographic hyphens/extra spacing, and encodes the URL using \`URLSearchParams\`. Technical searches selectively quote distinctive model-code tokens, not the entire manufacturer/model phrase. No required 4, 6 or 8 ohm rating and no rigid manufacturer \`site:\` restrictions.
- These are **search prompts**, not controls over what Google displays. Independent sources may be incomplete, misleading or region-specific. Do not copy peak/dynamic/marketing watts into a continuous rating, do not treat 2.83 V and 1 W sensitivity as equivalent for all impedances, and distinguish recommended amplifier wattage from speaker limits.

## Evaluation, real equipment
Checked publicly indexed source availability before changing queries:
- **Yamaha A-720:** service-manual specifications differentiate continuous 20 Hz–20 kHz power, 1 kHz rated power, DIN 4 Ω, and dynamic power. A single "power output" search is not sufficient.
- **Panasonic SA-HE100:** operating-instruction data distinguishes 6 Ω, 40 Hz–20 kHz both-channels-driven versus 1 kHz continuous figures and THD conditions.
- **Yamaha HTR-4063:** official Yamaha manual includes region-dependent 8 Ω/6 Ω power ratings, 1 kHz conditions and line-input sensitivity; some web summaries collapse these.
- **Paradigm Phantom v1:** documented online material varies in detail, with seller-listed brochure figures and a scanned owner's manual; do not treat classified listings as independent measurements.
- **Klipsch RP-600M II:** manufacturer PDF explicitly states sensitivity with measurement convention, nominal impedance and separate continuous/peak power handling. Manufacturer sensitivity may not be interchangeable with independently measured sensitivity.

**Important limitation:** General web-index search verified the existence of relevant documentation; precise ranking of each resulting Google search link was not independently certified. Some vintage sources may be user-uploaded documents rather than a current manufacturer page.

## Implementation
\`system-check/spec-search.mjs\` is a static client module using ordinary links, no search results iframe, no API keys, no scraping, no server component. It does not read or modify calculator fields except the model-name inputs. A form reset clears the links.

## Regression
Run:
\`\`\`bash
node --test tests/system-check-results.test.mjs tests/system-check-search.test.mjs
\`\`\`
Verify at mobile/desktop widths that all four links show only after entering a model; clicking each opens Google in a new tab. The original calculator logic from \`function readRatings()\` onwards remains unchanged except deleting the old embedded-search reset cleanup.
