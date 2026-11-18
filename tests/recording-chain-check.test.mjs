import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessRecordingChain} from '../equipment/recording-chain-check.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(readFileSync(resolve(root,'equipment/catalog.generated.json'),'utf8'));
const by=model=>catalog.records.find(x=>x.model===model||x.aliases.includes(model));
const id=model=>by(model).id;
const mic=id('FIFINE K669D'),sm58=id('Shure SM58');

test('the user microphone and M-Track Solo have documented single-microphone capacity',()=>{
  const result=assessRecordingChain(catalog,{captureDeviceId:id('M-Audio M-Track Solo'),microphoneIds:[mic]});
  assert.equal(result.status,'capacity_documented');
  assert.ok(result.checks.some(x=>x.code==='microphone_preamps'&&x.status==='documented_capacity'));
  assert.ok(result.checks.some(x=>x.code==='phantom_48v'&&x.status==='not_required'));
  assert.match(result.disclaimer,/not a guarantee/);
});
test('two microphones exceed the Solo microphone preamp count',()=>{
  const result=assessRecordingChain(catalog,{captureDeviceId:id('M-Audio M-Track Solo'),microphoneIds:[mic,sm58]});
  assert.equal(result.status,'known_limit');
  assert.ok(result.checks.some(x=>x.code==='microphone_preamps'&&x.status==='known_limit'));
});
test('Yamaha MG10XU can sum multiple microphones without individual USB tracks',()=>{
  const opts={captureDeviceId:id('Yamaha MG10XU'),microphoneIds:[mic,sm58,sm58]};
  const mixed=assessRecordingChain(catalog,{...opts,independentTracks:false});
  assert.ok(mixed.checks.some(x=>x.code==='computer_capture_channels'&&x.status==='documented_capacity'));
  assert.ok(!mixed.checks.some(x=>x.code==='isolated_tracks'));
  const separated=assessRecordingChain(catalog,{...opts,independentTracks:true});
  assert.ok(separated.checks.some(x=>x.code==='isolated_tracks'&&x.status==='known_limit'));
});
test('Scarlett stereo inputs do not imply individually verified microphone routing',()=>{
  const result=assessRecordingChain(catalog,{
    captureDeviceId:id('Focusrite Scarlett 2i2 (4th Gen)'),
    microphoneIds:[mic,sm58],independentTracks:true
  });
  assert.equal(result.status,'needs_verification');
  assert.ok(result.checks.some(x=>x.code==='isolated_tracks'&&x.status==='unverified'));
});
test('Zoom multitrack USB mode remains conditional on channel routing and sampling rate',()=>{
  const result=assessRecordingChain(catalog,{
    captureDeviceId:id('Zoom LiveTrak L-12'),microphoneIds:[mic,sm58],independentTracks:true
  });
  assert.ok(result.checks.some(x=>x.code==='isolated_tracks'&&x.status==='unverified'));
  assert.equal(result.requirements.microphoneCount,2);
});
test('phantom power requirements are checked without guessing unknowns',()=>{
  const altered=structuredClone(catalog);
  const condenser=altered.records.find(x=>x.id===mic);
  condenser.facts.requires48v.value=true;
  const result=assessRecordingChain(altered,{captureDeviceId:id('M-Audio M-Track Solo'),microphoneIds:[mic]});
  assert.ok(result.checks.some(x=>x.code==='phantom_48v'&&x.status==='documented_capacity'));
  assert.match(result.checks.find(x=>x.code==='phantom_48v').detail,/Verify group switching/);
});
test('invalid device roles and missing microphones are rejected',()=>{
  assert.throws(()=>assessRecordingChain(catalog,{captureDeviceId:mic,microphoneIds:[mic]}),RangeError);
  assert.throws(()=>assessRecordingChain(catalog,{captureDeviceId:id('M-Audio M-Track Solo'),microphoneIds:[]}),TypeError);
  assert.throws(()=>assessRecordingChain(catalog,{captureDeviceId:id('M-Audio M-Track Solo'),microphoneIds:['missing']}),RangeError);
});
