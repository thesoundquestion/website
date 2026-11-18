import {loadEquipmentCatalog} from '../../equipment/catalog-client.mjs';
import {buildEquipmentComparison} from '../../equipment/comparison-model.mjs';
import {loadRegionalPriceTiers,regionalPriceLabel} from '../../equipment/price-tier-client.mjs';

const $=id=>document.getElementById(id);
let catalog=null,prices=null;
const category=$('category'),left=$('left'),right=$('right'),region=$('region');
const searches=[$('left-search'),$('right-search')];
const selectors=[left,right];
const examples={
  audio_interface:['M-Audio M-Track Solo','Focusrite Scarlett 2i2 (4th Gen)'],
  headphone:['Grado SR80e','Sennheiser HD 600'],
  amp:['Yamaha A-720','Panasonic SA-HE100'],
  speaker:['Paradigm Phantom v1','Pioneer SP-FS52'],
  mixer_recorder:['Yamaha MG10XU','Zoom LiveTrak L-12'],
  microphone:['FIFINE K669D'],
  headphone_amplifier:['FiiO K11'],
  source:['Creative Sound Blaster X-Fi Titanium HD'],
  computer_sound_card:['Creative Sound Blaster X-Fi Titanium HD']
};
const selectedItem=select=>catalog?.records.find(x=>x.id===select.value);
const labelRecord=item=>item.model+(item.review?.unknowns?.length?' (some specifications unverified)':'');
function recordsForCategory(){
  return catalog.records.filter(x=>x.categories.includes(category.value))
    .sort((a,b)=>a.model.localeCompare(b.model));
}
function populate(select,filter,preferred){
  const existing=select.value;
  const items=recordsForCategory().filter(x=>x.model.toLowerCase().includes(filter.toLowerCase())||
    x.aliases.some(alias=>alias.toLowerCase().includes(filter.toLowerCase())));
  select.replaceChildren();
  for(const item of items){
    const option=document.createElement('option');
    option.value=item.id;
    option.textContent=labelRecord(item);
    select.append(option);
  }
  const requested=items.find(x=>x.model===preferred)||items.find(x=>x.id===existing);
  if(requested)select.value=requested.id;
  select.disabled=!items.length;
}
function refreshSelectors(defaults=false){
  const suggested=examples[category.value]||[];
  selectors.forEach((select,i)=>populate(select,searches[i].value,defaults?suggested[i]:null));
  render();
}
function td(text){
  const cell=document.createElement('td');
  cell.textContent=text;
  return cell;
}
function render(){
  const a=selectedItem(left),b=selectedItem(right);
  const result=$('result'),status=$('preview-status');
  if(!a||!b){
    result.hidden=true;
    status.textContent='Choose two available models. No matching equipment? Clear the filters.';
    return;
  }
  const comparison=buildEquipmentComparison(a,b,{category:category.value});
  status.textContent=a.id===b.id?
    'You selected the same device twice. Choose another model to see differences.':
    'Showing documented facts for the two selected models.';
  $('left-name').textContent=a.model;
  $('right-name').textContent=b.model;
  const rows=$('comparison-rows');
  rows.replaceChildren();
  for(const fact of comparison.rows){
    const row=document.createElement('tr');
    const name=document.createElement('th');
    name.scope='row'; name.textContent=fact.label;
    row.append(name,td(fact.left.display),td(fact.right.display));
    if(fact.caution){
      const note=document.createElement('tr');
      note.className='eq-caution';
      const cell=document.createElement('td');
      cell.colSpan=3;
      cell.textContent=fact.label+': '+fact.caution;
      note.append(cell);
      rows.append(row,note);
    } else rows.append(row);
  }
  const observations=$('observations');
  observations.replaceChildren();
  for(const observation of comparison.observations||[]){
    const li=document.createElement('li');
    li.textContent=observation;
    observations.append(li);
  }
  $('observations-section').hidden=!observations.children.length;
  const sources=$('sources');
  sources.replaceChildren();
  for(const item of [a,b]){
    const section=document.createElement('section');
    const heading=document.createElement('h4');
    heading.textContent=item.model;
    section.append(heading);
    const list=document.createElement('ul');
    const seen=new Set();
    for(const evidence of item.evidence||[]){
      if(typeof evidence.url!=='string'||!evidence.url.startsWith('https://')||seen.has(evidence.url))continue;
      seen.add(evidence.url);
      const li=document.createElement('li');
      const link=document.createElement('a');
      link.href=evidence.url;
      link.target='_blank';
      link.rel='noopener noreferrer';
      try{link.textContent=new URL(evidence.url).hostname}catch{link.textContent='Source document'}
      li.append(link);
      if(evidence.checkedDate)li.append(document.createTextNode(' · reviewed '+evidence.checkedDate));
      list.append(li);
    }
    if(!list.children.length){
      const item=document.createElement('p');
      item.textContent='No verified source URL in the catalogue.';
      section.append(item);
    } else section.append(list);
    sources.append(section);
  }
  const notes=$('notes');
  notes.replaceChildren();
  for(const note of comparison.notes){
    const li=document.createElement('li');
    li.textContent=note;
    notes.append(li);
  }
  const priceArea=$('pricing');
  priceArea.replaceChildren();
  const tierA=region.value==='CA'?regionalPriceLabel(prices,a.id,{region:'CA'}):null;
  const tierB=region.value==='CA'?regionalPriceLabel(prices,b.id,{region:'CA'}):null;
  for(const [item,tier] of [[a,tierA],[b,tierB]]){
    const entry=document.createElement('p');
    const strong=document.createElement('strong');strong.textContent=item.model+': ';
    entry.append(strong,document.createTextNode(tier?tier.label:'No verified regional retail pricing label'));
    priceArea.append(entry);
  }
  priceArea.hidden=region.value!=='CA';
  $('pricing-disclaimer').hidden=region.value!=='CA'||!(tierA||tierB);
  result.hidden=false;
}
async function init(){
  try{
    catalog=await loadEquipmentCatalog();
    // Pricing is optional; absence of evidence must never prevent spec comparisons.
    try{prices=await loadRegionalPriceTiers()}catch{prices=null}
    refreshSelectors(true);
  }catch{
    $('preview-status').textContent='Equipment catalogue unavailable. No comparison can be shown.';
    $('result').hidden=true;
  }
}
category.addEventListener('change',()=>{
  searches.forEach(x=>x.value='');
  if(catalog)refreshSelectors(true);
});
region.addEventListener('change',render);
selectors.forEach(x=>x.addEventListener('change',render));
searches.forEach((search,i)=>search.addEventListener('input',()=>{
  if(catalog){populate(selectors[i],search.value,null);render()}
}));
init();
