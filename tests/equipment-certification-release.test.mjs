import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path),'utf8');
const json=path=>JSON.parse(read(path));
const catalog=json('equipment/catalog.generated.json');
const baseline=json('equipment/certification/legacy-baseline.json');
const report=json('equipment/certification/risk-register.generated.json');

test('legacy audit baseline captures every one of the initial 197 unique devices',()=>{
 assert.equal(catalog.records.length,197);
 assert.equal(new Set(catalog.records.map(x=>x.id)).size,197);
 assert.deepEqual(new Set(Object.keys(baseline.records)),new Set(catalog.records.map(x=>x.id)));
 assert.equal(report.counts.total,197);
 assert.equal(report.counts.grandfathered,197);
 assert.equal(report.counts.certified,0);
 assert.equal(report.counts.reviewRequired,0);
 assert.equal(report.records.length,197);
 assert.equal(report.counts.high+report.counts.medium+report.counts.lower,197);
});

test('every local publication and preview route calls the audit gate',()=>{
 for(const path of ['scripts/build-public-site.mjs','scripts/preview-release-candidate.mjs']){
  assert.match(read(path),/scripts\/audit-equipment-certification\.mjs/);
 }
 const workflow=read('.github/workflows/equipment-certification.yml');
 assert.match(workflow,/scripts\/audit-equipment-certification\.mjs --check/);
});

test('no audit approval is implied by the grandfathered records',()=>{
 const reviews=json('equipment/certification/reviews.json');
 assert.deepEqual(reviews.approved,{});
 assert.deepEqual(reviews.approvedRemovals,{});
 for(const item of report.records){
  assert.equal(item.certification,'grandfathered_not_certified');
  assert.equal(item.baseline,'unchanged');
 }
});
