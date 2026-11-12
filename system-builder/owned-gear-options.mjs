/**
 * Ownership-first recommendation paths. All user-entered equipment remains
 * visible; no matching catalog name is a certification of electrical or sonic fit.
 */
import {shortlistExamples} from './recommendations.mjs';
import {shortlistSpeakersForOwnedAmplifier,ampSpeakerScreening} from './owned-amp-speakers.mjs';

const kinds=['speaker','amp','source','headphone'];
const has=x=>Boolean(x?.name);
const owned=own=>kinds.filter(k=>has(own[k]));
const part=(x,role)=>({name:x.name,count:1,role,url:x.record?.url||null});
const common={subtotal:null,priceComponents:[],pricingStatus:'regional_price_missing',connectionStatus:'owned_path_unverified',
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
const amps=[
  {model:'Yamaha A-S301',inputs:['analog','optical'],price:649.95,url:'https://www.crutchfield.ca/p_022AS301B/Yamaha-A-S301.html'},
  {model:'Yamaha A-S501',inputs:['analog','optical']},
  {model:'Cambridge Audio CXA61',inputs:['analog','optical']},
  {model:'WiiM Amp',inputs:['analog','optical']},
  {model:'Sony STR-DH190',inputs:['analog','bluetooth']}
];
/** Speaker ownership requires shopping for an amp, not replacing the speakers. */
export function shortlistAmpsForOwnedSpeakers({own={},request={},inventory={}}={}) {
  const speaker=own.speaker||{};
  const nominal=speaker.record?.values?.load;
  const minimum=speaker.record?.values?.minimum;
  const selected=[],excluded=[];
  for(const idea of amps) {
    const record=(inventory.amp||[]).find(x=>x.model===idea.model);
    if(!record)continue;
    const screen=ampSpeakerScreening({name:idea.model,record});
    if(Number.isFinite(nominal)&&nominal<screen.discoveryFloor){
      excluded.push({title:idea.model,reason:'Speaker nominal '+nominal+' Ω is below the conservative '+screen.discoveryFloor+' Ω discovery threshold.'});continue;
    }
    if(screen.discoveryFloor>=8&&Number.isFinite(minimum)&&minimum<6){
      excluded.push({title:idea.model,reason:'Published '+minimum+' Ω minimum needs additional review for an 8 Ω-only amplifier.'});continue;
    }
    const price=request.region==='CA'&&request.currency==='CAD'&&Number.isFinite(idea.price)?idea.price:null;
    if(request.budgetStrict!==false&&Number.isFinite(request.budget)&&price!==null&&price>request.budget){
      excluded.push({title:idea.model,reason:'Known amplifier listing exceeds firm budget.'});continue;
    }
    const message='Keep your '+speaker.name+' and consider '+idea.model+' as the missing amplifier. '+
      'This is a preliminary electrical screen, not a verified impedance or sound-quality match.';
    const used=['speaker'];const parts=[part(speaker,'Already owned; no new speaker purchase'),
      {name:idea.model,count:1,role:'Only new amplifier candidate, subject to verification',url:record.url}];
    if(has(own.source)){used.push('source');parts.push(part(own.source,'Already owned source, connection check required'));}
    selected.push(attach({...common,id:'owned-speaker-amp-'+idea.model.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      title:speaker.name+' + '+idea.model,kind:'Keep your speakers · add an amplifier',
      architecture:'passive_separates',soundTarget:speaker.name,why:message,
      tradeoff:'Neither full reactive-load suitability nor complete new-system cost is verified.',
      parts,subtotal:price,priceComponents:price===null?[]:[{label:idea.model,amount:price,url:idea.url}],
      pricingStatus:price===null?'regional_price_missing':'partial_subtotal',
      sceneCaution:request.useCase==='party'||request.useCase==='outdoors',levelCaution:request.level==='high',
      extra:[sourceNote(own,idea.inputs),
        'Published amplifier continuous-test loads: '+record.ratings.filter(x=>x[2]==='continuous').map(x=>x[1]+' Ω').join(', ')+'. Test loads are not blanket permission for every speaker.',
        'Check the speaker’s impedance minimum/phase, amplifier manual, clean output at the seat and connections.']},
      own,used,message));
    if(selected.length>=3)break;
  }
  return {selected,excluded,mode:'keep_speakers'};
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
    return attach({...item,why:msg,parts,extra:[...(item.extra||[]),...(has(own.source)?[sourceNote(own,['analog'])]:[])]},own,used,msg);
  });
  return {selected,excluded:r.excluded,mode:'keep_amp'};
}
function keepSource(own,request){
  const r=shortlistExamples(request);
  const selected=r.selected.map(item=>{
    const msg='Keep your '+own.source.name+' as the source for this system. The remaining speakers and amplification are examples, not a reason to replace the source.';
    return attach({...item,why:msg,parts:[part(own.source,'Already owned source, suitable input to verify'),...item.parts],
      extra:[...(item.extra||[]),sourceNote(own,item.connections||[],item.architecture==='headphone_first')],
      sourceCaution:sourceNote(own,item.connections||[],item.architecture==='headphone_first')},own,['source'],msg);
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
  const event=arch==='party_pa'||request.useCase==='party'||request.goal==='party'||request.power==='battery';
  const headphonePath=arch==='headphone_first'||(arch==='open'&&!has(own.speaker)&&!has(own.amp)&&has(own.headphone));
  let plan;
  if(headphonePath&&has(own.headphone))plan={selected:[keepHeadphone(own,request)],excluded:[],mode:'keep_headphones'};
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
    plan=keepSource(own,request);
  else plan={selected:[keepSeparate(own,request)],excluded:[],mode:'retain_separate'};
  if(!plan.selected.length)plan.selected=[keepSeparate(own,request)];
  return {...plan,comparisonReasons:comparisonReasons(own,request)};
}
