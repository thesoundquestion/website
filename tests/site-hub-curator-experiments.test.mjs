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

test('homepage has only three large jump cards, eight compact reference cards and six small goals', () => {
  const links = [...home.matchAll(/<nav class="home-quick-links"[^>]*>([\s\S]*?)<\/nav>/g)].flatMap(m=>[...m[1].matchAll(/<a href="([^"]+)"/g)].map(x=>x[1]));
  assert.deepEqual(links, ['/decoder/', '/labs/', '/tools/']);
  const small = home.match(/<nav class="home-more-grid"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || '';
  const smallLinks = [...small.matchAll(/<a href="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(smallLinks, ['/decoder/technical-glossary/', '/decoder/audiophile-glossary/', '/library/', '/library/curators-listening-room/', '/journey/', '/about/', '/connect/', 'https://ko-fi.com/thesoundquestion']);
  assert.ok(home.indexOf('home-quick-links') < home.indexOf('home-goal-grid') && home.indexOf('home-goal-grid') < home.indexOf('home-more-grid'));
  assert.equal((home.match(/class="home-quick-links"/g)||[]).length,1);
  assert.equal((home.match(/class="home-more-grid"/g)||[]).length,1);
  assert.equal((home.match(/class="home-goal-card"/g)||[]).length,6);
  assert.doesNotMatch(home,/class="discovery-card"/);
  assert.match(home, /KNOW WHERE YOU WANT TO GO/);
  assert.match(home, /Sound Journey/);
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

test('About is prominent and evidence explanations contain no private listening testimony',()=>{
 assert.match(home,/<a href="\/about\/">\s*<strong>About<\/strong>/);
 assert.doesNotMatch(article,/Grado|Paradigm Phantom|During informal listening|my headphones|my speakers/i);
 assert.match(article,/Why playback can change the sense of space/);
 assert.match(labs,/href="\/lab\/mastering\/"/);
});

test('AlbumDB credit remains visible without obsolete unresolved-permission warning', () => {
  assert.match(article, /Let The Light In/);
  assert.match(article, /zenodo\.org\/records\/19683001/);
  assert.match(article, /Thomas McKenzie, Eloi Moliner Juanpere and Alec Wright/);
  assert.match(article, /CC BY 4\.0/);
  assert.match(article, /AES Paper 10278/);
  assert.doesNotMatch(article, /separate commercial album listing and the dataset licence/i);
  assert.doesNotMatch(article, /Public hosting of our remixed audio remains subject to checking/i);
});


test('homepage playlist count matches Listening Room and approved handbook is directly downloadable', () => {
  const curator = read('library/curators-listening-room/index.html');
  const cards = [...curator.matchAll(/<article class="curator-track"/g)].length;
  assert.equal(cards, 51, 'unexpected number of curator selections');
  assert.match(home, new RegExp(cards + ' personal picks'));
  assert.match(curator, new RegExp(cards + ' listening selections'));
  const pdf = '/library/make-audio-make-sense/make-audio-make-sense-illustrated.pdf';
  assert.ok(library.includes('href="' + pdf + '" download'), 'Library PDF download missing');
  assert.ok(existsSync(path.join(root, pdf.slice(1))), 'download target absent');
  assert.ok(!existsSync(path.join(root,'library/make-audio-make-sense/make-audio-make-sense.pdf')), 'retired PDF still tracked');
  assert.doesNotMatch(home, /38 personal picks|39 personal picks/);
});
