-- 随手记：新表 quick_notes
-- 在 Supabase SQL Editor 执行本文件

create extension if not exists pgcrypto;

create table if not exists public.quick_notes (
  id uuid primary key default gen_random_uuid(),
  title text,
  content text not null,
  mood text,
  tags text,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quick_notes_created_at on public.quick_notes (created_at desc);
create index if not exists idx_quick_notes_pinned_created on public.quick_notes (is_pinned desc, created_at desc);

create or replace function public.set_quick_notes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_quick_notes_updated_at on public.quick_notes;
create trigger trg_quick_notes_updated_at
before update on public.quick_notes
for each row
execute function public.set_quick_notes_updated_at();

alter table public.quick_notes enable row level security;

drop policy if exists "quick_notes_read_all" on public.quick_notes;
create policy "quick_notes_read_all"
on public.quick_notes
for select
to anon, authenticated
using (true);

drop policy if exists "quick_notes_write_auth" on public.quick_notes;
create policy "quick_notes_write_auth"
on public.quick_notes
for all
to authenticated
using (true)
with check (true);

-- 可选：把旧 dream_logs 数据迁移到 quick_notes
insert into public.quick_notes (title, content, mood, tags, created_at)
select
  nullif(title, ''),
  coalesce(content, ''),
  '记录',
  nullif(date, ''),
  coalesce(created_at, now())
from public.dream_logs
where content is not null
  and not exists (
    select 1
    from public.quick_notes q
    where q.content = public.dream_logs.content
      and q.created_at = coalesce(public.dream_logs.created_at, q.created_at)
  );
