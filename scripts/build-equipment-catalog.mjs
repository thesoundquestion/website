#!/usr/bin/env node
/**
 * Deterministically build the one shared equipment catalogue view.
 * This script is intentionally DATA-ONLY: it does not change the existing
 * System Check amplifier calculations, Browser UI, or publication settings.
 *
 * Usage: node scripts/build-equipment-catalog.mjs
 *        node scripts/build-equipment-catalog.mjs --check
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {composeEquipmentCatalog} from '../equipment/catalog-core.mjs';
import {checkerPresetsFromCatalog,compareDetailsFromCatalog} from '../equipment/catalog-legacy-adapters.mjs';
import {BUILDER_ONLY_SPEAKERS} from '../system-builder/supplemental-speakers.mjs';
import {BUILDER_ONLY_AMPS} from '../system-builder/supplemental-amplifiers.mjs';
import {BUILDER_ONLY_HEADPHONES} from '../system-builder/supplemental-headphones.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
function readClassicObject(path,variable) {
  // These two legacy scripts contain a JSON object assigned to a classic
  // top-level const. Extract ONLY that JSON, never execute browser JS in Node.
  const source=read(path);
  const marker='const '+variable+' = ';
  const start=source.indexOf(marker);
  if(start<0)throw new Error('Missing classic catalogue '+variable);
  const rest=source.slice(start+marker.length);
  if(!/^\{/.test(rest))throw new Error('Expected JSON object '+variable);
  const end=rest.lastIndexOf('};');
  if(end<0||rest.slice(end+2).trim())throw new Error('Unexpected trailing content: '+path);
  return JSON.parse(rest.slice(0,end+1));
}
const catalog=composeEquipmentCatalog({
  legacyGear:readClassicObject('system-check/gear.js','systemCheckGear'),
  compareDetails:readClassicObject('system-check/compare/specs.js','compareGearDetails'),
  researchCatalog:JSON.parse(read('research/recording-input-catalog-v1.json')),
  builderOnly:[...BUILDER_ONLY_SPEAKERS,...BUILDER_ONLY_AMPS,...BUILDER_ONLY_HEADPHONES]
});
const outputs={
  'equipment/catalog.generated.json':JSON.stringify(catalog,null,2)+'\n',
  // Classic script variables intentionally preserve the existing synchronous
  // Calculator, Builder and Compare interfaces. Do not edit these outputs.
  'equipment/legacy-presets.generated.js':"'use strict';\n\nconst systemCheckGear = "+
    JSON.stringify(checkerPresetsFromCatalog(catalog),null,2)+';\n',
  'equipment/compare-details.generated.js':"'use strict';\n\nconst compareGearDetails = "+
    JSON.stringify(compareDetailsFromCatalog(catalog),null,2)+';\n',
};
if(process.argv.includes('--check')) {
  let stale=false;
  for(const [path,output] of Object.entries(outputs)){
    try {
      if(read(path)===output)continue;
    } catch {}
    console.error('Stale or missing generated equipment file: '+path);
    stale=true;
  }
  if(stale)process.exitCode=1;
  else console.log('Catalogue and legacy views current: '+catalog.summary.totalModels+' unique devices');
} else {
  mkdirSync(resolve(root,'equipment'),{recursive:true});
  for(const [path,output] of Object.entries(outputs))writeFileSync(resolve(root,path),output);
  console.log('Wrote shared catalogue and classic runtime views for '+catalog.summary.totalModels+' unique devices.');
}
