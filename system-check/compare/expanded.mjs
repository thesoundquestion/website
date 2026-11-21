// Compare My Gear: expanded recording, microphone and headphone-amp categories.
// Read the same generated, evidence-preserving registry as both System Builders.
// The original amplifier/speaker/headphone/source comparison remains untouched.
import {loadEquipmentCatalog} from '../../equipment/catalog-client.mjs';
import {buildEquipmentComparison} from '../../equipment/comparison-model.mjs';

const $=id=>document.getElementById(id);
const expanded=$('gc-expanded');
const legacy=$('gc-legacy');
const root=$('compare-tool');
const buttons=[...root.querySelectorAll('[data-kind]')];
const TYPES=Object.freeze({
  powered_studio_monitor:{
    label:'Powered studio monitors',
    note:'Compare two model-specific powered studio monitors. Outputs, inputs and tested loudness are different questions; speaker specifications alone do not establish clean maximum SPL at your listening position.'
  },
  powered_pa_speaker:{
    label:'Powered PA loudspeakers',
    note:'Compare actual PA specifications and documented cabinet design. Peak marketing SPL, duty cycle, coverage, input routing and deployment conditions are not interchangeable.'
  },
  audio_interface:{
    label:'Audio interfaces',
    note:'An input socket, a microphone preamp and a separately recorded computer channel are not the same thing. Check connector roles, simultaneous inputs and USB track counts before choosing an interface.'
  },
  mixer_recorder:{
    label:'Mixers and recorders',
    note:'Mixer channels are not necessarily separate recording tracks. Check how many channels actually reach the computer by USB, which connections are physical, and whether standalone recording is supported.'
  },
  microphone:{
    label:'Microphones',
    note:'Pickup pattern, transducer type, output plug and powering requirements matter. USB and XLR versions may need completely different connections. A 48 V requirement applies only where explicitly documented.'
  },
  headphone_amplifier:{
    label:'Headphone amplifiers',
    note:'Compare output power at the same headphone impedance, output jack and distortion conditions. Single-ended and balanced ports can have very different ratings. Do not infer driving ability from one unmatched wattage figure.'
  },
  computer_sound_card:{
    label:'Computer sound cards',
    note:'A stereo line input or output does not make a card an XLR mic interface. Compare conversion, recording inputs, output voltage, and confirmed ports on the exact card and connection path.'
  }
});
const valid=new Set(Object.keys(TYPES));
const status=$('gc-expanded-status');
const results=$('gc-expanded-results');
const search=[$('gc-expanded-left-filter'),$('gc-expanded-right-filter')];
const selects=[$('gc-expanded-left'),$('gc-expanded-right')];
const details=$('gc-expanded-rows');
const sources=$('gc-expanded-sources');
const notes=$('gc-expanded-notes');
const observations=$('gc-expanded-observations');
const selected=select=>allRecords.find(record=>record.id===select.value);
let allRecords=[],active=null,loading=null;
const CONN_KEYS=new Set(['inputConnections','outputConnections','inputRoutingConstraints']);

