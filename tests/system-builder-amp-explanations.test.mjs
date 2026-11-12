import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {explainAmplifierChoice,shortlistAmpsForOwnedSpeakers,ownershipPlan} from '../system-builder/owned-gear-options.mjs';
import {soundProfileFor} from '../system-builder/sound-profiles.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const sandbox={window:{}}; createContext(sandbox);
for(const p of ['../system-check/gear.js','../system-check/compare/specs.js','../system-builder/catalog-adapter.js'])
  runInContext(read(p),sandbox);
const inventory=sandbox.window.systemBuilderInventory;
const speaker={name:'Paradigm Phantom v1',record:inventory.speaker.find(x=>x.model==='Paradigm Phantom v1')};
const request={goal:'natural',architecture:'open',useCase:'living_room',connection:'analog',region:'CA',currency:'CAD',power:'mains',
  budget:null,budgetStrict:true,level:'moderate'};
const results=(r=request,sp=speaker)=>shortlistAmpsForOwnedSpeakers({own:{speaker:sp},request:r,inventory});
test('amp models have genuinely different source-backed reasons and power figures',()=>{
  const options=results().selected;
  const first=options.find(x=>x.title.includes('Yamaha A-S301'));
  const second=options.find(x=>x.title.includes('Yamaha A-S501'));
  assert.ok(first&&second);
  assert.match(first.amplifierReason,/60 W at 8 Ω/);
  assert.match(second.amplifierReason,/85 W at 8 Ω/);
  assert.match(first.amplifierReason,/Paradigm Phantom v1/);
  assert.match(first.amplifierReason,/analogue|analog/);
  assert.match(second.amplifierReason,/first-stage equipment match/);
  assert.notEqual(first.amplifierReason,second.amplifierReason);
  assert.ok(first.amplifierSource.startsWith('https://'));
  assert.ok(first.amplifierEvidence.some(x=>x.includes('20 Hz')));
});
test('connection mismatch and unknown data remain explicit, never promised',()=>{
  const h=results({...request,connection:'hdmi'}).selected[0];
  assert.match(h.amplifierReason,/native hdmi input is not documented/);
  const unknown=results(request,{name:'Unlisted hand-built speaker',record:null}).selected[0];
  assert.match(unknown.amplifierReason,/no validated nominal impedance/);
  assert.doesNotMatch(unknown.amplifierReason,/speakers are 8 Ω/);
});
test('dynamic goal explicitly treats wattage as evidence to check headroom, not a sound-quality label',()=>{
  const amp=inventory.amp.find(x=>x.model==='Yamaha A-S301');
  const why=explainAmplifierChoice({idea:{model:amp.model,inputs:['analog']},record:amp,speaker,request:{...request,goal:'dynamic'}});
  assert.match(why.goalNote,/not a clean-SPL guarantee/);
  assert.ok(why.evidence.some(x=>/Preference:/.test(x)));
  assert.doesNotMatch(why.summary,/warm|holographic|perfect imaging|guaranteed/);
});
test('new amp suggestions carry source and speaker reference but not unsourced amplifier sound',()=>{
  const options=ownershipPlan({own:{speaker},request,inventory}).selected;
  assert.ok(options.every(x=>x.amplifierReason&&x.amplifierEvidence.length>=3));
  assert.ok(options.every(x=>x.reuseNames.includes(speaker.name)));
  assert.ok(options.every(x=>x.soundTarget===speaker.name));
  assert.equal(soundProfileFor(options[0]).type,'Not independently characterized');
});
test('browser card distinguishes amplifier why from actual speaker acoustic description',()=>{
  const app=read('../system-builder/app.mjs');
  assert.match(app,/item.amplifierReason \? 'Why this amplifier: '/);
  assert.match(app,/item.amplifierReason \|\| item.ownershipMessage/);
  assert.match(app,/const showSound = sound.type !== 'Not independently characterized'/);
  assert.match(app,/item.soundTarget \? 'Your speaker’s sound: '/);
  assert.match(app,/item.amplifierEvidence\?\.length/);
  assert.match(app,/Published amplifier specifications/);
});
