-- Gear recommendations: unverified visitor suggestions, NEVER published automatically.
-- Shared D1 database, but no email, name, account or IP columns.
CREATE TABLE IF NOT EXISTS gear_suggestions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK(category IN ('amplifier','speaker','headphone','dac','source','other')),
  brand TEXT NOT NULL CHECK(length(brand) BETWEEN 2 AND 80),
  model TEXT NOT NULL CHECK(length(model) BETWEEN 2 AND 120),
  variant TEXT NOT NULL DEFAULT '' CHECK(length(variant) <= 120),
  approx_year INTEGER CHECK(approx_year IS NULL OR approx_year BETWEEN 1920 AND 2035),
  region TEXT NOT NULL DEFAULT '' CHECK(length(region) <= 60),
  specifications TEXT NOT NULL DEFAULT '' CHECK(length(specifications)<=1200),
  reference_url TEXT NOT NULL DEFAULT '' CHECK(length(reference_url)<=400),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','added')),
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_gear_suggestions_review ON gear_suggestions(status,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_gear_suggestions_pending_unique
  ON gear_suggestions(category,lower(brand),lower(model),lower(variant),lower(region))
  WHERE status='pending';
