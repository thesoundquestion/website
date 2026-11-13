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

test('Builder-only speaker additions do not mutate the original System Check presets',()=>{
  assert.equal(BUILDER_ONLY_SPEAKERS.length,9);
  assert.ok(BUILDER_ONLY_SPEAKERS.every(x=>!inventory.speaker.some(s=>s.model===x.model)));
  assert.ok(BUILDER_ONLY_SPEAKERS.every(x=>x.evidence.includes('Builder-only')));
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

test('a recent CAD 249 reference can move an otherwise suitable pair up the shortlist',()=>{
  const r=leads({budget:249});
  assert.equal(r.selected[0].title,'Polk Monitor XT15');
  assert.equal(r.selected[0].subtotal,249);
  assert.equal(r.selected[0].pricingStatus,'partial_subtotal');
  assert.ok(r.selected[0].parts.every(x=>!/receiver|amplifier/i.test(x.name)));
});

test('a CAD 248 ceiling leaves speaker pairs eligible for checking current prices',()=>{
  const r=leads({budget:248,used:false});
  assert.ok(r.selected.some(x=>x.title==='Polk Signature Elite ES15'&&x.subtotal===399));
  assert.ok(!r.excluded.some(x=>x.title==='Polk Monitor XT15'));
});

test('the XT20 promotional single-source offer does not replace the regular CAD 349 reference',()=>{
  const r=leads({goal:'bass',budget:300});
  const xt20=r.selected.find(x=>x.title==='Polk Monitor XT20');
  assert.equal(xt20.subtotal,349);
});

test('historical Atom research records two independent dealers and the seasonal dates',()=>{
  const p=broadActivePromotionFor('Paradigm Monitor SE Atom','CA','CAD','2026-11-12');
  assert.ok(p);
  assert.equal(p.amount,269.99);
  assert.ok(p.dealerCount>=2);
  assert.equal(p.regularListed,359.99);
  assert.equal(p.endDate,'2027-01-04');
  assert.equal(CANADIAN_PAIR_PRICE_OBSERVATIONS['Paradigm Monitor SE Atom'].regular.length,3);
});

test('Yamaha R-S202 gets an eligible Atom with its regular reference and excludes incompatible Polk XT models',()=>{
  const r=leads({amp:amp('Yamaha R-S202'),budget:300});
  const atom=r.selected.find(x=>x.title==='Paradigm Monitor SE Atom');
  assert.ok(atom);
  assert.equal(atom.subtotal,359.99);
  assert.equal(atom.pricingStatus,'partial_subtotal');
  assert.ok(!r.selected.some(x=>x.title==='Polk Monitor XT15'||x.title==='Polk Monitor XT20'));
});

test('an expired regular price leaves the Atom and its retailer links available',()=>{
  assert.equal(broadActivePromotionFor('Paradigm Monitor SE Atom','CA','CAD','2027-01-05'),null);
  assert.equal(broadActivePromotionFor('Paradigm Monitor SE Atom','CA','CAD','2026-10-15'),null);
  const r=leads({amp:amp('Yamaha R-S202'),budget:300,referenceDate:'2026-12-12'});
  const atom=r.selected.find(x=>x.title==='Paradigm Monitor SE Atom');
  assert.equal(atom.subtotal,null);
  assert.equal(atom.priceDate,null);
  assert.ok(atom.priceComponents[0].url);
  assert.ok(!Object.hasOwn(atom.priceComponents[0],'amount'));
});

test('UK regions use sterling references, not Canadian promotions or converted CAD prices',()=>{
  assert.equal(broadActivePromotionFor('Paradigm Monitor SE Atom','US','USD','2026-11-12'),null);
  const r=leads({region:'GB',currency:'GBP',budget:250});
  assert.ok(r.selected.some(x=>x.title==='Q Acoustics 3020i'&&x.subtotal===199));
  assert.ok(r.selected.some(x=>x.title==='Wharfedale Diamond 12.1'&&x.subtotal===249));
  assert.ok(r.selected.every(x=>x.pricingCurrency==='GBP'));
});

test('a CAD 100 budget keeps vintage asking prices out of the shortlist',()=>{
  const r=leads({budget:100});
  assert.ok(r.selected.length>0);
  assert.notEqual(r.selected[0].title,'Paradigm Titan v3');
  assert.ok(r.selected.some(x=>x.title==='Polk Signature Elite ES15'&&x.subtotal===399));
  assert.ok(!r.excluded.some(x=>/budget/i.test(x.reason)));
});

test('CAD 180 keeps vintage Titan as a source-backed watch target, not a live classified recommendation',()=>{
  const r=leads({budget:180});
  assert.ok(!r.selected.some(x=>x.title==='Paradigm Titan v3'));
  assert.ok(r.excluded.some(x=>x.title==='Paradigm Titan v3' && /Keep an eye out/.test(x.reason)));
  const historical=priceContextFor('Paradigm Titan v3','CA','CAD');
  assert.ok(historical.usedAsks.length===3);
  assert.ok(historical.usedExampleRange.notRegionalMedian);
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
  assert.match(app,/Retail price reference/);
  assert.doesNotMatch(app,/seasonal dealer sale|item\.budgetCaution/);
  assert.doesNotMatch(app,/overallAcousticMatchScore/);
});
