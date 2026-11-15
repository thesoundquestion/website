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
 assert.doesNotMatch(html,/<script[^>]+src=|<audio[^>]+src=|<source[^>]+src=/i);
});
test('master audio is hosted offsite while raw source stems remain private',()=>{
 assert.match(html,/tsq-lab-audio\.thesoundquestion\.workers\.dev/);
 for(const p of ['labs/index.html','index.html']) assert.doesNotMatch(read(p),/https?:\/\/[^"' ]+\.(?:wav|flac|mp3)(?:[?"'])/i);
 for(const sound of ['dynamic','moderate','brickwalled','matched-dynamic','matched-moderate','matched-brickwalled','eq-off','eq-on']) assert.ok(html.includes('/mastering/'+sound+'.flac'),sound);
 assert.ok(existsSync(path.join(root,'labs','index.html')));
 assert.match(read('library/behind-the-experiments/index.html'),/Why playback can change the sense of space/);
});
