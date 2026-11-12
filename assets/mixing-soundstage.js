/* Mixing Lesson 22: local-only multitrack overlay controls. */
(() => {
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
})();
