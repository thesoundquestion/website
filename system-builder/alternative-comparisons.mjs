/**
 * Pairwise buyer context for Listening Builder.
 * Configurations and sourced figures can support meaningful comparisons;
 * sound quality, clean SPL and preferences cannot be inferred from a label.
 * This module never changes the ranking or asserts compatibility.
 */
const label=x=>String(x?.title||x?.model||x?.name||'the main choice').replace(/^[^:]{3,55}:\s*/,'');
const readable=x=>String(x||'').replaceAll('_',' ');
const clamp=(s,max=205)=>s.length>max?s.slice(0,max).replace(/\s+\S*$/,'')+'…':s;
const uniq=items=>[...new Set(items.filter(Boolean))];
const isNum=v=>typeof v==='number'&&Number.isFinite(v);
const itemId=i=>i?.catalogId||(String(i?.id||'').startsWith('catalog-')?i.id.slice(8):null);
const dataFor=(catalog,item)=>catalog?.records?.find(r=>r.id===itemId(item))||null;
const hpStyle=i=>{
 const text=(String(i?.kind||'')+' '+String(i?.title||'')).toLowerCase();
 return /in-ear|\biem\b/.test(text)?'in-ear':/closed/.test(text)?'closed-back':
   /open/.test(text)?'open-back':null;
};
const setupNames={passive_separates:'separate amplifier and passive speakers',
 consumer_powered_pair:'powered stereo speakers',active_studio:'individually powered studio monitors',
 headphone_first:'wired headphones',party_pa:'event/PA speakers'};
const usefulGoal={dynamic:'clean musical peaks',bass:'more usable bass',imaging:'spatial presentation',
 natural:'vocal and instrument balance',low_volume:'quiet-level listening',
 party:'room or audience coverage',all_rounder:'daily listening'};
