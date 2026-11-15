import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');
const page=read('decoder/sound-basics/index.html'),style=read('assets/sound-basics.css'),script=read('assets/sound-basics.js');
const curriculum=JSON.parse(read('decoder/curriculum.json'));
const bank=JSON.parse(read('assets/lesson-tutor/approved-answers.json'));
test('intro lesson is the first published lesson with matching tutor entry',()=>{
 assert.equal(curriculum.lessons.length,24);
 assert.equal(curriculum.lessons[0].slug,'sound-basics');
 assert.equal(Object.keys(bank)[0],'sound-basics');
 assert.equal(bank['sound-basics'].specification,'60 Hz–15 kHz (±3 dB)');
 assert.match(page,/Lesson 01 of 24/);
 assert.match(page,/href="\/decoder\/speaker-frequency-response\/"/);
});
test('explains levels, natural harmonics and distortion without claiming fictional measurements are real',()=>{
 for(const word of ['hertz (Hz)','0 dB','±3 dB','mask','EQ','harmonics','clipping','20,000 Hz','ultrasound']) assert.ok(page.toLowerCase().includes(word.toLowerCase()),word);
 assert.match(page,/fictional but plausible/);
 assert.match(page,/not an actual product/);
 assert.match(page,/not “twice as loud/);
 assert.match(page,/Natural instrument harmonics/);
});
test('curve control is static-first and responsive',()=>{
 assert.match(page,/role="img" aria-labelledby="sb-chart-title sb-chart-desc"/);
 assert.match(page,/data-eq-trace hidden/);
 assert.match(page,/data-sb-mode="speaker" aria-pressed="true"/);
 assert.match(page,/data-sb-mode="eq" aria-pressed="false"/);
 assert.match(script,/overlay.hidden=!eq/);
 assert.match(style,/@media\(max-width:680px\)/);
});
