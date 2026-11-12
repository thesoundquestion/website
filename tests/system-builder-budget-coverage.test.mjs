import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {BUILDER_ONLY_SPEAKERS,builderOnlySpeakerFor} from '../system-builder/supplemental-speakers.mjs';
import {CANADIAN_PAIR_PRICE_OBSERVATIONS,priceContextFor,broadActivePromotionFor} from '../system-builder/market-price-context.mjs';
import {shortlistSpeakersForOwnedAmplifier} from '../system-builder/owned-amp-speakers.mjs';
import {ownerEvidenceFor} from '../system-builder/owner-evidence.mjs';
import {soundProfileFor} from '../system-builder/sound-profiles.mjs';

const src=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const sandbox={window:{}};
createContext(sandbox);
for(const path of ['../system-check/gear.js','../system-check/compare/specs.js','../system-builder/catalog-adapter.js'])
  runInContext(src(path),sandbox);
const inventory=sandbox.window.systemBuilderInventory;
const amp=name=>({name,record:inventory.amp.find(x=>x.model===name)||null});
const base={amp:amp('Yamaha A-720'),speakers:inventory.speaker,goal:'all_rounder',useCase:'living_room',
    region:'CA',currency:'CAD',power:'mains',used:true,budgetStrict:true,referenceDate:'2026-11-12',
    level:'moderate',distanceFt:8,connection:'analog'};
const leads=overrides=>shortlistSpeakersForOwnedAmplifier({...base,...overrides});

test('two Builder-only budget records do not mutate the original System Check presets',()=>{
  assert.equal(BUILDER_ONLY_SPEAKERS.length,2);
  assert.ok(BUILDER_ONLY_SPEAKERS.every(x=>!inventory.speaker.some(s=>s.model===x.model)));
  assert.ok(BUILDER_ONLY_SPEAKERS.every(x=>x.evidence.includes('NOT an original System Check preset')));
  assert.equal(builderOnlySpeakerFor('Polk Monitor XT15').values.minimum,4.1);
  assert.equal(builderOnlySpeakerFor('Polk Monitor XT20').values.minimum,4.3);
});

test('distinct price references are documented for new XT15 and XT20 stereo pairs',()=>{
  const x=priceContextFor('Polk Monitor XT15');
  const y=priceContextFor('Polk Monitor XT20');
  assert.ok(x.regular.length>=3&&x.regular.every(s=>s.amount===249&&s.unit==='pair'));
  assert.ok(y.regular.length>=3&&y.regular.every(s=>s.amount===349&&s.unit==='pair'));
  assert.ok(y.promotion.some(s=>s.amount===279));
  assert.equal(broadActivePromotionFor('Polk Monitor XT20','CA','CAD','2026-11-12'),null);
});

test('a CAD 249 firm budget produces an actual new speaker pair, not only unpriced names',()=>{
  const r=leads({budget:249});
  assert.equal(r.selected[0].title,'Polk Monitor XT15');
  assert.equal(r.selected[0].subtotal,249);
  assert.equal(r.selected[0].pricingStatus,'partial_subtotal');
  assert.ok(r.selected[0].parts.every(x=>!/receiver|amplifier/i.test(x.name)));
});

test('a CAD 248 strict ceiling does not falsely claim XT15 costs less',()=>{
  const r=leads({budget:248,used:false});
  assert.ok(!r.selected.some(x=>x.title==='Polk Monitor XT15'));
  assert.ok(r.excluded.some(x=>x.title==='Polk Monitor XT15'));
});

test('the XT20 promotional single-source offer does not replace the regular CAD 349 reference',()=>{
  const r=leads({budget:300});
  assert.ok(!r.selected.some(x=>x.title==='Polk Monitor XT20'));
  assert.ok(r.excluded.some(x=>x.title==='Polk Monitor XT20'));
});

