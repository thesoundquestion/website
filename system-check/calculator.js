'use strict';

const form = document.querySelector('#check');
const field = name => form.elements.namedItem(name);
const num = name => field(name).valueAsNumber;
const ratings = document.querySelector('#ratings');
const status = document.querySelector('#result-status');
const body = document.querySelector('#result-body');
const output = document.querySelector('#results');
const format = new Intl.NumberFormat('en-CA', { maximumSignificantDigits: 3 });
const show = value => format.format(value);
const db = value => value.toFixed(1);
const referenceFeet = 1 / 0.3048;

function addRating(watts = '', load = '', type = 'continuous') {
  const row = document.createElement('div');
  row.className = 'sc-rating';
  row.innerHTML = '<label>Watts per channel<input data-watts type="number" min="0.001" max="100000" step="any" placeholder="e.g. 80"></label>'
    + '<label>Test load (Ω)<input data-ohms type="number" min="0.5" max="32" step="any" list="impedances" placeholder="e.g. 8"></label>'
    + '<label>Rating type<select><option value="continuous">Continuous</option><option value="burst">Short burst</option><option value="unknown">Unspecified</option></select></label>'
    + '<label>Test conditions (optional)<input data-conditions maxlength="140" placeholder="e.g. 20 Hz–20 kHz, 0.1% THD, both channels"></label>'
    + '<button class="sc-button" type="button">Remove rating</button>';
  row.querySelector('[data-watts]').value = watts;
  row.querySelector('[data-ohms]').value = load;
  row.querySelector('select').value = type;
  row.querySelector('button').addEventListener('click', () => {
    row.remove();
    if (!ratings.children.length) addRating();
    document.querySelector('#add-rating').focus();
  });
  ratings.append(row);
  return row;
}

function sync() {
  const target = field('targetMode').value;
  const visible = { peak: target !== 'average', average: target !== 'peak', gap: target === 'average' };
  for (const label of form.querySelectorAll('[data-target]')) {
    label.hidden = !visible[label.dataset.target];
    label.querySelector('input').disabled = label.hidden;
  }
  const amp = document.querySelector('#amp-fields');
  amp.hidden = field('mode').value === 'upgrade';
  amp.disabled = amp.hidden;
}

const lookup = {
  speaker: [
    ['Manufacturer specs and manual', 'speaker official specifications manual sensitivity nominal impedance'],
    ['Independent sensitivity and impedance tests', 'speaker measured sensitivity impedance phase Erin Audio Corner Audio Science Review Stereophile'],
    ['Search Spinorama', 'site:spinorama.org']
  ],
  amp: [
    ['Manufacturer specs and manual', 'amplifier official manual specifications watts per channel input sensitivity gain'],
    ['Find a 4 Ω bench test', 'amplifier measurements 4 ohms watts THD+N Stereophile Audioholics Audio Science Review'],
    ['Find distortion and output impedance tests', 'amplifier bench test distortion versus power output impedance']
  ]
};

function searchLink(label, model, terms) {
  const a = document.createElement('a');
  a.textContent = label;
  a.href = 'https://www.google.com/search?' + new URLSearchParams({ q: '"' + model + '" ' + terms });
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  return a;
}

for (const group of form.querySelectorAll('[data-lookup]')) {
  const input = group.querySelector('input');
  const links = group.querySelector('.sc-searches');
  input.addEventListener('input', () => {
    const model = input.value.trim();
    links.replaceChildren(...(model ? lookup[group.dataset.lookup].map(([label, terms]) => searchLink(label, model, terms)) : []));
  });
}

function readRatings() {
  const entries = [];
  for (const row of ratings.children) {
    const watts = row.querySelector('[data-watts]').valueAsNumber;
    const load = row.querySelector('[data-ohms]').valueAsNumber;
    if (Number.isNaN(watts) && Number.isNaN(load)) continue;
    if (!Number.isFinite(watts) || !Number.isFinite(load)) throw new Error('Enter both watts and test load for each amplifier rating you use.');
    entries.push({ watts, load, type: row.querySelector('select').value, conditions: row.querySelector('[data-conditions]').value.trim() });
  }
  return entries;
}

