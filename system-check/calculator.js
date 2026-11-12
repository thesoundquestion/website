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
let levelAnchor = 'peak';

function addRating(watts = '', load = '', type = 'continuous', conditions = '', sourceUrl = '') {
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
  row.querySelector('[data-conditions]').value = conditions;
  if (sourceUrl) {
    row.dataset.sourceUrl = sourceUrl;
    row.addEventListener('input', () => delete row.dataset.sourceUrl);
  }
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
  const visible = { peak: true, average: target !== 'peak', gap: target !== 'peak' };
  for (const label of form.querySelectorAll('[data-target]')) {
    label.hidden = !visible[label.dataset.target];
    label.querySelector('input').disabled = label.hidden;
  }
  const amp = document.querySelector('#amp-fields');
  amp.hidden = field('mode').value === 'upgrade';
  amp.disabled = amp.hidden;
  syncLevels();
}

function syncLevels() {
  if (field('targetMode').value === 'peak') return;
  const anchor = num(levelAnchor);
  const gap = num('gap');
  if (!Number.isFinite(anchor) || !Number.isFinite(gap)) return;
  const fromPeak = levelAnchor === 'peak';
  const linkedLevel = fromPeak ? anchor - gap : anchor + gap;
  field(fromPeak ? 'average' : 'peak').value = Number(linkedLevel.toFixed(2));
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

const specPanel = document.querySelector('#spec-search');
const engineId = specPanel?.dataset.googleEngine;
let googleResults;
let lastSearch = 0;

function loadGoogleResults() {
  if (googleResults) return googleResults;
  googleResults = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = setTimeout(() => reject(new Error('Google Search timed out')), 12000);
    function fail(error) {
      clearTimeout(timeout);
      reject(error);
    }
    window.__gcse = {
      parsetags: 'explicit',
      callback() {
        try {
          const search = window.google.search.cse.element;
          search.render({
            div: 'spec-search-results',
            tag: 'searchresults-only',
            gname: 'equipmentSpecs',
            attributes: { autoSearchOnLoad: false, linkTarget: '_blank' }
          });
          const results = search.getElement('equipmentSpecs');
          if (!results) throw new Error('Google Search did not initialize');
          clearTimeout(timeout);
          resolve(results);
        } catch (error) {
          fail(error);
        }
      }
    };
    script.async = true;
    script.src = 'https://cse.google.com/cse.js?' + new URLSearchParams({ cx: engineId });
    script.addEventListener('error', () => fail(new Error('Google Search could not load')));
    document.head.append(script);
  });
  return googleResults;
}

async function searchSpecs(model, terms) {
  const request = ++lastSearch;
  const searchStatus = document.querySelector('#spec-search-status');
  specPanel.hidden = false;
  document.querySelector('#spec-search-links').replaceChildren(searchLink('Search all of Google', model, terms));
  document.querySelector('#spec-search-title').focus();
  searchStatus.textContent = 'Searching for ' + model + '…';
  try {
    const results = await loadGoogleResults();
    if (request !== lastSearch) return;
    results.execute('"' + model + '"');
    searchStatus.textContent = 'Results for ' + model;
  } catch {
    if (request === lastSearch) searchStatus.textContent = 'Inline results are unavailable. Open the Google search to continue.';
  }
}

for (const group of form.querySelectorAll('[data-lookup]')) {
  const input = group.querySelector('input');
  const links = group.querySelector('.sc-searches');
  input.addEventListener('input', () => {
    const model = input.value.trim();
    links.replaceChildren();
    if (!model) return;
    const options = lookup[group.dataset.lookup];
    if (!engineId) {
      links.append(...options.map(([label, terms]) => searchLink(label, model, terms)));
      return;
    }
    const terms = group.dataset.lookup === 'speaker'
      ? 'speaker sensitivity nominal impedance specifications measurements'
      : 'amplifier output power 8 ohms 4 ohms specifications measurements';
    const button = document.createElement('button');
    button.className = 'sc-button';
    button.type = 'button';
    button.textContent = 'Search for specs';
    button.addEventListener('click', () => searchSpecs(model, terms));
    links.append(button, searchLink('Search all of Google', model, terms));
  });
}

