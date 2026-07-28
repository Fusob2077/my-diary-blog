-- ACG 界面建议：6 个分类 + 对应标签（一键插入）
-- 在 Supabase SQL Editor 中执行；若已存在同名分类则跳过该分类

DO $$
DECLARE
  cid UUID;
BEGIN
  -- 1. 动画 / 追番
  IF NOT EXISTS (SELECT 1 FROM acg_categories WHERE title = '动画 / 追番') THEN
    INSERT INTO acg_categories (title, description, color, sort_order) VALUES ('动画 / 追番', '在追、补番、想看的，按类型或年代归档。', '#ff6b9d', 1) RETURNING id INTO cid;
    INSERT INTO acg_tags (acg_category_id, tag) VALUES
      (cid, '在追'), (cid, '补番中'), (cid, '想看的'),
      (cid, '日常'), (cid, '战斗'), (cid, '悬疑'), (cid, '恋爱'),
      (cid, '2020s'), (cid, '2010s'), (cid, '经典');
  END IF;

  -- 2. 精神分析 / 读解
  IF NOT EXISTS (SELECT 1 FROM acg_categories WHERE title = '精神分析 / 读解') THEN
    INSERT INTO acg_categories (title, description, color, sort_order) VALUES ('精神分析 / 读解', '用精神分析（拉康等）读动画、角色、叙事。', '#6366f1', 2) RETURNING id INTO cid;
    INSERT INTO acg_tags (acg_category_id, tag) VALUES
      (cid, '拉康 / 欲望与能指'), (cid, '角色分析'), (cid, '叙事与主体'),
      (cid, '镜像阶段 / 象征界'), (cid, '笔记与读后感');
  END IF;

  -- 3. MMD
  IF NOT EXISTS (SELECT 1 FROM acg_categories WHERE title = 'MMD') THEN
    INSERT INTO acg_categories (title, description, color, sort_order) VALUES ('MMD', 'MikuMikuDance，想学的部分。', '#22d3ee', 3) RETURNING id INTO cid;
    INSERT INTO acg_tags (acg_category_id, tag) VALUES
      (cid, 'MikuMikuDance 入门'), (cid, '模型 / 动作 / 镜头'), (cid, '渲染（Ray、PMX 等）'),
      (cid, '物理与刚体'), (cid, '想学的教程/案例');
  END IF;

  -- 4. 绘画
  IF NOT EXISTS (SELECT 1 FROM acg_categories WHERE title = '绘画') THEN
    INSERT INTO acg_categories (title, description, color, sort_order) VALUES ('绘画', '插画、同人图、练习与工具。', '#f472b6', 4) RETURNING id INTO cid;
    INSERT INTO acg_tags (acg_category_id, tag) VALUES
      (cid, '插画 / 同人图'), (cid, '练习（人体、色彩、构图）'), (cid, 'SAI / CSP / PS'),
      (cid, '想画的角色/CP'), (cid, '接稿 / 约稿');
  END IF;

  -- 5. 术力口 / Vocaloid
  IF NOT EXISTS (SELECT 1 FROM acg_categories WHERE title = '术力口 / Vocaloid') THEN
    INSERT INTO acg_categories (title, description, color, sort_order) VALUES ('术力口 / Vocaloid', '调教、曲风、P 主、想做的小曲。', '#a78bfa', 5) RETURNING id INTO cid;
    INSERT INTO acg_tags (acg_category_id, tag) VALUES
      (cid, '调教（VOCALOID / SynthV / UTAU）'), (cid, '电子 / 摇滚 / 叙事曲'), (cid, '喜欢的 P 主'),
      (cid, '想做的小曲 / 练习'), (cid, '混音 / 母带入门');
  END IF;

  -- 6. 同人
  IF NOT EXISTS (SELECT 1 FROM acg_categories WHERE title = '同人') THEN
    INSERT INTO acg_categories (title, description, color, sort_order) VALUES ('同人', '本子、合志、only、想搞的 CP 或作品。', '#fb7185', 6) RETURNING id INTO cid;
    INSERT INTO acg_tags (acg_category_id, tag) VALUES
      (cid, '本子 / 合志'), (cid, 'Only 展 / 即卖会'), (cid, '想搞的 CP / 作品'),
      (cid, '文 / 图 / 曲 / MMD'), (cid, '同人社团');
  END IF;
END $$;
