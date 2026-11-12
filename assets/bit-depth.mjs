/* Lesson 17: two local, deliberately simplified visual explanations.
 * Pure exported math allows testing without a browser. No audio, network or stored data.
 */
export function storedLevel(amplitude, bits) {
  if (!Number.isFinite(amplitude) || !Number.isInteger(bits) || bits < 2 || bits > 24) {
    throw new RangeError('Expected finite amplitude and a 2–24-bit integer PCM format.');
  }
  const divisor = 2 ** (bits - 1);
  const code = Math.max(-divisor, Math.min(divisor - 1, Math.round(amplitude * divisor)));
  return { code, normalized: code / divisor };
}

export function peakCodeSteps(bits, dbBelowFullScale) {
  if (!Number.isInteger(bits) || bits < 2 || bits > 24 || !Number.isFinite(dbBelowFullScale) || dbBelowFullScale > 0) {
    throw new RangeError('Expected a valid PCM bit depth and a nonpositive dBFS value.');
  }
  return 2 ** (bits - 1) * 10 ** (dbBelowFullScale / 20);
}

export function signalAt(t) {
  return Math.sin(2 * Math.PI * 1.18 * t + 0.12);
}

const ns = 'http://www.w3.org/2000/svg';
function svgNode(name, attrs = {}) {
  const el = document.createElementNS(ns, name);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value));
  return el;
}

function renderPlot(stage, bits, db, quiet) {
  const grid = stage.querySelector('[data-bd-grid]');
  const original = stage.querySelector('[data-bd-original]');
  const errors = stage.querySelector('[data-bd-errors]');
  const dots = stage.querySelector('[data-bd-dots]');
  if (!grid || !original || !errors || !dots) return;
  grid.replaceChildren(); errors.replaceChildren(); dots.replaceChildren();
  const left = 62, right = 723, mid = 148, half = 115;
  const peak = quiet ? 10 ** (db / 20) : 0.7;
  const normalizedDisplay = value => quiet ? value / peak : value;
  const y = value => mid - half * Math.max(-1.13, Math.min(1.13, value));
  for (const tick of [-1, 0, 1]) {
    grid.append(svgNode('line', {
      x1: left, x2: right, y1: y(tick), y2: y(tick),
      class: tick === 0 ? 'bd-svg-axis' : 'bd-svg-grid'
    }));
    const label = svgNode('text', { x: 52, y: y(tick) + 4, 'text-anchor':'end',class:'bd-svg-label' });
    label.textContent = tick === 0 ? '0' : tick === 1 ? 'Higher' : 'Lower';
    grid.append(label);
  }
  // Draw level-grid marks only if they are few enough to teach something.
  if (!quiet && bits <= 5) {
    const size = 2 ** (bits - 1);
    for (let code = -size; code < size; code++) {
      grid.append(svgNode('line', {
        x1:left, x2:right, y1:y(code / size), y2:y(code / size),
        class:'bd-svg-grid'
      }));
    }
  }
  const ampAt = t => peak * signalAt(t);
  const line = [];
  for (let i = 0; i <= 320; i++) {
    const t = i / 320;
    line.push((i ? 'L' : 'M') + (left + t * (right - left)).toFixed(2) + ' ' +
      y(normalizedDisplay(ampAt(t))).toFixed(2));
  }
  original.setAttribute('d', line.join(' '));
  original.setAttribute('class', 'bd-svg-reference');
  const count = 25;
  let largest = 0, changed = 0;
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1), x = left + t * (right - left);
    const exact = ampAt(t), rounded = storedLevel(exact,bits).normalized;
    const yExact = y(normalizedDisplay(exact)), yRounded = y(normalizedDisplay(rounded));
    largest = Math.max(largest, Math.abs(exact-rounded));
    if (Math.abs(rounded) > 0) changed++;
    if (Math.abs(yExact - yRounded) > 1) {
      errors.append(svgNode('line',{
        x1:x.toFixed(2),x2:x.toFixed(2),y1:yExact.toFixed(2),y2:yRounded.toFixed(2),class:'bd-svg-gap'
      }));
    }
    dots.append(svgNode('circle',{
      cx:x.toFixed(2),cy:yExact.toFixed(2),r:2.7,class:'bd-svg-actual'
    }));
    dots.append(svgNode('circle',{
      cx:x.toFixed(2),cy:yRounded.toFixed(2),r:4,class:'bd-svg-saved'
    }));
  }
  return {largest,nonzeroSamples:changed,totalSamples:count};
}

