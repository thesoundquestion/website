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
    ['headphoneOutputPowerRating','Headphone output rating']
  ],
  mixer_recorder: [
    ['advertisedMixerChannels','Advertised mixer channels'],
    ['micPreampCount','Microphone preamps'],
    ['computerRecordingInputs','Computer recording channels'],
    ['computerPlaybackOutputs','Computer playback channels'],
    ['usbRecordingMode','USB recording mode'],
    ['hasPhantom48v','48 V phantom power']
  ],
  headphone: [
    ['nominalImpedanceOhms','Nominal impedance','Ω'],
    ['sensitivityDb','Published sensitivity','dB'],
    ['sensitivityBasis','Sensitivity reference']
  ],
  headphone_amplifier: [
    ['outputImpedanceOhms','Output impedance','Ω'],
    ['outputImpedanceCeilingOhms','Output impedance ceiling','Ω'],
    ['ratedOutputMilliwatts','Published output ratings']
  ],
  microphone: [
    ['requires48v','Requires 48 V phantom power']
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
    ['lineOutputVoltageVrms','Analogue line output voltage','V RMS'],
    ['lineOutputImpedanceOhms','Line output impedance','Ω']
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
const getFact = (item,key) => {
  const fact=item?.facts?.[key];
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
    const a=getFact(left,key),b=getFact(right,key);
    const formatted=x=>({...x,display:x.known?renderValue(x.value,unit):'Not verified'});
    const leftBasis=getFact(left,'sensitivityBasis').value;
    const rightBasis=getFact(right,'sensitivityBasis').value;
    const basisMismatch=key==='sensitivityDb' &&
      (!leftBasis||!rightBasis||leftBasis!==rightBasis);
    return {key,label,unit:unit||null,left:formatted(a),right:formatted(b),
      directlyComparable:a.known&&b.known&&!basisMismatch &&
        // Different load/test conditions are not a single comparable number.
        !['speakerPowerRatings','ratedOutputMilliwatts','headphoneOutputPowerRating'].includes(key),
      caution:basisMismatch?'Sensitivity figures need the same confirmed reference (dB/mW versus dB/V).':
        ['speakerPowerRatings','ratedOutputMilliwatts','headphoneOutputPowerRating'].includes(key)?
          'Compare only at the same load, output path and test conditions.':null};
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
