import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {ownershipPlan} from '../system-builder/owned-gear-options.mjs';
import {shortlistSpeakersForOwnedAmplifier} from '../system-builder/owned-amp-speakers.mjs';

const context={window:{}};createContext(context);
const read=x=>readFileSync(new URL('../'+x,import.meta.url),'utf8');
for(const path of ['system-check/gear.js','system-check/compare/specs.js','system-builder/catalog-adapter.js'])
  runInContext(read(path),context);
const inventory=context.window.systemBuilderInventory;
const get=(kind,name)=>({name,record:inventory[kind].find(x=>x.model===name)});
const own={speaker:get('speaker','Paradigm Titan v3'),amp:get('amp','Yamaha A-720')};
const request={
 buildIntent:'improve_existing',architecture:'open',goal:'dynamic',
 level:'high',useCase:'living_room',connection:'undecided',
 distanceFt:10,region:'CA',currency:'CAD',budget:null,used:true,
 subMode:'no_sub',secondary:[]
};

test('A-720 and Titan v3 have saved rated power and sensitivity for a headroom baseline',()=>{
  assert.equal(own.amp.record.ratings.some(r=>r[0]===105&&r[1]===8&&r[2]==='continuous'),true);
  assert.equal(own.speaker.record.values.load,8);
  assert.equal(own.speaker.record.values.sensitivity,86);
  assert.match(own.speaker.record.note,/86 dB anechoic \(89 dB in room\)/);
});
test('improve existing gives a saved-pair baseline plus relevant, different speaker alternatives',()=>{
  const plan=ownershipPlan({own,request,inventory});
  assert.equal(plan.mode,'improve_existing_pair');
  assert.ok(plan.selected.length>=3);
  assert.equal(plan.selected[0].id,'owned-complete');
  assert.equal(plan.selected[0].amplifierModel,'Yamaha A-720');
  assert.equal(plan.selected[0].speakerModel,'Paradigm Titan v3');
  assert.match(plan.selected[0].why,/dynamic-music comparison|dynamic recordings|occasionally loud/);
  const speakers=plan.selected.slice(1);
  assert.ok(speakers.every(x=>x.speakerModel&&x.speakerModel!=='Paradigm Titan v3'));
  assert.ok(speakers.every(x=>x.ownedAmpName==='Yamaha A-720'));
  assert.ok(speakers.every(x=>x.upgradeComparedTo==='Paradigm Titan v3'));
  assert.ok(speakers.every(x=>x.parts.some(p=>p.role.includes('Only new major component'))));
  assert.ok(speakers.every(x=>x.parts.some(p=>p.name==='Yamaha A-720')));
  assert.ok(speakers.some(x=>/Cerwin-Vega XLS|Klipsch/.test(x.speakerModel)));
});
test('speaker alternatives retain the source-linked 6-ohm load evidence for A-720',()=>{
  const plan=ownershipPlan({own,request,inventory});
  const towers=plan.selected.slice(1).filter(x=>x.speakerModel.startsWith('Cerwin-Vega XLS'));
  assert.ok(towers.length>=1);
  assert.ok(towers.every(x=>x.speakerValues.load===6));
  assert.ok(towers.every(x=>/methods|measurement/.test(x.speakerRationale)));
  assert.equal(plan.selected.slice(1).some(x=>x.speakerModel==='Paradigm Titan v3'),false);
});
test('ordinary reuse route still preserves both owned components without implying a purchase',()=>{
  const plan=ownershipPlan({own,request:{...request,buildIntent:'complete_system'},inventory});
  assert.equal(plan.mode,'keep_both');
  assert.equal(plan.selected.length,1);
  assert.equal(plan.selected[0].id,'owned-complete');
});
test('speaker upgrade research never invents a compatibility clearance for unknown or lower nominal impedance',()=>{
  const missing={speaker:own.speaker,amp:{name:'Unlisted Amp',record:null}};
  const r=shortlistSpeakersForOwnedAmplifier({...request,amp:missing.amp,
    speakers:inventory.speaker,upgradeReference:own.speaker});
  assert.ok(r.selected.every(x=>x.speakerModel!==own.speaker.name));
  assert.ok(r.selected.every(x=>x.extra.some(note=>/amplifier|minimum|load/i.test(note))));
});
test('Builder handoff and calculator use published in-room Titan sensitivity without double counting',()=>{
  const app=read('system-builder/app.mjs');
  const calculator=read('system-check/calculator.js');
  assert.match(app,/checkParams\\.set\\('preferRoom'/);
  assert.match(app,/amplifierModel:item\.amplifierModel/);
  assert.match(calculator,/\bdB\\s\*in\[\\s-\]\?room/);
  assert.match(calculator,/field\('room'\)\.value='0'/);
  assert.match(calculator,/runModelHandoff\(\)/);
});
test('the improvement route is not reduced to a silent retain-only card',()=>{
  const app=read('system-builder/app.mjs');
  assert.match(app,/upgradeIdeas=shortlist\.selected\.filter/);
  assert.match(app,/Speaker changes worth comparing/);
  assert.match(app,/renderComparisonPreview\(shortlist\.selected\[0\],shortlist\.selected\.slice\(1\)/);
});

// Improvement comparisons must work beyond a passive amplifier/speaker pair.
// No manufacturer measurement permits an automatic headphone or powered
// monitor "upgrade" verdict; retain current gear and compare complete paths.
test('owned headphone improvement keeps the current headphone and shows sourced comparisons',()=>{
  const ownHeadphone={headphone:get('headphone','Grado SR80e')};
  const plan=ownershipPlan({own:ownHeadphone,request:{
    ...request,architecture:'headphone_first',goal:'imaging',headphoneUse:'quiet'
  },inventory});
  assert.equal(plan.mode,'keep_headphones');
  assert.equal(plan.selected[0].id,'owned-headphones');
  assert.ok(plan.selected.length>1);
  assert.ok(plan.selected.slice(1).every(x=>x.architecture==='headphone_first'&&
    x.compareAgainst?.model==='Grado SR80e'&&
    x.keptSeparate.some(s=>s.includes('Grado SR80e'))));
});
test('ordinary headphone ownership does not create replacement suggestions',()=>{
  const plan=ownershipPlan({own:{headphone:get('headphone','Grado SR80e')},
    request:{...request,buildIntent:'complete_system',architecture:'headphone_first'},inventory});
  assert.equal(plan.selected.length,1);
});
test('active studio improvement retains owned amplification architecture, without passive amp recommendations',()=>{
  // Legacy passive speaker presets don't include studio monitor roles.
  // Use the canonical source-linked shared catalogue for a powered monitor.
  const sourceCatalog=JSON.parse(read('equipment/catalog.generated.json'));
  const entry=sourceCatalog.records.find(x=>x.categories.includes('speaker')&&
    x.facts?.speakerKind?.value==='powered_studio_monitor');
  assert.ok(entry,'Expected sourced powered studio monitor');
  const monitor={model:entry.model,speakerKind:entry.facts.speakerKind.value,
    url:entry.evidence?.find(e=>/^https:\/\//.test(e.url))?.url||null};
  const plan=ownershipPlan({own:{speaker:{name:monitor.model,record:monitor}},
    request:{...request,architecture:'open'},inventory});
  assert.equal(plan.mode,'keep_powered_studio');
  assert.equal(plan.selected[0].id,'owned-studio-monitor');
  assert.ok(plan.selected.length>1);
  assert.ok(plan.selected.slice(1).every(x=>x.architecture==='active_studio'&&
    x.compareAgainst?.model===monitor.model &&
    !x.parts.some(p=>/Only new amplifier candidate/.test(p.role))));
});
test('upgrade candidates explain the comparison rather than saying owned speakers are missing',()=>{
  const plan=ownershipPlan({own,request,inventory});
  const choices=plan.selected.slice(1);
  assert.ok(choices.length>0);
  assert.ok(choices.every(x=>!x.why.includes('missing stereo speakers')));
  assert.ok(choices.every(x=>x.why.includes('Paradigm Titan v3')));
  assert.ok(choices.every(x=>x.speakerRationale.includes('occasionally loud')));
});
test('beginner output shows the actual speaker-upgrade rationale first',async()=>{
  const {explainBeginnerOption}=await import('../system-builder/beginner-output.mjs');
  const choice=ownershipPlan({own,request,inventory}).selected[1];
  const summary=explainBeginnerOption(choice,request);
  assert.match(summary.reason,/occasionally loud, dynamic recordings/);
  assert.match(summary.reason,/Paradigm Titan v3/);
  assert.doesNotMatch(summary.reason,/missing stereo speakers/);
});
