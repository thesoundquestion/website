import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sharedGearAsLegacyView} from '../system-builder/shared-gear-adapter.mjs';

const catalog=JSON.parse(readFileSync(new URL('../equipment/catalog.generated.json',import.meta.url),'utf8'));
const byModel=model=>catalog.records.find(x=>x.model===model);

test('a saved amplifier keeps its exact continuous AND burst ratings in Builder',()=>{
 const a=sharedGearAsLegacyView(byModel('Yamaha A-S301'),'amp');
 assert.ok(a);
 assert.deepEqual(a.ratings.find(r=>r[0]===60&&r[1]===8&&r[2]==='continuous'),
   [60,8,'continuous','20 Hz–20 kHz, 0.019% THD']);
 assert.ok(a.ratings.some(r=>r[2]==='burst'));
 assert.equal(a.values.inputZ,47);
 assert.ok(a.url.startsWith('https://'));
});
test('a sourced supplement retains nominal/minimum speaker load',()=>{
 const speaker=sharedGearAsLegacyView(byModel('Polk Monitor XT15'),'speaker');
 assert.ok(speaker);
 assert.equal(speaker.values.load,8);
 assert.equal(speaker.values.minimum,4.1);
 assert.equal(speaker.values.sensitivity,86);
 assert.equal(speaker.values.basis,'voltage');
});
test('a published missing specification stays missing',()=>{
 const speaker=sharedGearAsLegacyView(byModel('PSB Alpha P5'),'speaker');
 assert.ok(speaker);
 assert.equal(speaker.values.load,8);
 // The source catalog currently lacks an admitted sensitivity measurement.
 // It must not be silently fabricated, even when a vendor product page exists.
 assert.equal(speaker.values.sensitivity,undefined);
 const amp=sharedGearAsLegacyView(byModel('Fosi Audio BT20A Pro'),'amp');
 assert.equal(amp.ratings.length,0,'no verified continuous-rating record in source catalogue');
});
test('a powered research model is not mistaken for a passive speaker',()=>{
 const studio=sharedGearAsLegacyView(byModel('JBL 305P MkII'),'speaker');
 assert.equal(studio.powered,true);
 assert.equal(studio.speakerKind,'powered_studio_monitor');
 assert.equal(studio.values.sensitivity,undefined);
});
test('fact-only source profiles convert accurately without inventing measurements',()=>{
 const entry={
  id:'research/speaker/example',model:'Example model',categories:['speaker'],
  profiles:[],
  facts:{
   speakerNominalImpedanceOhms:{value:6},
   speakerMinimumImpedanceOhms:{value:4},
   speakerSensitivityDb:{value:87},
   speakerSensitivityBasis:{value:'2.83_V_at_1_m'}
  },
  evidence:[{url:'https://example.org/model',from:'research'}]
 };
 const speaker=sharedGearAsLegacyView(entry,'speaker');
 assert.deepEqual(speaker.values,{load:6,minimum:4,sensitivity:87,basis:'voltage'});
 assert.equal(speaker.ratings.length,0);
 assert.equal(sharedGearAsLegacyView(entry,'amp'),null);
});
test('fact-only power ratings preserve tested conditions and duration',()=>{
 const entry={
  id:'research/amp/example',model:'Example amp',categories:['amp'],profiles:[],
  facts:{speakerPowerRatings:{value:[
   {wattsPerChannel:60,loadOhms:8,duration:'continuous',testConditions:'20 Hz–20 kHz'},
   {wattsPerChannel:100,loadOhms:4,duration:'burst',testConditions:'short dynamic test'},
   {wattsPerChannel:null,loadOhms:8,duration:'continuous'}
  ]}},
  evidence:[{url:'https://example.org/amp',from:'research'}]
 };
 const amp=sharedGearAsLegacyView(entry,'amp');
 assert.deepEqual(amp.ratings,[[60,8,'continuous','20 Hz–20 kHz'],[100,4,'burst','short dynamic test']]);
});
test('catalogue refresh code keeps a previously selected sourced model',()=>{
 const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 assert.match(app,/Your selected sourced model/);
 assert.match(app,/sharedGearAsLegacyView\(shared,kind\)/);
});
