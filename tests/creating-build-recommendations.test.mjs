import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {buildCreatingSystem,CREATING_GOALS,DEFAULT_GOAL_COUNTS} from '../system-builder/creating/build-recommendations.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=x=>readFileSync(path.join(root,x),'utf8');
const catalog=JSON.parse(read('equipment/catalog.generated.json'));
const prices=JSON.parse(read('equipment/price-tiers.generated.json'));
const lookup=(name,kind)=>catalog.records.find(r=>r.model===name&&r.categories.includes(kind));
const stage=(plan,key)=>plan.stages.find(s=>s.key===key);

test('Creating Builder produces a model-backed system for all seven goals, without selecting existing gear',()=>{
 for(const mode of Object.keys(CREATING_GOALS)){
  const plan=buildCreatingSystem(catalog,{mode,microphoneCount:DEFAULT_GOAL_COUNTS[mode],prices});
  assert.ok(plan.stages.length>=4,mode+' lacks a complete chain');
  assert.ok(stage(plan,'mic')?.pick?.model,mode+' lacks a microphone example');
  assert.ok(stage(plan,'capture')?.pick?.model,mode+' lacks a recording input or mixer');
  assert.ok(plan.purchased.length>=3,mode+' lacks researchable purchase suggestions');
  assert.ok(plan.lessons.length>=2);
  assert.match(plan.disclaimer,/not verified live stock/);
  if(mode==='live')assert.ok(stage(plan,'pa')?.pick?.model,'Live PA candidate missing');
  else{assert.ok(stage(plan,'headphones')?.pick?.model);assert.ok(stage(plan,'software'))}
 }
});

test('A single USB microphone does not require another external mic interface',()=>{
 const plan=buildCreatingSystem(catalog,{mode:'vocal',micConnection:'usb',microphoneCount:1});
 assert.match(stage(plan,'mic').pick.model,/MV7\+/);
 assert.equal(stage(plan,'capture').need,'included');
 assert.ok(!plan.purchased.some(x=>x.key==='capture'));
});

test('two editable microphone recordings exclude known stereo-only USB mixer outputs',()=>{
 const plan=buildCreatingSystem(catalog,{mode:'podcast',microphoneCount:2,independentTracks:true});
 assert.ok(stage(plan,'capture').pick?.model);
 assert.doesNotMatch(stage(plan,'capture').pick.model,/Yamaha MG10XU|Behringer XENYX/);
 assert.ok(plan.notes.some(x=>x.startsWith('Separate tracks mean')));
 const mixed=buildCreatingSystem(catalog,{mode:'podcast',microphoneCount:2});
 assert.ok(mixed.notes.some(x=>x.startsWith('You chose a combined recording')));
});

test('higher count requires actual multitrack-capable input hardware, not mixer front-panel channel count',()=>{
 const supported=buildCreatingSystem(catalog,{mode:'band',microphoneCount:6,independentTracks:true});
 assert.equal(stage(supported,'capture').pick?.model,'Zoom LiveTrak L-12');
 const unsupported=buildCreatingSystem(catalog,{mode:'band',microphoneCount:12,independentTracks:true});
 assert.equal(stage(unsupported,'capture').need,'verify');
 assert.ok(unsupported.messages.some(x=>x.includes('No model in the current catalogue')));
});

test('owned gear is reused and missing models are not assigned invented specifications',()=>{
 const mic=lookup('Shure SM58','microphone'),capture=lookup('M-Audio M-Track Solo','audio_interface');
 assert.ok(mic&&capture);
 const plan=buildCreatingSystem(catalog,{mode:'vocal',microphoneCount:1,owned:{mic:mic.id,capture:capture.id}});
 assert.equal(stage(plan,'mic').need,'reuse');assert.equal(stage(plan,'capture').need,'reuse');
 assert.ok(!plan.purchased.some(x=>['mic','capture'].includes(x.key)));
 const unknown=buildCreatingSystem(catalog,{mode:'vocal',ownedNames:{mic:'My vintage microphone'}});
 assert.equal(stage(unknown,'mic').need,'reuse');
 assert.match(stage(unknown,'mic').pick.reason,/not in our verified catalogue/);
});

test('studio-monitor candidates include Yamaha HS5 HS7 HS8 from canonical catalogue',()=>{
 const plan=buildCreatingSystem(catalog,{mode:'songwriter',includeMonitors:true});
 const mon=stage(plan,'monitors');
 assert.equal(mon.quantity,2);
 const names=[mon.pick,...mon.alternatives].map(x=>x.model);
 for(const model of ['Yamaha HS5','Yamaha HS7','Yamaha HS8'])
  assert.ok(names.includes(model),model);
 assert.ok(mon.checks.some(x=>x.includes('powered speaker')));
 assert.ok(!stage(buildCreatingSystem(catalog,{mode:'vocal'}),'monitors'));
});
