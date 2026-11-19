import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const lessons=[
 {slug:'microphone-types',anchor:'inside',visual:'mic-types-mechanisms.svg',claims:['Dynamic (moving-coil)','Condenser','Ribbon','Shotgun','Lavalier','USB','XLR','Phantom power']},
 {slug:'speaker-types',anchor:'jobs',visual:'speaker-types-settings.svg',claims:['Nearfield','Studio monitor','Hi-fi','PA','Stage wedge','Line array','Passive','Powered']}
];

for(const l of lessons){
 const page='decoder/'+l.slug+'/index.html';
 test(l.slug+' page is a readable standalone lesson with accessible approved-style visual',()=>{
  const s=read(page);
  assert.equal((s.match(/<h1\b/g)||[]).length,1,'exactly one main heading');
  assert.match(s,/<html lang="en">/);
  assert.match(s,/<main id="main"/);
  assert.match(s,/<nav class="main-nav"/);
  assert.match(s,/<details class="mobile-nav">/);
  assert.match(s,/<meta name="description"/);
  assert.match(s,/<link rel="canonical"/);
  assert.match(s,/<div class="types-answer">/);
  assert.match(s,/<nav class="types-index"/);
  assert.match(s,/<figcaption>/);
  assert.match(s,/<img [^>]*alt="[^"]+"/);
  assert.match(s,/<nav class="dl-continue container" aria-label="Continue learning">/);
  assert.doesNotMatch(s,/<nav class="page-endnav[^"]*" aria-label="End-of-page navigation">/);
  assert.match(s,/<!-- LESSON_NAV_BEGIN -->/);
  assert.ok(s.includes('/assets/illustrations/'+l.visual),'correct new instructional diagram');
  assert.ok(existsSync(path.join(root,'assets/illustrations',l.visual)));
  assert.ok(s.includes('id="'+l.anchor+'"'));
  for(const claim of l.claims)assert.ok(s.toLowerCase().includes(claim.toLowerCase()),'Missing essential claim: '+claim);
  assert.doesNotMatch(s, /data-lesson-plot=|<audio\b|<iframe\b/,'do not duplicate old interactive labs');
  assert.doesNotMatch(s, /href="\/decoder\/technical-glossary\//,'do not link unpublished technical glossary');
  assert.doesNotMatch(s, /\b(?:always|guaranteed)\s+(?:better|worse|accurate|neutral)\b/i,'avoid universal quality guarantees');
 });
 test(l.slug+' in-page and cross-lesson anchors resolve',()=>{
  const s=read(page);
  for(const match of s.matchAll(/href="([^"]+)"/g)){
   const link=match[1];
   if(link.startsWith('#')&&link!=='#'){
     assert.ok(s.includes('id="'+link.slice(1)+'"'),page+': missing '+link);
   }else if(link.startsWith('/decoder/')){
     const [pathname,frag] =link.split('#');
     const target=pathname.endsWith('/')?pathname+'index.html':pathname;
     const local=path.join(root,target.slice(1));
     assert.ok(existsSync(local),page+': broken '+link);
     if(frag)assert.ok(read(target.slice(1)).includes('id="'+frag+'"'),page+': missing anchor '+link);
   }
  }
 });
}
test('dynamic is introduced alongside moving-coil in prose and illustration',()=>{
 const lesson=read('decoder/microphone-types/index.html');
 const figure=read('assets/illustrations/mic-types-mechanisms.svg');
 assert.match(lesson,/Dynamic \(moving-coil\)/i);
 assert.match(lesson,/usually mean by a <strong>dynamic microphone<\/strong>/i);
 assert.match(figure,/>DYNAMIC \(MOVING-COIL\)<\/text>/);
});
test('vector teaching figures describe concepts, not fabricated product measurements',()=>{
 for(const l of lessons){
  const s=read('assets/illustrations/'+l.visual);
  assert.match(s,/<svg/);
  assert.match(s,/<title id="t">/);
  assert.match(s,/<desc id="d">/);
  assert.ok(s.includes('not to scale')||s.includes('not measured'),'figure disclaimer');
  assert.doesNotMatch(s, /<script\b|<foreignObject\b|<image\b|<use\b[^>]*href=["']https?:\/\//i,'no scripts or external embedded image dependencies');
 }
});
test('approved equipment-type lessons are numbered and joined to the complete 27-lesson sequence',()=>{
 const curriculum=JSON.parse(read('decoder/curriculum.json'));
 const sitemap=read('sitemap.xml');
 const index=read('decoder/index.html');
 const journey=JSON.parse(read('journey/topic-links.json'));
 const order=curriculum.lessons.map(x=>x.slug);
 assert.equal(order.length,27);
 assert.equal(new Set(order).size,27);
 assert.deepEqual(order.slice(20,27),['speaker-dispersion','speaker-types','recording-sources','microphone-types','recording-resolution','mixing-soundstage','mastering-dynamic-range']);
 for(const [slug,num] of [['speaker-types',22],['microphone-types',24]]){
  const page=read('decoder/'+slug+'/index.html');
  assert.match(page,new RegExp('LESSON '+num));
  assert.ok(index.includes('href="/decoder/'+slug+'/">'),'lesson card: '+slug);
  assert.ok(sitemap.includes('https://thesoundquestion.com/decoder/'+slug+'/'),'sitemap: '+slug);
  assert.ok(page.includes('Lesson '+String(num).padStart(2,'0')+' of 27'),'course progress: '+slug);
 }
 assert.ok(journey.steps.capture.some(x=>x.lesson==='microphone-types'));
 assert.ok(journey.steps.speakers.some(x=>x.lesson==='speaker-types'));
 const source=read('decoder/recording-sources/index.html');
 const dispersion=read('decoder/speaker-dispersion/index.html');
 assert.ok(source.includes('href="/decoder/microphone-types/"'));
 assert.ok(dispersion.includes('href="/decoder/speaker-types/"'));
});
