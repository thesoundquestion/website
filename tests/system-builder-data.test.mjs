import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContext,runInContext} from 'node:vm';
import {inspectOwnedPair} from '../system-builder/engine.mjs';
const file = name => readFileSync(new URL(name,import.meta.url),'utf8');
function loadAdapter() {
  const sandbox = {window:{}};
  createContext(sandbox);
  runInContext(file('../system-check/gear.js'),sandbox);
  runInContext(file('../system-check/compare/specs.js'),sandbox);
  runInContext(file('../system-builder/catalog-adapter.js'),sandbox);
  return sandbox.window.systemBuilderInventory;
}
test('read-only adapter consumes the actual 130 live records, no duplicates', () => {
  const x=loadAdapter();
  assert.deepEqual(Object.fromEntries(Object.entries(x).map(([k,v])=>[k,v.length])),
    {speaker:59,amp:42,source:19,headphone:10});
  for (const arr of Object.values(x)) {
    assert.equal(new Set(arr.map(x=>x.model)).size,arr.length);
    assert.equal(Object.isFrozen(arr),true);
  }
});
test('amplifier multi-load ratings are retained unchanged in the new adapter', () => {
  const x=loadAdapter();
  const a=x.amp.find(r=>r.model==='Yamaha A-720');
  assert.ok(a,'The original Yamaha A-720 preset must be in System Check');
  assert.ok(a.ratings.length);
  assert.equal(Array.isArray(a.ratings[0]),true);
  assert.equal(Object.isFrozen(a.ratings[0]),true);
});
test('speaker sensitivity basis and original specification source survive', () => {
  const x=loadAdapter();
  const a=x.speaker.find(r=>r.model==='KEF Q150');
  assert.ok(a);
  assert.ok(['power','voltage'].includes(a.values.basis));
  assert.match(a.url,/^https?:\/\//);
  assert.ok(a.details?.reference,'Compare My Gear supplemental detail is linked when present');
});
test('new compatibility inspection never says a nominal-load match proves safe', () => {
  const x=loadAdapter();
  const speaker=x.speaker.find(v=>Number.isFinite(v.values.load));
  const amp=x.amp.find(v=>v.ratings.length>0);
  const r=inspectOwnedPair(speaker,amp);
  assert.equal(r.status,'conditional');
  assert.ok(r.checks.some(x=>/minimum impedance/.test(x)));
});
test('no new research-only products are silently imported into preset catalog', () => {
  const x=loadAdapter();
  assert.equal(x.speaker.length+x.amp.length+x.source.length+x.headphone.length,130);
  assert.equal(x.subwoofer,undefined);
  assert.equal(x.party_pa,undefined);
});
test('HTML page has accessible fallback and does not use paid APIs', () => {
  const html=file('../system-builder/index.html');
  assert.match(html,/<noscript>/);
  assert.match(html,/aria-live=/);
  assert.match(html,/system-check\/gear\.js/);
  assert.match(html,/system-check\/compare\/specs\.js/);
  assert.doesNotMatch(html,/googleapis\.com\/customsearch|fetch\(.*retailer/i);
});
test('original System Check remains a separate validated calculator', () => {
  const html=file('../system-builder/index.html');
  assert.doesNotMatch(html,/calculator\.js/);
  assert.match(html,/href="\/system-check\/"/);
  const app=file('../system-builder/app.mjs');
  assert.doesNotMatch(app,/Math\.log10|10\s*\*\*/);
});
