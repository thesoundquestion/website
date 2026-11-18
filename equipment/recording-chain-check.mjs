/**
 * Phase 3 draft: conservative, source-driven recording setup capacity checks.
 * No safety certification, connection adapter advice, predicted latency,
 * audio quality ranking, or guessed routing from connector appearance.
 */
const isNumber=x=>Number.isInteger(x)&&x>=0;
const fact=(device,key)=>device?.facts?.[key]?.value??null;
const find=(catalog,id)=>catalog?.records?.find(x=>x.id===id);
const record=(code,status,summary,detail)=>({code,status,summary,detail});
const captureTypes=new Set(['audio_interface','mixer_recorder']);
const isCapture=d=>d?.categories?.some(c=>captureTypes.has(c));
const isMicrophone=d=>d?.categories?.includes('microphone')===true;

/**
 * Assess only documented recording CAPACITY and prerequisites.
 * Every status is local to one requirement; even "documented_capacity"
 * must never be presented as a guaranteed working setup.
 */
export function assessRecordingChain(catalog,{
  captureDeviceId,microphoneIds=[],independentTracks=false
}={}) {
  if(!Array.isArray(catalog?.records))throw new TypeError('Equipment catalogue required');
  if(typeof captureDeviceId!=='string')throw new TypeError('Capture device ID required');
  if(!Array.isArray(microphoneIds)||microphoneIds.length<1||microphoneIds.length>32||
    microphoneIds.some(x=>typeof x!=='string'))
    throw new TypeError('Provide 1–32 microphone record IDs');
  if(typeof independentTracks!=='boolean')throw new TypeError('independentTracks must be boolean');
  const capture=find(catalog,captureDeviceId);
  if(!isCapture(capture))throw new RangeError('Selected capture device is not an audio interface or mixer/recorder');
  const microphones=microphoneIds.map(id=>{
    const mic=find(catalog,id);
    if(!isMicrophone(mic))throw new RangeError('Not a documented microphone: '+id);
    return mic;
  });
  const checks=[];
  const required=microphones.length;
  const preamps=fact(capture,'micPreampCount');
  if(isNumber(preamps)) {
    checks.push(record('microphone_preamps',preamps>=required?'documented_capacity':'known_limit',
      'Published microphone preamp count: '+preamps+'; requested microphones: '+required+'.',
      'This is only a microphone-preamp count, not USB channel count or proof that every socket is simultaneously usable.'));
  } else checks.push(record('microphone_preamps','unverified',
    'Microphone preamp count not verified for this exact device.',
    'Do not infer preamps from the number of mixer strips or quarter-inch jacks.'));
  const requirePhantom=microphones.filter(m=>fact(m,'requires48v')===true);
  const phantomUnknown=microphones.filter(m=>fact(m,'requires48v')===null);
  const hasPhantom=fact(capture,'hasPhantom48v');
  if(requirePhantom.length){
    const status=hasPhantom===true?'documented_capacity':hasPhantom===false?'known_limit':'unverified';
    checks.push(record('phantom_48v',status,
      requirePhantom.length+' selected microphone(s) state a 48 V phantom power requirement.',
      hasPhantom===true?'The device advertises a 48 V phantom supply. Verify group switching and each microphone’s wiring before enabling it.':
        hasPhantom===false?'The selected recorder has no documented 48 V supply in the current verified facts; use a properly specified solution.':
          'No confirmed device-specific 48 V supply fact is available.'));
  } else checks.push(record('phantom_48v',phantomUnknown.length?'unverified':'not_required',
    phantomUnknown.length?'Phantom requirements are unknown for some selected microphones.':
      'None of the selected microphone profiles states a 48 V requirement.',
    'A dynamic microphone’s lack of a phantom requirement does not authorize applying phantom power to arbitrary ribbon or miswired equipment.'));
  const xlrOutputs=microphones.every(m=>m.connections?.outputs?.some(p=>p.type==='xlr_3pin'));
  const xlrInput=capture.connections?.inputs?.some(p=>p.type.toLowerCase().includes('xlr'));
  checks.push(record('physical_connection',xlrOutputs&&xlrInput?'connector_type_documented':'unverified',
    xlrOutputs&&xlrInput?'XLR microphone output and XLR capture input types are documented.':
      'A complete matching microphone-to-recorder signal route has not been verified.',
    'Plug shape alone does not validate wiring, gain, phantom switching, signal role or safe operation.'));
  const usbInputs=fact(capture,'computerRecordingInputs');
  if(isNumber(usbInputs)){
    checks.push(record('computer_capture_channels',
      usbInputs>=required?'documented_capacity':'known_limit',
      'Published computer capture channels: '+usbInputs+'; requested microphones: '+required+'.',
      'This is the total computer capture channel count and does not guarantee individual microphones can be sent to separate channels.'));
  }else checks.push(record('computer_capture_channels','unverified',
    'Computer capture channel count has not been verified.',
    'Analogue mixer channels are not interchangeable with USB recording channels.'));
  if(independentTracks&&required>1){
    const mode=fact(capture,'usbRecordingMode');
    if(mode==='stereo_mix_only')
      checks.push(record('isolated_tracks','known_limit',
        'This mixer sends a stereo mix to the computer, not separate channels for each microphone.',
        'Two USB capture channels can mean left and right of one stereo mix, not two independently editable microphones.'));
    else if(mode==='multitrack')
      checks.push(record('isolated_tracks','unverified',
        'Multitrack computer capture is documented, but microphone-to-track routing needs confirmation.',
        'Confirm the exact mode, sampling rate, channel assignment and driver configuration.'));
    else checks.push(record('isolated_tracks','unverified',
      'Separate microphone track routing is not independently confirmed.',
      'Even when multiple computer inputs exist, verify the per-input USB routing before relying on independent tracks.'));
  }
  const hardLimit=checks.some(x=>x.status==='known_limit');
  const unknown=checks.some(x=>x.status==='unverified');
  return {
    status:hardLimit?'known_limit':unknown?'needs_verification':'capacity_documented',
    capture:{id:capture.id,model:capture.model},
    microphones:microphones.map(m=>({id:m.id,model:m.model})),
    requirements:{microphoneCount:required,independentTracks},
    checks,
    disclaimer:'This is a capacity and evidence audit, not a guarantee of safe wiring, suitable gain, independent routing, latency or sound quality.'
  };
}
