-- Moderated anonymous nominations and comments in the existing D1 database.
-- No email, account or IP fields. Only approved rows may be returned publicly.
CREATE TABLE IF NOT EXISTS community_posts (
 id TEXT PRIMARY KEY,
 section TEXT NOT NULL CHECK(section IN ('room','abx')),
 kind TEXT NOT NULL CHECK(kind IN ('suggestion','comment')),
 category TEXT NOT NULL DEFAULT '',
 artist TEXT NOT NULL DEFAULT '',
 title TEXT NOT NULL DEFAULT '',
 body TEXT NOT NULL CHECK(length(body) BETWEEN 5 AND 500),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 created_at INTEGER NOT NULL,
 reviewed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_community_public ON community_posts(section,kind,status,category,reviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_review ON community_posts(status,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_song_dedupe ON community_posts(lower(artist),lower(title)) WHERE kind='suggestion' AND status IN ('pending','approved');
