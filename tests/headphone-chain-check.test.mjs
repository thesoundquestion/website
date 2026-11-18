import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessHeadphoneChain} from '../equipment/headphone-chain-check.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(readFileSync(resolve(root,'equipment/catalog.generated.json'),'utf8'));
const by=model=>catalog.records.find(x=>x.model===model||x.aliases.includes(model));
const assess=(headphone,amp)=>assessHeadphoneChain(catalog,{
  headphoneId:by(headphone).id,amplifierId:by(amp).id
});

test('Grado SR80e can reference the M-Track Solo 32-ohm manufacturer rating',()=>{
  const result=assess('Grado SR80e','M-Audio M-Track Solo');
  assert.equal(result.powerRatingsAtNominalLoad.length,1);
  assert.equal(result.powerRatingsAtNominalLoad[0].loadOhms,32);
  assert.equal(result.powerRatingsAtNominalLoad[0].milliwattsPerChannel,60);
  assert.equal(result.checks.find(x=>x.code==='connector_evidence').status,'connector_type_documented');
  assert.match(result.disclaimer,/neither a loudness prediction/);
});
test('HD 600 on M-Track has no verified 300-ohm output rating',()=>{
  const result=assess('Sennheiser HD 600','M-Audio M-Track Solo');
  assert.equal(result.status,'no_matched_power_rating');
  assert.equal(result.powerRatingsAtNominalLoad.length,0);
  assert.ok(result.otherPublishedLoads.some(x=>x.loadOhms===32));
  assert.equal(result.checks.find(x=>x.code==='connector_evidence').status,'unverified');
});
test('K11 balanced 4.4mm figure cannot be assigned to Grado single-ended cable',()=>{
  const result=assess('Grado SR80e','FiiO K11');
  assert.deepEqual(result.powerRatingsAtNominalLoad.map(x=>x.milliwattsPerChannel),[520]);
  assert.ok(result.otherPublishedLoads.some(x=>x.milliwattsPerChannel===1400));
});
test('JDS Atom Amp 2 supplies a manufacturer rating at HD 600 nominal load',()=>{
  const result=assess('Sennheiser HD 600','JDS Labs Atom Amp 2');
  assert.equal(result.powerRatingsAtNominalLoad.length,1);
  assert.equal(result.powerRatingsAtNominalLoad[0].loadOhms,300);
  assert.equal(result.powerRatingsAtNominalLoad[0].milliwattsPerChannel,286);
  assert.ok(result.checks.some(x=>x.code==='output_impedance'&&x.status==='published_reference'));
});
test('unknown amplifier power must remain unknown even when connector is known',()=>{
  const result=assess('Grado SR80e','Topping L30 II');
  assert.equal(result.status,'no_matched_power_rating');
  assert.deepEqual(result.powerRatingsAtNominalLoad,[]);
});
test('non-headphone or non-headphone-output device cannot be silently accepted',()=>{
  assert.throws(()=>assessHeadphoneChain(catalog,{
    headphoneId:by('Yamaha A-720').id,amplifierId:by('FiiO K11').id
  }),RangeError);
  assert.throws(()=>assessHeadphoneChain(catalog,{
    headphoneId:by('Grado SR80e').id,amplifierId:by('Paradigm Phantom v1').id
  }),RangeError);
});
