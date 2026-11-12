// Self-contained regression checks for Compare My Gear. Run: node --test tests/compare-gear.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = file => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const gearSource = read('system-check/gear.js');
const detailSource = read('system-check/compare/specs.js');
const compareSource = read('system-check/compare/compare.js');
const html = read('system-check/compare/index.html');
const gear = vm.runInNewContext(gearSource + '\nsystemCheckGear', {});
const details = vm.runInNewContext(detailSource + '\ncompareGearDetails', {});

test('every supplemental model matches an exact existing preset with no duplicates', () => {
  for (const kind of ['speaker', 'source', 'headphone']) {
    const names = gear[kind].map(item => item.model);
    assert.equal(names.length, new Set(names).size, kind + ' duplicate presets');
    for (const [model, item] of Object.entries(details[kind])) {
      assert.ok(names.includes(model), kind + ' missing: ' + model);
      assert.ok(item.reference?.startsWith('https://'), model + ' lacks detail source');
      if (item.frequencyResponse) assert.ok(item.responseBasis, model + ' lacks response test basis');
      if (item.reviewStatus) {
        assert.ok(item.reviewedOn, model + ' lacks verification date');
        assert.ok(['manufacturer-checked','manufacturer-and-distributor','secondary-reviewed','manufacturer-conflict','period-technical-source','regional-distributor','period-distributor','not-verified'].includes(item.reviewStatus));
      }
    }
  }
});

test('calculator presets remain numeric and physically plausible', () => {
  for (const kind of ['speaker','headphone','amp','source']) {
    for (const item of gear[kind]) {
      assert.ok(item.model);
      for (const prop of ['load','minimum','sensitivity','sourceVoltage','sourceZ','inputSensitivity','inputZ']) {
        const n = item.values?.[prop];
        if (n !== undefined) assert.ok(typeof n === 'number' && Number.isFinite(n) && n >= 0, item.model + '/' + prop);
      }
    }
  }
});

test('the comparison loads gear, extended specifications and UI logic in that order', () => {
  const scriptSources = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1].split('?')[0]);
  assert.deepEqual(scriptSources, [
    '/system-check/gear.js',
    '/system-check/compare/specs.js',
    '/system-check/compare/compare.js'
  ]);
  assert.match(compareSource, /function speakerRows/);
  assert.match(compareSource, /function sourceRows/);
  assert.match(compareSource, /function headphoneRows/);
  assert.match(compareSource, /function amplifierRows/);
});

class MockNode {
  constructor(tag, text = '') {
    this.tag = tag; this._text = String(text); this.children = [];
    this.dataset = {}; this.attrs = {}; this.hidden = false; this.value = '';
  }
  get textContent() { return this._text + this.children.map(x => typeof x === 'string' ? x : x?.textContent ?? '').join(''); }
  set textContent(value) { this._text = String(value); this.children = []; }
  append(...nodes) { this.children.push(...nodes.filter(x => x != null)); }
  replaceChildren(...nodes) { this.children = []; this._text = ''; this.append(...nodes); }
  add(node) { this.children.push(node); }
  setAttribute(key, value) { this.attrs[key] = String(value); }
  addEventListener(name, handler) { this['on' + name] = handler; }
  querySelector(selector) { return this.els?.[selector] ?? null; }
  querySelectorAll(selector) { return this.lists?.[selector] ?? []; }
}
class MockOption { constructor(text, value) { this.text = text; this.value = value; } }