test('two independent Atom promo dealers plus dated 25 percent program make CAD 269.99 usable',()=>{
  const p=broadActivePromotionFor('Paradigm Monitor SE Atom','CA','CAD','2026-11-12');
  assert.ok(p);
  assert.equal(p.amount,269.99);
  assert.ok(p.dealerCount>=2);
  assert.equal(p.regularListed,359.99);
  assert.equal(p.endDate,'2027-01-04');
  assert.equal(CANADIAN_PAIR_PRICE_OBSERVATIONS['Paradigm Monitor SE Atom'].regular.length,3);
});

test('Yamaha R-S202 gets a specific budget-fitting Atom during sale, but not demanding Polk XT models',()=>{
  const r=leads({amp:amp('Yamaha R-S202'),budget:300});
  const atom=r.selected.find(x=>x.title==='Paradigm Monitor SE Atom');
  assert.ok(atom);
  assert.equal(atom.subtotal,269.99);
  assert.equal(atom.pricingStatus,'seasonal_promotional_pair');
  assert.ok(!r.selected.some(x=>x.title==='Polk Monitor XT15'||x.title==='Polk Monitor XT20'));
});

test('promotion disappears after published date and reverts to regular price',()=>{
  assert.equal(broadActivePromotionFor('Paradigm Monitor SE Atom','CA','CAD','2027-01-05'),null);
  assert.equal(broadActivePromotionFor('Paradigm Monitor SE Atom','CA','CAD','2026-10-15'),null);
  const r=leads({amp:amp('Yamaha R-S202'),budget:300,referenceDate:'2027-01-05'});
  assert.ok(!r.selected.some(x=>x.title==='Paradigm Monitor SE Atom'));
  assert.ok(r.excluded.some(x=>x.title==='Paradigm Monitor SE Atom'));
});

test('unknown locations cannot inherit Canadian pair pricing or seasonal sale',()=>{
  assert.equal(broadActivePromotionFor('Paradigm Monitor SE Atom','US','USD','2026-11-12'),null);
  const r=leads({region:'GB',currency:'GBP',budget:250});
  assert.ok(r.selected.length>0);
  assert.ok(r.selected.every(x=>x.subtotal===null&&x.marketContext===null));
});

test('a CAD 100 budget does not put the known CAD 125-195 used asking band first',()=>{
  const r=leads({budget:100});
  assert.ok(r.selected.length>0);
  assert.notEqual(r.selected[0].title,'Paradigm Titan v3');
  assert.ok(!r.selected.some(x=>x.subtotal!==null&&x.subtotal>100));
  assert.ok(r.excluded.some(x=>x.title==='Polk Monitor XT15'));
});

test('at CAD 180 the Titan is a conditional used lead with three asks, never a claimed median',()=>{
  const r=leads({budget:180});
  const item=r.selected.find(x=>x.title==='Paradigm Titan v3');
  assert.ok(item);
  assert.equal(item.subtotal,null);
  assert.equal(item.usedExampleRange.min,125);
  assert.equal(item.usedExampleRange.max,195);
  assert.equal(item.usedExampleRange.notRegionalMedian,true);
  assert.equal(item.marketContext.usedAsks.length,3);
});

test('XT20 owner notes acknowledge dissatisfaction and XT15 editorial notes remain qualified',()=>{
  const x=ownerEvidenceFor('Polk Monitor XT20');
  assert.ok(x.sources.length>=2);
  assert.match(x.short,/others|separate owner/i);
  assert.match(x.caution,/not a measured/i);
  const y=soundProfileFor({title:'Polk Monitor XT15'});
  assert.match(y.type,/Independent hands-on/);
  assert.equal(y.ownerSources,undefined);
});

test('UI supports Builder-only owned speaker selection, price labels and avoids broad fake scores',()=>{
  const app=src('../system-builder/app.mjs');
  assert.match(app,/BUILDER_ONLY_SPEAKERS/);
  assert.match(app,/builderOnlySpeakerFor\(exact\)/);
  assert.match(app,/seasonal dealer sale/);
  assert.match(app,/item\.budgetCaution/);
  assert.doesNotMatch(app,/overallAcousticMatchScore/);
});
