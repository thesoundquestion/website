import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const catalog=read('equipment/catalog.generated.json');
const evidence=read('equipment/certification/verified-field-assertions.json');
const byId=new Map(catalog.records.map(r=>[r.id,r]));
const at=(obj,path)=>path.split('.').reduce((value,key)=>value?.[key],obj);

test('field-level source assertions match the catalogue exactly without conferring full certification',()=>{
 assert.ok(evidence.checks.length>=40);
 const keySet=new Set();
 for(const item of evidence.checks){
  assert.ok(byId.has(item.id),'Unknown checked model: '+item.id);
  assert.ok(/^https:\/\//.test(item.source),'Evidence must have HTTPS URL: '+item.id);
  assert.ok(item.claim?.length>10,'Evidence must identify specific claim');
  const key=item.id+':'+item.path;
  assert.ok(!keySet.has(key),'Duplicate assertion: '+key);
  keySet.add(key);
  assert.deepEqual(at(byId.get(item.id),item.path),item.expected,
   'Previously source-crosschecked specification changed: '+key);
 }
});

test('do not transform wattage marketing claims into certified continuous amplifier ratings',()=>{
 for(const id of ['builder/amp/fosi-audio-bt20a-pro','builder/amp/aiyima-a07-max-stereo']){
  const record=byId.get(id);
  assert.equal(record.profiles[0].details.outputPowerVerified,false);
  assert.equal(record.profiles.flatMap(p=>p.ratings||[]).length,0);
 }
});

test('active studio speaker amplifier watts remain separate from external amp ratings',()=>{
 for(const id of ['research/speaker/yamaha-hs5-studio','research/speaker/yamaha-hs7-studio','research/speaker/yamaha-hs8-studio']){
  const record=byId.get(id);
  assert.equal(record.facts.powered.value,true);
  assert.equal(record.facts.unitsPerRetailPackage.value,1);
  const watts=record.facts.internalAmplificationWatts.value;
  assert.equal(watts.combined,watts.lf+watts.hf);
  assert.ok(!record.facts.speakerPowerRatings,'Internal biamp power is not passive speaker power');
 }
});

test('amplifier continuous and dynamic labels remain distinct in normalized facts',()=>{
 for(const id of ['legacy/amp/yamaha-a-s301','legacy/amp/yamaha-a-s501','legacy/amp/yamaha-a-s701','legacy/amp/wiim-amp']){
  const ratings=byId.get(id).facts.speakerPowerRatings.value;
  assert.ok(ratings.some(r=>r.duration==='continuous'));
  assert.ok(ratings.some(r=>r.duration==='burst'));
  for(const r of ratings){
   assert.ok(r.loadOhms>0&&r.wattsPerChannel>0);
   assert.ok(['continuous','burst'].includes(r.duration));
  }
 }
});
