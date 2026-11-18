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
  assert.match(s,/<nav class="page-endnav[^"]*" aria-label="End-of-page navigation">/);
  assert.match(s,/<div class="dl-end container">/);
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
test('new lessons remain intentionally unlisted until editorial approval',()=>{
 const curriculum=read('decoder/curriculum.json');
 const sitemap=read('sitemap.xml');
 const index=read('decoder/index.html');
 for(const l of lessons){
  assert.ok(!curriculum.includes('"slug": "'+l.slug+'"'),'not yet curriculum');
  assert.ok(!sitemap.includes('/decoder/'+l.slug+'/'),'not in sitemap');
  assert.ok(!index.includes('/decoder/'+l.slug+'/'),'not in course index');
 }
});
