-- Backup existing data, drop table, and recreate with nullable challenger_email
CREATE TABLE IF NOT EXISTS waitlist_backup AS SELECT * FROM waitlist;

DROP TABLE IF EXISTS waitlist;

CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  challenger_email TEXT,
  friend_email TEXT NOT NULL,
  source TEXT
);

-- Re-enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Allow anonymous inserts" ON waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can read" ON waitlist FOR SELECT USING (true);

-- Restore data from backup
INSERT INTO waitlist (id, created_at, challenger_email, friend_email, source)
SELECT id, created_at, challenger_email, friend_email, source FROM waitlist_backup;

-- Drop backup table
DROP TABLE IF EXISTS waitlist_backup;
