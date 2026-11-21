/**
 * Maximum-output evidence and an intentionally conservative distance model
 * for powered loudspeakers. Manufacturer values are acoustic SPL limits, not
 * amplifier wattage. These ARE NOT clean-SPL measurements at the user's seat.
 *
 * Never convert electrical amplifier wattage into acoustic max output without
 * a verified sensitivity/reference and applicable limiter information.
 * One-speaker projection: no +3/+6 dB stereo bonus, no room gain, no claimed
 * nearfield increase for distances below 1 m.
 */
export const POWERED_OUTPUT_EVIDENCE=Object.freeze({
  'JBL 305P MkII':{
    model:'JBL 305P MkII',unit:'single powered monitor',
    publishedLimits:{continuousDb:94,peakDb:108,
      measurement:'Full-bandwidth pink noise, C-weighted (continuous); C-weighted peak. The JBL sell sheet does not specify a microphone distance for these two maximum output limits.'},
    caveat:'JBL publishes 94 dB maximum continuous and 108 dB maximum peak acoustic output, but does not attach a measurement distance to those limits in the official sell sheet. They cannot support a listener-distance headroom projection. At maximum output JBL allows substantial distortion/limiter activity (under 10% THD).',
    source:'https://jblpro.com/en/site_elements/305p-mkii-sell-sheet',
    practical:{quiet:'Nearfield listening may be practical, but a distance-referenced clean SPL limit is not verified.',
      normal:'Moderate playback is plausible in a suitable nearfield setup; exact clean peak headroom is unknown.',
      loud:'A clean high-volume ceiling at your seat is unverified from these published maximum-output figures.',
      far:'JBL’s maximum SPL specification lacks an explicit distance reference, so far-seat output cannot be projected.',
      evidence:'The JBL 305P MkII manufacturer sell sheet lists 94 dB continuous and 108 dB peak (C-weighted), along with a maximum-output distortion criterion. Neither maximum is accompanied by a measurement distance in that sheet.',
      reviewUrl:'https://jblpro.com/en/site_elements/305p-mkii-sell-sheet'}
  },
  'Kali LP-6 V2':{
    model:'Kali LP-6 V2',unit:'single powered studio monitor (2nd Wave)',
    continuous:{db:85,atMeters:2.5,reference:'Kali reference capability: 85 dB continuous with 20 dB headroom inside its recommended maximum listening distance (2.5 m for LP-6 V2)'},
    peak:{db:115,atMeters:1,reference:'Kali max peak SPL at 1 m (published specification)'},
    peakBenchmark:{db:105,atMeters:2.5,reference:'85 dB continuous and 20 dB dynamic headroom at the manufacturer recommended 2.5 m maximum listening distance'},
    caveat:'The peak and long-term listening-distance figures use different test definitions. They are not directly comparable measurements of distortion-limited clean SPL at every frequency.',
    source:'https://www.kaliaudio.com/lone-pine-studio-monitors'
  },
  'Edifier R1280T':{
    model:'Edifier R1280T',unit:'powered stereo pair',
    source:'https://ca.edifier.com/products/r1280t',
    caveat:'Published electrical amplifier power and cabinet size do not establish a clean maximum SPL at the requested listening position.',
    practical:{quiet:"Quiet desktop playback is plausible; limited deep bass remains.",normal:"Normal listening is plausible, but louder bass passages may strain the pair.",loud:"Sustained loud playback is not supported by a verified clean output limit.",
      far:"A desk-oriented powered pair; adequacy at this distance is uncertain.",evidence:"SoundGuys reviews the exact R1280T and discusses response, controls and high-output limitations. No comparable distortion-limited maximum acoustic SPL is supplied.",reviewUrl:'https://www.soundguys.com/edifier-r1280t-review-127991/'}
  },
  'Edifier R1280DB':{
    model:'Edifier R1280DB',unit:'powered stereo pair',
    source:'https://ca.edifier.com/products/r1280db',
    caveat:'Published electrical amplifier power and cabinet size do not establish a clean maximum SPL at the requested listening position.',
    practical:{quiet:"Quiet playback is plausible with modest bass expectations.",normal:"Everyday small-room playback is plausible, but bass-heavy peaks are not verified.",loud:"Loud or bass-heavy listening lacks a verified clean-output limit.",
      far:"The output available for this longer listening distance is not verified.",evidence:"An exact-model independent listening review describes the R1280DB presentation. It does not establish a standardized clean maximum SPL.",reviewUrl:'https://theheadphonelist.com/edifier-r1280db-review-easygoing/'}
  },
  'Edifier R1280DBs':{
    model:'Edifier R1280DBs',unit:'powered stereo pair',
    source:'https://ca.edifier.com/products/r1280dbs',
    caveat:'Published electrical amplifier power and cabinet size do not establish a clean maximum SPL at the requested listening position.',
    practical:{quiet:"Quiet playback is plausible; deep bass is not guaranteed.",normal:"Normal room listening may work, but bass output and dynamic peaks remain uncertain.",loud:"Loud dynamic playback lacks a measured clean acoustic ceiling.",
      far:"A small powered pair; practical output at this distance is uncertain.",evidence:"TechRadar reviews the exact R1280DBs. It includes an optional subwoofer output, but that does not certify higher clean output without verified crossover behavior.",reviewUrl:'https://www.techradar.com/reviews/edifier-r1280dbs'}
  },
  'Edifier R1700BTs':{
    model:'Edifier R1700BTs',unit:'powered stereo pair',
    source:'https://ca.edifier.com/products/r1700bts',
    caveat:'Published electrical amplifier power and cabinet size do not establish a clean maximum SPL at the requested listening position.',
    practical:{quiet:"Quiet music should be feasible, with bass depending on placement.",normal:"Ordinary room listening may work; bass-heavy material can expose limits.",loud:"High-level playback cannot be confirmed clean from amplifier wattage.",
      far:"The independent reviewer describes weaker bass authority in larger listening spaces.",evidence:"An independent R1700BTs review covers desktop and larger-room use. Its sound descriptions do not quantify a clean maximum SPL.",reviewUrl:'https://www.ecoustics.com/reviews/edifier-r1700bts/'}
  },
  'Edifier MR3':{
    model:'Edifier MR3',unit:'powered stereo pair',
    source:'https://ca.edifier.com/products/mr3',
    caveat:'Published electrical amplifier power and cabinet size do not establish a clean maximum SPL at the requested listening position.',
    practical:{quiet:"Quiet nearfield listening is plausible; low bass remains limited.",normal:"Moderate playback may work; bass demands and limiters deserve caution.",loud:"High musical peaks are not verified clean at the listening position.",
      far:"This close-listening model has uncertain usable output at longer distances.",evidence:"Erin’s Audio Corner independently measured the MR3. The manufacturer quotes a maximum SPL figure without a comparable clean-output test basis; it is not used as a headroom margin.",reviewUrl:'https://www.erinsaudiocorner.com/loudspeakers/edifier_mr3/'}
  },
  'Edifier M60':{
    model:'Edifier M60',unit:'powered stereo pair',
    source:'https://ca.edifier.com/products/m60',
    caveat:'Published electrical amplifier power and cabinet size do not establish a clean maximum SPL at the requested listening position.',
    practical:{quiet:"Quiet desktop listening is plausible, with limited deep bass.",normal:"Moderate listening may be suitable nearfield, but bass headroom is uncertain.",loud:"Loud, bass-rich playback is not established as clean.",
      far:"The small desktop system has no verified clean output at this distance.",evidence:"Erin’s Audio Corner publishes independent tests of the exact M60. These do not establish a transferable clean peak SPL for the requested seat.",reviewUrl:'https://www.erinsaudiocorner.com/loudspeakers/edifier_m60/'}
  },
  'Kanto ORA':{
    model:'Kanto ORA',unit:'original powered stereo pair',
    electricalWatts:50,
    caveat:'Kanto publishes 50 W total RMS electrical amplification, but not a comparable max acoustic SPL and test reference. No defensible numeric peak headroom can be inferred from watts alone.',
    source:'https://kantoaudio.com/en-ca/products/ora',
    practical:{
      quiet:'Quiet playback is plausible; low-bass output is still limited.',
      normal:'Normal playback may work, but bass-heavy musical peaks remain an unknown.',
      loud:'Loud or bass-heavy playback is not supported by a verified clean-output limit.',
      far:'Designed for desktop listening; output adequacy at this distance is uncertain.',
      evidence:'An independent desktop listening review reported good control even at its tested maximum volume, but did not publish a repeatable distortion-limited SPL ceiling. The original ORA can high-pass itself at 100 Hz when connected to a compatible subwoofer; this does not verify a new maximum SPL.',
      reviewUrl:'https://www.soundstagesimplifi.com/index.php/equipment-reviews/250-kanto-audio-ora-reference-active-speaker-system'
    }
  },
  'Edifier MR4':{
    model:'Edifier MR4',unit:'powered stereo pair',
    caveat:'No verified max acoustic SPL with compatible measurement conditions is admitted to this model; internal amplifier power does not establish a clean acoustic ceiling.',
    source:'https://ca.edifier.com/products/mr4',
    practical:{
      quiet:'Quiet playback is plausible; bass-heavy peaks deserve caution.',
      normal:'Moderate playback may work, but compression and bass distortion need attention.',
      loud:'Loud, dynamic playback cannot be recommended from the available output tests.',
      far:'Primarily a close-listening speaker; headroom at this distance is uncertain.',
      evidence:'Erin’s Audio Corner tested MR4 distortion at 86 and 96 dB at 1 m and ran stepped compression sweeps. Those test inputs are not a certified clean maximum SPL or a guarantee for bass-heavy music.',
      reviewUrl:'https://www.erinsaudiocorner.com/loudspeakers/edifier_mr4/'
    }
  }
});
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const round=x=>Math.round(x*10)/10;
export const distanceLossDb=(feet,referenceMeters=1)=>{
  const metres=feet*0.3048;
  if(!finite(feet)||feet<=0||!finite(referenceMeters)||referenceMeters<=0)return null;
  // No optimistic extra output credit for closer-than-reference placement.
  return round(20*Math.log10(Math.max(1,metres/referenceMeters)));
};

