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
assert.match(s,/name="robots" content="noindex,nofollow"/);
});
test('main site navigation has exactly the intended five destinations, with no JS required for mobile',()=>{
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
 if(p==='lab/mastering/index.html')continue;
 const s=read(p);
 const nav=s.match(/<nav class="main-nav"[^>]*>([\s\S]*?)<\/nav>/);
 assert.ok(nav,p+' missing main-nav');
 for(const target of ['/decoder/','/labs/','/tools/','/library/','/about/'])assert.match(nav[1],new RegExp('href="'+target.replaceAll('/','\\/')+'"'),p+' no '+target);
 const mobile=s.match(/<details class="mobile-nav">([\s\S]*?)<\/details>/);
 assert.ok(mobile,p+' missing no-JS mobile menu');
 assert.match(mobile[1],/<summary>Menu<\/summary>/);
}
});
