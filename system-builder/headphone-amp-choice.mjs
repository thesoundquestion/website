/**
 * Source-aware headphone electronics planning.
 * A named device requires a matching source route and manufacturer-backed
 * catalogue record. No headphone output level, noise performance or price is
 * inferred from its name or from impedance alone.
 */
const ROUTES=Object.freeze({
  unknown:{label:'your music source',mode:null},
  phone_usb:{label:'your USB-audio phone or tablet',mode:'usb_mobile'},
  computer_usb:{label:'your USB-audio computer',mode:'usb_desktop'},
  analog_line:{label:'your player or DAC with an RCA line output',mode:'analog'},
  headphone_jack:{label:'your phone or computer headphone socket',mode:'headphone'},
  receiver_headphones:{label:'your receiver headphone socket',mode:'headphone'}
});
const IDS=Object.freeze({
  amp:['research/headphone_amplifier/jds-atom-amp-2',
    'research/headphone_amplifier/schiit-magni-6',
    'research/headphone_amplifier/topping-l30-ii'],
  dac:['legacy/source/schiit-modi-rca',
    'legacy/source/smsl-su-1-rca',
    'legacy/source/topping-e30-ii-rca'],
  comboDesktop:['legacy/source/fiio-k11-rca-line-out',
    'research/headphone_amplifier/fiio-q11'],
  comboMobile:['research/headphone_amplifier/fiio-q11']
});
const TYPES={amp:'Headphone amplifier',dac:'Standalone DAC',combo:'DAC + headphone amplifier'};
const DAC=new Set(['none','separate','combo','unsure']);
const AMP=new Set(['yes','no','unsure']);
const routeOf=source=>ROUTES[source]||ROUTES.unknown;
const digital=mode=>mode==='usb_desktop'||mode==='usb_mobile';
const sourceCheck=route=>digital(route.mode)
 ?'Confirm the source supports USB audio, the correct USB cable or adapter and any external power the equipment needs.'
 :route.mode==='analog'
  ?'Confirm a genuine stereo RCA line output. A DAC cannot accept that analogue signal as a digital input.'
  :route.mode==='headphone'
   ?'A headphone socket already contains amplification. Verify its drive, noise and volume control before spending on another box.'
   :'Find out whether the music source has USB digital audio, RCA line out or an actual headphone socket before selecting electronics.';
