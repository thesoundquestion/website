/**
 * Parse copied specifications for unlisted amplifiers, audio sources and
 * headphones. The values are user-entered, provisional, and never scrape
 * sources or certify electrical compatibility.
 */
const num=v=>Number(String(v).replace(',','.'));
const good=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
const unique=a=>[...new Set(a)];
const linesOf=text=>String(text||'').slice(0,5000).normalize('NFKC')
  .replace(/<br\s*\/?>|<\/(?:p|li|tr|div)>/gi,'\n')
  .replace(/<[^>]{1,200}>/g,' ')
  .replace(/[\u00a0\u202f]/g,' ').replace(/[•▪]/g,'\n')
  .replace(/\r\n?/g,'\n').replace(/[–—−]/g,'-')
  .split(/[\n;]+/).map(v=>v.trim().replace(/\s+/g,' ')).filter(Boolean);
const ohms=s=>[...s.matchAll(/(\d{1,3}(?:[.,]\d+)?)\s*(?:Ω(?!\w)|ohms?\b)/gi)].map(x=>num(x[1]));
const watts=s=>[...s.matchAll(/(\d{1,4}(?:[.,]\d+)?)\s*(?:W|watts?)\b/gi)].map(x=>num(x[1]));
const db=s=>[...s.matchAll(/(\d{2,3}(?:[.,]\d+)?)\s*dB(?:\s*SPL)?\b/gi)].map(x=>num(x[1]));
export function parseAmpSpecText(text){
  const fields={},notes=[],observations=[],floor=[],ratings=[];
  for(const line of linesOf(text)){
    const support=/\b(?:speaker|loudspeaker|load|speaker terminals)\b/i.test(line)&&
      !/\b(?:input impedance|output impedance|headphone impedance|preamp)\b/i.test(line);
    if(support&&/\b(?:impedance|ohms?|Ω|minimum|compatible|supported|permitted)\b/i.test(line)){
      const range=line.match(/(\d{1,2}(?:[.,]\d+)?)\s*(?:-|to)\s*(\d{1,2}(?:[.,]\d+)?)\s*(?:Ω(?!\w)|ohms?\b)/i);
      if(range){
        if(good(num(range[1]),2,16)&&num(range[2])>=num(range[1]))floor.push(num(range[1]));
      }else if(/\b(?:minimum|at least|or higher|or greater|compatible|supported|permitted|impedance)\b/i.test(line)){
        const z=unique(ohms(line).filter(x=>good(x,2,16)));
        if(z.length===1)floor.push(z[0]);
        else if(z.length>1)notes.push('Several speaker-load values appeared on one line; use the minimum for the selected output mode.');
      }
    }
    const rated=/\b(?:rated|continuous|rms|power output|output power|watts per channel|per channel|wpc|w\s*\/\s*ch)\b/i.test(line);
    const notContinuous=/\b(?:peak|music|dynamic|burst|short[- ]?term|maximum|instantaneous|pmpo|power consumption|ac input|total power)\b/i.test(line);
    if(!rated||notContinuous)continue;
    let w=unique(watts(line).filter(x=>good(x,1,5000)));
    const pair=line.match(/\b2\s*[x×]\s*(\d{1,4}(?:[.,]\d+)?)\s*(?:W|watts?)\b/i);
    if(pair)w=[num(pair[1])];
    const plus=line.match(/(\d{1,4}(?:[.,]\d+)?)\s*W?\s*\+\s*(\d{1,4}(?:[.,]\d+)?)\s*(?:W|watts?)\b/i);
    if(plus&&num(plus[1])===num(plus[2]))w=[num(plus[1])];
    const loads=unique(ohms(line).filter(x=>good(x,2,16)));
    if(w.length===1&&loads.length===1)ratings.push({w:w[0],z:loads[0]});
    else if(w.length>1||loads.length>1)
      notes.push('More than one rated power or test load appeared; review the stereo continuous rating.');
  }
  if(unique(floor).length===1)fields.ampMinLoad=floor[0];
  else if(unique(floor).length>1)
    notes.push('Conflicting permitted speaker loads may describe different A/B output modes. Choose the appropriate one.');
  const distinct=[...new Map(ratings.map(r=>[r.w+'|'+r.z,r])).values()];
  if(distinct.length===1){fields.ampRatedWatts=distinct[0].w;fields.ampRatedLoad=distinct[0].z;}
  else if(distinct.length>1)notes.push('Several continuous power/load pairs found. Choose the relevant stereo rating.');
  if(!Object.keys(fields).length)notes.push('No usable rated amplifier output or minimum speaker load found.');
  if(fields.ampRatedLoad!=null&&fields.ampMinLoad==null)
    observations.push('The amplifier has a rated power test at '+fields.ampRatedLoad+' Ω; this does not confirm the minimum permitted speaker impedance.');
  return {fields,notes,observations};
}
export function parseHeadphoneSpecText(text){
  const fields={},notes=[],observations=[],loads=[],sensitivities=[];
  for(const line of linesOf(text)){
    if(/\b(?:headphone\s+)?impedance\b/i.test(line)&&
      !/\b(?:amplifier output|output impedance|input impedance)\b/i.test(line)){
      const z=unique(ohms(line).filter(x=>good(x,1,1000)));
      if(z.length===1)loads.push(z[0]);
    }
    if(!/\b(?:sensitivity|efficiency|sound pressure level|spl)\b/i.test(line))continue;
    const d=unique(db(line).filter(x=>good(x,50,140)));
    if(d.length!==1)continue;
    const power=/\b1(?:[.,]0)?\s*mW\b|\/\s*mW\b|\bper\s+mW\b/i.test(line);
    const voltage=/(?<![\d.,])1(?:[.,]0)?\s*(?:v|volts?)\b|\/\s*v\b|\bper\s+volt\b/i.test(line);
    sensitivities.push({db:d[0],basis:power===voltage?null:power?'power':'voltage'});
  }
  if(unique(loads).length===1)fields.headphoneLoad=loads[0];
  else if(unique(loads).length>1)notes.push('More than one headphone impedance found; verify model variant.');
  const sensitivityKeys=unique(sensitivities.map(x=>x.db+'|'+x.basis));
  if(sensitivityKeys.length===1&&sensitivities.length){
    fields.headphoneSensitivity=sensitivities[0].db;
    if(sensitivities[0].basis)fields.headphoneBasis=sensitivities[0].basis;
    else observations.push('Reported headphone sensitivity found, but dB/mW versus dB/V is not stated. The figure cannot yet predict electrical drive demand.');
  }else if(sensitivityKeys.length>1)notes.push('Conflicting headphone sensitivity references found; select the applicable specification.');
  if(!Object.keys(fields).length)notes.push('No headphone impedance or sensitivity figures found.');
  return {fields,notes,observations};
}
const connectors=[
 ['RCA',/\b(?:rca|phono)\b/i],
 ['3.5 mm',/\b(?:3[.,]5\s*mm|aux(?:iliary)?\s+out(?:put)?)\b/i],
 ['optical',/\b(?:optical|toslink)\b/i],
 ['coaxial',/\b(?:coaxial|coax)\b/i],
 ['usb',/\busb\b/i],
 ['hdmi',/\bhdmi\b/i],
 ['bluetooth',/\bbluetooth\b/i]
];
export function parseSourceSpecText(text){
  const fields={},notes=[],observations=[],outputs=[];
  for(const line of linesOf(text)){
    const out=/\b(?:outputs?|line[\s-]?out|audio[\s-]?out|headphone[\s-]?out|transmit|tx)\b/i.test(line);
    const input=/\b(?:inputs?|line[\s-]?in|audio[\s-]?in|receive|rx)\b/i.test(line);
    if(!out||input)continue;
    for(const [name,pattern] of connectors)if(pattern.test(line))outputs.push(name);
  }
  const found=unique(outputs);
  if(found.length===1)fields.sourceOutput=found[0];
  else if(found.length>1)observations.push('Several outputs found: '+found.join(', ')+'. Choose the specific output you intend to connect.');
  else notes.push('No clearly labelled audio outputs found. Inputs are not treated as outputs.');
  return {fields,notes,observations};
}
/**
 * Parse the connection SIGNAL, never a subwoofer driver wattage claim.
 * A subwoofer's own low-pass/crossover knob is not a main-speaker high-pass.
 */
