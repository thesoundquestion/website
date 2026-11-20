/**
 * Ownership-first recommendation paths. All user-entered equipment remains
 * visible; no matching catalog name is a certification of electrical or sonic fit.
 */
import {shortlistExamples} from './recommendations.mjs';
import {shortlistSpeakersForOwnedAmplifier,shortlistPartyPassiveConcepts,ampSpeakerScreening} from './owned-amp-speakers.mjs';
import {assessAmplifierCandidate,manufacturerNominalPairing} from './amplifier-fit.mjs';
import {builderOnlyAmpFor} from './supplemental-amplifiers.mjs';
import {poweredSubPairFor} from './stereo-subwoofer-examples.mjs';
import {isPoweredSpeakerRecord,POWERED_AMP_MESSAGE} from './speaker-route.mjs';
import {compareBudgetReferences, retailPriceReference} from './price-references.mjs';

const kinds=['speaker','amp','source','headphone'];
const has=x=>Boolean(x?.name);
const owned=own=>kinds.filter(k=>has(own[k]));
const part=(x,role)=>({name:x.name,count:1,role,url:x.record?.url||null});
const common={subtotal:null,priceDate:null,priceComponents:[],pricingStatus:'regional_price_missing',connectionStatus:'owned_path_unverified',
  editorialGoalFocus:true,secondaryFocus:[],sourceBatteryCaution:false,sceneCaution:false,
  placementCaution:false,levelCaution:false};
