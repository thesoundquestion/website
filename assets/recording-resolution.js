/* Recording Resolution — local-only chart overlay visibility, separate from course case selector.
   Every physical overlay keeps its state when switching case. No network calls or persistence. */
(() => {
 for (const demo of document.querySelectorAll('.rr-demo')) {
   const controls = demo.querySelector('[data-rr-controls]');
   const buttons = controls ? [...controls.querySelectorAll('[data-rr-toggle]')] : [];
   if (!controls || buttons.length !== 2) continue;
   const layers = new Map();
   for (const key of ['original','result']) {
     const series = [...demo.querySelectorAll('[data-rr-layer="'+key+'"]')];
     if (!series.length) break;
     layers.set(key, series);
   }
   if (layers.size !== 2) continue;
   const chartLabels = [...demo.querySelectorAll('svg[role="img"]')].map(svg => ({svg, label:svg.getAttribute('aria-label') || ''}));
   const state = { original:true, result:true };
   const labels = Object.fromEntries(buttons.map(button => [button.dataset.rrToggle, button.textContent.split(':')[0]]));
   const status = document.createElement('span');
   status.className = 'rr-aria-status';
   status.setAttribute('role','status');
   status.setAttribute('aria-live','polite');
   status.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
   controls.append(status);
   function apply(key, announce) {
     for (const path of layers.get(key)) path.toggleAttribute('hidden', !state[key]);
     for (const legend of demo.querySelectorAll('[data-rr-legend="'+key+'"]')) legend.hidden = !state[key];
     for (const chart of chartLabels) chart.svg.setAttribute('aria-label',chart.label+'. Current visibility: intended/original '+(state.original?'shown':'hidden')+', recorded/generated '+(state.result?'shown':'hidden')+'.');
     const button = buttons.find(item=>item.dataset.rrToggle===key);
     button.setAttribute('aria-pressed', String(state[key]));
     button.textContent = labels[key]+': '+(state[key]?'On':'Off');
     if (announce) status.textContent = labels[key]+(state[key]?' displayed.':' hidden.')+' The setting applies to every option in this comparison.';
   }
   for (const button of buttons) {
     const key = button.dataset.rrToggle;
     button.addEventListener('click',()=>{state[key]=!state[key];apply(key,true)});
   }
   apply('original', false);
   apply('result', false);
   controls.hidden=false;
 }
})();