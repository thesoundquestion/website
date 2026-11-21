import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {evaluateSubwooferConnection,subwooferCheckerLink} from '../system-check/subwoofer/engine.mjs';
import {poweredEvidenceFor,poweredListeningAssessment} from '../system-builder/powered-output-evidence.mjs';
import {headroomEvidence} from '../system-builder/headroom-evidence.mjs';
import {shortlistExamples} from '../system-builder/recommendations.mjs';
import {configureSubExample,STEREO_SUB_EXAMPLES} from '../system-builder/stereo-subwoofer-examples.mjs';

test('model-specific RCA and 3.5 mm to sub line-input routes are confirmed only when both ends documented',()=>{
 const fixtures=[
  ['Edifier R1280DBs','Edifier T5','3.5 mm-to-dual-RCA signal cable',false],
  ['Kanto ORA','Edifier T5','Single RCA male-to-male subwoofer lead',true],
  ['WiiM Amp','Edifier T5','Single RCA male-to-male subwoofer lead',true],
  ['Denon AVR-S650H','Edifier T5','Single RCA male-to-male subwoofer lead',true]
 ];
 for(const [sourceModel,subModel,cable,highPass] of fixtures){
  const r=evaluateSubwooferConnection({sourceModel,subModel});
  assert.equal(r.status,'documented_line_route',sourceModel);
  assert.equal(r.compatible,true,sourceModel);
  assert.equal(r.highPassVerified,highPass,sourceModel);
  assert.equal(r.cable,cable);
  assert.match(r.wiring,/Sub Out/);
  assert.ok(r.sourceUrl?.startsWith('https://'));
  assert.ok(r.subUrl?.startsWith('https://'));
  const path=subwooferCheckerLink({sourceModel,subModel});
  const q=new URL(path,'https://thesoundquestion.pages.dev').searchParams;
  assert.equal(q.get('source'),sourceModel);
  assert.equal(q.get('sub'),subModel);
 }
});

test('unknown or incompatible sub signal cannot inherit Edifier T5 wiring or a safety pass',()=>{
 for(const [sourceModel,subModel] of [
  ['Unlisted amplifier','Edifier T5'],
  ['Kanto ORA','Unknown subwoofer'],
  ['Unlisted amp','Unknown subwoofer']
 ]){
  const r=evaluateSubwooferConnection({sourceModel,subModel});
  assert.equal(r.status,'unverified');
  assert.equal(r.compatible,false);
  assert.equal(r.cable,null);
  assert.equal(r.highPassVerified,false);
  assert.doesNotMatch(r.wiring,/Connect Kanto|T5 cutoff|single RCA lead/i);
 }
});

test('configurable main-speaker bass rules change with actual settings, not with the subwoofer brand',()=>{
 for(const sourceModel of ['WiiM Amp','Denon AVR-S650H']){
  const filtered=evaluateSubwooferConnection({sourceModel,subModel:'Edifier T5'});
  const full=evaluateSubwooferConnection({sourceModel,subModel:'Edifier T5',mainBassMode:'full'});
  assert.equal(filtered.compatible,true);
  assert.equal(full.compatible,true);
  assert.equal(filtered.highPassVerified,true);
  assert.equal(full.highPassVerified,false);
  assert.match(full.mains,/full-range/);
 }
 const edifier=evaluateSubwooferConnection({sourceModel:'Edifier R1280DBs',subModel:'Edifier T5'});
 assert.match(edifier.mains,/does not provide a crossover frequency/);
});

