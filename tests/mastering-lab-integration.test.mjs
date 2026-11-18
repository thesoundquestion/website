import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const html=read('lab/mastering/index.html');
test('complete Mastering Lab includes published streaming examples and optional local files',()=>{
 for(const needle of ['Three very different masters','id="chooseFiles"','id="chooseFolder"','data-tab','id="playerAudio"','ABX','The loudness progression']){
  assert.ok(html.includes(needle),needle);
 }
 assert.match(html,/href="\/labs\/"/);
 assert.match(html,/href="\/labs\/#recordings"/);
 assert.match(html,/name="robots" content="index,follow"/);
 assert.doesNotMatch(html,/<script src="\/assets\/abx-lab\.js" defer><\/script>/);
 assert.match(html,/href="\/labs\/abx\//);
 assert.doesNotMatch(html,/<audio[^>]+src=|<source[^>]+src=/i);
});
test('master audio is hosted offsite while raw source stems remain private',()=>{
 assert.match(html,/tsq-lab-audio\.thesoundquestion\.workers\.dev/);
 for(const p of ['labs/index.html','index.html']) assert.doesNotMatch(read(p),/https?:\/\/[^"' ]+\.(?:wav|flac|mp3)(?:[?"'])/i);
 for(const sound of ['dynamic','moderate','brickwalled','matched-dynamic','matched-moderate','matched-brickwalled','eq-off','eq-on']) assert.ok(html.includes('/mastering/'+sound+'.flac'),sound);
 assert.ok(existsSync(path.join(root,'labs','index.html')));
 assert.match(read('library/behind-the-experiments/index.html'),/Why playback can change the sense of space/);
});

test('Mastering hero displays measured Audacity-style static waveforms without initial audio decoding',()=>{
 for(const kind of ['dynamic','moderate','brickwalled']){
  assert.match(html,new RegExp('<img[^>]+/assets/waveforms/mastering-'+kind+'\\.svg'));
  assert.match(html,new RegExp('href="/assets/waveforms/mastering-'+kind+'\\.svg"'));
 }
 assert.doesNotMatch(html,/function loadWaveformValues|updateHeroWaveforms|new \(window\.AudioContext/);
 assert.doesNotMatch(html,/id="abxPanel"|id="abxToggle"|data-abx-play|function chooseAbxPair/);
 assert.match(html,/<audio id="playerAudio" preload="none"/);
 assert.match(html,/same scale/);
});
