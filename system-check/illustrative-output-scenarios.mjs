/**
 * Explicitly provisional amplifier-output scenarios. Unlike rated continuous
 * power, these MUST NOT populate System Check's verified amplifier ratings,
 * qualify a recommendation as measurement-complete, or be advertised as clean
 * peak capability.
 *
 * The BT20A Pro 32 V / 5 A scenario is an approximate reading of independent
 * bench discussions; original graph's exact THD threshold, channel drive and
 * test duration were not independently transcribed/validated. 48 V variants
 * are not interchangeable. Sources are included for inspection.
 */
export const OUTPUT_SCENARIOS=Object.freeze({
  'fosi-bt20a-pro-32v5a-xt15':Object.freeze({
    id:'fosi-bt20a-pro-32v5a-xt15',
    exampleId:'passive-bt20a-xt15',
    amplifierModel:'Fosi Audio BT20A Pro',
    speakerModel:'Polk Monitor XT15',
    supply:'32 V / 5 A (included adapter)',
    wattsPerChannel:40,
    loadOhms:8,
    evidenceClass:'provisional_short_term_bench',
    title:'Illustrative output scenario, not verified continuous power',
    notes:'Around 40 W/channel into 8 Ω is reported from the independent BT20A Pro bench discussion with the 32 V supply. Exact duration, distortion threshold and simultaneous channel conditions are not yet validated. A 48 V adapter changes this scenario.',
    sources:Object.freeze([
      Object.freeze({label:'Original ASR bench review',url:'https://www.audiosciencereview.com/forum/index.php?threads/fosi-audio-bt20a-pro-amplifier-review.43751/'}),
      Object.freeze({label:'Independent article discussing 32 V vs 48 V output',url:'https://ampsandreceivers.com/compare/fosi-bt20a-vs-bt20a-pro/'}),
      Object.freeze({label:'Polk Monitor XT15 manufacturer specifications',url:'https://www.polkaudio.com/on/demandware.static/-/Library-Sites-polk_northamerica_shared/default/dw9cd07cce/downloads/monitor-xt-series-owners-manual-global.pdf'})
    ])
  })
});
const finite=x=>typeof x==='number'&&Number.isFinite(x);
export function scenarioForPair(item){
  if(!item||item.architecture!=='passive_separates')return null;
  const scenario=OUTPUT_SCENARIOS['fosi-bt20a-pro-32v5a-xt15'];
  const a=item.amplifierModel||item.curatedPairing?.amplifierModel;
  const b=item.speakerModel||item.curatedPairing?.speakerModel;
  return item.id===scenario.exampleId&&a===scenario.amplifierModel&&
    b===scenario.speakerModel?scenario:null;
}
export function estimateOutputScenario(scenario,speakerValues,{
  distanceFt=6,averageDb=65,peakDb=80}={}){
  if(!scenario||!speakerValues||!finite(distanceFt)||distanceFt<0.5||distanceFt>300||
     !finite(averageDb)||averageDb<40||!finite(peakDb)||peakDb<averageDb||peakDb>140)
    return {status:'invalid'};
  const load=speakerValues.load;
  const sensitivity=speakerValues.sensitivity;
  if(!finite(load)||load<=0||!finite(sensitivity)||
     !['voltage','power'].includes(speakerValues.basis)||
     load!==scenario.loadOhms)
    return {status:'unverified',message:'The published exact-model sensitivity reference or load is unavailable.'};
  const refWatts=speakerValues.basis==='voltage'?(2.83**2/load):1;
  const loss=20*Math.log10(Math.max(1,distanceFt*0.3048));
  const projectedDb=sensitivity+10*Math.log10(scenario.wattsPerChannel/refWatts)-loss;
  const round=x=>Math.round(x*10)/10;
  return {status:'provisional',scenarioId:scenario.id,
    projectedDb:round(projectedDb),
    peakMarginDb:round(projectedDb-peakDb),
    referenceWatts:scenario.wattsPerChannel,
    loadOhms:scenario.loadOhms,
    distanceFt,averageDb,peakDb,
    evidenceClass:scenario.evidenceClass};
}
export function scenarioSystemCheckUrl(scenario,{distanceFt=6,averageDb=65,peakDb=80}={}){
  if(!scenario)return '/system-check/';
  return '/system-check/?'+new URLSearchParams({
    scenario:scenario.id,
    amp:scenario.amplifierModel,
    speaker:scenario.speakerModel,
    distanceFt:String(distanceFt),
    average:String(averageDb),
    gap:String(peakDb-averageDb)
  }).toString();
}
