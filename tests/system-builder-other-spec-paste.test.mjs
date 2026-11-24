import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseAmpSpecText,parseSourceSpecText,parseHeadphoneSpecText} from '../system-builder/other-gear-spec-paste.mjs';
import {unlistedSpecAssessment} from '../system-builder/unlisted-gear.mjs';
import {validateBuilderIntent,builderFieldRequirement} from '../system-builder/intent-routing.mjs';

test('receiver rated watts and permitted speaker load are recognised independently',()=>{
  const result=parseAmpSpecText('Speaker impedance: 4–16 ohms\nRated power output: 85 W per channel at 8 ohms (20 Hz-20 kHz, 0.07% THD)');
  assert.deepEqual(result.fields,{ampMinLoad:4,ampRatedWatts:85,ampRatedLoad:8});
});
test('amplifier test load is never assumed to prove lower supported speaker loads',()=>{
  const parsed=parseAmpSpecText('Rated stereo power: 100 W/channel into 8 Ω');
  assert.deepEqual(parsed.fields,{ampRatedWatts:100,ampRatedLoad:8});
  assert.match(parsed.observations.join(' '),/does not confirm the minimum permitted speaker impedance/);
  const form=new FormData();
  form.set('ampOther','Unlisted stereo receiver');
  form.set('ampRatedWatts','100');
  form.set('ampRatedLoad','8');
  const result=unlistedSpecAssessment('amp',form);
  assert.equal(result.state,'provisional');
  assert.equal(result.record.userNominalFloor,8);
  assert.equal(result.record.values.permittedFloorUnknown,true);
  assert.equal(result.record.url,null);
  assert.equal(validateBuilderIntent('speakers_for_amp',form).ok,true);
  assert.equal(builderFieldRequirement('speakers_for_amp','ampMinLoad'),'optional');
});
test('peak, music and electrical consumption numbers never fill amplifier continuous watts',()=>{
  const parsed=parseAmpSpecText('Power consumption: 360 W\nDynamic peak power output: 180 W at 4 Ω\nMusic power: 400 W\nSpeaker impedance: 6–16 ohms');
  assert.deepEqual(parsed.fields,{ampMinLoad:6});
});
test('headphone impedance, dB per milliwatt and dB per volt are distinguished',()=>{
  assert.deepEqual(parseHeadphoneSpecText('Headphone nominal impedance: 32 Ω\nSensitivity: 98 dB SPL / mW').fields,
    {headphoneLoad:32,headphoneSensitivity:98,headphoneBasis:'power'});
  assert.deepEqual(parseHeadphoneSpecText('Impedance: 80 ohms\nSensitivity: 108 dB / V').fields,
    {headphoneLoad:80,headphoneSensitivity:108,headphoneBasis:'voltage'});
});
test('headphone sensitivity missing basis no longer blocks a basic provisional match',()=>{
  const parsed=parseHeadphoneSpecText('Nominal impedance: 250 Ω\nSensitivity: 96 dB');
  assert.deepEqual(parsed.fields,{headphoneLoad:250,headphoneSensitivity:96});
  const data=new FormData();
  data.set('headphoneOther','Unlisted 250-ohm headphones');
  data.set('headphoneLoad','250');
  data.set('headphoneSensitivity','96');
  const result=unlistedSpecAssessment('headphone',data);
  assert.equal(result.state,'provisional');
  assert.equal(result.record.values.sensitivity,null);
  assert.equal(result.record.values.reportedSensitivity,96);
  assert.match(result.message,/no drive-level estimate/);
});
test('source output recognises actual output but not input sockets',()=>{
  assert.deepEqual(parseSourceSpecText('Audio output: RCA stereo L/R\nDigital inputs: USB, optical').fields,
    {sourceOutput:'RCA'});
  const multiple=parseSourceSpecText('Digital output: optical TOSLINK\nAnalogue output: RCA');
  assert.deepEqual(multiple.fields,{});
  assert.match(multiple.observations.join(' '),/Several outputs found: optical, RCA/);
  const inputOnly=parseSourceSpecText('Digital inputs: USB, coaxial');
  assert.deepEqual(inputOnly.fields,{});
});
test('unlisted source can be provisionally connected without manufacturer URL',()=>{
  const data=new FormData();
  data.set('sourceOther','Unlisted DAC');
  data.set('sourceOutput','RCA');
  const result=unlistedSpecAssessment('source',data);
  assert.equal(result.state,'provisional');
  assert.equal(result.record.values.sourceConnection,'RCA');
  assert.equal(result.record.sourceStatus,'missing');
});
test('the same visible paste-and-fill UI exists for every secondary owned-gear type',()=>{
  const html=readFileSync(new URL('../system-builder/index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  for(const kind of ['amp','source','headphone']){
    assert.match(html,new RegExp('id="sb-'+kind+'-spec-paste"'));
    assert.match(html,new RegExp('id="sb-'+kind+'-spec-fill"'));
    assert.match(html,new RegExp('id="sb-'+kind+'-spec-observations"'));
  }
  assert.match(app,/parseUnlistedSpecText\(kind,textarea.value\)/);
  assert.match(app,/if\(String\(input.value\)\.trim\(\)\)/);
});
