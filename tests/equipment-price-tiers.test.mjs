import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {buildRegionalPriceTiers,getCurrentPriceTier,retailCategoryFor} from '../equipment/price-tiers.mjs';
import {regionalPriceLabel,sortEquipmentByRegionalTier} from '../equipment/price-tier-client.mjs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=JSON.parse(read('equipment/catalog.generated.json'));
const master=JSON.parse(read('equipment/source-master.json'));
const snapshot=JSON.parse(read('equipment/price-tiers.generated.json'));
const serial=x=>JSON.parse(JSON.stringify(x));
const make=(id,region,retailer,amount,other={})=>({
 equipmentId:id,region,currency:region==='CA'?'CAD':'USD',
 category:'wired_headphones',amount,retailerId:retailer,
 url:'https://example.org/retail',checkedOn:'2026-11-18',
 condition:'new',priceKind:'regular',unit:'one_product',...other
});

test('in-ear monitors and unrelated speaker package types do not contaminate full-size pricing cohorts',()=>{
 const moondrop=catalog.records.find(x=>x.model==='Moondrop Chu II');
 const sony=catalog.records.find(x=>x.model==='Sony MDR-7506');
 const phantom=catalog.records.find(x=>x.model==='Paradigm Phantom v1');
 assert.equal(retailCategoryFor(moondrop),'wired_in_ear_monitors');
 assert.equal(retailCategoryFor(sony),'wired_headphones');
 assert.equal(retailCategoryFor(phantom),null);
});
test('saved survey reproduces dated regional bands without exposing retail numbers',()=>{
 const ca=buildRegionalPriceTiers(catalog,master.pricingResearch,{region:'CA',asOf:'2026-11-18'});
 assert.deepEqual(serial(ca),snapshot.regions.CA);
 assert.equal(ca.summary.eligibleModels,5);
 assert.equal(ca.summary.labelledModels,5);
 assert.equal(ca.tiersById['legacy/headphone/grado-sr80x'].tier,'budget');
 assert.equal(ca.tiersById['legacy/headphone/audio-technica-ath-m50x'].tier,'mid_grade');
 assert.equal(ca.tiersById['legacy/headphone/sennheiser-hd-600'].tier,'premium_pricing');
 assert.doesNotMatch(JSON.stringify(snapshot),/579\.95|134\.99|279\.99|199\.99/);
 assert.deepEqual(Object.keys(snapshot.regions).sort(),['AU','CA','EU','GB','US']);
 for(const region of ['AU','EU','GB','US']){
  assert.equal(snapshot.regions[region].summary.labelledModels,0);
 }
});
test('a product needs distinct sources and the cohort needs enough peers',()=>{
 const ids=['legacy/headphone/sony-mdr-7506','legacy/headphone/grado-sr80x',
 'legacy/headphone/audio-technica-ath-m50x','research/headphone/akg-k371',
 'legacy/headphone/sennheiser-hd-600'];
 const onlyOneMerchant=ids.flatMap((id,i)=>[make(id,'CA','same-shop',100+i*100),
 make(id,'CA','same-shop',101+i*100)]);
 const no=buildRegionalPriceTiers(catalog,{observations:onlyOneMerchant},{region:'CA',asOf:'2026-11-18'});
 assert.equal(no.summary.eligibleModels,0);
 assert.equal(no.summary.labelledModels,0);
 const four=master.pricingResearch.observations.filter(x=>x.equipmentId!==ids[4]);
 assert.equal(buildRegionalPriceTiers(catalog,{observations:four},{region:'CA',asOf:'2026-11-18'}).summary.labelledModels,0);
});
test('expired, promotional, used, mismatched market and cross-retailer anomalies do not earn bands',()=>{
 const originals=master.pricingResearch.observations;
 const stale=originals.map(x=>({...x,checkedOn:'2026-08-01'}));
 assert.equal(buildRegionalPriceTiers(catalog,{observations:stale},{region:'CA',asOf:'2026-11-18'}).summary.labelledModels,0);
 const specials=originals.map(x=>({...x,priceKind:'sale'}));
 assert.equal(buildRegionalPriceTiers(catalog,{observations:specials},{region:'CA',asOf:'2026-11-18'}).summary.labelledModels,0);
 const used=originals.map(x=>({...x,condition:'used'}));
 assert.equal(buildRegionalPriceTiers(catalog,{observations:used},{region:'CA',asOf:'2026-11-18'}).summary.labelledModels,0);
 const extreme=originals.map(x=>({...x,amount:x.retailerId==='az-electronics'?1000:x.amount}));
 assert.equal(buildRegionalPriceTiers(catalog,{observations:extreme},{region:'CA',asOf:'2026-11-18'}).summary.labelledModels,0);
 assert.throws(()=>buildRegionalPriceTiers(catalog,{observations:[make('legacy/headphone/sony-mdr-7506','CA','a',120,{currency:'USD'})]},{region:'CA'}),/Currency mismatch/);
});
test('public label is a pricing statement and vanishes when expired',()=>{
 const model='legacy/headphone/grado-sr80x';
 assert.equal(regionalPriceLabel(snapshot,model,{region:'CA',asOf:'2026-11-19'}).label,'Budget pricing');
 assert.equal(regionalPriceLabel(snapshot,model,{region:'US',asOf:'2026-11-19'}),null);
 assert.equal(regionalPriceLabel(snapshot,model,{region:'CA',asOf:'2027-01-03'}),null);
 assert.equal(getCurrentPriceTier(snapshot.regions.CA,model,{asOf:'2027-01-03'}),null);
 const label=regionalPriceLabel(snapshot,model,{region:'CA',asOf:'2026-11-19'});
 assert.match(label.meaning,/not performance/);
 assert.equal(label.confidence,'limited_sample');
});
test('regional order puts unknown and expired records last without discarding them',()=>{
 const ids=['legacy/headphone/sennheiser-hd-600','legacy/headphone/grado-sr80e',
   'legacy/headphone/audio-technica-ath-m50x','legacy/headphone/sony-mdr-7506'];
 const items=ids.map(id=>catalog.records.find(x=>x.id===id));
 assert.deepEqual(sortEquipmentByRegionalTier(items,snapshot,{region:'CA',asOf:'2026-11-19'})
   .map(x=>x.id),[
   'legacy/headphone/sony-mdr-7506','legacy/headphone/audio-technica-ath-m50x',
   'legacy/headphone/sennheiser-hd-600','legacy/headphone/grado-sr80e'
 ]);
 assert.deepEqual(sortEquipmentByRegionalTier(items,snapshot,{region:'CA',asOf:'2027-01-03'})
   .map(x=>x.id),[...items].sort((a,b)=>a.model.localeCompare(b.model)).map(x=>x.id));
 assert.equal(buildRegionalPriceTiers(catalog,master.pricingResearch,{region:'GB',asOf:'2026-11-18'}).summary.labelledModels,0);
});
test('generated tiers must be current along with all other catalogue views',()=>{
 const p=execFileSync(process.execPath,['scripts/build-equipment-catalog.mjs','--check'],
 {cwd:new URL('..',import.meta.url),encoding:'utf8'});
 assert.match(p,/Catalogue and legacy views current/);
});
