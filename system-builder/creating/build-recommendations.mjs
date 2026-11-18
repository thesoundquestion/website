/**
 * The Sound Question | Creating Builder v2.
 * Beginner-first equipment suggestions backed by the single shared registry.
 * Capacity is a prerequisite, never a safety/quality verdict. No fake prices,
 * product scraping, sales links or claims that an example is buyable today.
 */
import {regionalPriceLabel} from '../../equipment/price-tier-client.mjs';
import {validPricePreference} from '../../equipment/price-preference.mjs';
import {assessRecordingChain} from '../../equipment/recording-chain-check.mjs';

export const CREATING_GOALS=Object.freeze({
  vocal:{name:'Record vocals or a voice track',count:1,why:'Record one voice, with room for backing tracks or extra takes.'},
  songwriter:{name:'Record singing and instruments',count:1,why:'Record one part at a time, or add inputs when playing and singing together.'},
  drums:{name:'Record an acoustic drum kit',count:4,why:'Choose how many microphones will capture the kit at the same moment.'},
  band:{name:'Record a band or rehearsal',count:4,why:'Decide how many microphones and independent parts will record together.'},
  podcast:{name:'Record a podcast or interview',count:2,why:'Plan microphones for the people in the room and a way to monitor playback.'},
  stream:{name:'Stream, game or make videos',count:1,why:'Capture a voice plus computer/guest audio using an appropriate software route.'},
  live:{name:'Amplify a live performance or event',count:2,why:'Build a signal path to speakers for the audience and monitoring for performers.'}
});
export const DEFAULT_GOAL_COUNTS=Object.freeze(Object.fromEntries(
  Object.entries(CREATING_GOALS).map(([key,item])=>[key,item.count])
));
const fact=(record,key)=>record?.facts?.[key]?.value??null;
const has=(r,category)=>r?.categories?.includes(category)===true;
const evidence=r=>r?.evidence?.find(e=>/^https:\/\//.test(e.url))?.url||null;
const roles=r=>r?.profiles?.flatMap(p=>Array.isArray(p.roles)?p.roles:[])||[];
const category=(catalog,kind)=>catalog.records.filter(r=>has(r,kind));
const from=(catalog,id)=>catalog.records.find(r=>r.id===id)||null;
const micRoles={
  vocal:['vocals','studio_vocals','recorded_vocals','spoken_word'],
  songwriter:['studio_vocals','acoustic_instruments','instrument_mic','recorded_vocals'],
  drums:['instrument_mic','stage','acoustic_instruments'],
  band:['live_vocals','stage','instrument_mic'],
  podcast:['podcasting','spoken_word','streaming'],
  stream:['streaming','spoken_word','podcasting'],
  live:['live_vocals','stage','recorded_vocals']
};
const routeSupports=(r,route)=>r?.connections?.outputs?.some(p=>
  route==='usb'?p.type.includes('usb'):p.type==='xlr_3pin'||p.type.includes('xlr_3pin'))||false;
function equipmentItem(record,{prices,region,reason}={}){
  if(!record)return null;
  const tier=regionalPriceLabel(prices,record.id,{region:region||'CA'});
  return {id:record.id,model:record.model,source:evidence(record),
    priceCategory:tier?.label||null,priceRegion:tier?.region||null,
    tierDate:tier?.asOf||null,reason:reason||null};
}
const needs={mic:'microphone',capture:'audio_interface',headphones:'headphone',monitors:'speaker',pa:'speaker'};
const safeOwned=(catalog,owned,kind)=>{
  const id=typeof owned?.[kind]==='string'?owned[kind]:'';
  const picked=id?from(catalog,id):null;
  const cat=kind==='capture'?['audio_interface','mixer_recorder']:
    kind==='monitors'||kind==='pa'?['speaker']:[needs[kind]];
  return picked&&cat.some(c=>has(picked,c))?picked:null;
};
const customOwned=(ownedNames,kind)=>
  typeof ownedNames?.[kind]==='string'?ownedNames[kind].trim().slice(0,110):'';
function sorted(candidates,score,prices,region,preference){
  const wanted=validPricePreference(preference);
  return candidates.map((r,i)=>{
    const category=regionalPriceLabel(prices,r.id,{region});
    return {r,i,score:score(r),matched:wanted!=='any'&&category?.tier===wanted?1:0};
  }).sort((a,b)=>(b.score+b.matched*4)-(a.score+a.matched*4)||a.i-b.i)
    .map(x=>x.r);
}
function microphoneRank(record,mode){
  const tags=roles(record);
  let score=0;
  for(const [i,role] of (micRoles[mode]||[]).entries())
    if(tags.includes(role))score=Math.max(score,15-i*2);
  return score;
}
function captureQualifies(record,{count,independent,live,phantom}){
  if(!has(record,'audio_interface')&&!has(record,'mixer_recorder'))return false;
  const preamps=fact(record,'micPreampCount');
  if(!Number.isInteger(preamps)||preamps<count)return false;
  if(phantom&&fact(record,'hasPhantom48v')!==true)return false;
  if(live){
    // A live mixer needs a documented output route, not just USB to a laptop.
    return has(record,'mixer_recorder')&&record.connections.outputs.some(x=>/main|master/.test(x.type));
  }
  const channels=fact(record,'computerRecordingInputs');
  if(!Number.isInteger(channels)||channels<1)return false;
  if(independent&&count>1){
    if(channels<count||fact(record,'usbRecordingMode')==='stereo_mix_only')return false;
  }
  return true;
}
function captureRank(record,{mode,count,independent}){
  let score=has(record,mode==='live'?'mixer_recorder':'audio_interface')?20:9;
  if(independent&&count>1&&fact(record,'usbRecordingMode')==='multitrack')score+=15;
  if(!independent&&count>1&&fact(record,'usbRecordingMode')==='stereo_mix_only')score+=6;
  if(mode==='stream'&&fact(record,'loopback')===true)score+=9;
  if(mode==='podcast'&&count>1&&fact(record,'usbRecordingMode')==='multitrack')score+=5;
  const extra=fact(record,'micPreampCount');
  if(Number.isInteger(extra))score+=Math.max(0,5-Math.abs(extra-count));
  return score;
}
function headphoneRank(record,mode){
  const tags=roles(record);
  let score=tags.includes('studio_tracking')||tags.includes('tracking')?20:0;
  if(mode==='podcast'&&tags.includes('podcast_monitoring'))score+=6;
  if(tags.includes('recording_monitoring'))score+=10;
  if(/MDR-7506|ATH-M40x|ATH-M50x|DT 770 PRO|K371|SRH440A/i.test(record.model))score+=5;
  return score;
}
function stage(key,title,purpose,{pick=null,alternatives=[],quantity=1,need='research',
  checks=[],detail='',included=false}={}){
  return {key,title,purpose,pick,alternatives,quantity,need,checks,detail,included};
}
function buildStage(catalog,{key,title,purpose,owned,ownedNames,candidates,prices,region,
  quantity=1,reason='',checks=[],alternatives=2}){
  const own=safeOwned(catalog,owned,key),custom=customOwned(ownedNames,key);
  const chosen=own||(!custom?candidates[0]||null:null);
  let need=own||custom?'reuse':chosen?'research':'verify';
  const pick=chosen?equipmentItem(chosen,{prices,region,reason}):
    custom?{id:null,model:custom,source:null,priceCategory:null,
      reason:'Already owned but not in our verified catalogue; check its manual.'}:null;
  const optionList=candidates.filter(x=>x.id!==chosen?.id).slice(0,alternatives)
    .map(x=>equipmentItem(x,{prices,region}));
  return stage(key,title,purpose,{pick,alternatives:optionList,quantity,need,checks,
    detail:need==='research'?'Example to investigate before buying; not a sale or availability claim.':
      need==='reuse'?'Use what you own if its documented connections and capacity suit this plan.':'No verified catalogue candidate meets all requested requirements.'});
}
function generic(key,title,purpose,detail,{quantity=1,need='research'}={}){
  return stage(key,title,purpose,{quantity,need,detail});
}
const lessonsFor={
  vocal:['/decoder/microphone-types/','/decoder/audio-interfaces-mixers/','/decoder/recording-sources/'],
  songwriter:['/decoder/recording-sources/','/decoder/audio-interfaces-mixers/','/decoder/mixing-soundstage/'],
  drums:['/decoder/microphone-types/','/decoder/audio-interfaces-mixers/','/decoder/mixing-soundstage/'],
  band:['/decoder/audio-interfaces-mixers/','/decoder/mixing-soundstage/'],
  podcast:['/decoder/microphone-types/','/decoder/audio-interfaces-mixers/'],
  stream:['/decoder/audio-interfaces-mixers/','/decoder/recording-sources/'],
  live:['/decoder/speaker-types/','/decoder/audio-interfaces-mixers/','/decoder/microphone-types/']
};
export function buildCreatingSystem(catalog,{
  mode='vocal',microphoneCount=1,independentTracks=false,micConnection='xlr',
  includeMonitors=false,region='CA',pricePreference='any',
  owned={},ownedNames={}
}={}){
  if(!Array.isArray(catalog?.records))throw new TypeError('Shared equipment catalogue required');
  if(!CREATING_GOALS[mode])throw new RangeError('Unknown creating goal');
  const count=Number(microphoneCount);
  if(!Number.isInteger(count)||count<1||count>32)
    throw new RangeError('Choose 1 to 32 microphones at once');
  const live=mode==='live';
  const independent=!live&&Boolean(independentTracks)&&count>1;
  const chosenPath=micConnection==='usb'&&count===1&&!live?'usb':'xlr';
  const messages=[],stages=[],notes=[];
  if(micConnection==='usb'&&count>1)
    messages.push('For several microphones at the same time, this example uses XLR microphones and a capture device. Multiple USB microphones do not automatically combine into separate tracks.');
  const micCandidates=sorted(category(catalog,'microphone').filter(r=>routeSupports(r,chosenPath)),
    r=>microphoneRank(r,mode),prices,region,pricePreference);
  const ownMic=safeOwned(catalog,owned,'mic');
  const owningCustomMic=customOwned(ownedNames,'mic');
  if(ownMic&&!routeSupports(ownMic,chosenPath))
    messages.push('Your selected microphone has not been confirmed for the requested '+chosenPath.toUpperCase()+' connection. Check the exact output before purchasing anything.');
  const micStage=buildStage(catalog,{key:'mic',title:count===1?'Microphone':'Microphones',
    purpose:mode==='drums'?'Turn the drum kit into recordable sound. Different positions may need different microphones.':
      mode==='live'?'Pick up vocals or instruments so the mixer can send them to the audience.':
      'Turn speech, singing or instrument sound into an audio signal.',
    owned,ownedNames,candidates:micCandidates,prices,region,quantity:count,
    reason:'Selected from catalogue roles for this project; microphone tone and room fit are not scored.',
    checks:[count>1?'Quantity '+count+' is a planning placeholder. Different sources may need different microphone types.':'Placement and room sound matter as much as model choice.']});
  stages.push(micStage);
  const mic=ownMic||(!owningCustomMic?micCandidates[0]||null:null);
  const requiresPhantom=fact(mic,'requires48v')===true;
  const directUSB=chosenPath==='usb'&&count===1&&routeSupports(mic,chosenPath);
  const captureRule={count,independent,live,phantom:requiresPhantom};
  if(directUSB){
    stages.push(stage('capture','Computer microphone connection',
      'The chosen USB microphone can connect to the computer without a second external microphone interface.',{
      need:'included',quantity:1,detail:'Use its documented USB output. Confirm drivers, monitoring and how it appears in the recording program.',
      checks:['Do not add a second interface just because studio setups often use one.']}));
  }else{
    const captureCandidates=sorted(catalog.records.filter(r=>captureQualifies(r,captureRule)),
      r=>captureRank(r,{mode,count,independent}),prices,region,pricePreference);
    // A tier preference can prioritize within the same suitable equipment role.
    const ranked=captureCandidates;
    const stageCapture=buildStage(catalog,{key:'capture',
      title:live?'Mixer for the performance':'Audio interface, mixer or recorder',
      purpose:live?'Accept microphone signals, let you set levels and send a mix to the audience speakers.':
        'Accept the microphones and send their sound to the recording computer or recorder.',
      owned,ownedNames,candidates:ranked,prices,region,quantity:1,
      reason:'Selected only from documented microphone input capacity and recording/outputs. More channels do not mean better sound.',
      checks:[independent?'This setup needs separately recorded channels, not just a stereo USB mix.':'Check which microphones/inputs can be used at the same time.',
        'Confirm microphone connectors and appropriate gain/phantom-power switching.']});
    stages.push(stageCapture);
    const ownedCapture=safeOwned(catalog,owned,'capture');
    const selectedCapture=ownedCapture||(!customOwned(ownedNames,'capture')?ranked[0]||null:null);
    if(ownedCapture&&!captureQualifies(ownedCapture,captureRule)){
      const alternative=ranked[0];
      messages.push('Your '+ownedCapture.model+' has a known input/recording limitation or lacks enough verified facts for this request. '+(alternative?'Research '+alternative.model+' as an alternative.':'No listed device has enough documented capacity for this plan.'));
      if(alternative&&!stageCapture.alternatives.some(x=>x.id===alternative.id))
        stageCapture.alternatives.unshift(equipmentItem(alternative,{region,reason:'Alternative with documented capacity'}));
    }
    if(selectedCapture&&mic&&routeSupports(mic,'xlr')){
      try{
        const audit=assessRecordingChain(catalog,{
          captureDeviceId:selectedCapture.id,
          microphoneIds:Array.from({length:count},()=>mic.id),
          independentTracks:independent
        });
        for(const item of audit.checks){
          if(item.status==='known_limit')messages.push(item.summary+' '+item.detail);
          else if(item.status==='unverified')notes.push(item.summary+' '+item.detail);
        }
        if(audit.status!=='capacity_documented')
          notes.push('The capacity checker still requires confirmation of real input assignment and software routing.');
      }catch{notes.push('Individual inputs and wiring have not been validated for this exact combination.')}
    }
    if(!ranked.length&&!ownedCapture)
      messages.push('No model in the current catalogue documents enough appropriate inputs for all '+count+' microphones. Do not mistake an unspecified device for a recommendation.');
  }
  if(live){
    const paCandidates=sorted(category(catalog,'speaker')
      .filter(r=>fact(r,'speakerKind')==='powered_pa_speaker'),
      r=>r.connections.inputs.some(p=>/line/.test(p.type))?9:0,prices,region,pricePreference);
    stages.push(buildStage(catalog,{key:'pa',title:'Audience PA speakers',
      purpose:'Make the mixed sound audible to the audience. These models already contain power amplifiers.',
      owned,ownedNames,candidates:paCandidates,prices,region,quantity:2,
      reason:'Published powered PA type; venue output, coverage and safe level are not certified.',
      checks:['Two cabinets are an illustrative starting quantity, not a coverage calculation.',
        'Check line-level connections, mounting, electrical supply, feedback and sustained output.']}));
    stages.push(generic('live_monitor','Performers’ monitoring',
      'Let musicians hear themselves separately from the audience where needed.',
      'Research a floor monitor, headphone monitoring or suitable in-ear system. Confirm mixer auxiliary sends and safe stage levels.',{need:'verify'}));
    stages.push(generic('live_support','Mic stands, mixer-to-PA cables and power',
      'Connect and safely position the equipment.',
      'Plan one appropriate mic cable per XLR microphone, secure stands, speaker stands, rated power and cable routing. Specific connector types and quantities depend on the exact devices.'));
  }else{
    const headphoneCandidates=sorted(category(catalog,'headphone'),r=>headphoneRank(r,mode),prices,region,pricePreference);
    stages.push(buildStage(catalog,{key:'headphones',title:'Monitoring headphones',
      purpose:'Hear a backing track or the recording without speaker sound leaking into a nearby microphone.',
      owned,ownedNames,candidates:headphoneCandidates,prices,region,quantity:1,
      reason:'Catalogued headphone model to investigate for tracking comfort and isolation.',
      checks:['Confirm the headphone plug, output level, volume control and comfortable fit.',
        count>1?'More than one performer may need extra headphone outputs or a distribution amplifier.':'A separate headphone amplifier is not automatically needed.']}));
    stages.push(generic('software',mode==='stream'?'Streaming or video software':'Recording and editing software',
      mode==='stream'?'Combine microphone and computer/video sound for a broadcast or recording.':
        'Record, name, listen to and edit the tracks on a computer.',
      mode==='stream'?'Example: OBS Studio (free); check the exact operating system, audio devices and guest/game-audio routing.':
        independent||mode==='band'||mode==='drums'||mode==='songwriter'?
          'Choose a multi-track recording program (DAW). Free examples include Waveform Free and Audacity; confirm the exact editing, driver and track-routing features you need.':
          'For a simple voice take, Audacity is one free example. Check microphone input selection, recording levels and how to monitor playback.'));
    if(includeMonitors){
      const monitors=sorted(category(catalog,'speaker').filter(r=>fact(r,'speakerKind')==='powered_studio_monitor'),
        r=>r.connections.inputs.some(p=>/xlr|trs/.test(p.type))?9:0,prices,region,pricePreference);
      stages.push(buildStage(catalog,{key:'monitors',title:'Optional studio listening speakers',
        purpose:'Listen to your edits away from headphones. They are not required just to record a microphone.',
        owned,ownedNames,candidates:monitors,prices,region,quantity:2,
        reason:'Catalogued powered studio cabinet, not an amplifier for passive speakers.',
        checks:['Most documented packages contain one powered speaker; buy two for an ordinary stereo pair.',
          'Check two compatible line-level outputs, volume control, mains power and space around each speaker.']}));
    }
    stages.push(generic('accessories','Stands, appropriate cables and basic room setup',
      'Position microphones and connect the capture system.',
      'For XLR microphones, plan one suitable XLR cable and stand per microphone; consider a pop filter for vocals and room-noise control. A USB microphone needs the correct USB cable instead. Verify exact connectors and cable lengths.'));
  }
  if(mode==='songwriter')notes.push('A guitar plugged straight into an interface uses an instrument input rather than another microphone preamp. If you sing and play simultaneously, check both input roles and recording channels before buying.');
  if(mode==='drums')notes.push('An electronic drum kit may need a stereo line input or MIDI instead of microphone inputs. These example microphones describe an acoustic kit only.');
  if(mode==='podcast'||mode==='stream')notes.push('Remote guests need a correctly configured return/loopback route so they do not hear their own delayed voice. A product’s microphone input count alone cannot confirm this.');
  if(independent)notes.push('Separate tracks mean you can change the volume or edit each microphone later. A mixer with many channels may still send only one combined stereo recording to the computer.');
  else if(count>1&&!live)notes.push('You chose a combined recording. Everyone is recorded together, so you usually cannot turn down one microphone afterward without affecting the others.');
  const purchased=stages.filter(x=>x.need==='research');
  return {
    mode,title:CREATING_GOALS[mode].name,settings:{microphoneCount:count,independentTracks:independent,
      route:chosenPath,region,pricePreference:validPricePreference(pricePreference)},
    stages,purchased,alreadyOwned:stages.filter(x=>x.need==='reuse'),messages,notes,
    lessons:lessonsFor[mode],
    disclaimer:'These are concrete research candidates and a complete parts checklist, not verified live stock, current selling prices, safe wiring, or guaranteed product compatibility. Only stated specifications are used. Local availability and the full cost of every accessory must be checked before purchasing.'
  };
}
