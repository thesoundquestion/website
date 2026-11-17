/* The Sound Question ABX score service, staged and NOT deployed.
 * Production comparisons remain disabled until audio / privacy / abuse reviews pass.
 * The client is untrusted. No browser-supplied score, answer key or A/B mapping is accepted.
 */
const HOST='https://tsq-lab-audio.thesoundquestion.workers.dev';
const SOURCES=Object.freeze({
  'formats-light-128-v1':['https://thesoundquestion.pages.dev/assets/audio/formats/light-128.mp3',HOST+'/mixing/reference.flac'],
  'formats-light-320-v1':['https://thesoundquestion.pages.dev/assets/audio/formats/light-320.mp3',HOST+'/mixing/reference.flac'],
  'formats-diva-128-v1':['https://thesoundquestion.pages.dev/assets/audio/formats/diva-128.mp3',HOST+'/mastering/dynamic.flac'],
  'formats-diva-320-v1':['https://thesoundquestion.pages.dev/assets/audio/formats/diva-320.mp3',HOST+'/mastering/dynamic.flac'],
  'master-dynamic-moderate-v1':[HOST+'/mastering/matched-dynamic.flac',HOST+'/mastering/matched-moderate.flac'],
  'master-moderate-brick-v1':[HOST+'/mastering/matched-moderate.flac',HOST+'/mastering/matched-brickwalled.flac'],
  'master-eq-v1':[HOST+'/mastering/eq-off.flac',HOST+'/mastering/eq-on.flac']
});
// Engineering release gate. Never enable a comparison just because its audio URL works.
const VALIDATED=new Set([]);
const ORIGIN='https://thesoundquestion.pages.dev';
const SESSION_MS=2*60*60*1000;
const DAY=24*60*60*1000;
const statsText='Voluntary, unverified community listening sessions; not controlled hearing measurements or a ranking of listeners.';
const standardHeaders={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{...standardHeaders,...headers}});
function cors(origin){return origin===ORIGIN?{'access-control-allow-origin':ORIGIN,'access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type','vary':'Origin'}:{}}
function equalText(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let mismatch=0;for(let i=0;i<a.length;i++)mismatch|=a.charCodeAt(i)^b.charCodeAt(i);return mismatch===0}
function hex(bytes){return [...bytes].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function sha256(str){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(str))))}
async function hmac(key,message){
 const raw=new TextEncoder().encode(key);
 const imported=await crypto.subtle.importKey('raw',raw,{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return new Uint8Array(await crypto.subtle.sign('HMAC',imported,new TextEncoder().encode(message)));
}
async function trial(secret,sessionId,round){
 const [ans,tok,flip]=await Promise.all([
   hmac(secret,'answer:'+sessionId+':'+round),
   hmac(secret,'token:'+sessionId+':'+round),
   hmac(secret,'flip:'+sessionId)
 ]);
 return {answer:(ans[0]&1)?'B':'A',token:hex(tok),flip:flip[0]&1};
}
function safeId(v){return typeof v==='string'&&/^[0-9a-f-]{36}$/i.test(v)}
function safeToken(v){return typeof v==='string'&&/^[a-f0-9]{64}$/.test(v)}
function safeControl(v){return safeId(v)}
async function payload(request){
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return null;
 if(Number(request.headers.get('content-length'))>2048)return null;
 let raw;try{raw=await request.text()}catch{return null}
 if(raw.length>2048)return null;
 try{const p=JSON.parse(raw);return p&&typeof p==='object'&&!Array.isArray(p)?p:null}catch{return null}
}
function audioLinks(request,sessionId,round,token){
 const root=new URL(request.url).origin+'/v1/audio/'+sessionId+'/'+round+'/'+token+'/';
 return {A:root+'A',B:root+'B',X:root+'X'};
}
function chanceAtLeast(correct,total){
 let probability=0;
 for(let k=correct;k<=total;k++){
   let n=1;for(let j=1;j<=k;j++)n=n*(total-j+1)/j;
   probability+=n/2**total;
 }
 return Number(probability.toFixed(8));
}
const basic=(s)=>({answered:s.answered,total:s.total,complete:s.completed_at!==null});
function snapshot(request,s,controlKey,secret){
 return trial(secret,s.id,s.answered).then(t=>({
  ...basic(s),
  sessionId:s.id,
  ...(controlKey?{controlKey}:{}),
  ...(s.completed_at!==null?{correct:s.correct,shared:!!s.share,chanceProbability:chanceAtLeast(s.correct,s.total)}:
    {roundToken:t.token,urls:audioLinks(request,s.id,s.answered,t.token)})
 }));
}
function available(env){return !!(env?.DB&&typeof env.ABX_SECRET==='string'&&env.ABX_SECRET.length>=32&&env.API_LIMITER&&env.START_LIMITER)}
async function requireRate(env,name,key){
 const result=await env[name].limit({key});
 return result&&result.success===true;
}
function visitorKey(request){
 // Only an ephemeral rate-limit key. This value is never put in D1 or returned.
 return request.headers.get('cf-connecting-ip')||'no-ip';
}
async function sessionFor(env,id,control){
 const row=await env.DB.prepare('SELECT * FROM abx_sessions WHERE id=?').bind(id).first();
 if(!row||!equalText(row.control_hash,await sha256(control)))return null;
 return row;
}
async function stats(env){
 // Query raw aggregates; apply minimum 10 completed opted-in sessions to every
 // comparison/mode/trial-count cell before sending anything to the client.
 const q=await env.DB.prepare('SELECT test_id,mode,total,correct,COUNT(*) AS sessions FROM abx_sessions WHERE share=1 AND completed_at IS NOT NULL AND purge_at>? GROUP BY test_id,mode,total,correct').bind(Date.now()).all();
 const by=new Map();
 for(const x of q.results||[]){
  const key=x.test_id+'|'+x.mode+'|'+x.total;
  const group=by.get(key)||{test_id:x.test_id,mode:x.mode,total:x.total,sessions:0,scoreSum:0,histogram:{}};
  group.sessions+=Number(x.sessions);
  group.scoreSum+=Number(x.correct)*Number(x.sessions);
  group.histogram[x.correct]=(group.histogram[x.correct]||0)+Number(x.sessions);
  by.set(key,group);
 }
 return [...by.values()].filter(g=>g.sessions>=10).map(g=>({
  test_id:g.test_id,mode:g.mode,total:g.total,sessions:g.sessions,
  accuracy:Number((g.scoreSum/(g.sessions*g.total)).toFixed(4)),
  histogram:g.histogram
 }));
}
async function scoreAnswer(env,request,data){
 if(!safeId(data?.sessionId)||!safeControl(data?.controlKey)||!safeToken(data?.roundToken)||!['A','B'].includes(data?.guess))return json({error:'Invalid submission'},400);
 let s=await sessionFor(env,data.sessionId,data.controlKey);
 if(!s)return json({error:'Invalid session credentials'},403);
 const now=Date.now();
 if(s.expires_at<=now)return json({error:'Session expired'},410);
 if(s.answered>0){
  const previous=await trial(env.ABX_SECRET,s.id,s.answered-1);
  if(equalText(data.roundToken,previous.token))return json(await snapshot(request,s,null,env.ABX_SECRET)); // Safe retry.
 }
 if(s.completed_at!==null)return json({error:'Already completed'},409);
 const current=await trial(env.ABX_SECRET,s.id,s.answered);
 if(!equalText(data.roundToken,current.token))return json({error:'Invalid or superseded round'},409);
 const right=data.guess===current.answer?1:0;
 // Single conditional UPDATE is atomic in D1. Only the first concurrent answer
 // for the current round advances the counter; a stale reader cannot increment.
 const q=await env.DB.prepare(
  'UPDATE abx_sessions SET answered=answered+1, correct=correct+?, completed_at=CASE WHEN answered+1=total THEN ? ELSE NULL END, purge_at=CASE WHEN answered+1=total THEN ? ELSE purge_at END WHERE id=? AND answered=? AND completed_at IS NULL AND expires_at>?'
 ).bind(right,now,now+(s.share?180:1)*DAY,s.id,s.answered,now).run();
 if(q.meta?.changes!==1){
  s=await sessionFor(env,data.sessionId,data.controlKey);
  if(!s)return json({error:'Session unavailable'},403);
  if(s.answered>0){
   const previous=await trial(env.ABX_SECRET,s.id,s.answered-1);
   if(equalText(data.roundToken,previous.token))return json(await snapshot(request,s,null,env.ABX_SECRET));
  }
  return json({error:'Round already submitted or out of date'},409);
 }
 const updated={...s,answered:s.answered+1,correct:s.correct+right,completed_at:s.answered+1===s.total?now:null};
 return json(await snapshot(request,updated,null,env.ABX_SECRET));
}
export function createAbxService({validated=VALIDATED,sources=SOURCES}={}){
 return {
 async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('origin'),corsHeaders=cors(origin);
  const respond=(body,status=200)=>json(body,status,corsHeaders);
  if(request.method==='OPTIONS'){
   return origin===ORIGIN?new Response(null,{status:204,headers:corsHeaders}):respond({error:'Origin not authorized'},403);
  }
  if(url.pathname==='/v1/health')return respond({status:'staged',scoredEnabled:validated.size>0&&available(env)});
  if(origin!==ORIGIN)return respond({error:'Origin not authorized'},403);
  if(!available(env))return respond({error:'Scoring infrastructure not configured'},503);
  const ip=visitorKey(request);
  if(url.pathname!=='/v1/audio'&&!url.pathname.startsWith('/v1/audio/')){
   if(!await requireRate(env,'API_LIMITER','api:'+ip))return respond({error:'Request limit reached'},429);
  }
  if(request.method==='GET'&&url.pathname==='/v1/stats'){
   const result=await stats(env);return respond({minimumSample:10,results:result,note:statsText});
  }
  if(request.method==='POST'&&url.pathname==='/v1/start'){
   if(!await requireRate(env,'START_LIMITER','start:'+ip))return respond({error:'Session limit reached'},429);
   const data=await payload(request);
   if(!data||!['challenge','advanced'].includes(data.mode))return respond({error:'Invalid request'},400);
   if(typeof data.testId!=='string'||!/-v[1-9][0-9]*$/.test(data.testId)||!validated.has(data.testId)||!sources[data.testId])return respond({error:'This comparison has not passed scored-test validation'},409);
   if(typeof data.share!=='boolean')return respond({error:'Consent selection must be explicit'},400);
   const t=Date.now(),id=crypto.randomUUID(),controlKey=crypto.randomUUID(),controlHash=await sha256(controlKey);
   const total=data.mode==='challenge'?10:20;
   await env.DB.prepare(
    'INSERT INTO abx_sessions(id,control_hash,test_id,mode,total,answered,correct,share,created_at,expires_at,purge_at,completed_at) VALUES(?,?,?,?,?,0,0,?,?,?,?,NULL)'
   ).bind(id,controlHash,data.testId,data.mode,total,data.share?1:0,t,t+SESSION_MS,t+SESSION_MS).run();
   const row={id,total,answered:0,correct:0,completed_at:null};
   return respond(await snapshot(request,row,controlKey,env.ABX_SECRET));
  }
  if(request.method==='POST'&&url.pathname==='/v1/resume'){
   const data=await payload(request);
   if(!safeId(data?.sessionId)||!safeControl(data?.controlKey))return respond({error:'Invalid request'},400);
   const s=await sessionFor(env,data.sessionId,data.controlKey);
   if(!s)return respond({error:'Invalid session credentials'},403);
   if(s.expires_at<=Date.now())return respond({error:'Session expired'},410);
   return respond(await snapshot(request,s,null,env.ABX_SECRET));
  }
  if(request.method==='POST'&&url.pathname==='/v1/answer'){
   const data=await payload(request);
   const response=await scoreAnswer(env,request,data);
   for(const [key,value] of Object.entries(corsHeaders))response.headers.set(key,value);
   return response;
  }
  if(request.method==='GET'&&url.pathname.startsWith('/v1/audio/')){
   const parts=url.pathname.split('/');
   if(parts.length!==7)return respond({error:'Invalid audio route'},404);
   const [,v1,audio,id,indexText,token,slot]=parts;
   if(v1!=='v1'||audio!=='audio'||!safeId(id)||!safeToken(token)||!['A','B','X'].includes(slot)||!/^(0|[1-9]\d?)$/.test(indexText))return respond({error:'Invalid audio request'},400);
   const s=await env.DB.prepare('SELECT id,test_id,answered,total,expires_at,completed_at FROM abx_sessions WHERE id=?').bind(id).first();
   if(!s||s.completed_at!==null||s.expires_at<=Date.now()||Number(indexText)!==s.answered)return respond({error:'Audio token expired'},403);
   const t=await trial(env.ABX_SECRET,id,s.answered);
   if(!equalText(token,t.token))return respond({error:'Invalid audio token'},403);
   const isA=(slot==='X'?t.answer:slot)==='A';
   const src=sources[s.test_id]?.[isA?t.flip:1-t.flip];
   if(!src)return respond({error:'Source unavailable'},404);
   const range=request.headers.get('range');
   if(range&&!/^bytes=\d*-\d*$/.test(range))return respond({error:'Unsupported range'},416);
   let upstream;
   try{upstream=await fetch(src,{headers:range?{range}:{},redirect:'follow'})}
   catch{return respond({error:'Audio origin unavailable'},502)}
   if(upstream.status!==200&&upstream.status!==206)return respond({error:'Audio origin unavailable'},502);
   const h={'cache-control':'no-store','access-control-allow-origin':ORIGIN,'vary':'Origin','x-content-type-options':'nosniff'};
   // Do not relay original filename or redirect metadata. Response sizes, timing
   // and content still leak identity; this endpoint is NOT a cheat-proof ABX channel.
   for(const k of ['content-type','content-range','content-length','accept-ranges'])if(upstream.headers.has(k))h[k]=upstream.headers.get(k);
   return new Response(upstream.body,{status:upstream.status,headers:h});
  }
  return respond({error:'Not found'},404);
 },
 async scheduled(_event,env){
  if(!env.DB)return;
  await env.DB.prepare('DELETE FROM abx_sessions WHERE purge_at<?').bind(Date.now()).run();
 }
 };
}
export default createAbxService();
