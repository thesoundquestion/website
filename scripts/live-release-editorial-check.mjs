import assert from 'node:assert/strict';
const BASE = 'https://thesoundquestion.pages.dev';
const paths = [
  '/lab/mastering/',
  '/library/curators-listening-room/',
  '/labs/',
  '/lab/',
  '/library/behind-the-experiments/',
  '/labs/formats/',
];
const pages = new Map();
for (const route of paths) {
  const res = await fetch(BASE + route + '?releasecheck=20261116-mastering-curator', {
    headers: { 'Cache-Control': 'no-cache', 'User-Agent': 'TSQ-Release-Editorial-Smoke/1.0' },
    signal: AbortSignal.timeout(18000)
  });
  assert.equal(res.status, 200, route + ' HTTP status');
  assert.match(res.headers.get('content-type')||'', /text\/html/i, route + ' content-type');
  const text = await res.text();
  assert.ok(text.length > 2000, route + ' content length');
  pages.set(route, text);
  console.log('LIVE_HTML_OK', route, text.length, 'bytes');
}
const master=pages.get('/lab/mastering/');
const curator=pages.get('/library/curators-listening-room/');
const labs=pages.get('/labs/');
for (const required of [
  'More prominent, less expressive?',
  'Guitar solo:',
  'stronger and quieter bounces',
  'Why a remaster can sound like a remix',
  'Hear the mix shift at equal loudness',
  'The compressor',
  '−23.00 LUFS'
]) assert.ok(master.includes(required), 'Mastering Lab missing: ' + required);
for(const required of ['<h3>What You Wish For</h3>','<h3>The Patient</h3>','extended, airy top end','The Count of Tuscany','39 listening selections','03 / 14 SELECTIONS']) {
  assert.ok(curator.includes(required), 'Curator missing: ' + required);
}
assert.equal((curator.match(/<article class="curator-track"/g)||[]).length,39,'39 actual curator entries');
for(const token of ['Thomas McKenzie','Eloi Moliner','Alec Wright','creativecommons.org/licenses/by/4.0/']) {
  assert.ok(master.includes(token),'Master missing attribution: '+token);
  assert.ok(labs.includes(token),'Labs hub missing attribution: '+token);
}
assert.ok(labs.includes('Our thanks to the AlbumDB creators'));
assert.ok(!pages.get('/lab/').includes('A genuine thank-you'));
assert.ok(!master.includes('Thanks to the creators who made this possible'));
console.log('LIVE_EDITORIAL_RELEASE_OK',paths.length,'pages, 39 recommendations, mastering dynamics guidance and credits');
