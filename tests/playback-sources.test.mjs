// Playback Sources lesson: structural, navigation and interactive regression tests.
// Run from repository root: node --test tests/playback-sources.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = name => readFileSync(new URL('../'+name, import.meta.url),'utf8');
const curriculum = JSON.parse(read('decoder/curriculum.json'));
const bank = JSON.parse(read('assets/lesson-tutor/approved-answers.json'));
const html = read('decoder/playback-sources/index.html');
const script = read('assets/playback-sources.js');
const lessons = curriculum.lessons;
const newEntry = lessons.find(x => x.slug === 'playback-sources');

test('23 lessons, matching tutor answers and complete numbered navigation', () => {
  assert.equal(lessons.length,23);
  assert.equal(lessons.findIndex(x => x.slug==='playback-sources'),12);
  assert.deepEqual(Object.keys(bank),lessons.map(x=>x.slug));
  for(let i=0;i<lessons.length;i++){
    const lesson=lessons[i],page=read('decoder/'+lesson.slug+'/index.html');
    const next=lessons[(i+1)%lessons.length],prior=lessons[i-1];
    assert.ok(page.includes('Lesson '+String(i+1).padStart(2,'0')+' of '+lessons.length),lesson.slug+' progress');
    const top=page.match(/<!-- LESSON_TOP_NAV_BEGIN -->([\s\S]*?)<!-- LESSON_TOP_NAV_END -->/)?.[1];
    assert.ok(top?.includes('/decoder/'+next.slug+'/'),lesson.slug+' next');
    const bottom=page.match(/<!-- LESSON_NAV_BEGIN -->([\s\S]*?)<!-- LESSON_NAV_END -->/)?.[1];
    assert.ok(bottom,lesson.slug+' navigation');
    if(prior)assert.ok(bottom.includes('/decoder/'+prior.slug+'/'),lesson.slug+' previous');
  }
});

test('intro, interactive controls, chapter anchors and useful source links exist', () => {
  assert.equal(newEntry.category,'sources');
  assert.match(html, /class="[^"]*dl-lesson-top/);
  assert.ok(html.includes('src="/assets/decoder-lessons.js"'));
  for(const id of ['signal-path','source-types','where-changes-happen','riaa','connection-check','takeaways','sources']){
    assert.ok(html.includes('id="'+id+'"'),id);
    assert.ok(bank['playback-sources'].sections.includes(id),id+' tutor context');
  }
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(ids.length,new Set(ids).size,'duplicate HTML IDs');
  for(const name of ['vinyl','cd','soundcard','usb','streamer','tape'])assert.ok(html.includes('data-ps-path="'+name+'"'));
  assert.ok(html.includes('https://sbe.org/handbook/fundamentals/Audio/Audio-Compact_Disk.pdf'));
  assert.ok(html.includes('https://learn.microsoft.com/en-us/windows/win32/coreaudio/'));
});

class E {
  constructor(tag, text=''){this.tag=tag;this.textContent=text;this.children=[];this.dataset={};this.attrs={};this.hidden=false;this.value='';this.checked=true;this.events={};}
  append(...elements){for(const el of elements){if(el?.tag==='fragment')this.children.push(...el.children);else this.children.push(el);}}
  replaceChildren(...elements){this.children=[];this.append(...elements);}
  addEventListener(name,handler){this.events[name]=handler;}
  setAttribute(k,v){this.attrs[k]=String(v);}
  querySelector(k){return k==='text'?this.children.find(x=>x.tag==='text'):null;}
  remove(){this.removed=true;}
}
function mount(){
  const selectors={};
  for(const name of ['[data-ps-chain]','[data-ps-caption]','[data-ps-title]','[data-ps-description]','[data-ps-controls]','#ps-source-type','#ps-amplifier-input','#ps-match-result','#ps-riaa-svg','#ps-flat-toggle','#ps-riaa-toggle']){
    selectors[name]=new E('div');
  }
  selectors['#ps-source-type'].value='mm';
  selectors['#ps-amplifier-input'].value='line';
  const buttons=['vinyl','cd','soundcard','usb','streamer','tape'].map(name=>{const b=new E('button');b.dataset.psPath=name;return b;});
  const fallback=new E('text','Enable JavaScript to render the calculated RIAA curve.');
  selectors['#ps-riaa-svg'].append(fallback);
  const document={
    querySelector:key=>selectors[key]??null,
    querySelectorAll:key=>key==='[data-ps-path]'?buttons:[],
    createElement:key=>new E(key),
    createElementNS:(_ns,key)=>new E(key),
    createDocumentFragment:()=>new E('fragment')
  };
  vm.runInNewContext(script,{document,Math});
  return {selectors,buttons,fallback};
}
test('selecting CD, streamer or sound card redraws each signal stage',()=>{
  const {selectors,buttons}=mount();
  const chain=selectors['[data-ps-chain]'];
  assert.equal(chain.children.length,5);
  assert.equal(chain.children[0].children[1].textContent,'Vinyl groove');
  for(const [label,first] of [['cd','Audio CD'],['soundcard','Music file'],['streamer','Music server / service']]){
    const button=buttons.find(b=>b.dataset.psPath===label);
    button.events.click();
    assert.equal(chain.children[0].children[1].textContent,first);
    assert.equal(button.attrs['aria-pressed'],'true');
  }
});
test('connection checker catches missing DAC, missing phono stage and double phono EQ',()=>{
  const {selectors}=mount();
  const a=selectors['#ps-source-type'],b=selectors['#ps-amplifier-input'],result=selectors['#ps-match-result'];
  assert.equal(result.dataset.state,'missing');
  a.value='cd-line';a.events.change();assert.equal(result.dataset.state,'ready');
  a.value='cd-digital';a.events.change();assert.equal(result.dataset.state,'missing');
  assert.match(result.children[0].textContent,/converter is missing/);
  a.value='tt-line';b.value='mm';b.events.change();assert.equal(result.dataset.state,'warning');
  assert.match(result.children[0].textContent,/Do not feed a line output into a phono input/);
  a.value='mm';b.value='mm';b.events.change();assert.equal(result.dataset.state,'ready');
});
test('RIAA plot calculates a curve and independently toggles the flat overlay',()=>{
  const {selectors,fallback}=mount();
  const svg=selectors['#ps-riaa-svg'];
  const path=svg.children.find(x=>x.attrs.id==='ps-riaa-curve');
  const flat=svg.children.find(x=>x.attrs.id==='ps-flat-line');
  assert.ok(path?.attrs.d);
  assert.equal(path.attrs.d.split('L').length,241);
  assert.ok(flat);
  assert.equal(fallback.removed,true);
  const toggle=selectors['#ps-flat-toggle'];
  toggle.checked=false;toggle.events.change();
  assert.equal(flat.attrs.visibility,'hidden');
  assert.equal(path.attrs.visibility,undefined);
  const toggle2=selectors['#ps-riaa-toggle'];
  toggle2.checked=false;toggle2.events.change();
  assert.equal(path.attrs.visibility,'hidden');
});
test('RIAA playback formula is normalized at 1kHz and has bass boost/treble cut',()=>{
  const mag=f=>{const w=2*Math.PI*f;return Math.sqrt(1+(w*318e-6)**2)/Math.sqrt((1+(w*3180e-6)**2)*(1+(w*75e-6)**2));};
  const db=f=>20*Math.log10(mag(f)/mag(1000));
  assert.ok(Math.abs(db(1000))<1e-10);
  assert.ok(db(20)>17 && db(20)<22,'bass playback lift');
  assert.ok(db(20000)<-17 && db(20000)>-22,'treble playback cut');
});
