/**
 * Purpose-specific System Builder plans. These are educational signal paths,
 * not product recommendations, shopping scores or a wiring safety certificate.
 *
 * Existing listening-system algorithms remain unchanged in app.mjs.
 */
import {assessRecordingChain} from '../equipment/recording-chain-check.mjs';
import {assessHeadphoneChain} from '../equipment/headphone-chain-check.mjs';

export const CHAIN_MODES=Object.freeze([
  {id:'listening',label:'Hi-fi / home listening',description:'Existing detailed speaker, amplifier, room and headphone system builder.'},
  {id:'tv',label:'TV, movies and gaming',description:'Plan a TV sound path and examine the missing connection details.'},
  {id:'headphones',label:'Headphones and headphone amplifiers',description:'Examine actual headphone-output evidence and published load ratings.'},
  {id:'vocal',label:'Record a voice / vocals',description:'Microphone, capture device, recording software and monitoring.'},
  {id:'songwriter',label:'Record my own songs',description:'Voice and instrument paths, simultaneous inputs and separate tracks.'},
  {id:'drums',label:'Record drums',description:'Capture a whole kit or plan the microphone/input count for multitracking.'},
  {id:'band',label:'Record a band',description:'Check simultaneous sources and independent recording tracks.'},
  {id:'podcast',label:'Podcast or interview',description:'Multiple microphones, separate voices and guest monitoring.'},
  {id:'stream',label:'Stream or create video',description:'Microphone input, computer sound, return audio and headphones.'},
  {id:'live',label:'Live sound / PA',description:'Microphones, mixers, audience speakers and monitor-feed requirements.'}
]);
export const CHAIN_MODE_IDS=new Set(CHAIN_MODES.map(x=>x.id));

const find=(catalog,id)=>catalog?.records?.find(r=>r.id===id)||null;
const value=(record,key)=>record?.facts?.[key]?.value??null;
const stage=(name,device,reason)=>({name,device:device?.model||'Choose a suitable device',reason});
const observation=(status,text)=>({status,text});
const captureKinds=['audio_interface','mixer_recorder'];
const micCheckMode=new Set(['vocal','songwriter','drums','band','podcast','stream']);
const asCount=x=>Number.isInteger(x)&&x>=1&&x<=32?x:1;