function textElement(tag,value,cls) {
  const node=document.createElement(tag);
  if(cls)node.className=cls;
  node.textContent=String(value);
  return node;
}
function recordsForType(){
  return allRecords.filter(record=>active.startsWith('powered_')
      ?record.categories?.includes('speaker')&&record.facts?.speakerKind?.value===active
      :record.categories?.includes(active))
    .sort((a,b)=>a.model.localeCompare(b.model));
}
function matched(record,filter){
  const q=filter.toLowerCase().trim();
  return !q||record.model.toLowerCase().includes(q)||
    (record.aliases||[]).some(alias=>alias.toLowerCase().includes(q));
}
function populate(index,{useQuery=false}={}){
  const select=selects[index],original=select.value;
  const wanted=useQuery?new URLSearchParams(location.search).get(index?'right':'left'):null;
  const values=recordsForType().filter(record=>matched(record,search[index].value));
  select.replaceChildren();
  for(const record of values){
    const option=document.createElement('option');
    option.value=record.id;option.textContent=record.model;
    select.append(option);
  }
  // Preserve explicit selections, otherwise show different devices when possible.
  const available=values.map(record=>record.id);
  if(wanted&&available.includes(wanted))select.value=wanted;
  else if(original&&available.includes(original))select.value=original;
  else if(index===1&&available.length>1){
    select.value=available.find(id=>id!==selects[0].value)||available[0];
  }else if(available.length)select.value=available[0];
  select.disabled=!available.length;
}
function currentParams(){
  const p=new URLSearchParams({type:active});
  if(selects[0].value)p.set('left',selects[0].value);
  if(selects[1].value)p.set('right',selects[1].value);
  return p;
}
function persist(){
  history.replaceState(null,'','?'+currentParams()+location.hash);
}
function appendCategoryRow(label){
  const row=document.createElement('tr');
  row.className='gc-section-row';
  const head=textElement('th',label);head.scope='colgroup';head.colSpan=3;
  row.append(head);details.append(row);
}
function appendRow(fact){
  const tr=document.createElement('tr');
  const th=textElement('th',fact.label);th.scope='row';
  tr.append(th,textElement('td',fact.left.display),textElement('td',fact.right.display));
  details.append(tr);
  if(fact.caution){
    const caution=document.createElement('tr');
    caution.className='gc-expanded-caution';
    const td=textElement('td',fact.caution);td.colSpan=3;
    caution.append(td);details.append(caution);
  }
}
function evidenceCards(records) {
  sources.replaceChildren();
  for(const record of records){
    const box=document.createElement('section');
    box.append(textElement('h4',record.model));
    const ul=document.createElement('ul');
    const used=new Set();
    for(const evidence of record.evidence||[]){
      const uri=evidence?.url;
      if(typeof uri!=='string'||!uri.startsWith('https://')||used.has(uri))continue;
      used.add(uri);
      const li=document.createElement('li');
      const a=document.createElement('a');
      a.href=uri;a.target='_blank';a.rel='noopener noreferrer';
      try{a.textContent=new URL(uri).hostname}catch{a.textContent='Specification source'}
      li.append(a);
      if(evidence.checkedDate)li.append(document.createTextNode(' · checked '+evidence.checkedDate));
      if(evidence.fields?.length)li.append(textElement('span',' · Evidence: '+evidence.fields.slice(0,3).join(', ')));
      ul.append(li);
    }
    if(ul.children.length)box.append(ul);
    else box.append(textElement('p','No verified external source URL recorded for this model.'));
    sources.append(box);
  }
}
function render() {
  if(!active||!allRecords.length)return;
  const left=selected(selects[0]),right=selected(selects[1]);
  if(!left||!right){
    status.textContent='No matching models. Clear the model filters to continue.';
    results.hidden=true;return;
  }
  const comparison=buildEquipmentComparison(left,right,{category:active.startsWith('powered_')?'speaker':active});
  $('gc-expanded-left-title').textContent=left.model;
  $('gc-expanded-right-title').textContent=right.model;
  details.replaceChildren();
  appendCategoryRow('SPECIFICATIONS FOR '+TYPES[active].label.toUpperCase());
  for(const row of comparison.rows.filter(row=>!CONN_KEYS.has(row.key)))appendRow(row);
  appendCategoryRow('DOCUMENTED INPUTS, OUTPUTS AND SIGNAL ROUTING');
  for(const row of comparison.rows.filter(row=>CONN_KEYS.has(row.key)))appendRow(row);
  observations.replaceChildren();
  for(const item of comparison.observations||[])observations.append(textElement('li',item));
  $('gc-expanded-observations-block').hidden=!observations.children.length;
  notes.replaceChildren();
  notes.append(textElement('li',TYPES[active].note));
  for(const item of comparison.notes||[])notes.append(textElement('li',item));
  evidenceCards([left,right]);
  const count=recordsForType().length;
  if(count===1)status.textContent='Only one documented model in this category. You can inspect its specifications, but no distinct second model is available yet.';
  else if(left.id===right.id)status.textContent='The same model is selected twice. Choose a different comparison model to see differences.';
  else status.textContent='Showing documented specifications for '+left.model+' and '+right.model+'.';
  $('gc-expanded-warning').textContent=count===1?
    'Only one model is currently listed. The duplicate columns are for inspection, not a claim of a meaningful comparison.':
    left.id===right.id?'The two selections are identical. This is not a comparative recommendation.':
    'These are published or researched specifications, not a sound-quality ranking or a compatibility verdict. Missing connections are unverified, not proven absent.';
  results.hidden=false;
}
function chooseType(type,{restoreQuery=false}={}){
  active=type;
  expanded.hidden=false;
  if(legacy)legacy.hidden=true;
  root.hidden=false;
  buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===type)));
  $('gc-expanded-intro').textContent=TYPES[type].note;
  searchesReset();
  if(!allRecords.length){
    status.textContent='Loading equipment specifications…';
    results.hidden=true;
  } else {
    populate(0,{useQuery:restoreQuery});populate(1,{useQuery:restoreQuery});
    render();if(!restoreQuery)persist();
  }
  if(!loading){
    loading=loadEquipmentCatalog().then(data=>{
      allRecords=data.records;
      if(active){
        populate(0,{useQuery:restoreQuery});populate(1,{useQuery:restoreQuery});
        render();if(!restoreQuery)persist();
      }
    }).catch(()=>{
      loading=null;
      status.textContent='The equipment catalogue could not be loaded. The existing comparison categories still work.';
      results.hidden=true;
    });
  }
}
function searchesReset(){for(const field of search)field.value=''}
for(const button of buttons.filter(b=>valid.has(b.dataset.kind))){
  button.addEventListener('click',()=>chooseType(button.dataset.kind));
}
for(let i=0;i<2;i++){
  search[i].addEventListener('input',()=>{
    if(!active||!allRecords.length)return;
    populate(i);if(i===0)populate(1);
    render();persist();
  });
  selects[i].addEventListener('change',()=>{
    if(!active)return;
    if(i===0&&selects[1].value===selects[0].value&&recordsForType().length>1)
      populate(1);
    render();persist();
  });
}
const initial=new URLSearchParams(location.search).get('type');
if(valid.has(initial))chooseType(initial,{restoreQuery:true});
