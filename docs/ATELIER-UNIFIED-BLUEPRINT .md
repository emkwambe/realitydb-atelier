# Atelier — Unified Blueprint
**Version:** 1.1 · 2026-05-23
**Owner:** Eddy Mkwambe · Mpingo Systems LLC · Charlotte, NC
**Status:** Canonical. This document governs all build decisions until superseded.

> This is the single sequenced plan for everything Atelier builds, in the
> order it builds it, with the reasoning behind every sequencing decision.
> Claude Code reads this alongside ATELIER-SOURCE-OF-TRUTH.md before
> any sprint begins. The SOT governs what; this document governs when and why.

---

## The north star

Atelier is a professional intelligence platform that develops business
acumen through live data. The credential proves judgment, not completion.

**The business school that runs on live data.**

Every build decision in this document either moves a learner closer to
that credential or moves a paying customer closer to that learner.
Nothing else is on the roadmap.

---

## Locked product decisions (append-only, never reopen)

These decisions are closed. They were debated, resolved, and locked.
Claude Code reads these before any sprint that touches the relevant
surface. No sprint may contradict a locked decision without a formal
SOT update and a version bump on this document.

---

### Decision 1 — Reference answer reveal timing (locked 2026-05-23)

**The rule:** Reference SQL and reference briefing are revealed only
after a briefing submission has been graded. Never before.

**Rationale:** The moment a learner sees the reference SQL before
submitting, the score stops measuring their judgment and starts
measuring their ability to read and paraphrase. The reveal is the
reward for completing the work, not a scaffold during it.

**Implementation:**
- The "Show reference answer" button in the exercise workbench must
  be hidden until the learner has a graded submission for that Hot
  Case or module.
- After grading: show reference SQL + reference briefing side by side
  with the learner's own submission so they can compare.
- The Boardroom follows the same rule — director questions are not
  visible until after the learner has committed to their briefing.

**What is allowed before submission:**
- Hints (Socratic questions, not answers)
- The structural briefing scaffold (see Decision 3)
- Co-Pilot nudges (never SQL, never the answer — see Sprint 2 spec)

---

### Decision 2 — Atelier Rank model (locked 2026-05-23)

**The model:** Glicko-2 on briefing scores, Rating Deviation (RD)
decreases with submission volume.

**Why not score-only:** A learner who completes one Hot Case and scores
95 outranks a learner who completed 20 and averaged 82. That is not a
meaningful signal — one data point is not a pattern.

**Why not participation-only:** A learner who submits empty briefings
farms rank. The credential becomes meaningless.

**Why Glicko-2 × volume:**
- Rank (rating) moves based on briefing and module scores — quality signal
- RD decreases as submission volume increases — consistency signal
- High score + low RD (established) outranks high score + high RD
  (provisional) — rewards both quality and consistency
- A single exceptional submission cannot permanently inflate rank

**Provisional threshold:** RD < 80, reached after approximately
3 modules or 5 Hot Cases. Public profile shows "Provisional" badge
until established.

**What the public profile shows:**
- Atelier Rank number (the Glicko-2 rating)
- "Provisional" or "Established" status
- Per-dimension percentiles across 6 dimensions
- Number of Hot Cases completed (stickiness signal)
- Number of modules completed (depth signal)
- "Open to opportunities" toggle (double opt-in, Sprint 3)

**What the public profile never shows:**
- Individual briefing scores (private by default)
- Briefing text (private by default)
- Email or contact information without explicit opt-in

---

### Decision 3 — Briefing scaffold in the workbench (locked 2026-05-23)

**The rule:** A structural four-bullet scaffold appears in the
exercise workbench after the learner completes the last exercise.
It is content-neutral — it teaches briefing structure, not the answer.

**The scaffold copy (exact, do not modify without SOT update):**

```
Ready to write your briefing?

The CFO needs four things in the next 10 minutes:
1. What you found — the specific pattern in the data
2. The number that matters — quantified impact
3. What you recommend — a specific action with a timeline
4. What you cannot confirm yet — the limits of your analysis

You have the data. Now make the call.
```

**Rationale:** The transition from "I ran the queries" to "I know
what to write" is where learners drop off. The scaffold reduces
friction at that exact moment without giving away the pattern,
the numbers, or the recommendation. It mirrors the Pyramid Principle
structure from Scaffolding Module S5.

**What the scaffold never does:**
- Hint at the specific pattern (never mentions cohorts, churn, etc.)
- Reveal any numbers from the dataset
- Tell the learner what the grader is looking for by name
- Appear before the last exercise is completed

**Trigger condition:** The scaffold appears when
`exercisesCompleted === totalExercises` for that Hot Case or module.
It appears in the right panel of the workbench as a transition state
before the learner clicks "Write your briefing →".

---

### Decision 4 — Grader calibration standard (locked 2026-05-23)

