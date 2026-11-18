import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const manifest=JSON.parse(read('assets/audio/formats/manifest.json'));
const client=read('assets/abx-lab.js');
const server=read('workers/abx/index.mjs');
const sourceKeys=text=>new Set([...text.matchAll(/'((?:mix|master|formats)-[a-z0-9-]+-v[1-9][0-9]*)':/g)].map(x=>x[1]));

test('a common, versioned catalogue prevents scores from merging across audio revisions',()=>{
 const front=sourceKeys(client),back=sourceKeys(server);
 assert.equal(front.size,9,'Expected nine current Training comparisons');
 assert.equal(back.size,7,'Only seven scoring candidates; exaggerated mixing stays Training-only');
 for(const key of back)assert.ok(front.has(key),key+' missing in front-end');
 assert.ok(front.has('mix-narrow-reference-v1'));
 assert.ok(front.has('mix-reference-creative-v1'));
 assert.match(server,/\/-v\[1-9\]\[0-9\]\*\$\/\.test\(data\.testId\)/);
 assert.match(server,/const VALIDATED=new Map\(\[/,'Scored comparisons require explicit curated release eligibility');
 assert.match(server,/ABX_PUBLIC_ENABLED/,'Server must also require an explicit deployment toggle');
});

test('format variant hashes, sample alignment and level differences match the approved source manifest',()=>{
 const gains=[];
 for(const [song,entry] of Object.entries(manifest.sources)){
  assert.match(entry.source_sha256,/^[a-f0-9]{64}$/);
  assert.equal(entry.lossless.sample_rate,44100);
  assert.equal(entry.lossless.channels,2);
  for(const [rate,v] of Object.entries(entry.variants)){
   const file=path.join(root,v.path.slice(1));
   const bytes=readFileSync(file);
   assert.equal(statSync(file).size,v.bytes);
   assert.equal(createHash('sha256').update(bytes).digest('hex'),v.sha256);
   assert.equal(v.frames,entry.lossless.frames,'Source and derived audio must have matching decoded sample count');
   assert.equal(v.alignment.samples,0,'Codec comparisons require the documented zero-sample offset');
   assert.equal(v.sample_rate,entry.lossless.sample_rate);
   assert.equal(v.channels,entry.lossless.channels);
   assert.equal(v.bit_rate,Number(rate)*1000);
   const delta=v.rms_dbfs-entry.lossless.rms_dbfs;
   assert.ok(Math.abs(delta-v.rms_difference_db)<0.002,song+rate+' RMS discrepancy');
   const id='formats-'+song+'-'+rate+'-v1';
   assert.ok(client.includes("'"+id+"':"),id);
   if(rate==='128'){
    assert.ok(delta<-.4&&delta>-.47,'128 kbps decoded level differs materially from original');
    gains.push(10**(delta/20));
   }else{
    assert.ok(Math.abs(delta)<.005,'320 kbps variant has unexpected level offset');
   }
  }
 }
 // Training gain correction affects playback only. For scored ABX the audio
 // itself must be newly validated, not merely adjusted in an exposed player.
 for(const gain of gains)assert.ok(Math.abs(gain-.951)<.001,'Playback gain coefficient requires review');
 assert.match(client,/0\.951/);
 assert.match(client,/\/-128-v\[1-9\]\[0-9\]\*\$\/\.test\(testId\)/);
});

test('never conflate sighted demonstrations with scored ABX validity',()=>{
 assert.match(client,/deliberately unequal-volume masters are excluded from ABX/);
 assert.doesNotMatch(server,/\/mastering\/(?:brickwalled|moderate)\.flac/);
 assert.match(server,/not a cheat-proof ABX channel/i);
 assert.doesNotMatch(client,/personal best leaderboard|certified hearing/i);
});
