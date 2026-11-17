import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const home=read('index.html'),connect=read('connect/index.html'),privacy=read('privacy/index.html'),js=read('assets/share-site.js'),abx=read('assets/abx-lab.js'),worker=read('workers/abx/index.mjs');

test('public email invites educational ideas and permission offers with no contact-form dependency',()=>{
 for(const page of [home,connect]){
  assert.match(page,/thesoundquestion@gmail\.com/);
  assert.match(page,/mailto:thesoundquestion@gmail\.com/);
 }
 assert.match(home,/permission/i);
 assert.match(connect,/materials that you own or are authorized/);
 assert.match(privacy,/Contact email/);
});
test('equipment-loan outreach is discoverable and independent',()=>{
 assert.match(home,/href="\/connect\/#business-inquiries"/);
 assert.match(connect,/id="business-inquiries"/);
 assert.match(connect,/mailto:thesoundquestion@gmail\.com\?subject=The%20Sound%20Question%20-%20Equipment/);
 assert.match(connect,/temporary loan/);
 assert.match(connect,/An offer does not guarantee coverage/);
 assert.match(connect,/Loans, gifts and paid relationships will be disclosed/);
});
test('optional Ko-fi support links do not gate lessons or embed payment scripts',()=>{
 for(const page of [home,connect]){
  assert.match(page,/href="https:\/\/ko-fi\.com\/thesoundquestion"/);
  assert.match(page,/rel="noopener noreferrer"/);
 }
 assert.match(connect,/id="support-project"/);
 assert.match(connect,/Nothing is locked behind a contribution/);
 assert.match(privacy,/Ko-fi handles any optional financial support outside this website/);
 for(const page of [home,connect]){
  assert.doesNotMatch(page,/<iframe[^>]*ko-fi/i);
  assert.doesNotMatch(page,/<script[^>]*ko-fi/i);
 }
});
test('homepage has real sharing actions and no third-party social media scripts',()=>{
 assert.match(home,/id="nativeShare"/);
 assert.match(home,/id="copySiteLink"/);
 assert.match(home,/\/assets\/share-site\.js/);
 assert.match(home,/facebook\.com\/sharer/);
 assert.match(home,/reddit\.com\/submit/);
 assert.match(home,/whatsapp\.com\/send/);
 assert.match(home,/mailto:\?subject=/);
 assert.match(js,/navigator\.share/);
 assert.match(js,/navigator\.clipboard\.writeText/);
 assert.doesNotMatch(js,/fetch\(/);
});
test('dedicated ABX lessons are linked both ways, preserving contextual source detail',()=>{
 const page=read('labs/abx/index.html');
 assert.match(page,/data-abx-lab="all"/);
 assert.match(read('sitemap.xml'),/\/labs\/abx\//);
 for(const original of ['lab/index.html','lab/mastering/index.html','labs/formats/index.html']){
  assert.match(read(original),/href="\/labs\/abx\//);
  assert.doesNotMatch(read(original),/data-abx-lab=/);
 }
 assert.match(abx,/lessonUrl:'/);
 assert.match(abx,/lesson\.href=spec\.lessonUrl/);
 assert.match(abx,/Missed the original experiment\?/);
 assert.match(abx,/\/lab\/mastering\/\?experiment=eq/);
 assert.match(abx,/\/lab\/mastering\/\?experiment=matched/);
 assert.match(abx,/\/labs\/formats\/\?song=diva/);
 assert.match(abx,/\/labs\/formats\/\?song=light/);
 assert.match(abx,/history\.replaceState/);
 assert.match(read('lab/mastering/index.html'),/requestedExperiment/);
 assert.match(read('labs/formats/index.html'),/selectedSong=new URLSearchParams/);
});
test('scoring remains off until coordinated release and uses explicit consent and server scoring',()=>{
 assert.match(read('workers/abx/wrangler.toml'),/ABX_PUBLIC_ENABLED = "false"/);
 assert.match(worker,/ABX_PUBLIC_ENABLED==='true'/);
 assert.match(worker,/const VALIDATED=new Map/);
 assert.doesNotMatch(worker,/master-loud-v1/);
 assert.match(abx,/type:'checkbox'/);
 assert.match(abx,/share:consent\.checked/);
 assert.match(privacy,/optional and off by default/);
 assert.match(privacy,/180 days/);
 assert.match(read('workers/abx/RELEASE.md'),/Worker not deployed/);
});

test('curated scored comparisons describe their practical limitations consistently',()=>{
 assert.match(abx,/informal listening game/);
 for(const phrase of ['Training only until','not yet validated for scored','local training only'])
  assert.ok(!abx.includes(phrase));
});

test('rights policy offers direct contact and long lessons begin with plain-language context',()=>{
 const rights=read('content-use/index.html');
 assert.match(rights,/mailto:thesoundquestion@gmail\.com\?subject=Content/);
 assert.match(rights,/Last reviewed: November 17, 2026/);
 for(const page of ['decoder/speaker-frequency-response/index.html','decoder/mixing-soundstage/index.html','decoder/mastering-dynamic-range/index.html']){
  assert.match(read(page),/tsq-lesson-shortcut/);
  assert.match(read(page),/Start with the simple idea:/);
 }
 assert.match(read('library/curators-listening-room/index.html'),/51 selections cover 53 tracks/);
});

test('Mastering metrics and MP3 technical notes explain core units without assuming audio jargon',()=>{
 const master=read('lab/mastering/index.html');
 const formats=read('labs/formats/index.html');
 assert.match(master,/LUFS<\/strong> estimates how loud/);
 assert.match(master,/dBTP<\/strong> is a peak-level estimate/);
 assert.match(master,/numbers explain what changed, not which master is better/);
 assert.match(formats,/kbps \(kilobits per second\)/);
 assert.match(formats,/RMS \(an average signal-level measure\)/);
});
