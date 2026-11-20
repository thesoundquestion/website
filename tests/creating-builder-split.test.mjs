import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {CHAIN_MODES,buildGoalChain} from '../system-builder/goal-chain-engine.mjs';
import {GOALS} from '../tools/find-my-setup/engine.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=relative=>readFileSync(path.join(root,relative),'utf8');
const listening=read('system-builder/index.html');
const creating=read('system-builder/creating/index.html');
const creatingApp=read('system-builder/creating/app.mjs');
const goals=read('tools/find-my-setup/app.mjs');
const catalog=JSON.parse(read('equipment/catalog.generated.json'));
const model=(category,name)=>catalog.records.find(x=>x.categories.includes(category)&&x.model===name);

test('Listening Builder and Creating Builder are independent pages with separate scripts',()=>{
  assert.match(listening,/<h1>Listening Builder<\/h1>/);
  assert.match(listening,/src="\/system-builder\/app\.mjs(?:\?[^\"]+)?"/);
  assert.match(listening,/id="sb-form"/);
  assert.doesNotMatch(listening,/id="sb-purpose-form"|goal-chain-builder\.mjs/);
  assert.match(listening,/href="\/system-builder\/creating\/"/);
  assert.match(creating,/<h1>Creating Builder<\/h1>/);
  assert.match(creating,/src="\/system-builder\/creating\/app\.mjs"/);
  assert.match(creating,/id="sb-purpose-form"/);
  assert.doesNotMatch(creating,/id="sb-form"|src="\/system-builder\/app\.mjs"/);
  assert.match(creating,/href="\/system-builder\/"/);
  assert.match(creating,/class="mobile-nav"/);
  assert.match(creating,/class="page-endnav container"/);
});

test('all creating goal routes have a visible selector and a real engine mode',()=>{
  const expected=['vocal','songwriter','drums','band','podcast','stream','live'];
  const all=CHAIN_MODES.map(x=>x.id);
  for(const id of expected){
    assert.ok(all.includes(id),'missing model '+id);
    assert.ok(GOALS.some(g=>g.id===id),'unreachable guide goal '+id);
    assert.match(creating,new RegExp('value="'+id+'"'));
  }
  const goalSelect=creating.match(/<select id="sb-purpose-select">([\s\S]*?)<\/select>/)?.[1]||'';
  assert.deepEqual([...goalSelect.matchAll(/<option value="([^"]+)"/g)].map(m=>m[1]),expected);
  for(const id of ['sb-purpose-select','sb-purpose-panel','sb-purpose-form','sb-purpose-microphone',
    'sb-purpose-input','sb-purpose-count','sb-purpose-headphone','sb-purpose-pa',
    'sb-purpose-tracks','sb-purpose-status','sb-purpose-result','sb-purpose-result-body']){
    assert.ok(creating.includes('id="'+id+'"'),'missing UI control '+id);
  }
  assert.doesNotMatch(creatingApp,/\boldForm\b|\boldResults\b|controls\.output|controls\.speaker/);
  assert.match(creatingApp,/\.\.\/\.\.\/equipment\/catalog-client\.mjs/);
  assert.match(creatingApp,/\.\/build-recommendations\.mjs/);
  assert.match(creatingApp,/buildCreatingSystem\(catalog/);
  assert.match(creatingApp,/\.\/build-recommendations\.mjs/);
  assert.match(creating,/Build my creating setup/);
});

test('guide and hub send visitors to the relevant builder without mixing listening and creating',()=>{
  const hub=read('tools/index.html');
  assert.match(hub,/href="\/system-builder\/"/);
  assert.match(hub,/href="\/system-builder\/creating\/"/);
  assert.match(hub,/href="\/system-builder\/creating\/\?goal=vocal"/);
  assert.match(goals,/\/system-builder\/creating\/\?goal=/);
  assert.match(goals,/Continue to Listening Builder/);
  assert.match(goals,/Continue to Creating Builder/);
  for(const p of ['system-builder/creating/index.html','system-builder/creating/app.mjs',
    'system-builder/goal-chain-engine.mjs','system-builder/goal-chain-builder.css']){
    assert.ok(existsSync(path.join(root,p)),p);
    assert.ok(read('scripts/build-public-site.mjs').includes("'"+p+"'"),p+' absent from publish preflight');
  }
  assert.match(read('sitemap.xml'),/\/system-builder\/creating\//);
});

test('Creating Builder checks published recording capacity and does not invent independent tracks',()=>{
  const mic=model('microphone','Shure SM58'),solo=model('audio_interface','M-Audio M-Track Solo');
  assert.ok(mic&&solo);
  for(const mode of ['vocal','songwriter','drums','band','podcast','stream']){
    const result=buildGoalChain(catalog,{mode,microphoneId:mic.id,captureId:solo.id,microphoneCount:2,independentTracks:true});
    assert.equal(result.mode,mode);
    assert.ok(result.checks.some(x=>x.status==='known_limit'),mode+' should show capacity limit');
    assert.ok(result.lessons.includes('/decoder/audio-interfaces-mixers/'));
    assert.match(result.disclaimer,/not a compatibility/);
  }
  const pa=model('speaker','QSC K12.2'),mixer=model('mixer_recorder','Yamaha MG10XU');
  assert.ok(pa&&mixer);
  const live=buildGoalChain(catalog,{mode:'live',microphoneId:mic.id,captureId:mixer.id,paSpeakerId:pa.id,microphoneCount:2});
  assert.ok(live.stages.some(s=>s.name.includes('PA')));
  assert.ok(live.checks.some(c=>c.text.includes('NOT verified')));
  assert.match(live.disclaimer,/wiring/);
});

test('the homepage and Library use one concise front door with no duplicated handbook',()=>{
  const home=read('index.html'),library=read('library/index.html'),decoder=read('decoder/index.html');
  assert.match(home,/From the microphone to your ears/);
  assert.ok(home.indexOf('Jump Straight In')<home.indexOf('Choose Your Path'));
  assert.match(home,/href="\/library\/"/);
  assert.doesNotMatch(home,/href="\/decoder\/audio-interfaces-mixers\/"/);
  assert.equal((library.match(/<h2>Make Audio Make Sense · Free handbook<\/h2>/g)||[]).length,1);
  assert.equal((library.match(/href="\/library\/make-audio-make-sense\/make-audio-make-sense-illustrated\.pdf"/g)||[]).length,1);
  assert.match(library,/href="\/decoder\/technical-glossary\/"/);
  const guide=decoder.indexOf('<a class="dl-card" href="/decoder/audio-interfaces-mixers/"');
  assert.ok(guide>decoder.indexOf('LESSON 18')&&guide<decoder.indexOf('href="/decoder/sample-rate/"'),'interface guide must be the numbered Lesson 19 card');
  assert.match(decoder.slice(guide,guide+300),/LESSON 19/);
  assert.match(decoder,/href="\/decoder\/technical-glossary\/"/);
});

test('price-position is visible in Compare My Gear without claiming performance quality',()=>{
  const compare=read('system-check/compare/index.html');
  assert.match(compare,/id="gc-price-region"/);
  assert.match(compare,/id="gc-price-labels"/);
  assert.match(compare,/system-check\/compare\/retail-tiers\.mjs/);
  assert.match(compare,/not a quality rating/);
  assert.ok(existsSync(path.join(root,'system-check/compare/retail-tiers.mjs')));
});