function attach(item,own,used,message) {
  const retained=used.filter(k=>has(own[k]));
  const separate=owned(own).filter(k=>!retained.includes(k)).map(k=>
    'Keep '+own[k].name+' for separate use; it is not a verified component of this listening path.');
  return {...item,reuseNames:retained.map(k=>own[k].name),keptSeparate:separate,
    ownershipMessage:message,extra:[...(item.extra||[]),...separate]};
}
function sourceNote(own,inputs=[],headphones=false) {
  if(!has(own.source))return 'Check the source output, volume control and connection before purchase.';
  const out=String(own.source.record?.values?.sourceConnection||'');
  if(headphones)return 'Your '+own.source.name+' uses a '+(out||'currently unverified')+
    ' output. A line output is not automatically a headphone amplifier; verify a suitable headphone socket, drive capability and volume control.';
  if((out==='RCA'||out==='3.5 mm')&&inputs.includes('analog'))
    return 'Your '+own.source.name+' lists '+out+' analogue output and this route accepts analogue input. Verify voltage, cables and volume control before calling it compatible.';
  return 'The '+(out||'unknown')+' output on your '+own.source.name+
    ' has not been confirmed against this path’s inputs. An adapter or another connection may be necessary.';
}
function existingPair(own,request) {
  const speaker=own.speaker, amp=own.amp, screen=ampSpeakerScreening(amp);
  const v=speaker.record?.values||{}, nominal=v.load, minimum=v.minimum;
  let blocker=null;
  if(screen.explicitNominalFloor&&Number.isFinite(nominal)&&nominal<screen.explicitNominalFloor)
    blocker=amp.name+' specifies at least '+screen.explicitNominalFloor+' Ω nominal speakers, while '+speaker.name+' is published as '+nominal+' Ω. Do not connect this combination without manufacturer approval.';
  else if(screen.explicitNominalFloor>=8&&Number.isFinite(minimum)&&minimum<6)
    blocker=speaker.name+' has a published '+minimum+' Ω minimum. Its nominal label alone does not establish compatibility with an 8 Ω-only amplifier.';
  const message=blocker
    ? 'Both parts are already yours, but the published load information raises a specific compatibility concern. Retain them for assessment, not as a confirmed safe pairing.'
    : 'Keep your '+speaker.name+' and '+amp.name+'. No demonstrated sound-quality deficit justifies replacing either one on the information entered.';
  const use=['speaker','amp'];
  const parts=[part(speaker,'Already owned passive stereo pair'),part(amp,'Already owned amplifier')];
  if(has(own.source)){use.push('source');parts.push(part(own.source,'Already owned source; verify its amplifier connection'));}
  const item={...common,id:'owned-complete',title:speaker.name+' + '+amp.name,
    kind:blocker?'Owned pairing · compatibility alert':'Keep your existing speaker/amplifier pairing',
    architecture:'passive_separates',soundTarget:speaker.name,
    why:message,tradeoff:blocker||'Full speaker impedance, amplifier manual, clean output at your seat and source connections remain unverified.',
    parts,loadCaution:blocker,ownershipBlocker:blocker,levelCaution:request.level==='high',
    extra:['Speaker nominal: '+(Number.isFinite(nominal)?nominal+' Ω':'unverified')+
      (Number.isFinite(minimum)?'; published minimum: '+minimum+' Ω.':'.'),
      screen.exactManufacturerRule||'A resistive load power rating does not certify operation into a real speaker’s changing impedance and phase.',
      ...(has(own.source)?[sourceNote(own,['analog'])]:[]),
      'Use System Check to assess clean level at the seat before considering any upgrade.']};
  return attach(item,own,use,message);
}
function keepPoweredPair(own, request, pair) {
  const used = ['speaker'];
  const parts = [{name: pair.model, count: 1, role: 'Already owned powered stereo pair with built-in amplification', url: pair.url}];
  if (has(own.source)) {
    used.push('source');
    parts.push(part(own.source, 'Already owned source. Check its output against the speakers’ inputs.'));
  }
  const msg = 'Keep your '+pair.model+' and use its built-in amplification. '+pair.note;
  const needsAdapter = request.connection && request.connection !== 'undecided' && !pair.inputs.includes(request.connection);
  const item = attach({...common, id:'owned-powered-pair', title:own.speaker.name,
    kind:'Keep your powered stereo pair', architecture:'consumer_powered_pair', why:msg,
    tradeoff:'Use the speakers’ own volume controls. Keep any separate amplifier for passive speakers.',
    parts, extra:['Connect only source-level signals to the line or optical inputs.'],
    connectionStatus:needsAdapter ? 'adapter_needed' : 'native_possible',
    levelCaution:request.level==='high', placementCaution:Number(request.distanceFt)>10}, own, used, msg);
  return {selected:[item], excluded:[], mode:'keep_powered_pair'};
}
function keepPoweredStudioMonitor(own,request){
  // Shared catalogue explicitly identifies these as mains-powered, line-level
  // studio cabinets, NOT passive loads and NOT a one-box stereo pair.
  const sp=own.speaker.record;
  const url=sp?.url||null;
  const source=own.source?.name?['source']:[];
  const item=attach({
    ...common,id:'owned-studio-monitor',kind:'Keep a powered studio monitor · verify stereo quantity and input route',
    title:own.speaker.name+' · powered studio monitor',architecture:'active_studio',
    why:own.speaker.name+' contains its own amplifier. Connect a suitable line-level signal, not the speaker-level output of a receiver or power amplifier.',
    tradeoff:'Catalogue evidence identifies one powered cabinet. Stereo listening usually requires two matched cabinets, suitable output connections and reliable volume control.',
    parts:[{name:own.speaker.name,count:1,role:'Already owned powered studio cabinet; verify if you own one or two',url},
      ...(own.source?.name?[part(own.source,'Potential source; connector, output level and monitoring volume unverified')]:[])],
    extra:[
      'NEVER connect the speaker outputs of an external amplifier to a powered studio monitor XLR or TRS input.',
      'Check mains power for each cabinet, line-level output capability, cable type, gain trim and stereo speaker count.',
      'Internal biamplifier watt figures are not external passive-speaker power ratings.',
      ...(own.amp?.name?['Your '+own.amp.name+' amplifier is retained separately; it must not feed this monitor via speaker terminals.']:[])
    ],
    connectionStatus:'owned_path_unverified',
    levelCaution:request.level==='high',
    placementCaution:Number(request.distanceFt)>10
  },own,['speaker',...source],'Reuse documented powered monitor(s); confirm quantity and source path before buying.');
  return {selected:[item],excluded:[],mode:'keep_powered_studio'};
}
const amps=[
  {model:'Fosi Audio BT20A Pro',inputs:['analog','bluetooth'],compact:true,
    price:189.99,priceDate:'2026-11-13',url:'https://soulfi-audio.ca/product/fosi-audio-bt20a-pro-bluetooth-amplifier/'},
  {model:'Fosi Audio V3 Stereo',inputs:['analog'],compact:true},
  {model:'AIYIMA A07 MAX Stereo',inputs:['analog'],compact:true},
  {model:'Yamaha A-S301',inputs:['analog','optical'],price:649.95,priceDate:'2026-11-12',
    url:'https://www.crutchfield.ca/p_022AS301B/Yamaha-A-S301.html'},
  {model:'Yamaha A-S501',inputs:['analog','optical']},
  {model:'Cambridge Audio CXA61',inputs:['analog','optical']},
  {model:'WiiM Amp',inputs:['analog','optical']},
  {model:'Sony STR-DH190',inputs:['analog','bluetooth']}
];
/**
 * Explain an amplifier shortlist using actual catalog ratings and the visitor's
 * owned speaker / connection / listening goal. Not a universal sound signature.
 */
