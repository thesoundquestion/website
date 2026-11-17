import test from 'node:test';
import assert from 'node:assert/strict';
import {createAbxService,binomialTail} from '../workers/abx/index.mjs';

const ORIGIN='https://thesoundquestion.pages.dev';
const BASE='https://tsq-abx.example.test';
const secret='test-secret-only-do-not-use-in-production-1234567890';
class FakeD1{
 constructor(){this.rows=new Map()}
 prepare(sql){
  const db=this;let args=[];
  return {
   bind(...values){args=values;return this},
   async first(){
    if(sql.startsWith('SELECT * FROM abx_sessions')||sql.startsWith('SELECT id,test_id'))return structuredClone(db.rows.get(args[0])||null);
    throw Error('Unexpected first query: '+sql);
   },
   async run(){
    if(sql.startsWith('INSERT INTO abx_sessions')){
     const [id,control_hash,test_id,mode,total,share,created_at,expires_at,purge_at]=args;
     if(db.rows.has(id))throw Error('Duplicate ID');
     db.rows.set(id,{id,control_hash,test_id,mode,total,answered:0,correct:0,share,created_at,expires_at,purge_at,completed_at:null});
     return {meta:{changes:1}};
    }
    if(sql.startsWith('UPDATE abx_sessions')){
     const [right,now,purge_at,id,expected,notExpired]=args;
     const r=db.rows.get(id);
     if(!r||r.answered!==expected||r.completed_at!==null||r.expires_at<=notExpired)return {meta:{changes:0}};
     r.answered++;r.correct+=right;
     if(r.answered===r.total){r.completed_at=now;r.purge_at=purge_at}
     return {meta:{changes:1}};
    }
    if(sql.startsWith('DELETE FROM abx_sessions')){
     let n=0;for(const [id,r] of db.rows)if(r.purge_at<args[0]){db.rows.delete(id);n++}
     return {meta:{changes:n}};
    }
    throw Error('Unexpected run query: '+sql);
   },
   async all(){
    if(!sql.startsWith('SELECT test_id,mode,total,correct,COUNT(*)'))throw Error('Unexpected all query: '+sql);
    const counts=new Map();
    for(const r of db.rows.values()){
     if(!r.share||r.completed_at===null||r.purge_at<=args[0])continue;
     const key=[r.test_id,r.mode,r.total,r.correct].join('|');
     const prev=counts.get(key)||{test_id:r.test_id,mode:r.mode,total:r.total,correct:r.correct,sessions:0};
     prev.sessions++;counts.set(key,prev);
    }
    return {results:[...counts.values()]};
   }
  }
 }
}
function setup({allowed=true,bound=true,limit=true}={}){
 const db=new FakeD1(), limiter={limit:async()=>({success:limit})};
 const env={DB:db,ABX_SECRET:secret,ABX_PUBLIC_ENABLED:'true',API_LIMITER:limiter,START_LIMITER:limiter,AUDIO_LIMITER:limiter};
 if(!bound)delete env.START_LIMITER;
 const service=createAbxService({validated:allowed?new Map([['test-v1',['challenge','advanced']]]):new Map(),sources:{'test-v1':['https://audio.example/a.flac','https://audio.example/b.flac']}});
 return {db,env,service};
}
async function send(service,env,path,body=null,{origin=ORIGIN,method=body?'POST':'GET',headers={}}={}){
 const request=new Request(BASE+path,{method,headers:{origin,'cf-connecting-ip':'198.51.100.7',...(body?{'content-type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
 const result=await service.fetch(request,env);
 let data=null;try{data=await result.json()}catch{}
 return {status:result.status,data,headers:result.headers};
}
async function begin(service,env,mode='challenge',share=false){
 const r=await send(service,env,'/v1/start',{testId:'test-v1',mode,share});
 assert.equal(r.status,200,JSON.stringify(r.data));return r.data;
}
test('fails closed without all required bindings, when unapproved or cross-origin',async()=>{
 const missing=setup({bound:false});
 assert.equal((await send(missing.service,missing.env,'/v1/start',{testId:'test-v1',mode:'challenge',share:false})).status,503);
 const closed=setup({allowed:false});
 assert.equal((await send(closed.service,closed.env,'/v1/start',{testId:'test-v1',mode:'challenge',share:false})).status,409);
 const good=setup();
 assert.equal((await send(good.service,good.env,'/v1/start',{testId:'test-v1',mode:'challenge',share:false},{origin:'https://attacker.test'})).status,403);
 assert.equal((await send(good.service,good.env,'/v1/start',{testId:'test-v1',mode:'challenge'})).status,400);
 assert.equal((await send(good.service,good.env,'/v1/start',{testId:'test-v1',mode:'expert',share:false})).status,400);
 const limited=setup({limit:false});
 assert.equal((await send(limited.service,limited.env,'/v1/start',{testId:'test-v1',mode:'challenge',share:false})).status,429);
});
test('answers stay private, controls and audio tokens are distinct',async()=>{
 const {service,env,db}=setup();const first=await begin(service,env);
 assert.equal(first.answered,0);assert.equal(first.total,10);
 assert.ok(first.controlKey&&first.roundToken&&first.urls.X);
 assert.equal(first.correct,undefined);
 assert.equal(first.chanceProbability,undefined);
 assert.ok(!first.urls.X.includes(first.controlKey),'control credential leaked in audio URL');
 assert.ok(!JSON.stringify(first).includes('answer:'));
 assert.equal((await send(service,env,'/v1/answer',{sessionId:first.sessionId,roundToken:first.roundToken,guess:'A'})).status,400);
 assert.equal((await send(service,env,'/v1/answer',{sessionId:first.sessionId,controlKey:crypto.randomUUID(),roundToken:first.roundToken,guess:'A'})).status,403);
 assert.equal(db.rows.get(first.sessionId).answered,0);
});
test('concurrent answers advance exactly once; retries are idempotent and do not reveal correctness',async()=>{
 const {service,env,db}=setup();const first=await begin(service,env);
 const args={sessionId:first.sessionId,controlKey:first.controlKey,roundToken:first.roundToken};
 const results=await Promise.all([send(service,env,'/v1/answer',{...args,guess:'A'}),send(service,env,'/v1/answer',{...args,guess:'B'})]);
 assert.equal(db.rows.get(first.sessionId).answered,1);
 assert.ok(db.rows.get(first.sessionId).correct<=1);
 for(const r of results){assert.equal(r.status,200);assert.equal(r.data.answered,1);assert.equal(r.data.correct,undefined);assert.equal(r.data.roundToken,results[0].data.roundToken)}
 const resume=await send(service,env,'/v1/resume',{sessionId:first.sessionId,controlKey:first.controlKey});
 assert.equal(resume.status,200);assert.equal(resume.data.roundToken,results[0].data.roundToken);
 assert.equal((await send(service,env,'/v1/answer',{...args,roundToken:'f'.repeat(64),guess:'A'})).status,409);
});
test('advanced 20-trial completion keeps interim scores secret and produces exact binomial tail',async()=>{
 const {service,env}=setup();let state=await begin(service,env,'advanced',false);
 assert.equal(state.total,20);
 for(let i=0;i<20;i++){
  const r=await send(service,env,'/v1/answer',{sessionId:state.sessionId,controlKey:state.controlKey,roundToken:state.roundToken,guess:'A'});
  assert.equal(r.status,200);state={...state,...r.data};
  if(i<19){assert.equal(r.data.correct,undefined);assert.equal(r.data.complete,false);assert.equal(r.data.answered,i+1)}
 }
 assert.equal(state.complete,true);assert.equal(state.answered,20);
 assert.ok(Number.isInteger(state.correct));assert.equal(state.shared,false);
 assert.ok(state.chanceProbability>=0&&state.chanceProbability<=1);
 const resume=await send(service,env,'/v1/resume',{sessionId:state.sessionId,controlKey:state.controlKey});
 assert.equal(resume.status,200);assert.equal(resume.data.correct,state.correct);
});
test('audio access checks live round token, origin and session expiry',async()=>{
 const {service,env,db}=setup();const first=await begin(service,env);const path=new URL(first.urls.X).pathname;
 assert.equal((await send(service,env,path,null,{origin:'https://attack.example'})).status,403);
 assert.equal((await send(service,env,path.replace(first.roundToken,'f'.repeat(64)))).status,403);
 const orig=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'audio/flac','content-length':'3'}});
  const req=new Request(BASE+path,{headers:{origin:ORIGIN}});
  const out=await service.fetch(req,env);
  assert.equal(out.status,200);assert.equal(out.headers.get('access-control-allow-origin'),ORIGIN);
  assert.equal(out.headers.get('cache-control'),'no-store');
  assert.equal(out.headers.get('content-type'),'audio/flac');
 }finally{globalThis.fetch=orig}
 db.rows.get(first.sessionId).expires_at=Date.now()-1;
 assert.equal((await send(service,env,path)).status,403);
 assert.equal((await send(service,env,'/v1/resume',{sessionId:first.sessionId,controlKey:first.controlKey})).status,410);
});
test('community aggregation suppresses groups below 10 opt-in complete sessions',async()=>{
 const {service,env,db}=setup();
 const t=Date.now();
 for(let i=0;i<9;i++)db.rows.set('sample-'+i,{id:'sample-'+i,test_id:'test-v1',mode:'challenge',total:10,correct:i%4+4,share:1,completed_at:t,purge_at:t+100000});
 let r=await send(service,env,'/v1/stats');
 assert.equal(r.status,200);assert.equal(r.data.minimumSample,10);assert.equal(r.data.results.length,0);
 db.rows.set('sample-9',{id:'sample-9',test_id:'test-v1',mode:'challenge',total:10,correct:7,share:1,completed_at:t,purge_at:t+100000});
 db.rows.set('private',{id:'private',test_id:'test-v1',mode:'challenge',total:10,correct:10,share:0,completed_at:t,purge_at:t+100000});
 r=await send(service,env,'/v1/stats');
 assert.equal(r.data.results.length,1);assert.equal(r.data.results[0].sessions,10);
 assert.ok(!JSON.stringify(r.data).includes('private'));
});
test('retention cleanup purges expired rows without disclosing identifiers',async()=>{
 const {service,env,db}=setup();const t=Date.now();
 db.rows.set('old',{purge_at:t-1000});db.rows.set('new',{purge_at:t+100000});
 await service.scheduled({},env);
 assert.equal(db.rows.has('old'),false);assert.equal(db.rows.has('new'),true);
});

test('binomial chance interpretation is exact for familiar ABX outcomes',()=>{
 assert.equal(binomialTail(7,10),0.171875);
 assert.equal(binomialTail(10,10),0.00097656);
 assert.equal(binomialTail(0,20),1);
 assert.equal(binomialTail(20,20),0.00000095);
});

test('ABX refuses audio serving if audio-specific rate limiter denies the request',async()=>{
 const {service,env}=setup();
 const first=await begin(service,env);
 env.AUDIO_LIMITER={limit:async()=>({success:false})};
 const path=new URL(first.urls.X).pathname;
 const r=await send(service,env,path);
 assert.equal(r.status,429);
 assert.match(r.data.error,/Audio request limit reached/);
});
