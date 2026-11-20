/**
 * Interpret speaker specification text copied from manufacturer pages, PDFs,
 * shopping tables, and search snippets. The text is USER-SUPPLIED, not sourced
 * or verified by this parser. Never invent or convert sensitivity ratings.
 *
 * Keep this deliberately conservative: ambiguous ranges, contradictory values,
 * and unstated sensitivity bases must be reviewed by the visitor.
 */
const LABEL=/\b(?:nominal\s+(?:(?:loud)?speaker\s+)?(?:impedance|load)|rated\s+(?:speaker\s+)?impedance|min(?:imum)?\.?\s+(?:(?:loud)?speaker\s+)?impedance|(?:speaker\s+)?impedance(?:\s+(?:nominal|rated|minimum|min\.?))?|sensitiv(?:ity|ities)|efficien(?:cy|cies))\b/gi;
const numberValue=value=>Number(String(value).replace(',','.'));
const valid=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max;
const distinct=values=>[...new Set(values)];
const OHM='(?:Ω|ohms?)';
const readImpedance=segment=>{
  let value=segment.trim()
    .replace(/^[\s:=|–—-]+/,'')
    .replace(/^\(\s*(?:nominal|rated|min(?:imum)?)\s*\)\s*[:=|]?\s*/i,'')
    .replace(/^\(\s*(?:Ω|ohms?)\s*\)\s*[:=|]?\s*/i,'')
    .replace(/^(?:nominal|rated|min(?:imum)?)\s*[:=]?\s*/i,'')
    .replace(/^(?:approx(?:imately)?\.?|about|~)\s*/i,'');
  // Do not choose one end of a manufacturer's 4–8 Ω range, or of 4/8 Ω.
  if(/^\d+(?:[.,]\d+)?\s*(?:[-–—/]|to\b)\s*\d/i.test(value))return null;
  const first=value.match(/^(\d{1,3}(?:[.,]\d+)?)(?![\d.,])\s*(?:Ω|ohms?)?/i);
  if(!first)return null;
  const amount=numberValue(first[1]);
  if(!valid(amount,1,16))return null;
  const rest=value.slice(first[0].length);
  // Refuse a separate second impedance figure in the same unlabelled cell.
  if(new RegExp('\\d+(?:[.,]\\d+)?\\s*'+OHM,'i').test(rest))return null;
  return amount;
};
function readSensitivity(segment){
  const levels=distinct([...segment.matchAll(/(\d{2,3}(?:[.,]\d+)?)\s*dB(?:\s*SPL)?\b/gi)]
    .map(x=>numberValue(x[1])).filter(x=>valid(x,60,120)));
  // Table layouts sometimes put the unit in the column name:
  // "Sensitivity (dB/2.83V/1m) | 89".
  if(!levels.length&&/\bdB\b/i.test(segment)){
    const tail=segment.match(/[:=|]\s*(\d{2,3}(?:[.,]\d+)?)\s*$/);
    if(tail){
      const n=numberValue(tail[1]);
      if(valid(n,60,120))levels.push(n);
    }
  }
  if(levels.length!==1)return null;
  const voltage=/\b2[.,]83\s*(?:v|volts?)\b/i.test(segment);
  const power=/(?<![\d.,])1(?:[.,]0)?\s*(?:w|watts?)\b/i.test(segment)||
    /\bdB(?:\s*SPL)?\s*\/\s*w\s*\/\s*m\b/i.test(segment);
  if(voltage===power)return {level:levels[0],basis:null};
  return {level:levels[0],basis:voltage?'voltage':'power'};
}
// A sentence such as "compatible with 8 ohms (measured around 4.2 ohms
// minimum)" contains TWO distinct facts. Compatibility is not a nominal
// impedance specification, and the approximate measured minimum isn't exact.
function contextualImpedance(segment){
  const compatible=[];
  const minimum=[];
  for(const m of segment.matchAll(/\bcompatible\s+(?:with|at|for)\s+(\d{1,3}(?:[.,]\d+)?)\s*(?:Ω|ohms?)\b/gi)){
    const n=numberValue(m[1]);
    if(valid(n,2,16))compatible.push(n);
  }
  for(const m of segment.matchAll(/\b(\d{1,3}(?:[.,]\d+)?)\s*(?:Ω|ohms?)\s+compatible\b/gi)){
    const n=numberValue(m[1]);
    if(valid(n,2,16))compatible.push(n);
  }
  // Suffix-style measured minimum; the prefix style "Minimum impedance"
  // is handled by the existing label parser.
  for(const m of segment.matchAll(/(\d{1,3}(?:[.,]\d+)?)\s*(?:Ω|ohms?)\s*(?:\)?\s*)\bmin(?:imum)?\b/gi)){
    const n=numberValue(m[1]);
    if(valid(n,1,16)){
      const before=segment.slice(Math.max(0,m.index-38),m.index);
      minimum.push({value:n,approx:/\b(?:about|around|approx(?:imately)?|roughly|~)\s*$/i.test(before)});
    }
  }
  return {compatible:distinct(compatible),minimum};
}
function sensitivityCandidates(segment){
  const values=[];
  for(const m of segment.matchAll(/(\d{2,3}(?:[.,]\d+)?)\s*dB(?:\s*SPL)?\b/gi)){
    const n=numberValue(m[1]);
    if(!valid(n,60,120))continue;
    const after=segment.slice(m.index+m[0].length,m.index+m[0].length+38);
    const environment=/\b(?:in[\s-]?room|room)\b/i.test(after)?'in-room':
      /\banechoic\b/i.test(after)?'anechoic':'unspecified environment';
    values.push({value:n,environment});
  }
  return [...new Map(values.map(x=>[x.value+'|'+x.environment,x])).values()];
}

