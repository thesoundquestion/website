import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {headphoneDriveRequirement} from '../system-builder/headphone-drive.mjs';
test('96 dB SPL per mW at 32 ohms gives the expected voltage, power and current for a 95 dB example',()=>{
  const r=headphoneDriveRequirement({impedanceOhms:32,sensitivityDb:96,basis:'power'});
  const mW=10**(-1/10);
  assert.equal(r.status,'estimated_requirement');
  assert.ok(Math.abs(r.milliwatts-mW)<1e-9);
  assert.ok(Math.abs(r.voltsRms-Math.sqrt(mW*32/1000))<1e-9);
  assert.ok(Math.abs(r.milliampsRms-r.voltsRms/32*1000)<1e-9);
});
test('dB SPL/V at 1 V is never treated as a dB/mW sensitivity',()=>{
  const r=headphoneDriveRequirement({impedanceOhms:80,sensitivityDb:95,basis:'voltage'});
  assert.equal(r.voltsRms,1);
  assert.equal(r.milliwatts,12.5);
  assert.equal(r.milliampsRms,12.5);
  const other=headphoneDriveRequirement({impedanceOhms:80,sensitivityDb:95,basis:'power'});
  assert.notEqual(other.voltsRms,1);
  assert.equal(other.milliwatts,1);
});
test('unknown sensitivity basis or load does not produce a fabricated drive requirement',()=>{
  for(const input of [
    {impedanceOhms:32,sensitivityDb:96,basis:null},
    {impedanceOhms:0,sensitivityDb:96,basis:'power'},
    {impedanceOhms:300,sensitivityDb:null,basis:'voltage'}
  ]){
    const r=headphoneDriveRequirement(input);
    assert.notEqual(r.status,'estimated_requirement');
    assert.equal(r.voltsRms,null);
    assert.equal(r.milliwatts,null);
  }
});
test('headphone demand is displayed only for a documented basis, without inventing source power',()=>{
  const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  assert.match(app,/headphoneDriveRequirement\(/);
  assert.match(app,/demand\.status==='estimated_requirement'/);
  assert.match(app,/actual source headphone-output capability/);
});
