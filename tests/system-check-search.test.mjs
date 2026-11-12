import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeModel, buildSearches, googleSearchUrl } from '../system-check/spec-search.mjs';

test('model normalization preserves exact models and revisions while removing unsafe quote characters', () => {
  assert.equal(normalizeModel('  Yamaha   A–720  '), 'Yamaha A-720');
  assert.equal(normalizeModel(' Klipsch RP-600M II '), 'Klipsch RP-600M II');
  assert.equal(normalizeModel('Paradigm Phantom v1'), 'Paradigm Phantom v1');
  assert.equal(normalizeModel('"Panasonic" SA-HE100'), 'Panasonic SA-HE100');
  assert.equal(normalizeModel(''), '');
});

test('amplifier search contains only related System Check fields', () => {
  for (const model of ['Yamaha A-720', 'Panasonic SA-HE100', 'Yamaha HTR-4063', 'Yamaha A-S801']) {
    const searches = buildSearches('amp', model);
    assert.equal(searches.length, 4);
    assert.ok(searches.every(s => s.query.includes(model.split(' ')[0])));
    assert.ok(searches.some(s => s.query.includes('power watts per channel')));
    assert.ok(searches.some(s => s.query.includes('THD+N')));
    assert.ok(searches.some(s => s.query.includes('input impedance voltage gain')));
    assert.ok(searches.every(s => !/soundstage|holographic|music discovery/i.test(s.query)));
  }
});

test('speaker searches focus on available input fields, not frequency response', () => {
  for (const model of ['Paradigm Phantom v1', 'Klipsch RP-600M II', 'PSB Alpha B1']) {
    const searches = buildSearches('speaker', model);
    assert.equal(searches.length, 4);
    assert.ok(searches.some(s => /sensitivity .*impedance/.test(s.query)));
    assert.ok(searches.some(s => /power handling/.test(s.query)));
    assert.ok(searches.some(s => /minimum maximum impedance phase/.test(s.query)));
    assert.ok(searches.every(s => !/frequency response|soundstage|marketing/.test(s.query)));
  }
});

test('URLs use ordinary Google Search with safely encoded model text', () => {
  const unusual = 'ACME X-10 & Mk.II + Rev/B';
  const searches = buildSearches('amp', unusual);
  for (const { query } of searches) {
    const url = googleSearchUrl(query);
    const u = new URL(url);
    assert.equal(u.origin, 'https://www.google.com');
    assert.equal(u.pathname, '/search');
    assert.equal(u.searchParams.get('q'), query);
    assert.equal(u.searchParams.size, 1);
  }
  assert.deepEqual(buildSearches('amp', ''), []);
  assert.deepEqual(buildSearches('unknown', 'Yamaha A-720'), []);
});

test('custom search engine is removed while calculator and manual inputs remain', () => {
  const calc = readFileSync(new URL('../system-check/calculator.js', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../system-check/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(calc + page, /cse\.google\.com|google\.search\.cse|__gcse|data-google-engine|spec-search-results/);
  assert.match(page, /spec-search\.mjs/);
  for (const name of ['speakerModel', 'ampModel', 'speakerPowerContinuous', 'sensitivity', 'load', 'curveType', 'inputSensitivity']) {
    assert.match(page, new RegExp('name="' + name + '"'));
  }
  assert.match(calc, /function readRatings\(\)/);
  assert.match(calc, /function calculate\(\)/);
  assert.match(calc, /form\.addEventListener\('submit'/);
});
