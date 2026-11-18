import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {
  listeningCatalogOptions,listeningStudioCandidates,describeStudioMonitor
} from '../equipment/builder-catalog-options.mjs';
import {preferVerifiedPriceTier} from '../equipment/price-preference.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(path.join(root,p),'utf8');
const catalog=JSON.parse(read('equipment/catalog.generated.json'));
const prices=JSON.parse(read('equipment/price-tiers.generated.json'));

test('Listening Builder menus come from canonical product records, not separate legacy-only presets',()=>{
  const app=read('system-builder/app.mjs');
  assert.match(app,/loadEquipmentCatalog\(\)/);
  assert.match(app,/listeningCatalogOptions\(sharedCatalog,kind/);
  assert.match(app,/select\.replaceChildren\(\)/);
  assert.match(app,/Canonical equipment catalogue loaded/);
  assert.match(app,/attachSharedInventory\(\)/);
  assert.match(app,/preferVerifiedPriceTier/);
  assert.match(app,/pricePreference/);
  assert.match(app,/owned.*?equipment/i);
  const speakers=listeningCatalogOptions(catalog,'speaker',{prices,region:'CA',preference:'budget'});
  const all=speakers.flatMap(x=>x.items);
  assert.equal(new Set(all.map(x=>x.id)).size,all.length);
  assert.equal(all.length,catalog.records.filter(r=>r.categories.includes('speaker')).length);
  for(const name of ['Yamaha HS5','Yamaha HS7','Yamaha HS8']){
    assert.ok(all.some(x=>x.model===name),name+' missing from Builder choices');
  }
});

test('powered Yamaha HS monitors are separate from passive amp and speaker matching',()=>{
  const groups=listeningCatalogOptions(catalog,'speaker');
  const studio=groups.find(x=>x.id==='studio'),pa=groups.find(x=>x.id==='pa'),passive=groups.find(x=>x.id==='passive');
  assert.ok(studio.items.length>=3);
  assert.ok(pa.items.some(x=>x.model==='QSC K12.2'));
  for(const name of ['Yamaha HS5','Yamaha HS7','Yamaha HS8']){
    const record=studio.items.find(x=>x.model===name);
    assert.ok(record,name);
    assert.ok(!passive.items.some(x=>x.id===record.id),name+' treated as passive');
    const detail=describeStudioMonitor(record);
    assert.equal(detail.cabinetCount,1);
    assert.ok(detail.source.startsWith('https://'));
    assert.ok(detail.inputTypes.some(x=>/xlr/.test(x)));
    assert.ok(detail.cautions.some(x=>x.includes('NOT a passive amplifier speaker output')));
  }
  assert.throws(()=>describeStudioMonitor(passive.items[0]));
});

test('same Yamaha candidates appear in new-system studio discovery, including unpriced entries',()=>{
  for(const choice of ['any','budget','mid_grade','premium_pricing']){
    const options=listeningStudioCandidates(catalog,{prices,region:'CA',preference:choice});
    for(const name of ['Yamaha HS5','Yamaha HS7','Yamaha HS8']){
      assert.ok(options.some(x=>x.model===name),choice+' hid '+name);
    }
    assert.ok(options.every(x=>x.facts.speakerKind.value==='powered_studio_monitor'));
  }
  const app=read('system-builder/app.mjs');
  assert.match(app,/listeningStudioCandidates\(sharedCatalog/);
  assert.match(app,/describeStudioMonitor\(record\)/);
  assert.match(app,/arch==='active_studio'/);
  assert.match(app,/Internal LF\/HF amplifier sections/);
  assert.doesNotMatch(read('system-builder/owned-gear-options.mjs'),/if\(poweredStudio\).*existingPair/);
});

test('regional preference cannot invent price positions or drop unsupported products',()=>{
  const studio=listeningStudioCandidates(catalog);
  const all=preferVerifiedPriceTier(studio,prices,{region:'US',preference:'premium_pricing'});
  assert.deepEqual(all.map(x=>x.id),studio.map(x=>x.id),'US has no verified cohorts, preserve order');
  for(const x of studio)assert.ok(x.id);
});
