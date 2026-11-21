import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {headroomEvidence} from '../system-builder/headroom-evidence.mjs';
import {acousticEvidenceForPair} from '../system-builder/acoustic-evidence.mjs';
import {shortlistExamples} from '../system-builder/recommendations.mjs';

const req={goal:'natural',architecture:'open',useCase:'bedroom',distanceFt:6,level:'moderate',
  region:'CA',currency:'CAD',power:'mains',connection:'analog',referenceDate:'2026-11-13'};
const byId=(id,params={})=>{
 const list=shortlistExamples({...req,...params,architecture:'open'});
 return list.selected.find(x=>x.id===id);
};

test('all architectures produce explicit headroom, not generic missing text',()=>{
 for(const arch of ['consumer_powered_pair','active_studio','party_pa','passive_separates','headphone_first']){
  const e=headroomEvidence({architecture:arch},{...req,level:'high'});
  assert.ok(e.status);
  assert.ok(e.text.length>30);
  assert.ok(e.detail.length>25);
  assert.ok(!/0 W|0 dB/.test(e.text));
 }
});

test('powered Edifier MR4 has an explicit conditional output answer at user distance',()=>{
 const item=byId('powered-mr4');
 assert.ok(item,'MR4 should be retained as valid option');
 const e=headroomEvidence(item,req);
 assert.equal(e.status,'powered_maximum_spl_unverified');
 assert.match(e.text,/6 ft/);
 assert.match(e.text,/sensible choice for comfortable listening/);
 assert.match(e.detail,/Published amplifier watts/);
 assert.equal(e.link,null);
});

test('loud preference alone does not mark any powered product unsuitable or estimate clean seat SPL',()=>{
 const item={id:'studio-jbl',architecture:'active_studio'};
 const a=headroomEvidence(item,{...req,level:'moderate',distanceFt:6});
 const b=headroomEvidence(item,{...req,level:'high',distanceFt:16});
 assert.equal(a.status,b.status);
 assert.match(b.text,/16 ft/);
 assert.match(b.text,/Not my choice for dependable loud playback/);
 assert.doesNotMatch(b.text,/unsuitable|fails|cannot play/);
});

test('passive output requires matching continuous load and a documented sensitivity for quantitative assessment',()=>{
 const item={architecture:'passive_separates',amplifierFit:{amp:{watts:60,ohms:8,exact:true}}};
 const r=headroomEvidence(item,req);
 assert.equal(r.status,'passive_exact_load_power_only');
 assert.match(r.detail,/60 W\/channel at 8 Ω/);
 assert.match(r.detail,/A quantitative comparison needs the speaker sensitivity/);
 assert.equal(r.link,'/system-check/');
 const unknown=headroomEvidence({architecture:'passive_separates'},req);
 assert.equal(unknown.status,'passive_output_unverified');
 assert.match(unknown.detail,/speaker sensitivity/);
});

test('a proposed high-pass or sub route is not automatically awarded extra maximum clean SPL',()=>{
 const item={architecture:'consumer_powered_pair',bassSetup:{label:'100 Hz active crossover'}};
 const r=headroomEvidence(item,req);
 assert.match(r.detail,/subwoofer route/);
 assert.match(r.detail,/more bass does not automatically mean more maximum volume/);
});

test('Builder cards render the evidence note and never send powered users into passive wattage calculation',()=>{
 const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 assert.match(app,/headroomEvidence\(item,request\)/);
 assert.match(app,/addText\(headroom,'strong',output.label/);
 assert.match(app,/if\(output.link\)link\(card,output.link,'Check your exact listening levels'\)/);
 assert.doesNotMatch(app,/if\(output.link\)link\(details/);
 assert.match(app,/How loud and why/);
 assert.doesNotMatch(app,/Confirm clean output at your listening distance and level/);
});

test('Yamaha A-S301 and PSB Alpha P5 gives a real loudness verdict from manufacturer specifications',()=>{
  const item=byId('passive-as301-p5',{goal:'imaging',level:'high',distanceFt:6});
  assert.ok(item,'The researched passive pairing must be available');
  const e=headroomEvidence(item,{...req,level:'high',distanceFt:6});
  assert.equal(e.status,'estimated_suitable');
  assert.match(e.text,/^Yes\. It should have good reserve for occasional loud listening at 6 ft/);
  assert.ok(e.estimatedPeakDb>=100&&e.estimatedPeakDb<=105);
  assert.equal(e.targetPeakDb,95);
  assert.ok(e.marginDb>=5);
  assert.match(e.detail,/60 W\/ch/);
  assert.match(e.detail,/87 dB/);
  assert.doesNotMatch(e.text,/depend on the exact speaker-and-amp pairing|needs checking|unverified/);
});

test('a sufficiently distant loud listening target is not falsely rated with the same confidence',()=>{
  const item=byId('passive-as301-p5',{goal:'imaging',level:'high',distanceFt:15});
  const near=headroomEvidence(item,{...req,level:'high',distanceFt:6});
  const far=headroomEvidence(item,{...req,level:'high',distanceFt:15});
  assert.ok(far.estimatedPeakDb<near.estimatedPeakDb);
  assert.notEqual(far.status,'estimated_suitable');
  assert.match(far.text,/Not confidently|reserve/);
});

test('a speaker without enough measured/reference data never borrows another speaker’s headroom verdict',()=>{
  const unknown=headroomEvidence({architecture:'passive_separates',id:'unknown'},{...req,level:'high',distanceFt:6});
  assert.equal(unknown.status,'passive_output_unverified');
  assert.equal(unknown.estimatedPeakDb,undefined);
  assert.doesNotMatch(unknown.text,/^Yes\./);
});

test('reusable catalog path produces definite loudness answer for a documented owned pair',()=>{
  const speaker={model:'Reference speaker',values:{sensitivity:87,basis:'voltage',load:8},
    url:'https://example.invalid/speaker'};
  const amp={model:'Reference amp',ratings:[[60,8,'continuous','20 Hz–20 kHz, 0.019% THD']],
    url:'https://example.invalid/amp'};
  const evidence=acousticEvidenceForPair(speaker,amp);
  assert.ok(evidence);
  assert.equal(evidence.sensitivityDb1W1m,87);
  const result=headroomEvidence({architecture:'passive_separates',acousticEvidence:evidence},
    {...req,level:'high',distanceFt:6});
  assert.equal(result.status,'estimated_suitable');
  assert.match(result.text,/^Yes\./);
});

test('the 2.83-volt sensitivity basis is converted rather than treated as one watt for low impedance',()=>{
  const speaker={model:'6 Ω example',values:{sensitivity:88,basis:'voltage',load:6}};
  const amp={ratings:[[65,6,'continuous','20 Hz–20 kHz, 0.05% THD']]};
  const evidence=acousticEvidenceForPair(speaker,amp);
  assert.ok(evidence);
  assert.ok(evidence.sensitivityDb1W1m<88);
  assert.ok(evidence.sensitivityDb1W1m>86);
});

test('burst-only and other-load amplifier ratings never produce a numerical loudness verdict',()=>{
  const speaker={values:{sensitivity:87,basis:'power',load:8}};
  assert.equal(acousticEvidenceForPair(speaker,{ratings:[[200,8,'burst','IHF dynamic']]}),null);
  assert.equal(acousticEvidenceForPair(speaker,{ratings:[[60,6,'continuous','20 Hz–20 kHz']]}),null);
  assert.equal(acousticEvidenceForPair({values:{load:8}},{
    ratings:[[60,8,'continuous','20 Hz–20 kHz']]}),null);
});
