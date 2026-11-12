import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {SPEAKER_IDEAS,ampSpeakerScreening,shortlistSpeakersForOwnedAmplifier}
  from '../system-builder/owned-amp-speakers.mjs';

const src = path => readFileSync(new URL(path,import.meta.url),'utf8');
const sandbox={window:{}};
createContext(sandbox);
runInContext(src('../system-check/gear.js'),sandbox);
runInContext(src('../system-check/compare/specs.js'),sandbox);
runInContext(src('../system-builder/catalog-adapter.js'),sandbox);
const inventory=sandbox.window.systemBuilderInventory;
const amp=name=>({name,record:inventory.amp.find(x=>x.model===name)||null});
const defaults={amp:amp('Yamaha A-720'),speakers:inventory.speaker,goal:'all_rounder',useCase:'living_room',
  region:'CA',currency:'CAD',power:'mains',level:'moderate',distanceFt:8,connection:'analog',
  budget:null,budgetStrict:true,used:true,secondary:[]};

test('only known passive speaker models from original read-only catalog are considered',()=>{
  assert.ok(SPEAKER_IDEAS.length>=10);
  assert.ok(SPEAKER_IDEAS.every(x=>inventory.speaker.some(y=>y.model===x.model)));
  const list=shortlistSpeakersForOwnedAmplifier(defaults);
  assert.ok(list.selected.length>=3);
  assert.ok(list.selected.every(x=>x.architecture==='passive_separates'));
  assert.ok(list.selected.every(x=>x.parts.length===1 && x.parts[0].name.includes('pair')));
});

test('owned Yamaha A-720 is never included as a purchased component or charged again',()=>{
  const r=shortlistSpeakersForOwnedAmplifier(defaults);
  assert.equal(r.mode,'speaker_only');
  assert.ok(r.selected.every(x=>x.ownedAmpName==='Yamaha A-720'));
  assert.ok(r.selected.every(x=>x.parts.every(p=>!p.name.includes('A-720'))));
  assert.ok(r.selected.every(x=>x.extra.some(v=>v.includes('No new amplifier'))));
});

test('R-S202 8-ohm-only discovery excludes a known low impedance minimum like KEF Q150',()=>{
  const r=shortlistSpeakersForOwnedAmplifier({...defaults,amp:amp('Yamaha R-S202'),goal:'imaging'});
  assert.equal(r.screen.discoveryFloor,8);
  assert.equal(r.screen.explicitNominalFloor,8);
  assert.ok(!r.selected.some(x=>x.title==='KEF Q150'));
  assert.ok(r.excluded.some(x=>x.title==='KEF Q150'&&/minimum/.test(x.reason)));
  assert.ok(r.selected.every(x=>x.speakerValues.load>=8));
  assert.ok(r.selected.every(x=>x.loadCaution && /not prove a safe/.test(x.loadCaution)));
});

test('R-S202 excludes nominal-six-ohm speakers even if their burst rating mentions six ohms',()=>{
  const r=shortlistSpeakersForOwnedAmplifier({...defaults,amp:amp('Yamaha R-S202'),goal:'dynamic'});
  assert.ok(!r.selected.some(x=>x.title==='ELAC Debut 3.0 DB63'));
  assert.ok(r.excluded.some(x=>x.title==='ELAC Debut 3.0 DB63'));
});

test('four-ohm burst alone never authorizes a four-ohm speaker in amp screening',()=>{
  const screen=ampSpeakerScreening(amp('Yamaha A-720'));
  assert.equal(screen.minPublishedTestOhms,6);
  assert.equal(screen.discoveryFloor,6);
  assert.notEqual(screen.discoveryFloor,4);
});

test('headphone and powered systems are never presented as speaker additions for owned amplifier',()=>{
  const r=shortlistSpeakersForOwnedAmplifier(defaults);
  assert.ok(r.selected.every(x=>x.parts.every(p=>!p.name.includes('Edifier')&&!p.name.includes('Kanto'))));
  assert.ok(r.selected.every(x=>!x.parts.some(p=>/receiver|amplifier/i.test(p.name))));
});

