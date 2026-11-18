export const DAY_MS = 86_400_000;

// Launch policy: use the free tier generously without giving the first users
// the whole budget. 60% opens at the UTC reset; the rest unlocks over the day.
// Earlier unused slots carry forward, but no slots are borrowed from tomorrow.
export const LIMITS = Object.freeze({
  firstQuestionPerVisitorPerDay: 3,
  followUpsPerVisitorPerDay: 1,
  visitorPerDay: 4, // 3 independent questions + at most 1 clarification.
  networkPerDay: 12, // Shared households and networks; not unique human IDs.
  followUpsPerDay: 20, // At least 77 slots stay available for initial questions.
  siteNeuronsPerDay: 8_000, // A conservative ~2,000-neuron account buffer.
  reservedNeurons: 82, // Estimate only: verify against live token metering.
  siteInFlight: 2,
  networkInFlight: 1,
  throttleMs: 5_000,
  staleReservationMs: 120_000,
});

export const MAX_DAILY_REQUESTS = Math.floor(LIMITS.siteNeuronsPerDay / LIMITS.reservedNeurons);
export const INITIAL_RELEASED_REQUESTS = Math.floor(MAX_DAILY_REQUESTS * 0.60);

export function releasedRequestSlots(now) {
  const elapsed = ((now % DAY_MS) + DAY_MS) % DAY_MS;
  const remainder = MAX_DAILY_REQUESTS - INITIAL_RELEASED_REQUESTS;
  // Spread later slots over the daylight hours, with the last available before
  // the next UTC reset. All previously unlocked slots remain available.
  const later = Math.min(remainder, Math.floor(elapsed * (remainder + 1) / DAY_MS));
  return INITIAL_RELEASED_REQUESTS + later;
}

const RESERVE = [
  'INSERT INTO tutor_requests',
  '  (id, day, started_at, visitor, network, question_hash, interaction, turn, reserved_neurons)',
  'SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9',
  'WHERE (SELECT COUNT(*) FROM tutor_requests WHERE day = ?2 AND visitor = ?4) < ?10',
  '  AND (SELECT COUNT(*) FROM tutor_requests WHERE day = ?2 AND network = ?5) < ?11',
  '  AND (?8 = 1 OR (SELECT COUNT(*) FROM tutor_requests',
  '    WHERE day = ?2 AND visitor = ?4 AND turn = 0) < ?17)',
  '  AND (?8 = 0 OR (SELECT COUNT(*) FROM tutor_requests',
  '    WHERE day = ?2 AND turn = 1) < ?18)',
  '  AND (?8 = 0 OR (SELECT COUNT(*) FROM tutor_requests',
  '    WHERE day = ?2 AND visitor = ?4 AND turn = 1) < ?19)',
  '  AND (SELECT COALESCE(SUM(reserved_neurons), 0) FROM tutor_requests WHERE day = ?2) + ?9 <= ?12',
  '  AND NOT EXISTS (SELECT 1 FROM tutor_requests WHERE network = ?5 AND started_at > ?13)',
  '  AND (SELECT COUNT(*) FROM tutor_requests WHERE finished_at IS NULL AND started_at > ?14) < ?15',
  '  AND (SELECT COUNT(*) FROM tutor_requests WHERE network = ?5 AND finished_at IS NULL AND started_at > ?14) < ?16',
  '  AND (?8 = 0 OR EXISTS (SELECT 1 FROM tutor_requests',
  '       WHERE id = ?7 AND day = ?2 AND visitor = ?4 AND turn = 0 AND finished_at IS NOT NULL))',
  'ON CONFLICT DO NOTHING',
].join('\n');

export async function reserveQuota(db, { id, day, now, visitor, network, questionHash, interaction, turn }) {
  const limits = LIMITS;
  // Use D1's atomic INSERT predicate. Checking quotas in JS before inserting
  // would permit simultaneous browsers to overrun the free daily allowance.
  const pacedNeurons = Math.min(
    limits.siteNeuronsPerDay, releasedRequestSlots(now) * limits.reservedNeurons);
  const [reservation] = await db.batch([
    db.prepare(RESERVE).bind(
      id, day, now, visitor, network, questionHash, interaction, turn, limits.reservedNeurons,
      limits.visitorPerDay, limits.networkPerDay, pacedNeurons,
      now - limits.throttleMs, now - limits.staleReservationMs, limits.siteInFlight, limits.networkInFlight,
      limits.firstQuestionPerVisitorPerDay, limits.followUpsPerDay, limits.followUpsPerVisitorPerDay,
    ),
    db.prepare('DELETE FROM tutor_requests WHERE day < ?').bind(day - 1),
  ]);
  return reservation.meta.changes === 1;
}

export async function finishQuota(db, id, now) {
  await db.prepare('UPDATE tutor_requests SET finished_at = ? WHERE id = ?').bind(now, id).run();
}
