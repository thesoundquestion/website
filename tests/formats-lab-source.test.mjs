import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../labs/formats/index.html', import.meta.url), 'utf8');

test('beginner-first learning and accessible sample controls', () => {
  for (const phrase of ['Can you <em>hear</em> the difference?', 'No technical knowledge needed', 'Listen for', 'Lossless', 'MP3', 'WAV vs FLAC?']) {
    assert.ok(html.toLowerCase().includes(phrase.toLowerCase()), phrase);
  }
  assert.equal((html.match(/data-song=/g) || []).length, 2);
  assert.equal((html.match(/data-format=/g) || []).length, 3);
  assert.match(html, /id="playPause"/);
  assert.match(html, /id="seek"/);
  assert.match(html, /id="status" role="status" aria-live="polite"/);
});
test('real published sample locations, same file used for each encoding, and no premature release', () => {
  assert.match(html, /mixing\/reference\.flac/);
  assert.match(html, /mastering\/dynamic\.flac/);
  assert.match(html, /const RATES = \[128, 320\]/);
  assert.match(html, /encodeMp3\(left, right, rate/);
  assert.match(html, /noindex,nofollow/);
  assert.match(html, /not<\/strong> a validated blind scientific test/);
  assert.match(html, /Offline review draft/);
});
test('player source selection, cleanup and simple mobile layouts', () => {
  assert.match(html, /function chooseSong\(/);
  assert.match(html, /function selectFormat\(/);
  assert.match(html, /function cleanFiles\(/);
  assert.match(html, /URL\.revokeObjectURL/);
  assert.match(html, /@media\(max-width:680px\)/);
});