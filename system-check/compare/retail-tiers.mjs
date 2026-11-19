/**
 * Optional price-position evidence for the legacy comparison.
 * Isolated from the original engineering/measurement calculators.
 */
import {loadEquipmentCatalog} from '../../equipment/catalog-client.mjs';
import {loadRegionalPriceTiers,regionalPriceLabel} from '../../equipment/price-tier-client.mjs';

const region=document.getElementById('gc-price-region');
const report=document.getElementById('gc-price-labels');
const selectors=[...document.querySelectorAll('#compare-tool [data-side] select[data-preset]')];
let catalog=null,tiers=null,loadError=false;
const categoryMap={amp:'amp',speaker:'speaker',source:'source',headphone:'headphone'};
const categoryName={amp:'amplifiers and receivers',speaker:'speakers',source:'DACs and sources',headphone:'headphones'};
const line=(name,label)=>{const p=document.createElement('p');const strong=document.createElement('strong');strong.textContent=name+': ';p.append(strong,document.createTextNode(label));return p};
function matchedRecord(model,category){
  // A preset may represent a specific output/profile, and a single model
  // can have multiple catalogue records. Refuse ambiguous mappings.
  const matches=catalog?.records.filter(item=>
    item.categories.includes(category)&&
    (item.model===model||item.aliases?.includes(model)))||[];
  return matches.length===1?matches[0]:null;
}
function render(){
  if(!report||!region)return;
  report.replaceChildren();
  if(region.value==='none'){report.append(line('Price categories','Hidden by choice'));return}
  if(loadError){report.append(line('Retail evidence','Unavailable. Specification comparison still works.'));return}
  if(!catalog||!tiers){report.append(line('Retail evidence','Loading checked regional price snapshots…'));return}
  const category=document.querySelector('#compare-tool [data-kind][aria-pressed="true"]')?.dataset.kind;
  const ids=selectors.map(x=>x?.value);
  if(!ids[0]||!ids[1]){report.append(line('Select equipment','Choose two presets to see any supported price categories.'));return}
  let available=0;
  for(const [i,model] of ids.entries()){
    if(model==='__manual__'){report.append(line(i?'Comparison gear':'Your gear','Manually entered model: no verified retail label'));continue}
    const record=matchedRecord(model,categoryMap[category]);
    const tier=record?regionalPriceLabel(tiers,record.id,{region:region.value}):null;
    const label=tier?(tier.label+' · '+tier.region+' · limited retailer sample, '+tier.asOf):
      'Not enough verified new-retail evidence in this region and equipment category';
    if(tier)available++;
    report.append(line(model,label));
  }
  if(!available)report.append(line('Coverage','We have not yet collected enough comparable prices for these '+(categoryName[category]||'products')+'. This is not a product verdict.'));
}
region?.addEventListener('change',render);
document.querySelectorAll('#compare-tool [data-kind]').forEach(b=>b.addEventListener('click',()=>queueMicrotask(render)));
selectors.forEach(x=>x?.addEventListener('change',()=>queueMicrotask(render)));
(async()=>{try{
  [catalog,tiers]=await Promise.all([loadEquipmentCatalog(),loadRegionalPriceTiers()]);
}catch{loadError=true}render()})();