test('price examples are priced per pair and only apply to Canada CAD',()=>{
  const r=shortlistSpeakersForOwnedAmplifier(defaults);
  const polk=r.selected.find(x=>x.title==='Polk Signature Elite ES15');
  assert.equal(polk.subtotal,399);
  assert.equal(polk.priceComponents[0].amount,399);
  assert.match(polk.priceComponents[0].url,/polkaudio\.com/);
  const usa=shortlistSpeakersForOwnedAmplifier({...defaults,region:'US',currency:'USD'});
  assert.ok(usa.selected.every(x=>x.subtotal===null));
});

test('firm budget applies to speaker purchase, not an unnecessary new receiver',()=>{
  const r=shortlistSpeakersForOwnedAmplifier({...defaults,budget:400});
  assert.ok(r.selected.some(x=>x.title==='Polk Signature Elite ES15'));
  assert.ok(!r.selected.some(x=>x.title==='Polk Signature Elite ES20'));
  assert.ok(r.excluded.some(x=>x.title==='Polk Signature Elite ES20'&&/budget/.test(x.reason)));
});

test('unpriced candidates never pass the budget as zero-dollar claims',()=>{
  const r=shortlistSpeakersForOwnedAmplifier({...defaults,budget:100});
  assert.ok(!r.selected.some(x=>x.subtotal!==null && x.subtotal>100));
  assert.ok(r.selected.every(x=>x.subtotal===null&&x.pricingStatus==='regional_price_missing'));
});

test('an unlisted amplifier returns cautious 8-ohm nominal discovery, never fake spec certification',()=>{
  const r=shortlistSpeakersForOwnedAmplifier({...defaults,amp:{name:'Mystery Receiver 123',record:null}});
  assert.equal(r.screen.known,false);
  assert.equal(r.screen.discoveryFloor,8);
  assert.ok(r.selected.length);
  assert.ok(r.selected.every(x=>x.extra.some(v=>v.includes('no verified'))));
});

test('battery requirement does not imply a wall-powered owned amp can work off-grid',()=>{
  const r=shortlistSpeakersForOwnedAmplifier({...defaults,power:'battery'});
  assert.equal(r.selected.length,0);
  assert.match(r.reason,/mains-powered/);
});

test('secondhand-only example only appears when buyer allows used, but is never priced as free',()=>{
  const a=shortlistSpeakersForOwnedAmplifier({...defaults,goal:'bass',used:true});
  const b=shortlistSpeakersForOwnedAmplifier({...defaults,goal:'bass',used:false});
  assert.ok(!b.selected.some(x=>x.title==='Paradigm Titan v3'));
  assert.ok(SPEAKER_IDEAS.find(x=>x.model==='Paradigm Titan v3').usedOnly);
  assert.ok(!a.selected.some(x=>x.title==='Paradigm Titan v3' && x.subtotal===0));
});

test('all named speakers carry original manufacturer/preset links and explicit engineering caveats',()=>{
  const r=shortlistSpeakersForOwnedAmplifier(defaults);
  assert.ok(r.selected.every(x=>x.parts[0].url.startsWith('https://')));
  assert.ok(r.selected.every(x=>x.extra.some(y=>/impedance/.test(y))));
  assert.ok(r.selected.every(x=>!('matchScore' in x)&&!('compatibilityCertified' in x)));
});

test('website report routes owned amplifier without selected speakers to targeted shortlist',()=>{
  const app=src('../system-builder/app.mjs');
  assert.match(app,/const speakerFocus = !!own\.amp\.name && !own\.speaker\.name/);
  assert.match(app,/shortlistSpeakersForOwnedAmplifier/);
  assert.match(app,/speakers:inventory\?\.speaker/);
  assert.match(app,/speakerFocus \? 'Speakers for your '/);
  assert.match(app,/if \(item\.loadCaution\)/);
});
