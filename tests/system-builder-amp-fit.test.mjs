import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {speakerPowerReference,ampRatingAtSpeakerLoad,assessAmplifierCandidate,
  AMP_LISTENING_REPORTS} from '../system-builder/amplifier-fit.mjs';
import {shortlistAmpsForOwnedSpeakers} from '../system-builder/owned-gear-options.mjs';
const read=x=>readFileSync(new URL(x,import.meta.url),'utf8');
const context={window:{}};createContext(context);
for(const x of ['../system-check/gear.js','../system-check/compare/specs.js','../system-builder/catalog-adapter.js'])
  runInContext(read(x),context);
const catalog=context.window.systemBuilderInventory;
const gear=(kind,name)=>({name,record:catalog[kind].find(x=>x.model===name)});
const phantom=gear('speaker','Paradigm Phantom v1');
const elac=gear('speaker','ELAC Debut 3.0 DB63');
const kef=gear('speaker','KEF Q150');
const yamaha=gear('amp','Yamaha A-S301');
const sony=gear('amp','Sony STR-DH190');
const wiim=gear('amp','WiiM Amp');
const cambridge=gear('amp','Cambridge Audio CXA61');
const request={goal:'dynamic',level:'high',connection:'analog',region:'CA',currency:'CAD',
  budget:null,budgetStrict:true,used:true,useCase:'living_room'};
const idea=model=>({model,inputs:['analog','optical']});
const assess=(amp,speaker=phantom,req=request)=>assessAmplifierCandidate({idea:idea(amp.name),record:amp.record,speaker,request:req});

