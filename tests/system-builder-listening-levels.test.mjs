import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shortlistExamples} from '../system-builder/recommendations.mjs';
import {assessAmplifierCandidate} from '../system-builder/amplifier-fit.mjs';
import {compareExamplePriorities} from '../system-builder/decision-context.mjs';

const request={architecture:'open',goal:'all_rounder',useCase:'bedroom',
  level:'moderate',distanceFt:8,region:'CA',currency:'CAD',connection:'analog',
  budget:null,budgetStrict:true,power:'mains',secondary:[],referenceDate:'2026-11-13'};
const load=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('quiet, normal and occasionally loud are preferences, not numerical eligibility thresholds',()=>{
 const results=['quiet','moderate','high'].map(level=>
   shortlistExamples({...request,level}));
 const ids=results.map(r=>r.selected.map(x=>x.id).sort());
 assert.deepEqual(ids[0],ids[1]);
 assert.deepEqual(ids[1],ids[2]);
 assert.ok(results.every(x=>x.selected.length>0));
});
test('high preference does not arbitrarily demote otherwise identical nearfield versus passive ideas',()=>{
 const powered={id:'powered-mr4',architecture:'consumer_powered_pair',
   places:['bedroom'],goals:['all_rounder'],connections:['analog']};
 const passive={id:'passive-stereo',architecture:'passive_separates',
   places:['bedroom'],goals:['all_rounder'],connections:['analog']};
 const compare=r=>compareExamplePriorities(powered,passive,r,x=>x.id===powered.id?0:1);
 assert.ok(compare({...request,level:'moderate',distanceFt:16})<0);
 assert.ok(compare({...request,level:'high',distanceFt:16})<0);
});
test('a qualitative high preference does not replace amplifier evidence with a made-up loudness penalty',()=>{
 const speaker={record:{values:{load:8,speakerPowerNominal:100}}};
 const record={ratings:[[50,8,'continuous','20 Hz–20 kHz, 0.08% THD']]};
 const idea={model:'Generic amplifier',inputs:['analog']};
 const ordinary=assessAmplifierCandidate({idea,record,speaker,request:{level:'moderate',connection:'analog'}});
 const loud=assessAmplifierCandidate({idea,record,speaker,request:{level:'high',connection:'analog'}});
 assert.equal(loud.sortValue,ordinary.sortValue);
 assert.equal(loud.powerBand,'lower_reserve');
 assert.match(loud.headroomNote,/desired listening level and peaks/);
});
test('builder explicitly describes approximate averages without promoting them to hard compatibility limits',()=>{
 const html=load('../system-builder/index.html');
 assert.match(html,/name="level"/);
 assert.match(html,/listening preferences, not measured volume settings or pass\/fail thresholds/);
 assert.match(html,/65–75 dB SPL/);
 assert.match(html,/Loudness and exposure time/);
});
test('System Check uses a normal illustrative starting point and preserves louder user-editable scenarios',()=>{
 const html=load('../system-check/index.html');
 assert.match(html,/name="average"[^>]*value="75"/);
 assert.match(html,/name="peak"[^>]*value="90"/);
 assert.match(html,/name="gap"[^>]*value="15"/);
 assert.match(html,/set 95, 100 or 105 dB peaks/);
 assert.match(html,/not interchangeable/);
});
test('explicit battery and source restrictions remain independent of loudness label',()=>{
 for(const level of ['quiet','moderate','high']){
  const x=shortlistExamples({...request,level,power:'battery',
    architecture:'party_pa',useCase:'party',goal:'party'});
  assert.ok(x.selected.every(y=>y.power==='battery'));
  assert.ok(x.excluded.some(y=>/Battery operation required/.test(y.reason)));
 }
});
