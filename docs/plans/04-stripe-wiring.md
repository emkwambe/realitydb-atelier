# Stripe Wiring — Pre-PRD Plan
**Status:** Draft v1 · 2026-05-18 · Owner: Eddy
**Audience:** Founder + lead engineering hire

> Status: research / decisions phase. **No code is written until §8
> (Pre-build decisions) is signed off.** The decisions are small but
> path-dependent — wrong call on subscription vs. one-time, or on
> gating timing, costs us a re-architecture later.

---

## 1. Goal

Let buyers self-checkout every tier on the pricing page except
Enterprise. Every successful payment writes a row to Supabase. The
existing modules still load for anyone with an account (Phase 1
deliberately doesn't paywall them); Phase 2 adds the gate later when
the funnel justifies it.

What this is NOT:

- This is **not** a billing rewrite. We are not refactoring auth,
  modules, or grading.
- This is **not** a paywall installation. Modules stay open in Phase
  1.
- This is **not** a discount-engine, coupon system, or promotional
  framework. Standard prices only.

---

## 2. The two-phase approach

### Phase 1 — Record (this sprint, ~5–6 days)

- Stripe Checkout works for all six self-serve tiers.
- Successful payments land in `purchases` and `subscriptions` tables.
- Customers can manage their own billing via Stripe Customer Portal.
- Modules **remain technically unlocked** for any authenticated user
  in Phase 1. Phase 1 is about capturing payments; the in-code gate
  comes in Phase 2.

Rationale: the funnel is fragile. If we gate before we have organic
demand, every accidental block kills a future customer. We *record*
who has paid; we keep the experience generous in code. The marketing
copy (every CTA says "Subscribe to") sets the expectation; the
honour system covers the gap until Phase 2.

### Phase 2 — Gate (future, after first ~50 paying users)

- `lib/entitlements.ts` exposes `canAccess(userId, module)` checks.
- `/companies/<slug>` routes call the check and redirect non-paying
  users to `/pricing`.
- **No free preview exercises.** Originally we proposed first 3
  exercises free per module; that was rolled back when it became
  clear NovaPay alone covers nearly all the SaaS-domain content a
  buyer needs. Giving away 3 of 10 exercises is giving away the
  pattern itself. The free funnel is Briefs only.
- Briefs stay free forever (per data-split contract §11).
- Driven by an `ENABLE_PAYWALL=true` env flag so the gate can be
  rolled out gradually.

### Strategy note: no free Module trials

The original plan had NovaPay positioned as a free trial. We rolled
that back. NovaPay alone is 10 exercises plus a graded briefing
covering FinTech-SaaS retention, cohort analysis, churn investigation,
and ARR math. For a SaaS analyst, that is essentially the entire
domain — there is nothing left to pay for. Same logic applies to
ClearBank (AML), OncoCare (clinical trials), and every other module:
each module is comprehensive enough for its domain that even a free
preview cannibalises paid conversion.

The free funnel is therefore **Weekly Briefs**, not Module previews.
Briefs are cross-domain, single-pattern, much smaller per-piece, and
their purpose is to demonstrate the engine and capture emails — not
to teach a buyer everything they need to know about a vertical.
A learner who solves Brief 001 (Cohort Collapse) gets one pattern;
a learner who buys NovaPay gets the company.

---

## 3. The seven tiers in Stripe terms

Every tier is a subscription. There are no one-time prices. Buyers
choose monthly or annual at checkout; annual is the default and saves
roughly 17% vs paying monthly. Subscriptions can be cancelled
anytime via the Customer Portal; on cancel, access continues to the
end of the period.

| Tier | Stripe mode | Notes |
|---|---|---|
| Module | `subscription` monthly OR annual | One Stripe Product per company (NovaPay, MedCore, …). Each Product carries TWO Prices — one at $49/month, one at $499/year. Twelve Prices total, two per module. |
| All-Access | `subscription` monthly OR annual | One Product with two Prices — $149/month and $1,499/year. Grants entitlement to every Module Product. |
| Team | `subscription` annual | One Product, one Price at $9,999/year. The "10 seats" is a metadata constraint we enforce in Supabase, not a Stripe quantity. |
| MBA License | `subscription` biannual | One Product, one Price at $14,999 / 6 months (the closest Stripe cadence to "semester"). Auto-renew off by default. |
| Instructor Solo | `subscription` monthly | $299/mo. Cancel anytime. |
| Instructor Pro | `subscription` monthly | $799/mo. Cancel anytime. |
| Enterprise | **no Stripe** | Stays sales-contact. Invoiced via Stripe Invoicing (not Checkout) if needed; not in scope here. |

### 3.1 Product / Price catalog in Stripe

Create these in the Stripe dashboard (not in code) before any
implementation:

```
PRODUCT: Atelier Module — NovaPay
  PRICE: price_module_novapay_monthly      $49  / month
  PRICE: price_module_novapay_yearly       $499 / year

PRODUCT: Atelier Module — MedCore          (same shape, two Prices)
PRODUCT: Atelier Module — SupplyLink       (same shape, two Prices)
PRODUCT: Atelier Module — TowerNet         (same shape, two Prices)
PRODUCT: Atelier Module — ClearBank        (same shape, two Prices)
PRODUCT: Atelier Module — OncoCare         (same shape, two Prices)

PRODUCT: Atelier All-Access
  PRICE: price_all_access_monthly          $149  / month
  PRICE: price_all_access_yearly           $1,499 / year

PRODUCT: Atelier Team (10 seats / 1 yr)
  PRICE: price_team                        $9,999 / year

PRODUCT: Atelier MBA License
  PRICE: price_mba                         $14,999 / 6 months (auto-renew off)

PRODUCT: Atelier Instructor Solo
  PRICE: price_instructor_solo             $299 / month

PRODUCT: Atelier Instructor Pro
  PRICE: price_instructor_pro              $799 / month
```

Total: 19 Prices across 11 Products (six Module Products × 2 Prices,
All-Access × 2, Team × 1, MBA × 1, Instructor Solo × 1, Instructor
Pro × 1).

The Stripe Price IDs are referenced in our code by *name only*, never
hard-coded. They live in `STRIPE_PRICE_<KEY>` env vars so they can be
swapped between test and live keys without code changes.

### 3.2 Per-module purchase OR All-Access — entitlement math

The entitlement check (Phase 2) is:

```
user can access module M if:
  exists row in `purchases` where user_id = uid AND product = 'all-access'
  OR
  exists row in `purchases` where user_id = uid AND product = 'module-' || M
```

Cohort/Team/MBA/Instructor subscriptions extend entitlement to seated
learners — a separate join through the cohort tables. Spec deferred
to Phase 2.

---

## 4. Surface area

### 4.1 New env vars (in `.env.local` and Vercel project settings)

```
# Server-only — never expose to client
STRIPE_SECRET_KEY=sk_test_…           # sk_live_… on production
STRIPE_WEBHOOK_SECRET=whsec_…         # signing secret from webhook endpoint

# Client-safe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…

# Price IDs (server-only, by name)
STRIPE_PRICE_MODULE_NOVAPAY=price_…
STRIPE_PRICE_MODULE_MEDCORE=price_…
STRIPE_PRICE_MODULE_SUPPLYLINK=price_…
STRIPE_PRICE_MODULE_TOWERNET=price_…
STRIPE_PRICE_MODULE_CLEARBANK=price_…
STRIPE_PRICE_MODULE_ONCOCARE=price_…
STRIPE_PRICE_ALL_ACCESS=price_…
STRIPE_PRICE_TEAM=price_…
STRIPE_PRICE_MBA=price_…
STRIPE_PRICE_INSTRUCTOR_SOLO=price_…
STRIPE_PRICE_INSTRUCTOR_PRO=price_…
```

### 4.2 New routes

| Route | Method | Purpose |
|---|---|---|
| `/api/checkout` | POST | Create a Stripe Checkout Session for a given `plan` + return the session URL |
| `/api/webhook/stripe` | POST | Receive `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. Upsert Supabase rows. Verify signature. |
| `/api/portal` | POST | Create a Customer Portal session for an authenticated user. Return portal URL. |
| `/checkout/success` | GET | Post-payment landing. Shows "Payment confirmed. Your access is active." |
| `/checkout/cancel` | GET | Post-cancel landing. Shows "No charge was made. [Try again]." |
| `/account/billing` | GET | Authenticated billing summary + "Manage billing" button → `/api/portal` |

### 4.3 New library

`lib/stripe.ts`:
- `getStripeServerClient()` — singleton, server-only
- `createCheckoutSession({ userId, planKey, successUrl, cancelUrl })`
- `createPortalSession({ stripeCustomerId, returnUrl })`
- `priceIdForPlan(planKey)` — env-var lookup, validated at startup

### 4.4 New Supabase tables

```sql
-- One row per successful one-time purchase.
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,                  -- 'module-novapay', 'all-access', etc.
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_cents int not null,
  currency text not null default 'usd',
  status text not null default 'paid',    -- 'paid', 'refunded'
  created_at timestamptz not null default now()
);

