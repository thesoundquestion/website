import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {preferVerifiedPriceTier,pricingPreferenceCoverage} from '../equipment/price-preference.mjs';
import {regionalPriceLabel} from '../equipment/price-tier-client.mjs';
import {ownershipPlan} from '../system-builder/owned-gear-options.mjs';

const read=rel=>readFileSync(new URL('../'+rel,import.meta.url),'utf8');
const catalog=JSON.parse(read('equipment/catalog.generated.json'));
const source=JSON.parse(read('equipment/source-master.json'));
const prices=JSON.parse(read('equipment/price-tiers.generated.json'));
const speaker=name=>catalog.records.find(x=>x.model===name&&x.categories.includes('speaker'));
test('verified Yamaha HS5 HS7 and HS8 are in the ONE generated registry with safe powered roles',()=>{
 assert.equal(catalog.summary.totalModels,192);
 for(const name of ['Yamaha HS5','Yamaha HS7','Yamaha HS8']){
  const model=speaker(name);assert.ok(model,name+' missing');
  assert.equal(model.facts.speakerKind.value,'powered_studio_monitor');
  assert.equal(model.facts.powered.value,true);
  assert.equal(model.facts.unitsPerRetailPackage.value,1);
  assert.ok(model.connections.inputs.some(x=>x.type==='balanced_xlr_line'));
  assert.ok(model.connections.inputs.some(x=>x.type==='6.35mm_trs_line'));
  assert.ok(model.evidence.some(x=>x.url.includes('yamaha.com')));
 }
 assert.equal(speaker('Yamaha HS7').facts.internalAmplificationWatts.value.combined,95);
 assert.equal(speaker('Yamaha HS8').facts.internalAmplificationWatts.value.combined,120);
 assert.deepEqual(speaker('Yamaha HS8').facts.responseMinus3DbHz.value,[47,24000]);
 assert.ok(source.researchCatalog.records.some(x=>x.model==='Yamaha HS8'));
});
test('Listening Builder loads shared catalogue in addition to exact legacy presets and treats powered speakers safely',()=>{
 const html=read('system-builder/index.html'),app=read('system-builder/app.mjs');
 assert.match(html,/select id="sb-speaker"/);
 assert.match(html,/name="pricePreference"/);
 assert.match(app,/loadEquipmentCatalog\(\)/);
 assert.match(app,/availableShared\(kind\)/);
 assert.match(app,/asLegacyView\(shared,kind\)/);
 const options=read('system-builder/owned-gear-options.mjs');
 assert.match(options,/poweredStudio/);
 assert.match(options,/keepPoweredStudioMonitor/);
 const amp=catalog.records.find(x=>x.model==='Yamaha A-720');
 const owner={speaker:{name:'Yamaha HS5',record:{
    ...{model:'Yamaha HS5',speakerKind:'powered_studio_monitor',powered:true,values:{},url:'https://ca.yamaha.com/'}
 }},amp:{name:amp?.model||'Yamaha A-720',record:{values:{}}}};
 const plan=ownershipPlan({own:owner,request:{architecture:'open',power:'mains',distanceFt:6,level:'low'}});
 assert.equal(plan.mode,'keep_powered_studio');
 assert.match(JSON.stringify(plan),/NEVER connect the speaker outputs/);
 assert.doesNotMatch(JSON.stringify(plan.selected),/Already owned passive stereo pair/);
});
test('Creating Builder offers studio monitor selection and current regional price preferences',()=>{
 const html=read('system-builder/creating/index.html'),app=read('system-builder/creating/app.mjs');
 for(const id of ['sb-purpose-monitor','sb-price-region','sb-price-preference','sb-price-evidence'])
  assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(app,/powered_studio_monitor/);
 assert.match(app,/preferVerifiedPriceTier\(/);
 assert.match(app,/pricingPreferenceCoverage\(/);
 assert.match(read('system-builder/goal-chain-engine.mjs'),/monitorSpeakerId/);
 const build=read('scripts/build-public-site.mjs');
 for(const runtime of ['equipment/price-preference.mjs','system-builder/creating/index.html','system-builder/creating/app.mjs'])
  assert.ok(build.includes("'"+runtime+"'"),runtime+' missing from publish preflight');
});
test('regional price preference boosts verified matches without reclassifying unknown or expired entries',()=>{
 const hd600=catalog.records.find(x=>x.model==='Sennheiser HD 600');
 const solo=catalog.records.find(x=>x.model==='M-Audio M-Track Solo');
 const sr80=catalog.records.find(x=>x.model==='Grado SR80e');
 assert.ok(hd600&&solo&&sr80);
 const list=[sr80,hd600,solo];
 const premium=preferVerifiedPriceTier(list,prices,{region:'CA',preference:'premium_pricing',asOf:'2026-11-18'});
 assert.equal(premium[0].model,'Sennheiser HD 600');
 const budget=preferVerifiedPriceTier(list,prices,{region:'CA',preference:'budget',asOf:'2026-11-18'});
 assert.equal(budget[0].model,'M-Audio M-Track Solo');
 const noEvidence=preferVerifiedPriceTier(list,prices,{region:'GB',preference:'premium_pricing',asOf:'2026-11-18'});
 assert.deepEqual(noEvidence.map(x=>x.model),list.map(x=>x.model));
 const expired=preferVerifiedPriceTier(list,prices,{region:'CA',preference:'premium_pricing',asOf:'2027-02-15'});
 assert.deepEqual(expired.map(x=>x.model),list.map(x=>x.model));
 const coverage=pricingPreferenceCoverage(list,prices,{region:'CA',preference:'premium_pricing',asOf:'2026-11-18'});
 assert.equal(coverage.matched,1);
 assert.ok(coverage.unknown>=1);
});
