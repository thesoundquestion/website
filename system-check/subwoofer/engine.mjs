/**
 * Signal-level and documented bass-routing compatibility, not a claim about
 * amplifier load safety or exact measured crossover response.
 *
 * Sources are kept per exact model. Unknown connections fail closed.
 */
export const SUB_OUTPUT_MODELS=Object.freeze({
 'Edifier R1280DBs':{
  name:'Edifier R1280DBs',output:'line',connector:'3.5mm',bass:'attenuated_unknown',
  source:'https://usa-oss.edifier.com/Uploads/images/2021/07/15/2021071511185516263191358605.pdf'
 },
 'Kanto ORA':{
  name:'Kanto ORA',output:'line',connector:'rca',bass:'fixed_hpf_100',
  source:'https://kantoaudio.com/en-us/products/ora'
 },
 'WiiM Amp':{
  name:'WiiM Amp',output:'line',connector:'rca',bass:'configurable',
  source:'https://faq.wiimhome.com/en/support/solutions/articles/72000634761-subwoofer-advanced-options-subwoofer-bypass-mode-main-speakers-output-bass'
 },
 'Denon AVR-S650H':{
  name:'Denon AVR-S650H',output:'line',connector:'rca',bass:'receiver_speaker_small',
  source:'https://manuals.denon.com/AVRS650H/NA/EN/download.php?filename=%2FAVRS650H%2FNA%2FEN%2Fpdf%2FAVRS650H_NA_EN.pdf'
 }
});
export const SUB_INPUT_MODELS=Object.freeze({
 'Edifier T5':{
  name:'Edifier T5',input:'line',connector:'rca',
  lowPass:'adjustable',source:'https://new-edifier-us-oss.edifier.com/files/20240918/ab7c8c4b29b818271ce3ae9f8b50c016.pdf'
 }
});
const outputAliases=Object.freeze({
 'WiiM Amp (original)':'WiiM Amp',
 'Denon AVR-S650H (North America)':'Denon AVR-S650H',
 'Kanto ORA original':'Kanto ORA'
});
const subAliases=Object.freeze({'Edifier T5 powered subwoofer':'Edifier T5'});
export function evaluateSubwooferConnection({sourceModel,subModel,mainBassMode='default'}={}) {
 const source=SUB_OUTPUT_MODELS[outputAliases[sourceModel]||sourceModel]||null;
 const sub=SUB_INPUT_MODELS[subAliases[subModel]||subModel]||null;
 const basic={sourceModel:sourceModel||null,subModel:subModel||null,
   sourceVerified:!!source,subVerified:!!sub,
   sourceUrl:source?.source||null,subUrl:sub?.source||null};
 if(!source||!sub)return {...basic,status:'unverified',compatible:false,
   text:'Cannot confirm this connection from the saved model specifications.',
   wiring:'Identify the exact output and subwoofer input first. Do not assume a speaker-output signal can connect to an RCA line input.',
   mains:'Main-speaker filtering cannot be established for the complete setup.',
   cable:null,highPassVerified:false};
 if(source.output!==sub.input)return {...basic,status:'incompatible',compatible:false,
   text:'The documented signal types are not directly compatible.',
   wiring:'Do not connect these outputs and inputs directly.',cable:null,
   mains:'No usable crossover route confirmed.',highPassVerified:false};
 const cable=source.connector==='rca'&&sub.connector==='rca'
   ?'Single RCA male-to-male subwoofer lead'
   :source.connector==='3.5mm'&&sub.connector==='rca'
   ?'3.5 mm-to-dual-RCA signal cable':'Confirm appropriate line-level adapter';
 let mains='Main speakers remain full-range; no high-pass has been demonstrated.';
 let highPassVerified=false;
 if(source.bass==='fixed_hpf_100'){
   mains='The original ORA high-passes its main speakers automatically at about 100 Hz when using Sub Out.';
   highPassVerified=true;
 }else if(source.bass==='attenuated_unknown'){
   mains='Edifier documents reduced main-speaker bass with Sub Out but does not provide a crossover frequency.';
 }else if(source.bass==='configurable'){
   highPassVerified=mainBassMode!=='full';
   mains=highPassVerified
     ?'In WiiM Home enable the sub and disable Main Speakers Output Bass for filtered mains.'
     :'In WiiM Home Main Speakers Output Bass enabled leaves the mains full-range.';
 }else if(source.bass==='receiver_speaker_small'){
   highPassVerified=mainBassMode!=='full';
   mains=highPassVerified
     ?'Set Front speakers to Small and choose a crossover on the Denon to reduce bass from the mains.'
     :'Front speakers set to Large can run full-range; configure the receiver before claiming high-pass filtering.';
 }
 return {...basic,status:'documented_line_route',compatible:true,cable,
   highPassVerified,mains,
   wiring:'Connect '+source.name+' Sub Out to '+sub.name+' RCA Signal In using '+cable+
     '. Set the subwoofer level conservatively, then adjust its documented low-pass control according to the actual main-speaker crossover.',
   text:'Yes. These exact models have a documented line-level subwoofer connection.'};
}
export function subwooferCheckerLink({sourceModel,subModel,mainBassMode='default'}={}) {
 if(!sourceModel)return null;
 const q=new URLSearchParams({source:sourceModel,mode:mainBassMode});
 if(subModel)q.set('sub',subModel);
 return '/system-check/subwoofer/?'+q.toString();
}
