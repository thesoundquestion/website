import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {headroomEvidence} from '../system-builder/headroom-evidence.mjs';
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
 assert.match(e.text,/reasonable option/);
 assert.match(e.detail,/Published amplifier watts/);
 assert.equal(e.link,null);
});

test('loud preference alone does not mark any powered product unsuitable or estimate clean seat SPL',()=>{
 const item={id:'studio-jbl',architecture:'active_studio'};
 const a=headroomEvidence(item,{...req,level:'moderate',distanceFt:6});
 const b=headroomEvidence(item,{...req,level:'high',distanceFt:16});
 assert.equal(a.status,b.status);
 assert.match(b.text,/16 ft/);
 assert.match(b.text,/check this model/);
 assert.doesNotMatch(b.text,/unsuitable|fails|cannot play/);
});

test('passive output requires matching continuous load and a documented sensitivity for quantitative assessment',()=>{
 const item={architecture:'passive_separates',amplifierFit:{amp:{watts:60,ohms:8,exact:true}}};
 const r=headroomEvidence(item,req);
 assert.equal(r.status,'passive_exact_load_power_only');
 assert.match(r.detail,/60 W\/channel at 8 Ω/);
 assert.match(r.detail,/not a seat-level SPL result/);
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
 assert.match(app,/if\(output.link\)link\(details/);
 assert.match(app,/How loud and why/);
 assert.doesNotMatch(app,/Confirm clean output at your listening distance and level/);
});
