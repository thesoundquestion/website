import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {poweredHeadroomEstimate,poweredHeadroomLink,POWERED_OUTPUT_EVIDENCE}
  from '../system-check/powered-headroom-model.mjs';
import {recommendationHeadroom} from '../system-builder/recommendation-headroom.mjs';
import {shortlistExamples} from '../system-builder/recommendations.mjs';

const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
const catalog=JSON.parse(read('../equipment/catalog.generated.json'));
const bedroom={architecture:'open',useCase:'bedroom',goal:'imaging',
  level:'quiet',power:'mains',connection:'analog',region:'CA',
  currency:'CAD',budget:null,distanceFt:6,referenceDate:'2026-11-20',
  subMode:'no_sub'};

test('JBL 305P MkII uses manufacturer 94/108 dB bounds, not electrical watts',()=>{
 const x=poweredHeadroomEstimate('JBL 305P MkII',{distanceFt:6,averageDb:65,peakDb:80});
 assert.equal(x.status,'projected');
 assert.ok(Math.abs(x.projectedContinuousDb-88.8)<0.3,x.projectedContinuousDb);
 assert.ok(Math.abs(x.projectedPeakDb-102.8)<0.3,x.projectedPeakDb);
 assert.ok(Math.abs(x.peakMarginDb-22.8)<0.3,x.peakMarginDb);
 assert.match(x.caveat,/distortion|limiter/i);
 assert.match(x.source,/jblpro\.com/);
});
test('Kali maximum and continuous listening-distance references are conservatively combined',()=>{
 const x=poweredHeadroomEstimate('Kali LP-6 V2',{distanceFt:6,averageDb:65,peakDb:80});
 assert.equal(x.status,'projected');
 assert.equal(x.projectedContinuousDb,85);
 assert.equal(x.projectedPeakDb,105,'Do not exceed 85+20 dB manufacturer listening-distance guarantee');
 assert.equal(x.peakMarginDb,25);
 assert.match(x.source,/kaliaudio/);
});
test('closer-than-reference seats never earn an optimistic gain bonus',()=>{
 const one=poweredHeadroomEstimate('JBL 305P MkII',{distanceFt:3.28084,averageDb:65,peakDb:80});
 const near=poweredHeadroomEstimate('JBL 305P MkII',{distanceFt:2,averageDb:65,peakDb:80});
 assert.equal(near.projectedPeakDb,one.projectedPeakDb);
});
test('Kanto ORA remains numerically unverified despite the published 50 W total RMS',()=>{
 assert.equal(POWERED_OUTPUT_EVIDENCE['Kanto ORA'].electricalWatts,50);
 const x=poweredHeadroomEstimate('Kanto ORA',{distanceFt:6,averageDb:65,peakDb:80});
 assert.equal(x.status,'unverified');
 assert.equal(x.projectedPeakDb,null);
 assert.equal(x.peakMarginDb,null);
 assert.match(x.caveat,/watts alone/i);
 const card=recommendationHeadroom({poweredHeadroomModel:'Kanto ORA',
    architecture:'consumer_powered_pair'},bedroom,catalog);
 assert.match(card.summary,/Quiet playback is plausible/);
 assert.match(card.summary,/No verified dB margin/);
 assert.match(card.reviewSource,/soundstagesimplifi/);
 assert.equal(card.metrics.peakMarginDb,null);
 assert.match(card.link,/powered=1/);
 assert.equal(new URL(card.link,'https://test.invalid').searchParams.get('model'),'Kanto ORA');
});
test('Edifier MR4 offers context from independent output tests without inventing headroom',()=>{
 const item={poweredHeadroomModel:'Edifier MR4',architecture:'consumer_powered_pair'};
 const near=recommendationHeadroom(item,bedroom,catalog);
 assert.equal(near.status,'unverified');
 assert.match(near.summary,/Quiet playback is plausible/);
 assert.match(near.summary,/bass-heavy peaks/);
 assert.match(near.summary,/No verified dB margin/);
 assert.match(near.reviewSource,/erinsaudiocorner/);
 assert.equal(near.metrics.projectedPeakDb,null);
 assert.equal(near.metrics.peakMarginDb,null);
 assert.match(near.detail,/86 and 96 dB/);
 const away=recommendationHeadroom(item,{...bedroom,distanceFt:15},catalog);
 assert.match(away.summary,/headroom at this distance is uncertain/i);
 const loud=recommendationHeadroom(item,{...bedroom,level:'high'},catalog);
 assert.match(loud.summary,/cannot be recommended/i);
});
test('ORA quiet, normal, loud and far-distance advice changes without fake dB figures',()=>{
 const item={poweredHeadroomModel:'Kanto ORA',architecture:'consumer_powered_pair'};
 const a=recommendationHeadroom(item,bedroom,catalog);
 const b=recommendationHeadroom(item,{...bedroom,level:'moderate'},catalog);
 const c=recommendationHeadroom(item,{...bedroom,level:'high'},catalog);
 const d=recommendationHeadroom(item,{...bedroom,distanceFt:12},catalog);
 assert.match(a.summary,/Quiet playback is plausible/);
 assert.match(b.summary,/bass-heavy musical peaks remain an unknown/);
 assert.match(c.summary,/Loud or bass-heavy playback/);
 assert.match(d.summary,/Designed for desktop listening/);
 for(const x of [a,b,c,d]){
  assert.equal(x.status,'unverified');
  assert.equal(x.metrics.projectedPeakDb,null);
  assert.equal(x.metrics.peakMarginDb,null);
  assert.match(x.summary,/No verified dB margin/);
 }
});
test('every budget powered pair has honest nonnumeric model headroom and a review link',()=>{
 const models=['Edifier R1280T','Edifier R1280DB','Edifier R1280DBs',
   'Edifier R1700BTs','Edifier MR3','Edifier M60'];
 for(const model of models){
  const x=poweredHeadroomEstimate(model,{distanceFt:6,averageDb:65,peakDb:80});
  assert.equal(x.status,'unverified',model);
  assert.equal(x.peakMarginDb,null,model);
  assert.ok(x.practical?.summary?.length>15,model);
  assert.ok(x.practical.reviewUrl.startsWith('https://'),model);
  const item=shortlistExamples({...bedroom,architecture:'consumer_powered_pair',
    useCase:'desk',goal:'all_rounder'},catalog).selected;
  const budgetId='powered-'+model.replace('Edifier ','').toLowerCase();
  // The model evidence applies even if this exact example is not in the top-three shortlist.
  const card=recommendationHeadroom({architecture:'consumer_powered_pair',
    poweredHeadroomModel:model},bedroom,catalog);
  assert.equal(card.kind,'powered');
  assert.match(card.summary,/No verified dB margin/);
  assert.equal(new URL(card.link,'https://test.invalid').searchParams.get('model'),model);
 }
});
test('the real beginner bedroom shortlist gets a relevant System Check link on every option',()=>{
 const selected=shortlistExamples(bedroom,catalog).selected;
 for(const id of ['studio-jbl','powered-ora','passive-as301-p5','studio-kali']){
   const item=selected.find(s=>s.id===id);
   assert.ok(item,'missing '+id);
   const x=recommendationHeadroom(item,bedroom,catalog);
   assert.ok(x.summary.length>20);
   assert.ok(x.link.startsWith('/system-check/?'));
   assert.match(x.link,/distanceFt=6/);
   assert.match(x.link,/average=65/);
   if(item.poweredHeadroomModel){
     assert.equal(x.kind,'powered');
     assert.match(x.link,/powered=1/);
   }else{
     assert.equal(x.kind,'passive');
     const query=new URL(x.link,'https://test.invalid').searchParams;
     assert.equal(query.get('amp'),'Yamaha A-S301');
     assert.equal(query.get('speaker'),'PSB Alpha P5');
   }
 }
});
test('the passive Yamaha/PSB example has a source-based theoretical single-speaker margin',()=>{
 const item=shortlistExamples(bedroom,catalog).selected.find(s=>s.id==='passive-as301-p5');
 const r=recommendationHeadroom(item,bedroom,catalog);
 assert.equal(r.status,'projected');
 assert.ok(Math.abs(r.metrics.projectedPeakDb-99.5)<.4);
 assert.ok(Math.abs(r.metrics.peakMarginDb-19.5)<.4);
 assert.match(r.detail,/speaker compression/i);
});
test('invalid target levels never appear as numeric powered headroom',()=>{
 for(const opts of [{distanceFt:-1,averageDb:65,peakDb:80},
   {distanceFt:6,averageDb:120,peakDb:140},
   {distanceFt:6,averageDb:90,peakDb:85}]){
  assert.equal(poweredHeadroomEstimate('JBL 305P MkII',opts).status,'invalid');
 }
});
test('Builder keeps the source-based acoustic summary immediately on cards',()=>{
 const app=read('../system-builder/app.mjs');
 const simple=app.slice(app.indexOf('const renderSimpleCard=(item,top)=>'),
   app.indexOf('panel.append(renderSimpleCard'));
 assert.match(simple,/recommendationHeadroom\(item,request,sharedCatalog\)/);
 assert.match(simple,/Headroom at /);
 assert.match(simple,/card.append\(line\)/);
 assert.match(simple,/link\(line,headroom.link/);
 assert.ok(simple.indexOf('card.append(listening)')<simple.indexOf('card.append(line)'));
 assert.match(app,/sb-powered-headroom/);
 assert.match(app,/sb-alt-headroom/);
});
test('the powered checker route is integrated while leaving passive calculator intact',()=>{
 const page=read('../system-check/index.html');
 const logic=read('../system-check/powered-check.mjs');
 const original=read('../system-check/calculator.js');
 assert.match(page,/id="sc-powered-check"/);
 assert.match(page,/id="sc-powered-form"/);
 assert.match(page,/id="check" class="sc-layout"/);
 assert.match(page,/powered-check\.mjs\?v=/);
 assert.match(logic,/poweredHeadroomEstimate/);
 assert.match(logic,/published acoustic output/i);
 assert.match(original,/function runModelHandoff\(\)/);
});
test('the powered deep link carries exact model, distance, average and gap',()=>{
 const link=poweredHeadroomLink('JBL 305P MkII',{
   distanceFt:6,averageDb:65,peakDb:80});
 const url=new URL(link,'https://example.org');
 assert.equal(url.searchParams.get('powered'),'1');
 assert.equal(url.searchParams.get('model'),'JBL 305P MkII');
 assert.equal(url.searchParams.get('distanceFt'),'6');
 assert.equal(url.searchParams.get('average'),'65');
 assert.equal(url.searchParams.get('gap'),'15');
});
