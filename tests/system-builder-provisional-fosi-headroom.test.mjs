import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shortlistExamples} from '../system-builder/recommendations.mjs';
import {OUTPUT_SCENARIOS,scenarioForPair,estimateOutputScenario,
  scenarioSystemCheckUrl} from '../system-check/illustrative-output-scenarios.mjs';
import {passivePairingReadiness} from '../system-builder/passive-evidence-readiness.mjs';
import {recommendationHeadroom} from '../system-builder/recommendation-headroom.mjs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const catalog=JSON.parse(read('../equipment/catalog.generated.json'));
const example=shortlistExamples({
  architecture:'open',useCase:'bedroom',goal:'all_rounder',level:'quiet',
  power:'mains',connection:'analog',region:'CA',currency:'CAD',budget:null,
  distanceFt:6,referenceDate:'2026-11-20',subMode:'no_sub'
},catalog).selected.find(x=>x.id==='passive-bt20a-xt15');
const power=OUTPUT_SCENARIOS['fosi-bt20a-pro-32v5a-xt15'];
const profile=catalog.records.find(x=>x.model==='Polk Monitor XT15')
  ?.profiles.find(p=>p.category==='speaker')?.values;

test('scenario is explicitly short-term provisional, not a catalog continuous rating',()=>{
 assert.equal(power.wattsPerChannel,40);
 assert.equal(power.loadOhms,8);
 assert.equal(power.evidenceClass,'provisional_short_term_bench');
 assert.match(power.supply,/32 V \/ 5 A/);
 assert.match(power.notes,/not yet validated/i);
 assert.ok(power.sources.length>=2);
 const amp=catalog.records.find(x=>x.model==='Fosi Audio BT20A Pro');
 assert.ok(amp);
 assert.equal(amp.profiles.find(p=>p.category==='amp').ratings.length,0);
});

test('only the exact 32 V Fosi/Polk curated system can access this scenario',()=>{
 assert.ok(example);
 assert.equal(scenarioForPair(example)?.id,power.id);
 assert.equal(scenarioForPair({...example,id:'different-product'}),null);
 assert.equal(scenarioForPair({...example,amplifierModel:'Yamaha A-S301'}),null);
 assert.equal(scenarioForPair({...example,speakerModel:'PSB Alpha P5'}),null);
 assert.equal(scenarioForPair({...example,architecture:'consumer_powered_pair'}),null);
});

test('6 ft Polk XT15 estimate recovers roughly +17 dB provisional peak margin',()=>{
 assert.equal(profile.sensitivity,86);
 assert.equal(profile.load,8);
 assert.equal(profile.basis,'voltage');
 const e=estimateOutputScenario(power,profile,{distanceFt:6,averageDb:65,peakDb:80});
 assert.equal(e.status,'provisional');
 assert.ok(Math.abs(e.projectedDb-96.8)<0.2);
 assert.ok(Math.abs(e.peakMarginDb-16.8)<0.2);
});

test('provisional output never becomes verified continuous ranking evidence',()=>{
 const x=passivePairingReadiness(example,catalog,example.curatedPairing);
 assert.equal(x.status,'incomplete');
 assert.deepEqual(x.missing,['amplifier continuous power at the speaker nominal load']);
});

test('Builder shows the provisional estimate without suggesting confirmed clean output',()=>{
 const x=recommendationHeadroom(example,{distanceFt:6,level:'quiet'},catalog);
 assert.equal(x.status,'provisional');
 assert.match(x.summary,/Illustrative peak margin: \+17 dB/);
 assert.match(x.summary,/not verified clean/i);
 assert.match(x.detail,/not a verified continuous-power test/i);
 assert.match(x.link,/scenario=fosi-bt20a-pro-32v5a-xt15/);
 assert.match(x.link,/distanceFt=6/);
});

test('a missing or different speaker load cannot silently inherit the scenario output',()=>{
 assert.equal(estimateOutputScenario(power,{...profile,load:4},
   {distanceFt:6,averageDb:65,peakDb:80}).status,'unverified');
 assert.equal(estimateOutputScenario(power,{...profile,sensitivity:undefined},
   {distanceFt:6,averageDb:65,peakDb:80}).status,'unverified');
});

test('deep link preserves exact amp, speaker, supply scenario and room targets',()=>{
 const link=scenarioSystemCheckUrl(power,{distanceFt:6,averageDb:65,peakDb:80});
 const params=new URL(link,'https://example.org').searchParams;
 assert.equal(params.get('scenario'),power.id);
 assert.equal(params.get('amp'),power.amplifierModel);
 assert.equal(params.get('speaker'),power.speakerModel);
 assert.equal(params.get('distanceFt'),'6');
 assert.equal(params.get('average'),'65');
 assert.equal(params.get('gap'),'15');
 assert.equal(params.get('autocheck'),null);
});

test('System Check has a provisional route without polluting the verified calculator',()=>{
 const html=read('../system-check/index.html');
 const module=read('../system-check/provisional-check.mjs');
 const normal=read('../system-check/calculator.js');
 assert.match(html,/id="sc-provisional-check"/);
 assert.match(html,/id="sc-provisional-form"/);
 assert.match(html,/id="check" class="sc-layout"/);
 assert.match(module,/estimateOutputScenario/);
 assert.match(module,/loadEquipmentCatalog/);
 assert.match(module,/sc-provisional-mode/);
 assert.match(normal,/function runModelHandoff\(\)/);
});
