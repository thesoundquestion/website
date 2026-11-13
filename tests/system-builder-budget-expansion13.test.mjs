import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {EXAMPLES,shortlistExamples} from '../system-builder/recommendations.mjs';
import {BUDGET_EXAMPLES} from '../system-builder/budget-examples.mjs';
import {BUILDER_ONLY_SPEAKERS,builderOnlySpeakerFor} from '../system-builder/supplemental-speakers.mjs';
import {BUILDER_ONLY_AMPS,builderOnlyAmpFor} from '../system-builder/supplemental-amplifiers.mjs';
import {BUILDER_ONLY_HEADPHONES,builderOnlyHeadphoneFor} from '../system-builder/supplemental-headphones.mjs';
import {USED_AMPLIFIER_WATCHLIST,usedWatchlistFor} from '../system-builder/used-amp-watchlist.mjs';
import {shortlistAmpsForOwnedSpeakers,ownershipPlan} from '../system-builder/owned-gear-options.mjs';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const sandbox={window:{}};createContext(sandbox);
for(const p of ['../system-check/gear.js','../system-check/compare/specs.js','../system-builder/catalog-adapter.js'])
  runInContext(read(p),sandbox);
const inventory=sandbox.window.systemBuilderInventory;
const opts={architecture:'open',useCase:'desk',goal:'all_rounder',region:'CA',
  currency:'CAD',power:'mains',level:'moderate',connection:'analog',budgetStrict:true,
  budget:null,used:true,distanceFt:6};
const check=(budget,extra={})=>shortlistExamples({...opts,budget,...extra});

