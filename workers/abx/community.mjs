/* Anonymous, moderated D1 community submissions. No personal IDs or emails. */
export const CATEGORIES=Object.freeze([
 ['stars-align','When the Stars Align'],
 ['musical-journeys','Musical Journeys & Builds'],
 ['riffs-and-grooves','Great Riffs, Grooves & Band Interaction'],
 ['dynamics','Dynamics, Emotion & Performance'],
 ['mixing','Mixing & Production Choices'],
 ['atmosphere','Atmosphere & Immersion'],
 ['spatial','Spatial Effects & QSound']
]);
const CAT=new Set(CATEGORIES.map(([id])=>id));
const SECTIONS=new Set(['room','abx']);
const DAY=86400000;
const json=(value,status,headers)=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...headers}});
const fail=(headers,message,status)=>json({error:message},status,headers);
function text(value,max,min){
 if(typeof value!=='string')return null;
 const s=value.replace(/\s+/gu,' ').trim();
 if([...s].length<min||[...s].length>max||/[\u0000-\u001f\u007f]/u.test(s)||/(?:https?:\/\/|www\.)/iu.test(s))return null;
 return s;
}
function validate(p){
 if(!p||typeof p!=='object'||Array.isArray(p)||p.consent!==true||p.website)return null;
 if(!SECTIONS.has(p.section)||!['comment','suggestion'].includes(p.kind))return null;
 if(p.section==='abx'&&p.kind!=='comment')return null;
 const body=text(p.body,280,p.kind==='comment'?5:20);
 if(!body)return null;
 if(p.kind==='comment')return {section:p.section,kind:'comment',category:'',artist:'',title:'',body};
 if(p.section!=='room'||!CAT.has(p.category))return null;
 const artist=text(p.artist,64,2),title=text(p.title,100,2);
 if(!artist||!title)return null;
 return {section:'room',kind:'suggestion',category:p.category,artist,title,body};
}
async function parse(request){
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')||Number(request.headers.get('content-length'))>2048)return null;
 let raw;try{raw=await request.text()}catch{return null}
 if(raw.length>2048)return null;
 try{return JSON.parse(raw)}catch{return null}
}
const enabled=env=>env?.COMMUNITY_PUBLIC_ENABLED==='true'&&!!env.DB&&!!env.API_LIMITER&&!!env.COMMUNITY_LIMITER;
const ipOf=request=>request.headers.get('cf-connecting-ip')||'no-ip';
export async function handleCommunity(request,env,url,corsHeaders={}){
 if(!url.pathname.startsWith('/v1/community/'))return null;
 if(!enabled(env))return fail(corsHeaders,'Community submissions are not open yet',503);
 const ip=ipOf(request);
 if(request.method==='GET'&&url.pathname==='/v1/community/approved'){
  const section=url.searchParams.get('section'),kind=url.searchParams.get('kind'),category=url.searchParams.get('category')||'',offsetStr=url.searchParams.get('offset')||'0';
  if(!SECTIONS.has(section)||!['suggestion','comment'].includes(kind)||(section==='abx'&&kind!=='comment')||
     (category&&(kind!=='suggestion'||!CAT.has(category)))||!/^(0|[1-9]\d{0,3})$/.test(offsetStr)||Number(offsetStr)>1000)return fail(corsHeaders,'Invalid listing request',400);
  if(!(await env.API_LIMITER.limit({key:'community-read:'+ip})).success)return fail(corsHeaders,'Too many requests',429);
  const offset=Number(offsetStr),limit=10;
  const result=await env.DB.prepare("SELECT kind,category,artist,title,body,reviewed_at AS published_at FROM community_posts WHERE status='approved' AND section=? AND kind=? AND (?='' OR category=?) ORDER BY reviewed_at DESC,id DESC LIMIT ? OFFSET ?").bind(section,kind,category,category,limit+1,offset).all();
  const items=result.results||[];
  return json({items:items.slice(0,limit),hasMore:items.length>limit,nextOffset:offset+Math.min(limit,items.length),note:'Entries are reviewed before publication and are not automatically added to the curator playlist.'},200,corsHeaders);
 }
 if(request.method==='POST'&&url.pathname==='/v1/community/submit'){
  if(!(await env.COMMUNITY_LIMITER.limit({key:'community-submit:'+ip})).success)return fail(corsHeaders,'Too many submissions. Try again later.',429);
  const data=validate(await parse(request));
  if(!data)return fail(corsHeaders,'Please enter one recording or a short comment and agree to publication if approved.',400);
  const id=crypto.randomUUID(),now=Date.now();
  try{
   await env.DB.prepare("INSERT INTO community_posts(id,section,kind,category,artist,title,body,status,created_at,reviewed_at) VALUES(?,?,?,?,?,?,?,'pending',?,NULL)").bind(id,data.section,data.kind,data.category,data.artist,data.title,data.body,now).run();
  }catch(error){
   if(/unique|constraint/i.test(String(error)))return fail(corsHeaders,'That recording has already been nominated.',409);
   throw error;
  }
  return json({status:'pending',receipt:id,message:'Thanks! Your entry has been saved for review; it is not public yet.'},202,corsHeaders);
 }
 return fail(corsHeaders,'Not found',404);
}
export async function cleanCommunity(db,now=Date.now()){
 return db.prepare("DELETE FROM community_posts WHERE (status='pending' AND created_at<?) OR (status='rejected' AND reviewed_at<?)").bind(now-90*DAY,now-30*DAY).run();
}
