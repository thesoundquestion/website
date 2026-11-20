import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseSpeakerSpecText} from '../system-builder/spec-paste.mjs';
import {unlistedSpecAssessment} from '../system-builder/unlisted-gear.mjs';
import {validateBuilderIntent} from '../system-builder/intent-routing.mjs';

test('a pasted manufacturer-style spec extract fills only explicit comparable ratings',()=>{
  const parsed=parseSpeakerSpecText([
    'Nominal impedance: 8 ohms',
    'Minimum impedance: 4.2 Ω',
    'Sensitivity: 89 dB (2.83 V / 1 m)',
    'Power handling: 400 watts peak'
  ].join('\n'));
  assert.deepEqual(parsed.fields,{
    speakerLoad:8,speakerMinimum:4.2,
    speakerSensitivity:89,speakerBasis:'voltage'
  });
});
test('1 W sensitivity basis is preserved, never converted silently',()=>{
  const result=parseSpeakerSpecText('Nominal Impedance: 6 Ω\nSensitivity: 90 dB (1 W / 1 m)');
  assert.equal(result.fields.speakerLoad,6);
  assert.equal(result.fields.speakerSensitivity,90);
  assert.equal(result.fields.speakerBasis,'power');
});
test('unqualified sensitivity and peak watts stay unknown; a generic impedance gets a review warning',()=>{
  const result=parseSpeakerSpecText('Impedance: 8 Ω\nSensitivity: 91 dB\n500 W peak/music power');
  assert.deepEqual(result.fields,{speakerLoad:8});
  assert.match(result.notes.join(' '),/Sensitivity was not filled/);
  assert.match(result.notes.join(' '),/without confirming "nominal"/);
});
test('conflicting ratings or a minimum above nominal cannot be accepted',()=>{
  const result=parseSpeakerSpecText('Nominal impedance: 8 Ω\nNominal impedance: 4 Ω\nMinimum impedance: 12 Ω\nSensitivity: 86 dB (2.83 V / 1 m)');
  assert.equal(result.fields.speakerLoad,undefined);
  assert.equal(result.fields.speakerMinimum,undefined,'a minimum above an ambiguous nominal must be entered manually');
  assert.equal(result.fields.speakerSensitivity,86);
  assert.match(result.notes.join(' '),/Conflicting impedance/);
  const invalid=parseSpeakerSpecText('Nominal impedance: 4 Ω\nMinimum impedance: 8 Ω');
  assert.equal(invalid.fields.speakerMinimum,undefined);
});
test('the paste text is not itself treated as an evidence-backed spec source',()=>{
  const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  const html=readFileSync(new URL('../system-builder/index.html',import.meta.url),'utf8');
  assert.match(html,/id="sb-speaker-spec-paste"/);
  assert.match(html,/id="sb-speaker-spec-fill"/);
  assert.match(html,/name="speakerSpecUrl"/);
  assert.match(app,/parseSpeakerSpecText\(speakerPaste.value\)/);
  assert.match(app,/link\.addEventListener\('click',\(\)=>\{manual.hidden=false;manual.open=true;\}\)/);
  assert.match(app,/if\(String\(input.value\)\.trim\(\)\)/);
  assert.doesNotMatch(html,/name="speakerSpecPaste"/);
});

test('manufacturer copy with several properties on one line is segmented correctly',()=>{
  const parsed=parseSpeakerSpecText('Nominal Impedance: 8Ω | Minimum Impedance: 4.3 ohms | Sensitivity: 89.5dB/2.83V/1m');
  assert.deepEqual(parsed.fields,{speakerLoad:8,speakerMinimum:4.3,speakerSensitivity:89.5,speakerBasis:'voltage'});
});

test('copied catalogue rows with alternate labels and no colons are recognised',()=>{
  const parsed=parseSpeakerSpecText('Rated Impedance (Ohms) | 6\nEfficiency 87 dB @ 2.83 volts / metre');
  assert.deepEqual(parsed.fields,{speakerLoad:6,speakerSensitivity:87,speakerBasis:'voltage'});
});

test('manufacturer PDF tables with a value on the following line can be pasted',()=>{
  const parsed=parseSpeakerSpecText([
    'Nominal impedance (Ω)','8',
    'Minimum impedance (Ω)','3.9',
    'Sensitivity (2.83 V / 1m)','91 dB'
  ].join('\n'));
  assert.deepEqual(parsed.fields,{speakerLoad:8,speakerMinimum:3.9,speakerSensitivity:91,speakerBasis:'voltage'});
});

test('source tables may specify nominal in parentheses after Impedance',()=>{
  const parsed=parseSpeakerSpecText('Impedance (nominal) | 6 ohms\nSensitivity: 88 dB (1 W at 1 m)');
  assert.deepEqual(parsed.fields,{speakerLoad:6,speakerSensitivity:88,speakerBasis:'power'});
  assert.doesNotMatch(parsed.notes.join(' '),/without confirming "nominal"/);
});

