import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shortlistExamples,EXAMPLES} from '../system-builder/recommendations.mjs';
import {BUDGET_EXAMPLES} from '../system-builder/budget-examples.mjs';
import {recommendationHeadroom} from '../system-builder/recommendation-headroom.mjs';
import {screenRecommendationSafety} from '../system-builder/recommendation-safety-gate.mjs';
import {soundImpressionFor} from '../system-builder/tonal-impressions.mjs';
import {POWERED_OUTPUT_EVIDENCE} from '../system-check/powered-headroom-model.mjs';

const catalog=JSON.parse(readFileSync(new URL('../equipment/catalog.generated.json',import.meta.url),'utf8'));
const base={architecture:'open',useCase:'bedroom',goal:'all_rounder',region:'CA',
 currency:'CAD',level:'quiet',power:'mains',connection:'analog',
 budget:null,budgetStrict:true,used:true,referenceDate:'2026-11-21',
 distanceFt:6,subMode:'no_sub'};
test('all 197 catalog records have unique identities and sensible load/sensitivity provenance',()=>{
 const seen=new Set();
 for(const r of catalog.records){
  assert.ok(r.id&&r.model&&r.categories?.length,JSON.stringify(r));
  assert.ok(!seen.has(r.id),'duplicate catalog id '+r.id);
  seen.add(r.id);
  for(const p of r.profiles||[]){
   const v=p.values||{};
   if(v.sensitivity!==undefined) {
    assert.ok(Number.isFinite(v.sensitivity)&&v.sensitivity>65&&v.sensitivity<120,r.model);
    assert.ok(['voltage','power'].includes(v.basis),r.model+' no reference basis');
   }
   if(v.load!==undefined)
    assert.ok(Number.isFinite(v.load)&&v.load>0&&v.load<(p.category==='headphone'?1500:40),r.model);
  }
 }
 assert.equal(catalog.records.length,197,'update audit coverage when catalog is rebuilt');
});
test('all budget powered speakers can show a linked output assessment without inventing max SPL',()=>{
 for(const x of BUDGET_EXAMPLES.filter(x=>x.architecture==='consumer_powered_pair')){
  assert.ok(x.poweredHeadroomModel,x.id+' missing headroom identity');
  assert.ok(POWERED_OUTPUT_EVIDENCE[x.poweredHeadroomModel],x.id+' missing acoustic evidence record');
  const h=recommendationHeadroom(x,{...base,distanceFt:6},catalog);
  assert.equal(h.kind,'powered',x.id);
  assert.ok(h.summary.length>40,x.id);
  assert.match(h.link,/powered=1/);
  assert.equal(h.metrics.peakMarginDb,null,'do not invent peak limit for '+x.id);
  assert.ok(h.reviewSource?.startsWith('https://'),x.id);
  const sound=soundImpressionFor(x);
  assert.ok(sound?.text&&sound.sources.some(s=>s.url.startsWith('https://')),
    x.id+' missing independent listening evidence');
 }
});
test('4,500 complete-system request combinations retain the declared native input and safety boundaries',()=>{
 const architectures=['open','consumer_powered_pair','active_studio','passive_separates','headphone_first'];
 const rooms=['desk','bedroom','living_room','outdoors','party'];
 const goals=['all_rounder','natural','imaging','bass'];
 const inputs=['analog','optical','usb','bluetooth','hdmi'];
 const levels=['quiet','moderate','high'];
 const budgets=[null,180,650];
 let inspected=0;
 for(const architecture of architectures)
 for(const useCase of rooms)
 for(const goal of goals)
 for(const connection of inputs)
 for(const level of levels)
 for(const budget of budgets){
  const request={...base,architecture,useCase,goal,connection,level,budget,
   distanceFt:useCase==='desk'?2:useCase==='party'?20:6};
  const selection=shortlistExamples(request,catalog);
  assert.ok(selection.selected.length<=(architecture==='open'?4:3));
  assert.equal(new Set(selection.selected.map(x=>x.id)).size,selection.selected.length);
  for(const x of selection.selected){
   assert.ok(screenRecommendationSafety(x,request).eligible,x.id+' violates hard gate');
   assert.ok(x.connections.includes(connection),x.id+' lacks requested '+connection);
   assert.equal(x.connectionStatus,'native_possible',x.id);
   if(x.architecture==='passive_separates')assert.ok(x.curatedPairing,x.id+' no load gate');
   if(x.poweredHeadroomModel){
    const h=recommendationHeadroom(x,request,catalog);
    assert.equal(h.kind,'powered',x.id);
    assert.ok(h.link.includes('distanceFt='+request.distanceFt),x.id);
   }
   if(x.subtotal!==null)assert.ok(Number.isFinite(x.subtotal)&&x.subtotal>=0,x.id);
  }
  inspected++;
 }
 assert.equal(inspected,4500);
});
test('no ready-to-connect full system fabricates HDMI support',()=>{
 const r=shortlistExamples({...base,architecture:'consumer_powered_pair',
   connection:'hdmi',useCase:'desk'},catalog);
 assert.equal(r.selected.length,0);
 assert.ok(r.excluded.some(x=>/No documented direct hdmi input/.test(x.reason)));
});
