import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseSpeakerSpecText} from '../system-builder/spec-paste.mjs';

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
