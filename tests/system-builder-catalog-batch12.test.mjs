import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {BUILDER_ONLY_SPEAKERS,builderOnlySpeakerFor} from '../system-builder/supplemental-speakers.mjs';
import {BUILDER_ONLY_HEADPHONES,builderOnlyHeadphoneFor} from '../system-builder/supplemental-headphones.mjs';
import {ownerEvidenceFor} from '../system-builder/owner-evidence.mjs';
import {shortlistAmpsForOwnedSpeakers} from '../system-builder/owned-gear-options.mjs';
import {soundProfileFor} from '../system-builder/sound-profiles.mjs';
import {SPEAKER_IDEAS,shortlistSpeakersForOwnedAmplifier} from '../system-builder/owned-amp-speakers.mjs';
import {priceContextFor} from '../system-builder/market-price-context.mjs';
const source=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const sandbox={window:{}}; createContext(sandbox);
for(const file of ['../system-check/gear.js','../system-check/compare/specs.js','../system-builder/catalog-adapter.js'])
  runInContext(source(file),sandbox);
const inventory=sandbox.window.systemBuilderInventory;

test('five new exact passive speakers, two wired headphones supplement original 130 without duplication',()=>{
  assert.equal(BUILDER_ONLY_SPEAKERS.length,8);
  assert.equal(BUILDER_ONLY_HEADPHONES.length,2);
  assert.equal(Object.values(inventory).reduce((n,arr)=>n+arr.length,0),130);
  const seen=new Set();
  for(const r of [...BUILDER_ONLY_SPEAKERS,...BUILDER_ONLY_HEADPHONES]){
    assert.ok(r.model&&r.url.startsWith('https://'));
    assert.ok(r.note.length>=50);
    assert.ok(Object.isFrozen(r.values));
    assert.ok(!inventory[r.type].some(x=>x.model===r.model),r.model);
    assert.ok(!seen.has(r.model),r.model);
    seen.add(r.model);
  }
});
test('maker recommendations, program handling, and room sensitivity do not become numeric clean output',()=>{
  for(const n of ['PSB Alpha P3','PSB Alpha P5']){
    const x=builderOnlySpeakerFor(n);
    assert.equal(x.values.load,8);
    assert.equal(x.values.minimum,4);
    assert.equal(x.values.sensitivity,undefined);
    assert.equal(x.values.speakerPowerNominal,undefined);
    assert.equal(x.values.speakerPowerPeak,undefined);
    assert.match(x.values.speakerPowerNote,/program/);
    assert.match(x.note,/anechoic/);
  }
  const klipsch=builderOnlySpeakerFor('Klipsch RP-600M II');
  assert.ok(klipsch);
  assert.equal(klipsch.values.load,undefined);
  assert.equal(klipsch.values.sensitivity,undefined);
  assert.equal(klipsch.values.speakerPowerNominal,100);
  assert.equal(klipsch.values.speakerPowerPeak,400);
  assert.match(klipsch.note,/half-space/);
});
test('Q Acoustics original i and Triangle passive have model-specific impedance and source basis',()=>{
  const q=builderOnlySpeakerFor('Q Acoustics 3030i');
  const t=builderOnlySpeakerFor('Triangle Borea BR03 (passive)');
  assert.deepEqual([q.values.load,q.values.minimum,q.values.sensitivity,q.values.basis],[6,4,88,'voltage']);
  assert.deepEqual([t.values.load,t.values.minimum,t.values.sensitivity,t.values.basis],[8,4.2,90,'power']);
  assert.match(q.note,/3030c/);
  assert.match(t.note,/BR03 CONNECT/);
});
test('AKG K371 and FiiO FT1 have voltage-based headphone sensitivity, correct exact models',()=>{
  const akg=builderOnlyHeadphoneFor('AKG K371');
  const fiio=builderOnlyHeadphoneFor('FiiO FT1');
  assert.deepEqual([akg.values.load,akg.values.sensitivity,akg.values.basis],[32,114,'voltage']);
  assert.deepEqual([fiio.values.load,fiio.values.sensitivity,fiio.values.basis],[32,113,'voltage']);
  assert.match(fiio.note,/98 dB\/mW/);
  assert.equal(builderOnlyHeadphoneFor('K371-BT'),null);
  assert.equal(builderOnlyHeadphoneFor('FT1 Pro'),null);
});
test('each new passive model has a curated idea with useful goals and an honest drawback',()=>{
  const added=['PSB Alpha P3','PSB Alpha P5','Triangle Borea BR03 (passive)','Q Acoustics 3030i','Klipsch RP-600M II'];
  for(const model of added){
    const idea=SPEAKER_IDEAS.find(x=>x.model===model);
    assert.ok(idea,model);
    assert.ok(idea.goals.length>=3);
    assert.ok(idea.downside.length>=90);
    assert.ok(soundProfileFor({title:model}).text.length>=60);
  }
});
test('three new repeated owner contexts are exact-model linked, including disagreement',()=>{
  for(const model of ['Triangle Borea BR03 (passive)','Q Acoustics 3030i','Klipsch RP-600M II']){
    const x=ownerEvidenceFor(model);
    assert.ok(x&&x.sources.length>=2,model);
    assert.ok(x.sources.every(s=>s.url.startsWith('https://www.reddit.com/')));
    assert.match(x.caution,/not|No|cannot|Do not/);
  }
  assert.match(ownerEvidenceFor('Q Acoustics 3030i').short,/another|disagree|expected punch/i);
});
test('Canadian ordinary pair asking prices use corroborated exact pair sellers only',()=>{
  for(const [name,expected] of [['PSB Alpha P3',449],['PSB Alpha P5',699],['Triangle Borea BR03 (passive)',599]]){
    const context=priceContextFor(name,'CA','CAD');
    assert.ok(context,name);
    assert.ok(context.regular.length>=2);
    assert.ok(context.regular.every(p=>p.amount===expected&&p.unit==='pair'));
    assert.ok(new Set(context.regular.map(p=>new URL(p.url).hostname)).size>=2);
    assert.match(context.notes,/not|NOT/);
    assert.equal(priceContextFor(name,'US','USD'),null);
  }
});
test('known 8 ohm only amp blocks the new 4 ohm minimum speakers',()=>{
  const amp={name:'Yamaha R-S202',record:inventory.amp.find(x=>x.model==='Yamaha R-S202')};
  const r=shortlistSpeakersForOwnedAmplifier({amp,speakers:inventory.speaker,goal:'natural',
    useCase:'living_room',region:'CA',currency:'CAD',used:true,budgetStrict:false});
  for(const n of ['PSB Alpha P3','PSB Alpha P5','Triangle Borea BR03 (passive)','Q Acoustics 3030i']){
    assert.ok(r.excluded.some(x=>x.title===n),n);
    assert.ok(!r.selected.some(x=>x.title===n),n);
  }
});
test('app offers both new owned speaker and owned headphone identity models without overriding originals',()=>{
  const app=source('../system-builder/app.mjs');
  assert.match(app,/BUILDER_ONLY_HEADPHONES, builderOnlyHeadphoneFor/);
  assert.match(app,/kind==='headphone' \? BUILDER_ONLY_HEADPHONES/);
  assert.match(app,/kind==='headphone' \? builderOnlyHeadphoneFor\(exact\)/);
  assert.match(app,/original System Check presets|existing System Check presets/);
});

test('owned RP-600M II with unknown nominal load excludes explicit-floor Sony amp',()=>{
  const speaker={name:'Klipsch RP-600M II',record:builderOnlySpeakerFor('Klipsch RP-600M II')};
  const result=shortlistAmpsForOwnedSpeakers({
    own:{speaker},inventory,request:{goal:'dynamic',connection:'analog',region:'CA',currency:'CAD',used:true,budgetStrict:false}
  });
  assert.ok(result.selected.length>0);
  assert.ok(result.excluded.some(x=>x.title==='Sony STR-DH190' && /no verified numeric nominal/.test(x.reason)));
  assert.ok(!result.selected.some(x=>x.title.includes('Sony STR-DH190')));
  assert.ok(result.selected.every(x=>x.loadCaution && /Do not connect/.test(x.loadCaution)));
  assert.ok(result.selected.every(x=>x.reuseNames.includes(speaker.name)));
});
