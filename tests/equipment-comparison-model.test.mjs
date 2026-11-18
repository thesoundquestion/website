import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {buildEquipmentComparison,comparableCategories} from '../equipment/comparison-model.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(readFileSync(resolve(root,'equipment/catalog.generated.json'),'utf8'));
const by=model=>catalog.records.find(record=>record.model===model||record.aliases.includes(model));
test('interface comparison uses real shared data without inventing upgrades or prices',()=>{
  const a=by('M-Audio M-Track Solo'),b=by('Focusrite Scarlett 2i2 (4th Gen)');
  assert.ok(a&&b);
  const comparison=buildEquipmentComparison(a,b,{category:'audio_interface'});
  assert.equal(comparison.status,'facts_only');
  assert.equal(comparison.category,'audio_interface');
  const preamps=comparison.rows.find(x=>x.key==='micPreampCount');
  assert.equal(preamps.left.display,'1');
  assert.equal(preamps.right.display,'2');
  assert.equal(preamps.directlyComparable,true);
  assert.equal(comparison.rows.find(x=>x.key==='maxBitDepth').left.display,'Not verified');
  assert.ok(!JSON.stringify(comparison).includes('premium_pricing'));
  assert.ok(!JSON.stringify(comparison).includes('recommended'));
});
test('interface outputs never become presumed recording inputs',()=>{
  const c=buildEquipmentComparison(by('M-Audio M-Track Solo'),by('Focusrite Scarlett 2i2 (4th Gen)'));
  assert.equal(c.rows.find(x=>x.key==='computerRecordingInputs').left.display,'2');
  assert.equal(c.rows.find(x=>x.key==='computerRecordingInputs').right.display,'2');
  assert.equal(c.rows.find(x=>x.key==='computerPlaybackOutputs').label,'Computer playback channels');
});
test('headphone sensitivity basis mismatches get a warning',()=>{
  const a=by('Grado SR80e'),b=by('Sennheiser HD 600');
  const c=buildEquipmentComparison(a,b,{category:'headphone'});
  const row=c.rows.find(x=>x.key==='sensitivityDb');
  assert.equal(row.directlyComparable,false);
  assert.match(row.caution,/same confirmed reference/);
  assert.equal(c.rows.find(x=>x.key==='nominalImpedanceOhms').left.display,'32 Ω');
  assert.equal(c.rows.find(x=>x.key==='nominalImpedanceOhms').right.display,'300 Ω');
});
test('wrong category and unrelated gear do not imply equivalence',()=>{
  const amp=by('Yamaha A-720'),mic=by('FIFINE K669D');
  assert.deepEqual(comparableCategories(amp,mic),[]);
  assert.equal(buildEquipmentComparison(amp,mic).status,'not_comparable');
  assert.throws(()=>buildEquipmentComparison(amp,mic,{category:'amp'}),RangeError);
});
test('manufacturer power ratings are shown with test basis, not ranked as a number',()=>{
  const c=buildEquipmentComparison(by('Yamaha A-720'),by('Panasonic SA-HE100'),{category:'amp'});
  const row=c.rows.find(x=>x.key==='speakerPowerRatings');
  assert.equal(row.directlyComparable,false);
  assert.match(row.caution,/load, output path and test conditions/);
  assert.ok(row.left.source);
});
test('comparison rejects missing records rather than silently defaulting',()=>{
  assert.throws(()=>buildEquipmentComparison(null,by('Yamaha A-720')),TypeError);
});

test('verified microphone capacity differences are explained without claiming better audio quality',()=>{
  const c=buildEquipmentComparison(by('M-Audio M-Track Solo'),by('Focusrite Scarlett 2i2 (4th Gen)'),{category:'audio_interface'});
  assert.ok(c.observations.some(s=>/microphone-preamp counts differ \(1 versus 2\)/.test(s)));
  assert.ok(c.observations.every(s=>!/sounds better|is superior|upgrade recommended/.test(s)));
});
test('published power conditions display useful plain-language labels',()=>{
  const c=buildEquipmentComparison(by('Yamaha A-720'),by('Panasonic SA-HE100'),{category:'amp'});
  const row=c.rows.find(x=>x.key==='speakerPowerRatings');
  assert.match(row.left.display,/Power per channel:/);
  assert.match(row.left.display,/Load:/);
  assert.match(row.left.display,/Test conditions:/);
  assert.ok(c.observations.some(s=>/channels driven/.test(s)));
});
test('empty power arrays and empty objects must remain unverified',()=>{
  const a={id:'a',model:'A',categories:['headphone_amplifier'],facts:{ratedOutputMilliwatts:{value:[]}}};
  const b={id:'b',model:'B',categories:['headphone_amplifier'],facts:{ratedOutputMilliwatts:{value:{}}}};
  const c=buildEquipmentComparison(a,b,{category:'headphone_amplifier'});
  assert.equal(c.rows.find(x=>x.key==='ratedOutputMilliwatts').left.display,'Not verified');
  assert.equal(c.rows.find(x=>x.key==='ratedOutputMilliwatts').right.display,'Not verified');
});
test('unverified preamp count produces no invented practical difference',()=>{
  const a={id:'a',model:'A',categories:['audio_interface'],facts:{}};
  const b={id:'b',model:'B',categories:['audio_interface'],facts:{micPreampCount:{value:2}}};
  const c=buildEquipmentComparison(a,b,{category:'audio_interface'});
  assert.ok(!c.observations.some(s=>/microphone-preamp counts differ/.test(s)));
});

test('speaker sensitivity needs identical published measurement reference',()=>{
  const a={id:'a',model:'Speaker A',categories:['speaker'],facts:{
    speakerSensitivityDb:{value:89,reference:'1 W at 1 m'},
    speakerSensitivityBasis:{value:'power'}
  }};
  const b={id:'b',model:'Speaker B',categories:['speaker'],facts:{
    speakerSensitivityDb:{value:89,reference:'2.83 V at 1 m'},
    speakerSensitivityBasis:{value:'voltage'}
  }};
  const c=buildEquipmentComparison(a,b,{category:'speaker'});
  const row=c.rows.find(x=>x.key==='speakerSensitivityDb');
  assert.equal(row.directlyComparable,false);
  assert.match(row.caution,/same confirmed reference/);
});
test('documented driver bit depth must not be promoted to verified hardware maximum',()=>{
  const c=buildEquipmentComparison(by('M-Audio M-Track Solo'),by('Focusrite Scarlett 2i2 (4th Gen)'),{category:'audio_interface'});
  const row=c.rows.find(x=>x.key==='documentedSetupBitDepth');
  assert.equal(row.directlyComparable,false);
  assert.match(row.caution,/not necessarily the device/);
});
