-- 哲学自定义分类表（自主添加分类）
-- 在 Supabase SQL Editor 中执行此脚本

CREATE TABLE IF NOT EXISTS philosophy_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  en TEXT,
  icon TEXT,
  "desc" TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_philosophy_categories_sort ON philosophy_categories(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_philosophy_categories_created_at ON philosophy_categories(created_at ASC);

ALTER TABLE philosophy_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON philosophy_categories;
CREATE POLICY "Allow public read" ON philosophy_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert" ON philosophy_categories;
CREATE POLICY "Allow authenticated insert" ON philosophy_categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update" ON philosophy_categories;
CREATE POLICY "Allow authenticated update" ON philosophy_categories
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete" ON philosophy_categories;
CREATE POLICY "Allow authenticated delete" ON philosophy_categories
  FOR DELETE USING (auth.role() = 'authenticated');
