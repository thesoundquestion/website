'use strict';

const compareTool = document.querySelector('#compare-tool');
const parameters = new URLSearchParams(location.search);
const format = new Intl.NumberFormat('en-CA', { maximumSignificantDigits: 3 });
const show = value => format.format(value);
const manual = '__manual__';
const missing = '—';
const enriched = typeof compareGearDetails !== 'undefined' ? compareGearDetails : {};
const detailFor = (type, model) => enriched[type]?.[model] || {};

const equipment = {
  amp: {
    lesson: ['/decoder/amplifier-power/#headroom', 'Read about amplifier power and headroom'],
    fields: [
      ['watts', 'Power per channel (W)', 'number', .001],
      ['load', 'Test load (Ω)', 'number', .1],
      ['duration', 'Rating duration', 'select', [['continuous', 'Continuous'], ['burst', 'Short burst'], ['unknown', 'Unspecified']]],
      ['conditions', 'Test conditions', 'text', 'Frequency, distortion, channels'],
    ],
  },
  speaker: {
    lesson: ['/decoder/speaker-sensitivity/', 'Read about speaker sensitivity'],
    fields: [
      ['sensitivity', 'Sensitivity (dB SPL)', 'number', 1],
      ['basis', 'Sensitivity reference', 'select', [['voltage', '2.83 V at 3.28 ft'], ['power', '1 W at 3.28 ft']]],
      ['load', 'Nominal impedance (Ω)', 'number', .1],
      ['minimum', 'Minimum impedance (Ω)', 'number', .1],
      ['configuration', 'Ways / driver arrangement', 'text', 'e.g. 3-way / four drivers'],
      ['drivers', 'Driver sizes and materials', 'text', 'e.g. 6.5-inch woofer, 1-inch soft-dome'],
      ['enclosure', 'Enclosure / acoustic loading', 'text', 'e.g. bass reflex'],
      ['frequencyResponse', 'Published frequency range', 'text', 'e.g. 50 Hz–20 kHz'],
      ['responseBasis', 'Response tolerance or test basis', 'text', 'e.g. ±3 dB, on-axis'],
      ['responseExtra', 'Additional published response limit', 'text', 'e.g. 40 Hz (−6 dB)'],
      ['crossover', 'Crossover frequency/frequencies', 'text', 'e.g. 500 Hz / 2.4 kHz'],
    ],
  },
  source: {
    lesson: ['/decoder/dac-specifications/', 'Read about DAC measurements'],
    fields: [
      ['sourceVoltage', 'Maximum line output (V RMS)', 'number', .001],
      ['sourceZ', 'Output impedance (Ω)', 'number', 0],
      ['sourceConnection', 'Output connection', 'select', [['RCA', 'RCA'], ['XLR', 'XLR'], ['3.5 mm', '3.5 mm'], ['Other', 'Other']]],
      ['sourceSnr', 'Signal-to-noise ratio', 'text', 'dB and test conditions'],
      ['sourceThdn', 'THD+N', 'text', '% and test conditions'],
      ['deviceType', 'Device type / computer connection', 'text', 'e.g. PCIe sound card or USB DAC'],
      ['dacDynamicRange', 'Stereo DAC dynamic range (DNR)', 'text', 'dB and measurement conditions'],
      ['outputChannels', 'Analogue channel support', 'text', 'e.g. stereo or 5.1'],
      ['converter', 'DAC chip / converter architecture', 'text', 'e.g. AK4493SEQ'],
      ['digitalInputs', 'Digital connections and streaming', 'text', 'e.g. USB / optical / coaxial'],
      ['pcmUSB', 'PCM support via USB', 'text', 'e.g. 24-bit / 192 kHz'],
      ['pcmPCIe', 'PCM / DAC via PCIe computer audio', 'text', 'e.g. 24-bit / 96 kHz RCA output'],
      ['pcmSpdif', 'PCM via optical/coax', 'text', 'e.g. 24-bit / 96 kHz'],
      ['dsd', 'DSD support (if known)', 'text', 'e.g. native DSD256 on USB'],
      ['analogResponse', 'Analogue output frequency response', 'text', 'e.g. 20 Hz–20 kHz ±0.1 dB'],
    ],
  },
  headphone: {
    lesson: ['/decoder/headphone-sensitivity/', 'Read about driving headphones'],
    fields: [
      ['sensitivity', 'Sensitivity (dB SPL)', 'number', 1],
      ['basis', 'Sensitivity reference', 'select', [['power', '1 mW'], ['voltage', '1 V RMS']]],
      ['load', 'Nominal impedance (Ω)', 'number', .1],
      ['sensitivityConditions', 'Sensitivity test conditions', 'text', 'e.g. at 1 kHz'],
      ['transducer', 'Transducer construction', 'text', 'e.g. dynamic, open back'],
      ['driverSize', 'Driver diameter (if published)', 'text', 'e.g. 40 mm'],
      ['diaphragm', 'Diaphragm material / motor', 'text', 'e.g. PET diaphragm'],
      ['frequencyResponse', 'Manufacturer frequency range', 'text', 'e.g. 12 Hz–40 kHz'],
      ['responseBasis', 'Frequency-range tolerance / basis', 'text', 'e.g. no tolerance stated'],
      ['connector', 'Cable / connector', 'text', 'e.g. detachable MMCX'],
    ],
  },
};

