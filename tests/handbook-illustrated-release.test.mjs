import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const rel='library/make-audio-make-sense/make-audio-make-sense-illustrated.pdf';
const filepath=path.join(root,rel);
const expectedSha='d647ee22a1931adf45e8cf72fd25792fb10d12a8017e64d54ca105209cfeee77';
const expectedBytes=12018958;

test('approved 59-page handbook binary is exactly the reviewed release',()=>{
 assert.ok(existsSync(filepath),'Approved handbook PDF must be included before merge/release: '+rel);
 assert.equal(statSync(filepath).size,expectedBytes,'Approved handbook size changed');
 const bytes=readFileSync(filepath);
 assert.equal(bytes.subarray(0,5).toString('latin1'),'%PDF-','Not a PDF');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),expectedSha,'Wrong handbook version');
 assert.ok(bytes.subarray(-1024).toString('latin1').includes('%%EOF'),'PDF trailer missing');
});
test('all public download entry points target approved PDF, not old 3-page file',()=>{
 const old='make-audio-make-sense.pdf';
 for(const p of ['library/index.html','library/make-audio-make-sense/index.html']){
  const txt=readFileSync(path.join(root,p),'utf8');
  assert.ok(txt.includes('/'+rel),p+' missing new PDF link');
  assert.ok(!txt.includes('href="/library/make-audio-make-sense/'+old+'"'),p+' still links retired edition');
 }
 const r=readFileSync(path.join(root,'_redirects'),'utf8');
 assert.ok(r.includes('/library/make-audio-make-sense/'+old+' /'+rel+' 301'),'Old deep link not redirected');
});
