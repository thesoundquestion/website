/**
 * Powered acoustic evidence must be model specific, not derived from
 * LF/HF electrical amplifier power or nominal woofer diameter.
 */
export const POWERED_ACOUSTIC_RECORDS=Object.freeze({
 'JBL 305P MkII':Object.freeze({
  model:'JBL 305P MkII',maxPeakDb:108,maxContinuousDb:94,
  referenceMeters:null,units:1,evidenceType:'manufacturer_distance_unverified',
  conditions:'Manufacturer reports 94 dB continuous and 108 dB maximum peak with limiter/compressor conditions and up to 10% distortion criterion. The cited rating lacks a verified measurement distance; do not project it numerically to the listening seat.',
  source:'https://jblpro.com/en-US/products/305p-mkii'
 }),
 'QSC K12.2':Object.freeze({
  model:'QSC K12.2',maxPeakDb:132,maxContinuousDb:126,
  referenceMeters:1,units:1,evidenceType:'manufacturer',
  conditions:'Manufacturer maximum rated SPL: 132 dB peak, 126 dB continuous at 1 m. Dynamic program, limiter and frequency conditions affect actual clean output.',
  source:'https://www.qscaudio.com/solutions-products/loudspeakers/portable/powered/portable-pa/k2-series/k122/'
 }),
 'Kali Audio LP-6 V2':Object.freeze({
  model:'Kali Audio LP-6 V2',maxPeakDb:115,
  referenceMeters:1,units:1,evidenceType:'manufacturer_peak_only',
  conditions:'Second-wave LP-6 published maximum peak at 1 m; no comparable continuous-output rating has been established. Manufacturer recommends 0.5–2.5 m listening distance.',
  source:'https://www.kaliaudio.com/lone-pine-studio-monitors'
 }),
 'Yamaha DZR15':Object.freeze({
  model:'Yamaha DZR15',maxPeakDb:139,
  referenceMeters:1,units:1,evidenceType:'manufacturer_peak_only',
  conditions:'Manufacturer maximum on-axis output at 1 m. No matching verified continuous SPL rating is entered. This does not measure audience coverage or sustained clean SPL.',
  source:'https://ca.yamaha.com/en/audio/portable-pa/products/speakers/dzr/specs.html'
 })
});
export function poweredEvidenceFor(item={}) {
 const names=[item.model,item.title,...(item.parts||[]).map(x=>x.name)].filter(Boolean);
 const matches=Object.values(POWERED_ACOUSTIC_RECORDS).filter(e=>
   names.some(name=>String(name).toLowerCase().includes(e.model.toLowerCase())&&
     !/\b(?:mkiii|mk\s*iii|third generation|3rd wave)\b/i.test(String(name))));
 if(matches.length!==1)return null;
 const r=matches[0];
 const quantity=(item.parts||[]).filter(x=>String(x.name).toLowerCase().includes(r.model.toLowerCase()))
   .reduce((n,x)=>n+(Number(x.count)||0),0);
 return {...r,units:quantity||r.units};
}
export function poweredListeningAssessment(evidence,request={}) {
 const distanceFt=Number(request.distanceFt),level=request.level||'moderate';
 if(!evidence||!Number.isFinite(distanceFt)||distanceFt<=0||
   !Number.isFinite(evidence.referenceMeters)||evidence.referenceMeters<=0||
   !Number.isFinite(evidence.maxPeakDb))return null;
 const loss=20*Math.log10((distanceFt*0.3048)/evidence.referenceMeters);
 const gain=evidence.units>=2?3:0;
 const continuous=Number.isFinite(evidence.maxContinuousDb)
   ?evidence.maxContinuousDb+gain-loss:null;
 const peak=evidence.maxPeakDb+gain-loss;
 const targetPeak=level==='high'?95:level==='quiet'?80:90;
 const targetAverage=targetPeak-15;
 const margin=continuous===null?peak-targetPeak:
   Math.min(continuous-targetAverage,peak-targetPeak);
 if(evidence.evidenceType==='user_reported')return {
  status:'reported_estimate',
  estimatedPeakDb:Number(peak.toFixed(1)),
  estimatedContinuousDb:continuous===null?null:Number(continuous.toFixed(1)),
  targetPeakDb:targetPeak,targetAverageDb:targetAverage,marginDb:null,
  text:margin>=0?'Your entered specifications suggest the selected level may be achievable at '+
    distanceFt+' ft, but this is not a verified capability result.'
    :'Your entered peak rating falls short of the selected listening target at '+distanceFt+
    ' ft. Do not rely on this combination for that level.',
  detail:'These were entered manually, not verified against manufacturer test conditions: '+
    evidence.maxPeakDb+' dB peak'+(continuous===null?' with no known continuous rating':
    ' and '+evidence.maxContinuousDb+' dB continuous')+
    ' at '+evidence.referenceMeters+' m. Distance-only estimate; no independent measured SPL, distortion, compression, room response or safe exposure is established.',
  source:null,evidenceType:'user_reported'
 };
 if(continuous===null)return {
  status:'peak_only_uncertain',
  estimatedPeakDb:Number(peak.toFixed(1)),
  estimatedContinuousDb:null,
  targetPeakDb:targetPeak,targetAverageDb:targetAverage,
  marginDb:null,
  text:margin>=5?'Published maximum peaks suggest room for brief transients at '+distanceFt+
     ' ft, but sustained clean loudness is not established.'
    :margin>=0?'Published peak output is close to the requested level at '+distanceFt+
      ' ft; not enough evidence to promise clean headroom.'
    :'Published peak output falls below the selected target at '+distanceFt+' ft.',
  detail:'Maker quotes '+evidence.maxPeakDb+' dB maximum peak at '+evidence.referenceMeters+
    ' m; geometric distance estimate is '+Math.round(peak)+' dB peak at '+distanceFt+
    ' ft. No source-qualified continuous SPL has been entered, so this cannot confirm average-level output or clean headroom. '+evidence.conditions,
  source:evidence.source,evidenceType:evidence.evidenceType
 };
 return {
  status:margin>=5?'estimated_suitable':margin>=0?'estimated_limited_reserve':'estimated_below_target',
  estimatedPeakDb:Number(peak.toFixed(1)),estimatedContinuousDb:Number(continuous.toFixed(1)),
  targetPeakDb:targetPeak,targetAverageDb:targetAverage,marginDb:Number(margin.toFixed(1)),
  text:margin>=5?'Yes. Published output supports your listening goal at '+distanceFt+' ft, with reserve.'
    :margin>=0?'Probably. Published output suggests it can manage at '+distanceFt+' ft, with limited reserve.'
    :'Not a reliable choice for this volume and distance. Consider a higher-output option.',
  detail:'Manufacturer reports '+evidence.maxContinuousDb+' dB continuous and '+
    evidence.maxPeakDb+' dB peak at '+evidence.referenceMeters+' m per cabinet. Estimated at '+
    distanceFt+' ft: '+Math.round(continuous)+' dB continuous and '+Math.round(peak)+
    ' dB peak'+(gain?' including a 3 dB stereo-pair allowance':'')+
    ', against '+targetAverage+' dB average and '+targetPeak+
    ' dB brief peaks. '+evidence.conditions+
    ' No room-gain credit is included; clean bass, frequency-dependent compression and hearing exposure are separate.',
  source:evidence.source,evidenceType:evidence.evidenceType
 };
}
