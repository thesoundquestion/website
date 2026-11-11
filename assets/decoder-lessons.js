/* Local-only graph controls. Use toggleAttribute for SVG compatibility. */
const traceControls = new WeakMap();

function mountTraceControls(chart) {
 const traces = new Map();
 for (const trace of chart.querySelectorAll('[data-trace]')) {
   const label = trace.dataset.trace;
   if (!traces.has(label)) traces.set(label, []);
   traces.get(label).push(trace);
 }
 if (traces.size < 2) return;

 const wrapper = document.createElement('div');
 wrapper.className = 'dl-trace-chart';
 const controls = document.createElement('div');
 controls.className = 'dl-trace-controls';
 controls.setAttribute('role', 'group');
 controls.setAttribute('aria-label', 'Graph trace emphasis');
 const hint = document.createElement('span');
 hint.className = 'dl-trace-hint';
 hint.textContent = 'Select a trace to dim or restore it.';
 controls.append(hint);

 const entries = [];
 for (const [label, series] of traces) {
   const button = document.createElement('button');
   button.type = 'button';
   button.className = 'dl-option';
   button.setAttribute('aria-pressed', 'true');
   const swatch = document.createElement('span');
   swatch.className = 'dl-trace-swatch';
   swatch.setAttribute('aria-hidden', 'true');
   button.append(swatch, label);
   button.addEventListener('click', () => {
     const dimmed = button.getAttribute('aria-pressed') === 'true';
     button.setAttribute('aria-pressed', String(!dimmed));
     for (const trace of series) trace.classList.toggle('dl-trace-dimmed', dimmed);
   });
   controls.append(button);
   entries.push({ button, series, swatch });
 }
 chart.before(wrapper);
 wrapper.append(controls, chart);

 function refresh() {
   let visibleCount = 0;
   for (const { button, series, swatch } of entries) {
     const trace = series.find(node => !node.closest('[hidden]'));
     button.hidden = !trace;
     if (trace) {
       visibleCount++;
       const color = trace.getAttribute(trace.tagName === 'circle' ? 'fill' : 'stroke');
       if (color) swatch.style.setProperty('--trace-color', color);
     }
   }
   controls.hidden = visibleCount < 2;
   if (controls.hidden) {
     for (const { button, series } of entries) {
       button.setAttribute('aria-pressed', 'true');
       for (const trace of series) trace.classList.remove('dl-trace-dimmed');
     }
   }
 }
 traceControls.set(chart, refresh);
 refresh();
}

for (const chart of document.querySelectorAll('svg:has([data-trace])')) mountTraceControls(chart);

document.querySelectorAll('[data-lesson-plot]').forEach(section => {
 const buttons = [...section.querySelectorAll('button[data-select-case]')];
 const plots = [...section.querySelectorAll('[data-plot-case]')];
 const loadButtons = [...section.querySelectorAll('[data-select-load]')];
 const loadOnlyPlots = [...section.querySelectorAll('svg [data-plot-load]:not([data-plot-case])')];
 let activeLoad = loadButtons[0]?.dataset.selectLoad;
 let activeChoice;
 const matchesLoad = element => !element.dataset.plotLoad || element.dataset.plotLoad === activeLoad;
 const descriptions = [...section.querySelectorAll('[data-case-description]')];
 const status = section.querySelector('[data-plot-status]');
 const chart = section.querySelector('svg.dl-graph');
 const toolbar = section.querySelector('.dl-graph-toolbar');
 function select(choice) {
   const selectedButton = buttons.find(b => b.dataset.selectCase === choice);
   if (!selectedButton) return;
   activeChoice = choice;
   for (const b of buttons) {
     const chosen = b.dataset.selectCase === choice;
     b.setAttribute('aria-pressed', String(chosen));
     b.classList.toggle('is-current', chosen);
   }
   for (const plot of plots) plot.toggleAttribute('hidden', plot.dataset.plotCase !== choice || !matchesLoad(plot));
   for (const plot of loadOnlyPlots) plot.toggleAttribute('hidden', !matchesLoad(plot));
   for (const element of descriptions) element.toggleAttribute('hidden', element.dataset.caseDescription !== choice || !matchesLoad(element));
   const title = selectedButton.textContent.trim() + (activeLoad ? ' into ' + activeLoad + ' Ω' : '');
   if (status) {
     let note = chart ? 'The comparison graph is updated.' : 'The illustration and explanation are updated.';
     if (section.dataset.lessonPlot === 'amplifier-power' && choice === 'issue') note = 'An incomplete rating cannot be plotted fairly.';
     if (section.dataset.lessonPlot === 'amplifier-distortion' && choice === 'character') note = 'The overall THD curve is unchanged; the inset reveals a different mix of added tones.';
     status.textContent = 'Showing: ' + title + '. ' + note;
   }
   if (chart) {
     const selectedPlot = plots.find(plot => chart.contains(plot) && plot.dataset.plotCase === choice && matchesLoad(plot));
     const summary = selectedPlot?.dataset.plotSummary;
     traceControls.get(chart)?.();
     chart.setAttribute('aria-label', summary || 'Illustrative graph for ' + section.dataset.lessonPlot.replaceAll('-', ' ') + '. Selected example: ' + title + '.');
   }
 }
 for (const b of buttons) b.addEventListener('click', () => select(b.dataset.selectCase));
 for (const button of loadButtons) button.addEventListener('click', () => {
   activeLoad = button.dataset.selectLoad;
   for (const option of loadButtons) {
     const chosen = option === button;
     option.setAttribute('aria-pressed', String(chosen));
     option.classList.toggle('is-current', chosen);
   }
   select(activeChoice);
 });
 if (buttons.length) {
   select(buttons[0].dataset.selectCase);
   if (toolbar) toolbar.hidden = false;
   if (status) status.hidden = false;
 }
});

// The lesson controls work independently of the optional tutor.
import('/assets/lesson-tutor/assistant.js').then(({ mountLessonTutor }) => mountLessonTutor()).catch(() => {});
