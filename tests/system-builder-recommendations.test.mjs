import test from 'node:test';
import assert from 'node:assert/strict';
import {EXAMPLES, shortlistExamples} from '../system-builder/recommendations.mjs';

const defaults = {architecture:'open',useCase:'living_room',goal:'all_rounder',
  region:'CA',currency:'CAD',level:'moderate',connection:'analog',power:'mains',
  budget:null,budgetStrict:true,used:true,distanceFt:8};

test('named catalog is an editorial shortlist, not a scored ranking',()=>{
  assert.ok(EXAMPLES.length>=10);
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
test('firm budget excludes known subtotal above ceiling',()=>{
  const x=shortlistExamples({...defaults,architecture:'passive_separates',budget:500});
  assert.ok(!x.selected.some(x=>x.id==='passive-rs202-p3'));
  assert.ok(x.excluded.some(x=>x.title.includes('R-S202')&&/budget/.test(x.reason)));
});
test('flexible budget may display over-subtotal example with warning for display',()=>{
  const x=shortlistExamples({...defaults,architecture:'consumer_powered_pair',budget:100,budgetStrict:false,useCase:'desk'});
  assert.ok(x.selected.some(x=>x.id==='powered-mr4'));
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
test('used watchlist excluded when buyer rules out secondhand gear',()=>{
  const x=shortlistExamples({...defaults,architecture:'passive_separates',used:false});
  assert.ok(!x.selected.some(x=>x.usedOnly));
  const y=shortlistExamples({...defaults,architecture:'passive_separates',used:true});
  assert.ok(y.selected.some(x=>x.usedOnly));
});
test('an open-system comparison includes different architectures, not four consecutive speakers of one type',()=>{
  const x=shortlistExamples({...defaults});
  assert.ok(new Set(x.selected.map(x=>x.architecture)).size>=3);
});
test('published R-S202/P3 pairing discloses the manufacturer impedance warning',()=>{
  const x=EXAMPLES.find(x=>x.id==='passive-rs202-p3');
  assert.match(x.tradeoff,/4 Ω minimum/);
  assert.match(x.tradeoff,/NOT a verified safe pairing/);
});
test('no example certifies a full price or real-world compatibility',()=>{
  const x=shortlistExamples({...defaults});
  assert.ok(x.selected.every(i=>i.pricingStatus==='partial_subtotal'||i.pricingStatus==='regional_price_missing'));
  assert.ok(x.selected.every(i=>!('electricallyVerified' in i)));
});
