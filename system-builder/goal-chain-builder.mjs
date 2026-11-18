/**
 * Specialist System Builder, sharing the catalogue and evidence engines with
 * the recording/headphone checkers. Original listening app.mjs is untouched.
 */
import {loadEquipmentCatalog} from '../equipment/catalog-client.mjs';
import {CHAIN_MODES,CHAIN_MODE_IDS,buildGoalChain} from './goal-chain-engine.mjs';
import {loadRegionalPriceTiers,regionalPriceLabel} from '../equipment/price-tier-client.mjs';

const $=id=>document.getElementById(id);
const mode=$('sb-purpose-select'),panel=$('sb-purpose-panel'),form=$('sb-purpose-form');
const status=$('sb-purpose-status'),result=$('sb-purpose-result'),body=$('sb-purpose-result-body');
const oldForm=$('sb-form'),oldResults=$('sb-results'),oldIntro=$('sb-listening-intro');
const oldMethod=document.querySelector('.sb-method');
const controls={
  microphone:$('sb-purpose-microphone'),capture:$('sb-purpose-input'),count:$('sb-purpose-count'),
  headphone:$('sb-purpose-headphone'),output:$('sb-purpose-output'),
  pa:$('sb-purpose-pa'),speaker:$('sb-purpose-tv-speaker'),independent:$('sb-purpose-tracks')
};
const catalogById=new Map();
let catalog=null,prices=null,loadPending=null,pricingError=false;
const captureModes=new Set(['vocal','songwriter','drums','band','podcast','stream','live']);
const recModes=new Set(['vocal','songwriter','drums','band','podcast','stream']);
function text(tag,value,cls){
  const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=value;return el;
}
function addOption(select,record){
  const option=document.createElement('option');option.value=record.id;
  const tier=regionalPriceLabel(prices,record.id,{region:'CA'});
  option.textContent=record.model+(tier?' · '+tier.label+' (CA)':'');
  select.append(option);
}
function populate(select,items,preferred){
  const selected=select.value;
  select.replaceChildren();
  const none=document.createElement('option');none.value='';none.textContent='Not chosen / not in catalogue';select.append(none);
  for(const record of items.sort((a,b)=>a.model.localeCompare(b.model)))addOption(select,record);
  const byModel=items.find(x=>x.model===preferred)?.id;
  if(items.some(x=>x.id===selected))select.value=selected;
  else if(byModel)select.value=byModel;
}
async function loadOnce(){
  if(catalog)return catalog;
  if(loadPending)return loadPending;
  loadPending=(async()=>{
    catalog=await loadEquipmentCatalog();
    for(const record of catalog.records)catalogById.set(record.id,record);
    try{prices=await loadRegionalPriceTiers()}catch{pricingError=true}
    const records=catalog.records;
    populate(controls.microphone,records.filter(x=>x.categories.includes('microphone')),'FIFINE K669D');
    populate(controls.capture,records.filter(x=>x.categories.some(c=>['audio_interface','mixer_recorder'].includes(c))),'M-Audio M-Track Solo');
    populate(controls.headphone,records.filter(x=>x.categories.includes('headphone')),'Grado SR80e');
    const outputCandidates=records.filter(x=>x.connections?.outputs?.some(p=>
      /headphone|6[._]35mm_single_ended|4[._]4mm_balanced/i.test(p.type||'')));
    populate(controls.output,outputCandidates,'JDS Labs Atom Amp 2');
    populate(controls.pa,records.filter(x=>x.facts?.speakerKind?.value==='powered_pa_speaker'),'QSC K12.2');
    populate(controls.speaker,records.filter(x=>x.categories.includes('speaker')),'Paradigm Phantom v1');
    return catalog;
  })().catch(error=>{loadPending=null;throw error});
  return loadPending;
}
function visible(selector,show){
  for(const node of document.querySelectorAll(selector))node.hidden=!show;
}
async function showMode(){
  const id=mode.value;
  const listening=id==='listening';
  oldForm.hidden=!listening;
  oldIntro.hidden=!listening;
  if(oldMethod)oldMethod.hidden=!listening;
  if(!listening)oldResults.hidden=true;
  panel.hidden=listening;
  if(listening){status.textContent='';return}
  $('sb-purpose-description').textContent=CHAIN_MODES.find(x=>x.id===id)?.description||'';
  visible('.sb-capture',captureModes.has(id));
  visible('.sb-headphone',id==='headphones'||recModes.has(id));
  visible('.sb-headphone-output',id==='headphones');
  visible('.sb-count',captureModes.has(id));
  visible('.sb-tracks',recModes.has(id));
  visible('.sb-live',id==='live');
  visible('.sb-tv',id==='tv');
  result.hidden=true;body.replaceChildren();
  try{
    await loadOnce();
    status.textContent='Choose the components you own or are considering. Unknown or unverified details remain explicit.';
  }catch{
    status.textContent='Shared catalogue unavailable. Specialist builder cannot evaluate actual equipment.';
  }
}
function addList(parent,title,items){
  if(!items?.length)return;
  const section=text('section','');const heading=text('h4',title);section.append(heading);
  const list=document.createElement('ul');
  for(const item of items)list.append(text('li',item));
  section.append(list);parent.append(section);
}
function render(plan){
  body.replaceChildren();
  const chain=text('section','');chain.append(text('h4','What each part does'));
  const ordered=document.createElement('ol');
  for(const entry of plan.stages){
    const li=document.createElement('li');
    li.append(text('strong',entry.name+': '+entry.device),text('p',entry.reason));
    ordered.append(li);
  }
  chain.append(ordered);body.append(chain);
  if(plan.checks.length){
    const section=text('section','');section.append(text('h4','Documented capacities and limitations'));
    const list=document.createElement('ul');
    for(const item of plan.checks){
      const li=text('li',item.text,'sb-chain-'+item.status.replace(/[^a-z_]/g,''));
      const heading=text('strong',item.status==='known_limit'?'Known limit: ':item.status==='needs_check'||item.status==='unverified'?'Needs verification: ':'Published evidence: ');
      li.prepend(heading);list.append(li);
    }
    section.append(list);body.append(section);
  }
  addList(body,'What else to check',plan.notes);
  const next=text('section','');next.append(text('h4','Read the relevant lessons'));
  const ul=document.createElement('ul');
  for(const href of plan.lessons){
    const li=document.createElement('li'),link=document.createElement('a');
    link.href=href;
    link.textContent=href.includes('audio-interfaces')?'Audio interfaces and mixers':
      href.includes('headphone')?'Headphones and outputs':
      href.includes('speaker-types')?'Speaker types and their jobs':
      href.includes('microphone-types')?'Microphone types and uses':
      href.includes('recording-sources')?'How recording begins':'Learn the signal path';
    li.append(link);ul.append(li);
  }
  next.append(ul);body.append(next,text('p',plan.disclaimer,'sb-chain-disclaimer'));
  result.hidden=false;
}
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!catalog){status.textContent='Equipment catalogue not loaded yet.';return}
  const count=Number(controls.count.value);
  if(!Number.isInteger(count)||count<1||count>32){
    status.textContent='Enter between 1 and 32 simultaneous microphones.';
    controls.count.focus();return;
  }
  try{
    const plan=buildGoalChain(catalog,{
      mode:mode.value,microphoneId:controls.microphone.value,captureId:controls.capture.value,
      headphoneId:controls.headphone.value,headphoneOutputId:controls.output.value,
      paSpeakerId:controls.pa.value,speakerId:controls.speaker.value,
      microphoneCount:count,independentTracks:controls.independent.checked
    });
    render(plan);
    status.textContent='Signal-chain plan ready. All unverified requirements are identified below.';
    result.scrollIntoView({block:'start',behavior:'auto'});
  }catch{
    status.textContent='The selected components could not be assessed. Recheck the equipment fields.';
    result.hidden=true;
  }
});
mode.addEventListener('change',()=>{
  const url=new URL(location.href);
  if(mode.value==='listening')url.searchParams.delete('goal');else url.searchParams.set('goal',mode.value);
  history.replaceState(null,'',url);
  showMode();
});
const requested=new URLSearchParams(location.search).get('goal');
if(requested&&CHAIN_MODE_IDS.has(requested))mode.value=requested;
showMode();
