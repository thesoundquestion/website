export const DAY_MS = 86_400_000;

export const LIMITS = Object.freeze({
  visitorPerDay: 2,
  networkPerDay: 2,
  siteNeuronsPerDay: 3_280,
  reservedNeurons: 82,
  siteInFlight: 2,
  networkInFlight: 1,
  throttleMs: 5_000,
  staleReservationMs: 120_000,
});

const RESERVE = [
  'INSERT INTO tutor_requests',
  '  (id, day, started_at, visitor, network, question_hash, interaction, turn, reserved_neurons)',
  'SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9',
  'WHERE (SELECT COUNT(*) FROM tutor_requests WHERE day = ?2 AND visitor = ?4) < ?10',
  '  AND (SELECT COUNT(*) FROM tutor_requests WHERE day = ?2 AND network = ?5) < ?11',
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
  const [reservation] = await db.batch([
    db.prepare(RESERVE).bind(
      id, day, now, visitor, network, questionHash, interaction, turn, limits.reservedNeurons,
      limits.visitorPerDay, limits.networkPerDay, limits.siteNeuronsPerDay,
      now - limits.throttleMs, now - limits.staleReservationMs, limits.siteInFlight, limits.networkInFlight,
    ),
    db.prepare('DELETE FROM tutor_requests WHERE day < ?').bind(day - 1),
  ]);
  return reservation.meta.changes === 1;
}

export async function finishQuota(db, id, now) {
  await db.prepare('UPDATE tutor_requests SET finished_at = ? WHERE id = ?').bind(now, id).run();
}
