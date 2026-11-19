/**
 * Draft Phase 2: source-preserving, presentation-neutral side-by-side facts.
 * The comparison is NOT an equipment ranking or compatibility assessment.
 * No network calls, price guessing or inferred missing specifications.
 */
const FIELDS = Object.freeze({
  audio_interface: [
    ['micPreampCount','Microphone preamps'],
    ['simultaneousAnalogInputs','Simultaneous analogue inputs'],
    ['computerRecordingInputs','Computer recording channels'],
    ['computerPlaybackOutputs','Computer playback channels'],
    ['hasPhantom48v','48 V phantom power'],
    ['directMonitor','Direct monitoring'],
    ['loopback','Loopback'],
    ['documentedSetupBitDepth','Documented setup bit depth','bits'],
    ['maxBitDepth','Verified maximum bit depth','bits'],
    ['maxRateKhz','Maximum stated sample rate','kHz'],
    ['headphoneOutputPowerRating','Headphone output rating'],
    ['instrumentInputCount','Instrument input channels'],
    ['preampGainRangeDb','Published mic preamp gain range','dB'],
    ['preampEinDbu','Published mic preamp EIN','dBu'],
    ['usbRecordingMode','USB recording mode'],
    ['inputConnections','Documented inputs and connections'],
    ['outputConnections','Documented outputs and connections'],
    ['inputRoutingConstraints','Input and recording routing limits']
  ],
  mixer_recorder: [
    ['advertisedMixerChannels','Advertised mixer channels'],
    ['micPreampCount','Microphone preamps'],
    ['computerRecordingInputs','Computer recording channels'],
    ['computerPlaybackOutputs','Computer playback channels'],
    ['usbRecordingMode','USB recording mode'],
    ['hasPhantom48v','48 V phantom power'],
    ['standaloneRecording','Standalone recording capability'],
    ['standaloneRecordTracks','Standalone recorded tracks'],
    ['standaloneRecorderMaxTracks44And48Khz','Standalone tracks at 44.1/48 kHz'],
    ['standaloneRecorderMaxTracks96Khz','Standalone tracks at 96 kHz'],
    ['usbRecordingRateLimitKhz','USB recording sample-rate limit','kHz'],
    ['inputConnections','Documented inputs and connections'],
    ['outputConnections','Documented outputs and connections'],
    ['inputRoutingConstraints','Input and recording routing limits']
  ],
  headphone: [
    ['nominalImpedanceOhms','Nominal impedance','Ω'],
    ['sensitivityDb','Published sensitivity','dB'],
    ['sensitivityBasis','Sensitivity reference']
  ],
  headphone_amplifier: [
    ['outputImpedanceOhms','Output impedance','Ω'],
    ['outputImpedanceCeilingOhms','Output impedance ceiling','Ω'],
    ['ratedOutputMilliwatts','Published output ratings'],
    ['amplifierKind','Amplifier type or function'],
    ['hasBuiltInDac','Built-in digital-to-analogue converter'],
    ['headphoneOutputCount','Headphone output count'],
    ['gainSettingsDb','Published gain settings','dB'],
    ['outputImpedanceConditions','Output impedance conditions'],
    ['inputConnections','Documented source inputs'],
    ['outputConnections','Documented headphone and line outputs']
  ],
  microphone: [
    ['capsule','Microphone capsule / type'],
    ['pattern','Pickup pattern'],
    ['requires48v','Requires 48 V phantom power'],
    ['powerMethod','Other documented power method'],
    ['sensitivityDbvPa','Published microphone sensitivity','dBV/Pa'],
    ['selfNoiseDba','Published self-noise','dBA'],
    ['maxSplDb','Published maximum SPL','dB'],
    ['maxSplConditions','Maximum SPL test conditions'],
    ['inputConnections','Documented inputs or digital connections'],
    ['outputConnections','Documented microphone outputs']
  ],
  amp: [['speakerPowerRatings','Speaker output ratings']],
  speaker: [
    ['speakerKind','Speaker type'],
    ['powered','Built-in amplification'],
    ['speakerNominalImpedanceOhms','Nominal impedance','Ω'],
    ['speakerSensitivityDb','Published sensitivity','dB'],
    ['speakerSensitivityBasis','Sensitivity reference'],
    ['responseMinus3DbHz','−3 dB frequency range','Hz']
  ],
  source: [
    ['lineOutputVoltageVrms','Analogue line output voltage','V RMS'],
    ['lineOutputImpedanceOhms','Line output impedance','Ω']
  ],
  computer_sound_card: [
    ['playbackDac','Playback DAC'],
    ['recordingAdc','Recording ADC'],
    ['hasDedicatedXlrMicPreamps','Dedicated XLR microphone preamps'],
    ['simultaneousAnalogInputs','Simultaneous analogue inputs'],
    ['computerRecordingInputs','Computer recording channels'],
    ['maxLineInputResolution','Documented line-input capture resolution'],
    ['lineOutputVoltageVrms','Analogue line output voltage','V RMS'],
    ['lineOutputImpedanceOhms','Line output impedance','Ω'],
    ['inputConnections','Documented sound-card inputs'],
    ['outputConnections','Documented sound-card outputs']
  ]
});
const keys = Object.freeze(Object.keys(FIELDS));
const isKnown = x => x !== null && x !== undefined && x !== '' &&
  !(typeof x === 'number' && !Number.isFinite(x)) &&
  !(Array.isArray(x) && x.length===0) &&
  !(typeof x === 'object' && !Array.isArray(x) && Object.keys(x).length===0);
