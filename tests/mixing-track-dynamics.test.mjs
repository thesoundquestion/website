import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {trackWaveLevel,trackWavePath,trackDynamicsDescription}
  from '../assets/mixing-track-dynamics.mjs';

const read = path => readFileSync(new URL(path,import.meta.url),'utf8');
const mixing = read('../decoder/mixing-soundstage/index.html');
const mastering = read('../decoder/mastering-dynamic-range/index.html');
const styles = read('../assets/mixing-soundstage.css');
const tracks=['guitar','bass','snare','cymbals'];
const times=Array.from({length:961},(_,i)=>4.8*i/960);
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const samples=(track,mode)=>times.map(t=>trackWaveLevel(track,t,mode));

test('all four synthetic instrument waveforms are finite, deterministic and normalized',()=>{
  for(const track of tracks){
    for(const mode of ['before','after']){
      const data=samples(track,mode);
      assert.ok(data.every(x=>Number.isFinite(x)&&x>=0&&x<=1),track+' '+mode);
      assert.deepEqual(data,samples(track,mode));
      const path=trackWavePath(track,mode);
      assert.ok(path.length>2000 && path.startsWith('M'));
      assert.ok(!path.includes('NaN')&&!path.includes('Infinity'));
      assert.equal(path,trackWavePath(track,mode));
    }
    assert.throws(()=>trackWavePath(track,'after',7),/Invalid bins/);
  }
});

test('different compression decisions change the selected instruments but leave cymbals untouched',()=>{
  for(const track of ['guitar','bass','snare']){
    assert.notEqual(trackWavePath(track,'before'),trackWavePath(track,'after'));
    assert.ok(mean(samples(track,'after'))>0);
  }
  assert.equal(trackWavePath('cymbals','before'),trackWavePath('cymbals','after'));
  assert.deepEqual(samples('cymbals','before'),samples('cymbals','after'));
});

test('illustrative compression raises quiet guitar and bass body while reducing selected louder hits',()=>{
  for(const track of ['guitar','bass']){
    const raw=samples(track,'before');
    const processed=samples(track,'after');
    assert.ok(mean(processed)>mean(raw),track+' should be steadier overall');
    assert.ok(Math.max(...processed)<Math.max(...raw),track+' loudest transient should be controlled');
  }
  const before=samples('snare','before');
  const after=samples('snare','after');
  assert.ok(Math.max(...after)<Math.max(...before));
});

test('mixing copy explains separate instrument dynamics before mastering jargon',()=>{
  assert.match(mixing,/id="track-dynamics"/);
  assert.match(mixing,/data-mx-track-dynamics/);
  assert.match(mixing,/What does compression mean here/);
  assert.match(mixing,/snare microphone/);
  assert.match(mixing,/overhead microphones/);
  assert.match(mixing,/not perfectly isolated/);
  assert.match(mixing,/same display scale before and after/);
  assert.match(mixing,/generated illustrations/);
  assert.match(mixing,/mixing-track-dynamics\.mjs/);
  assert.match(mixing,/href="#track-dynamics"/);
  for(const track of tracks){
    assert.match(mixing,new RegExp('data-mx-track="'+track+'"'));
    assert.match(mixing,new RegExp('data-mx-track-note="'+track+'"'));
    assert.ok(trackDynamicsDescription(track,'before').length>20);
    assert.ok(trackDynamicsDescription(track,'after').length>20);
  }
  assert.equal((mixing.match(/data-mx-wave-path/g)||[]).length,4);
  assert.equal((mixing.match(/data-mx-dynamics-mode=/g)||[]).length,2);
  assert.match(mixing,/aria-pressed="true"/);
  assert.match(mixing,/aria-live="polite"/);
});

test('mastering lesson cross-links to track-specific dynamics rather than treating all compression as global',()=>{
  assert.match(mastering,/href="\/decoder\/mixing-soundstage\/#track-dynamics"/);
  assert.match(mastering,/bass guitar steady/);
  assert.match(mastering,/combined/);
  assert.match(mixing,/href="\/decoder\/mastering-dynamic-range\/#same-recording"/);
});

test('DAW-style comparison is responsive, has keyboard-focus styling, and is clear about its synthetic origin',()=>{
  assert.match(styles,/mx-dynamics-wave/);
  assert.match(styles,/mx-dynamics-actions button:focus-visible/);
  assert.match(styles,/@media\(max-width:570px\)/);
  assert.match(mixing,/not samples from a commercial recording/);
});
