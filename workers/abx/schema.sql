-- ABX scored-session draft schema v2, for a NEW empty D1 database only.
-- No contact information, IP, filenames of uploaded recordings, or source audio.
-- A separate control credential digest permits resume without exposing score control
-- through the audio URL. Answer derivation is HMAC-based; no answer-key table.
CREATE TABLE IF NOT EXISTS abx_sessions (
 id TEXT PRIMARY KEY,
 control_hash TEXT NOT NULL,
 test_id TEXT NOT NULL,
 mode TEXT NOT NULL CHECK(mode IN ('challenge','advanced')),
 total INTEGER NOT NULL CHECK(total IN (10,20)),
 answered INTEGER NOT NULL DEFAULT 0 CHECK(answered>=0 AND answered<=total),
 correct INTEGER NOT NULL DEFAULT 0 CHECK(correct>=0 AND correct<=answered),
 share INTEGER NOT NULL CHECK(share IN (0,1)),
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 purge_at INTEGER NOT NULL,
 completed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_abx_stats ON abx_sessions(test_id,mode,total,share,completed_at);
CREATE INDEX IF NOT EXISTS idx_abx_purge ON abx_sessions(purge_at);
