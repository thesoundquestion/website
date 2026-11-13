import test from 'node:test';
import assert from 'node:assert/strict';
import {compareExamplePriorities,explainInputInteractions,
  explainExampleInteractions} from '../system-builder/decision-context.mjs';
import {shortlistExamples} from '../system-builder/recommendations.mjs';

const request={goal:'all_rounder',useCase:'living_room',level:'moderate',
  architecture:'open',connection:'undecided',distanceFt:8,power:'mains',
  region:'CA',currency:'CAD',budget:null,budgetStrict:true,secondary:[]};
const item=(id,patch={})=>({
  id,architecture:'consumer_powered_pair',goals:['all_rounder'],
  places:['living_room'],connections:['analog'],...patch
});
const first=(a,b,r)=>compareExamplePriorities(a,b,r,x=>x.id===a.id?0:1);

test('secondary goals break a true practical tie, but do not override the main goal',()=>{
  const natural=item('a',{goals:['all_rounder','natural']});
  const bass=item('b',{goals:['all_rounder','bass']});
  assert.ok(first(natural,bass,{...request,secondary:['bass']})>0);
  assert.ok(first(natural,bass,{...request,secondary:['natural']})<0);
  const mainBass=item('c',{goals:['bass']});
  assert.ok(first(mainBass,natural,{...request,goal:'bass',secondary:['natural']})<0);
});

test('a native required source connection wins over otherwise equal adapter dependency',()=>{
  const native=item('native',{connections:['analog','usb']});
  const adapter=item('adapter',{connections:['analog']});
  assert.ok(first(native,adapter,{...request,connection:'usb'})<0);
  assert.ok(first(adapter,native,{...request,connection:'usb'})>0);
  assert.ok(explainExampleInteractions(native,{...request,connection:'usb'})
    .some(x=>/Native USB/.test(x)));
});

test('high output at distance demotes small nearfield ideas without inventing max SPL',()=>{
  const desk=item('powered-mr4');
  const passive=item('stereo',{architecture:'passive_separates'});
  assert.ok(first(desk,passive,{...request,level:'high',distanceFt:16})>0);
  assert.ok(first(desk,passive,{...request,level:'moderate',distanceFt:8})<0);
  const notes=explainInputInteractions({...request,level:'high',distanceFt:16});
  assert.ok(notes.some(x=>/beyond 12 ft/.test(x)));
  assert.ok(notes.some(x=>/requires model-specific evidence/.test(x)));
});

test('hard budget prefers a region-matched within-ceiling subtotal over unknown price, not cheapest offer',()=>{
  const unknown=item('unknown');
  const priced=item('priced',{priceCA:{components:[{amount:295}]}});
  assert.ok(first(priced,unknown,{...request,budget:300})<0);
  assert.ok(first(unknown,priced,{...request,budget:300})>0);
  assert.equal(first(unknown,priced,{...request,budget:null}),-1);
  const notes=explainInputInteractions({...request,budget:300});
  assert.ok(notes.some(x=>/Unknown or partial total costs/.test(x)));
});

test('party battery outdoors and bass/sub interactions produce distinct disclosures',()=>{
  const party=explainInputInteractions({...request,goal:'party',useCase:'outdoors',
    power:'battery',level:'high',distanceFt:20});
  assert.ok(party.some(x=>/Party use/.test(x)));
  assert.ok(party.some(x=>/Battery operation/.test(x)));
  assert.ok(party.some(x=>/Outdoor use/.test(x)));
  const bass=explainInputInteractions({...request,goal:'bass',subMode:'no_sub'});
  const hpf=explainInputInteractions({...request,goal:'bass',subMode:'sub_hpf'});
  assert.ok(bass.some(x=>/main speakers must do the low-frequency work/.test(x)));
  assert.ok(hpf.some(x=>/wiring must still be verified/.test(x)));
  assert.ok(!hpf.some(x=>/low-frequency work/.test(x)));
});

test('fully specified current examples remain conditional, with linked decision factors but no invented scores',()=>{
  const result=shortlistExamples({...request,architecture:'consumer_powered_pair',
    useCase:'desk',connection:'usb',secondary:['low_volume'],budget:500});
  assert.ok(result.selected.length>0);
  assert.ok(result.selected.every(x=>Array.isArray(x.decisionReasons)));
  assert.ok(result.selected.every(x=>!('matchScore' in x)&&!('soundQualityScore' in x)));
  assert.ok(result.selected.every(x=>x.subtotal===null||x.subtotal<=500));
  assert.ok(result.selected.every(x=>x.connectionStatus==='native_possible'||x.connectionStatus==='adapter_needed'));
  assert.ok(result.selected.some(x=>x.connectionStatus==='native_possible'));
});

test('explicit known party battery and passive electrical constraints remain hard requirements',()=>{
  const party=shortlistExamples({...request,goal:'party',useCase:'party',
    architecture:'party_pa',power:'battery',level:'high',distanceFt:30});
  assert.ok(party.selected.every(x=>x.power==='battery'));
  assert.ok(party.excluded.some(x=>/Battery operation required/.test(x.reason)));
});
