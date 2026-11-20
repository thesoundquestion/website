import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCreatingSystem} from '../system-builder/creating/build-recommendations.mjs';

const catalog=JSON.parse(readFileSync(new URL('../equipment/catalog.generated.json',import.meta.url),'utf8'));
const stage=(p,key)=>p.stages.find(item=>item.key===key);
const byName=name=>catalog.records.find(x=>x.model===name);

test('two-voice podcast explains the actual XLR route for hybrid Audio-Technica microphones',()=>{
  const plan=buildCreatingSystem(catalog,{mode:'podcast',microphoneCount:2,independentTracks:true});
  assert.equal(plan.settings.route,'xlr');
  assert.equal(stage(plan,'mic').pick.model,'Audio-Technica ATR2100x-USB');
  assert.equal(stage(plan,'capture').pick.model,'M-Audio M-Track Duo');
  assert.equal(stage(plan,'headphones').quantity,2);
  assert.ok(stage(plan,'headphone_distribution'));
  const path=plan.setupGuide.steps.join(' ');
  assert.match(path,/XLR output/);
  assert.match(path,/USB connection is NOT used/);
  assert.match(path,/input 1 and input 2 to separate mono tracks/);
  assert.match(plan.setupGuide.monitoring.join(' '),/one stereo headphone output/);
  assert.match(plan.setupGuide.monitoring.join(' '),/cannot directly monitor separate USB microphones/);
  assert.ok(plan.setupGuide.links.some(l=>l.url.includes('m-audio.com/audio-midi-interfaces/m-track-duo')));
  assert.ok(plan.setupGuide.links.some(l=>l.url.includes('audacityteam.org')));
});

test('requesting two USB microphones cannot silently imply they enter an XLR interface',()=>{
  const plan=buildCreatingSystem(catalog,{mode:'podcast',microphoneCount:2,independentTracks:true,micConnection:'usb'});
  assert.equal(plan.settings.route,'xlr');
  assert.match(plan.setupGuide.steps.join(' '),/switches to the XLR recording route/);
  assert.match(plan.setupGuide.monitoring.join(' '),/separate audio devices/);
});

test('a single USB microphone bypasses a separate mic interface',()=>{
  const plan=buildCreatingSystem(catalog,{mode:'stream',microphoneCount:1,micConnection:'usb'});
  assert.equal(stage(plan,'capture').need,'included');
  assert.match(plan.setupGuide.steps.join(' '),/no separate XLR audio interface is used/);
  assert.doesNotMatch(plan.setupGuide.steps.join(' '),/Connect each .* by its XLR output/);
});

test('XLR-only microphones are not mislabeled as USB microphones',()=>{
  const mic=byName('Shure SM58');
  const plan=buildCreatingSystem(catalog,{mode:'podcast',microphoneCount:2,independentTracks:true,owned:{mic:mic.id}});
  assert.match(plan.setupGuide.steps.join(' '),/Connect each Shure SM58 by its XLR output/);
  assert.doesNotMatch(plan.setupGuide.steps.join(' '),/also offers USB/);
});

test('creator results render a separate explanation and useful external links',()=>{
  const app=readFileSync(new URL('../system-builder/creating/app.mjs',import.meta.url),'utf8');
  assert.match(app,/How will this setup work\?/);
  assert.match(app,/What will people hear in their headphones\?/);
  assert.match(app,/plan\.setupGuide\.links/);
  assert.ok(app.indexOf('How will this setup work?') < app.indexOf("const shopping=append(body,'section','sb-shopping-summary')"));
});
