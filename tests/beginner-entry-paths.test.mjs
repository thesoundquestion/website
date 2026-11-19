import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
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
