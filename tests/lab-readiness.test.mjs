import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('assets/lab-readiness.js');
const context={window:{},navigator:{},document:{hidden:false}};
vm.runInNewContext(source,context);
const api=context.window.TSQLabReadiness;

test('only Offline, Please wait and Ready exist, with consistent semantics',()=>{
 assert.deepEqual({...api.labels},{offline:'Offline',wait:'Please wait',ready:'Ready'});
 assert.equal(api.status({url:''}),'offline');
 assert.equal(api.status({url:'https://audio.example/file.flac'}),'wait');
 assert.equal(api.status({url:'https://audio.example/file.flac',failed:true,prepared:true}),'offline');
 assert.equal(api.status({url:'https://audio.example/file.flac',prepared:true}),'ready');
 assert.equal(api.status({url:'https://audio.example/file.flac',active:true,prepared:true,waiting:true}),'wait');
});
test('a URL or a metadata-only media tag is never sufficient for Ready',()=>{
 const media={error:null,seeking:false,readyState:1,currentTime:5,duration:40,buffered:{length:0,start:()=>0,end:()=>0}};
 assert.equal(api.status({url:'https://audio.example/test.flac',active:true,media}),'wait');
 media.readyState=3;media.buffered={length:1,start:()=>0,end:()=>5.3};
 assert.equal(api.status({url:'https://audio.example/test.flac',active:true,media}),'wait');
 media.buffered={length:1,start:()=>0,end:()=>10};
 assert.equal(api.status({url:'https://audio.example/test.flac',active:true,media}),'ready');
 media.error={code:3};
 assert.equal(api.status({url:'https://audio.example/test.flac',active:true,media}),'offline');
});
test('ordinary labs import the same status library, ABX exposes only one whole-trial indicator',()=>{
 for(const path of ['lab/index.html','lab/mastering/index.html','labs/formats/index.html']){
  const text=read(path);
  assert.match(text,/\/assets\/lab-readiness\.js/);
  assert.match(text,/\/assets\/lab-readiness\.css/);
 }
 const abx=read('assets/abx-lab.js');
 assert.match(abx,/class:'tsq-abx-trial-readiness'/);
 assert.match(abx,/prepareScoredTrial/);
 assert.match(abx,/Prepare recordings/);
 assert.match(abx,/readiness\.set\(trialReadiness/);
 assert.match(abx,/trialReadiness\.hidden=scored\|\|/);
 assert.match(abx,/cache\.prepare\(TRAIN_A/);
 assert.match(abx,/cache\.prepare\(TRAIN_B/);
 assert.match(abx,/cache\.prepare\(SCORE_X/);
 assert.doesNotMatch(abx, /data-slot.*data-readiness/);
});
test('failed prefetch is not retried on every progress event',()=>{
 assert.match(source,/failed\.has\(key\)/);
 for(const path of ['assets/mixing-lab.js','lab/mastering/index.html','labs/formats/index.html']){
  const text=read(path);
  assert.match(text,/createCache/);
  assert.match(text,/maybePrepareNext/);
  assert.match(text,/tsq-lab-audio-focus/);
 }
});
