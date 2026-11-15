import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const html=read('lab/mastering/index.html');
test('complete Mastering Lab is included as local-only interactive preview',()=>{
 for(const needle of ['Three very different masters','id="chooseFiles"','id="chooseFolder"','data-tab','id="playerAudio"','ABX','The loudness progression']){
  assert.ok(html.includes(needle),needle);
 }
 assert.match(html,/href="\/labs\/"/);
 assert.match(html,/href="\/labs\/#recordings"/);
 assert.match(html,/name="robots" content="noindex,nofollow"/);
 assert.doesNotMatch(html,/<script[^>]+src=|<audio[^>]+src=|<source[^>]+src=/i);
});
test('preview keeps source audio off the public website and separates personal testimony from evidence',()=>{
 for(const p of ['lab/mastering/index.html','labs/index.html','lab/index.html','index.html']){
  assert.doesNotMatch(read(p),/https?:\/\/[^"' ]+\.(?:wav|flac|mp3)(?:[?"'])/i);
 }
 assert.ok(existsSync(path.join(root,'labs','index.html')));
 assert.match(read('library/behind-the-experiments/index.html'),/Why playback can change the sense of space/);
});
