import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const load = file => readFileSync(new URL('../'+file,import.meta.url),'utf8');
const html=load('library/behind-the-experiments/index.html');
const library=load('library/index.html');
const manifest=JSON.parse(load('assets/audio/formats/manifest.json'));
const formats=load('labs/formats/index.html');
const abx=load('assets/abx-lab.js');
const worker=load('workers/abx/index.mjs');
const section = id => {
  const start=html.indexOf('<section class="section section-border" id="'+id+'"');
  assert.ok(start>=0,'Missing evidence section: '+id);
  const next=html.indexOf('<section class="section section-border" id="',start+20);
  return html.slice(start,next>=0?next:undefined);
};

test('the four experiment breakdowns and supporting method/source sections remain available',()=>{
  const ids=[...html.matchAll(/<section class="section section-border" id="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(ids,['mixing','mastering','formats','abx','method','evidence']);
  for(const id of ['mixing','mastering','formats','abx','method','evidence']){
    assert.match(html,new RegExp('href="#'+id+'"'),'On-page evidence navigation: '+id);
  }
  for(const token of ['−42.77 dB','−14.61 dB','−9.68 dB','−20 LUFS','FULL DYNAMIC','MODERATE MASTER','BRICKWALLED']){
    assert.ok(html.includes(token),'Original Mixing/Mastering findings altered: '+token);
  }
  assert.match(html,/not a blinded, representative study/);
});

test('MP3 and FLAC methods reproduce documented source provenance and decoded measurements',()=>{
  const details=section('formats');
  for(const [id,source] of Object.entries(manifest.sources)){
    assert.match(details,new RegExp(source.song));
    assert.match(details,new RegExp(String(source.lossless.seconds).replace('.','\\.').replace(/\\.0$/,'')));
    assert.match(details,/44\.1 kHz/);
    for(const bitrate of ['128','320']){
      const item=source.variants[bitrate];
      const formattedSize=item.bytes.toLocaleString('en-US');
      const delta=(item.rms_difference_db>=0?'+':'−')+Math.abs(item.rms_difference_db).toFixed(4)+' dB';
      assert.ok(details.includes(formattedSize),id+' '+bitrate+' missing actual encoded byte count');
      assert.ok(details.includes(delta),id+' '+bitrate+' missing actual RMS difference '+delta);
      assert.equal(item.alignment.samples,0);
    }
  }
  for(const token of ['FFmpeg 8.0.1','LAME','constant-bitrate','sample-RMS','0.951','Prepare instant switching','14 MiB','48 MiB','not a calibrated','not','/assets/audio/formats/manifest.json']){
    assert.ok(details.includes(token),'Missing MP3/FLAC evidence or limit: '+token);
  }
  assert.match(formats,/MATCHED_VOLUME/);
  assert.match(formats,/engine\.prepare\(song,currentSong\(\),MATCHED_VOLUME\[song\]\)/);
  assert.match(details,/not the artist.s official release master/);
});

test('ABX method describes supported tests, score visibility, private preview and limitations',()=>{
 const details=section('abx');
 for(const term of ['Training: ten practice rounds','Challenge: ten rounds','Advanced: twenty rounds',
   'Mastering EQ','128 kbps','320 kbps','score only once','chance probability',
   '10 completed, opted-in sessions','24 hours','180 days','not a cheat-proof',
   'private practice only']){
   assert.ok(details.includes(term),'Missing ABX methodology: '+term);
 }
 for(const id of ['formats-light-128-v1','formats-diva-128-v1','formats-light-320-v1','formats-diva-320-v1']){
   assert.ok(abx.includes(id),'Client lacks ABX source: '+id);
   assert.ok(worker.includes(id),'Server lacks scored source: '+id);
 }
 assert.match(abx,/PRACTICE_ONLY = location\.origin !== 'https:\/\/thesoundquestion\.com'/);
 assert.match(worker,/hmac\(secret,'answer:'/);
 assert.match(worker,/\.filter\(g=>g\.sessions>=10\)/);
 assert.match(worker,/s\.share\?180:1/);
 assert.match(details,/small decoded level difference/);
 assert.match(details,/not a cheat-proof or scientifically controlled hearing study/);
});

test('Library links lead to each full experiment breakdown as well as each interactive lab',()=>{
 for(const [id,href] of [['formats','/labs/formats/'],['abx','/labs/abx/']]){
   assert.match(library,new RegExp('href="'+href.replaceAll('/','\\/')+'"'));
   assert.match(library,new RegExp('href="/library/behind-the-experiments/#'+id+'"'));
   assert.match(html,new RegExp('id="'+id+'"'));
 }
});

test('ABX release matrix matches the actual browser and scored allowlist, without draft-only copy',()=>{
 const table=section('abx');
 const cases=[
  ['mix-narrow-reference-v1',"[\'training\']"],
  ['mix-reference-creative-v1',"[\'training\']"],
  ['master-dynamic-moderate-v1',"[\'training\']"],
  ['master-moderate-brick-v1',"[\'training\']"],
  ['master-eq-v1',"[\'training\',\'challenge\']"],
  ['formats-light-128-v1',"[\'training\',\'challenge\']"],
  ['formats-diva-128-v1',"[\'training\',\'challenge\']"],
  ['formats-light-320-v1',"[\'training\',\'advanced\']"],
  ['formats-diva-320-v1',"[\'training\',\'advanced\']"]
 ];
 for(const [id,modes] of cases)
   assert.ok(abx.includes("'"+id+"'") && abx.includes("modes:"+modes),
     'Missing expected ABX browser test/mode: '+id);
 const validated=worker.slice(worker.indexOf('const VALIDATED=new Map(['),
   worker.indexOf('const ORIGIN=',worker.indexOf('const VALIDATED=new Map([')));
 for(const id of ['formats-light-128-v1','formats-diva-128-v1',
    'formats-light-320-v1','formats-diva-320-v1'])
   assert.ok(validated.includes("'"+id+"'"),'Expected scored MP3 version '+id);
 for(const id of ['mix-narrow-reference-v1','mix-reference-creative-v1',
   'master-dynamic-moderate-v1','master-moderate-brick-v1','master-eq-v1'])
   assert.ok(!validated.includes("'"+id+"'"),'Nonvalidated scored source: '+id);
 for(const phrase of [
  'Mixing and stereo width','Mastering dynamics','Training only',
  'Mastering EQ','private practice Challenge; server-scored switching not yet validated',
  'MP3 at 128 kbps','10-trial scored Challenge',
  'MP3 at 320 kbps','20-trial scored Advanced',
  'Public versus preview','local and preview sites run private practice'
 ]){
  assert.ok(table.includes(phrase),'ABX visitor evidence needs current wording: '+phrase);
 }
 assert.doesNotMatch(table,/On this draft preview|after its separate release checks/);
 assert.match(abx,/PRACTICE_ONLY = location\.origin !== 'https:\/\/thesoundquestion\.com'/);
});
