// System Check regressions: one relevant load, documented headroom, no invented missing-data warnings.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const js=readFileSync(new URL('../system-check/calculator.js',import.meta.url),'utf8');
const src=js.slice(js.indexOf('function powerPercent('),js.indexOf('\nfunction calculate()'));
assert.ok(src.startsWith('function powerPercent(')&&src.includes('function summarizePower('));
const searchHelper=js.slice(js.indexOf('function searchLink('),js.indexOf('\nfunction readRatings()'));

class Node {
  constructor(tag) {this.tagName=tag;this.className='';this.textContent='';this.children=[];this.attributes={};}
  append(...items){this.children.push(...items);}
  setAttribute(name,value){this.attributes[name]=value;}
  get allText(){return [this.textContent,...this.children.map(c=>typeof c==='string'?c:c.allText??'')].join(' ');}
  get subtrees(){return [this,...this.children.flatMap(c=>c?.subtrees??[])];}
}

function run(config){
  const body=new Node('body');
  const context={
    document:{createElement:tag=>new Node(tag)},body,
    field(name){return {value:config.model?.[name]??'',valueAsNumber:config.power?.[name]??NaN,dataset:config.sourceUrl&&config.power?.[name]?{powerSourceUrl:config.sourceUrl}:{}};},
    show:value=>new Intl.NumberFormat('en-CA',{maximumSignificantDigits:3}).format(value),
    db:value=>value.toFixed(1),
    addText(tag,value){const element=new Node(tag);element.textContent=value;body.append(element);return element;},
    URLSearchParams,Intl,Math,Set,Number
  };
  const summarize=vm.runInNewContext(searchHelper+'\n'+src+'\nsummarizePower',context);
  const summary=summarize(config);
  const cards=body.subtrees.filter(x=>x.tagName==='article'&&x.className.includes('sc-load-card'));
  return {cards,body,text:body.allText,summary};
}
const base={mode:'check',load:8,minimum:NaN,peakV:Math.sqrt(80*8),averageV:Math.sqrt(8*8),peakW:80,averageW:8,peak:102,average:92,distance:8};

test('one actual-speaker card shows ratings and headroom at the entered short-burst load',()=>{
  const r=run({...base,entries:[
    {watts:100,load:8,type:'continuous'},
    {watts:140,load:8,type:'burst'},
    {watts:180,load:4,type:'continuous'}
  ]});
  assert.equal(r.cards.length,1);
  assert.equal(r.cards[0].children[0].textContent,'Your Speakers');
  assert.match(r.cards[0].allText,/Short peaks · Required 80 W\/ch/);
  assert.match(r.cards[0].allText,/Average · Required 8 W\/ch/);
  assert.match(r.cards[0].allText,/Headroom relative to rating: \+2\.4 dB · \+42\.9%/);
  assert.match(r.cards[0].allText,/Published \/ entered: 140 W\/ch/);
  assert.doesNotMatch(r.cards[0].allText,/Musical peaks:/);
  assert.doesNotMatch(r.text,/Estimated Performance with 4 Ω/);
});

test('published burst below required peak fails with rated-power boundary',()=>{
  const r=run({...base,entries:[{watts:50,load:8,type:'continuous'},{watts:50,load:8,type:'burst'}]});
  assert.match(r.cards[0].allText,/Fail/);
  assert.match(r.cards[0].allText,/Headroom relative to rating: -2\.0 dB · -60%/);
  assert.match(r.cards[0].allText,/estimated level boundary: about 100\.0 dB SPL/);
  assert.match(r.cards[0].allText,/not an independently measured clipping point/);
  assert.match(r.text,/not proof of an electrically incompatible speaker\/amplifier pair/);
});

test('failing burst headroom explains the shortfall and actionable listening-distance tradeoff',()=>{
  const r=run({...base,entries:[{watts:50,load:8,type:'continuous'},{watts:50,load:8,type:'burst'}]});
  const card=r.cards[0].allText;
  assert.match(card,/Why the peak target failed/);
  assert.match(card,/102\.0 dB needs 80 W\/ch, versus 50 W\/ch documented short-burst output/);
  assert.match(card,/2\.0 dB short/);
  assert.match(card,/Sit closer: from 8 ft to about 6\.3 ft/);
  assert.match(card,/Lower the peak target by about 2\.0 dB, to roughly 100\.0 dB SPL/);
  assert.match(card,/2\.0 dB higher comparable speaker sensitivity/);
  assert.match(card,/verified short-burst rating of at least 80 W\/ch at this load/);
  assert.match(card,/not a guaranteed distortion-free level/);
});

