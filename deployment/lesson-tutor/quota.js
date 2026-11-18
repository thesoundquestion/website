export const DAY_MS = 86_400_000;

// Deliberately much lower than the account-wide Workers AI Free allocation.
// The daily allowance opens gradually: 1 slot at UTC midnight, then one
// additional slot every 36 minutes, ending with 40 slots in the final 36 min.
// Unused earlier slots carry forward. No individual visitor can hoard them.
export const LIMITS = Object.freeze({
  firstQuestionPerVisitorPerDay: 1,
  visitorPerDay: 2, // The optional second turn must be a validated clarification.
  networkPerDay: 6, // Households and shared connections should not be limited to 2.
  followUpsPerDay: 8, // At least 32 of 40 AI uses stay available to first questions.
  siteNeuronsPerDay: 3_280,
  reservedNeurons: 82,
  siteInFlight: 2,
  networkInFlight: 1,
  throttleMs: 5_000,
  staleReservationMs: 120_000,
});

export const MAX_DAILY_REQUESTS = Math.floor(LIMITS.siteNeuronsPerDay / LIMITS.reservedNeurons);

export function releasedRequestSlots(now) {
  const elapsed = ((now % DAY_MS) + DAY_MS) % DAY_MS;
  return Math.min(MAX_DAILY_REQUESTS,
    1 + Math.floor(elapsed * MAX_DAILY_REQUESTS / DAY_MS));
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
      limits.firstQuestionPerVisitorPerDay, limits.followUpsPerDay,
    ),
    db.prepare('DELETE FROM tutor_requests WHERE day < ?').bind(day - 1),
  ]);
  return reservation.meta.changes === 1;
}

export async function finishQuota(db, id, now) {
  await db.prepare('UPDATE tutor_requests SET finished_at = ? WHERE id = ?').bind(now, id).run();
}
