import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {explainBeginnerOption} from '../system-builder/beginner-output.mjs';
import {speakerPairingEvidence} from '../system-builder/pairing-evidence.mjs';
import {unlistedSpecAssessment,catalogueGearMatches,googleGearSearchUrl} from '../system-builder/unlisted-gear.mjs';
import {subwooferConnections,knownSubExamplePlan} from '../system-builder/subwoofer-connection.mjs';
import {ampSpeakerScreening} from '../system-builder/owned-amp-speakers.mjs';
import {BUILDER_INTENTS,builderIntent,builderFieldRequirement,handoffBuilderIntent,validateBuilderIntent,scopedBuilderInputs} from '../system-builder/intent-routing.mjs';
import {GOALS,buildPath} from '../tools/find-my-setup/engine.mjs';

const find=(goal,answers)=>buildPath(goal,answers);
const fullText=plan=>[plan.description,...plan.steps.flatMap(s=>[s.name,s.why]),...plan.skip,...plan.verify,...plan.optional].join(' ');

test('all existing and new guide goals provide a documented path for every answer combination',()=>{
  let cases=0;
  for(const goal of GOALS){
    const run=(i,answers)=>{
      if(i===goal.questions.length){
        const result=find(goal.id,answers);
        assert.equal(result.goalId,goal.id);
        assert.ok(result.steps.length>0);
        assert.ok(result.learn.every(l=>l.href.startsWith('/')));
        cases++;
        return;
      }
      const q=goal.questions[i];
      for(const option of q.options)run(i+1,{...answers,[q.id]:option.value});
    };
    run(0,{});
  }
  assert.ok(cases>=300,'Expected original and four new guide routes to be covered');
});

test('vinyl with built-in phono and powered speakers does not recommend a second amp/preamp',()=>{
  const p=find('vinyl',{phono:'yes',speakers:'powered'});
  assert.match(fullText(p),/LINE output|LINE setting/i);
  assert.match(p.skip.join(' '),/second phono preamp/i);
  assert.match(p.skip.join(' '),/speaker amplifier is unnecessary/i);
  assert.equal(p.next,'sources');
});

test('vinyl raw phono route requires an appropriate stage, with conditional receiver PHONO support',()=>{
  const p=find('vinyl',{phono:'no',speakers:'receiver'});
  assert.match(fullText(p),/PHONO input|phono stage/i);
  assert.match(fullText(p),/otherwise an external phono preamp/i);
});

test('unknown vinyl phono stage requires checking instead of guessing',()=>{
  const p=find('vinyl',{phono:'unsure',speakers:'unsure'});
  assert.match(p.verify.join(' '),/whether the turntable has a built-in phono preamp/i);
});

test('speaker matching blocks unsafe powered speaker / speaker-terminal use',()=>{
  const p=find('match',{owned:'both',speakerType:'powered'});
  assert.match(fullText(p),/Never connect speaker terminals/i);
  assert.equal(p.next,'sources');
});

test('passive speaker matching directs users to existing conditional System Check',()=>{
  const p=find('match',{owned:'both',speakerType:'passive'});
  assert.equal(p.next,'check');
  assert.match(p.verify.join(' '),/not verified/i);
  assert.doesNotMatch(p.description,/guaranteed|fully safe/i);
});

test('digital path does not add a compulsory external DAC',()=>{
  const p=find('digital',{player:'computer',listen:'receiver'});
  assert.match(p.skip.join(' '),/separate DAC may be unnecessary/i);
  assert.match(p.verify.join(' '),/output and input/i);
});

test('improve existing setup starts with a no-purchase listening check',()=>{
  const p=find('improve',{problem:'harsh',gear:'passive'});
  assert.equal(p.next,'improve');
  assert.match(p.skip.join(' '),/Do not assume a new DAC, amplifier/i);
});

test('homepage links only to supported goal-guide IDs',async()=>{
  const source=await readFile(new URL('../index.html',import.meta.url),'utf8');
  const ids=[...source.matchAll(/href="\/tools\/find-my-setup\/\?goal=([a-z_]+)"/g)].map(m=>m[1]);
  assert.ok(ids.length>=6);
  for(const id of ids)assert.ok(GOALS.some(x=>x.id===id),'Unknown homepage guide goal: '+id);
});

test('Decoder landing explicitly welcomes refreshers and keeps beginner route',async()=>{
  const source=await readFile(new URL('../decoder/index.html',import.meta.url),'utf8');
  assert.match(source,/refresh what you know/i);
  assert.match(source,/No course or previous knowledge required/i);
  assert.match(source,/href="#start-here"/);
});

import {guideBuilderHref,guideBuilderContext} from '../system-builder/guide-handoff.mjs';

const newGoalIds=new Set(['match','vinyl','digital','improve','hifi','headphones','tv']);

