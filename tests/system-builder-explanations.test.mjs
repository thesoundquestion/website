import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SOUND_PROFILES,soundProfileFor,recommendationWhy} from '../system-builder/sound-profiles.mjs';
import {EXAMPLES,shortlistExamples} from '../system-builder/recommendations.mjs';
import {SPEAKER_IDEAS,shortlistSpeakersForOwnedAmplifier} from '../system-builder/owned-amp-speakers.mjs';
import {GOALS} from '../system-builder/engine.mjs';

const labels=Object.fromEntries(Object.entries(GOALS).map(([key,v])=>[key,v.label]));
const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
test('every published system and owned speaker candidate has an explicitly sourced or unknown sonic profile',()=>{
  assert.ok(EXAMPLES.every(e=>SOUND_PROFILES[e.id]));
  assert.ok(SPEAKER_IDEAS.every(e=>SOUND_PROFILES[e.model]));
  for(const p of Object.values(SOUND_PROFILES)){
    assert.ok(p.text.length>=45 && p.text.length<420);
    assert.ok(p.type.length>10);
    assert.ok(p.url===null || /^https:\/\//.test(p.url));
  }
  assert.match(soundProfileFor({id:'not-in-catalog'}).text,/No reliable model-specific/);
});
test('why text uses matched selected priorities only, not imaginary numeric preference scores',()=>{
  const item={editorialGoalFocus:true,secondaryFocus:['imaging'],sceneCaution:false,ownedAmpName:'Yamaha A-720',subtotal:399,connectionStatus:'owned_amp_source_unverified'};
  const msg=recommendationWhy(item,{goal:'natural',useCase:'living_room',budget:500,budgetStrict:true},labels);
  assert.match(msg,/Natural vocals and timbre/);
  assert.match(msg,/Imaging and spaciousness/);
  assert.match(msg,/living room/);
  assert.match(msg,/Keeps your Yamaha A-720/);
  assert.match(msg,/electrical compatibility remains unverified/);
  assert.match(msg,/not a complete-system cost/);
  assert.doesNotMatch(msg,/100%|score|guarantee/);
});
test('unmatched primary and settings never appear as a verified preference fit',()=>{
  const item={editorialGoalFocus:false,secondaryFocus:[],sceneCaution:true,subtotal:null,connectionStatus:'adapter_needed'};
  const msg=recommendationWhy(item,{goal:'bass',useCase:'desk',budget:200,budgetStrict:true},labels);
  assert.match(msg,/not a direct editorial match/);
  assert.doesNotMatch(msg,/Suggested for desk/);
  assert.doesNotMatch(msg,/below your ceiling/);
  assert.match(msg,/additional equipment/);
});
test('actual shortlist records can explain their own editorial goal status',()=>{
  const r=shortlistExamples({architecture:'consumer_powered_pair',goal:'imaging',useCase:'desk',region:'CA',currency:'CAD'});
  assert.ok(r.selected.length>0);
  for(const item of r.selected) {
    const why=recommendationWhy(item,{goal:'imaging',useCase:'desk'},labels);
    assert.ok(why.includes(item.editorialGoalFocus?'Shortlisted for':'comparison option'));
    assert.ok(soundProfileFor(item).text.length>30);
  }
});
test('cards show model-specific sound and exact preference explanation above expandable evidence',()=>{
  const first=app.indexOf("const renderCard = item =>");
  const fit=app.indexOf("recommendationWhy(item,request",first);
  const sound=app.indexOf("soundProfileFor(item)",first);
  const details=app.indexOf("const details = el('details','sb-card-details')",first);
  assert.ok(first>=0 && fit>first && sound>fit && details>sound);
  assert.match(app,/Why this one:/);
  assert.match(app,/Sound:/);
  assert.match(app,/Sound description: evidence/);
  assert.match(app,/this preview does not yet verify or re-rank models/);
});
