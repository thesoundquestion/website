import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EXAMPLES} from '../system-builder/recommendations.mjs';
import {STEREO_SUB_EXAMPLES} from '../system-builder/stereo-subwoofer-examples.mjs';
import {catalogFingerprint,inspectEquipmentEntryGates}
 from '../scripts/validate-equipment-entry-gates.mjs';

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const baseline=read('../equipment/entry-gate-baseline.json');
const registry=read('../equipment/catalog.generated.json');
const ledger=read('../equipment/entry-review-ledger.json');
const examples=[...EXAMPLES,...STEREO_SUB_EXAMPLES];
const inspect=(catalog=registry,review=ledger,curated=examples)=>inspectEquipmentEntryGates({
  baseline,ledger:review,catalog,examples:curated
});
const attest=(kind,id,model,fingerprint,releaseDecision='accepted_verified')=>({
  fingerprint,model,reviewedOn:'2026-11-21',releaseDecision,
  evidence:[{type:'manufacturer',url:'https://manufacturer.example/exact-model-manual',
    claims:'Exact revision and its stated specifications checked against manual'}],
  checks:Object.fromEntries([
    'identity','manufacturerSpecs','signalRoles','loadsAndSafety','acousticHeadroom',
    'regionalPricing','soundClaims','accessoriesAndSubRouting','outputAndRegression'
  ].map(k=>[k,'verified'])),
  unknowns:[],...(kind==='example'?{testedScenarios:['tests/example-direct-input.test.mjs']}: {})
});

test('frozen adoption baseline passes exactly against the reviewed draft data',()=>{
 const x=inspect();
 assert.deepEqual(x.errors,[]);
 assert.deepEqual(x.pending,[]);
 assert.deepEqual(x.checked,{records:197,examples:22});
 assert.equal(Object.keys(baseline.recordFingerprints).length,197);
 assert.equal(baseline.exampleIds.length,22);
});
test('new model is blocked until exact-source reviewed and tagged in persistent ledger',()=>{
 const entry={...registry.records[0],id:'test/speaker/new-variant',model:'New Test Model v2'};
 const changed={...registry,records:[...registry.records,entry]};
 let r=inspect(changed);
 assert.ok(r.errors.some(e=>e.includes('test/speaker/new-variant')&&e.includes('attestation')));
 assert.equal(r.pending.at(-1).reason,'new');
 const good=structuredClone(ledger);
 good.records[entry.id]=attest('record',entry.id,entry.model,catalogFingerprint(entry));
 r=inspect(changed,good);
 assert.deepEqual(r.errors,[]);
});
test('changing an existing spec invalidates its previous fingerprint',()=>{
 const copy=structuredClone(registry);
 copy.records[0].model+=' altered';
 let r=inspect(copy);
 assert.ok(r.pending.some(x=>x.reason==='changed'));
 assert.ok(r.errors.some(x=>x.includes('attestation')));
 const good=structuredClone(ledger);
 const row=copy.records[0];
 good.records[row.id]=attest('record',row.id,row.model,catalogFingerprint(row));
 assert.deepEqual(inspect(copy,good).errors,[]);
 good.records[row.id].fingerprint='obsolete';
 assert.ok(inspect(copy,good).errors.some(x=>x.includes('fingerprint is stale')));
});
test('new curated recommendations require a tested scenario, not an unreviewed promotional paragraph',()=>{
 const added={...examples[0],id:'test-system-v2',title:'Test system with new revision'};
 let r=inspect(registry,ledger,[...examples,added]);
 assert.ok(r.errors.some(x=>x.includes('example:test-system-v2')));
 const good=structuredClone(ledger);
 good.examples[added.id]=attest('example',added.id,added.title,catalogFingerprint(added));
 assert.deepEqual(inspect(registry,good,[...examples,added]).errors,[]);
 delete good.examples[added.id].testedScenarios;
 assert.ok(inspect(registry,good,[...examples,added]).errors.some(x=>x.includes('executable scenario')));
});
test('missing source provenance or hidden unknowns never earns admission',()=>{
 const copy=structuredClone(registry);
 const row=copy.records[0];
 row.model+=' corrected';
 const reviewed=structuredClone(ledger);
 const entry=attest('record',row.id,row.model,catalogFingerprint(row));
 entry.evidence=[];
 entry.checks.acousticHeadroom='unknown';
 reviewed.records[row.id]=entry;
 const r=inspect(copy,reviewed);
 assert.ok(r.errors.some(x=>x.includes('manufacturer/manual source')));
 assert.ok(r.errors.some(x=>x.includes('unknown checklist outcomes')));
 assert.ok(r.errors.some(x=>x.includes('cannot claim verified status')));
});

test('baseline hashes cannot be refreshed en masse to conceal changed specifications',()=>{
 const touched=structuredClone(baseline);
 touched.recordFingerprints[registry.records[0].id]='00000000';
 const r=inspectEquipmentEntryGates({baseline:touched,ledger,catalog:registry,examples});
 assert.ok(r.errors.some(x=>/Locked pre-adoption baseline was changed/.test(x)));
});
