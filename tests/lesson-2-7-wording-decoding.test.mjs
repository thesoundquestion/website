import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../decoder/'+name+'/index.html',import.meta.url),'utf8');

test('Lesson 2 clarifies subjective frequency balance and covers Yamaha and Cerwin-Vega speakers',()=>{
  const h=read('speaker-frequency-response');
  assert.match(h,/Here Comes the Sun, <span class="gradient-text">or is it the speakers\?<\/span>/);
  assert.match(h,/the sunshine hasn't changed/);
  assert.match(h,/Some speakers push vocals forward, others add bass weight/);
  assert.match(h,/<strong>Yamaha speakers/);
  assert.match(h,/<strong>Cerwin-Vega/);
  assert.match(h,/hs-series\/specs\.html/);
  assert.match(h,/cerwinvega\.com\/products\/xls-15/);
});
test('the same approved pump analogy explains overload without claiming inevitable damage',()=>{
  for(const slug of ['speaker-impedance','ohms-law','technical-glossary']){
    const html=read(slug);
    assert.match(html,/tsq-pump-taps-approved\.png/);
    assert.match(html,/water pressure is the voltage/);
    assert.match(html,/a wider bathtub tap needs more water/);
    assert.match(html,/shut off to protect itself/);
    assert.match(html,/overheat, wear out sooner or fail/);
    assert.match(html,/A 4-ohm speaker isn't automatically dangerous/);
  }
});
test('Lesson 7 directly explains every piece of its example before offering optional math',()=>{
  const html=read('amplifier-power');
  const section=html.split('<section class="dl-stat-decode container" id="decode-the-spec"')[1]?.split('</section>')[0];
  assert.ok(section);
  for(const label of ['80 W/ch','8 Ω','20 Hz','20 kHz','How much electrical power?','Tested with what load?','Across which sound frequencies?','Still missing from the spec:'])
    assert.ok(section.includes(label),'Missing plain-English decoding: '+label);
  assert.match(section,/Missing test details don't mean the amplifier is bad/);
  assert.match(section,/Check your own speaker and amplifier combination/);
  assert.match(section,/<details class="dl-advanced dl-power-math">/);
  assert.match(section,/calculated examples, not amplifier measurements/i);
  for(const label of ['20 W','40 W','80 W','12.6 V','17.9 V','25.3 V'])
    assert.ok(section.includes(label),'Missing optional worked example: '+label);
});
