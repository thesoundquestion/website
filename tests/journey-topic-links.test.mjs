import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const journey = read('../journey/index.html');
const topics = JSON.parse(read('../journey/topic-links.json')).steps;
const curriculum = JSON.parse(read('../decoder/curriculum.json'));
const escapeHtml = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

test('Every Journey stage has the expected linked Topics to explore', () => {
  const sections = [...journey.matchAll(/<article class="path-lesson" id="([^"]+)">([\s\S]*?)<\/article>/g)];
  assert.equal(sections.length, 9);
  const stages = sections.map(([,id]) => id);
  assert.deepEqual(new Set(stages), new Set(Object.keys(topics)));
  for (const [,stage,article] of sections) {
    const match = article.match(/<div class="path-subtopics">([\s\S]*?)<\/div>/);
    assert.ok(match, stage + ' needs a Topics to explore section');
    const section = match[1];
    assert.match(section, /<strong>Topics to explore:<\/strong>/);
    for (const entry of topics[stage]) {
      const label = escapeHtml(entry.label);
      const expected = entry.lesson
        ? '<a href="/decoder/' + entry.lesson + '/' + (entry.fragment ?? '') + '">' + label + '</a>'
        : label;
      assert.ok(section.includes(expected), stage + ': missing ' + expected);
    }
  }
});

test('Every published Decoder lesson is linked, and Journey never points to an unissued lesson', () => {
  const published = new Set(curriculum.lessons.map(lesson => lesson.slug));
  const used = new Set();
  for (const entries of Object.values(topics)) {
    const labels = new Set();
    for (const entry of entries) {
      assert.ok(entry.label.trim());
      assert.ok(!labels.has(entry.label.toLowerCase()));
      labels.add(entry.label.toLowerCase());
      if (!entry.lesson) continue;
      assert.ok(published.has(entry.lesson), 'Unpublished target: ' + entry.lesson);
      assert.ok(existsSync(new URL('../decoder/' + entry.lesson + '/index.html', import.meta.url)));
      used.add(entry.lesson);
    }
  }
  assert.deepEqual([...published].filter(slug => !used.has(slug)), [], 'Every lesson needs a Journey topic link');
});
