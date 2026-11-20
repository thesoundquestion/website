import test from 'node:test';
import assert from 'node:assert/strict';
import {shortlistExamples} from '../system-builder/recommendations.mjs';
import {curatedPairingFor} from '../system-builder/curated-pairing-evidence.mjs';
import {explainBeginnerOption} from '../system-builder/beginner-output.mjs';

const defaults={
  architecture:'passive_separates',useCase:'living_room',goal:'all_rounder',
  region:'CA',currency:'CAD',level:'moderate',connection:'analog',power:'mains',
  budget:null,budgetStrict:true,used:true,distanceFt:8,referenceDate:'2026-11-19',
  subMode:'no_sub'
};

test('Fosi/Polk and Yamaha/PSB show the published load match, not a false safety warning',()=>{
  const selected=shortlistExamples(defaults).selected;
  for(const id of ['passive-bt20a-xt15','passive-as301-p5']){
    const product=selected.find(x=>x.id===id);
    assert.ok(product,'Missing supported passive pairing '+id);
    assert.equal(product.curatedPairing?.level,'manufacturer_supported');
    const view=explainBeginnerOption(product,defaults);
    assert.equal(view.priority,'supported');
    assert.doesNotMatch(view.status,/check this pairing|resolve before connecting/i);
    assert.equal(view.checkHeading,'How to connect this pairing');
    assert.equal(view.firstChecks.length,1);
    assert.doesNotMatch(view.firstChecks.join(' '),/check the amplifier manual to see which speakers/i);
    assert.ok(product.curatedPairing.sources.length>=2);
  }
});

test('Fosi supports Polk load; supply and advertised watts are a separate consideration',()=>{
  const product=shortlistExamples(defaults).selected.find(x=>x.id==='passive-bt20a-xt15');
  assert.ok(product);
  assert.match(product.curatedPairing.proof,/2–8 Ω/);
  assert.match(product.curatedPairing.proof,/4.1 Ω/);
  assert.match(product.curatedPairing.output,/300 W\/channel/);
  assert.equal(product.loadCaution,undefined);
});

test('Yamaha A-S301 / PSB P5 gives exact single-pair selector guidance',()=>{
  const product=shortlistExamples(defaults).selected.find(x=>x.id==='passive-as301-p5');
  assert.ok(product);
  assert.match(product.curatedPairing.proof,/8 Ω nominal/);
  assert.match(product.curatedPairing.setup,/HIGH impedance-selector setting/);
  assert.match(product.curatedPairing.setup,/turn off and unplug/);
});

test('WiiM Amp + subwoofer checks the actual regional passive speaker',()=>{
  for(const [region,currency,speaker] of [['CA','CAD','Polk Monitor XT15'],['GB','GBP','Q Acoustics 3010i']]){
    const request={...defaults,goal:'bass',subMode:'plan_sub',subOwned:'no',subCount:1,region,currency};
    const candidate=shortlistExamples(request).selected.find(x=>x.id==='stereo-sub-wiim');
    assert.ok(candidate,'Missing WiiM bundle for '+region);
    assert.equal(candidate.curatedPairing?.level,'manufacturer_supported');
    assert.ok(candidate.curatedPairing.proof.includes(speaker));
    assert.equal(explainBeginnerOption(candidate,request).priority,'supported');
  }
});

test('unknown prebuilt passive pair is not silently granted documented status',()=>{
  assert.equal(curatedPairingFor({id:'unknown-pair',architecture:'passive_separates'}),null);
  const unknown=explainBeginnerOption({
    id:'unknown-pair',architecture:'passive_separates',
    loadCaution:'Permitted speaker load is not documented.',
    connectionStatus:'native_possible'
  },defaults);
  assert.equal(unknown.priority,'critical');
  assert.match(unknown.firstChecks.join(' '),/Permitted speaker load/);
});

test('a real source-connection mismatch still gets a visible warning',()=>{
  const request={...defaults,connection:'hdmi'};
  const product=shortlistExamples(request).selected.find(x=>x.id==='passive-bt20a-xt15');
  assert.ok(product);
  const view=explainBeginnerOption(product,request);
  assert.equal(view.priority,'review');
  assert.ok(view.checks.some(x=>/source|converter/i.test(x)));
  assert.doesNotMatch(view.checks.join(' '),/check the amplifier manual to see which speakers/i);
});