test('sensitivity headers can put dB and the stimulus in the column title',()=>{
  const parsed=parseSpeakerSpecText('Nominal impedance: 8 ohms\nSensitivity (dB / 2.83 V / 1m) | 89');
  assert.deepEqual(parsed.fields,{speakerLoad:8,speakerSensitivity:89,speakerBasis:'voltage'});
});

test('dB per watt per metre is kept as the published watt-based scale',()=>{
  const parsed=parseSpeakerSpecText('Nominal impedance: 8Ω; Sensitivity: 89 dB/W/m');
  assert.deepEqual(parsed.fields,{speakerLoad:8,speakerSensitivity:89,speakerBasis:'power'});
});

test('ranges, multiple ohmic values, and mixed sensitivity bases are not silently selected',()=>{
  const range=parseSpeakerSpecText('Nominal impedance: 4–8 Ω\nSensitivity 91 dB');
  assert.equal(range.fields.speakerLoad,undefined);
  assert.equal(range.fields.speakerSensitivity,undefined);
  const multiple=parseSpeakerSpecText('Nominal impedance: 8Ω / 4Ω');
  assert.equal(multiple.fields.speakerLoad,undefined);
  const mixed=parseSpeakerSpecText('Nominal impedance: 8Ω\nSensitivity 91 dB @ 1 W / 2.83 V / 1m');
  assert.equal(mixed.fields.speakerSensitivity,undefined);
  assert.equal(mixed.fields.speakerLoad,8);
});

test('conflicting repeated nominal ratings block matching, not merely the second rating',()=>{
  const parsed=parseSpeakerSpecText('Nominal impedance 8Ω\nNominal impedance 4Ω\nMinimum impedance 2.8Ω');
  assert.equal(parsed.fields.speakerLoad,undefined);
  assert.equal(parsed.fields.speakerMinimum,undefined);
  assert.match(parsed.notes.join(' '),/Conflicting impedance/);
});


test('user-reported full speaker description feeds provisional nominal, minimum, sensitivity and suggested power range',()=>{
  const paste=[
    '• Design: 2-driver, 2-way bass reflex bookshelf/stand-mounted speaker',
    '• Tweeter: 19 mm (3/4 in) polyamide dome with ferro-fluid cooling (often Vifa-sourced on v1 models)',
    '• Mid/Bass Driver: 165 mm (6.5 in) polypropylene cone with Apical voice coil former and diecast chassis',
    '• Crossover: 2nd-order electro-acoustic at 3.0 kHz',
    '• Frequency Response (On-Axis): ±2 dB from 75 Hz – 20 kHz',
    '• Frequency Response (30° Off-Axis): ±2 dB from 75 Hz – 15 kHz',
    '• Low-Frequency Extension: 55 Hz (DIN)',
    '• Sensitivity: 90 dB (in-room) / 87 dB (anechoic)',
    '• Impedance: Compatible with 8 ohms (measured around 4.2 ohms minimum)',
    '• Recommended Amplifier Power: 15 – 100 watts (maximum input power listed at 60 watts on spec sheets)'
  ].join('\n');
  const parsed=parseSpeakerSpecText(paste);
  assert.deepEqual(parsed.fields,{
    speakerLoad:8,speakerMinimum:4.2,speakerSensitivity:90,
    speakerSensitivityEnvironment:'in_room',speakerAnechoic:87,
    speakerRecommendedAmpMin:15,speakerRecommendedAmpMax:100,speakerMaxInput:60
  });
  assert.match(parsed.observations.join(' '),/8 Ω described as compatible/);
  assert.match(parsed.observations.join(' '),/90 dB \(in-room\).*87 dB \(anechoic\)/);
  assert.match(parsed.observations.join(' '),/around 4.2 Ω is approximate/);
  assert.match(parsed.observations.join(' '),/15–100 W/);
  assert.match(parsed.observations.join(' '),/60 W/);
});

test('other compatible-with wording provisionally supplies nominal load with notes',()=>{
  const parsed=parseSpeakerSpecText('Impedance: 8Ω compatible, measured around 3.6Ω minimum\nSensitivity 89 dB in room');
  assert.deepEqual(parsed.fields,{speakerLoad:8,speakerMinimum:3.6,
    speakerSensitivity:89,speakerSensitivityEnvironment:'in_room'});
  assert.match(parsed.observations.join(' '),/8 Ω described as compatible/);
  assert.equal(parsed.fields.speakerBasis,undefined);
});

