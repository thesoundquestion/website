/**
 * Start with the visitor's task, not an equipment-specification form.
 * These rules only control which existing fields are shown in the simple
 * interface and how the already-present ownership branches are selected.
 * This module does NOT alter amplifier power, impedance or pricing math.
 */
import {UNLISTED_FIELDS,unlistedSpecAssessment} from './unlisted-gear.mjs';

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
    fields:['speaker','speakerOther','amp','ampOther','source','sourceOther','headphone','headphoneOther','goal','useCase','level','region','budget'],
    architecture:null,
    requiredOwn:null,
    resultTitle:'What to keep, check or improve'
  },
  subwoofer:{
    label:'Add a subwoofer to my system',
    description:'Start with the amplifier or speakers you have, then tell us what connections are available. We will show the wiring, any extra hardware and whether the main speakers lose bass.',
    fields:['amp','ampOther','speaker','speakerOther','subOwned','subName','subAmpOutput','subInput','subHighPass','region','budget'],
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
/**
 * Form copy and validation share this rule. For a user supplying an owned model,
 * the dropdown and free-text entry are alternatives: one is needed, not both.
 * Do not apply HTML 'required' to either individual control.
 */
export function builderFieldRequirement(id,fieldName){
  if(fieldName==='buildIntent'||(id==='headphones'&&fieldName==='headphoneAmpChoice'))return 'required';
  // A source link improves provenance but is not a prerequisite for
  // discovery based on meaningful user-entered numerical specifications.
  if(/^(?:speaker|amp|source|headphone)SpecUrl$/.test(fieldName))return 'optional';
  if(fieldName==='ampMinLoad')return 'optional'; // A rated load can conservatively guide initial discovery.
  if(fieldName==='speakerPowerType' && id==='amp_for_speakers')return 'required_if_unlisted';
  const plan=BUILDER_INTENTS[id];
  if(!plan)return 'optional';
  if(plan.requiredOwn&&fieldName===plan.requiredOwn)return 'required_either';
  if(plan.requiredOwn&&fieldName===plan.requiredOwn+'Other')return 'optional_alternative';
  if(plan.requiredOwn&&UNLISTED_FIELDS[plan.requiredOwn]?.includes(fieldName))return 'required_if_unlisted';
  return 'optional';
}
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
  if((id==='headphones'||formData.get('architecture')==='headphone_first')&&
      !['yes','no','unsure'].includes(formData.get('headphoneAmpChoice')))
    return {ok:false,message:'Choose whether you would like a headphone amplifier, prefer not to add one, or want help deciding.'};
  if(plan.requiredOwn){
    const type=plan.requiredOwn;
    if(empty(formData.get(type))){
      const word=type==='speaker'?'speakers':'amplifier or receiver';
      if(empty(formData.get(type+'Other')))
        return {ok:false,message:'Choose your '+word+' from the sourced catalogue, or use Search for my gear to find its documented specifications.'};
      if(id==='amp_for_speakers' && formData.get('speakerPowerType')==='powered')
        return {ok:false,message:'These speakers already have amplification built in. You do not need a separate power amplifier. Use Improve the system I already have for source and connection advice.'};
      const assessment=unlistedSpecAssessment(type,formData,{requireForMatch:true});
      if(assessment.state!=='provisional')
        return {ok:false,message:assessment.message};
      if(id==='amp_for_speakers' && formData.get('speakerPowerType')!=='passive')
        return {ok:false,message:'Are these passive speakers? Passive speakers need a separate amplifier. Powered speakers already have one built in. Check the model manual before requesting an amplifier match.'};
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
      id==='improve_existing'?['speaker','amp','source','headphone']:
      id==='subwoofer'?['speaker','amp']:
      id==='complete_system'?[]:
      id==='headphones'?[]:[];
    for(const type of ['speaker','amp','source','headphone']){
      if(!keep.includes(type)){
        data.set(type,'');data.set(type+'Other','');
        for(const field of (UNLISTED_FIELDS[type]||[]))data.set(field,'');
        if(type==='speaker')for(const field of ['speakerMinimum','speakerSensitivity','speakerBasis','speakerSensitivityEnvironment','speakerAnechoic','speakerRecommendedAmpMin','speakerRecommendedAmpMax','speakerMaxInput'])data.set(field,'');
      }
    }
    for(const key of ['secondary'])data.delete(key);
    data.set('subMode','no_sub');
  }
  // The equipment being purchased is never an "owned" model merely
  // because an old choice is still present in a hidden or advanced field.
  if(id==='amp_for_speakers'){
    data.set('amp','');data.set('ampOther','');
    for(const field of UNLISTED_FIELDS.amp)data.set(field,'');
  }
  if(id==='speakers_for_amp'){
    data.set('speaker','');data.set('speakerOther','');
    for(const field of [...UNLISTED_FIELDS.speaker,'speakerMinimum','speakerSensitivity','speakerBasis'])data.set(field,'');
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
  if(data.get('architecture')!=='headphone_first'){
    data.set('headphoneAmpChoice','');
    data.set('headphoneSource','unknown');
  }
  return data;
}
