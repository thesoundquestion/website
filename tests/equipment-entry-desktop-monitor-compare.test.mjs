import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildEquipmentComparison} from '../equipment/comparison-model.mjs';

const catalog=JSON.parse(readFileSync(new URL('../equipment/catalog.generated.json',import.meta.url),'utf8'));
const get=model=>catalog.records.find(r=>r.model===model);
const compare=(left,right)=>buildEquipmentComparison(get(left),get(right),{category:'speaker'});
const row=(comparison,key)=>comparison.rows.find(r=>r.key===key);

test('powered desktop monitor comparison shows actual conditions, not passive speaker sensitivity',()=>{
 const result=compare('Edifier MR3','Edifier MR4');
 assert.equal(row(result,'manufacturerMaximumSplDb').left.value,92.5);
 assert.equal(row(result,'manufacturerMaximumSplDb').right.value,null);
 assert.equal(row(result,'manufacturerMaximumSplDb').directlyComparable,false);
 assert.equal(row(result,'speakerFrequencyRangeHz').left.value[0],52);
 assert.equal(row(result,'speakerFrequencyRangeHz').directlyComparable,false);
 assert.equal(row(result,'unitsPerRetailPackage').left.value,2);
 assert.equal(result.rows.some(r=>r.key==='speakerSensitivityDb'),false);
});
test('documented peak test conditions and speaker quantity survive normalization',()=>{
 const result=compare('ADAM Audio D3V','Kali Audio LP-UNF');
 assert.match(row(result,'manufacturerMaximumSplConditions').left.value,/3% THD/);
 assert.match(row(result,'manufacturerMaximumSplConditions').right.value,/0.8 m/);
 assert.equal(row(result,'manufacturerMaximumSplDb').directlyComparable,false);
 assert.equal(row(result,'unitsPerRetailPackage').left.value,2);
 assert.equal(row(result,'internalAmplificationWatts').directlyComparable,false);
});
test('R-S700 has North American continuous ratings and separate IHF burst results',()=>{
 const amp=get('Yamaha R-S700');
 const ratings=amp.profiles.find(p=>p.ratings).ratings;
 assert.ok(ratings.some(x=>x[0]===100&&x[1]===8&&x[2]==='continuous'));
 assert.ok(ratings.some(x=>x[0]===120&&x[1]===6&&x[2]==='continuous'));
 assert.ok(ratings.some(x=>x[0]===290&&x[1]===2&&x[2]==='burst'));
 assert.ok(!ratings.some(x=>x[1]===2&&x[2]==='continuous'));
});