test('every supported guide selection transfers only allowlisted category answers to the Builder',()=>{
  let paths=0;
  for(const goal of GOALS.filter(g=>newGoalIds.has(g.id))){
    const recurse=(i,answers)=>{
      if(i===goal.questions.length){
        const href=guideBuilderHref(goal.id,answers);
        assert.match(href,/^\/system-builder\/\?from=find-my-setup&intent=/);
        const context=guideBuilderContext(href.split('?')[1]);
        assert.equal(context.intent,goal.id);
        assert.deepEqual(context.answers,answers);
        assert.ok(context.title&&context.summary&&context.checks.length);
        assert.ok(!href.includes('modelId'),'No hardware or personal data is passed');
        paths++;
        return;
      }
      const q=goal.questions[i];
      for(const choice of q.options)recurse(i+1,{...answers,[q.id]:choice.value});
    };
    recurse(0,{});
  }
  assert.ok(paths>=100);
});

test('malformed, unrecognized and duplicate handoff query values are ignored',()=>{
  for(const query of [
    '?from=other&intent=vinyl&phono=yes&speakers=powered',
    '?from=find-my-setup&intent=vinyl&phono=yes',
    '?from=find-my-setup&intent=vinyl&phono=no&speakers=powered&phono=yes',
    '?from=find-my-setup&intent=vinyl&phono=<script>&speakers=powered',
    '?from=find-my-setup&intent=unknown&phono=yes&speakers=powered'
  ])assert.equal(guideBuilderContext(query),null);
  assert.equal(guideBuilderHref('vinyl',{phono:'yes',speakers:'not-a-speaker'}),'/system-builder/');
});

test('vinyl handed to Builder preserves phono requirements and does not imply complete pricing',()=>{
  const withStage=guideBuilderContext('?from=find-my-setup&intent=vinyl&phono=yes&speakers=powered');
  assert.equal(withStage.prefill.architecture,'consumer_powered_pair');
  assert.match(withStage.summary,/LINE output/);
  assert.match(withStage.checks.join(' '),/NOT include or price a turntable, cartridge or phono preamp/);
  const raw=guideBuilderContext('?from=find-my-setup&intent=vinyl&phono=no&speakers=receiver');
  assert.equal(raw.prefill.architecture,'passive_separates');
  assert.match(raw.summary,/phono stage/i);
});

test('amplifier matching and digital source routes preselect only supported system categories',()=>{
  const pair=guideBuilderContext('?from=find-my-setup&intent=match&owned=both&speakerType=passive');
  assert.equal(pair.prefill.architecture,'passive_separates');
  assert.match(pair.checks.join(' '),/System Check/);
  const digital=guideBuilderContext('?from=find-my-setup&intent=digital&player=computer&listen=powered');
  assert.equal(digital.prefill.architecture,'consumer_powered_pair');
  assert.match(digital.checks.join(' '),/separate DAC unnecessary/);
});

test('improve route passes a listening priority and owned gear category, not a diagnosis',()=>{
  const p=guideBuilderContext('?from=find-my-setup&intent=improve&problem=bass&gear=passive');
  assert.deepEqual(p.prefill,{architecture:'passive_separates',goal:'bass'});
  assert.match(p.checks.join(' '),/cannot identify the cause/);
});

