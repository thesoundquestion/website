/**
 * System Builder / amplifier evidence policy, 2026-11-12.
 *
 * Qualitative ordering of curated amplifier leads, NOT an SPL predictor.
 * Do not confuse recommended amplifier watts with speaker power handling.
 * Never infer sound quality from brand, topology, a THD number, or wattage.
 * Actual output at listening distance belongs to System Check.
 */
export const AMP_LISTENING_REPORTS = Object.freeze({
  'Yamaha A-S301': {
    text:'A 2019 listening review describes a full-bodied, balanced presentation and pleasant vocal warmth, but less rhythmic urgency than its reviewer preferred.',
    tier:'One model-specific listening review, subjective; not a Yamaha-wide signature.',
    sources:[{label:'What Hi-Fi? A-S301 review (2019)',url:'https://www.whathifi.com/reviews/yamaha-a-s301'}]
  },
  'Yamaha A-S501': {
    text:'A 2014 listening review describes spacious, weighty sound, while reporting reduced composure on complex material compared with some rivals.',
    tier:'One model-specific listening review; impressions depend on speakers, room and levels.',
    sources:[{label:'What Hi-Fi? A-S501 review (2014)',url:'https://www.whathifi.com/yamaha/s501/review'}]
  },
  'Cambridge Audio CXA61': {
    text:'A 2022 listening review describes an open, detailed, energetic presentation, with punchy dynamics and clear stereo placement.',
    tier:'One model-specific listening review, not proof of an inherent Cambridge brand sound.',
    sources:[{label:'What Hi-Fi? CXA61 review (2022)',url:'https://www.whathifi.com/reviews/cambridge-audio-cxa61'}]
  },
  'WiiM Amp': {
    text:'Independent laboratory testing documents an output-filter response that varies with speaker load; the same amp may behave differently with different loudspeakers.',
    tier:'Independent lab finding, not a subjective brand sound or claim about the newer WiiM Amp Pro.',
    sources:[{label:'Hi-Fi News WiiM Amp system matching',url:'https://www.hifinews.com/content/wiim-amp-system-matching'},
      {label:'Hi-Fi News WiiM Amp lab report',url:'https://www.hifinews.com/content/wiim-amp-lab-report'}]
  },
  'Sony STR-DH190': {
    text:'No reliable repeated listening-character evidence is included for this exact receiver; its documented power, load requirements and inputs drive its selection.',
    tier:'Specifications only; no inferred Sony house sound.',
    sources:[{label:'Sony STR-DH190 documentation',url:'https://research.encompass.com/SON/rr/STRDH190.pdf'}]
  }
});
// Manufacturer nominal-impedance permissions for ONE speaker pair.
// Do not extrapolate permission from a resistive amplifier bench test.
// Missing manufacturer data is unknown, not proof of a conflict.
const KNOWN_NOMINAL_LOADS=Object.freeze({
  'Yamaha A-S301':{min:4,high:6,source:'https://fr.yamaha.com/files/download/other_assets/0/332210/web_VEX7920_A-S701_A-S501_A-S301_om_G_EnFrDeSvItEsNlRu_A0.pdf'},
  'Yamaha A-S501':{min:4,high:6,source:'https://fr.yamaha.com/files/download/other_assets/0/332210/web_VEX7920_A-S701_A-S501_A-S301_om_G_EnFrDeSvItEsNlRu_A0.pdf'},
  'Sony STR-DH190':{min:6,max:16,source:'https://www.sony.ca/en/electronics/support/audio-components-receivers-amplifiers/str-dh190/specifications'}
});
export function manufacturerNominalPairing(model,nominal){
  const rule=KNOWN_NOMINAL_LOADS[model];
  if(!rule||!Number.isFinite(nominal))return null;
  const supported=nominal>=rule.min&&(!rule.max||nominal<=rule.max);
  return {supported,nominal,model,source:rule.source,
    setting:rule.high?(nominal>=rule.high?'HIGH':'LOW'):(nominal>=8?'8 OHM':'6 OHM'),
    statement:supported
      ?nominal+' Ω nominal is within the manufacturer’s published one-pair speaker range.'
      :nominal+' Ω nominal conflicts with the manufacturer’s one-pair speaker rating.'};
}
const atLeast=(x)=>Number.isFinite(x)&&x>0;
const bandFull=note=>/20\s*Hz\s*[-–—]\s*20\s*kHz/i.test(String(note||''));
const distortion=note=>{
  const text=String(note||'');
  const match=text.match(/(?:<|≤|below|no\s+more\s+than)?\s*(\d+(?:\.\d+)?)\s*%\s*THD/i);
  return match ? Number(match[1]) : null;
};