test('no peak-failure advice is shown for a passing burst or an unavailable comparison',()=>{
  const good=run({...base,entries:[{watts:100,load:8,type:'continuous'},{watts:100,load:8,type:'burst'}]});
  assert.doesNotMatch(good.cards[0].allText,/Why the peak target failed|Sit closer|Lower the peak target/);
  const absent=run({...base,entries:[]});
  assert.doesNotMatch(absent.cards[0].allText,/Why the peak target failed|Sit closer|Lower the peak target/);
});

test('peak beyond continuous-only rating explains unknown burst rather than calling it failed',()=>{
  const r=run({...base,entries:[{watts:50,load:8,type:'continuous'}]});
  assert.match(r.cards[0].allText,/Why peak capacity is not verified/);
  assert.match(r.cards[0].allText,/Burst capacity is unknown/);
  assert.match(r.cards[0].allText,/Sit closer: from 8 ft to about 6\.3 ft/);
  assert.match(r.cards[0].allText,/cannot establish actual short-burst capability/);
  assert.doesNotMatch(r.cards[0].allText,/Why the peak target failed/);
});

test('unrealistic distance fixes are not given as numeric recommendations',()=>{
  const r=run({...base,distance:10,peakW:1600,peakV:Math.sqrt(1600*8),
    entries:[{watts:80,load:8,type:'continuous'},{watts:80,load:8,type:'burst'}]});
  assert.match(r.cards[0].allText,/distance alone could require an impractically near seat/);
  assert.doesNotMatch(r.cards[0].allText,/Sit closer: from 10 ft to about/);
});

test('average failure is explained without mistaking it for electrical incompatibility',()=>{
  const r=run({...base,averageW:90,averageV:Math.sqrt(90*8),
    entries:[{watts:50,load:8,type:'continuous'},{watts:100,load:8,type:'burst'}]});
  assert.match(r.cards[0].allText,/Why the average target failed/);
  assert.match(r.cards[0].allText,/Lower the average target/);
  assert.doesNotMatch(r.cards[0].allText,/Why the peak target failed/);
});

test('continuous-only output shows rated headroom without an invented musical-peak story',()=>{
  const r=run({...base,entries:[{watts:100,load:8,type:'continuous'}]});
  assert.match(r.cards[0].allText,/Headroom relative to rating: \+1\.0 dB · \+20%/);
  assert.doesNotMatch(r.cards[0].allText,/Musical peaks:/);
  assert.doesNotMatch(r.text,/Burst-rating disclaimer|No short-burst power rating entered|No comparable short-burst/);
});

test('peak above continuous rating does not become a claimed clipping failure',()=>{
  const r=run({...base,entries:[{watts:50,load:8,type:'continuous'}]});
  assert.match(r.cards[0].allText,/Unverified · peak exceeds continuous rating/);
  assert.doesNotMatch(r.cards[0].allText,/Fail/);
  assert.doesNotMatch(r.cards[0].allText,/Musical peaks:/);
  assert.doesNotMatch(r.text,/Burst-rating disclaimer/);
});

test('a documented burst rating takes priority for peaks even when lower than the continuous rating',()=>{
  const r=run({...base,entries:[{watts:100,load:8,type:'continuous'},{watts:50,load:8,type:'burst'}]});
  assert.match(r.cards[0].allText,/Short peaks · Required 80 W\/ch/);
  assert.match(r.cards[0].allText,/Published \/ entered: 50 W\/ch/);
  assert.match(r.cards[0].allText,/Fail/);
  assert.doesNotMatch(r.cards[0].allText,/Musical peaks:/);
});