const preferredGoal=req=>usefulGoal[req?.goal]||'your listening priorities';
const add=(arr,s)=>{if(s&&!arr.includes(s))arr.push(s);};
export function compareAlternative(base,alt,request={},catalog=null){
 if(!base||!alt||base===alt||base.id&&base.id===alt.id)return null;
 const changes=[],mayPrefer=[],tradeoffs=[];
 const a=base.architecture,b=alt.architecture;
 if(a&&b&&a!==b){
  add(changes,'the system changes from '+(setupNames[a]||readable(a))+' to '+(setupNames[b]||readable(b)));
  if(b==='passive_separates'){
   add(mayPrefer,'you want to replace or upgrade the amplifier and speakers independently');
   add(tradeoffs,'Check amplifier load permission, source inputs, speaker cable and available space.');
  }else if(b==='consumer_powered_pair'){
   add(mayPrefer,'you want fewer separate boxes and simpler speaker-level wiring');
   add(tradeoffs,'The built-in amplifier cannot be replaced independently, and inputs/subwoofer routing depend on the model.');
  }else if(b==='active_studio'){
   add(mayPrefer,'your listening is mainly nearfield and you can accommodate two powered cabinets');
   add(tradeoffs,'Allow for two power feeds and a reliable stereo level-control and input path.');
  }else if(b==='party_pa'){
   add(mayPrefer,'you need audience coverage, portability or microphone inputs');
   add(tradeoffs,'A single PA cabinet may be mono, and clean output at audience distance remains unverified.');
  }else if(b==='headphone_first'){
   add(mayPrefer,'personal rather than room-filling listening is more useful');
   add(tradeoffs,'Fit, isolation, cable connection and headphone-drive requirements replace room/speaker considerations.');
  }
 }
 if(a==='headphone_first'&&b==='headphone_first'){
  const af=hpStyle(base),bf=hpStyle(alt);
  if(af&&bf&&af!==bf){
   add(changes,'the listening format changes from '+af+' to '+bf);
   if(bf==='closed-back'){
    add(mayPrefer,'you listen around other people or microphones and need less sound leakage');
    add(tradeoffs,'Closed construction alone cannot establish tonal balance or how many dB it isolates.');
   }else if(bf==='in-ear'){
    add(mayPrefer,'portability and a well-sealed in-ear fit suit your environment');
    add(tradeoffs,'Tip fit and seal strongly affect comfort and bass; check for source hiss.');
   }else{
    add(mayPrefer,'you listen in a quiet room and do not need sound isolation');
    add(tradeoffs,'Open backs leak audio and do not automatically produce a wider soundstage.');
   }
  }else{
   add(changes,'both remain '+(bf||'wired')+' headphones, but fit, driver tuning and source demands are model-specific');
   add(mayPrefer,'you find its fit or measured/listened-to frequency balance better at matched volume');
   add(tradeoffs,'An enclosure label or price does not establish separation, bass quality or imaging.');
  }
  const ba=dataFor(catalog,base),bb=dataFor(catalog,alt);
  const ia=ba?.facts?.nominalImpedanceOhms?.value;
  const ib=bb?.facts?.nominalImpedanceOhms?.value;
  if(isNum(ia)&&isNum(ib)&&ia!==ib){
   add(changes,'manufacturer-listed nominal impedance changes from '+ia+' Ω to '+ib+' Ω');
   add(tradeoffs,'Impedance alone cannot tell you which headphone is easier to drive.');
  }
  const sa=ba?.facts?.sensitivityDb?.value,sb=bb?.facts?.sensitivityDb?.value;
  const basisA=ba?.facts?.sensitivityBasis?.value,basisB=bb?.facts?.sensitivityBasis?.value;
  if(isNum(sa)&&isNum(sb)&&basisA===basisB&&basisA&&sa!==sb){
   const units=basisA==='dB_SPL_per_V'?'dB SPL per volt':
     basisA==='dB_SPL_per_mW'?'dB SPL per milliwatt':'dB at the manufacturer's reference';
   add(changes,'published sensitivity changes from '+sa+' to '+sb+' '+units);
   add(tradeoffs,'Sensitivity standards and measurement conditions may differ. Verify required output for your target level.');
  }
 }
 if(b==='passive_separates'&&a==='passive_separates'){
  const sameSpeaker=base.speakerModel&&base.speakerModel===alt.speakerModel;
  const sameAmp=(base.amplifierModel||base.ownedAmpName)&&
   (base.amplifierModel||base.ownedAmpName)===(alt.amplifierModel||alt.ownedAmpName);
  if(sameSpeaker){
   add(changes,'the speakers stay the same while the amplifier or source/features change');
   add(mayPrefer,'the alternative offers a documented input, control, connectivity or clean-power requirement you actually need');
   add(tradeoffs,'Different amplifier watts or brands are not proof of different sound with an adequately driven load.');
  }else if(sameAmp||alt.ownedAmpName){
   add(changes,'the amplifier is retained and the speakers change');
   add(mayPrefer,'the new speaker’s placement, bandwidth, sensitivity or usable peak output better suits your room');
   add(tradeoffs,'A sensitivity or cabinet-size difference alone cannot prove greater clean maximum SPL, bass extension or imaging.');
  }else{
   add(changes,'the amplifier/speaker combination changes, so inputs, physical footprint, drive requirements and future flexibility may differ');
   add(mayPrefer,'the new package better fits your source connections, room size or upgrade plans');
   add(tradeoffs,'Compare real speaker sensitivity, impedance minima and amplifier limits before claiming more headroom.');
  }
  const x=base.speakerValues,y=alt.speakerValues;
  if(isNum(x?.sensitivity)&&isNum(y?.sensitivity)&&x.basis===y.basis&&
     x.sensitivityEnvironment===y.sensitivityEnvironment&&x.sensitivity!==y.sensitivity){
   const basis=y.basis==='power'?'1 W at 1 m':'2.83 V at 1 m';
   const qualifier=y.sensitivityEnvironment==='in_room'?'in-room':'at the reported reference';
   add(changes,'published speaker sensitivity is '+y.sensitivity+' versus '+x.sensitivity+' dB ('+basis+', '+qualifier+')');
   add(tradeoffs,'These are different manufacturers’ published values, not standardized comparative clean-output measurements.');
  }
 }
 if((a==='consumer_powered_pair'||a==='active_studio')&&a===b){
  add(changes,'both include speaker amplification, but the cabinets, supplied inputs and installation differ');
  add(mayPrefer,'the alternative better fits your available space, source input or desired subwoofer connection');
  add(tradeoffs,'Cabinet size and advertised watts do not establish deeper bass or cleaner peaks without comparable response/output measurements.');
 }
 if(a==='party_pa'&&b==='party_pa'){
  if(base.power!==alt.power){
   add(changes,'the power requirement changes from '+readable(base.power)+' to '+readable(alt.power));
   add(mayPrefer,alt.power==='battery'?'you need to operate away from mains electricity':'you have reliable mains power and do not need battery operation');
  }else add(changes,'the transport, signal inputs and cabinet arrangement may differ');
  add(tradeoffs,'Compare actual coverage, number of cabinets, transport weight and sustained clean output before choosing.');
  add(mayPrefer,'the alternative’s microphone/input or portability layout matches the event better');
 }
 const added=Array.isArray(alt.connections)?alt.connections.filter(c=>!base.connections?.includes(c)):[];
 if(added.length){
  add(changes,'the listed source options add '+added.map(x=>x.toUpperCase()).join(', '));
  add(mayPrefer,'you want one of those inputs without an external converter');
  add(tradeoffs,'Confirm whether that input is on the exact model and supports your source format.');
 }
 const bassA=base.bassSetup,bassB=alt.bassSetup;
 if(Boolean(bassA)!==Boolean(bassB)){
  add(changes,bassB?'this example adds a subwoofer':'this alternative omits the subwoofer');
  add(mayPrefer,bassB?'you want to investigate deeper bass and can accommodate another cabinet':'you prefer a simpler stereo system with fewer components');
  add(tradeoffs,bassB?'Check the sub input, crossover, placement and whether the mains are actually high-passed.':'The main speakers still carry the low-frequency workload.');
 }else if(bassA&&bassB&&bassA.label!==bassB.label){
  add(changes,'the documented subwoofer routing/crossover approach changes');
  add(mayPrefer,'its high-pass, input or bass-management controls better fit the main speakers');
  add(tradeoffs,'A sub output does not automatically high-pass the main speakers.');
 }
 if(isNum(base.subtotal)&&isNum(alt.subtotal)&&base.subtotal!==alt.subtotal){
  const more=alt.subtotal>base.subtotal;
  add(changes,'the listed equipment subtotal is '+(more?'higher':'lower')+
    ' by '+Math.abs(alt.subtotal-base.subtotal).toFixed(2)+' '+String(request.currency||'local currency'));
  add(mayPrefer,more?'the added features or flexibility justify the extra expense':'you want a lower listed starting cost');
  add(tradeoffs,'These are partial dated price references, not current complete-system quotations.');
 }
 if(alt.upgradeComparedTo||alt.compareAgainst){
  const baseline=alt.upgradeComparedTo||alt.compareAgainst?.model;
  add(changes,'this is being compared with your currently owned '+baseline);
  add(mayPrefer,'an actual limitation of your current setup is demonstrated for '+preferredGoal(request));
  add(tradeoffs,'Do not replace working equipment on the assumption that different automatically means better.');
 }
 if(!changes.length){
  add(changes,'the exact model or system parts differ, but the catalogue does not establish a measured sound-quality advantage');
  add(mayPrefer,'a fit, input, setup or level-matched listening comparison identifies a meaningful benefit');
  add(tradeoffs,'Keep the first option unless a real requirement or preference justifies switching.');
 }
 if(!mayPrefer.length)add(mayPrefer,'the changed equipment better suits '+preferredGoal(request));
 if(!tradeoffs.length)add(tradeoffs,'Check the exact connections, performance evidence and full local cost before switching.');
 return {
  baseline:label(base),alternative:label(alt),
  change:clamp(uniq(changes).slice(0,3).join('; '),430),
  preference:clamp(uniq(mayPrefer).slice(0,2).join('; '),330),
  tradeoff:clamp(uniq(tradeoffs).slice(0,2).join(' '),330),
  summary:'Compared with '+label(base)+', '+label(alt)+': '+clamp(uniq(changes).slice(0,2).join('; '),250)+'.'
 };
}
/** Electronics are already independently source-matched; compare roles,
 * available physical outputs and documented rating conditions, not "clarity". */
