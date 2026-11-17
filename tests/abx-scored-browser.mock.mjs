// Browser regression for the unreleased, local-only ABX Challenge/Advanced beta.
// Existing Worker/D1 protocol tests cover future server scoring separately.
// No public scoring requests, no personal data submission, two audio files per game.
import {chromium} from 'playwright';

const BASE='http://127.0.0.1:8765/labs/abx/';
const AUDIO='https://tsq-lab-audio.thesoundquestion.workers.dev';
function makeWav(){
 const rate=22050,seconds=3,frames=Math.round(rate*seconds);
 const b=Buffer.alloc(44+frames*4);
 b.write('RIFF',0);b.writeUInt32LE(b.length-8,4);
 b.write('WAVE',8);b.write('fmt ',12);b.writeUInt32LE(16,16);
 b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);
 b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*4,28);
 b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);
 b.write('data',36);b.writeUInt32LE(frames*4,40);
 for(let i=0;i<frames;i++){
  const sample=Math.round(Math.sin(i*2*Math.PI*330/rate)*4600);
  b.writeInt16LE(sample,44+i*4);b.writeInt16LE(sample,46+i*4);
 }
 return b;
}
const wav=makeWav(),browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1040,height:820}});
const page=await context.newPage(),errors=[];
const stats={audio:0,server:0};
page.on('pageerror',error=>errors.push(error.message));
const ready=async()=>page.waitForFunction(()=>{
 const root=document.querySelector('[data-abx-lab="all"]');
 const buttons=[...root?.querySelectorAll('button[data-slot]')||[]];
 return buttons.length===3&&buttons.every(button=>!button.disabled);
},null,{timeout:18000});
async function finishGame(root,count){
 for(let i=0;i<count;i++){
  await ready();
  await root.getByRole('button',{name:'X is A'}).click();
  if(i<count-1)await page.waitForFunction(n=>
   document.querySelector('.tsq-abx-progress')?.textContent.startsWith('Round '+n+' of '),
   i+2,{timeout:12000});
 }
 await page.waitForFunction(n=>
   document.querySelector('.tsq-abx-scoreboard')?.textContent.includes('Practice complete:')&&
   document.querySelector('.tsq-abx-scoreboard')?.textContent.includes('/'+n+' correct'),
   count,{timeout:12000});
}
try{
 await page.route('https://tsq-abx.thesoundquestion.workers.dev/**',async route=>{
  stats.server++;
  await route.abort('failed');
 });
 await page.route(AUDIO+'/**',async route=>{
  stats.audio++;
  await route.fulfill({
   status:200,contentType:'audio/wav',
   headers:{'access-control-allow-origin':'*','cache-control':'no-store'},
   body:wav
  });
 });
 await page.goto(BASE+'?test=master-eq-v1&mode=challenge',{waitUntil:'load',timeout:30000});
 const root=page.locator('[data-abx-lab="all"]');
 if(await root.locator('.tsq-abx-consent').isVisible())throw Error('Beta practice must hide community opt-in');
 if(await root.locator('.tsq-abx-stats-button').isVisible())throw Error('Beta practice must hide public scores');
 await root.getByRole('button',{name:'Start practice challenge'}).click();
 await ready();
 if(stats.audio!==2)throw Error('Practice should prepare exactly two recordings: '+stats.audio);
 await root.locator('button[data-slot="A"]').click();
 await page.waitForFunction(()=>{
  const a=document.querySelector('[data-abx-lab="all"] audio');
  const root=document.querySelector('[data-abx-lab="all"]');
  return root?.dataset.trainingPlaying==='true'||(a&&!a.paused&&a.currentTime>.05&&!a.error);
 },null,{timeout:16000});
 await root.locator('button[data-slot="B"]').click();
 await root.locator('button[data-slot="X"]').click();
 if(stats.audio!==2)throw Error('Replaying A/B/X refetched remote audio');
 await finishGame(root,10);
 if(!(await root.locator('.tsq-abx-scoreboard').innerText()).includes('not sent anywhere'))throw Error('Result privacy not clear');
 await root.getByRole('button',{name:'Start practice challenge'}).click();
 await ready();
 if(stats.audio!==4)throw Error('Second attempt must reset and prepare two recordings');
 await root.locator('[data-mode="advanced"]').count().then(async count=>{
  if(count!==1)throw Error('Advanced mode missing');
 });
 // Complete the new Challenge before switching modes (mid-game switching is locked).
 await finishGame(root,10);
 await root.locator('[data-mode="advanced"]').click();
 await root.getByRole('button',{name:'Start practice challenge'}).click();
 await ready();
 await finishGame(root,20);
 if(stats.server!==0)throw Error('Local practice contacted unreleased scoring service: '+stats.server);
 if(errors.length)throw Error('Browser JS errors: '+errors.join(' | '));
 console.log('ABX_LOCAL_BETA_BROWSER_OK');
 console.log('Challenge 10, repeat 10, Advanced 20, no scored Worker calls, '+stats.audio+' audio requests');
}finally{
 await context.close();await browser.close();
}
