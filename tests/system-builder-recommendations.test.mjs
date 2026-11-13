import test from 'node:test';
import assert from 'node:assert/strict';
import {EXAMPLES, shortlistExamples} from '../system-builder/recommendations.mjs';

const defaults = {architecture:'open',useCase:'living_room',goal:'all_rounder',
  region:'CA',currency:'CAD',level:'moderate',connection:'analog',power:'mains',
  budget:null,budgetStrict:true,used:true,distanceFt:8,referenceDate:'2026-11-13'};

test('named catalog is an editorial shortlist, not a scored ranking',()=>{
  assert.equal(EXAMPLES.length,19);
  assert.ok(EXAMPLES.every(x=>x.title && x.why && x.tradeoff && x.parts.length && x.parts.every(p=>p.name&&p.count>0)));
  assert.ok(EXAMPLES.every(x=>x.parts.filter(p=>p.url).every(p=>p.url.startsWith('https://'))));
  assert.ok(EXAMPLES.every(x=>!('matchScore' in x)&&!('soundQualityScore' in x)));
});

test('Canadian MR4 example has dated single observed manufacturer pair price, not a complete total',()=>{
  const x=shortlistExamples({...defaults,architecture:'consumer_powered_pair',useCase:'desk'});
  const mr4=x.selected.find(x=>x.id==='powered-mr4');
  assert.equal(mr4.subtotal,179.99);
  assert.equal(mr4.pricingStatus,'partial_subtotal');
  assert.equal(mr4.parts.length,1);
  assert.match(mr4.tradeoff,/no built-in Bluetooth/i);
});
test('quoted JBL monitor price is for two separate cabinets',()=>{
  const x=shortlistExamples({...defaults,architecture:'active_studio',useCase:'desk'});
  const j=x.selected.find(x=>x.id==='studio-jbl');
  assert.equal(j.subtotal,559.98);
  assert.equal(j.priceComponents[0].quantity,2);
  assert.ok(j.parts.some(p=>p.count===2));
});
test('a past subtotal above a firm ceiling does not block a system',()=>{
  const x=shortlistExamples({...defaults,architecture:'passive_separates',budget:400});
  const starter=x.selected.find(x=>x.id==='passive-bt20a-xt15');
  assert.equal(starter.subtotal,438.99);
  assert.equal(starter.priceDate,'2026-11-13');
  assert.ok(!x.excluded.some(x=>/budget/.test(x.reason)));
});
test('flexible budget can show examples with a higher dated parts reference',()=>{
  const x=shortlistExamples({...defaults,architecture:'consumer_powered_pair',budget:100,budgetStrict:false,useCase:'desk'});
  assert.ok(x.selected.some(x=>x.id==='powered-mr3'));
  assert.ok(x.selected.some(x=>x.subtotal>100));
});
test('no Canadian price represented as another regional price',()=>{
  const x=shortlistExamples({...defaults,architecture:'consumer_powered_pair',region:'US',currency:'USD',useCase:'desk'});
  assert.ok(x.selected.length);
  assert.ok(x.selected.every(x=>x.subtotal===null && x.pricingStatus==='regional_price_missing'));
});
test('battery hard gate excludes mains-powered examples',()=>{
  const x=shortlistExamples({...defaults,architecture:'party_pa',useCase:'party',goal:'party',power:'battery'});
  assert.ok(x.selected.some(x=>x.id==='party-soundboks'));
  assert.ok(!x.selected.some(x=>x.id==='party-dzr'));
  assert.ok(x.excluded.some(x=>x.title.includes('DZR15')));
});
test('headphones may be used with an independently checked off-grid source',()=>{
  const x=shortlistExamples({...defaults,architecture:'headphone_first',power:'battery'});
  assert.ok(x.selected.some(x=>x.id==='headphone-hd560'));
  assert.ok(x.selected.every(x=>x.sourceBatteryCaution));
});
test('requested unsupported native source connection requires separately priced adaptation',()=>{
  const x=shortlistExamples({...defaults,architecture:'consumer_powered_pair',useCase:'desk',connection:'hdmi'});
  assert.ok(x.selected.every(x=>x.connectionStatus==='adapter_needed'));
});
test('used models are an unpriced evergreen watchlist, not forced secondhand bundles',()=>{
  const x=shortlistExamples({...defaults,architecture:'passive_separates',used:false});
  const y=shortlistExamples({...defaults,architecture:'passive_separates',used:true});
  assert.ok(!x.selected.some(x=>x.usedOnly));
  assert.ok(!y.selected.some(x=>x.usedOnly));
  assert.ok(!EXAMPLES.some(x=>x.title.includes('Used-equipment watchlist: Yamaha RX-485')));
});
test('an open-system comparison includes different architectures, not four consecutive speakers of one type',()=>{
  const x=shortlistExamples({...defaults});
  assert.ok(new Set(x.selected.map(x=>x.architecture)).size>=3);
});
test('legacy R-S202/P3 example has been retired; affordable Fosi/Polk pair includes load caution',()=>{
  assert.ok(!EXAMPLES.some(x=>x.title.includes('R-S202 + PSB Alpha P3')));
  const x=EXAMPLES.find(x=>x.id==='passive-bt20a-xt15');
  assert.ok(x);
  assert.match(x.loadCaution,/4.1 Ω/);
  assert.match(x.tradeoff,/not a certified|NOT a certified/i);
  assert.equal(x.priceCA.components.reduce((n,p)=>n+p.amount,0),438.99);
});
test('no example certifies a full price or real-world compatibility',()=>{
  const x=shortlistExamples({...defaults});
  assert.ok(x.selected.every(i=>i.pricingStatus==='partial_subtotal'||i.pricingStatus==='regional_price_missing'));
  assert.ok(x.selected.every(i=>!('electricallyVerified' in i)));
});

test('battery-required open search presents battery event options rather than mains stereo gear',()=>{
  const x=shortlistExamples({...defaults,architecture:'open',power:'battery',useCase:'outdoors'});
  assert.ok(x.selected.length);
  assert.ok(x.selected.every(i=>i.architecture==='party_pa'&&i.power==='battery'));
});
test('different primary goals remain relevant even when one suitable example meets both',()=>{
  const imaging=shortlistExamples({...defaults,goal:'imaging'});
  const bass=shortlistExamples({...defaults,goal:'bass'});
  // A well-suited product can legitimately meet more than one main priority.
  // Do not manufacture divergent recommendations solely for appearance.
  assert.ok(imaging.selected[0].goals.includes('imaging'));
  assert.ok(bass.selected[0].goals.includes('bass'));
  assert.ok(imaging.selected.every(i=>!('matchScore' in i)));
  assert.ok(bass.selected.every(i=>!('matchScore' in i)));
});

test('secondary priorities annotate conditional relevance but are never converted to numerical scores',()=>{
  const x=shortlistExamples({...defaults,architecture:'consumer_powered_pair',useCase:'desk',secondary:['low_volume','bass']});
  const mr4=x.selected.find(i=>i.id==='powered-mr4');
  const ora=x.selected.find(i=>i.id==='powered-ora');
  assert.deepEqual(mr4.secondaryFocus,['low_volume']);
  assert.deepEqual(ora.secondaryFocus,['low_volume','bass']);
  assert.ok(!x.selected.some(i=>'matchScore' in i));
});