function sourced(record,id,type){
  if(!record)return null;
  if(type==='dac'&&!record.categories?.includes('source'))return null;
  if(type!=='dac'&&!record.categories?.includes('headphone_amplifier'))return null;
  const hasDac=record.facts?.hasBuiltInDac?.value;
  if(type==='dac'&&record.categories?.includes('headphone_amplifier'))return null;
  if(type==='amp'&&hasDac!==false)return null;
  if(type==='combo'&&hasDac!==true)return null;
  const evidence=record.evidence?.find(e=>typeof e?.url==='string'&&e.url.startsWith('https://'));
  if(!evidence)return null;
  return {id,model:record.model.replace(/\s+\((?:RCA|RCA line out)\)$/i,''),
    type,label:TYPES[type],sourceUrl:evidence.url,
    note:type==='amp'?'Analogue headphone amplifier. Requires a compatible line-level input and a suitable headphone-output socket.':
      type==='dac'?'Converts digital audio to analogue RCA line-level signals. It does NOT directly power passive wired headphones.':
      'Receives USB digital audio and provides a headphone-amplified output. Check available input and headphone connectors.'};
}
function get(catalog,id,type){
 const r=catalog?.records?.find(r=>r.id===id);
 return sourced(r,id,type);
}
function candidates(catalog,ids,type){return ids.map(id=>get(catalog,id,type)).filter(Boolean);}
function choices(request){
 const choice=AMP.has(request.headphoneAmpChoice)?request.headphoneAmpChoice:'';
 // Backward compatibility for older embedded/guide handoffs, which initially
 // had only an amplifier question; new UI always asks both questions.
 const dacChoice=DAC.has(request.headphoneDacChoice)?request.headphoneDacChoice:
   'legacy';
 return {choice,dacChoice};
}
export function headphoneAmplifierPlan(request={},catalog=null){
 const {choice,dacChoice}=choices(request);
 if(!choice)return null;
 const route=routeOf(request.headphoneSource);
 const check=sourceCheck(route);
 const make=(type,ids)=>candidates(catalog,ids,type);
 const amps=make('amp',IDS.amp),dacs=make('dac',IDS.dac);
 const combos=make('combo',route.mode==='usb_mobile'?IDS.comboMobile:IDS.comboDesktop);
 let components=[],alternatives=[],issue='',configuration='none';
 if(choice==='no'&&dacChoice==='combo'){
  issue='A combined DAC/headphone amplifier includes amplification. Change the amplifier choice to Yes if you want a combined unit.';
 }else if(choice==='yes'){
  if(dacChoice==='combo'||(dacChoice==='legacy'&&digital(route.mode))||
      (dacChoice==='unsure'&&digital(route.mode))){
    configuration='combo';
    if(digital(route.mode)){components=combos.slice(0,1);alternatives=combos.slice(1,3);}
    else issue='A USB DAC/amp needs a compatible digital input. Your selected source is not confirmed to provide one; an RCA line output cannot be fed into a USB-only DAC/amp.';
  }else if(dacChoice==='separate'){
    configuration='stack';
    if(route.mode==='usb_desktop'){
      components=[dacs[0],amps[0]].filter(Boolean);
      alternatives=[...dacs.slice(1,3),...amps.slice(1,2)];
      if(components.length!==2)issue='A complete separate DAC + headphone-amplifier stack could not be verified from the source catalogue.';
    }else if(route.mode==='usb_mobile')issue='A phone-to-separate-DAC-and-amp stack needs model-specific USB audio and power compatibility; no complete portable stack is verified here.';
    else issue='A standalone DAC requires a DIGITAL input. Confirm a digital output from your player before adding a DAC and a separate headphone amplifier.';
  }else{
    configuration='amp';
    if(route.mode==='analog'){
      components=amps.slice(0,1);alternatives=amps.slice(1,3);
    }else issue='An amplifier-only purchase needs a suitable analogue line-level output. USB digital audio must be converted by a DAC first, and a headphone socket is not automatically a suitable amplifier input.';
  }
 }else if(dacChoice==='separate'){
   configuration='dac';
   if(route.mode==='usb_desktop'){
    components=dacs.slice(0,1);alternatives=dacs.slice(1,3);
   }else issue='A separate DAC must receive an appropriate digital signal. Confirm USB audio and power compatibility before choosing a model for this source.';
 }
 if(choice==='no'&&dacChoice==='separate'){
   issue=(issue?issue+' ':'')+'A standalone DAC alone has RCA line outputs, not a headphone amplifier. You must already have a suitable headphone amplifier or another documented headphone output to finish the chain.';
 }
 if(choice==='unsure'&&dacChoice!=='separate')
   issue=(issue?issue+' ':'')+'A dedicated headphone amplifier or DAC may offer no practical improvement if an existing headphone output already meets your listening requirements.';
 if((choice==='no'||choice==='unsure')&&(dacChoice==='none'||dacChoice==='legacy')){
   issue=(issue?issue+' ':'')+
    (route.mode==='analog'?'An RCA line output cannot drive headphones by itself.':
      digital(route.mode)?'A USB-only source needs a device that supplies a real headphone output.':'Use a suitable existing headphone output.');
 }
 if(!components.length&&choice==='yes'&&!issue)issue='No complete documented electronics pairing was found for the selected source.';
 const model=components.find(c=>c.type==='amp'||c.type==='combo')?.model||null;
 const dacModel=components.find(c=>c.type==='dac')?.model||null;
 const hasDac=components.some(c=>c.type==='combo'||c.type==='dac');
 const input=components.some(c=>c.type==='combo')?'usb':
   components.some(c=>c.type==='amp')?'rca':null;
 const included=components.length?components.map(c=>c.model).join(' + '):null;
 const statement=included
   ?'Documented electronics options: '+included+'. These devices are candidates for the selected source route, not verified drive matches to every headphone.'
   :choice==='no'?'No separate headphone amplifier requested.':
    choice==='unsure'?'We will help you decide whether additional electronics are needed.':
    'A headphone amplifier was requested, but no complete verified source route can yet be recommended.';
 const summary=statement+' '+(issue?issue+' ':'')+check+
   (components.length?' Prices for the added electronics are not included in the headphone subtotal.':'');
 return {choice,dacChoice,sourceLabel:route.label,sourceMode:route.mode,check,
   configuration,model,dacModel,hasDac,input,components,alternatives,
   issue,summary};
}
export function applyHeadphoneAmpChoice(shortlist={},request={},catalog=null){
 const plan=headphoneAmplifierPlan(request,catalog);
 if(!plan||!Array.isArray(shortlist.selected))return shortlist;
 return {...shortlist,selected:shortlist.selected.map(item=>{
  if(item.architecture!=='headphone_first')return item;
  const parts=plan.components.map(c=>({name:c.model,count:1,
    role:c.type==='dac'?'New standalone DAC; requires an amplifier with a headphone output':
      c.type==='amp'?'New analogue headphone amplifier, source must provide line out':
      'New combined USB DAC and headphone amplifier',url:c.sourceUrl}));
  const extra=[plan.check,'Check the exact headphone sensitivity, impedance, required loudness, connector, output noise and gain before calling the electronics a match.'];
  if(plan.issue)extra.unshift(plan.issue);
  return {...item,headphoneAmpPlan:plan,parts:[...(item.parts||[]),...parts],
    extra:[...(item.extra||[]),...extra],tradeoff:(item.tradeoff||'')+
    (parts.length?' Added electronics have no verified current local price in the headphone subtotal.':'')};
 })};
}