export function parseSubConnectionText(text){
  const fields={},notes=[],observations=[];
  const ampOut=[],subInputs=[];
  let hasHighPass=false;
  for(const line of linesOf(text)){
    const subOut=/\b(?:sub(?:woofer)?[\s/-]*out(?:put)?|lfe[\s/-]*out)\b/i.test(line);
    const preOut=/\b(?:stereo[\s-]*)?(?:pre[\s-]*out|preamp[\s-]*out)\b/i.test(line);
    const speakerOnly=/\b(?:speaker|loudspeaker)[\s-]*outputs?\s+only\b|\bonly\s+(?:speaker|loudspeaker)\s+outputs?\b/i.test(line);
    const highInput=/\b(?:high[\s-]*level|speaker[\s-]*level|speaker[\s-]*wire)\s*(?:inputs?|in|terminals?)\b/i.test(line);
    const rcaInput=/\b(?:lfe[\s/-]*in|rca[\s-]*(?:line[\s-]*)?(?:in|inputs?)|line[\s-]*(?:in|inputs?)\s*(?:rca)?)\b/i.test(line);
    if(subOut)ampOut.push('sub_rca');
    if(preOut)ampOut.push('preout_rca');
    if(speakerOnly)ampOut.push('speaker_only');
    if(highInput)subInputs.push('speaker_high');
    if(rcaInput)subInputs.push('rca_line');
    // Only a described filter on the MAINS is evidence for that field.
    if(/\b(?:main|front|satellite)\s*(?:speakers?|channels?|outputs?)\b/i.test(line)&&
       /\b(?:high[\s-]*pass|hpf|bass[\s-]*management)\b/i.test(line))
      hasHighPass=true;
    if(/\b(?:subwoofer|sub|lfe)\s+(?:low[\s-]*pass|crossover)\b/i.test(line))
      observations.push('Subwoofer crossover/low-pass control does not prove high-pass filtering of main speakers.');
  }
  const outputs=unique(ampOut),inputs=unique(subInputs);
  if(outputs.length===1)fields.subAmpOutput=outputs[0];
  else if(outputs.length>1)notes.push('Multiple amplifier output routes found. Select which one you intend to use.');
  if(inputs.length===2)fields.subInput='both';
  else if(inputs.length===1)fields.subInput=inputs[0]==='speaker_high'?'speaker_high':'rca_line';
  if(hasHighPass)fields.subHighPass='documented';
  if(!Object.keys(fields).length)notes.push('No clearly labelled signal outputs, subwoofer inputs or main-speaker high-pass were found.');
  return {fields,notes,observations:unique(observations)};
}
export function parseUnlistedSpecText(kind,text){
  if(kind==='amp')return parseAmpSpecText(text);
  if(kind==='source')return parseSourceSpecText(text);
  if(kind==='headphone')return parseHeadphoneSpecText(text);
  if(kind==='sub')return parseSubConnectionText(text);
  return {fields:{},notes:['No paste parser for this category.'],observations:[]};
}
