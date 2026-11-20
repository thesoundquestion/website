import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceSignalMatch} from '../system-builder/source-signal-match.mjs';
import {shortlistAmpsForOwnedSpeakers} from '../system-builder/owned-gear-options.mjs';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';

test('RCA and 3.5mm line sources match the analogue amplifier input category',()=>{
 for(const output of ['RCA','3.5 mm']){
  const r=sourceSignalMatch(output,['analog','optical']);
  assert.equal(r.status,'direct_connector');
  assert.equal(r.direct,true);
 }
});
test('optical goes directly only to an optical input; coaxial requires coaxial',()=>{
 assert.equal(sourceSignalMatch('optical',['optical']).direct,true);
 const r=sourceSignalMatch('coaxial',['analog','optical']);
 assert.equal(r.direct,false);
 assert.match(r.note,/converter|different source output/);
 assert.match(r.note,/does not convert digital audio/);
});
test('USB, HDMI and Bluetooth connections do not imply automatic protocol compatibility',()=>{
 for(const output of ['usb','hdmi','bluetooth']){
  const r=sourceSignalMatch(output,[output]);
  assert.equal(r.direct,true);
  assert.match(r.note,/Confirm/);
 }
});
test('missing or unsupported source output is an unknown, not a fake direct path',()=>{
 assert.equal(sourceSignalMatch('', ['analog']).status,'unknown');
 assert.equal(sourceSignalMatch('optical',[]).status,'unknown');
});
test('owned optical DAC ranks native optical receivers ahead of analogue-only choices',()=>{
 const context={window:{}};createContext(context);
 const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
 for(const p of ['system-check/gear.js','system-check/compare/specs.js','system-builder/catalog-adapter.js'])
   runInContext(read(p),context);
 const inventory=context.window.systemBuilderInventory;
 const speaker={name:'Paradigm Phantom v1',
   record:inventory.speaker.find(x=>x.model==='Paradigm Phantom v1')};
 const source={name:'User Optical DAC',record:{values:{sourceConnection:'optical'}}};
 const list=shortlistAmpsForOwnedSpeakers({own:{speaker,source},inventory,
  request:{connection:'undecided',region:'CA',currency:'CAD',goal:'all_rounder',level:'moderate',useCase:'living_room'}}).selected;
 assert.ok(list.length);
 assert.ok(list.some(x=>x.sourceConnectionStatus==='direct_connector'));
 assert.ok(list.filter(x=>x.sourceConnectionStatus==='extra_hardware_or_alternate_output')
   .every(x=>x.extra.some(s=>/no matching optical input/.test(s))));
});
