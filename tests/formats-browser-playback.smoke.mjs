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
        return el && el.currentSrc.includes('light-'+rate+'.mp3') &&
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
        return el && el.currentSrc.includes('diva-'+rate+'.mp3') &&
          el.currentTime>0.2 && !el.paused && !el.error;
      },bitrate,{timeout:20000});
      results.push(device.name+' diva MP3 '+bitrate+' PLAYING');
    }
    const abx=page.locator('[data-abx-lab="formats"]');
    if(await abx.locator('[data-mode="training"]').count()!==1)throw new Error(device.name+' missing ABX training');
    await abx.locator('button:has-text("X is A")').click();
    const practice=await abx.locator('.tsq-abx-scoreboard').innerText();
    if(!practice.includes('Training score:'))throw new Error(device.name+' ABX did not count training guess: '+practice);
    await abx.locator('button:has-text("Next trial")').click();
    await abx.locator('[data-mode="challenge"]').click();
    const scoredText=await abx.locator('.tsq-abx-scoreboard').innerText();
    if(!scoredText.includes('Scored trials only open after technical review'))throw new Error(device.name+' scored mode did not display release gate');
    await abx.locator('[data-mode="advanced"]').click();
    if(await abx.locator('.tsq-abx-consent').isHidden())throw new Error(device.name+' Advanced opt-in missing');
    await abx.locator('[data-mode="training"]').click();
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
