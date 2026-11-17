// Full scored ABX browser regression using a tiny synthetic WAV and a mocked
// Worker. Zero public Worker calls, zero D1 writes, zero external audio traffic.
// Verifies playback, recovery after a failed X download, consent reset and
// a second scored attempt. The real Worker has separate protocol unit tests.
import {chromium} from 'playwright';

const BASE='http://127.0.0.1:8765/labs/abx/?test=master-eq-v1&mode=challenge';
const API='https://tsq-abx.thesoundquestion.workers.dev';
function makeWav(){
 const rate=22050,seconds=1.3,frames=Math.round(rate*seconds);
 const b=Buffer.alloc(44+frames*4);
 b.write('RIFF',0);b.writeUInt32LE(b.length-8,4);b.write('WAVE',8);
 b.write('fmt ',12);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);
 b.writeUInt16LE(2,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*4,28);
 b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);
 b.write('data',36);b.writeUInt32LE(frames*4,40);
 for(let i=0;i<frames;i++){
  const sample=Math.round(Math.sin(i*2*Math.PI*330/rate)*5000);
  b.writeInt16LE(sample,44+i*4);b.writeInt16LE(sample,46+i*4);
 }
 return b;
}
const wav=makeWav(),browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1050,height:800}});
const page=await context.newPage();
const errors=[],stats={starts:0,answers:0,resumes:0,audio:0,failures:0};
page.on('pageerror',e=>errors.push(e.message));
let active=null,failedRound3=false;
const response=(value)=>JSON.stringify(value);
const cors={'access-control-allow-origin':'*','access-control-allow-headers':'content-type','access-control-allow-methods':'GET,POST,OPTIONS','cache-control':'no-store'};
function snapshot(){
 const current=active.answered;
 return {
  sessionId:active.id,controlKey:active.controlKey,roundToken:'round-'+current,
  answered:current,total:10,complete:current>=10,
  ...(current>=10?{correct:5,shared:false,chanceProbability:.5}:{
   urls:{
    A:API+'/v1/audio/'+active.id+'/0/A',
    B:API+'/v1/audio/'+active.id+'/0/B',
    X:API+'/v1/audio/'+active.id+'/'+current+'/X'
   }
  })
 };
}
async function serve(route){
 const req=route.request(),url=new URL(req.url()),p=url.pathname;
 if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers:cors});return;}
 const send=async(body,status=200)=>route.fulfill({status,headers:cors,contentType:'application/json',body:response(body)});
 if(p==='/v1/start'){
  const payload=req.postDataJSON();
  if(payload.mode!=='challenge'||payload.testId!=='master-eq-v1')return send({error:'bad game'},400);
  stats.starts++;
  active={id:'mock-'+stats.starts,controlKey:'private-'+stats.starts,answered:0};
  return send(snapshot());
 }
 if(p==='/v1/answer'){
  stats.answers++;
  const payload=req.postDataJSON();
  if(!active||payload.controlKey!==active.controlKey||payload.roundToken!=='round-'+active.answered)return send({error:'stale round'},409);
  active.answered++;
  return send(snapshot());
 }
 if(p==='/v1/resume'){stats.resumes++;return send(snapshot());}
 if(p.startsWith('/v1/audio/')){
  stats.audio++;
  if(/\/3\/X$/.test(p)&&!failedRound3){
   failedRound3=true;stats.failures++;
   return send({error:'Simulated one-time audio interruption'},502);
  }
  return route.fulfill({status:200,contentType:'audio/wav',headers:{...cors,'accept-ranges':'bytes'},body:wav});
 }
 return send({error:'mock path not found'},404);
}
const ready=async()=>page.waitForFunction(()=>{
 const root=document.querySelector('[data-abx-lab="all"]');
 const a=[...root.querySelectorAll('button[data-slot]')];
 return a.length===3&&a.every(n=>!n.disabled);
},null,{timeout:12000});
try{
 await page.route('https://tsq-abx.thesoundquestion.workers.dev/v1/**',serve);
 await page.goto(BASE,{waitUntil:'load',timeout:30000});
 const root=page.locator('[data-abx-lab="all"]');
 if((await root.locator('select').inputValue())!=='master-eq-v1')throw Error('Wrong initial ABX game');
 if(!(await root.locator('.tsq-abx-trial-readiness').isHidden()))throw Error('Scored game leaks loading-state timing');
 const consent=root.locator('.tsq-abx-consent input');
 await consent.check();
 await root.getByRole('button',{name:'Start scored session'}).click();
 await ready();
 if(stats.audio!==3)throw Error('First round should fetch 2 references plus 1 X: '+stats.audio);
 await root.locator('button[data-slot="A"]').click();
 await page.waitForFunction(()=>{
   const a=document.querySelector('[data-abx-lab="all"] audio');
   return a&&!a.paused&&a.currentTime>.13&&!a.error;
 },null,{timeout:15000});
 const afterPlay=stats.audio;
 await root.locator('button[data-slot="B"]').click();
 await root.locator('button[data-slot="X"]').click();
 await root.locator('button[data-slot="A"]').click();
 if(stats.audio!==afterPlay)throw Error('Repeated A/B/X clicks fetched audio again');
 for(let i=0;i<10;i++){
  await ready();
  await root.getByRole('button',{name:'X is A'}).click();
  if(i===9){
   await page.waitForFunction(()=>document.querySelector('.tsq-abx-scoreboard')?.textContent.includes('You identified'),null,{timeout:15000});
  }else{
   await page.waitForFunction(expected=>{
    const el=document.querySelector('[data-abx-lab="all"]');
    return el?.querySelector('.tsq-abx-progress')?.textContent.startsWith('Round '+expected+' of 10')&&
      [...el.querySelectorAll('[data-slot]')].every(b=>!b.disabled);
   },i+2,{timeout:18000});
  }
 }
 if(stats.failures!==1||stats.resumes!==1)throw Error('Transient round-3 failure was not retried through resume: '+JSON.stringify(stats));
 if(await consent.isChecked())throw Error('Score sharing consent survived a completed session');
 const finished=await root.locator('.tsq-abx-scoreboard').innerText();
 if(!finished.includes('Your result was not published'))throw Error('Private completed score incorrectly shown');
 const before=stats.audio;
 await root.getByRole('button',{name:'Start scored session'}).click();
 await ready();
 if(stats.starts!==2||stats.audio!==before+3)throw Error('Second challenge did not reset/reload correctly');
 if(!(await root.getByRole('button',{name:'X is A'}).isEnabled()))throw Error('New session remained locked');
 if(await consent.isChecked())throw Error('Sharing checkbox not reset');
 if(errors.length)throw Error('Page JavaScript errors: '+errors.join(' | '));
 console.log('ABX_SCORED_BROWSER_MOCK_OK');
 console.log('10 rounds, private result, simulated transient X failure/recovery, second attempt, no repeat audio requests');
 console.log(JSON.stringify(stats));
}finally{
 await context.close();
 await browser.close();
}