test('guide and Builder reference the same explicit handoff contract without storage',async()=>{
  const source=await readFile(new URL('../tools/find-my-setup/app.mjs',import.meta.url),'utf8');
  const builder=await readFile(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  assert.match(source,/guideBuilderHref\(plan.goalId,answers\)/);
  assert.match(builder,/guideBuilderContext\(window.location.search\)/);
  assert.match(builder,/guideHandoff.prefill/);
  assert.match(builder,/phono-preamp prices are NOT included/);
  for(const script of [source,builder])
    assert.doesNotMatch(script,/\b(?:localStorage|sessionStorage|XMLHttpRequest|sendBeacon)\b/);
});

test('listening level dropdown explains 80, 85 and 110 dB without treating a peak as an average',async()=>{
  const page=await readFile(new URL('../system-builder/index.html',import.meta.url),'utf8');
  const css=await readFile(new URL('../system-builder/style.css',import.meta.url),'utf8');
  const start=page.indexOf('<select name="level">');
  const ref=page.indexOf('id="sb-listening-reference-title"');
  const next=page.indexOf('<select name="connection">');
  assert.ok(start>=0&&ref>start&&next>ref,'Level explanation should be immediately after its dropdown');
  for(const term of ['80 dBA','85 dBA','110 dB','LAeq','dBA','dBC','Z-weighting','not</em> an 110 dBA listening average'])
    assert.ok(page.includes(term),'Missing sound-level explanation: '+term);
  assert.match(page,/Phone microphones, cases and automatic processing differ/);
  assert.match(page,/not a reliable way to verify a 110 dB transient/);
  assert.match(page,/not automatically the same as its unweighted dB SPL target/);
  assert.match(page,/cdc\.gov\/niosh\/noise\/about\/app\.html/);
  assert.match(page,/f-droid\.org\/en\/packages\/org\.noise_planet\.noisecapture/);
  assert.match(page,/www\.who\.int\/news-room\/questions-and-answers\/item\/deafness-and-hearing-loss-safe-listening/);
  assert.match(css,/\.sb-listening-examples\{display:grid/);
  assert.match(css,/@media\(max-width:650px\)\{\.sb-listening-examples\{grid-template-columns:minmax\(0,1fr\)\}\}/);
  assert.match(page,/name="level"[^>]*>/);
});


test('beginner system results explain why, roles, uncertain pairing and first risks',()=>{
  const candidate={
    id:'example-passive',architecture:'passive_separates',
    why:'A speaker pair plus integrated amplifier for a small listening room.',
    kind:'New system example',connectionStatus:'verified',editorialGoalFocus:true,secondaryFocus:[],
    parts:[{name:'Passive speaker stereo pair',count:1,role:'Two speakers'},{name:'Integrated amplifier',count:1,role:'Power, inputs and volume'}],
    extra:['Confirm speaker cable is available.'],tradeoff:'Speaker impedance curve not fully verified.'
  };
  const x=explainBeginnerOption(candidate,{goal:'imaging',subMode:'no_sub'});
  assert.match(x.status,/A possible setup/);
  assert.match(x.technicalEvidence,/small listening room/);
  assert.match(x.rolePath,/amplifier.*two speakers/);
  assert.equal(x.roles.length,2);
  assert.match(x.matchingEvidence,/have not established that these exact models are an electrical match/);
  assert.match(x.firstChecks.join(' '),/speaker|amplifier|impedance/i);
  assert.ok(x.costAndTradeoffs.some(x=>/complete, current regional price/i.test(x)));
  assert.ok(!/guaranteed compatible|perfect sound|100% match/i.test(JSON.stringify(x)));
});

test('owned gear keeps the reuse option but elevates known load concerns first',()=>{
  const x=explainBeginnerOption({
    id:'owned-complete',architecture:'passive_separates',
    ownershipMessage:'Keep your speakers and amplifier for inspection.',
    loadCaution:'The amp requires 8 ohm speakers and this pair has a verified 4 ohm nominal rating.',
    parts:[{name:'Your speakers',role:'Existing stereo speakers',count:1},{name:'Your amp',role:'Existing integrated amp',count:1}],
    tradeoff:'Check documentation and do not connect without approval.',extra:[]
  },{subMode:'no_sub'});
  assert.equal(x.priority,'critical');
  assert.equal(x.status,'Check this pairing before connecting');
  assert.equal(x.reuse,true);
  assert.match(x.firstChecks[0],/8 ohm speakers/);
});

test('powered and studio paths prevent costly or unsafe beginner assumptions',()=>{
  const powered=explainBeginnerOption({
    id:'powered-example',architecture:'consumer_powered_pair',why:'Simple wired stereo pair',
    parts:[{name:'Powered stereo pair',role:'Built-in amplification',count:1}],extra:[],tradeoff:'No Bluetooth'
  },{});
  assert.match(powered.rolePath,/do not need to buy a separate amplifier/i);
  assert.match(powered.checks.join(' '),/Never connect the speaker outputs of another amplifier/i);
  const monitors=explainBeginnerOption({
    id:'studio',architecture:'active_studio',why:'A pair for nearfield listening',
    parts:[{name:'Studio monitor',role:'Sold per cabinet',count:2}],extra:[]
  },{});
  assert.match(monitors.checks.join(' '),/buying TWO speakers/);
  assert.ok(monitors.roles[0].startsWith('2 ×'));
  assert.ok(monitors.costAndTradeoffs.some(x=>/per cabinet/i.test(x)));
});

test('exact-load power figure is qualified, never treated as real-speaker safety',()=>{
  const x=explainBeginnerOption({
    architecture:'passive_separates',id:'amp-speaker',parts:[],extra:[],
    amplifierFit:{amp:{exact:true,watts:80,ohms:8},speaker:{}}
  },{});
  assert.match(x.matchingEvidence,/80 W\/channel/);
  assert.match(x.matchingEvidence,/does not prove/);
});

test('extra adapters and unverified source inputs take priority over shopping',()=>{
  const x=explainBeginnerOption({
    architecture:'consumer_powered_pair',connectionStatus:'adapter_needed',
    sourceCaution:'Your streamer has a digital-only output.',
    id:'powered',parts:[],extra:[],tradeoff:'Verify the input types.'
  },{});
  assert.equal(x.status,'You may need another connection');
  assert.match(x.firstChecks.join(' '),/music player may not plug straight/);
  assert.ok(x.firstChecks.join(' ').includes('converts the signal'));
  assert.ok(x.costAndTradeoffs.some(x=>/priced separately/.test(x)));
});

test('compact recommendations put source-backed sound, why and connection before optional technical detail',async()=>{
  const app=await readFile(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  const page=await readFile(new URL('../system-builder/index.html',import.meta.url),'utf8');
  const start=app.indexOf('const renderSimpleCard=(item,top)=>');
  const end=app.indexOf('panel.append(renderSimpleCard',start);
  const card=app.slice(start,end);
  assert.ok(start>0&&end>start);
  assert.ok(card.indexOf('card.append(listening)')<card.indexOf('card.append(why)'));
  assert.ok(card.indexOf('card.append(why)')<card.indexOf("addText(card,'p',data.connection"));
  assert.ok(card.indexOf("addText(card,'p',data.connection")<card.indexOf("const technical=el('details'"));
  assert.match(app,/const shortlist=removeUnsafeRecommendations/);
  assert.ok(app.includes('explainBeginnerOption(item,request)'));
  assert.match(page,/Your system options, explained/);
  assert.match(page,/Show me options for my goal/);
});

test('task-first Builder asks what is being purchased and only exposes relevant questions',async()=>{
  const page=await readFile(new URL('../system-builder/index.html',import.meta.url),'utf8');
  const app=await readFile(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  assert.match(page,/<h2 id="sb-intent-heading">What are you looking for\?<\/h2>/);
  assert.match(page,/<select name="buildIntent" id="sb-build-intent" required>/);
  assert.match(page,/id="sb-quick-setup"[^>]*hidden/);
  assert.match(page,/<details class="sb-advanced-form"/);
  assert.match(page,/id="sb-actions" hidden/);
  assert.match(app,/const route=builderIntent\(id\)/);
  assert.match(app,/showQuickNode\(node\)/);
  assert.match(app,/scopedBuilderInputs\(raw,intentSelect.value,advanced.open\)/);
  assert.match(app,/validateBuilderIntent\(intentSelect.value,raw\)/);
});
test('shopping for an amplifier requires speakers only, not amplifier details',()=>{
  const plan=builderIntent('amp_for_speakers');
  assert.equal(plan.requiredOwn,'speaker');
  assert.ok(plan.fields.includes('speaker'));
  assert.ok(!plan.fields.includes('amp'));
  const data=new FormData();
  data.set('speaker','Polk ES15');
  data.set('amp','Old amp accidentally left selected');
  data.set('architecture','open');
  assert.deepEqual(validateBuilderIntent('amp_for_speakers',data),{ok:true,message:''});
  const scope=scopedBuilderInputs(data,'amp_for_speakers');
  assert.equal(scope.get('speaker'),'Polk ES15');
  assert.equal(scope.get('amp'),'');
  assert.equal(scope.get('architecture'),'passive_separates');
});
test('shopping for speakers requires amplifier only, not speaker specifications',()=>{
  const plan=builderIntent('speakers_for_amp');
  assert.equal(plan.requiredOwn,'amp');
  assert.ok(plan.fields.includes('amp'));
  assert.ok(!plan.fields.includes('speaker'));
  const data=new FormData();
  data.set('amp','Yamaha A-720');
  data.set('speaker','Stale speaker from another goal');
  assert.deepEqual(validateBuilderIntent('speakers_for_amp',data),{ok:true,message:''});
  const scope=scopedBuilderInputs(data,'speakers_for_amp');
  assert.equal(scope.get('amp'),'Yamaha A-720');
  assert.equal(scope.get('speaker'),'');
  assert.equal(scope.get('architecture'),'passive_separates');
});
test('only the equipment the visitor wants to shop for must be absent from inventory',()=>{
  const missing=new FormData();
  assert.equal(validateBuilderIntent('amp_for_speakers',missing).ok,false);
  assert.match(validateBuilderIntent('amp_for_speakers',missing).message,/speakers.*sourced catalogue/i);
  assert.equal(validateBuilderIntent('speakers_for_amp',missing).ok,false);
  assert.equal(validateBuilderIntent('complete_system',missing).ok,true);
  assert.equal(validateBuilderIntent('headphones',missing).ok,false);
  missing.set('headphoneAmpChoice','unsure');
  assert.equal(validateBuilderIntent('headphones',missing).ok,false);
  missing.set('headphoneDacChoice','unsure');
  assert.equal(validateBuilderIntent('headphones',missing).ok,true);
  assert.equal(validateBuilderIntent('improve_existing',missing).ok,true);
});
test('unlisted model name alone cannot drive amplifier suggestions',()=>{
  const d=new FormData();
  d.set('speakerOther','Vintage speaker exact model');
  assert.equal(validateBuilderIntent('amp_for_speakers',d).ok,false);
  assert.match(validateBuilderIntent('amp_for_speakers',d).message,/manual|specification|source/i);
  d.set('speakerSpecUrl','https://maker.example/speakers/manual');
  assert.equal(validateBuilderIntent('amp_for_speakers',d).ok,false);
  d.set('speakerLoad','8');
  assert.equal(validateBuilderIntent('amp_for_speakers',d).ok,false,'speaker type is needed');
  d.set('speakerPowerType','passive');
  assert.equal(validateBuilderIntent('amp_for_speakers',d).ok,true);
  const v=unlistedSpecAssessment('speaker',d);
  assert.equal(v.state,'provisional');
  assert.equal(v.record.values.load,8);
  assert.equal(v.record.userEntered,true);
  assert.equal(v.record.evidence,'user_entered_unverified');
  const scoped=scopedBuilderInputs(d,'amp_for_speakers');
  assert.equal(scoped.get('speakerOther'),'Vintage speaker exact model');
  assert.equal(scoped.get('speakerLoad'),'8');
  assert.equal(scoped.get('ampOther'),'');
});
test('unlisted amplifier requires comparable source-backed electrical figures',()=>{
  const d=new FormData();
  d.set('ampOther','Old receiver');
  d.set('ampSpecUrl','https://maker.example/receivers/manual.pdf');
  d.set('ampMinLoad','6');
  assert.equal(validateBuilderIntent('speakers_for_amp',d).ok,false);
  d.set('ampRatedWatts','80');
  d.set('ampRatedLoad','8');
  assert.equal(validateBuilderIntent('speakers_for_amp',d).ok,true);
  const v=unlistedSpecAssessment('amp',d);
  assert.equal(v.state,'provisional');
  assert.equal(v.record.userNominalFloor,6);
  assert.deepEqual(v.record.ratings,[[80,8,'continuous']]);
  assert.equal(v.record.details,null);
  const manualScreen=ampSpeakerScreening({name:v.model,record:v.record});
  assert.equal(manualScreen.discoveryFloor,6);
  assert.equal(manualScreen.explicitNominalFloor,null);
  assert.equal(manualScreen.userSupplied,true);
  assert.equal(manualScreen.minPublishedTestOhms,null);
});
test('gear search finds exact listed models and Google URL is a user-initiated discovery aid',()=>{
  const matches=catalogueGearMatches([{model:'Yamaha A-720'},{model:'Sony STR-DH190'},{model:'Yamaha R-S202'}],'yamaha a 720');
  assert.equal(matches[0]?.model,'Yamaha A-720');
  assert.equal(catalogueGearMatches([{model:'Yamaha A-720'}],'nosuch').length,0);
  const url=googleGearSearchUrl('speaker','Paradigm Phantom v1');
  assert.match(url,/google\.com\/search\?q=/);
  assert.match(new URL(url).searchParams.get('q'),/Paradigm Phantom v1/);
});
test('speaker and amplifier provisional figures never earn manufacturer-confirmed pairing labels',()=>{
  const d=new FormData();
  d.set('ampOther','Unlisted amplifier');d.set('ampSpecUrl','https://maker.example/manual');
  d.set('ampMinLoad','8');d.set('ampRatedWatts','70');d.set('ampRatedLoad','8');
  const amp=unlistedSpecAssessment('amp',d).record;
  const p=speakerPairingEvidence({record:amp},
    ampSpeakerScreening({name:'Unlisted amplifier',record:amp}),
    {url:'https://speaker.example/specifications',values:{load:8,minimum:6}});
  assert.equal(p.level,'needs_review');
  assert.equal(p.provisional,true);
  assert.doesNotMatch(p.label,/good basic match/i);
});
test('new shopping intent cannot inherit irrelevant hidden product values',()=>{
  const d=new FormData();
  d.set('speaker','Speakers for another task');
  d.set('amp','Existing amp');
  d.set('source','Digital source');
  d.set('headphone','Headphones');
  d.append('secondary','dynamic');
  d.set('subMode','sub_unknown');
  const ampForSpeakers=scopedBuilderInputs(d,'amp_for_speakers');
  assert.equal(ampForSpeakers.get('amp'),'');
  assert.equal(ampForSpeakers.get('source'),'');
  assert.equal(ampForSpeakers.get('speaker'),'Speakers for another task');
  assert.equal(ampForSpeakers.has('secondary'),false);
  assert.equal(ampForSpeakers.get('subMode'),'no_sub');
  const complete=scopedBuilderInputs(d,'complete_system');
  assert.equal(complete.get('speaker'),'');
  assert.equal(complete.get('amp'),'');
  const advanced=scopedBuilderInputs(d,'amp_for_speakers',true);
  assert.equal(advanced.get('amp'),'','No target amplifier should be counted as already owned');
  assert.equal(advanced.get('source'),'Digital source','Advanced source choice is preserved');
});
test('guide-to-Builder handoff enters the correct task based on owned equipment',()=>{
  assert.equal(handoffBuilderIntent({intent:'match',answers:{owned:'amp'}}),'speakers_for_amp');
  assert.equal(handoffBuilderIntent({intent:'match',answers:{owned:'speakers'}}),'amp_for_speakers');
  assert.equal(handoffBuilderIntent({intent:'match',answers:{owned:'both'}}),'improve_existing');
  assert.equal(handoffBuilderIntent({intent:'headphones',answers:{}}),'headphones');
  assert.equal(handoffBuilderIntent({intent:'vinyl',answers:{}}),'complete_system');
});
test('a source connection is routed to appropriate guidance, not a fabricated shopping match',()=>{
  assert.equal(BUILDER_INTENTS.source_connections.directRoute,true);
  const d=new FormData();
  assert.equal(validateBuilderIntent('source_connections',d).ok,false);
});
test('an ordinary 8-ohm speaker meets the amplifier maker’s 8-ohm minimum without demanding an impedance lecture',()=>{
  const amp={record:{ratings:[[80,8,'continuous']]}};
  const speaker={url:'https://example.org/manual',values:{load:8,minimum:6.5}};
  const p=speakerPairingEvidence(amp,{explicitNominalFloor:8,minPublishedTestOhms:8},speaker);
  assert.equal(p.level,'basic_match');
  assert.match(p.label,/Good basic match/);
  assert.match(p.plainWhy,/published requirements line up for a single speaker pair/);
  const summary=explainBeginnerOption({
    id:'owned-speaker-test',architecture:'passive_separates',pairingEvidence:p,
    loadCaution:'Details can be consulted',extra:[],parts:[]
  },{goal:'all_rounder'});
  assert.match(summary.status,/Good basic match/);
  assert.doesNotMatch(summary.matchingEvidence,/minimum impedance|impedance curve/i);
  assert.notEqual(summary.priority,'critical');
});
test('an unavailable minimum does not nullify matching published 8-ohm nominal ratings',()=>{
  const p=speakerPairingEvidence({record:{ratings:[[60,8,'continuous']]}},
    {explicitNominalFloor:8,minPublishedTestOhms:8},
    {url:'https://example.org/manual',values:{load:8}});
  assert.equal(p.level,'basic_match');
  assert.equal(p.demandingMinimum,false);
});
test('an unusually low measured impedance is a specific exception, not the standard beginner match',()=>{
  const p=speakerPairingEvidence({record:{ratings:[[60,8,'continuous']]}},
    {explicitNominalFloor:8,minPublishedTestOhms:8},
    {url:'https://example.org/manual',values:{load:8,minimum:3.5}});
  assert.equal(p.level,'needs_review');
  assert.equal(p.demandingMinimum,true);
  assert.match(p.plainWhy,/unusually low/);
});

test('subwoofer task asks only for existing gear and actual signal connections',async()=>{
  const route=builderIntent('subwoofer');
  assert.ok(route&&route.dedicatedSubRoute);
  assert.ok(route.fields.includes('amp')&&route.fields.includes('speaker'));
  assert.ok(route.fields.includes('subAmpOutput')&&route.fields.includes('subInput'));
  assert.ok(!route.fields.includes('ampRatings')&&!route.fields.includes('speakerWatts'));
  const d=new FormData();
  d.set('amp','Existing integrated amp');
  d.set('speaker','Existing stereo pair');
  d.set('subAmpOutput','speaker_only');
  d.set('subInput','rca_line');
  assert.equal(validateBuilderIntent('subwoofer',d).ok,true);
  const x=scopedBuilderInputs(d,'subwoofer');
  assert.equal(x.get('amp'),'Existing integrated amp');
  assert.equal(x.get('speaker'),'Existing stereo pair');
  assert.equal(x.get('subMode'),'plan_sub');
  const page=await readFile(new URL('../system-builder/index.html',import.meta.url),'utf8');
  const app=await readFile(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  assert.match(page,/<option value="subwoofer">Add a subwoofer to my system<\/option>/);
  for(const name of ['subAmpOutput','subInput','subHighPass','subName'])
    assert.ok(page.includes('name="'+name+'"'));
  assert.match(app,/dedicatedSubReport\(data\)/);
  assert.match(app,/renderSubwooferWiring\(subDetail,modelPlan/);
  assert.match(app,/card\.append\(subDetail\)/);
});
test('dedicated RCA subwoofer output and compatible RCA input means one simple lead',()=>{
  const x=subwooferConnections({ampOutput:'sub_rca',subInput:'rca_line'});
  assert.equal(x.kind,'direct_rca');
  assert.equal(x.direct,true);
  assert.match(x.signal,/Sub Out/);
  assert.match(x.cable,/one RCA/i);
  assert.match(x.mainBass,/main speakers will normally keep playing bass/i);
  assert.equal(x.bassStatus,'not_verified');
});
test('speaker terminals into an RCA-only subwoofer must not be recommended as a direct wire',()=>{
  const x=subwooferConnections({ampOutput:'speaker_only',subInput:'rca_line'});
  assert.equal(x.kind,'converter');
  assert.equal(x.direct,false);
  assert.match(x.signal,/Connecting them directly can damage equipment/);
  assert.match(x.cable,/speaker-to-line-level converter/);
  assert.match(x.next,/speaker-level inputs/);
});
test('high-level subwoofer input requires additional speaker wire and amp topology check',()=>{
  const x=subwooferConnections({ampOutput:'speaker_only',subInput:'speaker_high'});
  assert.equal(x.kind,'speaker_level');
  assert.equal(x.direct,true);
  assert.match(x.cable,/Extra left\/right speaker wire/);
  assert.match(x.next,/differential or Class-D/);
  assert.notEqual(x.bassStatus,'supported_when_configured');
});
test('stereo PRE OUT is different from SUB OUT, REC OUT and speaker outputs',()=>{
  const x=subwooferConnections({ampOutput:'preout_rca',subInput:'rca_line'});
  assert.equal(x.kind,'stereo_preout');
  assert.match(x.cable,/two RCA leads/);
  assert.match(x.next,/not fixed REC OUT/);
  assert.match(x.warnings.join(' '),/does not automatically filter bass/);
});
test('documented WiiM Amp and Edifier T5 give supported mono RCA route and configurable main high pass',()=>{
  const x=subwooferConnections({ampName:'WiiM Amp',subName:'Edifier T5'});
  assert.equal(x.kind,'direct_rca');
  assert.equal(x.verifiedModelPath,true);
  assert.equal(x.bassStatus,'supported_when_configured');
  assert.match(x.mainBass,/Main Speakers Output Bass/);
  assert.ok(x.sourceLinks.length>=2);
});
test('Kanto ORA and Edifier R1280DBs have distinct published main-speaker bass information',()=>{
  const ora=knownSubExamplePlan('stereo-sub-ora');
  assert.equal(ora.bassStatus,'supported_when_configured');
  assert.match(ora.mainBass,/100 Hz/);
  const edifier=knownSubExamplePlan('stereo-sub-edifier');
  assert.equal(edifier.bassStatus,'not_verified');
  assert.match(edifier.mainBass,/no verified crossover setting or high-pass curve/);
  const wiim=knownSubExamplePlan('stereo-sub-wiim');
  assert.equal(wiim.bassStatus,'supported_when_configured');
});
test('Edifier T5 line-level input cannot be treated as a speaker-level input',()=>{
  const x=subwooferConnections({ampOutput:'speaker_only',subName:'Edifier T5'});
  assert.equal(x.input,'rca_line');
  assert.equal(x.kind,'converter');
  assert.equal(x.direct,false);
  assert.match(x.warnings.join(' '),/NO documented speaker-level input/);
});
test('user saying high-pass exists does not confer manufacturer-verified high pass',()=>{
  const x=subwooferConnections({ampOutput:'sub_rca',subInput:'rca_line',highPass:'documented'});
  assert.equal(x.bassStatus,'user_claim_unverified');
  assert.match(x.mainBass,/Confirm the exact manual/);
  const y=subwooferConnections({ampOutput:'sub_rca',subInput:'rca_line',highPass:'none'});
  assert.equal(y.bassStatus,'not_present');
});
test('known model conflicts with user signal selection trigger review, not silent certification',()=>{
  const x=subwooferConnections({ampName:'WiiM Amp',subName:'Edifier T5',ampOutput:'speaker_only'});
  assert.equal(x.wiringStatus,'review');
  assert.equal(x.verifiedModelPath,false);
  assert.ok(x.warnings.some(x=>/do not agree/.test(x)));
});
test('no known amp or sub sockets means check first, not a made-up purchase plan',()=>{
  const x=subwooferConnections({ampName:'Some unlisted amp',subName:'Some unknown sub'});
  assert.equal(x.kind,'check');
  assert.equal(x.direct,false);
  assert.equal(x.sourceLinks.length,0);
  assert.match(x.next,/back panels/);
});

test('all visible Builder dropdowns and typed fields receive task-sensitive Required or Optional labels',async()=>{
  const app=await readFile(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  const page=await readFile(new URL('../system-builder/index.html',import.meta.url),'utf8');
  const styles=await readFile(new URL('../system-builder/style.css',import.meta.url),'utf8');
  assert.match(app,/function updateFieldRequirements\(\)/);
  assert.match(app,/form\.querySelectorAll\('label\.sb-field'\)/);
  assert.match(app,/status\.textContent=messages\[rule\]/);
  assert.match(app,/field\.required=rule==='required'/);
  assert.match(page,/id="sb-required-group-help"/);
  assert.match(page,/data-gear-searches="speaker"/);
  assert.match(page,/data-gear-searches="amp"/);
  assert.match(app,/unlistedSpecAssessment\(kind,data\)/);
  assert.match(app,/showQuickNode\(document\.getElementById\('sb-'/);
  assert.match(styles,/\.sb-field-requirement\[data-requirement="required_either"\]/);
  assert.ok(!/<input[^>]*name="distanceFt"[^>]*\brequired\b/.test(page),
    'Listening distance is defaulted and must not secretly block submission');
});
test('finding an amp requires identification of owned speakers, either by dropdown OR typed name',()=>{
  assert.equal(builderFieldRequirement('amp_for_speakers','buildIntent'),'required');
  assert.equal(builderFieldRequirement('amp_for_speakers','speaker'),'required_either');
  assert.equal(builderFieldRequirement('amp_for_speakers','speakerOther'),'optional_alternative');
  assert.equal(builderFieldRequirement('amp_for_speakers','speakerLoad'),'required_if_unlisted');
  assert.equal(builderFieldRequirement('amp_for_speakers','speakerSpecUrl'),'optional');
  for(const name of ['amp','ampOther','budget','goal','level','distanceFt','region','subInput'])
    assert.equal(builderFieldRequirement('amp_for_speakers',name),'optional',name);
  const d=new FormData();
  assert.equal(validateBuilderIntent('amp_for_speakers',d).ok,false);
  d.set('speakerOther','My unlisted speakers');
  assert.equal(validateBuilderIntent('amp_for_speakers',d).ok,false);
  d.set('speakerOther','');d.set('speaker','A catalog speaker pair');
  assert.equal(validateBuilderIntent('amp_for_speakers',d).ok,true);
});
test('finding speakers makes only the existing amplifier identity necessary',()=>{
  assert.equal(builderFieldRequirement('speakers_for_amp','amp'),'required_either');
  assert.equal(builderFieldRequirement('speakers_for_amp','ampOther'),'optional_alternative');
  assert.equal(builderFieldRequirement('speakers_for_amp','ampRatedWatts'),'required_if_unlisted');
  assert.equal(builderFieldRequirement('speakers_for_amp','ampSpecUrl'),'optional');
  for(const name of ['speaker','speakerOther','budget','distanceFt','level'])
    assert.equal(builderFieldRequirement('speakers_for_amp',name),'optional');
  const d=new FormData();
  assert.equal(validateBuilderIntent('speakers_for_amp',d).ok,false);
  d.set('ampOther','An old integrated amplifier');
  assert.equal(validateBuilderIntent('speakers_for_amp',d).ok,false);
});
test('subwoofer and complete-system tasks mark connector and specification details optional',()=>{
  for(const intent of ['subwoofer','complete_system','improve_existing','headphones']){
    for(const field of ['amp','ampOther','speaker','speakerOther','subName','subAmpOutput','subInput','subHighPass','budget','distanceFt'])
      assert.equal(builderFieldRequirement(intent,field),'optional',intent+' '+field);
    assert.equal(builderFieldRequirement(intent,'buildIntent'),'required');
  }
  assert.equal(builderFieldRequirement('source_connections','subInput'),'optional');
  assert.equal(builderFieldRequirement('','buildIntent'),'required');
});


test('unlisted source and headphone searches produce provisional facts instead of name-only records',()=>{
  const source=new FormData();
  source.set('sourceOther','Unlisted network streamer');
  source.set('sourceSpecUrl','https://example.org/network-streamer-manual');
  source.set('sourceOutput','RCA');
  const a=unlistedSpecAssessment('source',source);
  assert.equal(a.state,'provisional');
  assert.equal(a.record.values.sourceConnection,'RCA');
  assert.equal(a.record.userEntered,true);
  const hp=new FormData();
  hp.set('headphoneOther','Unlisted studio headphone');
  hp.set('headphoneSpecUrl','https://example.org/headphone-manual');
  hp.set('headphoneLoad','80');
  hp.set('headphoneSensitivity','100');
  const partial=unlistedSpecAssessment('headphone',hp);
  assert.equal(partial.state,'provisional');
  assert.equal(partial.record.values.sensitivity,null,
    'missing dB/mW vs dB/V means no reliable drive estimate');
  assert.equal(partial.record.values.reportedSensitivity,100);
  hp.set('headphoneBasis','power');
  const h=unlistedSpecAssessment('headphone',hp);
  assert.equal(h.state,'provisional');
  assert.deepEqual(h.record.values,{load:80,sensitivity:100,basis:'power',reportedSensitivity:100});
  assert.equal(h.record.evidence,'user_entered_unverified');
  assert.match(new URL(googleGearSearchUrl('headphone',h.model)).searchParams.get('q'),/headphones|sensitivity/);
});
test('improving an existing system preserves source and headphone catalogue or manual facts',()=>{
  const d=new FormData();
  d.set('sourceOther','Unlisted CD player');
  d.set('sourceSpecUrl','https://example.org/cd-player-specifications');
  d.set('sourceOutput','RCA');
  d.set('headphoneOther','Unlisted headphones');
  d.set('headphoneSpecUrl','https://example.org/headphone-manual');
  d.set('headphoneLoad','32');
  d.set('headphoneSensitivity','100');
  d.set('headphoneBasis','power');
  const scoped=scopedBuilderInputs(d,'improve_existing');
  assert.equal(scoped.get('sourceOutput'),'RCA');
  assert.equal(scoped.get('headphoneLoad'),'32');
  assert.equal(validateBuilderIntent('improve_existing',d).ok,true);
});
test('search UI covers all owned gear classes without auto-import claims',async()=>{
  const page=await readFile(new URL('../system-builder/index.html',import.meta.url),'utf8');
  const app=await readFile(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  for(const kind of ['speaker','amp','source','headphone']){
    assert.match(page,new RegExp('data-gear-searches="'+kind+'"'));
    assert.match(page,new RegExp('data-gear-matches="'+kind+'"'));
    assert.match(page,new RegExp('name="'+kind+'SpecUrl"'));
  }
  assert.match(app,/for\(const kind of \['speaker','amp','source','headphone'\]\)/);
  assert.match(page,/not.*automatically import|never scrape|cannot automatically import/i);
});

test('a source-backed amp card does not repeat empty warnings',()=>{
  const option={id:'owned-speaker-amp-yamaha-a-s501',architecture:'passive_separates',
    amplifierModel:'Yamaha A-S501',speakerModel:'Paradigm Phantom v1',
    amplifierReason:'85 W/channel at 8 Ω',
    manualPairing:{supported:true,statement:'8 Ω within published one-pair range'},
    amplifierFit:{amp:{exact:true,watts:85,ohms:8},speaker:{watts:90}},
    parts:[],extra:[],levelCaution:false};
  const view=explainBeginnerOption(option,{goal:'dynamic',level:'high'});
  assert.equal(view.status,'Published nominal-load match');
  assert.deepEqual(view.firstChecks,[]);
  assert.equal(view.priority,'supported');
});

test('Listening Builder reuses System Check search profiles and does not duplicate the search button',async()=>{
  const page=await readFile(new URL('../system-builder/index.html',import.meta.url),'utf8');
  const app=await readFile(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  assert.match(app,/buildSearches\(kind,typed\)/);
  for(const kind of ['speaker','amp','source','headphone'])
    assert.match(page,new RegExp('data-gear-searches="'+kind+'"'));
  assert.doesNotMatch(page,/data-gear-search="/);
  assert.doesNotMatch(page,/data-gear-web="/);
});
