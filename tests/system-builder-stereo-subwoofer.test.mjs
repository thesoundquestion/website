import assert from 'node:assert/strict';
import test from 'node:test';
import {describeBass} from '../system-builder/engine.mjs';
import {shortlistExamples} from '../system-builder/recommendations.mjs';
import {ownershipPlan} from '../system-builder/owned-gear-options.mjs';
import {ampSpeakerScreening} from '../system-builder/owned-amp-speakers.mjs';
import {builderOnlyAmpFor} from '../system-builder/supplemental-amplifiers.mjs';
import {DENON_S650H_NAME, ownedSubwooferPath, poweredSubPairFor} from '../system-builder/stereo-subwoofer-examples.mjs';
import {usedWatchlistFor} from '../system-builder/used-amp-watchlist.mjs';

const basic = {architecture:'open', goal:'bass', useCase:'bedroom', power:'mains',
  connection:'optical', budgetStrict:true, region:'CA', currency:'CAD', referenceDate:'2026-11-13',
  subMode:'plan_sub', subCount:1, subOwned:'no'};
const select = overrides => shortlistExamples({...basic,...overrides});
const find = (result, id) => result.selected.find(item => item.id === id);

test('2.1 budgets include a stereo pair and one powered sub in the selected currency', () => {
  for (const [region, currency, total] of [['CA','CAD',429.98],['US','USD',399.98],['GB','GBP',268]]) {
    const result = select({region,currency,budget:total});
    assert.equal(result.selected[0].id, 'stereo-sub-edifier');
    assert.equal(result.selected[0].subtotal,total);
    assert.equal(result.selected[0].priceDate,'2026-11-13');
    assert.deepEqual(result.selected[0].parts.map(p=>p.count),[1,1]);
    assert.equal(result.selected[0].priceComponents.length,2);
    assert.match(result.selected[0].bassSetup.label,/no crossover frequency/);
  }
});

test('a small budget can compare both a 2.1 setup and the stereo pair on its own', () => {
  const result = select({region:'GB', currency:'GBP', budget:150});
  assert.equal(result.selected[0].id,'stereo-sub-edifier');
  assert.equal(result.selected[0].subtotal,268);
  assert.equal(find(result,'powered-r1280dbs').subtotal,139);
  assert.ok(!find(result,'powered-r1280dbs').bassSetup);
  assert.ok(!result.excluded.some(item=>item.title==='Edifier R1280DBs + T5'));
});

test('WiiM example prices local passive speakers, wire and sub lead for HDMI ARC', () => {
  for (const [region,currency,speaker,total] of [
    ['CA','CAD','Polk Monitor XT15',987.23], ['US','USD','Polk Monitor XT15',724.38], ['GB','GBP','Q Acoustics 3010i',673.36]
  ]) {
    const result = select({region,currency,connection:'hdmi',budget:total});
    const item = result.selected[0];
    assert.equal(item.id,'stereo-sub-wiim');
    assert.ok(item.title.includes(speaker));
    assert.equal(item.parts[1].name,speaker+' passive stereo pair');
    assert.equal(item.priceComponents.length,5);
    assert.equal(item.subtotal,total);
    assert.equal(item.connectionStatus,'native_possible');
    assert.ok(!find(result,'stereo-sub-edifier'));
  }
});

test('USB desktop prices both missing cables and a documented 100 Hz crossover', () => {
  for (const [region,currency,total] of [['CA','CAD',631.22],['US','USD',558.52],['GB','GBP',384.84]]) {
    const item = select({region,currency,connection:'usb',useCase:'desk',subMode:'sub_hpf',budget:total}).selected[0];
    assert.equal(item.id,'stereo-sub-ora');
    assert.equal(item.subtotal,total);
    assert.ok(item.priceComponents.some(p=>p.label==='USB-C data cable'));
    assert.ok(item.priceComponents.some(p=>p.label==='Single RCA subwoofer lead'));
    assert.match(item.bassSetup.label,/100 Hz/);
  }
});

test('full-range and filtered settings remain distinct', () => {
  const full = select({subMode:'sub_full'});
  const highPass = select({subMode:'sub_hpf'});
  assert.match(find(full,'stereo-sub-wiim').bassSetup.label,/playing full-range/);
  assert.match(find(highPass,'stereo-sub-wiim').bassSetup.setup,/leave Main Speakers Output Bass and Subwoofer Bypass Mode off/);
  assert.ok(!find(full,'stereo-sub-edifier') && !find(highPass,'stereo-sub-edifier'));
  assert.equal(describeBass('plan_sub').mode,'sub_planned');
});

