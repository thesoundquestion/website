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
 assert.equal(new Set(catalog.records.map(x=>x.id)).size,197);
 assert.equal(Object.keys(baseline.records).length,197);
 assert.equal(report.counts.total,catalog.records.length);
 assert.equal(report.counts.grandfathered+report.counts.certified+report.counts.reviewRequired,catalog.records.length);
 assert.equal(report.records.length,catalog.records.length);
 assert.equal(report.counts.high+report.counts.medium+report.counts.lower,catalog.records.length);
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
 for(const item of report.records){
  if(item.baseline==='unchanged'&&!reviews.approved[item.id])assert.equal(item.certification,'grandfathered_not_certified');
  if(item.certification==='certified')assert.ok(reviews.approved[item.id]);
 }
});
