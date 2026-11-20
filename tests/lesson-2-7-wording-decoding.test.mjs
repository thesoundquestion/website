import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../decoder/'+name+'/index.html',import.meta.url),'utf8');

test('Lesson 2 clarifies subjective frequency balance and covers Yamaha and Cerwin-Vega speakers',()=>{
  const h=read('speaker-frequency-response');
  assert.match(h,/sounds brighter, warmer or more present/);
  assert.match(h,/<strong>Yamaha speakers/);
  assert.match(h,/<strong>Cerwin-Vega/);
  assert.match(h,/hs-series\/specs\.html/);
  assert.match(h,/cerwinvega\.com\/products\/xls-15/);
});
test('the same approved pump analogy explains overload without claiming inevitable damage',()=>{
  for(const slug of ['speaker-impedance','ohms-law','technical-glossary']){
    const html=read(slug);
    assert.match(html,/tsq-pump-taps-approved\.png/);
    assert.match(html,/wider tap does not give the pump a bigger motor/);
    assert.match(html,/current limiting or thermal protection/i);
    assert.match(html,/overheat or damage amplifier components/);
    assert.match(html,/severe clipping or excessive power can also damage speaker drivers/);
    assert.match(html,/within its limits need not have any of these problems/);
  }
});
test('Lesson 7 decodes the exact 80-watt, 8-ohm rating with a worked power progression',()=>{
  const html=read('amplifier-power');
  const section=html.split('<section class="dl-stat-decode container" id="decode-the-spec"')[1]?.split('</section>')[0];
  assert.ok(section);
  for(const value of ['20 W','40 W','80 W','12.6 V RMS','17.9 V RMS','25.3 V RMS','1.58 A RMS','2.24 A RMS','3.16 A RMS','20 Hz–20 kHz'])
    assert.ok(section.includes(value),value);
  assert.match(section,/calculated examples/i);
  assert.match(section,/not measured distortion or clipping points/i);
  assert.match(section,/distortion limit, test duration, simultaneous channels/i);
});
