/* The Sound Question ABX score API.
   Not deployed by the Pages build. Requires D1 and explicitly validated test catalogue.
   The server alone chooses X and evaluates answers; the browser gets opaque audio URLs. */
const HOST='https://tsq-lab-audio.thesoundquestion.workers.dev';
const SOURCES={
  'formats-light-128':['https://thesoundquestion.pages.dev/assets/audio/formats/light-128.mp3',HOST+'/mixing/reference.flac'],
  'formats-light-320':['https://thesoundquestion.pages.dev/assets/audio/formats/light-320.mp3',HOST+'/mixing/reference.flac'],
  'formats-diva-128':['https://thesoundquestion.pages.dev/assets/audio/formats/diva-128.mp3',HOST+'/mastering/dynamic.flac'],
  'formats-diva-320':['https://thesoundquestion.pages.dev/assets/audio/formats/diva-320.mp3',HOST+'/mastering/dynamic.flac'],
  'master-dynamic-moderate':[HOST+'/mastering/matched-dynamic.flac',HOST+'/mastering/matched-moderate.flac'],
  'master-moderate-brick':[HOST+'/mastering/matched-moderate.flac',HOST+'/mastering/matched-brickwalled.flac'],
  'master-eq':[HOST+'/mastering/eq-off.flac',HOST+'/mastering/eq-on.flac']
};
// Do NOT enable a test by default. Engineering source/volume/alignment review required.
// Note: FLAC vs MP3 exposes an easily observable Content-Type/length side-channel;
// do not enable it until equivalent, opaque, controlled renditions are prepared.
const VALIDATED=new Set([]);
const ORIGIN='https://thesoundquestion.pages.dev';
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
function cors(origin){return origin===ORIGIN?{'access-control-allow-origin':ORIGIN,'vary':'Origin','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'}:{}}
function id(){return crypto.randomUUID()}
const now=()=>Date.now();
const LIMIT=45*60*1000;
async function cleanup(db){await db.prepare('DELETE FROM abx_sessions WHERE expires_at < ?').bind(now()).run()}
async function freshRound(db,session,round){const choice=crypto.getRandomValues(new Uint32Array(1))[0]%2;const token=id();await db.prepare('INSERT INTO abx_rounds(session_id, round_index, token, answer, answered_at) VALUES(?,?,?,?,NULL)').bind(session,round,token,choice?'B':'A').run();return {token}}
function audioLinks(request,session,round,token){const base=new URL(request.url).origin+'/v1/audio/'+encodeURIComponent(session)+'/'+round+'/'+encodeURIComponent(token)+'/';return {A:base+'A',B:base+'B',X:base+'X'}}
async function post(request){try{const data=await request.json();if(!data||typeof data!=='object'||Array.isArray(data))return null;return data}catch{return null}}
function safeOrigin(req){const o=req.headers.get('origin');return o===ORIGIN||(!o&&req.headers.get('sec-fetch-site')==='same-origin')}
export default {
async fetch(request,env){
const url=new URL(request.url),origin=request.headers.get('origin'),head=cors(origin);
if(request.method==='OPTIONS')return new Response(null,{status:204,headers:head});
if(url.pathname==='/v1/health')return json({ok:!!env.DB,scoredEnabled:VALIDATED.size>0},200,head);
if(!env.DB)return json({error:'Database not configured'},503,head);
if(!safeOrigin(request))return json({error:'Origin not authorized'},403,head);
if(request.method==='POST'&&url.pathname==='/v1/start'){
const data=await post(request);
if(!data||!VALIDATED.has(data.testId)||!SOURCES[data.testId])return json({error:'This comparison has not passed scored-test validation'},409,head);
if(!['challenge','advanced'].includes(data.mode))return json({error:'Invalid mode'},400,head);
const total=data.mode==='advanced'?20:10,session=id(),t=now();
await env.DB.prepare('INSERT INTO abx_sessions(id, test_id, mode, total, answered, correct, share, created_at, expires_at, completed_at) VALUES(?,?,?,?,0,0,?,?,?,NULL)').bind(session,data.testId,data.mode,total,data.share===true?1:0,t,t+LIMIT).run();
const next=await freshRound(env.DB,session,0);
return json({sessionId:session,total,roundToken:next.token,urls:audioLinks(request,session,0,next.token)},200,head);
}
if(request.method==='POST'&&url.pathname==='/v1/answer'){
const data=await post(request);if(!data||!['A','B'].includes(data.guess)||typeof data.sessionId!=='string'||typeof data.roundToken!=='string')return json({error:'Invalid submission'},400,head);
const s=await env.DB.prepare('SELECT * FROM abx_sessions WHERE id=?').bind(data.sessionId).first();
if(!s||s.completed_at!==null||s.expires_at<now())return json({error:'Session expired or completed'},410,head);
const r=await env.DB.prepare('SELECT * FROM abx_rounds WHERE session_id=? AND round_index=? AND token=?').bind(s.id,s.answered,data.roundToken).first();
if(!r||r.answered_at!==null)return json({error:'Round already submitted or invalid'},409,head);
const right=data.guess===r.answer?1:0,t=now(),nextCount=s.answered+1;
await env.DB.batch([
env.DB.prepare('UPDATE abx_rounds SET answered_at=?, guess=? WHERE session_id=? AND round_index=? AND answered_at IS NULL').bind(t,data.guess,s.id,s.answered),
env.DB.prepare('UPDATE abx_sessions SET answered=answered+1, correct=correct+?, completed_at=? WHERE id=? AND answered=? AND completed_at IS NULL').bind(right,nextCount===s.total?t:null,s.id,s.answered)
]);
if(nextCount===s.total){const result={complete:true,answered:nextCount,correct:s.correct+right,total:s.total,shared:!!s.share};return json(result,200,head)}
const next=await freshRound(env.DB,s.id,nextCount);
return json({complete:false,answered:nextCount,roundToken:next.token,urls:audioLinks(request,s.id,nextCount,next.token)},200,head);
}
if(request.method==='GET'&&url.pathname==='/v1/stats'){
const data=await env.DB.prepare('SELECT test_id,mode,total,COUNT(*) sessions,AVG(correct*1.0/total) accuracy FROM abx_sessions WHERE share=1 AND completed_at IS NOT NULL GROUP BY test_id,mode,total HAVING COUNT(*)>=10').all();
return json({minimumSample:10,results:data.results||[],note:'Voluntary, unverified community listening scores; not controlled hearing measurements'},200,head)
}
if(request.method==='GET'&&url.pathname.startsWith('/v1/audio/')){
const parts=url.pathname.split('/');if(parts.length!==7)return json({error:'Invalid audio route'},404,head);
const [,v1,audio,session,index,token,slot]=parts;if(!['A','B','X'].includes(slot))return json({error:'Invalid slot'},400,head);
const s=await env.DB.prepare('SELECT test_id,answered,expires_at,completed_at FROM abx_sessions WHERE id=?').bind(session).first();
if(!s||s.completed_at!==null||s.expires_at<now()||Number(index)!==s.answered)return json({error:'Audio token expired'},403,head);
const r=await env.DB.prepare('SELECT answer FROM abx_rounds WHERE session_id=? AND round_index=? AND token=? AND answered_at IS NULL').bind(session,s.answered,token).first();
if(!r)return json({error:'Invalid audio token'},403,head);
const which=slot==='X'?r.answer:slot;const src=SOURCES[s.test_id]?.[which==='A'?0:1];if(!src)return json({error:'Source unavailable'},404,head);
const headers={};if(request.headers.has('range'))headers.range=request.headers.get('range');
const upstream=await fetch(src,{headers,redirect:'follow'});if(!upstream.ok&&upstream.status!==206)return json({error:'Audio source unavailable'},502,head);
const outHeaders={'cache-control':'private, no-store','access-control-allow-origin':ORIGIN,'vary':'Origin','accept-ranges':'bytes','x-content-type-options':'nosniff'};
for(const k of ['content-type','content-length','content-range'])if(upstream.headers.has(k))outHeaders[k]=upstream.headers.get(k);
return new Response(upstream.body,{status:upstream.status,headers:outHeaders});
}
return json({error:'Not found'},404,head);
}
};