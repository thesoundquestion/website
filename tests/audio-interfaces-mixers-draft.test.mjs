import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>readFileSync(path.join(root,rel),'utf8');
const page=read('decoder/audio-interfaces-mixers/index.html');
const curriculum=JSON.parse(read('decoder/curriculum.json'));
const bank=JSON.parse(read('assets/lesson-tutor/approved-answers.json'));

test('input equipment lesson stays a standalone unlisted draft pending review',()=>{
 assert.equal(curriculum.lessons.length,26,'Do not renumber approved existing lessons yet');
 assert.ok(!curriculum.lessons.some(l=>l.slug==='audio-interfaces-mixers'));
 assert.equal(Object.keys(bank).length,26,'Do not create tutor bank entry until listed');
 assert.ok(!read('decoder/index.html').includes('/decoder/audio-interfaces-mixers/'),'not in Decoder course index');
 assert.ok(!read('sitemap.xml').includes('/decoder/audio-interfaces-mixers/'),'not in sitemap');
 assert.match(page,/<meta name="robots" content="noindex,nofollow">/);
 assert.match(page,/<main id="main" class="types-page io-page">/);
 assert.match(page,/<nav class="main-nav"[^>]*>/);
 assert.match(page,/<details class="mobile-nav">/);
 assert.match(page,/<nav class="page-endnav container" aria-label="End-of-page navigation">/);
 assert.match(page,/<a href="#">↑ Back to top<\/a>/);
 assert.doesNotMatch(page,/<!-- LESSON_NAV_BEGIN -->/);
 assert.equal((page.match(/<h1\b/g)||[]).length,1);
 assert.equal((page.match(/<main\b/g)||[]).length,1);
});
test('the new teaching diagrams exist, are original local assets and explain different decisions',()=>{
 const visuals=['input-interface-and-mixer-routes.svg','input-stereo-vs-multitrack.svg'];
 for(const name of visuals){
  const file='assets/illustrations/'+name;
  assert.ok(existsSync(path.join(root,file)),name+' missing');
  const s=read(file);
  assert.match(s,/<svg /);assert.match(s,/<title id="figtitle">/);
  assert.match(s,/<desc id="figdesc">/);
  assert.doesNotMatch(s,/<script\b|<foreignObject\b|<image\b|<use\b[^>]*href=["']https?:\/\//i);
  assert.ok(page.includes('src="/'+file+'"'));
 }
 assert.ok(existsSync(path.join(root,'assets/audio-inputs-mixers.css')));
 assert.match(page,/<figcaption>/);
 assert.ok((page.match(/<figcaption>/g)||[]).length>=2);
 assert.match(read('assets/illustrations/input-stereo-vs-multitrack.svg'),/The channel count printed on the mixer does not tell you/);
});
test('new lesson first-use language and application examples include no misleading category claims',()=>{
 for(const x of ['audio interface','mixer','ADC','DAC','preamp','channel','stereo','multitrack','aux','buffer','direct monitoring','loopback','Hi-Z','MIDI','ADAT','EIN','MG10XU','LiveTrak L-12',
  'rapper','singer-songwriter','drummer','podcast','livestream','band','garage','simultaneously','separately','headphones','PA speakers']){
  assert.ok(page.toLowerCase().includes(x.toLowerCase()),'missing critical distinction: '+x);
 }
 assert.match(page,/10-channel mixer with a 2-in\/2-out USB audio connection/);
 assert.match(page,/14-in\/4-out USB audio interface/);
 assert.doesNotMatch(page,/USB (?:always|automatically) (?:records|means).*multitrack/i);
 assert.doesNotMatch(page,/direct monitoring (?:always|guarantees) zero latency/i);
 assert.doesNotMatch(page,/\b(?:always|automatically|necessarily)\s+(?:guarantees?|means)\s+better\s+sound/i);
 assert.ok(page.includes('One mic can capture a complete blended performance')||page.includes('One mic can capture'));
});
test('every internal page and section reference and image resolves',()=>{
 const missing=[];
 const ids=[...page.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(ids.length,new Set(ids).size,'duplicate DOM IDs');
 for(const m of page.matchAll(/href="([^"]+)"/g)){
  const link=m[1];if(link==='#'||link.startsWith('https://')||link.startsWith('mailto:'))continue;
  if(link.startsWith('#')){if(!ids.includes(link.slice(1)))missing.push('missing same-page anchor '+link);continue;}
  if(!link.startsWith('/'))continue;
  const [p,frag]=link.split('#'),relative=p.slice(1),local=relative.endsWith('/')?relative+'index.html':relative;
  if(!existsSync(path.join(root,local))){missing.push('broken target '+link);continue;}
  if(frag&& !read(local).includes('id="'+frag+'"'))missing.push('broken anchor '+link);
 }
 for(const m of page.matchAll(/<img\b[^>]*src="(\/[^"]+)"/g)){
  const rel=m[1].slice(1).split('?')[0];
  if(!existsSync(path.join(root,rel)))missing.push('missing illustration '+rel);
 }
 assert.deepEqual(missing,[]);
});
