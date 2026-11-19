/**
 * Beginner-first explanation layer for existing Listening Builder results.
 * This module cannot grant compatibility, infer a missing specification,
 * change shortlist order, compute a new amplifier rating or rank sound quality.
 * All candidate facts and warnings must come from the existing recommendation.
 */
const architectures=Object.freeze({
  passive_separates:{
    path:'A music source feeds an amplifier or receiver, which drives a passive left/right speaker pair.',
    check:'Before connecting, verify the amplifier maker’s permitted load against the exact speakers, including any documented impedance minimum and phase. Confirm source input, volume control and clean level at your seat.'
  },
  consumer_powered_pair:{
    path:'A suitable source feeds a powered stereo pair. The speakers contain amplification, so no separate speaker power amplifier is required.',
    check:'Confirm this listing contains a full left/right pair, a usable source input and volume control. Never connect amplifier speaker terminals to a powered speaker’s line-level input.'
  },
  active_studio:{
    path:'A suitable stereo line-level signal feeds two individually amplified monitors. Their amplification is inside the cabinets.',
    check:'Confirm TWO monitors rather than one, two power feeds, compatible line-level inputs and a practical stereo volume control. Do not feed an amplifier speaker output into monitor line inputs.'
  },
  headphone_first:{
    path:'The music source needs a suitable headphone output and level control, followed by headphones that fit and work for your listening environment.',
    check:'A DAC line output or matching plug alone does not confirm headphone drive. Verify output capability, headphone connector, fit, leakage and listening level.'
  },
  party_pa:{
    path:'A playback or microphone source feeds the appropriate mixer/control input, then the powered party or PA system.',
    check:'A single powered cabinet may not provide stereo or adequate venue coverage. Check mains or battery power, safe mounting, weather protection, audience requirements and sustainable clean output.'
  }
});
const text=x=>typeof x==='string'?x.trim():'';
const first=(...a)=>a.map(text).find(Boolean)||'';
const unique=a=>[...new Set(a.map(text).filter(Boolean))];
export function explainBeginnerOption(item,request={}){
  const architecture=architectures[item?.architecture]||{
    path:'Confirm every part of the source-to-listener signal path.',
    check:'Confirm the actual connection, control, electrical requirements and full system cost.'
  };
  const reuse=['owned-complete','owned-headphones','owned-other-route','owned-powered-pair'].includes(item?.id);
  const blocked=Boolean(item?.loadCaution||item?.ownershipBlocker);
  const externalInput=item?.connectionStatus==='adapter_needed';
  const condition=Boolean(item?.sourceCaution||item?.pathwayCaution||item?.levelCaution||item?.placementCaution||item?.sourceBatteryCaution);
  const status=blocked?'Important match concern':reuse?'Use what you own · still verify':
    externalInput?'Extra connection needed':'Candidate system · not fully verified';
  const reason=first(item?.headphoneRationale,item?.amplifierReason,item?.speakerRationale,
    item?.ownershipMessage,item?.why,
    'This option was included for your selected listening priorities and system approach.');
  const checks=unique([
    item?.ownershipBlocker||item?.loadCaution,
    item?.sourceCaution,
    item?.pathwayCaution,
    externalInput?'Your chosen source connection needs a verified converter, adapter or different input. A cable is not always sufficient.':'',
    item?.sourceBatteryCaution?'This route needs a suitable battery-powered source/output or a different power plan.':'',
    item?.levelCaution||item?.placementCaution?'The clean output needed at your listening distance and speaker placement is not established.':'',
    item?.sceneCaution?'This equipment has not been verified for your chosen venue, coverage or environment.':'',
    architecture.check,
    item?.bassSetup?'Check subwoofer routing, crossover configuration and total cost.':'',
    ...((Array.isArray(item?.extra)?item.extra:[]).slice(0,2))
  ]);
  const fit=item?.amplifierFit;
  let matchingEvidence='';
  if(fit?.amp&&fit?.speaker){
    matchingEvidence=fit.amp.exact&&Number.isFinite(fit.amp.watts)&&Number.isFinite(fit.amp.ohms)
      ?'A published amplifier rating exists at '+fit.amp.ohms+' Ω ('+fit.amp.watts+' W/channel). That is a relevant electrical data point, not proof the actual speaker impedance curve or listening headroom is acceptable.'
      :'No published amplifier output rating at this speaker’s nominal load has been established for this comparison. Electrical suitability remains uncertain.';
  }else if(item?.architecture==='passive_separates'){
    matchingEvidence='This is a plausible passive-speaker/amplifier arrangement, NOT a manufacturer-verified electrical match. Check load compatibility and clean power separately.';
  }else if(item?.architecture==='consumer_powered_pair'||item?.architecture==='active_studio'){
    matchingEvidence='The speaker amplification is internal to this type of system. The source input, voltage/level, controls and actual included cabinets still need confirmation.';
  }else{
    matchingEvidence='This equipment type fits the selected use case in principle; the exact model, source path and performance are not certified here.';
  }
  const parts=Array.isArray(item?.parts)?item.parts.filter(p=>p&&text(p.name)):[];
  const roles=parts.map(p=>(Number.isInteger(p.count)&&p.count>1?p.count+' × ':'')+
    p.name+(text(p.role)?' — '+p.role:''));
  const missing=unique([
    !reuse&&!Number.isFinite(item?.subtotal)?'A complete, current regional price has not been established for this option.':'',
    item?.architecture==='active_studio'?'Verify whether monitor prices are per cabinet and include both plus needed control/cables.':'',
    request?.subMode&&request.subMode!=='no_sub'&&!item?.bassSetup?'Any required subwoofer, crossover and connections must be budgeted separately.':'',
    item?.connectionStatus==='adapter_needed'?'A suitable converter/adapter and any required power/control hardware must be priced separately.':'',
    text(item?.tradeoff)
  ]);
  return {status,reason,rolePath:architecture.path,roles,matchingEvidence,checks,
    firstChecks:checks.slice(0,2),remainingChecks:checks.slice(2),costAndTradeoffs:missing,
    reuse,priority:blocked?'critical':externalInput||condition?'review':'conditional'};
}
