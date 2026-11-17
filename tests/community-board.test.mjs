import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CATEGORIES,handleCommunity,cleanCommunity} from '../workers/abx/community.mjs';

const BASE='https://tsq-abx.thesoundquestion.workers.dev';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
class MemoryDB{
 constructor(){this.rows=[]}
 prepare(sql){
  const db=this;let args=[];
  return {
   bind(...v){args=v;return this},
   async run(){
    if(sql.startsWith('INSERT INTO community_posts')){
     const [id,section,kind,category,artist,title,body,createdAt]=args;
     if(kind==='suggestion'&&db.rows.some(r=>r.kind===kind&&r.status!=='rejected'&&r.artist.toLowerCase()===artist.toLowerCase()&&r.title.toLowerCase()===title.toLowerCase()))throw Error('UNIQUE constraint failed');
     db.rows.push({id,section,kind,category,artist,title,body,created_at:createdAt,reviewed_at:null,status:'pending'});
     return {meta:{changes:1}};
    }
    if(sql.startsWith('DELETE FROM community_posts')){
     const before=db.rows.length;
     db.rows=db.rows.filter(r=>!(r.status==='pending'&&r.created_at<args[0])&&!(r.status==='rejected'&&r.reviewed_at<args[1]));
     return {meta:{changes:before-db.rows.length}};
    }
    throw Error('Unexpected D1 write: '+sql);
   },
   async all(){
    if(!sql.startsWith('SELECT kind,category,artist'))throw Error('Unexpected D1 read: '+sql);
    const [section,kind,category,,limit,offset]=args;
    const results=db.rows.filter(x=>x.status==='approved'&&x.section===section&&x.kind===kind&&(!category||x.category===category))
      .sort((a,b)=>(b.reviewed_at-a.reviewed_at)||b.id.localeCompare(a.id))
      .slice(offset,offset+limit)
      .map(({kind,category,artist,title,body,reviewed_at})=>({kind,category,artist,title,body,published_at:reviewed_at}));
    return {results};
   }
  };
 }
}
function setup({enabled=true,limit=true}={}){
 const db=new MemoryDB();const limiter={limit:async()=>({success:limit})};
 const env={DB:db,COMMUNITY_PUBLIC_ENABLED:enabled?'true':'false',COMMUNITY_LIMITER:limiter,API_LIMITER:limiter};
 return {db,env};
}
async function request(env,path,payload=null){
 const r=new Request(BASE+path,{method:payload?'POST':'GET',headers:{origin:'https://thesoundquestion.pages.dev','cf-connecting-ip':'192.0.2.35',...(payload?{'content-type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{})});
 const res=await handleCommunity(r,env,new URL(r.url),{'access-control-allow-origin':'https://thesoundquestion.pages.dev'});
 return {status:res.status,body:await res.json()};
}
const valid={section:'room',kind:'suggestion',category:'atmosphere',artist:'Hidden Ensemble',title:'Strange Coast',body:'An unusual recording with layered percussion, enveloping space and a hypnotic groove.',website:'',consent:true};
test('seven choices match the existing Listening Room anchor category identifiers',()=>{
 assert.deepEqual(CATEGORIES.map(x=>x[0]),['stars-align','musical-journeys','riffs-and-grooves','dynamics','mixing','atmosphere','spatial']);
 const html=read('library/curators-listening-room/index.html');
 for(const [id,name] of CATEGORIES){assert.match(html,new RegExp('id="'+id+'"'));assert.ok(name.length>5)}
});
test('submissions are pending and invisible until independently approved',async()=>{
 const {db,env}=setup();
 const sent=await request(env,'/v1/community/submit',valid);
 assert.equal(sent.status,202);
 assert.equal(sent.body.status,'pending');
 assert.match(sent.body.receipt,/^[0-9a-f-]{36}$/);
 assert.equal(db.rows.length,1);
 assert.equal(db.rows[0].status,'pending');
 let list=await request(env,'/v1/community/approved?section=room&kind=suggestion');
 assert.equal(list.body.items.length,0);
 db.rows[0].status='approved';db.rows[0].reviewed_at=Date.now();
 list=await request(env,'/v1/community/approved?section=room&kind=suggestion&category=atmosphere');
 assert.equal(list.status,200);assert.equal(list.body.items.length,1);
 assert.equal(list.body.items[0].title,'Strange Coast');
 assert.equal(JSON.stringify(list.body).includes(sent.body.receipt),false);
});
test('category, consent, text length and URL checks reject invalid submissions',async()=>{
 const {env,db}=setup();
 const bad=[
  {...valid,consent:false},{...valid,category:'fake-category'}, {...valid,artist:''},
  {...valid,title:'X'},{...valid,body:'Too short'},
  {...valid,body:'x'.repeat(281)},
  {...valid,body:'An interesting track, please go to https://spam.example for more info'},
  {...valid,website:'gotcha'},
  {...valid,section:'abx'}, {...valid,kind:'comment',artist:'',title:'',body:'a'},
  {...valid,kind:'comment',section:'abx',body:'x'.repeat(281)}
 ];
 for(const payload of bad){const r=await request(env,'/v1/community/submit',payload);assert.equal(r.status,400,JSON.stringify(payload).slice(0,120))}
 assert.equal(db.rows.length,0);
});
test('one recording per nomination, server-side duplicate enforcement',async()=>{
 const {env}=setup();
 assert.equal((await request(env,'/v1/community/submit',valid)).status,202);
 const result=await request(env,'/v1/community/submit',{...valid,artist:'HIDDEN ENSEMBLE',title:'STRANGE COAST',category:'spatial'});
 assert.equal(result.status,409);
});
test('discussion comments work independently in both pages and require moderation',async()=>{
 const {env,db}=setup();
 const p={section:'abx',kind:'comment',consent:true,body:'I could hear the difference in the percussion, but not in the softer vocals.',website:''};
 assert.equal((await request(env,'/v1/community/submit',p)).status,202);
 assert.equal((await request(env,'/v1/community/submit',{...p,section:'room'})).status,202);
 assert.equal((await request(env,'/v1/community/submit',{...p,kind:'suggestion'})).status,400);
 db.rows[0].status='approved';db.rows[0].reviewed_at=Date.now();
 const abx=await request(env,'/v1/community/approved?section=abx&kind=comment');
 const room=await request(env,'/v1/community/approved?section=room&kind=comment');
 assert.equal(abx.body.items.length,1);
 assert.equal(room.body.items.length,0);
});
test('paginates only approved rows, category filtering is exact',async()=>{
 const {env,db}=setup();
 for(let i=0;i<25;i++)db.rows.push({id:'id'+i,section:'room',kind:'suggestion',category:i%2?'atmosphere':'mixing',artist:'Artist'+i,title:'Song'+i,body:'This is a long enough explanation',status:i===20?'pending':'approved',created_at:i,reviewed_at:i});
 const r=await request(env,'/v1/community/approved?section=room&kind=suggestion&offset=0');
 assert.equal(r.status,200);assert.equal(r.body.items.length,10);assert.equal(r.body.hasMore,true);assert.equal(r.body.nextOffset,10);
 const filtered=await request(env,'/v1/community/approved?section=room&kind=suggestion&category=atmosphere');
 assert.ok(filtered.body.items.every(item=>item.category==='atmosphere'));
 assert.equal((await request(env,'/v1/community/approved?section=room&kind=suggestion&offset=10000')).status,400);
});
test('disabled launch flag and per-minute limiter fail closed',async()=>{
 assert.equal((await request(setup({enabled:false}).env,'/v1/community/submit',valid)).status,503);
 assert.equal((await request(setup({limit:false}).env,'/v1/community/submit',valid)).status,429);
 assert.equal((await request(setup({limit:false}).env,'/v1/community/approved?section=room&kind=suggestion')).status,429);
});
test('retention cleanup only removes expired pending and rejected posts',async()=>{
 const {env,db}=setup();const t=Date.now();
 db.rows.push({id:'oldpending',status:'pending',created_at:t-91*86400000,reviewed_at:null});
 db.rows.push({id:'oldreject',status:'rejected',created_at:t,reviewed_at:t-31*86400000});
 db.rows.push({id:'approved',status:'approved',created_at:t-1000*86400000,reviewed_at:t-900*86400000});
 db.rows.push({id:'freshpending',status:'pending',created_at:t-10*86400000,reviewed_at:null});
 await cleanCommunity(env.DB,t);
 assert.deepEqual(db.rows.map(x=>x.id),['approved','freshpending']);
});
test('all user-visible public cards use text nodes, not user-provided HTML',()=>{
 const js=read('assets/community-board.js');
 assert.match(js,/e\.textContent=value/);
 assert.match(js,/String\(entry\.title/);
 assert.match(js,/String\(entry\.body/);
 assert.doesNotMatch(js,/\.innerHTML\s*=/);
 assert.match(js,/IntersectionObserver/);
 for(const p of ['library/curators-listening-room/index.html','labs/abx/index.html']){
  const html=read(p);
  assert.match(html,/assets\/community-board\.js/);
  assert.match(html,/data-community-scope/);
 }
 assert.match(read('workers/abx/wrangler.toml'),/COMMUNITY_PUBLIC_ENABLED = "false"/);
});

test('comment and nomination forms explain the volunteer moderation delay without requiring resubmission',()=>{
 const js=read('assets/community-board.js');
 assert.match(js,/Comment not showing up yet\?/);
 assert.match(js,/Suggestion not showing up yet\?/);
 assert.match(js,/free, independently run site/);
 assert.match(js,/No need to resubmit/);
 assert.match(js,/No need to send the same recording twice/);
 assert.match(js,/community-review-note/);
 assert.match(read('assets/community-board.css'),/\.community-review-note/);
});