function amplifierPowerGuidance(line){
  const recommended=line.match(/\b(?:recommended|suggested)\s+(?:(?:amplifier|amp)\s+)?(?:power|amplifier\s+power|amp\s+power)\b[^:\n]{0,30}[:=\s]+\s*(\d{1,4}(?:[.,]\d+)?)\s*(?:[-–—]|to)\s*(\d{1,4}(?:[.,]\d+)?)\s*(?:w|watts?)\b/i);
  if(!recommended)return null;
  const low=numberValue(recommended[1]),high=numberValue(recommended[2]);
  if(!valid(low,1,1000)||!valid(high,1,2000)||low>=high)return null;
  // A stated maximum INPUT power is not necessarily a thermal/continuous
  // handling rating. Preserve it separately and never treat it as RMS power.
  const maxInput=line.match(/\b(?:maximum|max(?:imum)?\.?)\s+(?:speaker\s+)?input\s+power\b(?:\s+(?:listed|rated|specified)\s+at)?\s*[:=\s]+\s*(\d{1,4}(?:[.,]\d+)?)\s*(?:w|watts?)\b/i);
  const maximum=maxInput?numberValue(maxInput[1]):null;
  return {low,high,maximum:valid(maximum,1,2000)?maximum:null};
}

const allMarkers=line=>[...line.matchAll(LABEL)];
function preparedLines(text){
  const raw=String(text||'').slice(0,5000).normalize('NFKC')
    .replace(/\r\n?/g,'\n')
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<\/(?:p|tr|li|div)>/gi,'\n')
    .replace(/<[^>]{1,200}>/g,' ')
    .replace(/[\u00a0\u202f]/g,' ')
    .replace(/[•▪]/g,'\n')
    .replace(/[–—−]/g,'-');
  const lines=raw.split(/[\n;]+/).map(x=>x.trim().replace(/\s+/g,' ')).filter(Boolean);
  const combined=[];
  for(let i=0;i<lines.length;i++){
    let line=lines[i];
    const markers=allMarkers(line);
    if(markers.length===1&&i+1<lines.length&&!allMarkers(lines[i+1]).length){
      const category=/sensitiv|efficien/i.test(markers[0][0])?'sensitivity':'impedance';
      const segment=line.slice(markers[0].index+markers[0][0].length);
      const hasValue=category==='sensitivity'
        ?/\d{2,3}(?:[.,]\d+)?\s*dB\b/i.test(segment)
        :readImpedance(segment)!==null;
      const next=lines[i+1];
      // Copied tables often place the value on the following line.
      const valueRow=/^(?:(?:[:=|]\s*)|(?:\(\s*(?:Ω|ohms?)\s*\)\s*))?\d/i.test(next);
      const basisRow=category==='sensitivity'&&
        /^(?:at\s+|@\s*)?(?:2[.,]83\s*(?:v|volts?)|1\s*(?:w|watts?))\b/i.test(next);
      if((!hasValue&&valueRow)||(hasValue&&basisRow)){
        line+=' '+next;
        i++;
      }
    }
    combined.push(line);
  }
  return combined;
}
export function parseSpeakerSpecText(text){
  const lines=preparedLines(text);
  const fields={};
  const notes=[];
  const observations=[];
  const nominal=[],minimum=[],sensitivities=[],compatibleNominal=[];
  const powerGuidance=[];
  let unlabeledNominal=false, sawSensitivity=false, sawImpedance=false, ambiguousImpedance=false;
  for(const line of lines){
    const power=amplifierPowerGuidance(line);
    if(power)powerGuidance.push(power);
    const markers=allMarkers(line);
    for(let i=0;i<markers.length;i++){
      const marker=markers[i];
      const label=marker[0].toLowerCase();
      let segment=line.slice(marker.index+marker[0].length,markers[i+1]?.index??line.length);
      if(/sensitiv|efficien/.test(label)){
        sawSensitivity=true;
        const result=readSensitivity(segment);
        if(result?.basis)sensitivities.push(result);
        else {
          // A single printed dB value can still be useful without a stated
          // stimulus, but a line explicitly giving BOTH 1 W and 2.83 V as
          // incompatible test bases cannot be interpreted automatically.
          const mixedBases=/\b2[.,]83\s*(?:v|volts?)\b/i.test(segment)&&
            /(?<![\d.,])1(?:[.,]0)?\s*(?:w|watts?)\b/i.test(segment);
          const candidates=mixedBases?[]:sensitivityCandidates(segment);
          if(mixedBases)
            notes.push('Sensitivity gives both a watt and voltage reference on the same line; choose the published test condition manually.');
          if(candidates.length>0){
            // Prefer the actual in-room number for this consumer listening
            // workflow; anechoic figures remain separately visible as a
            // comparison reference, never substituted for room output.
            const inRoom=candidates.filter(x=>x.environment==='in-room');
            const anechoic=candidates.filter(x=>x.environment==='anechoic');
            const best=inRoom.length===1?inRoom[0]:
              candidates.length===1?candidates[0]:null;
            if(best&&!Object.hasOwn(fields,'speakerSensitivity')){
              fields.speakerSensitivity=best.value;
              if(best.environment==='in-room')fields.speakerSensitivityEnvironment='in_room';
              else if(best.environment==='anechoic')fields.speakerSensitivityEnvironment='anechoic';
              observations.push('Using '+best.value+' dB ('+best.environment+') as the main speaker sensitivity for listening estimates.');
            }
            if(anechoic.length===1){
              fields.speakerAnechoic=anechoic[0].value;
              if(best?.environment==='in-room')
                observations.push('Anechoic reference: '+anechoic[0].value+' dB. Kept for comparison, not used instead of the in-room value.');
            }
            observations.push('Sensitivity readings: '+candidates.map(x=>
              x.value+' dB ('+x.environment+')').join(', ')+'.');
          }
        }
        continue;
      }
      sawImpedance=true;
      const context=contextualImpedance(segment);
      if(context.compatible.length){
        compatibleNominal.push(...context.compatible);
        observations.push(context.compatible.join(' / ')+' Ω described as compatible. Use as a provisional nominal-class speaker rating for an initial amplifier shortlist; confirm the exact model.');
      }
      for(const candidate of context.minimum){
        minimum.push(candidate.value);
        if(candidate.approx)
          observations.push('Minimum impedance around '+candidate.value+' Ω is approximate, based on the pasted description. Verify the measurement before relying on it.');
      }
      // "Impedance (nominal): 8 ohms" and "Impedance: 8 ohms nominal".
      const min=/\bmin(?:imum)?\b/.test(label)||/\bmin(?:imum)?\b/i.test(segment);
      const explicit=/\bnominal\b|\brated\b/.test(label)||
        /\bnominal\b|\brated\b/i.test(segment);
      const value=context.compatible.length?null:readImpedance(segment);
      if(value===null){
        // A second, explicitly identified minimum is not a conflicting
        // nominal impedance; keep it even when compatibility isn't nominal.
        if(/\d/.test(segment)&&!context.minimum.length&&!context.compatible.length)
          ambiguousImpedance=true;
        continue;
      }
      if(min)minimum.push(value);
      else {
        nominal.push(value);
        if(!explicit)unlabeledNominal=true;
      }
    }
  }
  const possibleNominal=distinct(nominal);
  const compatibleChoices=distinct(compatibleNominal);
  const possibleMinimum=distinct(minimum);
  if(possibleNominal.length===1){
    if(valid(possibleNominal[0],2,16))fields.speakerLoad=possibleNominal[0];
  }else if(possibleNominal.length>1)
    notes.push('Conflicting impedance values were found; check the nominal rating for the exact model.');
  else if(compatibleChoices.length===1&&
    (possibleMinimum.length===0||possibleMinimum.length===1&&possibleMinimum[0]<=compatibleChoices[0])){
    fields.speakerLoad=compatibleChoices[0];
    observations.push('The '+compatibleChoices[0]+' Ω nominal-class value is inferred from "compatible with", not an independently verified nominal specification.');
  }else if(compatibleChoices.length>1)
    notes.push('Several compatible load values appeared. Check the exact speaker nominal impedance manually.');
  if(unlabeledNominal&&possibleNominal.length===1)
    notes.push('The document says "impedance" without confirming "nominal". Check that this is the nominal rating before using the match.');
  if(possibleMinimum.length===1&&!ambiguousImpedance&&
     possibleNominal.length<=1&&
     (possibleNominal.length===0||possibleMinimum[0]<=possibleNominal[0]))
    fields.speakerMinimum=possibleMinimum[0];
  else if(possibleMinimum.length>1||
          possibleMinimum.length===1&&
          (possibleNominal.length>1||possibleMinimum[0]>possibleNominal[0]))
    notes.push('Minimum impedance was contradictory or unclear. Check it manually.');
  if(ambiguousImpedance)notes.push('An impedance value was unclear or given as a range; check that figure manually.');
  const uniqueSensitivity=[...new Map(sensitivities.map(x=>[x.level+'|'+x.basis,x])).values()];
  if(uniqueSensitivity.length===1){
    fields.speakerSensitivity=uniqueSensitivity[0].level;
    fields.speakerBasis=uniqueSensitivity[0].basis;
  }else if(uniqueSensitivity.length>1)
    notes.push('More than one sensitivity rating or test basis was found; check the applicable one manually.');
  else if(sawSensitivity&&!Object.hasOwn(fields,'speakerSensitivity'))
    notes.push('No single usable sensitivity figure was found. Choose an in-room figure when one is provided.');
  const uniquePower=[...new Map(powerGuidance.map(x=>[x.low+'|'+x.high+'|'+x.maximum,x])).values()];
  if(uniquePower.length===1){
    const p=uniquePower[0];
    fields.speakerRecommendedAmpMin=p.low;
    fields.speakerRecommendedAmpMax=p.high;
    observations.push('Recommended amplifier power: '+p.low+'–'+p.high+' W. This is manufacturer-style shopping guidance, not a continuous speaker-power or safe-output limit.');
    if(p.maximum!==null){
      fields.speakerMaxInput=p.maximum;
      observations.push('Listed maximum input power: '+p.maximum+' W. Its continuous/peak measurement basis is not established from the pasted text.');
    }
  }else if(uniquePower.length>1)
    notes.push('Conflicting recommended amplifier power ranges were found; check the exact model.');
  if(!Object.keys(fields).length)
    notes.unshift('No unambiguous usable ratings found. Copy the specification table, or type the figures into the boxes below.');
  if(!sawImpedance&&Object.keys(fields).length)
    notes.push('No speaker impedance rating was recognised. Enter the nominal impedance if you need an amplifier match.');
  return {fields,notes,observations:distinct(observations)};
}