function renderFixture(type, left, right) {
  const root = new MockNode('div');
  const buttons = ['amp','speaker','source','headphone'].map(kind => {
    const button = new MockNode('button'); button.dataset.kind = kind; return button;
  });
  const sideRoots = [0,1].map(() => {
    const side = new MockNode('fieldset');
    side.els = { '[data-filter]':new MockNode('input'), '[data-preset]':new MockNode('select'), '[data-manual]':new MockNode('div') };
    return side;
  });
  root.lists = { '[data-kind]':buttons, '[data-side]':sideRoots };
  const elements = {
    '#compare-tool':root,
    '#compare-status':new MockNode('p'),
    '#comparison':new MockNode('section'),
    '#comparison-rows':new MockNode('tbody'),
    '#left-heading':new MockNode('th'),
    '#right-heading':new MockNode('th'),
    '#comparison-takeaway':new MockNode('p'),
    '#comparison-lesson':new MockNode('a')
  };
  const document = { querySelector: key => elements[key] ?? null, createElement: tag => new MockNode(tag) };
  const location = { search:'?'+new URLSearchParams({type,left,right}), hash:'' };
  vm.runInNewContext(compareSource, {
    document, location, history:{replaceState(){}}, systemCheckGear:gear, compareGearDetails:details,
    URLSearchParams, Intl, Option:MockOption
  });
  return elements['#comparison-rows'].children.map(row => ({
    label:row.children[0].textContent,
    left:row.children[1]?.textContent ?? '',
    right:row.children[2]?.textContent ?? ''
  }));
}

test('speaker comparisons show verified crossover, drivers and response tolerances', () => {
  const data = renderFixture('speaker','ELAC Debut 3.0 DB63','KEF Q3 Meta');
  assert.ok(data.some(row => row.label === 'Drivers, sizes and materials' && row.left.includes('aramid') && row.right.includes('MAT')));
  assert.ok(data.some(row => row.label === 'Published frequency response' && row.left.includes('50 Hz–34 kHz')));
  assert.ok(data.some(row => row.label === 'Additional response limit' && row.left.includes('−6 dB')));
  assert.ok(data.some(row => row.label === 'Specification source review' && row.left.includes('cross-checked')));
});

test('DAC comparisons show input-specific rates and preserve original voltage rows', () => {
  const data = renderFixture('source','Topping E30 II (RCA)','FiiO K11 (RCA line out)');
  assert.ok(data.some(row => row.label === 'PCM via USB' && row.left.includes('768 kHz') && row.right.includes('384 kHz')));
  assert.ok(data.some(row => row.label === 'PCM via optical / coaxial' && row.right.includes('96 kHz')));
  assert.ok(data.some(row => row.label === 'Maximum line output' && row.left.includes('2.1')));
});

test('headphone comparisons retain sensitivities and surface actual driver specifications', () => {
  const data = renderFixture('headphone','Moondrop Chu II','Sennheiser HD 600');
  assert.ok(data.some(row => row.label === 'Driver size' && row.left.includes('10 mm')));
  assert.ok(data.some(row => row.label === 'Published frequency range' && row.right.includes('−10 dB')));
  assert.ok(data.some(row => row.label.includes('Voltage for 90 dB')));
});

test('original amplifier comparison remains intact', () => {
  const data = renderFixture('amp','Yamaha A-720','Denon PMA-500V');
  assert.ok(data.some(row => row.label.includes('Ω') && row.left.includes('W/ch')));
  assert.ok(data.some(row => row.label === 'Input sensitivity'));
});

test('sound card additions are exact model presets with checked detail records', () => {
  const expected = [
    'Creative Sound Blaster X-Fi Titanium (SB0880, 3.5 mm front)',
    'Creative Sound Blaster Z SE (front 3.5 mm)',
    'Creative Sound BlasterX AE-5 Plus (front 3.5 mm)',
    'Creative Sound Blaster AE-7 (front 3.5 mm)',
    'Creative Sound Blaster AE-9 (RCA front out)',
    'Creative Sound Blaster Audigy Rx (front 3.5 mm)',
    'Creative Sound BlasterX G6 (line/optical 3.5 mm)',
    'Creative Sound Blaster X3 (USB, front 3.5 mm)',
    'Creative Sound Blaster X4 (USB, front 3.5 mm)',
    'Creative Sound Blaster X5 (USB, RCA line out)',
    'ASUS Xonar Essence STX II (RCA)',
    'ASUS Xonar SE (front 3.5 mm)'
  ];
  assert.equal(gear.source.length, 19);
  assert.equal(Object.keys(details.source).length, 19);
  for (const model of expected) {
    const preset = gear.source.find(item => item.model === model);
    assert.ok(preset, 'missing sound card: ' + model);
    assert.ok(details.source[model]?.deviceType, 'missing device type for ' + model);
    assert.ok(details.source[model]?.converter, 'missing DAC identity/unknown warning for ' + model);
    assert.ok(details.source[model]?.reference?.startsWith('https://'), 'no source for ' + model);
  }
});

