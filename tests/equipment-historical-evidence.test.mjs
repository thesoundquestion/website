import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const json=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const catalog=json('equipment/catalog.generated.json');
const master=json('equipment/source-master.json');
const historical=json('equipment/certification/historical-evidence-reconciliation.json');
const checked=json('equipment/certification/verified-field-assertions.json');
const checks=new Map();
for(const a of checked.checks){
 if(!checks.has(a.id))checks.set(a.id,[]);
 checks.get(a.id).push(a.path);
}
const overlays=new Set((master.curatedConnections||[]).map(x=>x.equipmentId));

test('historical evidence ledger includes all catalog records without claiming fresh certification',()=>{
 assert.deepEqual(new Set(historical.records.map(x=>x.id)),new Set(catalog.records.map(x=>x.id)));
 assert.equal(historical.records.length,catalog.records.length);
 assert.equal(historical.counts.records,catalog.records.length);
 assert.equal(historical.counts.datedEvidence+historical.counts.undatedEvidence,catalog.records.length);
 for(const x of historical.records){
  assert.ok(!Object.hasOwn(x,'certified'));
  assert.match(x.reviewDisposition,/^historical_evidence/);
 }
});
test('historical source URLs, saved checked dates and model notes are faithfully reconciled',()=>{
 const by=new Map(catalog.records.map(x=>[x.id,x]));
 for(const x of historical.records){
  const r=by.get(x.id);
  assert.deepEqual(x.priorResearch.originProfiles,[...new Set(r.profiles.map(p=>p.from))]);
  assert.deepEqual(x.priorResearch.sourceReferences,r.evidence.map(e=>({
   url:e.url,origin:e.from,checkedDate:e.checkedDate||null,describedFields:e.fields||[]
  })));
  assert.equal(x.priorResearch.datedEvidence,r.evidence.some(e=>Boolean(e.checkedDate)));
  assert.equal(x.priorResearch.historicalNotesPresent,r.profiles.some(p=>Boolean(p.note||p.evidenceNote)));
  assert.equal(x.priorResearch.curatedConnectionOverlay,overlays.has(x.id));
  assert.deepEqual(x.priorResearch.newFieldAssertions,checks.get(x.id)||[]);
 }
});
test('existing dates and source links are evidence provenance, not independent certification',()=>{
 const reviews=json('equipment/certification/reviews.json');
 for(const x of historical.records){
  if(!reviews.approved[x.id]){
   assert.notEqual(x.reviewDisposition,'certified');
  }
 }
});
