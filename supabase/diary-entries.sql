-- ============================================
-- diary_entries（详情页日记）
-- 可单独执行；不依赖 journal-schema 里的函数
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  "desc" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON diary_entries(created_at DESC);

DROP TRIGGER IF EXISTS update_diary_entries_updated_at ON diary_entries;

CREATE TRIGGER update_diary_entries_updated_at
BEFORE UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON diary_entries;
CREATE POLICY "Allow public read" ON diary_entries
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON diary_entries;
CREATE POLICY "Allow authenticated insert" ON diary_entries
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update" ON diary_entries;
CREATE POLICY "Allow authenticated update" ON diary_entries
FOR UPDATE
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete" ON diary_entries;
CREATE POLICY "Allow authenticated delete" ON diary_entries
FOR DELETE
USING (auth.role() = 'authenticated');
