/**
 * Plain-language signal-flow explanation for each Listening Builder
 * recommendation. Describes how components connect and which parts amplify
 * the sound. Never converts an input name to a confirmed physical socket.
 */
const text=x=>typeof x==='string'?x.trim():'';
const partsOf=item=>Array.isArray(item?.parts)?item.parts.filter(p=>p&&text(p.name)):[];
const label=p=>text(p?.name);
const role=p=>text(p?.role).toLowerCase();
const sourcePart=parts=>parts.find(p=>/already owned source|music source|audio source|player|dac|source\/volume|stereo source/i.test(role(p)) &&
  !/amplification|amp and network|built.in amp/i.test(role(p)));
const ampPart=parts=>parts.find(p=>
  /(?:already owned|new|stereo|integrated|compact|separate)\s+(?:power\s+)?amplifier|amplification,|stereo amp|receiver|power amplifier/i.test(role(p))||
  /(?:integrated amplifier|stereo amplifier|receiver|power amplifier)/i.test(label(p))&&!/powered (?:speaker|monitor)/i.test(label(p)));
const speakerPart=parts=>parts.find(p=>
  /(?:passive|stereo|loudspeaker|speakers|monitor|cabinet|pair)/i.test(role(p))&&
  !/speaker wire|speaker cable|speaker link|signal cables|volume control|amplification,/.test(role(p))&&
  !/subwoofer/i.test(label(p))&&
  !/subwoofer/i.test(role(p))&&
  !/speaker wire|speaker cable|stand|cabinet hardware/i.test(label(p)));
const headphonePart=parts=>parts.find(p=>/headphone|earphone|iem|earclip/i.test(role(p)+' '+label(p)));
const speakerCount=parts=>parts.reduce((n,p)=>n+(Number.isInteger(p.count)?p.count:1),0);
const analogOrDigital={analog:'analogue line',optical:'optical digital',coaxial:'coaxial digital',
  usb:'USB audio',hdmi:'HDMI audio',bluetooth:'Bluetooth'};
function sourceInstructions(item,request,destination){
  const parts=partsOf(item),source=sourcePart(parts),name=source?label(source):'your music source';
  const preferred=analogOrDigital[request?.connection]||null;
  const inputs=Array.isArray(item?.connections)?item.connections:[];
  if(item?.sourceConnectionStatus==='extra_hardware_or_alternate_output')
    return 'Use '+name+' with '+destination+' only after resolving their output/input mismatch. A suitable signal converter or a different output may be needed; a cable alone does not convert digital to analogue.';
  if(item?.connectionStatus==='adapter_needed')
    return 'Connect '+name+' to '+destination+' through a compatible input. The selected output may need an adapter or converter; confirm whether it is analogue or digital first.';
  if(preferred&&inputs.includes(request.connection))
    return 'Send audio from '+name+' to the '+preferred+' input on '+destination+'. Confirm the actual socket, cable and signal format on both models.';
  return 'Connect '+name+' to a compatible input on '+destination+'. Check whether it uses RCA, optical, USB, Bluetooth or another connection before choosing the cable.';
}
function subStep(item,request){
  if(item?.bassSetup?.setup)
    return 'Add the powered subwoofer using this model-specific route: '+item.bassSetup.setup+
      ' Main-speaker bass filtering depends on the documented system settings.';
  if(request?.subMode&&request.subMode!=='no_sub')
    return 'If you add a subwoofer, connect it through a compatible Sub Out/Pre Out or supported speaker-level path. A subwoofer low-pass knob does not automatically remove bass from the main speakers.';
  return null;
}
/**
 * Returns distinct, item-aware instructions for ALL recommendation cards.
 * Parts in the candidate may include reused equipment and package accessories.
 */