/** Distinguishes a factory nominal handling rating, an ambiguous maximum
 * input rating, a peak rating, and a recommended amplifier range.
 * The latter two must not become a continuous-speaker-power target. */
export function speakerPowerReference(speaker) {
  const v=speaker?.record?.values || {};
  const basis=atLeast(v.speakerPowerNominal) ? 'nominal' :
    atLeast(v.speakerPowerMaxInput) ? 'max_input' : 'unknown';
  const watts=basis==='nominal' ? v.speakerPowerNominal :
    basis==='max_input' ? v.speakerPowerMaxInput : null;
  const label=basis==='nominal' ? 'published nominal handling' :
    basis==='max_input' ? 'published maximum input (rating method unclear)' : 'no verified continuous/nominal power-handling figure';
  // Owned-speaker forms use a different field schema from the compiled catalog.
  // Carry user-entered guidance through the exact same evidence policy.
  const recommendedMin=atLeast(v.recommendedAmpMinW)?v.recommendedAmpMinW:
    atLeast(v.speakerRecommendedAmpMin)?v.speakerRecommendedAmpMin:null;
  const recommendedMax=atLeast(v.recommendedAmpMaxW)?v.recommendedAmpMaxW:
    atLeast(v.speakerRecommendedAmpMax)?v.speakerRecommendedAmpMax:null;
  const listedMaxInput=atLeast(v.listedMaxInputW)?v.listedMaxInputW:null;
  const peak=atLeast(v.speakerPowerPeak)?v.speakerPowerPeak:null;
  return {watts,basis,label,peak,recommendedMin,recommendedMax,listedMaxInput,
    source:typeof v.speakerPowerSource==='string'?v.speakerPowerSource:null,
    note:typeof v.speakerPowerNote==='string'?v.speakerPowerNote:null};
}
/** Only use continuous amp power at the speaker's published nominal load to
 * compare against handling. An 8-ohm watt figure is never translated into 6-ohm watts. */
export function ampRatingAtSpeakerLoad(amp,speaker) {
  const nominal=speaker?.record?.values?.load;
  const ratings=amp?.ratings||amp?.record?.ratings||[];
  const records=ratings.filter(r=>Array.isArray(r)&&r[2]==='continuous'&&
    atLeast(r[0])&&atLeast(r[1]));
  const exact=atLeast(nominal)?records.find(r=>r[1]===nominal):null;
  const display=exact||records[0]||null;
  const note=String(exact?.[3]||'');
  const thd=exact?distortion(note):null;
  const full=!!exact&&bandFull(note);
  return {watts:exact?.[0]??null,ohms:exact?.[1]??null,exact:!!exact,
    thd,fullBand:full,distortionEvidence:full&&thd!==null&&thd<=0.1?
      (thd<=0.05?'strong':'documented') : full&&thd!==null?'less_stringent':
      exact&&thd!==null?'limited':'unknown',
    displayWatts:display?.[0]??null,displayOhms:display?.[1]??null,
    note:exact?.[3]||null};
}
/**
 * Sorting policy: comparable input, exact-load full-band distortion evidence,
 * and an amplifier-power neighborhood where the speaker has a real handling
 * rating. A better published THD ceiling gets a small documentation advantage,
 * not a promised audible-quality advantage. No review/brand score.
 */
