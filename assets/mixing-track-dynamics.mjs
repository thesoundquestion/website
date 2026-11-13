/**
 * Original synthetic DAW-style track waveforms for Mixing Lesson 22.
 * This is a visual teaching model, not music playback, sampled multitracks,
 * a simulated physical compressor, or a calibrated loudness measurement.
 * All four rows use the same time positions before and after a separate,
 * illustrative track-level compression choice.
 */
// Fictional common beat grid: quarter notes at 0.5 s, eighth-note guitar
// strums every 0.25 s, snare on beats 2 and 4, cymbal accents on bars.
const DURATION = 4.8;
const WIDTH = 720;
const HEIGHT = 80;
const TRACKS = ['guitar', 'bass', 'snare', 'cymbals'];
const EXPLANATIONS = Object.freeze({
  guitar: {
    before: 'Chords rise and fall with each strum.',
    after: 'Tighter: quieter chord body stays more present.'
  },
  bass: {
    before: 'Note attacks stand out from each note’s fading body.',
    after: 'Tighter: the bass holds a steadier place underneath.'
  },
  snare: {
    before: 'Sharp hits stand noticeably above the quieter ring.',
    after: 'Some control: the loudest hits are reduced, while their shape remains.'
  },
  cymbals: {
    before: 'Shimmer and long decays can rise and fall naturally.',
    after: 'Largely untouched: the cymbal wash still rises and fades.'
  }
});
const pulse = (time, period, slope) =>
  Math.exp(-slope * ((time / period) % 1));
const transient = (time, starts, decay) => {
  let level = 0;
  for (const start of starts) {
    if (time >= start) level += Math.exp(-(time - start) / decay);
  }
  return Math.min(1, level);
};
const clamp = value => Math.min(1, Math.max(0, value));
const oscillation = time => 0.5 + 0.5 * Math.sin(time * 13.7);

export function trackWaveLevel(track, time, mode = 'before') {
  const t = Math.max(0, Math.min(DURATION, Number(time) || 0));
  let raw;
  switch (track) {
    case 'guitar':
      raw = (0.16 + 0.66 * pulse(t, 0.25, 2.1)) *
        (0.75 + 0.2 * Math.sin(t * 2.6) ** 2);
      break;
    case 'bass':
      raw = (0.09 + 0.75 * pulse(t + 0.03, 0.5, 3.1)) *
        (0.86 + 0.12 * Math.cos(t * 3.1) ** 2);
      break;
    case 'snare':
      raw = 0.015 + 0.89 * transient(t, [0.5, 1.5, 2.5, 3.5, 4.5], 0.13) +
        0.18 * transient(t, [1.24, 3.26], 0.1);
      break;
    case 'cymbals':
      raw = 0.07 + 0.56 * transient(t, [0.02, 1.98, 3.98], 0.82) *
        (0.76 + 0.22 * oscillation(t));
      break;
    default:
      throw new Error('Unknown track: ' + track);
  }
  const original = clamp(raw);
  if (mode === 'before') return original;
  if (mode !== 'after') throw new Error('Unknown mode: ' + mode);
  switch (track) {
    case 'guitar': return clamp(0.75 * original ** 0.47);
    case 'bass': return clamp(0.77 * original ** 0.59);
    case 'snare': return clamp(0.70 * original ** 0.72);
    case 'cymbals': return original; // intentionally no added dynamics processing
  }
}

const randomUnit = (index, seed) => {
  const n = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
};

/** A familiar audio-editor waveform: short vertical min/max lines in
 * each tiny slice of a fictional performance. Not actual recorded samples. */
export function trackWavePath(track, mode = 'before', bins = 480) {
  if (!TRACKS.includes(track)) throw new Error('Unknown track: ' + track);
  if (!Number.isInteger(bins) || bins < 8 || bins > 2000) throw new Error('Invalid bins');
  const seed = TRACKS.indexOf(track) + 1;
  const middle = HEIGHT / 2;
  const path = [];
  for (let i = 0; i < bins; i++) {
    const t = DURATION * (i + 0.5) / bins;
    const envelope = trackWaveLevel(track, t, mode);
    const wiggleA = 0.30 + 0.70 * randomUnit(i, seed);
    const wiggleB = 0.30 + 0.70 * randomUnit(i + 51, seed + 11);
    const upper = middle - 33.5 * envelope * wiggleA;
    const lower = middle + 33.5 * envelope * wiggleB;
    const x = ((i + 0.5) * WIDTH / bins).toFixed(1);
    path.push('M' + x + ' ' + upper.toFixed(1) + 'V' + lower.toFixed(1));
  }
  return path.join('');
}

export function trackDynamicsDescription(track, mode = 'before') {
  if (!EXPLANATIONS[track] || !(mode in EXPLANATIONS[track]))
    throw new Error('Unknown track/mode');
  return EXPLANATIONS[track][mode];
}

function initTrackDynamics() {
  const demo = document.querySelector('[data-mx-track-dynamics]');
  if (!demo) return;
  const buttons = [...demo.querySelectorAll('[data-mx-dynamics-mode]')];
  const status = demo.querySelector('[data-mx-dynamics-status]');
  const caption = demo.querySelector('[data-mx-dynamics-caption]');
  function setMode(mode) {
    for (const button of buttons) {
      const selected = button.getAttribute('data-mx-dynamics-mode') === mode;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-current', selected);
    }
    for (const track of TRACKS) {
      const row = demo.querySelector('[data-mx-track="' + track + '"]');
      if (!row) continue;
      const path = row.querySelector('[data-mx-wave-path]');
      const drawing = row.querySelector('svg[role="img"]');
      const note = row.querySelector('[data-mx-track-note]');
      if (path) path.setAttribute('d', trackWavePath(track, mode));
      if (note) note.textContent = trackDynamicsDescription(track, mode);
      if (drawing) drawing.setAttribute('aria-label',
        track + ' track, ' + (mode === 'before' ? 'before selective compression' :
          'after selective compression') + '. ' + trackDynamicsDescription(track, mode) +
        ' Synthetic waveform, not recorded audio.');
    }
    if (caption) caption.textContent = mode === 'after'
      ? 'The same fictional passage after different decisions on each track. Guitar and bass are steadier, snare peaks are controlled, and cymbal dynamics remain open.'
      : 'The same four fictional tracks before individual compression. Note attacks and fading sounds differ by instrument even before processing.';
    if (status) status.textContent = mode === 'after'
      ? 'Showing selective track compression, not a mastering pass.'
      : 'Showing the four fictional tracks before selective compression.';
  }
  for (const button of buttons) {
    button.addEventListener('click', () => setMode(button.getAttribute('data-mx-dynamics-mode')));
  }
  setMode('after');
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', initTrackDynamics);
  else initTrackDynamics();
}
