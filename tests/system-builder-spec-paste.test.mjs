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
test('unqualified sensitivity, generic impedance, and peak wattage cannot turn into fit data',()=>{
  const result=parseSpeakerSpecText('Impedance: 8 Ω\nSensitivity: 91 dB\n500 W peak/music power');
  assert.deepEqual(result.fields,{});
  assert.match(result.notes.join(' '),/Sensitivity was not filled/);
});
test('conflicting ratings or a minimum above nominal cannot be accepted',()=>{
  const result=parseSpeakerSpecText('Nominal impedance: 8 Ω\nNominal impedance: 4 Ω\nMinimum impedance: 12 Ω\nSensitivity: 86 dB (2.83 V / 1 m)');
  assert.equal(result.fields.speakerLoad,undefined);
  assert.equal(result.fields.speakerMinimum,12,'without a unique nominal the minimum is provisional and must be reviewed');
  assert.equal(result.fields.speakerSensitivity,86);
  assert.match(result.notes.join(' '),/Conflicting nominal/);
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
