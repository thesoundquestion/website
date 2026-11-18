import {loadEquipmentCatalog} from '../../equipment/catalog-client.mjs';
import {assessRecordingChain} from '../../equipment/recording-chain-check.mjs';
import {assessHeadphoneChain} from '../../equipment/headphone-chain-check.mjs';

const $=id=>document.getElementById(id);
let catalog=null;
const byModel=(model,category)=>catalog.records.find(x=>x.model===model&&x.categories.includes(category));
const pick=(id,items,preferred,empty=false)=>{
  const select=$(id),existing=select.value;
  select.replaceChildren();
  if(empty){const option=document.createElement('option');option.value='';option.textContent='None';select.append(option)}
  for(const item of items){
    const option=document.createElement('option');
    option.value=item.id;option.textContent=item.model;
    select.append(option);
  }
  const chosen=items.find(x=>x.model===preferred)?.id;
  select.value=chosen||existing&&items.some(x=>x.id===existing)&&existing||(empty?'':items[0]?.id||'');
};
function types(...names){
  return catalog.records.filter(x=>names.some(n=>x.categories.includes(n)))
    .sort((a,b)=>a.model.localeCompare(b.model));
}
function headphoneProviders(){
  return catalog.records.filter(x=>x.connections?.outputs?.some(p=>
    /headphone|6[._]35mm_single_ended|4[._]4mm_balanced|4[._]4mm_compatible_single_ended/.test(p.type)||
    /headphone amplifier output|headphone output/.test(p.scope)))
    .sort((a,b)=>a.model.localeCompare(b.model));
}
function populate(){
  pick('capture',types('audio_interface','mixer_recorder'),'M-Audio M-Track Solo');
  const microphones=types('microphone');
  pick('mic-one',microphones,'FIFINE K669D');
  pick('mic-two',microphones,null,true);
  pick('headphone-model',types('headphone'),'Grado SR80e');
  pick('headphone-amp',headphoneProviders(),'M-Audio M-Track Solo');
}
function draw(result){
  $('results').hidden=false;
  $('outcome').textContent=result.status==='known_limit'?'At least one documented capacity limit needs attention.':
    result.status==='needs_verification'?'More specifications or routing information are needed.':
    result.status==='capacity_documented'?'The selected capacity requirements are documented, subject to the cautions below.':
    result.status==='some_load_specific_evidence'?'A published headphone power figure exists at the matching nominal load.':
    'There is no verified headphone power figure at this exact nominal load.';
  $('disclaimer').textContent=result.disclaimer;
  const list=$('checks');list.replaceChildren();
  for(const check of result.checks){
    const li=document.createElement('li');
    const title=document.createElement('strong');
    title.textContent=check.summary;
    const extra=document.createElement('p');
    extra.textContent=check.detail||check.explanation||'';
    const status=document.createElement('small');
    status.textContent='Evidence status: '+check.status.replaceAll('_',' ');
    li.append(title,extra,status);
    list.append(li);
  }
  const ratingArea=$('matched-ratings'),ratings=$('matched-list');
  ratings.replaceChildren();
  const rows=result.powerRatingsAtNominalLoad||[];
  for(const rating of rows){
    const li=document.createElement('li');
    li.textContent=rating.milliwattsPerChannel+' mW per channel at '+rating.loadOhms+' Ω'+
      ' | '+rating.outputPath+' | '+rating.testConditions+
      (rating.metric?' | '+rating.metric.replaceAll('_',' '):'');
    ratings.append(li);
  }
  ratingArea.hidden=!rows.length;
}
function reportError(message){
  $('results').hidden=true;
  $('status').textContent=message;
}
function runRecording(){
  if(!catalog)return reportError('The equipment catalogue is not available.');
  const count=Number($('mic-count').value);
  if(!Number.isInteger(count)||count<1||count>8)
    return reportError('Enter a whole number from 1 to 8 microphones.');
  const microphoneIds=Array.from({length:count},()=> $('mic-one').value);
  if($('mic-two').value)microphoneIds.push($('mic-two').value);
  try{
    const result=assessRecordingChain(catalog,{
      captureDeviceId:$('capture').value,microphoneIds,
      independentTracks:$('separate').checked
    });
    $('status').textContent='Capacity checks completed using the documented equipment facts.';
    draw(result);
  }catch{reportError('This setup could not be checked from the currently verified equipment records.')}
}
function runHeadphones(){
  if(!catalog)return reportError('The equipment catalogue is not available.');
  try{
    const result=assessHeadphoneChain(catalog,{
      headphoneId:$('headphone-model').value,amplifierId:$('headphone-amp').value
    });
    $('status').textContent='Headphone output evidence reviewed. No listening loudness is predicted.';
    draw(result);
  }catch{reportError('The headphone output path is not verified for those selected records.')}
}
$('workflow').addEventListener('change',()=>{
  const recording=$('workflow').value==='recording';
  $('recording').hidden=!recording;
  $('headphones').hidden=recording;
  $('results').hidden=true;
  $('status').textContent='Choose the exact models and check the documented evidence.';
});
$('recording-check').addEventListener('click',runRecording);
$('headphone-check').addEventListener('click',runHeadphones);
loadEquipmentCatalog().then(data=>{
  catalog=data;populate();
  $('status').textContent='Choose equipment and check the documented evidence.';
}).catch(()=>reportError('The equipment catalogue could not be loaded. No compatibility conclusions are available.'));
