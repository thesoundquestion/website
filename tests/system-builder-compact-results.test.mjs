import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app = readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
const page = readFileSync(new URL('../system-builder/index.html',import.meta.url),'utf8');
const css = readFileSync(new URL('../system-builder/style.css',import.meta.url),'utf8');

test('summary is one compact profile rather than large multi-column tiles', () => {
  assert.match(app,/const profile = el\('p','sb-profile'\)/);
  assert.doesNotMatch(app,/const summary = el\('div','sb-summary'\)/);
});

test('first three product options appear before extra options are expandable', () => {
  assert.match(app,/shortlist\.selected\.slice\(0,3\)/);
  assert.match(app,/const more = el\('details','sb-more'\)/);
  assert.match(app,/Show '/);
});

test('card structure keeps urgent warnings visible and price references inside optional details', () => {
  const start = app.indexOf("const renderCard = item =>");
  const more = app.indexOf("const details = el('details','sb-card-details');",start);
  const warning = app.indexOf("if (item.loadCaution)",start);
  const price = app.indexOf("renderPriceReferences(details,item,'h5');",start);
  assert.ok(start>=0&&warning>start&&more>warning&&price>more);
  assert.match(app,/item\.loadCaution/);
  assert.match(app,/sb-card-alert/);
  assert.doesNotMatch(app,/item\.id === 'passive-rs202-p3'/);
  assert.match(app,/item.connectionStatus === 'adapter_needed'/);
});

test('each product card uses native expandable details without opening automatically', () => {
  assert.match(app,/el\('details','sb-card-details'\)/);
  assert.doesNotMatch(app,/details\.open = true/);
});

test('technical audit is optional and its individual chapters are expandable', () => {
  assert.match(app,/const detail = el\('details','sb-audit'\)/);
  assert.match(app,/el\(withinAudit \? 'details' : 'section'/);
  assert.match(app,/Want the technical explanation/);
});

test('research methodology is opt-in, while the form and results remain discoverable', () => {
  assert.match(page,/<details class="sb-method">/);
  assert.match(page,/<summary>How these examples are chosen/);
  assert.match(page,/id="sb-form"/);
  assert.match(page,/id="sb-results"/);
  assert.doesNotMatch(page,/<section class="sb-method">/);
});

test('small-width layouts preserve readable compact cards and keyboard focus', () => {
  assert.match(css,/@media\(max-width:360px\)/);
  assert.match(css,/\.sb-card-details>summary:focus-visible/);
  assert.match(css,/\.sb-recommendations,[^\n]*\{grid-template-columns:1fr\}/);
});
