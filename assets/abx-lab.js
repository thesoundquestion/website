/* Shared ABX Listening Labs framework, v1. No public scores without server verification. */
(() => {
'use strict';
const API = 'https://tsq-abx.thesoundquestion.workers.dev';
const AUDIO = 'https://tsq-lab-audio.thesoundquestion.workers.dev';
const tests = {
 'mix-narrow-reference-v1': {lab:'mix',level:'training',label:'Narrow mix vs conventional mix',a:AUDIO+'/mixing/narrow.flac',b:AUDIO+'/mixing/reference.flac',note:'Exaggerated width difference. For training only; level and alignment checks are pending.'},
 'mix-reference-creative-v1':{lab:'mix',level:'training',label:'Conventional vs creative mix',a:AUDIO+'/mixing/reference.flac',b:AUDIO+'/mixing/polished.flac',note:'Clearly contrasting spatial treatments. For training only; level and alignment checks are pending.'},
 'master-dynamic-moderate-v1':{lab:'master',level:'training',label:'Dynamic vs moderately compressed master',a:AUDIO+'/mastering/matched-dynamic.flac',b:AUDIO+'/mastering/matched-moderate.flac',note:'Loudness-matched mastering treatments. A useful learning demonstration.'},
 'master-moderate-brick-v1':{lab:'master',level:'training',label:'Moderate vs brickwalled master',a:AUDIO+'/mastering/matched-moderate.flac',b:AUDIO+'/mastering/matched-brickwalled.flac',note:'Matched overall loudness, but deliberately strong changes in dynamics.'},
 'master-eq-v1':{lab:'master',level:'training',label:'EQ off vs EQ on',a:AUDIO+'/mastering/eq-off.flac',b:AUDIO+'/mastering/eq-on.flac',note:'Training only until level-matching and source alignment are independently verified.'},
 'formats-light-128-v1':{lab:'formats',level:'training',label:'Let The Light In: lossless vs 128 kbps',a:AUDIO+'/mixing/reference.flac',b:'/assets/audio/formats/light-128.mp3',note:'Codec comparison; training is unscored until a controlled blind transport is validated.'},
 'formats-light-320-v1':{lab:'formats',level:'training',label:'Let The Light In: lossless vs 320 kbps',a:AUDIO+'/mixing/reference.flac',b:'/assets/audio/formats/light-320.mp3',note:'Subtle codec comparison; not yet validated for scored blind testing.'},
 'formats-diva-128-v1':{lab:'formats',level:'training',label:'Diva: lossless vs 128 kbps',a:AUDIO+'/mastering/dynamic.flac',b:'/assets/audio/formats/diva-128.mp3',note:'Codec comparison; local training only.'},
 'formats-diva-320-v1':{lab:'formats',level:'training',label:'Diva: lossless vs 320 kbps',a:AUDIO+'/mastering/dynamic.flac',b:'/assets/audio/formats/diva-320.mp3',note:'Subtle codec comparison; local training only.'}
};
const el=(tag,props={},text='')=>{const node=document.createElement(tag);Object.entries(props).forEach(([k,v])=>{if(k==='class')node.className=v;else node.setAttribute(k,String(v))});if(text)node.textContent=text;return node};
function init(root){
const lab=root.dataset.abxLab;
const catalog=Object.entries(tests).filter(([,v])=>v.lab===lab);
if(!catalog.length)return;
root.classList.add('tsq-abx');root.innerHTML='';
root.append(el('p',{class:'tsq-abx-kicker'},'BLIND LISTENING / TRAINING → CHALLENGE → ADVANCED'));
root.append(el('h2',{},'Hear it. Then test yourself.'));
root.append(el('p',{},'Training teaches the difference. Challenge and Advanced use server-verified trials when a comparison has passed fairness checks. No listening score is a measure of someone’s worth or equipment quality.'));
const notice=el('p',{class:'tsq-abx-notice'},'Only level-matched and technically verified comparisons qualify for scored testing. Intentionally louder masters are never eligible.');root.append(notice);
const tabs=el('div',{class:'tsq-abx-tabs',role:'group','aria-label':'ABX difficulty'});
const modes=[['training','Training'],['challenge','Challenge · 10 trials'],['advanced','Advanced · 20 trials']];
let mode='training',testId=catalog[0][0],round=0,correct=0,answer='A',locked=false,live=null,session=null,version=0;
const choose=el('select',{'aria-label':'Choose ABX comparison'});
catalog.forEach(([id,t])=>choose.append(el('option',{value:id},t.label)));
const meta=el('p',{class:'tsq-abx-meta'});
const buttons=el('div',{class:'tsq-abx-player',role:'group','aria-label':'Listen to references and mystery X'});
const playButtons={};
for(const slot of ['A','B','X']){const btn=el('button',{type:'button','data-slot':slot},'▶ '+slot);playButtons[slot]=btn;buttons.append(btn)}
const answerRow=el('div',{class:'tsq-abx-answers'});
const guessA=el('button',{type:'button'},'X is A'),guessB=el('button',{type:'button'},'X is B'),next=el('button',{type:'button'},'Next trial');
answerRow.append(guessA,guessB,next);
const progress=el('p',{class:'tsq-abx-progress',role:'status','aria-live':'polite'});
const consentLabel=el('label',{class:'tsq-abx-consent'});const consent=el('input',{type:'checkbox'});consentLabel.append(consent,document.createTextNode(' Include my completed, anonymous session in community statistics (optional).'));
const scoreboard=el('div',{class:'tsq-abx-scoreboard',role:'status','aria-live':'polite'});
const startButton=el('button',{type:'button',class:'tsq-abx-start'},'Start scored session');
const statsButton=el('button',{type:'button',class:'tsq-abx-stats-button'},'View community results');
const statsBox=el('div',{class:'tsq-abx-stats',role:'status','aria-live':'polite'});
root.append(tabs,choose,meta,buttons,answerRow,consentLabel,startButton,progress,scoreboard,statsButton,statsBox);
const audio=document.createElement('audio');audio.preload='auto';audio.crossOrigin='anonymous';audio.hidden=true;root.append(audio);
let pending=false,playGeneration=0;
function stop(){playGeneration++;audio.pause();audio.removeAttribute('src');audio.load()}
async function api(path,payload){
const res=await fetch(API+path,{method:'POST',mode:'cors',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
if(!res.ok)throw Error('Scored ABX service unavailable ('+res.status+').');
return res.json();
}
function setMode(value){mode=value;tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));reset()}
modes.forEach(([id,label])=>{const b=el('button',{type:'button','data-mode':id},label);b.onclick=()=>setMode(id);tabs.append(b)});
function render(){
const spec=tests[testId];meta.textContent=spec.note;
const scored=mode!=='training';
const total=scored?(mode==='advanced'?20:10):10;
consentLabel.hidden=!scored;startButton.hidden=!scored||Boolean(session);startButton.disabled=pending;
next.hidden=!locked||scored;guessA.disabled=locked||pending||!live;guessB.disabled=locked||pending||!live;
for(const b of Object.values(playButtons))b.disabled=pending||!live;
for(const b of tabs.querySelectorAll('button'))b.disabled=Boolean(session);
consent.disabled=Boolean(session);
choose.disabled=Boolean(session)||pending;
progress.textContent='Round '+Math.min(round+1,total)+' of '+total+(mode==='training'?' · Practice, no public score':' · No answer feedback until completion');
}
function reset(){version++;stop();round=0;correct=0;locked=false;session=null;live=null;pending=false;scoreboard.textContent='';render();if(mode==='training')newTraining();else scoreboard.textContent='Scored trials only open after technical review. Choose whether to share your completed result, then press Start scored session.'}
function newTraining(){answer=Math.random()<.5?'A':'B';locked=false;live={A:tests[testId].a,B:tests[testId].b,X:answer==='A'?tests[testId].a:tests[testId].b};render()}
async function startScored(){
const myVersion=version;
pending=true;render();
try {
 const data=await api('/v1/start',{testId,mode,share:consent.checked});
 if(myVersion!==version)return;
 if(!data.sessionId||!data.controlKey||!data.urls||!data.roundToken)throw Error('Invalid server session');
 session={id:data.sessionId,controlKey:data.controlKey,token:data.roundToken,total:data.total};
 live=data.urls;
 scoreboard.textContent='Scored session active. Answers remain hidden until you finish.';
}catch{
 if(myVersion===version){session=null;live=null;scoreboard.textContent='Scored tests are not open yet. The comparison and protected playback must first pass technical review.'}
}finally{if(myVersion===version){pending=false;render()}}
}
async function play(slot){
 if(!live||pending)return;
 const src=live[slot];if(!src)return;
 const myTurn=++playGeneration;
 const time=Math.max(0,Number.isFinite(audio.currentTime)?audio.currentTime:0);
 const originalSlot=slot==='X'?answer:slot;
 // Measured MP3-128 decoded RMS is ~0.436 dB quieter than the lossless
 // source; reduce the reference playback gain for Training only.
 audio.volume=mode==='training'&&testId.endsWith('-128')&&originalSlot==='A'?0.951:1;
 try{
  if(audio.src!==new URL(src,location.href).href){
   audio.pause();audio.src=src;audio.load();
   if(audio.readyState<1)await new Promise((resolve,reject)=>{
    let timer;
    const cleanup=()=>{clearTimeout(timer);audio.removeEventListener('loadedmetadata',done);audio.removeEventListener('error',fail)};
    const done=()=>{cleanup();resolve()},fail=()=>{cleanup();reject(Error('Audio unavailable'))};
    timer=setTimeout(fail,10000);
    audio.addEventListener('loadedmetadata',done);audio.addEventListener('error',fail);
   });
   if(myTurn!==playGeneration)return;
   if(Number.isFinite(audio.duration)&&audio.duration>0){
    try{audio.currentTime=Math.min(time,Math.max(0,audio.duration-0.1))}catch{}
   }
   await audio.play();
  }else if(audio.paused)await audio.play();
  else audio.pause();
  if(myTurn!==playGeneration)return;
  Object.entries(playButtons).forEach(([key,b])=>b.setAttribute('aria-pressed',String(key===slot)));
 }catch{if(myTurn===playGeneration)scoreboard.textContent='Playback failed or was blocked. Press the same listening button again.'}
}
for(const [slot,btn] of Object.entries(playButtons))btn.onclick=()=>play(slot);
function applyServerProgress(data){
 if(!Number.isInteger(data.answered)||typeof data.complete!=='boolean')throw Error('Invalid response');
 round=data.answered;
 if(data.complete){
  stop();live=null;session=null;locked=true;
  const chance=Number.isFinite(data.chanceProbability)?' Chance of this score or higher by random guessing: '+(data.chanceProbability*100).toFixed(1)+'%.':'';
  scoreboard.textContent='Completed: '+data.correct+'/'+data.total+' correct.'+chance+' '+(data.shared?'Included in voluntary community statistics.':'Not shared publicly.');
 }else{
  if(!data.urls||!data.roundToken)throw Error('Missing next trial');
  session.token=data.roundToken;live=data.urls;locked=false;
  scoreboard.textContent='Trial recorded. Continue listening.';
 }
 render();
}
async function submit(guess){
 if(locked||pending||!live)return;
 locked=true;stop();
 if(mode==='training'){
  if(guess===answer)correct++;
  scoreboard.textContent=(guess===answer?'Correct. ':'Not this round. ')+'X was '+answer+'. Training score: '+correct+'/'+(round+1)+'.';
  render();return;
 }
 if(!session)return;
 pending=true;render();
 const control={sessionId:session.id,controlKey:session.controlKey};
 try{
  const data=await api('/v1/answer',{...control,roundToken:session.token,guess});
  applyServerProgress(data);
 }catch{
  try{
   const resumed=await api('/v1/resume',control);
   applyServerProgress(resumed);
   if(!resumed.complete)scoreboard.textContent='Connection recovered; round status synchronized.';
  }catch{
   locked=false;
   scoreboard.textContent='Connection interrupted. The current trial is preserved; retry your answer when connected.';
  }
 }finally{pending=false;render()}
}
guessA.onclick=()=>submit('A');guessB.onclick=()=>submit('B');
next.onclick=()=>{if(mode==='training'){round++;if(round>=10){scoreboard.textContent='Training complete: '+correct+'/10. These results are not submitted.';live=null;render()}else newTraining()}};
choose.onchange=()=>{testId=choose.value;reset()};
startButton.onclick=()=>{if(mode!=='training'&&!session&&!pending)startScored()};
statsButton.onclick=async()=>{statsBox.textContent='Checking available community statistics…';try{const response=await fetch(API+'/v1/stats',{mode:'cors'});if(!response.ok)throw Error('unavailable');const data=await response.json();const values=Array.isArray(data.results)?data.results:[];statsBox.textContent='';if(!values.length){statsBox.textContent='No eligible community results yet. At least 10 completed opt-in sessions are required per comparison.';return}const table=el('table',{class:'tsq-abx-results'}),header=el('tr');for(const field of ['Comparison','Level','Sessions','Mean correct'])header.append(el('th',{},field));table.append(header);for(const x of values){const tr=el('tr');for(const value of [x.test_id,x.mode,String(x.sessions),Math.round(Number(x.accuracy)*100)+'%'])tr.append(el('td',{},value));table.append(tr)}statsBox.append(table,el('p',{},data.note||'Unsupervised, voluntary community listening sessions.'))}catch{statsBox.textContent='Community results are not yet available. The secure scoring service has not been released.'}};
setMode('training');
}
document.querySelectorAll('[data-abx-lab]').forEach(init);
})();