import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const sitemap=read('sitemap.xml');
const routes=[...sitemap.matchAll(/<loc>https:\/\/thesoundquestion\.com\/([^<]*)<\/loc>/g)]
  .map(m=>m[1]?m[1]+'index.html':'index.html');
const reviewOnly=['tools/chain-check-preview/','tools/equipment-comparison-preview/'];
const publicModules=[];
function visitDirectory(relative){
 const dirname=path.join(root,relative);
 if(!existsSync(dirname))return;
 for(const d of readdirSync(dirname,{withFileTypes:true})){
  const sub=path.posix.join(relative,d.name);
  if(d.isDirectory()){
   if(reviewOnly.some(prefix=>sub.startsWith(prefix.replace(/\/$/,''))))continue;
   visitDirectory(sub);
  }else if(/\.(?:js|mjs)$/.test(d.name))publicModules.push(sub);
 }
}
for(const dir of ['tools','system-builder','system-check'])visitDirectory(dir);

test('unapproved engineering preview tools are noindex and unlinked in public HTML and app modules',()=>{
 for(const route of reviewOnly){
  const s=read(route+'index.html');
  assert.match(s,/name="robots" content="noindex,nofollow"/,route);
  assert.match(s,/Unpublished .*preview|Unpublished engineering review preview/,route);
 }
 for(const file of [...routes,...publicModules]){
  const s=read(file);
  for(const route of reviewOnly){
   assert.ok(!s.includes(route),file+' must not lead visitors into '+route);
  }
 }
 assert.ok(routes.length>=54);
 assert.ok(publicModules.length>25);
});
