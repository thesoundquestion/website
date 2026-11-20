import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const read=rel=>readFileSync(path.join(root,rel),'utf8');
const curriculum=JSON.parse(read('decoder/curriculum.json'));
const lessons=curriculum.lessons;

test('all 27 lessons use one visually prominent guided next step, in order',()=>{
 assert.equal(lessons.length,27);
 for(let i=0;i<lessons.length;i++){
  const slug=lessons[i].slug,html=read('decoder/'+slug+'/index.html');
  const marker='<!-- LESSON_NAV_BEGIN -->',end='<!-- LESSON_NAV_END -->';
  assert.equal(html.split(marker).length,2,slug+': exactly one navigation block');
  const start=html.indexOf(marker),finish=html.indexOf(end,start),nav=html.slice(start,finish);
  const next=lessons[i+1],target=next?'/decoder/'+next.slug+'/':'/decoder/';
  assert.match(nav,/<nav class="dl-continue container" aria-label="Continue learning">/);
  assert.ok(nav.includes('<a class="dl-next-card" href="'+target+'">'),slug+': primary destination');
  assert.match(nav,/class="dl-next-action"/,slug+': obvious call to action');
  assert.match(nav,/class="dl-progress-track" role="progressbar"/);
  assert.ok(nav.includes('aria-valuenow="'+(i+1)+'"'),slug+': step is accurate');
  assert.ok(nav.includes('aria-valuemax="27"'));
  assert.ok(nav.includes('class="dl-lesson-bridge"'),slug+': tailored transition');
  assert.doesNotMatch(nav,/dl-topic-switch/,slug+': no competing topic switch');
  assert.ok(html.indexOf('dl-sources-after-nav')>finish,slug+': supplementary sources must follow');
  assert.ok(html.lastIndexOf('</main>')>finish,slug+': primary next step before footer');
  if(next){
   assert.ok(nav.includes('NEXT LESSON '+String(i+2).padStart(2,'0')+' OF 27'),slug+': numbered next step');
   assert.ok(nav.includes('Continue to lesson '+String(i+2).padStart(2,'0')),slug+': explicit action');
  }else{
   assert.match(nav,/COURSE COMPLETE/);
   assert.match(nav,/Browse all lessons/);
   assert.doesNotMatch(nav,/NEXT LESSON 28/);
  }
 }
});
test('no duplicate next-lesson button clusters come before the primary card',()=>{
 for(const slug of ['sound-basics','recording-sources','mixing-soundstage']){
  const html=read('decoder/'+slug+'/index.html');
  assert.ok(!html.slice(0,html.indexOf('<!-- LESSON_NAV_BEGIN -->')).includes('id="next"'),slug+': redundant pre-nav next section');
 }
 const mixing=read('decoder/mixing-soundstage/index.html');
 const pre=mixing.slice(0,mixing.indexOf('<!-- LESSON_NAV_BEGIN -->'));
 assert.doesNotMatch(pre,/class="mx-link-row"/);
 const formats=read('decoder/lossy-lossless/index.html');
 const nav=formats.indexOf('<!-- LESSON_NAV_BEGIN -->');
 assert.doesNotMatch(formats.slice(Math.max(0,nav-850),nav),/Related lessons:/);
 assert.match(formats.slice(nav),/Related lessons:/);
});
test('the guiding card remains a real anchor with visible focus treatment and no JS dependency',()=>{
 const css=read('assets/decoder-lessons.css');
 const gen=read('scripts/sync_decoder_navigation.py');
 assert.match(css,/\.dl-next-card:focus-visible/);
 assert.match(css,/\.dl-next-action/);
 assert.match(css,/@media\(max-width:650px\)/);
 assert.match(gen,/next_bridge/);
 assert.match(gen,/COURSE COMPLETE/);
 for(const lesson of lessons)assert.ok(lesson.next_bridge&&lesson.next_bridge.length>70,lesson.slug+': needs a meaningful bridge');
});
