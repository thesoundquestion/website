import test from 'node:test';
import assert from 'node:assert/strict';
import {shortlistExamples} from '../system-builder/recommendations.mjs';
import {headroomEvidence} from '../system-builder/headroom-evidence.mjs';
import {requestedSubExamples,ownedSubwooferPath} from '../system-builder/stereo-subwoofer-examples.mjs';
import {ownershipPlan} from '../system-builder/owned-gear-options.mjs';
import {createContext,runInContext} from 'node:vm';
import {readFileSync} from 'node:fs';

const goals=['all_rounder','natural','imaging','dynamic','bass','low_volume','party'];
const scenes=['desk','bedroom','living_room','outdoors','party'];
const architectures=['open','consumer_powered_pair','active_studio','passive_separates','party_pa','headphone_first'];
const levels=['quiet','moderate','high'];
const distances=[3,6,10,15];
const connections=['analog','usb','optical','bluetooth','hdmi','undecided'];
const basic={region:'CA',currency:'CAD',budget:null,budgetStrict:true,
  referenceDate:'2026-11-13',power:'mains',used:true,secondary:[]};

test('broad 15,120-case recommendation matrix contains no safety-blocked products or fabricated volume results',()=>{
 let evaluated=0,nonempty=0;
 for(const goal of goals)for(const useCase of scenes)
 for(const architecture of architectures)for(const level of levels)
 for(const distanceFt of distances)for(const connection of connections){
   const request={...basic,goal,useCase,architecture,level,distanceFt,connection,subMode:'no_sub',subCount:0};
   const result=shortlistExamples(request);
   evaluated++;
   assert.ok(result.selected.length<= (architecture==='open'?4:3));
   if(result.selected.length)nonempty++;
   assert.equal(new Set(result.selected.map(x=>x.id)).size,result.selected.length,'duplicate candidate');
   for(const item of result.selected){
     assert.notEqual(item.safetyStatus,'blocked',item.id);
     assert.ok(!item.loadCaution&&!item.ownershipBlocker,'unsafe candidate '+item.id);
     assert.ok(Array.isArray(item.parts)&&item.parts.length,'missing components '+item.id);
     assert.ok(item.parts.every(p=>p.name&&Number.isInteger(p.count)&&p.count>0),'invalid parts '+item.id);
     if(architecture!=='open')assert.equal(item.architecture,architecture,'incorrect architecture '+item.id);
     assert.ok(item.priceDate===null||typeof item.priceDate==='string');
     if(item.subtotal!==null&&item.subtotal!==undefined)
       assert.ok(Number.isFinite(item.subtotal)&&item.subtotal>=0);
     const advice=headroomEvidence(item,request);
     assert.ok(advice.text&&advice.text.length>20,'missing beginner headroom answer '+item.id);
     assert.ok(advice.detail.length>15);
     assert.doesNotMatch(advice.text,/\b\d+(?:\.\d+)?\s*(?:W(?:atts)?|dB(?:\s*SPL)?)\b/i,
       'numeric loudness or wattage asserted in qualitative card '+item.id);
     if(['active_studio','consumer_powered_pair','party_pa'].includes(item.architecture))
       assert.equal(advice.link,null,'powered option linked to passive calculator '+item.id);
     if(request.power==='battery')
       assert.ok(['battery','source_dependent'].includes(item.power));
   }
 }
 assert.equal(evaluated,15120);
 assert.ok(nonempty>5000,'matrix unexpectedly contains almost no eligible options');
});
test('safety and real battery requirements remain hard gates over budgets, goals and loudness',()=>{
 for(const goal of goals)for(const level of levels){
   const result=shortlistExamples({...basic,goal,level,architecture:'passive_separates',useCase:'bedroom',
     distanceFt:6,connection:'analog'});
   assert.ok(!result.selected.some(x=>x.id==='passive-bt20a-xt15'));
   assert.ok(result.excluded.some(x=>/Fosi BT20A Pro/.test(x.title)));
   const battery=shortlistExamples({...basic,goal,level,architecture:'party_pa',useCase:'party',
     power:'battery',distanceFt:15,connection:'bluetooth'});
   assert.ok(battery.selected.every(x=>x.power==='battery'||x.power==='source_dependent'));
 }
});
test('exact-model 2.1 routing has no cross-brand crossover leakage in plausible input and sub modes',()=>{
 for(const subMode of ['plan_sub','sub_hpf','sub_full','sub_unknown'])
 for(const connection of connections){
   const request={...basic,goal:'bass',architecture:'open',useCase:'bedroom',level:'moderate',
     distanceFt:6,connection,subMode,subCount:1,subOwned:'no'};
   const available=requestedSubExamples(request);
   const result=shortlistExamples(request);
   for(const item of result.selected.filter(x=>x.bassSetup)){
     assert.ok(available.some(x=>x.id===item.id),'unrequested sub route '+item.id);
     if(item.id!=='stereo-sub-wiim')assert.doesNotMatch(item.bassSetup.setup,/Main Speakers Output Bass/);
     if(item.id==='stereo-sub-wiim'&&subMode==='sub_full')
       assert.match(item.bassSetup.setup,/Main Speakers Output Bass/);
   }
 }
 for(const name of ['Edifier R1280DBs','Kanto ORA']){
   const own={speaker:{name}};
   const x=ownedSubwooferPath(own,{...basic,architecture:'open',useCase:'bedroom',
     goal:'bass',subMode:'plan_sub',subCount:1,subOwned:'yes',connection:'undecided'});
   assert.ok(x);
   assert.equal(x.ownedSubConnectionVerified,false);
   assert.doesNotMatch(x.bassSetup.setup,/T5 Signal In|T5 cutoff|Main Speakers Output Bass/);
 }
});

