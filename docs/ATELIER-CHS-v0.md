# Atelier — Comprehensive Handover Summary (CHS) v0
**Date:** June 15, 2026  
**Prepared by:** Claude Chat (this session)  
**For:** New Claude Chat session  
**Project:** Atelier by Mpingo Systems LLC  
**Launch date:** June 22, 2026 (pushed from June 16)

---

## 1. What Atelier is

Atelier is a **Decision Intelligence Measurement System** — not a learning platform.

The one-sentence definition:
> Atelier measures and develops business judgment through structured investigation of realistic company data.

The positioning that separates it from every competitor:
> "Atelier does not grade courses. It measures decision intelligence."

**What it is NOT:**
- Not a SQL course (SQL Learn is a separate product)
- Not a tutorial platform
- Not DataCamp with business cases
- Not a passive learning tool

**What it IS:**
- A psychometrically-informed assessment system
- A competency measurement platform for data acumen
- A synthetic enterprise environment for developing executive judgment
- The future: "The CFA for Decision Intelligence"

**The locked copy for what Atelier does not do:**
> "Atelier is not a SQL course. It assumes you can query. It teaches you what to look for. However, by continuously interacting with realistic schemas, relationships, operational data environments, and revealed solutions, users naturally strengthen, refine, and modernize their SQL thinking and practical query skills over time."

---

## 2. The product in its current state

### What is built and working (locally and on production)

**Core product:**
- Six synthetic company modules (NovaPay, MedCore, SupplyLink, TowerNet, ClearBank, OncoCare)
- Each module: 10 exercises + CEO Briefing + AI grading
- Hot Cases pipeline: free 30-minute exercises, no account required
- Hot Case 001: The Cohort Collapse (NovaPay, published)
- AI grader: Claude claude-sonnet-4-6, 3-axis rubric, calibrated (generic 59/100, ideal 94/100)
- Briefing scaffold: four-bullet structure trigger after last exercise
- Reference answer gating: shown only after graded submission

**Auth:**
- Password auth: working
- Magic link: working cross-browser (token_hash flow)
- Google OAuth: available
- Resend SMTP: live (noreply@realitydb.dev)

**Payments:**
- Stripe checkout: working locally and on production
- Payment confirmed page: working
- Webhook: 200 responses confirmed via CLI

**Admin:**
- Admin role: set for emkwambe1@gmail.com
- /admin/hot-cases: publish/unpublish Hot Cases
- /admin/waitlist: view subscribers, export CSV

**Legal:**
- /legal/privacy: live
- /legal/terms: live
- Contact: atelier@realitydb.dev
- Address: Raleigh, NC (registered agent address)

**Waitlist:**
- /waitlist: two-column landing page, live on production
- Email capture: working, stores to Supabase waitlist table
- 2 subscribers as of June 15

**Deployment:**
- Live at: https://atelier.realitydb.dev
- Platform: Vercel (connected to GitHub emkwambe/realitydb-atelier)
- Branch: master
- Database: Supabase (realitydb-atelier project)

---

## 3. The one unresolved issue — Stripe webhook

**Status:** BLOCKING — subscriptions table not writing on production

**Symptoms:**
- Payment confirmed page shows correctly ✅
- Stripe webhook returns 200 via CLI ✅
- Stripe Atelier Production webhook shows zero deliveries ❌
- Supabase subscriptions table remains empty after real checkout ❌

**What has been tried:**
- Created Atelier Production webhook on correct Stripe account
  (acct_1TLxaa6sezd2LSNW — Mpingo Systems)
- Updated STRIPE_WEBHOOK_SECRET in Vercel with production secret
  (whsec_mDbMrr9KaEB3F9ZG5f01qeFVsbXJtmGA)
- Redeployed without cache
- Confirmed CLI events return 200 to production endpoint
- Real checkout shows payment confirmed but no DB write

**Root cause hypothesis:**
The Stripe Atelier Production webhook is either:
1. Not sending events to the endpoint (zero deliveries in dashboard)
2. Sending events but signature verification failing despite correct secret
3. The webhook handler is writing but to the wrong Supabase project

**Next diagnostic steps:**
1. Check Vercel Logs → filter for /api/webhook/stripe → look for POST
   requests after a real checkout (not CLI trigger)
