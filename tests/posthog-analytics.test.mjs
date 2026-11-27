import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {analyticsConfig,injectAnalytics} from '../scripts/analytics-build.mjs';
const config={token:'phc_test',host:'https://us.i.posthog.com'};
const html='<html><head></head><body></body></html>';
test('build fails closed and only injects eligible HTML',()=>{
  assert.equal(analyticsConfig({}),null);
  assert.throws(()=>analyticsConfig({TSQ_POSTHOG_PROJECT_TOKEN:'phc_test'}));
  assert.throws(()=>analyticsConfig({TSQ_POSTHOG_PROJECT_TOKEN:'phc_test',TSQ_POSTHOG_HOST:'https://evil.invalid'}));
  assert.deepEqual(analyticsConfig({TSQ_POSTHOG_PROJECT_TOKEN:'phc_test',TSQ_POSTHOG_HOST:config.host}),config);
  assert.equal(injectAnalytics(html,'index.html',null),html);
  assert.equal(injectAnalytics(html,'404.html',config),html);
  assert.match(injectAnalytics(html,'decoder/index.html',config),/data-page="\/decoder\/"/);
  assert.throws(()=>injectAnalytics(injectAnalytics(html,'index.html',config),'index.html',config));
});
const source=readFileSync(new URL('../assets/tsq-analytics.js',import.meta.url),'utf8');
function browser({choice=null,gpc=false,dnt=false,origin='https://thesoundquestion.com'}={}){
  const requests=[], buttons=[], values=new Map(), sessions=new Map();
  if(choice)values.set('tsq-analytics-choice-v1',choice);
  const store=m=>({getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)});
  const node=()=>({hidden:false,append(){},setAttribute(){},addEventListener(type,fn){this.click=fn}});
  const document={currentScript:{dataset:{...config,page:'/privacy/'}},referrer:'https://www.youtube.com/watch?v=secret',body:node(),getElementById:()=>null,createElement(tag){const n=node();if(tag==='button')buttons.push(n);return n;}};
  vm.runInNewContext(source,{document,window:{localStorage:store(values),sessionStorage:store(sessions)},location:{origin,hostname:new URL(origin).hostname,search:'?utm_source=youtube&email=secret'},navigator:{globalPrivacyControl:gpc,doNotTrack:dnt?'1':'0'},crypto:{randomUUID:()=> 'a1234567-1234-4234-8234-123456789abc'},URL,URLSearchParams,Date,fetch:(url,opts)=>{requests.push({url,opts});return Promise.resolve({ok:true})}});
  return {requests,buttons,values,sessions};
}
test('no tracking before choice; allow sends one minimal pageview; decline stops subsequent capture',()=>{
  const b=browser();assert.equal(b.requests.length,0);b.buttons[0].click();b.buttons[0].click();assert.equal(b.requests.length,1);
  const {url,opts}=b.requests[0];assert.equal(url,config.host+'/i/v0/e/');assert.equal(opts.credentials,'omit');assert.equal(opts.referrerPolicy,'no-referrer');
  const p=JSON.parse(opts.body);assert.equal(p.event,'$pageview');assert.equal(p.properties.$current_url,'https://thesoundquestion.com/privacy/');assert.equal(p.properties.tsq_source,'youtube');assert.equal(p.properties.$process_person_profile,false);assert.ok(!opts.body.includes('secret'));
  b.buttons[1].click();assert.equal(b.values.get('tsq-analytics-choice-v1'),'deny');assert.equal(b.sessions.size,0);
  assert.equal(browser({choice:'deny'}).requests.length,0);
});
test('privacy signals and nonproduction origins suppress requests',()=>{
  assert.equal(browser({choice:'allow',gpc:true}).requests.length,0);
  assert.equal(browser({choice:'allow',dnt:true}).requests.length,0);
  assert.equal(browser({choice:'allow',origin:'https://thesoundquestion.pages.dev'}).requests.length,0);
  assert.equal(browser({choice:'allow'}).requests.length,1);
});