function readRatings() {
  const entries = [];
  for (const row of ratings.children) {
    const watts = row.querySelector('[data-watts]').valueAsNumber;
    const load = row.querySelector('[data-ohms]').valueAsNumber;
    if (Number.isNaN(watts) && Number.isNaN(load)) continue;
    if (!Number.isFinite(watts) || !Number.isFinite(load)) throw new Error('Enter both watts and test load for each amplifier rating you use.');
    entries.push({
      watts, load, type: row.querySelector('select').value,
      conditions: row.querySelector('[data-conditions]').value.trim(),
      sourceUrl: row.dataset.sourceUrl
    });
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

function curveReading(peakV, averageV, speakerLoad) {
  const raw = field('curve').value.trim();
  if (!raw) return;
  addText('h3', 'What your distortion curve shows');
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
  function estimate(watts) {
    const exact = points.find(([w]) => Math.abs(w - watts) < 1e-8);
    if (exact) return { percent: exact[1], exact: true };
    const upper = points.findIndex(([w]) => w > watts);
    if (upper <= 0) return null;
    const [leftW, leftPct] = points[upper - 1];
    const [rightW, rightPct] = points[upper];
    const fraction = Math.log(watts / leftW) / Math.log(rightW / leftW);
    const percent = leftPct > 0 && rightPct > 0 ? leftPct * (rightPct / leftPct) ** fraction : leftPct + (rightPct - leftPct) * fraction;
    return { percent, leftW, rightW, leftPct, rightPct };
  }

  const peakW = peakV ** 2 / load;
  const peak = estimate(peakW);
  const context = 'Bench test: ' + show(load) + ' Ω at ' + show(hz) + ' Hz.';
  if (!peak) {
    const edge = peakW > points.at(-1)[0] ? points.at(-1)[0] : points[0][0];
    const direction = peakW > edge ? 'above' : 'below';
    addText('p', 'Your peak would ask for about ' + show(peakW) + ' W in this test, ' + direction + ' the entered curve’s ' + show(edge) + ' W boundary. Add measurements that bracket the target power to estimate distortion there. ' + context);
  } else {
    addText('p', 'At your peak, the curve ' + (peak.exact ? 'shows ' : 'suggests about ') + show(peak.percent) + '% ' + type + ' at ' + show(peakW) + ' W. ' + context);
    if (!peak.exact) {
      const trend = peak.rightPct > peak.leftPct ? 'rises' : peak.rightPct < peak.leftPct ? 'falls' : 'stays steady';
      addText('p', 'Distortion ' + trend + ' around this part of the curve, from ' + show(peak.leftPct) + '% at ' + show(peak.leftW) + ' W to ' + show(peak.rightPct) + '% at ' + show(peak.rightW) + ' W.');
    }
  }
  if (averageV !== null) {
    const averageW = averageV ** 2 / load;
    const average = estimate(averageW);
    if (average) {
      addText('p', 'At your average level (' + show(averageW) + ' W in this test), ' + (average.exact ? 'the curve shows ' : 'the estimate is ') + show(average.percent) + '% ' + type + '.');
      if (peak && average.percent > 0 && peak.percent >= average.percent * 2) {
        addText('p', 'The peak figure is about ' + show(peak.percent / average.percent) + ' times the average-level figure on this test.');
      }
    } else {
      addText('p', 'Your average level maps to ' + show(averageW) + ' W in this test, outside the points you entered.');
    }
  }
  if (load !== speakerLoad) addText('p', 'Your speaker is rated ' + show(speakerLoad) + ' Ω. Use a curve at ' + show(speakerLoad) + ' Ω to check distortion at the nominal load. The figures above describe the ' + show(load) + ' Ω bench test at the same target voltage.');
  addText('p', 'These figures describe the bench test. Audibility depends on the signal, speaker and listening conditions.');
}

function renderConnections(volts, entries, speakerLoad) {
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
  if (hasDivider) addText('p', 'About ' + powerPercent(divider) + ' of the source signal voltage reaches the amplifier input (' + db(-20 * Math.log10(divider)) + ' dB loss).');
  else if (Number.isFinite(sourceZ) || Number.isFinite(inputZ)) addText('p', 'Enter both the source output impedance and the amp input impedance to check how much signal reaches the amp.');
  const first = entries[0];
  const voltageGain = Number.isFinite(gain) ? 10 ** (gain / 20) : first && sensitivity ? Math.sqrt(first.watts * first.load) / sensitivity : NaN;
  if (Number.isFinite(voltageGain)) {
    const needed = volts / voltageGain;
    const gainBasis = Number.isFinite(gain)
      ? 'the entered gain'
      : 'the entered input sensitivity for ' + show(first.watts) + ' W into ' + show(first.load) + ' Ω';
    addText('p', 'Look for a source that can deliver about ' + show(needed) + ' V RMS into the amp input for this peak, based on ' + gainBasis + '.');
    if (source && hasDivider) {
      const available = source * divider;
      const result = available >= needed ? 'That covers the input signal needed for this peak.' : 'That falls short of the input signal needed for this peak.';
      addText('p', 'Your source can supply an estimated ' + show(available) + ' V RMS after input loading. ' + result);
    } else if (source) {
      const result = source >= needed
        ? 'That would cover the peak if loading loss is small. The voltage at the amp input is unverified.'
        : 'That falls short even before accounting for input loading.';
      addText('p', 'Your source is rated for ' + show(source) + ' V RMS. ' + result);
      if (!Number.isFinite(sourceZ) && !Number.isFinite(inputZ)) {
        addText('p', 'Enter both impedances to estimate the voltage at the amp input.');
      }
    }
  } else if (source || sensitivity) {
    addText('p', 'Enter amplifier voltage gain, or rated input sensitivity and its matching first power rating, to estimate the required input signal.');
  }
  if (Number.isFinite(outputZ)) {
    if (minimum > 0 && maximum >= minimum) {
      const low = minimum / (minimum + outputZ);
      const high = maximum / (maximum + outputZ);
      addText('p', 'The amplifier’s output impedance could contribute about ' + db(20 * Math.log10(high / low)) + ' dB of level variation between the entered impedance extremes in a resistive model. The frequencies and electrical phase determine how that translates to tonal balance.');
    } else {
      const testLoad = minimum > 0 ? minimum : maximum > 0 ? maximum : speakerLoad;
      const attenuation = 20 * Math.log10(1 + outputZ / testLoad);
      addText('p', 'Treating ' + show(testLoad) + ' Ω as a fixed load, the entered output impedance would reduce the level by about ' + db(attenuation) + ' dB compared with the amp’s unloaded output. Enter both measured speaker impedance extremes to estimate how that loss might vary across frequencies.');
    }
  }
}

function powerPercent(ratio) {
  const percent = ratio * 100;
  if (percent > 0 && percent < 0.1) return 'less than 0.1%';
  return new Intl.NumberFormat('en-CA', { maximumFractionDigits: 1 }).format(percent) + '%';
}

function coversDemand(demand, watts) {
  return demand <= watts * (1 + 1e-12);
}

function sameVoltageWatts(rating, load) {
  return rating.watts * rating.load / load;
}

function powerTarget(load, peakWatts, averageWatts) {
  return show(load) + ' Ω · about ' + show(peakWatts) + ' W per channel for short peaks'
    + (averageWatts === null ? '.' : ' and ' + show(averageWatts) + ' W per channel for the average level.');
}

function appendRatingSource(element, rating) {
  if (!rating.sourceUrl) return;
  const link = document.createElement('a');
  link.href = rating.sourceUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'Rating source';
  element.append(' ', link);
}


const speakerPowerFields = [
  'speakerPowerContinuous', 'speakerPowerPeak', 'speakerPowerNominal',
  'speakerPowerMaxInput', 'speakerRecommendedAmpMax'
];

function speakerPowerValue(name) {
  const value = field(name)?.valueAsNumber;
  return Number.isFinite(value) && value > 0 ? value : null;
}

function appendSpeakerPowerSafety(card, { peakW, averageW }) {
  const continuous = speakerPowerValue('speakerPowerContinuous');
  const nominal = speakerPowerValue('speakerPowerNominal');
  const peak = speakerPowerValue('speakerPowerPeak');
  const maxInput = speakerPowerValue('speakerPowerMaxInput');
  const recommended = speakerPowerValue('speakerRecommendedAmpMax');
  const hasHandling = [continuous, nominal, peak, maxInput].some(Number.isFinite);
  const box = document.createElement('section');
  box.className = 'sc-speaker-safety';
  box.setAttribute('aria-label', 'Speaker power handling and risk');
  const title = document.createElement('h5');
  title.textContent = 'Speaker power handling · Your Speakers';
  box.append(title);

  function message(level, description) {
    const line = document.createElement('p');
    line.className = 'sc-safety-msg sc-safety-msg--' + level;
    line.textContent = description;
    box.append(line);
  }

  let flagged = false;
  if (averageW !== null && continuous !== null && averageW > continuous) {
    flagged = true;
    message('danger', 'Speaker stress warning: the estimated average demand ' + show(averageW)
      + ' W per speaker exceeds the published continuous-handling rating of ' + show(continuous)
      + ' W. Sustained playback at this target may overheat or damage the speaker.');
  }
  if (averageW !== null && nominal !== null && averageW > nominal) {
    flagged = true;
    message('caution', 'Speaker power caution: average demand ' + show(averageW)
      + ' W exceeds the published nominal input rating of ' + show(nominal)
      + ' W. Nominal is not a verified continuous thermal-test limit.');
  }
  if (peak !== null && peakW > peak) {
    flagged = true;
    message('danger', 'Speaker stress warning: peak demand ' + show(peakW)
      + ' W per speaker exceeds the manufacturer’s published ' + show(peak)
      + ' W peak-handling rating. Reduce the target or confirm the actual programme content; this is a risk indicator, not a prediction of immediate failure.');
  }
  if (maxInput !== null && Math.max(peakW, averageW ?? 0) > maxInput) {
    flagged = true;
    message('caution', 'Speaker power caution: the estimated '
      + (averageW !== null && averageW > maxInput ? 'average' : 'peak') + ' demand '
      + show(averageW !== null && averageW > maxInput ? averageW : peakW)
      + ' W exceeds the published maximum input of ' + show(maxInput)
      + ' W. The test duration for this maximum is unspecified, so it cannot be treated as a continuous or short-burst rating.');
  }
  if (peak === null && continuous !== null && peakW > continuous) {
    message('info', 'The requested peak exceeds the ' + show(continuous)
      + ' W continuous speaker rating, but no speaker peak-handling figure was supplied. That alone does not establish short-duration damage or a safe burst limit.');
  }
  if (nominal !== null && peak === null && peakW > nominal) {
    message('info', 'The requested peak exceeds the ' + show(nominal)
      + ' W nominal input value. Without an explicit peak-handling rating, the safe burst duration remains unknown.');
  }
  if (!hasHandling) {
    message('unverified', 'Speaker handling unverified: no model-specific continuous, nominal, peak or maximum-input rating is entered. The power demand is calculated, but speaker safety cannot be established from sensitivity and impedance alone.');
  } else if (!flagged) {
    message('info', 'Requested power is within the entered handling figures where their duration is applicable. This does not guarantee safety: bass excursion, crossover/tweeter heating, clipping, EQ boosts, and actual programme duration can still cause problems.');
  }
  if (recommended !== null) {
    message('info', 'Recommended amplifier range ends at ' + show(recommended)
      + ' W. This is amplifier selection guidance, NOT the speaker’s maximum safe input or a clipping/damage threshold.');
  }

  const sourceInput = speakerPowerFields.map(name => field(name))
    .find(input => input?.dataset?.powerSourceUrl);
  if (sourceInput) {
    const source = document.createElement('a');
    source.textContent = 'Manufacturer speaker-power specifications';
    source.href = sourceInput.dataset.powerSourceUrl;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    box.append(source);
  }
  card.append(box);
}

function appendAmplifierLoadSafety(card, { testLoad, actual, minimum, peakV, entries }) {
  const usableLoads = entries.filter(r => r.type === 'continuous' || r.type === 'burst')
    .map(r => r.load).filter(Number.isFinite);
  const minRatedLoad = usableLoads.length ? Math.min(...usableLoads) : NaN;
  if (!Number.isFinite(minRatedLoad)) return;
  const lowerNominal = testLoad < minRatedLoad - 1e-9;
  const measuredDip = actual && Number.isFinite(minimum) && minimum > 0
    && minimum < minRatedLoad - 1e-9;

  if (!lowerNominal && !measuredDip) return;
  const safety = document.createElement('p');
  safety.className = 'sc-amp-stress-warning';
  let message = 'Amplifier load-stress warning: ';
  if (lowerNominal) {
    message += 'The ' + show(testLoad) + ' Ω load is below your lowest entered amplifier test rating ('
      + show(minRatedLoad) + ' Ω). At the target voltage it asks for about '
      + show(peakV / testLoad) + ' A RMS per channel on short peaks. The amplifier may draw excessive current, overheat, trip protection or clip early. A same-voltage wattage projection is NOT evidence of safe operation.';
  }
  if (measuredDip) {
    if (lowerNominal) message += ' ';
    message += 'Your measured speaker minimum of ' + show(minimum)
      + ' Ω is also below the lowest tested amplifier load of ' + show(minRatedLoad)
      + ' Ω, increasing uncertainty about current demand (especially with reactive impedance phase).';
  }
  safety.textContent = message;
  card.append(safety);
}

function summarizePower({ mode, entries, load, minimum, peakV, averageV, peakW, averageW, peak, average }) {
  // Use the actual speaker load first and exactly two familiar alternative loads.
  // Different speakers have different sensitivities: alternatives share only the
  // current speaker's requested voltage, not an assumed measured acoustic output.
  const standardLoads = [4, 6, 8].filter(candidate => candidate !== load)
    .sort((a, b) => Math.abs(a - load) - Math.abs(b - load) || a - b).slice(0, 2)
    .sort((a, b) => a - b);
  const testLoads = [load, ...standardLoads];
  const noBurstInput = !entries.some(entry => entry.type === 'burst');

  const section = document.createElement('section');
  section.className = 'sc-load-results';
  section.setAttribute('aria-label', 'Amplifier headroom results by speaker impedance');
  const heading = document.createElement('h3');
  heading.textContent = mode === 'upgrade' || !entries.length
    ? 'Power needed at each speaker load'
    : 'Does your amplifier meet the goal?';
  section.append(heading);

  const explanation = document.createElement('p');
  explanation.className = 'sc-load-intro';
  explanation.textContent = 'All loads use the same target speaker-terminal voltage. Required watts change with impedance; real speakers also differ in sensitivity, impedance phase and current demand. Only Your Speakers uses the nominal speaker load you entered.';
  section.append(explanation);

  const stack = document.createElement('div');
  stack.className = 'sc-load-stack';
  section.append(stack);

  function chooseRating(testLoad, type) {
    return entries.filter(rating => rating.type === type && rating.load === testLoad)
      .sort((a, b) => b.watts - a.watts)[0] || null;
  }

  function projectRating(testLoad, type) {
    const options = entries.filter(rating => rating.type === type && rating.load !== testLoad)
      .sort((a, b) => Math.abs(a.load - testLoad) - Math.abs(b.load - testLoad)
        || a.load - b.load);
    const source = options[0];
    return source ? { watts: sameVoltageWatts(source, testLoad), source, projected: true } : null;
  }

  function directRating(rating) {
    return rating ? { watts: rating.watts, source: rating, projected: false } : null;
  }

  function metricLine(row, label, demand, enteredSPL, chosen, duration, classification) {
    const title = document.createElement('p');
    title.className = 'sc-load-metric-title';
    title.textContent = label + ' · Required ' + show(demand) + ' W/ch';
    row.append(title);

    if (!chosen) {
      const status = document.createElement('p');
      status.className = 'sc-load-verdict sc-load-verdict--unverified';
      status.textContent = 'Unverified · no usable ' + duration + ' amplifier rating';
      row.append(status);
      return { code: 'unverified', projected: false };
    }

    const available = chosen.watts;
    const covers = coversDemand(demand, available);
    const dbMargin = 10 * Math.log10(available / demand);
    const reserve = (1 - demand / available) * 100;
    const sourceType = chosen.source.type === 'burst' ? 'short-burst' : 'continuous';
    const sourceBasis = chosen.projected
      ? 'projected from ' + show(chosen.source.watts) + ' W at ' + show(chosen.source.load) + ' Ω (' + sourceType + ', constant-voltage assumption)'
      : 'entered ' + sourceType + ' rating at ' + show(chosen.source.load) + ' Ω';

    let statusText;
    let verdict;
    if (chosen.projected) {
      verdict = 'unverified';
      statusText = covers ? 'Unverified · projected to cover target' : 'Unverified · projected shortfall';
    } else if (!covers && classification === 'peak' && chosen.source.type !== 'burst') {
      verdict = 'unverified';
      statusText = 'Unverified · peak exceeds continuous rating';
    } else {
      verdict = covers ? 'pass' : 'fail';
      statusText = covers ? 'Pass' : 'Fail';
    }

    const badge = document.createElement('p');
    badge.className = 'sc-load-verdict sc-load-verdict--' + verdict;
    badge.textContent = statusText;
    row.append(badge);

    const supplied = document.createElement('p');
    supplied.className = 'sc-load-capacity';
    supplied.textContent = 'Available / assumed: ' + show(available) + ' W/ch · ' + sourceBasis;
    row.append(supplied);

    const headroom = document.createElement('p');
    headroom.className = 'sc-load-headroom';
    const pct = Math.abs(reserve) < .05 ? 0 : reserve;
    const decibels = Math.abs(dbMargin) < .05 ? 0 : dbMargin;
    const signedDb = (decibels > 0 ? '+' : '') + db(decibels);
    const signedPct = (pct > 0 ? '+' : '') + powerPercent(pct / 100);
    headroom.textContent = 'Headroom: ' + signedDb + ' dB · ' + signedPct
      + (pct >= 0 ? ' of available power in reserve' : ' (needs ' + powerPercent(-pct / 100) + ' more power)');
    row.append(headroom);

    if (!covers) {
      const boundary = document.createElement('p');
      boundary.className = 'sc-load-boundary';
      const estimatedSPL = enteredSPL + dbMargin;
      const limitLabel = chosen.projected ? 'Projected voltage-equivalent boundary'
        : chosen.source.type === 'burst' ? 'At the entered short-burst rating, estimated level boundary'
        : 'At the entered continuous rating, estimated level boundary';
      boundary.textContent = limitLabel + ': about ' + db(estimatedSPL)
        + ' dB SPL at the assumed seat, versus ' + db(enteredSPL) + ' dB target ('
        + db(Math.abs(dbMargin)) + ' dB short). '
        + (chosen.source.type === 'burst' && !chosen.projected
          ? 'This is the rated-power threshold, not an independently measured clipping point.'
          : chosen.projected
            ? 'This extrapolation is not a measured clipping threshold.'
            : 'Actual short-burst clipping level is unknown without a burst test.');
      row.append(boundary);
    }
    return { code: verdict, projected: chosen.projected };
  }

  let hasUnknown = false;
  let hasDefinitiveFailure = false;
  let anyProjection = false;

  for (const testLoad of testLoads) {
    const actual = testLoad === load;
    const card = document.createElement('article');
    card.className = 'sc-load-card' + (actual ? ' sc-load-card--yours' : ' sc-load-card--estimate');
    const name = document.createElement('h4');
    name.className = 'sc-load-heading';
    name.textContent = actual
      ? 'Your Speakers'
      : 'Estimated Performance with ' + show(testLoad) + ' Ω Speakers';
    card.append(name);
    const subtitle = document.createElement('p');
    subtitle.className = 'sc-load-subheading';
    subtitle.textContent = show(testLoad) + ' Ω '
      + (actual ? 'nominal speaker load you entered' : 'hypothetical test load; same voltage as Your Speakers');
    card.append(subtitle);

    const avgDemand = averageV === null ? null : averageV ** 2 / testLoad;
    const peakDemand = peakV ** 2 / testLoad;
    const cont = chooseRating(testLoad, 'continuous');
    const burst = chooseRating(testLoad, 'burst');
    const projectedCont = cont ? null : projectRating(testLoad, 'continuous');
    const projectedBurst = burst ? null : projectRating(testLoad, 'burst');

    const items = document.createElement('div');
    items.className = 'sc-load-metrics';
    card.append(items);

    if (avgDemand !== null) {
      const avgItem = document.createElement('div');
      avgItem.className = 'sc-load-metric';
      const assessment = metricLine(avgItem, 'Average', avgDemand, average,
        directRating(cont) || projectedCont, 'continuous', 'average');
      items.append(avgItem);
      if (assessment.code === 'fail') hasDefinitiveFailure = true;
      if (assessment.code === 'unverified') hasUnknown = true;
      if (assessment.projected) anyProjection = true;
    }

    const peakItem = document.createElement('div');
    peakItem.className = 'sc-load-metric';
    let peakRating;
    if (burst && (!cont || burst.watts >= cont.watts)) peakRating = directRating(burst);
    else if (cont) peakRating = directRating(cont);
    else peakRating = projectedBurst || projectedCont;

    const peakAssessment = metricLine(peakItem, 'Short peaks', peakDemand, peak, peakRating,
      'short-burst or continuous', 'peak');
    items.append(peakItem);
    if (peakAssessment.code === 'fail') hasDefinitiveFailure = true;
    if (peakAssessment.code === 'unverified') hasUnknown = true;
    if (peakAssessment.projected) anyProjection = true;

    if (!burst && mode === 'check' && entries.length) {
      const note = document.createElement('p');
      note.className = 'sc-load-burst-note';
      note.textContent = 'No short-burst power rating entered at ' + show(testLoad)
        + ' Ω. Passing a continuous rating is conservative; exceeding it does not confirm clipping.';
      card.append(note);
    }
    appendAmplifierLoadSafety(card, { testLoad, actual, minimum, peakV, entries });
    if (actual) appendSpeakerPowerSafety(card, { peakW, averageW });
    stack.append(card);
  }

  body.append(section);
  if (!entries.length || mode === 'upgrade') {
    addText('p', 'Pass/fail and headroom against an amplifier cannot be determined until continuous and/or short-burst output ratings are entered.');
    return;
  }

  if (noBurstInput) {
    const note = addText('p',
      'Burst-rating disclaimer: no short-burst wattage was entered. A continuous power rating is not a measured clipping limit for brief musical peaks. If the peak requirement is above continuous output, the result is Unverified, not a confirmed fail; the dB SPL boundary shown is only the continuous-rated level.');
    note.className = 'sc-load-caution';
  } else if (testLoads.some(testLoad => !chooseRating(testLoad, 'burst'))) {
    addText('p', 'Short-burst ratings were not supplied at every load. Any continuous-only or projected result is qualified inside its load card.');
  }

  if (anyProjection) addText('p',
    'Estimated Performance uses the nearest entered load rating projected at unchanged output voltage (P = V² / R). This is not a verified amplifier test at that impedance; a lower impedance may demand more current than the amplifier can supply.');

  if (hasDefinitiveFailure) addText('p',
    'A Fail marks an entered continuous or burst rating below the required power for that duration. The stated dB SPL boundary is a model estimate, not a measured clipping onset.');
  else if (hasUnknown) addText('p',
    'Unverified is not the same as Fail. More measured output-power and short-burst data are needed to establish the true limit.');

  if (entries.some(entry => entry.type === 'unknown')) {
    addText('p', 'Power ratings with an unspecified duration are not used in the verdict until labelled continuous or short-burst.');
  }
  if (minimum > 0 && minimum < load && !entries.some(entry => entry.load <= minimum)) {
    const ampModel = field('ampModel').value.trim();
    const note = addText('p', 'Your speakers dip to ' + show(minimum) + ' Ω. A lower-load bench test would help assess real current demand, independent of the nominal-load comparison above.');
    if (ampModel) note.append(' ', searchLink('Find a lower-load amp test', ampModel,
      show(minimum) + ' ohm amplifier power bench measurements'));
  }
  addText('p', 'Headroom is 10 log₁₀(available watts ÷ required watts) in dB. The percentage is the fraction of available power unused: 100 × (1 − required ÷ available). A negative percentage means more power is needed, not negative physical power.');
}

function calculate() {
  const mode = field('mode').value;
  const load = num('load');
  const enteredRatings = mode === 'check' ? readRatings() : [];
  const entries = enteredRatings.filter(rating => rating.load !== 2 || load === 2);
  const target = field('targetMode').value;
  const average = target === 'peak' ? null : num('average');
  const peak = num('peak');
  if (average !== null && peak < average) throw new Error('Enter a peak level at or above the average level.');
  if (peak > 135) throw new Error('Use a peak target of 135 dB SPL or less for this model.');
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
  summarizePower({ mode, entries, load, minimum, peakV, averageV, peakW, averageW, peak, average });
  if (minimum > 0) {
    const hz = num('minimumHz');
    const phase = num('phase');
    addText('h3', 'What the speaker’s impedance dip means');
    addText('p', 'At ' + show(minimum) + ' Ω' + (hz ? ' near ' + show(hz) + ' Hz' : '') + ', a peak at the target voltage could ask for about ' + show(peakV / minimum) + ' A, compared with ' + show(peakV / load) + ' A at the speaker’s nominal rating.' + (Number.isFinite(phase) ? ' The entered phase is ' + show(phase) + '°. The amp can face extra stress from a reactive load.' : ''));
  } else if (Number.isFinite(num('minimumHz')) || Number.isFinite(num('phase'))) {
    addText('p', 'Add the minimum measured impedance to use its frequency or phase.');
  }
  if (room || pair) {
    addText('p', 'Your room and speaker settings shift the estimate by ' + db(room + pair) + ' dB combined. With those settings at zero, the same peak would call for about ' + show(peakW * 10 ** ((room + pair) / 10)) + ' W per channel.');
  }
  if (mode === 'check') {
    curveReading(peakV, averageV, load);
    renderConnections(peakV, enteredRatings, load);
  }
  const summaryCount = body.children.length;
  body.append(table(['Listening goal', 'Power/ch.', 'Voltage RMS', 'Current RMS'], rows));
  addText('p', 'The watt and current estimates use ' + show(load) + ' Ω nominal as a fixed load. Assumed seat distance: ' + show(distance) + ' ft. Speaker summation: +' + pair + ' dB. Room adjustment: ' + room + ' dB.');
  if (!Number.isFinite(minimum) && field('speakerModel').value.trim()) {
    const paragraph = addText('p', 'A measured impedance dip can help check how much current this speaker could ask for. ');
    paragraph.append(searchLink('Find an impedance measurement', field('speakerModel').value.trim(), 'speaker measured impedance minimum phase'));
  }
  if (mode === 'check') {
    addText('h3', 'Compare with your amplifier');
    if (!entries.length) addText('p', 'Add a wattage and its test load to compare your amplifier against this demand.');
    if (entries.length) {
      const lines = document.createElement('ul');
      for (const rating of entries) {
        const { watts, load: testLoad, type, conditions } = rating;
        const maxV = Math.sqrt(watts * testLoad);
        const label = type === 'continuous' ? 'continuous' : type === 'burst' ? 'short-burst' : 'duration unspecified';
        let line = show(watts) + ' W into ' + show(testLoad) + ' Ω (' + label + ') implies ' + show(maxV) + ' V RMS. The speaker model estimates ' + db(referenceAtSeat + 20 * Math.log10(maxV / reference)) + ' dB at the seat at that voltage. ';
        line += 'The peak target corresponds to ' + show(peakV ** 2 / testLoad) + ' W at this load.';
        if (averageV !== null && type === 'continuous') line += ' The average target corresponds to ' + show(averageV ** 2 / testLoad) + ' W.';
        if (conditions) line += ' Entered test conditions: ' + conditions + '.';
        if (testLoad !== load) line += ' This rating uses a different load from your speaker’s nominal impedance.';
        const item = document.createElement('li');
        item.textContent = line;
        appendRatingSource(item, rating);
        lines.append(item);
      }
      body.append(lines);
    }
  }
  addText('h3', 'If you want more headroom');
  addText('p', 'For another 3 dB of peak reserve, look for about ' + show(peakW * 10 ** .3) + ' W into the same load. Speakers rated 3 dB more sensitive on the same basis would cut the estimated power needed for your current goal roughly in half.');
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Show the math and test conditions';
  details.append(summary, ...Array.from(body.children).slice(summaryCount));
  body.append(details);
}

const presetFields = {
  speaker: ['sensitivity', 'basis', 'load', 'minimum', 'minimumHz', 'phase', 'maximum', ...speakerPowerFields],
  amp: ['inputZ', 'inputSensitivity', 'gain', 'outputZ', 'curveLoad', 'curveHz', 'curveType', 'curve'],
  source: ['sourceVoltage', 'sourceZ']
};

function mountGearPresets(catalog) {
  const selections = new URLSearchParams(location.search);
  for (const picker of document.querySelectorAll('[data-gear]')) {
    const kind = picker.dataset.gear;
    const options = catalog[kind];
    if (!options?.length) continue;
    const select = picker.querySelector('select');
    const note = picker.querySelector('p');
    options.forEach((gear, index) => select.add(new Option(gear.model, String(index))));
    picker.hidden = false;

    select.addEventListener('change', () => {
      const gear = select.value === '' ? null : options[Number(select.value)];
      note.replaceChildren();
      if (!gear) {
        if (kind === 'speaker') {
          for (const name of speakerPowerFields) {
            field(name).value = '';
            delete field(name).dataset.powerSourceUrl;
          }
          const provenance = document.querySelector('#speaker-power-provenance');
          if (provenance) provenance.textContent = 'Enter speaker-specific handling ratings manually, or choose a verified preset. Unknown limits are not assumed to be safe.';
        }
        return;
      }
      for (const name of presetFields[kind] || []) {
        const fallback = name === 'basis' ? 'voltage' : name === 'curveType' ? 'THD+N' : '';
        field(name).value = gear.values?.[name] ?? fallback;
      }
      if (kind === 'speaker') {
        const powerNote = document.querySelector('#speaker-power-provenance');
        for (const name of speakerPowerFields) {
          const powerInput = field(name);
          delete powerInput.dataset.powerSourceUrl;
          if (gear.values?.speakerPowerSource && Number.isFinite(gear.values[name])) {
            powerInput.dataset.powerSourceUrl = gear.values.speakerPowerSource;
          }
        }
        if (powerNote) {
          powerNote.replaceChildren();
          powerNote.append(gear.values?.speakerPowerNote
            || 'No verified power-handling values for this exact speaker preset. Empty fields remain unverified.');
          if (gear.values?.speakerPowerSource) {
            const link = document.createElement('a');
            link.href = gear.values.speakerPowerSource;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'Verify published handling ratings';
            powerNote.append(' ', link);
          }
        }
      }
      if (kind === 'amp') {
        ratings.replaceChildren();
        gear.ratings.forEach(rating => addRating(...rating, gear.url));
      }
      if (kind === 'speaker' || kind === 'amp') {
        const model = field(kind + 'Model');
        model.value = gear.model.replace(/ \(US\/Canada\)$/, '');
        model.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const source = document.createElement('a');
      source.href = gear.url;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      source.textContent = 'View source';
      if (kind === 'headphone' && gear.values?.sensitivity) {
        const { load, sensitivity, basis } = gear.values;
        const reference = basis === 'power' ? '1 mW' : '1 V RMS';
        note.append(show(load) + ' Ω nominal, ' + show(sensitivity) + ' dB SPL at ' + reference + '. ');
      }
      note.append(gear.note + ' ', source);
      if (gear.extra) {
        const more = source.cloneNode();
        more.textContent = gear.extra[0];
        more.href = gear.extra[1];
        note.append(' · ', more);
      }
      const compare = document.createElement('a');
      compare.href = '/system-check/compare/?' + new URLSearchParams({ type: kind, left: gear.model });
      compare.textContent = 'Compare this gear';
      note.append(' · ', compare);
    });

    const selected = options.findIndex(gear => gear.model === selections.get(kind));
    if (selected >= 0) {
      select.value = String(selected);
      select.dispatchEvent(new Event('change'));
      const details = picker.closest('details');
      if (details) details.open = true;
    }
  }
}

for (const name of speakerPowerFields) {
  field(name).addEventListener('input', () => {
    delete field(name).dataset.powerSourceUrl;
    const provenance = document.querySelector('#speaker-power-provenance');
    if (provenance && !speakerPowerFields.some(item => field(item).dataset.powerSourceUrl)) {
      provenance.textContent = 'Power-handling values edited manually. Verify them against the exact model’s manufacturer documentation.';
    }
  });
}
if (typeof systemCheckGear !== 'undefined') mountGearPresets(systemCheckGear);

if (!ratings.children.length) addRating();
sync();
field('targetMode').addEventListener('change', () => {
  if (field('targetMode').value === 'peak') levelAnchor = 'peak';
  sync();
});
for (const name of ['peak', 'average']) {
  field(name).addEventListener('input', () => {
    levelAnchor = name;
    syncLevels();
  });
}
field('gap').addEventListener('input', syncLevels);
for (const option of field('mode')) option.addEventListener('change', sync);
document.querySelector('#add-rating').addEventListener('click', () => addRating().querySelector('input').focus());
document.querySelector('#example').addEventListener('click', () => {
  form.reset();
  for (const note of document.querySelectorAll('[data-gear] p')) note.replaceChildren();
  levelAnchor = 'average';
  field('sensitivity').value = 89;
  field('basis').value = 'voltage';
  field('average').value = 87;
  field('gap').value = 15;
  field('load').value = 8;
  for (const name of speakerPowerFields) {
    field(name).value = '';
    delete field(name).dataset.powerSourceUrl;
  }
  document.querySelector('#speaker-power-provenance').textContent = 'Fictional lesson example: no speaker power-handling specification has been assumed.';
  field('distance').value = 8;
  field('speakers').value = '3';
  ratings.replaceChildren();
  for (const [watts, load] of [[80, 8], [100, 4]]) {
    addRating(watts, load, 'continuous', 'Fictional lesson rating');
    addRating(watts, load, 'burst', 'Fictional lesson peak limit');
  }
  for (const links of form.querySelectorAll('.sc-searches')) links.replaceChildren();
  if (specPanel) {
    specPanel.hidden = true;
    lastSearch++;
    googleResults?.then(results => results.clearAllResults()).catch(() => {});
  }
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