test('no local number leaks to a mismatched currency or an unpriced region', () => {
  const mismatch = select({region:'CA',currency:'USD',budget:400});
  const item = find(mismatch,'stereo-sub-edifier');
  assert.equal(item.subtotal,null);
  assert.deepEqual(item.priceComponents,[]);
  assert.equal(find(mismatch,'stereo-sub-wiim').subtotal,null);
  const unpriced = select({region:'AU',currency:'AUD',budget:400});
  assert.equal(find(unpriced,'stereo-sub-edifier').subtotal,null);
});

test('existing subs, multi-sub layouts, headphones and party or battery requests do not get a new 2.1 bundle', () => {
  for (const overrides of [{subOwned:'yes'}, {subOwned:'unknown'}, {subCount:2},
    {architecture:'headphone_first'}, {useCase:'party'}, {goal:'party'}, {power:'battery'}, {subMode:'no_sub'}]) {
    assert.ok(select(overrides).selected.every(item=>!item.bassSetup));
  }
});

test('reuse the exact powered pair and keep a separate passive amp out of that signal path', () => {
  const own = {speaker:{name:'Edifier R1280DBs'}, amp:{name:'Yamaha R-S202'}};
  const plan = ownershipPlan({own, request:basic});
  assert.equal(plan.mode,'keep_powered_pair');
  assert.deepEqual(plan.selected[0].reuseNames,['Edifier R1280DBs']);
  assert.match(plan.selected[0].keptSeparate[0],/Yamaha R-S202/);
  assert.equal(ownedSubwooferPath(own,basic).subtotal,199.99);
  assert.equal(ownedSubwooferPath(own,{...basic,budget:150}).subtotal,199.99);
  assert.equal(ownedSubwooferPath(own,{...basic,connection:'hdmi'}),null);
  assert.equal(poweredSubPairFor('Edifier R1280DB'),undefined);
  assert.equal(poweredSubPairFor('Kanto ORA4'),undefined);
});

test('retained WiiM and ORA price only sub hardware, with no new sub cost assumed for an owned sub', () => {
  const amp = {amp:{name:'WiiM Amp'}};
  const added = ownedSubwooferPath(amp,{...basic,region:'US',currency:'USD'});
  assert.equal(added.subtotal,201.97);
  assert.equal(added.needsMainSpeakers,true);
  const retained = ownedSubwooferPath(amp,{...basic,subOwned:'yes'});
  assert.equal(retained.subtotal,null);
  assert.equal(retained.wantsOwnedSub,true);
  assert.equal(ownedSubwooferPath(amp,{...basic,connection:'usb'}),null);
  const ora = {speaker:{name:'Kanto ORA'}};
  assert.equal(ownedSubwooferPath(ora,{...basic,connection:'usb'}).subtotal,204.24);
});

test('2.1 bundles and a sub-only purchase retain the same parts and links after expiry', () => {
  const request = {...basic,connection:'hdmi',budget:100};
  const current = find(select(request),'stereo-sub-wiim');
  const expiredRequest = {...request,referenceDate:'2026-12-13'};
  const expired = find(select(expiredRequest),current.id);
  assert.deepEqual(expired.parts,current.parts);
  const own = {amp:{name:'WiiM Amp'}};
  for (const [before,after] of [[current,expired],
    [ownedSubwooferPath(own,request),ownedSubwooferPath(own,expiredRequest)]]) {
    assert.ok(before.subtotal>0);
    assert.equal(after.subtotal,null);
    assert.equal(after.priceDate,null);
    assert.deepEqual(after.priceComponents,before.priceComponents.map(({amount,...retailer})=>retailer));
  }
});

test('North American Denon has its own load rule and a regional unpriced used watchlist entry', () => {
  const record = builderOnlyAmpFor(DENON_S650H_NAME);
  assert.deepEqual(record.ratings[0].slice(0,3),[75,8,'continuous']);
  assert.equal(ampSpeakerScreening({name:record.model,record}).explicitNominalFloor,4);
  const own = {amp:{name:record.model,record},speaker:{name:'Owned passive pair'}};
  assert.match(ownedSubwooferPath(own,basic).bassSetup.setup,/Front speakers to Small/);
  assert.equal(ownedSubwooferPath(own,{...basic,region:'GB',currency:'GBP'}),null);
  assert.equal(ownedSubwooferPath({amp:{name:'Denon AVR-S540BT'}},basic),null);
  const us = usedWatchlistFor({region:'US',wantedInput:'hdmi'}).find(item=>item.model===record.model);
  assert.ok(us && us.usedTypicalPrice===null && us.listingUrl===null && us.inputCaution===null);
  assert.ok(!usedWatchlistFor({region:'GB'}).some(item=>item.model===record.model));
});
