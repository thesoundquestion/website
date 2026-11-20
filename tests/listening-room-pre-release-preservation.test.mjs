import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../library/curators-listening-room/index.html',import.meta.url),'utf8');
const card=id=>{
 const index=html.indexOf('<article class="curator-track" id="'+id+'"');
 assert.ok(index>=0,'Missing Listening Room card '+id);
 const end=html.indexOf('</article>',index);
 assert.ok(end>index,'Unclosed card '+id);
 return html.slice(index,end);
};
const proclaimers=card('track-dynamics-4');
const blindMelon=card('track-mixing-2');

test('both Proclaimers recordings remain one back-to-back comparison without losing either listening cue',()=>{
 assert.match(proclaimers,/I&#39;m Gonna Be \(500 Miles\) \/ I&#39;m on My Way/);
 assert.match(proclaimers,/Sunshine on Leith \(1988\)/);
 assert.match(proclaimers,/vocals and guitars sound more prominent to my ears/);
 assert.match(proclaimers,/drums seem more tightly controlled, possibly more compressed/);
 assert.match(proclaimers,/cymbals and other high-frequency detail still come through/);
 assert.match(proclaimers,/punchy and surprisingly open/);
 assert.match(proclaimers,/this mix feels a little more open/);
 assert.match(proclaimers,/same album/);
 for(const term of ['microphone placement','recording room','instrument balance','EQ','compression','mixing decisions']){
  assert.ok(proclaimers.toLowerCase().includes(term.toLowerCase()),'Missing alternative explanation: '+term);
 }
 assert.match(proclaimers,/doesn&#39;t necessarily mean one recording was compressed more/);
 assert.match(proclaimers,/roughly the same volume/);
 assert.match(proclaimers,/Find I&#39;m on My Way on Spotify/);
 assert.doesNotMatch(html,/id="track-dynamics-5"/);
});

test('Blind Melon opens with two songs but recommends the full album as one listening selection',()=>{
 assert.match(blindMelon,/<h3>Soak the Sin \/ Tones of Home<\/h3>/);
 assert.match(blindMelon,/Opening two tracks/);
 assert.match(blindMelon,/one of my first favourite albums/);
 assert.match(blindMelon,/drum tone is fantastic/);
 assert.match(blindMelon,/cymbals and other high-end detail/);
 assert.match(blindMelon,/almost every other track on this album outdoes it/);
 assert.match(blindMelon,/Full-album recommendation/);
 assert.match(blindMelon,/entire/);
 assert.match(blindMelon,/front-to-back listen/);
 assert.match(blindMelon,/href="https:\/\/open\.spotify\.com\/search\/Blind%20Melon%20Soak%20the%20Sin"/);
 assert.match(blindMelon,/href="https:\/\/open\.spotify\.com\/album\/7yz9SLBNG9nOTuP1aP638b"/);
 assert.match(blindMelon,/Listen to the full album on Spotify/);
});

test('Listening Room counts, playback discovery and editorial tone remain intact',()=>{
 assert.equal([...html.matchAll(/<article class="curator-track"/g)].length,51);
 assert.match(html,/51 selections cover 55 tracks/);
 assert.match(html,/51 listening selections/);
 assert.match(html,/04 \/ 7 SELECTIONS/);
 assert.match(html,/05 \/ 2 SELECTIONS/);
 assert.match(html,/open.spotify.com\/playlist\/2oIjBSeLGbg6gqqaeyGrKI/);
 assert.match(html,/sdz.sh\/2r8wVo/);
 assert.match(html,/id="community-listening-room"/);
 assert.match(proclaimers,/Find on Spotify/);
 assert.match(blindMelon,/Find song on Spotify/);
 assert.match(blindMelon,/Listen to the full album on Spotify/);
});