const friendlyKeys=Object.freeze({
  wattsPerChannel:'Power per channel',milliwattsPerChannel:'Headphone power per channel',
  loadOhms:'Load',duration:'Duration',testConditions:'Test conditions',
  outputMode:'Output mode',connection:'Connection',channel:'Channel',
  maxRateKhz:'Maximum sample rate',measurement:'Measurement',
  measuredAt:'Measured at'
});
function renderStructured(value) {
  if(value===null||value===undefined)return 'Not specified';
  if(Array.isArray(value))return value.length?value.map(renderStructured).join(' | '):'Not specified';
  if(typeof value!=='object')return String(value);
  const parts=[];
  for(const [key,raw] of Object.entries(value)) {
    if(raw===null||raw===undefined||raw==='')continue;
    const label=friendlyKeys[key]||key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase());
    const suffix=key==='wattsPerChannel'?' W/channel':
      key==='milliwattsPerChannel'?' mW/channel':
      key==='loadOhms'?' Ω':key==='maxRateKhz'?' kHz':'';
    const valueText=typeof raw==='number'?String(raw)+suffix:renderStructured(raw);
    parts.push(label+': '+valueText);
  }
  return parts.join('; ')||'Not specified';
}
function renderValue(value,unit) {
  if(!isKnown(value)) return null;
  if(typeof value === 'boolean') return value ? 'Yes' : 'No';
  if(typeof value === 'number' || typeof value === 'string')
    return String(value)+(unit?' '+unit:'');
  return renderStructured(value);
}
// Recording and headphone-amp details are source-specific. Preserve evidence
// from the generated catalogue rather than inventing missing measurements.
const PROFILE_CATEGORIES=new Set(['audio_interface','mixer_recorder','microphone',
  'headphone_amplifier','computer_sound_card']);
