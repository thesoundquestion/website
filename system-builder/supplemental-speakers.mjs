/**
 * Exact-model, Builder-only source-backed speaker records (2026-11-12).
 *
 * These are independent source-linked records and DO NOT edit, populate or
 * override the original System Check / Compare My Gear catalogue. Only the
 * specific fields described here are permitted; no laboratory measurements
 * or derived fidelity/compatibility scores are asserted.
 *
 * Published 8-ohm nominal values are retailer product specifications;
 * manufacturer separately states suitability with 4/8-ohm amplifier outputs
 * and actual impedance minima near 4 ohms. Those are NOT the same thing.
 */
export const BUILDER_ONLY_SPEAKERS = Object.freeze([
  {
    model:'Q Acoustics 3010i',type:'speaker',
    values:Object.freeze({load:6,minimum:4,sensitivity:86,basis:'voltage'}),
    ratings:Object.freeze([]),
    note:'Maker specifications: 6 Ω nominal, 4 Ω minimum, 86 dB at 2.83 V/1 m. The frequency-response figure of 65 Hz–30 kHz uses combined +3/-6 dB limits; do not mislabel it ±3 dB.',
    url:'https://www.qacoustics.co.uk/products/q-acoustics-3010i',
    details:Object.freeze({
      configuration:'Passive compact 2-way stereo pair',
      drivers:'100 mm (4-inch) bass unit; 22 mm treble unit',
      frequencyResponse:'65 Hz–30 kHz (+3/-6 dB, manufacturer)',
      responseBasis:'Manufacturer, not independently measured anechoic',
      recommendedStereoPower:'15–75 W (manufacturer recommendation, not amplifier power requirement)',
      reviewedOn:'2026-11-12',reviewStatus:'builder-only-sourced'
    }),
    evidence:'Builder-only source-checked supplement; NOT an original System Check preset'
  },
  {
    model:'Polk Monitor XT15',
    type:'speaker',
    values:Object.freeze({load:8,minimum:4.1,sensitivity:86,basis:'voltage'}),
    ratings:Object.freeze([]),
    note:'8 Ω nominal: Crutchfield product specification; Polk lists 4/8 Ω output compatibility, a 4.1 Ω minimum, and 86 dB at 2.83 V/1 m. Manufacturer -3 dB limit: 73 Hz, not the 48 Hz full quoted range.',
    url:'https://www.polkaudio.com/en-ca/product/home-speakers/satellite-surround/monitor-xt15/300147.html',
    details:Object.freeze({
      configuration:'Passive two-way stereo pair',
      drivers:'5.25-inch bi-laminate woofer; 1-inch Terylene dome tweeter',
      frequencyResponse:'73 Hz–26 kHz (-3 dB, manufacturer)',
      responseBasis:'Manufacturer published -3 dB limits, not independent anechoic verification',
      minimumImpedanceSource:'https://www.polkaudio.com/on/demandware.static/-/Library-Sites-polk_northamerica_shared/default/dw9cd07cce/downloads/monitor-xt-series-owners-manual-global.pdf',
      nominalSource:'https://www.crutchfield.ca/p_107MXT15/Polk-Audio-Monitor-XT15.html',
      reviewedOn:'2026-11-12',
      reviewStatus:'builder-only-sourced'
    }),
    evidence:'Builder-only source-checked supplement; NOT an original System Check preset'
  },
  {
    model:'Polk Monitor XT20',
    type:'speaker',
    values:Object.freeze({load:8,minimum:4.3,sensitivity:87,basis:'voltage'}),
    ratings:Object.freeze([]),
    note:'8 Ω nominal: Crutchfield product specification; Polk lists 4/8 Ω amplifier-output compatibility, 4.3 Ω minimum and 87 dB at 2.83 V/1 m. Manufacturer -3 dB limit: 57 Hz, not the 38 Hz broad advertised range.',
    url:'https://www.polkaudio.com/en-ca/product/home-speakers/bookshelf/monitor-xt20/300151.html',
    details:Object.freeze({
      configuration:'Passive two-way stereo pair',
      drivers:'6.5-inch bi-laminate woofer; 1-inch Terylene dome tweeter',
      frequencyResponse:'57 Hz–26 kHz (-3 dB, manufacturer)',
      responseBasis:'Manufacturer published -3 dB limits, not independent anechoic verification',
      minimumImpedanceSource:'https://www.polkaudio.com/on/demandware.static/-/Library-Sites-polk_northamerica_shared/default/dw9cd07cce/downloads/monitor-xt-series-owners-manual-global.pdf',
      nominalSource:'https://www.crutchfield.ca/p_107MXT20/Polk-Audio-Monitor-XT20.html',
      reviewedOn:'2026-11-12',
      reviewStatus:'builder-only-sourced'
    }),
    evidence:'Builder-only source-checked supplement; NOT an original System Check preset'
  }
  {
    model:'PSB Alpha P3',type:'speaker',
    values:Object.freeze({load:8,minimum:4,speakerRecommendedAmpMax:80,
      speakerPowerSource:'https://www.psbspeakers.com/int/alpha-p3-compact-bookshelf',
      speakerPowerNote:'Manufacturer lists 10–80 W recommended amplifier power and 60 W program power. Neither is a measured continuous speaker damage threshold.'}),
    ratings:Object.freeze([]),
    note:'PSB states 85 dB anechoic and 87 dB listening-room sensitivity; the source page does not establish a voltage/power reference to import as a System Check numeric sensitivity. 8 Ω nominal, 4 Ω minimum.',
    url:'https://www.psbspeakers.com/int/alpha-p3-compact-bookshelf',
    details:Object.freeze({configuration:'Passive compact 2-way pair',drivers:'4-inch woofer, 3/4-inch aluminium dome',
      frequencyResponse:'57 Hz–21 kHz (on-axis ±3 dB, manufacturer)',
      sensitivityAnechoic:'85 dB (manufacturer)',sensitivityInRoom:'87 dB (manufacturer)',
      responseBasis:'Manufacturer on-axis; numeric sensitivity basis not specified',
      handling:'60 W program (NOT verified continuous power handling)',
      reviewedOn:'2026-11-12',reviewStatus:'builder-only-sourced'}),
    evidence:'Builder-only exact-model, manufacturer specs + independent review; original System Check unchanged'
  },
  {
    model:'PSB Alpha P5',type:'speaker',
    values:Object.freeze({load:8,minimum:4,speakerRecommendedAmpMax:90,
      speakerPowerSource:'https://www.psbspeakers.com/products/alpha-p5-bookshelf',
      speakerPowerNote:'Manufacturer lists 10–90 W recommended amplifier power and 60 W program power. Neither establishes continuous speaker damage limits.'}),
    ratings:Object.freeze([]),
    note:'PSB states 87 dB anechoic / 89 dB listening-room sensitivity, not a measured comparison with speaker sensitivities using a different basis. 8 Ω nominal, 4 Ω minimum.',
    url:'https://www.psbspeakers.com/products/alpha-p5-bookshelf',
    details:Object.freeze({configuration:'Passive 2-way standmount stereo pair',drivers:'5.25-inch woofer, 3/4-inch aluminium dome',
      frequencyResponse:'55 Hz–21 kHz (on-axis ±3 dB, manufacturer)',
      sensitivityAnechoic:'87 dB (manufacturer)',sensitivityInRoom:'89 dB (manufacturer)',
      responseBasis:'Manufacturer; numeric sensitivity basis not specified',
      handling:'60 W program (NOT verified continuous power handling)',
      reviewedOn:'2026-11-12',reviewStatus:'builder-only-sourced'}),
    evidence:'Builder-only exact-model; multiple independent listening reviews; original System Check unchanged'
  },
  {
    model:'Triangle Borea BR03 (passive)',type:'speaker',
    values:Object.freeze({load:8,minimum:4.2,sensitivity:90,basis:'power',
      speakerPowerNominal:100,speakerRecommendedAmpMax:130,
      speakerPowerSource:'https://ca.trianglehifi.com/en/products/enceinte-bibliotheque-hi-fi-borea-br03-paire',
      speakerPowerNote:'Triangle calls 100 W an average continuous handling rating and suggests 25–130 W amplification. Its 70%-volume instruction is not a universal safety rule; full output/load are not lab verified.'}),
    ratings:Object.freeze([]),
    note:'Passive BR03, NOT powered BR03 CONNECT. Manufacturer publishes 90 dB at 1 W/1 m, 8 Ω nominal, 4.2 Ω minimum and 46 Hz–22 kHz ±3 dB. Do not import maker room-size or volume-knob claims as safety criteria.',
    url:'https://ca.trianglehifi.com/en/products/enceinte-bibliotheque-hi-fi-borea-br03-paire',
    details:Object.freeze({configuration:'Passive 2-way front-ported stereo pair',
      drivers:'16 cm cellulose mid-woofer, 25 mm silk dome',frequencyResponse:'46 Hz–22 kHz (±3 dB, manufacturer)',
      responseBasis:'Manufacturer published spec, independent listening tests linked separately',
      reviewedOn:'2026-11-12',reviewStatus:'builder-only-sourced'}),
    evidence:'Builder-only manufacturer technical source, independent review and owners; original System Check unchanged'
  },
  {
    model:'Q Acoustics 3030i',type:'speaker',
    values:Object.freeze({load:6,minimum:4,sensitivity:88,basis:'voltage',
      speakerRecommendedAmpMax:75,
      speakerPowerSource:'https://www.qacoustics.co.uk/products/q-acoustics-3030i',
      speakerPowerNote:'25–75 W is the maker recommendation for a stereo amplifier, NOT loudspeaker continuous power handling; AV receiver guidance differs.'}),
    ratings:Object.freeze([]),
    note:'Original 3030i, not newer 3030c. Manufacturer 6 Ω average, 4 Ω minimum, 88 dB at 2.83 V/1 m; 46 Hz–30 kHz published with mixed +3/-6 dB bounds, NOT a simple ±3 dB range.',
    url:'https://www.qacoustics.co.uk/products/q-acoustics-3030i',
    details:Object.freeze({configuration:'Passive 2-way, rear-ported stereo pair',
      drivers:'165 mm woofer, 22 mm tweeter',frequencyResponse:'46 Hz–30 kHz (mixed +3/-6 dB limits, manufacturer)',
      responseBasis:'Manufacturer source; exact original i revision',
      reviewedOn:'2026-11-12',reviewStatus:'builder-only-sourced'}),
    evidence:'Builder-only source-checked exact original 3030i; independent review and mixed owner reports'
  },
  {
    model:'Klipsch RP-600M II',type:'speaker',
    values:Object.freeze({speakerPowerNominal:100,speakerPowerPeak:400,
      speakerPowerSource:'https://assets.klipsch.com/product-specsheets/RP-600M-II_Spec-Sheet_v02.pdf',
      speakerPowerNote:'Klipsch rates 100 W continuous / 400 W peak; it says 8-ohm COMPATIBLE, without publishing an actual nominal numeric impedance or minimum in this document.'}),
    ratings:Object.freeze([]),
    note:'Exact Reference Premiere RP-600M II (not older RP-600M). 8 Ω compatible is NOT a verified 8 Ω nominal or minimum. Maker 94.5 dB at 2.83 V/1 m is half-space/in-room sensitivity and is not directly comparable with anechoic estimates; numerical sensitivity deliberately omitted.',
    url:'https://assets.klipsch.com/product-specsheets/RP-600M-II_Spec-Sheet_v02.pdf',
    details:Object.freeze({configuration:'Passive 2-way rear-ported horn/woofer pair',
      drivers:'6.5-inch Cerametallic woofer, 1-inch titanium horn tweeter',
      frequencyResponse:'44 Hz–25 kHz (±3 dB, manufacturer)',
      sensitivityInRoom:'94.5 dB at 2.83 V/1 m (half-space/in-room)',
      responseBasis:'Manufacturer half-space/in-room; NOT comparable anechoic sensitivity',
      impedanceLabel:'8 Ω compatible, actual nominal/minimum not validated',
      reviewedOn:'2026-11-12',reviewStatus:'builder-only-conditional'}),
    evidence:'Builder-only manufacturer spec plus independent/owner listening sources; unknown minimum/load cannot be declared safe'
  },
]);
export function builderOnlySpeakerFor(model) {
  return BUILDER_ONLY_SPEAKERS.find(x=>x.model===model)||null;
}
