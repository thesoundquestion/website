// Browser preflight for the packaged, unpublished release. No Cloudflare API,
// deployment, Worker mutations or live ABX scoring.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';

const BASE='http://127.0.0.1:8766';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
const outcomes=[];
const categories={
  audio_interface:['Microphone preamps','Documented inputs and connections','Computer recording channels'],
  mixer_recorder:['Advertised mixer channels','USB recording mode','Documented outputs and connections'],
  microphone:['Microphone capsule / type','Pickup pattern','Documented microphone outputs'],
  headphone_amplifier:['Published output ratings','Documented source inputs','Documented headphone and line outputs'],
  computer_sound_card:['Recording ADC','Documented sound-card inputs','Documented sound-card outputs']
};
const expectedPitch="You don't need to know a thing about audio equipment to love music.";
const devices=[
 {name:'desktop',options:{viewport:{width:1365,height:900}}},
 {name:'mobile',options:{viewport:{width:390,height:844},isMobile:true,hasTouch:true}}
];
async function visit(page,path){
 const response=await page.goto(BASE+path,{waitUntil:'load',timeout:30000});
 assert.equal(response?.status(),200,'Could not open '+path);
}
async function checkNoErrors(page,errors,where){
 assert.deepEqual(errors,[],where+' JavaScript errors');
 const overflow=await page.evaluate(()=>({
    width:document.documentElement.clientWidth,
    scroll:document.documentElement.scrollWidth
 }));
 assert.ok(overflow.scroll<=overflow.width+8,
    where+' unexpected sideways page scroll: '+overflow.scroll+' vs '+overflow.width);
}
try {
 for(const device of devices){
  const context=await browser.newContext(device.options);
  // No website visit may submit to live Worker services during the smoke test.
  let workerRequests=0;
  await context.route('**/*.workers.dev/**',route=>{
    workerRequests++;
    return route.abort('blockedbyclient');
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await visit(page,'/');
  const lead=page.locator('.home-goal-intro .home-homepage-question');
  assert.ok(await lead.isVisible(),device.name+' homepage question missing');
  assert.ok((await lead.innerText()).startsWith(expectedPitch));
  const font=parseFloat(await lead.evaluate(el=>getComputedStyle(el).fontSize));
  assert.ok(font>=14.4&&font<=17.5,device.name+' hero introduction larger than planned: '+font);
  assert.equal(await page.locator('.home-quick-links a').count(),3);
  assert.equal(await page.locator('.home-goal-grid .home-goal-card').count(),6);
  await checkNoErrors(page,errors,device.name+' homepage');
  outcomes.push(device.name+' compact homepage text and hierarchy');

  await visit(page,'/library/');
  for(const anchor of ['#formats','#abx']){
   assert.equal(await page.locator('a[href="/library/behind-the-experiments/'+anchor+'"]').count(),1);
  }
  await visit(page,'/library/behind-the-experiments/#abx');
  assert.equal(await page.locator('#abx').count(),1);
  assert.equal(await page.locator('#formats').count(),1);
  await checkNoErrors(page,errors,device.name+' evidence pages');
  outcomes.push(device.name+' library methods and ABX evidence links');

  await visit(page,'/system-check/compare/?type=audio_interface');
  await page.waitForFunction(()=>!document.querySelector('#gc-expanded-results')?.hidden,{timeout:20000});
  assert.equal(await page.locator('[data-kind]').count(),9);
  assert.ok(await page.locator('#gc-expanded').isVisible());
  assert.ok(await page.locator('#gc-legacy').isHidden());
  for(const [kind,labels] of Object.entries(categories)){
   await page.locator('[data-kind="'+kind+'"]').click();
   await page.waitForFunction(type=>
     document.querySelector('[data-kind="'+type+'"]')?.getAttribute('aria-pressed')==='true' &&
     !document.querySelector('#gc-expanded-results')?.hidden,kind,{timeout:15000});
   const heads=await page.locator('#gc-expanded-rows th').allInnerTexts();
   for(const label of labels)
     assert.ok(heads.some(text=>text.includes(label)),device.name+' '+kind+' missing '+label);
   const cells=await page.locator('#gc-expanded-rows td').allInnerTexts();
   assert.ok(cells.length>10,device.name+' '+kind+' comparison rows absent');
   assert.ok(cells.some(text=>text!=='Not verified'),device.name+' '+kind+' every field unknown');
   assert.ok(await page.locator('#gc-expanded-sources section').count()===2);
   assert.ok(await page.locator('#gc-expanded-table-scroll, .gc-expanded-table-scroll').count()>=1);
  }
  const lone=await page.locator('#gc-expanded-status').innerText();
  assert.match(lone,/Only one documented model/);
  await page.locator('[data-kind="amp"]').click();
  assert.ok(await page.locator('#gc-legacy').isVisible());
  assert.ok(await page.locator('#gc-expanded').isHidden());
  const sides=page.locator('#gc-legacy [data-preset]');
  await sides.nth(0).selectOption({label:'Yamaha A-720'});
  await sides.nth(1).selectOption({label:'Panasonic SA-HE100'});
  assert.ok(await page.locator('#comparison').isVisible());
  assert.match(await page.locator('#comparison-rows').innerText(),/W\/ch|Power per channel|Input sensitivity/);
  await checkNoErrors(page,errors,device.name+' Compare My Gear');
  outcomes.push(device.name+' nine gear types with source-backed connections and preserved amplifier comparison');

  await visit(page,'/system-builder/creating/');
  await page.waitForFunction(()=>document.querySelector('#sb-purpose-status')?.textContent.includes('Ready to suggest'),null,{timeout:20000});
  await page.locator('#sb-purpose-form button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#sb-purpose-result')?.hidden,null,{timeout:15000});
  assert.ok((await page.locator('#sb-purpose-result-body').innerText()).length>150);
  await checkNoErrors(page,errors,device.name+' Creating Builder');
  outcomes.push(device.name+' Creating Builder example chain');

  await visit(page,'/system-builder/');
  // The new task-first Builder intentionally keeps its submit controls hidden
  // until someone selects a goal. Test the unlisted-gear search and provisional
  // specification path on the actual packaged desktop/mobile page.
  await page.locator('#sb-build-intent').selectOption('amp_for_speakers');
  await page.locator('[name="speakerOther"]').fill('Test Only Passive Speaker');
  await page.waitForFunction(()=>document.querySelector('[data-gear-searches="speaker"] a')?.href.includes('google.com/search'));
  assert.match(await page.locator('[data-gear-message="speaker"]').innerText(),/No saved model matched/);
  await page.locator('[name="speakerSpecUrl"]').fill('https://example.org/test-speaker-manual');
  await page.locator('[name="speakerLoad"]').fill('8');
   await page.locator('[name="speakerPowerType"]').selectOption('passive');
  await page.locator('#sb-form button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#sb-results')?.hidden,null,{timeout:20000});
  const summary=await page.locator('#sb-results').innerText();
  assert.ok(summary.length>220);
  assert.match(summary,/user-supplied|user-entered|provisional/i,
    device.name+' unlisted gear must stay visibly provisional');
  await checkNoErrors(page,errors,device.name+' Listening Builder');
  assert.equal(workerRequests,0,device.name+' smoke attempted live Worker API');
  outcomes.push(device.name+' Listening Builder unlisted specification pathway');
  await context.close();
 }
 console.log('RELEASE_BROWSER_PREFLIGHT_OK '+outcomes.join(' | '));
}finally{
 await browser.close();
}