function connectorLabel(value) {
  return String(value).replace(/_/g,' ')
    .replace(/\b6 35mm\b/gi,'6.35 mm')
    .replace(/\b3 5mm\b/gi,'3.5 mm')
    .replace(/\b4 4mm\b/gi,'4.4 mm')
    .replace(/\b48v\b/gi,'48 V')
    .replace(/\bxlr\b/gi,'XLR').replace(/\btrs\b/gi,'TRS')
    .replace(/\brca\b/gi,'RCA').replace(/\busb\b/gi,'USB')
    .replace(/\bmidi\b/gi,'MIDI').replace(/\bhiz\b/gi,'Hi-Z')
    .replace(/\bspdif\b/gi,'S/PDIF')
    .replace(/\s+/g,' ').trim();
}
function connectionFact(item,key) {
  const direction=key==='inputConnections'?'inputs':'outputs';
  const ports=item?.connections?.[direction]||[];
  const values=[...new Set(ports.map(port=>typeof port?.type==='string'?
    connectorLabel(port.type):'').filter(Boolean))];
  return {value:values.length?values:null,reference:null,
    from:ports.map(port=>port.from).find(Boolean)||null,
    evidenceStatus:values.length?'source_stated':'unverified'};
}
const getFact = (item,key,category) => {
  let fact=item?.facts?.[key];
  if((key==='inputConnections'||key==='outputConnections')&&PROFILE_CATEGORIES.has(category))
    fact=connectionFact(item,key);
  else if(!fact && PROFILE_CATEGORIES.has(category)){
    const profile=item?.profiles?.find(p=>p.category===category && p.specifications &&
      Object.hasOwn(p.specifications,key));
    if(profile){
      const value=profile.specifications[key];
      fact={value,from:profile.from,evidenceStatus:isKnown(value)?'source_stated':'unknown'};
    }
  }
  const value=fact?.value;
  return Object.freeze({
    value:isKnown(value)?value:null,
    display:renderValue(value,null),
    known:isKnown(value),
    basis:fact?.reference||null,
    source:fact?.from||null,
    evidenceStatus:fact?.evidenceStatus||'unverified'
  });
};
export function comparableCategories(left,right) {
  const l=Array.isArray(left?.categories)?left.categories:[];
  const r=Array.isArray(right?.categories)?right.categories:[];
  return keys.filter(category=>l.includes(category)&&r.includes(category));
}
/** Describe only genuinely documented differences, without a quality verdict. */
export function describeEquipmentDifferences(left,right,category) {
  const differences=[];
  const pair=key=>[getFact(left,key),getFact(right,key)];
  if(category==='audio_interface'||category==='mixer_recorder'){
    const [a,b]=pair('micPreampCount');
    if(a.known&&b.known&&Number.isInteger(a.value)&&Number.isInteger(b.value)&&a.value!==b.value)
      differences.push('The documented microphone-preamp counts differ ('+a.value+' versus '+b.value+
        '). This concerns microphone input capacity, not recording quality or the number of USB tracks.');
    const [usbA,usbB]=pair('computerRecordingInputs');
    if(usbA.known&&usbB.known&&Number.isInteger(usbA.value)&&Number.isInteger(usbB.value)&&usbA.value!==usbB.value)
      differences.push('Documented computer capture channels differ ('+usbA.value+' versus '+usbB.value+
        '). Mixer control channels, input sockets and separately recorded USB tracks are different things.');
  }
  if(category==='headphone'){
    const [a,b]=pair('nominalImpedanceOhms');
    if(a.known&&b.known&&typeof a.value==='number'&&typeof b.value==='number'&&a.value!==b.value)
      differences.push('The headphones have different nominal impedances ('+a.value+' Ω versus '+b.value+
        ' Ω). Impedance alone cannot tell us which will play louder or sound better on an amplifier.');
  }
  if(category==='amp')
    differences.push('Published amplifier power figures require matched load, channels driven, test bandwidth and distortion conditions before meaningful ranking.');
  return differences;
}
export function buildEquipmentComparison(left,right,{category}={}) {
  if(!left?.id||!right?.id)throw new TypeError('Two equipment records required');
  const common=comparableCategories(left,right);
  if(category!==undefined&&!common.includes(category))
    throw new RangeError('Selected function is not shared by both models');
  const selected=category||common[0]||null;
  if(!selected) return {
    status:'not_comparable',category:null,
    models:[{id:left.id,model:left.model},{id:right.id,model:right.model}],
    rows:[],notes:['These models do not have a shared documented equipment function.']
  };
  const rows=FIELDS[selected].map(([key,label,unit])=>{
    const a=getFact(left,key,selected),b=getFact(right,key,selected);
    const formatted=x=>({...x,display:x.known?renderValue(x.value,unit):'Not verified'});
    const leftBasis=getFact(left,'sensitivityBasis').value;
    const rightBasis=getFact(right,'sensitivityBasis').value;
    const headphoneBasisMismatch=key==='sensitivityDb' &&
      (!leftBasis||!rightBasis||leftBasis!==rightBasis);
    const speakerBasisLeft=getFact(left,'speakerSensitivityBasis').value ||
      getFact(left,'speakerSensitivityDb').basis;
    const speakerBasisRight=getFact(right,'speakerSensitivityBasis').value ||
      getFact(right,'speakerSensitivityDb').basis;
    const speakerBasisMismatch=key==='speakerSensitivityDb' &&
      (!speakerBasisLeft||!speakerBasisRight||speakerBasisLeft!==speakerBasisRight);
    const conditionalPower=['speakerPowerRatings','ratedOutputMilliwatts','headphoneOutputPowerRating'].includes(key);
    const setupOnly=key==='documentedSetupBitDepth';
    return {key,label,unit:unit||null,left:formatted(a),right:formatted(b),
      directlyComparable:a.known&&b.known&&!headphoneBasisMismatch&&!speakerBasisMismatch &&
        !conditionalPower&&!setupOnly,
      caution:headphoneBasisMismatch?'Sensitivity figures need the same confirmed reference (dB/mW versus dB/V).':
        speakerBasisMismatch?'Speaker sensitivity needs the same confirmed reference (1 W or 2.83 V at the same distance).':
        conditionalPower?'Compare only at the same load, output path and test conditions.':
        setupOnly?'A documented software setup is not necessarily the device’s maximum supported bit depth.':null};
  });
  return {
    status:'facts_only',category:selected,
    models:[{id:left.id,model:left.model},{id:right.id,model:right.model}],
    rows,
    observations:describeEquipmentDifferences(left,right,selected),
    notes:[
      'Published specifications are not sound-quality scores.',
      'Not verified means the catalogue has no confirmed figure, not that the feature is absent.',
      'Matching connectors or impedance figures do not establish a safe or suitable pairing.'
    ]
  };
}
