import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {SPEAKER_IDEAS,shortlistSpeakersForOwnedAmplifier} from '../system-builder/owned-amp-speakers.mjs';
import {INTERNATIONAL_PAIR_PRICE_OBSERVATIONS,internationalPriceContextFor,
  corroboratedInternationalPairPriceFor} from '../system-builder/international-price-context.mjs';
import {ownerEvidenceFor} from '../system-builder/owner-evidence.mjs';
import {soundProfileFor} from '../system-builder/sound-profiles.mjs';

const load=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const sandbox={window:{}};
createContext(sandbox);
for(const p of ['../system-check/gear.js','../system-check/compare/specs.js','../system-builder/catalog-adapter.js'])
  runInContext(load(p),sandbox);
const catalog=sandbox.window.systemBuilderInventory;
const amp=name=>({name,record:catalog.amp.find(x=>x.model===name)||null});
const defaults={amp:amp('Yamaha A-720'),speakers:catalog.speaker,goal:'all_rounder',
  useCase:'living_room',power:'mains',level:'moderate',connection:'analog',
  region:'US',currency:'USD',budgetStrict:true,used:true};
const results=x=>shortlistSpeakersForOwnedAmplifier({...defaults,...x});

test('international price observations have independently linked regular PAIR offers',()=>{
  for(const [region,models] of Object.entries(INTERNATIONAL_PAIR_PRICE_OBSERVATIONS)){
    for(const [model,obs] of Object.entries(models)){
      assert.ok(SPEAKER_IDEAS.some(x=>x.model===model));
      assert.ok(obs.regular.length>=2);
      assert.ok(obs.regular.every(x=>x.unit==='pair'&&x.amount>0&&x.url.startsWith('https://')));
      const distinct=new Set(obs.regular.map(x=>new URL(x.url).hostname.replace(/^www\./,'')));
      assert.ok(distinct.size>=2);
      const price=corroboratedInternationalPairPriceFor(model,region,region==='GB'?'GBP':'USD');
      assert.ok(price&&price.sourceCount>=2);
      assert.ok(price.kind.includes('not_transaction_median'));
    }
  }
});

test('US reference prices are ordinary USD pair prices, not Canadian price conversions',()=>{
  assert.equal(corroboratedInternationalPairPriceFor('Polk Monitor XT15','US','USD').amount,179);
  assert.equal(corroboratedInternationalPairPriceFor('Polk Monitor XT20','US','USD').amount,279);
  assert.equal(corroboratedInternationalPairPriceFor('Polk Signature Elite ES15','US','USD').amount,299);
  assert.equal(corroboratedInternationalPairPriceFor('Polk Monitor XT15','US','CAD'),null);
  assert.equal(internationalPriceContextFor('Paradigm Titan v3','US','USD'),null);
});

test('US firm budget 179 puts an actual priced XT15 pair first',()=>{
  const r=results({budget:179});
  assert.equal(r.selected[0].title,'Polk Monitor XT15');
  assert.equal(r.selected[0].subtotal,179);
  assert.equal(r.selected[0].pricingCurrency,'USD');
  assert.ok(r.selected[0].marketContext.regular.length>=2);
  assert.ok(!r.selected.some(x=>x.title==='Polk Monitor XT20'));
});

test('US budget below 179 is not treated as permission to invent a discounted XT15',()=>{
  const r=results({budget:170});
  assert.ok(!r.selected.some(x=>x.title==='Polk Monitor XT15'));
  assert.ok(r.excluded.some(x=>x.title==='Polk Monitor XT15'));
  assert.ok(r.selected.every(x=>x.subtotal===null||x.subtotal<=170));
});

test('US budget 280 includes the ordinary XT20 pair plus the more compact XT15',()=>{
  const r=results({budget:280});
  assert.ok(r.selected.some(x=>x.title==='Polk Monitor XT20'&&x.subtotal===279));
  assert.ok(r.selected.some(x=>x.title==='Polk Monitor XT15'&&x.subtotal===179));
});

test('original UK Wharfedale 12.1 and Q 3020i have separately sourced sterling references',()=>{
  assert.equal(corroboratedInternationalPairPriceFor('Q Acoustics 3020i','GB','GBP').amount,199);
  assert.equal(corroboratedInternationalPairPriceFor('Wharfedale Diamond 12.1','GB','GBP').amount,249);
  assert.ok(catalog.speaker.some(x=>x.model==='Wharfedale Diamond 12.1'));
  assert.ok(!catalog.speaker.some(x=>x.model==='Wharfedale Diamond 12.1i'));
  assert.equal(corroboratedInternationalPairPriceFor('Wharfedale Diamond 12.1i','GB','GBP'),null);
});

test('UK firm budget 169 still produces a real compact pair even in a larger room',()=>{
  const r=results({region:'GB',currency:'GBP',budget:169});
  assert.equal(r.selected[0].title,'Q Acoustics 3010i');
  assert.equal(r.selected[0].subtotal,169);
  assert.equal(r.selected[0].sceneCaution,true);
  assert.ok(r.selected[0].marketContext.regular.length>=2);
  assert.ok(r.selected[0].parts.every(x=>!/Yamaha A-720/.test(x.name)));
});

