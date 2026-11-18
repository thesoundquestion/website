import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const html=read('tools/chain-check-preview/index.html');
const script=read('tools/chain-check-preview/preview.mjs');
const css=read('tools/chain-check-preview/style.css');
const build=read('scripts/build-public-site.mjs');

test('specialist preview is unlisted noindex and does not replace old checker',()=>{
  assert.match(html,/name="robots" content="noindex,nofollow"/);
  assert.match(html,/Unpublished engineering review preview/);
  assert.match(html,/not part of the public System Check/);
  assert.doesNotMatch(html,/rel="canonical"/);
});
test('recording and headphone workflows share the same generated inventory',()=>{
  assert.match(script,/loadEquipmentCatalog\(/);
  assert.match(script,/assessRecordingChain\(/);
  assert.match(script,/assessHeadphoneChain\(/);
  assert.doesNotMatch(script,/localStorage|sessionStorage|innerHTML/);
  assert.match(html,/separate editable recording track/);
  assert.match(html,/Ratings at other loads or output paths/);
});
test('all controls have labels and results announce changes to assistive technology',()=>{
  for(const id of ['workflow','capture','mic-one','mic-count','mic-two','separate',
    'headphone-model','headphone-amp','recording-check','headphone-check','status',
    'results','matched-ratings','other-ratings'])
    assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/role="status" aria-live="polite"/);
  assert.match(script,/textContent=/);
  assert.match(css,/@media\(max-width:670px\)/);
});
test('public build review tree includes code but does not include editable evidence master',()=>{
  for(const asset of [
    'equipment/recording-chain-check.mjs','equipment/headphone-chain-check.mjs',
    'tools/chain-check-preview/index.html','tools/chain-check-preview/preview.mjs',
    'tools/chain-check-preview/style.css'
  ])assert.ok(build.includes("'"+asset+"'"),'missing build asset '+asset);
  assert.match(build,/if \(parts\[0\] === 'equipment' && !equipmentRuntime\.has\(entry\)\) continue/);
});
