import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {ownershipPlan,shortlistAmpsForOwnedSpeakers} from '../system-builder/owned-gear-options.mjs';
const src=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const context={window:{}};createContext(context);
for(const p of ['../system-check/gear.js','../system-check/compare/specs.js','../system-builder/catalog-adapter.js'])
  runInContext(src(p),context);
const inventory=context.window.systemBuilderInventory;
const gear=(kind,name)=>({name,record:inventory[kind].find(x=>x.model===name)||null});
const SPEAKER=gear('speaker','Paradigm Phantom v1');
const AMP=gear('amp','Yamaha A-720');
const SOURCE=gear('source','Creative Sound Blaster X-Fi Titanium HD (RCA)');
const HP=gear('headphone','Grado SR80e');
const base={architecture:'open',goal:'natural',secondary:['imaging'],useCase:'living_room',power:'mains',
  connection:'analog',region:'CA',currency:'CAD',budget:null,budgetStrict:true,used:true,
  level:'moderate',distanceFt:8};
const run=(own,request={})=>ownershipPlan({own,request:{...base,...request},inventory});
const allItems=plan=>plan.selected;

test('every ownership path returns a conditional retain-first plan rather than complete replacements',()=>{
  for(const kind of ['speaker','amp','source','headphone']) {
    const item={speaker:SPEAKER,amp:AMP,source:SOURCE,headphone:HP}[kind];
    const x=run({[kind]:item});
    assert.ok(x&&x.selected.length>0,kind);
    assert.ok(x.selected.some(y=>y.reuseNames.includes(item.name)),kind);
  }
});
test('owned speakers without amplifier get amplifier-only candidates, not new speaker pairs',()=>{
  const r=run({speaker:SPEAKER});
  assert.equal(r.mode,'keep_speakers');
  assert.ok(r.selected.some(x=>x.parts.some(p=>p.name==='Yamaha A-S301')));
  assert.ok(r.selected.every(x=>x.reuseNames.includes(SPEAKER.name)));
  assert.ok(r.selected.every(x=>x.parts.some(p=>p.name===SPEAKER.name && p.role.includes('Already owned'))));
  assert.ok(r.selected.every(x=>x.parts.every(p=>p.name===SPEAKER.name || !/speaker.*to purchase/i.test(p.role))));
  assert.ok(r.selected.every(x=>x.soundTarget===SPEAKER.name));
});
test('owned amplifier without speakers retains that amplifier in each named speaker option',()=>{
  const r=run({amp:AMP});
  assert.equal(r.mode,'keep_amp');
  assert.ok(r.selected.length>=3);
  assert.ok(r.selected.every(x=>x.reuseNames.includes(AMP.name)));
  assert.ok(r.selected.every(x=>x.preferenceMatchAvailable));
  assert.ok(r.selected.every(x=>x.parts[0].name===AMP.name));
});
test('owned speakers and amplifier get existing pairing first and no automatic purchasing',()=>{
  const r=run({speaker:SPEAKER,amp:AMP});
  assert.equal(r.mode,'keep_both');
  assert.equal(r.selected[0].id,'owned-complete');
  assert.equal(r.selected[0].subtotal,null);
  assert.deepEqual([...r.selected[0].reuseNames],[SPEAKER.name,AMP.name]);
  assert.ok(r.comparisonReasons.some(x=>/Replacing your speakers/.test(x)));
});
test('owned source is integrated with new system suggestions, not silently replaced',()=>{
  const r=run({source:SOURCE});
  assert.equal(r.mode,'keep_source');
  assert.ok(r.selected.length);
  assert.ok(r.selected.every(x=>x.reuseNames.includes(SOURCE.name)));
  assert.ok(r.selected.every(x=>x.parts[0].name===SOURCE.name));
  assert.ok(r.selected.every(x=>x.sourceCaution.includes(SOURCE.name)));
  assert.ok(r.selected.every(x=>x.preferenceMatchAvailable));
});
test('owned headphones alone remain primary even when system architecture is open',()=>{
  const r=run({headphone:HP});
  assert.equal(r.mode,'keep_headphones');
  assert.equal(r.selected[0].title,HP.name);
  assert.deepEqual([...r.selected[0].reuseNames],[HP.name]);
  assert.ok(!r.selected[0].parts.some(x=>x.name.includes('HD 600')));
});
test('headphones and own source stay together with headphone-output verification',()=>{
  const r=run({headphone:HP,source:SOURCE},{architecture:'headphone_first'});
  assert.equal(r.mode,'keep_headphones');
  assert.ok(r.selected[0].reuseNames.includes(SOURCE.name));
  assert.ok(r.selected[0].extra.some(x=>/not automatically a headphone amplifier/.test(x)));
});
test('owned speakers and source lead to a missing-amp pairing preserving both',()=>{
  const r=run({speaker:SPEAKER,source:SOURCE});
  assert.equal(r.mode,'keep_speakers');
  assert.ok(r.selected.length);
  assert.ok(r.selected.every(x=>x.reuseNames.includes(SPEAKER.name)&&x.reuseNames.includes(SOURCE.name)));
});
test('owned amp, source, and headphones preserve amp and source, with headphones kept separately',()=>{
  const r=run({amp:AMP,source:SOURCE,headphone:HP});
  assert.equal(r.mode,'keep_amp');
  assert.ok(r.selected.every(x=>x.reuseNames.includes(SOURCE.name)&&x.reuseNames.includes(AMP.name)));
  assert.ok(r.selected[0].keptSeparate.some(x=>x.includes(HP.name)));
});
test('all four owned in room route keeps speakers, amp and source; acknowledges headphones',()=>{
  const r=run({speaker:SPEAKER,amp:AMP,source:SOURCE,headphone:HP});
  assert.equal(r.mode,'keep_both');
  assert.equal(r.selected[0].reuseNames.length,3);
  assert.ok(r.selected[0].keptSeparate.some(x=>x.includes(HP.name)));
});
test('all four owned in headphone route retains headphones/source; acknowledges room system',()=>{
  const r=run({speaker:SPEAKER,amp:AMP,source:SOURCE,headphone:HP},{architecture:'headphone_first'});
  assert.equal(r.mode,'keep_headphones');
  assert.ok(r.selected[0].reuseNames.includes(HP.name));
  assert.ok(r.selected[0].keptSeparate.some(x=>x.includes(SPEAKER.name)));
  assert.ok(r.selected[0].keptSeparate.some(x=>x.includes(AMP.name)));
});
test('documented speaker/amp nominal restriction triggers visible warning and partial reuse alternatives',()=>{
  const speaker=gear('speaker','ELAC Debut 3.0 DB63');
  const amp=gear('amp','Yamaha R-S202');
  const r=run({speaker,amp});
  assert.equal(r.selected[0].id,'owned-complete');
  assert.match(r.selected[0].loadCaution,/Do not connect/);
  assert.ok(r.selected.some(x=>x.id.startsWith('owned-speaker-amp')));
  assert.ok(r.selected.every(x=>x.reuseNames.length>0));
});
test('incompatible powered architecture still offers a separate passive route keeping speakers',()=>{
  const r=run({speaker:SPEAKER},{architecture:'consumer_powered_pair'});
  assert.equal(r.mode,'keep_separate_speaker');
  assert.ok(r.selected.length);
  assert.ok(r.selected[0].reuseNames.includes(SPEAKER.name));
  assert.match(r.selected[0].pathwayCaution,/not the requested/);
});
test('battery requirement does not assert a mains-powered owned pair will run off grid',()=>{
  const r=run({speaker:SPEAKER,amp:AMP},{power:'battery'});
  assert.equal(r.mode,'keep_separate_pair');
  assert.match(r.selected[0].pathwayCaution,/battery/);
  assert.ok(r.comparisonReasons.some(x=>/Battery operation/.test(x)));
});
test('an owned source plus headphone-first goal retains source but never claims line out drives headphones',()=>{
  const r=run({source:SOURCE},{architecture:'headphone_first'});
  assert.equal(r.mode,'keep_source');
  assert.ok(r.selected.length);
  assert.ok(r.selected.every(x=>x.reuseNames.includes(SOURCE.name)));
  assert.ok(r.selected.every(x=>/not automatically a headphone amplifier/.test(x.sourceCaution)));
});
test('unlisted speaker names remain explicitly unknown rather than fabricated safe',()=>{
  const unknown={name:'Unlisted DIY Pair',record:null};
  const r=run({speaker:unknown});
  assert.equal(r.mode,'keep_speakers');
  assert.ok(r.selected.every(x=>x.extra.some(s=>/Check the speaker/.test(s))));
  assert.ok(r.selected.every(x=>x.reuseNames.includes('Unlisted DIY Pair')));
});
test('firm budget excludes known-over-budget amps but does not pretend unpriced gear costs zero',()=>{
  const r=run({speaker:SPEAKER},{budget:200});
  assert.ok(r.selected.every(x=>x.subtotal===null||x.subtotal<=200));
  assert.ok(r.excluded.some(x=>x.title==='Yamaha A-S301'));
  assert.ok(r.selected.every(x=>x.subtotal!==0));
});
test('all-new path is only selected when user has not declared any equipment',()=>{
  assert.equal(run({}),null);
});
test('UI places ownership plan ahead of example-only shortlist and hides comparison behind disclosure',()=>{
  const app=src('../system-builder/app.mjs');
  assert.match(app,/ownershipPlan\(\{own,request,inventory\}\)/);
  assert.match(app,/const shortlist = ownership \|\|/);
  assert.match(app,/item\.reuseNames\?\.length/);
  assert.match(app,/item\.pathwayCaution/);
  assert.match(app,/if \(ownership\) \{/);
  assert.match(app,/Compare new equipment: when would replacing yours make sense\?/);
  assert.match(app,/ownership\.comparisonReasons/);
  assert.match(app,/preferenceMatchAvailable/);
});
