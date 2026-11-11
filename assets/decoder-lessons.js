/* Spec Sheet Decoder: graph controls. No dependencies, storage or network requests. */
document.querySelectorAll('[data-lesson-plot]').forEach(section=>{
 const options=[...section.querySelectorAll('[data-select-case]')];
 const lines=[...section.querySelectorAll('[data-plot-case]')];
 const notes=[...section.querySelectorAll('[data-case-description]')];
 const update=choice=>{
  for(const b of options){const selected=b.dataset.selectCase===choice;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('is-current',selected);}
  for(const p of lines){p.hidden=p.dataset.plotCase!==choice;}
  for(const p of notes){p.hidden=p.dataset.caseDescription!==choice;}
 };
 for(const b of options)b.addEventListener('click',()=>update(b.dataset.selectCase));
 if(options.length)update(options[0].dataset.selectCase);
});