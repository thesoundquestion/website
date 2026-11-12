// Regression checks for System Check: wattage, headroom dB/% and burst-rating honesty.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const js = readFileSync(new URL('../system-check/calculator.js', import.meta.url), 'utf8');
const src = js.slice(js.indexOf('function powerPercent('), js.indexOf('\nfunction calculate()'));
assert.ok(src.startsWith('function powerPercent(') && src.includes('function summarizePower('));
class Node {
  constructor(tag) { this.tagName = tag; this.className = ''; this.textContent = ''; this.children = []; this.attributes = {}; }
  append(...children) { this.children.push(...children); }
  setAttribute(name,value) { this.attributes[name] = value; }
  get allText() { return [this.textContent,...this.children.map(c=>typeof c==='string'?c:c.allText??'')].join(' '); }
  get subtrees() { return [this,...this.children.flatMap(c=>c?.subtrees??[])]; }
}
function run(config) {
  const body = new Node('body');
  const context = {
    document: { createElement(tag) { return new Node(tag); } },
    body,
    field(name) { return { value: '', valueAsNumber: config.power?.[name] ?? NaN, dataset: config.sourceUrl && config.power?.[name] ? { powerSourceUrl: config.sourceUrl } : {} }; },
    show(value) { return new Intl.NumberFormat('en-CA', { maximumSignificantDigits: 3 }).format(value); },
    db(value) { return value.toFixed(1); },
    addText(tag,value) { const n = new Node(tag); n.textContent = value; body.append(n); return n; },
    searchLink() { return new Node('a'); },
    Intl, Math, Set, Number,
  };
  const calculate = vm.runInNewContext(src + '\nsummarizePower', context);
  calculate(config);
  const cards = body.subtrees.filter(n=>n.tagName==='article' && n.className.includes('sc-load-card'));
  return { cards, body, text:body.allText };
}
const base = {mode:'check',load:8,minimum:NaN,peakV:Math.sqrt(80*8),averageV:Math.sqrt(8*8),peakW:80,averageW:8,peak:102,average:92};

test('Your Speakers is highlighted and all three load cards include required watts and headroom dB and percent',()=>{
  const result = run({...base, entries:[
    {watts:100,load:8,type:'continuous'},
    {watts:140,load:8,type:'burst'},
    {watts:230,load:4,type:'burst'},
    {watts:180,load:4,type:'continuous'}
  ]});
  assert.equal(result.cards.length,3);
  assert.equal(result.cards[0].children[0].textContent,'Your Speakers');
  assert.ok(result.cards[0].className.includes('sc-load-card--yours'));
  assert.equal(result.cards[1].children[0].textContent,'Estimated Performance with 4 Ω Speakers');
  assert.equal(result.cards[2].children[0].textContent,'Estimated Performance with 6 Ω Speakers');
  assert.match(result.cards[0].allText,/Short peaks · Required 80 W\/ch/);
  assert.match(result.cards[0].allText,/Average · Required 8 W\/ch/);
  assert.match(result.cards[0].allText,/Headroom: \+2\.4 dB · \+42\.9%/);
  assert.match(result.cards[0].allText,/Pass/);
  assert.match(result.cards[2].allText,/Unverified · projected to cover target/);
});
test('a known burst rating below the peak requirement fails and shows the rated-power SPL boundary',()=>{
  const result=run({...base,entries:[
    {watts:50,load:8,type:'continuous'},{watts:50,load:8,type:'burst'},
    {watts:100,load:4,type:'continuous'},{watts:100,load:4,type:'burst'}
  ]});
  const actual=result.cards[0].allText;
  assert.match(actual,/Fail/);
  assert.match(actual,/Headroom: -2\.0 dB · -60%/);
  assert.match(actual,/estimated level boundary: about 100\.0 dB SPL/);
  assert.match(actual,/not an independently measured clipping point/);
});
test('missing burst ratings do NOT assert clipping at continuous power',()=>{
  const result=run({...base,entries:[{watts:50,load:8,type:'continuous'},{watts:100,load:4,type:'continuous'}]});
  const actual=result.cards[0].allText;
  assert.match(actual,/Unverified · peak exceeds continuous rating/);
  assert.doesNotMatch(actual,/Fail/);
  assert.match(actual,/100\.0 dB SPL/);
  assert.match(actual,/Actual short-burst clipping level is unknown/);
  assert.match(result.text,/Burst-rating disclaimer: no short-burst wattage was entered/);
  assert.match(result.cards[0].allText,/No short-burst power rating entered at 8 Ω/);
});
test('upgrade mode still shows three load wattage targets but does not invent a verdict',()=>{
  const result=run({...base,mode:'upgrade',entries:[]});
  assert.equal(result.cards.length,3);
  assert.match(result.cards[0].allText,/Required 80 W\/ch/);
  assert.match(result.cards[1].allText,/Required 160 W\/ch/);
  assert.match(result.cards[2].allText,/Required 107 W\/ch/);
  assert.match(result.text,/Pass\/fail and headroom against an amplifier cannot be determined/);
});
test('nonstandard entered speaker nominal load remains selected and is not renamed to a test load',()=>{
  const result=run({...base,load:5,entries:[{watts:100,load:8,type:'continuous'}]});
  assert.equal(result.cards[0].children[0].textContent,'Your Speakers');
  assert.match(result.cards[0].allText,/5 Ω nominal speaker load you entered/);
  assert.equal(result.cards[1].children[0].textContent,'Estimated Performance with 4 Ω Speakers');
  assert.equal(result.cards[2].children[0].textContent,'Estimated Performance with 6 Ω Speakers');
});

