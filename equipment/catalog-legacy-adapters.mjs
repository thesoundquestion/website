/**
 * Compatibility views for older TSQ tools during migration to shared inventory.
 * They return copies to avoid accidental mutation of source facts.
 * No audio calculations, recommendations or electrical compatibility decisions.
 */
const clone=x=>JSON.parse(JSON.stringify(x));
export const CLASSIC_CATEGORIES=Object.freeze(['speaker','amp','source','headphone']);
export function checkerPresetsFromCatalog(catalog) {
 if(!Array.isArray(catalog?.records))throw new TypeError('Invalid shared catalog');
 const result=Object.fromEntries(CLASSIC_CATEGORIES.map(k=>[k,[]]));
 for(const item of catalog.records)for(const profile of item.profiles||[]) {
  if(profile.from!=='system-check/gear.js')continue;
  if(!CLASSIC_CATEGORIES.includes(profile.category))throw new Error('Unsupported legacy category');
  result[profile.category].push({
    model:profile.legacyModel,
    values:clone(profile.values||{}),
    ...(profile.ratings?.length?{ratings:clone(profile.ratings)}:{}),
    ...(profile.note?{note:profile.note}:{}),
    url:item.evidence.find(e=>e.from==='system-check/gear.js')?.url||null
  });
 }
 for(const [kind,rows] of Object.entries(result)){
  rows.sort((a,b)=>a.model.localeCompare(b.model,'en',{sensitivity:'base'}));
  const names=new Set();
  for(const row of rows){
   if(names.has(row.model))throw new Error('Duplicate classic preset: '+kind+' '+row.model);
   names.add(row.model);
  }
 }
 return result;
}
export function compareDetailsFromCatalog(catalog) {
 if(!Array.isArray(catalog?.records))throw new TypeError('Invalid shared catalog');
 const result={speaker:{},source:{},headphone:{}};
 for(const item of catalog.records)for(const profile of item.profiles||[]){
   if(profile.from!=='system-check/gear.js'||!profile.details)continue;
   if(!Object.hasOwn(result,profile.category))continue;
   result[profile.category][profile.legacyModel]=clone(profile.details);
 }
 return result;
}
export function catalogueOptionsForGoal(catalog,goal) {
 if(!Array.isArray(catalog?.records)||typeof goal!=='string')return [];
 return catalog.records.filter(record=>record.goalTags.includes(goal))
   .map(record=>({id:record.id,model:record.model,
     categories:[...record.categories],
     verifiedSources:record.evidence.length,
     missingFields:record.review.unknowns.length,
     // Clear unknown is not a suitability verdict.
     status:'candidate_identity_only'}));
}
