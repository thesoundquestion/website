import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {explainBeginnerOption} from '../system-builder/beginner-output.mjs';
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
  assert.match(x.status,/not fully verified/);
  assert.match(x.reason,/small listening room/);
  assert.match(x.rolePath,/passive left\/right speaker pair/);
  assert.equal(x.roles.length,2);
  assert.match(x.matchingEvidence,/NOT a manufacturer-verified electrical match/);
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
  assert.equal(x.status,'Important match concern');
  assert.equal(x.reuse,true);
  assert.match(x.firstChecks[0],/8 ohm speakers/);
});

test('powered and studio paths prevent costly or unsafe beginner assumptions',()=>{
  const powered=explainBeginnerOption({
    id:'powered-example',architecture:'consumer_powered_pair',why:'Simple wired stereo pair',
    parts:[{name:'Powered stereo pair',role:'Built-in amplification',count:1}],extra:[],tradeoff:'No Bluetooth'
  },{});
  assert.match(powered.rolePath,/no separate speaker power amplifier/i);
  assert.match(powered.checks.join(' '),/Never connect amplifier speaker terminals/i);
  const monitors=explainBeginnerOption({
    id:'studio',architecture:'active_studio',why:'A pair for nearfield listening',
    parts:[{name:'Studio monitor',role:'Sold per cabinet',count:2}],extra:[]
  },{});
  assert.match(monitors.checks.join(' '),/Confirm TWO monitors/);
  assert.ok(monitors.roles[0].startsWith('2 ×'));
  assert.ok(monitors.costAndTradeoffs.some(x=>/per cabinet/i.test(x)));
});

test('exact-load power figure is qualified, never treated as real-speaker safety',()=>{
  const x=explainBeginnerOption({
    architecture:'passive_separates',id:'amp-speaker',parts:[],extra:[],
    amplifierFit:{amp:{exact:true,watts:80,ohms:8},speaker:{}}
  },{});
  assert.match(x.matchingEvidence,/80 W\/channel/);
  assert.match(x.matchingEvidence,/not proof/);
});

test('extra adapters and unverified source inputs take priority over shopping',()=>{
  const x=explainBeginnerOption({
    architecture:'consumer_powered_pair',connectionStatus:'adapter_needed',
    sourceCaution:'Your streamer has a digital-only output.',
    id:'powered',parts:[],extra:[],tradeoff:'Verify the input types.'
  },{});
  assert.equal(x.status,'Extra connection needed');
  assert.equal(x.firstChecks[0],'Your streamer has a digital-only output.');
  assert.ok(x.firstChecks.join(' ').includes('converter'));
  assert.ok(x.costAndTradeoffs.some(x=>/priced separately/.test(x)));
});

test('builder markup shows rationale and compatibility checks before technical opinions',async()=>{
  const app=await readFile(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
  const page=await readFile(new URL('../system-builder/index.html',import.meta.url),'utf8');
  const css=await readFile(new URL('../system-builder/style.css',import.meta.url),'utf8');
  const first=app.indexOf("Why this option was suggested");
  const chain=app.indexOf("How these components would work together");
  const proof=app.indexOf("What supports this pairing, and what does not");
  const checks=app.indexOf("What to check before connecting or buying");
  const evidence=app.indexOf("Published power figures and listening impressions");
  assert.ok(first>0&&first<chain&&chain<proof&&proof<checks&&checks<evidence,
    'Reason, system roles, evidence limits and warnings must precede sound reviews');
  assert.match(app,/explainBeginnerOption\(item,request\)/);
  assert.match(app,/What is included|Full verification, trade-offs, equipment and sources/);
  assert.match(app,/Keeping equipment you already own is a valid outcome/);
  assert.match(page,/Your system options, explained/);
  assert.match(page,/Show system options and why they fit/);
  assert.match(css,/\.sb-recommendations\{grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css,/\.sb-beginner-checks\{border-left/);
});
