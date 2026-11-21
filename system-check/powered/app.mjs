import {POWERED_ACOUSTIC_RECORDS,poweredListeningAssessment} from '../../system-builder/powered-output-evidence.mjs';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
const select=$('powered-model');
for(const record of Object.values(POWERED_ACOUSTIC_RECORDS)){
 const option=document.createElement('option');
 option.value=record.model;option.textContent=record.model;select.append(option);
}
const other=document.createElement('option');
other.value='__manual__';other.textContent='Other model: enter published acoustic ratings';
select.append(other);
if(POWERED_ACOUSTIC_RECORDS[q.get('model')])select.value=q.get('model');
else if(q.get('model')==='__manual__')select.value='__manual__';
select.addEventListener('change',()=>{
 if(select.value==='__manual__')$('powered-manual').open=true;
});
if(select.value==='__manual__')$('powered-manual').open=true;
const d=Number(q.get('distance'));
if(Number.isFinite(d)&&d>=0.5&&d<=300&&q.has('distance'))$('powered-distance').value=d;
else if(!q.has('distance'))$('powered-distance').value='';
if(['quiet','moderate','high'].includes(q.get('level')))$('powered-level').value=q.get('level');
if(['1','2'].includes(q.get('count')))$('powered-count').value=q.get('count');
function render(){
 let original=POWERED_ACOUSTIC_RECORDS[select.value];
 if(select.value==='__manual__'){
  const peakRaw=$('powered-manual-peak').value.trim();
  const continuousRaw=$('powered-manual-continuous').value.trim();
  const referenceRaw=$('powered-manual-reference').value.trim();
  const peak=Number(peakRaw),reference=Number(referenceRaw);
  const continuous=continuousRaw?Number(continuousRaw):null;
  if(!peakRaw||!referenceRaw||!Number.isFinite(peak)||peak<40||peak>160||
      !Number.isFinite(reference)||reference<0.1||reference>100||
      (continuous!==null&&(!Number.isFinite(continuous)||continuous<40||continuous>peak))){
    $('powered-verdict').textContent='Enter the published peak SPL and its actual reference distance; continuous SPL is optional.';
    $('powered-technical').hidden=true;return;
  }
  original={model:'Unlisted powered speaker',maxPeakDb:peak,
   maxContinuousDb:continuous,referenceMeters:reference,evidenceType:'user_reported',
   units:1,conditions:'Values entered by the listener, not independently checked.',source:null};
 }
 if(!original){$('powered-verdict').textContent='No documented acoustic evidence for this model.';return;}
 const result=poweredListeningAssessment({...original,units:Number($('powered-count').value)},
 {distanceFt:Number($('powered-distance').value),level:$('powered-level').value});
 if(!result){$('powered-verdict').textContent='Please enter a valid listening distance.';return;}
 $('powered-verdict').textContent=result.text;
 $('powered-technical').hidden=false;
 $('powered-technical-text').textContent=result.detail;
 $('powered-numbers').textContent='Estimated published peak at the seat: '+result.estimatedPeakDb+
  ' dB. '+(result.estimatedContinuousDb===null
    ?'No model-specific continuous SPL is available; no clean-volume promise.'
    :'Estimated published continuous: '+result.estimatedContinuousDb+
      ' dB. '+(result.marginDb===null?'Reported values have not been independently confirmed.':
       'Limiting margin against selected targets: '+result.marginDb+' dB.'));
 $('powered-source').hidden=!result.source;
 if(result.source)$('powered-source').href=result.source;
 const url=new URL(location.href);
 for(const [key,value]of Object.entries({model:select.value,distance:$('powered-distance').value,
 level:$('powered-level').value,count:$('powered-count').value}))url.searchParams.set(key,value);
 history.replaceState(null,'',url);
}
$('powered-form').addEventListener('submit',e=>{e.preventDefault();render()});
if(q.has('model')&&q.has('distance'))render();