function table(headers, rows) {
  const result = document.createElement('table');
  const head = result.createTHead().insertRow();
  for (const label of headers) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = label;
    head.append(th);
  }
  const content = result.createTBody();
  for (const values of rows) {
    const row = content.insertRow();
    for (const value of values) row.insertCell().textContent = value;
  }
  return result;
}

function addText(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  body.append(element);
  return element;
}

function curveReading(watts) {
  const raw = field('curve').value.trim();
  if (!raw) return;
  const load = num('curveLoad');
  const hz = num('curveHz');
  const type = field('curveType').value;
  if (!load || !hz) {
    addText('p', 'Enter the test load and frequency to use the distortion points.');
    return;
  }
  const points = raw.split(/\r?\n/).filter(line => line.trim()).map(line => {
    const pair = line.split(',').map(part => part.trim());
    return pair.length === 2 && pair.every(Boolean) ? pair.map(Number) : [];
  }).sort((a, b) => a[0] - b[0]);
  if (!points.length || points.some(([w, percent], index) => !Number.isFinite(w) || w <= 0 || !Number.isFinite(percent) || percent < 0 || points[index - 1]?.[0] === w)) {
    addText('p', 'Check the distortion points. Use unique positive watt values and nonnegative percentages, one watts, percent pair per line.');
    return;
  }
  addText('h3', 'Where the peak lands on your distortion curve');
  const exact = points.find(([w]) => Math.abs(w - watts) < 1e-8);
  const upper = points.findIndex(([w]) => w > watts);
  const context = ' into ' + show(load) + ' Ω at ' + show(hz) + ' Hz for the same requested peak voltage.';
  if (exact) {
    addText('p', show(exact[1]) + '% ' + type + ' at ' + show(watts) + ' W' + context);
  } else if (upper > 0) {
    const [leftW, leftPct] = points[upper - 1];
    const [rightW, rightPct] = points[upper];
    const fraction = Math.log(watts / leftW) / Math.log(rightW / leftW);
    const percent = leftPct > 0 && rightPct > 0 ? leftPct * (rightPct / leftPct) ** fraction : leftPct + (rightPct - leftPct) * fraction;
    addText('p', 'Estimated ' + show(percent) + '% ' + type + ' at ' + show(watts) + ' W' + context);
    addText('p', 'Entered points bracketing the estimate: ' + show(leftPct) + '% at ' + show(leftW) + ' W and ' + show(rightPct) + '% at ' + show(rightW) + ' W.');
  } else {
    addText('p', 'The requested ' + show(watts) + ' W falls outside the supplied measurements' + context);
  }
  addText('p', 'This is a bench-test reference. What you hear depends on the signal, speaker load and listening conditions.');
}

function renderConnections(volts, entries) {
  const source = num('sourceVoltage');
  const sourceZ = num('sourceZ');
  const inputZ = num('inputZ') * 1000;
  const gain = num('gain');
  const sensitivity = num('inputSensitivity');
  const outputZ = num('outputZ');
  const minimum = num('minimum');
  const maximum = num('maximum');
  if ([source, sourceZ, inputZ, gain, sensitivity, outputZ].every(Number.isNaN)) return;
  addText('h3', 'Source and amplifier connection');
  const hasDivider = Number.isFinite(sourceZ) && Number.isFinite(inputZ);
  const divider = hasDivider ? inputZ / (sourceZ + inputZ) : 1;
  if (hasDivider) addText('p', 'Estimated input loading loss: ' + db(-20 * Math.log10(divider)) + ' dB using the two impedances as resistances.');
  const first = entries[0];
  const voltageGain = Number.isFinite(gain) ? 10 ** (gain / 20) : first && sensitivity ? Math.sqrt(first.watts * first.load) / sensitivity : NaN;
  if (Number.isFinite(voltageGain)) {
    const needed = volts / voltageGain;
    addText('p', 'To request this peak, the amplifier input needs about ' + show(needed) + ' V RMS at the entered gain or rated sensitivity.');
    if (source) addText('p', 'The source can supply an estimated ' + show(source * divider) + ' V RMS at the amp input' + (hasDivider ? ' after input loading' : ' before any input loading') + '. ' + (source * divider >= needed ? 'That is enough signal voltage under these assumptions.' : 'That falls short of the requested peak.'));
  } else if (source || sensitivity) {
    addText('p', 'Enter amplifier voltage gain, or rated input sensitivity and its matching first power rating, to estimate the required input signal.');
  }
  if (Number.isFinite(outputZ)) {
    if (minimum > 0 && maximum >= minimum) {
      const low = minimum / (minimum + outputZ);
      const high = maximum / (maximum + outputZ);
      addText('p', 'The amplifier’s output impedance could contribute about ' + db(20 * Math.log10(high / low)) + ' dB of level variation between the entered impedance extremes in a resistive model. The frequencies and electrical phase determine how that translates to tonal balance.');
    } else {
      addText('p', 'Enter minimum and maximum speaker impedance to estimate tonal variation from amplifier output impedance.');
    }
  }
}

