-- 创建 journal_entries 表的 SQL 脚本
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  tag TEXT NOT NULL CHECK (tag IN ('THOUGHT', 'WORK', 'LIFE')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加 updated_at 字段的自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON journal_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 创建索引以提高查询性能
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_entries_tag ON journal_entries(tag);

-- 添加 RLS 策略（如果需要）
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取
CREATE POLICY "Allow public read" ON journal_entries
  FOR SELECT
  USING (true);

-- 只允许认证用户写入
CREATE POLICY "Allow authenticated write" ON journal_entries
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 只允许拥有者修改
CREATE POLICY "Allow owner update" ON journal_entries
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 只允许拥有者删除
CREATE POLICY "Allow owner delete" ON journal_entries
  FOR DELETE
  USING (auth.role() = 'authenticated');
