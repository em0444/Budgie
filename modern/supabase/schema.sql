-- Budgie Supabase schema
-- Run this file in the Supabase SQL Editor.
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  income numeric(12,2) not null check (income >= 0),
  period text not null check (period in ('weekly', 'monthly', 'annually')),
  expenses jsonb not null default '{}'::jsonb,
  suggestions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.budgets enable row level security;

create policy "Users can view their own budgets"
  on public.budgets for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own budgets"
  on public.budgets for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own budgets"
  on public.budgets for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own budgets"
  on public.budgets for delete to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists budgets_user_created_idx
  on public.budgets (user_id, created_at desc);
