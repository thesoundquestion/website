import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {screenRecommendationSafety,removeUnsafeRecommendations}
  from '../system-builder/recommendation-safety-gate.mjs';
import {shortlistExamples} from '../system-builder/recommendations.mjs';

test('a known prohibited manufacturer speaker load is excluded',()=>{
 const candidate={id:'bad-pair',title:'Amp + speaker',architecture:'passive_separates',
   manualPairing:{supported:false,statement:'Manufacturer says minimum 8 Ω'},
   speakerValues:{load:4}};
 const result=screenRecommendationSafety(candidate);
 assert.equal(result.eligible,false);
 assert.match(result.blockers.join(' '),/minimum 8 Ω/);
});
test('incompatible connections, affected recalls and verified level failure are hard gates',()=>{
 for(const item of [
   {id:'a',connectionStatus:'incompatible'},
   {id:'b',recallStatus:'affected'},
   {id:'c',levelSuitability:'fails'},
   {id:'d',environmentSuitability:'incompatible'},
   {id:'e',ownershipBlocker:'Confirmed amplifier speaker-load mismatch'}
 ]){
   assert.equal(screenRecommendationSafety(item).eligible,false,item.id);
 }
});
test('ordinary unverified headroom, connection adapter and impedance phase are not false safety violations',()=>{
 const ordinary={
   id:'conditional',architecture:'passive_separates',
   connectionStatus:'adapter_needed',headroomData:{status:'incomplete'},
   loadCaution:'Review the phase angle and full impedance curve.',
   pairingEvidence:{demandingMinimum:true}
 };
 assert.equal(screenRecommendationSafety(ordinary).eligible,true);
});
test('published amplifier minimum excludes a lower nominal speaker load',()=>{
 const item={id:'nominal',architecture:'passive_separates',
   ampMinimumNominalOhms:8,speakerValues:{load:4}};
 assert.equal(screenRecommendationSafety(item).eligible,false);
});
test('known safety blockers never appear in top recommendation or alternatives',()=>{
 const list={selected:[
  {id:'unsafe',title:'Unsafe owned pair',ownershipBlocker:'Documented unsafe load'},
  {id:'good',title:'Verified pair',connectionStatus:'native_possible'},
  {id:'unknown',title:'Incomplete measurements',headroomData:{status:'incomplete'}},
  {id:'recall',title:'Affected equipment',recallStatus:'affected'}
 ],excluded:[]};
 const screened=removeUnsafeRecommendations(list);
 assert.deepEqual(screened.selected.map(x=>x.id),['good','unknown']);
 assert.equal(screened.excluded.length,2);
 assert.ok(screened.excluded.some(x=>x.reason.includes('unsafe load')));
});
test('the production Builder performs screening before rendering or ranking recommendations',()=>{
 const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 const recommendations=readFileSync(new URL('../system-builder/recommendations.mjs',import.meta.url),'utf8');
 assert.match(app,/const shortlist=removeUnsafeRecommendations\(candidateShortlist,request\)/);
 assert.ok(app.indexOf('const shortlist=removeUnsafeRecommendations')<
   app.indexOf('const [leader,...remaining]=shortlist.selected'));
 assert.match(recommendations,/const safety=screenRecommendationSafety/);
 assert.ok(recommendations.indexOf('const safety=screenRecommendationSafety')<
   recommendations.indexOf('selected.push({ ...configured'));
 assert.doesNotMatch(app,/sb-safety-blocker/);
});
test('the documented passive and powered full-system examples remain eligible',()=>{
 const catalog=JSON.parse(readFileSync(new URL('../equipment/catalog.generated.json',import.meta.url),'utf8'));
 const request={architecture:'open',useCase:'bedroom',goal:'imaging',
   level:'quiet',power:'mains',connection:'analog',
   region:'CA',currency:'CAD',budget:null,distanceFt:6,
   referenceDate:'2026-11-20',subMode:'no_sub'};
 const selected=shortlistExamples(request,catalog).selected;
 assert.ok(selected.length>=3);
 assert.equal(selected[0].id,'studio-jbl');
 assert.ok(selected.every(item=>screenRecommendationSafety(item,request).eligible));
});
