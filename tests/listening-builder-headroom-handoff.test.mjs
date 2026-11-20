import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
const calculator=readFileSync(new URL('../system-check/calculator.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../system-check/style.css',import.meta.url),'utf8');
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
  assert.match(app,/const inline=el\('section','sb-inline-system-check'\)/);
  assert.doesNotMatch(app,/addText\(inline,'summary','Check headroom with these exact models'\)/);
  assert.match(calculator,/runModelHandoff\(\)/);
  assert.match(calculator,/findExactSpeakerPresetIndex\(selections.get\(kind\), options\)/);
  assert.match(calculator,/document\.body\.classList\.add\('sc-auto-result'\)/);
  assert.match(css,/body\.sc-embedded\.sc-auto-result \.sc-inputs\{display:none!important\}/);
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
