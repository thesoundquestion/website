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
const miles=card('track-dynamics-4');
const way=card('track-dynamics-5');

test('approved Proclaimers listening comparisons survive every pre-release build',()=>{
 assert.match(miles,/I&#39;m Gonna Be \(500 Miles\)/);
 assert.match(way,/I&#39;m on My Way/);
 assert.match(miles,/to my ears/i);
 assert.match(way,/To my ears/i);
 assert.match(miles,/vocals and guitars sound more prominent/);
 assert.match(miles,/drums also seem more tightly controlled, possibly more compressed/);
 assert.match(miles,/cymbals and other high-frequency detail still come through/);
 assert.match(miles,/punchy and surprisingly open/);
 assert.match(way,/from the same album/);
 assert.match(way,/this mix feels a little more open/);
 for(const term of ['microphone placement','recording room','instrument balance','EQ','compression','mixing decisions']){
  assert.ok(way.includes(term),'Missing alternative explanation: '+term);
 }
 assert.match(way,/doesn&#39;t prove/);
 assert.doesNotMatch(miles,/it&#39;s a fairly compressed, energetic recording/);
 assert.doesNotMatch(way,/recording that sounds relatively compressed/);
});

test('Listening Room catalog, links and editorial tone remain intact',()=>{
 assert.equal([...html.matchAll(/<article class="curator-track"/g)].length,52);
 assert.match(html,/52 selections cover 54 tracks/);
 assert.match(html,/52 listening selections/);
 assert.match(html,/open.spotify.com\/playlist\/2oIjBSeLGbg6gqqaeyGrKI/);
 assert.match(html,/sdz.sh\/2r8wVo/);
 assert.match(html,/id="community-listening-room"/);
 assert.match(miles,/Find on Spotify/);
 assert.match(way,/Find on Spotify/);
});