function calculate() {
  const mode = field('mode').value;
  const entries = mode === 'check' ? readRatings() : [];
  const target = field('targetMode').value;
  const average = target === 'peak' ? null : num('average');
  const peak = target === 'average' ? average + num('gap') : num('peak');
  if (average !== null && peak < average) throw new Error('Enter a peak level at or above the average level.');
  if (peak > 135) throw new Error('Use a peak target of 135 dB SPL or less for this model.');
  const load = num('load');
  const minimum = num('minimum');
  const maximum = num('maximum');
  if (Number.isFinite(maximum) && Number.isFinite(minimum) && maximum < minimum) throw new Error('Maximum impedance must be at or above minimum impedance.');
  const sensitivity = num('sensitivity');
  const distance = num('distance');
  const room = num('room') || 0;
  const pair = Number(field('speakers').value);
  const reference = field('basis').value === 'voltage' ? 2.83 : Math.sqrt(load);
  const referenceAtSeat = sensitivity - 20 * Math.log10(distance / referenceFeet) + room + pair;
  const voltageAt = spl => reference * 10 ** ((spl - referenceAtSeat) / 20);
  const peakV = voltageAt(peak);
  const averageV = average === null ? null : voltageAt(average);
  const peakW = peakV ** 2 / load;
  const averageW = averageV === null ? null : averageV ** 2 / load;
  const rows = [[db(peak) + ' dB peak', show(peakW) + ' W', show(peakV) + ' V', show(peakV / load) + ' A']];
  if (averageV !== null) rows.unshift([db(average) + ' dB average', show(averageW) + ' W', show(averageV) + ' V', show(averageV / load) + ' A']);
  status.textContent = mode === 'upgrade' ? 'Here’s the output to look for at your seat.' : 'Here’s what your speakers ask for at your seat.';
  body.append(table(['Listening goal', 'Power/ch.', 'Voltage RMS', 'Current RMS'], rows));
  addText('p', 'The watt and current estimates use ' + show(load) + ' Ω nominal as a fixed load. Assumed seat distance: ' + show(distance) + ' ft. Speaker summation: +' + pair + ' dB. Room adjustment: ' + room + ' dB.');
  if (minimum > 0) {
    const hz = num('minimumHz');
    const phase = num('phase');
    addText('p', 'At the same voltage, a dip to ' + show(minimum) + ' Ω' + (hz ? ' near ' + show(hz) + ' Hz' : '') + ' could ask for about ' + show(peakV / minimum) + ' A RMS equivalent if that peak occurs there.' + (Number.isFinite(phase) ? ' The entered phase is ' + show(phase) + '°. Reactive loading can add stress beyond this current estimate.' : ' A real speaker’s electrical phase also affects amplifier stress.'));
  }
  if (!Number.isFinite(minimum) && field('speakerModel').value.trim()) {
    const paragraph = addText('p', 'A measured impedance dip can help check how much current this speaker could ask for. ');
    paragraph.append(searchLink('Find an impedance measurement', field('speakerModel').value.trim(), 'speaker measured impedance minimum phase'));
  }
  if (mode === 'check') {
    addText('h3', 'Compare with your amplifier');
    if (!entries.length) addText('p', 'Add a wattage and its test load to compare your amplifier against this demand.');
    if (entries.length) {
      const lines = document.createElement('ul');
      for (const { watts, load: testLoad, type, conditions } of entries) {
        const maxV = Math.sqrt(watts * testLoad);
        const reserve = 20 * Math.log10(maxV / peakV);
        const label = type === 'continuous' ? 'continuous' : type === 'burst' ? 'short-burst' : 'duration unspecified';
        let line = show(watts) + ' W into ' + show(testLoad) + ' Ω (' + label + ') gives an estimated ' + db(referenceAtSeat + 20 * Math.log10(maxV / reference)) + ' dB at the seat for that test-load voltage. ';
        line += 'Peak voltage comparison: ' + db(Math.abs(reserve)) + ' dB ' + (reserve >= 0 ? 'above' : 'short of') + ' your target.';
        if (averageV !== null && type === 'continuous') line += ' Average-level reserve: ' + db(20 * Math.log10(maxV / averageV)) + ' dB.';
        if (conditions) line += ' Entered test conditions: ' + conditions + '.';
        if (testLoad !== load) line += ' This rating uses a different load from your speaker’s nominal impedance.';
        const item = document.createElement('li');
        item.textContent = line;
        lines.append(item);
      }
      body.append(lines);
      const hasMatch = entries.some(rating => rating.load === load);
      const lowLoad = minimum > 0 && minimum < load ? minimum : load;
      if (!hasMatch || !entries.some(rating => rating.load <= lowLoad)) {
        const paragraph = addText('p', 'Look for a bench test closer to your speaker’s load. The ratings entered leave some of that load range unverified.');
        const model = field('ampModel').value.trim();
        if (model) paragraph.append(' ', searchLink('Find a lower-load bench test', model, show(lowLoad) + ' ohm amplifier power bench measurements'));
      }
      if (averageV !== null && !entries.some(rating => rating.type === 'continuous' && rating.load === load)) addText('p', 'A continuous rating at the nominal load would help assess sustained output.');
    }
    const curveLoad = num('curveLoad');
    curveReading(curveLoad > 0 ? peakV ** 2 / curveLoad : NaN);
  }
  addText('h3', mode === 'upgrade' ? 'Your amplifier shopping target' : 'If you want more headroom');
  addText('p', 'For this setup, look for roughly ' + show(peakW) + ' W per channel into ' + show(load) + ' Ω for the peak' + (averageW === null ? '.' : ' and roughly ' + show(averageW) + ' W per channel for the average level.') + ' If your speakers dip below their nominal load, check lower-impedance bench results as well.');
  addText('p', 'For another 3 dB of peak reserve, look for about ' + show(peakW * 10 ** .3) + ' W into the same load. Speakers rated 3 dB more sensitive on the same basis would cut the estimated power needed for your current goal roughly in half.');
  if (mode === 'check') renderConnections(peakV, entries);
}

addRating();
sync();
field('targetMode').addEventListener('change', sync);
for (const option of field('mode')) option.addEventListener('change', sync);
document.querySelector('#add-rating').addEventListener('click', () => addRating().querySelector('input').focus());
document.querySelector('#example').addEventListener('click', () => {
  form.reset();
  field('sensitivity').value = 94.5;
  field('load').value = 8;
  field('distance').value = 8;
  ratings.replaceChildren();
  addRating(80, 8);
  addRating(100, 4);
  for (const links of form.querySelectorAll('.sc-searches')) links.replaceChildren();
  sync();
  form.requestSubmit();
});
form.addEventListener('submit', event => {
  event.preventDefault();
  body.replaceChildren();
  try {
    calculate();
  } catch (error) {
    status.textContent = error.message;
    body.replaceChildren();
  }
  output.focus();
});
