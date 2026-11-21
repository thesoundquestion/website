import {poweredHeadroomEstimate,poweredHeadroomLink} from '../system-check/powered-headroom-model.mjs';
import {scenarioForPair,estimateOutputScenario,scenarioSystemCheckUrl} from '../system-check/illustrative-output-scenarios.mjs';

/**
 * Compact card output, separate from the detailed System Check calculator.
 * Every numeric result is a simple single-speaker upper-bound projection,
 * NOT a clean-SPL measurement, speaker damage limit or safety certificate.
 */
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const rounded=v=>Math.round(v);
const targetFor=level=>({
  quiet:{averageDb:65,peakDb:80},
  moderate:{averageDb:80,peakDb:95},
  high:{averageDb:85,peakDb:105}
})[level]||{averageDb:80,peakDb:95};
const rawProfile=(entry,kind)=>{
  const profiles=(entry?.profiles||[]).filter(p=>p.category===kind);
  return profiles.find(p=>p.from==='system-check/gear.js')||
    profiles.find(p=>p.from==='system-builder/supplemental-*.mjs')||
    profiles.find(p=>p.values)||null;
};
const findRecord=(catalog,model,kind)=>
  catalog?.records?.find(r=>r.model===model&&r.categories?.includes(kind))||null;
export function recommendationHeadroom(item={},request={},catalog=null){
  const distanceFt=finite(request.distanceFt)&&request.distanceFt>0?request.distanceFt:8;
  const {averageDb,peakDb}=targetFor(request.level);
  const target={distanceFt,averageDb,peakDb};
  const model=item.poweredHeadroomModel;
  if(model){
    const estimate=poweredHeadroomEstimate(model,target);
    const isKnown=estimate.status==='projected'||estimate.status==='partial';
    const peak=estimate.peakMarginDb;
    const continuous=estimate.averageMarginDb;
    const summary=isKnown
      ?'Published output margin (clean SPL not verified): '+
        (peak!==null?(peak>=0?'+':'')+rounded(peak)+' dB peak':
          'peak unknown')+
        (continuous!==null?' · '+(continuous>=0?'+':'')+
          rounded(continuous)+' dB continuous':' · sustained output unknown')
      :'Numeric headroom not verified: no comparable maximum acoustic SPL rating';
    return {
      kind:'powered',status:estimate.status,summary,source:estimate.source,
      detail:estimate.caveat,metrics:estimate,target,
      link:poweredHeadroomLink(model,target),
      linkText:'Check powered-speaker headroom',
      basis:isKnown?'Projected from manufacturer acoustic SPL limit(s) to '+distanceFt+
        ' ft (single speaker, simplified free-field distance loss; no stereo or room gain).':
        'Amplifier watts alone cannot establish maximum acoustic output.'
    };
  }
  if(item.architecture==='passive_separates'){
    const ampName=item.amplifierModel||item.curatedPairing?.amplifierModel;
    const speakerName=item.speakerModel||item.curatedPairing?.speakerModel;
    const params=new URLSearchParams({distanceFt:String(distanceFt),
      average:String(averageDb),gap:String(peakDb-averageDb),autocheck:'1',
      preferRoom:['outdoors','party'].includes(request.useCase)?'0':'1'});
    if(ampName)params.set('amp',ampName);
    if(speakerName)params.set('speaker',speakerName);
    const url='/system-check/?'+params.toString();
    const amp=rawProfile(findRecord(catalog,ampName,'amp'),'amp');
    const speaker=rawProfile(findRecord(catalog,speakerName,'speaker'),'speaker');
    const values=speaker?.values||{};
    const power=(amp?.ratings||[]).find(r=>Array.isArray(r)&&r[2]==='continuous'&&
      finite(r[0])&&r[0]>0&&finite(r[1])&&r[1]===values.load);
    const rated=power?.[0];
    if(!finite(values.sensitivity)||!['voltage','power'].includes(values.basis)||
       !finite(values.load)||!rated){
      // A separate measured-output *scenario* may exist even when a comparable
      // continuous amplifier rating does not. Never promote it into the
      // verified catalog, ranking completeness, or the continuous calculator.
      const scenario=scenarioForPair(item);
      if(scenario){
        const estimate=estimateOutputScenario(scenario,values,target);
        if(estimate.status==='provisional'){
          const margin=estimate.peakMarginDb;
          return {kind:'passive',status:'provisional',target,
            summary:'Illustrative peak margin: '+(margin>=0?'+':'')+
              Math.round(margin)+' dB (32 V adapter; not verified clean)',
            detail:scenario.notes+' The estimate assumes one loudspeaker, '+
              'free-field distance loss and no stereo or room reinforcement. '+
              'The listed watts are NOT a verified continuous-power test or a guaranteed unclipped output.',
            basis:scenario.title+' · '+scenario.wattsPerChannel+
              ' W/channel at '+scenario.loadOhms+' Ω · '+scenario.supply,
            source:scenario.sources[0]?.url||null,
            metrics:estimate,
            link:scenarioSystemCheckUrl(scenario,target),
            linkText:'Inspect this provisional estimate in System Check'};
        }
      }
      return {kind:'passive',status:'unverified',
        summary:'Headroom not numerically verified from saved ratings',
        detail:'A matching continuous amplifier rating and a referenced speaker sensitivity are required. No other-load wattage or speaker sensitivity is guessed.',
        link:url,linkText:'Open prefilled System Check',target};
    }
    const wattsAtReference=values.basis==='voltage'?2.83**2/values.load:1;
    // Single loudspeaker, do not add 3/6 dB for two speakers or room gain.
    const seatLoss=20*Math.log10(Math.max(1,distanceFt*0.3048));
    const projected=values.sensitivity+10*Math.log10(rated/wattsAtReference)-seatLoss;
    const peakMargin=projected-peakDb;
    return {
      kind:'passive',status:'projected',target,
      summary:'Power-based peak margin: '+(peakMargin>=0?'+':'')+rounded(peakMargin)+' dB',
      detail:'Illustrative 1-speaker calculation from '+rated+' W/channel continuous at '+
        values.load+' Ω and '+values.sensitivity+' dB ('+
        (values.basis==='voltage'?'2.83 V':'1 W')+'/1 m). Speaker compression, limiter behaviour, full impedance response, bass and room effects can reduce clean output.',
      link:url,linkText:'Open exact system in System Check',
      metrics:{projectedPeakDb:Math.round(projected*10)/10,peakMarginDb:Math.round(peakMargin*10)/10}
    };
  }
  return {kind:'other',status:'unverified',target,
    summary:'No applicable speaker-headroom estimate for this system type',
    detail:'No suitable acoustic output reference recorded for this configuration.',
    link:'/system-check/',linkText:'Explore System Check'};
}
