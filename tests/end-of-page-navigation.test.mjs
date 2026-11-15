import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const omit=new Set(['.git','.github','staging','tests','scripts','deployment','assets','docs']);
function pages(dir=root){
 const found=[];
 for(const d of readdirSync(dir,{withFileTypes:true})){
  if(d.isDirectory()){if(!omit.has(d.name))found.push(...pages(path.join(dir,d.name)));}
  else if(d.name==='index.html')found.push(path.join(dir,d.name));
 }
 return found;
}
const read=p=>readFileSync(p,'utf8');
test('every page offers end-of-page wayfinding with a useful, local next step',()=>{
 const all=pages();
 assert.ok(all.length>=43,'expected the full published site');
 for(const file of all){
  const relative=path.relative(root,file).replaceAll('\\','/');
  const html=read(file);
  const blocks=[...html.matchAll(/<nav class="page-endnav[^"]*" aria-label="End-of-page navigation">([\s\S]*?)<\/nav>/g)];
  assert.equal(blocks.length,1,relative+': exactly one end-of-page nav');
  const block=blocks[0][1];
  assert.match(block,/href="#"[^>]*>↑ Back to top<\/a>/,relative+': missing top link');
  const m=block.match(/class="page-endnav-primary" href="([^"]+)"/);
  assert.ok(m,relative+': missing contextual action');
  assert.ok(m[1].startsWith('/'),relative+': local contextual target');
  const pathname=m[1].split('#')[0].split('?')[0];
  const target=path.resolve(root,pathname.replace(/^\//,'')+(pathname.endsWith('/')?'index.html':''));
  assert.ok(existsSync(target),relative+': nonexistent contextual destination '+m[1]);
  if(relative==='index.html')assert.doesNotMatch(block,/href="\/"[^>]*>Home<\/a>/);
  else{
   assert.match(block,/href="\/"[^>]*>Home<\/a>/,relative+': missing home link');
   assert.notEqual(pathname,'/'+relative.replace(/index.html$/,''),relative+': contextual action points to itself');
  }
  assert.ok(html.lastIndexOf('page-endnav')<html.lastIndexOf('</main>'),relative+': nav must be inside main');
 }
});
test('lesson progression remains intact and end-page buttons work without JavaScript',()=>{
 for(const file of pages()){
  const relative=path.relative(root,file).replaceAll('\\','/');
  const html=read(file);
  if(relative.startsWith('decoder/')&&relative!=='decoder/index.html'&&html.includes('<!-- LESSON_NAV_BEGIN -->')){
   assert.match(html,/<nav class="dl-continue container" aria-label="Continue learning">/,relative+': course sequencing preserved');
  }
  assert.doesNotMatch(html,/<button[^>]*class="page-endnav-primary"/i,relative+': next links must be ordinary anchors');
 }
});