export function compareElectronic(base,candidate){
 if(!base||!candidate||base.id===candidate.id)return null;
 let change,prefer,tradeoff;
 if(base.type!==candidate.type){
  change='the component role changes from '+base.label+' to '+candidate.label;
  prefer='you need '+(candidate.type==='dac'?'a digital-to-analogue RCA line source':
    candidate.type==='combo'?'USB conversion and a headphone socket in one unit':
    'analogue headphone amplification after an existing DAC');
  tradeoff='This change may require a different cable, source output or another box; it is not a demonstrated sonic upgrade.';
 }else if(candidate.type==='amp'){
  change='both are analogue headphone amplifiers with manufacturer-documented output specifications';
  prefer='its published output at your headphone load, gain options, output impedance or controls solve a documented need';
  tradeoff='Different rated watts and prices do not automatically sound different. Match the test load and distortion conditions before comparing power.';
 }else if(candidate.type==='dac'){
  change='both are standalone DACs feeding RCA line-level outputs';
  prefer='its supported digital inputs, controls or documented line-level output meet your source needs better';
  tradeoff='A standalone DAC cannot power headphones by itself; additional price or DAC chips do not prove an audible difference.';
 }else{
  change='both convert digital audio and provide a headphone-amplified output';
  prefer='its documented USB compatibility, power supply, physical controls or output sockets suit your use better';
  tradeoff='Confirm phone/PC compatibility, plugs and headphone load-specific output; a second DAC is not intrinsically clearer.';
 }
 return {baseline:base.model,alternative:candidate.model,change,preference:prefer,tradeoff,
  summary:'Compared with '+base.model+', '+candidate.model+': '+change+'.'};
}