export function buildGoalChain(catalog,{
  mode='vocal',microphoneId='',captureId='',headphoneId='',headphoneOutputId='',
  paSpeakerId='',speakerId='',microphoneCount=1,independentTracks=false
}={}){
  if(!Array.isArray(catalog?.records))throw new TypeError('Shared equipment catalogue required');
  if(!CHAIN_MODE_IDS.has(mode)||mode==='listening')throw new RangeError('Unsupported specialist builder goal');
  const microphone=find(catalog,microphoneId);
  const capture=find(catalog,captureId);
  const headphone=find(catalog,headphoneId);
  const output=find(catalog,headphoneOutputId);
  const pa=find(catalog,paSpeakerId);
  const speaker=find(catalog,speakerId);
  const count=asCount(microphoneCount);
  const stages=[],checks=[],notes=[],lessons=[];
  if(mode==='tv'){
    stages.push(stage('TV or media player',null,'Identify an audio output the TV actually provides and how volume is controlled.'));
    stages.push(stage('Speakers / receiver',speaker,'A soundbar, powered speakers or an amplifier with passive speakers can work; the catalogue does not verify the TV connection.'));
    checks.push(observation('needs_check','Confirm HDMI ARC/eARC, optical or analogue output compatibility with your actual TV and audio system.'));
    checks.push(observation('needs_check','For gaming and dialogue, check sound formats, lip-sync delay and convenient volume control.'));
    lessons.push('/decoder/playback-sources/','/decoder/speaker-types/','/system-check/');
  }else if(mode==='headphones'){
    stages.push(stage('Headphones',headphone,'Consider fit, isolation, nominal load and the type of cable actually supplied.'));
    stages.push(stage('Headphone output',output,'A physical socket and a power rating at some impedance do not prove suitability.'));
    if(headphone&&output){
      try{
        const audit=assessHeadphoneChain(catalog,{headphoneId:headphone.id,amplifierId:output.id});
        for(const item of audit.checks)checks.push(observation(item.status,item.summary+' '+item.explanation));
        for(const rating of audit.powerRatingsAtNominalLoad)notes.push('Published rating at the stated '+rating.loadOhms+' Ω load: '+rating.milliwattsPerChannel+' mW/channel; output mode: '+rating.outputPath+'. Not a loudness promise.');
        if(!audit.powerRatingsAtNominalLoad.length)notes.push('No power rating is documented at this headphone’s exact nominal impedance and output path.');
      }catch{checks.push(observation('needs_check','No independently confirmed headphone-output route for this pairing.'))}
    }else checks.push(observation('needs_check','Select actual headphones and an output device to inspect load-specific evidence.'));
    lessons.push('/decoder/headphone-types/','/decoder/headphone-output-impedance/');
  }else if(mode==='live'){
    stages.push(stage('Microphones / instrument feeds',microphone,'Count the actual sound sources that need stage amplification.'));
    stages.push(stage('Mixer / live input device',capture,'Need enough suitable preamps, input channels and main outputs.'));
    stages.push(stage('Audience PA speakers',pa,'Powered PA speakers need suitable line-level inputs and mains supply; passive speakers need an appropriate amplifier.'));
    stages.push(stage('Performer monitoring',null,'If performers need a different mix, verify mixer auxiliary sends and compatible monitor equipment.'));
    if(capture&&microphone){
      const preamps=value(capture,'micPreampCount');
      if(Number.isInteger(preamps))checks.push(observation(preamps>=count?'evidence':'known_limit','Published microphone preamps: '+preamps+'; requested microphones: '+count+'. This does not confirm cabling, gain or source assignments.'));
      else checks.push(observation('needs_check','Mixer preamp count is not verified.'));
      if(value(microphone,'requires48v')===true)checks.push(observation(value(capture,'hasPhantom48v')===true?'evidence':'needs_check','This microphone requires 48 V phantom power; verify exactly how the chosen mixer provides it.'));
    }else checks.push(observation('needs_check','Choose microphones and a mixer to check documented input capacity.'));
    if(pa?.facts?.speakerKind?.value==='powered_pa_speaker')checks.push(observation('evidence','The selected speaker is documented as a powered PA speaker, but its signal connection, venue coverage and safe setup are NOT verified.'));
    else checks.push(observation('needs_check','Choose a documented powered PA speaker; no passive-speaker/amp electrical pairing is inferred.'));
    checks.push(observation('needs_check','Check audience coverage, output cabling, monitor mixes, power distribution and feedback management in the actual venue.'));
    lessons.push('/decoder/audio-interfaces-mixers/','/decoder/speaker-types/','/decoder/microphone-types/');
  }else if(micCheckMode.has(mode)){
    stages.push(stage('Microphone(s)',microphone,'Choose microphone type and placement for the actual performers and recording environment.'));
    stages.push(stage('Interface, mixer or recorder',capture,'Verify microphone preamps, USB recording channels and whether the device records independent tracks.'));
    stages.push(stage('Recording computer / recorder',null,'Check compatible drivers, software, monitoring and the desired capture format.'));
    stages.push(stage('Headphones / monitoring',headphone,'Monitor the performance without speaker spill; confirm the real headphone output and cable.'));
    if(microphone&&capture&&microphone.categories?.includes('microphone')&&capture.categories?.some(c=>captureKinds.includes(c))){
      const audit=assessRecordingChain(catalog,{
        captureDeviceId:capture.id,microphoneIds:Array.from({length:count},()=>microphone.id),
        independentTracks:Boolean(independentTracks)
      });
      for(const item of audit.checks)checks.push(observation(item.status,item.summary+' '+item.detail));
      notes.push('Overall capacity status: '+audit.status.replaceAll('_',' ')+'. This is not a working-connection certification.');
    }else checks.push(observation('needs_check','Select a documented microphone and capture device to check their published capacities. A direct USB microphone may not need a separate interface.'));
    if(mode==='songwriter')notes.push('Recording one part at a time can use fewer simultaneous inputs; voice and instrument captured together onto separate tracks need independent capture paths.');
    if(mode==='drums')notes.push('Electronic drum modules may output stereo audio or MIDI instead of microphone signals. A mic-only plan is not a test of MIDI routing.');
    if(mode==='band')notes.push('The number of mixer channels does not equal the number of separate computer recording tracks.');
    if(mode==='podcast')notes.push('Remote callers require a return route that does not feed their own delayed voice back to them; multi-guest monitoring needs verification.');
    if(mode==='stream')notes.push('Streaming needs game/app/guest audio routing and echo prevention. A microphone count check alone cannot verify loopback or software mixing.');
    lessons.push('/decoder/audio-interfaces-mixers/','/decoder/microphone-types/','/decoder/recording-sources/');
  }
  return {
    mode,stages,checks,notes,lessons,
    disclaimer:'A source-evidence planning tool, not a compatibility, wiring, safe-loudness, price or sound-quality guarantee. Unverified items require inspection before connecting or purchasing.'
  };
}
