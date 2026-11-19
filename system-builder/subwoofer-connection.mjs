/**
 * Beginner-first subwoofer signal path resolver.
 *
 * No speaker-level output can connect directly to an RCA/line input.
 * A low-pass knob on the subwoofer does not establish high-pass filtering of
 * the main speakers. "Unknown" remains unknown, even with a model name.
 * Do not infer support from the number of sockets or generic amplifier watts.
 */
export const SUB_SIGNAL_OUTPUTS=Object.freeze(['unknown','sub_rca','preout_rca','speaker_only']);
export const SUB_SIGNAL_INPUTS=Object.freeze(['unknown','rca_line','speaker_high','both']);
export const SUB_HIGHPASS=Object.freeze(['unknown','documented','none']);
const WIIM_HELP='https://faq.wiimhome.com/en/support/solutions/articles/72000634761';
const KANTO_ORA='https://kantoaudio.com/en-ca/blogs/press-releases/ora';
const EDIFIER_T5='https://www.edifier.com/int/ca/p/subwoofers/t5';
const DENON_S650H='https://manuals.denon.com/AVRS650H/NA/EN/download.php?filename=%2FAVRS650H%2FNA%2FEN%2Fpdf%2FAVRS650H_NA_EN.pdf';
const EDIFIER_R1280='https://usa-oss.edifier.com/Uploads/images/2021/07/15/2021071511185516263191358605.pdf';
const documented=Object.freeze({
  'wiim amp':{output:'sub_rca',highPass:'documented',label:'Original WiiM Amp',url:WIIM_HELP,
    highPassNote:'Enable the subwoofer and its crossover in WiiM Home. Check the Main Speakers Output Bass setting if you want bass reduced in the main speakers.'},
  'wiim amp (original)':{output:'sub_rca',highPass:'documented',label:'Original WiiM Amp',url:WIIM_HELP,
    highPassNote:'Enable the subwoofer and its crossover in WiiM Home. Check the Main Speakers Output Bass setting if you want bass reduced in the main speakers.'},
  'denon avr-s650h':{output:'sub_rca',highPass:'documented',label:'Denon AVR-S650H (North America)',url:DENON_S650H,
    highPassNote:'Use the receiver’s Subwoofer Yes, Front Small and crossover settings. Confirm the correct sound mode.'},
  'denon avr-s650h (north america)':{output:'sub_rca',highPass:'documented',label:'Denon AVR-S650H (North America)',url:DENON_S650H,
    highPassNote:'Use the receiver’s Subwoofer Yes, Front Small and crossover settings. Confirm the correct sound mode.'},
  'kanto ora':{output:'sub_rca',highPass:'documented',label:'Original Kanto ORA',url:KANTO_ORA,
    highPassNote:'The original ORA automatically splits bass at 100 Hz when its subwoofer output is used. This does not establish the routing of other ORA revisions.'},
  'edifier r1280dbs':{output:'sub_rca',highPass:'unknown',label:'Edifier R1280DBs',url:EDIFIER_R1280,
    highPassNote:'Edifier describes bass reduction with a connected sub, but no verified crossover setting or high-pass curve is available in this Builder.'}
});
export const KNOWN_SUB_INPUTS=Object.freeze({
  'edifier t5':{input:'rca_line',label:'Edifier T5',url:EDIFIER_T5,
    note:'The T5 has RCA Signal In and RCA Signal Out. Its Signal Out can feed suitable powered speakers from a line-level source. It has NO documented speaker-level input or verified high-pass output for the main speakers.'}
});
const clean=x=>String(x??'').trim().toLowerCase();
const knownAmp=name=>documented[clean(name)]||null;
const knownSub=name=>KNOWN_SUB_INPUTS[clean(name)]||null;
const value=(x,allowed)=>allowed.includes(x)?x:'unknown';
export function subwooferConnections({
  ampName='',subName='',ampOutput='unknown',subInput='unknown',
  highPass='unknown',subOwned='no'
}={}){
  const a=knownAmp(ampName),s=knownSub(subName);
  const declaredOutput=value(ampOutput,SUB_SIGNAL_OUTPUTS);
  const declaredInput=value(subInput,SUB_SIGNAL_INPUTS);
  const output=a?.output||declaredOutput;
  const input=s?.input||declaredInput;
  const mismatch=Boolean(a&&declaredOutput!=='unknown'&&declaredOutput!==a.output)||
    Boolean(s&&declaredInput!=='unknown'&&declaredInput!==s.input);
  const assumedSub=Boolean(!s&&subOwned==='no'&&declaredInput==='unknown');
  const warnings=[];
  const facts=[];
  if(a)facts.push(a.label+' has a manufacturer-documented subwoofer output.');
  if(s)facts.push(s.label+' has a documented '+(s.input==='rca_line'?'RCA line-level':'speaker-level')+' input.');
  if(mismatch)warnings.push('Your selections do not agree with the saved manufacturer connection facts. Check the exact model/revision and back-panel labels before wiring.');
  let kind='check';
  let title='Check the subwoofer connections first';
  let signal='Find the amplifier’s output and the subwoofer’s input. Look for Sub Out, Pre Out, speaker terminals, RCA Line In or Speaker Level In.';
  let cable='Do not buy a cable yet. First identify the actual sockets.';
  let next='Look up both models or check their back panels. A model name alone may not establish all the connections.';
  let direct=false;
  if(output==='sub_rca'&&(input==='rca_line'||input==='both')){
    kind='direct_rca';direct=true;
    title='Easy RCA subwoofer connection';
    signal='Connect the amplifier’s Sub Out to the powered subwoofer’s RCA Line In (or designated LFE input). The main speakers stay connected to their normal amplifier outputs.';
    cable='Usually one RCA subwoofer cable. Check whether the subwoofer manual specifies a particular left/LFE input.';
    next='Check the input labels, connect one suitable RCA lead, then set subwoofer level and crossover using the amplifier or speaker-system instructions.';
  }else if(output==='preout_rca'&&(input==='rca_line'||input==='both')){
    kind='stereo_preout';direct=true;
    title='RCA connection, but verify the volume-controlled outputs';
    signal='A suitable stereo Pre Out can feed a subwoofer’s left/right RCA line inputs. These outputs must be able to follow the system volume control.';
    cable='Usually two RCA leads if the sub accepts left and right line inputs. Do not combine left and right outputs using an ordinary passive Y-cable.';
    next='Confirm the amplifier has variable stereo PRE OUT (not fixed REC OUT) and the sub accepts stereo line signals. Keep the main amplifier/speaker path intact.';
    warnings.push('Pre Out usually does not automatically filter bass out of passive speakers.');
  }else if(output==='speaker_only'&&(input==='speaker_high'||input==='both')){
    kind='speaker_level';direct=true;
    title='Speaker-wire connection to the subwoofer';
    signal='Run additional speaker wire from the amplifier speaker outputs to the subwoofer’s designated HIGH LEVEL / SPEAKER IN terminals. The regular speakers stay on their proper speaker outputs.';
    cable='Extra left/right speaker wire, with the exact wiring arrangement shown in the subwoofer manual.';
    next='Confirm the subwoofer high-level input is designed for your amplifier’s output circuit, especially bridged/differential or Class-D amplifiers. Follow the manufacturer’s wiring diagram.';
    warnings.push('High-level subwoofer inputs are not ordinary passive-speaker loads, but not every amplifier and wiring/ground arrangement is compatible.');
  }else if(output==='speaker_only'&&input==='rca_line'){
    kind='converter';direct=false;
    title='Not a direct connection: a converter may be needed';
    signal='The amplifier has speaker outputs, while the subwoofer accepts only a much smaller RCA line-level signal. Connecting them directly can damage equipment.';
    cable='A properly specified speaker-to-line-level converter, plus appropriate speaker wire and RCA leads. Compatibility with the amplifier output topology must be verified.';
    next='Either choose a powered subwoofer with compatible speaker-level inputs, use a manufacturer-approved converter, or change to an amplifier with a proper Sub Out.';
  }else if(output==='sub_rca'&&input==='speaker_high'){
    kind='mismatch';direct=false;
    title='The available subwoofer inputs do not match';
    signal='The amplifier provides a low-level RCA subwoofer output, but the subwoofer is described as accepting only high-level speaker signals.';
    cable='Do not connect these directly; select a subwoofer with a suitable RCA input or get exact manufacturer instructions for another supported path.';
    next='Verify the sub model and its inputs before shopping for cables.';
  }else if(output==='preout_rca'&&input==='speaker_high'){
    kind='mismatch';direct=false;
    title='The Pre Out and speaker-level input do not match';
    signal='Stereo Pre Out is a line-level signal; a speaker-level input is designed for amplified speaker outputs. These are not interchangeable.';
    cable='No direct cable is recommended for this combination.';
    next='Choose a subwoofer with a line input or identify a manufacturer-supported alternative route.';
  }else if(output==='speaker_only'&&input==='unknown'){
    kind='seek_high_level';direct=false;
    title='Look for a subwoofer with speaker-level inputs';
    signal='Your amplifier has no stated subwoofer RCA connection. A powered sub with suitable speaker-level inputs may connect using extra speaker wire.';
    cable='Speaker wire if its high-level input is compatible; otherwise a specified conversion device may be needed.';
    next='Check the subwoofer’s back panel for HIGH LEVEL / SPEAKER IN. Verify the amplifier’s speaker output topology before wiring.';
  }else if((output==='sub_rca'||output==='preout_rca')&&input==='unknown'){
    kind='seek_rca';direct=false;
    title='Choose a subwoofer with a matching RCA input';
    signal='Your amplifier has a suitable line-level output type to investigate. A powered subwoofer with RCA Line In / LFE In is usually the simplest choice.';
    cable='Usually one RCA cable for Sub Out or two for stereo Pre Out, once the exact subwoofer is chosen.';
    next='Check the actual subwoofer input labels and whether its manual accepts mono or stereo feeds.';
  }else if(output==='unknown'&&(input==='rca_line'||input==='speaker_high'||input==='both')){
    kind='unknown_amp';direct=false;
    title='The subwoofer inputs are known, but the amplifier output is not';
    signal='Do not assume that an amplifier has Sub Out simply because it has RCA inputs. RCA inputs receive audio; Sub Out sends audio.';
    cable='Cable choice depends on the amplifier’s actual output.';
    next='Find the amplifier’s output sockets or manual first.';
  }
  if(assumedSub)warnings.push('You have not chosen a particular subwoofer yet. The connection route may change with the model you buy.');
  let mainBass='The main speakers will normally keep playing bass. A subwoofer’s low-pass control only changes what the sub plays; it does not automatically take bass away from the main speakers.';
  let bassStatus='not_verified';
  if(a?.highPass==='documented'&&!mismatch&&output==='sub_rca'){
    bassStatus='supported_when_configured';
    mainBass=a.highPassNote;
  }else if(highPass==='documented'){
    mainBass='You indicated that main-speaker high-pass filtering is available. Confirm the exact manual, wiring path and enabled setting before treating it as active.';
    bassStatus='user_claim_unverified';
  }else if(highPass==='none'){
    mainBass='You selected a setup without a main-speaker high-pass filter. The sub can add bass, but the main speakers will still receive their normal bass signal.';
    bassStatus='not_present';
  }else if(a?.highPass==='unknown'){
    mainBass=a.highPassNote+' No high-pass benefit is being assumed.';
  }
  if(s)warnings.push(s.note);
  const sourceLinks=[...(a?[{title:a.label+' connection/crossover documentation',url:a.url}]:[]),
    ...(s?[{title:s.label+' input documentation',url:s.url}]:[])];
  return {kind,title,signal,cable,next,direct,output,input,bassStatus,mainBass,
    warnings,facts,sourceLinks,verifiedModelPath:!!(a&&s&&!mismatch&&direct),
    wiringStatus:mismatch?'review':a&&s&&direct?'documented_examples':direct?'based_on_your_selections':'requires_check'};
}
/**
 * Displayable schema for the model-specific complete subwoofer examples
 * presently offered in the Builder. This is not a global subwoofer catalog.
 */
export function knownSubExamplePlan(id){
  const amps={
    'stereo-sub-edifier':'Edifier R1280DBs',
    'stereo-sub-ora':'Kanto ORA',
    'stereo-sub-wiim':'WiiM Amp'
  };
  if(!Object.hasOwn(amps,id))return null;
  return subwooferConnections({ampName:amps[id],subName:'Edifier T5',ampOutput:'unknown',subInput:'unknown'});
}