const newSide = () => ({ model: '', values: {} });
const comparisons = Object.fromEntries(Object.keys(equipment).map(kind => [kind, [newSide(), newSide()]]));
const kindButtons = [...compareTool.querySelectorAll('[data-kind]')];
const sides = [...compareTool.querySelectorAll('[data-side]')].map(root => ({
  filter: root.querySelector('[data-filter]'),
  select: root.querySelector('[data-preset]'),
  fields: root.querySelector('[data-manual]'),
}));
const status = document.querySelector('#compare-status');
const result = document.querySelector('#comparison');
const rows = document.querySelector('#comparison-rows');
let kind = Object.hasOwn(equipment, parameters.get('type')) ? parameters.get('type') : 'amp';

function element(tag, text = '') {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function linkedText(label, url, external = false) {
  const link = element('a', label);
  link.href = url;
  if (external) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  return link;
}

function reading(value, unit) {
  return Number.isFinite(value) ? show(value) + ' ' + unit : missing;
}

function withCondition(value, condition) {
  const wrap = element('div', value);
  if (condition) {
    const note = element('span', condition);
    note.className = 'gc-conditions';
    wrap.append(note);
  }
  return wrap;
}

function addRow(label, values) {
  const row = element('tr');
  const header = element('th', label);
  header.scope = 'row';
  row.append(header);
  for (const value of values) {
    const cell = element('td');
    cell.append(value ?? missing);
    row.append(cell);
  }
  rows.append(row);
}

function addSection(label) {
  const row = element('tr');
  row.className = 'gc-section-row';
  const header = element('th', label);
  header.scope = 'colgroup';
  header.colSpan = 3;
  row.append(header);
  rows.append(row);
}

function specValue(value) {
  return typeof value === 'string' && value.trim() ? value : missing;
}

function rowOfSpecs(label, devices, field) {
  addRow(label, devices.map(device => specValue(device.values[field])));
}

function responseReading(values) {
  if (!values.frequencyResponse) return missing;
  return withCondition(values.frequencyResponse, values.responseBasis || 'Tolerance not stated');
}

function normalizedSensitivity(values, referenceVoltage, powerWatts) {
  if (!Number.isFinite(values.sensitivity)) return NaN;
  if (values.basis === 'voltage') return values.sensitivity;
  if (values.basis !== 'power' || !(values.load > 0)) return NaN;
  return values.sensitivity + 20 * Math.log10(referenceVoltage / Math.sqrt(powerWatts * values.load));
}

function sensitivityReading(values, speaker) {
  if (!Number.isFinite(values.sensitivity) || !values.basis) return missing;
  const reference = speaker
    ? (values.basis === 'power' ? '1 W at 3.28 ft' : '2.83 V at 3.28 ft')
    : (values.basis === 'power' ? '1 mW' : '1 V RMS');
  const condition = values.sensitivityConditions ? ' · ' + values.sensitivityConditions : '';
  return withCondition(reading(values.sensitivity, 'dB SPL'), reference + condition);
}

function amplifierRows(devices) {
  const buckets = new Map();
  devices.forEach((device, index) => {
    for (const rating of device.ratings ?? []) {
      const [, load, duration] = rating;
      const key = load + '/' + duration;
      if (!buckets.has(key)) buckets.set(key, { load, duration, entries: [[], []] });
      buckets.get(key).entries[index].push(rating);
    }
  });
  const durations = { continuous: 'continuous', burst: 'short burst', unknown: 'duration unspecified' };
  const sorted = [...buckets.values()].sort((a, b) => a.load - b.load || Object.keys(durations).indexOf(a.duration) - Object.keys(durations).indexOf(b.duration));
  for (const bucket of sorted) {
    addRow(show(bucket.load) + ' Ω · ' + durations[bucket.duration], bucket.entries.map(entries => {
      if (!entries.length) return missing;
      const list = element('div');
      for (const [watts, , , conditions] of entries) {
        const rating = withCondition(reading(watts, 'W/ch'), conditions);
        rating.className = 'gc-rating';
        list.append(rating);
      }
      return list;
    }));
  }
  addRow('Input sensitivity', devices.map(({ values }) => reading(values.inputSensitivity * 1000, 'mV')));
  addRow('Input impedance', devices.map(({ values }) => reading(values.inputZ, 'kΩ')));
  addRow('Output impedance', devices.map(({ values }) => reading(values.outputZ, 'Ω')));
  return 'Start with the power row for your speaker’s impedance. Compare the frequency range, distortion limit and channels driven under each rating.';
}

function sensitivityTakeaway(devices, normalized, label) {
  if (!normalized.every(Number.isFinite)) return 'Add a sensitivity figure with its reference and a nominal impedance to compare on the same basis.';
  const difference = Math.abs(normalized[0] - normalized[1]);
  if (difference < .05) return 'The listed sensitivities give about the same output at the same voltage, assuming comparable tests.';
  const higher = normalized[0] > normalized[1] ? devices[0] : devices[1];
  const voltagePercent = Math.round(100 * 10 ** (-difference / 20));
  return higher.model + ' has about ' + difference.toFixed(1) + ' dB higher ' + label + '. It would need about ' + voltagePercent + '% as much voltage for the same sound level if the sensitivity tests are comparable.';
}

function speakerRows(devices) {
  addSection('Speaker construction and acoustic response');
  rowOfSpecs('Ways / configuration', devices, 'configuration');
  rowOfSpecs('Drivers, sizes and materials', devices, 'drivers');
  rowOfSpecs('Enclosure / loading', devices, 'enclosure');
  addRow('Published frequency response', devices.map(({ values }) => responseReading(values)));
  if (devices.some(({ values }) => values.responseExtra)) rowOfSpecs('Additional response limit', devices, 'responseExtra');
  rowOfSpecs('Crossover points', devices, 'crossover');
  addSection('Sensitivity and electrical load');
  const sensitivity = devices.map(({ values }) => normalizedSensitivity(values, 2.83, 1));
  addRow('Listed sensitivity', devices.map(({ values }) => sensitivityReading(values, true)));
  addRow('Sensitivity at 2.83 V / 3.28 ft', sensitivity.map(value => reading(value, 'dB SPL')));
  addRow('Nominal impedance', devices.map(({ values }) => reading(values.load, 'Ω')));
  addRow('Minimum impedance', devices.map(({ values }) => {
    return withCondition(reading(values.minimum, 'Ω'), Number.isFinite(values.minimumHz) ? 'at ' + reading(values.minimumHz, 'Hz') : '');
  }));
  return sensitivityTakeaway(devices, sensitivity, 'sensitivity at 2.83 V') + ' Driver count and published frequency limits do not establish sound quality; look for comparable measured curves and distortion.';
}

function dacMeasurement(value) {
  return Array.isArray(value) ? withCondition(value[0], value[1]) : (value || missing);
}

function sourceRows(devices) {
  addSection('Conversion, digital formats and connectivity');
  rowOfSpecs('Device type / interface', devices, 'deviceType');
  rowOfSpecs('DAC converter / architecture', devices, 'converter');
  rowOfSpecs('Analogue output channels', devices, 'outputChannels');
  rowOfSpecs('Digital connections / streaming', devices, 'digitalInputs');
  rowOfSpecs('PCM via USB', devices, 'pcmUSB');
  if (devices.some(({ values }) => values.pcmPCIe)) rowOfSpecs('PCM / DAC via PCIe audio', devices, 'pcmPCIe');
  rowOfSpecs('PCM via optical / coaxial', devices, 'pcmSpdif');
  rowOfSpecs('DSD input support', devices, 'dsd');
  addSection('Analogue output and published performance');
  rowOfSpecs('Analogue frequency response', devices, 'analogResponse');
  if (devices.some(({ values }) => values.dacDynamicRange)) addRow('DAC dynamic range (DNR)', devices.map(({ values }) => dacMeasurement(values.dacDynamicRange)));

  const values = devices.map(device => device.values);
  const voltage = values.map(spec => spec.sourceVoltage);
  addRow('Line output connection', values.map(spec => spec.sourceConnection || missing));
  addRow('Maximum line output', voltage.map(value => reading(value, 'V RMS')));
  addRow('Output impedance', values.map(spec => {
    const value = reading(spec.sourceZ, 'Ω');
    return spec.sourceZLimit ? '≤' + value : value;
  }));
  addRow('Signal-to-noise ratio', values.map(spec => dacMeasurement(spec.sourceSnr)));
  addRow('THD+N', values.map(spec => dacMeasurement(spec.sourceThdn)));
  const connectionMatches = values[0].sourceConnection && values[0].sourceConnection === values[1].sourceConnection;
  const conditions = 'Digital format support describes compatibility, not effective analogue resolution or audible quality. Manufacturer DAC dynamic range (DNR), whole-card SNR and measured analogue-output SNR may use different test conditions and should not be treated as the same figure. Compare noise and distortion only when output, signal level, bandwidth and weighting match.';
  if (!connectionMatches || voltage.some(value => !(value > 0))) return conditions;
  const difference = Math.abs(20 * Math.log10(voltage[0] / voltage[1]));
  if (difference < .05) return 'The listed full-scale voltages match. ' + conditions;
  const higher = voltage[0] > voltage[1] ? devices[0] : devices[1];
  return higher.model + ' is about ' + difference.toFixed(1) + ' dB higher at full scale. That can change the playback level at the same amp setting. ' + conditions;
}

function headphoneRows(devices) {
  addSection('Transducers, acoustics and physical fit');
  addRow('Design / fit', devices.map(({ values }) => specValue(values.design)));
  rowOfSpecs('Transducer technology', devices, 'transducer');
  rowOfSpecs('Driver size', devices, 'driverSize');
  rowOfSpecs('Diaphragm / material', devices, 'diaphragm');
  addRow('Published frequency range', devices.map(({ values }) => responseReading(values)));
  rowOfSpecs('Cable / connectors', devices, 'connector');
  addSection('Sensitivity and source requirements');
  const sensitivity = devices.map(({ values }) => normalizedSensitivity(values, 1, .001));
  const exampleVoltage = sensitivity.map(value => 10 ** ((90 - value) / 20));
  addRow('Nominal impedance', devices.map(({ values }) => reading(values.load, 'Ω')));
  addRow('Listed sensitivity', devices.map(({ values }) => sensitivityReading(values, false)));
  addRow('Sensitivity at 1 V RMS', sensitivity.map(value => reading(value, 'dB SPL')));
  addRow('Voltage for 90 dB SPL · estimate', exampleVoltage.map(value => reading(value * 1000, 'mV RMS')));
  addRow('Current for 90 dB SPL · estimate', devices.map(({ values }, index) => reading(1000 * exampleVoltage[index] / values.load, 'mA RMS')));
  return sensitivityTakeaway(devices, sensitivity, 'sensitivity at 1 V RMS') + ' Frequency-range endpoints alone do not describe tonal balance. Fit, pads and measurement fixtures can change the actual response.';
}

function currentDevice(index) {
  const selection = comparisons[kind][index];
  if (selection.model !== manual) {
    const preset = systemCheckGear[kind].find(device => device.model === selection.model);
    if (!preset) return undefined;
    const details = detailFor(kind, preset.model);
    return { ...preset, values: { ...preset.values, ...details }, detailedReference: details.reference, secondReference: details.secondReference, thirdReference: details.thirdReference, detailNote: details.detailNote, reviewStatus: details.reviewStatus, reviewedOn: details.reviewedOn };
  }
  const { name, watts, duration, conditions, ...values } = selection.values;
  const ratings = watts > 0 && values.load > 0 ? [[watts, values.load, duration || 'unknown', conditions ?? '']] : [];
  return {
    model: name || (index === 0 ? 'Your gear' : 'Comparison gear'),
    values,
    ratings,
    note: 'Manually entered specifications.',
    manual: true,
  };
}

function deviceLinks(device) {
  const notes = withCondition(device.note || missing);
  if (device.url) notes.append(linkedText('Preset source', device.url, true));
  if (device.detailedReference && device.detailedReference !== device.url) notes.append(linkedText('Detailed specifications', device.detailedReference, true));
  if (device.secondReference) notes.append(linkedText('Additional specification reference', device.secondReference, true));
  if (device.thirdReference) notes.append(linkedText('Converter-chip identification reference', device.thirdReference, true));
  if (device.detailNote) notes.append(withCondition('', device.detailNote));
  if (device.extra) notes.append(linkedText(device.extra[0], device.extra[1], true));
  if (device.url && kind !== 'headphone') {
    notes.append(linkedText('Use in System Check', '/system-check/?' + new URLSearchParams({ [kind]: device.model })));
  }
  return notes;
}

function showComparison() {
  const devices = sides.map((_, index) => currentDevice(index));
  const ready = devices.every(Boolean);
  result.hidden = !ready;
  status.hidden = ready;
  if (!ready) return;
  document.querySelector('#left-heading').textContent = devices[0].model;
  document.querySelector('#right-heading').textContent = devices[1].model;
  rows.replaceChildren();
  const render = { amp: amplifierRows, speaker: speakerRows, source: sourceRows, headphone: headphoneRows }[kind];
  document.querySelector('#comparison-takeaway').textContent = render(devices);
  if (kind !== 'amp') addRow('Specification source review', devices.map(device => {
    if (device.manual) return 'Entered manually · unverified';
    if (device.reviewStatus === 'manufacturer-checked') return withCondition('Manufacturer specification cross-checked', device.reviewedOn || '');
    if (device.reviewStatus === 'manufacturer-and-distributor') return withCondition('Manufacturer manual + archived distributor checked', device.reviewedOn || '');
    if (device.reviewStatus === 'secondary-reviewed') return withCondition('Secondary source only · check before relying on figures', device.reviewedOn || '');
    if (device.reviewStatus === 'manufacturer-conflict') return withCondition('Conflicting manufacturer documentation · see notes and both sources', device.reviewedOn || '');
    if (device.reviewStatus === 'period-technical-source') return withCondition('Period technical literature cross-checked', device.reviewedOn || '');
    if (device.reviewStatus === 'regional-distributor') return withCondition('Regional distributor source · not fully verified', device.reviewedOn || '');
    if (device.reviewStatus === 'period-distributor') return withCondition('Archived distributor literature · test basis limited', device.reviewedOn || '');
    if (device.reviewStatus === 'not-verified') return withCondition('Model-specific specifications not verified', 'Unconfirmed construction and response figures remain blank.');
    return withCondition('Not fully reviewed', 'Use the source links below; unconfirmed fields may be blank.');
  }));
  addRow('Notes and sources', devices.map(deviceLinks));
  const lesson = document.querySelector('#comparison-lesson');
  [lesson.href, lesson.textContent] = equipment[kind].lesson;
}

const searchKey = value => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function fillOptions(side, index) {
  const selected = comparisons[kind][index].model;
  const filter = searchKey(side.filter.value);
  side.select.replaceChildren(new Option('Choose a model', ''), new Option('Enter specs manually', manual));
  for (const device of systemCheckGear[kind]) {
    if (device.model === selected || searchKey(device.model).includes(filter)) {
      side.select.add(new Option(device.model, device.model));
    }
  }
  side.select.value = selected;
}

function showManualFields(side, index) {
  const selected = comparisons[kind][index];
  side.fields.hidden = selected.model !== manual;
  side.fields.replaceChildren();
  if (side.fields.hidden) return;
  const specs = [['name', 'Model name (optional)', 'text', 'Your model'], ...equipment[kind].fields];
  for (const [name, caption, type, setting] of specs) {
    const label = element('label', caption);
    const control = element(type === 'select' ? 'select' : 'input');
    if (type === 'select') {
      control.add(new Option('Choose a value', ''));
      for (const [value, text] of setting) control.add(new Option(text, value));
    } else {
      control.type = type;
      if (type === 'number') {
        control.min = setting;
        control.step = 'any';
      } else {
        control.placeholder = setting;
        control.maxLength = 140;
      }
    }
    control.value = selected.values[name] ?? '';
    control.addEventListener('input', () => {
      if (type === 'number') {
        selected.values[name] = control.validity.valid && control.value ? control.valueAsNumber : undefined;
      } else {
        selected.values[name] = control.value.trim();
      }
      showComparison();
    });
    label.append(control);
    side.fields.append(label);
  }
}

function updateAddress() {
  const query = new URLSearchParams({ type: kind });
  for (const [index, key] of ['left', 'right'].entries()) {
    const name = comparisons[kind][index].model;
    if (name && name !== manual) query.set(key, name);
  }
  history.replaceState(null, '', '?' + query + location.hash);
}

function showCategory() {
  for (const button of kindButtons) button.setAttribute('aria-pressed', String(button.dataset.kind === kind));
  sides.forEach((side, index) => {
    side.filter.value = '';
    fillOptions(side, index);
    showManualFields(side, index);
  });
  showComparison();
}

if (typeof systemCheckGear !== 'undefined') {
  sides.forEach((side, index) => {
    const preselected = parameters.get(index === 0 ? 'left' : 'right');
    if (systemCheckGear[kind].some(device => device.model === preselected)) {
      comparisons[kind][index].model = preselected;
    }
    side.filter.addEventListener('input', () => fillOptions(side, index));
    side.select.addEventListener('change', () => {
      comparisons[kind][index].model = side.select.value;
      showManualFields(side, index);
      showComparison();
      updateAddress();
    });
  });
  for (const button of kindButtons) {
    button.addEventListener('click', () => {
      kind = button.dataset.kind;
      showCategory();
      updateAddress();
    });
  }
  showCategory();
  compareTool.hidden = false;
}
