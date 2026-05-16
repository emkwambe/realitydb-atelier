-- =============================================================================
-- Atelier Auth + RBAC migration (2026-05-16)
-- Idempotent. Safe to run multiple times.
-- =============================================================================

-- 1. Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- 2. Cohorts ------------------------------------------------------------------
create table if not exists public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  institution text,
  instructor_id uuid references auth.users(id) on delete set null,
  scenario_variant text default 'baseline',
  difficulty text default 'standard',
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists cohorts_instructor_idx on public.cohorts(instructor_id);

-- 3. Profiles -----------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists role text default 'learner'
  check (role in ('learner','instructor','admin','institution'));

alter table public.profiles
  add column if not exists institution text;

alter table public.profiles
  add column if not exists cohort_id uuid references public.cohorts(id) on delete set null;

alter table public.profiles
  add column if not exists account_type text
  check (account_type in ('individual','university','corporate'));

-- 4. Cohort invites -----------------------------------------------------------
create table if not exists public.cohort_invites (
  token text primary key,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  invited_email text,
  invited_role text default 'learner' check (invited_role in ('learner','instructor')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  accepted_at timestamptz
);

create index if not exists cohort_invites_cohort_idx on public.cohort_invites(cohort_id);

-- 5. Module progress + briefing submissions + certificates --------------------
create table if not exists public.module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_slug text not null,
  exercise_index int not null,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, module_slug, exercise_index)
);

create table if not exists public.briefing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_slug text not null,
  body text not null,
  score int,
  rubric jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.biz_certifications (
  cert_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  module_slug text not null,
  score int not null,
  data jsonb not null,
  signature text not null,
  issued_at timestamptz not null default now()
);

-- 6. Trigger to seed profile on auth.users insert ----------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.email,
    'learner',
    coalesce(new.raw_user_meta_data->>'account_type', 'individual')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 7. Helper: is_admin / cohort lookup for RLS ---------------------------------
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.same_cohort_as(target_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles me, public.profiles them
    where me.id = auth.uid()
      and them.id = target_user
      and me.cohort_id is not null
      and me.cohort_id = them.cohort_id
      and me.role in ('instructor','institution','admin')
  );
$$;

-- 8. RLS ----------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.cohorts             enable row level security;
alter table public.cohort_invites      enable row level security;
alter table public.module_progress     enable row level security;
alter table public.briefing_submissions enable row level security;
alter table public.biz_certifications  enable row level security;

-- Drop existing policies for clean reset
do $$
declare
  pol record;
begin
  for pol in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles','cohorts','cohort_invites','module_progress',
        'briefing_submissions','biz_certifications'
      )
  loop
    execute format('drop policy if exists %I on %I.%I',
                   pol.policyname, pol.schemaname, pol.tablename);
  end loop;
end $$;

-- profiles
create policy "profiles_select_self_or_privileged" on public.profiles
  for select using (
    id = auth.uid()
    or public.is_admin()
    or public.same_cohort_as(id)
  );

create policy "profiles_update_self_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- INSERT happens via the trigger (security definer); no anon insert policy.

-- cohorts
create policy "cohorts_select_member_or_owner" on public.cohorts
  for select using (
    instructor_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.profiles
      where id = auth.uid() and cohort_id = cohorts.id
    )
  );

create policy "cohorts_insert_instructor_or_institution" on public.cohorts
  for insert with check (
    public.current_role() in ('instructor','institution','admin')
    and (instructor_id = auth.uid() or public.is_admin())
  );

create policy "cohorts_update_owner_or_admin" on public.cohorts
  for update using (instructor_id = auth.uid() or public.is_admin());

-- cohort_invites
create policy "invites_select_anyone_with_token" on public.cohort_invites
  for select using (true);

create policy "invites_insert_instructor_or_admin" on public.cohort_invites
  for insert with check (
    public.current_role() in ('instructor','institution','admin')
  );

create policy "invites_update_self_or_admin" on public.cohort_invites
  for update using (created_by = auth.uid() or public.is_admin() or accepted_at is null);

-- module_progress
create policy "progress_select_own_or_instructor" on public.module_progress
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or public.same_cohort_as(user_id)
  );

create policy "progress_insert_own" on public.module_progress
  for insert with check (user_id = auth.uid());

create policy "progress_update_own" on public.module_progress
  for update using (user_id = auth.uid());

-- briefing_submissions
create policy "briefings_select_own_or_instructor" on public.briefing_submissions
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or public.same_cohort_as(user_id)
  );

create policy "briefings_insert_own" on public.briefing_submissions
  for insert with check (user_id = auth.uid());

-- Service role bypasses RLS for grading UPDATE.

-- biz_certifications
create policy "certs_select_public" on public.biz_certifications
  for select using (true);

-- INSERT into biz_certifications goes through the API route using the service role.
