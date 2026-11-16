import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Script } from 'node:vm';
const get = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const master = get('lab/mastering/index.html');
const hub = get('labs/index.html');
const mixing = get('lab/index.html');
const curator = get('library/curators-listening-room/index.html');

test('Mastering Lab explains audible instrument prominence versus retained dynamics', () => {
  for (const phrase of [
    'More prominent, less expressive?',
    'Guitar solo:',
    'Ping-pong synth:',
    'stronger and quieter bounces',
    'Hear the mix shift at equal loudness',
    'Why a remaster can sound like a remix',
    'Sometimes mastering makes you hear more of an instrument',
    'combined stereo signal',
    'clipping and limiting',
  ]) assert.ok(master.includes(phrase), phrase);
  assert.doesNotMatch(master, /each instrument crosses its own compressor threshold/i);
});

test('All recorded measurements and online audio paths are preserved', () => {
  for (const token of [
    '−20.98', '−13.83', '−8.48', '20.27 dB','14.04 dB','5.51 dB',
    '−23.00 LUFS','/mastering/dynamic.flac','/mastering/moderate.flac',
    '/mastering/brickwalled.flac','/mastering/eq-on.flac',
  ]) assert.ok(master.includes(token), token);
  const scripts = [...master.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
  assert.ok(scripts.length > 0, 'at least one inline script');
  for (const [, js] of scripts) new Script(js);
  assert.match(master, /const texts=\{/);
  assert.match(master, /function setNotes\(\)/);
});

test('Acknowledgement prose is concise while independent work and attribution remain', () => {
  for (const page of [master, mixing, hub]) {
    for (const name of ['Tom McKenzie','Eloi Moliner','Alec Wright','AlbumDB']) {
      assert.ok(page.includes(name), 'Missing attribution: ' + name);
    }
    assert.match(page, /creativecommons\.org\/licenses\/by\/4\.0\//);
    assert.match(page, /(?:no endorsement|does not imply endorsement)/i);
  }
  assert.match(hub, /Our thanks to the AlbumDB creators/);
  assert.doesNotMatch(mixing, /A genuine thank-you/);
  assert.doesNotMatch(master, /Thanks to the creators who made this possible/);
  assert.doesNotMatch(curator, /Thanks, Tom/);
  assert.equal((curator.match(/<article class="curator-track"/g) || []).length, 39);
});
