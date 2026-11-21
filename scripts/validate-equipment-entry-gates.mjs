#!/usr/bin/env node
/**
 * Prospective TSQ model/recommendation admission gate.
 * This does not pretend to re-certify legacy entries. A locked fingerprint
 * baseline captures the already-published/preview inventory at adoption.
 * Every new or edited normalized device and every NEW curated system requires
 * an explicit, source-specific ledger attestation BEFORE CI will pass.
 *
 * Usage: node scripts/validate-equipment-entry-gates.mjs
 *        node scripts/validate-equipment-entry-gates.mjs --pending
 * Never rewrite the baseline to conceal an edit. Revalidate and update ledger.
 */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {EXAMPLES} from '../system-builder/recommendations.mjs';
import {STEREO_SUB_EXAMPLES} from '../system-builder/stereo-subwoofer-examples.mjs';
import {BUDGET_EXAMPLES} from '../system-builder/budget-examples.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const baseline=read('equipment/entry-gate-baseline.json');
const ledger=read('equipment/entry-review-ledger.json');
const catalog=read('equipment/catalog.generated.json');
const checklist=['identity','manufacturerSpecs','signalRoles','loadsAndSafety',
  'acousticHeadroom','regionalPricing','soundClaims','accessoriesAndSubRouting',
  'outputAndRegression'];
const validResult=new Set(['verified','not_applicable','unknown']);
const date=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&
  !Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
export function catalogFingerprint(record) {
  // Stable in JSON's existing, deterministic property order; intentionally
  // not a security digest. Flags data changes for re-attestation.
  const s=JSON.stringify(record);
  let h=2166136261;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}
  return (h>>>0).toString(16).padStart(8,'0');
}
function reviewErrors(kind,id,entry,fingerprint,model){
  const errs=[];
  const tag=kind+':'+id;
  if(!entry||typeof entry!=='object')return [tag+' requires an entry-review-ledger attestation'];
  if(entry.fingerprint!==fingerprint)errs.push(tag+' fingerprint is stale or missing; review the current revision');
  if(entry.model!==model)errs.push(tag+' exact model/revision name mismatch');
  if(!date(entry.reviewedOn)||entry.reviewedOn<'2026-11-21')
    errs.push(tag+' requires an actual ISO review date, not a pre-adoption placeholder');
  if(!Array.isArray(entry.evidence)||!entry.evidence.length||
    !entry.evidence.some(x=>x.type==='manufacturer'&&/^https:\/\//.test(x.url||'')))
    errs.push(tag+' requires an exact-model HTTPS manufacturer/manual source');
  for(const e of entry.evidence||[]){
    if(!/^https:\/\//.test(e?.url||'')||!['manufacturer','independent','owner','retailer'].includes(e.type)||
      typeof e.claims!=='string'||e.claims.trim().length<12)
      errs.push(tag+' evidence needs a valid URL, evidence type, and source-to-claim description');
  }
  if(!entry.checks||typeof entry.checks!=='object')errs.push(tag+' missing review checklist');
  for(const key of checklist){
    const value=entry.checks?.[key];
    if(!validResult.has(value))errs.push(tag+' checklist '+key+' must be verified/not_applicable/unknown');
  }
  if(!Array.isArray(entry.unknowns))errs.push(tag+' requires explicit unknowns array (empty if none)');
  if(checklist.some(k=>entry.checks?.[k]==='unknown')&&!entry.unknowns?.length)
    errs.push(tag+' has unknown checklist outcomes but no documented unknowns');
  if(typeof entry.releaseDecision!=='string'||
    !['accepted_with_unknowns','accepted_verified','research_only'].includes(entry.releaseDecision))
    errs.push(tag+' requires an explicit releaseDecision');
  if(entry.releaseDecision==='accepted_verified'&&
      checklist.some(k=>entry.checks?.[k]==='unknown'))
    errs.push(tag+' cannot claim verified status with unresolved checks');
  if(kind==='example'&&(!Array.isArray(entry.testedScenarios)||!entry.testedScenarios.length))
    errs.push(tag+' must name at least one executable scenario test');
  return errs;
}
export function inspectEquipmentEntryGates({baseline:base,ledger:reviews,catalog:registry,examples}){
  const errors=[],pending=[];
  if(base.schemaVersion!==1||reviews.schemaVersion!==1)
    errors.push('Unsupported admission baseline/ledger schema');
  if(Object.keys(base.recordFingerprints||{}).length!==197||base.exampleIds?.length!==22||
    catalogFingerprint({recordFingerprints:base.recordFingerprints,exampleIds:base.exampleIds})!=='17e23076')
    errors.push('Locked pre-adoption baseline was changed; do not regenerate to silence reviews');
  const byId=new Map();
  for(const entry of registry.records||[]){
    if(!entry.id||byId.has(entry.id))errors.push('Duplicate or missing catalog ID '+entry.id);
    byId.set(entry.id,entry);
    const fp=catalogFingerprint(entry);
    if(base.recordFingerprints[entry.id]===fp)continue;
    pending.push({kind:'record',id:entry.id,model:entry.model,fingerprint:fp,
      reason:base.recordFingerprints[entry.id]?'changed':'new'});
    errors.push(...reviewErrors('record',entry.id,reviews.records?.[entry.id],fp,entry.model));
  }
  for(const id of Object.keys(base.recordFingerprints||{}))
    if(!byId.has(id))errors.push('Historic device disappeared: '+id+' (requires deliberate migration review)');
  const seen=new Set();
  for(const item of examples){
    if(!item.id||seen.has(item.id))errors.push('Duplicate or missing curated example ID '+item.id);
    seen.add(item.id);
    if(base.exampleIds.includes(item.id))continue;
    // New examples must receive the same manual sign-off as a device.
    const fp=catalogFingerprint(item);
    pending.push({kind:'example',id:item.id,model:item.title,fingerprint:fp,reason:'new'});
    errors.push(...reviewErrors('example',item.id,reviews.examples?.[item.id],fp,item.title));
  }
  for(const id of base.exampleIds)
    if(!seen.has(id))errors.push('Existing curated example removed: '+id+' (record an intentional migration)');
  return {errors,pending,checked:{records:byId.size,examples:seen.size},checklist};
}
const report=inspectEquipmentEntryGates({baseline,ledger,catalog,
  examples:[...EXAMPLES,...STEREO_SUB_EXAMPLES]});
if(process.argv.includes('--pending')){
  console.log(JSON.stringify(report,null,2));
}else if(report.errors.length){
  for(const message of report.errors)console.error('ENTRY_GATE_FAIL '+message);
  console.error('Use --pending and docs/EQUIPMENT_ENTRY_VALIDATION_HANDOFF.md to review each change.');
  process.exitCode=1;
}else{
  console.log('ENTRY_GATE_OK records='+report.checked.records+
    ' curatedExamples='+report.checked.examples+' pending='+report.pending.length);
}
