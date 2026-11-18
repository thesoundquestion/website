import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
test('existing educational content has intentional related-reading paths',()=>{
 const cases=[
  ['decoder/mixing-soundstage/index.html',['/lab/','/library/behind-the-experiments/']],
  ['decoder/mastering-dynamic-range/index.html',['/lab/mastering/','/library/behind-the-experiments/']],
  ['decoder/audiophile-glossary/index.html',['/decoder/mixing-soundstage/','/lab/']],
  ['library/behind-the-experiments/index.html',['/lab/','/lab/mastering/']],
  ['tools/index.html',['/system-check/','/system-builder/','/system-check/compare/']]
 ];
 for(const [source,links] of cases){
  const s=read(source);
  for(const target of links){
   assert.ok(s.includes('href="'+target+'"'),source+' should link to '+target);
   assert.ok(existsSync(path.join(root,target.slice(1),'index.html')),target+' target missing');
  }
 }
});
test('home and Labs keep primary navigation concise, with detail available on demand',()=>{
 const home=read('index.html'),lab=read('labs/index.html');
 assert.match(home,/class="home-quick-links"/);
 assert.equal((home.match(/class="home-goal-card"/g)||[]).length,6);
 assert.match(home,/<a href="\/about\/">\s*<strong>About<\/strong>/);
 assert.match(lab,/class="lab-source-details"/);
 assert.match(lab,/<summary>Explore the four recording stages<\/summary>/);
});
