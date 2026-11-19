/**
 * Beginner-first explanation layer for existing Listening Builder results.
 * This module cannot grant compatibility, infer a missing specification,
 * change shortlist order, compute a new amplifier rating or rank sound quality.
 * All candidate facts and warnings must come from the existing recommendation.
 */
const architectures=Object.freeze({
  passive_separates:{
    path:'The music player plugs into an amplifier, which powers the two speakers. These speakers need a separate amplifier because they do not have one built in.',
    check:'Before connecting, check the amplifier manual to see which speakers it can handle. Check the actual input sockets and whether it can play cleanly at the volume you want.'
  },
  consumer_powered_pair:{
    path:'Your music player connects straight to the powered speakers. Their amplifier is already built in, so you do not need to buy a separate amplifier to power them.',
    check:'Check that the price includes both speakers, that they accept your music player’s connection and that you can adjust the volume. Never connect the speaker outputs of another amplifier to their ordinary audio input.'
  },
  active_studio:{
    path:'Your music player connects to two powered studio speakers. Each speaker has its own amplifier; you do not need a separate speaker amplifier.',
    check:'Make sure you are buying TWO speakers. Some studio monitors are sold one at a time. Check that you have the right audio connections, a way to control volume and power for each speaker. Never connect an external amplifier’s speaker output to these speakers’ audio inputs.'
  },
  headphone_first:{
    path:'Your phone, computer or music player needs a suitable headphone output. Choose headphones that fit comfortably and suit where you listen.',
    check:'Check that the device has an actual headphone output, not just an audio output meant for an amplifier. Also check the plug, comfort, sound leakage and safe volume.'
  },
  party_pa:{
    path:'Your music player or microphone connects to the system’s sound controls, which send audio to the powered speakers.',
    check:'One speaker may not cover the whole space or give you stereo sound. Check power, placement, weather protection and whether it can play clearly at the level you need.'
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
  const pairing=item?.pairingEvidence||null;
  // A routine caution on a screened speaker pair is not by itself proof of an
  // incompatibility. A known blocker, missing nominal data or demanding minimum
  // still belongs ahead of shopping recommendations.
  const blocked=Boolean(item?.ownershipBlocker||
    (item?.loadCaution&&!pairing)||
    (pairing&&(pairing.nominal===null||pairing.demandingMinimum)));
  const externalInput=item?.connectionStatus==='adapter_needed';
  const condition=Boolean(item?.sourceCaution||item?.pathwayCaution||item?.levelCaution||item?.placementCaution||item?.sourceBatteryCaution);
  const status=blocked?'Check this pairing before connecting':reuse?'Keep your gear if it meets your needs':
    externalInput?'You may need another connection':
    pairing?pairing.label:'A possible setup, with details to check';
  const rawReason=first(item?.headphoneRationale,item?.amplifierReason,item?.speakerRationale,
    item?.ownershipMessage,item?.why,
    'This option was chosen from the available system examples.');
  const plainGoals={
    all_rounder:'general music listening',natural:'clear, natural-sounding voices and instruments',
    imaging:'a clear sense of where instruments sit between the speakers',
    bass:'fuller bass',dynamic:'clean musical peaks',low_volume:'enjoyable listening at lower volume',
    party:'playing music over a wider area'
  };
  const goal=plainGoals[request?.goal]||'your selected listening needs';
  const noDirectGoal=item?.editorialGoalFocus===false;
  const goalExplanation=noDirectGoal
    ?'This is another system type to compare. We do not have proof that it best fits your main listening goal.'
    :'We included this option because it is listed as a possible fit for '+goal+'. That is a starting point, not a listening test or a promise of sound quality.';
  const reason=pairing?
    (pairing.manufacturerNominalGuidance&&!pairing.demandingMinimum?
      'We suggested these speakers because their published ohm rating fits the range your amplifier maker recommends. That makes this a sensible starting match.':
      'These speakers might work with your amplifier, but we still need to check a specific missing or unusual rating.'):
    reuse?'We started with equipment you already own. If it meets your needs, there is no reason to replace it just to complete a shopping list.':
    item?.ownedAmpName?'This option lets you keep your '+item.ownedAmpName+
      ' and look at speakers without buying another amplifier. We still need to check the exact match.':
    item?.soundTarget?'This option keeps your existing speakers and looks at the other pieces they may need.':
    item?.architecture==='consumer_powered_pair'?
      'These speakers already contain amplification. This is a simpler setup with fewer separate boxes, as long as your player can connect to them.':
    item?.architecture==='passive_separates'?
      'This example includes a separate amplifier and passive speakers. That is a complete starting layout for stereo playback, but the exact models still need checking.':
    item?.architecture==='headphone_first'?
      'This is a headphone-based listening option. Check comfort, the source connection and volume before buying extra equipment.':
      'This equipment type could suit what you want to do, but we still need to check the actual devices.';
  const technicalChecks=unique([
    item?.ownershipBlocker,item?.loadCaution,item?.sourceCaution,item?.pathwayCaution,
    ...((Array.isArray(item?.extra)?item.extra:[]))
  ]);
  const checks=unique([
    item?.ownershipBlocker?'The equipment you selected may not fit this setup. Check the warning in the detailed notes before connecting anything.':'',
    pairing?.demandingMinimum?
      'These speakers may be harder for your amplifier to drive than the main rating suggests. Get the exact model manuals or manufacturer advice before connecting.':'',
    pairing?.manufacturerNominalGuidance&&!pairing.demandingMinimum?
      'Next, make sure the system can play at the level you want in your room. The speaker rating alone does not tell us how loud it will get.':
      pairing?.plainNext,
    item?.loadCaution&&!pairing?
      'Check this specific problem before connecting: '+item.loadCaution:'',
    item?.sourceCaution?
      'Your music player may not plug straight into this setup. Check the audio output on the player and the input on the amplifier or speakers.':'',
    externalInput?
      'A different plug does not always fix a connection problem. You might need a device that converts the signal.':'',
    item?.pathwayCaution?
      'Some of your existing equipment may not fit the system type you selected. Check the detailed explanation before buying.':'',
    item?.sourceBatteryCaution?
      'Check whether this setup can run on batteries if you need to use it away from a power outlet.':'',
    item?.levelCaution||item?.placementCaution?
      'Check that the system can play clearly at your normal listening distance and volume. A watt rating alone cannot tell us that.':'',
    item?.sceneCaution?
      'Check whether this equipment fits the room or outdoor space where you will use it.':'',
    pairing?.manufacturerNominalGuidance&&!pairing.demandingMinimum?'':architecture.check,
    item?.bassSetup?'If you add a subwoofer for deeper bass, check its connections and include its cost.':''
  ]);
  const fit=item?.amplifierFit;
  let matchingEvidence='';
  if(pairing){
    matchingEvidence=pairing.plainWhy+
      (pairing.demandingMinimum?' '+pairing.plainMinimum:'');
  }else if(fit?.amp&&fit?.speaker){
    matchingEvidence=fit.amp.exact&&Number.isFinite(fit.amp.watts)&&Number.isFinite(fit.amp.ohms)
      ?'The amplifier is rated at '+fit.amp.watts+' W/channel into '+fit.amp.ohms+' Ω in a published test. In everyday terms, that tells us how much electrical power it supplied under those test conditions. It does not prove how loudly these speakers will play in your room or whether they are a safe load.'
      :'We have not found an amplifier power rating measured with the same electrical load these speakers are listed for. That does not make the system bad, but we need more information before calling it a good match.';
  }else if(item?.architecture==='passive_separates'){
    matchingEvidence='The amplifier supplies the power the speakers need, so the types of equipment make sense together. But we have not established that these exact models are an electrical match. Check the amplifier manual and speaker load details first.';
  }else if(item?.architecture==='consumer_powered_pair'||item?.architecture==='active_studio'){
    matchingEvidence='The speakers have their own amplifier, so there is no separate speaker amplifier to match. We still need to check the music player’s connection, volume control and whether the price includes both speakers.';
  }else{
    matchingEvidence='This type of system could work for the activity you chose. We still need to check the actual connections and whether the pieces meet your needs.';
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
  const technicalEvidence=pairing?
    pairing.notes.join(' ')+' These details explain the evidence behind the recommendation; they are not required reading for a normal manufacturer-specification match.':
    rawReason;
  return {status,reason,goalExplanation,rolePath:architecture.path,roles,matchingEvidence,checks,
    firstChecks:checks.slice(0,2),remainingChecks:checks.slice(2),costAndTradeoffs:missing,
    technicalEvidence,technicalChecks,reuse,
    priority:blocked?'critical':externalInput||condition?'review':'conditional'};
}