2. Check Stripe → Atelier Production → Recent Deliveries → see if
   any delivery attempts appear after checkout
3. Add console.log at the top of the webhook handler to confirm
   it is being reached
4. Check if Supabase project was paused again (it paused once already
   due to Free tier inactivity — upgrade to Pro immediately)

**Critical action:** Upgrade Supabase to Pro ($25/month) NOW to prevent
future pausing. Free tier pauses after 7 days of inactivity.

**Webhook route location:**
`app/api/webhook/stripe/route.ts`
Has: `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"`
These are correct.

**Environment variables in Vercel (all set):**
- NEXT_PUBLIC_SUPABASE_URL ✅
- NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
- SUPABASE_SERVICE_ROLE_KEY ✅
- ANTHROPIC_API_KEY ✅
- NEXT_PUBLIC_SITE_URL = https://atelier.realitydb.dev ✅
- STRIPE_SECRET_KEY ✅
- STRIPE_WEBHOOK_SECRET = whsec_mDbMrr9KaEB3F9ZG5f01qeFVsbXJtmGA ✅
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ✅
- All 10 STRIPE_PRICE_* variables ✅
- ENABLE_PAYWALL = false ✅

---

## 4. The product architecture

**Stack:**
- Next.js 16.2.6 (Turbopack)
- Supabase (PostgreSQL, Auth, RLS)
- TypeScript + Tailwind CSS
- Stripe (payments)
- Anthropic API (grading)
- Resend (email)
- PGlite (in-browser PostgreSQL for SQL workbench)
- Vercel (hosting)
- Cloudflare (DNS)

**Repo:** github.com/emkwambe/realitydb-atelier
**Branch:** master (production)
**Local path:** C:\Users\HP\Documents\atelier

**Key files:**
```
app/
  api/
    hot-cases/[slug]/submit/route.ts  → AI grader
    webhook/stripe/route.ts           → Stripe webhook handler
    checkout/route.ts                 → Checkout session creation
  hot-cases/                          → Hot Cases routes
  companies/                          → Module routes
  admin/                              → Admin routes
  waitlist/                           → Waitlist page
  legal/                              → Privacy + Terms
lib/
  stripe.ts                           → Stripe client
  supabase.ts                         → Supabase clients
  hooks/useAuth.ts                    → Auth hook
  billing/plans.ts                    → Stripe price IDs
content/
  hot-cases/
    CANON.md                          → Hot Case authoring rules
    cohort-collapse.json              → Hot Case 001 content
  companies/
    novapay/                          → NovaPay exercises
    [others]/                         → Other company content
docs/
  ATELIER-PRODUCT-PHILOSOPHY.md      → What Atelier is/is not
  ATELIER-CURRICULUM-FRAMEWORK.md    → Six dimensions defined
  ATELIER-UNIFIED-BLUEPRINT .md      → Full product blueprint
  plans/ATELIER-SOURCE-OF-TRUTH.md   → Source of truth
```

**Supabase tables:**
- profiles (id, role, stripe_customer_id)
- subscriptions (user_id, product, status, stripe_*)
- purchases (one-time payments)
- hot_cases (slug, status, published_at)
- hot_case_submissions (user_id, score, axes, briefing_text)
- waitlist (email, source, created_at)

---

## 5. The six dimensions (curriculum framework — locked)

These are the competencies Atelier measures. They are final.

1. **Financial Intelligence** — Reading financial signals in operational
   data before they appear in quarterly reports
2. **Operational Intelligence** — Finding efficiency/capacity/quality
   losses in process and log data
3. **Strategic Intelligence** — Identifying competitive dynamics from
   internal data patterns
4. **Decision Intelligence** — Translating analysis into defensible
   recommendations under uncertainty
5. **Communication Intelligence** — Making the right argument to the
   right audience with the same data
6. **Augmented Intelligence** — Using the database as a forward-looking
   instrument for pattern and anomaly detection

Each dimension has a full definition in:
`docs/ATELIER-CURRICULUM-FRAMEWORK.md`

---

## 6. The grader — current state and needed upgrade