test('upgrade mode does not add hypothetical impedances or missing-data warnings',()=>{
  const r=run({...base,mode:'upgrade',entries:[]});
  assert.equal(r.cards.length,1);
  assert.match(r.cards[0].allText,/Required 80 W\/ch/);
  assert.doesNotMatch(r.text,/Unverified|Musical peaks:|Pass\/fail and headroom/);
});

test('nominal speaker impedance is kept exactly as entered',()=>{
  const r=run({...base,load:5,entries:[{watts:100,load:8,type:'continuous'}]});
  assert.equal(r.cards.length,1);
  assert.match(r.cards[0].allText,/5 Ω nominal speaker load you entered/);
  assert.doesNotMatch(r.text,/Musical peaks:|Amplifier load-stress warning|no usable/);
});

test('6 Ω between published 4 Ω and 8 Ω passes both targets when interpolated power covers them',()=>{
  const r=run({...base,load:6,entries:[{watts:120,load:8,type:'continuous'},{watts:180,load:4,type:'continuous'}]});
  assert.equal(r.cards.length,1);
  assert.match(r.cards[0].allText,/6 Ω lies between published 4 Ω and 8 Ω continuous test loads/);
  assert.doesNotMatch(r.cards[0].allText,/Pass · 6 Ω/);
  assert.equal(r.summary.code,'pass');
  assert.equal(r.summary.label,'Pass · average and peak power targets met');
  assert.match(r.summary.detail,/interpolated amplifier wattage/);
  assert.match(r.cards[0].allText,/Interpolated: 150 W\/ch/);
  assert.match(r.cards[0].allText,/Pass · interpolated power covers target/);
  assert.doesNotMatch(r.cards[0].allText,/Power capacity estimated at this load/);
  assert.doesNotMatch(r.text,/Amplifier load-stress warning|Musical peaks:/);
});

test('missing lower-load amplifier rating is NOT proof of unsafe 6 Ω operation',()=>{
  const r=run({...base,load:6,entries:[{watts:100,load:8,type:'continuous'}]});
  assert.equal(r.cards.length,1);
  assert.doesNotMatch(r.text,/Amplifier load-stress warning|overheat|trip protection|Musical peaks:|Burst-rating disclaimer/);
});

test('no available amplifier ratings shows required watts only',()=>{
  const r=run({...base,load:6,entries:[]});
  assert.equal(r.cards.length,1);
  assert.match(r.cards[0].allText,/Required/);
  assert.doesNotMatch(r.cards[0].allText,/Unverified|Musical peaks:|no usable|speaker safety cannot be established/i);
});

test('real published speaker continuous/peak limits still trigger genuine warnings',()=>{
  const r=run({...base,power:{speakerPowerContinuous:5,speakerPowerPeak:40},
    sourceUrl:'https://example.org/speaker-manual',
    entries:[{watts:100,load:8,type:'continuous'},{watts:100,load:8,type:'burst'}]});
  assert.match(r.cards[0].allText,/Speaker stress warning: the estimated average demand 8 W per speaker exceeds/);
  assert.match(r.cards[0].allText,/Speaker stress warning: peak demand 80 W per speaker exceeds/);
  const links=r.cards[0].subtrees.filter(x=>x.tagName==='a'&&x.href==='https://example.org/speaker-manual');
  assert.equal(links.length,1);
});

test('missing speaker-handling information does not create a blanket disclaimer',()=>{
  const r=run({...base,power:{speakerRecommendedAmpMax:50},entries:[{watts:100,load:8,type:'continuous'}]});
  assert.doesNotMatch(r.cards[0].allText,/Speaker handling unverified|Requested power is within|Recommended amplifier range ends/);
});

test('nominal and unspecified-maximum handling preserve real exceedance cautions',()=>{
  const r=run({...base,power:{speakerPowerMaxInput:40,speakerPowerNominal:5},entries:[{watts:100,load:8,type:'continuous'}]});
  assert.match(r.cards[0].allText,/average demand 8 W exceeds the published nominal input rating of 5 W/);
  assert.match(r.cards[0].allText,/peak demand 80 W exceeds the published maximum input of 40 W/);
});

