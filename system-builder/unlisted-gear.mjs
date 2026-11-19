/**
 * Unlisted gear lookup and PROVISIONAL source-spec entry.
 * Searching the web does not import or certify specifications. The visitor
 * must copy the relevant values from a product manual/spec sheet and provide
 * the original HTTPS source before the match engine receives numeric data.
 * These records are never persisted to the shared verified catalogue.
 */
export const UNLISTED_FIELDS=Object.freeze({
  speaker:['speakerSpecUrl','speakerLoad'],
  amp:['ampSpecUrl','ampMinLoad','ampRatedWatts','ampRatedLoad'],
  source:['sourceSpecUrl','sourceOutput'],
  headphone:['headphoneSpecUrl','headphoneLoad','headphoneSensitivity','headphoneBasis']
});
const modelText=value=>String(value??'').trim().slice(0,120);
const numeric=(value,min,max)=>{
  const s=String(value??'').trim();
  if(!s)return null;
  const n=Number(s);
  return Number.isFinite(n)&&n>=min&&n<=max?n:null;
};
const safeSource=value=>{
  try{
    const url=new URL(String(value??'').trim());
    if(url.protocol!=='https:'||!url.hostname.includes('.')
      ||url.username||url.password)return null;
    return url.href;
  }catch{return null;}
};
export function googleGearSearchUrl(kind,model){
  const topic=kind==='speaker'?'loudspeaker nominal impedance sensitivity manufacturer specifications manual':
    kind==='amp'?'amplifier receiver supported speaker impedance continuous watts per channel manufacturer manual':
    kind==='source'?'audio player DAC output connection type manufacturer manual':
    kind==='headphone'?'headphone impedance sensitivity dB per mW or dB per volt manufacturer manual':
    'audio equipment manufacturer specifications manual';
  const q=[modelText(model),topic].filter(Boolean).join(' ');
  return 'https://www.google.com/search?q='+encodeURIComponent(q);
}
export function catalogueGearMatches(entries,query,limit=7){
  const q=modelText(query).toLocaleLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  if(q.length<2)return [];
  const words=q.split(/\s+/).filter(Boolean);
  const matches=(entries||[]).filter(x=>{
    const candidates=[x.model,...(Array.isArray(x.aliases)?x.aliases:[])];
    return candidates.some(candidate=>{
      const name=String(candidate||'').toLocaleLowerCase().replace(/[^a-z0-9]+/g,' ');
      return words.every(word=>name.includes(word));
    });
  });
  return matches.slice(0,limit);
}
export function unlistedSpecAssessment(kind,data,{requireForMatch=false}={}){
  const model=modelText(data.get(kind+'Other'));
  if(!model)return {state:'none',model:'',record:null,message:''};
  if(!Object.hasOwn(UNLISTED_FIELDS,kind))
    return {state:'unknown',model,record:null,
      message:'This name is not in the catalogue. Its specifications remain unknown.'};
  const url=safeSource(data.get(kind+'SpecUrl'));
  if(!url)return {state:'incomplete',model,record:null,
    message:'Search for '+model+' and paste the original HTTPS manufacturer specification or manual link. A name alone cannot be matched.'};
  if(kind==='speaker'){
    const load=numeric(data.get('speakerLoad'),2,16);
    const minimumText=String(data.get('speakerMinimum')||'').trim();
    const minimum=minimumText?numeric(minimumText,1,16):null;
    const sensText=String(data.get('speakerSensitivity')||'').trim();
    const sensitivity=sensText?numeric(sensText,60,120):null;
    const basis=String(data.get('speakerBasis')||'');
    if(load===null)return {state:'incomplete',model,record:null,
      message:'Copy the speaker nominal impedance in ohms from the linked specifications. Without it, an amplifier match would be a guess.'};
    if(minimumText&&(minimum===null||minimum>load))return {state:'incomplete',model,record:null,
      message:'Check the speaker minimum impedance. It must be a valid number and no greater than the nominal impedance.'};
    if(sensText&&(sensitivity===null||!['power','voltage'].includes(basis)))
      return {state:'incomplete',model,record:null,
        message:'If adding sensitivity, include its valid dB figure and whether the test uses 1 watt or 2.83 volts. Do not compare mixed measurement bases.'};
    const record={model,type:kind,url,ratings:[],details:null,
      values:{load,minimum,sensitivity,basis:sensitivity===null?null:basis},
      note:'Visitor-entered values from the linked document; not independently verified by The Sound Question.',
      evidence:'user_entered_unverified',userEntered:true};
    return {state:'provisional',model,record,
      message:'Provisional speaker specifications entered. Check the exact revision and original manual before connecting equipment.'};
  }
  if(kind==='amp'){
    const floor=numeric(data.get('ampMinLoad'),2,16);
    const watts=numeric(data.get('ampRatedWatts'),1,5000);
    const load=numeric(data.get('ampRatedLoad'),2,16);
    if(floor===null||watts===null||load===null)
      return {state:'incomplete',model,record:null,
        message:'Copy the amplifier minimum permitted speaker ohms, continuous watts per channel, and the ohm load used for that power rating. Do not substitute peak or music power.'};
    const record={model,type:kind,url,
      // This is visitor-entered data, not a verified manufacturer load rule.
      // Screening treats it as preliminary and will not claim a certified match.
      details:null,userNominalFloor:floor,
      ratings:[[watts,load,'continuous']],
      values:{},note:'Visitor-entered power and impedance figures; not independently verified by The Sound Question.',
      evidence:'user_entered_unverified',userEntered:true};
    return {state:'provisional',model,record,
      message:'Provisional amplifier specifications entered. Ratings and permitted speaker loads require checking against the exact manufacturer manual.'};
  }
  if(kind==='source'){
    const output=String(data.get('sourceOutput')||'');
    if(!['RCA','3.5 mm','optical','coaxial','usb','hdmi','bluetooth','other'].includes(output))
      return {state:'incomplete',model,record:null,
        message:'Choose the documented audio output connection for your unlisted source or DAC.'};
    const record={model,type:kind,url,ratings:[],details:null,
      values:{sourceConnection:output},note:'Visitor-entered output connection from the linked document; not independently verified.',
      evidence:'user_entered_unverified',userEntered:true};
    return {state:'provisional',model,record,message:'Provisional source output captured. Confirm connection level and exact socket before purchase.'};
  }
  if(kind==='headphone'){
    const load=numeric(data.get('headphoneLoad'),1,1000);
    const sensitivity=numeric(data.get('headphoneSensitivity'),50,140);
    const basis=String(data.get('headphoneBasis')||'');
    if(load===null||sensitivity===null||!['power','voltage'].includes(basis))
      return {state:'incomplete',model,record:null,
        message:'Enter the headphone impedance, sensitivity and whether the manufacturer states dB/mW or dB/V. One basis cannot be assumed from the other.'};
    const record={model,type:kind,url,ratings:[],details:null,
      values:{load,sensitivity,basis},note:'Visitor-entered headphone specifications; output compatibility and achievable volume are unverified.',
      evidence:'user_entered_unverified',userEntered:true};
    return {state:'provisional',model,record,message:'Provisional headphone values captured. Actual headphone output power, distortion and fit remain unchecked.'};
  }
  return {state:requireForMatch?'incomplete':'unknown',model,record:null,message:'Not checked'};
}
