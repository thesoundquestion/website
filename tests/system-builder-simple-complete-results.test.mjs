import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shortlistExamples} from '../system-builder/recommendations.mjs';
import {soundImpressionFor} from '../system-builder/tonal-impressions.mjs';
import {explainSimpleSystem} from '../system-builder/simple-system-summary.mjs';

const read=relative=>readFileSync(new URL(relative,import.meta.url),'utf8');
const catalog=JSON.parse(read('../equipment/catalog.generated.json'));
const app=read('../system-builder/app.mjs');
const styles=read('../system-builder/compact-preview.css');
const base={buildIntent:'complete_system',architecture:'open',useCase:'bedroom',
  goal:'imaging',region:'CA',currency:'CAD',level:'quiet',connection:'analog',
  power:'mains',budget:null,budgetStrict:false,used:true,
  distanceFt:6,referenceDate:'2026-11-20',subMode:'no_sub'};

test('beginner bedroom imaging path shows JBL with its actual reason and listening source',()=>{
 const choices=shortlistExamples(base,catalog).selected;
 assert.equal(choices[0].id,'studio-jbl');
 const view=explainSimpleSystem(choices[0],base,true);
 assert.match(view.title,/JBL 305P MkII/);
 assert.match(view.why,/bedroom|6 ft/);
 assert.match(view.why,/imaging and spaciousness/);
 assert.match(view.why,/left\/right stereo setup/i);
 assert.match(view.connection,/both powered monitors/);
 assert.deepEqual(view.parts[0],'2 × JBL 305P MkII active monitor');
 const sound=soundImpressionFor(choices[0]);
 assert.ok(sound);
 assert.match(sound.text,/stereo image|bass/i);
 assert.ok(sound.sources.some(s=>s.url.startsWith('https://')));
});
test('other approaches have their own sourced sound, not a head-to-head or fallback',()=>{
 const choices=shortlistExamples(base,catalog).selected;
 const alternatives=choices.slice(1).filter(i=>soundImpressionFor(i)?.sources?.length).slice(0,3);
 assert.ok(alternatives.some(i=>i.id==='powered-ora'));
 assert.ok(alternatives.some(i=>i.id==='passive-as301-p5'));
 for(const option of alternatives){
   const impression=soundImpressionFor(option);
   assert.ok(impression?.text&&impression.sources.length);
   const summary=explainSimpleSystem(option,base,false);
   assert.ok(summary.why.length>40);
   assert.ok(summary.parts.length>=1);
   assert.doesNotMatch(summary.why,/A possible setup|could suit what you want|No clear tonal direction/);
 }
});
test('default balanced bedroom listening has a fully documented amplifier/speaker example first',()=>{
 const req={...base,goal:'all_rounder'};
 const first=shortlistExamples(req,catalog).selected[0];
 assert.equal(first.id,'passive-as301-p5');
 assert.equal(first.headroomData.status,'calculable');
 assert.ok(soundImpressionFor(first)?.sources.length);
});
test('the introductory view has no yellow conditional badges, empty step lists or deep audit tree',()=>{
 const start=app.indexOf("if(request.buildIntent==='complete_system'&&!anyOwned&&bassMode==='no_sub')");
 const finish=app.indexOf('const combinedFactors=explainInputInteractions(request)',start);
 assert.ok(start>0&&finish>start);
 const simple=app.slice(start,finish);
 assert.match(simple,/soundImpressionFor\(item\)/);
 assert.match(simple,/data.why/);
 assert.match(simple,/data.connection/);
 assert.match(simple,/sb-simple-sound/);
 assert.match(simple,/sb-simple-alternatives/);
 assert.match(simple,/return;/);
 assert.doesNotMatch(simple,/renderCard\(|sb-beginner-status|renderSetupWorkflow\(|sb-audit|sb-headroom-verdict/);
});
test('powered JBL should never open passive amplifier headroom with only a distance',()=>{
 const start=app.indexOf('const renderSimpleCard=(item,top)=>');
 const finish=app.indexOf('panel.append(renderSimpleCard',start);
 const simple=app.slice(start,finish);
 assert.match(simple,/if\(item.architecture==='passive_separates'\)/);
 assert.match(simple,/if\(amplifier&&speakers\)/);
 assert.match(simple,/Check this exact system in System Check/);
 assert.doesNotMatch(simple,/Open System Check\x27/);
});
test('the full site shows a compact layout with alternative listening impressions',()=>{
 assert.match(styles,/BEGIN SIMPLE SYSTEM EXPERIENCE/);
 assert.match(styles,/sb-simple-match-layout/);
 assert.match(styles,/grid-template-columns:minmax\(0,1\.08fr\) minmax\(0,\.92fr\)/);
 assert.match(styles,/@media\(max-width:930px\)/);
});
