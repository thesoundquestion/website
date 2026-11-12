import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const js = readFileSync(new URL('../system-check/calculator.js', import.meta.url), 'utf8');
const catalogueRaw = readFileSync(new URL('../system-check/gear.js', import.meta.url), 'utf8');
const catalogue = JSON.parse(catalogueRaw.match(/^const systemCheckGear = ([\s\S]*?);\s*$/m)?.[1] ?? '{}');

class E {
  constructor(tag='div') {
    this.tagName=tag; this.children=[]; this.textContent=''; this.dataset={}; this.listeners={};
    this.value=''; this.hidden=false; this.parent=null;
  }
  append(...items) { for(const x of items){ this.children.push(x); if(x && typeof x==='object')x.parent=this; } }
  replaceChildren(...items) { this.children=[]; this.textContent=''; this.append(...items); }
  add(x){this.append(x);}
  remove(){if(this.parent)this.parent.children.splice(this.parent.children.indexOf(this),1);}
  querySelector(){return null;}
  closest(){return null;}
  cloneNode(){const x=new E(this.tagName);x.textContent=this.textContent;x.href=this.href;return x;}
  setAttribute(name,val){this[name]=val;}
  addEventListener(type,cb){(this.listeners[type]??=[]).push(cb);}
  dispatchEvent(event){for(const fn of this.listeners[event.type]||[])fn(event);}
  get allText(){return [this.textContent,...this.children.map(x=>typeof x==='string'?x:x.allText)].join(' ');}
  get descendants(){return [this,...this.children.flatMap(x=>typeof x==='string'?[]:x.descendants)];}
}

function makeContext() {
 const body=new E('body');
 const context={document:{createElement:t=>new E(t)},body,show:n=>String(n)};
 const code=js.slice(js.indexOf('function describeRatedDistortion('),js.indexOf('function renderConnections('));
 assert.ok(code.startsWith('function describeRatedDistortion(') && code.includes('function renderDistortionRatingContext'));
 vm.runInNewContext(code+'\nglobalThis.describe=describeRatedDistortion;\nglobalThis.render=renderDistortionRatingContext;',context);
 return {ctx:context,body};
}

test('distortion parser separates test band, single frequency, THD and THD+N',()=>{
 const {ctx}=makeContext();
 const band=ctx.describe('40 Hz–20 kHz, 0.9% THD, both channels driven');
 assert.equal(band.percent,0.9);assert.equal(band.metric,'THD');assert.equal(band.scope,'stated frequency band');
 const single=ctx.describe('1 kHz, 0.05% THD, both channels driven');
 assert.equal(single.percent,.05);assert.equal(single.scope,'single 1 kHz test');
 const noReading=ctx.describe('IHF dynamic power');
 assert.equal(noReading.percent,null);assert.equal(noReading.metric,null);
 const upper=ctx.describe('20 Hz–20 kHz, ≤0.08% THD+N, both channels driven');
 assert.equal(upper.metric,'THD+N');assert.equal(upper.ceiling,true);
 const another=ctx.describe('20 Hz-20 kHz, <0.03% THD, both channels driven');
 assert.equal(another.ceiling,true);assert.equal(another.scope,'stated frequency band');
});

test('Panasonic same-load published ratings disclose different distortion and frequency conditions',()=>{
 const {ctx,body}=makeContext();
 ctx.render([
  {watts:100,load:6,type:'continuous',conditions:'40 Hz–20 kHz, 0.9% THD, both channels driven',sourceUrl:'https://example.org/panasonic'},
  {watts:105,load:6,type:'continuous',conditions:'1 kHz, 0.05% THD, both channels driven',sourceUrl:'https://example.org/panasonic'}
 ],6);
 assert.match(body.allText,/100 W\/ch, 6 Ω/);
 assert.match(body.allText,/105 W\/ch, 6 Ω/);
 assert.match(body.allText,/0\.9% THD/);
 assert.match(body.allText,/0\.05% THD/);
 assert.match(body.allText,/single 1 kHz test/);
 assert.match(body.allText,/highest wattage is not automatically the cleanest/);
 assert.match(body.allText,/remains unverified/);
 assert.equal(body.descendants.filter(x=>x.tagName==='a').length,2);
});

