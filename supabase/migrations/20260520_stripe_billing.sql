-- =============================================================================
-- Atelier — Stripe billing migration (Sprint 0)
-- 2026-05-20
-- Adds stripe_customer_id to profiles, plus purchases and subscriptions tables.
-- Idempotent. Safe to run multiple times.
-- =============================================================================

-- 1. profiles.stripe_customer_id ----------------------------------------------
alter table public.profiles
  add column if not exists stripe_customer_id text;

create index if not exists profiles_stripe_customer_idx
  on public.profiles(stripe_customer_id);

-- 2. purchases ----------------------------------------------------------------
-- One row per successful one-time or annual payment received via Stripe.
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_cents int not null,
  currency text not null default 'usd',
  status text not null default 'paid',
  created_at timestamptz not null default now()
);

create index if not exists purchases_user_idx on public.purchases(user_id);
create index if not exists purchases_status_idx on public.purchases(status);

-- 3. subscriptions ------------------------------------------------------------
-- One row per active or canceled subscription.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,
  stripe_customer_id text not null,
  stripe_subscription_id text unique not null,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_idx on public.subscriptions(user_id);
create index if not exists subscriptions_status_idx on public.subscriptions(status);

-- 4. RLS ----------------------------------------------------------------------
alter table public.purchases enable row level security;
alter table public.subscriptions enable row level security;

-- Idempotent policy creation
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'purchases'
      and policyname = 'purchases_select_own'
  ) then
    create policy "purchases_select_own" on public.purchases
      for select using (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'subscriptions'
      and policyname = 'subscriptions_select_own'
  ) then
    create policy "subscriptions_select_own" on public.subscriptions
      for select using (user_id = auth.uid());
  end if;
end $$;

-- INSERT / UPDATE / DELETE: webhook only, via service role (bypasses RLS).
-- No anon or authenticated write policies.
