import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = relative => readFileSync(path.join(root, relative), 'utf8');
const home = read('index.html');
const about = read('about/index.html');
const library = read('library/index.html');
const article = read('library/behind-the-experiments/index.html');
const lab = read('lab/index.html');
const labs = read('labs/index.html');
const styles = read('assets/styles.css');

function linkTargets(text) {
  return [...text.matchAll(/\bhref="(\/[^"]+)"/g)].map(m => m[1].split(/[?#]/)[0]).filter(Boolean);
}

test('homepage has six distinct action destinations', () => {
  const links = [...home.matchAll(/<a class="discovery-card" href="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(links, ['/decoder/', '/labs/', '/system-check/', '/system-builder/', '/system-check/compare/', '/library/behind-the-experiments/']);
  assert.match(home, /CHOOSE YOUR NEXT QUESTION/);
  assert.match(home, /Follow sound from performance to playback/);
});

test('curator note copies the PDF narrative rather than generic branding', () => {
  assert.match(about, /id="curator-note"/);
  for (const phrase of [
    "My name's Cory",
    "a pair of Cerwin-Vega D5s",
    "hit Record and Pause",
    "It's an A-720",
    "my Paradigm Phantom v1s",
    "Music first. Questions always."
  ]) assert.ok(about.includes(phrase), phrase);
  assert.match(about, /How we approach the evidence/);
});

test('comparison analysis identifies evidence boundaries and stereo data', () => {
  for (const part of ['−42.77 dB','−14.61 dB','−9.68 dB','−20 LUFS','processed-dry','FULL DYNAMIC','MODERATE MASTER','BRICKWALLED','not a blinded']) {
    assert.ok(article.toLowerCase().includes(part.toLowerCase()), part);
  }
  assert.match(lab, /Behind the Experiments/);
  assert.match(library, /Behind the experiments/);
});

test('all absolute local links in edited pages point to staged route or files', () => {
  for (const [name, text] of Object.entries({home,about,library,article,lab,labs})) {
    for (const target of linkTargets(text)) {
      const relative = target.endsWith('/') ? target.slice(1)+'index.html' : target.slice(1);
      assert.ok(existsSync(path.join(root, relative)), `${name}: ${target} is missing`);
    }
  }
});

test('responsive layout and no live deployment placeholder on homepage', () => {
  assert.match(styles, /\.discovery-grid\{display:grid/);
  assert.match(styles, /max-width:540px/);
  assert.doesNotMatch(home, /coming soon/i);
});
