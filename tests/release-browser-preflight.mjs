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
  computer_sound_card:['Recording ADC','Documented sound-card inputs','Documented sound-card outputs'],
  powered_studio_monitor:['Speaker type','Built-in amplification'],
  powered_pa_speaker:['Speaker type','Built-in amplification'],
  catalog_headphone:['Nominal impedance','Published sensitivity']
};
const expectedPitch="Ever wonder why one recording moves you, why two speakers sound different, or whether expensive equipment is worth it?";
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
  assert.equal(await page.locator('[data-kind]').count(),12);
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
   assert.ok(cells.length>=(kind==='catalog_headphone'?6:10),device.name+' '+kind+' comparison rows absent');
   assert.ok(cells.some(text=>text!=='Not verified'),device.name+' '+kind+' every field unknown');
   assert.ok(await page.locator('#gc-expanded-sources section').count()===2);
   assert.ok(await page.locator('#gc-expanded-table-scroll, .gc-expanded-table-scroll').count()>=1);
  }
  // The newest powered categories contain multiple real models, so a
  // one-model status is no longer a valid end-of-loop assumption.
  const comparisonStatus=await page.locator('#gc-expanded-status').innerText();
  assert.match(comparisonStatus,/Showing documented specifications|Only one documented model/);
  await page.locator('[data-kind="amp"]').click();
  assert.ok(await page.locator('#gc-legacy').isVisible());
  assert.ok(await page.locator('#gc-expanded').isHidden());
  const sides=page.locator('#gc-legacy [data-preset]');
  await sides.nth(0).selectOption({label:'Yamaha A-720'});
  await sides.nth(1).selectOption({label:'Panasonic SA-HE100'});
  assert.ok(await page.locator('#comparison').isVisible());
  assert.match(await page.locator('#comparison-rows').innerText(),/W\/ch|Power per channel|Input sensitivity/);
  await checkNoErrors(page,errors,device.name+' Compare My Gear');
  outcomes.push(device.name+' twelve gear types with source-backed connections and preserved amplifier comparison');

  await visit(page,'/system-builder/creating/');
  await page.waitForFunction(()=>document.querySelector('#sb-purpose-status')?.textContent.includes('Ready to suggest'),null,{timeout:20000});
  await page.locator('#sb-purpose-form button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#sb-purpose-result')?.hidden,null,{timeout:15000});
  assert.ok((await page.locator('#sb-purpose-result-body').innerText()).length>150);
  const creatingLinks=page.locator('#sb-purpose-result-body a[href^="/system-check/compare/?type="]');
  assert.ok(await creatingLinks.count()>0,
    device.name+' Creating Builder showed no model-specific checker links');
  const headphoneLinks=page.locator('#sb-purpose-result-body a[href^="/system-check/compare/?type=catalog_headphone"]');
  assert.ok(await headphoneLinks.count()>0,
    device.name+' Creating Builder omitted its selected headphone checker link');
  const headphoneUrl=new URL(await headphoneLinks.first().getAttribute('href'),BASE);
  assert.ok(headphoneUrl.searchParams.get('left'),'Headphone checker missing selected registry ID');
  const creatingHref=await creatingLinks.first().getAttribute('href');
  const creatingUrl=new URL(creatingHref,BASE);
  const type=creatingUrl.searchParams.get('type');
  const selectedId=creatingUrl.searchParams.get('left');
  assert.ok(['microphone','audio_interface','mixer_recorder','computer_sound_card','headphone_amplifier'].includes(type));
  assert.ok(selectedId,'Creating Builder checker link had no equipment selected');
  await visit(page,creatingUrl.pathname+creatingUrl.search);
  await page.waitForFunction(()=>!document.querySelector('#gc-expanded-results')?.hidden,
    null,{timeout:20000});
  assert.equal(await page.locator('#gc-expanded-left').inputValue(),selectedId,
    device.name+' Compare My Gear did not restore Creating Builder selection');
  await checkNoErrors(page,errors,device.name+' Creating Builder to Compare');
  outcomes.push(device.name+' Creating Builder exact-model comparison handoff');
  await visit(page,headphoneUrl.pathname+headphoneUrl.search);
  await page.waitForFunction(()=>!document.querySelector('#gc-expanded-results')?.hidden,
    null,{timeout:20000});
  assert.equal(await page.locator('#gc-expanded-left').inputValue(),headphoneUrl.searchParams.get('left'));
  await visit(page,'/system-builder/creating/');
  await page.waitForFunction(()=>document.querySelector('#sb-purpose-status')?.textContent.includes('Ready to suggest'),
    null,{timeout:20000});
  for(const scenario of [
    {goal:'vocal',type:'powered_studio_monitor',monitors:true},
    {goal:'live',type:'powered_pa_speaker',monitors:false}
  ]){
    await page.locator('#sb-purpose-select').selectOption(scenario.goal);
    if(scenario.monitors)await page.locator('#sb-include-monitors').check();
    await page.locator('#sb-purpose-form button[type="submit"]').click();
    await page.waitForFunction(()=>!document.querySelector('#sb-purpose-result')?.hidden,
      null,{timeout:15000});
    const routed=page.locator('#sb-purpose-result-body a[href^="/system-check/compare/?type='+scenario.type+'"]');
    assert.ok(await routed.count()>0,device.name+' missing '+scenario.type+' checker link');
    const target=new URL(await routed.first().getAttribute('href'),BASE);
    assert.ok(target.searchParams.get('left'),'Missing exact '+scenario.type+' device ID');
    await visit(page,target.pathname+target.search);
    await page.waitForFunction(()=>!document.querySelector('#gc-expanded-results')?.hidden,
      null,{timeout:20000});
    assert.equal(await page.locator('#gc-expanded-left').inputValue(),target.searchParams.get('left'));
    await visit(page,'/system-builder/creating/');
    await page.waitForFunction(()=>document.querySelector('#sb-purpose-status')?.textContent.includes('Ready to suggest'),
      null,{timeout:20000});
  }
  await checkNoErrors(page,errors,device.name+' Creating Builder');
  outcomes.push(device.name+' microphone, recording, studio and PA model-selected checker links');

  // Creating Builder has no listening distance: model moves across, while
  // distance remains empty until entered by the listener.
  await page.locator('#sb-purpose-select').selectOption('vocal');
  await page.locator('#sb-include-monitors').check();
  const jbl=page.locator('#sb-purpose-monitor option').filter({hasText:'JBL 305P MkII'}).first();
  const jblId=await jbl.getAttribute('value');
  assert.ok(jblId,device.name+' JBL monitor absent from Creating equipment list');
  await page.locator('details.sb-own-equipment summary').click();
  await page.locator('#sb-purpose-monitor').selectOption(jblId);
  await page.locator('#sb-purpose-form button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#sb-purpose-result')?.hidden,null,{timeout:15000});
  const creatingPowered=page.locator('#sb-purpose-result-body a[href*="/system-check/powered/?model=JBL+305P+MkII"]').first();
  assert.ok(await creatingPowered.count()>0,device.name+' Creating powered output handoff missing');
  const creatingPowerUrl=new URL(await creatingPowered.getAttribute('href'),BASE);
  assert.equal(creatingPowerUrl.searchParams.has('distance'),false);
  await visit(page,creatingPowerUrl.pathname+creatingPowerUrl.search);
  assert.equal(await page.locator('#powered-model').inputValue(),'JBL 305P MkII');
  assert.equal(await page.locator('#powered-distance').inputValue(),'');
  await page.locator('#powered-distance').fill('6');
  await page.locator('#powered-form button[type="submit"]').click();
  assert.match(await page.locator('#powered-verdict').innerText(),/Yes\.|Probably\.|Not a reliable/);
  await checkNoErrors(page,errors,device.name+' Creating powered handoff');
  outcomes.push(device.name+' Creating powered model preserved without inventing listening distance');

  await visit(page,'/system-builder/');
  await page.locator('#sb-form button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#sb-results')?.hidden,null,{timeout:20000});
  assert.ok((await page.locator('#sb-results').innerText()).length>220);

  // The recommendation's System Check action must carry the actual model,
  // distance and listening target, and the destination must populate inputs.
  // A generic link to an empty calculator does not pass this test.
  await page.locator('#sb-form [name="architecture"]').selectOption('passive_separates');
  await page.locator('#sb-form [name="goal"]').selectOption('imaging');
  await page.locator('#sb-form [name="useCase"]').selectOption('bedroom');
  await page.locator('#sb-form [name="level"]').selectOption('high');
  await page.locator('#sb-form [name="distanceFt"]').fill('6');
  await page.locator('#sb-form button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#sb-results')?.hidden,null,{timeout:20000});
  const recommended=page.locator('article.sb-recommend').filter({hasText:'Yamaha A-S301 + PSB Alpha P5'}).first();
  assert.equal(await recommended.count(),1,device.name+' researched Yamaha/PSB example absent');
  const link=recommended.getByRole('link',{name:'Check your exact listening levels'});
  assert.ok(await link.isVisible(),device.name+' System Check handoff missing');
  const url=new URL(await link.getAttribute('href'),BASE);
  assert.equal(url.pathname,'/system-check/');
  for(const [key,value] of Object.entries({
    speaker:'PSB Alpha P5',amp:'Yamaha A-S301',distance:'6',
    peak:'95',average:'80',builderSensitivity:'87',builderLoad:'8'
  }))assert.equal(url.searchParams.get(key),value,device.name+' handoff field '+key);
  await visit(page,url.pathname+url.search);
  assert.equal(await page.locator('#check [name="distance"]').inputValue(),'6');
  assert.equal(await page.locator('#check [name="peak"]').inputValue(),'95');
  assert.equal(await page.locator('#check [name="average"]').inputValue(),'80');
  assert.equal(await page.locator('#check [name="sensitivity"]').inputValue(),'87');
  assert.equal(await page.locator('#check [name="load"]').inputValue(),'8');
  assert.equal(await page.locator('#check [name="speakerModel"]').inputValue(),'PSB Alpha P5');
  assert.equal(await page.locator('#check [name="ampModel"]').inputValue(),'Yamaha A-S301');
  assert.ok(await page.locator('#builder-handoff-note').isVisible());
  assert.ok((await page.locator('#ratings').innerText()).length>0);
  await page.locator('#check button[type="submit"]').first().click();
  await page.waitForFunction(()=>document.querySelector('#result-body')?.textContent.length>150,
    null,{timeout:15000});
  await checkNoErrors(page,errors,device.name+' Builder to System Check');
  outcomes.push(device.name+' Builder to prefilled System Check loudness calculation');

  // Source-qualified powered monitor: real recommended or catalogue model,
  // exact distance/level/cabinet count and a completed acoustic calculation.
  await visit(page,'/system-builder/');
  await page.locator('#sb-form [name="architecture"]').selectOption('active_studio');
  await page.locator('#sb-form [name="useCase"]').selectOption('desk');
  await page.locator('#sb-form [name="distanceFt"]').fill('6');
  await page.locator('#sb-form [name="level"]').selectOption('high');
  await page.locator('#sb-form button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#sb-results')?.hidden,
    null,{timeout:20000});
  const poweredLink=page.locator('a[href*="/system-check/powered/?model=JBL+305P+MkII"]').first();
  assert.ok(await poweredLink.count()>0,device.name+' JBL powered loudness checker missing');
  const poweredTarget=new URL(await poweredLink.getAttribute('href'),BASE);
  assert.equal(poweredTarget.searchParams.get('distance'),'6');
  assert.equal(poweredTarget.searchParams.get('level'),'high');
  await visit(page,poweredTarget.pathname+poweredTarget.search);
  assert.equal(await page.locator('#powered-model').inputValue(),'JBL 305P MkII');
  assert.equal(await page.locator('#powered-distance').inputValue(),'6');
  assert.equal(await page.locator('#powered-level').inputValue(),'high');
  assert.match(await page.locator('#powered-verdict').innerText(),/Yes\.|Probably\.|Not a reliable/);
  assert.ok(await page.locator('#powered-technical').isVisible());
  await page.locator('#powered-distance').fill('15');
  await page.locator('#powered-form button[type="submit"]').click();
  assert.match(await page.locator('#powered-verdict').innerText(),/Probably|Not a reliable/);
  await checkNoErrors(page,errors,device.name+' powered loudness checker');

  // A known 2.1 recommendation must open a preselected connection checker.
  await visit(page,'/system-builder/');
  await page.locator('#sb-form [name="architecture"]').selectOption('consumer_powered_pair');
  await page.locator('#sb-form [name="useCase"]').selectOption('bedroom');
  await page.locator('#sb-form [name="connection"]').selectOption('usb');
  await page.locator('#sb-form [name="subMode"]').selectOption('plan_sub');
  await page.locator('#sb-form [name="subOwned"]').selectOption('no');
  await page.locator('#sb-form button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#sb-results')?.hidden,
    null,{timeout:20000});
  const subLink=page.locator('a[href*="/system-check/subwoofer/?source=Kanto+ORA"]').first();
  assert.ok(await subLink.count()>0,device.name+' exact ORA subwoofer checker link missing');
  const subTarget=new URL(await subLink.getAttribute('href'),BASE);
  assert.equal(subTarget.searchParams.get('sub'),'Edifier T5');
  await visit(page,subTarget.pathname+subTarget.search);
  assert.equal(await page.locator('#sub-source').inputValue(),'Kanto ORA');
  assert.equal(await page.locator('#sub-model').inputValue(),'Edifier T5');
  assert.match(await page.locator('#sub-message').innerText(),/Yes\. These exact models/);
  assert.match(await page.locator('#sub-mains').innerText(),/100 Hz/);
  await page.locator('#sub-model').selectOption('');
  await page.locator('#sub-form button[type="submit"]').click();
  assert.match(await page.locator('#sub-verdict').innerText(),/Not enough verified information/);
  await page.locator('#sub-source').selectOption('');
  await page.locator('#sub-reported-output').selectOption('speaker');
  await page.locator('#sub-reported-input').selectOption('line');
  await page.locator('#sub-form button[type="submit"]').click();
  assert.match(await page.locator('#sub-message').innerText(),/Do not connect directly/);
  await page.locator('#sub-reported-output').selectOption('line');
  await page.locator('#sub-reported-output-connector').selectOption('rca');
  await page.locator('#sub-reported-input-connector').selectOption('rca');
  await page.locator('#sub-form button[type="submit"]').click();
  assert.match(await page.locator('#sub-verdict').innerText(),/Possible route, not verified/);
  await checkNoErrors(page,errors,device.name+' subwoofer connection checker');

  // A user-entered SPL estimate for unlisted powered speakers must remain
  // visibly unverified, even when it predicts sufficient output.
  await visit(page,'/system-check/powered/');
  await page.locator('#powered-model').selectOption('__manual__');
  await page.locator('#powered-distance').fill('6');
  await page.locator('#powered-manual-peak').fill('108');
  await page.locator('#powered-manual-continuous').fill('94');
  await page.locator('#powered-manual-reference').fill('1');
  await page.locator('#powered-form button[type="submit"]').click();
  assert.match(await page.locator('#powered-verdict').innerText(),/entered specifications/);
  assert.doesNotMatch(await page.locator('#powered-verdict').innerText(),/^Yes\./);
  assert.ok(await page.locator('#powered-source').isHidden());
  await checkNoErrors(page,errors,device.name+' unlisted powered speaker estimate');
  outcomes.push(device.name+' powered acoustic output and 2.1 line-level/crossover checker handoffs');
  await checkNoErrors(page,errors,device.name+' Listening Builder');
  assert.equal(workerRequests,0,device.name+' smoke attempted live Worker API');
  outcomes.push(device.name+' Listening Builder equipment results');
  await context.close();
 }
 console.log('RELEASE_BROWSER_PREFLIGHT_OK '+outcomes.join(' | '));
}finally{
 await browser.close();
}
