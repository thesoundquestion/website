/**
 * Unlisted gear lookup and PROVISIONAL source-spec entry.
 * Searching the web does not import or certify specifications. The visitor
 * must provide enough actual specifications for the requested match.
 * A source URL is helpful but optional; missing provenance is disclosed.
 * These records are never persisted to the shared verified catalogue.
 */
import {buildSearches,googleSearchUrl} from '../system-check/spec-search.mjs';

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
// Same targeted queries as System Check; nothing is automatically imported.
export function googleGearSearchUrl(kind,model){
  const entry=buildSearches(kind,model)[0];
  return entry?googleSearchUrl(entry.query):'';
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
  const sourceNote=url
    ?'Source URL supplied; the numbers remain user-entered, not independently verified.'
    :'No source URL provided. The figures remain user-entered and unverified.';
  // Useful actual ratings may allow a provisional match even without a link.
  // Each equipment branch below still requires the necessary specifications.
  if(kind==='speaker'){
    const load=numeric(data.get('speakerLoad'),2,16);
    const minimumText=String(data.get('speakerMinimum')||'').trim();
    const minimum=minimumText?numeric(minimumText,1,16):null;
    const sensText=String(data.get('speakerSensitivity')||'').trim();
    const sensitivity=sensText?numeric(sensText,60,120):null;
    const basis=String(data.get('speakerBasis')||'');
    const listeningContext=String(data.get('speakerSensitivityEnvironment')||'');
    const anechoicText=String(data.get('speakerAnechoic')||'').trim();
    const anechoicReference=anechoicText?numeric(anechoicText,60,120):null;
    const recommendedMin=numeric(data.get('speakerRecommendedAmpMin'),1,1000);
    const recommendedMax=numeric(data.get('speakerRecommendedAmpMax'),1,2000);
    const listedMaxInput=numeric(data.get('speakerMaxInput'),1,2000);
    const anyPower=Boolean(String(data.get('speakerRecommendedAmpMin')||'').trim()||
      String(data.get('speakerRecommendedAmpMax')||'').trim());
    if(anyPower&&(!recommendedMin||!recommendedMax||recommendedMin>=recommendedMax))
      return {state:'incomplete',model,record:null,
        message:'Check the recommended amplifier range. Enter both endpoints in watts, with a smaller minimum than maximum.'};
    if(String(data.get('speakerMaxInput')||'').trim()&&!listedMaxInput)
      return {state:'incomplete',model,record:null,
        message:'The listed maximum speaker input watts must be a valid positive number.'};
    if(load===null)return {state:'incomplete',model,record:null,
      message:'Copy the speaker nominal impedance in ohms from the linked specifications. Without it, an amplifier match would be a guess.'};
    if(minimumText&&(minimum===null||minimum>load))return {state:'incomplete',model,record:null,
      message:'Check the speaker minimum impedance. It must be a valid number and no greater than the nominal impedance.'};
    // A missing test basis cannot invalidate an otherwise useful amplifier
    // search. Retain the displayed anechoic/room figure without feeding it into
    // quantitative headroom calculations until its 1W / 2.83V reference is known.
    if(sensText&&sensitivity===null)
      return {state:'incomplete',model,record:null,
        message:'Check the sensitivity dB number; it is outside the possible range.'};
    if(basis&&!['power','voltage'].includes(basis))
      return {state:'incomplete',model,record:null,
        message:'Choose a valid sensitivity test basis, or leave it unknown.'};
    if(listeningContext&&!['in_room','anechoic'].includes(listeningContext))
      return {state:'incomplete',model,record:null,message:'Choose a valid sensitivity measurement setting.'};
    if(anechoicText&&anechoicReference===null)
      return {state:'incomplete',model,record:null,message:'Check the anechoic reference dB value.'};
    // 8 ohm *nominal* is the conventional point where 2.83 V is
    // approximately 1 W; treat an absent published stimulus as an
    // explicitly marked planning assumption, not a measured specification.
    const assumedBasis=sensitivity!==null&&!basis&&load===8;
    const resolvedBasis=basis||(assumedBasis?'voltage':null);
    const comparableSensitivity=sensitivity!==null&&Boolean(resolvedBasis);
    const record={model,type:kind,url,sourceStatus:url?'provided':'missing',ratings:[],details:null,
      values:{load,minimum,sensitivity:comparableSensitivity?sensitivity:null,
        basis:comparableSensitivity?resolvedBasis:null,basisAssumed:assumedBasis,
        sensitivityEnvironment:listeningContext||null,
        // In-room ratings already include the manufacturer's room response.
        // Any calculator using this datum must NOT add a second room credit.
        roomAdjustmentAlreadyIncluded:listeningContext==='in_room',
        anechoicReferenceDb:anechoicReference,
        reportedSensitivity:sensitivity,
        recommendedAmpMinW:recommendedMin,recommendedAmpMaxW:recommendedMax,
        listedMaxInputW:listedMaxInput},
      note:'Visitor-entered values. '+sourceNote,
      evidence:'user_entered_unverified',userEntered:true};
    return {state:'provisional',model,record,
      message:'Provisional speaker specifications entered. '+
        (assumedBasis?'For the 8 Ω nominal-class load, sensitivity is treated as approximately 1 W / 2.83 V at 1 m. ':'')+
        (listeningContext==='in_room'?'In-room gain is already included in the reported sensitivity. ':'')+
        sourceNote+' Confirm the exact model before connecting equipment.'};
  }
  if(kind==='amp'){
    const floor=numeric(data.get('ampMinLoad'),2,16);
    const watts=numeric(data.get('ampRatedWatts'),1,5000);
    const load=numeric(data.get('ampRatedLoad'),2,16);
    if(watts===null||load===null)
      return {state:'incomplete',model,record:null,
        message:'Enter the amplifier’s published watts per channel and the speaker impedance used for that rating. Peak/music watts do not substitute for rated stereo power.'};
    const inferredFloor=floor===null;
    const record={model,type:kind,url,sourceStatus:url?'provided':'missing',
      // Testing 85 W/ch at 8 Ω supports an 8-ohm provisional search route,
      // but says NOTHING about permission for 6- or 4-ohm speakers. Use the
      // test load as a conservative discovery floor only when no explicit
      // minimum permitted speaker load was supplied.
      details:null,userNominalFloor:floor??load,
      ratings:[[watts,load,'continuous']],
      values:{speakerLoadFloor:floor??load,permittedFloorUnknown:inferredFloor},
      note:'Visitor-entered power and impedance figures. '+sourceNote,
      evidence:'user_entered_unverified',userEntered:true};
    return {state:'provisional',model,record,
      message:'Provisional amplifier specifications entered. '+
        (inferredFloor?'No minimum speaker impedance was stated; the '+load+' Ω power test load is used only as a conservative starting point. ':'')+
        sourceNote+' Ratings and permitted speaker loads require checking before connecting equipment.'};
  }
  if(kind==='source'){
    const output=String(data.get('sourceOutput')||'');
    if(!['RCA','3.5 mm','optical','coaxial','usb','hdmi','bluetooth','other'].includes(output))
      return {state:'incomplete',model,record:null,
        message:'Choose the documented audio output connection for your unlisted source or DAC.'};
    const record={model,type:kind,url,sourceStatus:url?'provided':'missing',ratings:[],details:null,
      values:{sourceConnection:output},note:'Visitor-entered output connection. '+sourceNote,
      evidence:'user_entered_unverified',userEntered:true};
    return {state:'provisional',model,record,message:'Provisional source output captured. '+sourceNote+' Confirm connection level and exact socket before purchase.'};
  }
  if(kind==='headphone'){
    const load=numeric(data.get('headphoneLoad'),1,1000);
    const sensitivity=numeric(data.get('headphoneSensitivity'),50,140);
    const basis=String(data.get('headphoneBasis')||'');
    if(load===null)return {state:'incomplete',model,record:null,
      message:'Enter the headphone impedance in ohms to start the comparison.'};
    const hasSens=String(data.get('headphoneSensitivity')||'').trim().length>0;
    if(hasSens&&sensitivity===null)return {state:'incomplete',model,record:null,
      message:'The headphone sensitivity number is outside the supported dB range.'};
    if(basis&&!['power','voltage'].includes(basis))return {state:'incomplete',model,record:null,
      message:'Choose a valid headphone sensitivity basis or leave it unknown.'};
    const comparable=sensitivity!==null&&Boolean(basis);
    const record={model,type:kind,url,sourceStatus:url?'provided':'missing',ratings:[],details:null,
      values:{load,sensitivity:comparable?sensitivity:null,basis:comparable?basis:null,
        reportedSensitivity:sensitivity},
      note:'Visitor-entered headphone specifications. '+sourceNote+' Output compatibility and achievable volume are unverified.',
      evidence:'user_entered_unverified',userEntered:true};
    return {state:'provisional',model,record,
      message:'Provisional headphone values captured. '+
        (sensitivity!==null&&!comparable?'Reported sensitivity retained without a dB/mW or dB/V basis; no drive-level estimate is made. ':'')+
        sourceNote+' Actual headphone output power, distortion and fit remain unchecked.'};
  }
  return {state:requireForMatch?'incomplete':'unknown',model,record:null,message:'Not checked'};
}