test('mismatched load does not claim distortion is verified at the speaker impedance',()=>{
 const {ctx,body}=makeContext();
 ctx.render([{watts:80,load:8,type:'continuous',conditions:'0.08% THD'}],4);
 assert.match(body.allText,/No rating was entered at your speaker’s nominal 4 Ω/);
 assert.match(body.allText,/cannot verify either distortion or clean power at this load/);
});

test('every existing amp numeric distortion curve input remains empty without a verified series',()=>{
 assert.equal(catalogue.amp.length,42);
 assert.equal(catalogue.amp.filter(a=>(a.ratings||[]).some(x=>/\d\s*%\s*THD/.test(x[3]))).length,34);
 assert.equal(catalogue.amp.filter(a=>String(a.values?.curve||'').trim()).length,0);
 assert.equal(catalogue.amp.filter(a=>a.distortionResearch?.url).length,4);
 for(const a of catalogue.amp.filter(a=>a.distortionResearch)) assert.match(a.distortionResearch.url,/^https:\/\//);
});

function ampHarness(){
 const amp=catalogue.amp, fields=Object.fromEntries([
  'ampModel','inputZ','inputSensitivity','gain','outputZ','curveLoad','curveHz','curveType','curve'
 ].map(k=>[k,new E('input')]));
 const select=new E('select'),note=new E('p'),suggestions=new E('datalist'),
       research=new E('p'),ratings=new E('div');
 const picker={dataset:{gear:'amp'},hidden:true,closest(){return null;},
  querySelector(name){return name==='select'?select:name==='p'?note:null}};
 const pf={amp:['inputZ','inputSensitivity','gain','outputZ','curveLoad','curveHz','curveType','curve']};
 const context={location:{search:''},URLSearchParams,Number,show:x=>String(x),
  presetFields:pf,ratings,field:k=>fields[k],
  speakerPowerFields:[],
  addRating(...args){const row=new E('div');if(args[4])row.dataset.sourceUrl=args[4];row.record=args;ratings.append(row);return row;},
  Option:class{constructor(text,value){this.text=text;this.value=value;}},
  Event:class{constructor(type){this.type=type;}},
  document:{
   querySelectorAll(sel){return sel==='[data-gear]'?[picker]:[];},
   querySelector(sel){return sel==='#amp-model-suggestions'?suggestions:sel==='#amp-distortion-research'?research:null;},
   createElement:tag=>new E(tag)
  }
 };
 const start=js.indexOf('function normalizeSpeakerPresetModel('),end=js.indexOf('// Distinguish a visitor-edited value',start);
 vm.runInNewContext(js.slice(start,end)+'\nglobalThis.mount=mountGearPresets',context);
 context.mount({amp});
 const type=model=>{fields.ampModel.value=model;fields.ampModel.dispatchEvent({type:'input'});};
 return {amp,fields,select,note,suggestions,research,ratings,type};
}
test('typing exact A-S801 populates all published watt and distortion conditions',()=>{
 const h=ampHarness();h.type('Yamaha A-S801');
 assert.equal(h.amp[Number(h.select.value)].model,'Yamaha A-S801');
 assert.equal(h.ratings.children.length,5);
 assert.equal(h.ratings.children[0].record[3],'20 Hz–20 kHz, 0.019% THD');
 assert.equal(h.fields.inputZ.value,47);
 assert.match(h.research.allText,/Independent distortion plots located/);
 assert.match(h.research.allText,/Audioholics independent A-S801/);
 assert.equal(h.fields.curve.value,'');
 assert.equal(h.suggestions.children.length,42);
});

test('typing a different revision removes untouched rated values but keeps user-edited rows',()=>{
 const h=ampHarness();h.type('Yamaha A-S801');
 const manual=h.ratings.children[0];delete manual.dataset.sourceUrl;
 h.fields.inputZ.value='99';
 h.type('Yamaha A-S801 Mk II');
 assert.equal(h.select.value,'');
 assert.equal(h.fields.inputZ.value,'99');
 assert.equal(h.ratings.children.length,1);
 assert.equal(h.ratings.children[0],manual);
 assert.match(h.research.allText,/No amplifier preset selected/);
});

test('a different real amp injects published conditions but never copies picture coordinates',()=>{
 const h=ampHarness();h.type('WiiM Amp');
 assert.equal(h.ratings.children.length,4);
 assert.equal(h.fields.curve.value,'');
 assert.equal(h.fields.curveLoad.value,'');
 assert.equal(h.fields.curveHz.value,'');
 assert.match(h.research.allText,/Hi-Fi News WiiM Amp lab graphs/);
});