test('measured impedance dip without manufacturer load-permission evidence does not invent a warning',()=>{
  const r=run({...base,minimum:3.5,entries:[{watts:80,load:8,type:'continuous'}]});
  assert.doesNotMatch(r.text,/Amplifier load-stress warning|find a lower-load amp test/);
});

test('only genuine rating comparisons produce peak explanation',()=>{
  const r=run({...base,load:6,entries:[{watts:80,load:8,type:'continuous'}]});
  assert.doesNotMatch(r.cards[0].allText,/Musical peaks:/);
});

test('published burst data enriches peaks without invented THD conclusions',()=>{
  const r=run({...base,peakV:Math.sqrt(110*8),peakW:110,
    entries:[{watts:80,load:8,type:'continuous'},{watts:140,load:8,type:'burst'}]});
  assert.match(r.cards[0].allText,/Published \/ entered: 140 W\/ch/);
  assert.match(r.cards[0].allText,/Headroom relative to rating: \+1\.0 dB/);
  assert.doesNotMatch(r.cards[0].allText,/Musical peaks:/);
  assert.doesNotMatch(r.cards[0].allText,/distortion is unlikely|already clipping/);
});

test('no average target omits average metric without losing peak comparison',()=>{
  const r=run({...base,averageV:null,averageW:null,average:null,entries:[{watts:80,load:8,type:'continuous'}]});
  assert.doesNotMatch(r.cards[0].allText,/Average · Required/);
  assert.match(r.cards[0].allText,/Short peaks · Required 80 W\/ch/);
  assert.doesNotMatch(r.cards[0].allText,/Musical peaks:/);
});


test('headroom fixes use one collapsed summary, even when both metrics fail',()=>{
  const r=run({...base,averageW:90,averageV:Math.sqrt(90*8),
    entries:[{watts:50,load:8,type:'continuous'},{watts:50,load:8,type:'burst'}]});
  const details=r.cards[0].subtrees.filter(node=>node.tagName==='details'&&node.className==='sc-headroom-adjustments');
  assert.equal(details.length,1);
  assert.equal(details[0].children[0].tagName,'summary');
  assert.equal(details[0].children[0].textContent,'What could you do?');
  assert.match(details[0].allText,/Why the peak target failed/);
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
  assert.equal(exact('JBL L100 Century (original)').speakerPowerContinuous,50);
  assert.equal(exact('Polk Signature Elite ES60').speakerRecommendedAmpMax,300);
});




