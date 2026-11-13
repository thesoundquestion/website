import test from 'node:test';
import assert from 'node:assert/strict';
import {retailPriceReference} from '../system-builder/price-references.mjs';

const snapshot = {date:'2026-11-13',components:[
  {label:'Monitor',amount:179.99,quantity:2,url:'https://example.com/monitor'},
  {label:'Cable',amount:8.99,url:'https://example.com/cable'}
]};

test('dated references retain the correct total and unit count for days zero through 29', () => {
  for (const date of ['2026-11-13','2026-12-12']) {
    const prices = retailPriceReference(snapshot,date);
    assert.equal(prices.subtotal,368.97);
    assert.equal(prices.priceDate,snapshot.date);
    assert.deepEqual(prices.priceComponents,snapshot.components);
  }
});

test('expired, future and invalid reference dates keep retailer links without amounts', () => {
  const expected = {subtotal:null,priceDate:null,priceComponents:snapshot.components.map(({amount,...part})=>part)};
  assert.deepEqual(retailPriceReference(snapshot,'2026-12-13'),expected);
  assert.deepEqual(retailPriceReference(snapshot,'2026-11-12'),expected);
  for (const date of [null,'2026-02-30','2026-11-13T00:00:00Z']) {
    assert.deepEqual(retailPriceReference({...snapshot,date},'2026-11-13'),expected);
  }
  assert.equal(snapshot.components[0].amount,179.99);
});
