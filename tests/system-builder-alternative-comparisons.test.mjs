import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {compareAlternative,compareElectronic,compactAlternativeComparison} from '../system-builder/alternative-comparisons.mjs';
const catalog=JSON.parse(readFileSync(new URL('../equipment/catalog.generated.json',import.meta.url),'utf8'));
const req={goal:'dynamic',headphoneUse:'quiet',currency:'CAD'};
const choose=(id,extra={})=>({id,architecture:'headphone_first',
 title:catalog.records.find(r=>r.id===id)?.model||id,
 kind:id.includes('moondrop')?'In-ear wired headphones':'Open-backed wired headphones',
 ...extra});
test('headphones: open vs in-ear states use-case difference and avoids fictional acoustic claims',()=>{
 const a=choose('legacy/headphone/sennheiser-hd-560s');
 const b=choose('legacy/headphone/moondrop-chu-ii');
 const c=compareAlternative(a,b,req,catalog);
 assert.match(c.summary,/Compared with Sennheiser HD 560S/);
 assert.match(c.change,/open-back to in-ear/);
 assert.match(c.preference,/portability/);
 assert.match(c.tradeoff,/seal/);
 assert.doesNotMatch([c.change,c.preference].join(' '),/better sound|guaranteed/i);
});
test('headphones: comparable manufacturer sensitivity references and impedance are labelled correctly',()=>{
 const a=choose('legacy/headphone/sennheiser-hd-560s');
 const b=choose('legacy/headphone/sennheiser-hd-600');
 const c=compareAlternative(a,b,req,catalog);
 assert.match(c.change,/300 Ω/);
 assert.match(c.change,/120 Ω/);
 assert.match(c.change,/110 to 97 dB SPL per volt/);
 assert.match(c.tradeoff,/Impedance alone cannot/);
});
test('headphone comparison does not compare unlike sensitivity reference units',()=>{
 const a=choose('legacy/headphone/grado-sr60x');
 const b=choose('legacy/headphone/sennheiser-hd-600');
 const c=compareAlternative(a,b,req,catalog);
 assert.doesNotMatch(c.change,/published sensitivity changes/);
});
test('passive speakers: retained amplifier versus new speaker is a conditional change',()=>{
 const a={id:'owned',architecture:'passive_separates',title:'Paradigm Titan v3 + Yamaha A-720',
   ownedAmpName:'Yamaha A-720',speakerModel:'Paradigm Titan v3',speakerValues:{sensitivity:88,basis:'power'}};
 const b={id:'new',architecture:'passive_separates',title:'Klipsch R-50M',
   ownedAmpName:'Yamaha A-720',speakerModel:'Klipsch R-50M',upgradeComparedTo:'Paradigm Titan v3',
   speakerValues:{sensitivity:92,basis:'voltage'}};
 const c=compareAlternative(a,b,req,catalog);
 assert.match(c.change,/amplifier is retained/);
 assert.match(c.preference,/speaker.*placement|new speaker/);
 assert.match(c.tradeoff,/cannot prove/);
 assert.doesNotMatch(c.change,/published speaker sensitivity is/); // mismatched reference methods
});
test('amp alternatives: same speakers does not infer branded sound signatures',()=>{
 const a={id:'a',title:'Amp A + Speakers',architecture:'passive_separates',speakerModel:'Test P5',amplifierModel:'Amp A'};
 const b={id:'b',title:'Amp B + Speakers',architecture:'passive_separates',speakerModel:'Test P5',amplifierModel:'Amp B'};
 const c=compareAlternative(a,b,req);
 assert.match(c.change,/speakers stay the same/);
 assert.match(c.preference,/documented input/);
 assert.match(c.tradeoff,/Different amplifier watts or brands/);
});
test('powered vs passive configurations explain fewer boxes and missing specs',()=>{
 const a={id:'a',title:'A-S301 + P5',architecture:'passive_separates'};
 const b={id:'b',title:'Kanto ORA',architecture:'consumer_powered_pair',connections:['usb','analog']};
 const c=compareAlternative(a,b,req);
 assert.match(c.change,/powered stereo speakers/);
 assert.match(c.preference,/fewer separate boxes/);
 assert.match(c.tradeoff,/built-in amplifier/);
});
test('active monitors and PA alternatives expose practical installation differences',()=>{
 const a={id:'a',title:'Desktop powered pair',architecture:'consumer_powered_pair',power:'mains'};
 const b={id:'b',title:'JBL studio monitors',architecture:'active_studio',power:'mains'};
 const c=compareAlternative(a,b,req);
 assert.match(c.change,/individually powered studio monitors/);
 assert.match(c.tradeoff,/power feeds/);
 const pa=compareAlternative(
 {id:'c',title:'PA mains',architecture:'party_pa',power:'mains'},
 {id:'d',title:'PA battery',architecture:'party_pa',power:'battery'},req);
 assert.match(pa.change,/battery/);assert.match(pa.preference,/away from mains/);
});
test('subwoofer and 2.1 routes compare documented crossover rather than magical bass boost',()=>{
 const a={id:'a',title:'Stereo pair',architecture:'consumer_powered_pair'};
 const b={id:'b',title:'2.1 pair',architecture:'consumer_powered_pair',
  bassSetup:{label:'Mains high-pass when sub plugged in'}};
 const c=compareAlternative(a,b,req);
 assert.match(c.change,/adds a subwoofer/);
 assert.match(c.tradeoff,/crossover/);
});
test('DAC, standalone amp and combo alternatives describe jobs not guaranteed sonic gains',()=>{
 const amp1={id:'1',model:'JDS Labs Atom Amp 2',label:'Headphone amplifier',type:'amp'};
 const amp2={id:'2',model:'Schiit Magni 6',label:'Headphone amplifier',type:'amp'};
 const c=compareElectronic(amp1,amp2);
 assert.match(c.summary,/Compared with JDS Labs Atom Amp 2/);
 assert.match(c.preference,/published output/);
 assert.match(c.tradeoff,/watts/);
 const dac=compareElectronic({id:'3',model:'Schiit Modi+',type:'dac',label:'Standalone DAC'},
  {id:'4',model:'SMSL SU-1',type:'dac',label:'Standalone DAC'});
 assert.match(dac.tradeoff,/cannot power headphones/);
 const combo=compareElectronic({id:'5',model:'FiiO K11',type:'combo',label:'DAC \+ headphone amplifier'},
  {id:'6',model:'FiiO Q11',type:'combo',label:'DAC \+ headphone amplifier'});
 assert.match(combo.change,/digital audio/);
});
test('alternatives display independent owner impressions on main results screen',()=>{
 const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 const css=readFileSync(new URL('../system-builder/style.css',import.meta.url),'utf8');
 assert.match(app,/renderComparisonPreview\(shortlist\.selected\[0\],shortlist\.selected\.slice\(1\)/);
 assert.match(app,/renderComparisonPreview\(shortlist\.selected\[0\],alternativesList/);
 assert.match(app,/sb-comparison-preview-card/);
 assert.match(app,/How listeners describe the sound/);
 assert.doesNotMatch(app,/How it may sound different:|No clear tonal direction is established/);
 assert.match(app,/compareElectronic\(baseline,device\)/);
 assert.match(app,/sb-sub-comparison-preview/);
 assert.match(css,/\.sb-comparison-overview/);
 assert.match(css,/\.sb-comparison-preview-card/);
 assert.match(app,/detail\.append\(renderCard\(item,null,true\)\)/);
 assert.doesNotMatch(app,/alternativeSetups\.append|sb-alternative-setups/);
 assert.ok(app.indexOf("const renderComparisonPreview=") <
   app.indexOf("renderComparisonPreview(shortlist.selected[0],shortlist.selected.slice(1)"),
   'One visible card must own the corresponding optional setup details');
});

test('compact alternatives keep one useful line and preserve full technical comparison separately',()=>{
 const a={id:'p',title:'Polk Signature Elite ES15',architecture:'passive_separates',
  ownedAmpName:'Yamaha A-720',speakerModel:'Polk Signature Elite ES15',
  speakerValues:{sensitivity:85,basis:'voltage',sensitivityEnvironment:'anechoic'}};
 const b={id:'q',title:'Q Acoustics 3030i',architecture:'passive_separates',
  ownedAmpName:'Yamaha A-720',speakerModel:'Q Acoustics 3030i',
  speakerValues:{sensitivity:87,basis:'voltage',sensitivityEnvironment:'anechoic'}};
 const small=compactAlternativeComparison(a,b,req,catalog);
 assert.match(small.text,/Keeps the amplifier, changes the speakers/);
 assert.match(small.text,/2 dB higher published sensitivity/);
 assert.ok(small.text.length<125,'Main comparison must fit a short paragraph');
 assert.match(small.detail.tradeoff,/cannot prove/);
});
test('all system categories get a concise comparison without a repeated warning wall',()=>{
 const pairs=[
 [{id:'a',title:'Studio A',architecture:'active_studio'},{id:'b',title:'Studio B',architecture:'active_studio'}],
 [{id:'a',title:'Headphone A',architecture:'headphone_first',kind:'Open-back'},
  {id:'b',title:'Headphone B',architecture:'headphone_first',kind:'Closed-back'}],
 [{id:'a',title:'PA mains',architecture:'party_pa',power:'mains'},
  {id:'b',title:'PA battery',architecture:'party_pa',power:'battery'}],
 [{id:'a',title:'Passive A',architecture:'passive_separates'},
  {id:'b',title:'Powered B',architecture:'consumer_powered_pair'}]
 ];
 for(const [a,b] of pairs){
  const small=compactAlternativeComparison(a,b,req,catalog);
  assert.ok(small.text.length>10&&small.text.length<205,small.text);
  assert.doesNotMatch(small.text,/These are different manufacturers|not standardized comparative clean-output measurements/);
 }
});
