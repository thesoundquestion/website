import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../system-check/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../system-check/style.css',import.meta.url),'utf8');

test('System Check has just one everyday listening-level dropdown',()=>{
  assert.equal((html.match(/class="sc-level-guide"/g)||[]).length,1);
  assert.match(html,/What do listening levels feel like\? \(60–70, 80, 85 dB SPL and brief 110 dB peaks\)/);
  assert.doesNotMatch(html,/What does that level sound like\?/);
  assert.doesNotMatch(html,/<strong>60–70 dBA average/);
  assert.doesNotMatch(html,/<strong>Around 80 dBA average/);
  assert.doesNotMatch(html,/<strong>Around 85 dBA average/);
});

test('calculator defaults and clear average/peak explanation are preserved',()=>{
  assert.match(html,/name="average"[^>]*value="80"/);
  assert.match(html,/name="gap"[^>]*value="15"/);
  assert.match(html,/Start with <strong>80 dB SPL as the average sound level at your seat<\/strong>/);
  assert.match(html,/We initially allow another <strong>15 dB<\/strong>/);
  assert.match(html,/Heavily compressed music may have a smaller gap/);
});

test('SPL examples explain the same quantity the user enters without giving false dBA equivalence',()=>{
  assert.match(html,/normal conversation near 3 ft/);
  assert.match(html,/busy road from about 16 ft/);
  assert.match(html,/unweighted\/flat or Z-weighted SPL average \(Leq\)/);
  assert.match(html,/85 <strong>dBA<\/strong>/);
  assert.match(html,/A phone SPL app without a calibrated microphone is only an estimate/);
  assert.match(html,/You do not need to produce a 110 dB peak/);
});

test('CDC and Genelec material are distinct, concise external quicklinks',()=>{
  assert.equal((html.match(/CDC Recommended Levels/g)||[]).length,1);
  assert.equal((html.match(/Genelec Test Levels/g)||[]).length,1);
  assert.match(html,/https:\/\/www\.cdc\.gov\/niosh\/noise\/prevent\/understand\.html/);
  assert.match(html,/https:\/\/support\.genelec\.com\/hc\/en-us\/articles\/21060845571090/);
  assert.match(css,/\.sc-level-quicklinks/);
});
