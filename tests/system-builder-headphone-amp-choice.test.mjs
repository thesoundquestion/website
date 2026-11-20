import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {headphoneAmplifierPlan,applyHeadphoneAmpChoice} from '../system-builder/headphone-amp-choice.mjs';
import {explainSetupWorkflow} from '../system-builder/setup-workflow.mjs';
import {explainBeginnerOption} from '../system-builder/beginner-output.mjs';
import {validateBuilderIntent,scopedBuilderInputs,builderFieldRequirement} from '../system-builder/intent-routing.mjs';
const catalog=JSON.parse(readFileSync(new URL('../equipment/catalog.generated.json',import.meta.url),'utf8'));
const item={id:'hp-test',architecture:'headphone_first',title:'Wired IEM',kind:'Wired headphone',
  parts:[{name:'Example IEMs',count:1,role:'Wired IEMs'}],why:'Fit to compare',
  tradeoff:'Check fit and seal',goals:['all_rounder'],places:['desk'],connections:['analog'],editorialGoalFocus:true,extra:[]};
const base={architecture:'headphone_first',headphoneAmpChoice:'yes',headphoneSource:'computer_usb',subMode:'no_sub'};
function run(request,source=catalog){
 const plan=headphoneAmplifierPlan(request,source);
 const result=applyHeadphoneAmpChoice({selected:[item],excluded:[]},request,source);
 const candidate=result.selected[0];
 const workflow=explainSetupWorkflow(candidate,request);
 const beginner=explainBeginnerOption(candidate,request);
 return {plan,candidate,workflow,beginner,text:[plan?.summary,...workflow.steps,workflow.equipment].join(' ')};
}
test('USB-computer yes includes documented FiiO DAC/amp in equipment and actual signal flow',()=>{
 const r=run(base);
 assert.equal(r.plan.model,'FiiO K11 (RCA line out)');
 assert.equal(r.plan.input,'usb');
 assert.ok(r.candidate.parts.some(x=>x.name.includes('FiiO K11')&&x.url.startsWith('https://')));
 assert.match(r.text,/USB digital audio/);
 assert.match(r.text,/headphone socket/);
 assert.match(r.beginner.matchingEvidence,/not proof of the required voltage/);
 assert.match(r.beginner.costAndTradeoffs.join(' '),/headphone subtotal excludes it/);
});
test('USB phone yes uses Q11; RCA line source uses analogue-only Atom Amp 2',()=>{
 const phone=run({...base,headphoneSource:'phone_usb'});
 assert.equal(phone.plan.model,'FiiO Q11');assert.equal(phone.plan.hasDac,true);
 const rca=run({...base,headphoneSource:'analog_line'});
 assert.equal(rca.plan.model,'JDS Labs Atom Amp 2');assert.equal(rca.plan.hasDac,false);
 assert.match(rca.text,/stereo RCA line output/);
 assert.match(rca.text,/analogue RCA input/);
 assert.doesNotMatch(rca.text,/USB digital audio to JDS Labs/);
});
test('headphone jack or unknown source does not generate an invented complete amp pairing',()=>{
 for(const source of ['unknown','headphone_jack','receiver_headphones']){
  const r=run({...base,headphoneSource:source});
  assert.equal(r.plan.model,null);assert.equal(r.candidate.parts.length,1);
  assert.match(r.text,/No amplifier model can be responsibly matched/);
 }
});
test('no external amplifier keeps headphone-only parts and flags analogue line-only limitations',()=>{
 const r=run({...base,headphoneAmpChoice:'no',headphoneSource:'analog_line'});
 assert.equal(r.candidate.parts.length,1);
 assert.match(r.text,/RCA line output alone cannot drive headphones/);
 assert.match(r.text,/No separate headphone amplifier is included/);
});
test('unsure provides source-aware drive and hiss guidance without adding an amp',()=>{
 const r=run({...base,headphoneAmpChoice:'unsure',headphoneSource:'receiver_headphones'});
 assert.equal(r.candidate.parts.length,1);
 assert.match(r.text,/not automatically needed/);
 assert.match(r.text,/hiss and low-volume channel balance/);
});
test('missing manufacturer-backed product cannot become named amp match',()=>{
 const r=run(base,{records:[]});
 assert.equal(r.plan.model,null);
 assert.equal(r.candidate.parts.length,1);
 assert.match(r.text,/No specific model/);
});
test('headphone amp preference is required only on headphone architecture',()=>{
 const f=new FormData();f.set('architecture','headphone_first');
 assert.equal(validateBuilderIntent('headphones',f).ok,false);
 f.set('headphoneAmpChoice','unsure');
 assert.equal(validateBuilderIntent('headphones',f).ok,true);
 assert.equal(validateBuilderIntent('complete_system',f).ok,true);
 assert.equal(builderFieldRequirement('headphones','headphoneAmpChoice'),'required');
 f.set('architecture','passive_separates');f.set('headphoneAmpChoice','');
 assert.equal(validateBuilderIntent('complete_system',f).ok,true);
});
test('moving from headphone-first to speaker choices removes stale amp purchase decision',()=>{
 const f=new FormData();f.set('architecture','headphone_first');
 f.set('headphoneAmpChoice','yes');f.set('headphoneSource','computer_usb');
 const hp=scopedBuilderInputs(f,'headphones',false);
 assert.equal(hp.get('headphoneAmpChoice'),'yes');
 assert.equal(hp.get('architecture'),'headphone_first');
 f.set('architecture','passive_separates');
 const speaker=scopedBuilderInputs(f,'complete_system',false);
 assert.equal(speaker.get('headphoneAmpChoice'),'');
 assert.equal(speaker.get('headphoneSource'),'unknown');
});
test('task-level UI and real request wire amplifier preferences into shortlist and workflow',()=>{
 const html=readFileSync(new URL('../system-builder/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 assert.match(html,/name="headphoneAmpChoice"/);
 assert.match(html,/value="unsure">Not sure/);
 assert.match(html,/id="sb-headphone-amp-setup"/);
 assert.match(app,/headphoneAmpChoice:String\(data\.get\('headphoneAmpChoice'\)/);
 assert.match(app,/applyHeadphoneAmpChoice\(initialShortlist,request,sharedCatalog\)/);
 assert.match(app,/headphoneAmpSetup\.hidden=!active/);
});
