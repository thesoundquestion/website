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
      ? (near&&intended
          ? 'Likely enough for occasional louder listening nearby, but not intended to fill a large room.'
          : 'Not my choice for dependable loud playback'+context+'; pick a higher-output setup for that job.')
      : far
        ? 'Likely adequate for everyday background music'+context+', but not my choice for loud playback across the room.'
        : intended
          ? 'Yes. A sensible choice for comfortable listening'+context+' in this kind of room.'
          : 'Likely adequate for normal listening'+context+'; room size and placement still matter.';
    return {
      status:'powered_maximum_spl_unverified',
      label:'Loud enough for you?',
      text,
      detail:technical+' The recommendation is based on its intended use, not a tested maximum listening level.'+bass,
      link:null
    };
  }

  if(architecture==='passive_separates'){
    const evidence=item.acousticEvidence;
    // An estimate is only permitted with an explicitly reviewed 1 W/1 m
    // sensitivity, actual same-load continuous amplifier watts, and distance.
    // Free-field attenuation is deliberately used without invented room gain.
    if(evidence && Number.isFinite(feet)&&feet>0 &&
      Number.isFinite(evidence.sensitivityDb1W1m) &&
      Number.isFinite(evidence.continuousWattsPerChannel) &&
      evidence.continuousWattsPerChannel>0 &&
      Number.isFinite(evidence.pairGainDb) &&
      evidence.nominalOhms>0){
      const meters=feet*0.3048;
      const estimatedPeak=evidence.sensitivityDb1W1m+
        10*Math.log10(evidence.continuousWattsPerChannel)+
        evidence.pairGainDb-20*Math.log10(meters);
      // 90 dB brief peaks as comfortable starting point; 95 dB for
      // occasional louder listening. This is NOT a continuous-volume target.
      const target=high?95:level==='quiet'?80:90;
      const margin=estimatedPeak-target;
      const verdict=margin>=5
        ? (high?'Yes. It should have good reserve for occasional loud listening':'Yes. It should play comfortably at your selected distance')
        : margin>=0
          ? (high?'Probably, but reserve for the loudest peaks is limited':'Yes, for typical listening; very loud peaks have less reserve')
          : 'Not confidently at this distance and volume preference. Consider a system with more output';
      return {
        status:margin>=5?'estimated_suitable':margin>=0?'estimated_limited_reserve':'estimated_below_target',
        label:'Loud enough for you?',
        text:verdict+' at '+feet+' ft.',
        estimatedPeakDb:Number(estimatedPeak.toFixed(1)),
        targetPeakDb:target,
        marginDb:Number(margin.toFixed(1)),
        detail:'Estimated peak output at the listening position: roughly '+Math.round(estimatedPeak)+
          ' dB SPL from '+evidence.sensitivityDb1W1m+' dB (1 W/1 m) speaker sensitivity, '+
          evidence.continuousWattsPerChannel+' W/ch published continuous amplifier output, '+
          evidence.pairGainDb+' dB stereo-pair allowance and free-field distance loss. '+
          'Compared with an illustrative '+target+' dB short peak target. '+
          'This is a simplified estimate, not a measurement or clean full-band SPL guarantee; deep bass, room effects, real speaker impedance, compression and master dynamics can reduce usable output.'+bass,
        link:'/system-check/'
      };
    }
    const fit=item.amplifierFit?.amp;
    const exact=fit?.exact===true&&Number.isFinite(fit?.watts);
    return {
      status:exact?'passive_exact_load_power_only':'passive_output_unverified',
      label:'Loud enough for you?',
      text:high?'This model still needs a verified output estimate for louder listening at '+(feet||'your listening')+' ft.'
        :'Likely appropriate for normal home listening'+context+'; exact loudness cannot yet be estimated.',
      detail:(exact?'Published continuous amplifier output: '+fit.watts+' W/channel at '+fit.ohms+' Ω. ':'')+
        'A quantitative comparison needs the speaker sensitivity, a verified same-load continuous rating, distance and a peak target.'+bass,
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
