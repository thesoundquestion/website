import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {buildEquipmentComparison} from '../equipment/comparison-model.mjs';

const base=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(base,path),'utf8');
const catalog=JSON.parse(read('equipment/catalog.generated.json'));
const html=read('system-check/compare/index.html');
const expanded=read('system-check/compare/expanded.mjs');
const legacy=read('system-check/compare/compare.js');
const css=read('system-check/compare/style.css');
const model=name=>catalog.records.find(item=>item.model===name);
const types=['amp','speaker','source','headphone',
  'audio_interface','mixer_recorder','microphone','headphone_amplifier','computer_sound_card',
  'powered_studio_monitor','powered_pa_speaker'];
const extras=types.slice(4);
const compare=(a,b,type)=>buildEquipmentComparison(model(a),model(b),{category:type});
const row=(comparison,key)=>comparison.rows.find(x=>x.key===key);

test('Compare My Gear exposes all eleven categories without removing legacy specs and actions',()=>{
  assert.deepEqual([...html.matchAll(/data-kind="([^"]+)"/g)].map(x=>x[1]),types);
  assert.ok(html.includes('id="gc-legacy"'));
  assert.ok(html.includes('id="gc-expanded"'));
  assert.ok(html.includes('id="gc-expanded-rows"'));
  assert.ok(html.includes('id="gc-expanded-sources"'));
  assert.ok(html.includes('/system-check/compare/expanded.mjs'));
  assert.ok(html.includes('id="gc-price-summary"'));
  assert.match(legacy,/function amplifierRows/);
  assert.match(legacy,/function speakerRows/);
  assert.match(legacy,/function sourceRows/);
  assert.match(legacy,/function headphoneRows/);
  assert.match(legacy,/Object\.hasOwn\(equipment,button\.dataset\.kind\)/);
  assert.match(legacy,/if\(!initialExpanded\)showCategory\(\)/);
  assert.match(legacy,/if\(expandedPanel\)expandedPanel\.hidden=true/);
  assert.match(css,/#gc-expanded\[hidden\]/);
  assert.match(css,/max-width:580px/);
  assert.match(expanded,/buildEquipmentComparison/);
  assert.match(expanded,/loadEquipmentCatalog/);
  assert.match(expanded,/history\.replaceState/);
  assert.match(expanded,/textContent/);
  assert.doesNotMatch(expanded,/innerHTML|localStorage|sessionStorage/);
  const parsed=spawnSync(process.execPath,['--check',resolve(base,'system-check/compare/expanded.mjs')],{encoding:'utf8'});
  assert.equal(parsed.status,0,parsed.stderr);
});
test('new categories have actual catalogue records and feature-appropriate spec columns',()=>{
  const fields={
    audio_interface:['micPreampCount','simultaneousAnalogInputs','computerRecordingInputs','computerPlaybackOutputs','usbRecordingMode','inputConnections','outputConnections','inputRoutingConstraints'],
    mixer_recorder:['advertisedMixerChannels','micPreampCount','computerRecordingInputs','usbRecordingMode','inputConnections','outputConnections','inputRoutingConstraints'],
    microphone:['capsule','pattern','requires48v','powerMethod','inputConnections','outputConnections'],
    headphone_amplifier:['ratedOutputMilliwatts','hasBuiltInDac','outputImpedanceOhms','inputConnections','outputConnections'],
    computer_sound_card:['recordingAdc','playbackDac','hasDedicatedXlrMicPreamps','maxLineInputResolution','inputConnections','outputConnections']
  };
  for(const type of extras){
    const records=catalog.records.filter(x=>x.categories.includes(type));
    assert.ok(records.length>0,'missing catalogue models '+type);
    const c=buildEquipmentComparison(records[0],records[0],{category:type});
    for(const field of fields[type])assert.ok(row(c,field),type+' missing '+field);
    for(const row of c.rows)for(const key of ['left','right']){
      assert.equal(typeof row[key].display,'string');
      assert.ok(row[key].display.length>0);
    }
  }
});
test('interface sheet distinguishes physical connectors, mic preamps and USB capture',()=>{
  const c=compare('M-Audio M-Track Solo','Focusrite Scarlett 2i2 (4th Gen)','audio_interface');
  assert.equal(row(c,'micPreampCount').left.display,'1');
  assert.equal(row(c,'micPreampCount').right.display,'2');
  assert.equal(row(c,'computerRecordingInputs').left.display,'2');
  assert.match(row(c,'inputConnections').left.display,/XLR/i);
  assert.match(row(c,'outputConnections').right.display,/headphone|line|monitor/i);
  assert.ok(row(c,'inputRoutingConstraints').left.display!=='Not verified');
});
test('mixer sheet does not equate twelve mixer channels with USB recording tracks',()=>{
  const c=compare('Behringer XENYX 1204USB','Zoom LiveTrak L-12','mixer_recorder');
  assert.equal(row(c,'advertisedMixerChannels').left.display,'12');
  assert.equal(row(c,'computerRecordingInputs').left.display,'2');
  assert.match(row(c,'outputConnections').left.display,/USB/i);
  assert.match(row(c,'inputRoutingConstraints').left.display,/two-channel stereo mix/i);
  assert.ok(c.observations.some(x=>x.includes('capture channels differ')));
});
test('microphone sheet shows capsule/pattern, powering and connection without making up noise figures',()=>{
  const c=compare('AKG P120','Shure SM58','microphone');
  assert.match(row(c,'capsule').left.display,/condenser/i);
  assert.match(row(c,'capsule').right.display,/dynamic/i);
  assert.match(row(c,'pattern').left.display,/cardioid/i);
  assert.equal(row(c,'requires48v').left.display,'Yes');
  assert.equal(row(c,'requires48v').right.display,'No');
  assert.match(row(c,'outputConnections').left.display,/XLR/i);
  assert.equal(row(c,'selfNoiseDba').left.display,'Not verified');
  assert.equal(row(c,'sensitivityDbvPa').right.display,'Not verified');
});
test('headphone amp sheet separates output jacks, load and channel power ratings',()=>{
  const c=compare('FiiO K11 (RCA line out)','JDS Labs Atom Amp 2','headphone_amplifier');
  assert.match(row(c,'inputConnections').left.display,/USB/i);
  assert.match(row(c,'outputConnections').left.display,/6\.35 mm|4\.4 mm/);
  assert.match(row(c,'ratedOutputMilliwatts').left.display,/Load:/);
  assert.match(row(c,'ratedOutputMilliwatts').caution,/same load, output path and test conditions/);
  assert.ok(c.notes.some(x=>/not sound-quality/.test(x)));
});
test('single sound-card entry has input/output facts without inventing microphone inputs',()=>{
  const a=model('Creative Sound Blaster X-Fi Titanium HD (RCA)');
  const c=buildEquipmentComparison(a,a,{category:'computer_sound_card'});
  assert.equal(c.category,'computer_sound_card');
  assert.equal(row(c,'recordingAdc').left.display,'Yes');
  assert.equal(row(c,'hasDedicatedXlrMicPreamps').left.display,'No');
  assert.match(row(c,'inputConnections').left.display,/RCA/i);
  assert.match(row(c,'outputConnections').left.display,/RCA/i);
  assert.equal(row(c,'computerRecordingInputs').left.display,'Not verified');
  assert.ok((a.evidence||[]).some(x=>x.url.includes('creative.com')));
  assert.match(expanded,/Only one documented model in this category/);
});
