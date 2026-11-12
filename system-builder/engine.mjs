/** Compatibility-first preview policy. No objective sound-quality or product-score engine.
 * Adapted conservatively from the 2026-11-12 private research prototype.
 * All measurements and regional prices require their own provenance and rights checks. */
export function resolveBassTopology(bass = {}) {
  if (!bass.present || bass.count === 0) return { mode: 'no_sub', verified: true };
  if (bass.mainHighPassVerified === true) return { mode: 'sub_mains_high_passed', verified: true };
  return { mode: 'sub_mains_full_range', verified: bass.mainHighPassVerified === false };
}
export function estimateCompleteCost(candidate, request) {
  if (!candidate.completePartsDeclared || !Array.isArray(candidate.parts) || !candidate.parts.length)
    return { known: false, issues: ['Complete system components are unknown'] };
  let total = 0, known = true, representative = true;
  const issues = [];
  for (const p of candidate.parts) {
    if (!p?.id || !Number.isInteger(p.quantity) || p.quantity < 1) {
      known = false; issues.push('Invalid required part'); continue;
    }
    if ((request.ownedPartIds || []).includes(p.id) && p.reuseCompatible === true) continue;
    if (p.region !== request.region || p.currency !== request.currency ||
        !Number.isFinite(p.unitPrice) || p.unitPrice < 0) {
      known = false; issues.push('No matching regional cost for ' + p.id); continue;
    }
    total += p.quantity * p.unitPrice;
    if (p.availability !== 'available') issues.push('Stock not confirmed for ' + p.id);
    if (p.priceEvidence !== 'representative') representative = false;
  }
  return { known, total: known ? Math.round(total * 100) / 100 : null,
    currency: request.currency, representative, issues };
}
export function usableMeasurement(m) {
  return !!(m && Number.isFinite(m.value) && typeof m.unit === 'string' && m.unit &&
    typeof m.method === 'string' && m.method && m.rights === 'permitted' &&
    typeof m.provenanceUrl === 'string' && /^https:\/\//.test(m.provenanceUrl) &&
    m.testConditions && typeof m.testConditions === 'object');
}
export function comparableMeasurements(a, b) {
  return usableMeasurement(a) && usableMeasurement(b) &&
    a.unit === b.unit && a.method === b.method &&
    JSON.stringify(a.testConditions) === JSON.stringify(b.testConditions);
}
export function assessCandidate(c, r) {
  const blocked = [], conditional = [], notes = [];
  if (!c?.id || !c?.architecture)
    return { status: 'blocked', blocked: ['Missing product identity or architecture'], conditional, notes };
  if (r.architecture && r.architecture !== 'open' && r.architecture !== c.architecture)
    blocked.push('Architecture excluded');
  if (c.architecture === 'party_pa' && r.useCase !== 'party' && r.architecture !== 'party_pa')
    blocked.push('Party/PA not selected');
  if (r.batteryRequired === true && c.batteryCapable !== true) blocked.push('Battery required');
  if (c.recallStatus === 'affected') blocked.push('Affected recalled component');
  else if (c.recallStatus === 'requires_check') conditional.push('Recall scope/serial check required');
  else if (c.recallStatus !== 'clear') conditional.push('Safety recall status not verified');
  if (r.mainsVoltage != null && r.batteryRequired !== true) {
    if (!Array.isArray(c.supportedMainsVoltages)) conditional.push('Mains-voltage compatibility unknown');
    else if (!c.supportedMainsVoltages.includes(r.mainsVoltage)) blocked.push('Mains-voltage mismatch');
  }
  if (c.connectionStatus === 'incompatible') blocked.push('Incompatible connections/controls');
  else if (c.connectionStatus !== 'verified') conditional.push('Connections or controls unknown');
  if (c.levelSuitability === 'fails') blocked.push('Clean output requirement unmet');
  else if (c.levelSuitability !== 'meets') conditional.push('Clean output at listening position unknown');
  if (c.environmentSuitability === 'incompatible') blocked.push('Venue constraints unmet');
  else if (c.environmentSuitability !== 'verified') conditional.push('Venue suitability unknown');
  const cost = estimateCompleteCost(c, r);
  if (cost.known) {
    if (Number.isFinite(r.budget) && cost.total > r.budget && r.budgetStrict !== false)
      blocked.push('Complete system over budget');
    if (!cost.representative) conditional.push('Regional price is not representative');
    conditional.push(...cost.issues);
  } else conditional.push(...cost.issues);
  const topo = resolveBassTopology(c.bass);
  if (c.bass?.present && !topo.verified) conditional.push('High-pass unverified: no headroom relief credit');
  const numericSourceCoverage = Array.isArray(c.metrics) && c.metrics.length > 0 &&
    c.metrics.every(usableMeasurement);
  if (!numericSourceCoverage) notes.push('No reusable comparable numerical evidence for automatic score');
  if (c.existingSystemMeetsNeeds === true) notes.push('Keep current equipment/setup-first is valid');
  return { status: blocked.length ? 'blocked' : conditional.length ? 'conditional' :
    'eligible_for_qualitative_comparison', blocked, conditional, notes, cost,
    bassTopology: topo.mode, numericSourceCoverage };
}
export function groupCandidatePathways(candidates, request) {
  const groups = {};
  for (const c of candidates) {
    const result = assessCandidate(c, request);
    if (result.status === 'blocked') continue;
    (groups[c.architecture] ||= []).push({ id: c.id, status: result.status,
      notes: [...result.conditional, ...result.notes], cost: result.cost });
  }
  return groups;
}
/** A published rating at one resistive load is evidence of that rating, not
 * certification for a real speaker's unknown impedance minimum and phase. */
