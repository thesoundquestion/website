import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const omit=new Set(['.git','.github','staging','tests','scripts','deployment','assets','docs', 'site-dist', '.pages-dist']);
function pages(dir=root){
 const found=[];
 for(const d of readdirSync(dir,{withFileTypes:true})){
  if(d.isDirectory()){if(!omit.has(d.name))found.push(...pages(path.join(dir,d.name)));}
  else if(d.name==='index.html')found.push(path.join(dir,d.name));
 }
 return found;
}
const read=p=>readFileSync(p,'utf8');
test('every page has one purposeful way out, not stacked navigation panels',()=>{
 const all=pages();
 assert.ok(all.length>=43);
 const hubs=new Set(['index.html','decoder/index.html','labs/index.html','tools/index.html','library/index.html']);
 for(const file of all){
  const relative=path.relative(root,file).replaceAll('\\','/');
  const html=read(file);
  const end=[...html.matchAll(/<nav class="page-endnav[^"]*" aria-label="End-of-page navigation">([\s\S]*?)<\/nav>/g)];
  const course=[...html.matchAll(/<nav class="dl-continue container" aria-label="Continue learning">/g)];
  const isCourse=html.includes('<!-- LESSON_NAV_BEGIN -->');
  if(hubs.has(relative)){
   assert.equal(end.length,0,relative+': primary cards are the navigation');
   if(relative==='index.html'){
    assert.match(html,/class="home-quick-links"/);
    assert.match(html,/class="home-more-grid"/);
   }
   continue;
  }
  if(isCourse){
   assert.equal(course.length,1,relative+': exactly one course-navigation panel');
   assert.equal(end.length,0,relative+': no duplicate end-of-page panel');
   assert.doesNotMatch(html,/<!-- LESSON_TOP_NAV_BEGIN -->/,relative+': duplicate top-next action');
   continue;
  }
  assert.equal(end.length,1,relative+': one contextual end action');
  const block=end[0][1];
  assert.match(block,/href="#"[^>]*>↑ Back to top<\/a>/,relative+': missing back-to-top');
  const m=block.match(/class="page-endnav-primary" href="([^"]+)"/);
  assert.ok(m&&m[1].startsWith('/'),relative+': missing local contextual action');
  const pathname=m[1].split('#')[0].split('?')[0];
  const target=path.resolve(root,pathname.replace(/^\//,'')+(pathname.endsWith('/')?'index.html':''));
  assert.ok(existsSync(target),relative+': missing destination '+m[1]);
  assert.notEqual(pathname,'/'+relative.replace(/index.html$/,''),relative+': self-target');
  assert.doesNotMatch(block,/href="\/"[^>]*>Home<\/a>|>All lessons<\/a>|>All tools<\/a>/i,relative+': generic duplicate links');
  assert.ok(html.lastIndexOf('page-endnav')<html.lastIndexOf('</main>'),relative+': nav must live inside main');
 }
});
test('lesson progression remains intact and end-page buttons work without JavaScript',()=>{
 for(const file of pages()){
  const relative=path.relative(root,file).replaceAll('\\','/');
  const html=read(file);
  if(relative.startsWith('decoder/')&&relative!=='decoder/index.html'&&html.includes('<!-- LESSON_NAV_BEGIN -->')){
   assert.match(html,/<nav class="dl-continue container" aria-label="Continue learning">/,relative+': course sequencing preserved');
   assert.doesNotMatch(html, /page-endnav-links\"?><a href=\"\/decoder\/\">All lessons<\/a>/, relative+': duplicate All lessons action');
  }
  assert.doesNotMatch(html,/<button[^>]*class="page-endnav-primary"/i,relative+': next links must be ordinary anchors');
 }
});
