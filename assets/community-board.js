/* Moderated, anonymous comments and Curator's Listening Room nominations.
 * No third-party widgets, cookies, tracking, or untrusted HTML insertion.
 * Fetches only when the community section enters the viewport.
 */
(()=>{
'use strict';
const API='https://tsq-abx.thesoundquestion.workers.dev';
const CATEGORIES=[
 ['stars-align','When the Stars Align'],
 ['musical-journeys','Musical Journeys & Builds'],
 ['riffs-and-grooves','Great Riffs, Grooves & Band Interaction'],
 ['dynamics','Dynamics, Emotion & Performance'],
 ['mixing','Mixing & Production Choices'],
 ['atmosphere','Atmosphere & Immersion'],
 ['spatial','Spatial Effects & QSound']
];
const h=(tag,attrs={},label='')=>{
 const e=document.createElement(tag);
 for(const [key,value] of Object.entries(attrs)){
  if(key==='class')e.className=value;else if(key==='text')e.textContent=value;else e.setAttribute(key,String(value));
 }
 if(label)e.textContent=label;
 return e;
};
function field(form,name,label,max,min,type='text'){
 const box=h('label',{class:'community-field'},label);
 const input=h(type==='textarea'?'textarea':'input',{name,required:true,maxlength:max,minlength:min,placeholder:type==='textarea'?'What should listeners pay attention to?':'',...(type==='textarea'?{rows:3}:{type:'text'})});
 box.append(input);
 if(type==='textarea'){
  const count=h('small',{class:'community-counter'},'0 / '+max);
  input.addEventListener('input',()=>count.textContent=input.value.length+' / '+max);
  box.append(count);
 }
 form.append(box);return input;
}
function state(node,message){node.textContent=message}
function makeForm(container,scope,kind,notify,refresh){
 const form=h('form',{class:'community-form','data-community-kind':kind});
 form.append(h('h3',{},kind==='suggestion'?'Suggest one recording':'Join the conversation'));
 form.append(h('p',{class:'community-hint'},kind==='suggestion'
   ?'Help us discover hidden gems: lesser-known artists, unusual arrangements, surprising production choices, overlooked album tracks. One recording per submission. No links or uploaded audio.'
   :scope==='abx'
    ?'What surprised you in the ABX Lab? Share an observation or an idea for a future listening challenge.'
    :'Have a thought about the Listening Room or what makes a recording interesting?'));
 const inputs={};
 if(kind==='suggestion'){
  inputs.artist=field(form,'artist','Artist or performer',64,2);
  inputs.title=field(form,'title','Recording or track title',100,2);
  const box=h('label',{class:'community-field'},'Which Listening Room category fits best?');
  inputs.category=h('select',{name:'category',required:true});
  inputs.category.append(h('option',{value:'',disabled:true,selected:true},'Choose one category'));
  for(const [id,label] of CATEGORIES)inputs.category.append(h('option',{value:id},label));
  box.append(inputs.category);form.append(box);
 }
 inputs.body=field(form,'body',kind==='suggestion'?'What makes this recording worth hearing? (20–280 characters)':'Your comment (5–280 characters)',280,kind==='suggestion'?20:5,'textarea');
 const consentLabel=h('label',{class:'community-consent'});
 inputs.consent=h('input',{type:'checkbox',required:true,name:'consent',value:'yes'});
 consentLabel.append(inputs.consent,document.createTextNode(' I understand this may be published after review, without my name.'));
 form.append(consentLabel);
 const honeypot=h('input',{name:'website',tabindex:'-1',autocomplete:'off','aria-hidden':'true',class:'community-honeypot'});
 form.append(honeypot);
 const button=h('button',{type:'submit',class:'button button-primary',disabled:true},kind==='suggestion'?'Submit one recording':'Submit comment');
 form.append(button);
 const feedback=h('p',{role:'status','aria-live':'polite',class:'community-feedback'});
 form.append(feedback);
 const reviewNote=h('p',{class:'community-review-note'},kind==='suggestion'
   ?'Suggestion not showing up yet? Please be patient. This is a free, independently run site, and submissions are reviewed when we can. No need to send the same recording twice. Check back later!'
   :'Comment not showing up yet? Please be patient. This is a free, independently run site, and comments are approved when we can get to them. No need to resubmit. Check back later, and thanks for joining in!');
 form.append(reviewNote);
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(button.disabled||!form.reportValidity())return;
  const payload={section:scope,kind,consent:inputs.consent.checked,website:honeypot.value,body:inputs.body.value};
  if(kind==='suggestion')Object.assign(payload,{artist:inputs.artist.value,title:inputs.title.value,category:inputs.category.value});
  button.disabled=true;state(feedback,'Saving your entry for review…');
  try{
   const response=await fetch(API+'/v1/community/submit',{method:'POST',mode:'cors',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(data.error||'Submission could not be saved.');
   form.reset();inputs.body.dispatchEvent(new Event('input'));
   state(feedback,'Submitted for review. It will not appear publicly until approved. Save this reference if you ever need to request removal: '+data.receipt);
   notify('Entries are reviewed before appearing. Thank you for contributing.');
   // Do not add pending submissions to the public view or localStorage.
  }catch(error){state(feedback,error.message||'Submission unavailable. Try again later.')}
  finally{button.disabled=false}
 });
 container.append(form);
 return ()=>{button.disabled=false};
}
function makeListing(container,scope,kind,notify){
 const holder=h('div',{class:'community-listing','data-listing-kind':kind});
 holder.append(h('h3',{},kind==='suggestion'?'Community discoveries':'Community comments'));
 const filter=kind==='suggestion'?h('select',{'aria-label':'Filter community suggestions by category'}):null;
 if(filter){
  filter.append(h('option',{value:''},'All categories'));
  for(const [id,name] of CATEGORIES)filter.append(h('option',{value:id},name));
  holder.append(filter);
 }
 const results=h('div',{class:'community-results'});
 holder.append(results);
 const loadMore=h('button',{type:'button',class:'button button-secondary',hidden:true},'Show more');
 holder.append(loadMore);container.append(holder);
 let offset=0,busy=false,requestId=0;
 async function load(reset=false){
  if(busy&&!reset)return;
  if(reset){offset=0;results.replaceChildren()}
  const id=++requestId;busy=true;loadMore.disabled=true;
  if(!offset)state(results,'Checking approved community entries…');
  try{
   const params=new URLSearchParams({section:scope,kind,offset:String(offset)});
   if(kind==='suggestion'&&filter.value)params.set('category',filter.value);
   const response=await fetch(API+'/v1/community/approved?'+params,{mode:'cors'});
   const data=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(data.error||'Community entries unavailable');
   if(id!==requestId)return;
   if(offset===0)results.replaceChildren();
   const entries=Array.isArray(data.items)?data.items:[];
   if(!entries.length&&!offset)results.append(h('p',{class:'community-empty'},'No approved entries here yet. A good discovery could be the first.'));
   for(const entry of entries){
    const card=h('article',{class:'community-entry'});
    if(kind==='suggestion'){
      card.append(h('h4',{},String(entry.title||'Untitled recording')));
      card.append(h('p',{class:'community-artist'},String(entry.artist||'')));
      const name=CATEGORIES.find(([id])=>id===entry.category)?.[1]||'Listening Room';
      card.append(h('small',{class:'community-category'},name));
      const search=h('a',{href:'https://open.spotify.com/search/'+encodeURIComponent(String(entry.artist||'')+' '+String(entry.title||'')),target:'_blank',rel:'noopener noreferrer'},'Search for this recording on Spotify ↗');
      card.append(search);
    }else card.append(h('small',{class:'community-category'},'Listener comment'));
    card.append(h('p',{class:'community-entry-body'},String(entry.body||'')));
    results.append(card);
   }
   offset=Number(data.nextOffset)||offset+entries.length;
   loadMore.hidden=!data.hasMore||offset>1000;
   notify('');
  }catch(error){
   if(id!==requestId)return;
   state(results,'Community entries are not available yet. This section opens when the next website update is released.');
   loadMore.hidden=true;throw error;
  }finally{if(id===requestId){busy=false;loadMore.disabled=false}}
 }
 if(filter)filter.addEventListener('change',()=>{load(true).catch(()=>{})});
 loadMore.addEventListener('click',()=>{load(false).catch(()=>{})});
 return load;
}
function init(root){
 const scope=root.dataset.communityScope;
 if(!['room','abx'].includes(scope))return;
 root.classList.add('community-board');
 const notice=h('p',{class:'community-notice',role:'status','aria-live':'polite'},'Community submissions are reviewed before they appear. No account required.');
 root.append(notice);
 const lists=h('div',{class:'community-columns'});
 const forms=h('div',{class:'community-columns'});
 root.append(forms,lists);
 const notify=message=>{if(message)state(notice,message)};
 const kinds=scope==='room'?['suggestion','comment']:['comment'];
 const enable=kinds.map(kind=>makeForm(forms,scope,kind,notify,()=>{}));
 const fetches=kinds.map(kind=>makeListing(lists,scope,kind,notify));
 let loaded=false;
 async function begin(){
  if(loaded)return;loaded=true;
  const outcomes=await Promise.allSettled(fetches.map(fn=>fn(true)));
  if(outcomes.some(x=>x.status==='fulfilled')){
   for(const fn of enable)fn();
  }else state(notice,'The community board is not open yet. Comments and suggestions will be available with the next release.');
 }
 if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();begin()}
  },{rootMargin:'280px'});
  observer.observe(root);
 }else begin();
}
document.querySelectorAll('[data-community-scope]').forEach(init);
})();