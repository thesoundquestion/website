import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const classic=(p,name)=>vm.runInNewContext(read(p)+'\n'+name,{});
const oldGear=classic('system-check/gear.js','systemCheckGear');
const newGear=classic('equipment/legacy-presets.generated.js','systemCheckGear');
const oldDetails=classic('system-check/compare/specs.js','compareGearDetails');
const newDetails=classic('equipment/compare-details.generated.js','compareGearDetails');
const serial=x=>JSON.parse(JSON.stringify(x));

test('all original preset fields, order, citations and ratings survive generated runtime conversion',()=>{
 assert.deepEqual(serial(newGear),serial(oldGear));
 assert.deepEqual(serial(newDetails),serial(oldDetails));
 assert.equal(newGear.amp.find(r=>r.model==='Yamaha A-720').ratings.length,5);
 assert.ok(newGear.amp.find(r=>r.model==='WiiM Amp').distortionResearch);
 assert.ok(newGear.speaker.find(r=>r.model==='Pioneer HPM-100').extra);
});
test('current generated catalogue and both projections are reproducible',()=>{
 assert.match(execFileSync(process.execPath,['scripts/build-equipment-catalog.mjs','--check'],{
   cwd:root,encoding:'utf8'}),/Catalogue and legacy views current/);
});
test('Builder and Checker use the shared projection rather than hand-maintained source files',()=>{
 for(const page of ['system-check/index.html','system-builder/index.html',
   'system-check/compare/index.html']){
   const html=read(page);
   assert.match(html,/\/equipment\/legacy-presets\.generated\.js/);
   assert.doesNotMatch(html,/<script[^>]+src="\/system-check\/gear\.js/);
 }
 for(const page of ['system-builder/index.html','system-check/compare/index.html']){
   const html=read(page);
   assert.match(html,/\/equipment\/compare-details\.generated\.js/);
   assert.doesNotMatch(html,/<script[^>]+src="\/system-check\/compare\/specs\.js/);
 }
 assert.match(read('system-check/index.html'),/\/system-check\/calculator\.js/);
 assert.match(read('system-builder/index.html'),/\/system-builder\/app\.mjs/);
 assert.match(read('system-check/compare/index.html'),/\/system-check\/compare\/compare\.js/);
});
test('public build supports only reviewed shared inventory runtime files',()=>{
 const code=read('scripts/build-public-site.mjs');
 for(const p of ['catalog.generated.json','legacy-presets.generated.js',
   'compare-details.generated.js','catalog-client.mjs'])assert.ok(code.includes(p));
 assert.ok(code.includes("parts[0] === 'equipment'"));
 assert.ok(!code.includes("routes.add('research')"));
});
