#!/usr/bin/env node
/**
 * Move edits from the canonical equipment/source-master.json to existing
 * classic source files during the transition. Never rewrite Builder modules
 * with embedded logic. This is opt-in; --check is read-only.
 *
 * node scripts/sync-equipment-source-mirrors.mjs --check
 * node scripts/sync-equipment-source-mirrors.mjs --write
 *
 * After --write, regenerate derived catalogue views, run regressions and
 * review the Git diff before publication.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const master=JSON.parse(read('equipment/source-master.json'));
if(master.schemaVersion!=='1.0.0')throw new Error('Unsupported equipment master');
const format=(value)=>JSON.stringify(value,null,2);
function patchClassic(path,variable,value) {
 const original=read(path);
 const marker='const '+variable+' = ';
 const start=original.indexOf(marker);
 if(start<0)throw new Error('Missing classic data declaration in '+path);
 const valueStart=start+marker.length;
 const end=original.lastIndexOf('};');
 if(end<valueStart||original.slice(end+2).trim())
   throw new Error('Unexpected classic script structure '+path);
 // Reuse the existing JavaScript wrapper, including comments and strict mode.
 const replacement=original.slice(0,valueStart)+format(value)+original.slice(end+1);
 return replacement;
}
const outputs={
 'system-check/gear.js':patchClassic('system-check/gear.js','systemCheckGear',master.legacyGear),
 'system-check/compare/specs.js':patchClassic('system-check/compare/specs.js','compareGearDetails',master.compareDetails),
 'research/recording-input-catalog-v1.json':format(master.researchCatalog)+'\n'
};
if(process.argv.includes('--write')){
 for(const [p,content] of Object.entries(outputs)){
   if(read(p)===content)continue;
   writeFileSync(resolve(root,p),content);
   console.log('Updated source mirror '+p);
 }
} else if(process.argv.includes('--check')){
 const changed=Object.entries(outputs).filter(([p,content])=>read(p)!==content).map(([p])=>p);
 if(changed.length){
   console.error('Source mirrors require sync: '+changed.join(', '));
   process.exitCode=1;
 } else console.log('Editable master source mirrors current');
} else {
 console.error('Usage: --check (read-only) or --write (explicit sync)');
 process.exitCode=2;
}
