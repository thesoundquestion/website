import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../library/curators-listening-room/index.html', import.meta.url), 'utf8');
const section = id => {
  const start = html.indexOf('<section class="curator-category section section-border" id="' + id + '"');
  assert.ok(start > -1, 'Missing section: ' + id);
  const end = html.indexOf('<section class="curator-category section section-border"', start + 20);
  return html.slice(start, end > -1 ? end : undefined);
};

test('Listening Room selection totals match actual cards', () => {
  const count = [...html.matchAll(/<article class="curator-track"/g)].length;
  const riffs = section('riffs-and-grooves');
  assert.equal(count, 52);
  assert.equal([...riffs.matchAll(/<article class="curator-track"/g)].length, 21);
  assert.match(html, /52 listening selections/);
  assert.match(html, /03 \/ 21 SELECTIONS/);
  assert.match(html, /Band Interaction <span aria-hidden="true">\(21\)<\/span>/);
  const ids = [...html.matchAll(/<article class="curator-track" id="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'Unique track IDs required');
});

test('Tool and Guster entries retain the requested listening cues', () => {
  const tool = section('musical-journeys');
  const riffs = section('riffs-and-grooves');
  assert.match(tool, /<h3>The Patient<\/h3>/);
  assert.match(tool, /cymbals/);
  assert.match(tool, /extended, airy top end/);
  assert.match(riffs, /<h3>What You Wish For<\/h3>/);
  assert.match(riffs, /Guster/);
  assert.match(riffs, /contrasting vocal tones and harmonies/);
  assert.match(riffs, /a little compressed/);
});

test('The Count of Tuscany notes cite the firsthand backstory, not an unverified cannabis claim', () => {
  const journeys = section('musical-journeys');
  assert.match(journeys, /real trip with friends to a Tuscan winery and castle/);
  assert.match(journeys, /The lyrics make it even better/);
  assert.match(journeys, /my joke, not Petrucci&#39;s explanation/);
  assert.match(journeys, /https:\/\/guitarmessenger.com\/john-petrucci-interview-2\//);
});


test('New listening selections and platform links are published', () => {
  const spatial = section('spatial');
  const riffs = section('riffs-and-grooves');
  const dynamics = section('dynamics');
  assert.match(spatial, /Wilson Phillips/);
  assert.match(spatial, /Everything in Its Right Place/);
  assert.match(riffs, /Garrett Mason/);
  assert.match(riffs, /Cowboys from Hell/);
  assert.match(riffs, /John the Fisherman/);
  assert.match(dynamics, /Sister Christian/);
  assert.match(html, /spotify\.com\/playlist\/2oIjBSeLGbg6gqqaeyGrKI/);
  assert.match(html, /sdz\.sh\/2r8wVo/);
});

test('Blind Melon Soak the Sin highlights an open busy mix and encourages full-album discovery', () => {
  const mixing=section('mixing');
  assert.equal([...mixing.matchAll(/<article class="curator-track"/g)].length, 2);
  assert.match(html, /05 \/ 2 SELECTIONS/);
  assert.match(html, /Mixing &amp; Production Choices <span aria-hidden="true">\(2\)<\/span>/);
  assert.match(mixing, /id="track-mixing-2"/);
  assert.match(mixing, /<p class="curator-artist">Blind Melon<\/p><h3>Soak the Sin<\/h3>/);
  for(const term of ['busy rock song','remarkably open','drum tone','high-end detail',
    'No Rain','one of my first favourite albums','almost every other track on this album outdoes it',
    'Full-album recommendation','listen from beginning to end']){
    assert.ok(mixing.includes(term), 'Missing listening cue: '+term);
  }
  assert.match(mixing, /open\.spotify\.com\/album\/7yz9SLBNG9nOTuP1aP638b/);
  assert.doesNotMatch(mixing, /Soup \(1995\)/, 'The entry should focus on the entire 1992 debut album');
  assert.match(mixing, /album is the recommendation, not a separate counted selection/);
  assert.equal([...html.matchAll(/<article class="curator-track"/g)].length, 52);
});
