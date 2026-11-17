import test from 'node:test';
import assert from 'node:assert/strict';
import {getPendingCounts,handlePendingSummary} from '../workers/abx/moderation-summary.mjs';
import {createAbxService} from '../workers/abx/index.mjs';
import {readFileSync} from 'node:fs';

const endpoint='https://tsq-abx.thesoundquestion.workers.dev/v1/moderation/pending-counts';
const secret='private-moderation-summary-secret-1234567890-987654321';
const db={prepare(sql){
 assert.match(sql,/status='pending'/);
 return {async all(){return {results:[
  {section:'room',kind:'suggestion',n:3},
  {section:'room',kind:'comment',n:1},
  {section:'abx',kind:'comment',n:2},
  {section:'weird',kind:'comment',n:999}
 ]}}};
}};
const env={DB:db,MODERATION_ALERTS_ENABLED:'true',MODERATION_READ_SECRET:secret};
const call=async(givenEnv=env,auth=secret,method='GET')=>{
 const headers=auth===null?{}:{authorization:'Bearer '+auth};
 const r=new Request(endpoint,{method,headers});
 return handlePendingSummary(r,givenEnv);
};
test('count query exposes only aggregate pending numbers',async()=>{
 const result=await getPendingCounts(db);
 assert.equal(result.pending,6);
 assert.equal(result.listeningRoomSuggestions,3);
 assert.equal(result.listeningRoomComments,1);
 assert.equal(result.abxComments,2);
 assert.equal(typeof result.checkedAt,'string');
 assert.equal('body'in result,false);
 assert.equal('id'in result,false);
});
test('moderation endpoint never publishes counts without bearer token or enabled flag',async()=>{
 for(const [e,auth,method] of [
  [env,null,'GET'],[env,'wrong','GET'],
  [{...env,MODERATION_ALERTS_ENABLED:'false'},secret,'GET'],
  [{...env,MODERATION_READ_SECRET:'short'},secret,'GET'],
  [{...env,DB:null},secret,'GET'],
  [env,secret,'POST']
 ]){
  const response=await call(e,auth,method);
  assert.equal(response.status,404);
  assert.equal(response.headers.get('access-control-allow-origin'),null);
  assert.equal(response.headers.get('cache-control'),'no-store');
 }
});
test('authorized count request is read-only and CORS-free',async()=>{
 const r=await call();
 assert.equal(r.status,200);
 const v=await r.json();
 assert.equal(v.pending,6);
 assert.deepEqual(Object.keys(v).sort(),['abxComments','checkedAt','listeningRoomComments','listeningRoomSuggestions','pending'].sort());
 assert.equal(r.headers.get('access-control-allow-origin'),null);
});
test('worker routes private summary before browser origin checks',async()=>{
 const service=createAbxService();
 const r=await service.fetch(new Request(endpoint,{headers:{authorization:'Bearer '+secret}}),env);
 assert.equal(r.status,200);
 assert.equal((await r.json()).pending,6);
});
test('daily Gmail example uses only a secure script property, checks nonzero count and has no hardcoded tokens',()=>{
 const gs=readFileSync(new URL('../workers/abx/pending-review-digest.gs',import.meta.url),'utf8');
 const cfg=readFileSync(new URL('../workers/abx/wrangler.toml',import.meta.url),'utf8');
 assert.match(gs,/PropertiesService.getScriptProperties/);
 assert.match(gs,/if\(pending===0\)return/);
 assert.match(gs,/GmailApp.sendEmail/);
 assert.match(gs,/everyDays\(1\)/);
 assert.match(gs,/thesoundquestion@gmail\.com/);
 assert.match(cfg,/MODERATION_ALERTS_ENABLED = "false"/);
 assert.doesNotMatch(gs,/private-moderation-summary-secret-1234567890/);
});
