/**
 * System Check: external Google links only. No API, results scraping or embedded search.
 * Each query focuses on inputs System Check can actually accept.
 * This module deliberately has no access to calculator values or results.
 */
export function normalizeModel(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[“”"]/g, '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function modelTerms(model, emphasizeCode = false) {
  const cleaned = normalizeModel(model);
  if (!emphasizeCode) return cleaned;
  // Quote only distinctive model identifiers, never an entire manufacturer/model phrase.
  // This preserves "A-720" and "HTR-4063" while letting Google match brand and revision.
  return cleaned.split(' ').map(token =>
    /\d/.test(token) && token.length >= 3 && !/^v\d+$/i.test(token) && /^[\w.+-]+$/.test(token)
      ? '"' + token + '"' : token
  ).join(' ');
}

const searchProfiles = Object.freeze({
  amp: [
    ['Official specs or manual', 'amplifier receiver owner service manual specifications', false],
    ['Rated power and test conditions', 'amplifier continuous power watts per channel ohms THD', true],
    ['Other loads and distortion tests', 'amplifier 4 6 8 ohm THD+N distortion power measurements', true],
    ['Input sensitivity and gain', 'amplifier input sensitivity input impedance voltage gain', false]
  ],
  speaker: [
    ['Official specs or manual', 'speaker loudspeaker owner manual specifications', false],
    ['Sensitivity and nominal impedance', 'speaker sensitivity 2.83V 1W nominal impedance ohms', true],
    ['Power handling and recommended amps', 'speaker continuous peak nominal maximum input power handling amplifier', false],
    ['Measured impedance and phase', 'speaker measured minimum maximum impedance phase sensitivity', true]
  ]
});

export function buildSearches(kind, rawModel) {
  const model = normalizeModel(rawModel);
  if (!model || !Object.hasOwn(searchProfiles, kind)) return [];
  return searchProfiles[kind].map(([label, terms, emphasizeCode]) => ({
    label,
    query: modelTerms(model, emphasizeCode) + ' ' + terms
  }));
}

export function googleSearchUrl(query) {
  return 'https://www.google.com/search?' + new URLSearchParams({ q: query }).toString();
}

function renderLookup(details) {
  const input = details.querySelector('input');
  const links = details.querySelector('.sc-searches');
  const guidance = details.querySelector('.sc-search-status');
  if (!input || !links) return;
  const searches = buildSearches(details.dataset.lookup, input.value);
  links.replaceChildren();
  if (guidance) {
    guidance.textContent = searches.length
      ? 'Choose a targeted Google search. Review the source and copy verified values into the fields above; nothing is imported automatically.'
      : 'Enter the manufacturer and exact model to show targeted Google searches.';
  }
  for (const [i, search] of searches.entries()) {
    const a = document.createElement('a');
    a.className = 'sc-search-link' + (i === 0 ? ' sc-search-link-primary' : '');
    a.textContent = search.label + ' ↗';
    a.href = googleSearchUrl(search.query);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    links.append(a);
  }
}

if (typeof document !== 'undefined') {
  for (const details of document.querySelectorAll('#check [data-lookup]')) {
    const input = details.querySelector('input');
    input?.addEventListener('input', () => renderLookup(details));
    renderLookup(details);
  }
  // "Load the lesson example" resets the model fields. Clear old links as well.
  document.querySelector('#check')?.addEventListener('reset', () => {
    queueMicrotask(() => {
      for (const details of document.querySelectorAll('#check [data-lookup]')) renderLookup(details);
    });
  });
}
