/* The Sound Question · intro speaker-response toggle. No samples, tracking or network. */
(() => {
'use strict';
const panel=document.querySelector('.sb-chart-panel');
if(!panel)return;
const buttons=[...panel.querySelectorAll('button[data-sb-mode]')];
const overlay=panel.querySelector('[data-eq-trace]');
const legend=panel.querySelector('[data-sb-legend-eq]');
const note=document.getElementById('sb-response-note');
const descriptions={
  speaker:'<strong>Speaker only:</strong> Deep bass falls off below about 60 Hz. A modest bump near 3 kHz makes some instruments more forward. Most of this invented speaker’s 60 Hz–15 kHz range stays within ±3 dB.',
  eq:'<strong>Speaker + illustrative EQ:</strong> A broad bass boost makes the low end stronger, while a small presence cut reins in the bump near 3 kHz. These are changed levels, not added distortion. EQ does not give a speaker unlimited deep-bass output.'
};
buttons.forEach(button=>button.addEventListener('click',()=>{
 const eq=button.dataset.sbMode==='eq';
 buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 overlay.hidden=!eq;
 legend.hidden=!eq;
 note.innerHTML=eq?descriptions.eq:descriptions.speaker;
}));
})();