test('explicit nominal in a separate manufacturer row remains available alongside compatible context',()=>{
  const parsed=parseSpeakerSpecText('Nominal impedance: 8Ω\nImpedance: compatible with 8 ohms (minimum: 4Ω)');
  assert.equal(parsed.fields.speakerLoad,8);
  assert.match(parsed.observations.join(' '),/8 Ω described as compatible/);
});

test('a partially documented speaker can be shortlisted with unknown sensitivity basis',()=>{
  const data=new FormData();
  data.set('speakerOther','Example Passive Bookshelf');
  data.set('speakerPowerType','passive');
  data.set('speakerSpecUrl','https://example.com/manual');
  data.set('speakerLoad','8');
  data.set('speakerMinimum','4.2');
  data.set('speakerSensitivity','90');
  data.set('speakerSensitivityEnvironment','in_room');
  data.set('speakerAnechoic','87');
  data.set('speakerBasis','');
  data.set('speakerRecommendedAmpMin','15');
  data.set('speakerRecommendedAmpMax','100');
  data.set('speakerMaxInput','60');
  const result=unlistedSpecAssessment('speaker',data,{requireForMatch:true});
  assert.equal(result.state,'provisional');
  assert.equal(result.record.values.load,8);
  assert.equal(result.record.values.minimum,4.2);
  assert.equal(result.record.values.sensitivity,90);
  assert.equal(result.record.values.reportedSensitivity,90);
  assert.equal(result.record.values.anechoicReferenceDb,87);
  assert.equal(result.record.values.basis,'voltage');
  assert.equal(result.record.values.basisAssumed,true);
  assert.equal(result.record.values.sensitivityEnvironment,'in_room');
  assert.equal(result.record.values.roomAdjustmentAlreadyIncluded,true);
  assert.equal(result.record.values.recommendedAmpMinW,15);
  assert.equal(result.record.values.recommendedAmpMaxW,100);
  assert.equal(result.record.values.listedMaxInputW,60);
  assert.equal(validateBuilderIntent('amp_for_speakers',data).ok,true);
});
test('incorrect speaker recommended amplifier range remains unaccepted',()=>{
  const data=new FormData();
  data.set('speakerOther','Test');
  data.set('speakerSpecUrl','https://example.com/spec');
  data.set('speakerLoad','8');
  data.set('speakerRecommendedAmpMin','100');
  data.set('speakerRecommendedAmpMax','15');
  assert.equal(unlistedSpecAssessment('speaker',data).state,'incomplete');
});
test('compatibility alone is not a guarantee when two opposing nominal claims conflict',()=>{
  const result=parseSpeakerSpecText('Nominal impedance 4Ω\nNominal impedance 8Ω\nImpedance compatible with 8 ohms');
  assert.equal(result.fields.speakerLoad,undefined);
  assert.match(result.notes.join(' '),/Conflicting impedance/);
});

test('8-ohm in-room rating is used as primary with no duplicate room gain while anechoic remains a reference',()=>{
  const data=new FormData();
  data.set('speakerOther','Room Example');
  data.set('speakerSpecUrl','https://example.com/speaker');
  data.set('speakerLoad','8');
  data.set('speakerSensitivity','90');
  data.set('speakerSensitivityEnvironment','in_room');
  data.set('speakerAnechoic','87');
  const result=unlistedSpecAssessment('speaker',data);
  assert.equal(result.state,'provisional');
  assert.equal(result.record.values.sensitivity,90);
  assert.equal(result.record.values.anechoicReferenceDb,87);
  assert.equal(result.record.values.roomAdjustmentAlreadyIncluded,true);
  assert.equal(result.record.values.basis,'voltage');
  assert.equal(result.record.values.basisAssumed,true);
  assert.match(result.message,/8 Ω/);
});
test('missing electrical reference on non-8-ohm speaker does not silently assume the same wattage',()=>{
  const data=new FormData();
  data.set('speakerOther','Four-ohm Example');
  data.set('speakerSpecUrl','https://example.com/speaker');
  data.set('speakerLoad','4');
  data.set('speakerSensitivity','90');
  data.set('speakerSensitivityEnvironment','in_room');
  const result=unlistedSpecAssessment('speaker',data);
  assert.equal(result.state,'provisional');
  assert.equal(result.record.values.sensitivity,null);
  assert.equal(result.record.values.reportedSensitivity,90);
  assert.equal(result.record.values.roomAdjustmentAlreadyIncluded,true);
});
test('standalone anechoic sensitivity stays available when no in-room figure was provided',()=>{
  const parsed=parseSpeakerSpecText('Nominal impedance: 8 ohms\nSensitivity: 87 dB (anechoic)');
  assert.deepEqual(parsed.fields,{
    speakerLoad:8,speakerSensitivity:87,speakerSensitivityEnvironment:'anechoic',speakerAnechoic:87
  });
});
