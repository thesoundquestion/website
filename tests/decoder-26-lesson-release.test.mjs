import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=rel=>readFileSync(path.join(root,rel),'utf8');
const curriculum=JSON.parse(read('decoder/curriculum.json'));
const slugs=curriculum.lessons.map(l=>l.slug);
const hub=read('decoder/index.html');
const sitemap=read('sitemap.xml');

test('all 27 lessons have one numbered card or opening link, page title and sitemap entry',()=>{
 assert.equal(slugs.length,27);
 const cards=[...hub.matchAll(/<a class="dl-card" href="\/decoder\/([^/]+)\/"(?:(?!<\/a>)[\s\S])*?<span class="dl-number">LESSON\s+(\d+)/g)];
 assert.equal(cards.length,26,'Every lesson after the starting lesson needs exactly one hub card');
 assert.equal(new Set(cards.map(m=>m[1])).size,26,'No duplicate lesson cards');
 for(let i=0;i<slugs.length;i++){
  const slug=slugs[i];
  const html=read('decoder/'+slug+'/index.html');
  assert.ok(html.includes('<h1'),slug+' missing headline');
  assert.ok(html.includes('LESSON '+String(i+1).padStart(2,'0')),slug+' old lesson label');
  assert.ok(html.includes('Lesson '+String(i+1).padStart(2,'0')+' of 27'),slug+' old course progress');
  assert.equal((sitemap.match(new RegExp('<loc>https://thesoundquestion\\.com/decoder/'+slug+'/</loc>','g'))||[]).length,1,slug+' sitemap count');
  if(i===0)assert.ok(hub.includes('href="/decoder/'+slug+'/"'),'intro link');
  else {
   const card=cards.find(m=>m[1]===slug);
   assert.ok(card,slug+' missing from hub');
   assert.equal(Number(card[2]),i+1,slug+' hub card number');
  }
 }
 assert.match(hub,/27 beginner-friendly lessons/);
 assert.match(hub,/27 lessons on sound basics/);
});

test('the full Decoder course has valid static internal links and illustration files',()=>{
 const missing=[];
 for(const slug of slugs){
  const from='decoder/'+slug+'/index.html',html=read(from);
  for(const m of html.matchAll(/href="(\/[^"]+)"/g)){
   const target=m[1];
   const [nohash,hash]=target.split('#');
   const pathname=nohash.split('?')[0];
   if(!pathname || pathname==='/')continue;
   const rel=pathname.slice(1),filename=rel.endsWith('/')?rel+'index.html':rel;
   const file=path.join(root,filename);
   if(!existsSync(file)){missing.push(from+' -> missing '+target);continue;}
   if(hash && hash.length && /\.html$/.test(filename)){
    const targetHtml=read(filename);
    if(!targetHtml.includes('id="'+decodeURIComponent(hash)+'"'))
      missing.push(from+' -> missing section '+target);
   }
  }
  for(const m of html.matchAll(/<img\b[^>]*\bsrc="(\/[^"]+)"/g)){
   const filename=m[1].slice(1).split('?')[0];
   if(!existsSync(path.join(root,filename)))missing.push(from+' -> missing image '+filename);
  }
 }
 assert.deepEqual(missing,[],missing.join('\n'));
});

test('approved lessons have no duplicate menu links, and connect to older canonical explanations',()=>{
 for(const [slug,prev,now] of [
  ['microphone-types','/decoder/recording-sources/#mic','/decoder/recording-sources/#room'],
  ['speaker-types','/decoder/speaker-dispersion/#understand','/system-builder/']
 ]){
  const html=read('decoder/'+slug+'/index.html');
  const end=html.match(/<nav class="page-endnav container" aria-label="End-of-page navigation">([\s\S]*?)<\/nav>/)?.[1]||'';
  assert.doesNotMatch(end,/>All lessons<\/a>/,'Do not repeat course link in page footer');
  assert.ok(html.includes('href="'+prev+'"'),slug+' should link to prior teaching');
  assert.ok(end.includes('href="'+now+'"'),slug+' practical next step');
  assert.equal((html.match(/<!-- LESSON_NAV_BEGIN -->/g)||[]).length,1);
 }
});
