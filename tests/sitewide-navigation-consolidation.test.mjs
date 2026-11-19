import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const sitemap=read('sitemap.xml');
const routes=[...sitemap.matchAll(/<loc>https:\/\/thesoundquestion\.com\/([^<]*)<\/loc>/g)]
  .map(match=>match[1] ? match[1]+'index.html' : 'index.html');
const curriculum=JSON.parse(read('decoder/curriculum.json'));
const lessons=new Set(curriculum.lessons.map(x=>'decoder/'+x.slug+'/index.html'));
const hubs=new Set(['index.html','decoder/index.html','labs/index.html','tools/index.html','library/index.html']);

test('all published sitemap pages use one coherent navigation policy, with legal links retained',()=>{
 assert.ok(routes.length>=54,'expected complete public site');
 assert.equal(new Set(routes).size,routes.length,'sitemap duplicates');
 for(const file of routes){
  assert.ok(existsSync(path.join(root,file)),file+' not found');
  const s=read(file);
  const footers=[...s.matchAll(/<footer\b[\s\S]*?<\/footer>/g)];
  assert.equal(footers.length,1,file+' should have exactly one footer');
  const footer=footers[0][0];
  assert.match(footer,/<nav aria-label="Policies">/,file+' needs legal links');
  for(const legal of ['/privacy/','/content-use/'])
   assert.ok(footer.includes('href="'+legal+'"'),file+' missing '+legal);
  assert.doesNotMatch(footer,/class="footer-links"/,file+' duplicates primary destinations in footer');
  if(file==='index.html'){
   assert.doesNotMatch(s,/<nav class="main-nav"|class="mobile-nav"|class="page-endnav/);
   assert.match(s,/class="home-quick-links"/);
   assert.match(s,/class="home-more-grid"/);
  }else{
   assert.match(s,/<nav class="main-nav"/,file+' missing global navigation');
   assert.match(s,/class="mobile-nav"/,file+' missing no-script mobile navigation');
  }
 }
});

test('27 lessons use one bottom course progression and no competing top or bottom nav',()=>{
 assert.equal(lessons.size,27);
 for(const file of lessons){
  const s=read(file);
  assert.equal((s.match(/<!-- LESSON_NAV_BEGIN -->/g)||[]).length,1,file+' course marker count');
  assert.equal((s.match(/class="dl-continue container"/g)||[]).length,1,file+' course continuation count');
  assert.doesNotMatch(s,/<!-- LESSON_TOP_NAV_BEGIN -->|class="dl-top-next"/,file+' duplicated top next');
  assert.doesNotMatch(s,/class="page-endnav/,file+' second bottom navigation');
  const related=[...s.matchAll(/<div class="dl-related-action">([\s\S]*?)<\/div>/g)];
  assert.ok(related.length<=1,file+' contextual next action repeated');
  for(const r of related){
   const href=r[1].match(/href="([^"]+)"/)?.[1];
   assert.ok(href?.startsWith('/'),file+' contextual action not local');
   const target=href.split(/[?#]/)[0];
   const disk=target.slice(1)+(target.endsWith('/')?'index.html':'');
   assert.ok(existsSync(path.join(root,disk)),file+' contextual destination missing');
   const course=s.match(/<!-- LESSON_NAV_BEGIN -->([\s\S]*?)<!-- LESSON_NAV_END -->/)?.[1]||'';
   const onlyMain=course.split('<div class="dl-related-action">')[0];
   assert.ok(!onlyMain.includes('href="'+href+'"'),file+' repeats its own course action');
  }
 }
});

test('hubs use their discovery cards while tools and long articles retain a single purposeful end action',()=>{
 for(const file of routes){
  const s=read(file);
  const panels=[...s.matchAll(/<nav class="page-endnav[^"]*" aria-label="End-of-page navigation">([\s\S]*?)<\/nav>/g)];
  if(hubs.has(file)){
   assert.equal(panels.length,0,file+' repeats card navigation');
   continue;
  }
  if(lessons.has(file)){assert.equal(panels.length,0);continue;}
  assert.equal(panels.length,1,file+' needs exactly one contextual action');
  const panel=panels[0][1];
  assert.match(panel,/class="page-endnav-primary" href="\//,file+' needs a useful next action');
  assert.match(panel,/href="#">↑ Back to top<\/a>/,file+' long page needs scroll recovery');
  assert.doesNotMatch(panel,/>All lessons<\/a>|>All tools<\/a>|href="\/"[^>]*>Home<\/a>/,file+' generic repeated bottom links');
 }
});

test('error page and both unpublished tool previews follow the same legal and primary-navigation policy',()=>{
 for(const file of ['404.html','tools/chain-check-preview/index.html','tools/equipment-comparison-preview/index.html']){
  const s=read(file);
  assert.match(s,/<nav aria-label="Policies">/,file);
  assert.match(s,/<nav class="main-nav"/,file);
  assert.match(s,/class="mobile-nav"/,file);
 }
});
