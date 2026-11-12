import {GOALS, describeBass, eligibleArchitectures, inspectOwnedPair} from './engine.mjs';
import {shortlistExamples} from './recommendations.mjs';

const el = (tag, className = '', text = '') => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};
const addText = (parent, tag, text, className = '') => {
  const node = el(tag, className, text);
  parent.append(node);
  return node;
};
function list(parent, statements, className = '') {
  const ul = el('ul', className);
  for (const statement of statements) addText(ul, 'li', statement);
  parent.append(ul);
  return ul;
}
function link(parent, url, text) {
  if (!url) return;
  let target;
  try { target = new URL(url, window.location.href); } catch { return; }
  if (target.protocol !== 'https:' && target.protocol !== 'http:') return;
  const a = el('a', 'sb-source-link', text);
  a.href = target.href;
  if (target.origin !== window.location.origin) {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  parent.append(a);
}
const options = {
  passive_separates: {
    title: 'Traditional passive stereo',
    description: 'A stereo pair of passive speakers, a separate load-compatible amplifier or receiver, and a suitable source/control path.',
    verify: ['Match actual speaker impedance minimum and phase to the amplifier maker’s permitted load.',
      'Use the existing System Check for sensitivity, distance, continuous/peak power and published test conditions.',
      'Price both speakers plus any missing amp, DAC/inputs, stands or cabling. A compatible owned amp adds zero incremental purchase cost.']
  },
  consumer_powered_pair: {
    title: 'Powered stereo pair',
    description: 'A complete left/right amplified speaker system. Some products include source switching and volume control; others do not.',
    verify: ['Confirm a stereo pair is included, not one speaker, and verify supported inputs and volume controls.',
      'Check power supply, DSP/input latency if relevant, sub routing and any fixed limitations on upgrading.',
      'Compare its full system cost with passive speakers plus every part not already owned.']
  },
  active_studio: {
    title: 'Active studio / desk monitors',
    description: 'Two individually amplified monitors, often sold separately and needing a reliable stereo source with volume control.',
    verify: ['Budget for two cabinets, two power feeds, correct cables and interface/volume hardware where needed.',
      'Check input type, balanced/unbalanced adapters, nearfield hiss and controls at your actual seat.',
      'Compare measured nearfield response and low-frequency limits using compatible methods; avoid interpreting a per-cabinet max SPL as a pair rating.']
  },
  party_pa: {
    title: 'Portable party / PA',
    description: 'A venue-first route using portable battery systems, mains-powered party speakers or professional PA, depending on the actual event.',
    verify: ['Confirm audience size, coverage, weight, weather protection, safe mounting, and clean sustained output rather than headline peak watts.',
      'When off-grid operation is mandatory, AC-only options fail the requirement. Check battery runtime at the declared volume.',
      'Check official safety/serial recall instructions for any battery pack, and include necessary subwoofers, stands and transport in the price.']
  },
  headphone_first: {
    title: 'Headphone / IEM-first listening',
    description: 'A private listening chain with source, suitable headphone output and controls, plus comfort/fit that suits the listener.',
    verify: ['Verify headphone sensitivity basis, impedance, connector, fit/seal, output capability and quiet-level channel balance.',
      'Open-back and closed-back are not numerical soundstage scores; isolation and room noise matter.',
      'Do not turn a headphone frequency-range endpoint into a claim of fidelity or detail.']
  }
};
const money = {CA:'CAD',US:'USD',GB:'GBP',EU:'EUR',AU:'AUD',other:'other'};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('sb-form');
  if (!form) return;
  const inventory = window.systemBuilderInventory || null;
  const state = document.getElementById('sb-inventory-state');
  const result = document.getElementById('sb-results');
  const body = document.getElementById('sb-result-body');
  const goal = form.elements.namedItem('goal');
  const architecture = form.elements.namedItem('architecture');
  const subMode = form.elements.namedItem('subMode');
  const extras = [...form.querySelectorAll('[name="secondary"]')];

  if (inventory) {
    const names = {speaker:'speaker',amp:'amp',source:'source',headphone:'headphone'};
    for (const [kind,id] of Object.entries(names)) {
      const select = document.getElementById('sb-' + id);
      for (const record of inventory[kind] || []) {
        const option = el('option', '', record.model);
        option.value = record.model;
        select.append(option);
      }
    }
    const count = Object.values(inventory).reduce((n, records) => n + records.length, 0);
    state.textContent = count + ' existing System Check presets loaded (read-only). Unknown technical fields are not filled in.';
  } else {
    state.textContent = 'The saved preset catalog did not load. Unlisted model inputs remain available; no specs will be assumed.';
  }

  function syncGoals() {
    const chosen = extras.filter(x => x.checked && x.value !== goal.value);
    for (const x of extras) {
      if (x.value === goal.value) x.checked = false;
      x.disabled = x.value === goal.value || (chosen.length >= 2 && !x.checked);
    }
    document.getElementById('sb-goal-note').textContent =
      chosen.length + ' of 2 extra priorities chosen. These are qualitative directions, not invented percentages.';
  }
  goal.addEventListener('change', syncGoals);
  extras.forEach(x => x.addEventListener('change', syncGoals));
  syncGoals();

  function syncSub() {
    const sub = subMode.value !== 'no_sub';
    document.getElementById('sb-sub-count').hidden = !sub;
    document.getElementById('sb-sub-owned').hidden = !sub;
  }
  subMode.addEventListener('change', syncSub);
  syncSub();

  form.elements.namedItem('region').addEventListener('change', ev => {
    form.elements.namedItem('currency').value = money[ev.target.value] || 'other';
  });
  for (const kind of ['speaker','amp','source','headphone']) {
    const preset = form.elements.namedItem(kind);
    const other = form.elements.namedItem(kind+'Other');
    preset.addEventListener('change', () => { if (preset.value) other.value = ''; });
    other.addEventListener('input', () => { if (other.value.trim()) preset.value = ''; });
  }
  form.addEventListener('reset', () => queueMicrotask(() => {
    syncGoals(); syncSub(); result.hidden = true;
  }));

  function chosenGear(data, kind) {
    const exact = String(data.get(kind) || '');
    const custom = String(data.get(kind+'Other') || '').trim();
    const record = (inventory?.[kind] || []).find(x => x.model === exact) || null;
    return {name: custom || record?.model || '', record: custom ? null : record, unlisted: !!custom};
  }
  let reportContainer = null;
  function section(title) {
    // The regular shortlist stays visible; the engineering appendix is opt-in.
    // Its individual sections are independently expandable for quick scanning.
    const withinAudit = !!reportContainer;
    const node = el(withinAudit ? 'details' : 'section', withinAudit ? 'sb-audit-part' : '');
    addText(node, withinAudit ? 'summary' : 'h3', title);
    (reportContainer || body).append(node);
    return node;
  }
  function report(data) {
    body.replaceChildren();
    reportContainer = null;
    const primary = String(data.get('goal') || 'all_rounder');
    const mainGoal = GOALS[primary] || GOALS.all_rounder;
    const secondary = extras.filter(x => x.checked && x.value !== primary).map(x => GOALS[x.value]).filter(Boolean);
    const arch = String(data.get('architecture') || 'open');
    const useCase = String(data.get('useCase') || 'living_room');
    const distanceFt = Number(data.get('distanceFt'));
    const powered = String(data.get('power') || 'mains');
    const bassMode = String(data.get('subMode') || 'no_sub');
    const bassCount = Number(data.get('subCount')) || 1;
    const bass = describeBass(bassMode, bassCount);
    const wantedInput = form.elements.namedItem('connection').selectedOptions[0].textContent;
    const own = Object.fromEntries(['speaker','amp','source','headphone'].map(kind => [kind,chosenGear(data,kind)]));
    const anyOwned = Object.values(own).some(x => x.name);
    const budgetText = String(data.get('budget') || '').trim();
    const currency = String(data.get('currency') || 'other');
    const region = form.elements.namedItem('region').selectedOptions[0].textContent;

    const profile = el('p','sb-profile');
    profile.textContent = [
      mainGoal.label,
      distanceFt.toLocaleString() + ' ft',
      form.elements.namedItem('level').selectedOptions[0].textContent,
      budgetText ? budgetText + ' ' + currency + ' budget' : (region + ' · budget not set')
    ].join(' · ');
    body.append(profile);

    // Actual named equipment comes first. Each card is an editorial starting point,
    // never an automatic compatibility certification or a regional value winner.
    const shop = section('A few options worth a look');
    if (anyOwned && data.has('keepWorking')) {
      const keep = el('div','sb-keep-inline');
      const ownedNames = Object.values(own).filter(x=>x.name).map(x=>x.name);
      addText(keep,'strong','Before you buy: consider keeping your gear');
      addText(keep,'p',ownedNames.join(' · '));
      const keepMore = el('details','sb-card-details');
      addText(keepMore,'summary','What should I check?');
      addText(keepMore,'p','Verify the amplifier/speaker load, source connection and clean listening level before replacing anything. Owning a component does not automatically make it suitable for every setup.');
      link(keepMore,'/system-check/','Test your existing equipment with System Check');
      keep.append(keepMore);
      shop.append(keep);
    }
    const budget = budgetText ? Number(budgetText) : null;
    const shortlist = shortlistExamples({
      architecture:arch, useCase, goal:primary, level:String(data.get('level')),
      distanceFt, power:powered, connection:String(data.get('connection')),
      secondary:extras.filter(x=>x.checked&&x.value!==primary).map(x=>x.value),
      region:String(data.get('region')), currency,
      budget:Number.isFinite(budget) ? budget : null,
      budgetStrict:data.get('budgetStrict') === 'strict',used:data.has('used')
    });
    const priceFormat = value => value.toLocaleString('en-CA',{style:'currency',currency:'CAD'});
    const renderCard = item => {
      const card = el('article','sb-recommend sb-recommend-compact');
      const head = el('div','sb-card-head');
      const heading = el('div','sb-card-heading');
      addText(heading,'span',item.kind,'sb-kind');
      addText(heading,'h4',item.title.replace(/^[^:]{3,45}:\s*/,'')); 
      head.append(heading);
      const price = el('div','sb-card-price');
      addText(price,'strong',item.subtotal === null ? 'Price to verify' : priceFormat(item.subtotal));
      addText(price,'span',item.subtotal === null ? 'No local price checked' : 'CAD · listed parts only');
      head.append(price);
      card.append(head);
      addText(card,'p',item.why,'sb-card-why');

      // Only material blockers and urgent caveats interrupt the skim view.
      if (item.id === 'passive-rs202-p3')
        addText(card,'p','Check speaker load: P3 minimum 4 Ω; R-S202 specifies 8 Ω+. Not a confirmed safe pairing.','sb-card-alert');
      else if (item.connectionStatus === 'adapter_needed')
        addText(card,'p','Your chosen source connection needs extra hardware.','sb-card-alert');
      else if (item.sourceBatteryCaution)
        addText(card,'p','Battery-powered source/output required separately.','sb-card-alert');
      else if (item.levelCaution || item.placementCaution)
        addText(card,'p','Confirm clean output at your listening distance and level.','sb-card-alert');
      if (budget !== null && item.subtotal === null)
        addText(card,'p','Budget fit not confirmed.','sb-card-minor');

      const details = el('details','sb-card-details');
      addText(details,'summary','What is included, drawbacks & sources');
      if (!item.editorialGoalFocus)
        addText(details,'p','An alternative approach for comparison, not a verified performance match to your main priority.');
      if (item.secondaryFocus.length)
        addText(details,'p','Also connects to: '+item.secondaryFocus.map(x=>GOALS[x]?.label||x).join(', ')+'. Not a measurement-based match.');
      addText(details,'h5','Equipment and connections');
      const parts = el('ul','sb-buy-parts');
      for (const part of item.parts) {
        const li = el('li');
        addText(li,'strong',(part.count > 1 ? part.count+' × ' : '') + part.name);
        addText(li,'span',' · '+part.role);
        if (part.url) link(li,part.url,'Specifications');
        parts.append(li);
      }
      details.append(parts);
      if (item.priceComponents.length) {
        addText(details,'h5','Canadian price references · 12 Nov 2026');
        for (const p of item.priceComponents) {
          const line = addText(details,'p',(p.quantity > 1 ? p.quantity+' × ' : '') + p.label +
            ': ' + priceFormat(p.amount) + (p.quantity > 1 ? ' each' : ''),'sb-card-reference');
          link(line,p.url,'Price source');
        }
      }
      addText(details,'h5','Trade-offs');
      addText(details,'p',item.tradeoff);
      const checks = [...item.extra];
      if (item.connectionStatus === 'adapter_needed')
        checks.unshift('No native connection for your chosen input: add and price a suitable adapter, receiver or interface.');
      if (item.sourceBatteryCaution)
        checks.unshift('The headphones require a compatible, battery-powered source/headphone output, not included in the shown price.');
      if (item.levelCaution || item.placementCaution)
        checks.unshift('Verify clean output at your intended distance and level, especially with compact nearfield designs.');
      if (item.sceneCaution)
        checks.unshift('Check whether this product is appropriate for the chosen venue and coverage.');
      if (bassMode !== 'no_sub' && item.architecture !== 'headphone_first')
        checks.push('Subwoofer, integration and any required crossover are not included; SUB OUT alone does not verify a mains high-pass.');
      if (budget !== null)
        checks.push(item.subtotal === null
          ? 'No qualified local price for comparison with your '+budget+' '+currency+' ceiling.'
          : 'The '+priceFormat(item.subtotal)+' shown covers only identified components. Missing hardware, delivery and taxes can exceed your '+budget+' '+currency+' budget.');
      list(details,checks);
      card.append(details);
      return card;
    };

    if (shortlist.selected.length) {
      const visible = shortlist.selected.slice(0,3);
      const grid = el('div','sb-recommendations');
      for (const item of visible) grid.append(renderCard(item));
      shop.append(grid);
      if (shortlist.selected.length > visible.length) {
        const more = el('details','sb-more');
        addText(more,'summary','Show '+(shortlist.selected.length-visible.length)+' more option'+(shortlist.selected.length-visible.length===1?'':'s'));
        const moreGrid = el('div','sb-recommendations');
        for (const item of shortlist.selected.slice(visible.length)) moreGrid.append(renderCard(item));
        more.append(moreGrid);
        shop.append(more);
      }
      addText(shop,'p','Illustrative options, not certified matches. Canadian amounts are dated component listings, not full system costs or typical market prices.','sb-brief-note');
    } else {
      addText(shop,'p','No example meets the chosen architecture, power and known-price limits. Try a different route or investigate local used options.','sb-report-note');
    }
    if (shortlist.excluded.length && budget !== null) {
      const excluded = el('details','sb-more');
      addText(excluded,'summary','Why some options were left out');
      list(excluded,shortlist.excluded.slice(0,5).map(x=>x.title+': '+x.reason));
      shop.append(excluded);
    }
    if (((bassMode !== 'no_sub' && data.get('subOwned') !== 'yes') || (primary === 'bass' && bassMode === 'no_sub')) && arch !== 'headphone_first') {
      const subAdd = el('details','sb-more');
      addText(subAdd,'summary',bassMode === 'no_sub' ? 'Optional deeper bass ideas' : 'Subwoofer models to investigate');
      addText(subAdd,'p','SVS SB-1000 Pro (sealed) and RSL Speedwoofer 10E (ported). Integration and regional prices still need verification.');
      link(subAdd,'https://www.svsound.com/products/sb-1000-pro-subwoofer','SVS specifications');
      link(subAdd,'https://rslspeakers.com/pages/speedwoofer-10e','RSL specifications');
      shop.append(subAdd);
    }

    const detail = el('details','sb-audit');
    addText(detail,'summary','Want the technical explanation? Explore compatibility, pricing & evidence');
    body.append(detail);
    reportContainer = detail;
    const goals = section('What matters for your listening goals');
    addText(goals,'p',mainGoal.focus + '.');
    if (secondary.length) list(goals,secondary.map(x => x.label + ': ' + x.focus + '.'));
    addText(goals,'p',data.get('character') === 'character' ?
      'You prefer a particular tonal character. That preference is valid, but is not a measured fidelity advantage.' :
      data.get('character') === 'explore' ?
      'Compare a faithful-to-source setup with deliberate tonal adjustments, keeping preference and measurable accuracy separate.' :
      'Begin by preserving the recorded signal as accurately as practicable; any preferred coloration is a separate choice.');
    const ownedSection = section('Existing equipment: what can we establish?');
    if (!anyOwned) addText(ownedSection,'p','No existing components were selected. A whole new working signal path must be costed, not just a speaker pair.');
    else {
      for (const kind of ['speaker','amp','source','headphone']) {
        const x = own[kind];
        if (!x.name) continue;
        const line = addText(ownedSection,'p',kind[0].toUpperCase() + kind.slice(1) + ': ' + x.name);
        line.style.marginBottom = '.25rem';
        if (x.unlisted) addText(ownedSection,'p','Unlisted model: specifications and exact revision not verified. Please check its manufacturer documentation.','sb-help');
        else {
          addText(ownedSection,'p','Saved preset, not an endorsement. ' + (x.record.note || 'No additional note recorded.'),'sb-help');
          link(ownedSection,x.record.url,'Preset specification source');
          if (x.record.details?.reference && x.record.details.reference !== x.record.url)
            link(ownedSection,x.record.details.reference,'Supplemental specification source');
        }
      }
      if (arch !== 'headphone_first' && arch !== 'consumer_powered_pair' && arch !== 'active_studio') {
        const audit = inspectOwnedPair(own.speaker.record,own.amp.record);
        if (audit.facts.length) list(ownedSection,audit.facts,'sb-facts');
        if (audit.checks.length) {
          addText(ownedSection,'h4','Still to verify');
          list(ownedSection,audit.checks);
        }
      }
      if (own.source.record) {
        const conn = own.source.record.values?.sourceConnection;
        if (conn) addText(ownedSection,'p','Saved source output connection: ' + String(conn) + '. Confirm connector levels, cable type and volume control before declaring a match.');
        else addText(ownedSection,'p','Saved source has no validated output-interface match for this pathway.');
      }
      if (own.headphone.name && arch === 'headphone_first')
        addText(ownedSection,'p','Keep the headphones on the shortlist for a fit and drive check. An impedance number alone does not establish a sufficient/quiet output.');
      if (own.speaker.name && (arch === 'consumer_powered_pair' || arch === 'active_studio'))
        addText(ownedSection,'p','Your existing passive-speaker preset is not proof that those speakers work as an active/powered system. External amplification requirements must not be skipped.');
    }
    if (data.get('keepWorking')) addText(ownedSection,'p','Keep/placement-first is a valid outcome. An upgrade is not justified until a real limitation or missing feature is identified.','sb-report-note');

    if (arch !== 'headphone_first') {
      const subSection = section('Bass routing: ' + bass.heading);
      list(subSection,bass.notes);
      if (bassMode !== 'no_sub') {
        addText(subSection,'p','Subwoofers selected: ' + (bassCount >= 3 ? 'three or more' : String(bassCount)) +
          '. Already owned: ' + String(data.get('subOwned') || 'unknown') +
          '. Owned reusable gear carries zero incremental hardware cost, but setup, routing hardware and integration may still cost money.');
      }
      if (bassMode === 'sub_hpf') addText(subSection,'p','The high-pass claim is based on your selection, not independently verified by this form. Show the exact crossover/router settings and source before taking an amplifier/speaker bass-relief credit.','sb-report-note');
    } else if (bassMode !== 'no_sub') {
      const subSection = section('Headphone-specific exception');
      addText(subSection,'p','Speaker/subwoofer routing does not enter a headphone-only equipment decision. The selected subwoofer configuration is ignored for this pathway.');
    }

    const pathwaySection = section('Reasoned system pathways, separated by architecture');
    addText(pathwaySection,'p','These are configuration routes, not named purchasing winners or performance rankings. All remain conditional until the exact model, complete wiring and region are verified.');
    const pathwayCards = el('div','sb-pathways');
    const chosen = eligibleArchitectures({architecture:arch,useCase,goal:primary});
    for (const key of chosen) {
      const config = options[key]; if (!config) continue;
      const card = el('article','sb-pathway');
      addText(card,'div','Conditional · verification required','sb-status');
      addText(card,'h4',config.title);
      addText(card,'p',config.description);
      const checks = [...config.verify];
      if (powered === 'battery') checks.unshift('HARD GATE: a candidate must be demonstrably battery-capable. An AC-only system is ineligible.');
      if (powered === 'flexible') checks.unshift('Power can be mains or battery; verify the chosen system rather than assuming portability.');
      if (key === 'passive_separates' && own.amp.record)
        checks.push('Your existing amplifier could be retained at zero purchase cost only if its load, controls and output are proven adequate.');
      if (key === 'headphone_first' && own.headphone.name)
        checks.push('Test your owned ' + own.headphone.name + ' with a suitable source before buying a replacement.');
      if (key !== 'headphone_first' && bassMode !== 'no_sub')
        checks.push('Include the actual subwoofer connection and configuration in the total signal chain; unknown routing is treated as full-range mains for headroom.');
      list(card,checks);
      pathwayCards.append(card);
    }
    pathwaySection.append(pathwayCards);
    if (arch === 'open' && primary !== 'party' && useCase !== 'party')
      addText(pathwaySection,'p','Party/PA is intentionally excluded from ordinary stereo/desk routes. Choose party as the main goal or the architecture to evaluate an event system.');

    const logistics = section('Cost, connections and remaining unknowns');
    const parts = [
      'Listening distance: ' + distanceFt + ' ft. This is an input for later technical checks, not a computed room response.',
      'Required source connection: ' + wantedInput + '. Verify real source/output/input types and a functional volume-control path.',
      'Region: ' + region + ' (' + currency + '). ' + (budgetText ? 'Spending ceiling: ' + budgetText + ' ' + currency + (data.get('budgetStrict') === 'strict' ? ' (firm).' : ' (flexible).') : 'No spending limit supplied.'),
      'No representative local new/used pricing has been approved for automatic value comparison. A budget cannot make an unpriced model eligible.',
      'Complete-system price must include each required speaker, amplifier, source, volume control, stands, cables, subwoofer, service work and applicable region costs.',
      'Check real product availability, mains voltage, environment, any safety notices, and warranty/revision before buying.'
    ];
    if (data.get('used')) parts.push('Used gear is allowed as a research route. Verify service history, availability and real local transaction prices.');
    if (!data.get('service')) parts.push('Do not assume vintage maintenance is free or acceptable: service cost and risk must be counted.');
    list(logistics,parts);
    const first = section('Try this before spending');
    const experiments = [mainGoal.experiment, ...secondary.map(x => x.experiment)];
    if (arch === 'headphone_first') experiments.push('Try fit/seal and lower listening volume before paying for a new DAC or amplifier.');
    else experiments.push('Confirm L/R polarity, placement symmetry and room/setup constraints before attributing congestion or imaging issues to a component.');
    if (data.get('keepWorking') && anyOwned) experiments.unshift('Run your present setup through System Check first. If it already meets your level, connectivity and tonal needs, no upgrade may be necessary.');
    list(first,experiments);
    const referrals = addText(first,'p','Cross-check rather than inventing numbers: ');
    link(referrals,'/system-check/','System Check for verified headroom');
    link(referrals,'/system-check/compare/','Compare My Gear source notes');
    const limitation = section('Evidence limits');
    addText(limitation,'p','This preview has no rights-cleared, method-compatible catalog-wide acoustic dataset, no approved normal regional price samples, and no calibrated preference-to-product scoring. Manufacturer specs, independent review links and original measurements are different evidence tiers. No data is scraped or copied from third-party review graphs.');
    link(limitation,'https://www.erinsaudiocorner.com/measurement-data-policy/','Independent measurement-data usage policy');
  }

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    if (!form.reportValidity()) return;
    report(new FormData(form));
    result.hidden = false;
    result.focus({preventScroll:true});
    result.scrollIntoView({behavior:'auto',block:'start'});
  });
});
