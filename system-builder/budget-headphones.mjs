/**
 * Builder-only low-cost wired listening identities.
 * No sound-score, no inferred smartphone output capability.
 */
export const ADDITIONAL_BUDGET_HEADPHONES=Object.freeze([
  Object.freeze({
    model:'Koss KSC75',type:'headphone',ratings:Object.freeze([]),
    values:Object.freeze({design:'Open ear-clip',load:60,sensitivity:101,basis:'power'}),
    note:'Original wired KSC75; Koss specifies 60 Ω and 101 dB SPL per mW. Open clip does not isolate external noise; placement and ear shape affect bass. Standard 3.5 mm jack, confirm headphone drive.',
    url:'https://koss.com/en-ca/products/ksc75',
    details:Object.freeze({priceCAReference:36,priceType:'one_manufacturer_asking_not_market_average',
      sensitivityBasis:'dB SPL at 1 mW',reviewedOn:'2026-11-13'})
  }),
  Object.freeze({
    model:'Koss Porta Pro (wired)',type:'headphone',ratings:Object.freeze([]),
    values:Object.freeze({design:'Open on-ear',load:60,sensitivity:101,basis:'power'}),
    note:'Original analog 3.5 mm wired Porta Pro, distinct from Wireless, Utility, and headset variants. Koss states 60 Ω and 101 dB SPL/mW. Folding headset leaks sound, may tug hair and bass/fit varies.',
    url:'https://koss.com/en-ca/products/porta-pro',
    details:Object.freeze({priceCAReference:71,priceType:'one_manufacturer_asking_not_market_average',
      sensitivityBasis:'dB SPL at 1 mW',reviewedOn:'2026-11-13'})
  })
]);
