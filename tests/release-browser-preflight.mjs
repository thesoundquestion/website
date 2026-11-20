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

  // Two local podcast speakers need an actual signal path and independently
  // editable tracks. Explain USB vs XLR and how shared headphones work.
  await page.locator('#sb-purpose-select').selectOption('podcast');
  await page.locator('#sb-purpose-tracks').check();
  await page.locator('#sb-purpose-form button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#sb-purpose-result')?.hidden,null,{timeout:15000});
  const podcastExplanation=await page.locator('#sb-purpose-result-body .sb-build-workflow').innerText();
  assert.match(podcastExplanation,/How will this setup work\?/);
  assert.match(podcastExplanation,/by XLR cable/);
  assert.match(podcastExplanation,/this setup uses their XLR outputs/);
  assert.match(podcastExplanation,/M-Track Duo/);
  assert.match(podcastExplanation,/headphone output/);
  assert.doesNotMatch(podcastExplanation,/extra software routing|multiple USB microphones on Windows/);
  assert.ok(await page.locator('#sb-purpose-result-body .sb-build-workflow-sources a').count()>=2);
  await checkNoErrors(page,errors,device.name+' podcast monitoring instructions');
  outcomes.push(device.name+' two-mic podcast: XLR capture, separate tracks and monitoring explanation');

  // Builder-to-System-Check deep links carry exact identity and seat distance.
   // Existing saved presets autofill only their documented numeric ratings.
   await visit(page,'/system-check/?embedded=1&speaker=Paradigm%20Phantom%20v1&amp=Yamaha%20A-S301&distanceFt=9');
   assert.equal(await page.locator('[name="distance"]').inputValue(),'9');
   assert.equal(await page.locator('[name="speakerModel"]').inputValue(),'Paradigm Phantom v1');
   assert.equal(await page.locator('[name="ampModel"]').inputValue(),'Yamaha A-S301');
   assert.ok(Number(await page.locator('[name="sensitivity"]').inputValue())>0);
   assert.ok(Number(await page.locator('[name="load"]').inputValue())>0);
   assert.ok(await page.locator('body.sc-embedded').count()===1);
   await checkNoErrors(page,errors,device.name+' embedded System Check known models');
   outcomes.push(device.name+' embedded System Check exact saved preset handoff');

   // A Builder handoff requires no secondary gear picker or submit click:
   // the existing documented model presets must populate the real calculator.
   await visit(page,'/system-check/?embedded=1&autocheck=1&speaker=Paradigm%20Phantom%20v1&amp=Yamaha%20A-S301&distanceFt=9&average=80&gap=15');
   assert.equal(await page.locator('[name="speakerModel"]').inputValue(),'Paradigm Phantom v1');
   assert.equal(await page.locator('[name="ampModel"]').inputValue(),'Yamaha A-S301');
   assert.equal(await page.locator('[name="distance"]').inputValue(),'9');
   assert.equal(await page.locator('[name="average"]').inputValue(),'80');
   assert.equal(await page.locator('[name="peak"]').inputValue(),'95');
   assert.ok(await page.locator('body.sc-embedded.sc-auto-result').count()===1);
   assert.ok(await page.locator('.sc-inputs').isHidden());
   assert.match(await page.locator('#result-status').innerText(),/speakers ask for/);
   assert.ok((await page.locator('#result-body').innerText()).length>100);
   await checkNoErrors(page,errors,device.name+' automatic model-backed headroom results');
   outcomes.push(device.name+' exact-model headroom calculated directly from transferred listening inputs');

   // A loud preset may exceed published burst output without making the
   // speaker/amp electrically incompatible. Keep corrective advice COLLAPSED.
   await visit(page,'/system-check/?embedded=1&autocheck=1&speaker=Paradigm%20Phantom%20v1&amp=Yamaha%20A-S301&distanceFt=9&average=85&gap=20');
   const loudResult=await page.locator('#result-body').innerText();
   assert.match(loudResult,/not proof of an electrically incompatible speaker\/amplifier pair/);
   const fixDropdown=page.locator('#result-body .sc-headroom-adjustments');
   assert.equal(await fixDropdown.count(),1);
   assert.equal(await fixDropdown.locator('summary').innerText(),'What could you do?');
   assert.equal(await fixDropdown.evaluate(node=>node.open),false);
   assert.doesNotMatch(loudResult,/Sit closer/,'the beginner result should not show the full advice wall');
   await fixDropdown.locator('summary').click();
   const fixText=await fixDropdown.innerText();
   assert.match(fixText,/Why the peak target failed/);
   assert.match(fixText,/Sit closer: from 9 ft to about/);
   assert.match(fixText,/Lower the peak target/);
   assert.match(fixText,/Keep amplifier, change speakers:/);
   assert.match(fixText,/Klipsch R-51M/);
   assert.ok(await fixDropdown.locator('a[href^="https://"]').count()>=1);
   await checkNoErrors(page,errors,device.name+' occasional-loud fixes and speaker shortlist');
   outcomes.push(device.name+' one collapsed loudness fix menu with comparable speaker alternative');

   // A more modest, sourced deficit can have a genuine amplifier candidate.
   await visit(page,'/system-check/?embedded=1&autocheck=1&speaker=Paradigm%20Phantom%20v1&amp=NAD%203020%20(original)&distanceFt=9&average=80&gap=18');
   const ampFix=page.locator('#result-body .sc-headroom-adjustments');
   assert.equal(await ampFix.count(),1);
   await ampFix.locator('summary').click();
   assert.match(await ampFix.innerText(),/Keep speakers, change amplifier:/);
   assert.match(await ampFix.innerText(),/Yamaha A-S301/);
   await checkNoErrors(page,errors,device.name+' alternative amplifier shortlisted from documented burst power');
   outcomes.push(device.name+' source-backed amplifier replacement appears only for a solvable shortfall');


   // The example button on the full calculator may change the listening
   // numbers but never replace the actual selected gear or its specifications.
   await visit(page,'/system-check/?speaker=Paradigm%20Phantom%20v1&amp=Yamaha%20A-S301&distanceFt=9');
   const beforePower=await page.locator('#ratings [data-watts]').first().inputValue();
   await page.locator('#example').click();
   assert.equal(await page.locator('[name="speakerModel"]').inputValue(),'Paradigm Phantom v1');
   assert.equal(await page.locator('[name="ampModel"]').inputValue(),'Yamaha A-S301');
   assert.equal(await page.locator('#ratings [data-watts]').first().inputValue(),beforePower);
   assert.equal(await page.locator('[name="average"]').inputValue(),'87');
   await checkNoErrors(page,errors,device.name+' lesson example retains selected models');
   outcomes.push(device.name+' lesson example preserves exact model pair and published ratings');

   await visit(page,'/system-check/?embedded=1&speaker=Unlisted%20Speaker%20Model&amp=Unlisted%20Amplifier%20Model&distanceFt=11');
   assert.equal(await page.locator('[name="speakerModel"]').inputValue(),'Unlisted Speaker Model');
   assert.equal(await page.locator('[name="ampModel"]').inputValue(),'Unlisted Amplifier Model');
   assert.equal(await page.locator('[name="distance"]').inputValue(),'11');
   assert.equal(await page.locator('[name="sensitivity"]').inputValue(),'');
   assert.equal(await page.locator('[name="load"]').inputValue(),'');
   assert.match(await page.locator('[data-gear="amp"] p').innerText(),/No exact saved preset/);
   await checkNoErrors(page,errors,device.name+' embedded System Check unlisted models');
   outcomes.push(device.name+' embedded System Check unlisted identity without guessed ratings');

   await visit(page,'/system-builder/');
  // The new task-first Builder intentionally keeps its submit controls hidden
  // until someone selects a goal. Test the unlisted-gear search and provisional
  // specification path on the actual packaged desktop/mobile page.
  await page.locator('#sb-build-intent').selectOption('amp_for_speakers');
  // A similar saved model must not hide the source-spec fields after a visitor
  // chooses the external search link. The link opens a new browser tab normally.
  await page.locator('[name="speakerOther"]').fill('Paradigm Phant');
  const specs=page.locator('#sb-speaker-search [data-gear-details="speaker"]');
  assert.equal(await specs.evaluate(node=>node.open),false);
  const specSearch=page.locator('#sb-speaker-search [data-gear-searches="speaker"] a').first();
  assert.equal(await specSearch.getAttribute('target'),'_blank');
  assert.match(await specSearch.getAttribute('rel'),/noopener/);
  assert.match(await specSearch.innerText(),/opens new tab/);
  // Intercept the external site, not the link's native behavior. In desktop
  // and mobile emulation this must create a separate tab, not navigate away
  // from and destroy the partially completed Builder.
  await context.route('https://www.google.com/search?**',route=>
    route.fulfill({status:200,contentType:'text/html',body:'<title>Test manufacturer search</title>'}));
  const [researchTab]=await Promise.all([
    page.waitForEvent('popup'),specSearch.click()
  ]);
  // Playwright emits popup while the newly created tab is still blank.
  // Wait for the subsequent external search navigation before reading URL.
  await researchTab.waitForURL(/^https:\/\/www\.google\.com\/search\?/,{timeout:15000});
  assert.match(page.url(),/\/system-builder\//);
  assert.equal(await page.locator('[name="speakerOther"]').inputValue(),'Paradigm Phant');
  await researchTab.close();
  assert.equal(await specs.evaluate(node=>node.open),true,
    device.name+' returning from speaker search must reveal specification inputs');
  // The reported real-world paste describes *8-ohm compatibility* (not
  // necessarily nominal), an approximate 4.2-ohm minimum, and two sensitivity
  // readings without a 1W/2.83V reference. Show all without misclassifying.
  const reportedSpeakerText=[
    '• Design: 2-driver, 2-way bass reflex bookshelf/stand-mounted speaker',
    '• Tweeter: 19 mm (3/4 in) polyamide dome with ferro-fluid cooling',
    '• Mid/Bass Driver: 165 mm (6.5 in) polypropylene cone',
    '• Crossover: 2nd-order electro-acoustic at 3.0 kHz',
    '• Frequency Response (On-Axis): ±2 dB from 75 Hz – 20 kHz',
    '• Sensitivity: 90 dB (in-room) / 87 dB (anechoic)',
    '• Impedance: Compatible with 8 ohms (measured around 4.2 ohms minimum)',
    '• Recommended Amplifier Power: 15 – 100 watts'
  ].join('\n');
  await page.locator('#sb-speaker-spec-paste').fill(reportedSpeakerText);
  await page.locator('#sb-speaker-spec-fill').click();
  assert.equal(await page.locator('[name="speakerLoad"]').inputValue(),'8',
    device.name+' 8-ohm compatible should be usable as a provisional nominal-class match');
  assert.equal(await page.locator('[name="speakerMinimum"]').inputValue(),'4.2');
  assert.equal(await page.locator('[name="speakerSensitivity"]').inputValue(),'90',
    device.name+' in-room listening sensitivity must be primary');
  assert.equal(await page.locator('[name="speakerSensitivityEnvironment"]').inputValue(),'in_room');
  assert.equal(await page.locator('[name="speakerAnechoic"]').inputValue(),'87',
    device.name+' anechoic sensitivity must be kept as a reference');
  assert.equal(await page.locator('[name="speakerBasis"]').inputValue(),'',
    device.name+' published test basis is not fabricated in the form');
  assert.equal(await page.locator('[name="speakerRecommendedAmpMin"]').inputValue(),'15');
  assert.equal(await page.locator('[name="speakerRecommendedAmpMax"]').inputValue(),'100');
  assert.match(await page.locator('#sb-speaker-spec-observations').innerText(),/8 Ω described as compatible/);
  assert.match(await page.locator('#sb-speaker-spec-observations').innerText(),/90 dB \(in-room\).*87 dB \(anechoic\)/);
  // Clear that exploratory entry before the existing exact-value handoff.
  await page.locator('[name="speakerMinimum"]').fill('');
  await page.locator('[name="speakerLoad"]').fill('');
  await page.locator('[name="speakerSensitivity"]').fill('');
  await page.locator('[name="speakerSensitivityEnvironment"]').selectOption('');
  await page.locator('[name="speakerAnechoic"]').fill('');
  await page.locator('[name="speakerRecommendedAmpMin"]').fill('');
  await page.locator('[name="speakerRecommendedAmpMax"]').fill('');
  await page.locator('[name="speakerMaxInput"]').fill('');
  await page.locator('[name="speakerOther"]').fill('Test Only Passive Speaker');
  await page.waitForFunction(()=>document.querySelector('[data-gear-searches="speaker"] a')?.href.includes('google.com/search'));
  assert.match(await page.locator('[data-gear-message="speaker"]').innerText(),/No saved model matched/);
  assert.equal(await specs.evaluate(node=>node.open),true);
  await page.locator('#sb-speaker-spec-paste').fill('Impedance (nominal) | 8 ohms\\nMinimum impedance (Ω)\\n4.2\\nSensitivity (dB/2.83 V/1m) | 89'.replaceAll('\\n','\n'));
  await page.locator('#sb-speaker-spec-fill').click();
  assert.equal(await page.locator('[name="speakerLoad"]').inputValue(),'8');
  assert.equal(await page.locator('[name="speakerMinimum"]').inputValue(),'4.2');
  assert.equal(await page.locator('[name="speakerSensitivity"]').inputValue(),'89');
  assert.equal(await page.locator('[name="speakerBasis"]').inputValue(),'voltage');
  assert.match(await page.locator('#sb-speaker-spec-feedback').innerText(),/Filled: nominal impedance/);
  assert.match(await page.locator('#sb-speaker-spec-feedback').innerText(),/Recognised from paste: nominal impedance: 8 Ω/);
  // Manual edits must win over a later paste; there is no silent overwrite.
  await page.locator('[name="speakerLoad"]').fill('6');
  await page.locator('#sb-speaker-spec-fill').click();
  assert.equal(await page.locator('[name="speakerLoad"]').inputValue(),'6');
  await page.locator('[name="speakerLoad"]').fill('8');
  assert.equal(await page.locator('[name="speakerSpecUrl"]').inputValue(),'',
    device.name+' pasted text cannot be substituted for a source URL');
  // A manufacturer URL is optional when usable numerical specifications
  // were copied into the provisional form. A model name alone stays invalid.
  assert.equal(await page.locator('[name="speakerSpecUrl"]').inputValue(),'');
  assert.match(await page.locator('[name="speakerSpecUrl"]').locator('xpath=ancestor::label').innerText(),/Optional/i);
  await page.locator('[name="speakerPowerType"]').selectOption('passive');
  await page.locator('#sb-form button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#sb-results')?.hidden,null,{timeout:20000});
  const summary=await page.locator('#sb-results').innerText();
  assert.ok(summary.length>220);
  assert.match(summary,/user-supplied|user-entered|provisional/i,
    device.name+' unlisted gear must stay visibly provisional');
  assert.match(summary,/No source URL provided/i,
    device.name+' unlinked specifications should produce a provisional match and clearly note absent evidence');
  await checkNoErrors(page,errors,device.name+' Listening Builder');
  // Normal, not-owned passive pairs also show the headroom handoff;
  // missing published ratings must never turn into fictional wattage.
  await visit(page,'/system-builder/');
  await page.locator('#sb-build-intent').selectOption('complete_system');
  await page.locator('[name="architecture"]').selectOption('passive_separates');
  await page.locator('#sb-form button[type="submit"]').click();
  await page.waitForFunction(()=>!document.querySelector('#sb-results')?.hidden,null,{timeout:20000});
  // The button lands on the FIRST recommendation, not just the section heading.
  // Keep every other editorial setup behind one closed disclosure.
  const firstRecommendation=page.locator('#sb-first-recommendation');
  assert.equal(await firstRecommendation.count(),1,device.name+' must render one primary card');
  assert.equal(await firstRecommendation.evaluate(node=>document.activeElement===node),true,
    device.name+' submit should focus first recommendation');
  const firstTop=await firstRecommendation.evaluate(node=>node.getBoundingClientRect().top);
  assert.ok(firstTop>=-3&&firstTop<125,device.name+' first recommendation must be at viewport top, saw '+firstTop);

  // Regression for a delayed scroll jump: the auto-result inside the iframe
  // loads AFTER the Builder positions the primary recommendation. It must not
  // focus its own output and drag the parent viewport down to headroom.
  await page.waitForFunction(()=>{
    const frame=document.querySelector('#sb-first-recommendation iframe.sb-inline-system-check-frame');
    return frame?.contentDocument?.readyState==='complete' &&
      frame.contentDocument.body.classList.contains('sc-auto-result');
  },null,{timeout:20000});
  await page.waitForTimeout(180);
  const afterHeadroomLoad=await firstRecommendation.evaluate(node=>({
    top:node.getBoundingClientRect().top,
    focused:document.activeElement===node,
    childFocused:!!node.querySelector('iframe')&&
      document.activeElement===node.querySelector('iframe')
  }));
  assert.ok(afterHeadroomLoad.top>=-3&&afterHeadroomLoad.top<125,
    device.name+' iframe must NOT jump to headroom after it loads, top '+afterHeadroomLoad.top);
  assert.equal(afterHeadroomLoad.focused,true,
    device.name+' iframe must not take focus away from the primary recommendation');
  assert.equal(afterHeadroomLoad.childFocused,false);

  assert.equal(await page.locator('#sb-results .sb-recommend:visible').count(),1,
    device.name+' must not show multiple setups by default');
  const alternatives=page.locator('#sb-results .sb-alternative-setups');
  assert.equal(await alternatives.count(),1);
  assert.equal(await alternatives.evaluate(node=>node.open),false,
    device.name+' alternate setups must start closed');
  assert.match(await alternatives.locator('summary').first().innerText(),/Alternative setups/);
  assert.ok(await alternatives.locator('.sb-recommend').count()>=1,
    device.name+' collapsed setup must retain another recommendation');
  await alternatives.locator('summary').first().click();
  assert.ok(await page.locator('#sb-results .sb-recommend:visible').count()>1,
    device.name+' alternatives should expand when requested');
  outcomes.push(device.name+' jumps to primary card, hides all other setups under one dropdown');
  const availablePanels=page.locator('#sb-results .sb-inline-system-check');
  assert.ok(await availablePanels.count()>=1,device.name+' source-backed passive examples must have a headroom handoff');
  assert.match(await availablePanels.first().innerText(),/Headroom for these exact models/);
  await checkNoErrors(page,errors,device.name+' normal passive recommendation headroom');
  outcomes.push(device.name+' non-owned passive recommendations now expose the exact-model headroom link');

  assert.equal(workerRequests,0,device.name+' smoke attempted live Worker API');
  outcomes.push(device.name+' Listening Builder unlisted specification pathway');
  await context.close();
 }
 // Check both narrow-phone and tablet widths, including reading and lab pages.
 for (const width of [320,768]) {
   const context=await browser.newContext({viewport:{width,height:840},isMobile:width===320,hasTouch:width===320});
   await context.route('**/*.workers.dev/**',route=>route.abort('blockedbyclient'));
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   for (const path of ['/','/decoder/','/decoder/sound-basics/','/decoder/speaker-frequency-response/',
     '/decoder/speaker-dispersion/','/decoder/amplifier-power/','/system-builder/','/system-check/',
     '/labs/','/lab/','/lab/mastering/','/labs/formats/']) {
     await visit(page,path);
     await checkNoErrors(page,errors,width+'px '+path);
   }
   outcomes.push(width+'px lesson, tool and lab horizontal-overflow audit');
   await context.close();
 }
 console.log('RELEASE_BROWSER_PREFLIGHT_OK '+outcomes.join(' | '));
}finally{
 await browser.close();
}
