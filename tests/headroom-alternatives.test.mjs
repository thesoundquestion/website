import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const js=readFileSync(new URL('../system-check/headroom-alternatives.js',import.meta.url),'utf8');
const gearText=readFileSync(new URL('../system-check/gear.js',import.meta.url),'utf8');
const gear=JSON.parse(gearText.slice(gearText.indexOf('= ')+2,gearText.lastIndexOf(';')));
const context={window:{},Math,Number};
vm.runInNewContext(js,context);
const shortlist=context.window.systemCheckHeadroomAlternatives.suggestions;

function power(model,level,distance=9){
  const s=gear.speaker.find(item=>item.model===model);
  const v=s.values;
  const ref=(v.basis==='power'?1:2.83**2/v.load);
  const atSeat=v.sensitivity-20*Math.log10(distance/(1/0.3048))+3;
  return ref*10**((level-atSeat)/10);
}
function example({speakerModel='Paradigm Phantom v1',ampModel='Yamaha A-S301',average=85,peak=105,distance=9,ratings=null}={}){
  const speaker=gear.speaker.find(x=>x.model===speakerModel);
  const amp=gear.amp.find(x=>x.model===ampModel);
  const v=speaker.values;
  return shortlist({
    catalog:gear,speakerModel,ampModel,sensitivity:v.sensitivity,basis:v.basis,
    load:v.load,average,peak,distance,room:0,pair:3,
    averageWatts:power(speakerModel,average,distance),
    peakWatts:power(speakerModel,peak,distance),
    amplifierRatings:ratings??amp?.ratings??[]
  });
}
test('occasionally loud headroom finds higher-sensitivity speakers but no unsafe amplifier cure',()=>{
  const options=example();
  assert.equal(options.amplifiers.length,0,'do not recommend powering 240 W peaks into a speaker with an unspecified-duration 90 W max');
  assert.ok(options.speakers.some(x=>x.model==='Klipsch R-51M'),'manufacturer-rated replacement ought to clear estimated peak');
  for(const x of options.speakers){
    assert.ok(x.peakHandling>x.requiredPeakWatts);
    assert.ok(x.url.startsWith('https://'));
    assert.ok(x.gainDb>0);
  }
});
test('for a moderate shortfall, recommend only makers with supported exact speaker load and documented burst',()=>{
  const options=example({ampModel:'NAD 3020 (original)',average:80,peak:98});
  assert.ok(options.amplifiers.some(x=>x.model==='Yamaha A-S301'));
  assert.equal(options.amplifiers.some(x=>x.model==='NAD 3020 (original)'),false);
  const required=power('Paradigm Phantom v1',98);
  assert.ok(options.amplifiers.every(x=>x.burst>=required&&x.load===8));
});
test('a missing burst rating is not filled by a continuous or marketing peak rating',()=>{
  const options=example({ratings:[{watts:100,load:8,type:'continuous'}]});
  assert.equal(options.speakers.length,0);
});
test('no speaker handling test or comparable sensitivity basis means no speaker recommendation',()=>{
  const fake=structuredClone(gear);
  const s=fake.speaker.find(x=>x.model==='Klipsch R-51M');
  delete s.values.speakerPowerPeak;
  const data=example();
  const withFake=shortlist({...{
    catalog:fake,speakerModel:'Paradigm Phantom v1',ampModel:'Yamaha A-S301',
    sensitivity:87,basis:'voltage',load:8,average:85,peak:105,distance:9,
    averageWatts:power('Paradigm Phantom v1',85),peakWatts:power('Paradigm Phantom v1',105),
    amplifierRatings:gear.amp.find(x=>x.model==='Yamaha A-S301').ratings
  }});
  assert.equal(withFake.speakers.some(x=>x.model==='Klipsch R-51M'),false);
  assert.equal(data.speakers.some(x=>x.model==='Klipsch R-51M'),true);
  assert.equal(withFake.speakers.some(x=>x.model==='Klipsch Forte II'),false,'do not compare power/voltage sensitivities directly');
});
test('unknown manufacturer speaker-load permission cannot become an endorsed match',()=>{
  const options=example({ampModel:'Yamaha A-720'});
  assert.equal(options.speakers.length,0);
});
test('calculator loads a separate source-backed engine, not a remote shopping API',()=>{
  const html=readFileSync(new URL('../system-check/index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('../system-check/calculator.js',import.meta.url),'utf8');
  assert.ok(html.indexOf('/system-check/headroom-alternatives.js')<html.indexOf('/system-check/calculator.js'));
  assert.match(app,/What could you do\?/);
  assert.match(app,/systemCheckHeadroomAlternatives\?\.suggestions/);
  assert.match(app,/list\.children\.length/);
  assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|api\.openai/);
});
