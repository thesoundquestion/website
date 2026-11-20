import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {explainSetupWorkflow} from '../system-builder/setup-workflow.mjs';
import {explainBeginnerOption} from '../system-builder/beginner-output.mjs';
import {EXAMPLES} from '../system-builder/recommendations.mjs';
import {STEREO_SUB_EXAMPLES} from '../system-builder/stereo-subwoofer-examples.mjs';
const joined=flow=>[...flow.steps,flow.equipment].join(' ');
const example=arch=>EXAMPLES.find(x=>x.architecture===arch);

test('every recommendation architecture has at least two concrete steps',()=>{
 for(const arch of ['passive_separates','consumer_powered_pair','active_studio','headphone_first','party_pa']){
  const item=example(arch);
  assert.ok(item,arch);
  const flow=explainSetupWorkflow(item,{connection:'undecided',subMode:'no_sub'});
  assert.equal(flow.architecture,arch);
  assert.ok(flow.steps.length>=2,arch);
  assert.ok(flow.steps.every(s=>s.length>=25),arch);
  assert.ok(flow.equipment.length>=35,arch);
  assert.deepEqual(explainBeginnerOption(item,{subMode:'no_sub'}).setupWorkflow,flow);
 }
});
test('passive stereo connects source, model-specific amplifier and speakers with speaker wire',()=>{
 const text=joined(explainSetupWorkflow(example('passive_separates'),{connection:'optical',subMode:'no_sub'}));
 assert.match(text,/Yamaha A-S301/); assert.match(text,/PSB Alpha P5/);
 assert.match(text,/speaker wire/); assert.match(text,/optical digital input/);
});
test('powered speakers contain amplification and do not need an external amp',()=>{
 const text=joined(explainSetupWorkflow(example('consumer_powered_pair'),{connection:'analog',subMode:'no_sub'}));
 assert.match(text,/built-in amplification/);
 assert.match(text,/No separate power amplifier/);
 assert.doesNotMatch(text,/amplified left and right signals over speaker wire/);
});
test('studio monitors need two powered cabinets and volume control',()=>{
 const text=joined(explainSetupWorkflow(example('active_studio'),{subMode:'no_sub'}));
 assert.match(text,/line-level output and volume controller/);
 assert.match(text,/each cabinet/);assert.match(text,/Two monitor cabinets/);
 assert.match(text,/do not attach amplifier speaker terminals/);
});
test('headphones need headphone output, not a DAC line output',()=>{
 const text=joined(explainSetupWorkflow(example('headphone_first'),{subMode:'no_sub'}));
 assert.match(text,/headphone output/);
 assert.match(text,/RCA or other line output is not automatically suitable/);
 assert.match(text,/headphone amplifier may be needed/);
 assert.doesNotMatch(text,/speaker wire/);
});
test('single powered PA speaker does not pretend to provide stereo or audience coverage',()=>{
 const text=joined(explainSetupWorkflow(EXAMPLES.find(x=>x.id==='party-soundboks'),{subMode:'no_sub'}));
 assert.match(text,/SOUNDBOKS/); assert.match(text,/built-in amplification/);
 assert.match(text,/one powered speaker/);assert.match(text,/Stereo playback and broader audience coverage/);
});
test('owned component names are used in the setup instructions',()=>{
 const item={architecture:'passive_separates',amplifierModel:'Yamaha A-S501',speakerModel:'Paradigm Titan v1',
  parts:[{name:'Paradigm Titan v1',role:'Already owned passive stereo pair'},
    {name:'Yamaha A-S501',role:'Only new amplifier candidate'},
    {name:'Creative X-Fi Titanium HD',role:'Already owned source'}]};
 const text=joined(explainSetupWorkflow(item,{connection:'analog',subMode:'no_sub'}));
 for(const name of ['Paradigm Titan v1','Yamaha A-S501','Creative X-Fi Titanium HD'])assert.ok(text.includes(name));
});
test('source mismatch warns about conversion rather than promising direct wiring',()=>{
 const item={architecture:'passive_separates',sourceConnectionStatus:'extra_hardware_or_alternate_output',
  parts:[{name:'Digital DAC',role:'Already owned source'},
    {name:'Analogue receiver',role:'Already owned amplifier'},
    {name:'Passive speakers',role:'Stereo passive speakers'}]};
 const text=joined(explainSetupWorkflow(item,{}));
 assert.match(text,/converter or a different output may be needed/);
 assert.match(text,/cable alone does not convert digital to analogue/);
});
test('2.1 examples include their own documented subwoofer setup details',()=>{
 const sub=STEREO_SUB_EXAMPLES.find(x=>x.id==='stereo-sub-ora');
 assert.ok(sub);
 const text=joined(explainSetupWorkflow(sub,{subMode:'plan_sub',connection:'usb'}));
 assert.match(text,/powered subwoofer/);
 assert.match(text,/bass filtering depends on the documented system settings/);
 assert.match(text,/USB audio input/);
});
test('a requested but not yet selected subwoofer connection stays conditional',()=>{
 const text=joined(explainSetupWorkflow(example('passive_separates'),{subMode:'plan_sub'}));
 assert.match(text,/supported speaker-level path/);
 assert.match(text,/does not automatically remove bass/);
});
test('equipment retained for another route does not claim a complete connected system',()=>{
 const item={id:'owned-other-route',architecture:'unknown',parts:[
  {name:'Vintage receiver',role:'Already owned'},{name:'Headphones',role:'Already owned'}]};
 const text=joined(explainSetupWorkflow(item,{}));
 assert.match(text,/may be retained for separate use/);
 assert.match(text,/does not establish a complete connected audio path/);
});
test('all cards and both subwoofer output paths render the visible setup section',()=>{
 const app=readFileSync(new URL('../system-builder/app.mjs',import.meta.url),'utf8');
 const css=readFileSync(new URL('../system-builder/style.css',import.meta.url),'utf8');
 assert.match(app,/addText\(panel,'h5','How will this setup work\?'\)/);
 assert.match(app,/renderSetupWorkflow\(card,overview\.setupWorkflow\)/);
 assert.match(app,/renderSetupWorkflow\(box,/);
 assert.match(app,/renderSetupWorkflow\(panel,/);
 assert.match(css,/\.sb-setup-steps li/);
});
