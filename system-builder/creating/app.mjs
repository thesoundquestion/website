/**
 * Creating Builder: purpose -> novice questions -> model-backed equipment list.
 * Optional owned items are reused first. Validation remains a separate tool.
 */
import {loadEquipmentCatalog} from '../../equipment/catalog-client.mjs';
import {loadRegionalPriceTiers,regionalPriceLabel} from '../../equipment/price-tier-client.mjs';
import {preferVerifiedPriceTier,pricingPreferenceCoverage,validPricePreference} from '../../equipment/price-preference.mjs';
import {CREATING_GOALS,DEFAULT_GOAL_COUNTS,buildCreatingSystem} from './build-recommendations.mjs';
import {compareCatalogHandoff} from '../compare-handoff.mjs';
import {poweredEvidenceFor} from '../powered-output-evidence.mjs';

const $=id=>document.getElementById(id);
const mode=$('sb-purpose-select'),form=$('sb-purpose-form'),result=$('sb-purpose-result');
const body=$('sb-purpose-result-body'),status=$('sb-purpose-status');
const priceRegion=$('sb-price-region'),pricePreference=$('sb-price-preference'),priceEvidence=$('sb-price-evidence');
const countInput=$('sb-purpose-count'),tracks=$('sb-purpose-tracks'),route=$('sb-mic-route');
const addStudio=$('sb-include-monitors');
const choices={
  mic:{select:$('sb-purpose-microphone'),other:$('sb-purpose-microphone-other'),types:['microphone']},
  capture:{select:$('sb-purpose-input'),other:$('sb-purpose-input-other'),types:['audio_interface','mixer_recorder']},
  headphones:{select:$('sb-purpose-headphone'),other:$('sb-purpose-headphone-other'),types:['headphone']},
  monitors:{select:$('sb-purpose-monitor'),other:$('sb-purpose-monitor-other'),kind:'powered_studio_monitor'},
  pa:{select:$('sb-purpose-pa'),other:$('sb-purpose-pa-other'),kind:'powered_pa_speaker'}
};
const recModes=new Set(['vocal','songwriter','drums','band','podcast','stream']);
let catalog=null,prices=null,loadPending=null;
const node=(tag,cls,value)=>{
  const item=document.createElement(tag);
  if(cls)item.className=cls;
  if(value!==undefined)item.textContent=String(value);
  return item;
};
const append=(parent,tag,cls,value)=>{
  const item=node(tag,cls,value);parent.append(item);return item;
};
function link(parent,url,label){
  if(typeof url!=='string'||!/^https:\/\//.test(url)&&!url.startsWith('/'))return;
  const a=append(parent,'a','sb-verified-link',label);
  a.href=url;
  if(url.startsWith('https://')){a.target='_blank';a.rel='noopener noreferrer'}
}
function factsList(parent,lines){
  if(!lines?.length)return;
  const ul=append(parent,'ul','sb-builder-notes');
  for(const line of lines)append(ul,'li','',line);
}
function modelsFor(choice){
  return catalog.records.filter(r=>
    choice.kind?r.facts?.speakerKind?.value===choice.kind:
      choice.types.some(category=>r.categories.includes(category))
  ).sort((a,b)=>a.model.localeCompare(b.model));
}
function refreshEquipmentOptions(){
  if(!catalog)return;
  const region=priceRegion.value,preference=validPricePreference(pricePreference.value);
  const relevant=[];
  for(const choice of Object.values(choices)){
    const previous=choice.select.value;
    choice.select.replaceChildren();
    const empty=node('option','','I don’t own one / not listed below');empty.value='';choice.select.append(empty);
    const options=preferVerifiedPriceTier(modelsFor(choice),prices,{region,preference});
    for(const model of options){
      relevant.push(model);
      const opt=node('option','',model.model);
      opt.value=model.id;
      const tier=regionalPriceLabel(prices,model.id,{region});
      if(tier)opt.textContent+=' · '+tier.label;
      choice.select.append(opt);
    }
    if(options.some(x=>x.id===previous))choice.select.value=previous;
  }
  const unique=[...new Map(relevant.map(x=>[x.id,x])).values()];
  const coverage=pricingPreferenceCoverage(unique,prices,{region,preference});
  priceEvidence.textContent=(preference==='any'?'No price category is weighted. ':coverage.note+' ')+
    'This snapshot has '+coverage.unknown+' models without a supported local price category. '+
    'Missing prices are not treated as cheap, and cost does not establish sound quality or compatibility.';
}
async function loadOnce(){
  if(catalog)return catalog;
  if(loadPending)return loadPending;
  loadPending=(async()=>{
    catalog=await loadEquipmentCatalog();
    try{prices=await loadRegionalPriceTiers()}catch{prices=null}
    refreshEquipmentOptions();
    status.textContent='Ready to suggest a complete setup. The equipment you already own is optional.';
    return catalog;
  })().catch(err=>{loadPending=null;throw err});
  return loadPending;
}
function visible(selector,show){
  for(const element of document.querySelectorAll(selector))element.hidden=!show;
}
async function showMode(){
  const id=mode.value;
  if(!CREATING_GOALS[id])return;
  countInput.value=DEFAULT_GOAL_COUNTS[id];
  // A solo desktop creator usually needs no second USB interface. When the
  // project changes, reset only the recording route, never the owned gear.
  route.value=id==='stream'?'usb':'xlr';
  // Goals do not silently replace the visitor's owned gear.
  visible('.sb-tracks',recModes.has(id));
  visible('.sb-monitors-choice',recModes.has(id));
  visible('.sb-mic-route',recModes.has(id));
  visible('.sb-headphone',recModes.has(id));
  visible('.sb-monitor',recModes.has(id));
  visible('.sb-live',id==='live');
  $('sb-purpose-description').textContent=CREATING_GOALS[id].why+
    ' You can leave the owned-equipment section empty. We will still suggest a setup.';
  result.hidden=true;body.replaceChildren();
  try{await loadOnce()}catch{
    status.textContent='Equipment inventory could not load. We cannot responsibly recommend specific models. Try reloading this page.';
  }
}
for(const choice of Object.values(choices)){
  choice.select.addEventListener('change',()=>{
    if(choice.select.value)choice.other.value='';
    result.hidden=true;
  });
  choice.other.addEventListener('input',()=>{
    if(choice.other.value.trim())choice.select.value='';
    result.hidden=true;
  });
}
priceRegion.addEventListener('change',()=>{refreshEquipmentOptions();result.hidden=true});
pricePreference.addEventListener('change',()=>{refreshEquipmentOptions();result.hidden=true});
mode.addEventListener('change',()=>{
  const url=new URL(location.href);
  url.searchParams.set('goal',mode.value);
  history.replaceState(null,'',url);
  showMode();
});
function chosenOwned(){
  const owned={},ownedNames={};
  for(const [key,choice] of Object.entries(choices)){
    const custom=choice.other.value.trim();
    if(custom)ownedNames[key]=custom;
    else if(choice.select.value)owned[key]=choice.select.value;
  }
  return {owned,ownedNames};
}
const statuses={
  research:'Suggested equipment to investigate',
  reuse:'Already owned · keep if suitable',
  included:'Already included · no extra device needed',
  verify:'Need to research this requirement'
};
function modelComparisonLink(pick,alternative=null){
  if(!pick?.id||!catalog)return null;
  const current=catalog.records.find(x=>x.id===pick.id);
  const other=alternative?.id?catalog.records.find(x=>x.id===alternative.id):null;
  return compareCatalogHandoff(current,other);
}
function renderStage(stage,index){
  const li=node('li','sb-build-step');
  const top=append(li,'div','sb-build-step-top');
  append(top,'span','sb-build-step-number',String(index+1).padStart(2,'0'));
  const titles=append(top,'div','sb-build-step-title');
  append(titles,'h4','',stage.title);
  append(titles,'p','sb-build-status sb-build-status-'+stage.need,statuses[stage.need]||'Review');
  if(stage.quantity>1)append(top,'span','sb-build-qty','× '+stage.quantity);
  append(li,'p','sb-build-purpose',stage.purpose);
  if(stage.pick){
    const pick=append(li,'div','sb-build-pick');
    append(pick,'strong','',stage.pick.model);
    if(stage.pick.priceCategory)append(pick,'span','sb-price-category',
      stage.pick.priceCategory+' · '+stage.pick.priceRegion+' (reviewed '+stage.pick.tierDate+')');
    if(stage.pick.reason)append(pick,'p','sb-build-reason',stage.pick.reason);
    if(stage.pick.source)link(pick,stage.pick.source,'Model specifications / source');
    const comparison=modelComparisonLink(stage.pick,stage.alternatives?.[0]);
    if(comparison)link(pick,comparison,'Compare this exact model and alternatives');
    const powered=poweredEvidenceFor({model:stage.pick.model});
    if(powered){
      const q=new URLSearchParams({model:powered.model,
        count:String(stage.quantity>=2?2:1)});
      link(pick,'/system-check/powered/?'+q.toString(),
        'Check powered loudness for your listening distance');
    }
  }else if(stage.need==='research'){
    append(li,'p','sb-build-example','Choose a suitable item meeting this description. No verified single-model suggestion is required for this accessory or software.');
  }else if(stage.need==='verify'){
    append(li,'p','sb-build-example','Our catalogue does not verify a suitable specific product yet. Keep this requirement on your shopping list.');
  }else if(stage.need==='included'){
    append(li,'p','sb-build-example','No additional purchase necessary for this stage in the illustrated path.');
  }
  if(stage.detail)append(li,'p','sb-build-detail',stage.detail);
  if(stage.alternatives?.length){
    const alts=append(li,'details','sb-build-alternatives');
    append(alts,'summary','','Other documented models to compare');
    const list=append(alts,'ul');
    for(const alt of stage.alternatives){
      const row=append(list,'li');
      append(row,'strong','',alt.model);
      if(alt.priceCategory)append(row,'span','sb-price-category',' '+alt.priceCategory);
      if(alt.reason)append(row,'small','sb-build-alternative-reason',alt.reason);
      if(alt.source)link(row,alt.source,'Specifications');
      const comparison=modelComparisonLink(alt,stage.pick);
      if(comparison)link(row,comparison,'Compare these models');
    }
  }
  if(stage.checks?.length){
    const checks=append(li,'details','sb-build-checks');
    append(checks,'summary','','What to check before purchasing or connecting');
    factsList(checks,stage.checks);
  }
  return li;
}
function render(plan){
  body.replaceChildren();
  append(body,'p','sb-build-opening','A practical example for: '+plan.title+'. These are the parts you would need to put together or reuse, not a generic list of expensive gear.');
  const summary=append(body,'div','sb-build-summary');
  append(summary,'div','','Example purchases to research: '+plan.purchased.length);
  append(summary,'div','','Items you already own: '+plan.alreadyOwned.length);
  append(summary,'div','','Total stages to plan: '+plan.stages.length);
  if(plan.messages.length){
    const alerts=append(body,'section','sb-build-alerts');
    append(alerts,'h4','','Important limits for this setup');
    factsList(alerts,plan.messages);
  }
  append(body,'h4','sb-build-list-title','Your system, from microphone to finished sound');
  const list=append(body,'ol','sb-build-flow');
  plan.stages.forEach((item,i)=>list.append(renderStage(item,i)));
  const shopping=append(body,'section','sb-shopping-summary');
  append(shopping,'h4','','What you might need to get');
  const missing=plan.stages.filter(x=>x.need==='research'||x.need==='verify');
  if(missing.length){
    const ul=append(shopping,'ul');
    for(const item of missing){
      const label=item.pick?.model||item.title;
      // A drum-kit plan cannot infer that every microphone is the same model.
      // Show one sourced model as an example, not an instruction to buy N copies.
      const multipleSources=item.key==='mic'&&item.quantity>1&&['drums','band'].includes(plan.mode);
      const description=multipleSources
        ?item.quantity+' microphones selected for the individual sound sources (example to investigate: '+label+')'
        :((item.quantity||1)>1?(item.quantity+' × '):'')+label;
      append(ul,'li','',description+
        (item.need==='verify'?' (requirements still to research)':' (compare local options)'));
    }
  }else append(shopping,'p','','All listed stages are already owned or included. Double-check connections and accessories before assuming there is nothing to buy.');
  append(shopping,'p','sb-help','The list is not a checkout cart: price, local stock, tax, cable count, room fit, operating system and electrical compatibility still need checking.');
  if(plan.notes.length){
    const considerations=append(body,'section','sb-build-next');
    append(considerations,'h4','','Practical things beginners should know');
    factsList(considerations,plan.notes);
  }
  const learning=append(body,'section','sb-build-learning');
  append(learning,'h4','','Learn what the pieces do');
  const ul=append(learning,'ul');
  const names={
    '/decoder/audio-interfaces-mixers/':'Audio interfaces, mixers and recording channels',
    '/decoder/microphone-types/':'Microphone types and uses',
    '/decoder/recording-sources/':'How a recording begins',
    '/decoder/mixing-soundstage/':'Separate tracks and mixing',
    '/decoder/speaker-types/':'Studio and PA speaker types'
  };
  for(const href of plan.lessons){
    const li=append(ul,'li');
    link(li,href,names[href]||'More about this part of the chain');
  }
  // Exact catalogue comparison actions live alongside each relevant stage.
  // Never pretend the passive System Check calculator can analyze microphone
  // signal chains, headphone outputs or powered monitors.
  append(body,'p','sb-chain-disclaimer',plan.disclaimer);
  result.hidden=false;
}
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!catalog){status.textContent='The shared equipment catalogue is still unavailable. Cannot assemble verified product examples.';return}
  const count=Number(countInput.value);
  if(!Number.isInteger(count)||count<1||count>32){
    status.textContent='Choose a whole number from 1 to 32 microphones.';
    countInput.focus();return;
  }
  try{
    const plan=buildCreatingSystem(catalog,{
      mode:mode.value,microphoneCount:count,independentTracks:tracks.checked,
      micConnection:route.value,includeMonitors:addStudio.checked,
      region:priceRegion.value,pricePreference:pricePreference.value,prices,...chosenOwned()
    });
    render(plan);
    status.textContent='Created a suggested equipment chain with '+plan.stages.length+' stages and '+plan.purchased.length+' example purchases or requirements to research.';
    result.scrollIntoView({block:'start',behavior:'auto'});
  }catch{
    status.textContent='Could not build this setup. Review the microphone count and options.';
    result.hidden=true;
  }
});
const requested=new URLSearchParams(location.search).get('goal');
if(requested&&CREATING_GOALS[requested])mode.value=requested;
showMode();
