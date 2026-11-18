/* Private read-only moderation count for a daily email digest.
   No pending text, receipt IDs, names, or moderation actions are exposed.
   This route does not grant any public approvals. */
const reply=(body,status)=>new Response(JSON.stringify(body),{status,headers:{
 'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'
}});
function safeEqual(a,b){
 if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;
 let mismatch=0;
 for(let i=0;i<a.length;i++)mismatch|=a.charCodeAt(i)^b.charCodeAt(i);
 return mismatch===0;
}
export async function getPendingCounts(db,{includeGear=false}={}){
 const query=await db.prepare("SELECT section,kind,COUNT(*) AS n FROM community_posts WHERE status='pending' GROUP BY section,kind").all();
 const counts={listeningRoomSuggestions:0,listeningRoomComments:0,abxComments:0,gearSuggestions:0};
 for(const row of query.results||[]){
  const n=Math.max(0,Number(row.n)||0);
  if(row.section==='room'&&row.kind==='suggestion')counts.listeningRoomSuggestions+=n;
  else if(row.section==='room'&&row.kind==='comment')counts.listeningRoomComments+=n;
  else if(row.section==='abx'&&row.kind==='comment')counts.abxComments+=n;
 }
 // The new gear table is created only with the deliberate gear-submissions release.
 // Avoid touching the absent table while that independent feature is disabled.
 if(includeGear){
  const result=await db.prepare("SELECT COUNT(*) AS n FROM gear_suggestions WHERE status='pending'").first();
  counts.gearSuggestions=Math.max(0,Number(result?.n)||0);
 }
 return {pending:Object.values(counts).reduce((sum,n)=>sum+n,0),...counts,checkedAt:new Date().toISOString()};
}
export async function handlePendingSummary(request,env){
 // Intentionally has no CORS response; use only a server-side authorized check.
 const secret=env?.MODERATION_READ_SECRET;
 if(request.method!=='GET'||env?.MODERATION_ALERTS_ENABLED!=='true'||!env.DB||typeof secret!=='string'||secret.length<32)return reply({error:'Not found'},404);
 const token=request.headers.get('authorization');
 if(!token?.startsWith('Bearer ')||!safeEqual(token.slice(7),secret))return reply({error:'Not found'},404);
 return reply(await getPendingCounts(env.DB,{includeGear:env.GEAR_SUBMISSIONS_ENABLED==='true'}),200);
}