**The standard:** The grader must produce differentiated scores
between a threshold answer and an ideal answer. The acceptable range:

| Answer quality | Expected score range |
|---|---|
| Generic (named pattern, no numbers, vague recommendation) | 55–72 |
| Competent (named pattern, some numbers, specific recommendation) | 73–84 |
| Ideal (named pattern, derived numbers, 3 actions with timelines, epistemic honesty) | 88–97 |

**Calibration test:** Before each Hot Case ships, submit both a
generic answer and an ideal answer. If both score within 5 points
of each other, the grading prompt is not differentiating — fix it
before publishing.

**The grading prompt must include:**
- Scoring bands per axis (not just pass/fail descriptions)
- Reference data injected (actual numbers from the dataset)
- Explicit differentiation between threshold and excellent answers
- Epistemic honesty weighted — the fourth bullet ("what I cannot
  confirm yet") earns full marks on recommendation specificity

**Current status:** Grader for cohort-collapse requires calibration
fix — both generic and ideal answers scored 73/100 in testing.
This is a Claude Code task before June 16.

---

## The constraint that governs all sequencing

**Build the audience before building the catalog.**

Six production modules exist at 97–99/100 quality. That is more than
enough to launch, generate revenue, and build the learner base that
tells us which domain to build next. The modules that do not yet exist
are not missing because Atelier is incomplete. They are missing because
Atelier has not found the 500 learners whose Rank data will tell us
precisely which business acumen dimension is most underserved.

New modules are built into evidence. Not into a vacuum.

---

## Phase 0 — Foundation (now → June 14, 2026)

**The only goal of this phase:** make revenue possible and the launch real.

No new modules. No new features. No new domains.
Everything in Phase 0 is infrastructure and distribution.

---

### Sprint 0 — Stripe wiring (DONE — commit 579ae4a)

**What shipped:**
- `lib/billing/plans.ts` — canonical 10-plan pricing table
- `lib/stripe.ts` — server client, checkout, portal
- `lib/entitlements.ts` — canAccess() Phase 1 stub (always true)
- `/api/checkout`, `/api/webhook/stripe`, `/api/portal`, `/api/me/billing`
- `/checkout/start`, `/checkout/success`, `/checkout/cancel`
- `/account/billing` — Stripe Customer Portal link
- Pricing page — full 3-segment replacement
- Landing page — copy updated, business acumen framing added
- `/hot-cases/` placeholder route, `/briefs/` redirects to it
- `supabase/migrations/20260520_stripe_billing.sql` — purchases,
  subscriptions, RLS policies

**What Eddy must complete before Phase 0 closes:**
- [ ] Create 5 Stripe products, 10 prices in dashboard
- [ ] Paste price IDs into `.env.local` and Vercel project settings
- [ ] Create webhook endpoint at atelier.realitydb.dev/api/webhook/stripe
- [ ] Copy `whsec_...` into `STRIPE_WEBHOOK_SECRET`
- [ ] Enable Stripe Tax
- [ ] Run migration (done — confirmed success)
- [ ] Test: anonymous → signup → checkout → success → purchases row
- [ ] Test: stripe trigger checkout.session.completed × 3 → 1 row (idempotency)
- [ ] Deploy to atelier.realitydb.dev via Cloudflare Pages

---

### Sprint 0B — Hot Cases pipeline (Week 1 before June 14)

**What to build:**
- `/hot-cases/[slug]` route with full page template
- `/hot-cases/[slug]/exercise` — 1–2 exercises per case
- `/hot-cases/[slug]/briefing` — 3-axis graded briefing (pattern
  detection, quantification, recommendation specificity)
- `/hot-cases/[slug]/results` — graded result + profile badge
- `hot_cases` table in Supabase (slug, title, pattern_id,
  published_at, pack_hash, dataset_hash, engine_version, status)
- `hot_case_submissions` table (id, user_id nullable, email,
  hot_case_slug, score, axes jsonb, briefing_text,
  boardroom_transcript jsonb null, created_at)
- Email capture at briefing submission (anonymous-first pattern)
- Monday 8am ET publish pipeline (manual for first 12 weeks)
- `content/hot-cases/001-cohort-collapse/` — first Hot Case content

**Hot Case 001 — The Cohort Collapse:**
A B2B SaaS reports 6% MRR growth. The CFO writes back: pull the
cohort numbers first. Something feels soft. The teachable insight:
total MRR growth without cohort decomposition is a lie of omission.
Primary dimension: Financial Intelligence.
Secondary dimension: Decision Intelligence.

**Three reserve cases must exist before 001 publishes:**
- `content/hot-cases-reserves/reserve-001/` through `reserve-003/`
- Never published until needed
- Buffer maintained at 3 reserves at all times thereafter

**Naming rules (enforce everywhere):**
- Routes: `/hot-cases/` not `/briefs/`
- Tables: `hot_cases`, `hot_case_submissions` not `briefs`
- Files: `hot-case-pack.json` not `brief-pack.json`
- Copy: "Hot Case" / "Hot Cases" never "Brief" / "Weekly Brief"

---

### Sprint 0C — Pre-launch audience (Week 2–3 before June 14)

**This is not a code sprint. This is a distribution sprint.**

- Email list target: 200 hand-curated subscribers before June 14
- Source: existing network, LinkedIn outreach, Charlotte fintech/
  healthcare community, ECPI University connections
- Email provider: Resend (already in stack) — wire to Hot Cases
  submission capture and manual signup form
- LinkedIn posts: 2 per week in the 3 weeks before launch
  - Post 1: "The data engine that grades judgment, not completion"
  - Post 2: "What TD Bank's $3.1B penalty teaches analysts"
  - Post 3: Hot Case 001 preview — "The Cohort Collapse"
- HackerNews Show HN post — drafted and ready for launch Monday

**200 subscribers is not a marketing target.**
It is an engineering prerequisite. Hot Case 001 sends to nobody
without it. The entire Bet 1 → Bet 2 → Bet 6 chain stalls.

---

### Launch — June 14, 2026

**Launch sequence (Monday):**
- 8am ET: Hot Case 001 publishes at atelier.realitydb.dev/hot-cases/001
- 8am ET: Email blast to full subscriber list
- 8am ET: LinkedIn post — "Hot Case 001 is live. Free. 30 minutes."
- 9am ET: HackerNews Show HN post
- Module access: MedCore ($39/mo) and ClearBank ($39/mo) available
  via Stripe self-checkout
- All-Access ($179/mo) available via Stripe self-checkout

**Launch success criteria:**
- 200+ subscribers receive the email
- 50 module purchases in first 30 days
- Zero Stripe errors in first 48 hours
- Hot Case 001 graded briefings start appearing in Supabase

---

## Phase 1 — Engagement (June 14 → September 2026)

**The goal of this phase:** make the credential mean something and
stop module drop-off before it kills the funnel.

Sequencing principle: Boardroom before Rank. Boardroom makes Hot
Cases ungameable before Rank exists. Without Boardroom live before
Rank, the leaderboard is gameable from day one.

---

### Sprint 1 — The Boardroom (Weeks 2–3 post-launch)

**What it is:**
After the CEO briefing is graded, the learner clicks
"Take it to the board." Three adversarial AI personas read
the briefing and the SQL trail. Three questions each, 90 seconds
per response. A new rubric axis — boardroom defense — appended
to the profile.

**Why Boardroom before Rank:**
Rank is only a trustworthy signal if the briefings feeding it are
hard to game. Boardroom makes LLM-ghostwritten briefings collapse
under live director Q&A. Without Boardroom live before Rank, the
leaderboard is meaningless from day one.

**What to build:**
- `/api/grade-boardroom` endpoint
- Three AI personas: CFO (financial projection skeptic),
  general counsel (disclosure obligations), independent director
  (causal inference challenger)
- Pre-render 3 opening questions on briefing submit — kills latency
- Boardroom UI in workbench — opens after briefing graded
- `boardroom_transcript` stored in `hot_case_submissions`
  and `briefing_submissions`
- Module tier: 1 Boardroom simulation/week
- All-Access: unlimited simulations, full persona library

**Boardroom on Hot Cases:**
From Week 3 onward, Hot Case briefings require a Boardroom round
before counting toward Atelier Rank. One-week grace period for UX.

**Success criteria:**
- ≥80% of graded briefings include a Boardroom transcript by week 8
- LLM-ghostwriting detection rate audited

---

### Sprint 2 — Co-Pilot "Stuck?" (Week 4 post-launch)

**What it is:**
A side panel in the exercise workbench. A "Stuck?" button calls
Claude with the current schema + exercise context. Socratic
questions only — never writes or hints at SQL. Nudge-use logged
to briefing metadata so grader can see over-reliance.

**Why Co-Pilot before Rank:**
Drop-off is the silent killer of every EdTech business.
If module abandonment stays above 30%, every other bet sells
fewer seats. The button alone moves the needle.

**What to build:**
- Side panel component in exercise workbench
- "Stuck?" button → POST /api/copilot with schema + exercise context
- Claude prompt: Socratic questions only. Never SQL. Never the answer.
- Module tier: 3 nudges per exercise
- All-Access: unlimited nudges, proactive idle-detection after 2 min
- Nudge log: stored per briefing submission as metadata

**Constraint — never violate:**
The Co-Pilot is allowed to ask questions, name a table, reference
a column. It is never allowed to write SQL or hint at the answer.
This constraint is in the system prompt and enforced in code.

---

### Sprint 3 — Atelier Rank (Weeks 5–6 post-launch)

**What it is:**
Every learner has a single public number — an Atelier Rank — that
moves up or down with each module and Hot Case they solve.
The number, combined with per-dimension percentiles, becomes
a career signal recruiters can read in three seconds.

**Rating system: Glicko-2 with three customizations:**
1. Rating Deviation decay: new learners start RD=200, "established"
   after 3 modules (RD < 80). Public profile shows "Provisional"
   until then.
2. Module difficulty weighting: OncoCare and ClearBank carry higher
   K-factor than NovaPay. Recalibrated quarterly.
3. Epistemic honesty weighted 2×: the single most important
   anti-gaming feature. A learner who fabricates confidence loses
   more on epistemic honesty than they gain on recommendation
   specificity.

**What to build:**
- Glicko-2 engine — calculate on every briefing submission
- `/profile/<handle>` — public learner profile
- `/account/profile` — handle, public/private toggle,
  "Open to opportunities" double opt-in
- `/account/rank` — rank history chart, audit log
- New Supabase table: `rank_audit_log`
- New columns on `profiles`: `atelier_rank`, `rank_deviation`,
  `rank_established`, `handle`, `profile_public`,
  `open_to_opportunities`
- Hot Case score: separate for first 90 days, integrate at
  reduced K-factor after Day 90 decision point

**Anti-cheat architecture:**
- Primary defense: Boardroom (ships Weeks 2–3 — before Rank)
- Secondary: LLM-output detection, flags for review not auto-reject
- Account-age gating: ≥7 days before submissions count toward rank
- Submission rate-limit: ≤3 briefing submissions per learner per 24h

**Success criteria:**
- ≥500 public profiles within 90 days of launch
- ≥20 learners enable "Open to opportunities"
- ≥1 inbound deal closed where buyer saw a candidate profile first

---

### Sprint 4 — Scaffolding Layer (Weeks 7–10 post-launch)

**What it is:**
Short conceptual content (10–20 minutes each) that grounds the
learner in business acumen before they touch the workbench.
Never gated. Never graded. Never produces a credential.
Available free at account level across all tiers.

**Build order (by impact on briefing quality):**

S2 — Finance & Metrics (first)
  Profit/loss, balance sheet, cash flow. KPIs, breakeven, ROI,
  IRR. Annotated statement templates. KPI reference table by
  vertical. Directly unblocks MedCore and ClearBank comprehension.

S1 — Foundations of Business (second)
  How companies work, value chains, business models (B2B, SaaS,
  subscription, marketplace, healthcare, banking). Interactive
  value chain diagram. Business model canvas.

S5 — Communication & Influence (third)
  The Pyramid Principle, SCQA structure, answer-first discipline,
  stakeholder mapping. Annotated CEO briefing example.
  Directly improves every briefing regardless of vertical.

S4 — Decision-Making Skills (fourth — ships with Boardroom)
  Risk analysis, opportunity cost, trade-offs, pre-mortem,
  confirmation bias. Interactive non-replayable decision scenario.
  Cognitive bias reference card. Prepares learner for Boardroom.

S3 — Strategy & Markets (fifth)
  Porter's Five Forces, competitive advantage, SWOT, PESTEL.
  Interactive Five Forces mapper. PESTEL reference card by vertical.
  More impactful after learner has completed at least one module.

S6 — Entrepreneur's Toolkit (sixth — lowest priority)
  Lean startup, MVP builder, fundraising basics, valuation tools.
  Cap table calculator. Serves Founder persona specifically.

**Note:** Augmented Intelligence (Dimension 6) has no scaffolding
module. It is expressed through the product itself — Co-Pilot and
Boardroom — not through prereading.

---

## Phase 2 — Scale (September 2026 → January 2027)

**The goal of this phase:** convert the learner base into institutional
buyers and build the first compounding marketing event.

Entry condition: ≥500 ranked learners, ≥50 module purchases.

---

### Sprint 5 — Disaster Library: Wirecard (Week 1 of Phase 2)

**What it is:**
The first module in the Disaster Library track — separate from the
company modules. Based entirely on the public record of a real
corporate failure. A synthetic dataset that mirrors the structural
failure pattern. A CEO briefing prompt anchored to the pre-collapse
moment — the learner must catch the crisis before it hits.

**Why Wirecard first:**
The structural pattern (fake third-party acquirers, balance-sheet
escrow ghosts that never reconciled) is perfectly data-shaped.
The public record is exhaustive — SEC filings, court documents,
FT reporting, parliamentary inquiries. No legal ambiguity.
The lesson generalizes to any company using escrow accounting.

**What to build:**
- Content: `content/disaster-library/wirecard/`
- Primary-source dossier (public filings + journalistic record)
- Synthetic dataset mirroring the escrow ghost pattern
- CEO briefing prompt: "You are the lead auditor. The escrow
  accounts are showing €1.9B. You have 48 hours before the
  audit committee meets. What do you find and what do you do?"
- 5-axis rubric with epistemic honesty weighted 2×
- Publication: atelier.realitydb.dev/disaster-library/wirecard

**Legal guardrail:**
Disaster Library uses only structural patterns from the public
record. Never reconstructs individual victim data. Every module
ships with a primary-source bibliography. Named "inspired by
Wirecard" not "Wirecard simulation."

**Success criteria:**
- ≥1 AACSB or compliance-curriculum committee adoption
- ≥1 trade press writeup citing the Wirecard module

---

### Sprint 6 — Corporate cohort dashboard (Week 3–4 of Phase 2)

**What it is:**
The infrastructure that makes the Team tier ($9,999/year) real.
A corporate admin can invite 10 seat holders, set a deadline,
and see cohort progress in a dashboard. A cohort report generates
at end of term.

**Why now:**
50 individual purchases proves the product. The next revenue
unlock is the $9,999 Team cohort — one sale equals 256 individual
monthly subscriptions. This is the single highest-leverage revenue
sprint in Phase 2.

**What to build:**
- `organizations` table (id, name, type, tier, stripe_subscription_id,
  seat_count, seat_limit, campus_count, campus_limit)
- `organization_members` table (org_id, user_id, role, invited_at,
  joined_at)
- `/admin/cohort` — create cohort, invite members, set deadline
- `/admin/cohort/[id]` — progress dashboard (exercises completed,
  briefings submitted, scores by learner)
- `/admin/cohort/[id]/report` — end-of-term PDF report
- Seat enforcement: hard cap at 10, overflow triggers upgrade prompt
- Email invitations via Resend

---

### Sprint 7 — Atelier Open infrastructure (Weeks 5–8 of Phase 2)

**What it is:**
Build the tournament infrastructure. Do NOT run the first Open yet.
The first Open runs only when N≥500 ranked learners exist.

**Why build before running:**
The infrastructure takes 4 weeks. The audience condition (N≥500
ranked learners) may not be met until Q4 2026. Building now means
the first Open can launch within days of hitting the threshold —
not 4 weeks after.

**What to build:**
- `/open` landing page with tournament format explanation
- `tournaments` table (id, name, slug, status, opens_at, closes_at,
  hot_case_slug, prize_pool_cents, sponsor_name)
- `tournament_submissions` table (id, tournament_id, user_id,
  briefing_submission_id, boardroom_required, rank_at_submission)
- Public leaderboard at `/open/[slug]/leaderboard`
- Submission pipeline: Hot Case format + mandatory Boardroom round
- Anti-cheat: Boardroom is the primary anti-gaming defense
- Prize disbursement: manual via Stripe for first tournament

**First Open conditions (all must be true before launch):**
- N≥500 ranked learners with at least 3 modules completed
- ≥1 named sponsor confirmed
- Boardroom mandatory on all Open submissions
- Reserve case buffer at 5 (tournament case + 4 extras)

---

### Sprint 8 — Temporal extensions: Cohort degradation (Phase 2)

**What it is:**
The first temporal extension — extending NovaPay's date range
to span three acquisition cohort windows rather than one.
No new tables. No CLI changes. A data authoring decision that
dramatically increases the pedagogical depth of Exercise 6
(NRR by cohort).

**The three cohort windows:**
- 2023 cohort: 94% retention at 24 months (healthy baseline)
- 2024 cohort: 82% retention at 12 months (early degradation)
- 2025 cohort: 3.2% monthly churn in first 90 days (crisis)

**What this teaches:**
Top-line MRR growth can mask bottom-line cohort deterioration.
A learner who queries blended MRR sees a growing company. A learner
who runs a cohort analysis sees a company acquiring customers it
cannot retain. This is the most important lesson in SaaS economics
and it is invisible in a single-period dataset.

**Pack extension field:**
```jsonc
"temporal_extension": {
  "extends": "novapay-2024",
  "period": "2023-01 to 2025-12",
  "cohort_windows": [
    { "cohort": "2023", "retention_24mo_pct": [92, 96] },
    { "cohort": "2024", "retention_12mo_pct": [80, 85] },
    { "cohort": "2025", "churn_90day_pct":    [2.8, 3.6] }
  ]
}
```

**Build this in SupplyLink too (operational lag):**
SupplyLink's COGS up 11 points and on-time delivery down 12 points
is a perfect operational lag story. The supplier failure happened
two quarters before the financial impact appeared. Encoding this
across a 6-quarter window makes SupplyLink the strongest
operational intelligence module in the catalog.

---

## Phase 3 — Ecosystem (January 2027 → June 2027)

**The goal of this phase:** publish the first Atelier Index,
open the marketplace, and begin Segment 4 conversations.

Entry condition: N≥500 graded briefings, ≥3 corporate case studies.

---

### Sprint 9 — Atelier Index 1.0 (January 2027)

**What it is:**
The first published business acumen benchmark dataset in the world.
An annual report on how professionals reason about business crises —
by dimension, by industry, by tenure, by program.

**Why this is not just a report:**
It is the moment Atelier becomes citable. Every press cycle that
needs a stat about "business acumen gaps" cites our number.
Every enterprise sales call has a benchmark to point to.
Every Segment 4 buyer (bank, hospital system, consulting firm)
can see where their analysts rank against the distribution.

**What to build:**
- Analytics pipeline: aggregate graded briefings by dimension,
  industry vertical, acquisition cohort, program type
- Static report with 5 key charts (no interactive cuts in 1.0)
- Methodology section: sample description, scoring rubric,
  limitations, bias disclosure
- Public landing page at atelier.realitydb.dev/index
- Downloadable PDF
- Press kit: 3 headline stats, 2 charts cleared for reproduction

**Minimum viable conditions:**
- N≥500 graded briefings
- ≥3 industry verticals represented
- ≥2 segment types represented (Individual + Corporate or Academic)
- Methodology reviewed by at least 1 external subject matter expert

**Success criteria:**
- ≥10 inbound media inquiries within 30 days
- ≥1 citation in trade press (Bersin, Modern CFO, SHRM, etc.)

---

### Sprint 10 — Bring Your Own Crisis: manual delivery (Q1 2027)

**What it is:**
Enterprise buyers describe their own operational crisis (sanitized).
Eddy hand-crafts a pack from the intake. A private module visible
only to that customer's cohort ships within 21 days.
Price: $25,000–$50,000 per custom module.

**Why manual-only first:**
This is professional services dressed as a product. Do not
productize it until 3 clients have paid for the manual version.
The first 3 deals prove demand and fund the productization sprint.

**What to build (Phase 3):**
- Guided intake form at /enterprise/bring-your-own-crisis
- Private cohort visibility: module appears only for specified
  organization members
- 21-day delivery SLA from signed intake to live module
- Manual pack authoring: Eddy writes, CLI generates, enforcer runs,
  assessor scores ≥95/100 before delivery

**Productization (Phase 4 — not yet):**
A pack-builder UI letting the customer sketch their schema visually.
Auto-generates the pack. Ships within 48 hours.
Only builds this when 3 manual clients have completed delivery.

---

### Sprint 11 — Domain 7: Real Estate / PropTech (Q1 2027)

**Why Real Estate first among new domains:**
Universal context — no domain primer needed. Every learner has
rented, bought, or worked near property. Closes the gap for
non-FinTech/healthcare learners. Richest temporal extension
potential of all new domains.

**The hidden crisis:**
Maintenance cost concentration. One property class (pre-2010
commercial conversions) has maintenance costs 3.1× the portfolio
average — 18% of units, 41% of maintenance spend. Combined with
tenant churn running 2.4× the portfolio average in that class,
the P&L impact over 18 months is existential.

**Tables:** `properties`, `units`, `leases`, `tenants`,
`maintenance_requests`, `maintenance_costs`, `payment_history`,
`market_comparables`, `inspections`, `occupancy_by_period`

**Primary dimensions:** Operational Intelligence + Financial Intelligence
**Segments served:** Individual, Corporate (property management L&D),
Academic (real estate finance courses)

---

### Sprint 12 — Domain 8: Retail / E-commerce (Q1–Q2 2027)

**The hidden crisis:**
Channel mix deterioration. Paid social CAC is now $87.
LTV of paid social customers over 24 months is $94.
That 1.08:1 LTV:CAC ratio is catastrophically below the 3:1
benchmark — only visible when you break CAC and LTV by acquisition
channel and cohort vintage simultaneously.

**Tables:** `customers`, `orders`, `order_items`, `products`,
`inventory`, `returns`, `marketing_spend`, `channel_attribution`,
`email_campaigns`, `customer_segments`, `reviews`, `fulfillment`

**Primary dimensions:** Financial Intelligence + Strategic Intelligence
**Segments served:** Individual (DTC founders, brand analysts),
Corporate, Academic (marketing courses)

---

## The domain roadmap beyond Phase 3

These domains are confirmed and sequenced. Build each one only when
the prior domain is live and generating learner data.

| Order | Domain | Hidden crisis | Primary dimension |
|---|---|---|---|
| 7 | Real Estate / PropTech | Maintenance cost concentration | Operational |
| 8 | Retail / E-commerce | Channel mix LTV:CAC collapse | Financial |
| 9 | Professional Services | Partner concentration + talent pipeline failure | Strategic |
| 10 | EdTech / Online Learning | Engagement cliff at lesson 4 | Decision |
| 11 | Energy / Utilities | Grid failure in maintenance data | Operational + Ethical |
| 12 | Human Capital / HR | Top-quartile attrition invisible in blended rate | Decision |

**Government / Public Sector** is deferred until commercial segments
are fully served. Requires a separate editorial and rubric framework.

---

## The temporal extension roadmap

Temporal extensions deepen existing modules without new authoring cost.
Build in this order:

| Order | Module | Extension type | Growth dynamic | When |
|---|---|---|---|---|
| 1 | NovaPay | Three-cohort window | Cohort degradation | Phase 2 Sprint 8 |
| 2 | SupplyLink | 6-quarter lag chain | Operational lag | Phase 2 Sprint 8 |
| 3 | MedCore | Leading indicator drift | Denial rate prediction | Phase 3 (after Index) |
| 4 | NovaPay | Resolution arc | Fix shipped Q3 2025 | Phase 3 |
| 5 | ClearBank | New crisis layer | Post-remediation AML pattern | Phase 4 |
| 6 | OncoCare | Regulatory response | FDA threshold crossed | Phase 4 |

**Build rule:** No temporal extension ships before Atelier Rank exists.
Temporal extensions require per-dimension scoring to be meaningful.
Without Rank, there is no way to measure whether the deeper lesson landed.

**Never build:** Bi-temporal schema (valid_from/valid_to on every table).
Too much cognitive overhead for PGlite learners. Temporal structure is
encoded in existing date columns, enforced by the pack enforcer,
invisible to the learner.

---

## The scaffolding layer build completion

Six scaffolding modules. Build after Sprint 0–3 are complete.
Never gate scaffolding. Never grade scaffolding. Never credential it.

| Order | Module | Dimension | Reading time | Build trigger |
|---|---|---|---|---|
| 1 | S2 — Finance & Metrics | Financial | 15–20 min | After Sprint 1 (Boardroom) |
| 2 | S1 — Foundations of Business | Financial + Operational | 12–15 min | After Sprint 2 (Co-Pilot) |
| 3 | S5 — Communication & Influence | Communication | 15–20 min | After Sprint 3 (Rank) |
| 4 | S4 — Decision-Making Skills | Decision | 20–25 min | Alongside Sprint 1 (Boardroom) |
| 5 | S3 — Strategy & Markets | Strategic | 15–20 min | After first module completed |
| 6 | S6 — Entrepreneur's Toolkit | Strategic + Financial | 15–20 min | Phase 3 |

---

## The pricing architecture (canonical — never change without SOT update)

**Segment 1 — Individual**
| Tier | Monthly | Annual | Annual savings |
|---|---|---|---|
| Module | $39/month | $390/year | $78 (2 months free) |
| All-Access | $179/month | $1,790/year | $358 (2 months free) |

Annual is default on pricing page. Module = one chosen module,
permanent access. Hot Cases are free forever across all tiers.

**Segment 2 — Corporate (annual only)**
| Tier | Price | Seats |
|---|---|---|
| Team | $9,999/year | 10 (hard cap) |
| Corporate Pro | $24,999/year | 50 (hard cap) |
| Enterprise | Custom | 51–500+ |

**Segment 3 — Academic (semester or annual)**
| Tier | Price | Students | Campuses |
|---|---|---|---|
| Program | $4,999/semester | 30 (hard cap) | 1 |
| Institution | $9,999/semester | 100 (hard cap) | 1 |
| University License | $14,999/semester | Unlimited | 1 |
| University System | Custom/annual | Unlimited | Unlimited |

**Segment 4 — Strategic Enterprise (future, no Stripe products yet)**
Banks, Healthcare Systems, Fortune 500, Consulting, Government.
$100K–$1M+. Activates after Atelier Index 1.0 is published.

---

## The four structural moats — every build amplifies at least one

1. **The data engine** — RealityDB generates enforced-narrative
   datasets at 97–99/100 quality with citation trails.
   Nobody else does this.

2. **The deliverable** — Claude-graded 5-axis CEO briefing including
   epistemic honesty axis. We grade judgment, not completion.

3. **Vertical depth** — six industries where mistakes cost millions
   or lives. Mistakes in four of those are measured in human lives.

4. **The credential** — signed, publicly verifiable, names the specific
   crisis solved. Not "completed 6 weeks of video."

**If a proposed build does not amplify at least one of these four,
the answer is no.**

---

## The six business acumen dimensions Atelier measures

Every module, Hot Case, and Boardroom round maps to one primary
and one secondary dimension. Atelier Rank reports performance
across all six.

| Dimension | Content anchor question |
|---|---|
| Financial Intelligence | "Does this finding change how money moves — and by how much?" |
| Strategic Intelligence | "Where is the organization winning, losing, or about to lose?" |
| Operational Intelligence | "Where in the system did this break?" |
| Decision Intelligence | "What would you need to believe for this recommendation to be wrong?" |
| Communication & Influence | "If the CEO read only the first two sentences and acted, would they make the right call?" |
| Augmented Intelligence | "If the AI tool you used were wrong, would you have caught it?" |

---

## What Atelier does not build — ever

1. Mobile-native app. It is a laptop activity.
2. Live video instructor cohorts. That is HBS Online.
3. General-purpose chatbot tutor. Co-Pilot is the only chatbot surface.
4. NFT / blockchain credential anchoring.
5. i18n before $1M ARR.
6. Second AI provider abstraction layer until Claude 5.
7. Reconstruction of victims' data in any module.
8. Paid placement of named companies without counsel-signed consent.
9. Atelier Open before N≥500 ranked learners.
10. Open-sourcing RealityDB engine before content moat is established.
11. Positioning Atelier as a SQL course, data course, or analytics platform.
12. "AI skills" as a standalone product category.
13. Per-month pricing for Corporate or Academic segments.
14. Individual billing for Corporate or Academic learners.
15. Multi-campus access below University System tier.
16. New modules before the existing six have 50 paying learners.
17. Bi-temporal schema visible to learners (valid_from/valid_to on every table).
18. Atelier Open with fewer than 500 ranked learners — a leaderboard
    of 40 people is not a marketing weapon.

---

## The strategic fork at end of Phase 2

After 12 weeks of execution, one of two things is true:

**If Hot Cases + Atelier Open are pulling traffic:**
Double down on Bet 8 — Pack Marketplace. Let the catalog grow without
catalog cost. Leverage inbound author interest from domain experts
(ex-Goldman compliance director, former FDA reviewer, OncoCare PI).

**If F500 / enterprise deals are landing:**
Double down on Bet 4 — Bring Your Own Crisis at scale.
Productize the highest-ARPU motion. Manual delivery first,
then pack-builder UI when 3 clients have completed manual delivery.

**If neither:**
Audit ruthlessly. The platform has been over-built relative to demand.
Return to distribution — more Hot Cases, more outreach, more AACSB
conversations — before adding any new features.

---

## The audience problem — the most important number in this document

**Target before June 14: 200 email subscribers.**

This is not a marketing target. It is an engineering prerequisite.
Every bet in this plan multiplies an existing audience:
- Hot Cases needs a list to send Monday morning
- The Boardroom needs someone to demo it
- The Atelier Open needs 500 ranked learners
- The Atelier Index needs 500 graded briefings

None of those exist without the first 200 subscribers.
The first 200 subscribers do not come from features.
They come from Eddy's network, LinkedIn outreach, and one
exceptionally good Hot Case published on launch Monday.

---

## How to use this document

**Before any sprint:** Confirm the sprint is in sequence.
If it is not in sequence, confirm the entry condition for the
next phase has been met. If it has not, return to distribution.

**Before any new domain:** Confirm the prior domain has
learner data showing which dimension is underserved.
If it does not, the new domain decision is intuition, not evidence.

**Before any temporal extension:** Confirm Atelier Rank exists
and is reporting per-dimension scores. Without per-dimension
scoring, there is no way to know whether the deeper lesson landed.

**Before any Segment 4 conversation:** Confirm the Atelier Index
1.0 has published. Without a published benchmark, there is nothing
to show a bank or hospital system that proves the construct is valid.

**When in doubt:** Re-read the constraint that governs all
sequencing: build the audience before building the catalog.

---

## Timeline summary

| Phase | Period | Goal | Entry condition |
|---|---|---|---|
| 0 — Foundation | Now → June 14 | Revenue possible, launch real | None |
| 1 — Engagement | June 14 → Sept 2026 | Credential means something, drop-off fixed | 200 subscribers |
| 2 — Scale | Sept → Jan 2027 | Institutional buyers, first tournament | 500 ranked learners, 50 purchases |
| 3 — Ecosystem | Jan → June 2027 | Index published, marketplace open, Segment 4 begins | 500 graded briefings, 3 case studies |
| 4 — Expansion | June 2027+ | Full domain catalog, BYOC productized, OSS engine | $1M ARR |

---

## CHANGELOG

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-20 | First unified blueprint. Consolidates all strategy sessions, pivot memos, plan adjustments, segment architecture, pricing, temporal extension research, domain sequencing, and scaffolding layer into one sequenced document. |
| 1.1 | 2026-05-23 | Added locked decisions section: Decision 1 (reference answer reveal timing), Decision 2 (Atelier Rank model — Glicko-2 × volume), Decision 3 (briefing scaffold in workbench — four-bullet structural scaffold), Decision 4 (grader calibration standard — score band differentiation required). Sprint 0 and Sprint 0B shipped and verified. Grader calibration fix added as pre-launch task. |

---

*Mpingo Systems LLC · Charlotte, NC*
*The business school that runs on live data.*
