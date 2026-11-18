import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const load = relative => readFileSync(path.join(root, relative), 'utf8');

const policy = load('content-use/index.html');
const draft = load('docs/content-use-policy-draft.md');
const builder = load('system-builder/index.html');
const response = load('decoder/speaker-frequency-response/index.html');
const dispersion = load('decoder/speaker-dispersion/index.html');
const bass = load('decoder/bass-extension/index.html');
const homepage = load('index.html');
const library = load('library/index.html');
const about = load('about/index.html');
const sitemap = load('sitemap.xml');

test('policy defines our original work and third-party sourcing without elevating a single publisher', () => {
  for (const phrase of ['What we publish', 'What we do not treat as ours', 'scrape', 'digitize', 'partnership']) {
    assert.ok(policy.includes(phrase), phrase);
  }
  assert.doesNotMatch(policy, /erinsaudiocorner|measurement-data-policy|Erin.s Audio Corner/i);
  assert.doesNotMatch(draft, /erinsaudiocorner|measurement-data-policy|Erin.s Audio Corner/i);
  assert.match(policy, /not a claim that we created its work/);
  assert.match(draft, /not a claim that we created its work/);
});

test('Builder references its own policy, not another review site policy', () => {
  assert.match(builder, /href="\/content-use\/"/);
  assert.doesNotMatch(builder, /erinsaudiocorner\.com\/measurement-data-policy/);
});

test('only contextual individual reviews are linked in lessons', () => {
  assert.match(response, /erinsaudiocorner\.com\/loudspeakers\/kef_r3_meta/);
  assert.match(response, /compare the on-axis curve, listening-window average and off-axis response/);
  assert.match(dispersion, /erinsaudiocorner\.com\/loudspeakers\/mkiw150/);
  assert.match(dispersion, /horizontal and vertical off-axis curves/);
  assert.match(bass, /erinsaudiocorner\.com\/loudspeakers\/yamaha_ns800a/);
  assert.match(bass, /full-range versus 80 Hz high-passed/);
  assert.doesNotMatch(response + dispersion + bass, /measurement-data-policy/);
});

test('neutral policy is discoverable from core pages and sitemap', () => {
  assert.ok(existsSync(path.join(root, 'content-use/index.html')));
  assert.match(sitemap, /https:\/\/thesoundquestion\.com\/content-use\//);
  for (const [name, doc] of Object.entries({homepage,library,about})) {
    assert.match(doc, /href="\/content-use\/"/, name);
  }
});