-- One row per active or canceled subscription.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product text not null,                  -- 'team', 'mba', 'instructor-solo', 'instructor-pro'
  stripe_customer_id text not null,
  stripe_subscription_id text unique not null,
  status text not null,                   -- 'active', 'past_due', 'canceled', 'unpaid', 'trialing'
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index purchases_user_idx on public.purchases(user_id);
create index subscriptions_user_idx on public.subscriptions(user_id);
create index subscriptions_status_idx on public.subscriptions(status);

-- RLS: users see their own purchases/subs; service role bypasses.
alter table public.purchases enable row level security;
alter table public.subscriptions enable row level security;

create policy "purchases_select_own"
  on public.purchases for select
  using (user_id = auth.uid());

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (user_id = auth.uid());
-- No insert/update policies. The webhook writes via service role.
```

### 4.5 Schema addition to `profiles`

```sql
alter table public.profiles
  add column if not exists stripe_customer_id text;

create index if not exists profiles_stripe_customer_idx
  on public.profiles(stripe_customer_id);
```

One Stripe Customer per Atelier user. Set on first checkout, reused
forever.

---

## 5. Webhook handling

The webhook is the source of truth. Only the webhook writes to
`purchases` and `subscriptions` — never the frontend.

### 5.1 Events we handle

| Event | Action |
|---|---|
| `checkout.session.completed` | Mode `payment` → insert `purchases` row. Mode `subscription` → insert `subscriptions` row (also: subscription was created server-side at this point). |
| `customer.subscription.updated` | Update existing `subscriptions` row (period bounds, status). |
| `customer.subscription.deleted` | Mark `subscriptions.status = 'canceled'`. |
| `charge.refunded` | Mark `purchases.status = 'refunded'`. |
| `invoice.payment_failed` | Mark `subscriptions.status = 'past_due'`. (Stripe also dunning-emails the customer.) |

### 5.2 Idempotency

Stripe retries webhooks if the response is non-2xx. The webhook
endpoint must be idempotent:

- For `purchases`: `stripe_checkout_session_id` is unique; an INSERT
  with `ON CONFLICT DO NOTHING` is safe to retry.
- For `subscriptions`: `stripe_subscription_id` is unique; same.

### 5.3 Signature verification

Every webhook request is verified with `STRIPE_WEBHOOK_SECRET` using
`stripe.webhooks.constructEvent(payload, signature, secret)`. If
verification fails, return 400.

### 5.4 Service-role Supabase client

The webhook writes via the service-role client (RLS bypass). The
client is initialised lazily and never exposed beyond the webhook
handler:

```ts
const sb = getSupabaseAdminClient();  // already in lib/supabase.ts
if (!sb) return Response.json({ error: 'not configured' }, { status: 500 });
```

---

## 6. Checkout flow (UI changes)

### 6.1 Pricing-page button behaviour

Today the buttons link to `/auth/signup?plan=<slug>`. After Stripe:

1. Anonymous user clicks "Create account" on a tier card.
2. They land on `/auth/signup?plan=<slug>`. Signup runs as normal.
3. After successful signup (post-callback), they are redirected to
   `/checkout/start?plan=<slug>` (a tiny client page).
4. `/checkout/start` POSTs to `/api/checkout` with the plan, gets a
   session URL, and `window.location.href`s to Stripe Checkout.
5. Stripe collects payment.
6. Stripe redirects to `/checkout/success?session_id=…` (or
   `/checkout/cancel`).
7. The webhook fires in parallel and writes the purchase to
   Supabase. `/checkout/success` polls `/api/me/billing` for ≤5s to
   confirm the purchase row landed, then shows confirmation.

### 6.2 Authenticated user clicking pricing

If the user is *already* signed in and clicks a pricing tier button:
- Skip the signup detour. The button POSTs straight to
  `/api/checkout` and redirects to Stripe.

### 6.3 Returning user managing billing

A new "Billing" link in `/account/billing`:
- Server-renders their current entitlements (purchases +
  subscriptions).
- "Manage billing" button POSTs to `/api/portal` and redirects to
  the Stripe Customer Portal.

---

## 7. Tax, refunds, currency, international

Decisions we make once and document so future contributors do not
relitigate.

| Topic | Decision |
|---|---|
| **Currency** | USD only at launch. Phase 2 considers GBP / EUR for institutional buyers. |
| **Tax** | Enable Stripe Tax. It auto-calculates US sales tax and EU/UK VAT for digital products at checkout. Add Mpingo Systems LLC as the tax entity. |
| **Refunds** | 14-day no-questions-asked on Module + All-Access. Subscriptions cancel at period end (no proration refund). Refund policy lives on `/legal/refunds`. |
| **International** | Stripe accepts global cards by default; Stripe Tax handles the EU/UK VAT compliance. No active marketing outside US/UK at launch. |
| **Failed payments on subscriptions** | Stripe's smart dunning runs by default: 3 retries over 7 days, then subscription cancels. Webhook flips `status` accordingly. |
| **Disputes / chargebacks** | Stripe handles dispute portal. We add no custom logic in Phase 1. |
| **Receipts** | Stripe sends receipts automatically. No custom email logic needed. |
| **Cancellation flow** | Customer Portal is the only path. We do not build a custom cancel UI. |
| **Plan upgrade Module → All-Access** | Not supported in Phase 1. Buyer purchases All-Access separately; we manually refund the original Module purchase via Stripe dashboard. Phase 2 considers in-app upgrade. |

---

## 8. Pre-build decisions to confirm

These are the questions that, answered wrong, cost us a refactor.
Confirm before code starts.

### 8.1 Stripe account ready?

**Decision needed:** Does Eddy have a live Stripe account for Mpingo
Systems LLC, with bank account verified for payouts?

- If yes: proceed.
- If no: 1–3 business days to set up. Builds in parallel; use
  test-mode keys (`sk_test_…`) during dev, swap to live at deploy.

### 8.2 Phase 1 = record only, no gating?

**Recommended:** Yes. Stripe records purchases; modules stay open.
Gate in Phase 2 after ~50 paying users.

**Counter-argument:** Free access cannibalises potential revenue.

**Resolution:** Recommended approach holds. Brief 001 launching in
the same quarter will be the funnel; module access is what All-
Access is for; the rank ladder differentiates paying from free
behaviour anyway (paid badges weight more). If revenue leakage
becomes measurable, flip the env flag.

### 8.3 One-time vs. subscription on Module/All-Access?

**Recommended:** one-time `payment` mode for both. The pricing copy
says "one-time" — sticking to it.

**Counter:** Subscription would yield more predictable revenue.

**Resolution:** One-time at launch. Lifetime access is a brand
promise we should not weaken. If we decide to monetise updates
separately, Phase 2 considers a "+ updates" add-on.

### 8.4 Team and MBA cadence in Stripe

**Recommended:** Team = annual subscription ($9,999/year, auto-
renew on). MBA = biannual subscription ($14,999/6 mo, **auto-renew
off** by default). MBA programs operate semester-by-semester, so
auto-renew should be opt-in.

**Counter:** Auto-renew makes ARR projections easier.

**Resolution:** MBA stays opt-in renew. The deal cycle is human
anyway — a renewal is a sales conversation, not an automatic
billing event.

### 8.5 Customer Portal scope

**Recommended:** Enable update-payment-method, view-invoice, cancel-
subscription. Disable upgrade/downgrade plan switching (not needed
in Phase 1; complicates entitlement math).

### 8.6 Test-mode coverage

**Recommended:** Every webhook event we handle must have a Stripe
CLI playbook to replay it (`stripe trigger checkout.session.completed`
etc.). Document in `docs/STRIPE-TESTING.md` as part of this sprint.

### 8.7 Auth signup → checkout redirect

**Recommended:** After signup with `?plan=…`, redirect to
`/checkout/start?plan=…` rather than directly to Stripe Checkout. The
intermediate page handles the API call, error states, and the
"redirecting to Stripe…" copy.

---

## 9. Implementation checklist

Once §8 decisions are confirmed:

### 9.1 Stripe dashboard (do this first)
- [ ] Activate Mpingo Systems LLC account; verify bank.
- [ ] Enable Stripe Tax; configure tax entity.
- [ ] Create 11 Products and Prices per §3.1.
- [ ] Create webhook endpoint pointing to
  `https://atelier.realitydb.dev/api/webhook/stripe`.
