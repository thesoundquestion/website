/**
 * Beginner-facing loudness guidance. A stated use-case is editorial guidance,
 * NOT an SPL measurement, a clean-output guarantee, or a safety certificate.
 * Technical evidence stays in the collapsed card detail.
 */
export function headroomEvidence(item={},request={}) {
  const distance=Number(request.distanceFt);
  const feet=Number.isFinite(distance)&&distance>0?Number(distance.toFixed(1)):null;
  const near=feet!==null&&feet<=8;
  const far=feet!==null&&feet>12;
  const level=request.level||'moderate';
  const high=level==='high';
  const architecture=item.architecture||'';
  const places=Array.isArray(item.places)?item.places:[];
  const scene=String(request.useCase||'');
  const inIntendedSetting=places.includes(scene);
  const hasSub=Boolean(item.bassSetup);
  const bass=hasSub
    ? ' This system includes a described subwoofer route, but more bass does not automatically mean more maximum volume.'
    : '';
  const context=feet!==null?' at '+feet+' ft':'';
  const technical='Exact clean volume at your seat is not measured here. Published amplifier watts, marketing maximum SPL, and speaker size cannot by themselves establish it.';

  if(architecture==='headphone_first')return {
    status:'headphone_output_unverified',
    label:'Will they get loud enough?',
    text:'Usually practical for personal listening with a suitable headphone output; check your source.',
    detail:'Headphone volume depends on the actual source output, sensitivity, impedance and fit. Speaker SPL calculations do not apply.',
    link:null
  };

  if(['consumer_powered_pair','active_studio','party_pa'].includes(architecture)){
    if(architecture==='party_pa')return {
      status:'powered_maximum_spl_unverified',
      label:'Will it get loud enough?',
      text:'Built for louder gatherings, but audience size and coverage still matter.',
      detail:technical+' A single party cabinet is not necessarily a stereo pair. '+(item.tradeoff||'')+bass,
      link:null
    };
    const intended=inIntendedSetting || (!places.length&&near);
    const text=high
      ? (near&&intended?'Worth considering for louder listening nearby; maximum clean volume still needs checking.'
        :'For louder listening'+context+', check this model’s output before relying on it.')
      : far
        ? 'Could work for everyday listening'+context+', but room coverage needs checking.'
        : intended
          ? 'A reasonable option for comfortable listening'+context+' in this kind of space.'
          : 'Worth considering for normal listening'+context+'; check that it suits your room.';
    return {
      status:'powered_maximum_spl_unverified',
      label:'Loud enough for you?',
      text,
      detail:technical+' The recommendation is based on its intended use, not a tested maximum listening level.'+bass,
      link:null
    };
  }

  if(architecture==='passive_separates'){
    const fit=item.amplifierFit?.amp;
    const exact=fit?.exact===true&&Number.isFinite(fit?.watts);
    const highText=high?'Louder peaks depend on the exact speaker-and-amp pairing.'
      :'A reasonable starting point for everyday home listening; actual volume depends on the pairing.';
    return {
      status:exact?'passive_exact_load_power_only':'passive_output_unverified',
      label:'Loud enough for you?',
      text:highText,
      detail:(exact?'Published continuous amplifier output: '+fit.watts+' W/channel at '+fit.ohms+' Ω. ':'')+
        'This is not a seat-level SPL result. To estimate loudness, System Check needs the speaker sensitivity, matching amplifier rating, distance and target peaks.'+bass,
      link:'/system-check/'
    };
  }
  return {
    status:'no_comparable_output_evidence',
    label:'Loud enough for you?',
    text:'Its usable volume depends on your room and the equipment connected to it.',
    detail:technical,
    link:null
  };
}
