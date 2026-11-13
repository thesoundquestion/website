import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveBassTopology, describeBass, estimateCompleteCost, assessCandidate,
  comparableMeasurements, usableMeasurement, groupCandidatePathways,
  inspectOwnedPair, eligibleArchitectures, GOALS} from '../system-builder/engine.mjs';

const request = {architecture:'open',useCase:'living_room',region:'CA',currency:'CAD',mainsVoltage:120,budget:800,budgetStrict:true,batteryRequired:false,ownedPartIds:[]};
const base = {id:'synthetic-passive',architecture:'passive_separates',batteryCapable:false,recallStatus:'clear',
  supportedMainsVoltages:[120],connectionStatus:'verified',levelSuitability:'meets',
  environmentSuitability:'verified',completePartsDeclared:true,
  parts:[{id:'pair',quantity:1,unitPrice:500,region:'CA',currency:'CAD',priceEvidence:'representative',availability:'available'},
    {id:'amp',quantity:1,unitPrice:200,region:'CA',currency:'CAD',priceEvidence:'representative',availability:'available',reuseCompatible:true}],
  bass:{present:false},metrics:[]};
const measured = {value:96,unit:'dB SPL',method:'CTA-2010-C',rights:'permitted',
  provenanceUrl:'https://example.test/data',testConditions:{distance:'2m',averaging:'specified'}};
