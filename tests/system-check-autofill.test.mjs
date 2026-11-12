import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const js = readFileSync(new URL('../system-check/calculator.js', import.meta.url), 'utf8');
const data = readFileSync(new URL('../system-check/gear.js', import.meta.url), 'utf8');
const gears = JSON.parse(data.match(/^const systemCheckGear = ([\s\S]*?);\s*$/m)?.[1] || '{}').speaker;

class Field {
  constructor() {
    this.value = '';
    this.dataset = {};
    this.listeners = {};
    this.children = [];
    this.textContent = '';
    this.hidden = false;
  }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  dispatchEvent(event) { for (const handler of this.listeners[event.type] || []) handler(event); }
  replaceChildren(...entries) { this.children = entries; this.textContent = ''; }
  append(...entries) { this.children.push(...entries); }
  add(entry) { this.children.push(entry); }
  querySelector() { return null; }
}

function setup() {
  const fields = Object.fromEntries([
    'speakerModel', 'sensitivity', 'basis', 'load', 'minimum', 'minimumHz',
    'phase', 'maximum', 'speakerPowerContinuous', 'speakerPowerPeak',
    'speakerPowerNominal', 'speakerPowerMaxInput', 'speakerRecommendedAmpMax'
  ].map(name => [name, new Field()]));
  const select = new Field(), note = new Field(), provenance = new Field(), suggestions = new Field();
  const picker = {
    dataset: { gear: 'speaker' }, hidden: true,
    querySelector(name) { return name === 'select' ? select : name === 'p' ? note : null; },
    closest() { return null; }
  };
  const speakerPowerFields = [
    'speakerPowerContinuous', 'speakerPowerPeak', 'speakerPowerNominal',
    'speakerPowerMaxInput', 'speakerRecommendedAmpMax'
  ];
  const presetFields = {
    speaker: ['sensitivity', 'basis', 'load', 'minimum', 'minimumHz', 'phase', 'maximum', ...speakerPowerFields]
  };
  const context = {
    location: { search: '' }, URLSearchParams, Number,
    speakerPowerFields, presetFields,
    field: name => fields[name],
    show: val => String(val),
    Option: class { constructor(text, value) { this.text = text; this.value = value; } },
    Event: class { constructor(type) { this.type = type; } },
    document: {
      querySelectorAll(name) { return name === '[data-gear]' ? [picker] : []; },
      querySelector(name) {
        return name === '#speaker-power-provenance' ? provenance
          : name === '#speaker-model-suggestions' ? suggestions : null;
      },
      createElement() { return new Field(); }
    }
  };
  const start = js.indexOf('function normalizeSpeakerPresetModel(');
  const end = js.indexOf('// Distinguish a visitor-edited value', start);
  const listeners = js.indexOf('if (typeof systemCheckGear !==', end);
  assert.ok(start >= 0 && end > start && listeners > end, 'preset workflow was not found');
  vm.runInNewContext(js.slice(start, end) + '\nglobalThis.register = mountGearPresets;\nglobalThis.findMatch = findExactSpeakerPresetIndex;', context);
  vm.runInNewContext(js.slice(end, listeners), context);
  context.register({ speaker: gears });
  function type(model) {
    fields.speakerModel.value = model;
    fields.speakerModel.dispatchEvent({ type: 'input' });
  }
  return { fields, select, note, provenance, suggestions, type, findMatch: context.findMatch };
}

test('exact typed model autofills all available power fields and other saved speaker specs', () => {
  const h = setup();
  h.type('paradigm  phantom v.1');
  assert.equal(gears[Number(h.select.value)].model, 'Paradigm Phantom v1');
  assert.equal(h.fields.sensitivity.value, 87);
  assert.equal(h.fields.load.value, 8);
  assert.equal(h.fields.speakerPowerMaxInput.value, 90);
  assert.equal(h.fields.speakerRecommendedAmpMax.value, 150);
  assert.equal(h.fields.speakerPowerContinuous.value, '');
  assert.equal(h.fields.speakerPowerMaxInput.dataset.powerSourceUrl.includes('usaudiomart'), true);
  assert.ok(h.suggestions.children.length >= 50);
});

test('model changes clear only values autofilled from the earlier speaker preset', () => {
  const h = setup();
  h.type('Paradigm Titan v3');
  assert.equal(h.fields.speakerPowerMaxInput.value, 60);
  h.type('Paradigm Titan v2');
  assert.equal(h.select.value, '');
  assert.equal(h.fields.speakerPowerMaxInput.value, '');
  assert.equal(h.fields.speakerRecommendedAmpMax.value, '');
  assert.equal(h.fields.load.value, '');
  assert.equal(h.fields.speakerPowerMaxInput.dataset.powerSourceUrl, undefined);
});

test('manual edits survive model changes while untouched preset values are cleared', () => {
  const h = setup();
  h.type('Paradigm Phantom v1');
  h.fields.speakerPowerMaxInput.value = '72';
  h.fields.speakerPowerMaxInput.dispatchEvent({ type: 'input' });
  h.type('Unknown brand model');
  assert.equal(h.fields.speakerPowerMaxInput.value, '72');
  assert.equal(h.fields.speakerRecommendedAmpMax.value, '');
  assert.equal(h.fields.sensitivity.value, '');
});

test('nearby model revisions and partial names never silently select another speaker', () => {
  const h = setup();
  h.type('Klipsch RP-600M II');
  assert.equal(h.select.value, '');
  h.type('Klipsch RP-600M');
  assert.equal(gears[Number(h.select.value)].model, 'Klipsch RP-600M (original)');
  assert.equal(h.fields.speakerPowerContinuous.value, 100);
  assert.equal(h.fields.speakerPowerPeak.value, 400);
});

test('selecting the built-in speaker dropdown still fills published categories', () => {
  const h = setup();
  const i = gears.findIndex(x => x.model === 'KEF Q150');
  h.select.value = String(i);
  h.select.dispatchEvent({ type: 'change' });
  assert.equal(h.fields.speakerRecommendedAmpMax.value, 100);
  assert.equal(h.fields.speakerPowerContinuous.value, '');
  assert.equal(h.fields.speakerModel.value, 'KEF Q150');
});
