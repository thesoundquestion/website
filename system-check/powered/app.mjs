import {POWERED_ACOUSTIC_RECORDS,poweredListeningAssessment} from '../../system-builder/powered-output-evidence.mjs';
const $=id=>document.getElementById(id),q=new URLSearchParams(location.search);
const select=$('powered-model');
for(const record of Object.values(POWERED_ACOUSTIC_RECORDS)){
 const option=document.createElement('option');
 option.value=record.model;option.textContent=record.model;select.append(option);
}
if(POWERED_ACOUSTIC_RECORDS[q.get('model')])select.value=q.get('model');
const d=Number(q.get('distance'));
if(Number.isFinite(d)&&d>=0.5&&d<=300)$('powered-distance').value=d;
if(['quiet','moderate','high'].includes(q.get('level')))$('powered-level').value=q.get('level');
if(['1','2'].includes(q.get('count')))$('powered-count').value=q.get('count');
function render(){
 const original=POWERED_ACOUSTIC_RECORDS[select.value];
 if(!original){$('powered-verdict').textContent='No documented acoustic evidence for this model.';return;}
 const result=poweredListeningAssessment({...original,units:Number($('powered-count').value)},
 {distanceFt:Number($('powered-distance').value),level:$('powered-level').value});
 if(!result){$('powered-verdict').textContent='Please enter a valid listening distance.';return;}
 $('powered-verdict').textContent=result.text;
 $('powered-technical').hidden=false;
 $('powered-technical-text').textContent=result.detail;
 $('powered-numbers').textContent='Estimated rated peak at seat: '+result.estimatedPeakDb+
  ' dB; estimated rated continuous: '+result.estimatedContinuousDb+' dB. Margin to selected targets: '+result.marginDb+' dB.';
 $('powered-source').href=result.source;
 const url=new URL(location.href);
 for(const [key,value]of Object.entries({model:select.value,distance:$('powered-distance').value,
 level:$('powered-level').value,count:$('powered-count').value}))url.searchParams.set(key,value);
 history.replaceState(null,'',url);
}
$('powered-form').addEventListener('submit',e=>{e.preventDefault();render()});
if(q.has('model'))render();