test('topology separates no sub, verified HPF, full-range and unknown', () => {
  assert.deepEqual(resolveBassTopology({present:false}),{mode:'no_sub',verified:true});
  assert.equal(resolveBassTopology({present:true,mainHighPassVerified:true}).mode,'sub_mains_high_passed');
  assert.deepEqual(resolveBassTopology({present:true,mainHighPassVerified:false}),{mode:'sub_mains_full_range',verified:true});
  assert.deepEqual(resolveBassTopology({present:true}),{mode:'sub_mains_full_range',verified:false});
});
test('SUB OUT unknown earns no HPF credit', () => {
  assert.match(describeBass('sub_unknown',2).notes.join(' '),/not proof/);
  assert.match(describeBass('sub_full').notes.join(' '),/does not automatically reduce/);
});
test('no-sub path is not penalised or excluded', () => assert.match(describeBass('no_sub').notes.join(' '),/not penalized/));
test('multiple subwoofers do not earn automatic quality bonus', () => assert.match(describeBass('sub_unknown',2).notes.join(' '),/no automatic quality bonus/));
test('whole system cost includes amplifier and quantity', () => assert.equal(estimateCompleteCost(base,request).total,700));
test('suitable owned amplifier costs zero incrementally', () => assert.equal(estimateCompleteCost(base,{...request,ownedPartIds:['amp']}).total,500));
test('unsuitable amp is never reused for free', () => {
  const c={...base,parts:base.parts.map(p=>({...p,reuseCompatible:false}))};
  assert.equal(estimateCompleteCost(c,{...request,ownedPartIds:['amp']}).total,700);
});
test('two separately priced cabinets counted separately', () => {
  const c={...base,parts:[{...base.parts[0],id:'single-monitor',quantity:2,unitPrice:280}]};
  assert.equal(estimateCompleteCost(c,request).total,560);
});
test('wrong regional currency is not a bargain', () => assert.equal(estimateCompleteCost(base,{...request,region:'US',currency:'USD'}).known,false));
test('strict budget blocks but flexible budget does not', () => {
  assert.equal(assessCandidate(base,{...request,budget:600}).status,'blocked');
  assert.notEqual(assessCandidate(base,{...request,budget:600,budgetStrict:false}).status,'blocked');
});
test('recalled affected battery blocks; serial check conditional', () => {
  assert.equal(assessCandidate({...base,recallStatus:'affected'},request).status,'blocked');
  assert.equal(assessCandidate({...base,recallStatus:'requires_check'},request).status,'conditional');
});
test('battery required blocks AC-only candidate', () => assert.equal(assessCandidate(base,{...request,batteryRequired:true}).status,'blocked'));
test('mains incompatibility blocks, unknown does not pass silently', () => {
  assert.equal(assessCandidate({...base,supportedMainsVoltages:[230]},request).status,'blocked');
  assert.equal(assessCandidate({...base,supportedMainsVoltages:null},request).status,'conditional');
});
test('connections, output and venue unknown remain conditional', () => {
  for(const k of ['connectionStatus','levelSuitability','environmentSuitability'])
    assert.equal(assessCandidate({...base,[k]:'unknown'},request).status,'conditional');
});
test('known incompatibility remains a hard block', () => assert.equal(assessCandidate({...base,connectionStatus:'incompatible'},request).status,'blocked'));
test('unverified HPF makes candidate conditional', () => {
  const r=assessCandidate({...base,bass:{present:true}},request);
  assert.equal(r.status,'conditional');
  assert.ok(r.conditional.some(x=>/High-pass/.test(x)));
});
test('price snapshots and absent stock remain conditional', () => {
  assert.equal(assessCandidate({...base,parts:base.parts.map(x=>({...x,priceEvidence:'snapshot'}))},request).status,'conditional');
  assert.equal(assessCandidate({...base,parts:base.parts.map(x=>({...x,priceEvidence:'snapshot'}))},
    {...request,budget:100}).status,'conditional');
  assert.equal(assessCandidate({...base,parts:base.parts.map(x=>({...x,availability:'not-confirmed'}))},request).status,'conditional');
});
test('normal room does not auto-import party PA', () => {
  assert.equal(assessCandidate({...base,architecture:'party_pa'},request).status,'blocked');
  assert.equal(eligibleArchitectures({architecture:'open',goal:'imaging',useCase:'bedroom'}).includes('party_pa'),false);
});
test('explicit party allows party architecture', () => {
  assert.notEqual(assessCandidate({...base,architecture:'party_pa'},{...request,useCase:'party'}).status,'blocked');
  assert.ok(eligibleArchitectures({architecture:'open',goal:'party',useCase:'living_room'}).includes('party_pa'));
});
test('architecture preference does not cross-score unrelated types', () => {
  assert.equal(assessCandidate({...base,architecture:'active_studio'},{...request,architecture:'passive_separates'}).status,'blocked');
  assert.equal(Object.keys(groupCandidatePathways([base,{...base,id:'studio',architecture:'active_studio'}],request)).length,2);
});
test('unlicensed and method-mismatched measurements are not comparable', () => {
  assert.equal(usableMeasurement(measured),true);
  assert.equal(comparableMeasurements(measured,{...measured,value:95}),true);
  assert.equal(comparableMeasurements(measured,{...measured,method:'AES75'}),false);
  assert.equal(comparableMeasurements(measured,{...measured,rights:'link-only'}),false);
  assert.equal(usableMeasurement({...measured,provenanceUrl:''}),false);
});
test('no made-up numerical audio score from unmeasured candidate', () => {
  const r=assessCandidate(base,request);
  assert.equal(r.numericSourceCoverage,false);
  assert.ok(r.notes.some(x=>/No reusable comparable numerical/.test(x)));
});
test('keep existing system remains a legitimate answer', () =>
  assert.ok(assessCandidate({...base,existingSystemMeetsNeeds:true},request).notes.some(x=>/Keep current/.test(x))));
test('amplifier ratings at nominal load do not certify speaker safety', () => {
  const c=inspectOwnedPair({model:'Test speaker',values:{load:6}},
    {model:'Test amplifier',ratings:[[90,6,'continuous','1kHz at 1% THD']]});
  assert.equal(c.status,'conditional');
  assert.ok(c.checks.some(x=>/minimum impedance/.test(x)));
  assert.ok(c.facts.some(x=>/does not verify/.test(x)));
});
test('missing same-load amp rating never extrapolated from 8 ohms', () => {
  const c=inspectOwnedPair({model:'Test speaker',values:{load:4}},
    {model:'Test amplifier',ratings:[[50,8,'continuous','full band']]});
  assert.ok(c.checks.some(x=>/Do not extrapolate/.test(x)));
});
test('all seven priorities are present without product score', () => {
  assert.equal(Object.keys(GOALS).length,7);
  assert.equal(typeof GOALS.imaging.focus,'string');
});
