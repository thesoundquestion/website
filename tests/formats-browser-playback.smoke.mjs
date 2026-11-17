// Browser smoke: actual Cloudflare-hosted FLAC and GitHub-hosted MP3s.
// Run against locally served working tree; no website deployment required.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8765/labs/formats/';
const browser = await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const results = [];
async function awaitPlayback(page,description) {
  // Supported browsers should use buffered Web Audio; browsers without FLAC
  // WebAudio/CORS can still use the original native <audio> fallback.
  await page.waitForFunction(() => {
    const dbg = window.__TSQFormatsPlayer?.debug?.();
    return dbg && dbg.mode !== 'loading' && dbg.playing && dbg.position > 0.2;
  },{timeout:60000});
  const snapshot = await page.evaluate(() => window.__TSQFormatsPlayer.debug());
  results.push(description + ' ' + snapshot.mode + ' PLAYING ' + snapshot.position.toFixed(2)+'s');
  return snapshot;
}
try {
  for (const device of [
    {name:'desktop',options:{viewport:{width:1280,height:800}}},
    {name:'mobile',options:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}
  ]) {
    const context = await browser.newContext(device.options);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(BASE,{waitUntil:'load',timeout:30000});
    await page.locator('#playPause').click();
    await page.waitForFunction(() => window.__TSQFormatsPlayer?.debug?.()?.mode !== 'loading',{timeout:60000});
    if ((await page.evaluate(()=>window.__TSQFormatsPlayer.debug().mode))==='native') {
      await page.locator('#playPause').click(); // fallback after decode failure
    }
    const before=await awaitPlayback(page,device.name+' light lossless');
    for (const rate of ['128','320','lossless']) {
      const old=await page.evaluate(()=>window.__TSQFormatsPlayer.debug());
      await page.locator('[data-format="'+rate+'"]').click();
      await page.waitForFunction(format => {
        const x=window.__TSQFormatsPlayer?.debug?.();
        return x && x.format===format && x.playing && x.position>.2;
      },rate,{timeout:30000});
      const next=await page.evaluate(()=>window.__TSQFormatsPlayer.debug());
      if (next.mode==='buffered' && old.mode==='buffered') {
        if (next.position+0.1<old.position || next.position-old.position>0.8) {
          throw new Error('Buffered format switch lost time or restarted: '+JSON.stringify({old,next}));
        }
        if (next.buffers!==3) throw new Error('Expected 3 synchronized buffered tracks');
      }
      results.push(device.name+' light '+rate+' '+next.mode+' PLAYING');
    }
    // Rapid A/B/A changes must not reset the timeline or re-fetch the files.
    if ((await page.evaluate(()=>window.__TSQFormatsPlayer.debug().mode))==='buffered') {
      const beforeRapid=await page.evaluate(()=>window.__TSQFormatsPlayer.debug());
      let newRequests=0;
      const monitor=req=>{
        if (/\/(mixing\/reference\.flac|assets\/audio\/formats\/light-(128|320)\.mp3)/.test(req.url())) newRequests++;
      };
      page.on('request',monitor);
      for (const rate of ['128','320','lossless','320','128','lossless','128','320','lossless']) {
        await page.locator('[data-format="'+rate+'"]').click();
      }
      const afterRapid=await page.evaluate(()=>window.__TSQFormatsPlayer.debug());
      page.off('request',monitor);
      if(!afterRapid.playing || afterRapid.position<beforeRapid.position ||
        afterRapid.buffers!==3 || newRequests!==0) {
        throw new Error('Rapid switching caused a reload, pause, or timeline reset: '+JSON.stringify({beforeRapid,afterRapid,newRequests}));
      }
      // Seek and pause/resume require a new synchronized set of sources but
      // must preserve the requested time and continuous progress thereafter.
      await page.locator('#seek').evaluate(el=>{
        el.value='12.50';
        el.dispatchEvent(new Event('input',{bubbles:true}));
      });
      const seeked=await page.evaluate(()=>window.__TSQFormatsPlayer.debug());
      if(Math.abs(seeked.position-12.5)>0.2 || !seeked.playing)
        throw new Error('Synchronized seek failed: '+JSON.stringify(seeked));
      await page.locator('#playPause').click();
      const paused=await page.evaluate(()=>window.__TSQFormatsPlayer.debug());
      if(paused.playing || Math.abs(paused.position-seeked.position)>0.3)
        throw new Error('Buffered pause lost place: '+JSON.stringify({seeked,paused}));
      await page.locator('#playPause').click();
      const resumed=await page.evaluate(()=>window.__TSQFormatsPlayer.debug());
      if(!resumed.playing || Math.abs(resumed.position-paused.position)>0.3)
        throw new Error('Buffered resume lost place: '+JSON.stringify({paused,resumed}));
      results.push(device.name+' rapid A/B/seek/pause/restart OK (zero new file requests)');
    }
    await page.locator('[data-song="diva"]').click();
    await page.locator('#playPause').click();
    await page.waitForFunction(() => window.__TSQFormatsPlayer?.debug?.()?.mode !== 'loading',{timeout:60000});
    if ((await page.evaluate(()=>window.__TSQFormatsPlayer.debug().mode))==='native') await page.locator('#playPause').click();
    await awaitPlayback(page,device.name+' diva lossless');
    for (const rate of ['128','320']) {
      await page.locator('[data-format="'+rate+'"]').click();
      await page.waitForFunction(format => {
        const x=window.__TSQFormatsPlayer?.debug?.();
        return x && x.format===format && x.playing && x.position>.2;
      },rate,{timeout:30000});
      results.push(device.name+' diva '+rate+' PLAYING');
    }
    if(errors.length) throw new Error(device.name+' JavaScript errors: '+errors.join('; '));
    results.push(device.name+' first run mode '+before.mode);
    await context.close();
  }
  console.log('FORMATS_BROWSER_PLAYBACK_OK');
  for(const r of results)console.log(r);
} finally {
  await browser.close();
}
