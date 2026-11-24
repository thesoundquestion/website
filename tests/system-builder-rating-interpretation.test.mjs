import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectOwnedPair} from '../system-builder/engine.mjs';
import {explainAmplifierChoice} from '../system-builder/owned-gear-options.mjs';

const speaker={name:'6-ohm example',model:'6-ohm example',values:{load:6},
 record:{values:{load:6}}};
const idea={model:'Example amplifier',inputs:['analog']};
const req={goal:'dynamic',connection:'analog'};

test('burst power at speaker load does not establish a matching continuous rating',()=>{
 const amp={model:'Burst amp',ratings:[[160,6,'burst','IHF dynamic power'],[80,8,'continuous','20 Hz–20 kHz, 0.05% THD']]};
 const r=inspectOwnedPair(speaker,amp);
 assert.ok(!r.facts.some(x=>/continuous amplifier rating at the speaker nominal load/.test(x)));
 assert.ok(r.checks.some(x=>/Only a short-burst/.test(x)));
 assert.ok(r.checks.some(x=>/sustained headroom/.test(x)));
});

test('continuous rating at nominal load is acknowledged without certifying speaker compatibility',()=>{
 const r=inspectOwnedPair(speaker,{model:'Rated amp',
  ratings:[[75,6,'continuous','20 Hz–20 kHz, 0.08% THD']]});
 assert.ok(r.facts.some(x=>/continuous amplifier rating at the speaker nominal load/.test(x)));
 assert.ok(r.checks.some(x=>/permitted speaker load/.test(x)));
});

test('other-load amplifier watts are informative but never a matching-load headroom value',()=>{
 const amp={ratings:[[90,8,'continuous','20 Hz–20 kHz, 0.05% THD']]};
 const r=explainAmplifierChoice({idea,record:amp,speaker,request:req});
 assert.equal(r.ratingWatts,null);
 assert.equal(r.ratingOhms,null);
 assert.equal(r.otherLoadReferenceWatts,90);
 assert.equal(r.otherLoadReferenceOhms,8);
 assert.match(r.summary,/different-load continuous rating/);
 assert.match(r.goalNote,/headroom cannot be inferred/);
});

test('exact-load continuous power remains available as an explicitly conditional reference',()=>{
 const amp={ratings:[[90,8,'continuous','20 Hz–20 kHz, 0.05% THD'],
  [60,6,'continuous','20 Hz–20 kHz, 0.05% THD']]};
 const r=explainAmplifierChoice({idea,record:amp,speaker,request:req});
 assert.equal(r.ratingWatts,60);
 assert.equal(r.ratingOhms,6);
 assert.equal(r.otherLoadReferenceWatts,null);
 assert.match(r.summary,/published continuous rating at this nominal load/);
 assert.match(r.summary,/not verified safe loading or clean output/);
});

test('burst-only amp output is not silently treated as continuous',()=>{
 const amp={ratings:[[240,6,'burst','IHF peak']]};
 const r=explainAmplifierChoice({idea,record:amp,speaker,request:req});
 assert.equal(r.ratingWatts,null);
 assert.equal(r.otherLoadReferenceWatts,null);
 assert.match(r.summary,/no verified continuous power figure/);
});