// Contextual guidance is deliberately NOT a numeric SPL result or pass/fail.
// Do not extrapolate a reviewer's test stimulus or subjective listening volume
// into a clean acoustic ceiling. The language changes with the requested seat
// distance and target, and never substitutes amplifier watts for SPL.
export function poweredPracticalGuidance(model,{distanceFt=6,averageDb=65,peakDb=80}={}){
  const guidance=POWERED_OUTPUT_EVIDENCE[model]?.practical;
  if(!guidance||!finite(distanceFt)||distanceFt<0.5||distanceFt>300||
     !finite(averageDb)||!finite(peakDb)||peakDb<averageDb)return null;
  const close=distanceFt<=6;
  const quiet=averageDb<=70&&peakDb<=85;
  const normal=averageDb<=80&&peakDb<=95;
  const message=!close?guidance.far:quiet?guidance.quiet:
    normal?guidance.normal:guidance.loud;
  return {status:'indicative',summary:message,
    evidence:guidance.evidence,reviewUrl:guidance.reviewUrl};
}

export function poweredHeadroomEstimate(model,{distanceFt=6,averageDb=65,peakDb=80}={}){
  const evidence=POWERED_OUTPUT_EVIDENCE[model]||null;
  const validInputs=finite(distanceFt)&&distanceFt>=0.5&&distanceFt<=300&&
    finite(averageDb)&&averageDb>=40&&averageDb<=115&&
    finite(peakDb)&&peakDb>=averageDb&&peakDb<=140;
  if(!validInputs)return {status:'invalid',model,source:evidence?.source||null};
  const result={model,unit:evidence?.unit||'powered speaker',status:'unverified',
    distanceFt,averageDb,peakDb,source:evidence?.source||null,caveat:evidence?.caveat||
      'A verified maximum acoustic output measurement at a known distance is required; amplifier watts alone are insufficient.',
    projectedContinuousDb:null,projectedPeakDb:null,averageMarginDb:null,peakMarginDb:null,
    practical:poweredPracticalGuidance(model,{distanceFt,averageDb,peakDb}),
    evidence};
  if(!evidence)return result;
  const projected=(metric)=>{
    // Never invent a 1 m test point to turn a distance-unspecified maximum
    // acoustic-output number into headroom at the listener's seat.
    const loss=metric&&finite(metric.db)&&finite(metric.atMeters)&&metric.atMeters>0
      ?distanceLossDb(distanceFt,metric.atMeters):null;
    return loss===null?null:round(metric.db-loss);
  };
  result.projectedContinuousDb=projected(evidence.continuous);
  result.projectedPeakDb=projected(evidence.peak);
  // Prefer the less optimistic of two incompatible manufacturer output
  // references rather than adding them or assuming the 115 dB peak is clean.
  const bench=projected(evidence.peakBenchmark);
  if(bench!==null)
    result.projectedPeakDb=result.projectedPeakDb===null?bench:
      Math.min(result.projectedPeakDb,bench);
  result.averageMarginDb=result.projectedContinuousDb===null?null:
    round(result.projectedContinuousDb-averageDb);
  result.peakMarginDb=result.projectedPeakDb===null?null:
    round(result.projectedPeakDb-peakDb);
  result.status=result.projectedContinuousDb!==null&&result.projectedPeakDb!==null?
    'projected':result.projectedPeakDb!==null||result.projectedContinuousDb!==null?
      'partial':'unverified';
  return result;
}
export function poweredHeadroomLink(model,{distanceFt=6,averageDb=65,peakDb=80}={}){
  const params=new URLSearchParams({powered:'1',model:String(model||''),
    distanceFt:String(distanceFt),average:String(averageDb),
    gap:String(peakDb-averageDb)});
  return '/system-check/?'+params.toString();
}
