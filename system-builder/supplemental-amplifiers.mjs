/**
 * Builder-only budget integrated amplifiers. The absence of `ratings` is
 * deliberate: advertised maximum output and naked THD percentages lack
 * matching two-channel sustained test conditions. Do NOT synthesize RMS.
 */
export const BUILDER_ONLY_AMPS=Object.freeze([
  Object.freeze({
    model:'Fosi Audio BT20A Pro',type:'amp',
    values:Object.freeze({}),
    ratings:Object.freeze([]),
    url:'https://fosiaudio.com/products/bt20a-pro-2-channel-bluetooth-power-amplifier',
    note:'The EXACT BT20A Pro, not BT20A or BT20A MAX. Maker lists Bluetooth, RCA and 3.5 mm PRE OUT with 32V/5A power supply. Advertised 300W×2 at 4Ω is unspecified maximum, NOT established sustained clean two-channel output with the included adapter. 0.005% THD has no matching load/rated-output conditions.',
    details:Object.freeze({inputs:'RCA analogue / Bluetooth SBC AAC',supply:'32 V / 5 A included, 48 V upgrade optional',
      speakerConnection:'Manufacturer markets 2–8 Ω compatible; independent reactive-load verification still needed',
      outputPowerVerified:false,thdComparable:false,
      caOrdinaryAsking:189.99,
      caEvidence:['https://soulfi-audio.ca/product/fosi-audio-bt20a-pro-bluetooth-amplifier/',
       'https://www.electronicsforless.ca/amplifiers-amp-receivers-13/fosi-audio-bt20a-pro-bluetooth-stereo-power-amplifier-15470.html',
       'https://acoustic-tech.com/brand/fosi/'],
      reviewedOn:'2026-11-13'})
  }),
  Object.freeze({
    model:'Fosi Audio V3 Stereo',type:'amp',
    values:Object.freeze({}),ratings:Object.freeze([]),
    url:'https://fosiaudio.com/pages/2-channel-amplifier-v3',
    note:'Stereo Fosi V3, NOT the separate V3 Mono. RCA input, speaker outputs and pre-out. Confirm 32V/5A or 48V/5A bundled supply. Maker 300W×2/4Ω maximum is not continuous full-band two-channel output; standalone 0.003% THD does not give compatible measurement conditions. Needs preamp or volume-controlled source.',
    details:Object.freeze({inputs:'RCA analogue only',supply:'32 V / 5 A or 48 V / 5 A; confirm exact retail bundle',
      outputPowerVerified:false,thdComparable:false,caOrdinaryAsking:null,reviewedOn:'2026-11-13'})
  }),
  Object.freeze({
    model:'AIYIMA A07 MAX Stereo',type:'amp',
    values:Object.freeze({}),ratings:Object.freeze([]),
    url:'https://www.aiyima.com/products/aiyima-a07-max',
    note:'AIYIMA A07 MAX in STEREO switch position, not bridged mono. Choose an included regional AC adapter before buying: maker 300W×2/4Ω assumes a 48V/12A source, not an ordinary smaller supply. No verified comparable full-band clean sustained output or nominal speaker-load permission is imported. RCA analogue source required.',
    details:Object.freeze({inputs:'RCA analogue only',supply:'24–48 V DC; sold with different optional adapter packages',
      outputPowerVerified:false,thdComparable:false,caOrdinaryAsking:null,reviewedOn:'2026-11-13'})
  })
]);
export function builderOnlyAmpFor(model){return BUILDER_ONLY_AMPS.find(x=>x.model===model)||null;}
