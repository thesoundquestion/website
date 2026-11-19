// The Sound Question · TSQ-GOAL-01. Educational, deterministic and local to the browser.
// Do not store answers, infer compatibility, invent prices or conflate stereo mixes with independent tracks.
const question=(id,prompt,pairs)=>({id,prompt,options:pairs.map(([value,label])=>({value,label}))});
export const GOALS=[
// Optional, task-first paths. Existing goals and all engineering tools remain unchanged.
 {id:'match',group:'Listening',title:'Match my amplifier and speakers',short:'Check electrical requirements before assuming two products work together.',questions:[
  question('owned','What do you have already?', [['both','An amplifier and speakers'],['amp','An amplifier and need speakers'],['speakers','Speakers and need an amplifier'],['unsure','I am not sure what I have']]),
  question('speakerType','What type of speakers are they?', [['passive','Passive speakers (require an amplifier)'],['powered','Powered speakers (amplifier built in)'],['unsure','Not sure yet']])
 ]},
 {id:'vinyl',group:'Listening',title:'Start listening to vinyl',short:'Understand the turntable, phono stage and speaker connections.',questions:[
  question('phono','Does your turntable have a built-in phono preamp or PHONO/LINE switch?', [['yes','Yes, it has a LINE output'],['no','No, it only has a phono output'],['unsure','I am not sure yet']]),
  question('speakers','What will play the records?', [['powered','Powered speakers'],['passive','Passive speakers, and no amplifier yet'],['receiver','An amplifier or receiver with passive speakers'],['unsure','I do not know yet']])
 ]},
 {id:'digital',group:'Listening',title:'Connect digital music',short:'Music from a computer, CD player, phone or network streamer.',questions:[
  question('player','What will play the music?', [['computer','A computer'],['streamer','A network streamer'],['cd','A CD player'],['phone','A phone or tablet']]),
  question('listen','What will produce the sound?', [['receiver','An amplifier or receiver with speakers'],['powered','Powered speakers'],['passive','Passive speakers but no amplifier'],['unsure','I do not know yet']])
 ]},
 {id:'improve',group:'Listening',title:'Improve what I already own',short:'Start with a useful check before replacing equipment.',questions:[
  question('problem','What would you most like to improve?', [['bass','Bass sounds weak or boomy'],['space','Stereo sounds narrow or unfocused'],['harsh','Sound gets harsh or crowded'],['general','Not sure what is wrong']]),
  question('gear','What are you listening through?', [['passive','An amplifier and passive speakers'],['powered','Powered speakers'],['headphones','Headphones'],['unsure','I am not sure yet']])
 ]},
 {id:'hifi',group:'Listening',title:'Improve my hi-fi sound',short:'Better soundstage, clarity, bass and listening at home.',questions:[
  question('focus','What would you most like to improve?', [['imaging','A wider, more convincing sense of space'],['vocals','Natural voices and instruments'],['bass','Better-controlled bass'],['overall','Everything working together'],['unsure','I am not sure yet']]),
  question('gear','What equipment do you already have?', [['full','Amplifier and speakers'],['amp','An amplifier, but need speakers'],['speakers','Speakers, but unsure about the amplifier'],['none','Starting from scratch'],['unsure','Not sure what I have']]),
  question('seat','Where do you usually listen?', [['desk','Close up at a desk'],['chair','One main chair or couch position'],['several','Several seats around a room'],['unsure','Not sure yet']])
 ]},
 {id:'tv',group:'Listening',title:'Improve TV, movies or gaming sound',short:'Understand TV connections and options for clearer, fuller sound.',questions:[
  question('problem','What is most important?', [['dialogue','Hearing speech clearly'],['movie','A bigger sound for films'],['game','Gaming sound and low delay'],['general','Better everyday TV sound']]),
  question('system','What are you using now?', [['tv','Just the TV speakers'],['soundbar','A soundbar'],['stereo','Stereo or receiver and speakers'],['unsure','Not sure']])
 ]},
 {id:'headphones',group:'Listening',title:'Find my headphone setup',short:'Choose headphones and understand the source they connect to.',questions:[
  question('use','Where will you use them most?', [['home','Quiet listening at home'],['noisy','Commuting or noisy places'],['create','Recording or editing sound'],['gaming','Gaming, voice chat and calls']]),
  question('source','What will play the sound?', [['phone','A phone or tablet'],['computer','A computer'],['receiver','An amplifier or receiver'],['unsure','Not sure']])
 ]},
 {id:'vocal',group:'Recording',title:'Record vocals, rap or a voice track',short:'Start with a microphone and the simplest useful recording path.',questions:[
  question('backing','What will go with the voice?', [['beat','An existing beat or backing track on the computer'],['software','Beats or instruments created in software'],['voice','Just the voice for now'],['live','Other musicians playing at the same time']]),
  question('mic','What microphone connection do you have?', [['usb','A USB microphone'],['xlr','An XLR microphone'],['none','No microphone yet'],['unsure','Not sure']])
 ]},
 {id:'songwriter',group:'Recording',title:'Record singing and an instrument',short:'Guitar and vocals, together or one part at a time.',questions:[
  question('method','How do you want to record?', [['overdub','One part first, then add the other'],['blended','Sing and play together as one combined recording'],['separate','Sing and play together on separate editable tracks'],['unsure','Not sure yet']]),
  question('instrument','What instrument are you recording?', [['acoustic','Acoustic guitar or another acoustic instrument'],['electric','Electric guitar or bass'],['keyboard','Keyboard or electronic instrument'],['other','Something else or not sure']])
 ]},
 {id:'drums',group:'Recording',title:'Record a drum kit at home',short:'Capture the overall kit or keep individual drums separate.',questions:[
  question('kit','What sort of drums are they?', [['acoustic','A real acoustic drum kit'],['electronic','An electronic drum kit'],['unsure','Not sure yet']]),
  question('control','What would you like to do afterward?', [['simple','Keep a straightforward whole-kit recording'],['stereo','Capture the kit with two microphones or a stereo recorder'],['separate','Adjust individual drums separately'],['unsure','Not sure']])
 ]},
 {id:'band',group:'Recording',title:'Record a full band or rehearsal',short:'Understand stereo recordings, overdubbing and multitrack requirements.',questions:[
  question('method','How will you record the band?', [['rehearsal','Capture a whole rehearsal as one mix'],['overdub','Record musicians one after another'],['live','Everyone plays together, with separately editable recordings'],['unsure','Not decided']]),
  question('sources','Roughly how many independent sounds must be recorded at once?', [['few','One to four'],['some','Five to eight'],['many','Nine or more'],['unsure','Not sure how to count them']])
 ]},
 {id:'stream',group:'Creating',title:'Stream or make videos',short:'Voice, game audio, camera sound and what viewers hear.',questions:[
  question('kind','What are you creating?', [['game','Gaming or screen-based streams'],['video','Recorded videos or tutorials'],['music','Live music or performance streams'],['unsure','Not sure yet']]),
  question('people','Who needs a microphone?', [['one','Just me'],['two','More than one person in the room'],['remote','Me and remote guests'],['unsure','Not sure']])
 ]},
 {id:'podcast',group:'Creating',title:'Record a podcast or interviews',short:'From one spoken voice to several guests and headphone mixes.',questions:[
  question('guests','Who is taking part?', [['solo','Just one speaker'],['two','Two people together'],['many','Three or more in one place'],['remote','Remote guests or call-ins']]),
  question('edit','Do you want separate control of each voice afterward?', [['separate','Yes, where possible'],['combined','One combined recording is sufficient'],['unsure','Not sure yet']])
 ]},
 {id:'live',group:'Performing',title:'Play music live or run an event',short:'Speakers for the audience and monitoring for performers.',questions:[
  question('show','What are you amplifying?', [['speech','A presenter or spoken announcements'],['solo','A solo musician or small acoustic duo'],['band','A full band with several instruments'],['unsure','Not sure yet']]),
  question('monitor','Do performers need to hear a different mix from the audience?', [['yes','Yes, stage or headphone monitoring'],['no','Not at the moment'],['unsure','Not sure']])
 ]},
 {id:'learn',group:'Exploring',title:'Just help me understand audio',short:'Start with approachable explanations and actual listening examples.',questions:[
  question('topic','What are you curious about?', [['speakers','Speakers, amplifiers and equipment'],['recording','How music is recorded and produced'],['digital','Files, streaming and digital audio'],['sound','How sound and hearing work'],['unsure','A little of everything']]),
  question('style','How do you prefer to start?', [['read','A short explanation'],['hear','A listening experiment'],['unsure','Either is fine']])
 ]}
];
export const GROUPS=['Listening','Recording','Creating','Performing','Exploring'];
export const LINKS={
 builder:{href:'/system-builder/',label:'Build a home listening system',why:'Explore supported speaker, amplifier and listening choices around your room and priorities.'},
 check:{href:'/system-check/',label:'Check amplifier and speaker headroom',why:'Estimate whether a specific passive-speaker setup has enough room for loud musical peaks.'},
 soundstage:{href:'/decoder/audiophile-glossary/#space',label:'What do soundstage, imaging and separation mean?',why:'Understand what listeners are describing before comparing equipment.'},
 dispersion:{href:'/decoder/speaker-dispersion/#understand',label:'How speakers and rooms affect the listening position',why:'Learn why direction and placement can change what reaches you.'},
 speakers:{href:'/decoder/speaker-types/#jobs',label:'Speaker types and their jobs',why:'See how studio, hi-fi and PA speakers can overlap.'},
 bass:{href:'/decoder/bass-extension/',label:'Understand bass extension',why:'Learn what speakers can do in the lowest notes.'},
 freq:{href:'/decoder/speaker-frequency-response/#understand',label:'How speakers balance different notes',why:'See what a frequency-response measurement can and cannot tell you.'},
 amp:{href:'/decoder/amplifier-power/#headroom',label:'Amplifier power and headroom',why:'Understand why clean musical peaks matter more than a single wattage claim.'},
 sources:{href:'/decoder/playback-sources/#signal-path',label:'How sound reaches the speakers',why:'Trace a source through the playback system.'},
 headphone:{href:'/decoder/headphone-types/',label:'Choose a headphone design',why:'Understand open, closed and other wearing styles.'},
 headphonefit:{href:'/decoder/headphone-output-impedance/',label:'Headphone and output matching',why:'See why the device driving headphones can sometimes matter.'},
 mic:{href:'/decoder/microphone-types/#inside',label:'Dynamic, condenser and other microphone types',why:'Learn how microphone designs differ and when they overlap.'},
 micplace:{href:'/decoder/recording-sources/#room',label:'Why microphone placement changes sound',why:'Find out how microphone distance and the room affect a recording.'},
 interfaces:{href:'/decoder/audio-interfaces-mixers/',label:'Audio interfaces, mixers and recording channels',why:'Compare recording inputs, mixer outputs, USB tracks and hands-on controls before choosing gear.'},
 recording:{href:'/decoder/recording-sources/#paths',label:'How sound enters a recording',why:'See the basic microphone, instrument and computer routes.'},
 gain:{href:'/decoder/recording-resolution/#gain',label:'Set recording levels without distortion',why:'Understand why too much input level can spoil a take.'},
 mix:{href:'/decoder/mixing-soundstage/#multitrack',label:'Separate tracks and mixing',why:'See what recording parts separately lets you change later.'},
 mastering:{href:'/decoder/mastering-dynamic-range/#mix-and-master',label:'What mixing and mastering do',why:'Understand how finished recordings are shaped.'},
 digital:{href:'/decoder/lossy-lossless/',label:'Lossless versus compressed audio files',why:'Understand the main differences between common music files.'},
 formatslab:{href:'/labs/formats/',label:'Hear a format comparison',why:'Try a listening activity instead of judging audio from file labels.'},
 labs:{href:'/labs/',label:'Try the listening labs',why:'Hear how recording and playback choices affect actual sound.'},
 journey:{href:'/journey/',label:'Follow the sound journey',why:'Explore performance, recording, mixing, playback and listening in order.'},
 soundbasics:{href:'/decoder/sound-basics/',label:'Start with the basics of sound',why:'Begin with familiar everyday examples.'},
 about:{href:'/about/',label:'About The Sound Question',why:'Learn how the project approaches sound questions and evidence.'},
 tools:{href:'/tools/',label:'Browse the practical audio tools',why:'Go directly to measurements and existing builder tools.'}
};
const role=(name,why)=>({name,why});
const select=(g,id,a)=>g.questions.find(q=>q.id===id)?.options.find(o=>o.value===a?.[id])?.value;
const uniqKeys=items=>[...new Set(items)];
const make=(goal,answers,config)=>{
 const keys=uniqKeys(config.learn||[]).filter(x=>LINKS[x]);
 return {goalId:goal.id,title:goal.title,description:config.description,steps:config.steps,optional:config.optional||[],skip:config.skip||[],verify:config.verify||[],alternative:config.alternative||'',learn:keys.map(x=>LINKS[x]),next:config.next||null,notes:config.notes||[]};
};
export function buildPath(goalId,answers={}){
 const goal=GOALS.find(x=>x.id===goalId);
 if(!goal)throw new Error('Choose a supported goal.');
 for(const q of goal.questions) if(!select(goal,q.id,answers))throw new Error('Choose an answer for '+q.prompt);
 const a=answers;

 // The guide explains equipment roles and uncertainty. System Check remains
 // responsible for actual amplifier/speaker headroom estimates.
 if(goalId==='match'){
   const powered=a.speakerType==='powered',passive=a.speakerType==='passive';
   return make(goal,a,{
     description:powered?'Powered speakers already contain amplification. Check the source-level input; do not connect them to an external amplifier speaker output.':'Check the actual model information before treating any speaker and amplifier pairing as electrically suitable.',
     steps:powered?[
       role('A compatible music source','Find an appropriate line-level or documented digital output.'),
       role('Your powered speakers','Use their own amplification and volume controls, with the correct input.'),
       role('Keep any separate amplifier apart','Never connect speaker terminals to a powered speaker line-level input.')
     ]:[
       role('Identify both models','Find the amplifier manual and the exact speaker model or version.'),
       role('Check the speaker load','The nominal ohm label is only a starting point; actual impedance can vary with frequency.'),
       role('Check the amplifier and listening position','Compare permitted speaker load, specified clean output, speaker sensitivity and distance using System Check.')
     ],
     optional:powered?[]:['A suitable amplifier, only if you have passive speakers and no amplifier yet'],
     skip:powered?['No separate speaker amplifier is needed for an ordinary powered stereo pair.']:['Do not replace working equipment solely because a watt rating looks too small.'],
     verify:powered?['Powered speakers must have the right source input, level and volume control.']:passive?['Exact amplifier permitted load and real speaker impedance minimum/phase are not verified by the guide.','A published watt rating at the nominal load does not certify a safe or sufficiently loud pairing.']:['First identify whether your speakers are powered or passive.','Unknown speaker or amplifier specifications cannot be treated as safe matches.'],
     alternative:'If you already have a functioning system, keep it while checking placement and source connections before shopping.',
     learn:['amp','speakers','sources','dispersion'],
     next:powered?'sources':'check'
   });
 }
 if(goalId==='vinyl'){
   const phono=a.phono,output=a.speakers;
   const stage=phono==='yes'
     ?role('Phono stage inside the turntable','Use the turntable LINE setting/output when connecting to a line-level input. Avoid feeding it into another PHONO input.')
     :phono==='no'
       ?role('A suitable phono stage','A matching PHONO input on an amplifier/receiver can provide this, otherwise an external phono preamp is normally required.')
       :role('Check whether a phono stage is included','Look up the exact model or PHONO/LINE switch before buying a separate preamp.');
   const end=output==='powered'?role('Powered speakers with a compatible line input','Amplification is inside the speakers; do not connect another amplifier’s speaker terminals.')
     :output==='passive'?role('Appropriate amplifier and passive speakers','Passive speakers cannot be driven directly by a turntable or standalone phono preamp.')
     :output==='receiver'?role('Your receiver or amplifier and passive speakers','Check whether its PHONO input provides the needed stage, or use a separate stage into a line input.')
     :role('Choose a complete playback route','Either powered speakers with the proper input, or passive speakers with a suitable amplifier.');
   return make(goal,a,{
     description:'Work out which components are actually needed before shopping. Vinyl needs the correct phono equalization and a compatible path to the speakers.',
     steps:[role('Turntable and cartridge','The record player produces the audio signal.'),stage,end],
     skip:[phono==='yes'?'A second phono preamp is usually unnecessary when a suitable LINE output is available.':'A separate phono preamp may be unnecessary if a compatible PHONO input already provides that stage.',output==='powered'?'A separate speaker amplifier is unnecessary with a powered pair.':'A new DAC is not necessary just to play an analogue record.'],
     verify:[phono==='unsure'?'Whether the turntable has a built-in phono preamp.':'Set the phono/line switch to the correct output mode if applicable.','Whether the amplifier or powered speakers accept the resulting signal and provide volume control.','Cartridge and phono-input compatibility, particularly if moving-coil equipment is involved.'],
     alternative:'A turntable with built-in phono amplification and powered speakers with line inputs may provide a simple complete route.',
     learn:['sources','speakers','builder'],next:'sources'
   });
 }
 if(goalId==='digital'){
   const source={computer:'computer',streamer:'network streamer',cd:'CD player',phone:'phone or tablet'}[a.player];
   const output=a.listen;
   return make(goal,a,{
     description:'A separate DAC or new amplifier is not automatically necessary. First identify the output of your player and the input your existing system can accept.',
     steps:[role('Your '+source,'Identify its available analogue or digital audio outputs.'),
       role('Match the output to an input','A compatible analogue output can feed a suitable line input; a digital output requires digital conversion by an appropriate DAC/input.'),
       output==='powered'?role('Your powered speakers','Verify their input type and reliable volume control; do not use external amplifier speaker terminals.')
         :output==='passive'?role('A suitable amplifier and passive speakers','Passive speakers need a power amplifier, even if a separate DAC is already present.')
         :output==='receiver'?role('Your amplifier or receiver','Check whether it accepts the chosen analogue or digital signal, and drives your speakers appropriately.')
         :role('Choose a listening device','Headphones, powered speakers, or passive speakers with an amplifier all require different output paths.')
     ],
     skip:['A separate DAC may be unnecessary if your source already has a suitable analogue output or your receiving device has the compatible DAC/input.','An adapter cable alone cannot turn a digital signal into an analogue signal.'],
     verify:['Exact output and input connectors, signal direction and supported audio formats.','Volume control, output levels and any necessary active conversion.','Model and cable requirements; the guide has not verified your individual devices.'],
     learn:['sources','digital','soundbasics'],next:'sources'
   });
 }
 if(goalId==='improve'){
   const focus=a.problem,headphones=a.gear==='headphones';
   const focusLink=focus==='bass'?'bass':focus==='space'?'soundstage':focus==='harsh'?'mastering':'soundbasics';
   return make(goal,a,{
     description:'Start by isolating one change in your existing playback chain. A questionnaire cannot diagnose the cause of a listening impression.',
     steps:[role('Use a familiar recording and a safe listening level','Try to compare the same version of the music rather than two different masters.'),
       role(headphones?'Check fit, seal and source settings':'Check speaker position, listening seat and source settings','Small free changes may alter the result; note what you changed.'),
       role('Investigate one likely limitation','Compare your observation with the relevant explanation and any available measurement or System Check estimate.')
     ],
     skip:['Do not assume a new DAC, amplifier, cable or pair of speakers is the first or only solution.','Do not infer an amplifier defect from the words harsh or congested without further evidence.'],
     verify:['Whether the problem happens on multiple recordings and at the same level.',headphones?'Headphone fit, earpad seal and available headphone output.':'Connections, placement, listening distance and manufacturer operating limits.'],
     alternative:'If a simple adjustment fixes the complaint, keeping your existing system is a successful outcome.',
     learn:[focusLink,headphones?'headphone':'dispersion','mastering','labs','check'],next:'improve'
   });
 }
 if(goalId==='hifi'){
   const owned=a.gear,focus=a.focus;
   const steps=owned==='full'?[role('Your music source','Keep the source you already use, as long as its connection works.'),role('Your amplifier and speakers','Start by checking setup and placement, not by assuming they need replacing.'),role('Your listening seat','Compare what changes at your actual listening position.')]:
     owned==='amp'?[role('A music source','Use the phone, streamer, computer or player you already have.'),role('Your existing amplifier','Check its permitted speaker loads and available connections.'),role('Suitable speakers','Choose a pair that works with the amplifier and your seating.')]:
     owned==='speakers'?[role('Identify your existing speakers','Find out whether they are powered or need a separate amplifier.'),role('Suitable connection or amplifier','Add this only if the speakers require it.'),role('Music source and listening position','Use a compatible source and place speakers sensibly.')]:
     [role('Music source','Phone, computer, existing player or streamer.'),role('A complete stereo speaker path','Either powered speakers or passive speakers with a suitable amplifier.'),role('Listening position','Speaker placement and your seat affect the presentation.')];
   const focusLink=focus==='imaging'?'soundstage':focus==='bass'?'bass':focus==='vocals'?'freq':'speakers';
   return make(goal,a,{description:'Find the biggest useful improvement at your seat before buying more boxes.',steps,optional:['Subwoofer for deeper bass if your current speakers and room call for one','Headphones as a separate listening option'],skip:['Do not assume a pricier amplifier or DAC fixes speaker placement or room effects.'],verify:['Whether speakers are powered or passive','Actual connections, room placement and the listening seat','Amplifier/speaker compatibility if using passive speakers'],alternative:'For a simpler system, a properly connected powered stereo pair may replace separate amplification. For flexibility, passive speakers and an appropriate amplifier are another valid path.',learn:[focusLink,'dispersion','speakers','amp','mastering'],next:'builder'});
 }
 if(goalId==='tv'){
  return make(goal,a,{description:'Improve the part of TV sound that actually bothers you.',steps:[role('TV or media device','Identify which sound outputs it offers.'),role('A compatible speaker system','A soundbar, powered stereo pair or receiver with passive speakers can all be valid choices.'),role('Volume and listening position','Place the speakers for the viewers and confirm convenient volume control.')],optional:['A subwoofer where extra low bass would help','Surround speakers if you want a multi-speaker system'],skip:['Do not assume every HDMI socket sends audio to every speaker device.'],verify:['TV connection type, audio formats and control','If gaming, whether the full path introduces distracting delay'],alternative:'Before replacing everything, check dialogue settings and placement on the system you already own.',learn:['sources','speakers','dispersion'],next:'builder'});
 }
 if(goalId==='headphones'){
  return make(goal,a,{description:'Match headphones to your surroundings and the device playing the sound.',steps:[role('Your listening source','Phone, computer or receiver, whichever you selected.'),role('A suitable headphone design','Choose for comfort, listening environment and whether outside noise should be heard or blocked.'),role('Compatible headphone output','Check whether the source can drive the chosen headphones properly.')],optional:['A separate headphone amplifier only when the source or headphone requirements justify it'],skip:['Do not assume every headphone needs an external DAC or amplifier.'],verify:['Plug/connection compatibility','Comfort, isolation and use with microphones if needed'],alternative:'If noise isolation matters, closed-back or suitable noise-cancelling designs may be practical; for quiet home listening, open-back designs may also suit.',learn:['headphone','headphonefit'],next:null});
 }
 if(goalId==='vocal'){
  const mic=a.mic,live=a.backing==='live';
  const steps=[role('A microphone','Captures the voice; choose a model and place it appropriately.')];
  if(mic==='usb')steps.push(role('USB connection to the computer','The microphone already includes the computer audio interface for that microphone.'));
  else steps.push(role('A compatible microphone input','An XLR microphone normally uses an audio interface, mixer or recorder with a suitable microphone preamp.'));
  steps.push(role('Computer or recording device','Stores the vocal recording in software.'),role('Headphones','Let you hear playback without speaker sound leaking into the microphone.'));
  if(live)steps.splice(2,0,role('Additional capture paths if needed','Musicians playing simultaneously may need additional independent inputs and tracks.'));
  return make(goal,a,{description:a.backing==='beat'?'Record your voice on its own track while an existing beat plays in the headphones.':'Capture vocals without buying more channels than the performance needs.',steps,optional:['Pop filter, suitable stand and basic room noise control','Additional monitoring/routing for live guests or musicians'],skip:[mic==='usb'?'You generally do not need to buy a second interface just to use an existing USB microphone.':'You do not automatically need a mixing console for a single vocal.',a.backing==='beat'?'A beat file already on the computer does not need a physical drum input.':'You can often record extra vocal layers one after another.'],verify:['Your microphone connection and computer compatibility',live?'How many people or instruments must be recorded at the same time':'Whether you need to hear the backing track without distracting delay'],alternative:'USB microphone → computer is simple; XLR microphone → suitable interface → computer offers a different expansion path. Both can produce usable recordings.',learn:['mic','interfaces','micplace','recording','gain','mix'],next:null});
 }
 if(goalId==='songwriter'){
  const mode=a.method,instr=a.instrument;
  const desc=mode==='overdub'?'Record the first part, listen back, then add the next part. You may need only one suitable input at a time.':mode==='blended'?'A single microphone can capture the whole performance, but voice and instrument are then joined in one recording.':mode==='separate'?'Capture voice and instrument together while keeping them on separately adjustable tracks.':'Choose later whether the two sounds should be separately editable.';
  const steps=[role('Voice capture','A suitable microphone records your singing.')];
  if(mode==='separate')steps.push(role('Second independent input','You need a separate capture path for the instrument if you want independent tracks from the same take.'));
  else if(mode==='blended')steps.push(role('Position for the complete performance','One microphone may be enough when one combined voice/instrument recording is desired.'));
  else steps.push(role('An instrument recording path','Record the instrument using the appropriate mic or direct input when its turn comes.'));
  steps.push(role('Recorder or computer','Stores the recording, including separate takes where desired.'),role('Headphones for playback and checks','Useful when layering tracks without speaker sound leaking into the microphone.'));
  return make(goal,a,{description:desc,steps,optional:['Mic stands, a pop filter and a quieter recording position', 'A pickup or direct input if your instrument supports it'],skip:[mode==='overdub'?'Two final song tracks do not mean you need two simultaneous hardware inputs.':'One blended microphone track cannot be freely split into isolated voice and instrument recordings later.'],verify:['Whether the instrument needs a microphone, line or high-impedance instrument input',mode==='separate'?'At least two appropriate independent recording channels at the same time':'How many simultaneous inputs your chosen approach actually uses'],alternative:'Overdubbing reduces simultaneous input needs. Recording together can preserve performance chemistry, but a one-microphone blend limits separate editing.',learn:['interfaces','recording','mic','micplace','mix','gain'],next:null});
 }
 if(goalId==='drums'){
  const electronic=a.kit==='electronic',separate=a.control==='separate',stereo=a.control==='stereo';
  const steps=electronic?[role('Electronic drum module','Find out whether it can provide stereo audio, MIDI instructions or individually separated outputs.'),role('Compatible recording connection','Stereo audio can use a suitable recorder/interface; MIDI needs compatible software/device support.'),role('Recording device and listening','Record or monitor the chosen output; MIDI is not a recorded acoustic drum sound.')]:
    [role(stereo?'A stereo pair or stereo recorder':separate?'The microphones you actually want to use':'One suitable microphone or a simple stereo recorder','Choose placement around the kit before assuming you need many close microphones.'),role(separate?'Enough separate microphone-capable inputs':'A compatible recorder or interface','Each microphone captured separately needs a suitable input and recording channel.'),role('Headphones and a test recording','Listen for the kit balance, nearby room reflections and unwanted spill.')];
  return make(goal,a,{description:electronic?'Electronic drums may be recorded from their audio outputs or as MIDI; a room full of acoustic drum microphones may be unnecessary.':separate?'More individual drum control usually means more microphones and separate inputs. Start with the result you want.':'A simple whole-kit recording is a valid choice, not a failed version of a studio session.',steps,optional:['Additional kick, snare, overhead, tom or room microphones only if the recording calls for them','Stands, cables and attention to garage reflections'],skip:['A fixed eight-microphone kit is not required for every drum recording.'],verify:[electronic?'Which audio/MIDI outputs the electronic kit actually supports':'Microphone placement, room and number of microphones being used at the same time','Whether you need independent drum tracks later'],alternative:'A single microphone, a stereo pair and a detailed multi-mic kit are different creative and editing approaches, not automatic quality tiers.',learn:['interfaces','recording','mic','micplace','mix'],next:null});
 }
 if(goalId==='band'){
  const mode=a.method,live=mode==='live',overdub=mode==='overdub';
  const steps=mode==='rehearsal'?[role('One or two microphones or a stereo recorder','Capture the room and the band as a combined performance.'),role('A recorder and listening check','Adjust mic placement and musicians’ balance before recording.')]:
  [role('List each active microphone and direct instrument feed','Count what you need to capture simultaneously, not the number of musicians in the group.'),role(live?'A recorder/interface with enough independent inputs':'Recording interface or recorder for the current performer','Keep every source you want to edit separately on its own recording channel.'),role('Monitoring for performers','A suitable headphone or stage-monitor feed when needed.'),role('Computer or standalone multitrack recorder','Store the independent recordings.')];
  const estimate=live?(a.sources==='few'?'You selected up to four independent sources, subject to checking their input types.':a.sources==='some'?'You selected about five to eight independent sources, subject to checking microphone preamps and line/instrument inputs.':a.sources==='many'?'You selected nine or more independent sources. Plan input count and routing before choosing a device.':'The required input count is unknown until the microphones and direct instrument feeds are listed.'):'The number of finished song tracks may be larger than the number of inputs used at once.';
  return make(goal,a,{description:overdub?'Record one musician at a time against previously recorded parts; this often reduces simultaneous input needs.':mode==='rehearsal'?'A rehearsal recording can be one combined sound without individually editable instruments.':'Recording a whole band live with independently editable parts requires enough simultaneous capture paths.',steps,optional:['Stage/performer monitor mixes, stands and cable organization','Additional drum microphones only when wanted'],skip:[mode==='rehearsal'?'A large multitrack interface is not automatically required for a rehearsal archive.':'Do not assume an “eight-channel mixer” provides eight independent USB record tracks.'],verify:[estimate,'Separate microphone preamp versus line/instrument input requirements','Where the room and microphones may pick up other instruments'],alternative:'A stereo recorder is simple for the whole performance; overdubbing uses fewer simultaneous inputs; multitrack live recording offers greater control afterward.',learn:['interfaces','recording','micplace','mix','mic'],next:null});
 }
 if(goalId==='stream'){
  const remote=a.people==='remote',multiple=a.people==='two';
  return make(goal,a,{description:'Plan which sounds the audience hears and which sounds you hear in your own headphones.',steps:[role('A microphone for each local voice','Use a USB microphone or a suitable XLR/interface path.'),role('Computer and streaming/recording software','Bring together voice, application audio and video as needed.'),role('Headphones and appropriate routing','Monitor your content without feeding speaker sound back into the microphone.'),...(remote?[role('Guest audio return without echo','Remote participants should not receive a delayed copy of their own voices.')]:[])],optional:['An interface with internal routing, software mixing or loopback if it solves a specific problem',multiple?'Separate mic inputs and recordings for multiple speakers':'A dedicated mixer only when hands-on live control is useful'],skip:['Streaming does not automatically require a hardware mixing console.'],verify:['Computer, camera and software support','How game/music/guest audio moves between the stream and headphones'],alternative:'A solo streamer may only need a USB mic and headphones; complex streams can benefit from extra audio routing rather than simply more expensive microphones.',learn:['mic','interfaces','micplace','recording','gain'],next:null});
 }
 if(goalId==='podcast'){
  const guests=a.guests,sep=a.edit==='separate',many=guests==='many',remote=guests==='remote';
  return make(goal,a,{description:'Capture speech clearly, while ensuring guests can hear the right people.',steps:[role(guests==='solo'?'One microphone':'A microphone for each local speaker','Close, consistent voice pickup is a helpful starting point.'),role(guests==='solo'?'A simple recording connection':'Suitable independent microphone inputs or a podcast recorder',sep?'Preserve distinct voices when available so they can be edited later.':'A complete stereo mix can work if you accept combined voices.'),role('Recorder or recording software','Store the conversation.'),role('Headphones or guest monitoring','Avoid loudspeaker spill and let people hear calls or playback as needed.')],optional:[remote?'A call-in return route that avoids sending callers their own voice back':'Independent headphone mixes if several guests need them',many?'A podcast mixer or multitrack interface with sufficient microphone inputs':'A pop filter or other basic voice accessories'],skip:[guests==='solo'?'A large podcast console is unnecessary for many solo recordings.':'The number of mixer channels is not proof of independently recordable tracks.'],verify:['Actual number of local people speaking at once',sep?'Whether each voice is saved to its own recording track':'Whether a combined recording is acceptable',remote?'Remote-guest routing and echo prevention':'Headphone and microphone connections'],alternative:'A small interface can work for a basic podcast; a podcast station may add guest monitoring and one-button recording but still needs verification.',learn:['mic','recording','micplace','mix'],next:null});
 }
 if(goalId==='live'){
  const band=a.show==='band',monitor=a.monitor==='yes';
  return make(goal,a,{description:'A live sound system must deliver sound to the audience and may need a different mix for performers.',steps:[role('Microphones and any direct instrument feeds','Only amplify sources that need to reach the audience.'),role(band?'Mixer with enough source channels':'Suitable mixer or compact live-sound input path','Control how much of each voice/instrument reaches the audience.'),role('Audience speakers (PA)','Powered PA speakers or compatible amplification and passive PA speakers.'),...(monitor?[role('Separate monitor feed','A suitable mixer output for performers’ monitors or in-ear systems.')]:[])],optional:['Mic stands, proper cabling, transport and feedback management','Subwoofers or additional audience coverage only when the actual venue requires it'],skip:['A studio nearfield monitor is not a direct substitute for a stage monitor or audience PA.'],verify:['Indoor/outdoor suitability, power and safe speaker placement','Audience coverage and safe loudness','Whether performers need separate monitor mixes'],alternative:'A solo presenter may manage with a compact powered speaker/mic system. A full band needs more routing and attention to monitor mixes and feedback.',learn:['speakers','mic','interfaces','dispersion'],next:null});
 }
 const topic=a.topic;
 return make(goal,a,{description:'Start with a clear question, not with a shopping list.',steps:[role('One beginner explanation','Learn the basic idea in plain language.'),role('A practical example or listening lab','Use a recording or diagram to connect the explanation to real sound.'),role('Explore another question','Follow the lesson links when you want more detail.')],optional:['Read the free illustrated handbook from the Library'],skip:['You do not have to learn every specification before enjoying music.'],verify:['Only the parts of a lesson relevant to your curiosity'],alternative:'Try a listening experiment first if reading a specification sheet feels abstract.',learn:topic==='speakers'?['speakers','amp','soundstage','labs']:topic==='recording'?['recording','mic','mix','labs']:topic==='digital'?['digital','formatslab','sources']:topic==='sound'?['soundbasics','journey','labs']:['soundbasics','journey','labs'],next:null});
}
