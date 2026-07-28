-- 娱乐页：条目表（文章/画/帖子）+ 条目-标签关联
-- 在 Supabase SQL Editor 中执行；若已有 acg_entries 可跳过

-- 条目表：论坛式发帖，分类可选，支持多图与链接
CREATE TABLE IF NOT EXISTS acg_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acg_category_id UUID REFERENCES acg_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('article', 'drawing', 'post')),
  image_url TEXT,
  image_urls JSONB DEFAULT '[]'::jsonb,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 条目-标签 多对多（一条内容可打多个标签）
CREATE TABLE IF NOT EXISTS acg_entry_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  acg_entry_id UUID NOT NULL REFERENCES acg_entries(id) ON DELETE CASCADE,
  acg_tag_id UUID NOT NULL REFERENCES acg_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(acg_entry_id, acg_tag_id)
);

CREATE INDEX IF NOT EXISTS idx_acg_entries_category_id ON acg_entries(acg_category_id);
CREATE INDEX IF NOT EXISTS idx_acg_entries_created_at ON acg_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_acg_entry_tags_entry_id ON acg_entry_tags(acg_entry_id);
CREATE INDEX IF NOT EXISTS idx_acg_entry_tags_tag_id ON acg_entry_tags(acg_tag_id);

ALTER TABLE acg_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE acg_entry_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON acg_entries;
CREATE POLICY "Allow public read" ON acg_entries FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert" ON acg_entries;
CREATE POLICY "Allow authenticated insert" ON acg_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow authenticated update" ON acg_entries;
CREATE POLICY "Allow authenticated update" ON acg_entries FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow authenticated delete" ON acg_entries;
CREATE POLICY "Allow authenticated delete" ON acg_entries FOR DELETE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow public read" ON acg_entry_tags;
CREATE POLICY "Allow public read" ON acg_entry_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated insert" ON acg_entry_tags;
CREATE POLICY "Allow authenticated insert" ON acg_entry_tags FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow authenticated update" ON acg_entry_tags;
CREATE POLICY "Allow authenticated update" ON acg_entry_tags FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Allow authenticated delete" ON acg_entry_tags;
CREATE POLICY "Allow authenticated delete" ON acg_entry_tags FOR DELETE USING (auth.role() = 'authenticated');