**Current state (3-axis grader):**
- Pattern detection (0-33)
- Quantification (0-33)
- Recommendation specificity (0-34)
- Calibrated: generic 59/100, ideal 94/100
- LLM-as-judge with reference data injected

**Needed upgrade (5-axis ADAI — Atelier Data Acumen Instrument):**
- Pattern detection (0-20)
- Data fidelity — did claims come from actual query results? (0-20)
- Analytical/causal reasoning — correct link between data and cause (0-20)
- Decision quality — specific action with trade-offs acknowledged (0-20)
- Executive communication — right argument, right audience (0-20)

**Also needed — anchor-based grading (critical):**
The current grader judges on the fly. The correct architecture uses
locked anchor briefings as reference points:
- Anchor Generic (target: ~40): vague, no numbers, no pattern
- Anchor Competent (target: ~65): names pattern, some numbers, one action
- Anchor Ideal (target: ~90): full cohort breakdown, derived numbers,
  3 actions with timelines, epistemic honesty

The grader compares the learner briefing against anchors rather than
judging independently. This produces consistent, reproducible scores.

**Cohort Collapse anchors (two of three already written):**

Generic anchor (59):
> "NovaPay's MRR grew 6% but the 2025 cohort is churning faster than
> older cohorts. I recommend pausing growth spend and investigating
> churn drivers. The blended number is misleading."

Ideal anchor (94):
> "NovaPay's blended MRR grew 6% this quarter but that number is hiding
> a structural problem. The 2023 cohort retains at ~94% at 24 months.
> The 2024 cohort drops to ~82% at 12 months. The 2025 cohort churns
> at approximately 3.2% per month in the first 90 days — 32% annualized.
> New customer volume is offsetting churn in aggregate MRR which is why
> the top line looks healthy. The unit economics of the 2025 cohort are
> deeply negative. If the 2025 cohort stabilizes at 32% annual churn,
> LTV is roughly one-third of a 2023 customer at the same ACV. The 2025
> cohort represents ~40% of active base. Recommendation: freeze growth
> spend on 2025 channels immediately. In 14 days run a cohort health
> audit — call the bottom 20% of 2025 customers by engagement score.
> By day 30 implement a 90-day structured onboarding for any 2025
> customer below activation threshold. Do not present blended MRR to
> the board without a cohort decomposition slide. What I cannot confirm
> yet: whether churn is driven by product-market fit, onboarding failure,
> or sales qualification. I need support ticket volume by cohort and
> feature activation rates by cohort to separate those hypotheses."

Competent anchor (~70) — NEEDS TO BE WRITTEN

---

## 7. The IES SBIR positioning

**Why this matters:**
IES (Institute of Education Sciences) SBIR Phase IB provides $250,000
for a novel component added to an existing platform. Atelier's automated
competency measurement engine (the ADAI) is that component.

**The reframe that makes Atelier IES-competitive:**

| Current language | IES language |
|---|---|
| "Analytics training platform" | "Decision Intelligence Measurement System" |
| "Rubric" | "Assessment Instrument (ADAI)" |
| "Score" | "Competency Evidence" |
| "Module" | "Executive Incident" |
| "Grade" | "Behavioral + Competency Evidence" |

**The R&D roadmap:**
- Phase 1 (Now-3 months): Formalize competency framework, publish ADAI,
  competency transcripts replace score-first display
- Phase 2 (3-9 months): Behavioral telemetry (query trails), human vs
  AI scoring validation study, faculty advisor recruitment
- Phase 3 (9-18 months): Pilot studies with universities, white papers,
  IES Phase IB proposal
- Phase 4 (18-36 months): Dynamic scenario generation, adaptive
  assessment, benchmark dataset

**IES Phase IB target:** April 2027 submission
**Competitive advantage:** Behavioral data from real learners + validated
instrument + synthetic enterprise environments = unique combination

---

## 8. The trio workflow

Every build task in Atelier follows this workflow:

**Claude Chat (this role):**
- Strategy, product decisions, positioning
- Sprint prompt authoring
- Document creation (PRDs, TRDs, blueprints, canons)
- Debugging diagnosis and fix design
- Content authoring (Hot Cases, grader prompts, copy)
- Reading and interpreting terminal output

