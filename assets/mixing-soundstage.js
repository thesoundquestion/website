/* Mixing Lesson 22: visual-only independent chart overlay controls. No audio or network. */
(() => {
 function mount(root, attr, specs) {
  const controls=root.querySelector('.mx-controls');
  if(!controls) return;
  const state=Object.fromEntries(specs.map(key=>[key,true]));
  const announcer=document.createElement('span');
  announcer.setAttribute('role','status');announcer.setAttribute('aria-live','polite');
  announcer.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
  controls.append(announcer);
  const charts=[...root.querySelectorAll('svg[role="img"]')].map(svg=>[svg,svg.getAttribute('aria-label')||'']);
  function update(key, announce){
   for(const el of root.querySelectorAll('['+attr+'="'+key+'"]'))el.toggleAttribute('hidden',!state[key]);
   const button=controls.querySelector('button['+(attr==='data-mix-stem'?'data-mix-toggle':'data-phase-toggle')+'="'+key+'"]');
   // Ambience uses a different SVG marker and a mix-toggle control.
   if(button){button.setAttribute('aria-pressed',String(state[key]));const label=button.querySelector('span');if(label)label.textContent=state[key]?'On':'Off';}
   for(const [chart,label] of charts){chart.setAttribute('aria-label',label+' Visual overlay selection: '+Object.entries(state).map(([k,v])=>k+' '+(v?'shown':'hidden')).join(', ')+'.');}
   if(announce)announcer.textContent=key+' visual overlay '+(state[key]?'shown':'hidden')+'. Case selection will retain this choice.';
  }
  for(const key of specs){const button=controls.querySelector('button['+(attr==='data-mix-stem'?'data-mix-toggle':'data-phase-toggle')+'="'+key+'"]');if(!button)continue;button.addEventListener('click',()=>{state[key]=!state[key];update(key,true);});update(key,false);}
  controls.hidden=false;
 }
 const mixer=document.querySelector('[data-lesson-plot="mix-demo"]');
 if(mixer){
  const controls=mixer.querySelector('.mx-controls');
  const specs=['vocal','guitar','bass','drums','ambience'];
  const enabled=Object.fromEntries(specs.map(k=>[k,true]));
  const elements=Object.fromEntries(specs.map(k=>[k,[...mixer.querySelectorAll(k==='ambience'?'[data-mix-ambience]':'[data-mix-stem="'+k+'"]')]]));
  const figures=[...mixer.querySelectorAll('svg[role="img"]')].map(svg=>({svg,base:svg.getAttribute('aria-label')||''}));
  const announcer=document.createElement('span');announcer.setAttribute('role','status');announcer.setAttribute('aria-live','polite');announcer.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';controls.append(announcer);
  function set(k,announce){
   for(const el of elements[k])el.toggleAttribute('hidden',!enabled[k]);
   const b=controls.querySelector('[data-mix-toggle="'+k+'"]');b.setAttribute('aria-pressed',String(enabled[k]));b.querySelector('span').textContent=enabled[k]?'On':'Off';
   figures.forEach(({svg,base})=>svg.setAttribute('aria-label',base+' Current visual overlays: '+Object.entries(enabled).map(([key,value])=>key+' '+(value?'on':'off')).join(', ')+'.'));
   if(announce)announcer.textContent=k+' graphical overlay '+(enabled[k]?'shown':'hidden')+' in every mixing preset.';
  }
  for(const k of specs){const b=controls.querySelector('[data-mix-toggle="'+k+'"]');b.addEventListener('click',()=>{enabled[k]=!enabled[k];set(k,true)});set(k,false);}
  controls.hidden=false;
 }
 const phase=document.querySelector('[data-lesson-plot="phase-demo"]');
 if(phase){
  const controls=phase.querySelector('.mx-controls');
  const cfg={baseline:'[data-mono-baseline]',result:'[data-mono-result]'};
  const state={baseline:true,result:true};
  const svgs=[...phase.querySelectorAll('svg[role="img"]')].map(svg=>[svg,svg.getAttribute('aria-label')||'']);
  const announce=document.createElement('span');announce.setAttribute('role','status');announce.setAttribute('aria-live','polite');announce.style.cssText='position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';controls.append(announce);
  function set(k,say){
   for(const el of phase.querySelectorAll(cfg[k]))el.toggleAttribute('hidden',!state[k]);
   const b=controls.querySelector('[data-phase-toggle="'+k+'"]');b.setAttribute('aria-pressed',String(state[k]));b.querySelector('span').textContent=state[k]?'On':'Off';
   for(const [svg,label] of svgs)svg.setAttribute('aria-label',label+' Aligned reference '+(state.baseline?'visible':'hidden')+'; delayed sum '+(state.result?'visible':'hidden')+'.');
   if(say)announce.textContent=k+' trace '+(state[k]?'visible':'hidden')+' in all mono comparison examples.';
  }
  for(const k of Object.keys(cfg)){const b=controls.querySelector('[data-phase-toggle="'+k+'"]');b.addEventListener('click',()=>{state[k]=!state[k];set(k,true)});set(k,false);}
  controls.hidden=false;
 }
})();
