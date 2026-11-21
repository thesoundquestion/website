#!/usr/bin/env node
/**
 * Equipment certification gate. No network calls, no claims of independent validation.
 * Usage: node scripts/audit-equipment-certification.mjs [--check] [--write-report]
 * Runs against generated catalogue; run build-equipment-catalog.mjs --check first.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const catalog=read('equipment/catalog.generated.json');
const baseline=read('equipment/certification/legacy-baseline.json');
const certifications=read('equipment/certification/reviews.json');
if(baseline.schemaVersion!==1||certifications.schemaVersion!==1)throw Error('Unsupported certification schema');
if(Object.keys(baseline.records).length!==197)throw Error('Expected pinned 197 legacy record IDs');
if(new Set(catalog.records.map(r=>r.id)).size!==catalog.records.length)throw Error('Duplicate equipment IDs');

/** Deterministic 64-bit FNV-1a over UTF-16 code units, split into bytes. */
function fingerprint(record){
  let v=0xcbf29ce484222325n;
  const serialized=JSON.stringify(record);
  for(let i=0;i<serialized.length;i++){
    const n=serialized.charCodeAt(i);
    v^=BigInt(n&255);
    v=BigInt.asUintN(64,v*0x100000001b3n);
    v^=BigInt(n>>>8);
    v=BigInt.asUintN(64,v*0x100000001b3n);
  }
  return v.toString(16).padStart(16,'0');
}
const high=new Set(['amp','speaker','headphone_amplifier']);
const medium=new Set(['audio_interface','microphone','mixer_recorder','headphone','computer_sound_card']);
function risk(r){
 const cs=r.categories||[];
 if(cs.some(c=>high.has(c)))return 'high';
 if(cs.some(c=>medium.has(c)))return 'medium';
 return 'lower';
}
const requiredChecks=['exact_model_variant','source_and_measurement_conditions','connections_and_use','recommendation_safety'];
function certified(id,fp){
 const cert=certifications.approved?.[id];
 return Boolean(cert&&cert.fingerprint===fp&&
   typeof cert.reviewer==='string'&&cert.reviewer.trim().length>=2&&
   /^\d{4}-\d{2}-\d{2}$/.test(cert.reviewedOn||'')&&
   Array.isArray(cert.evidence)&&cert.evidence.some(e=>/^https?:\/\//.test(e.url||'')&&
      typeof e.fields==='string'&&e.fields.trim())&&
   requiredChecks.every(k=>cert.checks?.[k]==='pass')&&
   typeof cert.decisionNote==='string'&&cert.decisionNote.trim().length>=15);
}
const rows=catalog.records.map(r=>{
 const fp=fingerprint(r),old=baseline.records[r.id];
 const changed=old===undefined?'new':old===fp?'unchanged':'modified';
 const cert=certified(r.id,fp);
 const level=risk(r);
 const unknowns=r.review?.unknowns||[];
 const sourceCount=(r.evidence||[]).filter(e=>e.url).length;
 return {
  id:r.id,model:r.model,categories:r.categories,risk:level,
  baseline:changed,certification:cert?'certified':changed==='unchanged'?'grandfathered_not_certified':'review_required',
  recommendationStatus:cert?'certified_for_evaluated_use':changed==='unchanged'?'legacy_existing_behavior_only':'block_new_or_changed_recommendations',
  sourceLinks:sourceCount,declaredUnknowns:Array.isArray(unknowns)?unknowns.length:0,
  fingerprint:fp
 };
}).sort((a,b)=>({high:0,medium:1,lower:2}[a.risk]-{high:0,medium:1,lower:2}[b.risk])||a.id.localeCompare(b.id));
const seen=new Set(rows.map(r=>r.id));
const removed=Object.keys(baseline.records).filter(id=>!seen.has(id));
const unauthorizedRemoval=removed.filter(id=>{
 const x=certifications.approvedRemovals?.[id];
 return !(x&&typeof x.reviewer==='string'&&x.reviewer.trim()&&
   /^\d{4}-\d{2}-\d{2}$/.test(x.reviewedOn||'')&&
   typeof x.reason==='string'&&x.reason.trim().length>=15);
});
const blocked=rows.filter(r=>r.certification==='review_required');
const counts={total:rows.length,baseline: Object.keys(baseline.records).length,
 high:rows.filter(r=>r.risk==='high').length,medium:rows.filter(r=>r.risk==='medium').length,
 lower:rows.filter(r=>r.risk==='lower').length,
 grandfathered:rows.filter(r=>r.certification==='grandfathered_not_certified').length,
 certified:rows.filter(r=>r.certification==='certified').length,
 reviewRequired:blocked.length,removed:removed.length};
const report={schemaVersion:1,note:'Risk classification is automatic triage, not factual verification or proof of safe pairing. Certification is an editorial attestation, not an independent laboratory measurement.',baselineCommit:baseline.baselineCommit,counts,removed,unauthorizedRemoval,records:rows};
console.log(JSON.stringify({counts,blocked:blocked.map(r=>r.id),unauthorizedRemoval},null,2));
if(process.argv.includes('--write-report')){
 const path=resolve(root,'equipment/certification/risk-register.generated.json');
 mkdirSync(dirname(path),{recursive:true});
 writeFileSync(path,JSON.stringify(report,null,2)+'\n');
 console.log('Wrote '+path);
}
if(process.argv.includes('--check')&&(blocked.length||unauthorizedRemoval.length)){
 console.error('Certification gate failed: new or modified records / removals require approved review.');
 process.exitCode=1;
}
