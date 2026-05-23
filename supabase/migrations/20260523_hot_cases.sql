-- =============================================================================
-- Atelier — Hot Cases migration (Sprint 0B)
-- 2026-05-23
-- Catalog + submissions tables for the free Hot Cases product.
-- Naming canon (SOT §8):
--   hot_cases               — NOT briefs
--   hot_case_submissions    — NOT brief_submissions
-- Idempotent. Safe to run multiple times.
-- =============================================================================

-- 1. hot_cases ----------------------------------------------------------------
-- One row per Hot Case in the catalog. status governs whether the case is
-- visible on /hot-cases. pack_hash / dataset_hash give us reproducibility
-- proofs once the publish pipeline is wired in Sprint 1+.
create table if not exists public.hot_cases (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  vertical text not null,
  pattern_id text not null,
  published_at timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  pack_hash text,
  dataset_hash text,
  engine_version text,
  primary_dimension text not null,
  secondary_dimension text not null,
  created_at timestamptz not null default now()
);

create index if not exists hot_cases_status_idx on public.hot_cases(status);
create index if not exists hot_cases_published_at_idx on public.hot_cases(published_at);

-- 2. hot_case_submissions -----------------------------------------------------
-- One row per attempt. user_id may be NULL for anonymous attempts (free Hot
-- Cases never require an account); in that case email captures the contact.
create table if not exists public.hot_case_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text,
  hot_case_slug text not null references public.hot_cases(slug) on delete cascade,
  score integer,
  axes jsonb,
  briefing_text text,
  boardroom_transcript jsonb,
  created_at timestamptz not null default now()
);

create index if not exists hot_case_submissions_slug_idx
  on public.hot_case_submissions(hot_case_slug);
create index if not exists hot_case_submissions_user_idx
  on public.hot_case_submissions(user_id);
create index if not exists hot_case_submissions_created_idx
  on public.hot_case_submissions(created_at desc);

-- 3. RLS ----------------------------------------------------------------------
alter table public.hot_cases enable row level security;
alter table public.hot_case_submissions enable row level security;

-- Idempotent policy creation
do $$
begin
  -- Public read on published Hot Cases (anon and authenticated).
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'hot_cases'
      and policyname = 'hot_cases_select_published'
  ) then
    create policy "hot_cases_select_published" on public.hot_cases
      for select
      using (status = 'published');
  end if;

  -- Authenticated users see their own submissions.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'hot_case_submissions'
      and policyname = 'hot_case_submissions_select_own'
  ) then
    create policy "hot_case_submissions_select_own" on public.hot_case_submissions
      for select
      using (user_id = auth.uid());
  end if;

  -- Authenticated users can insert their own submissions.
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'hot_case_submissions'
      and policyname = 'hot_case_submissions_insert_own'
  ) then
    create policy "hot_case_submissions_insert_own" on public.hot_case_submissions
      for insert
      with check (
        user_id = auth.uid()
        or (user_id is null and auth.uid() is null)
      );
  end if;

  -- Anon submissions: user_id null, email present. The insert policy above
  -- already permits this when auth.uid() is null. No separate policy needed.
  -- Result page reads are scoped via the API route using service role +
  -- the submission id as the secret — RLS would deny anon SELECT here.
end $$;
