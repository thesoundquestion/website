/**
 * Powered acoustic evidence must be model specific, not derived from
 * LF/HF electrical amplifier power or nominal woofer diameter.
 */
export const POWERED_ACOUSTIC_RECORDS=Object.freeze({
 'JBL 305P MkII':Object.freeze({
  model:'JBL 305P MkII',maxPeakDb:108,maxContinuousDb:94,
  referenceMeters:1,units:1,evidenceType:'manufacturer',
  conditions:'Manufacturer maximum peak tested with compressor/limiter and system distortion criterion below 10% THD. Not a clean full-band SPL guarantee.',
  source:'https://jblpro.com/en-US/products/305p-mkii'
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
   !Number.isFinite(evidence.maxPeakDb)||!Number.isFinite(evidence.maxContinuousDb))return null;
 const loss=20*Math.log10((distanceFt*0.3048)/evidence.referenceMeters);
 const gain=evidence.units>=2?3:0;
 const continuous=evidence.maxContinuousDb+gain-loss;
 const peak=evidence.maxPeakDb+gain-loss;
 const targetPeak=level==='high'?95:level==='quiet'?80:90;
 const targetAverage=targetPeak-15;
 const margin=Math.min(continuous-targetAverage,peak-targetPeak);
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
