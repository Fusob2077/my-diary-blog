-- 娱乐页：杂谈、ACG、画画 三种摸鱼分类（一键插入）
-- 在 Supabase SQL Editor 中执行；若已存在同名分类则跳过

DO $$
DECLARE
  cid UUID;
BEGIN
  -- 1. 杂谈
  IF NOT EXISTS (SELECT 1 FROM acg_categories WHERE title = '杂谈') THEN
    INSERT INTO acg_categories (title, description, color, sort_order) VALUES ('杂谈', '随便聊聊、碎碎念、想法记录。', '#94a3b8', 1) RETURNING id INTO cid;
    INSERT INTO acg_tags (acg_category_id, tag) VALUES
      (cid, '碎碎念'), (cid, '想法'), (cid, '读书'), (cid, '影视'), (cid, '生活');
  END IF;

  -- 2. ACG 文化
  IF NOT EXISTS (SELECT 1 FROM acg_categories WHERE title = 'ACG 文化') THEN
    INSERT INTO acg_categories (title, description, color, sort_order) VALUES ('ACG 文化', '动画、漫画、游戏、同人、追番与二创。', '#ff6b9d', 2) RETURNING id INTO cid;
    INSERT INTO acg_tags (acg_category_id, tag) VALUES
      (cid, '动画'), (cid, '漫画'), (cid, '游戏'), (cid, '追番'), (cid, '同人'), (cid, '二创');
  END IF;

  -- 3. 我的画
  IF NOT EXISTS (SELECT 1 FROM acg_categories WHERE title = '我的画') THEN
    INSERT INTO acg_categories (title, description, color, sort_order) VALUES ('我的画', '自己画的图、练习、摸鱼涂鸦。', '#39C5BB', 3) RETURNING id INTO cid;
    INSERT INTO acg_tags (acg_category_id, tag) VALUES
      (cid, '摸鱼'), (cid, '练习'), (cid, '同人图'), (cid, '原创'), (cid, '草稿');
  END IF;
END $$;