test('speaker maker amplifier recommendations and peak specs are not continuous handling targets',()=>{
  const a=speakerPowerReference(elac);
  assert.equal(a.watts,60);
  assert.equal(a.basis,'nominal');
  assert.equal(a.peak,80);
  assert.equal(a.recommendedMax,140);
  assert.match(assess(yamaha,elac).ownerNote,/NOT a speaker power-handling limit/);
  const b=speakerPowerReference(kef);
  assert.equal(b.watts,null);
  assert.equal(b.recommendedMax,100);
  assert.equal(assess(yamaha,kef).ratio,null);
  assert.match(assess(yamaha,kef).powerNote,/unavailable/);
});
test('published max speaker input is identified as an uncertain rating basis',()=>{
  const s=speakerPowerReference(phantom);
  assert.equal(s.watts,90);
  assert.equal(s.basis,'max_input');
  assert.equal(s.recommendedMax,150);
  const a=assess(yamaha);
  assert.match(a.powerNote,/maximum-input figure/);
  assert.match(a.powerNote,/not a continuous-use or safety threshold/);
  assert.ok(a.ratio>0.6&&a.ratio<0.7);
});
test('amplifier rating must match speaker nominal impedance; no watts interpolated',()=>{
  const x=ampRatingAtSpeakerLoad(cambridge.record,elac);
  assert.equal(x.exact,false);
  assert.equal(x.watts,null);
  assert.equal(x.displayOhms,8);
  assert.equal(assess(cambridge,elac).ratio,null);
  assert.match(assess(cambridge,elac).powerNote,/no wattage target is invented/);
  assert.equal(ampRatingAtSpeakerLoad(yamaha.record,elac).watts,70);
});
test('only documented full-band low THD ratings earn clean-output evidence',()=>{
  const y=ampRatingAtSpeakerLoad(yamaha.record,phantom);
  assert.equal(y.fullBand,true);
  assert.equal(y.thd,0.019);
  assert.equal(y.distortionEvidence,'strong');
  const s=ampRatingAtSpeakerLoad(sony.record,phantom);
  assert.equal(s.fullBand,true);
  assert.equal(s.thd,0.09);
  assert.equal(s.distortionEvidence,'documented');
  const w=ampRatingAtSpeakerLoad(wiim.record,phantom);
  assert.equal(w.thd,1);
  assert.equal(w.fullBand,false);
  assert.notEqual(w.distortionEvidence,'strong');
  const c=ampRatingAtSpeakerLoad(cambridge.record,phantom);
  assert.equal(c.thd,null);
  assert.equal(c.distortionEvidence,'unknown');
});
test('comparable stronger published distortion ceiling ranks above weak or absent data, without audibility claim',()=>{
  const sp={name:'Toy 8 Ω',record:{values:{load:8,speakerPowerNominal:80}}};
  const make=(thd)=>({ratings:[[80,8,'continuous',thd]]});
  const base={model:'Synthetic',inputs:['analog']};
  const good=assessAmplifierCandidate({idea:base,record:make('20 Hz–20 kHz, 0.019% THD'),speaker:sp,request});
  const decent=assessAmplifierCandidate({idea:base,record:make('20 Hz–20 kHz, 0.09% THD'),speaker:sp,request});
  const unknown=assessAmplifierCandidate({idea:base,record:make('Factory RMS output'),speaker:sp,request});
  assert.ok(good.sortValue>decent.sortValue && decent.sortValue>unknown.sortValue);
  assert.match(good.distortionNote,/not proof of an audible difference/);
});
test('higher-wattage mismatch does not automatically earn a higher rank',()=>{
  const sp={name:'60 W test speaker',record:{values:{load:8,speakerPowerNominal:60}}};
  const good={ratings:[[70,8,'continuous','20 Hz–20 kHz, 0.019% THD']]};
  const huge={ratings:[[500,8,'continuous','20 Hz–20 kHz, 0.019% THD']]};
  const a=assessAmplifierCandidate({idea:idea('Generic'),record:good,speaker:sp,request});
  const b=assessAmplifierCandidate({idea:idea('Generic'),record:huge,speaker:sp,request});
  assert.ok(a.sortValue>b.sortValue);
  assert.match(b.headroomNote,/overdrive/);
});
test('curated shortlist ordering changes sensibly with actual handling figures',()=>{
  const first=shortlistAmpsForOwnedSpeakers({own:{speaker:phantom},request,inventory:catalog}).selected;
  const second=shortlistAmpsForOwnedSpeakers({own:{speaker:elac},request,inventory:catalog}).selected;
  assert.equal(first[0].title,'Paradigm Phantom v1 + Yamaha A-S501');
  assert.equal(second[0].title,'ELAC Debut 3.0 DB63 + Yamaha A-S301');
  assert.ok(first.every(x=>x.reuseNames.includes(phantom.name)));
  assert.ok(second.every(x=>x.reuseNames.includes(elac.name)));
  assert.ok(first.every(x=>x.amplifierFit&&x.amplifierEvidence.length>=7));
});
test('real model review impressions are sourced and do not silently become brand scoring',()=>{
  for(const [name,r] of Object.entries(AMP_LISTENING_REPORTS)) {
    assert.ok(r.text.length>50 && r.text.length<400,name);
    assert.ok(r.sources.length>=1 && r.sources.every(s=>s.url.startsWith('https://')));
    assert.match(r.tier,/model-specific|listening review|Independent lab|Specifications only/);
  }
  const x=assessAmplifierCandidate({idea:idea('Yamaha A-S301'),
    record:yamaha.record,speaker:phantom,request});
  const y=assessAmplifierCandidate({idea:idea('Brand X identical test ratings'),
    record:yamaha.record,speaker:phantom,request});
  assert.equal(x.sortValue,y.sortValue);
  assert.ok(x.context);
  assert.equal(y.context,null);
});
test('visible card shows clean power, distortion evidence and attributed review separately',()=>{
  const app=read('../system-builder/app.mjs');
  assert.match(app,/if \(item\.amplifierFit\)/);
  assert.match(app,/Power & headroom: /);
  assert.match(app,/Distortion evidence: /);
  assert.match(app,/Reviewer\/lab context: /);
  assert.match(app,/Model-specific listening reports, not a brand sound signature/);
  assert.match(app,/Published speaker power specification/);
  assert.doesNotMatch(app,/item\.amplifierFitRank\s*\+/);
});
