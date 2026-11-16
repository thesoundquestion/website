import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const html = readFileSync(path.join(root, 'labs/formats/index.html'), 'utf8');
const manifest = JSON.parse(readFileSync(path.join(root, 'assets/audio/formats/manifest.json'), 'utf8'));

test('first-time visitor sees the audio test before the technical explanation', () => {
  for (const phrase of ['Can you <em>hear</em> the difference?', 'No technical knowledge needed', 'Small clues, not huge changes.', 'Lossless', 'WAV vs FLAC?']) {
    assert.ok(html.toLowerCase().includes(phrase.toLowerCase()), phrase);
  }
  assert.equal((html.match(/data-song=/g) || []).length, 2);
  assert.equal((html.match(/data-format=/g) || []).length, 3);
  for (const id of ['playPause','seek','restart','playingNow']) assert.ok(html.includes('id="' + id + '"'), id);
});

test('MP3 files were generated from existing FLAC sources, not separate mixes', () => {
  assert.match(html, /mixing\/reference\.flac/);
  assert.match(html, /mastering\/dynamic\.flac/);
  assert.doesNotMatch(html, /lamejs|Prepare my listening test|noindex,nofollow/);
  assert.match(html, /MATCHED_VOLUME/);
  assert.match(html, /player\.volume = MATCHED_VOLUME/);
  for (const key of ['light','diva']) {
    const source = manifest.sources[key];
    assert.ok(source);
    assert.ok(source.source_url.endsWith(key === 'light' ? '/mixing/reference.flac' : '/mastering/dynamic.flac'));
    assert.equal(source.lossless.sample_rate, 44100);
    assert.equal(source.lossless.channels, 2);
    for (const rate of [128,320]) {
      const item = source.variants[String(rate)];
      const file = path.join(root, item.path.replace(/^\//,''));
      assert.ok(existsSync(file), file);
      assert.equal(statSync(file).size, item.bytes);
      assert.equal(item.bit_rate, rate * 1000);
      assert.equal(item.alignment.samples, 0);
      assert.ok(Math.abs(item.rms_difference_db) < 0.8);
      assert.ok(html.includes(item.path));
    }
  }
});

test('visitor-facing page avoids false endorsements and redirects to learning resources', () => {
  assert.match(html, /No endorsement or partnership is implied/);
  assert.match(html, /decoder\/lossy-lossless\//);
  assert.match(html, /Song|song/);
  assert.match(html, /This is an approximate RMS-matched guided comparison, not a blinded scientific test/);
  assert.match(html, /@media\(max-width:680px\)/);
});
