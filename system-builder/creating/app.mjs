/**
 * Specialist System Builder, sharing the catalogue and evidence engines with
 * the recording/headphone checkers. Original listening app.mjs is untouched.
 */
import {loadEquipmentCatalog} from '../../equipment/catalog-client.mjs';
import {CHAIN_MODES,CHAIN_MODE_IDS,buildGoalChain} from '../goal-chain-engine.mjs';
import {loadRegionalPriceTiers,regionalPriceLabel} from '../../equipment/price-tier-client.mjs';
import {preferVerifiedPriceTier,pricingPreferenceCoverage,validPricePreference} from '../../equipment/price-preference.mjs';

const $=id=>document.getElementById(id);
const mode=$('sb-purpose-select'),panel=$('sb-purpose-panel'),form=$('sb-purpose-form');
const status=$('sb-purpose-status'),result=$('sb-purpose-result'),body=$('sb-purpose-result-body');
const priceRegion=$('sb-price-region'),pricePreference=$('sb-price-preference'),priceEvidence=$('sb-price-evidence');
const controls={
  microphone:$('sb-purpose-microphone'),capture:$('sb-purpose-input'),count:$('sb-purpose-count'),
  headphone:$('sb-purpose-headphone'),monitor:$('sb-purpose-monitor'),
  pa:$('sb-purpose-pa'),independent:$('sb-purpose-tracks')
};
const catalogById=new Map();
let catalog=null,prices=null,loadPending=null,pricingError=false;
const captureModes=new Set(['vocal','songwriter','drums','band','podcast','stream','live']);
const recModes=new Set(['vocal','songwriter','drums','band','podcast','stream']);
const CREATING_MODE_IDS=new Set([...recModes,'live']);
function text(tag,value,cls){
  const el=document.createElement(tag);if(cls)el.className=cls;el.textContent=value;return el;
}
function addOption(select,record){
  const option=document.createElement('option');option.value=record.id;
  const tier=regionalPriceLabel(prices,record.id,{region:priceRegion.value});
  option.textContent=record.model+(tier?' · '+tier.label+' ('+priceRegion.value+')':'');
  select.append(option);
}
function populate(select,items,preferred){
  const selected=select.value;
  select.replaceChildren();
  const none=document.createElement('option');none.value='';none.textContent='Not chosen / not in catalogue';select.append(none);
  const alphabetical=[...items].sort((a,b)=>a.model.localeCompare(b.model));
  const ordered=preferVerifiedPriceTier(alphabetical,prices,{region:priceRegion.value,preference:validPricePreference(pricePreference.value)});
  for(const record of ordered)addOption(select,record);
  // Do not silently claim the visitor owns our example models.
  // Explicit choice is required; switching price categories preserves it.
  if(items.some(x=>x.id===selected))select.value=selected;
  else select.value='';
}
function refreshPriceOptions(){
  if(!catalog)return;
  const records=catalog.records;
  populate(controls.microphone,records.filter(x=>x.categories.includes('microphone')),'FIFINE K669D');
  populate(controls.capture,records.filter(x=>x.categories.some(c=>['audio_interface','mixer_recorder'].includes(c))),'M-Audio M-Track Solo');
  populate(controls.headphone,records.filter(x=>x.categories.includes('headphone')),'Grado SR80e');
  populate(controls.monitor,records.filter(x=>x.facts?.speakerKind?.value==='powered_studio_monitor'),'Yamaha HS5');
  populate(controls.pa,records.filter(x=>x.facts?.speakerKind?.value==='powered_pa_speaker'),'QSC K12.2');
  const candidates=[
    ...[controls.microphone,controls.capture,controls.headphone,controls.monitor,controls.pa]
      .flatMap(x=>[...x.options].map(o=>catalogById.get(o.value)).filter(Boolean))
  ];
  const unique=[...new Map(candidates.map(x=>[x.id,x])).values()];
  const coverage=pricingPreferenceCoverage(unique,prices,{region:priceRegion.value,preference:pricePreference.value});
  priceEvidence.textContent=coverage.note+' Only verified, current regional pricing labels influence display order; unknown models remain available. Price is not a sound-quality score.';
}
async function loadOnce(){
  if(catalog)return catalog;
  if(loadPending)return loadPending;
  loadPending=(async()=>{
    catalog=await loadEquipmentCatalog();
    for(const record of catalog.records)catalogById.set(record.id,record);
    try{prices=await loadRegionalPriceTiers()}catch{pricingError=true}
    refreshPriceOptions();
    return catalog;
  })().catch(error=>{loadPending=null;throw error});
  return loadPending;
}
function visible(selector,show){
  for(const node of document.querySelectorAll(selector))node.hidden=!show;
}
async function showMode(){
  const id=mode.value;
  if(!CREATING_MODE_IDS.has(id))return;
  panel.hidden=false;
  $('sb-purpose-description').textContent=CHAIN_MODES.find(x=>x.id===id)?.description||'';
  visible('.sb-capture',captureModes.has(id));
  visible('.sb-headphone',recModes.has(id));
  visible('.sb-monitor',recModes.has(id));
  visible('.sb-count',captureModes.has(id));
  visible('.sb-tracks',recModes.has(id));
  visible('.sb-live',id==='live');
  result.hidden=true;
  body.replaceChildren();
  try{
    await loadOnce();
    status.textContent='Choose your equipment and review documented limits and missing facts.';
  }catch{
    status.textContent='Shared equipment catalogue unavailable. The Creating Builder cannot evaluate specific equipment.';
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
      headphoneId:controls.headphone.value,
      paSpeakerId:controls.pa.value,
      monitorSpeakerId:controls.monitor.value,
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
priceRegion.addEventListener('change',()=>{refreshPriceOptions();result.hidden=true});
pricePreference.addEventListener('change',()=>{refreshPriceOptions();result.hidden=true});
mode.addEventListener('change',()=>{
  const url=new URL(location.href);
  if(mode.value==='listening')url.searchParams.delete('goal');else url.searchParams.set('goal',mode.value);
  history.replaceState(null,'',url);
  showMode();
});
const requested=new URLSearchParams(location.search).get('goal');
if(requested&&CREATING_MODE_IDS.has(requested))mode.value=requested;
showMode();
