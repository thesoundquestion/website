import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
const origin='https://thesoundquestion.com', root=path.resolve('site-dist');
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.woff2':'font/woff2'};
const browser=await chromium.launch({headless:true});
async function scenario(options={}){
  const context=await browser.newContext({viewport:options.mobile?{width:390,height:844}:{width:1280,height:900},isMobile:!!options.mobile,hasTouch:!!options.mobile});
  const captures=[];
  await context.route('**/*',async route=>{
    const request=route.request(),u=new URL(request.url());
    if(u.origin==='https://us.i.posthog.com'){
      if(u.pathname!=='/i/v0/e/') throw Error('Unexpected analytics endpoint');
      if(request.method()==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type'}});
      captures.push(JSON.parse(request.postData()));
      return route.fulfill({status:200,headers:{'access-control-allow-origin':origin},body:'1'});
    }
    if(u.origin!==origin)return route.abort();
    let file=path.resolve(root,'.'+decodeURIComponent(u.pathname));
    if(!file.startsWith(root+path.sep)&&file!==root)return route.abort();
    try{if(statSync(file).isDirectory())file=path.join(file,'index.html');const bytes=readFileSync(file);return route.fulfill({status:200,contentType:types[path.extname(file)]||'application/octet-stream',body:bytes});}catch{return route.fulfill({status:404,body:'Not found'});}
  });
  if(options.gpc)await context.addInitScript(()=>Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>true}));
  const page=await context.newPage();
  const go=async(url='/')=>{await page.goto(origin+url,{waitUntil:'domcontentloaded'});await page.waitForTimeout(250);};
  const allow=page.getByRole('button',{name:'Allow analytics'}),deny=page.getByRole('button',{name:'No thanks'});
  return {context,page,captures,go,allow,deny};
}
try{
  for(const mobile of [false,true]){
    const s=await scenario({mobile});
    await s.go('/?utm_source=youtube&email=secret#private');
    assert.equal(s.captures.length,0);assert.ok(await s.allow.isVisible());assert.ok(await s.deny.isVisible());
    await s.allow.click();await s.page.waitForTimeout(350);
    assert.equal(s.captures.length,1);const first=s.captures[0];assert.equal(first.properties.$current_url,origin+'/');assert.equal(first.properties.tsq_source,'youtube');assert.equal(first.properties.$process_person_profile,false);assert.ok(!JSON.stringify(first).includes('secret'));assert.ok(!JSON.stringify(first).includes('private'));
    await s.go('/decoder/');assert.equal(s.captures.length,2);assert.equal(s.captures[1].distinct_id,first.distinct_id);assert.equal(s.captures[1].properties.$pathname,'/decoder/');
    await s.go('/privacy/');assert.equal(s.captures.length,3);await s.deny.click();
    await s.go('/');assert.equal(s.captures.length,3);assert.equal(await s.page.evaluate(()=>sessionStorage.getItem('tsq-analytics-session-v1')),null);
    await s.context.close();
  }
  const d=await scenario();await d.go();await d.deny.click();await d.go('/decoder/');assert.equal(d.captures.length,0);await d.context.close();
  const g=await scenario({gpc:true});await g.go('/privacy/');assert.equal(g.captures.length,0);assert.equal(await g.allow.isVisible(),false);await g.context.close();
  console.log('POSTHOG_BROWSER_PREFLIGHT_OK desktop/mobile, consent, revoke, privacy signals, sanitized payload, mock endpoint');
}finally{await browser.close();}