export function explainSetupWorkflow(item={},request={}){
  const parts=partsOf(item);
  const architecture=text(item.architecture);
  const amp=text(item.amplifierModel)||text(item.ownedAmpName)||
    text(item?.curatedPairing?.amplifierModel)||label(ampPart(parts))||'the amplifier';
  const sp=text(item.speakerModel)||text(item?.curatedPairing?.speakerModel)||
    label(speakerPart(parts))||'the passive stereo speakers';
  const hp=label(headphonePart(parts))||text(item.soundTarget)||'the headphones';
  const primary=label(speakerPart(parts))||text(item.soundTarget)||
    'the powered speakers';
  const steps=[];
  let equipment='';
  if(architecture==='passive_separates'){
    steps.push(sourceInstructions(item,request,amp));
    steps.push(amp+' controls the listening volume and sends amplified left and right signals over speaker wire to '+sp+'. The speakers do not plug directly into the source.');
    const sub=subStep(item,request);
    if(sub)steps.push(sub);
    equipment='You need suitable speaker wire and a source-to-amplifier connection. Check the amplifier speaker-load rating before wiring the pair.';
  }else if(architecture==='consumer_powered_pair'){
    steps.push(sourceInstructions(item,request,primary));
    steps.push(primary+' uses its built-in amplification to drive the stereo speakers. Provide mains power and use the included speaker link or the manufacturer’s specified left/right connection.');
    const sub=subStep(item,request);
    if(sub)steps.push(sub);
    equipment='No separate power amplifier is needed. Check that the package includes both speakers, the connecting cable and volume control.';
  }else if(architecture==='active_studio'){
    steps.push('Send stereo audio from '+(label(sourcePart(parts))||'your music source')+
      ' through a suitable line-level output and volume controller to '+primary+'.');
    steps.push('Each powered studio monitor amplifies its own audio. Provide power and the correct signal cable for each cabinet; do not attach amplifier speaker terminals to the monitor inputs.');
    const sub=subStep(item,request);
    if(sub)steps.push(sub);
    equipment='Two monitor cabinets and a practical stereo volume-control path are needed; some models are sold one at a time.';
  }else if(architecture==='headphone_first'){
    const plan=item.headphoneAmpPlan;
    const source=plan?.sourceLabel||label(sourcePart(parts))||'your phone, computer, player or DAC';
    const chosen=plan?.components||[];
    const dac=chosen.find(x=>x.type==='dac');
    const amp=chosen.find(x=>x.type==='amp');
    const combo=chosen.find(x=>x.type==='combo');
    if(combo){
      steps.push('Connect '+source+' over compatible USB digital audio to '+combo.model+'. Its built-in DAC converts the digital signal, and its headphone amplifier provides volume-controlled headphone output.');
      steps.push('Plug '+hp+' into the supported headphone socket on '+combo.model+' using the correct plug. Start with low volume and verify gain, hiss and sufficient output for these headphones.');
      equipment=combo.model+' is the combined DAC/headphone amplifier included in this example. Its current price is NOT included in the headphone-only subtotal. '+plan.check;
    }else if(dac&&amp){
      steps.push('Connect '+source+' over compatible USB digital audio to '+dac.model+'. The DAC converts digital audio to analogue stereo RCA line-level output.');
      steps.push('Connect the left and right RCA outputs of '+dac.model+' to the analogue RCA inputs of '+amp.model+'. The DAC does not drive the headphones directly.');
      steps.push('Connect '+hp+' to the volume-controlled headphone socket on '+amp.model+'. Start at low volume and check its gain, noise floor, plug and output for the exact headphones.');
      equipment='This is a two-box DAC + headphone-amplifier stack. Neither device has a current local price included in the headphone-only subtotal; both power feeds and cables need confirming. '+plan.check;
    }else if(amp){
      steps.push('Connect the documented stereo RCA line output of '+source+' to the analogue RCA inputs on '+amp.model+'. Do not use amplifier speaker terminals or assume a headphone jack is a normal line output.');
      steps.push('Plug '+hp+' into the suitable headphone socket of '+amp.model+' and adjust volume from low. Verify gain, hiss and output capability for these exact headphones.');
      equipment=amp.model+' is an analogue headphone amplifier, NOT a DAC. Its current price is NOT included in the headphone-only subtotal. '+plan.check;
    }else if(dac){
      steps.push('Connect '+source+' over compatible USB digital audio to '+dac.model+'. Its RCA outputs provide analogue LINE LEVEL, not a headphone output.');
      steps.push('Connect the DAC’s RCA outputs to an existing suitable headphone amplifier, then connect '+hp+' to that amplifier’s headphone socket. Without that amplifier the shown DAC alone is NOT a working wired-headphone setup.');
      equipment='A standalone DAC has been selected, but no new headphone amplifier is included. Confirm you already own a suitable downstream headphone amplifier before buying; the DAC price is excluded from the headphone-only subtotal. '+plan.check;
    }else if(plan?.choice==='yes'){
      steps.push('Before selecting a separate headphone amplifier, establish what audio output '+source+' provides: a USB digital source needs DAC conversion and an RCA line source can feed an analogue headphone amplifier.');
      steps.push('Connect '+hp+' only to a real, volume-controlled headphone output after checking plug, sensitivity, impedance and required listening level.');
      equipment='No amplifier model can be responsibly matched without confirming the source signal. '+(plan?.issue||'')+' No additional electronics are included or priced.';
    }else{
      steps.push('Play music from '+source+' through a real, volume-controlled headphone output. An ordinary RCA or other line output is not automatically suitable for driving headphones.');
      steps.push('Connect '+hp+' using the correct headphone plug or an electrically compatible adapter, then set the volume low before listening.');
      equipment=plan?.choice==='no'
        ?'No separate headphone amplifier is included. '+(plan?.issue||'')+' Check the source headphone-output drive capability, hiss, low-volume control and connector before purchasing.'
        :plan?.choice==='unsure'
          ?'First test the available headphone output with suitable headphones. Add a DAC/headphone amplifier only if an output is missing or a documented drive/noise limitation warrants one. '+(plan?.issue||'')
          :'If the source has no usable headphone output or lacks the required voltage/current, a separate headphone amplifier may be needed.';
    }
  }else if(architecture==='party_pa'){
    const source=label(sourcePart(parts))||'your music source or microphone';
    steps.push('Send '+source+' to the documented mixer or audio inputs of '+primary+'. Check the available sockets and signal levels.');
    steps.push('The PA cabinet(s) use their built-in amplification. Provide the specified mains or battery power, place them securely and adjust the system’s input gain and main volume.');
    const speakerParts=parts.filter(p=>/powered (?:pa|party)|pa cabinet|powered battery/i.test(role(p)+' '+label(p)));
    const count=speakerCount(speakerParts);
    equipment=count===1?'This example includes one powered speaker. Stereo playback and broader audience coverage may need another cabinet and suitable connections.':
      'Confirm speaker quantity, coverage, stands, cables and available power for the space.';
  }else{
    steps.push('Keep the listed equipment for the listening path it is designed to serve. Identify the source output, volume control, amplification and final speakers or headphones before connecting it.');
    if(parts.length)steps.push('The equipment considered here is: '+parts.map(p=>label(p)).join(', ')+'. Some items may be retained for separate use rather than joined into one new system.');
    equipment='This option does not establish a complete connected audio path. Check the architecture and any missing equipment first.';
  }
  return {steps,equipment,architecture};
}
