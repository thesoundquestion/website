import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {checkerPresetsFromCatalog,compareDetailsFromCatalog,catalogueOptionsForGoal}
  from '../equipment/catalog-legacy-adapters.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const classic=(path,variable)=>JSON.parse(read(path).split('const '+variable+' = ')[1].replace(/;\s*$/,''));
const original=classic('system-check/gear.js','systemCheckGear');
const supplemental=classic('system-check/compare/specs.js','compareGearDetails');
const catalogue=JSON.parse(read('equipment/catalog.generated.json'));
test('every legacy Checker preset can be recovered with its original measurements',()=>{
 const compatible=checkerPresetsFromCatalog(catalogue);
 for(const kind of ['speaker','amp','source','headphone']){
   const expected=new Map(original[kind].map(r=>[r.model,r]));
   assert.equal(compatible[kind].length,expected.size);
   for(const item of compatible[kind]){
     const old=expected.get(item.model);
     assert.ok(old,'unknown model '+item.model);
     assert.deepEqual(item.values,old.values||{});
     assert.deepEqual(item.ratings||[],old.ratings||[]);
     assert.equal(item.note||'',old.note||'');
     assert.equal(item.url,old.url);
   }
 }
});
test('existing comparison details retain their source-specific wording and ranges',()=>{
 const details=compareDetailsFromCatalog(catalogue);
 for(const kind of ['speaker','source','headphone']){
   assert.deepEqual(Object.keys(details[kind]).sort(),Object.keys(supplemental[kind]).sort());
   for(const [name,source] of Object.entries(supplemental[kind]))
     assert.deepEqual(details[kind][name],source,'lost detail '+name);
 }
});
test('goal candidates are neutral identifiers rather than shopping rankings',()=>{
 const recording=catalogueOptionsForGoal(catalogue,'recording');
 assert.ok(recording.some(x=>x.model==='M-Audio M-Track Solo'));
 assert.ok(recording.some(x=>x.model==='FIFINE K669D'));
 assert.ok(recording.every(x=>x.status==='candidate_identity_only'));
 assert.ok(recording.every(x=>!('compatibility' in x)&&!('rank' in x)));
 const monitors=catalogueOptionsForGoal(catalogue,'studio_monitoring');
 assert.ok(monitors.some(x=>x.model==='Yamaha HS5'));
 assert.ok(monitors.some(x=>x.model==='JBL 305P MkII'));
 const pa=catalogueOptionsForGoal(catalogue,'live_sound');
 assert.ok(pa.some(x=>x.model==='QSC K12.2'));
 assert.ok(pa.some(x=>x.model==='Electro-Voice ZLX-12P-G2'));
});