export function inspectOwnedPair(speaker, amp) {
  const facts = [], checks = [];
  if (!speaker && !amp) return { facts, checks, status: 'not_selected' };
  if (speaker) {
    const v = speaker.values || {};
    facts.push('Speaker: ' + speaker.model + (Number.isFinite(v.load) ? ' · published nominal ' + v.load + ' Ω' : ' · nominal load unavailable'));
    if (!Number.isFinite(v.load)) checks.push('Find the exact speaker nominal and minimum impedance; a model name is not an electrical measurement.');
    else checks.push('Verify actual minimum impedance and phase, which may be lower/more demanding than nominal impedance.');
  }
  if (amp) {
    facts.push('Amplifier: ' + amp.model);
    if (Array.isArray(amp.ratings) && amp.ratings.length) {
      for (const rating of amp.ratings) {
        if (Array.isArray(rating) && Number.isFinite(rating[0]) && Number.isFinite(rating[1]))
          facts.push(rating[0] + ' W/ch at ' + rating[1] + ' Ω (' +
            String(rating[2] || 'rating') + '; ' + String(rating[3] || 'test conditions unspecified') + ')');
      }
    } else checks.push('No verified amplifier power ratings are stored for this model.');
  }
  if (speaker && amp) {
    const z = speaker.values?.load;
    if (Number.isFinite(z) && Array.isArray(amp.ratings) &&
        amp.ratings.some(x => Array.isArray(x) && x[1] === z)) {
      facts.push('An amplifier rating at the speaker nominal load exists; this does not verify full load/thermal compatibility.');
    } else {
      checks.push('No matching published amplifier rating was identified at the speaker nominal load. Do not extrapolate power from other loads.');
    }
    checks.push('Check manufacturer permitted speaker load and real operating limits before declaring this pair safe.');
    checks.push('Use System Check for listening-distance/level headroom. This preview does not invent a second power formula.');
  } else if (speaker) checks.push('Passive speakers need a load-compatible amplifier plus the correct source/control path.');
  else checks.push('An amplifier needs suitable speakers, source connections and correct load verification.');
  return { facts, checks, status: 'conditional' };
}
export const GOALS = Object.freeze({
  all_rounder: { label: 'Balanced and versatile', focus: 'Even tonal response, suitable dispersion and sufficient clean level', experiment: 'Try symmetric placement and small, documented EQ adjustments before changing hardware.' },
  imaging: { label: 'Imaging and spaciousness', focus: 'Matched stereo pair, directivity, speaker/listener geometry and room symmetry', experiment: 'Set a roughly equilateral speaker/listener triangle and compare toe-in in small steps.' },
  dynamic: { label: 'Impact and complex music', focus: 'Clean peaks at the actual seat, compression, speaker loading and amplifier capability', experiment: 'Compare a dense passage at a safe, repeatable level; look for actual distortion/compression evidence.' },
  natural: { label: 'Natural vocals and timbre', focus: 'Smooth response through the voice region, dispersion and listening-axis consistency', experiment: 'Check seat height and first-reflection asymmetry; avoid treating a manufacturer frequency-range endpoint as accuracy.' },
  bass: { label: 'Deep, controlled bass', focus: 'Clean low-frequency extension, room position and measured sub/main integration', experiment: 'Move the seat or subwoofer and compare the same bass passage; investigate room nulls before boosting EQ.' },
  low_volume: { label: 'Quiet listening and fine detail', focus: 'System hiss, channel balance, tonal consistency and workable volume control', experiment: 'Listen for hiss at the seat and check L/R level balance at your normal quiet setting.' },
  party: { label: 'I just wanna party, man!', focus: 'Safe clean output, coverage, power source, portability and venue suitability', experiment: 'Plan audience coverage and hearing-safe duration before chasing the highest advertised peak SPL.' }
});
export function describeBass(configuration, count = 1) {
  if (configuration === 'no_sub') return { mode: 'no_sub', heading: '2.0: no subwoofer',
    notes: ['A capable 2.0 setup is not penalized for having no subwoofer.', 'Low-frequency capability remains with the main speakers.'] };
  if (configuration === 'sub_hpf') return { mode: 'sub_mains_high_passed', heading: '2.1: verified high-pass path',
    notes: ['Main-speaker bass relief is plausible only when the actual wiring, settings and main high-pass have been verified.',
      'Crossover frequency, placement, polarity/phase and seat measurements still determine the blend. No automatic SPL bonus.'] };
  if (configuration === 'sub_full') return { mode: 'sub_mains_full_range', heading: '2.1: mains still play full-range',
    notes: ['Adding a sub does not automatically reduce bass excursion, output-stage load or distortion in the mains.',
      'Check overlapping bass and room cancellations before assuming more bass is better.'] };
  return { mode: 'sub_mains_full_range', heading: '2.1: routing unverified',
    notes: ['Conservatively treat mains as still handling bass; a SUB OUT connector alone is not proof of main high-pass filtering.',
      'Check the exact manual, processor settings and physical signal path. With ' + Math.max(1,count) + ' subwoofer(s), there is no automatic quality bonus.'] };
}
export function eligibleArchitectures(r) {
  if (r.architecture !== 'open') return [r.architecture];
  if (r.useCase === 'party' || r.goal === 'party') return ['party_pa','consumer_powered_pair','passive_separates'];
  return ['passive_separates','consumer_powered_pair','active_studio'];
}
