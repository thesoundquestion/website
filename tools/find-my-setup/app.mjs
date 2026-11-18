import {GOALS,GROUPS,buildPath} from './engine.mjs';
const $=id=>document.getElementById(id);
const picker=$('goal-picker'),form=$('goal-questions'),questions=$('goal-fields'),result=$('goal-result'),notice=$('goal-status'),current=$('current-goal'),submit=$('goal-submit');
const params=new URLSearchParams(location.search);
$('goal-after').hidden=true;
const byId=new Map(GOALS.map(g=>[g.id,g]));
let selected='';
const el=(name,className,text)=>{const n=document.createElement(name);if(className)n.className=className;if(text)n.textContent=text;return n};
const add=(parent,tag,className,text)=>{const n=el(tag,className,text);parent.append(n);return n};
function makeLink(to,label,cls=''){
 const a=el('a',cls,label);a.href=to;return a;
}
function showGoal(id,options={}){
 const goal=byId.get(id);if(!goal)return;
 selected=id;
 for(const b of picker.querySelectorAll('button[data-goal]')){
  const active=b.dataset.goal===id;
  b.setAttribute('aria-pressed',String(active));
 }
 current.textContent='Your goal: '+goal.title;
 form.hidden=false;
 result.hidden=true;
 result.replaceChildren();
 notice.textContent='';
 questions.replaceChildren();
 for(const q of goal.questions){
  const fs=el('fieldset','goal-fieldset'),legend=add(fs,'legend','',''+q.prompt);
  legend.id='goal-question-'+q.id;
  const group=add(fs,'div','goal-answer-grid');
  for(const o of q.options){
   const label=el('label','goal-answer');
   const input=el('input');input.type='radio';input.name=q.id;input.value=o.value;input.required=true;
   const text=el('span','',o.label);label.append(input,text);group.append(label);
  }
  questions.append(fs);
 }
 const p=add(questions,'p','goal-question-note','These answers stay in this browser. We do not collect or submit them.');
 submit.disabled=false;
 if(options.scroll)form.scrollIntoView({block:'start',behavior:'auto'});
 if(options.focus)questions.querySelector('input')?.focus({preventScroll:true});
}
for(const groupName of GROUPS){
 const list=GOALS.filter(g=>g.group===groupName);if(!list.length)continue;
 const sec=el('section','goal-picker-section');
 const h=add(sec,'h3','',groupName);h.id='goal-group-'+groupName.toLowerCase();
 const grid=el('div','goal-picker-grid');grid.setAttribute('aria-labelledby',h.id);
 for(const g of list){
  const btn=el('button','goal-picker-card');btn.type='button';btn.dataset.goal=g.id;btn.setAttribute('aria-pressed','false');
  add(btn,'strong','',g.title);add(btn,'span','',g.short);
  btn.addEventListener('click',()=>showGoal(g.id,{scroll:true,focus:true}));
  grid.append(btn);
 }
 sec.append(grid);picker.append(sec);
}
function detail(parent,header,items,cls){
 if(!items?.length)return;
 const box=add(parent,'section',cls||'goal-detail');add(box,'h3','',header);const ul=add(box,'ul','');
 for(const item of items)add(ul,'li','',item);
}
function render(plan){
 result.replaceChildren();
 const intro=add(result,'div','goal-result-intro');
 add(intro,'p','section-kicker','YOUR PATH / EQUIPMENT FIRST');
 add(intro,'h2','',plan.title);
 add(intro,'p','goal-result-summary',plan.description);
 const sig=add(result,'section','goal-signal');add(sig,'h3','','A sensible starting setup');
 const chain=add(sig,'ol','goal-chain');
 for(const [i,item] of plan.steps.entries()){
  const li=add(chain,'li','goal-stage');
  add(li,'span','goal-stage-count',String(i+1).padStart(2,'0'));
  const body=add(li,'div','');add(body,'strong','',item.name);add(body,'p','',item.why);
 }
 detail(result,'You may want to add',plan.optional,'goal-detail');
 detail(result,'You may not need',plan.skip,'goal-detail');
 detail(result,'Check before buying',plan.verify,'goal-detail');
 if(plan.alternative){const box=add(result,'section','goal-alternative');add(box,'h3','','Another valid approach');add(box,'p','',plan.alternative)}
 const learn=add(result,'section','goal-learning');
 add(learn,'h3','','Learn exactly what matters to this goal');
 const ul=add(learn,'ul','goal-resource-grid');
 for(const item of plan.learn){
  const li=add(ul,'li','');
  const a=makeLink(item.href,item.label);
  const p=add(li,'p','',item.why);
  li.prepend(a);
 }
 if(plan.next==='builder'){
  const row=add(result,'section','goal-builder-handoff');
  add(row,'h3','','Ready to explore a listening setup?');
  add(row,'p','','System Builder handles supported home listening paths. These guide answers are not silently entered into it; review your actual gear and choices there.');
  row.append(makeLink('/system-builder/','Continue to System Builder →','button button-primary'));
  row.append(makeLink('/system-check/','Or check amp and speaker headroom →','goal-secondary-link'));
 }
 const end=add(result,'p','goal-result-foot','Equipment types are educational starting points, not verified compatibility or product recommendations. We do not calculate prices or send your choices to a server.');
 result.hidden=false;
 $('goal-after').hidden=false;
 result.scrollIntoView({block:'start',behavior:'auto'});
 const title=result.querySelector('h2');title.tabIndex=-1;title.focus({preventScroll:true});
}
form.addEventListener('submit',event=>{
 event.preventDefault();
 const answers={};
 const g=byId.get(selected);if(!g)return;
 for(const q of g.questions){
  const answer=form.querySelector('input[name="'+q.id+'"]:checked');
  if(!answer){notice.textContent='Please choose an answer for: '+q.prompt;form.querySelector('input[name="'+q.id+'"]')?.focus();return;}
  answers[q.id]=answer.value;
 }
 try{render(buildPath(selected,answers));notice.textContent='Your suggested path is below.';}catch(e){notice.textContent='Could not build that path. Please review your choices.';}
});
$('goal-edit').addEventListener('click',()=>{form.hidden=false;result.hidden=true;$('goal-after').hidden=true;form.scrollIntoView({block:'start',behavior:'auto'});form.querySelector('input')?.focus({preventScroll:true})});
$('goal-reset').addEventListener('click',()=>{form.hidden=true;result.hidden=true;result.replaceChildren();$('goal-after').hidden=true;selected='';current.textContent='';notice.textContent='';for(const b of picker.querySelectorAll('button[data-goal]'))b.setAttribute('aria-pressed','false');picker.scrollIntoView({block:'start',behavior:'auto'});picker.querySelector('button')?.focus({preventScroll:true})});
const initial=params.get('goal');if(initial && byId.has(initial))showGoal(initial,{scroll:false,focus:false});
