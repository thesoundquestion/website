/* Read-only bridge. Loaded after existing classic scripts, never changes System Check. */
'use strict';
(() => {
  const source = typeof systemCheckGear === 'object' ? systemCheckGear : null;
  const supplemental = typeof compareGearDetails === 'object' ? compareGearDetails : null;
  if (!source) {
    window.systemBuilderInventory = null;
    return;
  }
  const categories = {};
  for (const kind of ['speaker','amp','source','headphone']) {
    categories[kind] = Object.freeze((source[kind] || []).map(record => {
      const detail = supplemental?.[kind]?.[record.model] || null;
      return Object.freeze({
        model: String(record.model),
        type: kind,
        values: Object.freeze({ ...(record.values || {}) }),
        ratings: Object.freeze((record.ratings || []).map(x => Object.freeze([...x]))),
        note: String(record.note || ''),
        url: record.url || null,
        details: detail ? Object.freeze({ ...detail }) : null,
        evidence: 'catalogue preset; not a purchase recommendation'
      });
    }));
  }
  window.systemBuilderInventory = Object.freeze(categories);
})();