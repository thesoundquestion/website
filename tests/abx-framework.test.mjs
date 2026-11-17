import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),read=p=>readFileSync(path.join(root,p),'utf8');
const client=read('assets/abx-lab.js'),server=read('workers/abx/index.mjs'),doc=read('docs/abx-labs/README.md');
test('shared ABX runtime and score service parse',()=>{
 for(const p of ['assets/abx-lab.js','workers/abx/index.mjs']){
  const r=spawnSync(process.execPath,['--check',path.join(root,p)],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr||p);
 }
});
test('one dedicated ABX Lab loads the engine and links back to three original lessons',()=>{
 const page=read('labs/abx/index.html');
 assert.match(page,/data-abx-lab="all"/);
 assert.match(page,/assets\/abx-lab\.js/);
 assert.match(page,/assets\/abx-lab\.css/);
 for(const lab of ['/lab/','/lab/mastering/','/labs/formats/'])assert.ok(page.includes('href="'+lab+'"'));
 for(const file of ['lab/index.html','lab/mastering/index.html','labs/formats/index.html']){
  const html=read(file);
  assert.match(html,/href="\/labs\/abx\//);
  assert.doesNotMatch(html,/data-abx-lab=/);
  assert.doesNotMatch(html,/src="\/assets\/abx-lab\.js"/);
 }
 assert.match(client,/function configureLessonLink/);
 assert.match(client,/lesson\.href=spec\.lessonUrl/);
 assert.match(client,/history\.replaceState/);
});
test('ABX categories and training only no-public-score guard',()=>{
 for(const label of ['Training','Challenge','Advanced'])assert.ok(client.includes(label),label);
 assert.match(client,/mode==='training'/);
 assert.match(client,/Training score:/);
 assert.match(client,/Answers shown at completion/);
 assert.match(client,/This challenge could not start/);
 assert.match(client,/Start scored session/);
 assert.match(client,/View community results/);
 assert.match(client,/minimumSample|No eligible community results yet/);
 assert.doesNotMatch(client,/localStorage|sessionStorage/);
});
test('server retains validation gate, hidden answers, one-update scoring and private aggregate threshold',()=>{
 assert.match(server,/const VALIDATED=new Map\(\[/);
 assert.match(server,/!validated\.get\(data\.testId\)\?\.includes\(data\.mode\)/);
 assert.match(server,/hmac\(secret,'answer:'/);
 assert.match(server,/answered=answered\+1/);
 assert.match(server,/q\.meta\?\.changes!==1/);
 assert.match(server,/const previous=await trial/);
 assert.match(server,/\.filter\(g=>g\.sessions>=10\)/);
 assert.match(server,/s\.completed_at!==null/);
 assert.doesNotMatch(server,/Math\.random/);
});
test('unmatched loud masters excluded from proposed scoring source catalogue',()=>{
 const start=server.indexOf('const SOURCES='),end=server.indexOf('const VALIDATED');
 const catalog=server.slice(start,end);
 assert.match(catalog, /'master-dynamic-moderate-v1':\[HOST\+'\/mastering\/matched-dynamic\.flac'/);
 assert.match(catalog, /'master-moderate-brick-v1':\[HOST\+'\/mastering\/matched-moderate\.flac'/);
 assert.doesNotMatch(catalog, /'master-loud'/);
 assert.match(doc,/Unmatched deliberately loud masters are never ABX eligible/);
});
test('D1 private score schemas and deployment guards exist',()=>{
 const sql=read('workers/abx/schema.sql');
 for(const term of ['abx_sessions','control_hash','purge_at','completed_at','share','expires_at'])assert.ok(sql.includes(term));
 assert.ok(read('workers/abx/wrangler.toml').includes('[[d1_databases]]'));
 assert.ok(read('workers/abx/wrangler.toml').includes('ABX_PUBLIC_ENABLED = "false"'));
 assert.match(doc,/NOT DEPLOYED/);
});
test('public build denies private worker configuration',()=>{
 const build=read('scripts/build-public-site.mjs');
 assert.match(build,/const routes = new Set/);
 assert.doesNotMatch(build,/['"]workers['"]/);
 assert.ok(existsSync(path.join(root,'assets/abx-lab.js')));
});