test('only exact model acoustic evidence provides a powered SPL estimate and it follows distance',()=>{
 const stereo={id:'studio-jbl',architecture:'active_studio',
  parts:[{name:'JBL 305P MkII powered studio monitor',count:2}]};
 const evidence=poweredEvidenceFor(stereo);
 assert.ok(evidence);
 assert.equal(evidence.units,2);
 assert.equal(evidence.maxPeakDb,108);
 assert.equal(evidence.maxContinuousDb,94);
 const near=poweredListeningAssessment(evidence,{level:'high',distanceFt:6});
 const far=poweredListeningAssessment(evidence,{level:'high',distanceFt:15});
 assert.equal(near.status,'estimated_suitable');
 assert.equal(far.status,'estimated_limited_reserve');
 assert.ok(near.estimatedPeakDb>far.estimatedPeakDb);
 assert.ok(near.estimatedContinuousDb>far.estimatedContinuousDb);
 assert.match(near.detail,/10% THD/);
 const verdict=headroomEvidence(stereo,{level:'high',distanceFt:6});
 assert.equal(verdict.status,'estimated_suitable');
 assert.match(verdict.text,/^Yes\./);
 assert.equal(poweredEvidenceFor({title:'Unlisted powered model',parts:[]}),null);
 assert.equal(poweredEvidenceFor({title:'JBL 305P MkII alternative MkIII',parts:[]}),null);
});

test('the full subwoofer and powered outputs use the same evaluators as their checker pages',()=>{
 const builder=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 const subPage=readFileSync(new URL('../system-check/subwoofer/app.mjs',import.meta.url),'utf8');
 const poweredPage=readFileSync(new URL('../system-check/powered/app.mjs',import.meta.url),'utf8');
 assert.match(builder,/evaluateSubwooferConnection/);
 assert.match(builder,/subwooferCheckerLink/);
 assert.match(builder,/poweredEvidenceFor/);
 assert.match(subPage,/evaluateSubwooferConnection/);
 assert.match(poweredPage,/poweredListeningAssessment/);
 assert.match(builder,/system-check\/powered\/\?/);
});

test('unlisted equipment can test reported connections but never gets a verified safety pass',()=>{
 const possible=evaluateSubwooferConnection({
  sourceModel:'Custom preamplifier',subModel:'Unknown sub',
  reportedSourceOutput:'line',reportedSubInput:'line',
  reportedSourceConnector:'rca',reportedSubConnector:'rca'
 });
 assert.equal(possible.status,'reported_possible');
 assert.equal(possible.compatible,false);
 assert.equal(possible.highPassVerified,false);
 assert.equal(possible.cable,'RCA line-level signal lead');
 const mismatch=evaluateSubwooferConnection({
  sourceModel:'Custom power amplifier',subModel:'Unknown sub',
  reportedSourceOutput:'speaker',reportedSubInput:'line'
 });
 assert.equal(mismatch.status,'incompatible');
 assert.equal(mismatch.compatible,false);
 const high=evaluateSubwooferConnection({
  sourceModel:'Custom power amplifier',subModel:'Unknown sub',
  reportedSourceOutput:'speaker',reportedSubInput:'speaker'
 });
 assert.equal(high.status,'reported_possible');
 assert.equal(high.compatible,false);
 assert.match(high.wiring,/bridged outputs/);
 const actual=evaluateSubwooferConnection({
  sourceModel:'Kanto ORA',subModel:'Edifier T5',
  reportedSourceOutput:'speaker',reportedSubInput:'speaker'
 });
 assert.equal(actual.status,'documented_line_route');
 assert.equal(actual.compatible,true);
});
test('peak-only powered manufacturer output is never reported as verified clean continuous SPL',()=>{
 const kali=poweredEvidenceFor({model:'Kali Audio LP-6 V2',
   parts:[{name:'Kali Audio LP-6 V2 (2nd Wave)',count:2}]});
 assert.ok(kali);
 const result=poweredListeningAssessment(kali,{distanceFt:6,level:'high'});
 assert.equal(result.status,'peak_only_uncertain');
 assert.equal(result.estimatedContinuousDb,null);
 assert.equal(result.marginDb,null);
 assert.doesNotMatch(result.text,/^Yes\./);
 assert.match(result.detail,/No source-qualified continuous SPL/);
 const qsc=poweredEvidenceFor({model:'QSC K12.2'});
 assert.equal(qsc.maxContinuousDb,126);
 assert.equal(qsc.maxPeakDb,132);
 const dzr=poweredEvidenceFor({model:'Yamaha DZR15'});
 assert.equal(poweredListeningAssessment(dzr,{distanceFt:15,level:'high'}).status,'peak_only_uncertain');
});
