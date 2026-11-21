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
    EXPANDED_COMPARE_TYPES.find(type=>record.categories.includes(type));
  if(!kind)return null;
  const q=new URLSearchParams({type:kind,left:record.id});
  if(other?.id&&other.id!==record.id&&(kind.startsWith('powered_')?other.facts?.speakerKind?.value===kind:other.categories?.includes(kind)))
    q.set('right',other.id);
  return '/system-check/compare/?'+q.toString();
}
