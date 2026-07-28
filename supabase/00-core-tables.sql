-- ============================================
-- my-diary 核心表（从代码推断，供本地/新项目初始化）
-- 在 Supabase SQL Editor 中按顺序执行本文件，再执行同目录其余 schema / seed。
-- 策略约定：公开可读，仅 authenticated 可写。
-- ============================================

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 可复用的 RLS 辅助：对给定表启用「公开读 + 登录写」
-- 下面每张表仍显式写 policy，便于单独执行 / 调整。

-- ---------- 首页 ----------
create table if not exists public.changelog (
  id uuid primary key default gen_random_uuid(),
  date text not null,
  content text not null,
  zh text,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  num text,
  tag text,
  en_title text not null,
  zh_title text,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Console ----------
create table if not exists public.mega_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date text,
  note text,
  completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sub_tasks (
  id uuid primary key default gen_random_uuid(),
  mega_task_id uuid not null references public.mega_tasks(id) on delete cascade,
  label text not null,
  completed boolean not null default false,
  weight integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- 音乐 ----------
create table if not exists public.music_taste (
  id bigserial primary key,
  title text not null,
  artist text not null,
  link text not null,
  tag text,
  created_at timestamptz not null default now()
);

-- ---------- 梦日记（部分页面仍为 demo，actions / detail 会用到） ----------
create table if not exists public.dream_logs (
  id uuid primary key default gen_random_uuid(),
  date text,
  title text,
  content text,
  created_at timestamptz not null default now()
);

-- ---------- 软工技能树 ----------
create table if not exists public.tech_tree (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tech_skills (
  id uuid primary key default gen_random_uuid(),
  tech_tree_id uuid not null references public.tech_tree(id) on delete cascade,
  skill text not null,
  sort_order integer not null default 0
);

-- ---------- 嵌入式技能树 ----------
create table if not exists public.embedded_tree (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  icon text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.embedded_skills (
  id uuid primary key default gen_random_uuid(),
  embedded_tree_id uuid not null references public.embedded_tree(id) on delete cascade,
  skill text not null,
  sort_order integer not null default 0
);

-- ---------- ACG 分类 / 标签（条目表见 acg-entries.sql） ----------
create table if not exists public.acg_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  color text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.acg_tags (
  id uuid primary key default gen_random_uuid(),
  acg_category_id uuid not null references public.acg_categories(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now()
);

-- ---------- 产出 ----------
create table if not exists public.art_works (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('painting', 'article', 'video', 'other')),
  title text not null,
  description text,
  link text,
  thumbnail text,
  created_at timestamptz not null default now()
);

-- ---------- 研究 / 阅读 ----------
create table if not exists public.reading_notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date text not null,
  "desc" text,
  content text,
  created_at timestamptz not null default now()
);

create table if not exists public.my_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text,
  date text not null,
  content text,
  created_at timestamptz not null default now()
);

create table if not exists public.research_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  size text,
  type text,
  created_at timestamptz not null default now()
);

-- ---------- 哲学条目（分类表见 philosophy-categories.sql） ----------
create table if not exists public.philosophy_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  author text,
  category text,
  created_at timestamptz not null default now()
);

-- ---------- 经济 ----------
create table if not exists public.economy_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_economy_articles_updated_at on public.economy_articles;
create trigger trg_economy_articles_updated_at
before update on public.economy_articles
for each row execute function public.set_updated_at();

-- ---------- RLS：公开读 + 登录写 ----------
do $$
declare
  t text;
begin
  foreach t in array array[
    'changelog', 'articles', 'mega_tasks', 'sub_tasks', 'music_taste',
    'dream_logs', 'tech_tree', 'tech_skills', 'embedded_tree', 'embedded_skills',
    'acg_categories', 'acg_tags', 'art_works', 'reading_notes', 'my_articles',
    'research_resources', 'philosophy_entries', 'economy_articles'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public_read" on public.%I', t);
    execute format('create policy "public_read" on public.%I for select using (true)', t);
    execute format('drop policy if exists "auth_insert" on public.%I', t);
    execute format(
      'create policy "auth_insert" on public.%I for insert with check (auth.role() = ''authenticated'')',
      t
    );
    execute format('drop policy if exists "auth_update" on public.%I', t);
    execute format(
      'create policy "auth_update" on public.%I for update using (auth.role() = ''authenticated'')',
      t
    );
    execute format('drop policy if exists "auth_delete" on public.%I', t);
    execute format(
      'create policy "auth_delete" on public.%I for delete using (auth.role() = ''authenticated'')',
      t
    );
  end loop;
end $$;
