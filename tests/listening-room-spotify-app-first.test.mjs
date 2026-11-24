import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../library/curators-listening-room/index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../assets/listening-room-spotify.js', import.meta.url), 'utf8');

test('Spotify links keep HTTPS fallback and enable app-first handler', () => {
  assert.match(html, /<script src="\/assets\/listening-room-spotify\.js" defer><\/script>/);
  const urls = [...html.matchAll(/href="(https:\/\/open\.spotify\.com\/[^"]+)"/g)].map(m => m[1]);
  assert.equal(urls.length, 55);
  assert.ok(urls.some(url => url.includes('/playlist/')));
  assert.ok(urls.some(url => url.includes('/album/')));
  assert.ok(urls.some(url => url.includes('/search/')));
  assert.match(script, /spotify:search:/);
  assert.match(script, /'spotify:' \+ parts\[0\]/);
  assert.match(script, /window\.location\.assign\(webUrl\)/);
  assert.match(script, /event\.metaKey \|\| event\.ctrlKey/);
  assert.match(script, /if \(isMobile\) return/);
});
