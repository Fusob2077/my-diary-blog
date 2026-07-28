# Supabase Schema

在 [Supabase SQL Editor](https://supabase.com/dashboard) 中按顺序执行。

## 推荐顺序

1. `00-core-tables.sql` — 首页、Console、技能树、ACG 分类、产出、研究、哲学条目、经济等核心表 + RLS
2. `journal-schema.sql` — 日志 `journal_entries`
3. `diary-entries.sql` — 日记 `diary_entries`（依赖 `update_updated_at_column`；若报错，先确保该函数存在，或改用 `00-core-tables.sql` 里的 `set_updated_at`）
4. `quick-notes.sql` — 随手记 `quick_notes`
5. `philosophy-categories.sql` — 哲学自定义分类
6. `acg-entries.sql` — ACG 条目与标签关联（依赖 `acg_categories` / `acg_tags`）
7. （可选）`seed-*.sql` — 示例分类/标签种子数据，按需执行

## Auth

1. Authentication → Providers → Email：开启邮箱登录  
2. 在 Authentication → Users 创建你的管理员账号  
3. 写入操作要求 `auth.role() = 'authenticated'`；未登录访客只能读

## 说明

- 表结构根据当前前端 / Server Actions 用法整理，可能与你线上库的历史迁移略有出入。  
- **个人日记、文章等内容在数据库里，不在本仓库。** fork 后请用自己的空项目，不要复用别人的密钥。  
- Seed 文件只含分类模板，不含私密正文。
