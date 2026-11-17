-- D1 scored ABX schema. No IP addresses, email addresses, names or uploaded audio.
CREATE TABLE IF NOT EXISTS abx_sessions (
 id TEXT PRIMARY KEY,
 test_id TEXT NOT NULL,
 mode TEXT NOT NULL CHECK(mode IN ('challenge','advanced')),
 total INTEGER NOT NULL CHECK(total IN (10,20)),
 answered INTEGER NOT NULL DEFAULT 0,
 correct INTEGER NOT NULL DEFAULT 0,
 share INTEGER NOT NULL DEFAULT 0 CHECK(share IN (0,1)),
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 completed_at INTEGER
);
CREATE TABLE IF NOT EXISTS abx_rounds (
 session_id TEXT NOT NULL,
 round_index INTEGER NOT NULL,
 token TEXT NOT NULL UNIQUE,
 answer TEXT NOT NULL CHECK(answer IN ('A','B')),
 guess TEXT CHECK(guess IN ('A','B')),
 answered_at INTEGER,
 PRIMARY KEY (session_id,round_index),
 FOREIGN KEY(session_id) REFERENCES abx_sessions(id)
);
CREATE INDEX IF NOT EXISTS idx_abx_stats ON abx_sessions(test_id,mode,share,completed_at);
CREATE INDEX IF NOT EXISTS idx_abx_expiry ON abx_sessions(expires_at);
