import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {OWNER_EVIDENCE,ownerEvidenceFor,ownerEvidenceTier} from '../system-builder/owner-evidence.mjs';
import {soundProfileFor} from '../system-builder/sound-profiles.mjs';
import {shortlistSpeakersForOwnedAmplifier} from '../system-builder/owned-amp-speakers.mjs';

const file = path => readFileSync(new URL(path,import.meta.url),'utf8');
const ctx={window:{}};
createContext(ctx);
runInContext(file('../system-check/gear.js'),ctx);
runInContext(file('../system-check/compare/specs.js'),ctx);
runInContext(file('../system-builder/catalog-adapter.js'),ctx);
const inventory=ctx.window.systemBuilderInventory;
const amp=name=>({name,record:inventory.amp.find(x=>x.model===name)||null});
const base={amp:amp('Yamaha A-720'),speakers:inventory.speaker,useCase:'living_room',goal:'natural',
  region:'CA',currency:'CAD',power:'mains',level:'moderate',distanceFt:8,used:true,budget:null,budgetStrict:true};

test('the owner-evidence pilot is exact-model, source-linked, original summary only',()=>{
  const models=Object.keys(OWNER_EVIDENCE);
  assert.equal(models.length,12);
  for(const model of models){
    const e=ownerEvidenceFor(model);
    assert.ok(inventory.speaker.some(x=>x.model===model));
    assert.ok(e.short.length>25&&e.short.length<300);
    assert.ok(e.caution.length>25);
    assert.ok(e.sources.length>=1);
    assert.ok(e.sources.every(s=>/^https:\/\/www\.reddit\.com\//.test(s.url) && s.context));
    assert.equal(e.matchScore,undefined);
    assert.equal(e.reviewPercentage,undefined);
  }
});

test('review availability is not a score of perceived acoustic quality',()=>{
  assert.equal(ownerEvidenceTier('Polk Signature Elite ES15','natural'),0);
  assert.equal(ownerEvidenceTier('Polk Signature Elite ES20','bass'),1);
  assert.equal(ownerEvidenceTier('Polk Signature Elite ES20','imaging'),3);
  assert.equal(ownerEvidenceTier('Paradigm Monitor SE Atom','all_rounder'),2);
  assert.equal(ownerEvidenceTier('Klipsch R-50M','dynamic'),1);
  assert.equal(ownerEvidenceTier('completely unknown model','natural'),3);
});

test('mixed first-person reports preserve disagreement and do not become a sound-quality score',()=>{
  const x=soundProfileFor({title:'ELAC Debut 3.0 DB63'});
  assert.match(x.type,/Multiple owners, mixed experiences/);
  assert.match(x.text,/others/);
  assert.ok(x.ownerSources.length>=3);
  assert.match(x.ownerCaution,/not an objective/);
  assert.ok(!('matchScore' in x));
});

test('KEF Q150 owner experience and low-impedance caution are both surfaced',()=>{
  const x=soundProfileFor({title:'KEF Q150'});
  assert.match(x.text,/clarity|stereo placement|detail/i);
  assert.match(x.ownerCaution,/impedance/i);
  assert.ok(x.ownerSources.length>=2);
});

test('a known owner-supported model is used instead of an unrelated measurement review',()=>{
  const x=soundProfileFor({title:'Q Acoustics 3020i'});
  assert.match(x.type,/owner/i);
  assert.ok(x.ownerSources.length>=2);
  assert.ok(x.ownerSources.every(s=>s.url.startsWith('https://')));
});

test('models without curated owner evidence retain editorial or manufacturer description',()=>{
  const x=soundProfileFor({id:'powered-ora',title:'Kanto ORA'});
  assert.match(x.type,/Independent measurements and review/);
  assert.equal(x.ownerSources,undefined);
  const unknown=soundProfileFor({title:'Nonexistent speaker XYZ'});
  assert.equal(unknown.type,'Not independently characterized');
});

test('goal-matched owner-corroborated models rise above weaker review coverage',()=>{
  const result=shortlistSpeakersForOwnedAmplifier({...base,goal:'natural'});
  assert.equal(result.selected[0].title,'Polk Signature Elite ES15');
  assert.ok(result.selected.some(x=>x.title==='ELAC Debut 3.0 DB63'));
  assert.equal(result.selected[0].ownerEvidenceBasis,'repeated');
});

test('bass goal allows repeated but mixed DB63 owner evidence, not a fabricated bass score',()=>{
  const result=shortlistSpeakersForOwnedAmplifier({...base,goal:'bass'});
  assert.equal(result.selected[0].title,'ELAC Debut 3.0 DB63');
  assert.ok(result.selected.some(x=>x.title==='Polk Signature Elite ES20'));
  assert.equal(result.selected[0].matchScore,undefined);
});

test('missing owner stories never disqualify an eligible speaker',()=>{
  const result=shortlistSpeakersForOwnedAmplifier({...base,goal:'dynamic'});
  assert.ok(result.selected.some(x=>x.title==='Klipsch R-50M'));
  const klipsch=result.selected.find(x=>x.title==='Klipsch R-50M');
  assert.equal(klipsch.ownerEvidenceBasis,'some');
});

test('documented 8-ohm-only amplifier restriction still blocks demanding KEF route',()=>{
  const result=shortlistSpeakersForOwnedAmplifier({...base,amp:amp('Yamaha R-S202'),goal:'imaging'});
  assert.ok(result.selected.length>=2);
  assert.ok(result.selected.some(x=>x.title==='Polk Signature Elite ES15'));
  assert.ok(!result.selected.some(x=>x.title==='KEF Q150'));
});

test('a missing nominal speaker rating is a warning, not disappearance',()=>{
  const target='Polk Signature Elite ES15';
  const modified=inventory.speaker.map(x=>x.model===target?
    {...x,values:{...x.values,load:undefined}}:x);
  const result=shortlistSpeakersForOwnedAmplifier({...base,speakers:modified});
  const item=result.selected.find(x=>x.title===target);
  assert.ok(item,'candidate remains visible under incomplete manufacturer data');
  assert.match(item.loadCaution,/do not connect/i);
  assert.match(item.extra.join(' '),/Do NOT connect/);
});

test('regional unpriced records still appear as prices to verify, not zero-dollar bargains',()=>{
  const result=shortlistSpeakersForOwnedAmplifier({...base,region:'GB',currency:'GBP',budget:200});
  assert.ok(result.selected.length>0);
  assert.ok(result.selected.every(x=>x.subtotal===null&&x.pricingStatus==='regional_price_missing'));
});

test('implementation keeps the reviews in optional expanded sources and defaults to compact cards',()=>{
  const app=file('../system-builder/app.mjs');
  assert.match(app,/sound\.ownerSources\?\.length/);
  assert.match(app,/sound\.ownerCaution/);
  assert.match(app,/source\.context/);
  assert.match(app,/const details = el\('details','sb-card-details'\)/);
});

test('an own-speaker route does not assign an amplifier a speaker owner profile',()=>{
  const x=soundProfileFor({title:'Yamaha A-S301'});
  assert.equal(x.type,'Not independently characterized');
  assert.equal(x.ownerSources,undefined);
});

test('expanded owner records separate generations and admit real dissent',()=>{
  const dali=ownerEvidenceFor('DALI Oberon 1');
  assert.equal(dali.sources.length,2);
  assert.match(dali.short,/fatigue/i);
  const wharf=ownerEvidenceFor('Wharfedale Diamond 12.2');
  assert.ok(wharf.sources.length>=3);
  assert.match(wharf.caution,/12\.2i/);
  const oldElac=ownerEvidenceFor('ELAC Debut 2.0 B6.2');
  assert.ok(oldElac && oldElac.sources.length>=2);
  assert.match(oldElac.caution,/DB63/);
  const titan=ownerEvidenceFor('Paradigm Titan v3');
  assert.match(titan.caution,/foam|surround/i);
  assert.ok(!ownerEvidenceFor('Wharfedale Diamond 12.2i'));
  assert.ok(!ownerEvidenceFor('Klipsch R-50M II'));
});

test('rare or unreviewed exact models remain discoverable, not deleted by owner tiers',()=>{
  const original=shortlistSpeakersForOwnedAmplifier({...base,goal:'dynamic'});
  assert.ok(original.selected.some(x=>x.title==='Klipsch R-50M'));
  assert.ok(original.selected.every(x=>Number.isFinite(x.speakerValues.load)||
    /Load unknown/.test(x.loadCaution)));
});
