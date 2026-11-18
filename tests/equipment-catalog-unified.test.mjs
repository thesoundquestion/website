import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {findEquipment} from '../equipment/catalog-core.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const get=path=>readFileSync(resolve(root,path),'utf8');
const registry=JSON.parse(get('equipment/catalog.generated.json'));
const by=(model,category)=>findEquipment(registry,{model,category});
const profile=(entry,from)=>entry.profiles.find(p=>p.from===from);

test('the generated catalogue is current with all three existing data sources',()=>{
  const msg=execFileSync(process.execPath,['scripts/build-equipment-catalog.mjs','--check'],
    {cwd:root,encoding:'utf8'});
  assert.match(msg,/Catalogue and legacy views current/);
  assert.equal(registry.schemaVersion,'1.0.0');
  assert.equal(registry.status,'draft_not_published');
  assert.equal(registry.summary.legacyProfiles,130);
  assert.equal(registry.summary.researchProfiles,29);
  assert.equal(registry.summary.builderSupplementProfiles,17);
  assert.equal(registry.summary.totalModels,173);
  assert.equal(new Set(registry.records.map(r=>r.id)).size,registry.records.length);
  assert.ok(registry.records.every(r=>r.profiles.length>=1&&r.evidence.length>=1));
  assert.ok(registry.records.every(r=>r.evidence.every(e=>e.url.startsWith('https://'))));
});
test('all existing owner comparison examples and new research examples survive with distinct identities',()=>{
  for(const [model,kind] of [
    ['Yamaha A-720','amp'],['Panasonic SA-HE100','amp'],
    ['Yamaha HTR-4063 (US/Canada)','amp'],
    ['Paradigm Phantom v1','speaker'],['Paradigm Titan v3','speaker'],
    ['Grado SR80e','headphone'],['Sennheiser HD 600','headphone'],
    ['FIFINE K669D','microphone'],['M-Audio M-Track Solo','audio_interface'],
    ['Creative Sound Blaster X-Fi Titanium HD','computer_sound_card']
  ])assert.ok(by(model,kind),'missing '+model);
  assert.equal(registry.records.filter(r=>r.aliases.includes('Creative Sound Blaster X-Fi Titanium HD')).length,1);
});
test('same physical device retains separate function-specific profiles',()=>{
  const xfi=by('Creative Sound Blaster X-Fi Titanium HD','computer_sound_card');
  assert.ok(xfi.categories.includes('source'));
  assert.equal(xfi.profiles.length,2);
  assert.ok(xfi.connections.inputs.some(p=>p.type==='rca_stereo_line_input'));
  const k11=by('FiiO K11','headphone_amplifier');
  assert.ok(k11.categories.includes('source'));
  assert.ok(k11.connections.outputs.some(p=>p.scope==='analogue line output'));
  assert.ok(k11.connections.outputs.some(p=>p.type==='6.35mm_single_ended'));
  const power=profile(k11,'research/recording-input-catalog-v1.json').specifications.ratedOutputMilliwatts;
  assert.equal(power.length,2);
  assert.notEqual(power[0].testConditions,power[1].testConditions);
  const akg=by('AKG K371','headphone');
  assert.equal(akg.profiles.length,2);
  assert.equal(registry.records.filter(r=>r.model==='AKG K371').length,1);
});
test('recording counts and phantom-power facts remain separate, with no invented pairing verdict',()=>{
  const solo=by('M-Audio M-Track Solo','audio_interface');
  assert.equal(solo.facts.micPreampCount.value,1);
  assert.equal(solo.facts.simultaneousAnalogInputs.value,2);
  assert.equal(solo.facts.computerRecordingInputs.value,2);
  assert.equal(solo.facts.hasPhantom48v.value,true);
  assert.ok(solo.connections.outputs.some(p=>p.type==='rca_stereo'));
  const yamaha=by('Yamaha MG10XU','mixer_recorder');
  assert.equal(yamaha.facts.advertisedMixerChannels.value,10);
  assert.equal(yamaha.facts.micPreampCount.value,4);
  assert.equal(yamaha.facts.computerRecordingInputs.value,2);
  assert.equal(yamaha.facts.usbRecordingMode.value,'stereo_mix_only');
  const zoom=by('Zoom LiveTrak L-12','mixer_recorder');
  assert.equal(zoom.facts.usbRecordingMode.value,'multitrack');
  for(const item of [solo,yamaha,zoom]) assert.ok(!('compatible' in item));
});
test('speaker/headphone sensitivity bases and amp conditions are not erased',()=>{
  const grado=by('Grado SR80e','headphone');
  assert.equal(grado.facts.nominalImpedanceOhms.value,32);
  assert.equal(grado.facts.sensitivityBasis.value,'dB_SPL_per_mW');
  const akg=by('AKG K371','headphone');
  assert.equal(akg.facts.sensitivityBasis.value,'dB_SPL_per_V');
  const yamaha=by('Yamaha A-720','amp');
  assert.ok(yamaha.facts.speakerPowerRatings.value.some(p=>p.loadOhms===8));
  assert.ok(yamaha.facts.speakerPowerRatings.value.every(p=>p.testConditions));
  const phantom=by('Paradigm Phantom v1','speaker');
  assert.ok(phantom.facts.speakerSensitivityDb.reference);
  assert.equal(phantom.facts.speakerNominalImpedanceOhms.value,8);
});
test('Pioneer manual and studio/PA models preserve separate signal and performance bases',()=>{
  const pioneer=by('Pioneer SP-FS52','speaker');
  assert.equal(pioneer.facts.speakerNominalImpedanceOhms.value,6);
  assert.equal(pioneer.facts.speakerSensitivityDb.value,87);
  assert.equal(pioneer.facts.frequencyRangeToleranceDb.value,null);
  const hs5=by('Yamaha HS5','speaker');
  assert.equal(hs5.facts.powered.value,true);
  assert.equal(hs5.facts.unitsPerRetailPackage.value,1);
  assert.equal(hs5.facts.internalAmplificationWatts.value.combined,70);
  assert.ok(hs5.connections.inputs.some(x=>x.type==='balanced_xlr_line'));
  const jbl=by('JBL 305P MkII','speaker');
  assert.equal(jbl.facts.powered.value,true);
  assert.equal(jbl.facts.unitsPerRetailPackage.value,1);
  const qsc=by('QSC K12.2','speaker');
  assert.equal(qsc.facts.onboardPhantomPowerVolts.value,null);
  assert.ok(qsc.connections.inputs.some(x=>x.type.includes('mic_or_line_A')));
  const ev=by('Electro-Voice ZLX-12P-G2','speaker');
  assert.equal(ev.facts.onboardPhantomPowerVolts.value,24);
  assert.equal(ev.facts.manufacturerMaximumSplDb.value,127);
});
test('no unknowns are quietly converted into prices, power rankings or guaranteed compatibility',()=>{
  for(const record of registry.records) {
    assert.equal(record.pricing.currentPrice,null);
    assert.equal(record.pricing.availability,null);
    assert.ok(!('soundQualityScore' in record));
    assert.ok(!('recommended' in record));
  }
  assert.equal(by('FIFINE K669D','microphone').facts.requires48v.value,false);
  assert.equal(by('AKG K371','headphone').facts.outputImpedanceOhms,undefined);
});
