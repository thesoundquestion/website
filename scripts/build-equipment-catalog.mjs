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
import {isDeepStrictEqual} from 'node:util';
import {composeEquipmentCatalog} from '../equipment/catalog-core.mjs';
import {checkerPresetsFromCatalog,compareDetailsFromCatalog} from '../equipment/catalog-legacy-adapters.mjs';
import {buildRegionalPriceTiers} from '../equipment/price-tiers.mjs';
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
// Canonical authoring model. During transition, older hand-maintained source
// files must still agree exactly with this master or builds refuse to publish.
const master=JSON.parse(read('equipment/source-master.json'));
if(master.schemaVersion!=='1.0.0'||master.status!=='authoring_draft')
  throw new Error('Unsupported equipment master version');
const mirrors=[
  ['System Check',master.legacyGear,readClassicObject('system-check/gear.js','systemCheckGear')],
  ['Compare',master.compareDetails,readClassicObject('system-check/compare/specs.js','compareGearDetails')],
  ['Research',master.researchCatalog,JSON.parse(read('research/recording-input-catalog-v1.json'))],
  ['Builder speakers',master.builderOnly.speakers,BUILDER_ONLY_SPEAKERS],
  ['Builder amplifiers',master.builderOnly.amplifiers,BUILDER_ONLY_AMPS],
  ['Builder headphones',master.builderOnly.headphones,BUILDER_ONLY_HEADPHONES],
];
for(const [name,authoritative,mirror] of mirrors){
  // Builder-only module projections are themselves generated from the master.
  // Regeneration must be possible when the master has intentionally changed.
  if(!process.argv.includes('--check')&&name.startsWith('Builder '))continue;
  if(!isDeepStrictEqual(authoritative,mirror))
    throw new Error('Equipment master differs from legacy '+name+
      ' source. Reconcile before generating a release.');
}
const catalog=composeEquipmentCatalog({
  legacyGear:master.legacyGear,
  compareDetails:master.compareDetails,
  researchCatalog:master.researchCatalog,
  builderOnly:[...master.builderOnly.speakers,...master.builderOnly.amplifiers,
    ...master.builderOnly.headphones],
  curatedConnections:master.curatedConnections||[]
});
const moduleSource=`/** AUTO-GENERATED from equipment/source-master.json; do not edit. */
const products = ${JSON.stringify(master.builderOnly,null,2)};
const deepFreeze = value => {
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    for(const child of Object.values(value))deepFreeze(child);
    Object.freeze(value);
  }
  return value;
};
const freezeList = list => Object.freeze(list.map(item => deepFreeze(item)));
export const BUILDER_ONLY_SPEAKERS=freezeList(products.speakers);
export const BUILDER_ONLY_AMPS=freezeList(products.amplifiers);
export const BUILDER_ONLY_HEADPHONES=freezeList(products.headphones);
export const ADDITIONAL_BUDGET_HEADPHONES=Object.freeze(BUILDER_ONLY_HEADPHONES.filter(item=>
  item.model==='Koss KSC75'||item.model==='Koss Porta Pro (wired)'));
`;
const priceTiers={
  schemaVersion:'1.0.0',
  note:'Indicative regional relative pricing tiers only, not a performance grade, live price or availability statement.',
  regions:Object.fromEntries(['CA','US','GB','EU','AU'].map(region=>[
    region,buildRegionalPriceTiers(catalog,master.pricingResearch||{observations:[]},
      {region,asOf:'2026-11-18'})
  ]))
};
const outputs={
  'equipment/price-tiers.generated.json':JSON.stringify(priceTiers,null,2)+'\n',
  'system-builder/catalog-supplements.generated.mjs':moduleSource,
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
      // Git for Windows may convert checked-out text files to CRLF.\n      // Compare canonical content, not the platform's line-ending convention.\n      if(read(path).replace(/\r\n/g,'\n')===output.replace(/\r\n/g,'\n'))continue;
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
