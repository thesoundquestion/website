import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
const calculator=readFileSync(new URL('../system-check/calculator.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../system-check/style.css',import.meta.url),'utf8');
const supplement=readFileSync(new URL('../system-check/verified-speaker-supplements.js',import.meta.url),'utf8');
const checkerPage=readFileSync(new URL('../system-check/index.html',import.meta.url),'utf8');
const classic=readFileSync(new URL('../equipment/legacy-presets.generated.js',import.meta.url),'utf8');
const from=app.indexOf('const BUILDER_HEADROOM_PROFILES');
const to=app.indexOf('\nconst el = ',from);
assert.ok(from>=0&&to>from,'Headroom handoff logic missing');
const context={URLSearchParams};
vm.runInNewContext(app.slice(from,to)+'\nglobalThis.build=headroomHandoff;',context);
const handoff=context.build;

test('builder carries exact model names, distance and broad volume profile to System Check',()=>{
  const item={amplifierModel:'Yamaha R-S202',speakerModel:'Paradigm Phantom v1'};
  const cases=[
    ['quiet',65,15],['moderate',80,15],['high',85,20]
  ];
  for(const [level,average,gap] of cases){
    const {params}=handoff(item,9.5,level);
    assert.equal(params.get('speaker'),item.speakerModel);
    assert.equal(params.get('amp'),item.amplifierModel);
    assert.equal(params.get('distanceFt'),'9.5');
    assert.equal(params.get('average'),String(average));
    assert.equal(params.get('gap'),String(gap));
    assert.equal(params.get('autocheck'),'1');
    assert.equal(params.get('embedded'),'1');
  }
});

test('model-aware auto result does not show a second model dropdown or blank input form',()=>{
  assert.match(app,/const inline=el\('details','sb-inline-system-check'\)/);
  assert.doesNotMatch(app,/addText\(inline,'summary','Check headroom with these exact models'\)/);
  assert.match(calculator,/runModelHandoff\(\)/);
  assert.match(calculator,/findExactSpeakerPresetIndex\(selections.get\(kind\), options\)/);
  assert.match(calculator,/document\.body\.classList\.add\('sc-auto-result'\)/);
  assert.match(css,/body\.sc-embedded\.sc-auto-result \.sc-inputs\{display:none!important\}/);
});

