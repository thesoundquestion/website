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
    // The Mastering hero must render source-measured SVGs without fetching
    // a single FLAC simply because the visitor opened the lesson.
    const masterPage=await context.newPage();
    const masteringAudioRequests=[];
    const onMasteringRequest=req=>{
      if(/tsq-lab-audio\.thesoundquestion\.workers\.dev\/mastering\//.test(req.url()))
        masteringAudioRequests.push(req.url());
    };
    masterPage.on('request',onMasteringRequest);
    await masterPage.goto('http://127.0.0.1:8765/lab/mastering/',{waitUntil:'load',timeout:30000});
    await masterPage.waitForFunction(()=>{
      const imgs=[...document.querySelectorAll('.hero-art img[src^="/assets/waveforms/mastering-"]')];
      return imgs.length===3 && imgs.every(img=>img.complete&&img.naturalWidth>0&&img.naturalHeight>0);
    },null,{timeout:15000});
    if(masteringAudioRequests.length)throw new Error(device.name+' Mastering page unexpectedly fetched '+masteringAudioRequests.length+' FLACs on open: '+JSON.stringify(masteringAudioRequests));
    if(await masterPage.locator('#abxPanel').count())throw new Error(device.name+' legacy Mastering ABX player still exists');
    const imgLinks=masterPage.locator('.hero-art a[href$=".svg"]');
    if(await imgLinks.count()!==3)throw new Error(device.name+' waveform full-size links missing');
    masterPage.off('request',onMasteringRequest);
    await masterPage.locator('#playPause').click();
    await masterPage.waitForFunction(()=>{
      const a=document.querySelector('#playerAudio');
      return a && a.currentTime>0.2 && !a.paused && !a.error &&
        a.currentSrc.includes('/mastering/dynamic.flac');
    },null,{timeout:18000});
    await masterPage.close();
    results.push(device.name+' Mastering real static stereo waveforms loaded without initial FLAC requests');

    await page.goto('http://127.0.0.1:8765/labs/abx/?test=formats-light-128-v1&mode=training',{waitUntil:'load',timeout:30000});
    const abx=page.locator('[data-abx-lab="all"]');
    if(await abx.count()!==1)throw new Error(device.name+' standalone ABX Lab is missing');
    if((await abx.locator('select').inputValue())!=='formats-light-128-v1')throw new Error(device.name+' did not preserve direct test link');
    const backLink=abx.locator('.tsq-abx-lesson-link');
    if(await backLink.getAttribute('href')!=='/labs/formats/?song=light')throw new Error(device.name+' missing exact source lesson link');
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
    if(link!=='/labs/formats/?song=light')throw new Error(device.name+' Advanced test not linked to source lesson');
    await abx.locator('select').selectOption('formats-diva-320-v1');
    if(await backLink.getAttribute('href')!=='/labs/formats/?song=diva')throw new Error(device.name+' Diva ABX does not link to Diva overview');
    const lessonPage=await context.newPage();
    await lessonPage.goto('http://127.0.0.1:8765/labs/formats/?song=diva',{waitUntil:'load',timeout:30000});
    if(await lessonPage.locator('[data-song="diva"]').getAttribute('aria-pressed')!=='true')throw new Error(device.name+' source overview did not select Diva');
    await lessonPage.close();
    await abx.locator('[data-mode="training"]').click();
    if((await abx.locator('select').inputValue())!=='mix-narrow-reference-v1')throw new Error(device.name+' Training options missing');
    if(await backLink.getAttribute('href')!=='/lab/')throw new Error(device.name+' Mixing source lesson link broken');
    results.push(device.name+' ABX Training / Challenge / Advanced, contextual overview links OK');
    // Community boards share the free-tier D1 Worker. Mock only this API for
    // browser UI tests; production submission stays disabled until release.
    await page.route('https://tsq-abx.thesoundquestion.workers.dev/v1/community/**',async route=>{
      const req=route.request(),url=new URL(req.url());
      const common={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'};
      if(req.method()==='OPTIONS'){await route.fulfill({status:204,headers:common});return;}
      if(url.pathname.endsWith('/approved')){
        const sample=url.searchParams.get('kind')==='comment'
          ? [{kind:'comment',body:'This community experiment is fun.',category:'',artist:'',title:''}]
          : [{kind:'suggestion',title:'A <b>hidden</b> gem',artist:'The Unknown Group',category:'atmosphere',body:'Unusual recording with depth and layered groove.'}];
        await route.fulfill({status:200,contentType:'application/json',headers:common,body:JSON.stringify({items:sample,hasMore:false,nextOffset:1})});return;
      }
      if(url.pathname.endsWith('/submit')){
        await route.fulfill({status:202,contentType:'application/json',headers:common,body:JSON.stringify({status:'pending',receipt:'00000000-0000-4000-8000-000000000001'})});return;
      }
      await route.fulfill({status:404,contentType:'application/json',headers:common,body:'{}'});
    });
    const abxCommunity=page.locator('[data-community-scope="abx"]');
    await abxCommunity.scrollIntoViewIfNeeded();
    const discussion=abxCommunity.locator('form[data-community-kind="comment"]');
    await discussion.locator('button[type="submit"]').waitFor({state:'visible'});
    await page.waitForFunction(()=>!document.querySelector('[data-community-scope="abx"] button[type="submit"]')?.disabled,null,{timeout:12000});
    await discussion.locator('textarea[name="body"]').fill('I noticed the reverb tails differed between A and B.');
    await discussion.locator('input[name="consent"]').check();
    await discussion.locator('button[type="submit"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-community-scope="abx"] .community-feedback')?.textContent.includes('Submitted for review'),null,{timeout:12000});
    if(!await abxCommunity.locator('.community-entry-body').count())throw new Error(device.name+' approved discussion not displayed');
    if((await abxCommunity.locator('.community-entry-body').first().innerText()).includes('reverb tails'))throw new Error(device.name+' pending comment appeared publicly');
    await page.goto('http://127.0.0.1:8765/library/curators-listening-room/#community-listening-room',{waitUntil:'load',timeout:30000});
    const roomCommunity=page.locator('[data-community-scope="room"]');
    await roomCommunity.scrollIntoViewIfNeeded();
    const nominate=roomCommunity.locator('form[data-community-kind="suggestion"]');
    if(await nominate.locator('select[name="category"] option').count()!==8)throw new Error(device.name+' missing Listening Room categories');
    if(await nominate.locator('textarea[name="body"]').getAttribute('maxlength')!=='280')throw new Error(device.name+' missing description limit');
    await page.waitForFunction(()=>!document.querySelector('[data-community-scope="room"] [data-community-kind="suggestion"] button[type="submit"]')?.disabled,null,{timeout:12000});
    await nominate.locator('input[name="artist"]').fill('Little Known Ensemble');
    await nominate.locator('input[name="title"]').fill('An Unusual Recording');
    await nominate.locator('select[name="category"]').selectOption('atmosphere');
    await nominate.locator('textarea[name="body"]').fill('Layered rhythms and spatial details make this hidden gem especially worth hearing.');
    await nominate.locator('input[name="consent"]').check();
    await nominate.locator('button[type="submit"]').click();
    await page.waitForFunction(()=>document.querySelector('[data-community-scope="room"] .community-feedback')?.textContent.includes('Submitted for review'),null,{timeout:12000});
    if(await roomCommunity.locator('.community-results b').count())throw new Error(device.name+' unsafe submitted HTML was interpreted');
    if(!(await roomCommunity.locator('.community-results').first().innerText()).includes('<b>hidden</b>'))throw new Error(device.name+' approved text was not safely rendered');
    results.push(device.name+' moderated ABX comments and seven-category Listening Room nominations OK');
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
