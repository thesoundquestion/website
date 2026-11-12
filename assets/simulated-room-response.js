/* Speaker-frequency-response: a single persistent room-overlay toggle.
   Everything stays in the browser; no account, API or saved data is needed. */
(() => {
  const section = document.querySelector('[data-lesson-plot="speaker-response-rooms"]');
  if (!section) return;
  const controls = section.querySelector('.rsp-overlay-controls');
  const button = section.querySelector('button[data-toggle-room]');
  const stateLabel = button?.querySelector('[data-room-state]');
  const overlays = [...section.querySelectorAll('svg.rsp-plot path[data-room-overlay]')];
  const charts = [...section.querySelectorAll('svg.rsp-plot')];
  if (!controls || !button || !stateLabel || overlays.length !== 5 || charts.length !== 5) return;
  const labels = charts.map(chart => chart.getAttribute('aria-label') || '');
  const announcer = document.createElement('span');
  announcer.className = 'rsp-overlay-announcement';
  announcer.setAttribute('role', 'status');
  announcer.setAttribute('aria-live', 'polite');
  announcer.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
  controls.append(announcer);
  function showRoom(enabled, announce = false) {
    button.setAttribute('aria-pressed', String(enabled));
    stateLabel.textContent = enabled ? 'On' : 'Off';
    overlays.forEach(path => path.toggleAttribute('hidden', !enabled));
    section.classList.toggle('rsp-room-hidden', !enabled);
    charts.forEach((chart, i) => chart.setAttribute('aria-label',
      labels[i] + (enabled ? ' Room overlay is shown.' : ' Room overlay is hidden; speaker-only response remains.')));
    if (announce) announcer.textContent = enabled
      ? 'Room effects shown in all five simulated response profiles.'
      : 'Room effects hidden in all five simulated response profiles.';
  }
  showRoom(true);
  controls.hidden = false;
  button.addEventListener('click', () => {
    showRoom(button.getAttribute('aria-pressed') !== 'true', true);
  });
})();
