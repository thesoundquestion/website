'use strict';
/*
 * Exact-model, manufacturer-sourced speaker presets bridging Builder and
 * System Check until Builder-only records are migrated into the legacy
 * Checker view. Never turn "recommended amplifier watts" into speaker power
 * handling. A saved model with the exact same name is never overwritten.
 *
 * Q Acoustics 2020i and 3030i are DIFFERENT generations. Their 6 Ω
 * nominal / 88 dB voltage sensitivity happen to match, but the cabinets
 * and frequency responses do not. No alias or fuzzy substitution permitted.
 */
(function registerExactQAcousticsPresets(){
  if(typeof systemCheckGear==='undefined'||!Array.isArray(systemCheckGear.speaker))return;
  const source2020='https://test.armourhome.co.uk/downloads/qacoustics/2000i_Manual.pdf';
  const source3030='https://www.qacoustics.co.uk/collections/3000i-range/products/q-acoustics-3030i';
  const extra=[
    {
      model:'Q Acoustics 2020i',
      values:{sensitivity:88,basis:'voltage',load:6,minimum:4,
        speakerRecommendedAmpMax:75,speakerPowerSource:source2020,
        speakerPowerNote:'The 2000i manufacturer manual specifies 25–75 W recommended amplifier power. This is NOT a continuous or peak speaker power-handling limit.'},
      note:'Exact original 2020i from the Q Acoustics 2000i Series manual: 6 Ω nominal, 4 Ω minimum, 88 dB at 2.83 V/1 m, 64 Hz–22 kHz (±3 dB). Not the 3020i or 3030i.',
      url:source2020
    },
    {
      model:'Q Acoustics 3030i',
      values:{sensitivity:88,basis:'voltage',load:6,minimum:4,
        speakerRecommendedAmpMax:75,speakerPowerSource:source3030,
        speakerPowerNote:'The manufacturer lists 25–75 W for stereo amplification; do not use that recommendation as a continuous or peak speaker power limit.'},
      note:'Exact original 3030i (NOT 2020i, 3020i or 3030c). Q Acoustics: 6 Ω average, 4 Ω minimum, 88 dB at 2.83 V/1 m. Published response is 46 Hz–30 kHz with mixed +3/−6 dB bounds.',
      url:source3030
    }
  ];
  for(const preset of extra) {
    if(systemCheckGear.speaker.some(saved=>saved.model===preset.model))continue;
    systemCheckGear.speaker.push(preset);
  }
})();
