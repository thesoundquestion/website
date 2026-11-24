/**
 * Single source of navigation rules for equipment-specific checker links.
 * A URL is offered only when the destination understands its category
 * and exact saved catalogue ID. Unsupported routes have no fake checker.
 */
export const EXPANDED_COMPARE_TYPES=Object.freeze([
  'audio_interface','mixer_recorder','microphone',
  'headphone_amplifier','computer_sound_card'
]);
export function compareCatalogHandoff(record,other=null){
  if(!record?.id||!Array.isArray(record.categories))return null;
  const speakerKind=record.facts?.speakerKind?.value;
  const kind=speakerKind==='powered_studio_monitor'?'powered_studio_monitor':
    speakerKind==='powered_pa_speaker'?'powered_pa_speaker':
    record.categories.includes('headphone')?'catalog_headphone':
    EXPANDED_COMPARE_TYPES.find(type=>record.categories.includes(type));
  if(!kind)return null;
  const q=new URLSearchParams({type:kind,left:record.id});
  if(other?.id&&other.id!==record.id&&(kind.startsWith('powered_')?other.facts?.speakerKind?.value===kind:
      kind==='catalog_headphone'?other.categories?.includes('headphone'):other.categories?.includes(kind)))
    q.set('right',other.id);
  return '/system-check/compare/?'+q.toString();
}

// Only an unambiguous exact catalogue model gets a preselected Compare link.
// A generic category or model-name guess must never open an empty checker.
export function exactRecommendedCompareHandoff(item,catalog) {
  if(!Array.isArray(catalog?.records))return null;
  const described=[item?.model,item?.poweredHeadroomModel,
    item?.title,...(item?.parts||[]).map(part=>part.name)].filter(Boolean);
  const normalized=name=>String(name).toLowerCase().normalize('NFKC')
    .replace(/[^a-z0-9]+/g,' ').trim();
  const fullNames=described.map(normalized);
  const exactCandidates=catalog.records.filter(record=>{
    if(item?.catalogId && item.catalogId===record.id)return true;
    const model=normalized(record.model||'');
    // All component tokens must occur as one complete phrase, preventing
    // lookalike revisions from inheriting each other's sources and ratings.
    return model.length>=5&&fullNames.some(text=>
      text===model||text.startsWith(model+' ')||
      text.endsWith(' '+model)||text.includes(' '+model+' '));
  });
  const eligible=exactCandidates.map(record=>({record,href:compareCatalogHandoff(record)}))
    .filter(entry=>entry.href);
  // A bundled system may contain several catalogued items; only pass the
  // specific powered speaker/headphone when there is a unique candidate.
  return eligible.length===1?eligible[0]:null;
}

