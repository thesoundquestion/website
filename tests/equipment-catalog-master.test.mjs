import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {BUILDER_ONLY_SPEAKERS} from '../system-builder/supplemental-speakers.mjs';
import {BUILDER_ONLY_AMPS} from '../system-builder/supplemental-amplifiers.mjs';
import {BUILDER_ONLY_HEADPHONES} from '../system-builder/supplemental-headphones.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const object=(p,name)=>JSON.parse(read(p).split('const '+name+' = ')[1].replace(/;\s*$/,''));
const master=JSON.parse(read('equipment/source-master.json'));
const serial=value=>JSON.parse(JSON.stringify(value));

test('master contains all editable equipment source classes and no public ownership fields',()=>{
 assert.equal(master.schemaVersion,'1.0.0');
 assert.equal(master.status,'authoring_draft');
 assert.equal(master.researchCatalog.records.length,31);
 assert.equal(Object.values(master.legacyGear).flat().length,130);
 assert.equal(master.builderOnly.speakers.length+master.builderOnly.amplifiers.length+
   master.builderOnly.headphones.length,17);
 assert.ok(!Object.hasOwn(master,'userOwnership'));
});
test('legacy editable sources still match the master exactly during transition',()=>{
 assert.deepEqual(master.legacyGear,object('system-check/gear.js','systemCheckGear'));
 assert.deepEqual(master.compareDetails,object('system-check/compare/specs.js','compareGearDetails'));
 assert.deepEqual(master.researchCatalog,JSON.parse(read('research/recording-input-catalog-v1.json')));
 assert.deepEqual(master.builderOnly.speakers,serial(BUILDER_ONLY_SPEAKERS));
 assert.deepEqual(master.builderOnly.amplifiers,serial(BUILDER_ONLY_AMPS));
 assert.deepEqual(master.builderOnly.headphones,serial(BUILDER_ONLY_HEADPHONES));
 assert.match(execFileSync(process.execPath,['scripts/sync-equipment-source-mirrors.mjs','--check'],
   {cwd:root,encoding:'utf8'}),/Editable master source mirrors current/);
});
test('Builder-only device modules re-export the generated master without duplicate literals',async()=>{
 const {BUILDER_ONLY_SPEAKERS:generatedSpeakers,
        BUILDER_ONLY_AMPS:generatedAmps,
        BUILDER_ONLY_HEADPHONES:generatedHeadphones,
        ADDITIONAL_BUDGET_HEADPHONES:generatedBudget}=await import('../system-builder/catalog-supplements.generated.mjs');
 const {ADDITIONAL_BUDGET_HEADPHONES:legacyBudget}=await import('../system-builder/budget-headphones.mjs');
 assert.equal(generatedSpeakers,BUILDER_ONLY_SPEAKERS);
 assert.equal(generatedAmps,BUILDER_ONLY_AMPS);
 assert.equal(generatedHeadphones,BUILDER_ONLY_HEADPHONES);
 assert.equal(generatedBudget,legacyBudget);
 assert.deepEqual(generatedBudget.map(x=>x.model),['Koss KSC75','Koss Porta Pro (wired)']);
 for(const path of ['supplemental-speakers.mjs','supplemental-amplifiers.mjs',
   'supplemental-headphones.mjs','budget-headphones.mjs']){
   const src=read('system-builder/'+path);
   assert.match(src,/catalog-supplements\.generated\.mjs/);
   assert.doesNotMatch(src,/Object\.freeze\(\[/);
 }
});
test('master is excluded from public output and all derived views pass freshness gate',()=>{
 const script=read('scripts/build-public-site.mjs');
 assert.match(script,/equipmentRuntime/);
 assert.ok(!script.includes("'equipment/source-master.json'"));
 assert.match(execFileSync(process.execPath,['scripts/build-equipment-catalog.mjs','--check'],
   {cwd:root,encoding:'utf8'}),/Catalogue and legacy views current/);
});