test('Q Acoustics 3010i is a separate Builder-only model with 6-ohm nominal and 4-ohm minimum',()=>{
  const ctx=internationalPriceContextFor('Q Acoustics 3010i','GB','GBP');
  assert.equal(corroboratedInternationalPairPriceFor('Q Acoustics 3010i','GB','GBP').amount,169);
  assert.equal(ctx.regular.length,2);
  assert.equal(internationalPriceContextFor('Q Acoustics 3010c','GB','GBP'),null);
  const profile=soundProfileFor({title:'Q Acoustics 3010i'});
  assert.match(profile.type,/owner/i);
  assert.match(profile.ownerCaution,/3010c/);
});

test('UK budget 199 gives a priced Q Acoustics pair and not the 249 Wharfedale',()=>{
  const r=results({region:'GB',currency:'GBP',budget:199});
  assert.equal(r.selected[0].title,'Q Acoustics 3020i');
  assert.equal(r.selected[0].subtotal,199);
  assert.equal(r.selected[0].pricingCurrency,'GBP');
  assert.ok(!r.selected.some(x=>x.title==='Wharfedale Diamond 12.1'));
});

test('UK budget 249 makes the original Wharfedale 12.1 a named new-pair option',()=>{
  const r=results({region:'GB',currency:'GBP',budget:249,goal:'natural'});
  assert.ok(r.selected.some(x=>x.title==='Wharfedale Diamond 12.1'&&x.subtotal===249));
  assert.ok(r.selected.some(x=>x.title==='Q Acoustics 3020i'&&x.subtotal===199));
  assert.ok(r.selected.every(x=>x.subtotal===null||x.subtotal<=249));
});

test('UK 3020i shop special does not silently turn higher compare-at amount into baseline',()=>{
  const ctx=internationalPriceContextFor('Q Acoustics 3020i','GB','GBP');
  assert.ok(ctx.promotion.some(x=>x.merchant.includes('Peter Tyson')));
  assert.ok(ctx.regular.every(x=>x.amount===199));
  assert.ok(!ctx.regular.some(x=>x.amount===299));
  assert.ok(ctx.notes.includes('not treated as market value'));
});

test('UK past Wharfedale promotion is historical, not automatic 2026 price',()=>{
  const ctx=internationalPriceContextFor('Wharfedale Diamond 12.1','GB','GBP');
  assert.equal(ctx.historicalPromotion[0].amount,179);
  assert.equal(ctx.historicalPromotion[0].date,'2025-11-25');
  const r=results({region:'GB',currency:'GBP',budget:180});
  assert.ok(!r.selected.some(x=>x.title==='Wharfedale Diamond 12.1'));
  assert.ok(r.excluded.some(x=>x.title==='Wharfedale Diamond 12.1'));
});

test('amp hard restriction still excludes UK 4Ω minimum and 6Ω Q even when affordable',()=>{
  const r=results({amp:amp('Yamaha R-S202'),region:'GB',currency:'GBP',budget:249});
  assert.ok(!r.selected.some(x=>['Wharfedale Diamond 12.1','Q Acoustics 3020i'].includes(x.title)));
  assert.ok(r.excluded.some(x=>x.title==='Wharfedale Diamond 12.1'));
  assert.ok(r.selected.length>0); // qualified alternative, not an empty report
});

test('unknown local price remains unknown rather than being copied from another currency',()=>{
  const r=results({region:'EU',currency:'EUR',budget:200});
  assert.ok(r.selected.length>0);
  assert.ok(r.selected.every(x=>x.subtotal===null && x.pricingCurrency==='EUR'));
  assert.ok(r.selected.every(x=>x.marketContext===null));
  assert.equal(internationalPriceContextFor('Q Acoustics 3020i','US','USD'),null);
});

test('wharfedale 12.1 has original-owner discussions and no fictional preference score',()=>{
  const x=ownerEvidenceFor('Wharfedale Diamond 12.1');
  assert.ok(x.sources.length>=2);
  assert.match(x.caution,/12\.1i/);
  assert.ok(!('matchScore' in x));
  const y=soundProfileFor({title:'Wharfedale Diamond 12.1'});
  assert.match(y.type,/owner/i);
  assert.ok(y.ownerSources.length>=2);
});

test('app formats actual selected currency, is a single complete module and stays compact',()=>{
  const app=load('../system-builder/app.mjs');
  assert.match(app,/new Intl\.NumberFormat/);
  assert.match(app,/currency:displayCurrency/);
  assert.match(app,/Why these speakers/);
  assert.equal((app.match(/form\.addEventListener\('submit'/g)||[]).length,1);
  assert.equal((app.match(/const renderCard = item =>/g)||[]).length,1);
  assert.doesNotMatch(app,/\n\+Math\.round\(item\.usedExampleRange/);
});
