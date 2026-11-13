import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  EXCERPT_SECONDS,syntheticMusicSample,masteringSamples,sampledStats,
  quantizePcmSample,bitDepthSamples,audioEditorPath
} from '../assets/music-waveform-comparisons.mjs';

const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const mastering=read('../decoder/mastering-dynamic-range/index.html');
const bitDepth=read('../decoder/bit-depth/index.html');
const masteringCss=read('../assets/mastering-dynamic-range.css');
const bitsCss=read('../assets/bit-depth.css');

test('music-like source is synthetic, deterministic and finite over complete phrase',()=>{
  assert.equal(EXCERPT_SECONDS,4.8);
  for(const i of [0,1,1000,24000,40000,57599]){
    const time=i/12000;
    const a=syntheticMusicSample(time);
    assert.ok(Number.isFinite(a),String(time));
    assert.equal(syntheticMusicSample(time),a);
  }
});

test('three masterings retain identical excerpt length and fixed maximum peak for same-setting view',()=>{
  const types=['dynamic','moderate','limited'];
  const buffers=types.map(type=>masteringSamples(type,'peak'));
  assert.equal(buffers[0].length,Math.round(EXCERPT_SECONDS*12000));
  for(const samples of buffers){
    assert.equal(samples.length,buffers[0].length);
    const stats=sampledStats(samples);
    assert.ok(Math.abs(stats.samplePeak-0.95)<1e-9,String(stats.samplePeak));
    assert.ok(Number.isFinite(stats.rms));
    assert.ok(stats.peakAboveAverageDb>0);
  }
  assert.ok(buffers.some((x,i)=>i>0&&x.some((v,j)=>v!==buffers[0][j])));
});

test('limiting moves average signal closer to the peaks while retaining the same sample peak',()=>{
  const a=sampledStats(masteringSamples('dynamic','peak'));
  const b=sampledStats(masteringSamples('moderate','peak'));
  const c=sampledStats(masteringSamples('limited','peak'));
  assert.ok(b.rms>a.rms,JSON.stringify({a,b,c}));
  assert.ok(c.rms>b.rms,JSON.stringify({a,b,c}));
  assert.ok(a.peakAboveAverageDb>b.peakAboveAverageDb);
  assert.ok(b.peakAboveAverageDb>c.peakAboveAverageDb);
});

test('equal-average illustrative listening comparison preserves bigger dynamic peaks',()=>{
  const a=sampledStats(masteringSamples('dynamic','level'));
  const b=sampledStats(masteringSamples('moderate','level'));
  const c=sampledStats(masteringSamples('limited','level'));
  assert.ok(Math.abs(a.rms-b.rms)<1e-12);
  assert.ok(Math.abs(b.rms-c.rms)<1e-12);
  assert.ok(a.samplePeak>b.samplePeak);
  assert.ok(b.samplePeak>c.samplePeak);
});

test('8/16/24-bit files use the exact same master with progressively finer numerical rounding',()=>{
  const original=masteringSamples('dynamic','peak');
  const means=[];
  for(const bits of [8,16,24]){
    const samples=bitDepthSamples(bits);
    assert.equal(samples.length,original.length);
    let error=0;
    for(let i=0;i<original.length;i+=25){
      assert.equal(samples[i],quantizePcmSample(original[i],bits));
      error+=Math.abs(original[i]-samples[i]);
    }
    means.push(error);
  }
  assert.ok(means[0]>means[1]*25,means.join(', '));
  assert.ok(means[1]>means[2]*25,means.join(', '));
  assert.notEqual(quantizePcmSample(0.12345,8),quantizePcmSample(0.12345,16));
  assert.throws(()=>quantizePcmSample(0.1,12),/Unsupported/);
});

test('audio-editor paths contain real per-bin min/max strokes with one common view scale',()=>{
  const a=audioEditorPath(masteringSamples('dynamic','peak'));
  const b=audioEditorPath(masteringSamples('dynamic','peak'));
  assert.equal(a,b);
  assert.equal((a.match(/M/g)||[]).length,420);
  assert.ok(!/NaN|Infinity/.test(a));
  const small=audioEditorPath(bitDepthSamples(8),{bins:380});
  assert.equal((small.match(/M/g)||[]).length,380);
  assert.throws(()=>audioEditorPath([],{}),/Invalid/);
});

test('mastering lesson shows same musical phrase in three separate DAW waveform rows, novice-first',()=>{
  assert.match(mastering,/data-music-mastering/);
  for(const kind of ['dynamic','moderate','limited'])
    assert.match(mastering,new RegExp('data-music-master="'+kind+'"'));
  assert.equal((mastering.match(/data-music-wave/g)||[]).length,3);
  assert.match(mastering,/Same stereo volume setting/);
  assert.match(mastering,/Adjust them to sound similarly loud/);
  assert.match(mastering,/Why would the dynamic version seem quieter/);
  assert.match(mastering,/Turning up didn't invent that contrast/);
  assert.match(mastering,/not a measured perceived-loudness \(LUFS\) match/);
  assert.match(mastering,/href="\/decoder\/mixing-soundstage\/#track-dynamics"/);
  assert.match(mastering,/music-waveform-comparisons\.mjs/);
  assert.match(masteringCss,/ma-editor-row/);
  assert.match(masteringCss,/ma-editor-controls button:focus-visible/);
});

test('bit-depth lesson fixes confounded 16-bit dynamic versus 24-bit limited graphic',()=>{
  assert.match(bitDepth,/data-music-bitdepth/);
  for(const bits of [8,16,24])
    assert.match(bitDepth,new RegExp('data-music-bit-depth="'+bits+'"'));
  assert.equal((bitDepth.match(/data-music-wave/g)||[]).length,3);
  assert.match(bitDepth,/the exact same invented performance and the same master/);
  assert.match(bitDepth,/look almost identical/);
  assert.doesNotMatch(bitDepth,/16-bit · expressive master/);
  assert.doesNotMatch(bitDepth,/24-bit · heavily limited master/);
  assert.match(bitDepth,/href="\/decoder\/mastering-dynamic-range\/#same-recording"/);
  assert.match(bitDepth,/music-waveform-comparisons\.mjs/);
  assert.match(bitsCss,/bd-editor-row/);
  assert.match(bitsCss,/@media\(max-width:650px\)/);
});
