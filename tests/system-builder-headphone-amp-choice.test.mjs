import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {headphoneAmplifierPlan,applyHeadphoneAmpChoice} from '../system-builder/headphone-amp-choice.mjs';
import {explainSetupWorkflow} from '../system-builder/setup-workflow.mjs';
import {explainBeginnerOption} from '../system-builder/beginner-output.mjs';
import {validateBuilderIntent,scopedBuilderInputs,builderFieldRequirement} from '../system-builder/intent-routing.mjs';
const catalog=JSON.parse(readFileSync(new URL('../equipment/catalog.generated.json',import.meta.url),'utf8'));
const headphone={id:'headphone-fixture',architecture:'headphone_first',title:'Wired IEMs',kind:'Wired IEMs',
 parts:[{name:'Example IEMs',count:1,role:'Wired IEMs'}],why:'Compare seal and comfort',
 tradeoff:'Fit and seal need checking',goals:['all_rounder'],places:['desk'],connections:['analog'],
 editorialGoalFocus:true,extra:[]};
const base={architecture:'headphone_first',headphoneAmpChoice:'yes',headphoneDacChoice:'combo',
 headphoneSource:'computer_usb',subMode:'no_sub'};
function run(request,source=catalog){
 const plan=headphoneAmplifierPlan(request,source);
 const item=applyHeadphoneAmpChoice({selected:[headphone],excluded:[]},request,source).selected[0];
 const flow=explainSetupWorkflow(item,request);
 const beginner=explainBeginnerOption(item,request);
 const copy=[plan?.summary,...flow.steps,flow.equipment].join(' ');
 return {plan,item,flow,beginner,copy};
}
test('USB computer with combined DAC/amp offers published K11 and visible alternatives',()=>{
 const r=run(base);
 assert.equal(r.plan.configuration,'combo');
 assert.equal(r.plan.model,'FiiO K11');
 assert.deepEqual(r.plan.components.map(c=>c.model),['FiiO K11']);
 assert.ok(r.plan.alternatives.some(c=>c.model==='FiiO Q11'));
 assert.ok(r.item.parts.some(p=>p.name==='FiiO K11'&&p.url.startsWith('https://')));
 assert.match(r.copy,/USB digital audio/);
 assert.match(r.copy,/headphone socket/);
 assert.match(r.beginner.matchingEvidence,/manufacturer-linked connection documentation/);
 assert.match(r.beginner.costAndTradeoffs.join(' '),/headphone subtotal excludes them/);
});
test('portable phone USB combo picks documented Q11 without assuming desktop K11 power',()=>{
 const r=run({...base,headphoneSource:'phone_usb'});
 assert.deepEqual(r.plan.components.map(c=>c.model),['FiiO Q11']);
 assert.equal(r.plan.alternatives.length,0);
 assert.match(r.copy,/USB cable or adapter|USB digital audio/);
});
test('analogue RCA with amp only offers JDS and other documented amps, no DAC',()=>{
 const r=run({...base,headphoneSource:'analog_line',headphoneDacChoice:'none'});
 assert.equal(r.plan.configuration,'amp');
 assert.equal(r.plan.model,'JDS Labs Atom Amp 2');
 assert.equal(r.plan.hasDac,false);
 assert.ok(r.plan.alternatives.some(c=>c.model==='Schiit Magni 6'));
 assert.ok(r.plan.alternatives.some(c=>c.model==='Topping L30 II'));
 assert.match(r.copy,/stereo RCA line output/);
 assert.match(r.copy,/NOT a DAC/);
 assert.doesNotMatch(r.copy,/USB digital audio to JDS/);
});
test('requesting an analogue-only amplifier for USB does not pretend it has USB input',()=>{
 const r=run({...base,headphoneDacChoice:'none'});
 assert.equal(r.plan.components.length,0);
 assert.equal(r.item.parts.length,1);
 assert.match(r.copy,/USB digital audio must be converted by a DAC first/);
 assert.match(r.copy,/No amplifier model can be responsibly matched/);
});
test('USB computer with separate DAC and amp shows a complete two-box stack',()=>{
 const r=run({...base,headphoneDacChoice:'separate'});
 assert.equal(r.plan.configuration,'stack');
 assert.deepEqual(r.plan.components.map(c=>c.model),['Schiit Modi+','JDS Labs Atom Amp 2']);
 assert.ok(r.plan.alternatives.some(c=>c.model==='SMSL SU-1'));
 assert.deepEqual(r.item.parts.slice(1).map(p=>p.name),['Schiit Modi+','JDS Labs Atom Amp 2']);
 assert.match(r.copy,/RCA outputs of Schiit Modi\+ to the analogue RCA inputs of JDS Labs Atom Amp 2/);
 assert.match(r.copy,/The DAC does not drive the headphones directly/);
 assert.match(r.copy,/headphone-only subtotal/);
});
test('DAC-only USB option is visible yet cannot masquerade as a working headphone output',()=>{
 const r=run({...base,headphoneAmpChoice:'no',headphoneDacChoice:'separate'});
 assert.equal(r.plan.configuration,'dac');
 assert.deepEqual(r.plan.components.map(c=>c.model),['Schiit Modi+']);
 assert.equal(r.item.parts.length,2);
 assert.match(r.copy,/must already have a suitable headphone amplifier|existing suitable headphone amplifier/);
 assert.match(r.copy,/NOT a working wired-headphone setup/);
 assert.match(r.beginner.matchingEvidence,/standalone DAC does not drive headphones/);
});
test('No amplifier, no DAC means no added electronics, but reports source-output limits',()=>{
 const r=run({...base,headphoneAmpChoice:'no',headphoneDacChoice:'none',headphoneSource:'analog_line'});
 assert.equal(r.plan.components.length,0);
 assert.equal(r.item.parts.length,1);
 assert.match(r.copy,/RCA line output cannot drive headphones/);
 assert.match(r.copy,/No separate headphone amplifier is included/);
});
test('unknown headphone output chooses no incompatible hardware and preserves help decide',()=>{
 const r=run({...base,headphoneAmpChoice:'unsure',headphoneDacChoice:'unsure',headphoneSource:'receiver_headphones'});
 assert.equal(r.plan.components.length,0);
 assert.match(r.copy,/dedicated headphone amplifier or DAC may offer no practical improvement/);
 assert.match(r.copy,/existing headphone output/);
});
test('a proposed combo is not substituted into an analogue RCA-only source',()=>{
 const r=run({...base,headphoneSource:'analog_line'});
 assert.equal(r.plan.components.length,0);
 assert.match(r.plan.issue,/RCA line output cannot be fed|RCA line output cannot/);
});
test('standalone DAC from RCA line cannot be recommended without a digital source',()=>{
 const r=run({...base,headphoneAmpChoice:'no',headphoneDacChoice:'separate',headphoneSource:'analog_line'});
 assert.equal(r.plan.components.length,0);
 assert.match(r.plan.issue,/digital signal/);
});
test('no matching manufacturer-linked catalogue entries means no invented product',()=>{
 const r=run(base,{records:[]});
 assert.equal(r.plan.components.length,0);
 assert.equal(r.item.parts.length,1);
 assert.ok(r.plan.issue);
});
test('new DAC question is required on headphones and manual headphone-first route',()=>{
 const form=new FormData();
 form.set('architecture','headphone_first');
 assert.equal(validateBuilderIntent('headphones',form).ok,false);
 form.set('headphoneAmpChoice','yes');
 assert.equal(validateBuilderIntent('headphones',form).ok,false);
 assert.match(validateBuilderIntent('headphones',form).message,/DAC/);
 form.set('headphoneDacChoice','combo');
 assert.equal(validateBuilderIntent('headphones',form).ok,true);
 assert.equal(validateBuilderIntent('complete_system',form).ok,true);
 form.set('headphoneAmpChoice','no');
 assert.equal(validateBuilderIntent('headphones',form).ok,false);
 form.set('headphoneDacChoice','separate');
 assert.equal(validateBuilderIntent('headphones',form).ok,true);
 assert.equal(builderFieldRequirement('headphones','headphoneDacChoice'),'required');
});
test('speaker architecture does not inherit headphone-amp/DAC preference',()=>{
 const form=new FormData();form.set('architecture','headphone_first');
 form.set('headphoneAmpChoice','yes');form.set('headphoneDacChoice','combo');
 form.set('headphoneSource','computer_usb');
 const scoped=scopedBuilderInputs(form,'headphones',false);
 assert.equal(scoped.get('headphoneDacChoice'),'combo');
 form.set('architecture','passive_separates');
 const speaker=scopedBuilderInputs(form,'complete_system',false);
 assert.equal(speaker.get('headphoneAmpChoice'),'');
 assert.equal(speaker.get('headphoneDacChoice'),'');
 assert.equal(speaker.get('headphoneSource'),'unknown');
});
test('headphone DAC and amplifier product cards are visible outside collapsed details',()=>{
 const html=readFileSync(new URL('../system-builder/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 assert.match(html,/id="sb-headphone-dac-choice"/);
 assert.match(html,/Would you also like a DAC/);
 assert.match(html,/value="combo">Yes, one combined DAC/);
 assert.match(app,/headphoneDacChoice:String\(data.get\('headphoneDacChoice'\)/);
 assert.match(app,/applyHeadphoneAmpChoice\(initialShortlist,request,sharedCatalog\)/);
 assert.match(app,/const headphoneElectronicsPlan=arch==='headphone_first'/);
 assert.match(app,/renderHeadphoneElectronics\(headphoneElectronicsPlan\)/);
 assert.match(app,/sb-headphone-electronics-card/);
 assert.match(app,/sb-headphone-card-electronics/);
 assert.match(app,/Other source-compatible electronics to compare/);
});
