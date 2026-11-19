/**
 * Start with the visitor's task, not an equipment-specification form.
 * These rules only control which existing fields are shown in the simple
 * interface and how the already-present ownership branches are selected.
 * This module does NOT alter amplifier power, impedance or pricing math.
 */
export const BUILDER_INTENTS=Object.freeze({
  amp_for_speakers:{
    label:'Find an amplifier for my speakers',
    description:'Tell us which speakers you own. You do not need amplifier specifications when you are shopping for an amplifier.',
    fields:['speaker','speakerOther','goal','useCase','distanceFt','level','region','budget'],
    architecture:'passive_separates',
    requiredOwn:'speaker',
    resultTitle:'Amplifiers for the speakers you already own'
  },
  speakers_for_amp:{
    label:'Find speakers for my amplifier',
    description:'Tell us which amplifier or receiver you own. You do not need to choose speakers before we can suggest some.',
    fields:['amp','ampOther','goal','useCase','distanceFt','level','region','budget'],
    architecture:'passive_separates',
    requiredOwn:'amp',
    resultTitle:'Speakers for your existing amplifier'
  },
  complete_system:{
    label:'Build a complete listening system',
    description:'Start with how and where you listen. We can suggest a whole system without requiring you to own or enter any equipment.',
    fields:['goal','architecture','useCase','level','region','budget'],
    architecture:null,
    requiredOwn:null,
    resultTitle:'Complete system options for your listening needs'
  },
  improve_existing:{
    label:'Improve the system I already have',
    description:'Start with what you own and what you would like to change. Reusing your existing equipment is a successful answer.',
    fields:['speaker','speakerOther','amp','ampOther','goal','useCase','level','region','budget'],
    architecture:null,
    requiredOwn:null,
    resultTitle:'What to keep, check or improve'
  },
  subwoofer:{
    label:'Add a subwoofer to my system',
    description:'Start with the amplifier or speakers you have, then tell us what connections are available. We will show the wiring, any extra hardware and whether the main speakers lose bass.',
    fields:['amp','ampOther','speaker','speakerOther','subName','subAmpOutput','subInput','subHighPass','region','budget'],
    architecture:null,
    requiredOwn:null,
    resultTitle:'How a subwoofer would connect to your system',
    dedicatedSubRoute:true
  },
  headphones:{
    label:'Find headphones for how I listen',
    description:'Tell us where you will use them. A separate headphone amp or DAC is not automatically required.',
    fields:['headphoneUse','headphoneFit','useCase','region','budget'],
    architecture:'headphone_first',
    requiredOwn:null,
    resultTitle:'Headphone listening options'
  },
  source_connections:{
    label:'Connect a turntable, CD player or digital source',
    description:'This is a connection question, not an amplifier/speaker shopping question. Use the guided source paths so we do not invent the inputs on your equipment.',
    fields:[],
    architecture:null,
    requiredOwn:null,
    directRoute:true,
    resultTitle:'Find the correct source connection'
  }
});
const empty=(x)=>!String(x??'').trim();
export function builderIntent(id){return BUILDER_INTENTS[id]||null;}
export function handoffBuilderIntent(handoff){
  if(!handoff)return '';
  if(handoff.intent==='match'){
    if(handoff.answers?.owned==='amp')return 'speakers_for_amp';
    if(handoff.answers?.owned==='speakers')return 'amp_for_speakers';
    if(handoff.answers?.owned==='both')return 'improve_existing';
    return 'complete_system';
  }
  if(handoff.intent==='improve')return 'improve_existing';
  if(handoff.intent==='headphones')return 'headphones';
  if(['vinyl','digital','hifi','tv'].includes(handoff.intent))return 'complete_system';
  return '';
}
export function validateBuilderIntent(id,formData){
  const plan=builderIntent(id);
  if(!plan)return {ok:false,message:'Choose what you want help with first.'};
  if(plan.directRoute)return {ok:false,message:'Use the source connection guide for this question.'};
  if(plan.requiredOwn){
    const type=plan.requiredOwn;
    if(empty(formData.get(type))&&empty(formData.get(type+'Other'))){
      const word=type==='speaker'?'speakers':'amplifier or receiver';
      return {ok:false,message:'Start by choosing your '+word+' model. If it is not in the list, enter its name in the other-model box. You do not need to enter the product you are shopping for.'};
    }
  }
  return {ok:true,message:''};
}
/** Keep only this task's relevant owned-model facts unless advanced options are
 * deliberately opened. Do not erase the user's actual form inputs while they
 * change tasks. A new task must not inherit a hidden previous input. */
export function scopedBuilderInputs(formData,id,advancedOpen=false){
  const data=new FormData();
  for(const [key,value] of formData.entries())data.append(key,value);
  const plan=builderIntent(id);
  if(!plan)return data;
  if(!advancedOpen){
    const keep=id==='amp_for_speakers'?['speaker']:
      id==='speakers_for_amp'?['amp']:
      id==='improve_existing'||id==='subwoofer'?['speaker','amp']:
      id==='complete_system'?[]:
      id==='headphones'?[]:[];
    for(const type of ['speaker','amp','source','headphone']){
      if(!keep.includes(type)){data.set(type,'');data.set(type+'Other','');}
    }
    for(const key of ['secondary'])data.delete(key);
    data.set('subMode','no_sub');
  }
  // The equipment being purchased is never an "owned" model merely
  // because an old choice is still present in a hidden or advanced field.
  if(id==='amp_for_speakers'){
    data.set('amp','');data.set('ampOther','');
  }
  if(id==='speakers_for_amp'){
    data.set('speaker','');data.set('speakerOther','');
  }
  if(id==='headphones'){
    data.set('headphone','');data.set('headphoneOther','');
  }
  if(id==='subwoofer'){
    data.set('subMode','plan_sub');
    data.set('subCount','1');
    if(!['yes','no','unknown'].includes(data.get('subOwned')))data.set('subOwned','no');
    // No full-system architecture is assumed from the presence of a sub.
    // The dedicated report checks amp/sub signal connectors independently.
  }
  if(plan.architecture)data.set('architecture',plan.architecture);
  return data;
}
