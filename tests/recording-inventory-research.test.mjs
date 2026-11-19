import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../research/recording-input-catalog-v1.json',import.meta.url),'utf8'));
const byId=id=>catalog.records.find(r=>r.id===id);
test('research inventory is a separate typed catalogue, not a change to System Check',()=>{
 assert.equal(catalog.status,'research_only');
 assert.equal(catalog.records.length,53);
 assert.equal(new Set(catalog.records.map(x=>x.id)).size,catalog.records.length);
 assert.equal(catalog.records.filter(x=>x.comparisonAnchor).length,3);
 for(const record of catalog.records){
   assert.ok(['microphone','audio_interface','mixer_recorder','computer_sound_card','headphone','headphone_amplifier','speaker'].includes(record.category));
   assert.ok(record.model && record.sourceEvidence.length>0);
   assert.ok(record.sourceEvidence.every(e=>e.url.startsWith('https://')&&e.fields.length>0));
   assert.equal(record.price,null);
   assert.equal(record.availability,null);
   assert.equal(record.roleOfRecord,'research_comparison_not_published_recommendation');
 }
});
test('user existing recording equipment forms three evidence-backed comparison anchors',()=>{
 assert.equal(byId('fifine-k669d').capsule,'moving_coil_dynamic');
 assert.deepEqual(byId('fifine-k669d').outputs,['xlr_3pin']);
 assert.equal(byId('fifine-k669d').requires48v,false);
 const solo=byId('maudio-mtrack-solo');
 assert.equal(solo.micPreampCount,1);
 assert.equal(solo.simultaneousAnalogInputs,2);
 assert.equal(solo.computerRecordingInputs,2);
 assert.equal(solo.hasPhantom48v,true);
 assert.equal(solo.directMonitor,true);
 assert.equal(solo.preampGainRangeDb,54);
 const xfi=byId('creative-xfi-titanium-hd');
 assert.deepEqual(xfi.physicalInputTypes,['rca_stereo_line_input']);
 assert.equal(xfi.hasDedicatedXlrMicPreamps,false);
 assert.equal(xfi.existingPresetRef.model,'Creative Sound Blaster X-Fi Titanium HD (RCA)');
});
test('channels and mic preamps cannot be conflated',()=>{
 const audient=byId('audient-id4-mkii');
 assert.equal(audient.simultaneousAnalogInputs,2);
 assert.equal(audient.micPreampCount,1);
 const yamaha=byId('yamaha-mg10xu');
 assert.equal(yamaha.advertisedMixerChannels,10);
 assert.equal(yamaha.micPreampCount,4);
 assert.equal(yamaha.computerRecordingInputs,2);
 assert.equal(yamaha.usbRecordingMode,'stereo_mix_only');
 const zoom=byId('zoom-livetrak-l12');
 assert.equal(zoom.advertisedMixerChannels,12);
 assert.equal(zoom.micPreampCount,8);
 assert.equal(zoom.computerRecordingInputs,14);
 assert.equal(zoom.usbRecordingMode,'multitrack');
});
test('existing user amplifier/speaker/source/headphone records are reused, not cloned',()=>{
 const source=readFileSync(new URL('../system-check/gear.js',import.meta.url),'utf8');
 assert.equal(catalog.existingPresetCrossReferences.length,7);
 for(const record of catalog.existingPresetCrossReferences){
  assert.ok(source.includes('"model": "'+record.model+'"'),'missing existing preset: '+record.model);
  assert.equal(record.notDuplicated,true);
 }
 const pioneer=catalog.records.find(x=>x.id==='pioneer-sp-fs52');
 assert.equal(pioneer.speakerNominalImpedanceOhms,6);
 assert.equal(pioneer.speakerSensitivityDb,87);
 assert.equal(pioneer.frequencyRangeToleranceDb,null);
});
test('missing specs are explicit and not used to claim suitability or prices',()=>{
 const ro=byId('rode-podmic-xlr');
 assert.equal(ro.sensitivityDbvPa,null);
 const maudio=byId('maudio-mtrack-solo');
 assert.equal(maudio.price,null);
 assert.equal(maudio.priceCurrency,null);
 assert.equal(maudio.ratingsConsensus,null);
 assert.ok(catalog.records.every(x=>!('recommendationScore' in x)));
});

test('headphone comparison inherits the already catalogued Grado SR80e without duplication',()=>{
 const group=catalog.comparisonGroups.find(g=>g.id==='headphone-listening-and-monitoring');
 assert.ok(group.existingPresetModels.includes('Grado SR80e'));
 assert.ok(group.existingPresetModels.includes('Sennheiser HD 600'));
 assert.ok(!catalog.records.some(r=>r.model==='Grado SR80e'));
 assert.equal(catalog.records.filter(r=>r.category==='headphone').length,3);
 const akg=byId('akg-k371');
 assert.equal(akg.nominalImpedanceOhms,32);
 assert.equal(akg.sensitivityDb,114);
 assert.equal(akg.sensitivityBasis,'dB_SPL_per_V');
 assert.equal(byId('audio-technica-ath-m40x').sensitivityDb,null);
});
test('headphone amplifiers preserve actual input topologies and load-specific ratings',()=>{
 const amps=catalog.records.filter(r=>r.category==='headphone_amplifier');
 assert.equal(amps.length,5);
 const jds=byId('jds-atom-amp-2');
 assert.equal(jds.hasBuiltInDac,false);
 assert.equal(jds.outputImpedanceOhms,0.7);
 assert.equal(jds.ratedOutputMilliwatts.find(p=>p.loadOhms===32).wattsPerChannel,2.65);
 const fiio=byId('fiio-k11');
 assert.equal(fiio.hasBuiltInDac,true);
 assert.equal(fiio.ratedOutputMilliwatts.filter(p=>p.loadOhms===32).length,2);
 assert.notEqual(fiio.ratedOutputMilliwatts[0].testConditions,fiio.ratedOutputMilliwatts[1].testConditions);
 assert.equal(byId('topping-l30-ii').hasBuiltInDac,false);
 assert.equal(byId('schiit-magni-6').model,'Schiit Magni 6');
 assert.equal(byId('fiio-q11').amplifierKind,'portable_dac_headphone_amp');
});
test('the future headphone matching calculator must not be confused with the loudspeaker checker',()=>{
 const r=catalog.headphoneCompatibilityRules;
 assert.equal(r.notEnabledInSystemCheck,true);
 assert.ok(r.required.some(v=>/sensitivity.*reference basis/.test(v)));
 assert.ok(r.required.some(v=>/output impedance/.test(v)));
 assert.ok(r.caveats.some(v=>/Impedance alone/.test(v)));
 assert.ok(r.caveats.some(v=>/32 ohms/.test(v)));
 assert.ok(r.caveats.some(v=>/safe listening levels/.test(v)));
});