- [ ] Save secrets to `.env.local` and Vercel project env.

### 9.2 Database
- [ ] New migration: `supabase/migrations/20260518_stripe_billing.sql`
  with the three additions in §4.4 and §4.5.
- [ ] Run in Supabase SQL editor; verify RLS policies.

### 9.3 Library
- [ ] `lib/stripe.ts` — server client + helpers.
- [ ] `lib/entitlements.ts` — `canAccess(userId, module)` (not yet
  used; Phase 2 wires the gate).
- [ ] Extend `lib/supabase.ts` if needed; `getSupabaseAdminClient`
  already exists.

### 9.4 Routes
- [ ] `app/api/checkout/route.ts`
- [ ] `app/api/webhook/stripe/route.ts` (signature verify,
  idempotent upserts)
- [ ] `app/api/portal/route.ts`
- [ ] `app/checkout/start/page.tsx`
- [ ] `app/checkout/success/page.tsx`
- [ ] `app/checkout/cancel/page.tsx`
- [ ] `app/account/billing/page.tsx`

### 9.5 UI wires
- [ ] Pricing-page buttons POST to `/api/checkout` when signed in;
  detour through `/auth/signup` when anonymous.
- [ ] Add `/account/billing` to `NAV_BY_ROLE` (under "Account")
  once it ships.

