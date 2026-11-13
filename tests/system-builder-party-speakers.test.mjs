import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {partySpeakerEvidence,shortlistPartySpeakerLeads,shortlistPartyPassiveConcepts,
  shortlistSpeakersForOwnedAmplifier} from '../system-builder/owned-amp-speakers.mjs';
import {ownershipPlan} from '../system-builder/owned-gear-options.mjs';

const src=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const sandbox={window:{}};
createContext(sandbox);
runInContext(src('../system-check/gear.js'),sandbox);
runInContext(src('../system-check/compare/specs.js'),sandbox);
runInContext(src('../system-builder/catalog-adapter.js'),sandbox);
const inventory=sandbox.window.systemBuilderInventory;
const amp=name=>({name,record:inventory.amp.find(x=>x.model===name)||null});
const request={goal:'party',useCase:'living_room',architecture:'open',
  region:'CA',currency:'CAD',power:'mains',budget:null,budgetStrict:true,
  level:'high',distanceFt:12,connection:'analog',secondary:[],used:true};
const speakers=inventory.speaker;

test('party selection promotes documented efficient large speakers rather than default compact bookshelf models',()=>{
  const r=shortlistSpeakersForOwnedAmplifier({...request,amp:amp('Yamaha A-720'),speakers});
  assert.equal(r.selected[0].title,'Cerwin-Vega XLS-215');
  assert.ok(r.selected.some(x=>x.title==='Cerwin-Vega XLS-15'));
  assert.ok(r.selected.every(x=>x.ownedAmpName==='Yamaha A-720'));
  assert.ok(r.selected.every(x=>x.levelCaution));
  assert.match(r.selected[0].why,/95.3 dB at 1 W \/ 3.28 ft/);
  assert.match(r.selected[0].why,/does not certify sustained clean SPL/);
  assert.equal(r.selected[0].subtotal,null);
  assert.equal(r.selected[0].pricingStatus,'regional_price_missing');
});

test('room-referenced sensitivity is not numerically ranked above standardized 1W data',()=>{
  const x=partySpeakerEvidence(speakers.find(x=>x.model==='Cerwin-Vega XLS-215'));
  const y=partySpeakerEvidence(speakers.find(x=>x.model==='Klipsch R-50M'));
  assert.equal(x.tier,0);
  assert.equal(x.comparable,true);
  assert.equal(y.comparable,false);
  assert.equal(y.normalized,null);
  assert.match(y.label,/not comparable/);
  const leads=shortlistPartySpeakerLeads({speakers});
  assert.equal(leads[0].model,'Cerwin-Vega XLS-215');
  assert.ok(leads.every(x=>!x.idea.usedOnly));
});

test('an 8-ohm-only receiver still excludes nominal-six-ohm party towers',()=>{
  const r=shortlistSpeakersForOwnedAmplifier({...request,amp:amp('Yamaha R-S202'),speakers});
  assert.ok(!r.selected.some(x=>x.title==='Cerwin-Vega XLS-215'));
  assert.ok(r.excluded.some(x=>x.title==='Cerwin-Vega XLS-215'&&/Nominal load below/.test(x.reason)));
  assert.ok(r.selected.every(x=>x.speakerValues.load>=8));
});

test('passive party route with no equipment does not reuse low-sensitivity hi-fi bundle recommendations',()=>{
  const r=shortlistPartyPassiveConcepts({...request,architecture:'passive_separates',speakers});
  assert.equal(r.selected[0].title,'Cerwin-Vega XLS-215');
  assert.equal(r.selected[0].architecture,'passive_separates');
  assert.ok(r.selected.every(x=>x.parts.some(p=>/amplifier/i.test(p.name))));
  assert.ok(r.selected.every(x=>x.subtotal===null));
  assert.ok(r.selected.every(x=>/not yet selected or costed/.test(x.parts[1].role)));
});

test('party route retains an owned source while keeping amplification costs unknown',()=>{
  const own={source:{name:'Existing DAC',record:null},
    speaker:{name:'',record:null},amp:{name:'',record:null},
    headphone:{name:'',record:null}};
  const r=ownershipPlan({own,request:{...request,architecture:'passive_separates'},inventory});
  assert.equal(r.selected[0].title,'Cerwin-Vega XLS-215');
  assert.ok(r.selected[0].parts.some(p=>p.name==='Existing DAC'));
  assert.ok(r.selected[0].parts.some(p=>/amplifier/i.test(p.name)));
});

test('mandatory battery operation cannot be satisfied by passive towers alone',()=>{
  const r=shortlistPartyPassiveConcepts({...request,power:'battery',speakers});
  assert.equal(r.selected.length,0);
  assert.match(r.reason,/battery-powered amplification/);
});

test('non-party priorities do not silently inherit party-tower ranking',()=>{
  const r=shortlistSpeakersForOwnedAmplifier({...request,goal:'natural',amp:amp('Yamaha A-720'),speakers});
  assert.notEqual(r.selected[0].title,'Cerwin-Vega XLS-215');
  assert.ok(r.selected.every(x=>!x.partySensitivityEvidence));
});

test('a party listening goal does not automatically discard a reusable owned amplifier',()=>{
  const own={speaker:{name:'',record:null},amp:amp('Yamaha A-720'),
    source:{name:'',record:null},headphone:{name:'',record:null}};
  const r=ownershipPlan({own,request,inventory});
  assert.equal(r.mode,'keep_amp');
  assert.equal(r.selected[0].title,'Cerwin-Vega XLS-215');
  assert.ok(r.selected[0].reuseNames.includes('Yamaha A-720'));
  assert.ok(!r.selected[0].pathwayCaution);
});

test('an explicit party PA architecture still treats the owned stereo as a separate path',()=>{
  const own={speaker:{name:'',record:null},amp:amp('Yamaha A-720'),
    source:{name:'',record:null},headphone:{name:'',record:null}};
  const r=ownershipPlan({own,request:{...request,architecture:'party_pa'},inventory});
  assert.equal(r.mode,'keep_separate_amp');
  assert.match(r.selected[0].pathwayCaution,/separate passive stereo route/);
});
