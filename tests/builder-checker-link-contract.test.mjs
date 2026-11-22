import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compareCatalogHandoff} from '../system-builder/compare-handoff.mjs';
import {checkerHandoffLink} from '../system-builder/checker-handoff.mjs';

const record=(kind,id)=>({
 id,
 model:id,
 categories:kind.startsWith('powered_')?['speaker']:kind==='catalog_headphone'?['headphone']:[kind],
 facts:kind.startsWith('powered_')?{speakerKind:{value:kind}}:{}
});

test('every supported Creating Builder model type links to exact selected equipment rather than a blank checker',()=>{
 for(const kind of ['microphone','audio_interface','mixer_recorder','computer_sound_card',
   'headphone_amplifier','catalog_headphone','powered_studio_monitor','powered_pa_speaker']){
  const item=record(kind,kind+'-selected-model');
  const alt=record(kind,kind+'-comparison-model');
  const path=compareCatalogHandoff(item,alt);
  assert.ok(path,'Unsupported model type: '+kind);
  const url=new URL(path,'https://thesoundquestion.pages.dev');
  assert.equal(url.pathname,'/system-check/compare/');
  assert.equal(url.searchParams.get('type'),kind);
  assert.equal(url.searchParams.get('left'),item.id);
  assert.equal(url.searchParams.get('right'),alt.id);
 }
 assert.equal(compareCatalogHandoff({id:'unknown',categories:['fictional']}),null);
 assert.equal(compareCatalogHandoff({categories:['microphone']}),null);
});

test('never include an unrelated model as a comparison alternative',()=>{
 const mic=record('microphone','one-microphone');
 const studio=record('powered_studio_monitor','one-studio-monitor');
 const url=new URL(compareCatalogHandoff(mic,studio),'https://thesoundquestion.pages.dev');
 assert.equal(url.searchParams.get('left'),'one-microphone');
 assert.equal(url.searchParams.has('right'),false);
});

test('passive equipment gets context-preserving System Check; active systems do not get a false passive calculator',()=>{
 const gear={architecture:'passive_separates',acousticEvidence:{
   speakerModel:'Example speakers',amplifierModel:'Example amp',nominalOhms:8,
   sensitivityDb1W1m:87,continuousWattsPerChannel:60,
   reference:'catalog_same_load_full_band'
 }};
 const path=checkerHandoffLink(gear,{distanceFt:6,level:'high'});
 const q=new URL(path,'https://thesoundquestion.pages.dev').searchParams;
 for(const [key,value] of Object.entries({
  speaker:'Example speakers',amp:'Example amp',distance:'6',peak:'105',average:'85',
  builderSensitivity:'87',builderLoad:'8',builderAmpWatts:'60'
 }))assert.equal(q.get(key),value);
 for(const architecture of ['consumer_powered_pair','active_studio','party_pa','headphone_first'])
  assert.equal(checkerHandoffLink({...gear,architecture},{distanceFt:6,level:'high'}),null);
});

test('release workflow is triggered when any System Check or Builder code changes',()=>{
 const workflow=readFileSync(new URL('../.github/workflows/release-browser-preflight.yml',import.meta.url),'utf8');
 const creating=readFileSync(new URL('../system-builder/creating/app.mjs',import.meta.url),'utf8');
 const listening=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 const doc=readFileSync(new URL('../equipment/certification/CROSS_TOOL_INTEGRATION_CONTRACT.md',import.meta.url),'utf8');
 assert.match(workflow,/system-check\/\*\*/);
 assert.match(workflow,/system-builder\/\*\*/);
 assert.match(creating,/compareCatalogHandoff/);
 assert.match(listening,/checkerHandoffLink/);
 assert.match(listening,/compareCatalogHandoff/);
 assert.match(doc,/A generic link to a blank tool is not integration/);
});
