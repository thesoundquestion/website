import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(join(root,path),'utf8');
const allHtml=(folder='')=>{
 const result=[];
 for(const entry of readdirSync(join(root,folder),{withFileTypes:true})){
  if(['.git','node_modules','docs','tests','deployment','ops','workers','scripts','staging'].includes(entry.name))continue;
  const sub=join(folder,entry.name);
  if(entry.isDirectory())result.push(...allHtml(sub));
  else if(sub.endsWith('.html'))result.push(sub);
 }
 return result;
};
const origin='https://thesoundquestion.com';

test('all site HTML has migrated away from the former origin and old public email',()=>{
 const files=allHtml();
 assert.ok(files.length>=49,'the 48 routes plus 404 must exist');
 for(const path of files){
  const text=read(path);
  assert.doesNotMatch(text,/thesoundquestion\.pages\.dev/,path+' still mentions former canonical host');
  assert.doesNotMatch(text,/thesoundquestion@gmail\.com/,path+' still advertises direct project inbox');
 }
});

test('all sitemap routes have matching .com canonical and social URLs',()=>{
 const map=read('sitemap.xml');
 const urls=[...map.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.ok(urls.length>=48,'expected full sitemap');
 assert.equal(new Set(urls).size,urls.length,'duplicate sitemap routes');
 for(const url of urls){
  assert.ok(url.startsWith(origin+'/'),url);
  const p=new URL(url).pathname;
  const file=p==='/'?'index.html':p.slice(1)+'index.html';
  assert.ok(existsSync(join(root,file)),file);
  const html=read(file);
  assert.ok(html.includes('rel="canonical" href="'+url+'"'),file+' canonical mismatch');
  assert.ok(html.includes('property="og:url" content="'+url+'"'),file+' social URL mismatch');
 }
 assert.match(read('robots.txt'),/Sitemap: https:\/\/thesoundquestion\.com\/sitemap\.xml/);
 assert.doesNotMatch(read('robots.txt'),/pages\.dev/);
});

test('sharing and public mail use the canonical domain without altering backend Gmail account',()=>{
 const home=read('index.html');
 assert.match(home,/https%3A%2F%2Fthesoundquestion\.com%2F/);
 assert.match(read('assets/share-site.js'),/https:\/\/thesoundquestion\.com\//);
 for(const file of ['index.html','connect/index.html','content-use/index.html','privacy/index.html']){
  assert.match(read(file),/contact@thesoundquestion\.com/);
 }
 const worker=read('workers/abx/index.mjs');
 assert.match(worker,/const ORIGIN='https:\/\/thesoundquestion\.com'/);
 assert.doesNotMatch(worker,/thesoundquestion\.pages\.dev/);
 assert.match(read('ops/gmail/INSTALL_FILTERS.gs'),/thesoundquestion@gmail\.com/);
 assert.match(read('workers/abx/pending-review-digest.gs'),/thesoundquestion@gmail\.com/);
});