test('Titanium HD exposes its complete RCA DAC rating but does not hide primary-source conflict', () => {
  const hd = 'Creative Sound Blaster X-Fi Titanium HD (RCA)';
  const preset = gear.source.find(x => x.model === hd);
  const meta = details.source[hd];
  assert.equal(preset.values.sourceVoltage, 2);
  assert.ok(preset.values.sourceSnr[0].includes('122 dB'));
  assert.ok(preset.values.sourceThdn[0].includes('0.001%'));
  assert.ok(meta.converter.includes('PCM1794A') && meta.converter.includes('review'));
  assert.ok(meta.pcmPCIe.includes('24-bit / 192 kHz') && meta.pcmPCIe.includes('24-bit / 96 kHz'));
  assert.ok(meta.analogResponse.includes('−3.5 dB'));
  assert.equal(meta.reviewStatus, 'manufacturer-conflict');
  assert.ok(meta.reference.endsWith('.pdf'));
  assert.ok(meta.secondReference.includes('creative.com'));
  assert.ok(meta.thirdReference.includes('bit-tech.net'));
  const rows = renderFixture('source', hd, 'ASUS Xonar Essence STX II (RCA)');
  assert.ok(rows.some(r => r.label === 'DAC converter / architecture' && r.left.includes('PCM1794A') && r.right.includes('PCM1792A')));
  assert.ok(rows.some(r => r.label === 'PCM / DAC via PCIe audio' && r.left.includes('192 kHz')));
  assert.ok(rows.some(r => r.label === 'Analogue frequency response' && r.left.includes('90 kHz')));
  assert.ok(rows.some(r => r.label === 'Maximum line output' && r.left.includes('2') && r.right.includes('2')));
  assert.ok(rows.some(r => r.label === 'Specification source review' && r.left.includes('Conflicting manufacturer')));
});

test('computer DAC dynamic range remains distinguishable from line-output SNR', () => {
  const rows = renderFixture('source', 'Creative Sound Blaster AE-7 (front 3.5 mm)', 'Creative Sound Blaster X5 (USB, RCA line out)');
  assert.ok(rows.some(r => r.label === 'Device type / interface' && r.left.includes('PCIe') && r.right.includes('USB')));
  assert.ok(rows.some(r => r.label === 'DAC dynamic range (DNR)' && r.left.includes('127 dB') && r.right.includes('130 dB')));
  assert.ok(rows.some(r => r.label === 'Analogue output channels'));
  assert.ok(rows.some(r => r.label === 'Maximum line output' && r.left.includes('—') && r.right.includes('—')));
  assert.ok(rows.some(r => r.label === 'Output impedance' && r.left.includes('—') && r.right.includes('—')));
  const a = gear.source.find(x=>x.model==='ASUS Xonar SE (front 3.5 mm)');
  const b = gear.source.find(x=>x.model==='Creative Sound Blaster X4 (USB, front 3.5 mm)');
  assert.ok(!('sourceVoltage' in a.values), 'do not copy the Xonar SE headphone 2 Vrms as line level');
  assert.ok(!('sourceZ' in b.values), 'do not copy X4 headphone 10 ohms as line impedance');
});

test('sound-card models compare to ordinary DACs without breaking existing rows', () => {
  const rows = renderFixture('source', 'Creative Sound BlasterX G6 (line/optical 3.5 mm)', 'Topping E30 II (RCA)');
  assert.ok(rows.some(r => r.label === 'PCM via USB' && r.left.includes('384 kHz') && r.right.includes('768 kHz')));
  assert.ok(rows.some(r => r.label === 'Line output connection' && r.left.includes('3.5 mm') && r.right.includes('RCA')));
  assert.ok(rows.some(r => r.label === 'THD+N' && r.left.includes('0.0002%') && r.right.includes('0.00015%')));
  assert.ok(rows.some(r => r.label === 'Output impedance' && r.left.includes('—') && r.right.includes('20')));
});