export function assessAmplifierCandidate({idea,record,speaker,request={}}) {
  const amp=ampRatingAtSpeakerLoad(record,speaker);
  const sp=speakerPowerReference(speaker);
  const required=String(request.connection||'undecided');
  const direct=required!=='undecided'&&Array.isArray(idea.inputs)&&idea.inputs.includes(required);
  const ratio=amp.exact&&atLeast(sp.watts)?amp.watts/sp.watts:null;
  let powerBand='unknown',powerPoints=0;
  if(ratio!==null) {
    if(ratio>=0.7&&ratio<=1.5){powerBand='in_range';powerPoints=3;}
    else if(ratio>1.5){powerBand='larger_reserve';powerPoints=2;}
    else if(ratio>=0.4){powerBand='lower_reserve';powerPoints=1;}
    else {powerBand='small_relative_to_rating';powerPoints=0;}
  }
  // Less confidence in an ambiguous speaker max-input rating.
  if(sp.basis==='max_input')powerPoints=Math.max(0,powerPoints-1);
  // Use facts that can be compared at this speaker's nominal load.
  // THD percentages and speaker max-input marketing figures never rank sound.
  const sameLoadBurst=(record?.ratings||[]).find(r=>Array.isArray(r)&&
    r[2]==='burst'&&r[1]===speaker?.record?.values?.load&&atLeast(r[0]));
  const documentedBurst=sameLoadBurst?.[0]??null;
  const sortValue=(direct?4:0)+(amp.exact?3:0)+(amp.fullBand?1:0)+
    (documentedBurst!==null?1:0);
  const powerNote=ratio===null ?
    'A speaker power-handling comparison is unavailable at the same nominal load; no wattage target is invented.' :
    sp.basis==='max_input' ?
      'At the speaker’s nominal load, '+amp.watts+' W is '+Math.round(ratio*100)+'% of its '+sp.watts+
      ' W published maximum-input figure. That speaker rating is not a continuous-use or safety threshold.' :
      'At the speaker’s nominal load, '+amp.watts+' W is '+Math.round(ratio*100)+'% of its '+
      sp.watts+' W published nominal handling figure. Musical peaks and actual volume still determine safety.';
  const headroomNote=powerBand==='in_range'?
      'Published amp power is in a broad useful neighborhood of that handling figure; this does not establish extra clean peak capacity at your seat.' :
    powerBand==='larger_reserve'?
      'The amplifier has more rated power than the cited speaker handling figure. That can provide reserve if used responsibly, but full output could overdrive the speaker.' :
    powerBand==='lower_reserve'||powerBand==='small_relative_to_rating'?
      'Less power than the handling figure is not automatically poor. Check your desired listening level and peaks before assuming an upgrade is needed.' :
      'No meaningful rated-power match can be scored from the available figures.';
  const distortionNote=amp.distortionEvidence==='strong'||amp.distortionEvidence==='documented'?
    'Full-band published rating at '+amp.watts+' W / '+amp.ohms+' Ω specifies '+amp.thd+
    '% THD. This gives stronger documentation for clean rated output, not proof of an audible difference from another amp.' :
    amp.distortionEvidence==='less_stringent'?
    'Full-band distortion limit is '+amp.thd+'% at the stated load, so the specified ceiling is less strict.' :
    amp.distortionEvidence==='limited'?
    'Published THD is '+amp.thd+'% but the rating does not document a comparable full 20 Hz–20 kHz test.' :
    'No directly comparable full-band THD ceiling is documented for this rating; unknown is not poor sound.';
  const ownerNote=sp.recommendedMax!==null ?
    'Speaker maker’s amplifier recommendation: '+
      (sp.recommendedMin!==null?sp.recommendedMin+'–':'up to ')+sp.recommendedMax+
      ' W (guidance, NOT a speaker power-handling limit or a continuous-use limit).'+
      (sp.listedMaxInput!==null?' Separately listed maximum input: '+sp.listedMaxInput+
        ' W, with rating conditions unspecified.':'') : null;
  const peakNote=sp.peak!==null ?
    'Speaker published peak figure: '+sp.peak+' W. It is not compared against continuous amplifier output.' : null;
  const context=AMP_LISTENING_REPORTS[idea.model]||null;
  return {amp,speaker:sp,sortValue,documentedBurst,powerBand,powerNote,headroomNote,distortionNote,
    ownerNote,peakNote,context,directInput:direct,ratio};
}
