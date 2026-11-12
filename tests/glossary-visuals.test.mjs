// Glossary spatial-visual regression test. Run: node --test tests/glossary-visuals.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('decoder/audiophile-glossary/index.html');
const js=read('assets/audiophile-glossary.js');
const keys=['width','imaging','separation','depth','distance'];
const assetNames=['narrow','wide','diffuse','precise','crowded','clear','flat','layered','forward','laid-back'];

test('five comparisons, all ten local illustrations, and no duplicate HTML IDs',()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size);
 const panels=[...html.matchAll(/data-ag-visual-panel="([^"]+)"/g)].map(m=>m[1]);
 const tabs=[...html.matchAll(/data-ag-visual-tab="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(panels,keys);
 assert.deepEqual(tabs,keys);
 for(const name of assetNames){
   const asset='assets/glossary-visuals/'+name+'.svg';
   assert.ok(html.includes('/'+asset),asset);
   const s=read(asset);
   assert.ok(s.startsWith('<svg'),asset);
   assert.ok(s.endsWith('</svg>'),asset);
   assert.match(s,/viewBox="0 0 640 356"/);
   assert.match(s,/<title id="title">/);
   assert.match(s,/<desc id="desc">/);
   assert.match(s,/<use href="#/);
 }
 for(const key of ['soundstage','imaging','separation','congestion','holographic','forward','laid-back']){
   const start=html.indexOf('<article class="ag-term" id="'+key+'"');
   const end=html.indexOf('</article>',start);
   const card=start>=0&&end>start?html.slice(start,end):null;
   assert.ok(card?.includes('data-ag-open-visual='),key);
 }
});

class E {
 constructor(name){this.name=name;this.hidden=false;this.dataset={};this.attrs={};this.value='';this.events={};}
 setAttribute(k,v){this.attrs[k]=String(v)}
 addEventListener(k,fn){this.events[k]=fn}
}
function mount(){
 const panels=keys.map(key=>{const e=new E('panel');e.dataset.agVisualPanel=key;return e;});
 const buttons=keys.map(key=>{const e=new E('button');e.dataset.agVisualTab=key;return e;});
 const links=keys.map(key=>{const e=new E('link');e.dataset.agOpenVisual=key;return e;});
 const controls=new E('controls'),search=new E('search'),gallery=new E('gallery');
 controls.hidden=true;
 const document={
  getElementById:()=>null,
  querySelectorAll:q=>q==='[data-ag-visual-panel]'?panels:q==='[data-ag-visual-tab]'?buttons:q==='[data-ag-open-visual]'?links:[],
  querySelector:q=>q==='[data-ag-visual-tabs]'?controls:q==='#ag-query'?search:q==='#visual-examples'?gallery:null
 };
 const window={location:{hash:''},events:{},addEventListener(k,fn){this.events[k]=fn;}};
 vm.runInNewContext(js,{document,window});
 return {panels,buttons,links,controls,search,gallery,window};
}
test('tabs, glossary links, hash navigation and search reveal the right comparison',()=>{
 const x=mount(),shown=()=>x.panels.filter(e=>!e.hidden).map(e=>e.dataset.agVisualPanel);
 assert.equal(x.controls.hidden,false);
 assert.deepEqual(shown(),['width']);
 x.buttons[3].events.click();assert.deepEqual(shown(),['depth']);
 x.links[4].events.click();assert.deepEqual(shown(),['distance']);
 x.window.location.hash='#visual-imaging';x.window.events.hashchange();assert.deepEqual(shown(),['imaging']);
 x.search.value='separation';x.search.events.input();assert.deepEqual(shown(),['separation']);
 x.search.value='warm';x.search.events.input();assert.equal(x.gallery.hidden,true);
 x.search.value='';x.search.events.input();assert.equal(x.gallery.hidden,false);
});
test('without the optional gallery script all comparison content remains in HTML',()=>{
 assert.ok(html.includes('data-ag-visual-tabs hidden'));
 assert.equal((html.match(/data-ag-visual-panel=/g)||[]).length,5);
 assert.equal((html.match(/assets\/glossary-visuals\//g)||[]).length,10);
});
