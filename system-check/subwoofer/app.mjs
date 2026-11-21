import {SUB_OUTPUT_MODELS,SUB_INPUT_MODELS,evaluateSubwooferConnection} from './engine.mjs';
const $=id=>document.getElementById(id);
const q=new URLSearchParams(location.search);
function options(select,registry,label){
 select.replaceChildren();
 const unknown=document.createElement('option');
 unknown.value='';unknown.textContent=label;
 select.append(unknown);
 for(const item of Object.values(registry)){
   const opt=document.createElement('option');
   opt.value=item.name;opt.textContent=item.name;select.append(opt);
 }
}
options($('sub-source'),SUB_OUTPUT_MODELS,'Other / not listed (cannot verify)');
options($('sub-model'),SUB_INPUT_MODELS,'Other / not listed (cannot verify)');
function selectExact(field,model,aliases={}){
 const normalized=aliases[model]||model;
 if([...field.options].some(o=>o.value===normalized))field.value=normalized;
}
selectExact($('sub-source'),q.get('source'),{'WiiM Amp (original)':'WiiM Amp',
 'Denon AVR-S650H (North America)':'Denon AVR-S650H'});
selectExact($('sub-model'),q.get('sub'),{'Edifier T5 powered subwoofer':'Edifier T5'});
if(q.get('mode')==='full')$('sub-mode').value='full';
for(const [key,field] of [
 ['reportedSourceOutput','sub-reported-output'],
 ['reportedSubInput','sub-reported-input'],
 ['reportedSourceConnector','sub-reported-output-connector'],
 ['reportedSubConnector','sub-reported-input-connector']
]){
 const value=q.get(key);
 if(value&&[...$(field).options].some(option=>option.value===value))$(field).value=value;
}
if(!$('sub-source').value||!$('sub-model').value)$('sub-manual').open=true;
function render(){
 const args={sourceModel:$('sub-source').value,subModel:$('sub-model').value,
  mainBassMode:$('sub-mode').value,
  reportedSourceOutput:$('sub-reported-output').value||null,
  reportedSubInput:$('sub-reported-input').value||null,
  reportedSourceConnector:$('sub-reported-output-connector').value||null,
  reportedSubConnector:$('sub-reported-input-connector').value||null};
 const result=evaluateSubwooferConnection(args);
 $('sub-verdict').textContent=result.status==='documented_line_route'?'Connection confirmed for these models':
   result.status==='incompatible'?'Do not connect directly':
   result.status==='reported_possible'?'Possible route, not verified':
   'Not enough verified information';
 $('sub-message').textContent=result.text;
 $('sub-details').hidden=false;
 $('sub-wiring').textContent=result.wiring;
 $('sub-mains').textContent=result.mains;
 $('sub-cable').textContent=result.cable?'Required connection: '+result.cable+'.':'';
 const refs=$('sub-evidence');refs.replaceChildren();
 for(const [label,url]of [['Output documentation',result.sourceUrl],['Subwoofer manual',result.subUrl]]){
  if(!url)continue;
  const a=document.createElement('a');a.href=url;a.textContent=label;
  a.target='_blank';a.rel='noopener noreferrer';refs.append(a,' ');
 }
 const url=new URL(location.href);
 for(const [key,value] of Object.entries({source:args.sourceModel,sub:args.subModel,mode:args.mainBassMode,
  reportedSourceOutput:args.reportedSourceOutput,reportedSubInput:args.reportedSubInput,
  reportedSourceConnector:args.reportedSourceConnector,reportedSubConnector:args.reportedSubConnector})){
  if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
 }
 history.replaceState(null,'',url);
}
$('sub-form').addEventListener('submit',event=>{event.preventDefault();render()});
if(q.has('source')||q.has('sub'))render();