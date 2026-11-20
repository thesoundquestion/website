/**
 * Connection classification, not a claim of matching signal voltage,
 * protocols, volume control or electrical safety. Inputs are the existing
 * verified/candidate amplifier input categories, outputs are visitor-selected.
 */
const outputs=Object.freeze({
  'RCA':'analog',
  '3.5 mm':'analog',
  optical:'optical',coaxial:'coaxial',
  usb:'usb',hdmi:'hdmi',bluetooth:'bluetooth'
});
const sourceLabel=out=>out==='RCA'?'stereo RCA':out==='3.5 mm'?'3.5 mm analogue':out;
export function sourceSignalMatch(output,ampInputs=[]){
  const out=String(output||'').trim();
  const inputTypes=Array.isArray(ampInputs)?ampInputs:[];
  const kind=outputs[out];
  if(!kind)return {status:'unknown',direct:false,
    note:'The source output is not identified; check its connector and whether it supplies a line-level, digital or amplified signal.'};
  if(!inputTypes.length)return {status:'unknown',direct:false,
    note:'Source output: '+sourceLabel(out)+'. Amplifier inputs are not documented in this match.'};
  if(inputTypes.includes(kind)){
    const extra=kind==='usb'?' Confirm USB host/device compatibility and playback support.':
      kind==='hdmi'?' Confirm HDMI audio/ARC mode on both devices.':
      kind==='bluetooth'?' Confirm transmitter-to-receiver pairing and supported codecs.':
      kind==='analog'?' Verify line-level voltage and use the correct stereo cable.':'';
    return {status:'direct_connector',direct:true,
      note:'The source’s '+sourceLabel(out)+' output and a listed '+kind+
      ' amplifier input provide a plausible native connection.'+extra};
  }
  const digital=['optical','coaxial','usb','hdmi','bluetooth'].includes(kind);
  return {status:'extra_hardware_or_alternate_output',direct:false,
    note:'The source lists '+sourceLabel(out)+' output, but this amplifier has no matching '+
      kind+' input recorded. '+(digital?
      'An appropriate converter or a different source output may be needed; a cable adapter alone does not convert digital audio to analogue.':
      'Check for a suitable line input or a supported signal conversion path.')};
}
