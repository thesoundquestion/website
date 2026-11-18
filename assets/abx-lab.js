/* Shared ABX Listening Labs framework, v1. No public scores without server verification. */
(() => {
'use strict';
// Only the verified canonical site offers server-scored Challenge/Advanced.
// Local/preview hosts run self-contained practice, never the live score API.
const PRACTICE_ONLY = location.origin !== 'https://thesoundquestion.com';
const API = 'https://tsq-abx.thesoundquestion.workers.dev';
const AUDIO = 'https://tsq-lab-audio.thesoundquestion.workers.dev';
const tests = {
 'mix-narrow-reference-v1': {lab:'mix',lessonUrl:'/lab/',modes:['training'],label:'Narrow mix vs conventional mix',a:AUDIO+'/mixing/narrow.flac',b:AUDIO+'/mixing/reference.flac',note:'Intentionally exaggerated stereo width. Listen for how far apart instruments appear.'},
 'mix-reference-creative-v1':{lab:'mix',lessonUrl:'/lab/',modes:['training'],label:'Conventional vs creative mix',a:AUDIO+'/mixing/reference.flac',b:AUDIO+'/mixing/polished.flac',note:'The same performance mixed with different placements and depth.'},
 'master-dynamic-moderate-v1':{lab:'master',lessonUrl:'/lab/mastering/?experiment=matched',modes:['training'],label:'Dynamic vs moderately compressed master',a:AUDIO+'/mastering/matched-dynamic.flac',b:AUDIO+'/mastering/matched-moderate.flac',note:'Loudness-matched mastering treatments. A useful learning demonstration.'},
 'master-moderate-brick-v1':{lab:'master',lessonUrl:'/lab/mastering/?experiment=matched',modes:['training'],label:'Moderate vs brickwalled master',a:AUDIO+'/mastering/matched-moderate.flac',b:AUDIO+'/mastering/matched-brickwalled.flac',note:'Matched overall loudness, but deliberately strong changes in dynamics.'},
 'master-eq-v1':{lab:'master',lessonUrl:'/lab/mastering/?experiment=eq',modes:['training','challenge'],label:'EQ off vs EQ on',a:AUDIO+'/mastering/eq-off.flac',b:AUDIO+'/mastering/eq-on.flac',note:'Compare the same recording with and without mastering EQ. Challenge is an informal listening game, not a calibrated hearing test.'},
 'formats-light-128-v1':{lab:'formats',lessonUrl:'/labs/formats/?song=light',modes:['training','challenge'],label:'Let The Light In: lossless vs 128 kbps',a:AUDIO+'/mixing/reference.flac',b:'/assets/audio/formats/light-128.mp3',note:'Compare lossless audio and a 128 kbps MP3. Small level differences may affect what you hear.'},
 'formats-light-320-v1':{lab:'formats',lessonUrl:'/labs/formats/?song=light',modes:['training','advanced'],label:'Let The Light In: lossless vs 320 kbps',a:AUDIO+'/mixing/reference.flac',b:'/assets/audio/formats/light-320.mp3',note:'A subtle lossless-versus-320 kbps MP3 comparison. You may hear little or no difference.'},
 'formats-diva-128-v1':{lab:'formats',lessonUrl:'/labs/formats/?song=diva',modes:['training','challenge'],label:'Diva: lossless vs 128 kbps',a:AUDIO+'/mastering/dynamic.flac',b:'/assets/audio/formats/diva-128.mp3',note:'Compare lossless audio and a 128 kbps MP3, for curiosity rather than scientific conclusions.'},
 'formats-diva-320-v1':{lab:'formats',lessonUrl:'/labs/formats/?song=diva',modes:['training','advanced'],label:'Diva: lossless vs 320 kbps',a:AUDIO+'/mastering/dynamic.flac',b:'/assets/audio/formats/diva-320.mp3',note:'A subtler 320 kbps MP3 comparison. Repeated listening is encouraged.'}
};
const el=(tag,props={},text='')=>{const node=document.createElement(tag);Object.entries(props).forEach(([k,v])=>{if(k==='class')node.className=v;else node.setAttribute(k,String(v))});if(text)node.textContent=text;return node};
function init(root){
const lab=root.dataset.abxLab;
const catalog=Object.entries(tests).filter(([,v])=>lab==='all'||v.lab===lab);
if(!catalog.length)return;
root.classList.add('tsq-abx');root.innerHTML='';
root.append(el('p',{class:'tsq-abx-kicker'},'BLIND LISTENING / TRAINING → CHALLENGE → ADVANCED'));
root.append(el('h2',{},'Hear it. Then test yourself.'));
root.append(el('p',{},'Start with Training, then try 10 rounds in Challenge or 20 in Advanced. On this website, eligible comparisons use anonymous, server-verified scores; you can choose whether to include your completed score in community statistics. Preview versions remain private practice. These are informal listening games, not hearing tests.'));
const notice=el('p',{class:'tsq-abx-notice'},'The comparisons use the same performances with obvious level differences controlled where practical. Personal listening conditions vary. The deliberately unequal-volume masters are excluded from ABX.');root.append(notice);
const tabs=el('div',{class:'tsq-abx-tabs',role:'group','aria-label':'ABX difficulty'});
const modes=[['training','Training'],['challenge','Challenge · 10 trials'],['advanced','Advanced · 20 trials']];
let mode='training',testId=catalog[0][0],round=0,correct=0,answer='A',locked=false,live=null,session=null,version=0;
const localOnly=()=>PRACTICE_ONLY||testId==='master-eq-v1'; // EQ scored native switching still awaits separate verification.
const choose=el('select',{'aria-label':'Choose ABX comparison'});
const lesson=el('a',{class:'tsq-abx-lesson-link',href:'/labs/'},'Explore the original lesson');
const byMode=which=>catalog.filter(([,v])=>v.modes.includes(which));
function updateChoices(preferred){
 const available=byMode(mode);
 choose.replaceChildren();
 for(const [id,t] of available){
  const name=t.lab==='mix'?'Mixing':t.lab==='master'?'Mastering':'MP3 vs lossless';
  choose.append(el('option',{value:id},name+' · '+t.label));
 }
 testId=available.some(([id])=>id===preferred)?preferred:(available[0]?.[0]||null);
 if(testId)choose.value=testId;
 return available.length;
}
function recordSelection(){
 if(!testId)return;
 const url=new URL(location.href);url.searchParams.set('test',testId);url.searchParams.set('mode',mode);
 history.replaceState(null,'',url.pathname+url.search);
}
function configureLessonLink(){
 const spec=testId?tests[testId]:null;
 lesson.hidden=!spec;
 if(!spec)return;
 lesson.href=spec.lessonUrl;
 lesson.textContent='Missed the original experiment? Explore the '+({mix:'Mixing',master:'Mastering',formats:'MP3 vs Lossless'}[spec.lab])+' Lab ↗';
 lesson.target='_blank';lesson.rel='noopener noreferrer';
}
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
const startButton=el('button',{type:'button',class:'tsq-abx-start'},PRACTICE_ONLY?'Start practice challenge':'Start scored session');
const prepareButton=el('button',{type:'button',class:'tsq-abx-start'},'Prepare recordings');
const trialReadiness=el('p',{class:'tsq-abx-trial-readiness','data-readiness':'wait',role:'status','aria-live':'polite'},'Please wait');
const statsButton=el('button',{type:'button',class:'tsq-abx-stats-button'},'View community results');
const statsBox=el('div',{class:'tsq-abx-stats',role:'status','aria-live':'polite'});
root.append(tabs,choose,lesson,meta,trialReadiness,prepareButton,buttons,answerRow,consentLabel,startButton,progress,scoreboard,statsButton,statsBox);
const audio=document.createElement('audio');audio.preload='none';audio.crossOrigin='anonymous';audio.hidden=true;root.append(audio);
const takeFocus=()=>document.dispatchEvent(new CustomEvent('tsq-lab-audio-focus',{detail:{owner:'abx'}}));
audio.addEventListener('play',takeFocus);
document.addEventListener('tsq-lab-audio-focus',event=>{if(event.detail?.owner!=='abx'){audio.pause();trainingBuffer?.pause()}});
let pending=false,playGeneration=0,prepareFailed=false,practiceSwapped=false;
let trainingBuffer=null,selectedTrainingSlot=null;
const readiness=window.TSQLabReadiness;
const cache=readiness.createCache({maxFiles:3,maxBytes:25*1024*1024,onChange:()=>render()});
const TRAIN_A='training:A',TRAIN_B='training:B';
const SCORE_A='scored:A',SCORE_B='scored:B',SCORE_X='scored:X';
function switchStates(){
 const allReady=Boolean(live&&!pending&&!prepareFailed);
 readiness.set(trialReadiness,prepareFailed?'offline':allReady?'ready':'wait');
}
function localSource(type){return cache.get(type)}
function stop(){
 playGeneration++;
 audio.pause();audio.removeAttribute('src');audio.load();
 trainingBuffer?.pause();trainingBuffer?.seek(0);
 selectedTrainingSlot=null;
 root.dataset.trainingPlaying='false';
 for(const button of Object.values(playButtons))button.setAttribute('aria-pressed','false');
}
async function api(path,payload){
const res=await fetch(API+path,{method:'POST',mode:'cors',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
if(!res.ok)throw Error('Scored ABX service unavailable ('+res.status+').');
return res.json();
}
function setMode(value,preferred){mode=value;tabs.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));updateChoices(preferred);reset();recordSelection()}
modes.forEach(([id,label])=>{const b=el('button',{type:'button','data-mode':id},label);b.onclick=()=>setMode(id);tabs.append(b)});
function render(){
const spec=testId?tests[testId]:null;meta.textContent=spec?spec.note:'No comparisons at this level in this lab. Choose Training or visit another Listening Lab.';
configureLessonLink();
const scored=mode!=='training';
const total=scored?(mode==='advanced'?20:10):10;
consentLabel.hidden=localOnly()||!scored||!spec;
startButton.textContent=localOnly()?'Start practice challenge':'Start scored session';
statsButton.hidden=PRACTICE_ONLY;
startButton.hidden=!scored||!spec||Boolean(session);startButton.disabled=pending||!spec;
prepareButton.hidden=scored||!spec||Boolean(live)||round>=10;prepareButton.disabled=pending;
trialReadiness.hidden=scored||(!pending&&!live&&!prepareFailed); // X preparation latency is never displayed in scored ABX.
switchStates();
next.hidden=!locked||scored;guessA.disabled=locked||pending||!live;guessB.disabled=locked||pending||!live;
for(const b of Object.values(playButtons))b.disabled=pending||!live;
for(const b of tabs.querySelectorAll('button'))b.disabled=Boolean(session);
consent.disabled=Boolean(session);
choose.disabled=!spec||Boolean(session)||pending;
progress.textContent=spec?'Round '+Math.min(round+1,total)+' of '+total+(mode==='training'?' · Practice, no public score':localOnly()?' · Private practice; nothing submitted':' · Answers shown at completion'):'Select another level for available experiments.';
}
function reset(){version++;stop();trainingBuffer?.dispose();trainingBuffer=null;root.dataset.playbackMode='native';cache.clear();prepareFailed=false;round=0;correct=0;locked=false;session=null;live=null;pending=false;scoreboard.textContent='';render();if(mode==='training'&&testId)newTraining();else if(testId)scoreboard.textContent=localOnly()?'This is a practice game. Choose Start practice challenge to load the recordings. Results stay on this device.':'Play the references as often as needed, then identify X. Choose whether to share your completed score before starting.';}
function newTraining(){
 answer=Math.random()<.5?'A':'B';locked=false;
 const a=localSource(TRAIN_A),b=localSource(TRAIN_B);
 live=a&&b?{A:a,B:b,X:answer==='A'?a:b}:null;
 root.dataset.playbackMode=trainingBuffer?.isReady()?'synchronized':'native';
 root.dataset.trainingPlaying='false';
 render();
}
async function prepareTraining(){
 if(mode!=='training'||!testId||pending||live)return;
 const myVersion=version;
 // The Prepare tap unlocks audio before asynchronous downloads, so mobile
 // browsers can later decode and synchronize the two existing cached files.
 let stagedBuffer=null;
 if(window.TSQFormatBuffers?.supported()){
  try{
   stagedBuffer=new window.TSQFormatBuffers({onEnded:()=>{
    selectedTrainingSlot=null;
    root.dataset.trainingPlaying='false';
    for(const button of Object.values(playButtons))button.setAttribute('aria-pressed','false');
   }});
   stagedBuffer.unlock();
  }catch{stagedBuffer?.dispose();stagedBuffer=null}
 }
 if(prepareFailed)cache.clear(); // Explicit retry after offline preparation, not an idle retry loop.
 pending=true;prepareFailed=false;takeFocus();render();
 try{
  const a=await cache.prepare(TRAIN_A,tests[testId].a,{pinned:[TRAIN_A],explicit:true});
  if(!a||version!==myVersion)return;
  const b=await cache.prepare(TRAIN_B,tests[testId].b,{pinned:[TRAIN_A,TRAIN_B],explicit:true});
  if(!b||version!==myVersion)return;
  // Use the local Blob URLs, never re-request the public audio Worker.
  // X aliases A or B in Training, so it needs no separate download.
  if(stagedBuffer){
   try{
    const losslessVolume=/-128-v[1-9][0-9]*$/.test(testId)?0.951:1;
    await stagedBuffer.prepare(testId,{lossless:a,'128':b,'320':b},
      {lossless:losslessVolume,'128':1,'320':1});
    if(version===myVersion&&stagedBuffer.isReady()){
     trainingBuffer=stagedBuffer;stagedBuffer=null;
    }
   }catch{
    // Unsupported decode or memory limit: ordinary cached audio remains usable.
   }
  }
  if(version!==myVersion)return;
  // EQ-on/off changes are subtle enough that native source reloads create
  // an audible answer cue. Never offer this ABX comparison in fallback mode.
  if(testId==='master-eq-v1'&&!trainingBuffer?.isReady()){
   live=null;prepareFailed=true;
   scoreboard.textContent='EQ comparison needs seamless playback to keep X blind. This browser could not prepare both recordings for that mode. Try again or choose another comparison.';
  }else{
   newTraining();
   scoreboard.textContent=trainingBuffer
    ?'Both recordings are prepared for quick switching. Listen to A, B and X, then choose your answer.'
    :'Both recordings are prepared. Listen to A, B and X, then choose your answer.';
  }
 }finally{
  stagedBuffer?.dispose();
  if(version===myVersion){pending=false;prepareFailed=prepareFailed||!cache.has(TRAIN_A)||!cache.has(TRAIN_B);
   if(prepareFailed)scoreboard.textContent='Unable to prepare both recordings reliably. Check your connection and try a different comparison.';
   render();
  }
 }
}
function newPracticeTrial(){
 if(!session?.practice)return;
 stop();
 practiceSwapped=Math.random()<0.5;
 answer=Math.random()<0.5?'A':'B';
 const a=localSource(TRAIN_A),b=localSource(TRAIN_B);
 if(!a||!b){scoreboard.textContent='Recordings are no longer prepared. Start a new practice game.';live=null;session=null;render();return}
 live={A:practiceSwapped?b:a,B:practiceSwapped?a:b,X:answer==='A'?(practiceSwapped?b:a):(practiceSwapped?a:b)};
 locked=false;
 root.dataset.playbackMode=trainingBuffer?.isReady()?'synchronized':'native';
 render();
}
async function startPractice(){
 // Local beta only. No score request, no session token, no community posting.
 const myVersion=++version;
 stop();trainingBuffer?.dispose();trainingBuffer=null;cache.clear();
 live=null;session=null;round=0;correct=0;locked=false;prepareFailed=false;
 pending=true;takeFocus();render();
 let stagedBuffer=null;
 if(window.TSQFormatBuffers?.supported()){
  try{stagedBuffer=new window.TSQFormatBuffers({onEnded:()=>{
    selectedTrainingSlot=null;root.dataset.trainingPlaying='false';
    for(const button of Object.values(playButtons))button.setAttribute('aria-pressed','false');
  }});
   stagedBuffer.unlock();
  }catch{stagedBuffer?.dispose();stagedBuffer=null}
 }
 try{
  const a=await cache.prepare(TRAIN_A,tests[testId].a,{pinned:[TRAIN_A],explicit:true});
  const b=a&&await cache.prepare(TRAIN_B,tests[testId].b,{pinned:[TRAIN_A,TRAIN_B],explicit:true});
  if(myVersion!==version||!a||!b)throw Error('Preparation incomplete');
  if(stagedBuffer){
   try{
    await stagedBuffer.prepare(testId,{lossless:a,'128':b,'320':b},
      {lossless:/-128-v[1-9][0-9]*$/.test(testId)?0.951:1,'128':1,'320':1});
    if(myVersion===version&&stagedBuffer.isReady()){trainingBuffer=stagedBuffer;stagedBuffer=null}
   }catch{ /* Cached native playback stays available on smaller devices. */ }
  }
  if(myVersion!==version)return;
  if(testId==='master-eq-v1'&&!trainingBuffer?.isReady()){
    live=null;session=null;prepareFailed=true;
    scoreboard.textContent='EQ comparison needs seamless playback to keep X blind. This browser could not prepare that mode. Try again or choose another comparison.';
    return;
  }
  session={practice:true,total:mode==='advanced'?20:10};
  scoreboard.textContent='Practice ready. Play A, B and X, then choose your answer.';
  newPracticeTrial();
 }catch{
  if(myVersion===version){live=null;session=null;prepareFailed=true;scoreboard.textContent='Could not prepare the practice recordings. Check your connection and try again.'}
 }finally{
  stagedBuffer?.dispose();
  if(myVersion===version){pending=false;render()}
 }
}
async function prepareScoredTrial(urls,{initial=false}={}){
 // Each new round receives a distinct opaque X URL. Reuse A/B, not old X.
 cache.drop(SCORE_X);
 if(initial){
  const a=await cache.prepare(SCORE_A,urls.A,{pinned:[SCORE_A],explicit:true});if(!a)throw Error('Reference A is not prepared');
  const b=await cache.prepare(SCORE_B,urls.B,{pinned:[SCORE_A,SCORE_B],explicit:true});if(!b)throw Error('Reference B is not prepared');
 }
 const x=await cache.prepare(SCORE_X,urls.X,{pinned:[SCORE_A,SCORE_B],explicit:true});
 if(!x||!cache.has(SCORE_A)||!cache.has(SCORE_B))throw Error('Trial preparation incomplete');
 return {A:cache.get(SCORE_A),B:cache.get(SCORE_B),X:x};
}
async function startScored(){
if(!testId||pending||session)return;
if(localOnly()){await startPractice();return}
// New attempts reset the previous completed-score lock, buffers and counters.
version++;const myVersion=version;
stop();trainingBuffer?.dispose();trainingBuffer=null;cache.clear();round=0;correct=0;locked=false;session=null;live=null;prepareFailed=false;
pending=true;takeFocus();render();
try {
 const data=await api('/v1/start',{testId,mode,share:consent.checked});
 if(myVersion!==version)return;
 if(!data.sessionId||!data.controlKey||!data.urls||!data.roundToken)throw Error('Invalid server session');
 session={id:data.sessionId,controlKey:data.controlKey,token:data.roundToken,total:data.total};
 live=await prepareScoredTrial(data.urls,{initial:true});
 if(myVersion!==version)return;
 scoreboard.textContent='Listening game underway. You can replay A, B and X freely; results appear after the final answer.';
}catch{
 if(myVersion===version){session=null;live=null;prepareFailed=true;scoreboard.textContent='This challenge could not start. Check your connection or use Training.'}
}finally{if(myVersion===version){pending=false;render()}}
}
async function play(slot){
 if(!live||pending)return;
 const src=live[slot];if(!src)return;
 if((mode==='training'||session?.practice)&&trainingBuffer?.isReady()){
  const sourceSlot=slot==='X'?answer:slot;
  const format=(session?.practice&&practiceSwapped?sourceSlot==='B':sourceSlot==='A')?'lossless':'128';
  const toggleOff=selectedTrainingSlot===slot&&trainingBuffer.isPlaying();
  selectedTrainingSlot=slot;
  takeFocus();
  trainingBuffer.select(format);
  if(toggleOff)trainingBuffer.pause();
  else if(!trainingBuffer.isPlaying())trainingBuffer.play();
  root.dataset.trainingPlaying=String(trainingBuffer.isPlaying());
  Object.entries(playButtons).forEach(([key,b])=>b.setAttribute('aria-pressed',String(key===slot)));
  return;
 }
 const wasSelected=playButtons[slot].getAttribute('aria-pressed')==='true';
 const myTurn=++playGeneration;
 const time=Math.max(0,Number.isFinite(audio.currentTime)?audio.currentTime:0);
 const originalSlot=(mode==='training'||session?.practice)&&slot==='X'?answer:slot;
 // Measured MP3-128 decoded RMS is ~0.436 dB quieter than the lossless
 // source; reduce the reference playback gain for Training only.
 audio.volume=(mode==='training'||session?.practice)&&/-128-v[1-9][0-9]*$/.test(testId)&&((session?.practice&&practiceSwapped)?originalSlot==='B':originalSlot==='A')?0.951:1;
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
  // X aliases an already-cached A or B in Training. Selecting a DIFFERENT
  // label must keep playing even if the underlying Blob URL is identical.
  // Only a second tap on the currently selected label toggles pause.
  else if(wasSelected)audio.pause();
  if(myTurn!==playGeneration)return;
  Object.entries(playButtons).forEach(([key,b])=>b.setAttribute('aria-pressed',String(key===slot)));
 }catch{if(myTurn===playGeneration)scoreboard.textContent='Playback failed or was blocked. Press the same listening button again.'}
}
for(const [slot,btn] of Object.entries(playButtons))btn.onclick=()=>play(slot);
async function applyServerProgress(data){
 if(!Number.isInteger(data.answered)||typeof data.complete!=='boolean')throw Error('Invalid response');
 round=data.answered;
 if(data.complete){
  stop();cache.clear();live=null;session=null;locked=true;consent.checked=false;
  const chance=Number.isFinite(data.chanceProbability)?' Chance of this score or higher by random guessing: '+(data.chanceProbability*100).toFixed(1)+'%.':'';
  scoreboard.textContent='You identified '+data.correct+'/'+data.total+' correctly.'+chance+' '+(data.shared?'Included in optional community statistics.':'Your result was not published.')+' These are informal, unsupervised results.';
 }else{
  if(!data.urls||!data.roundToken)throw Error('Missing next trial');
  const sameRound=data.roundToken===session.token;
  session.token=data.roundToken;
  if(!sameRound||![SCORE_A,SCORE_B,SCORE_X].every(cache.has)){
   live=null;render();
   live=await prepareScoredTrial(data.urls,{
    initial:!cache.has(SCORE_A)||!cache.has(SCORE_B)
   });
  }
  locked=false;
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
 if(session?.practice){
  if(guess===answer)correct++;
  round++;
  const total=session.total;
  if(round>=total){
   stop();live=null;session=null;
   scoreboard.textContent='Practice complete: '+correct+'/'+total+' correct. Your score was not sent anywhere. Choose Start practice challenge to try again.';
   render();return;
  }
  scoreboard.textContent='Answer recorded. Compare the next mystery recording.';
  newPracticeTrial();return;
 }
 if(!session)return;
 pending=true;render();
 const control={sessionId:session.id,controlKey:session.controlKey};
 try{
  const data=await api('/v1/answer',{...control,roundToken:session.token,guess});
  await applyServerProgress(data);
 }catch{
  try{
   const resumed=await api('/v1/resume',control);
   await applyServerProgress(resumed);
   if(!resumed.complete)scoreboard.textContent='Connection recovered; round status synchronized.';
  }catch{
   locked=false;
   scoreboard.textContent='Connection interrupted. The current trial is preserved; retry your answer when connected.';
  }
 }finally{pending=false;render()}
}
guessA.onclick=()=>submit('A');guessB.onclick=()=>submit('B');
prepareButton.onclick=()=>prepareTraining();
next.onclick=()=>{if(mode==='training'){round++;if(round>=10){scoreboard.textContent='Training complete: '+correct+'/10. These results are not submitted.';live=null;render()}else newTraining()}};
choose.onchange=()=>{testId=choose.value;reset();recordSelection()};
startButton.onclick=()=>{if(mode!=='training'&&!session&&!pending)startScored()};
statsButton.onclick=async()=>{statsBox.textContent='Checking available community statistics…';try{const response=await fetch(API+'/v1/stats',{mode:'cors'});if(!response.ok)throw Error('unavailable');const data=await response.json();const values=Array.isArray(data.results)?data.results:[];statsBox.textContent='';if(!values.length){statsBox.textContent='No eligible community results yet. At least 10 completed opt-in sessions are required per comparison.';return}const table=el('table',{class:'tsq-abx-results'}),header=el('tr');for(const field of ['Comparison','Level','Sessions','Mean correct'])header.append(el('th',{},field));table.append(header);for(const x of values){const tr=el('tr');for(const value of [tests[x.test_id]?.label||x.test_id,x.mode,String(x.sessions),Math.round(Number(x.accuracy)*100)+'%'])tr.append(el('td',{},value));table.append(tr)}statsBox.append(table,el('p',{},data.note||'Unsupervised, voluntary community listening sessions.'))}catch{statsBox.textContent='Community results are temporarily unavailable. Please try again later.'}};
const query=new URLSearchParams(location.search);
const requestedTest=query.get('test');const requestedMode=query.get('mode');
const wantedMode=modes.some(([id])=>id===requestedMode)?requestedMode:(requestedTest&&tests[requestedTest]?.modes.includes('challenge')?'challenge':requestedTest&&tests[requestedTest]?.modes.includes('advanced')?'advanced':'training');
setMode(wantedMode,requestedTest);
}
document.querySelectorAll('[data-abx-lab]').forEach(init);
})();