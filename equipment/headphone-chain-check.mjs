/**
 * Draft headphone-output evidence checker.
 *
 * Reports only documented headphone-output conditions. It deliberately does
 * not extrapolate an amplifier's 32-ohm rating to a 300-ohm headphone, infer
 * loudness from impedance, or certify safety/connector compatibility.
 */
const find=(catalog,id)=>catalog?.records?.find(item=>item.id===id);
const value=(device,key)=>device?.facts?.[key]?.value??null;
const validLoad=x=>typeof x==='number'&&Number.isFinite(x)&&x>0;
const headphoneOutput=device=>device?.connections?.outputs?.some(port=>
  /headphone|6[._]35mm_single_ended|4[._]4mm_balanced|4[._]4mm_compatible_single_ended/.test(port.type)||
  /headphone amplifier output|headphone output/.test(port.scope))===true;
const make=(code,status,summary,explanation)=>({code,status,summary,explanation});
function powerRatings(device) {
  const entries=[];
  const published=value(device,'headphoneOutputPowerRating');
  if(published&&typeof published==='object'&&!Array.isArray(published)){
    if(validLoad(published.loadOhms)&&validLoad(published.milliwattsPerChannel))
      entries.push({
        loadOhms:published.loadOhms,milliwattsPerChannel:published.milliwattsPerChannel,
        testConditions:published.testConditions||'Not specified',
        outputPath:'Headphone output; exact output mode not explicitly given',
        origin:'headphoneOutputPowerRating'
      });
  }
  const rated=value(device,'ratedOutputMilliwatts');
  if(Array.isArray(rated))for(const r of rated){
    const milli=validLoad(r.milliwattsPerChannel)?r.milliwattsPerChannel:
      validLoad(r.wattsPerChannel)?r.wattsPerChannel*1000:null;
    if(validLoad(r.loadOhms)&&validLoad(milli))
      entries.push({
        loadOhms:r.loadOhms,milliwattsPerChannel:milli,
        testConditions:r.testConditions||'Not specified',outputPath:r.outputMode||r.testConditions||'Mode not specified',
        origin:'ratedOutputMilliwatts',
        metric:r.metric||null
      });
  }
  return entries;
}
function headPhoneBalancedCableVerified(headphone) {
  // Only an exact documented balanced headphone-side cable counts.
  return headphone?.connections?.inputs?.some(x=>
    /balanced_headphone_plug_verified/.test(x.type))===true;
}
export function assessHeadphoneChain(catalog,{headphoneId,amplifierId}={}) {
  if(!Array.isArray(catalog?.records))throw new TypeError('Equipment catalogue required');
  const headphone=find(catalog,headphoneId),amp=find(catalog,amplifierId);
  if(!headphone?.categories?.includes('headphone'))throw new RangeError('Selected device is not a documented headphone');
  if(!amp||!headphoneOutput(amp))throw new RangeError('No verified headphone output documented on selected device');
  const checks=[];
  const ohms=value(headphone,'nominalImpedanceOhms');
  const ratings=powerRatings(amp);
  const headphoneBalanced= headPhoneBalancedCableVerified(headphone);
  const matched=validLoad(ohms)?ratings.filter(x=>x.loadOhms===ohms &&
    (!/4[._]4\s*mm\s*balanced|4[._]4mm_balanced/i.test(x.outputPath)||headphoneBalanced)):[];
  if(validLoad(ohms)){
    checks.push(make('rated_load',matched.length?'matching_load_reference':'unverified',
      matched.length?'Published headphone-output power is available at the headphone’s nominal '+ohms+' Ω load.':
        'No published output-power measurement at this headphone’s nominal '+ohms+' Ω load is recorded.',
      matched.length?'Ratings remain path-specific (single-ended versus balanced) and use their own specified test criteria.':
        'Do not extrapolate from an amplifier rating at a different load. Headphone impedance alone does not establish required power or resulting loudness.'));
  }else checks.push(make('rated_load','unverified',
    'Nominal headphone impedance has not been confirmed.',
    'Cannot match output-power test conditions to an unknown load.'));
  const ampOutputTypes=amp.connections.outputs.filter(x=>/headphone|6[._]35mm|4[._]4mm/.test(x.type)&&
    !/line_out|preout|speaker_level/.test(x.type));
  const hpInputTypes=headphone.connections?.inputs?.map(x=>x.type)||[];
  const adapterNotes=headphone.connections?.reviewedAdaptableInputs||[];
  const canUse35=ampOutputTypes.some(x=>/3[._]5mm/.test(x.type))&&hpInputTypes.some(x=>/3[._]5mm/.test(x));
  const canUse635=ampOutputTypes.some(x=>/6[._]35mm_single_ended/.test(x.type))&&
    (hpInputTypes.some(x=>/6[._]35mm/.test(x))||adapterNotes.some(x=>/6[._]35mm/.test(x)));
  const uncertainCable=hpInputTypes.some(x=>/variant_specific/.test(x))||
    (headphone.connections?.descriptions||[]).some(x=>/differs by.*revision|inspect.*cable/i.test(x));
  checks.push(make('connector_evidence',(canUse35||canUse635)&&!uncertainCable?'connector_type_documented':'unverified',
    (canUse35||canUse635)&&!uncertainCable?'A plausible single-ended headphone plug/jack pairing is documented.':
      'An exact single-ended headphone plug/jack path needs confirmation for these selected cables or versions.',
    'A 4.4 mm balanced socket is not a general-purpose adapter for single-ended headphone wiring. Inspect the physical plug and cable.'));
  const ampZ=value(amp,'outputImpedanceOhms'),ceiling=value(amp,'outputImpedanceCeilingOhms');
  if(validLoad(ohms)&&validLoad(ampZ))
    checks.push(make('output_impedance','published_reference',
      'Published amplifier output impedance: '+ampZ+' Ω; headphone nominal impedance: '+ohms+' Ω.',
      'Impedance interaction depends on the headphone’s frequency-dependent load; this comparison is not a guaranteed frequency-response or quality prediction.'));
  else if(validLoad(ohms)&&validLoad(ceiling))
    checks.push(make('output_impedance','published_ceiling_only',
      'Published amplifier output-impedance ceiling: '+ceiling+' Ω (not an exact measured value).',
      'This ceiling cannot be treated as a measured value or used alone to predict the tonal effect.'));
  else checks.push(make('output_impedance','unverified',
    'A matched output-impedance figure has not been verified.',
    'Do not infer damping or frequency response from amplifier brand or quoted maximum power.'));
  const sensitivityBasis=value(headphone,'sensitivityBasis');
  if(sensitivityBasis==='dB_SPL_per_mW'||sensitivityBasis==='dB_SPL_per_V')
    checks.push(make('sensitivity_reference','published_reference',
      'Headphone sensitivity reference: '+(sensitivityBasis==='dB_SPL_per_mW'?'dB SPL per mW':'dB SPL per V')+'.',
      'Sensitivity figures with different references are not directly interchangeable. This tool does not predict actual listening SPL.'));
  else checks.push(make('sensitivity_reference','unverified',
    'Headphone sensitivity measurement reference is unverified.',
    'Cannot safely derive loudness from impedance alone.'));
  return {
    status:matched.length?'some_load_specific_evidence':'no_matched_power_rating',
    headphone:{id:headphone.id,model:headphone.model},
    amplifier:{id:amp.id,model:amp.model},
    powerRatingsAtNominalLoad:matched,
    otherPublishedLoads:ratings.filter(r=>r.loadOhms!==ohms ||
      (/4[._]4\s*mm\s*balanced|4[._]4mm_balanced/i.test(r.outputPath)&&!headphoneBalanced))
      .map(({loadOhms,milliwattsPerChannel,outputPath,testConditions})=>
      ({loadOhms,milliwattsPerChannel,outputPath,testConditions})),
    checks,
    disclaimer:'Published output ratings are condition-specific. This is neither a loudness prediction nor a safe-wiring or suitability certification.'
  };
}
