-- 软工「前端架构」分类 + 5 条技能（一键插入）
-- 在 Supabase SQL Editor 中执行；若已存在「前端架构」分类则不会重复插入

DO $$
DECLARE
  tid UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM tech_tree WHERE category = '前端架构') THEN
    INSERT INTO tech_tree (category, icon, sort_order) VALUES ('前端架构', '◇', 0) RETURNING id INTO tid;
    INSERT INTO tech_skills (tech_tree_id, skill, sort_order) VALUES
      (tid, 'Next.js 16 & React 19', 1),
      (tid, 'Modern Styling & Motion —— Tailwind CSS 4 & Framer Motion / Anime.js', 2),
      (tid, 'BaaS Integration —— Supabase 全栈集成（Auth / Database / RLS）', 3),
      (tid, 'Server-First Architecture —— 基于 Server Actions 的零 API 层数据交互', 4),
      (tid, 'Performance Optimization —— 粒子效果优化（tsparticles）、SWR 缓存策略、组件划分', 5);
  END IF;
END $$;
