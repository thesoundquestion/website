/* The Sound Question. Local-only overlay for four calculated amp/speaker examples.
 * The scenario switcher is handled by decoder-lessons.js. */
(() => {
 const widget = document.querySelector('[data-lesson-plot="amp-speaker-load-effects"]');
 if (!widget) return;
 const controls = widget.querySelector('.ampx-overlay-controls');
 const button = controls?.querySelector('[data-ampx-toggle]');
 const label = controls?.querySelector('[data-ampx-status]');
 const curves = [...widget.querySelectorAll('path[data-ampx-high]')];
 const charts = [...widget.querySelectorAll('svg.ampx-effect-svg')];
 if (!controls || !button || !label || curves.length !== 4 || charts.length !== 4) return;
 const aria = charts.map(svg => svg.getAttribute('aria-label') || '');
 const status = document.createElement('span');
 status.className = 'ampx-announcement';
 status.setAttribute('role', 'status');
 status.setAttribute('aria-live', 'polite');
 status.style.cssText='position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
 controls.append(status);
 function setOverlay(enabled, announce) {
   button.setAttribute('aria-pressed', String(enabled));
   label.textContent = enabled ? 'On' : 'Off';
   curves.forEach(c => c.toggleAttribute('hidden', !enabled));
   widget.classList.toggle('ampx-high-hidden', !enabled);
   charts.forEach((chart, i) => chart.setAttribute('aria-label', aria[i]+(enabled
     ? ' Both amplifier curves are shown.'
     : ' High-output-impedance amplifier trace hidden; low-output-impedance reference remains.')));
   if (announce) status.textContent = enabled
     ? '2 ohm amplifier overlay shown in every example.'
     : '2 ohm amplifier overlay hidden in every example.';
 }
 setOverlay(true,false);
 controls.hidden = false;
 button.addEventListener('click',()=>setOverlay(button.getAttribute('aria-pressed')!=='true',true));
})();