test('average pass and verified burst fail produces a failed overall result, never a complete pass',()=>{
 const r=run({...base,entries:[{watts:100,load:8,type:'continuous'},{watts:50,load:8,type:'burst'}]});
 assert.equal(r.summary.code,'fail');
 assert.equal(r.summary.label,'Peak target not met');
 assert.match(r.summary.detail,/average demand fits.*musical peaks exceed/);
 const verdict=r.cards[0].subtrees.filter(x=>x.className.startsWith('sc-overall-verdict'));
 assert.equal(verdict.length,1);
 assert.match(verdict[0].allText,/Peak target not met/);
 assert.doesNotMatch(verdict[0].allText,/Average and peak power targets met/);
 assert.match(r.cards[0].allText,/Average.*Pass.*Short peaks.*Fail/s);
});
test('average pass and missing burst power becomes unverified, not full pass or proven clipping',()=>{
 const r=run({...base,entries:[{watts:50,load:8,type:'continuous'}]});
 assert.equal(r.summary.code,'unverified');
 assert.match(r.summary.label,/Peak headroom not verified/);
 assert.doesNotMatch(r.summary.label,/Pass|Fail/);
 assert.match(r.cards[0].allText,/Unverified · peak exceeds continuous rating/);
});
test('both targets within directly entered ratings may receive a qualified amplifier power pass',()=>{
 const r=run({...base,entries:[{watts:100,load:8,type:'continuous'},{watts:140,load:8,type:'burst'}]});
 assert.equal(r.summary.code,'pass');
 assert.equal(r.summary.label,'Average and peak power targets met');
 assert.match(r.summary.detail,/not measured distortion/);
});
test('average failure dominates peak power passing in the overall verdict',()=>{
 const r=run({...base,averageV:Math.sqrt(90*8),averageW:90,entries:[{watts:50,load:8,type:'continuous'},{watts:100,load:8,type:'burst'}]});
 assert.equal(r.summary.code,'fail');
 assert.equal(r.summary.label,'Average target not met');
});
test('passing amplifier power cannot hide a documented speaker peak-handling caution',()=>{
 const r=run({...base,power:{speakerPowerPeak:40},entries:[{watts:100,load:8,type:'continuous'},{watts:140,load:8,type:'burst'}]});
 assert.equal(r.summary.code,'caution');
 assert.match(r.summary.label,/check speaker handling/);
 assert.match(r.cards[0].allText,/Speaker stress warning: peak demand 80 W/);
});
test('no amplifier rating leaves the result a power requirement rather than a made-up pass',()=>{
 const r=run({...base,entries:[]});
 assert.equal(r.summary,null);
 assert.doesNotMatch(r.cards[0].allText,/sc-overall-verdict|Average and peak power targets met/);
});
test('visible result-status reflects the combined comparison, not generic calculation success',()=>{
 assert.match(js,/const overall = summarizePower\(/);
 assert.ok(js.includes("if (overall) status.textContent = overall.label + '. ' + overall.detail;"));
});

test('calculator preserves average watts when handing results to the speaker safety comparison',()=>{
 assert.match(js,/const overall = summarizePower\(\{ mode, entries, load, minimum, distance, peakV, averageV, peakW, averageW, average, peak \}\)/);
});


test('interpolated continuous power below peak demand does not pass without burst evidence',()=>{
  const r=run({...base,load:6,entries:[{watts:90,load:4,type:'continuous'},{watts:40,load:8,type:'continuous'}]});
  assert.match(r.cards[0].allText,/Interpolated: 65 W\/ch/);
  assert.equal(r.summary.code,'unverified');
  assert.equal(r.summary.label,'Peak headroom not verified');
  assert.doesNotMatch(r.cards[0].allText,/Pass · average and peak power targets met/);
});
test('interpolated continuous pass cannot override a documented peak burst failure',()=>{
  const r=run({...base,load:6,entries:[
    {watts:180,load:4,type:'continuous'},{watts:120,load:8,type:'continuous'},
    {watts:75,load:6,type:'burst'}
  ]});
  assert.equal(r.summary.code,'fail');
  assert.equal(r.summary.label,'Peak target not met');
  assert.match(r.cards[0].allText,/Average.*Pass.*Short peaks.*Fail/s);
});
test('published 4 Ω and 8 Ω burst as well as continuous limits may both interpolate to a pass',()=>{
  const r=run({...base,load:6,entries:[
    {watts:200,load:4,type:'continuous'},{watts:120,load:8,type:'continuous'},
    {watts:160,load:4,type:'burst'},{watts:100,load:8,type:'burst'}
  ]});
  assert.equal(r.summary.code,'pass');
  assert.equal(r.summary.label,'Pass · average and peak power targets met');
  assert.match(r.cards[0].allText,/Interpolated: 160 W\/ch/);
  assert.match(r.cards[0].allText,/Interpolated: 130 W\/ch/);
});
test('interpolated short-burst output below peak is not claimed to pass or a proven clipping failure',()=>{
  const r=run({...base,load:6,entries:[
    {watts:180,load:4,type:'continuous'},{watts:120,load:8,type:'continuous'},
    {watts:60,load:4,type:'burst'},{watts:40,load:8,type:'burst'}
  ]});
  assert.equal(r.summary.code,'estimate');
  assert.equal(r.summary.label,'Estimated power below target at this load');
  assert.doesNotMatch(r.cards[0].allText,/Pass · average and peak power targets met/);
});
test('speaker power-handling concern still overrides interpolation-based amplifier pass',()=>{
  const r=run({...base,load:6,power:{speakerPowerPeak:40},entries:[
    {watts:180,load:4,type:'continuous'},{watts:120,load:8,type:'continuous'}
  ]});
  assert.equal(r.summary.code,'caution');
  assert.match(r.summary.label,/check speaker handling/);
  assert.match(r.cards[0].allText,/Speaker stress warning: peak demand/);
});
