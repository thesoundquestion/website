/* Local-only graph controls. Use toggleAttribute for SVG compatibility. */
document.querySelectorAll('[data-lesson-plot]').forEach(section => {
 const buttons = [...section.querySelectorAll('button[data-select-case]')];
 const curves = [...section.querySelectorAll('svg [data-plot-case]')];
 const descriptions = [...section.querySelectorAll('[data-case-description]')];
 const status = section.querySelector('[data-plot-status]');
 const chart = section.querySelector('svg.dl-graph');
 function select(choice) {
   const selectedButton = buttons.find(b => b.dataset.selectCase === choice);
   if (!selectedButton) return;
   for (const b of buttons) {
     const chosen = b.dataset.selectCase === choice;
     b.setAttribute('aria-pressed', String(chosen));
     b.classList.toggle('is-current', chosen);
   }
   for (const element of curves) element.toggleAttribute('hidden', element.getAttribute('data-plot-case') !== choice);
   for (const element of descriptions) element.toggleAttribute('hidden', element.getAttribute('data-case-description') !== choice);
   const title = selectedButton.textContent.trim();
   if (status) {
     let note = 'The comparison graph is updated.';
     if (section.dataset.lessonPlot === 'amplifier-power' && choice === 'issue') note = 'An incomplete rating cannot be plotted fairly.';
     if (section.dataset.lessonPlot === 'amplifier-distortion' && choice === 'character') note = 'The overall THD curve is unchanged; the inset reveals a different mix of added tones.';
     status.textContent = 'Showing: ' + title + '. ' + note;
   }
   if (chart) chart.setAttribute('aria-label', 'Illustrative graph for ' + section.dataset.lessonPlot.replaceAll('-', ' ') + '. Selected example: ' + title + '. Not measured data.');
 }
 for (const b of buttons) b.addEventListener('click', () => select(b.dataset.selectCase));
 if (buttons.length) select(buttons[0].dataset.selectCase);
});