test('new inventory supplements original 130 without duplicate model identities',()=>{
  assert.equal(BUDGET_EXAMPLES.length,9);
  assert.equal(BUILDER_ONLY_SPEAKERS.length,9);
  assert.equal(BUILDER_ONLY_HEADPHONES.length,4);
  assert.equal(BUILDER_ONLY_AMPS.length,4);
  assert.equal(Object.values(inventory).reduce((n,v)=>n+v.length,0),130);
  const all=[...BUILDER_ONLY_SPEAKERS,...BUILDER_ONLY_HEADPHONES,...BUILDER_ONLY_AMPS];
  assert.equal(new Set(all.map(x=>x.model)).size,all.length);
  assert.ok(all.every(x=>!inventory[x.type].some(y=>y.model===x.model)));
  assert.ok(all.every(x=>x.url.startsWith('https://')));
});
test('R1280T/R1280DB/R1280DBs remain distinct, exact-input powered pairs with manufacturer prices',()=>{
  const a=BUDGET_EXAMPLES.find(x=>x.id==='powered-r1280t');
  const b=BUDGET_EXAMPLES.find(x=>x.id==='powered-r1280db');
  const c=BUDGET_EXAMPLES.find(x=>x.id==='powered-r1280dbs');
  assert.deepEqual(a.connections,['analog']);
  assert.ok(b.connections.includes('optical'));
  assert.ok(c.extra.some(x=>/subwoofer|crossover|high-pass/i.test(x)));
  assert.equal(a.priceCA.components[0].amount,169.99);
  assert.equal(b.priceCA.components[0].amount,199.99);
  assert.equal(c.priceCA.components[0].amount,229.99);
  assert.ok(!a.connections.includes('bluetooth'));
  assert.ok(BUDGET_EXAMPLES.every(x=>x.priceEvidence));
});
test('Canadian 200 dollar no-owned-equipment route returns multiple complete powered examples',()=>{
  const x=check(200);
  assert.ok(x.selected.length>=2);
  assert.ok(x.selected.every(x=>x.subtotal<=200));
  assert.ok(x.selected.some(x=>x.id==='powered-r1280t'));
  assert.ok(x.selected.some(x=>x.id==='powered-mr3'));
  assert.ok(x.selected.every(x=>x.architecture==='consumer_powered_pair'));
});
test('optical and USB alternatives are ordered by actual native connectivity',()=>{
  const opt=check(230,{architecture:'consumer_powered_pair',connection:'optical'});
  assert.equal(opt.selected[0].id,'powered-r1280db');
  assert.equal(opt.selected[0].connectionStatus,'native_possible');
  const usb=check(250,{architecture:'consumer_powered_pair',connection:'usb'});
  assert.equal(usb.selected[0].id,'powered-m60');
  assert.equal(usb.selected[0].connectionStatus,'native_possible');
  assert.ok(usb.selected.filter(x=>x.id!=='powered-m60').every(x=>x.connectionStatus==='adapter_needed'));
});
test('headphone starts below 100 dollars with source-output caveats rather than auto DAC purchase',()=>{
  const r=check(100,{architecture:'headphone_first',connection:'analog'});
  assert.deepEqual(r.selected.map(x=>x.id),['headphone-ksc75','headphone-portapro']);
  assert.ok(r.selected.every(x=>x.priceComponents.length===1 && x.parts.length===1));
  assert.ok(r.selected.every(x=>x.tradeoff.includes('fit')||x.tradeoff.includes('Fit')||x.tradeoff.includes('bass')));
});
test('budget passive new stereo has two component prices, load caveat and no peak-watt shortcut',()=>{
  const x=check(450,{architecture:'passive_separates',useCase:'bedroom'});
  const pair=x.selected.find(x=>x.id==='passive-bt20a-xt15');
  assert.ok(pair);
  assert.equal(pair.subtotal,438.99);
  assert.equal(pair.parts.length,2);
  assert.match(pair.tradeoff,/300 W/i);
  assert.match(pair.loadCaution,/4.1 Ω/);
  assert.ok(!x.selected.some(x=>x.title.includes('R-S202 + PSB Alpha P3')));
  assert.ok(!EXAMPLES.some(x=>x.usedOnly));
});
test('compact BT20A Pro and AIYIMA ratings do not fabricate continuous wattage or comparable THD',()=>{
  for(const x of BUILDER_ONLY_AMPS.filter(x=>x.details.outputPowerVerified===false)){
    assert.equal(x.ratings.length,0);
    assert.equal(x.details.outputPowerVerified,false);
    assert.equal(x.details.thdComparable,false);
    assert.match(x.note,/maximum|Max|continuous|sustained|300W/);
  }
  assert.equal(builderOnlyAmpFor('Fosi Audio BT20A Pro').details.caOrdinaryAsking,189.99);
  assert.equal(builderOnlyAmpFor('Fosi Audio BT20A MAX'),null);
});
test('owned speakers + strict 250 CAD budget highlight retained speaker and budget mini amp',()=>{
  const speaker={name:'Paradigm Phantom v1',record:inventory.speaker.find(x=>x.model==='Paradigm Phantom v1')};
  const x=shortlistAmpsForOwnedSpeakers({own:{speaker},inventory,
    request:{goal:'natural',useCase:'living_room',connection:'analog',budgetStrict:true,budget:250,region:'CA',currency:'CAD'}});
  assert.ok(x.selected.length);
  assert.equal(x.selected[0].title,'Paradigm Phantom v1 + Fosi Audio BT20A Pro');
  assert.equal(x.selected[0].subtotal,189.99);
  assert.ok(x.selected[0].reuseNames.includes(speaker.name));
  assert.match(x.selected[0].amplifierReason,/no verified matching-load continuous power/i);
  assert.equal(x.selected[0].amplifierFit.amp.watts,null);
});
test('budget supplemental amp entered as owned is retained; not quietly replaced',()=>{
  const amp={name:'Fosi Audio BT20A Pro',record:builderOnlyAmpFor('Fosi Audio BT20A Pro')};
  const x=ownershipPlan({own:{amp},request:{...opts,architecture:'passive_separates'},inventory});
  assert.ok(x.selected.length);
  assert.ok(x.selected.every(x=>x.reuseNames.includes(amp.name)));
  assert.ok(x.selected.every(x=>!x.parts.some(p=>p.name==='Yamaha A-S301')));
});
test('used amplifier search targets are evergreen, cited, never direct individual listings or used prices',()=>{
  assert.equal(USED_AMPLIFIER_WATCHLIST.length,9);
  assert.equal(usedWatchlistFor({powered:'battery'}).length,0);
  assert.equal(usedWatchlistFor({powered:'mains'}).length,8);
  assert.ok(USED_AMPLIFIER_WATCHLIST.every(x=>
    x.usedTypicalPrice===null && x.listingUrl===null &&
    x.source.startsWith('https://') && x.checks.length>75 && x.evidence.length>30));
  assert.ok(USED_AMPLIFIER_WATCHLIST.some(x=>x.model==='Yamaha RX-497'));
  assert.ok(USED_AMPLIFIER_WATCHLIST.some(x=>x.model==='NAD C 316BEE V2'));
});
test('Fluance exact SX6 revision is unpriced in Canada and no numeric damage threshold is invented',()=>{
  const x=builderOnlySpeakerFor('Fluance SX6 Elite (SX6-BK)');
  assert.ok(x);
  assert.equal(x.values.load,8);
  assert.equal(x.values.sensitivity,89);
  assert.equal(x.values.speakerPowerNominal,undefined);
  assert.equal(x.values.speakerPowerMaxInput,undefined);
  assert.match(x.note,/minimum impedance/);
});
test('budget and watchlist UX is actually wired into app and not mistaken for used listings',()=>{
  const s=read('../system-builder/app.mjs');
  assert.match(s,/BUILDER_ONLY_AMPS, builderOnlyAmpFor/);
  assert.match(s,/usedWatchlistFor/);
  assert.match(s,/request.used && powered!=='battery'/);
  assert.match(s,/Used stereo amplifiers worth keeping an eye out for/);
  assert.match(s,/not current listings or confirmed local bargains/);
  assert.match(s,/Advertised prices · /);
});
