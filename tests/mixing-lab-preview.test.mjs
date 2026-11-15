import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../lab/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../assets/mixing-lab.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../assets/mixing-lab.js', import.meta.url), 'utf8');

test('three separate, labelled listening options share a transport', () => {
  for (const mix of ['narrow','reference','polished']) {
    assert.match(html, new RegExp(`data-mix="${mix}"`));
    assert.match(html, new RegExp(`data-guide="${mix}"`));
    assert.match(html, new RegExp(`data-file-for="${mix}"`));
  }
  assert.match(html, /id="labAudio"/);
  assert.match(html, /id="playToggle"/);
  assert.match(js, /pendingSeek/);
  assert.match(js, /setSource\(btn\.dataset\.mix\)/);
});

test('honest source provenance, internal rights gate and listening guidance', () => {
  assert.match(html, /14 processed-dry tracks/i);
  assert.match(html, /Headphones recommended/i);
  assert.match(html, /shaker.*already|shaker.*supplied|existing stereo drift/i);
  assert.match(html, /−20 LUFS/);
  assert.match(html, /The Recordings Behind Our Labs/i);
  assert.match(html, /href="\/labs\/#recordings"/);
  const checklist = readFileSync(new URL('../staging/release-consolidation-20261115/README.md', import.meta.url), 'utf8');
  assert.match(checklist, /underlying composition/i);
  assert.match(html, /name="robots" content="index,follow"/);
  assert.doesNotMatch(html, /src="[^"\n]+\.(wav|mp3|flac)"/i);
});

test('hosted audio loads automatically; user replacement files remain local', () => {
  assert.match(js, /tsq-lab-audio\.thesoundquestion\.workers\.dev/);
  assert.match(js, /setSource\(current, false\)/);
  assert.match(js, /\/mixing\//);
  assert.match(js, /URL\.createObjectURL\(file\)/);
  assert.match(js, /URL\.revokeObjectURL/);
  assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|\.post\s*\(/);
});

test('mobile and accessible interactive controls', () => {
  assert.match(css, /@media\(max-width:650px\)/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(html, /role="status" aria-live="polite"/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /type="range"/);
});
