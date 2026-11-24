import test from 'node:test';
import assert from 'node:assert/strict';
import {parseSubConnectionText} from '../system-builder/other-gear-spec-paste.mjs';
import {subwooferConnections} from '../system-builder/subwoofer-connection.mjs';
import {readFileSync} from 'node:fs';

test('parses both RCA and high-level subwoofer inputs plus an amplifier sub output',()=>{
  const x=parseSubConnectionText(
    'Receiver: Subwoofer Out (RCA)\nSubwoofer: RCA Line In and High Level Speaker In\n' +
    'Main speakers: no high-pass mentioned');
  assert.deepEqual(x.fields,{subAmpOutput:'sub_rca',subInput:'both'});
  assert.match(x.observations.join(' '),/No bass-relief credit/);
  const routed=subwooferConnections({ampOutput:x.fields.subAmpOutput,subInput:x.fields.subInput});
  assert.equal(routed.kind,'direct_rca');
  assert.equal(routed.direct,true);
  assert.equal(routed.bassStatus,'not_verified');
});
test('recognises stereo preamp output and genuine main-speaker high-pass independently',()=>{
  const x=parseSubConnectionText(
    'Stereo pre-out RCA L/R\nSubwoofer RCA LFE In\nMain speakers high-pass filter at 80 Hz');
  assert.deepEqual(x.fields,{subAmpOutput:'preout_rca',subInput:'rca_line',subHighPass:'documented'});
  const routed=subwooferConnections({ampOutput:x.fields.subAmpOutput,subInput:x.fields.subInput,
    highPass:x.fields.subHighPass});
  assert.equal(routed.kind,'stereo_preout');
  assert.equal(routed.bassStatus,'user_claim_unverified');
});
test('subwoofer crossover knob is not evidence for reducing bass sent to mains',()=>{
  const x=parseSubConnectionText('Subwoofer RCA Line In\nSubwoofer low-pass crossover: 40–160 Hz');
  assert.deepEqual(x.fields,{subInput:'rca_line'});
  assert.match(x.observations.join(' '),/does not prove high-pass/);
});
test('recognises a speaker-output-only amplifier for compatible speaker-level sub connection',()=>{
  const x=parseSubConnectionText('Amplifier: Speaker outputs only\nSubwoofer: High Level Speaker Inputs');
  assert.deepEqual(x.fields,{subAmpOutput:'speaker_only',subInput:'speaker_high'});
  const path=subwooferConnections({ampOutput:x.fields.subAmpOutput,subInput:x.fields.subInput});
  assert.equal(path.kind,'speaker_level');
  assert.match(path.next,/output circuit/);
});
test('conflicts with saved model sockets never display a direct wiring plan',()=>{
  const x=subwooferConnections({ampName:'WiiM Amp',subName:'Edifier T5',
    ampOutput:'speaker_only',subInput:'speaker_high'});
  assert.equal(x.kind,'conflicting_connector_evidence');
  assert.equal(x.direct,false);
  assert.equal(x.verifiedModelPath,false);
  assert.equal(x.wiringStatus,'review');
  assert.match(x.signal,/disagrees with the documented/);
  assert.doesNotMatch(x.title,/Easy RCA/);
});
test('the dedicated subwoofer builder contains a paste-to-fill connection path',()=>{
  const html=readFileSync(new URL('../system-builder/index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  assert.match(html,/id="sb-sub-spec-paste"/);
  assert.match(html,/id="sb-sub-spec-fill"/);
  assert.match(app,/parseUnlistedSpecText\('sub',subPaste.value\)/);
});
