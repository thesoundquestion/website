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
