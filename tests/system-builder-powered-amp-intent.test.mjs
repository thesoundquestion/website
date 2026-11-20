import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {isPoweredSpeakerRecord,isPoweredSpeakerModel,availableSpeakersForIntent,POWERED_AMP_MESSAGE} from '../system-builder/speaker-route.mjs';
import {shortlistAmpsForOwnedSpeakers} from '../system-builder/owned-gear-options.mjs';
import {builderFieldRequirement,validateBuilderIntent} from '../system-builder/intent-routing.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=JSON.parse(read('equipment/catalog.generated.json'));
const speakers=catalog.records.filter(r=>r.categories.includes('speaker'));
const legacyContext={window:{}};
createContext(legacyContext);
for(const p of ['equipment/legacy-presets.generated.js','equipment/compare-details.generated.js','system-builder/catalog-adapter.js'])runInContext(read(p),legacyContext);
const inventory=legacyContext.window.systemBuilderInventory;
const ampOptions=Object.values(inventory.amp);

test('amplifier shopping filters known powered studio, PA and powered stereo pairs but keeps passive speakers',()=>{
  const options=[...speakers.map(x=>({model:x.model})),{model:'Edifier R1280DBs'},{model:'Kanto ORA'}];
  const metadata={shared:speakers,pairs:[{model:'Edifier R1280DBs'},{model:'Kanto ORA'}]};
  const filtered=availableSpeakersForIntent(options,'amp_for_speakers',metadata).map(x=>x.model);
  for(const name of ['Yamaha HS5','Yamaha HS7','Yamaha HS8','JBL 305P MkII','QSC K12.2','Edifier R1280DBs','Kanto ORA'])
    assert.ok(!filtered.includes(name),name+' must not appear as passive for amplifier shopping');
  const passive=speakers.find(x=>x.facts?.powered?.value!==true);
  assert.ok(passive, 'passive model available');
  assert.ok(filtered.includes(passive.model),'passive models should not be blocked');
  const all=availableSpeakersForIntent(options,'improve_existing',metadata).map(x=>x.model);
  assert.ok(all.includes('Yamaha HS5')&&all.includes('Kanto ORA'),'powered speakers still usable in other builder tasks');
});

test('model classification uses sourced powered role and powered flag; unknown type is not falsely certified',()=>{
  const hs=speakers.find(x=>x.model==='Yamaha HS5');
  assert.equal(isPoweredSpeakerRecord(hs),true);
  assert.equal(isPoweredSpeakerRecord({speakerKind:'powered_pa_speaker'}),true);
  assert.equal(isPoweredSpeakerRecord({powered:true}),true);
  assert.equal(isPoweredSpeakerRecord({values:{load:8}}),false);
  assert.equal(isPoweredSpeakerModel('Yamaha HS5',{shared:speakers}),true);
  assert.equal(isPoweredSpeakerModel('Model not catalogued',{shared:speakers}),false);
});

test('even a direct amp-shortlist call refuses a powered speaker as an external passive load',()=>{
  const powered={name:'Yamaha HS5',record:{model:'Yamaha HS5',powered:true,speakerKind:'powered_studio_monitor',values:{load:8}}};
  const result=shortlistAmpsForOwnedSpeakers({own:{speaker:powered},request:{architecture:'passive_separates'},inventory});
  assert.equal(result.mode,'powered_speaker_not_passive');
  assert.equal(result.selected.length,0);
  assert.match(result.excluded[0].reason,/have amplification built in/);
  const pair=shortlistAmpsForOwnedSpeakers({own:{speaker:{name:'Kanto ORA',record:{}}},inventory});
  assert.equal(pair.selected.length,0);
  assert.match(POWERED_AMP_MESSAGE,/line-level source/);
});

test('unlisted speaker type is required for amp shopping and powered ownership stops the wrong route early',()=>{
  assert.equal(builderFieldRequirement('amp_for_speakers','speakerPowerType'),'required_if_unlisted');
  assert.equal(builderFieldRequirement('improve_existing','speakerPowerType'),'optional');
  const form=new FormData();
  form.set('speakerOther','Unlisted active speaker');
  form.set('speakerPowerType','powered');
  const check=validateBuilderIntent('amp_for_speakers',form);
  assert.equal(check.ok,false);
  assert.match(check.message,/already have amplification built in/);
});

test('dropdown is filtered by task and checked again on submission, rather than only describing groups',()=>{
  const app=read('system-builder/app.mjs');
  const route=read('system-builder/intent-routing.mjs');
  const html=read('system-builder/index.html');
  assert.match(app,/function filterSpeakerChoicesForIntent\(\)/);
  assert.match(app,/intentSelect\.value==='amp_for_speakers'/);
  assert.match(app,/isPoweredSpeakerModel\(option\.value/);
  assert.match(app,/rememberSpeakerChoices\(\);\s*filterSpeakerChoicesForIntent\(\);/);
  assert.match(app,/if\(knownPowered\|\|isPoweredSpeakerRecord\(speaker\.record\)\)/);
  assert.match(route,/formData\.get\('speakerPowerType'\)!=='passive'/);
  assert.match(html,/name="speakerPowerType"/);
});
