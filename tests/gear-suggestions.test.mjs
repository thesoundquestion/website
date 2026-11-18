import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateGearSuggestion,handleGearSuggestions} from '../workers/abx/gear-suggestions.mjs';

const valid={category:'amplifier',brand:'Yamaha',model:'A-720',
 specifications:'Original version, not the A-720 II.',referenceUrl:'https://example.com/a720-manual.pdf',
 consent:true,website:''};

test('gear recommendations accept model-only evidence and no account identifiers',()=>{
 assert.deepEqual(validateGearSuggestion({...valid,specifications:'',referenceUrl:''}),
   {category:'amplifier',brand:'Yamaha',model:'A-720',variant:'',approxYear:null,region:'',specifications:'',referenceUrl:''});
 assert.deepEqual(validateGearSuggestion({...valid,variant:'80 ohm',approxYear:'1984',region:'Canada'}),{
   category:'amplifier',brand:'Yamaha',model:'A-720',variant:'80 ohm',approxYear:1984,
   region:'Canada',specifications:valid.specifications,referenceUrl:valid.referenceUrl
 });
 assert.equal(validateGearSuggestion({...valid,approxYear:'nineteen-eighty'}),null);
 assert.equal(validateGearSuggestion({...valid,approxYear:'1890'}),null);
 assert.equal(validateGearSuggestion({...valid,variant:'V'.repeat(121)}),null);
 assert.equal(validateGearSuggestion({...valid,region:'R'.repeat(61)}),null);
 assert.equal(validateGearSuggestion({...valid,category:'phone'}),null);
 assert.equal(validateGearSuggestion({...valid,consent:false}),null);
 assert.equal(validateGearSuggestion({...valid,website:'spam'}),null);
 assert.equal(validateGearSuggestion({...valid,referenceUrl:'http://example.com'}),null);
 assert.equal(validateGearSuggestion({...valid,referenceUrl:'https://localhost/test'}),null);
 assert.equal(validateGearSuggestion({...valid,model:'A'.repeat(121)}),null);
 assert.equal(validateGearSuggestion({...valid,brand:'X',model:'A'}),null);
 assert.equal(validateGearSuggestion({...valid,specifications:'Z'.repeat(1201)}),null);
});

function mockEnv(enabled=true){
 const calls=[];
 const db={prepare:(sql)=>({bind:(...values)=>({run:async()=>{calls.push({sql,values});return {success:true}}})})};
 return {calls,env:{GEAR_SUBMISSIONS_ENABLED:enabled?'true':'false',DB:db,
 COMMUNITY_LIMITER:{limit:async()=>({success:true})}}};
}
function request(payload,method='POST'){
 return new Request('https://tsq-abx.thesoundquestion.workers.dev/v1/gear/submit',{
 method,headers:{'content-type':'application/json','origin':'https://thesoundquestion.com'},
 ...(method==='POST'?{body:JSON.stringify(payload)}:{})
 });
}
test('gear submissions are disabled until explicitly released',async()=>{
 const {env,calls}=mockEnv(false);
 const response=await handleGearSuggestions(request(valid),env,new URL('https://example.com/v1/gear/submit'));
 assert.equal(response.status,503);assert.equal(calls.length,0);
});
test('enabled gear submissions write one pending D1 row and return receipt, no publication',async()=>{
 const {env,calls}=mockEnv();
 const response=await handleGearSuggestions(request(valid),env,new URL('https://example.com/v1/gear/submit'));
 assert.equal(response.status,202);
 assert.equal(calls.length,1);
 assert.match(calls[0].sql,/INSERT INTO gear_suggestions/);
 assert.match(calls[0].sql,/'pending'/);
 assert.equal(calls[0].values[1],'amplifier');
 assert.equal(calls[0].values[2],'Yamaha');
 const data=await response.json();
 assert.equal(data.status,'pending');assert.ok(data.receipt);
 assert.equal(data.message.includes('not the public presets'),true);
});
test('public reading and approval endpoints are absent',async()=>{
 const {env,calls}=mockEnv();
 for(const path of ['/v1/gear/pending','/v1/gear/approved','/v1/gear/approve']){
  const res=await handleGearSuggestions(new Request('https://example.com'+path),
   env,new URL('https://example.com'+path));
  assert.equal(res.status,404);assert.equal(calls.length,0);
 }
});
test('standalone page, links and review-only configuration are staged',()=>{
 const page=readFileSync(new URL('../tools/recommend-gear/index.html',import.meta.url),'utf8');
 const script=readFileSync(new URL('../tools/recommend-gear/app.js',import.meta.url),'utf8');
 const schema=readFileSync(new URL('../workers/abx/gear-schema.sql',import.meta.url),'utf8');
 const config=readFileSync(new URL('../workers/abx/wrangler.toml',import.meta.url),'utf8');
 const worker=readFileSync(new URL('../workers/abx/index.mjs',import.meta.url),'utf8');
 const privacy=readFileSync(new URL('../privacy/index.html',import.meta.url),'utf8');
 const sitemap=readFileSync(new URL('../sitemap.xml',import.meta.url),'utf8');
 for(const label of ['category','brand','model','variant','approxYear','region','referenceUrl','specifications','consent']) {
   assert.match(page,new RegExp('name="'+label+'"'),'Missing form input '+label);
 }
 assert.match(page,/<form id="gear-suggestion-form"/);
 assert.match(page,/data-submissions-enabled="true"/);
 assert.match(page,/No account, email address, photos or serial numbers needed/);
 assert.match(page,/We check the specifications/);
 assert.match(script,/\/v1\/gear\/submit/);
 assert.match(config,/GEAR_SUBMISSIONS_ENABLED = "true"/);
 assert.match(worker,/handleGearSuggestions/);
 for(const field of ['variant','approx_year','region'])assert.ok(schema.includes(field));
 assert.match(privacy,/Equipment model recommendations/);
 assert.ok(sitemap.includes('/tools/recommend-gear/'));
 for(const path of ['system-check/index.html','system-check/compare/index.html','system-builder/index.html','tools/index.html']){
   const file=readFileSync(new URL('../'+path,import.meta.url),'utf8');
   assert.ok(file.includes('href="/tools/recommend-gear/"'),path+' missing form link');
   assert.doesNotMatch(file,/id="gear-suggestion-form"/,path+' unexpectedly embeds a form');
 }
});