**Eddy (Mpingo Systems):**
- Runs PowerShell commands
- Runs SQL in Supabase SQL Editor
- Verifies output and screens in the browser
- Makes product decisions
- Pastes terminal/console output back to Claude Chat
- Manages GitHub, Vercel, Stripe, Supabase dashboards

**Claude Code (CC):**
- Executes sprint prompts written by Claude Chat
- Writes and edits files
- Commits to branch claude/review-auth-setup-NGq9M
- Reports what shipped with file paths and line numbers
- Does NOT make product decisions
- Does NOT deviate from sprint prompt spec

**The handoff sequence:**
```
Claude Chat writes sprint prompt
    ↓
Eddy pastes into Claude Code
    ↓
Claude Code ships commit
    ↓
Eddy runs any manual SQL/PowerShell steps
    ↓
Eddy verifies in browser
    ↓
Eddy reports results to Claude Chat
    ↓
Claude Chat diagnoses and plans next sprint
```

---

## 9. Files to share with new Claude Chat

When starting a new chat session, share these files in order:

**Priority 1 — Must share:**
1. `docs/ATELIER-SOURCE-OF-TRUTH.md` — full build history
2. `docs/ATELIER-PRODUCT-PHILOSOPHY.md` — what Atelier is/is not
3. `docs/ATELIER-CURRICULUM-FRAMEWORK.md` — six dimensions
4. `content/hot-cases/CANON.md` — Hot Case authoring rules
5. This CHS document (ATELIER-CHS-v0.md)

**Priority 2 — Share if relevant to sprint:**
6. `docs/ATELIER-UNIFIED-BLUEPRINT .md` — full product blueprint
7. `docs/plans/00-master-roadmap.md` — sprint roadmap
8. `HOT-CASE-ADMIN-AUTHORING-PRD.md` — admin UI PRD
9. `HOT-CASE-ADMIN-AUTHORING-TRD.md` — admin UI TRD

**Priority 3 — Share for specific tasks:**
10. `app/api/webhook/stripe/route.ts` — for webhook debugging
11. `app/api/hot-cases/[slug]/submit/route.ts` — for grader work
12. `lib/supabase.ts` — for auth debugging
13. `components/layout/SiteHeader.tsx` — for nav changes

---

## 10. Sprint prompt templates

### Template A — Claude Code feature sprint

```
You are working on the Atelier platform (realitydb-atelier repo,
branch claude/review-auth-setup-NGq9M).
Dev server: localhost:3000. Stack: Next.js 16.2.6, Supabase,
TypeScript, Tailwind.

Read these files before starting:
- docs/ATELIER-PRODUCT-PHILOSOPHY.md
- docs/ATELIER-CURRICULUM-FRAMEWORK.md
- content/hot-cases/CANON.md

[SPRINT DESCRIPTION]

COMPLETION CRITERIA:
1. [specific testable criterion]
2. [specific testable criterion]
3. Build passes with no TypeScript errors

Windows PowerShell environment.
[System.IO.File]::WriteAllText() for all file writes.
Absolute paths only. Never cd + relative paths.
Do not run pnpm add or pnpm remove.
Repo: C:\Users\HP\Documents\atelier
Branch: claude/review-auth-setup-NGq9M
```

### Template B — Hot Case generation prompt

```
Generate a complete Hot Case JSON file following
content/hot-cases/CANON.md exactly.

INPUTS:
1. Pattern ID: [from pattern library]
2. Vertical: [NovaPay/MedCore/SupplyLink/TowerNet/ClearBank/OncoCare]
3. Company name: [from pack]
4. Surface metric: [what looks healthy]
5. Hidden crisis: [what the data actually shows]
6. Reference numbers:
   - [Number 1]
   - [Number 2]
   - [Number 3]

DELIVERABLES:
Complete JSON + grading prompt + calibration test
```

### Template C — Diagnostic sprint

```
You are working on the Atelier platform.
Stack: Next.js 16.2.6, Supabase, TypeScript.

PROBLEM: [describe exact symptom]
EVIDENCE: [paste console errors, terminal output]
FILES INVOLVED: [list relevant files]

Diagnose the root cause and provide the exact fix.
Do not change any other behavior.
Build must pass.
```

---

## 11. Pre-launch checklist for June 22