test('owned-gear matrix never recommends a pair with a documented do-not-connect blocker',()=>{
 const ctx={window:{}};createContext(ctx);
 for(const path of ['../equipment/legacy-presets.generated.js',
   '../equipment/compare-details.generated.js','../system-builder/catalog-adapter.js'])
   runInContext(readFileSync(new URL(path,import.meta.url),'utf8'),ctx);
 const inventory=ctx.window.systemBuilderInventory;
 const gear=(kind,name)=>({name,record:inventory[kind].find(x=>x.model===name)||null});
 const ownedExamples=[
  {speaker:gear('speaker','Paradigm Phantom v1')},
  {speaker:gear('speaker','ELAC Debut 3.0 DB63')},
  {speaker:{name:'Unlisted DIY speaker',record:null}},
  {amp:gear('amp','Yamaha A-720')},
  {amp:gear('amp','Yamaha R-S202')},
  {speaker:gear('speaker','Paradigm Phantom v1'),amp:gear('amp','Yamaha A-720')},
  {speaker:gear('speaker','ELAC Debut 3.0 DB63'),amp:gear('amp','Yamaha R-S202')},
  {source:gear('source','Creative Sound Blaster X-Fi Titanium HD (RCA)')},
  {headphone:gear('headphone','Grado SR80e')}
 ];
 let tested=0;
 for(const own of ownedExamples)for(const level of levels)for(const distanceFt of distances)
 for(const goal of ['all_rounder','bass','dynamic'])for(const connection of ['analog','optical','hdmi']){
  const request={...basic,level,distanceFt,goal,connection,useCase:'bedroom',
   architecture:'open',subMode:'no_sub'};
  const plan=ownershipPlan({own,request,inventory});
  assert.ok(plan,'owned gear unexpectedly discarded');
  const actualRecommended=plan.selected.filter(x=>!x.safetyStatus&&!x.ownershipBlocker&&!x.loadCaution);
  assert.equal(actualRecommended.length,plan.selected.length,
   'safety-warning pairing was still in ownership shortlist: '+JSON.stringify(Object.keys(own)));
  for(const item of plan.selected){
   assert.ok(item.title&&item.parts?.length&&item.reuseNames?.length,
     'missing ownership context');
   assert.ok(!item.loadCaution&&!item.ownershipBlocker);
  }
  if(own.speaker?.name==='ELAC Debut 3.0 DB63'&&own.amp?.name==='Yamaha R-S202'){
   assert.ok(!plan.selected.some(x=>x.id==='owned-complete'));
   assert.ok(plan.excluded.some(x=>/ELAC/.test(x.title)));
  }
  tested++;
 }
 assert.equal(tested,972);
});

test('budget, region, currency and aged prices never become invented complete-system costs',()=>{
 let count=0;
 for(const [region,currency] of [['CA','CAD'],['US','USD'],['GB','GBP'],['AU','AUD']])
 for(const budget of [0,150,500,1200])
 for(const budgetStrict of [true,false])
 for(const architecture of ['open','consumer_powered_pair','active_studio','passive_separates'])
 for(const connection of ['analog','usb','optical','hdmi'])
 for(const referenceDate of ['2026-11-13','2026-12-13']){
  const req={...basic,region,currency,budget,budgetStrict,architecture,connection,
    referenceDate,goal:'all_rounder',useCase:'bedroom',distanceFt:6,level:'moderate'};
  const result=shortlistExamples(req);
  count++;
  for(const item of result.selected){
   assert.notEqual(item.safetyStatus,'blocked');
   if(item.subtotal!==null&&item.subtotal!==undefined){
     assert.equal(region,'CA','Unexpected regional conversion or invented asking amount');
     assert.equal(currency,'CAD');
     assert.equal(referenceDate,'2026-11-13','Expired reference must not remain priced');
     assert.ok(item.priceComponents.length,'priced result missing component references');
   }else{
     assert.equal(item.priceDate,null,'dated but unpriced candidate '+item.id);
   }
   if(item.connectionStatus==='adapter_needed')
     assert.ok(!item.priceComponents?.some(p=>/adapter/i.test(p.label)),
       'Adapter must not silently be included in unrelated base product price');
  }
 }
 assert.equal(count,1024);
});
test('visible card must disclose additional source adapter cost without an attention-grabbing warning',()=>{
 const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 assert.match(app,/Connection: an additional adapter or source device is needed \(not priced\)/);
 assert.match(app,/preliminary\.selected\.filter/);
 assert.doesNotMatch(app,/addText\(card,'p','Your chosen source connection needs extra hardware\./);
});
