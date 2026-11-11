CREATE TABLE IF NOT EXISTS tutor_requests (
  id TEXT PRIMARY KEY,
  day INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  visitor TEXT NOT NULL,
  network TEXT NOT NULL,
  question_hash TEXT NOT NULL,
  interaction TEXT NOT NULL,
  turn INTEGER NOT NULL CHECK (turn IN (0, 1)),
  reserved_neurons INTEGER NOT NULL,
  UNIQUE (day, visitor, question_hash),
  UNIQUE (day, network, question_hash),
  UNIQUE (day, visitor, interaction, turn)
);

CREATE INDEX IF NOT EXISTS tutor_network_started
  ON tutor_requests (network, started_at);

CREATE INDEX IF NOT EXISTS tutor_unfinished
  ON tutor_requests (started_at) WHERE finished_at IS NULL;
