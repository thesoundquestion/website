import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shortlistExamples} from '../system-builder/recommendations.mjs';
import {explainEmptyExampleShortlist} from '../system-builder/empty-shortlist-guidance.mjs';

const catalog=JSON.parse(readFileSync(new URL('../equipment/catalog.generated.json',import.meta.url),'utf8'));
const base={
 architecture:'open',useCase:'bedroom',goal:'all_rounder',
 region:'CA',currency:'CAD',level:'quiet',connection:'analog',
 power:'mains',budget:null,budgetStrict:true,used:false,
 distanceFt:6,referenceDate:'2026-11-21',subMode:'no_sub'
};
const search=options=>shortlistExamples({...base,...options},catalog);

test('realistic purchase routes must return at least one explicitly usable choice',()=>{
 for(const [label,options,expectedInput] of [
   ['budget analogue desk pair',{architecture:'consumer_powered_pair',useCase:'desk',budget:180},'analog'],
   ['optical TV bedroom pair',{architecture:'consumer_powered_pair',connection:'optical',budget:230},'optical'],
   ['USB computer powered pair',{architecture:'consumer_powered_pair',connection:'usb',useCase:'desk',budget:250},'usb'],
   ['Bluetooth desk speaker',{architecture:'consumer_powered_pair',connection:'bluetooth',useCase:'desk',budget:180},'bluetooth'],
   ['passive stereo in living room',{architecture:'passive_separates',useCase:'living_room',budget:1500},'analog'],
   ['battery event option',{architecture:'party_pa',useCase:'party',goal:'party',
     power:'battery',connection:'bluetooth',budget:1600},'bluetooth']
 ]){
  const result=search(options);
  assert.ok(result.selected.length>0,label+' produced no usable choices');
  assert.ok(result.selected.every(x=>x.connections.includes(expectedInput)),
    label+' included unsupported input');
  assert.ok(result.selected.every(x=>x.connectionStatus==='native_possible'));
 }
});

test('unsupported HDMI system is rejected and the visitor receives useful specific next steps',()=>{
 const options={architecture:'consumer_powered_pair',useCase:'desk',connection:'hdmi'};
 const result=search(options);
 assert.equal(result.selected.length,0);
 const note=explainEmptyExampleShortlist({...base,...options},result);
 assert.match(note.reason.join(' '),/direct HDMI input/);
 assert.match(note.actions.join(' '),/other outputs/);
 assert.match(note.actions.join(' '),/extractor.*separate purchase/);
 assert.ok(note.excludedCount>0);
});

test('battery-only passive requests explain their blocking constraint without recommending mains hardware',()=>{
 const options={architecture:'passive_separates',power:'battery',connection:'analog'};
 const result=search(options);
 assert.equal(result.selected.length,0);
 const note=explainEmptyExampleShortlist({...base,...options},result);
 assert.match(note.reason.join(' '),/Battery-only/);
 assert.match(note.actions.join(' '),/battery-powered PA|mains power/);
});

test('very restrictive known budget never implies that unpriced components cost nothing',()=>{
 const options={architecture:'consumer_powered_pair',budget:20};
 const result=search(options);
 const note=explainEmptyExampleShortlist({...base,...options},result);
 assert.ok(note.reason.join(' ').includes('spending limit'));
 assert.match(note.reason.join(' '),/Unpriced parts are not assumed free/);
});

test('unknown catalog coverage is described as uncertainty, not proof of incompatibility',()=>{
 const note=explainEmptyExampleShortlist({...base,architecture:'active_studio',connection:'undecided'},{
  selected:[],excluded:[]
 });
 assert.match(note.reason[0],/does not prove suitable equipment does not exist/);
 assert.ok(note.actions.length>0);
});

test('published Builder pages render explicit no-match reasons in both compact and advanced routes',()=>{
 const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 assert.match(app,/explainEmptyExampleShortlist\(request,shortlist\)/);
 assert.doesNotMatch(app,/No complete example fits these selections yet/);
});