test('lower unverified loads warn about amplifier current and protection risk',()=>{
  const r=run({...base,entries:[{watts:100,load:8,type:'continuous'}]});
  assert.match(r.cards[1].allText,/Amplifier load-stress warning/);
  assert.match(r.cards[1].allText,/4 Ω load is below your lowest entered amplifier test rating \(8 Ω\)/);
  assert.match(r.cards[1].allText,/A RMS per channel/);
  assert.match(r.cards[1].allText,/overheat, trip protection or clip early/);
  assert.doesNotMatch(r.cards[0].allText,/Amplifier load-stress warning/);
});

test('an actual speaker minimum below the lowest tested amp load triggers separate stress warning',()=>{
  const r=run({...base,minimum:3.5,entries:[{watts:120,load:4,type:'continuous'},{watts:80,load:8,type:'continuous'}]});
  assert.match(r.cards[0].allText,/Your measured speaker minimum of 3.5 Ω is also below the lowest tested amplifier load of 4 Ω/);
  assert.doesNotMatch(r.cards[2].allText,/Amplifier load-stress warning/);
});

test('speaker handling source warns only for excess average continuous or peak demand',()=>{
  const r=run({...base,power:{speakerPowerContinuous:5,speakerPowerPeak:40},sourceUrl:'https://example.org/speaker-manual',entries:[{watts:100,load:8,type:'continuous'},{watts:100,load:8,type:'burst'}]});
  assert.match(r.cards[0].allText,/Speaker stress warning: the estimated average demand 8 W per speaker exceeds the published continuous-handling rating of 5 W/);
  assert.match(r.cards[0].allText,/Speaker stress warning: peak demand 80 W per speaker exceeds the manufacturer/);
  const sourceLinks=r.cards[0].subtrees.filter(x=>x.tagName==='a' && x.href==='https://example.org/speaker-manual');
  assert.equal(sourceLinks.length,1);
  assert.match(sourceLinks[0].textContent,/Published speaker-power source/);
});

test('recommended amplifier power is never mislabelled as speaker handling threshold',()=>{
  const r=run({...base,power:{speakerRecommendedAmpMax:50},entries:[{watts:200,load:8,type:'continuous'}]});
  assert.match(r.cards[0].allText,/Speaker handling unverified/);
  assert.match(r.cards[0].allText,/Recommended amplifier range ends at 50 W/);
  assert.match(r.cards[0].allText,/NOT the speaker’s maximum safe input/);
  assert.doesNotMatch(r.cards[0].allText,/Speaker stress warning:/);
});

test('unknown-duration maximum input and nominal input emit qualified cautions',()=>{
  const r=run({...base,power:{speakerPowerMaxInput:40,speakerPowerNominal:5},entries:[{watts:100,load:8,type:'continuous'}]});
  assert.match(r.cards[0].allText,/average demand 8 W exceeds the published nominal input rating of 5 W/);
  assert.match(r.cards[0].allText,/peak demand 80 W exceeds the published maximum input of 40 W/);
  assert.match(r.cards[0].allText,/test duration for this maximum is unspecified/);
});

test('speaker catalogue carries power-source provenance and preserves unknown vintage models',()=>{
  const gear=readFileSync(new URL('../system-check/gear.js',import.meta.url),'utf8');
  const start=gear.indexOf('  "speaker": [');
  const end=gear.indexOf('  "amp": [',start);
  const speakers=JSON.parse(gear.slice(start+'  "speaker": '.length,end).trim().replace(/,\s*$/,''));
  assert.equal(speakers.length,59);
  const sourced=speakers.filter(x=>x.values.speakerPowerSource);
  assert.ok(sourced.length>=30);
  const exact=n=>speakers.find(x=>x.model===n).values;
  assert.equal(exact('Klipsch RP-600M (original)').speakerPowerContinuous,100);
  assert.equal(exact('Klipsch RP-600M (original)').speakerPowerPeak,400);
  assert.equal(exact('Paradigm Monitor SE Atom').speakerPowerMaxInput,50);
  assert.equal(exact('Paradigm Monitor SE Atom').speakerRecommendedAmpMax,100);
  assert.equal(exact('Cerwin-Vega XLS-12').speakerPowerContinuous,undefined);
  assert.equal(exact('Cerwin-Vega XLS-12').speakerPowerPeak,300);
  assert.equal(exact('DALI Oberon 1').speakerPowerContinuous,undefined);
  assert.equal(exact('DALI Oberon 1').speakerRecommendedAmpMax,100);
  assert.equal(exact('Paradigm Phantom v1').speakerPowerContinuous,undefined);
  assert.equal(exact('Paradigm Phantom v1').speakerPowerMaxInput,90);
  assert.equal(exact('Paradigm Phantom v1').speakerRecommendedAmpMax,150);
  assert.equal(exact('Paradigm Titan v3').speakerPowerMaxInput,60);
  assert.equal(exact('Paradigm Titan v3').speakerPowerPeak,undefined);
  assert.equal(exact('Klipsch Forte II').speakerPowerContinuous,100);
  assert.equal(exact('Klipsch Forte II').speakerPowerPeak,500);
  assert.equal(exact('KEF Q1 Meta').speakerRecommendedAmpMax,150);
  assert.equal(exact('KEF Q150').speakerPowerContinuous,undefined);
  assert.equal(exact('JBL L100 Classic').speakerRecommendedAmpMax,200);
});
