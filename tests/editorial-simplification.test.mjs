// Release-safe editorial consistency checks. These assert key beginner-first
// explanations without changing any calculation, chart, audio or publishing code.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('Library entry matches actual Listening Room selection and track count',()=>{
 const index=read('library/index.html'),room=read('library/curators-listening-room/index.html');
 assert.match(index,/52 listening selections covering 54 tracks/);
 assert.match(room,/52 selections cover 54 tracks/);
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

test('Mixing, Mastering and ABX explain playback before any player controls',()=>{
 const mixing=read('lab/index.html');
 const mastering=read('lab/mastering/index.html');
 const abx=read('labs/abx/index.html');
 assert.ok(mixing.indexOf('Before you listen:')<mixing.indexOf('class="lab-console"'));
 assert.ok(mastering.indexOf('Before you listen:')<mastering.indexOf('class="tabs"'));
 assert.ok(abx.indexOf('Before you listen:')<abx.indexOf('data-abx-lab="all"'));
 assert.match(mixing,/Replace examples \(optional\)/);
 assert.match(mixing,/local playback may still pause when switching/);
 assert.match(mixing,/rough mix and a finished mix/);
 assert.match(mixing,/Replace this recording/);
 assert.match(mastering,/Choose WAVs for this test/);
 assert.match(mastering,/original album release with a later remaster/);
 assert.match(mastering,/Have an original release and a later remaster of the same song/);
 assert.match(mastering,/data-master-slot="0"/);
 assert.match(mastering,/data-master-slot="1"/);
 assert.match(mastering,/data-master-slot="2"/);
 assert.match(mastering,/not automatically volume-matched/);
 assert.match(mastering,/The waveforms and measurements below still show our original examples/);
 assert.match(mastering,/replace both A and B/);
 assert.match(mastering,/Any slot you don't replace still plays our example/);
 assert.match(mastering,/function updateOwnFileSlots\(\)/);
 assert.match(mastering,/assign\(key,file\);renderCards\(\);setNotes\(\)/);
 assert.match(abx,/Prepare recordings/);
 assert.match(abx,/Start scored session/);
 assert.match(abx,/optional consent box/);
 assert.match(abx,/supported devices/);
 assert.match(abx,/personal music files aren't supported here yet/);
});
test('approved navigation and diagrams make the next action obvious',()=>{
 const sources=read('decoder/playback-sources/index.html');
 const formats=read('decoder/lossy-lossless/index.html');
 const bits=read('assets/bit-depth.mjs');
 const contact=read('connect/index.html');
 const home=read('index.html');
 const css=read('assets/styles.css');
 assert.match(sources,/Three things worth checking/);
 assert.doesNotMatch(sources,/ps-source-type/);
 assert.match(formats,/href="\/labs\/abx\/\?test=formats-light-128-v1&amp;mode=training"/);
 assert.match(bits,/Magnified: nearby level lines/);
 assert.match(contact,/class="contact-panels"/);
 assert.match(contact,/id="support-project"/);
 assert.match(contact,/>Donate ↗<\/a>/);
 assert.doesNotMatch(contact,/>Support the project on Ko-fi/);
 assert.match(css,/\.contact-panels\{display:grid/);
 const hero=home.indexOf('class="container home-goal-intro"'),goals=home.indexOf('class="home-goal-grid"');
 const cards=home.indexOf('class="section section-border home-fast-paths"'),support=home.indexOf('class="section section-border home-more"');
 assert.ok(hero>=0&&hero<cards&&cards<goals&&goals<support,'Branded hero, Jump Straight In, Choose Your Path, then smaller reference cards');
 assert.doesNotMatch(home,/class="container home-support-invite"/,'No donation interruption above goal choices');
 assert.ok(home.length<12000,'Homepage remains intentionally concise');
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
 const paths=[...sitemap.matchAll(/<loc>https:\/\/thesoundquestion\.com\/([^<]*)<\/loc>/g)]
   .map(([,route])=>route?route+'index.html':'index.html');
 assert.ok(paths.length>=48,'expected at least the current 48 published routes');
 assert.equal(new Set(paths).size,paths.length,'duplicate routes in sitemap');
 for(const path of paths) assert.match(read(path),/<(?:main|article|section)\b/);
});
