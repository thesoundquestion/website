import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const albumPages=['lab/index.html','lab/mastering/index.html','labs/index.html','labs/formats/index.html'];
test('public labs and tools have release-ready visitor copy and indexing',()=>{
 for(const p of [...albumPages,'tools/index.html']){
  const s=read(p);
  assert.doesNotMatch(s,/review draft|not published|offline preview|local review only/i,p);
  assert.doesNotMatch(s,/name="robots" content="noindex/i,p);
  assert.match(s,/<title>.+?<\/title>/s,p);
  assert.equal((s.match(/<h1\b/g)||[]).length,1,p);
 }
});
test('AlbumDB pages cite the research paper, dataset, artist, licence and independence',()=>{
 for(const p of albumPages){
  const s=read(p);
  for(const token of ['Tom McKenzie','zenodo.org/records/19683001','AES','Paper 10278','creativecommons.org/licenses/by/4.0/'])assert.ok(s.includes(token),p+' missing '+token);
  assert.match(s,/endorsement/i,p);
 }
});
test('public hubs and demos are present in sitemap',()=>{
 const s=read('sitemap.xml');
 for(const route of ['/labs/','/lab/','/lab/mastering/','/labs/formats/','/tools/','/system-builder/'])
  assert.ok(s.includes('https://thesoundquestion.pages.dev'+route),route);
});
