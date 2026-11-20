import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tonalComparison} from '../system-builder/tonal-impressions.mjs';
import {soundProfileFor} from '../system-builder/sound-profiles.mjs';
const item=(model,type='passive_separates')=>({id:'fixture-'+model,architecture:type,
  speakerModel:type==='headphone_first'?undefined:model,
  title:model});
test('direct speaker alternative compares reported smooth/warm versus lively/spacious with sources',()=>{
 const c=tonalComparison(item('PSB Alpha P5'),item('Triangle Borea BR03 (passive)'));
 assert.ok(c);
 assert.match(c.heading,/How the sound may differ/);
 assert.match(c.text,/PSB Alpha P5.*smooth.*warm/);
 assert.match(c.text,/Triangle Borea BR03.*lively.*spacious/);
 assert.match(c.text,/plausible differences to listen for/);
 assert.ok(c.sources.length>=2);
 assert.ok(c.sources.every(s=>s.url.startsWith('https://')));
});
test('owner reports stay mixed for Q Acoustics 3030i versus 3020i',()=>{
 const c=tonalComparison(item('Q Acoustics 3020i'),item('Q Acoustics 3030i'));
 assert.ok(c);
 assert.match(c.text,/bass.*punch|punch.*bass/);
 assert.match(c.text,/easy-going|easy listening/);
 assert.ok(c.sources.some(s=>/reddit/.test(s.url)));
});
test('documented headphone alternatives include sourced broad tonal contrasts',()=>{
 const b={id:'hp-hd600',architecture:'headphone_first',title:'Sennheiser HD 600'};
 const a={id:'hp-ft1',architecture:'headphone_first',title:'FiiO FT1'};
 const c=tonalComparison(b,a);
 assert.ok(c);
 assert.match(c.text,/smooth natural vocals/);
 assert.match(c.text,/warm, bass-rich closed-back/);
 assert.ok(c.sources.some(s=>/rtings/.test(s.url)));
});
test('a direct HD 560S / HD 600 comparison describes possible vocal and bass differences',()=>{
 const c=tonalComparison({title:'Sennheiser HD 560S',architecture:'headphone_first'},
  {title:'Sennheiser HD 600',architecture:'headphone_first'});
 assert.match(c.text,/analytical/);
 assert.match(c.text,/natural vocals/);
 assert.match(c.text,/not a direct level-matched comparison/);
});
test('same speaker and different amplifiers does not fabricate a tonal contrast',()=>{
 const a={...item('PSB Alpha P5'),amplifierModel:'Yamaha A-S301'};
 const b={...item('PSB Alpha P5'),amplifierModel:'Sony STR-DH190'};
 assert.equal(tonalComparison(a,b),null);
});
test('unknown or manufacturer-only descriptions do not turn into listener consensus',()=>{
 const a=item('Hypothetical loudspeaker unknown');
 const b=item('Cerwin-Vega XLS-215');
 assert.equal(tonalComparison(a,b),null);
 assert.equal(tonalComparison(a,item('Also unknown')),null);
});
test('single known alternative offers real model-specific impressions without assuming baseline tone',()=>{
 const c=tonalComparison(item('Hypothetical loudspeaker unknown'),item('DALI Oberon 1'));
 assert.ok(c);
 assert.match(c.heading,/What listeners report/);
 assert.match(c.text,/expressive voices/);
 assert.doesNotMatch(c.text,/compared with.*better/i);
});
test('sourced headphone profiles have independent review URLs and preserve mixed judgment',()=>{
 for(const model of ['FiiO FT1','AKG K371','Grado SR80x','Grado SR60x',
   'Koss KSC75','Koss Porta Pro (wired)','Audio-Technica ATH-M50x',
   'Sennheiser HD 560S','Sennheiser HD 600']){
  const p=soundProfileFor({title:model});
  assert.match(p.type,/independent/i);
  assert.ok(p.url.startsWith('https://'));
 }
 assert.match(soundProfileFor({title:'FiiO FT1'}).text,/Listeners differ.*obscures/);
 assert.match(soundProfileFor({title:'Grado SR80x'}).text,/Other reviewers/);
});
test('subjective tonal notes are on the main comparison cards, not behind dropdowns',()=>{
 const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 const css=readFileSync(new URL('../system-builder/style.css',import.meta.url),'utf8');
 const from=app.indexOf('const renderComparisonPreview=');
 const render=app.slice(from,app.indexOf("const alternativeSetups=el('details'",from));
 assert.ok(from>0);
 assert.match(render,/tonalComparison\(baseline,item\)/);
 assert.match(render,/sb-tonal-comparison/);
 assert.match(render,/link\(links,source.url,source.label\)/);
 assert.match(app,/tonalComparison\(shortlist.selected\[0\],item\)/);
 assert.match(css,/\.sb-tonal-comparison/);
});

test('builder-specific headphone category title prefixes still resolve exact model sound impressions',()=>{
  const a={architecture:'headphone_first',title:'Open-backed / open-air: Koss KSC75'};
  const b={architecture:'headphone_first',title:'Closed-back: FiiO FT1'};
  const c=tonalComparison(a,b);
  assert.ok(c);
  assert.match(c.text,/Koss KSC75.*open, clear/);
  assert.match(c.text,/FiiO FT1.*warm, bass-rich/);
});
