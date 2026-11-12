# Compare My Gear — Specification Source Audit

**As of 2026-11-11.** This is a snapshot of the public source data (not an independent live Cloudflare rendering check). Source metadata is stored in `system-check/compare/specs.js` and original electrical matching presets in `system-check/gear.js`.

## Approach

1. Match each extra equipment specification to an exact model in the original gear database; prohibit orphan metadata or accidental neighboring-model substitutions.
2. Prefer model-specific manufacturer specification sheets, manuals or period manufacturer's catalogues. Use contemporary reputable independent measurements for values that are legitimately measured and may differ from marketing.
3. Keep the test basis (±3 dB, −6 dB, −10 dB, on-axis, sensitivity distance, per-mW, digital input and conditions) alongside the number.
4. Preserve discrepancies in manufacturer documents or regional/model variants as visible notes rather than silently choosing a universal number.
5. For secondary vintage transcriptions or sources not independently authenticated, label the source tier; leave unconfirmed values blank.
6. Display reference links on each compared model. The presence of a source link does not alone prove every figure in an entry is correct.

## Catalog inventory

| Category | Presets | Detail records | Model-specific manufacturer reviewed | Other reviewed/source-limited | Missing or not verified |
|---|---:|---:|---:|---:|---:|
| Speaker | 59 | 59 | 47 | 6 | 6 |
| DAC/source | 7 | 7 | 6 | 1 | 0 |
| Headphone | 10 | 10 | 6 | 4 | 0 |

Review tiers in the UI: **manufacturer checked**, **manufacturer + archived distributor**, **manufacturer documentation conflict**, **period technical source**, **secondary vintage transcription**, **regional or archived distributor**, and **not fully reviewed / missing**. These are evidence categories, not quality rankings.

## Known manufacturer and historical contradictions

- **JBL L100 Classic:** JBL's 2018 quick specifications and a JBL owner's manual list crossovers at **450 Hz / 3.5 kHz**; another JBL 2020 spec sheet lists **450 Hz / 2.5 kHz**. Site shows the 2018 value and prominently discloses the conflicting 2020 source. Verify the physical speaker's production revision and crossover if relevant. 2018: https://global.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dwa141b3a0/pdfs/JBL_L100_Classic_Quick_Specs.pdf ; alternate 2020: https://ca.jbl.com/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw1e4dfbc0/pdfs/SC03671_JBL_L100_Classic_Spec%20Sheet_EN_LR.pdf
- **Sony MDR-7506:** Professional datasheet and service manual give **63 Ω**, but Sony regional consumer product pages show **24 Ω** for ostensibly the same model. Site uses the professional 63 Ω specification with warning and both sources, not a universal claim. https://pro.sony/s3/cms-static-content/file/93/1237485312093.pdf ; https://www.sony.co.uk/electronics/headband-headphones/mdr-7506/specifications
- **Pioneer HPM-100:** Some period Pioneer and independent sources give crossover **1.2/4/12 kHz** while other archival publications list **3/4/12 kHz**. May reflect revisions and/or transcription; site shows the source and warning. https://www.hifi-archiv.info/Pioneer/1978-1.pdf
- **ELAC Debut 3.0:** Manufacturer supplies distinct −3 dB and −6 dB limits; do not mix the conditions or present a generic frequency range as a flat response. https://elac.com/download/db63/debut-3-sales-sheet_1.0.0.pdf
- **Paradigm Phantom v1 / Titan v3:** Detailed acoustic and driver entries are secondary reproductions of vintage specifications, not an authenticated original manufacturer scan. Exact versions are important because later Phantom/Titan versions differ physically. https://www.canuckaudiomart.com/details/649848571-paradigm-phantom-v1-speakers/ ; https://www.canuckaudiomart.com/details/649350799-paradigm-titan-bookshelf-speakers-v3-black-with-wall-mounts/
- **Grado Prestige e/x:** Regional distributor/archival brochures supply driver and response endpoint claims but are not all independently cross-checked to a direct Grado factory test. A stated 20 Hz–20 kHz range is not proof of a flat trace.

## Currently unverified models / gaps

### speaker: 6 pending
- **Axiom Audio Vocal Point VP-100 (original):** Exact original VP-100 driver and response specification not confirmed from a model-matching technical document; omitted until available.
- **Cerwin-Vega D-3:** Further model-specific technical verification required. Avoid filling undocumented specs.
- **Cerwin-Vega D-5:** Further model-specific technical verification required. Avoid filling undocumented specs.
- **Cerwin-Vega D-7:** Further model-specific technical verification required. Avoid filling undocumented specs.
- **Cerwin-Vega D-9:** Further model-specific technical verification required. Avoid filling undocumented specs.
- **Pioneer S-H352F-K:** Original variant driver materials, effective frequency limits, crossover and nominal load not reliably established; do not infer specs from another Pioneer model.

### source: 0 pending
- No completely unreviewed models; source types still vary.

### headphone: 0 pending
- No completely unreviewed models; source types still vary.

## Testing and release scope

- Source-side JavaScript parsing and model-to-detail matching were validated. Eight mock-DOM comparison cases were exercised for speaker, source, headphone and amplifier categories; unmatched values appear as em dashes. Existing amp power rows were preserved.
- Repository regression test: `tests/compare-gear.test.mjs` (requires Node; run with `node --test tests/compare-gear.test.mjs`).
- Cloudflare public deployment was **not** independently confirmed due an access block. Source commits on the website's main branch are confirmed; complete browser, mobile and Cloudflare deployment testing remains to be performed separately.
- This audit does not certify manufacturer claims as independent audio lab measurements; it records which printed specification was found and its conditions.
