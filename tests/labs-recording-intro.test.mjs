import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
test('the general Labs hub credits the supplied research material without claiming partnership',()=>{
 const s=read('labs/index.html');
 for(const item of ['AlbumDB','Thomas McKenzie','Eloi Moliner','Alec Wright','Extraordinary','Creative Commons Attribution 4.0','noindex,nofollow','independently produced','original recordings and collaborations','Some timing edits'])assert.ok(s.includes(item),item);
 assert.match(s,/does not imply endorsement/);
 assert.match(s,/Creative and editorial approval stays with The Sound Question/);
 assert.doesNotMatch(s,/not been listened to|not listened to|generated slop/i);
});
test('the labs hub links to existing resources and never promises a hosted mastering player',()=>{
 const s=read('labs/index.html');
 for(const href of ['/lab/','/lab/mastering/','/library/behind-the-experiments/','/content-use/']){
  assert.ok(s.includes('href="'+href+'"'),href);
  assert.ok(existsSync(path.join(root,href.slice(1),'index.html')),href);
 }
 assert.ok(read('index.html').includes('class="discovery-card" href="/labs/"'));
 assert.match(s, /class="lab-choice-grid"/);
 assert.match(s, /EXPERIMENT 01 \/ MIXING/);
 assert.match(s, /EXPERIMENT 02 \/ MASTERING/);
 assert.ok(read('lab/index.html').includes('href="/labs/#recordings"'));
 assert.doesNotMatch(s,/<audio|<source[^>]+\.wav|https?:\/\/[^"\s]+\.wav/);
});
