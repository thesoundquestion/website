// Release-safe editorial consistency checks. These assert key beginner-first
// explanations without changing any calculation, chart, audio or publishing code.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Library entry matches actual Listening Room selection and track count',()=>{
 const index=read('library/index.html'),room=read('library/curators-listening-room/index.html');
 assert.match(index,/51 listening selections covering 53 tracks/);
 assert.match(room,/51 selections cover 53 tracks/);
 assert.doesNotMatch(index,/38 personally selected/);
});

test('Mixing first use correctly says Play is required, not automatic streaming',()=>{
 const page=read('lab/index.html');
 const player=read('assets/mixing-lab.js');
 assert.match(page,/Choose a mix and press Play/);
 assert.doesNotMatch(page,/stream automatically/);
 assert.match(player,/if\(!userStarted\)\{/);
 assert.match(player,/audio\.removeAttribute\('src'\)/);
});

test('source levels and power handling retain essential qualification',()=>{
 const sources=read('decoder/source-levels/index.html');
 const power=read('decoder/amplifier-power/index.html');
 const check=read('system-check/index.html');
 assert.match(sources,/maximum clean input/);
 assert.match(sources,/does <em>not<\/em> mean the amplifier is being overloaded/);
 assert.match(power,/Headroom/);
 assert.match(power,/distortion as it approaches its limit/);
 assert.match(check,/Continuous/);
 assert.match(check,/peak/);
 assert.match(check,/leave a field blank/);
});

test('first-use physical terms are explained with anchored technical detail',()=>{
 const impedance=read('decoder/speaker-impedance/index.html');
 const drivers=read('decoder/speaker-drivers/index.html');
 const classes=read('decoder/amplifier-classes/index.html');
 const headphones=read('decoder/headphone-types/index.html');
 const digital=read('decoder/sample-rate/index.html');
 assert.match(impedance,/how demanding the speaker is to drive/);
 assert.match(drivers,/A <strong>crossover<\/strong> is the filter/);
 assert.match(classes,/MOSFET are two families of transistor/);
 assert.match(headphones,/Every headphone needs something to move air/);
 assert.match(digital,/Nyquist frequency/);
 assert.match(digital,/proper filtering/);
});

test('technical qualifications and rights statements are not mistaken for marketing claims',()=>{
 const reference=read('library/make-audio-make-sense/index.html');
 const labs=read('library/behind-the-experiments/index.html');
 const rights=read('content-use/index.html');
 const privacy=read('privacy/index.html');
 assert.match(reference,/not automatically a better performance or master/);
 assert.match(labs,/not a controlled test of just one setting/);
 assert.match(rights,/Other creators/);
 assert.match(privacy,/Hosting and external services/);
});

test('all published sitemap lesson and lab routes still have files',()=>{
 const sitemap=read('sitemap.xml');
 const paths=[...sitemap.matchAll(/<loc>https:\/\/thesoundquestion\.pages\.dev\/([^<]*)<\/loc>/g)]
   .map(([,route])=>route?route+'index.html':'index.html');
 assert.equal(paths.length,47);
 for(const path of paths) assert.match(read(path),/<(?:main|article|section)\b/);
});
