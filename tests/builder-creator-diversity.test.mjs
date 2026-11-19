import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {catalogHeadphoneExamples} from '../system-builder/headphone-options.mjs';
import {shortlistExamples} from '../system-builder/recommendations.mjs';
import {buildCreatingSystem} from '../system-builder/creating/build-recommendations.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const catalog=JSON.parse(read('equipment/catalog.generated.json'));
const stage=(plan,key)=>plan.stages.find(x=>x.key===key);
const get=model=>catalog.records.find(x=>x.model===model);

test('Listening Builder uses multiple actual shared-catalogue headphone styles, rather than two fixed Sennheisers',()=>{
 const request={architecture:'headphone_first',goal:'all_rounder',region:'CA',currency:'CAD',
   useCase:'desk',headphoneUse:'quiet',headphoneFit:'any'};
 const options=catalogHeadphoneExamples(catalog,request);
 assert.equal(options.length,5);
 assert.equal(new Set(options.map(x=>x.catalogId)).size,5);
 assert.ok(options.some(x=>x.kind.startsWith('Open')));
 assert.ok(options.some(x=>x.kind.startsWith('Closed')));
 assert.ok(options.some(x=>x.kind.startsWith('In-ear')));
 const plan=shortlistExamples(request,catalog);
 assert.equal(plan.selected.length,3);
 assert.ok(plan.selected.every(x=>catalog.records.some(r=>r.id===x.catalogId)));
 assert.equal(new Set(plan.selected.map(x=>x.kind)).size,3,'first three cards need genuinely different styles');
 assert.ok(plan.selected.every(x=>x.headphoneRationale.includes('not a measured claim')));
});
test('User-selected headphone fit remains a hard constraint, and noisy/shared defaults exclude open-back',()=>{
 for(const fit of ['open','closed','iem']){
  const c=shortlistExamples({architecture:'headphone_first',headphoneFit:fit,headphoneUse:'quiet'},catalog).selected;
  assert.ok(c.length>=2,fit+' has insufficient examples');
  assert.ok(c.every(x=>x.kind.toLowerCase().includes(fit==='iem'?'in-ear':fit==='open'?'open':'closed')),fit+' included an unsuitable style');
 }
 for(const use of ['shared','tracking','portable']){
  const c=shortlistExamples({architecture:'headphone_first',headphoneFit:'any',headphoneUse:use},catalog).selected;
  assert.ok(c.length>=2);
  assert.ok(c.every(x=>!x.kind.startsWith('Open')),use+' unexpectedly recommends a leaky open design');
 }
});
test('Budget and creator expansion includes XLR dynamics, condensers, hybrid USB, lavalier and camera inputs',()=>{
 assert.equal(catalog.records.length,192);
 assert.equal(catalog.records.filter(r=>r.categories.includes('microphone')).length,17);
 assert.equal(catalog.records.filter(r=>r.categories.includes('audio_interface')).length,12);
 for(const name of ['Behringer XM8500','Behringer C-1','AKG P120',
   'FIFINE AmpliGame AM8 (USB/XLR)','MAONO PD200X (USB/XLR)',
   'RØDE smartLav+','RØDE VideoMicro II','Elgato Wave:3 MK.2']){
  const mic=get(name);assert.ok(mic,name+' missing');
  assert.ok(mic.evidence.some(x=>/^https:\/\//.test(x.url)),name+' manufacturer evidence missing');
  assert.equal(mic.pricing.currentPrice,null);
 }
 for(const [model,micInputs,computerTracks] of [
   ['PreSonus AudioBox GO',1,2],['Arturia MiniFuse 1 (original)',1,1],
   ['M-Audio M-Track Duo',2,2],['Behringer U-PHORIA UMC404HD',4,4],
   ['Behringer U-PHORIA UMC22',1,2],['Elgato Wave XLR MK.2',1,1]]){
  const r=get(model);assert.ok(r,model+' missing');
  assert.equal(r.facts.micPreampCount.value,micInputs);
  assert.equal(r.facts.computerRecordingInputs.value,computerTracks);
  assert.equal(r.pricing.currentPrice,null);
 }
});
test('Creating Builder avoids recommending an XLR interface for USB, powered camera and TRRS phone microphones',()=>{
 for(const [route,expectedName] of [
   ['camera_trs','RØDE VideoMicro II'],['phone_trrs','RØDE smartLav+']
 ]){
  const plan=buildCreatingSystem(catalog,{mode:'stream',micConnection:route,microphoneCount:1});
  assert.equal(stage(plan,'mic').pick.model,expectedName);
  assert.equal(stage(plan,'capture').need,'verify');
  assert.match(stage(plan,'capture').detail,/microphone input|TRRS/i);
  assert.ok(!stage(plan,'capture').pick);
 }
 const usb=buildCreatingSystem(catalog,{mode:'stream',micConnection:'usb'});
 const mic=catalog.records.find(r=>r.id===stage(usb,'mic').pick.id);
 assert.ok(mic?.connections.outputs.some(x=>x.type.includes('usb')));
 assert.equal(stage(usb,'capture').need,'included');
 assert.ok(!usb.purchased.some(x=>x.key==='capture'));
 const multi=buildCreatingSystem(catalog,{mode:'podcast',microphoneCount:2,micConnection:'usb',independentTracks:true});
 assert.equal(multi.settings.route,'xlr');
 assert.ok(multi.messages.some(x=>x.includes('Several')||x.includes('several')));
});
test('Two- and four-mic recording interfaces are not confused with one-preamp devices or stereo-only USB mixers',()=>{
 const two=buildCreatingSystem(catalog,{mode:'podcast',microphoneCount:2,independentTracks:true});
 assert.ok(get(stage(two,'capture').pick.model)?.facts.micPreampCount.value>=2);
 assert.ok(!/Yamaha MG10XU|Behringer XENYX/.test(stage(two,'capture').pick.model));
 const four=buildCreatingSystem(catalog,{mode:'band',microphoneCount:4,independentTracks:true});
 assert.ok(get(stage(four,'capture').pick.model)?.facts.micPreampCount.value>=4);
 assert.ok(four.stages.every(x=>x.need!=='included'||x.key!=='capture'));
});
