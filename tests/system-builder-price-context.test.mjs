import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {CANADIAN_PAIR_PRICE_OBSERVATIONS,priceContextFor} from '../system-builder/market-price-context.mjs';
import {shortlistSpeakersForOwnedAmplifier} from '../system-builder/owned-amp-speakers.mjs';
import {ownershipPlan} from '../system-builder/owned-gear-options.mjs';

const src=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const sandbox={window:{}};
createContext(sandbox);
runInContext(src('../system-check/gear.js'),sandbox);
runInContext(src('../system-check/compare/specs.js'),sandbox);
runInContext(src('../system-builder/catalog-adapter.js'),sandbox);
const inventory=sandbox.window.systemBuilderInventory;
const amp={name:'Yamaha A-720',record:inventory.amp.find(x=>x.model==='Yamaha A-720')};
const request={useCase:'living_room',goal:'all_rounder',region:'CA',currency:'CAD',
    budget:null,budgetStrict:true,used:true,power:'mains',connection:'analog',referenceDate:'2026-11-12'};
const candidates=(data={})=>shortlistSpeakersForOwnedAmplifier({...request,...data,amp,speakers:inventory.speaker});

test('normal retail is verified against three independently linked Canadian pair listings',()=>{
  const ctx=priceContextFor('Paradigm Monitor SE Atom');
  assert.equal(ctx.regular.length,3);
  assert.ok(ctx.regular.every(x=>x.unit==='pair'));
  assert.ok(ctx.regular.every(x=>x.amount>=350&&x.amount<=370));
  assert.equal(new Set(ctx.regular.map(x=>new URL(x.url).hostname)).size,3);
  assert.ok(ctx.promotion.some(x=>x.amount<ctx.regular[0].amount));
  assert.equal(ctx.usedExampleRange,null);
});

test('speaker cards include only the dated regular reference and retailer links during a sale',()=>{
  const result=candidates({goal:'low_volume'});
  const p=result.selected.find(x=>x.title==='Paradigm Monitor SE Atom');
  assert.ok(p);
  assert.equal(p.subtotal,359.99);
  assert.equal(p.priceComponents[0].amount,359.99);
  assert.equal(p.priceDate,'2026-11-12');
  assert.ok(p.marketContext.regular.every(({url,amount})=>url&&amount===undefined));
  assert.doesNotMatch(JSON.stringify(p),/269\.99|seasonal_promotional_pair|selfReportedPaid|usedAsks/);
});

test('used asking examples from three sellers do not become an average',()=>{
  const x=priceContextFor('Paradigm Titan v3');
  assert.equal(x.usedAsks.length,3);
  assert.ok(x.usedAsks.every(a=>a.status.includes('asking_only')));
  assert.equal(x.usedExampleRange.min,125);
  assert.equal(x.usedExampleRange.max,195);
  assert.equal(x.usedExampleRange.notRegionalMedian,true);
  assert.equal(x.usedExampleRange.notTransactionPrices,true);
  assert.equal(CANADIAN_PAIR_PRICE_OBSERVATIONS['Paradigm Titan v3'].excludedOlder.length,1);
});

test('one sold-marked ask alone is never a typical used price or confirmed transaction',()=>{
  const x=priceContextFor('Polk Signature Elite ES20');
  assert.equal(x.usedAsks.length,1);
  assert.equal(x.usedExampleRange,null);
  assert.equal(x.usedAsks[0].status,'sold_marked_asking_only');
});

test('a self reported used purchase is not treated as a verified sale sample',()=>{
  const x=priceContextFor('Wharfedale Diamond 12.2');
  assert.equal(x.selfReportedPaid.length,1);
  assert.equal(x.usedExampleRange,null);
  assert.equal(x.regular.length,0);
});

test('Canadian market-only records never leak; US gets distinct source-backed USD pair prices',()=>{
  assert.equal(priceContextFor('Paradigm Monitor SE Atom','GB','GBP'),null);
  assert.equal(priceContextFor('Paradigm Titan v3','US','USD'),null);
  const us=candidates({region:'US',currency:'USD',budget:280});
  assert.ok(us.selected.some(x=>x.title==='Polk Monitor XT15'&&x.subtotal===179));
  assert.ok(us.selected.some(x=>x.title==='Polk Monitor XT20'&&x.subtotal===279));
  assert.ok(us.selected.every(x=>x.pricingCurrency==='USD'));
});

test('a low Canadian budget keeps vintage used models as watch leads, not actionable listings',()=>{
  const r=candidates({budget:180,goal:'all_rounder',used:true});
  assert.ok(r.selected.length>=2);
  assert.ok(!r.selected.some(x=>x.title==='Paradigm Titan v3'));
  assert.ok(r.excluded.some(x=>x.title==='Paradigm Titan v3' && /Keep an eye out/.test(x.reason)));
  const research=priceContextFor('Paradigm Titan v3');
  assert.equal(research.usedExampleRange.notTransactionPrices,true);
  assert.equal(research.usedExampleRange.notRegionalMedian,true);
});

test('no used opt-in removes vintage discovery even when price would be attractive',()=>{
  const r=candidates({budget:180,goal:'all_rounder',used:false});
  assert.ok(!r.selected.some(x=>x.title==='Paradigm Titan v3'));
});

test('owned amplifier remains retained without treating old classified prices as a purchase option',()=>{
  const p=ownershipPlan({own:{amp},request:{...request,budget:180},inventory});
  assert.ok(p.selected.length>0);
  assert.ok(!p.selected.some(x=>x.title==='Paradigm Titan v3'));
  assert.ok(p.selected.every(x=>x.reuseNames.includes('Yamaha A-720')));
  assert.ok(p.selected.every(x=>x.parts.some(x=>x.name==='Yamaha A-720')));
});

test('UI shows dated regular price references and retailer links inside card details',()=>{
  const app=src('../system-builder/app.mjs');
  assert.match(app,/renderPriceReferences\(details,item,'h5'\)/);
  assert.match(app,/marketContext\?\.regular/);
  assert.doesNotMatch(app,/selfReportedPaid|marketContext\.promotion|marketContext\.usedAsks/);
  assert.doesNotMatch(app,/Used asking examples/);
  assert.match(app,/usedWatchlistFor/);
  assert.match(app,/Used stereo amplifiers worth keeping an eye out for/);
  assert.match(app,/Why these speakers/);
  assert.doesNotMatch(app,/marketContext\.average|marketContext\.median/);
});