### 9.6 Testing
- [ ] Stripe CLI playbook in `docs/STRIPE-TESTING.md`.
- [ ] Test-mode end-to-end: anonymous → signup → checkout →
  success → confirm row in `purchases`.
- [ ] Webhook idempotency test: replay the same
  `checkout.session.completed` 3× → only one row in `purchases`.
- [ ] Subscription lifecycle: create → update period → cancel →
  reactivate.

### 9.7 Documentation
- [ ] `docs/STRIPE-TESTING.md` — CLI playbook.
- [ ] `docs/legal/refunds.md` — refund policy (Mpingo Systems,
  Charlotte NC, 14-day window).
- [ ] Update `CLAUDE.md` env-vars section.

---

## 10. Risks and unknowns

1. **Webhook delivery in serverless cold-starts.** Vercel's
   serverless functions can cold-start in ~1–2s. Stripe times out at
   30s; this is fine. Mitigation: keep the webhook handler small,
   no heavy synchronous work.
2. **Stripe Tax accuracy.** Auto-calc is excellent for digital
   products in the US/EU/UK. Less reliable for edge jurisdictions.
   Mitigation: monitor first 30 days of remittance; correct any
   missed jurisdictions in Stripe Tax settings.
3. **Refund chargebacks.** A customer who refunds within 14 days but
   has already received the signed certificate. Decision: certificate
   stays issued (we do not retract credentials). Risk is low because
   the cert is a proof of work, not a proof of payment.
