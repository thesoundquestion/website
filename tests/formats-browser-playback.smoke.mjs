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
    const prematureAudio=[];
    const initialWatch=req=>{
      if(/tsq-lab-audio\.thesoundquestion\.workers\.dev\/|\/assets\/audio\/formats\/[^/]+\.mp3/.test(req.url()))
        prematureAudio.push(req.url());
    };
    page.on('request',initialWatch);
    await page.goto(BASE,{waitUntil:'load',timeout:30000});
    await page.locator('[data-song="diva"]').click();
    await page.locator('[data-format="320"]').click();
    await page.waitForTimeout(300);
    if(prematureAudio.length)throw new Error(device.name+' requested audio before Play: '+JSON.stringify(prematureAudio));
    await page.locator('[data-song="light"]').click();
    await page.waitForTimeout(100);
    if(prematureAudio.length)throw new Error(device.name+' changing songs before Play requested audio');
    page.off('request',initialWatch);
    results.push(device.name+' Formats initial visit and pre-Play changes: zero audio requests');
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
    // The optional synchronized mode must require an explicit click and must
    // never reload or restart a source when switching after preparation.
    await page.locator('#prepareInstant').click();
    await page.waitForFunction(() => {
      const node=document.querySelector('#instantReadiness');
      return node && ['ready','offline'].includes(node.dataset.readiness);
    },null,{timeout:55000});
    const preparedState=await page.locator('#instantReadiness').getAttribute('data-readiness');
    const preparationMessage=await page.locator('#instantProgress').innerText();
    if(preparedState!=='ready')
      throw new Error(device.name+' synchronized mode could not decode real FLAC/MP3 sources: '+preparationMessage);
    const newMediaRequests=[];
    const onPreparedRequest=req=>{
      if(/tsq-lab-audio\.thesoundquestion\.workers\.dev\/|\/assets\/audio\/formats\/[^/]+\.mp3/.test(req.url()))
        newMediaRequests.push(req.url());
    };
    page.on('request',onPreparedRequest);
    const beforePrepared=Number(await page.locator('#seek').inputValue());
    for(const format of ['128','320','lossless','128','320','128','lossless']) {
      await page.locator('[data-format="'+format+'"]').click();
    }
    await page.waitForTimeout(500);
    const afterPrepared=Number(await page.locator('#seek').inputValue());
    page.off('request',onPreparedRequest);
    if(newMediaRequests.length)throw new Error(device.name+' prepared switching issued '+newMediaRequests.length+' fresh media requests');
    if(afterPrepared<beforePrepared-.15 || afterPrepared>beforePrepared+8)
      throw new Error(device.name+' prepared switching lost playhead: '+beforePrepared+' → '+afterPrepared);
    if(await page.locator('#playPause').getAttribute('aria-label')!=='Pause')
      throw new Error(device.name+' prepared switching stopped playback');
    results.push(device.name+' prepared native-to-buffered transition, rapid A/B/A, no reload and stable playhead');
    await page.locator('#prepareInstant').click();
    await page.waitForFunction(() => {
      const a=window.__formatsTestAudio;
      return a && !a.paused && a.currentTime>0.2 && !a.error;
    },null,{timeout:16000});
    if(!(await page.locator('#instantReadiness').isHidden()))
      throw new Error(device.name+' instant mode status was not cleared on return to native playback');
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
    // A recording switch must continue playing using the same user click.
    // This catches the delayed-metadata resume that Android may reject.
    await masterPage.locator('.variant .choose').nth(1).click();
    await masterPage.waitForFunction(()=>{
      const a=document.querySelector('#playerAudio');
      return a&&a.currentTime>0.2&&!a.paused&&!a.error&&
        document.querySelector('.variant.is-selected strong')?.textContent.includes('Moderate');
    },null,{timeout:20000});
    // A visitor may compare arbitrary older/newer masters with ordinary
    // filenames. Verify the manual WAV slots, local-only playback, and that
    // the app stops describing the personal recordings as its measured demo.
    await masterPage.locator('#playPause').click(); // pause first
    await masterPage.locator('.fileload summary').click();
    const silentWav=()=>{
      const rate=22050,samples=rate*4,buffer=Buffer.alloc(44+samples*2);
      buffer.write('RIFF',0);buffer.writeUInt32LE(buffer.length-8,4);
      buffer.write('WAVE',8);buffer.write('fmt ',12);buffer.writeUInt32LE(16,16);
      buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);
      buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*2,28);
      buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);
      buffer.write('data',36);buffer.writeUInt32LE(samples*2,40);
      return buffer;
    };
    await masterPage.locator('[data-master-slot="0"]').setInputFiles({
      name:'Original album release.wav',mimeType:'audio/wav',buffer:silentWav()
    });
    await masterPage.locator('[data-master-slot="1"]').setInputFiles({
      name:'Later remaster.wav',mimeType:'audio/wav',buffer:silentWav()
    });
    if(!(await masterPage.locator('#modeBadge').innerText()).includes('not volume-matched'))
      throw new Error(device.name+' personal Mastering files falsely claim matched volume');
    if(await masterPage.locator('#ownMasteringNotice').isHidden())
      throw new Error(device.name+' personal Mastering limitations not disclosed');
    const wavButtons=await masterPage.locator('.variant .choose strong').allTextContents();
    if(!wavButtons[0].includes('Your WAV A')||!wavButtons[1].includes('Your WAV B'))
      throw new Error(device.name+' personal Mastering labels did not replace demo labels');
    await masterPage.locator('.variant .choose').nth(0).click();
    await masterPage.locator('#playPause').click();
    await masterPage.waitForFunction(()=>{
      const a=document.querySelector('#playerAudio');
      return a?.currentSrc.startsWith('blob:')&&!a.paused&&a.currentTime>0.2&&!a.error;
    },null,{timeout:15000});
    await masterPage.locator('.variant .choose').nth(1).click();
    await masterPage.waitForFunction(()=>{
      const a=document.querySelector('#playerAudio');
      return a?.currentSrc.startsWith('blob:')&&!a.paused&&a.currentTime>0.2&&!a.error &&
        document.querySelector('.variant.is-selected small')?.textContent==='Later remaster.wav';
    },null,{timeout:15000});
    await masterPage.locator('[data-tab="eq"]').click();
    if(await masterPage.locator('#personalWavSlots label').nth(2).isVisible())
      throw new Error(device.name+' third WAV chooser shown for two-version EQ test');
    await masterPage.close();
    results.push(device.name+' Mastering demo switching and personal original/remaster WAV playback, honest labels and no files uploaded');

    // Mixing uses a different audio controller: verify that its source
    // changes also resume during the user's tap, not after metadata loads.
    const mixingPage=await context.newPage();
    mixingPage.on('pageerror',error=>errors.push('Mixing '+error.message));
    const prematureMixingAudio=[];
    const onMixingRequest=req=>{
      if(req.url().includes('tsq-lab-audio.thesoundquestion.workers.dev/mixing/'))
        prematureMixingAudio.push(req.url());
    };
    mixingPage.on('request',onMixingRequest);
    await mixingPage.goto('http://127.0.0.1:8765/lab/',{waitUntil:'load',timeout:30000});
    for(const variant of ['reference','polished','narrow'])
      await mixingPage.locator('[data-mix="'+variant+'"]').click();
    await mixingPage.waitForTimeout(250);
    mixingPage.off('request',onMixingRequest);
    if(prematureMixingAudio.length)
      throw new Error(device.name+' Mixing fetched FLAC before Play: '+JSON.stringify(prematureMixingAudio));
    await mixingPage.locator('#playToggle').click();
    await mixingPage.waitForFunction(()=>{
      const a=document.querySelector('#labAudio');
      return a&&a.currentTime>0.2&&!a.paused&&!a.error;
    },null,{timeout:20000});
    for(const variant of ['reference','polished']){
      await mixingPage.locator('[data-mix="'+variant+'"]').click();
      await mixingPage.waitForFunction(which=>{
        const a=document.querySelector('#labAudio');
        return a&&a.currentTime>0.2&&!a.paused&&!a.error&&
          document.querySelector('[data-mix="'+which+'"]')?.getAttribute('aria-pressed')==='true';
      },variant,{timeout:20000});
    }
    await mixingPage.close();
    results.push(device.name+' Mixing zero idle FLAC requests, plus source changes that resume on the original mobile tap');

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
    if(await abx.getAttribute('data-playback-mode')!=='synchronized')
      throw new Error(device.name+' ABX Training did not prepare synchronized Web Audio buffers');
    const assertABXPlaying=async label=>{
      await abx.locator('[data-slot="'+label+'"]').click();
      await page.waitForFunction(slot=>{
        const root=document.querySelector('[data-abx-lab="all"]');
        return root?.dataset.playbackMode==='synchronized' &&
          root?.dataset.trainingPlaying==='true' &&
          root.querySelector('[data-slot="'+slot+'"]')?.getAttribute('aria-pressed')==='true' &&
          root.querySelector('audio')?.paused;
      },label,{timeout:15000});
    };
    await assertABXPlaying('A');
    await page.waitForTimeout(250);
    for(const label of ['B','A','X','B','X','A','X'])await assertABXPlaying(label);
    // Repeating the SAME button toggles pause; selecting a different label
    // with identical cached audio must NEVER toggle pause.
    await abx.locator('[data-slot="X"]').click();
    if(await abx.getAttribute('data-training-playing')!=='false')
      throw new Error(device.name+' repeated X did not toggle pause');
    await assertABXPlaying('A');
    if(workerRequestsAfterReady!==0)throw new Error(device.name+' synchronized ABX triggered '+workerRequestsAfterReady+' fresh Worker fetches');
    results.push(device.name+' ABX synchronized Training A/B/X: rapid alias switching, correct toggle and zero Worker fetches');
    await abx.getByRole('button',{name:'X is A'}).click();
    const practice=await abx.locator('.tsq-abx-scoreboard').innerText();
    if(!practice.includes('Training score:'))throw new Error(device.name+' Training guess was not counted');
    await abx.getByRole('button',{name:'Next trial'}).click();
    await abx.locator('[data-mode="challenge"]').click();
    if(!(await abx.locator('.tsq-abx-consent').isHidden()))throw new Error(device.name+' beta Challenge incorrectly offers public score sharing');
    if(!(await abx.locator('.tsq-abx-trial-readiness').isHidden()))throw new Error(device.name+' scored ABX exposes readiness timing');
    const challengeUrl=await abx.locator('select').inputValue();
    if(!['master-eq-v1','formats-light-128-v1','formats-diva-128-v1'].includes(challengeUrl))throw new Error(device.name+' Challenge catalogue wrong');
    await abx.locator('[data-mode="advanced"]').click();
    const advancedId=await abx.locator('select').inputValue();
    if(!advancedId.endsWith('320-v1'))throw new Error(device.name+' Advanced catalogue wrong');
    if(!(await abx.locator('.tsq-abx-consent').isHidden()))throw new Error(device.name+' beta Advanced incorrectly offers public score sharing');
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
