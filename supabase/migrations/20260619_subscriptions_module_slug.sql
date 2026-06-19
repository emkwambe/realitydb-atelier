-- =============================================================================
-- Atelier — add module_slug to subscriptions (Phase 0: per-module entitlements)
-- 2026-06-19
-- A "Module" subscription grants access to exactly one company module. We store
-- the chosen module slug (e.g. 'novapay') so canAccess() can scope access to it.
-- All-Access subscriptions leave this NULL (they unlock every module).
-- Idempotent. Safe to run multiple times.
-- =============================================================================

alter table public.subscriptions
  add column if not exists module_slug text;

create index if not exists subscriptions_module_slug_idx
  on public.subscriptions(module_slug);
