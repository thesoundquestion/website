/**
 * Confidence-first interpretation of listening headroom in Builder cards.
 * No external amp wattage, internal powered wattage, speaker sensitivity,
 * marketing maximum SPL or model category is silently converted to clean SPL.
 */
export function headroomEvidence(item={},request={}) {
  const distance=Number(request.distanceFt);
  const at=Number.isFinite(distance)&&distance>0 ?
    'at about '+Number(distance.toFixed(1))+' ft' :
    'at your listening position';
  const architecture=item.architecture||'';
  const level=request.level==='high'?'occasional loud peaks':
    request.level==='quiet'?'quiet/background playback':'comfortable playback';
  const context='For '+level+' '+at+': ';
  const hasSub=Boolean(item.bassSetup);
  const bass=hasSub ? (item.bassSetup?.label || 'A proposed subwoofer route is described')+
    ' This routing does not establish additional clean maximum SPL.' : '';
  if(architecture==='headphone_first') return {
    status:'headphone_output_unverified',
    text:'Output suitability depends on the headphone sensitivity, source voltage/power, impedance, fit and listening level. Speaker SPL calculations do not apply.',
    detail:'Do not interpret headphone impedance alone as available listening headroom.',
    link:null
  };
  if(architecture==='consumer_powered_pair'||architecture==='active_studio'||architecture==='party_pa') return {
    status:'powered_maximum_spl_unverified',
    text:context+'the exact system’s clean maximum output has not been verified under comparable distance, frequency and distortion conditions.',
    detail:'Built-in amplifier watts and advertised maximum SPL without matching measurement conditions are not a verified seat-level headroom figure.'+(bass?' '+bass:''),
    link:null
  };
  if(architecture==='passive_separates'){
    const fit=item.amplifierFit?.amp;
    const exact=fit?.exact===true&&Number.isFinite(fit?.watts);
    return {
      status:exact?'passive_exact_load_power_only':'passive_output_unverified',
      text:context+(exact ?
        'published continuous amplifier output of '+fit.watts+' W/channel at '+fit.ohms+' Ω is available as one input, but clean peaks at the seat are not yet calculated or verified.' :
        'numerical headroom remains unknown until the required exact-load amplifier output, speaker sensitivity basis, distance and peak target are established.'),
      detail:'System Check can estimate passive-speaker power demand with verified sensitivity, load, distance and musical peaks. A matching rated load is not a speaker safety certificate.'+(bass?' '+bass:''),
      link:'/system-check/'
    };
  }
  return {
    status:'no_comparable_output_evidence',
    text:context+'a clean-output figure is not established for this equipment path.',
    detail:'Verify actual source, load, distance and applicable output measurements before deciding the system is insufficient.',
    link:null
  };
}
