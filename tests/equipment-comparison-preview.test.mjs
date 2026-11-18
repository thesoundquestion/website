import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const html=read('tools/equipment-comparison-preview/index.html');
const script=read('tools/equipment-comparison-preview/preview.mjs');
const css=read('tools/equipment-comparison-preview/style.css');

test('review preview stays unlisted, noindex and does not overwrite existing comparison',()=>{
  assert.match(html,/name="robots" content="noindex,nofollow"/);
  assert.match(html,/Unpublished review preview/);
  assert.doesNotMatch(html,/rel="canonical"/);
  assert.doesNotMatch(script,/localStorage|sessionStorage|XMLHttpRequest/);
  assert.match(html,/This prototype is intentionally unlisted/);
});
test('comparison loads shared registry and region-specific labels rather than static price guesses',()=>{
  assert.match(script,/loadEquipmentCatalog\(/);
  assert.match(script,/buildEquipmentComparison\(/);
  assert.match(script,/loadRegionalPriceTiers\(/);
  assert.match(script,/regionalPriceLabel\(/);
  assert.match(html,/Retail pricing region/);
  assert.match(html,/Indicative pricing position based on a small Canadian retail sample/);
  assert.doesNotMatch(html,/\$\d/);
});
test('model filter and comparison are accessible in review markup',()=>{
  for(const id of ['category','region','left-search','right-search','left','right'])
    assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/tabindex="0" role="region"/);
  assert.match(html,/<caption>/);
  assert.match(css,/@media\(max-width:660px\)/);
  assert.match(script,/textContent=/);
  assert.doesNotMatch(script,/innerHTML/);
});
test('both models retain source references and unknowns without recommendations',()=>{
  assert.match(html,/What actually changes\?/);
  assert.match(script,/comparison\.observations/);
  assert.match(html,/Manufacturer and source references/);
  assert.match(script,/item\.evidence/);
  assert.match(script,/No verified regional retail pricing label/);
  assert.match(script,/No verified source URL in the catalogue/);
  assert.match(html,/not a sound-quality ranking or a compatibility guarantee/);
});
