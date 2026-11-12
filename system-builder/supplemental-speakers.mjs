/**
 * Exact-model, Builder-only budget speaker records (2026-11-12).
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
]);
export function builderOnlySpeakerFor(model) {
  return BUILDER_ONLY_SPEAKERS.find(x=>x.model===model)||null;
}