function setChoice(buttons, key, value) {
  for (const b of buttons) {
    const active = Number(b.dataset[key]) === value;
    b.setAttribute('aria-pressed',String(active));
    b.classList.toggle('is-current',active);
  }
}

function initSimple() {
  const root = document.querySelector('[data-bd-simple]');
  if (!root) return;
  const buttons = [...root.querySelectorAll('[data-bd-simple-bits]')];
  const count = root.querySelector('[data-bd-count]');
  const note = root.querySelector('[data-bd-simple-note]');
  const stage = root.querySelector('[data-bd-simple-stage]');
  function select(bits) {
    const result = renderPlot(stage,bits,0,false);
    setChoice(buttons,'bdSimpleBits',bits);
    count.textContent = (2 ** bits).toLocaleString('en-CA');
    const quality = bits === 3 ? 'large' : bits === 5 ? 'smaller' : 'hard-to-see';
    note.textContent = 'The same 25 moments are stored each time. With ' + (2 ** bits) +
      ' level choices, the rounding gaps are ' + quality +
      '. Adding bits changes the precision of each saved level, not how many snapshots are taken.';
    stage.setAttribute('aria-label','One unchanged sound wave sampled at 25 fixed moments using ' +
      (2 ** bits) + ' available level values. Maximum normalized rounding difference: ' +
      (result.largest * 100).toFixed(1) + ' percent of full-scale peak amplitude.');
  }
  for(const b of buttons)b.addEventListener('click',()=>select(Number(b.dataset.bdSimpleBits)));
  select(3);
}

function initQuiet() {
  const root = document.querySelector('[data-bd-quiet]');
  if(!root)return;
  const buttons=[...root.querySelectorAll('[data-bd-quiet-bits]')];
  const presets=[...root.querySelectorAll('[data-bd-db]')];
  const slider=root.querySelector('#bd-volume');
  const stepOut=root.querySelector('[data-bd-quiet-steps]');
  const dbOut=root.querySelector('[data-bd-db-display]');
  const countOut=root.querySelector('[data-bd-format-values]');
  const note=root.querySelector('[data-bd-quiet-note]');
  const stage=root.querySelector('[data-bd-quiet-stage]');
  let bits=16;
  function update() {
    const db=Number(slider.value);
    const sample=renderPlot(stage,bits,db,true);
    const steps=peakCodeSteps(bits,db);
    countOut.textContent=(2 ** bits).toLocaleString('en-CA');
    stepOut.textContent=steps<.05?'Less than 0.05':steps<10?'About '+Number(steps.toPrecision(2)).toLocaleString('en-CA'):
      'About '+Math.round(steps).toLocaleString('en-CA');
    dbOut.textContent='−'+Math.abs(db)+' dB';
    let explanation;
    if(sample.nonzeroSamples===0) {
      explanation='In this example without dither, all 25 snapshots round to zero at this setting. That does NOT mean a properly dithered real recording abruptly erases everything quieter than one step.';
    } else if(steps<4) {
      explanation='Only about '+Number(steps.toPrecision(2))+' level steps reach from silence to the note’s peak. The stored dots jump between a few choices, while the gold curve stays smooth. This is why very quiet material is where bit depth becomes important.';
    } else if(steps<32){
      explanation='A few available steps now describe the tiny note. Some differences remain visible even though the same 25 moments were sampled.';
    } else {
      explanation='Many level steps fit inside even this tiny note, so the saved blue values follow the original more closely. Extra bits mainly lower the rounding limitation, not the song’s actual noise or volume.';
    }
    note.textContent=explanation;
    stage.setAttribute('aria-label',bits+'-bit no-dither demonstration at '+db+
      ' dB relative to full scale, enlarged vertically. '+sample.nonzeroSamples+
      ' of 25 rounded sample values differ from zero; around '+steps.toPrecision(3)+' code steps reach the note peak.');
    for(const p of presets) p.setAttribute('aria-pressed',String(Number(p.dataset.bdDb)===db));
  }
  for(const b of buttons)b.addEventListener('click',()=>{
    bits=Number(b.dataset.bdQuietBits);
    setChoice(buttons,'bdQuietBits',bits);
    update();
  });
  slider.addEventListener('input',update);
  for(const p of presets)p.addEventListener('click',()=>{slider.value=p.dataset.bdDb;update();});
  setChoice(buttons,'bdQuietBits',bits);update();
}

if (typeof document !== 'undefined') {
  initSimple();
  initQuiet();
}
