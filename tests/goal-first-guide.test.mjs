import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {GOALS,GROUPS,LINKS,buildPath} from '../tools/find-my-setup/engine.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const home=read('index.html');
const guide=read('tools/find-my-setup/index.html');
const app=read('tools/find-my-setup/app.mjs');
const style=read('assets/styles.css');
const guideStyle=read('assets/goal-guide.css');
const byId=id=>GOALS.find(g=>g.id===id);
const answer=(id,values)=>buildPath(id,values);
const pathNames=p=>p.steps.map(s=>s.name).join(' | ');
const words=html=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().split(/\s+/).length;

test('homepage is a short signpost with prominent real goals and simple essentials',()=>{
 assert.match(home,/<h1 id="home-title">The Sound /);
 assert.match(home,/From the microphone to your ears\./);
 assert.match(home,/class="home-goal-grid"/);
 assert.equal((home.match(/class="home-goal-card"/g)||[]).length,6);
 assert.ok(home.indexOf('home-fast-paths')<home.indexOf('class="home-goal-grid"'),'Jump Straight In must precede Choose Your Path');
 assert.equal((home.match(/class="home-quick-links"/g)||[]).length,1,'Keep a single compact set of quick links');
 assert.equal((home.match(/class="discovery-card"/g)||[]).length,0,'Avoid a competing second card grid');
 for(const id of ['hifi','vocal','songwriter','stream','band','live']){
  assert.match(home,new RegExp('href="/tools/find-my-setup/\\?goal='+id+'"'));
  assert.ok(byId(id),id+' must be a working deep link');
 }
 for(const route of ['/tools/find-my-setup/','/decoder/','/labs/','/tools/','/library/','/about/','/connect/']){
  assert.ok(home.includes('href="'+route+'"'),route);
 }
 for(const id of ['nativeShare','copySiteLink','shareFeedback'])assert.ok(home.includes('id="'+id+'"'),id);
 assert.match(home,/href="https:\/\/ko-fi.com\/thesoundquestion"/);
 assert.match(home,/href="\/connect\/"/);
 assert.match(read('connect/index.html'),/id="business-inquiries"/);
 assert.match(home,/51 personal picks/);
 assert.match(read('library/index.html'),/make-audio-make-sense-illustrated\.pdf" download/);
 assert.ok(home.length<12000,'Homepage should not grow into a wall of text');
 assert.ok(words(home)<850,'Homepage should be much shorter than the former feature wall');
 assert.match(style,/\.home-goal-grid\{display:grid/);
 assert.match(style,/@media\(max-width:620px\)/);
});

test('guide is linked from tools and indexed with correct canonical and no external service',()=>{
 assert.match(guide,/class="goal-guide-main"/);
 assert.match(guide,/id="goal-picker"/);
 assert.match(guide,/id="goal-questions"/);
 assert.match(guide,/id="goal-result"/);
 assert.match(guide,/id="goal-after" hidden/);
 assert.match(guide,/<noscript>/);
 assert.match(guide,/type="module" src="\/tools\/find-my-setup\/app.mjs"/);
 assert.match(guide,/rel="canonical" href="https:\/\/thesoundquestion\.com\/tools\/find-my-setup\/"/);
 assert.match(guide,/property="og:url" content="https:\/\/thesoundquestion\.com\/tools\/find-my-setup\/"/);
 assert.match(read('tools/index.html'),/href="\/tools\/find-my-setup\/"/);
 assert.match(read('sitemap.xml'),/<loc>https:\/\/thesoundquestion\.com\/tools\/find-my-setup\/<\/loc>/);
 assert.ok(existsSync(path.join(root,'assets/goal-guide.css')));
 assert.match(guideStyle,/max-width:640px/);
 assert.doesNotMatch(guide,/<iframe|third-party|paid API/i);
 for(const file of [app,read('tools/find-my-setup/engine.mjs')]){
  assert.doesNotMatch(file,/\b(?:localStorage|sessionStorage|fetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket)\b/);
 }
});

test('every configured goal has only meaningful questions and a complete educational result',()=>{
 assert.equal(GOALS.length,11);
 assert.equal(new Set(GOALS.map(g=>g.id)).size,GOALS.length);
 assert.deepEqual(GROUPS,['Listening','Recording','Creating','Performing','Exploring']);
 for(const g of GOALS){
  assert.ok(g.questions.length>=2&&g.questions.length<=3,g.id+' too many questions');
  const values={};
  for(const q of g.questions){
   assert.ok(q.options.length>=2,g.id+' empty question');
   assert.equal(new Set(q.options.map(o=>o.value)).size,q.options.length,g.id+' duplicate answer');
   values[q.id]=q.options[0].value;
  }
  const out=answer(g.id,values);
  assert.ok(out.description?.length>30,g.id+' empty reason');
  assert.ok(out.steps.length>=2,g.id+' incomplete signal chain');
  assert.ok(out.steps.every(x=>x.name&&x.why),g.id+' unexplained part');
  assert.ok(out.verify.length>=1,g.id+' no check-before-buying');
  assert.ok(out.alternative.length>20,g.id+' no realistic alternative');
  assert.ok(out.learn.length>=2,g.id+' no lesson wayfinding');
  for(const link of out.learn)assert.ok(link.href.startsWith('/')&&link.why, g.id+' invalid link');
 }
});

test('recording a vocal over an existing beat does not invent hardware sources',()=>{
 const usb=answer('vocal',{backing:'beat',mic:'usb'});
 assert.match(pathNames(usb),/USB connection to the computer/);
 assert.doesNotMatch(pathNames(usb),/separate.*interface|mixing console|drum microphone/i);
 assert.ok(usb.skip.some(s=>/does not need a physical drum input/i.test(s)));
 assert.ok(usb.skip.some(s=>/second interface/i.test(s)));
 const xlr=answer('vocal',{backing:'beat',mic:'xlr'});
 assert.match(pathNames(xlr),/compatible microphone input/);
 assert.ok(xlr.verify.some(x=>/connection/i.test(x)));
});

test('singer-songwriter separate versus simultaneous recording changes input requirement',()=>{
 const overdub=answer('songwriter',{method:'overdub',instrument:'acoustic'});
 const blend=answer('songwriter',{method:'blended',instrument:'acoustic'});
 const split=answer('songwriter',{method:'separate',instrument:'acoustic'});
 assert.doesNotMatch(pathNames(overdub),/Second independent input/);
 assert.doesNotMatch(pathNames(blend),/Second independent input/);
 assert.match(pathNames(split),/Second independent input/);
 assert.ok(split.verify.some(x=>/two appropriate independent/i.test(x)));
 assert.ok(overdub.description.includes('one suitable input at a time'));
 assert.ok(blend.description.includes('joined in one recording'));
});

test('drum types and band tracking preserve truly different capture plans',()=>{
 const electronic=answer('drums',{kit:'electronic',control:'separate'});
 assert.match(pathNames(electronic),/Electronic drum module/);
 assert.doesNotMatch(pathNames(electronic),/microphone-capable/);
 const acoustic=answer('drums',{kit:'acoustic',control:'separate'});
 assert.match(pathNames(acoustic),/microphone-capable/);
 assert.ok(acoustic.skip.some(x=>/eight-microphone kit/i.test(x)));
 const rehearsal=answer('band',{method:'rehearsal',sources:'unsure'});
 assert.match(pathNames(rehearsal),/stereo recorder/);
 assert.doesNotMatch(pathNames(rehearsal),/independent inputs/);
 const live=answer('band',{method:'live',sources:'many'});
 assert.match(pathNames(live),/enough independent inputs/);
 assert.ok(live.verify.some(x=>/nine or more/i.test(x)));
 const unknown=answer('band',{method:'live',sources:'unsure'});
 assert.ok(unknown.verify.some(x=>/unknown/i.test(x)));
});

test('hi-fi listening directs to existing Builder, not a fake recording configurator',()=>{
 const owned=answer('hifi',{focus:'imaging',gear:'full',seat:'chair'});
 assert.equal(owned.next,'builder');
 assert.match(pathNames(owned),/Your amplifier and speakers/);
 assert.ok(owned.learn.some(x=>/soundstage/i.test(x.label)));
 assert.ok(owned.learn.some(x=>/speakers and rooms/i.test(x.label)));
 const empty=answer('hifi',{focus:'overall',gear:'none',seat:'desk'});
 assert.match(pathNames(empty),/A complete stereo speaker path/);
 assert.ok(empty.verify.some(x=>/powered or passive/i.test(x)));
 const vocal=answer('vocal',{backing:'beat',mic:'none'});
 assert.equal(vocal.next,null,'recording must not be mapped into listening builder');
});

test('live performer monitoring and remote podcast routes are not silently lost',()=>{
 const live=answer('live',{show:'band',monitor:'yes'});
 assert.match(pathNames(live),/Separate monitor feed/);
 const simple=answer('live',{show:'speech',monitor:'no'});
 assert.doesNotMatch(pathNames(simple),/Separate monitor feed/);
 const remote=answer('podcast',{guests:'remote',edit:'separate'});
 assert.ok(remote.optional.some(x=>/call-in return route/i.test(x)));
 const stream=answer('stream',{kind:'game',people:'remote'});
 assert.match(pathNames(stream),/Guest audio return without echo/);
});

test('all recommended lessons are existing live-source pages and anchors, never unpublished draft routes',()=>{
 const errors=[];
 for(const [key,item]of Object.entries(LINKS)){
  if(/audio-interfaces-mixers/.test(item.href)&&!existsSync(path.join(root,'decoder/audio-interfaces-mixers/index.html')))errors.push(key+' missing interface/mixer lesson');
  if(!item.href.startsWith('/'))errors.push(key+' not local');
  const [base,fragment]=item.href.split('#');
  const relative=base.slice(1),file=path.join(root,relative.endsWith('/')?relative+'index.html':relative);
  if(!existsSync(file)){errors.push(key+' missing '+base);continue;}
  if(fragment&&!read(path.relative(root,file)).includes('id="'+fragment+'"'))errors.push(key+' missing #'+fragment);
 }
 assert.deepEqual(errors,[]);
});

test('goal chooser accepts a known home deep link and never trusts unknown query values',()=>{
 assert.match(app,/new URLSearchParams\(location.search\)/);
 assert.match(app,/if\(initial && byId.has\(initial\)\)showGoal/);
 assert.match(app,/textContent/);
 assert.match(app,/aria-pressed/);
 assert.match(app,/role="status"|notice.textContent/);
 assert.match(app,/No|not sent|stay in this browser/i);
 assert.throws(()=>buildPath('invented',{foo:'bar'}));
 assert.throws(()=>buildPath('vocal',{backing:'beat',mic:'invalid'}));
});
