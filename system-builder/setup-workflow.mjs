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
    if(plan?.choice==='yes'&&plan?.model){
      if(plan.input==='usb')
        steps.push('Connect '+source+' over compatible USB digital audio to '+plan.model+'. Its built-in DAC converts the digital music; the headphone amplifier controls the headphone output.');
      else
        steps.push('Connect the verified stereo RCA line output of '+source+' to the analogue RCA input of '+plan.model+'. Do not use a power-amplifier speaker output or assume a headphone jack is a fixed line output.');
      steps.push('Plug '+hp+' into the headphone socket of '+plan.model+' using the correct connector. Start at low volume and check the gain, noise floor and output for these exact headphones.');
      equipment=plan.model+' is included as a documented connection example, not a verified electrical match to these headphones. Its price is NOT included in the headphone-only subtotal. '+plan.check;
    }else if(plan?.choice==='yes'){
      steps.push('Before selecting a separate headphone amplifier, establish what audio output '+source+' provides: USB digital audio needs a compatible DAC/headphone amplifier; an RCA line output needs an analogue headphone amplifier.');
      steps.push('Connect '+hp+' only to a real, volume-controlled headphone output after checking its plug, sensitivity and impedance.');
      equipment='No amplifier model can be responsibly matched without confirming the source signal. The amplifier and possible DAC are not included in this card’s parts or price.';
    }else{
      steps.push('Play music from '+source+' through a real, volume-controlled headphone output. An ordinary RCA or other line output is not automatically suitable for driving headphones.');
      steps.push('Connect '+hp+' using the correct headphone plug or an electrically compatible adapter, then set the volume low before listening.');
      equipment=plan?.choice==='no'
        ?'No separate headphone amplifier is included. Check the source headphone-output drive capability, hiss, low-volume control and connector before purchasing.'
        :plan?.choice==='unsure'
          ?'First test the available headphone output with suitable headphones. Add a DAC/headphone amplifier only if an output is missing or a documented drive/noise limitation warrants one.'
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
