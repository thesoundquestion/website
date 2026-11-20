/** Powered speakers already contain amplification and cannot be used as passive amplifier loads. */
export function isPoweredSpeakerRecord(record) {
  const kind=record?.speakerKind ?? record?.facts?.speakerKind?.value ?? null;
  return record?.powered===true || record?.facts?.powered?.value===true ||
    (typeof kind==='string' && /^powered[_-]/i.test(kind));
}

export function isPoweredSpeakerModel(model,{legacy=[],shared=[],pairs=[]}={}) {
  const name=String(model||'').trim().toLowerCase();
  if(!name)return false;
  if(pairs.some(x=>String(x.model||'').toLowerCase()===name))return true;
  return [...legacy,...shared].some(x=>
    (String(x.model||'').toLowerCase()===name || x.aliases?.some(alias=>alias.toLowerCase()===name)) &&
    isPoweredSpeakerRecord(x));
}

export function availableSpeakersForIntent(entries,intent,metadata={}) {
  return intent==='amp_for_speakers' ? entries.filter(item=>
    !isPoweredSpeakerModel(item.model,{...metadata,shared:[...(metadata.shared||[]),item]})) : entries;
}

export const POWERED_AMP_MESSAGE='Those speakers have amplification built in. You do not need a separate speaker power amplifier. Connect a compatible line-level source or preamp instead; never connect external amplifier speaker terminals to powered speaker line inputs. Choose Build a complete listening system or Improve the system I already have to work with powered speakers.';