4. **Subscription seats vs. quantity.** The Team tier is "10 seats"
   but Stripe's `quantity` field is set to 1 (the seats are a
   metadata constraint, not a per-seat Stripe price). If a customer
   wants 20 seats, we sell them two Team subscriptions or move them
   to Enterprise. Phase 2 considers true per-seat pricing.
5. **MBA semester boundaries.** Some MBA programs run on quarter
   systems (~10 weeks), some on semesters (~16 weeks). Our 6-month
   Stripe cadence covers both, but the marketing copy says
   "semester." Mitigation: the description on the MBA tier says "per
   semester" but the Stripe billing period is 6 months — clarify on
   the pricing page footer.

---

## 11. What happens after Phase 1 ships

The day Stripe is live:

1. The first paying customer creates `purchases` and
   `subscriptions` rows we can verify.
2. The pricing page is no longer a hypothetical — every CTA leads
   to actual checkout.
3. Marketing emails (Brief 001 → All-Access upsell) start carrying
   real conversion intent.
4. We can post a "Now self-serve" announcement on LinkedIn /
   Hacker News etc.

The day Phase 2 ships (whenever we decide):

1. `ENABLE_PAYWALL=true` in production.
2. Free preview policy: anyone can hit the first 3 exercises of
   each module without paying. After that, redirect to `/pricing`.
3. Briefs stay free forever, per data-split contract.

---

*Mpingo Systems LLC · Charlotte, NC · The business school that runs on
live data.*
