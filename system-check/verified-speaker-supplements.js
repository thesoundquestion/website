'use strict';
/*
 * Exact-model, manufacturer-sourced speaker presets bridging Builder and
 * System Check until Builder-only records are migrated into the legacy
 * Checker view. Never turn "recommended amplifier watts" into speaker power
 * handling. A saved model with the exact same name is never overwritten.
 *
 * Q Acoustics models remain distinct. The PSB Alpha P3 and P5 are also
 * separate exact models with documented IEC-filtered manufacturer sensitivity
 * references (2.83 V/1 m). Manufacturer recommended amplifier watts do not
 * constitute a measured continuous or peak speaker power-handling limit.
 * No aliases, approximate model substitution, or generic speaker ratings.
 */
(function registerExactVerifiedSpeakerPresets(){
  if(typeof systemCheckGear==='undefined'||!Array.isArray(systemCheckGear.speaker))return;
  const source2020='https://test.armourhome.co.uk/downloads/qacoustics/2000i_Manual.pdf';
  const source3030='https://www.qacoustics.co.uk/collections/3000i-range/products/q-acoustics-3030i';
  const psbP3DataSheet='https://psbspeakers.in/wp-content/uploads/2024/01/Alpha-P3-Data-Sheet.pdf';
  const psbP5DataSheet='https://content-psbspeakers-com.s3.amazonaws.com/uploads/2021/03/PSB_Alpha_P5_DataSheet_Revised.pdf';
  const extra=[
    {
      model:'PSB Alpha P3',
      values:{sensitivity:85,basis:'voltage',load:8,minimum:4,
        speakerRecommendedAmpMax:80,speakerPowerSource:psbP3DataSheet,
        speakerPowerNote:'PSB recommends 10–80 W amplification and publishes 60 W program power. Neither establishes measured continuous or peak speaker handling.'},
      note:'Original passive PSB Alpha P3: manufacturer 85 dB anechoic (2.83 V/1 m, IEC pink noise), 87 dB typical in room, 8 Ω nominal, 4 Ω minimum. Use anechoic sensitivity for the estimate; do not add the published in-room figure as a second bonus.',
      url:psbP3DataSheet
    },
    {
      model:'PSB Alpha P5',
      values:{sensitivity:87,basis:'voltage',load:8,minimum:4,
        speakerRecommendedAmpMax:90,speakerPowerSource:psbP5DataSheet,
        speakerPowerNote:'PSB recommends 10–90 W amplification and publishes 60 W program power. Neither establishes measured continuous or peak speaker handling.'},
      note:'Original passive PSB Alpha P5: manufacturer 87 dB anechoic (2.83 V/1 m, IEC pink noise), 89 dB typical in room, 8 Ω nominal, 4 Ω minimum. This is the anechoic one-speaker reference, not a separate 89 dB room-gain assumption.',
      url:psbP5DataSheet
    },
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
