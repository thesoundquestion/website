/**
 * Builder-only exact-model wired headphone identity additions.
 * Separate from original System Check, which remains read-only.
 * Sensitivity is stored with its explicit volts-based reference, not guessed
 * from a naked dB or 1mW spec. No head-amp compatibility guarantee is implied.
 */
export const BUILDER_ONLY_HEADPHONES=Object.freeze([
  Object.freeze({
    model:'AKG K371',type:'headphone',
    values:Object.freeze({design:'Closed-back over-ear',load:32,sensitivity:114,basis:'voltage',sensitivityConditions:'1 kHz'}),
    ratings:Object.freeze([]),
    note:'Manufacturer: 32 Ω and 114 dB SPL per volt at 1 kHz. Wired original K371, not K371-BT. Closed back and studio tuning are not a proof of tonal neutrality in every fit.',
    url:'https://global.akg.com/K371.html',
    details:Object.freeze({transducer:'50 mm dynamic closed-back over-ear',
      frequencyResponse:'5 Hz–40 kHz (maker range; tolerance not published)',
      connector:'Detachable mini-XLR headphone cable, 3.5 mm source plug with 6.35 mm adapter',
      responseBasis:'Manufacturer claimed range, no reference tolerance',
      reviewedOn:'2026-11-12',reviewStatus:'builder-only-sourced'}),
    evidence:'Builder-only exact-model manufacturer specs; no measured headphone sound ranking'
  }),
  Object.freeze({
    model:'FiiO FT1',type:'headphone',
    values:Object.freeze({design:'Closed-back over-ear',load:32,sensitivity:113,basis:'voltage',sensitivityConditions:'1 kHz'}),
    ratings:Object.freeze([]),
    note:'Manufacturer: 32 Ω, 113 dB/V RMS at 1 kHz (also 98 dB/mW, which is a DIFFERENT sensitivity basis). Wired wood-cup FT1, not FT1 Pro or Bluetooth variant.',
    url:'https://fiio.com/ft1',
    details:Object.freeze({transducer:'60 mm dynamic closed-back over-ear',
      frequencyResponse:'10 Hz–40 kHz (maker range; tolerance not published)',
      connector:'3.5 mm single-ended / 4.4 mm balanced cables included; do not connect balanced output without correct source compatibility',
      responseBasis:'Manufacturer full range without amplitude tolerance',
      reviewedOn:'2026-11-12',reviewStatus:'builder-only-sourced'}),
    evidence:'Builder-only manufacturer spec, sensitivity unit verified; owned-headphone entry is not a recommendation to buy'
  })
]);
export function builderOnlyHeadphoneFor(model) {
  return BUILDER_ONLY_HEADPHONES.find(x=>x.model===model)||null;
}