test('Builder headroom preview is compact without clipping or changing the full calculator',()=>{
  const builderCss=readFileSync(new URL('../system-builder/style.css',import.meta.url),'utf8');
  assert.match(app,/sb-headroom-brief/);
  assert.match(app,/Math\.max\(300,Math\.ceil\(doc\.documentElement\.scrollHeight\)\+16\)/);
  assert.match(builderCss,/\.sb-recommend-compact>\.sb-inline-system-check\{grid-column:1\/-1\}/);
  assert.match(builderCss,/\.sb-inline-system-check-frame\{[^}]*width:100%/);
  assert.match(css,/body\.sc-embedded\.sc-auto-result \.sc-results\{padding:/);
  assert.match(css,/@media\(min-width:640px\)/);
  assert.doesNotMatch(css,/sc-embedded\.sc-auto-result[^\n]*\.sc-load-metric\{[^\n]*display:none/);
});

test('Builder shows a directly visible prefilled System Check link on the strongest match',()=>{
  assert.match(app,/const checkAction=el\('div','sb-checker-action'\)/);
  assert.match(app,/card.append\(checkAction\)/);
  assert.match(app,/checkParams.set\('amp',checkAmp\)/);
  assert.match(app,/checkParams.set\('speaker',checkSpeaker\)/);
  assert.match(app,/Open System Check with this gear/);
  const linkPos=app.indexOf('card.append(checkAction)');
  const detailPos=app.indexOf("const proof=el('details','sb-beginner-proof')");
  assert.ok(linkPos>0&&detailPos>linkPos,'Calculator action must be outside the collapsed technical details');
});

test('lesson example keeps selected models and their actual rated wattage',()=>{
  const example=calculator.slice(calculator.indexOf("document.querySelector('#example').addEventListener"),calculator.indexOf("form.addEventListener('submit'"));
  assert.match(example,/modelSelected/);
  assert.match(example,/if\(modelSelected\)/);
  assert.ok(example.indexOf('if(modelSelected)')<example.indexOf('form.reset()'));
  assert.match(example,/field\('average'\)\.value=87/);
});

test('when published specifications cannot support an exact estimate, only a source-first fallback appears',()=>{
  assert.match(calculator,/The saved specifications do not establish the inputs required/);
  assert.match(calculator,/No example rating has been substituted/);
  assert.match(calculator,/readRatings\(\)\.some\(r=>r.type!=='unknown'\)/);
});


test('ordinary curated passive recommendations carry exact model identities into headroom',async()=>{
  const {curatedPairingFor}=await import('../system-builder/curated-pairing-evidence.mjs');
  const {EXAMPLES}=await import('../system-builder/recommendations.mjs');
  for(const [id,amp,speaker] of [
    ['passive-as301-p5','Yamaha A-S301','PSB Alpha P5'],
    ['passive-bt20a-xt15','Fosi Audio BT20A Pro','Polk Monitor XT15']
  ]){
    const option=EXAMPLES.find(item=>item.id===id);
    assert.ok(option,'recommendation not found: '+id);
    const pairing=curatedPairingFor(option);
    assert.equal(pairing?.amplifierModel,amp);
    assert.equal(pairing?.speakerModel,speaker);
    const selection={amplifierModel:pairing.amplifierModel,speakerModel:pairing.speakerModel};
    const {params}=handoff(selection,10,'moderate');
    assert.equal(params.get('amp'),amp);
    assert.equal(params.get('speaker'),speaker);
  }
  assert.match(app,/item\.curatedPairing\?\.amplifierModel/);
  assert.match(app,/item\.curatedPairing\?\.speakerModel/);
  assert.match(app,/if\(headroomModels\.amplifierModel&&headroomModels\.speakerModel\)/);
});

test('exact Q Acoustics 2020i and 3030i source-backed presets enable A-720 embedded headroom',()=>{
  assert.ok(checkerPage.includes('verified-speaker-supplements.js'));
  const ctx={};
  vm.runInNewContext(classic+'\n'+supplement+
    '\nglobalThis.models=systemCheckGear;',ctx);
  const a=ctx.models.speaker.find(x=>x.model==='Q Acoustics 2020i');
  const b=ctx.models.speaker.find(x=>x.model==='Q Acoustics 3030i');
  const amp=ctx.models.amp.find(x=>x.model==='Yamaha A-720');
  assert.ok(a&&b&&amp,'Exact manufacturer-backed models must be available');
  for(const item of [a,b]){
    assert.equal(item.values.load,6);
    assert.equal(item.values.minimum,4);
    assert.equal(item.values.sensitivity,88);
    assert.equal(item.values.basis,'voltage');
    assert.equal(item.values.speakerRecommendedAmpMax,75);
    assert.equal(item.values.speakerPowerPeak,undefined);
    assert.equal(item.values.speakerPowerContinuous,undefined);
    assert.ok(item.url.startsWith('https://'));
    const params=handoff({speakerModel:item.model,amplifierModel:amp.model},8,'high').params;
    assert.equal(params.get('speaker'),item.model);
    assert.equal(params.get('amp'),amp.model);
  }
  assert.notEqual(a.note,b.note);
  assert.ok(amp.ratings.some(([w,ohms,type])=>w===125&&ohms===6&&type==='continuous'));
  assert.ok(amp.ratings.some(([w,ohms,type])=>w===180&&ohms===6&&type==='burst'));
});
test('adding Q Acoustics handoff supplements does not replace existing verified presets',()=>{
  const ctx={};
  const original=classic+'\n'+supplement;
  vm.runInNewContext(original+'\n'+supplement+
    '\nglobalThis.models=systemCheckGear;',ctx);
  assert.equal(ctx.models.speaker.filter(x=>x.model==='Q Acoustics 2020i').length,1);
  assert.equal(ctx.models.speaker.filter(x=>x.model==='Q Acoustics 3030i').length,1);
  assert.ok(ctx.models.speaker.some(x=>x.model==='Q Acoustics 3020i'));
});
