import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const navigate=(p)=>/\bclass="main-nav"/.test(read(p));
test('Tools hub contains all three existing tools and qualified educational notes',()=>{
const s=read('tools/index.html');
for(const href of ['/system-check/','/system-builder/','/system-check/compare/','/decoder/amplifier-power/','/decoder/speaker-impedance/']){
 assert.ok(s.includes('href="'+href+'"'),href);
}
assert.match(s,/educational estimates/);
assert.match(s,/name="robots" content="index,follow"/);
});
test('all site pages have exactly six consistent primary destinations including Connect, on desktop and mobile',()=>{
const skipDirs=new Set(['.git','staging','tests','.github','deployment','docs','scripts','assets', 'site-dist', '.pages-dist']);
function walk(dir=''){
 const list=[];
 for(const entry of readdirSync(path.join(root,dir),{withFileTypes:true})){
  if(entry.isDirectory()){
   if(!skipDirs.has(entry.name))list.push(...walk(path.join(dir,entry.name)));
  } else if(entry.name==='index.html')list.push(path.join(dir,entry.name).replaceAll('\\','/'));
 }
 return list;
}
const pages=walk();
for(const p of pages){
 const s=read(p);
 const nav=s.match(/<nav class="main-nav"[^>]*>([\s\S]*?)<\/nav>/);
 assert.ok(nav,p+' missing main-nav');
 const targets=['/decoder/','/labs/','/tools/','/library/','/about/','/connect/'];
 for(const target of targets) assert.ok(nav[1].includes('href="'+target+'"'),p+' missing '+target+' on desktop');
 assert.equal((nav[1].match(/<a\s/g)||[]).length,targets.length,p+' unexpected desktop primary links');
 const mobile=s.match(/<details class="mobile-nav">([\s\S]*?)<\/details>/);
 assert.ok(mobile,p+' missing no-JS mobile menu');
 assert.match(mobile[1],/<summary>Menu<\/summary>/);
 const mobileNav=mobile[1].match(/<nav aria-label="Mobile primary navigation"[^>]*>([\s\S]*?)<\/nav>/);
 assert.ok(mobileNav,p+' missing mobile navigation links');
 for(const target of targets) assert.ok(mobileNav[1].includes('href="'+target+'"'),p+' missing '+target+' on mobile');
 assert.equal((mobileNav[1].match(/<a\s/g)||[]).length,targets.length,p+' unexpected mobile primary links');
}
});

test('all three source Listening Labs use the same site logo, primary links and mobile menu semantics',()=>{
 for(const pathName of ['lab/index.html','lab/mastering/index.html','labs/formats/index.html']){
  const s=read(pathName);
  assert.match(s,/class="brand"[^>]*href="\/"[^>]*>[\s\S]*?<img[^>]*src="(?:\.\.\/assets\/mark\.svg|\/assets\/mark\.svg)"/);
  assert.match(s,/<nav class="main-nav" aria-label="Primary navigation">/);
  assert.match(s,/<details class="mobile-nav"><summary>Menu<\/summary>/);
 }
});