**Stripe webhook (BLOCKING):**
- [ ] Diagnose why Atelier Production webhook shows zero deliveries
- [ ] Confirm subscriptions table writes after real checkout
- [ ] Test idempotency (same session ID does not double-write)

**Supabase:**
- [ ] Upgrade to Pro ($25/month) — prevents pausing on launch day
- [ ] Run RLS audit — all tables have RLS enabled
- [ ] Verify daily backups enabled after Pro upgrade

**Grader upgrade (important before launch):**
- [ ] Write competent anchor briefing for cohort-collapse
- [ ] Update grading prompt to anchor-based comparison
- [ ] Update canon to require 3 anchors per Hot Case
- [ ] Re-run calibration: generic ~40, competent ~65, ideal ~90

**Distribution:**
- [ ] LinkedIn profile updated (founder framing)
- [ ] LinkedIn Post 1 published (origin story)
- [ ] LinkedIn Post 2 published (grader story)
- [ ] Brandeis professor emails sent (June 17-18)
- [ ] LinkedIn Post 3 published (countdown — June 20)
- [ ] Waitlist target: 200 subscribers by June 21
- [ ] Launch blast email ready in Resend
- [ ] Export waitlist CSV and upload to Resend contacts

**Post-deploy verification:**
- [ ] /waitlist loads and captures emails
- [ ] /hot-cases shows The Cohort Collapse
- [ ] Full Hot Case flow: exercise → briefing → graded result
- [ ] /pricing loads all three segments
- [ ] Checkout completes and subscriptions table writes
- [ ] Magic link works cross-browser
- [ ] Admin panel accessible for emkwambe1@gmail.com
- [ ] /legal/privacy and /legal/terms load correctly

---

## 12. Key decisions locked (do not reopen)

1. **Reference answer reveal:** Only after graded submission. Never before.
2. **Atelier Rank model:** Glicko-2 on scores, RD decreases with volume.
3. **Briefing scaffold copy:** Locked four-bullet structure (see CANON.md).
4. **Grader calibration standard:** Generic 55-72, ideal 88-97 (upgrading to anchor-based).
5. **Hot Cases drop schedule:** Every Monday 8am EST.
6. **Dataset rotation:** All 6 packs, at least one per vertical per month.
7. **No pricing on waitlist page:** Pricing belongs on /pricing after product demo.
8. **Atelier is not a SQL course:** Positioning locked in PRODUCT-PHILOSOPHY.md.
9. **Six dimensions are final:** Names and definitions locked.
10. **Raleigh NC is the business address:** Not Charlotte.
11. **Contact email:** atelier@realitydb.dev
12. **Launch date:** June 22, 2026

---

## 13. Accounts and credentials (locations only — never share values)

- **Stripe:** dashboard.stripe.com — Mpingo Systems account (acct_1TLxaa6sezd2LSNW)
- **Supabase:** supabase.com — realitydb-atelier project
- **Vercel:** vercel.com — eddy-mkwambes-projects/realitydb-atelier
- **GitHub:** github.com/emkwambe/realitydb-atelier
- **Resend:** resend.com — realitydb.dev domain verified
- **Google Workspace:** mpingo.ai — atelier@realitydb.dev alias active
- **Cloudflare:** realitydb.dev domain — DNS managed here

---

## 14. The bigger vision (for context)

Atelier is the first product in a portfolio of precision tools built
by Mpingo Systems LLC. The long-term vision:

**Short term (Atelier):** Decision Intelligence Measurement System
**Medium term (portfolio):** SQL Learn → HireSQL → Data Store → RealityDB Cert → SafeSQL
**Long term (Atelier):** The CFA for Data Acumen — a psychometrically
validated, nationally recognized credential for business judgment

The IES SBIR pathway (Phase IB, target April 2027) is the research
credibility path that transforms Atelier from a commercial product into
a validated educational instrument.

The moat is not AI. The moat is not synthetic data. The moat is the
**measurement system** — the ability to turn realistic business
investigations into reproducible, validated evidence of decision-making
competence.

---

*Mpingo Systems LLC · Raleigh, NC*  
*ATELIER-CHS-v0 · June 15, 2026*  
*Prepared for handover to new Claude Chat session*