export function explainAmplifierChoice({idea,record,speaker,request={}}) {
  const nominal=speaker?.record?.values?.load;
  const continuous=(record?.ratings||[]).filter(r=>Array.isArray(r)&&r[2]==='continuous'&&
    Number.isFinite(r[0])&&Number.isFinite(r[1]));
  const atNominal=Number.isFinite(nominal) ? continuous.find(r=>r[1]===nominal) : null;
  const rated=atNominal||continuous[0]||null;
  const ratingText=rated ? rated[0]+' W at '+rated[1]+' Ω (published continuous rating)' :
    'no verified continuous power figure in our catalog';
  const speakerText=Number.isFinite(nominal)?
    speaker.name+' is listed as '+nominal+' Ω nominal' :
    speaker.name+' has no validated nominal impedance in our catalog';
  const connection=String(request.connection||'undecided');
  const connections=Array.isArray(idea.inputs)?idea.inputs:[];
  const sourceMatches=connection!=='undecided'&&connections.includes(connection);
  const connectionNote=connection==='undecided' ?
    'Your input/volume-control path still needs checking' :
    sourceMatches ? 'Its catalogued '+connection+' input matches your requested connection type; verify the exact jack and signal level' :
      'A native '+connection+' input is not documented in this shortlist; suitable external hardware may be needed';
  const goalNotes={
    dynamic:'For your dynamic-impact goal, this rating gives a headroom figure to investigate, not a clean-SPL guarantee',
    bass:'For your bass goal, amplifier power alone cannot extend the speakers’ low-frequency response',
    imaging:'For your imaging goal, room symmetry and speaker placement matter; these watt ratings cannot establish imaging quality',
    natural:'For your natural-timbre goal, power and impedance specs do not prove a particular tonal character',
    low_volume:'For quiet listening, hiss and low-volume channel balance need testing; higher wattage alone proves neither',
    all_rounder:'For balanced listening, the key is a suitable load, source path and enough clean level rather than a brand sound signature',
    party:'For high-output use, sustained output and coverage must be checked; a home stereo rating alone cannot establish event suitability'
  };
  const fit=goalNotes[request.goal]||goalNotes.all_rounder;
  const summary='Keeps your '+speaker.name+'. '+idea.model+' has '+ratingText+
    '; '+speakerText+'. '+connectionNote+'. This is a first-stage equipment match, not verified safe loading or clean output.';
  const evidence=[
    'Published rating: '+(rated ? rated[0]+' W at '+rated[1]+' Ω'+(rated[3]?' — '+rated[3]:'') :
      'no verified comparable continuous power rating in the preset')+'.',
    'Load basis: '+speakerText+'. Check the actual impedance minimum, phase and amplifier manual before connecting.',
    'Source: '+connectionNote+'.',
    'Preference: '+fit+'. No measurable sound signature or audible improvement is inferred from amplifier brand, type or power rating.'
  ];
  return {summary,evidence,source:record?.url||null,goalNote:fit,
    ratingWatts:rated?.[0]??null,ratingOhms:rated?.[1]??null,
    inputFit:connection==='undecided'?'unknown':sourceMatches?'listed':'requires_check'};
}

