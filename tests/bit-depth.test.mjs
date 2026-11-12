import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { storedLevel, peakCodeSteps, signalAt } from '../assets/bit-depth.mjs';

const html = readFileSync(new URL('../decoder/bit-depth/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../assets/bit-depth.css', import.meta.url), 'utf8');
const tutor = JSON.parse(readFileSync(new URL('../assets/lesson-tutor/approved-answers.json', import.meta.url),'utf8'))['bit-depth'];

test('signed PCM quantization uses the correct number of integer codes with symmetric zero',()=>{
  assert.deepEqual(storedLevel(0,8),{code:0,normalized:0});
  assert.deepEqual(storedLevel(1,8),{code:127,normalized:127/128});
  assert.deepEqual(storedLevel(-1,8),{code:-128,normalized:-1});
  assert.deepEqual(storedLevel(.25,8),{code:32,normalized:.25});
  assert.deepEqual(storedLevel(.00001,16),{code:0,normalized:0});
  assert.equal(storedLevel(.00001,24).code,84);
  assert.throws(()=>storedLevel(NaN,16),RangeError);
});
test('more bits provide finer relative level spacing while keeping sample positions',()=>{
 for(const v of [-.83,-.58,-.13,.10,.21,.77]){
   const error8=Math.abs(storedLevel(v,8).normalized-v);
   const error16=Math.abs(storedLevel(v,16).normalized-v);
   assert.ok(error8 <= 1/128 + 1e-10);
   assert.ok(error16 <= 1/32768 + 1e-10);
 }
 assert.ok(Number.isFinite(signalAt(.5)));
});
test('quiet amplitude examples have correct near-zero magnitudes and 24-bit advantage',()=>{
 assert.ok(Math.abs(peakCodeSteps(16,-90)-1.036)<.02);
 assert.ok(Math.abs(peakCodeSteps(24,-90)-265.27)<.3);
 assert.ok(peakCodeSteps(8,-90)<.01);
 assert.ok(peakCodeSteps(8,-110)<.001);
 assert.throws(()=>peakCodeSteps(16,3),RangeError);
});
test('lesson has two functioning exercises, preserves old anchors and readable no-script help',()=>{
 for(const anchor of ['decode-the-spec','compare','understand','dither','listening','buying']){
   assert.match(html,new RegExp('id="'+anchor+'"'));
 }
 for(const sign of ['data-bd-simple','data-bd-quiet','data-bd-simple-stage','data-bd-quiet-stage','data-bd-volume', 'data-bd-quiet-steps']){
   assert.ok(html.includes(sign.replace('data-bd-volume','id="bd-volume"')),sign);
 }
 assert.match(html,/<noscript>/);
 assert.match(html,/data-lesson-plot="bit-depth"/);
 assert.match(html,/\/assets\/bit-depth\.mjs/);
 assert.ok(!html.includes('bd-track'));
 assert.ok(!html.includes('More bits create finer level steps, not extra musical notes.'));
 assert.match(css,/prefers-reduced-motion/);
});
test('tutor grounding matches the new quiet-audio experiment',()=>{
 assert.equal(tutor.plots['bit-depth'].section,'understand');
 assert.match(tutor.plots['bit-depth'].reading,/magnified/);
 assert.ok(tutor.sections.includes('dynamics'));
});
