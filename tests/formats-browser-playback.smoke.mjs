// Browser-level regression: load the actual page and play the actual hosted media.
import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:8765/labs/formats/';
const browser = await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const results = [];
try {
  for (const device of [
    {name:'desktop',options:{viewport:{width:1280,height:800}}},
    {name:'mobile',options:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}
  ]) {
    const context = await browser.newContext(device.options);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.addInitScript(() => {
      const NativeAudio = window.Audio;
      window.Audio = function (...args) {
        const audio = new NativeAudio(...args);
        window.__formatsTestAudio = audio;
        return audio;
      };
    });
    await page.goto(BASE,{waitUntil:'load',timeout:30000});
    if (errors.length) throw new Error(device.name+' JavaScript errors: '+errors.join('; '));
    const player = page.locator('#playPause');
    await player.click();
    await page.waitForFunction(() => window.__formatsTestAudio &&
      window.__formatsTestAudio.currentTime>0.2 &&
      !window.__formatsTestAudio.paused &&
      !window.__formatsTestAudio.error,{timeout:20000});
    const losslessStatus = await page.evaluate(()=>({
      playing:!window.__formatsTestAudio.paused,
      pos:window.__formatsTestAudio.currentTime,
      src:window.__formatsTestAudio.currentSrc
    }));
    for (const bitrate of ['128','320']) {
      await page.locator('[data-format="'+bitrate+'"]').click();
      await page.waitForFunction(rate => {
        const el = window.__formatsTestAudio;
        return el && (el.currentSrc.includes('light-'+rate+'.mp3') || el.currentSrc.startsWith('blob:')) &&
          document.querySelector('[data-format="'+rate+'"]')?.getAttribute('aria-pressed')==='true' &&
          el.currentTime>0.2 && !el.paused && !el.error;
      },bitrate,{timeout:20000});
      results.push(device.name+' light MP3 '+bitrate+' PLAYING');
    }
    await page.locator('[data-song="diva"]').click();
    await page.locator('#playPause').click();
    await page.waitForFunction(() => {
      const el=window.__formatsTestAudio;
      return el && el.currentSrc.includes('/mastering/dynamic.flac') &&
        el.currentTime>0.2 && !el.paused && !el.error;
    },{timeout:20000});
    for (const bitrate of ['128','320']) {
      await page.locator('[data-format="'+bitrate+'"]').click();
      await page.waitForFunction(rate => {
        const el=window.__formatsTestAudio;
        return el && (el.currentSrc.includes('diva-'+rate+'.mp3') || el.currentSrc.startsWith('blob:')) &&
          document.querySelector('[data-format="'+rate+'"]')?.getAttribute('aria-pressed')==='true' &&
          el.currentTime>0.2 && !el.paused && !el.error;
      },bitrate,{timeout:20000});
      results.push(device.name+' diva MP3 '+bitrate+' PLAYING');
    }
    if(await page.locator('[data-abx-lab]').count())throw new Error(device.name+' Formats lesson unexpectedly embeds a full ABX player');
    const lessonLink=page.locator('a[href^="/labs/abx/"]').first();
    if(await lessonLink.count()!==1)throw new Error(device.name+' missing link to dedicated ABX Lab');
    await page.goto('http://127.0.0.1:8765/labs/abx/?test=formats-light-128-v1&mode=training',{waitUntil:'load',timeout:30000});
    const abx=page.locator('[data-abx-lab="all"]');
    if(await abx.count()!==1)throw new Error(device.name+' standalone ABX Lab is missing');
    if((await abx.locator('select').inputValue())!=='formats-light-128-v1')throw new Error(device.name+' did not preserve direct test link');
    const backLink=abx.locator('.tsq-abx-lesson-link');
    if(await backLink.getAttribute('href')!=='/labs/formats/')throw new Error(device.name+' missing exact source lesson link');
    if(!(await abx.locator('.tsq-abx-trial-readiness').isHidden()))throw new Error(device.name+' readiness appears before request');
    await abx.getByRole('button',{name:'Prepare recordings'}).click();
    await page.waitForFunction(()=>document.querySelector('[data-abx-lab="all"] .tsq-abx-trial-readiness')?.textContent==='Ready',null,{timeout:40000});
    if(await abx.locator('[data-slot] [data-readiness]').count())throw new Error(device.name+' ABX leaks A/B/X loading state');
    let workerRequestsAfterReady=0;
    page.on('request',req=>{if(req.url().includes('tsq-lab-audio.thesoundquestion.workers.dev'))workerRequestsAfterReady++});
    await abx.locator('[data-slot="A"]').click();
    await page.waitForFunction(()=>{
      const a=document.querySelector('[data-abx-lab="all"] audio');
      return a&&a.currentTime>0.1&&!a.paused&&!a.error;
    },null,{timeout:20000});
    await abx.locator('[data-slot="B"]').click();
    await page.waitForFunction(()=>{
      const a=document.querySelector('[data-abx-lab="all"] audio');
      return a&&a.currentTime>0.15&&!a.paused&&!a.error;
    },null,{timeout:12000});
    await abx.locator('[data-slot="A"]').click();
    await page.waitForTimeout(350);
    if(workerRequestsAfterReady!==0)throw new Error(device.name+' repeated ABX audio triggered '+workerRequestsAfterReady+' fresh Worker fetches');
    results.push(device.name+' ABX Training repeated playback from local cache, zero extra Worker requests');
    await abx.getByRole('button',{name:'X is A'}).click();
    const practice=await abx.locator('.tsq-abx-scoreboard').innerText();
    if(!practice.includes('Training score:'))throw new Error(device.name+' Training guess was not counted');
    await abx.getByRole('button',{name:'Next trial'}).click();
    await abx.locator('[data-mode="challenge"]').click();
    if(await abx.locator('.tsq-abx-consent').isHidden())throw new Error(device.name+' Challenge opt-in missing');
    if(!(await abx.locator('.tsq-abx-trial-readiness').isHidden()))throw new Error(device.name+' scored ABX exposes readiness timing');
    const challengeUrl=await abx.locator('select').inputValue();
    if(!['master-eq-v1','formats-light-128-v1','formats-diva-128-v1'].includes(challengeUrl))throw new Error(device.name+' Challenge catalogue wrong');
    await abx.locator('[data-mode="advanced"]').click();
    const advancedId=await abx.locator('select').inputValue();
    if(!advancedId.endsWith('320-v1'))throw new Error(device.name+' Advanced catalogue wrong');
    if(await abx.locator('.tsq-abx-consent').isHidden())throw new Error(device.name+' Advanced opt-in missing');
    const link=await backLink.getAttribute('href');
    if(link!=='/labs/formats/')throw new Error(device.name+' Advanced test not linked to source lesson');
    await abx.locator('[data-mode="training"]').click();
    if((await abx.locator('select').inputValue())!=='mix-narrow-reference-v1')throw new Error(device.name+' Training options missing');
    if(await backLink.getAttribute('href')!=='/lab/')throw new Error(device.name+' Mixing source lesson link broken');
    results.push(device.name+' ABX Training / Challenge / Advanced, contextual overview links OK');
    if (errors.length) throw new Error(device.name+' JavaScript errors: '+errors.join('; '));
    results.push(device.name+' ABX Training / Challenge / Advanced UI OK');
    results.push(device.name+' lossless PLAYING '+losslessStatus.pos.toFixed(2)+' s');
    await context.close();
  }
  console.log('FORMATS_BROWSER_PLAYBACK_OK');
  for (const line of results) console.log(line);
} finally {
  await browser.close();
}