/** Speaker ownership requires shopping for an amp, not replacing the speakers. */
export function shortlistAmpsForOwnedSpeakers({own={},request={},inventory={}}={}) {
  const speaker=own.speaker||{};
  if(isPoweredSpeakerRecord(speaker.record)||poweredSubPairFor(speaker.name))
    return {selected:[],excluded:[{title:speaker.name,reason:POWERED_AMP_MESSAGE}],mode:'powered_speaker_not_passive'};
  const nominal=speaker.record?.values?.load;
  const minimum=speaker.record?.values?.minimum;
  const selected=[],conditional=[],excluded=[];
  for(const idea of amps) {
    const record=(inventory.amp||[]).find(x=>x.model===idea.model)||
      builderOnlyAmpFor(idea.model);
    if(!record)continue;
    const screen=ampSpeakerScreening({name:idea.model,record});
    // Symmetric with the owned-amplifier speaker filter: a manufacturer
    // minimum nominal load cannot be satisfied by an unverified label.
    if(!Number.isFinite(nominal)&&screen.explicitNominalFloor){
      excluded.push({title:idea.model,reason:idea.model+' specifies at least '+
        screen.explicitNominalFloor+' Ω nominal load. The owned speaker has no verified numeric nominal impedance, so this combination must not be recommended.'});
      continue;
    }
    // A low test impedance is not a maker-approved nominal speaker limit.
    // Missing impedance phase curves alone cannot disqualify a candidate.
    const manualPairing=manufacturerNominalPairing(idea.model,nominal);
    if(manualPairing&&!manualPairing.supported){
      excluded.push({title:idea.model,reason:manualPairing.statement});
      continue;
    }
    if(!manualPairing&&Number.isFinite(screen.explicitNominalFloor)&&
       Number.isFinite(nominal)&&nominal<screen.explicitNominalFloor){
      excluded.push({title:idea.model,reason:'The published amplifier minimum is '+
        screen.explicitNominalFloor+' Ω nominal, while these speakers are '+nominal+' Ω nominal.'});
      continue;
    }
    const snapshot = request.region==='CA'&&request.currency==='CAD'&&Number.isFinite(idea.price) ? {
      date:idea.priceDate,components:[{label:idea.model,amount:idea.price,url:idea.url}]
    } : null;
    const prices=retailPriceReference(snapshot,request.referenceDate);
    const rationale=explainAmplifierChoice({idea,record,speaker,request});
    const fit=assessAmplifierCandidate({idea,record,speaker,request});
    // An exact-load continuous rating earns priority, but missing one must
    // not discard a candidate with acceptable nominal impedance permission.
    // Another-load watt figure is NEVER converted into a made-up output.
    if(!Number.isFinite(nominal)){
      excluded.push({title:idea.model,reason:'No usable nominal speaker impedance was supplied.'});
      continue;
    }
    const requestedInput=String(request.connection||'undecided');
    if(requestedInput!=='undecided'&&!idea.inputs.includes(requestedInput)){
      excluded.push({title:idea.model,reason:'Requested '+requestedInput+' connection is not documented as a native input.'});
      continue;
    }
    const exactPower=fit.amp.exact;
    const ratingSummary=exactPower?
      idea.model+' is published at '+fit.amp.watts+' W/channel continuously into '+
        nominal+' Ω, matching the nominal-class impedance of '+speaker.name+'. ':
      idea.model+' has no directly documented continuous output rating at '+nominal+
        ' Ω for '+speaker.name+'. '+(fit.amp.displayWatts!==null?
        'The published '+fit.amp.displayWatts+' W / '+fit.amp.displayOhms+
        ' Ω test must not be converted into a power estimate at '+nominal+' Ω. ':'');
    const message=ratingSummary+
      (manualPairing?manualPairing.statement:
        'Check the manufacturer’s supported nominal speaker impedance.')+
      (exactPower&&fit.documentedBurst!==null?' Its separate '+fit.documentedBurst+
        ' W/channel short-burst figure at '+nominal+' Ω provides additional test information.':'');
    const used=['speaker'];const parts=[part(speaker,'Already owned; no new speaker purchase'),
      {name:idea.model,count:1,role:'Only new amplifier candidate, subject to verification',url:record.url}];
    if(has(own.source)){used.push('source');parts.push(part(own.source,'Already owned source, connection check required'));}
    (fit.amp.exact?selected:conditional).push(attach({...common,id:'owned-speaker-amp-'+idea.model.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      title:speaker.name+' + '+idea.model,kind:'Keep your speakers · add an amplifier',
      architecture:'passive_separates',soundTarget:speaker.name,why:message,
      amplifierModel:idea.model,speakerModel:speaker.name,manualPairing,
      amplifierReason:message,amplifierEvidence:[
        exactPower?'Rated continuously: '+fit.amp.watts+' W/channel at '+nominal+' Ω.':
          'No published continuous output at '+nominal+' Ω: do not predict output from another load.',
        ...(manualPairing?[manualPairing.statement+' Speaker impedance setting: '+manualPairing.setting+'.']:[]),
        ...(fit.documentedBurst!==null?['IHF short-burst rating: '+fit.documentedBurst+' W/channel at '+nominal+' Ω.']:[]),
        'The listening-level headroom result depends on the chosen dB SPL target and distance.'
      ],amplifierSource:rationale.source,
      amplifierFit:fit,amplifierFitRank:fit.sortValue,compactAmp:idea.compact===true,
      matchEvidence:exactPower?'exact_load_rating':'nominal_load_only',
      tradeoff:'Compare current local cost and actual available inputs; different wattage is not proof of different sound quality.',
      loadCaution:exactPower?null:
        'No comparable amplifier power test at '+nominal+' Ω. This is a conditional impedance and connection candidate, not a proven headroom match.',
      parts,...prices,
      pricingStatus:prices.subtotal===null?'regional_price_missing':'partial_subtotal',
      priceEvidence:idea.model==='Fosi Audio BT20A Pro'?
        'corroborated_ordinary_CAD_asking_32V_PSU_variant_check':null,
      sceneCaution:false,levelCaution:false,
      extra:[]},
      own,used,message));
  }
  selected.sort((a,b)=>b.amplifierFitRank-a.amplifierFitRank ||
    compareBudgetReferences(a.subtotal,b.subtotal,request) || a.title.localeCompare(b.title));
  // Return fully comparable candidates first. Fill remaining slots with
  // qualified alternatives only when fewer than three exact-load matches exist.
  // A conditional option must never masquerade as a calculated wattage match.
  conditional.sort((a,b)=>b.amplifierFitRank-a.amplifierFitRank||
    compareBudgetReferences(a.subtotal,b.subtotal,request)||a.title.localeCompare(b.title));
  const shortlist=[...selected.slice(0,3),
    ...conditional.slice(0,Math.max(0,3-selected.length))];
  if (shortlist.length===3 && !shortlist.some(item=>item.compactAmp) && request.level!=='high' &&
      request.goal!=='party' && request.useCase!=='party' && request.useCase!=='outdoors') {
    // Leave room to compare a simpler amplifier at ordinary listening levels.
    const compact=selected.find(item=>item.compactAmp && item.amplifierFit.directInput);
    if (compact) shortlist.push(compact);
  }
  return {selected:shortlist,excluded,mode:'keep_speakers'};
}
function keepHeadphone(own,request){
  const used=['headphone'],parts=[part(own.headphone,'Already owned; keep this headphone')];
  if(has(own.source)){used.push('source');parts.push(part(own.source,'Already owned source; headphone-drive compatibility unverified'));}
  const msg='Keep your '+own.headphone.name+'. No demonstrated limitation shows it needs replacing. Confirm fit, isolation, tonal preference and a suitable headphone output.';
  return attach({...common,id:'owned-headphones',title:own.headphone.name,kind:'Keep your existing headphones',
    architecture:'headphone_first',soundTarget:own.headphone.name,why:msg,
    tradeoff:'No verified drive/output or fit result; source and sound preferences remain individual.',
    parts,extra:[sourceNote(own,[],true),'The output must support the headphone sensitivity, impedance and comfortable volume without excess noise.']},own,used,msg);
}
function keepAmp(own,request,inventory){
  const r=shortlistSpeakersForOwnedAmplifier({...request,amp:own.amp,speakers:inventory.speaker||[]});
  const selected=r.selected.map(item=>{
    const used=['amp'];const parts=[part(own.amp,'Already owned; no new amplifier purchase'),...item.parts];
    if(has(own.source)){used.push('source');parts.push(part(own.source,'Already owned; verify matching amp input'));}
    const msg='Keep your '+own.amp.name+' and investigate '+item.title+' for the missing stereo speakers. The amplifier’s load suitability is still conditional.';
    return attach({...item,why:msg,speakerRationale:item.why,parts,preferenceMatchAvailable:true,
      extra:[...(item.extra||[]),...(has(own.source)?[sourceNote(own,['analog'])]:[])]},own,used,msg);
  });
  return {selected,excluded:r.excluded,mode:'keep_amp'};
}
function keepSource(own,request,inventory={}){
  const partyPassive=(request.goal==='party'||request.useCase==='party') &&
    request.architecture==='passive_separates' && request.power!=='battery';
  const r=partyPassive ?
    shortlistPartyPassiveConcepts({...request,speakers:inventory.speaker||[]}) :
    shortlistExamples(request);
  const selected=r.selected.map(item=>{
    const msg='Keep your '+own.source.name+' as the source for this system. The remaining speakers and amplification are examples, not a reason to replace the source.';
    return attach({...item,why:msg,preferenceMatchAvailable:true,
      parts:[part(own.source,'Already owned source, suitable input to verify'),...item.parts],
      extra:[...(item.extra||[]),sourceNote(own,item.connections||[],item.architecture==='headphone_first')],
      sourceCaution:sourceNote(own,item.connections||[],item.architecture==='headphone_first'),
      sourceBatteryCaution:request.power==='battery'},own,['source'],msg);
  });
  return {selected,excluded:r.excluded,mode:'keep_source'};
}
function keepSeparate(own,request){
  const msg='Keep the equipment you entered for its compatible use. The selected '+request.architecture+
    ' or '+request.power+' requirement cannot be assumed to use it directly; that is a pathway limitation, not proof of poor sound quality.';
  return attach({...common,id:'owned-other-route',title:'Your existing equipment',
    kind:'Keep for its supported listening use',architecture:request.architecture||'open',
    why:msg,tradeoff:'Check the exact signal path and power requirements before buying a different architecture.',
    parts:owned(own).map(k=>part(own[k],'Already owned; no new purchase assumed')),
    extra:['Different format, connection or off-grid requirements may need separate equipment.']},
    own,owned(own),msg);
}
function comparisonReasons(own,request){
  const out=[];
  if(request.power==='battery')out.push('Battery operation may justify a separate portable system. Your mains equipment remains useful where wall power exists.');
  if(request.architecture==='party_pa'||request.useCase==='party')out.push('A home setup is not automatically a suitable event PA. Verify coverage, sustained output, transport and power before replacing anything.');
  if(has(own.speaker))out.push('Replacing your speakers requires a demonstrated limitation in bass, headroom, condition, placement or compatibility; none was measured by this form.');
  if(has(own.amp))out.push('Replacing your amplifier requires an actual load restriction, inadequate clean power, missing input or defect; a newer receiver is not inherently better.');
  if(has(own.source))out.push('Replace your source/DAC only if its output, input format or demonstrated performance cannot meet this path.');
  if(has(own.headphone))out.push('Replace your headphones only for a real fit, isolation, sound or output mismatch.');
  return out;
}
export function ownershipPlan({own={},request={},inventory={}}={}){
  if(!owned(own).length)return null;
  const arch=request.architecture||'open';
  // A loud/party listening GOAL is not a request to discard a working
  // passive stereo. Only an explicit PA architecture or mandatory battery
  // requirement forces the separate-event-system treatment.
  const event=arch==='party_pa'||request.power==='battery';
  const headphonePath=arch==='headphone_first'||(arch==='open'&&!has(own.speaker)&&!has(own.amp)&&has(own.headphone));
  const poweredPair=poweredSubPairFor(own.speaker?.name);
  const poweredStudio=own.speaker?.record?.speakerKind==='powered_studio_monitor';
  const poweredPa=own.speaker?.record?.speakerKind==='powered_pa_speaker';
  let plan;
  if(headphonePath&&has(own.headphone))plan={selected:[keepHeadphone(own,request)],excluded:[],mode:'keep_headphones'};
  else if(poweredStudio||poweredPa) {
    // No amplifier matching can ever run on these powered line-input units.
    if(poweredStudio&&!event)plan=keepPoweredStudioMonitor(own,request);
    else plan={selected:[keepSeparate(own,request)],excluded:[],mode:'retain_powered_separate'};
  }
  else if(poweredPair) {
    if(!event&&(arch==='open'||arch==='consumer_powered_pair')) plan=keepPoweredPair(own,request,poweredPair);
    else plan={selected:[keepSeparate(own,request)],excluded:[],mode:'retain_separate'};
  }
  else if(!event&&(arch==='open'||arch==='passive_separates')&&has(own.speaker)&&has(own.amp)){
    const first=existingPair(own,request);
    const selected=[first];
    if(first.ownershipBlocker){
      const partial=shortlistAmpsForOwnedSpeakers({own,request,inventory});
      if(partial.selected.length)selected.push(partial.selected[0]);
      const byAmp=keepAmp(own,request,inventory);
      if(byAmp.selected.length)selected.push(byAmp.selected[0]);
    }
    plan={selected,excluded:[],mode:'keep_both'};
  }
  else if(!event&&(arch==='open'||arch==='passive_separates')&&has(own.speaker)&&!has(own.amp))
    plan=shortlistAmpsForOwnedSpeakers({own,request,inventory});
  else if(!event&&(arch==='open'||arch==='passive_separates')&&has(own.amp)&&!has(own.speaker))
    plan=keepAmp(own,request,inventory);
  else if(has(own.source)&&!has(own.speaker)&&!has(own.amp)&&!has(own.headphone))
    plan=keepSource(own,request,inventory);
  else if(has(own.speaker)&&has(own.amp)) {
    const item=existingPair(own,request);
    item.pathwayCaution='This keeps your passive stereo system for a separate mains-powered listening route; it does not meet the selected '+arch+' / '+request.power+' requirement.';
    plan={selected:[item],excluded:[],mode:'keep_separate_pair'};
  }
  else if(has(own.speaker)){
    const alt=shortlistAmpsForOwnedSpeakers({own,request,inventory});
    for(const item of alt.selected)
      item.pathwayCaution='This preserves your passive speakers in a separate stereo route, not the requested '+arch+' / '+request.power+' route.';
    plan={...alt,mode:'keep_separate_speaker'};
  }
  else if(has(own.amp)){
    const alt=keepAmp(own,request,inventory);
    for(const item of alt.selected)
      item.pathwayCaution=(arch==='open' && request.power!=='battery' &&
        (request.goal==='party'||request.useCase==='party')) ?
        'Your amplifier can remain in a passive high-output system if the exact speaker load and clean level are verified; this does not certify it as an event PA.' :
        'This preserves your amplifier for a separate passive stereo route, not the requested '+arch+' / '+request.power+' route.';
    plan={...alt,mode:'keep_separate_amp'};
  }
  else if(has(own.headphone)){
    const item=keepHeadphone(own,request);
    item.pathwayCaution='Your headphones can still serve a separate personal listening path, but they do not satisfy the requested '+arch+' / '+request.power+' route.';
    plan={selected:[item],excluded:[],mode:'keep_separate_headphones'};
  }
  else plan={selected:[keepSeparate(own,request)],excluded:[],mode:'retain_separate'};
  if(!plan.selected.length)plan.selected=[keepSeparate(own,request)];
  return {...plan,comparisonReasons:comparisonReasons(own,request)};
}
