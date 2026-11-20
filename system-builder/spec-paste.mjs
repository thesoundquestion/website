/**
 * Only recognises explicitly labelled speaker figures from user-pasted text.
 * No Google scraping, guessed units, derived ratings, or source verification.
 * Review is required: the user must press a button to populate editable fields.
 */
const numberValue=value=>Number(String(value).replace(',','.'));
const valid=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max;
const matchValues=(lines,label,unit,min,max)=>{
  const hits=[];
  for(const line of lines){
    const m=line.match(label);
    if(!m)continue;
    const tail=line.slice(m.index+m[0].length);
    const unitMatch=tail.match(unit);
    if(!unitMatch)continue;
    const n=numberValue(unitMatch[1]);
    if(valid(n,min,max))hits.push(n);
  }
  return [...new Set(hits)];
};
export function parseSpeakerSpecText(text){
  const lines=String(text||'').slice(0,5000).split(/[\n\r;]+/).map(s=>s.trim()).filter(Boolean);
  const fields={};
  const notes=[];
  const nominal=matchValues(lines,/\bnominal\s+(?:speaker\s+)?impedance\b/i,
    /(\d{1,2}(?:[.,]\d+)?)\s*(?:Ω|ohms?)/i,2,16);
  const minimum=matchValues(lines,/\bmin(?:imum)?\.?\s+(?:speaker\s+)?impedance\b/i,
    /(\d{1,2}(?:[.,]\d+)?)\s*(?:Ω|ohms?)/i,1,16);
  if(nominal.length===1)fields.speakerLoad=nominal[0];
  else if(nominal.length>1)notes.push('Conflicting nominal impedances. Enter the correct model rating yourself.');
  if(minimum.length===1&&(nominal.length===0||minimum[0]<=nominal[0]))
    fields.speakerMinimum=minimum[0];
  else if(minimum.length>1||minimum.length===1&&nominal.length===1&&minimum[0]>nominal[0])
    notes.push('Minimum impedance was conflicting or above nominal. Check it manually.');
  const sensitivities=[];
  for(const line of lines){
    const m=line.match(/\bsensitiv(?:ity|ities)\b/i);
    if(!m)continue;
    const tail=line.slice(m.index+m[0].length);
    const level=tail.match(/(\d{2,3}(?:[.,]\d+)?)\s*dB\b/i);
    if(!level)continue;
    const n=numberValue(level[1]);
    if(!valid(n,60,120))continue;
    const voltage=/\b2[.,]83\s*(?:V|volts?)\b/i.test(line);
    const power=/\b1(?:[.,]0)?\s*(?:W|watt(?:s)?)\b/i.test(line);
    if(voltage===power)continue;
    sensitivities.push({n,basis:voltage?'voltage':'power'});
  }
  const unique=[...new Map(sensitivities.map(x=>[x.n+'|'+x.basis,x])).values()];
  if(unique.length===1){
    fields.speakerSensitivity=unique[0].n;
    fields.speakerBasis=unique[0].basis;
  }else if(unique.length>1)
    notes.push('More than one sensitivity rating was found. Check the test basis manually.');
  else if(lines.some(x=>/\bsensitivity\b/i.test(x)))
    notes.push('Sensitivity was not filled: the dB value must state 1 W or 2.83 V at the measurement distance.');
  if(!Object.keys(fields).length)
    notes.unshift('No unambiguous labelled values found. Enter the relevant figures into the fields below.');
  return {fields,notes};
}
