import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const engineScript = readFileSync(new URL('../assets/format-comparison-engine.js', import.meta.url), 'utf8');
function setup({ badStatus = false, failDecode = false, oversizedDownload = false, oversizedDecoded = false } = {}) {
  const connections = [];
  const starts = [];
  const stops = [];
  const fetches = [];
  let ctx;
  class FakeParam {
    constructor() { this.value = 0; this.events = []; }
    setValueAtTime(value, time) { this.value = value; this.events.push(['set', value, time]); }
    linearRampToValueAtTime(value, time) { this.value = value; this.events.push(['ramp', value, time]); }
    cancelAndHoldAtTime(time) { this.events.push(['cancel', time]); }
  }
  class FakeSource {
    constructor() { this.buffer = null; this.onended = null; this.stopped = false; }
    connect(node) { connections.push([this, node]); }
    disconnect() {}
    start(when, offset, length) { starts.push({ source: this, when, offset, length }); }
    stop() { this.stopped = true; stops.push(this); }
  }
  class FakeGain {
    constructor() { this.gain = new FakeParam(); }
    connect(node) { connections.push([this, node]); }
    disconnect() {}
  }
  class FakeAudioContext {
    constructor() { this.state = 'suspended'; this.currentTime = 1; this.destination = {}; ctx = this; }
    resume() { this.state = 'running'; return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
    createBufferSource() { return new FakeSource(); }
    createGain() { return new FakeGain(); }
    decodeAudioData(bytes) {
      if (failDecode) return Promise.reject(new Error('Unsupported FLAC'));
      assert.equal(bytes.byteLength, oversizedDownload ? 15 * 1024 * 1024 : 8);
      return Promise.resolve({ numberOfChannels: 2, length: oversizedDecoded ? 6 * 1024 * 1024 : 30 * 44100, duration: 30 });
    }
  }
  const urls = { duration: 30, lossless: 'https://audio.example/track.flac', '128': '/track-128.mp3', '320': '/track-320.mp3' };
  const volumes = { lossless: .95, '128': 1, '320': .95 };
  const window = { AudioContext: FakeAudioContext, fetch: () => {} };
  const fetch = async (url, options) => {
    fetches.push({url, signal:options.signal});
    return { ok: !badStatus, status: badStatus ? 403 : 200, arrayBuffer: async()=>new ArrayBuffer(oversizedDownload ? 15 * 1024 * 1024 : 8) };
  };
  runInNewContext(engineScript, { window, fetch, AbortController, console });
  const engine = new window.TSQFormatBuffers();
  return { engine, ctx:()=>ctx, urls, volumes, starts, stops, fetches };
}

test('three formats fully decode, then start simultaneously on one context clock and offset', async()=>{
  const {engine,ctx,urls,volumes,starts,fetches} = setup();
  assert.equal(await engine.prepare('light',urls,volumes),true);
  assert.equal(engine.isReady(),true);
  assert.equal(fetches.length,3);
  assert.equal(ctx().state,'running');
  engine.select('lossless');
  assert.equal(engine.play(),true);
  assert.equal(starts.length,3);
  assert.equal(new Set(starts.map(x=>x.when)).size,1);
  assert.equal(new Set(starts.map(x=>x.offset)).size,1);
  assert.equal(starts[0].offset,0);
  engine.dispose();
});

test('rapid format switching never replaces, reloads, seeks or stops any source',async()=>{
  const {engine,ctx,urls,volumes,starts,stops,fetches} = setup();
  await engine.prepare('light',urls,volumes);
  engine.play();
  ctx().currentTime += 3.5;
  const startCount=starts.length,stopCount=stops.length,fetchCount=fetches.length;
  const pos=engine.position();
  engine.select('128');
  engine.select('320');
  engine.select('lossless');
  assert.equal(starts.length,startCount);
  assert.equal(stops.length,stopCount);
  assert.equal(fetches.length,fetchCount);
  assert.equal(engine.position(),pos);
  assert.equal(engine.debug().sources,3);
  assert.equal(engine.debug().format,'lossless');
  engine.pause();
  assert.equal(engine.isPlaying(),false);
  assert.equal(engine.position(),pos);
  engine.dispose();
});

test('seek and pause preserve a common offset on all three sources',async()=>{
  const {engine,urls,volumes,starts,ctx} = setup();
  await engine.prepare('light',urls,volumes);
  engine.play();
  ctx().currentTime += 7;
  engine.seek(14.25);
  assert.equal(engine.isPlaying(),true);
  assert.deepEqual(starts.slice(-3).map(x=>x.offset),[14.25,14.25,14.25]);
  ctx().currentTime += 1.25;
  // Starts are scheduled 25 ms ahead to keep all three sources on one
  // precise clock tick. Simulated time here has advanced 1.25 s, but audio
  // playback has advanced 1.225 s. This is deliberate, not a lost seek.
  const expected=14.25 + 1.25 - 0.025;
  assert.ok(Math.abs(engine.position()-expected)<.001);
  engine.pause();
  assert.ok(Math.abs(engine.position()-expected)<.001);
  engine.play();
  assert.ok(starts.slice(-3).every(x=>Math.abs(x.offset-expected)<.001));
  engine.dispose();
});

test('clearing aborts pending requests and empties decoded audio',async()=>{
  const {engine,urls,volumes,fetches} = setup();
  const ok=await engine.prepare('light',urls,volumes);
  assert.equal(ok,true);
  engine.clear();
  assert.equal(engine.isReady(),false);
  assert.equal(engine.isPlaying(),false);
  assert.equal(engine.position(),0);
  assert.equal(fetches.length,3);
  engine.dispose();
});

test('failed network or FLAC decode rejects cleanly for native playback fallback',async()=>{
  for (const options of [{badStatus:true},{failDecode:true}]) {
    const {engine,urls,volumes}=setup(options);
    await assert.rejects(engine.prepare('light',urls,volumes));
    engine.clear();
    assert.equal(engine.isReady(),false);
    engine.dispose();
  }
});

test('download and decoded PCM byte budgets fail closed', async () => {
  for (const option of [{ oversizedDownload: true }, { oversizedDecoded: true }]) {
    const { engine, urls, volumes } = setup(option);
    await assert.rejects(engine.prepare('light', urls, volumes), /Too much audio|Decoded audio exceeds/);
    engine.clear();
    assert.equal(engine.isReady(), false);
    engine.dispose();
  }
  assert.match(engineScript, /MAX_DOWNLOAD_BYTES = 14 \* 1024 \* 1024/);
  assert.match(engineScript, /MAX_DECODED_BYTES = 48 \* 1024 \* 1024/);
});

test('ABX reuses its identical third recording without duplicate downloads or decoded PCM', async () => {
  const {engine,urls,volumes,starts,fetches,ctx,stops} = setup();
  // The ABX player represents its B recording in both switching slots.
  urls['320'] = urls['128'];
  assert.equal(await engine.prepare('master-eq-v1',urls,volumes),true);
  assert.equal(fetches.length,2,'A and B should each be fetched only once');
  engine.select('lossless');
  engine.play();
  assert.equal(starts.length,3,'three gain slots keep the generic interface');
  assert.equal(starts[1].source.buffer, starts[2].source.buffer,
    'B and its duplicate slot share exactly the same decoded AudioBuffer');
  const initialStarts=starts.length,initialStops=stops.length;
  ctx().currentTime += 2;
  const at=engine.position();
  engine.select('128');
  engine.select('lossless');
  engine.select('128');
  assert.equal(fetches.length,2,'switching must not fetch recordings again');
  assert.equal(starts.length,initialStarts,'switching must not restart audio');
  assert.equal(stops.length,initialStops,'switching must not stop audio');
  assert.equal(engine.position(),at,'switching must preserve playback position');
  engine.dispose();
});
