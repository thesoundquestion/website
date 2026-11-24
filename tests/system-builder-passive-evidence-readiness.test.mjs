import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EXAMPLES,shortlistExamples} from '../system-builder/recommendations.mjs';
import {curatedPairingFor} from '../system-builder/curated-pairing-evidence.mjs';
import {passivePairingReadiness,passiveReadinessPriority} from '../system-builder/passive-evidence-readiness.mjs';

const catalog=JSON.parse(readFileSync(new URL('../equipment/catalog.generated.json',import.meta.url),'utf8'));
const selected=id=>EXAMPLES.find(x=>x.id===id);
const yamaha=selected('passive-as301-p5');
const fosi=selected('passive-bt20a-xt15');
const request={architecture:'passive_separates',useCase:'living_room',goal:'all_rounder',region:'CA',currency:'CAD',level:'moderate',power:'mains',connection:'analog',referenceDate:'2026-11-20',budget:null,budgetStrict:true,used:true,distanceFt:8};

test('Yamaha/PSB has exact-model speaker sensitivity and comparable continuous rating',()=>{
 const r=passivePairingReadiness(yamaha,catalog,curatedPairingFor(yamaha));
 assert.equal(r.status,'calculable');
 assert.deepEqual(r.missing,[]);
});

test('Fosi/Polk is electrically supportable but lacks measured comparable continuous output',()=>{
 const r=passivePairingReadiness(fosi,catalog,curatedPairingFor(fosi));
 assert.equal(r.status,'incomplete');
 assert.deepEqual(r.missing,['amplifier continuous power at the speaker nominal load']);
});

test('for a same-goal, same-room passive system with no budget, complete evidence comes first',()=>{
 assert.equal(passiveReadinessPriority(yamaha,fosi,catalog,curatedPairingFor,request),-1);
 const list=shortlistExamples(request,catalog).selected;
 assert.equal(list[0].id,'passive-as301-p5');
 assert.equal(list[0].headroomData.status,'calculable');
 assert.ok(list.find(x=>x.id==='passive-bt20a-xt15').headroomData.missing.length);
});

test('evidence sorting does not automatically override a restrictive budget',()=>{
 const req={...request,budget:500};
 assert.equal(passiveReadinessPriority(yamaha,fosi,catalog,curatedPairingFor,req),0);
});

test('missing catalogue is not treated as a measured failure',()=>{
 const a=passivePairingReadiness(yamaha,null,curatedPairingFor(yamaha));
 assert.equal(a.status,'unknown');
 assert.equal(passiveReadinessPriority(yamaha,fosi,null,curatedPairingFor,request),0);
});

test('powered speakers are not penalized for lacking external amplifier wattage',()=>{
 const powered=EXAMPLES.find(x=>x.id==='powered-mr4');
 assert.equal(passivePairingReadiness(powered,catalog,null).status,'not_applicable');
 assert.equal(passiveReadinessPriority(powered,yamaha,catalog,curatedPairingFor,request),0);
});

test('Builder waits for asynchronous catalogue data before selecting its top recommendation',()=>{
 const js=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 assert.match(js,/const catalogReady=attachSharedInventory\(\)/);
 assert.match(js,/await catalogReady;[\s\S]*?report\(selected\)/);
});
