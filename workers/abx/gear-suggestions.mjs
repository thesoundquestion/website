/* Moderated suggestions for the existing hand-verified gear catalogue.
 * Data is never returned to visitors or added to System Check/Builder automatically.
 */
const CATEGORIES = new Set(['amplifier','speaker','headphone','dac','source','other']);
const DAY = 86400000;
const response = (value,status,headers={}) => new Response(JSON.stringify(value), {
  status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',
    'x-content-type-options':'nosniff',...headers}
});
function field(value,min,max) {
  if(typeof value!=='string')return null;
  const v=value.replace(/\s+/gu,' ').trim();
  if([...v].length<min||[...v].length>max||/[\u0000-\u001f\u007f]/u.test(v))return null;
  return v;
}
function reference(value){
  if(value==='')return '';
  if(typeof value!=='string'||value.length>400)return null;
  try{
    const u=new URL(value);
    if(u.protocol!=='https:' || u.username || u.password || !u.hostname.includes('.') ||
       /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/i.test(u.hostname))return null;
    return u.href;
  }catch{return null}
}
export function validateGearSuggestion(data) {
  if(!data||typeof data!=='object'||Array.isArray(data) ||
     data.consent!==true||data.website||!CATEGORIES.has(data.category))return null;
  const brand=field(data.brand,2,80),model=field(data.model,2,120);
  const specifications=data.specifications===''?'':field(data.specifications,1,1200);
  const referenceUrl=reference(data.referenceUrl||'');
  if(!brand||!model||specifications===null||referenceUrl===null)return null;
  // A model and manufacturer alone are useful; source/specs encourage verification.
  return {category:data.category,brand,model,specifications,referenceUrl};
}
async function parse(request){
  if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')||
     Number(request.headers.get('content-length'))>3000)return null;
  let raw;
  try{raw=await request.text()}catch{return null}
  if(raw.length>3000)return null;
  try{return JSON.parse(raw)}catch{return null}
}
export async function handleGearSuggestions(request,env,url,headers={}) {
  if(!url.pathname.startsWith('/v1/gear/'))return null;
  if(url.pathname!=='/v1/gear/submit'||request.method!=='POST')
    return response({error:'Not found'},404,headers);
  if(env?.GEAR_SUBMISSIONS_ENABLED!=='true'||!env.DB||!env.COMMUNITY_LIMITER)
    return response({error:'Gear submissions are not currently open'},503,headers);
  const ip=request.headers.get('cf-connecting-ip')||'no-ip';
  if(!(await env.COMMUNITY_LIMITER.limit({key:'gear-submit:'+ip})).success)
    return response({error:'Too many suggestions. Please try later.'},429,headers);
  const item=validateGearSuggestion(await parse(request));
  if(!item)return response({error:'Check the equipment type, manufacturer and model. Keep notes short and agree to review.'},400,headers);
  const id=crypto.randomUUID(),now=Date.now();
  try{
    await env.DB.prepare(
      "INSERT INTO gear_suggestions(id,category,brand,model,specifications,reference_url,status,created_at,reviewed_at) VALUES(?,?,?,?,?,?,'pending',?,NULL)"
    ).bind(id,item.category,item.brand,item.model,item.specifications,item.referenceUrl,now).run();
  }catch(error) {
    if(/unique|constraint/i.test(String(error)))
      return response({error:'That model already has a suggestion awaiting review.'},409,headers);
    throw error;
  }
  return response({status:'pending',receipt:id,
    message:'Thanks. This model has been added to the review queue, not the public presets.'},202,headers);
}
export function cleanGearSuggestions(db,now=Date.now()){
  return db.prepare("DELETE FROM gear_suggestions WHERE (status='pending' AND created_at<?) OR (status='rejected' AND reviewed_at<?)")
    .bind(now-90*DAY,now-30*DAY).run();
}
