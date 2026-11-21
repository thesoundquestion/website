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
    continuous:{db:94,atMeters:1,reference:'Manufacturer max continuous SPL (full-band pink noise, C-weighted); 1 m scaling reference is an assumption, not an explicitly stated distance beside the SPL rating'},
    peak:{db:108,atMeters:1,reference:'Manufacturer maximum peak SPL; 1 m distance reference assumed for illustrative scaling'},
    caveat:'At maximum output JBL permits substantial distortion/limiter activity (manufacturer criterion under 10% THD). This is a maximum-output boundary, not guaranteed clean musical headroom.',
    source:'https://jblpro.com/en-US/products/305p-mkii.html'
  },
  'Kali LP-6 V2':{
    model:'Kali LP-6 V2',unit:'single powered studio monitor (2nd Wave)',
    continuous:{db:85,atMeters:2.5,reference:'Kali reference capability: 85 dB continuous with 20 dB headroom inside its recommended maximum listening distance (2.5 m for LP-6 V2)'},
    peak:{db:115,atMeters:1,reference:'Kali max peak SPL at 1 m (published specification)'},
    peakBenchmark:{db:105,atMeters:2.5,reference:'85 dB continuous and 20 dB dynamic headroom at the manufacturer recommended 2.5 m maximum listening distance'},
    caveat:'The peak and long-term listening-distance figures use different test definitions. They are not directly comparable measurements of distortion-limited clean SPL at every frequency.',
    source:'https://www.kaliaudio.com/lone-pine-studio-monitors'
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
    const loss=metric?distanceLossDb(distanceFt,metric.atMeters):null;
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
