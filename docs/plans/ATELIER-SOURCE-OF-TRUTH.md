# Atelier — Complete Source of Truth
**Version:** v1.0 · 2026-05-20
**Owner:** Eddy Mkwambe · Mpingo Systems LLC · Charlotte, NC
**Status:** Canonical. All other docs defer to this one on conflicts.

> This document is the single reference for what Atelier is, what exists,
> what does not exist yet, how it is priced, who it serves, and what gets
> built next. Claude Code reads this before touching any file. Any conflict
> between this doc and any other doc — this doc wins.

---

## PART 1 — WHAT ATELIER IS

### 1.1 The one-sentence definition

Atelier is a **professional intelligence platform** that develops business
acumen through live data — the only platform that produces a verifiable,
crisis-specific, judgment-graded proof of business capability that is
portable, credentialed, and recruiter-readable.

### 1.2 The tagline

> **"The business school that runs on live data."**

This is not marketing copy. It is a precise description of a category
that does not exist yet. Do not change it.

### 1.3 What Atelier is NOT

- Not a SQL training platform
- Not a data literacy course
- Not a coding challenge site for analysts
- Not an LMS
- Not a video course library
- Not an AI skills platform

### 1.4 The correct framing — always

```
Business Acumen        (the goal — what Atelier develops)
      │
      │ demonstrated through
      ▼
Data Fluency           (the medium — how capability is surfaced)
      │
      │ expressed via
      ▼
SQL / Analytics        (the tool — the instrument, not the product)
```

SQL is the instrument. Business acumen is what is being trained.
The CEO briefing is where the two meet. The credential proves judgment,
not technical execution.

### 1.5 The AI framing — precise language only

Atelier does not teach AI. Atelier does not certify AI skills.

The correct frame is: **AI-Augmented Knowledge Worker** — a professional
whose business acumen is amplified by AI, not replaced by it. AI is one
instrument in the business acumen toolkit. The credential proves the human
judgment. The AI (Claude grading, Co-Pilot, Boardroom) is infrastructure
that surfaces and stress-tests that judgment.

Never use: "AI skills", "AI readiness", "AI training" as standalone
positioning. Always use in the context of business acumen amplification.

### 1.6 The six dimensions of business acumen Atelier measures

Every module, Hot Case, and Boardroom round maps to one primary and one
secondary dimension from this list. The Atelier Rank reports performance
across all six.

| Dimension | What it measures | Primary Atelier expression |
|---|---|---|
| Financial Intelligence | Profitability, cash flow, ROI, unit economics, financial trade-offs | ClearBank, MedCore exercises |
| Strategic Intelligence | Competitive positioning, market dynamics, long-term implications | CEO briefing recommendation axis |
| Operational Intelligence | Workflows, execution systems, process efficiency, scalability | SupplyLink, TowerNet exercises |
| Decision Intelligence | Trade-offs, incomplete information, risk, prioritization under uncertainty | The Boardroom |
| Communication & Influence | Business storytelling, stakeholder framing, executive translation | The CEO briefing deliverable |
| AI-Augmented Knowledge Worker | Judgment amplified by AI tools, adaptability, learning velocity | Co-Pilot, Boardroom AI directors |

### 1.7 The four structural moats

Every product decision must amplify at least one of these four. Decisions
that amplify none are not on the roadmap.

1. **The data engine** — RealityDB generates enforced-narrative datasets at
   97–99/100 quality with citation trails to primary industry sources.
   Nobody else does this.

2. **The deliverable** — Claude-graded 5-axis CEO briefing including
   epistemic-honesty axis. The entire EdTech market grades completion;
   Atelier grades judgment.

3. **Vertical depth** — six industries where mistakes cost millions or
   human lives: FinTech, healthcare RCM, supply chain, telecom, AML
   banking, oncology trials.

4. **The credential** — signed, publicly verifiable, names the specific
   crisis the learner solved. Not "completed 6 weeks of video."

---

## PART 2 — WHAT EXISTS TODAY (BUILD STATUS)

### 2.1 Built and live at localhost:3002

| Component | Status | Notes |
|---|---|---|
| Landing page | ✅ Live | Copy needs updating per §6 of this doc |
| Pricing page | ✅ Live | Prices are wrong — see §3 for canonical prices |
| Auth (signup / login) | ✅ Live | Working |
| NovaPay module | ✅ Live | 13 tables, 50K rows, 10 exercises |
| MedCore module | ✅ Live | 12 tables, 50K rows, 10 exercises |
| SupplyLink module | ✅ Live | 10 tables, 50K rows, 10 exercises |
| TowerNet module | ✅ Live | 10 tables, 50K rows, 10 exercises |
| ClearBank module | ✅ Live | 11 tables, 50K rows, 10 exercises |
| OncoCare module | ✅ Live | 12 tables, 30K rows, 10 exercises |
| CEO briefing | ✅ Live | 5-axis rubric, Claude-graded |
| Signed credential | ✅ Live | SHA-256 signed, /verify/<certId> |
| PGlite in-browser PostgreSQL | ✅ Live | No setup required |
| Stripe checkout | ❌ Not built | Wiring is next sprint |
| Hot Cases | ❌ Not built | Routes, pipeline, content all pending |
| Atelier Rank | ❌ Not built | Glicko-2 engine, profile pages pending |
| The Boardroom | ❌ Not built | Adversarial AI director Q&A pending |
| Co-Pilot | ❌ Not built | "Stuck?" button pending |
| Cohort / Team dashboard | ❌ Not built | Corporate segment pending |
| Instructor dashboard | ❌ Not built | Academic segment pending |
| Multi-campus admin | ❌ Not built | University System tier pending |
| Atelier Index | ❌ Not built | Requires N≥500 graded briefings |
| Atelier Open | ❌ Not built | Requires N≥500 ranked learners |

### 2.2 RealityDB CLI status

- CLI version: v2.38.0
- Smoke tests: 158/158 passing
- Pack scores: MedCore 99/100, SupplyLink 99/100, TowerNet 98/100,
  ClearBank 98/100, OncoCare 98/100
- All five packs at zero broken-data status

### 2.3 What is on the live pricing page (currently wrong)

The live pricing page shows prices that conflict with the canonical
pricing in §3. Do not use the live page as a reference for pricing.
Use §3 of this document exclusively.

Current wrong prices on live site:
- Module: $499 one-time ← WRONG
- All-Access: $1,499 one-time ← WRONG
- Team: $9,999 / 10 seats / 1 year ← PARTIALLY RIGHT (seats correct,
  needs tier structure)
- MBA License: $14,999/semester ← NOW the University License tier
- Instructor Solo: $299/month ← WRONG
- Instructor Pro: $799/month ← WRONG

### 2.4 Naming on the live site (currently wrong)

- "Weekly Briefs" → must be "Hot Cases" everywhere
- "Try a free Brief" → must be "Try a Hot Case"
- "Brief 001" → must be "Hot Case 001"
- Routes `/briefs/` → must be `/hot-cases/`
- Table `briefs` → must be `hot_cases`
- Table `brief_submissions` → must be `hot_case_submissions`

---

## PART 3 — CANONICAL PRICING (SINGLE SOURCE OF TRUTH)

### 3.1 Segment 1 — Individual

Self-serve. Stripe Checkout. No sales conversation needed.

| Tier | Monthly | Annual | Annual savings | What's included |
|---|---|---|---|---|
| **Module** | $39/month | $390/year | $78 (2 months free) | One chosen module (permanent choice), all Hot Cases in that vertical, Atelier Rank updates, Co-Pilot access, limited Boardroom (1 simulation/week) |
| **All-Access** | $179/month | $1,790/year | $358 (2 months free) | All modules, all Hot Cases, full Boardroom (unlimited), full Atelier Rank profile, priority grading |

Rules:
- Annual is default/highlighted on pricing page. Monthly is available but not promoted.
- Module tier = ONE chosen module. Not rotating. Permanent access to that module
  ecosystem including all associated Hot Cases in that vertical.
- Upgrade path: Module → All-Access is surfaced when Atelier Rank shows a
  capability gap in a vertical the learner doesn't own.
- No headcount limits. Individual billing only.

### 3.2 Segment 2 — Corporate

Sales-assisted from Team tier up. Annual commit only. No monthly option.
Organization pays. Employees access via managed seats. No individual billing.

| Tier | Price | Seats | What's included |
|---|---|---|---|
| **Team** | $9,999/year | 10 seats (hard cap) | One module, cohort progress dashboard, admin invites and deadlines, cohort report at end of term. Under $10K procurement threshold — one person can sign. |
| **Corporate Pro** | $24,999/year | Up to 50 seats (hard cap) | All modules, cohort dashboard, custom questions (10 per module), CSV export, manager analytics view |
| **Enterprise** | Custom / annual | 51–500+ seats | All Corporate Pro features + SSO, LMS integration (Canvas, Blackboard, Moodle), dedicated onboarding, custom branding, 99.9% uptime SLA, workforce capability heatmaps |

Rules:
- Hard seat caps. 11th seat on Team = upgrade prompt to Corporate Pro.
- 51st seat on Corporate Pro = upgrade conversation to Enterprise.
- All Corporate tiers: org pays, employees get managed accounts, no individual billing.
- Each employee still has individual Atelier Rank profile (development use).
- Formal employment-decision use of scores requires Enterprise tier with
  governance addendum.

### 3.3 Segment 3 — Academic

Sales-assisted from Institution tier up. Semester or annual contract.
Institution pays. Students access via campus-issued accounts. No student billing.

| Tier | Price | Students | Campuses | What's included |
|---|---|---|---|---|
| **Program** | $4,999/semester | Up to 30 (hard cap) | 1 | All modules, instructor dashboard, semester-based activation, course-linked pathways, student credentials |
| **Institution** | $9,999/semester | Up to 100 (hard cap) | 1 | All Program features + custom questions, CSV export, PDF certificates, class-discussion view |
| **University License** | $14,999/semester | Unlimited | 1 | All Institution features + LMS integration, SSO, dedicated onboarding. Can also be purchased as annual ($24,999/year). |
| **University System** | Custom / annual | Unlimited | Unlimited | All University License features + per-campus dashboards with system-wide rollup, federated SSO across campus identity providers, optional custom branding per campus under system umbrella |

Rules:
- University System is the only multi-campus tier.
- Each campus in a University System gets its own dashboard. System admin
  sees all campuses with filter.
- System license covers all campuses — no per-campus add-on fees once signed.
- Hard caps on Program and Institution tiers. Overflow triggers upgrade prompt.
- Semester cadence: spring and fall activations. Annual option available for
  University License and above.

### 3.4 Segment 4 — Strategic Enterprise (Future — not yet selling)

Not yet active. Architecture only. No Stripe products created yet.

| Vertical | Why separate | Price range | Sales motion |
|---|---|---|---|
| Banks / Financial Institutions | Regulatory risk, OCC/AML compliance, decision quality = financial exposure | $100K–$500K/year | 12–24 month cycle, Chief Risk Officer champion |
| Healthcare Systems | Patient safety, HIPAA, workforce resilience, clinical operations | $100K–$500K/year | 12–24 month cycle, CHRO or CMO champion |
| Fortune 500 | Organizational intelligence at scale, cross-functional translation, global deployment | $250K–$1M+/year | 18–36 month cycle, CHRO + Executive Sponsor |
| Consulting Firms | Talent is the product, billable capability acceleration, white-label potential | $50K–$250K/year | 6–12 month cycle, Managing Director champion |
| Government | Procurement, FedRAMP, public accountability, workforce modernization | Custom | 18–36 month cycle, requires GSA schedule |

Segment 4 becomes sellable when:
- Atelier Index 1.0 is published (N≥500 graded briefings)
- Atelier Rank has validated construct (Glicko-2 simulation complete)
- At least 3 Corporate or Academic case studies published with ROI data

### 3.5 What is free — forever

| Product | Always free | Notes |
|---|---|---|
| Hot Cases | Yes | Every Hot Case, including archive. Free forever. Never paywalled. |
| Module beginner exercises (2 per module) | Yes | After free account creation. Domain-agnostic SQL drills only. |
| Atelier Rank — viewing own profile | Yes | Learner always sees their own rank. |
| Public profile /profile/<handle> | Yes | Learner controls public/private toggle. |
| Credential verification /verify/<certId> | Yes | Always publicly verifiable. |

### 3.6 Stripe products to create (in order)

Create these in Stripe dashboard before any implementation.
All prices in USD. Stripe Tax enabled from day one.

**Segment 1 — Individual (create first)**
```
PRODUCT: Atelier Module
  PRICE: price_module_monthly        $39/month (recurring)
  PRICE: price_module_annual         $390/year (recurring)

PRODUCT: Atelier All-Access
  PRICE: price_allaccess_monthly     $179/month (recurring)
  PRICE: price_allaccess_annual      $1,790/year (recurring)
```

**Segment 2 — Corporate (create second)**
```
PRODUCT: Atelier Team
  PRICE: price_team                  $9,999/year (recurring annual)

PRODUCT: Atelier Corporate Pro
  PRICE: price_corporate_pro         $24,999/year (recurring annual)

PRODUCT: Atelier Enterprise
  (no Stripe product — manual invoice via Stripe Invoicing)
```

**Segment 3 — Academic (create third)**
```
PRODUCT: Atelier Program
  PRICE: price_program_semester      $4,999 / 6 months (recurring)

PRODUCT: Atelier Institution
  PRICE: price_institution_semester  $9,999 / 6 months (recurring)

PRODUCT: Atelier University License
  PRICE: price_university_semester   $14,999 / 6 months (recurring)
  PRICE: price_university_annual     $24,999 / year (recurring)

PRODUCT: Atelier University System
  (no Stripe product — manual invoice via Stripe Invoicing)
```

Total Stripe products: 5. Total Stripe prices: 10.

---

## PART 4 — CUSTOMER SEGMENTS AND PERSONAS

### 4.1 Segment architecture

Four segments. Distinct buying motion, champion, budget cycle, and
product need for each. Do not merge Academic into Corporate.

```
SEGMENT 1          SEGMENT 2          SEGMENT 3          SEGMENT 4
Individual         Corporate          Academic           Strategic Enterprise
──────────         ──────────         ──────────         ──────────────────
Self-serve         HR / L&D           Dean / Provost     C-suite / Board
$39–$1,790/yr      $9,999–Custom      $4,999–Custom      $100K–$1M+
Monthly/Annual     Annual only        Semester/Annual    Multi-year
Personal growth    Workforce dev      Student outcomes   Org intelligence
```

### 4.2 Segment 1 — Individual personas (priority order)

**1. The Strategic Climber** ← Most important early customer
- Mid-level professional: PM, Analyst, Ops, Healthcare Admin, Consultant
- Age 27–40
- Pain: technically strong but "not strategic enough" — overlooked for leadership
- Fear: being passed over while less technically skilled peers get promoted
- Trigger: "I work hard but leadership sees others as more strategic"
- Atelier value: CEO briefing proves strategic judgment, not just query skill.
  Atelier Rank is the portable proof.
- Pays: Module ($39/mo) → upgrades to All-Access when Rank shows vertical gap

**2. The AI-Anxious Professional**
- Knowledge worker whose role is being reshaped by automation
- Pain: fear of replacement, unclear how to stay relevant
- Trigger: "AI is changing my role faster than I can adapt"
- Atelier value: AI-Augmented Knowledge Worker development — business acumen
  that makes AI amplify rather than replace
- Pays: All-Access ($179/mo) — needs the full breadth

**3. The Hidden High-Potential**
- Capable but under-recognized — lacks political/network visibility
- Pain: stagnation despite strong execution capability
- Trigger: "I know I can lead but nobody sees it"
- Atelier value: Atelier Rank as visibility signal. Credential names the crisis
  solved — something a manager's opinion cannot produce.
- Pays: Module ($39/mo) — targeted, specific vertical

**4. The Career Pivot Professional**
- Changing industries or functions — lacks business language of new domain
- Pain: can execute but can't speak the language of the new context
- Atelier value: industry-specific modules as fast business fluency
- Pays: Module ($39/mo) per new vertical they're entering

**5. The MBA Alternative Learner**
- Wants business fluency without $80K and two years
- Pain: MBA too expensive and slow; online courses too shallow
- Trigger: "I need the practical layer, not the credential factory"
- Atelier value: The practical MBA layer for modern professionals
- Pays: All-Access ($179/mo annual = $1,790/year vs $80K MBA)

**6. The Founder / Entrepreneur**
- Building or scaling a venture — gaps in finance, ops, leadership
- Pain: execution is strong, strategic judgment is underdeveloped
- Atelier value: real business crisis simulations, not frameworks on slides
- Pays: All-Access ($179/mo)

### 4.3 Segment 2 — Corporate personas (priority order)

**1. The Corporate L&D Director** ← Primary champion (signs the check)
- Responsible for workforce upskilling and capability measurement
- Pain: low engagement, learning not tied to real business outcomes
- Trigger: "We pay for completions. We need to pay for capability."
- Atelier value: graded CEO briefings, not course completions. The deliverable
  lives on a server the CFO can audit.
- Buys: Team ($9,999/year, under procurement threshold) → Corporate Pro

**2. The HR Transformation Leader** ← Economic buyer at Corporate Pro+
- CHRO or head of talent strategy
- Pain: cannot identify adaptable talent, internal mobility rates are flat
- Trigger: "We don't know who is ready for the future"
- Atelier value: Atelier Rank as internal mobility signal. Capability visible
  before a promotion decision, not discovered after a bad one.
- Buys: Corporate Pro ($24,999/year) or Enterprise

**3. The Executive Sponsor** ← Strategic buyer at Enterprise
- CEO / COO / Chief Transformation Officer
- Pain: workforce not adapting to AI fast enough, leadership pipeline thin
- Trigger: "Our organization is not adapting fast enough"
- Atelier value: organizational capability heatmaps, AI-Augmented Knowledge
  Worker development at scale
- Buys: Enterprise (custom)

**4. The Department Manager** ← End-user buyer for Team tier
- Operational leader managing 5–15 analysts or knowledge workers
- Pain: team makes decisions without business context, briefs leadership poorly
- Trigger: "My team can pull the data but can't explain what it means"
- Atelier value: Team cohort puts the whole team through a crisis together.
  Group cohort report shows who got it and who didn't.
- Buys: Team ($9,999/year) — under their own budget authority

### 4.4 Segment 3 — Academic personas (priority order)

**1. The Professor / Course Director** ← Primary champion
- Teaching strategy, finance, analytics, operations, or healthcare management
- Pain: AACSB requires digital agility outcomes; case studies are static
- Trigger: "I need students to interrogate data, not read about it"
- Atelier value: AACSB Digital Agility outcomes. Every student credential
  names the specific crisis they solved — a verification URL a recruiter reads
  in three seconds.
- Buys: Program ($4,999/semester, up to 30 students)

**2. The Dean / Career Office Director** ← Economic buyer at Institution+
- Responsible for student employability and program reputation
- Pain: graduates can't demonstrate business judgment in interviews
- Trigger: "Our students know the frameworks but can't apply them"
- Atelier value: Institution tier gives unlimited student credentials per
  semester. Recruiter-readable. AACSB-aligned.
- Buys: Institution ($9,999/semester) or University License

**3. The Provost / VP Academic Affairs** ← Strategic buyer at University+
- Responsible for academic program outcomes across departments
- Pain: program differentiation in a commoditized market
- Atelier value: University License as a campus-wide professional intelligence
  infrastructure — every student, every department, one dashboard
- Buys: University License ($14,999/semester) or University System

**4. The System-Level Administrator** ← University System buyer
- Oversees multiple campuses — VP of Academic Affairs system-wide
- Pain: inconsistent program quality and outcomes across campuses
- Atelier value: per-campus dashboards with system-wide rollup, federated SSO
- Buys: University System (custom annual)

### 4.5 Segment 4 — Strategic Enterprise (future personas, not yet selling)

See §3.4 for vertical breakdown. Not activating until Atelier Index 1.0
is published and 3 case studies exist.

---

## PART 5 — PRODUCT ARCHITECTURE

### 5.1 The two content shapes — canonical rules

| Dimension | Company Module | Hot Case |
|---|---|---|
| Authoring time | 40–60 hours | 4–10 hours |
| Tables in schema | 10–13 | 3–4 |
| Rows of data | ~50,000 | ~5,000 |
| Scenario variants | 2–3 | 1 |
| Exercise count | 10 | 1–2 |
| Briefing length | 500–1,000 words | ~250 words (4 bullets) |
| Rubric | 5-axis | 3-axis |
| Learner time | 4–6 hours | 30 minutes |
| Credential | Signed certificate at /verify/<certId> | Profile badge |
| Price | Paid (Segment 1 subscription) | Free forever |
| Route | /companies/<slug> | /hot-cases/<slug> |
| Pack file | pack.json | hot-case-pack.json |
| Auth required | Yes (briefing + cert write to Supabase) | No (email at submission only) |

### 5.2 Built features — what they do

**The workbench**
Real PostgreSQL via PGlite. No setup. No account needed to explore.
The learner queries the database directly. The insight is in the data —
not in a case document.

**The CEO briefing**
After completing exercises, the learner writes a briefing. Graded by
Claude on a 5-axis rubric: segmentation quality, causal reasoning,
quantification, recommendation specificity, epistemic honesty.
Epistemic honesty is weighted 2× in Atelier Rank calculation.

**The signed credential**
SHA-256 signed. Public verification URL: /verify/<certId>.
The credential names the crisis solved, not the course completed.
Example: "This learner identified a $3.1M AML training failure in
ClearBank's 18-month synthetic transaction ledger on 2026-MM-DD."

### 5.3 Features not yet built — spec summary

**Hot Cases** (Bet 1 — Week 1 priority)
- Every Monday, 8am ET, one free 30-minute module from last week's news
- 3-axis rubric: pattern detection, quantification, recommendation specificity
- Routes: /hot-cases/, /hot-cases/[slug], /hot-cases/[slug]/briefing,
  /hot-cases/[slug]/results
- Tables: hot_cases, hot_case_submissions (NOT briefs, NOT brief_submissions)
- Pack file: hot-case-pack.json (NOT brief-pack.json)
- 3 reserve cases must exist before Hot Case #001 publishes
- Each Hot Case tagged: primary business acumen dimension, secondary dimension
- Free forever. Never paywalled. Email captured at briefing submission only.

**The Boardroom** (Bet 3 — Weeks 2–3)
- After briefing is graded, learner clicks "Take it to the board"
- Three AI personas: CFO, independent director, general counsel
- Each reads the briefing and the SQL trail
- Three questions each, 90 seconds per response
- New rubric axis: boardroom defense (appended to profile, not to main rubric)
- Module tier: 1 Boardroom simulation/week, limited replay
- All-Access: unlimited simulations, full persona library
- Enterprise: organization-specific personas, team analytics
- Pre-renders 3 opening questions on briefing submit (kills latency)
- Boardroom transcript stored in hot_case_submissions.boardroom_transcript
- After Boardroom ships: all rank-bearing submissions require Boardroom round

**Atelier Rank** (Bet 2 — Weeks 5–6)
- Glicko-2 rating system with 3 customizations:
  1. RD decay: new learners start RD=200, "established" after 3 modules
  2. Module difficulty weighting: OncoCare/ClearBank higher K-factor
  3. Epistemic honesty weighted 2×
- Public profile: /profile/<handle>
- Shows: current rank, percentile, modules solved (crisis named), trend chart
- "Open to opportunities" toggle: double opt-in, surfaces to recruiters (Phase 2)
- Default: private. Must explicitly toggle to public.
- Provisional: rank hidden until 3 modules submitted
- Hot Case score: separate for first 90 days, integrate at reduced K-factor after
- Anti-cheat: Boardroom is primary defense. LLM-detection is secondary.
- Tables: profiles (add atelier_rank, rank_deviation, rank_established columns)
- New table: rank_audit_log

**Co-Pilot** (Bet 7 — Week 4)
- Side panel in exercise workbench
- "Stuck?" button → calls Claude with current schema + exercise context
- Socratic questions only. Never writes or hints at SQL.
- Module tier: 3 nudges per exercise
- All-Access: unlimited nudges, proactive idle-detection intervention
- Nudge-use logged to briefing metadata. Grader can see over-reliance.

**Stripe Checkout** (next sprint — before everything else)
- See §3.6 for Stripe products to create
- Phase 1: record only. Modules stay technically open. Gate in Phase 2.
- Phase 2: ENABLE_PAYWALL=true. Beginner exercises free, rest paywalled.
- All webhook events idempotent. Service role writes only.

### 5.4 Supabase tables — current and needed

**Currently exists:**
- auth.users
- profiles
- module_progress
- briefing_submissions
- biz_certifications

**To create for Stripe:**
- purchases (one row per successful one-time/annual payment)
- subscriptions (one row per active subscription)
- Add stripe_customer_id to profiles

**To create for Hot Cases:**
- hot_cases (catalog: slug, title, pattern_id, published_at, pack_hash,
  dataset_hash, engine_version, status)
- hot_case_submissions (id, user_id nullable, email, hot_case_slug, score,
  axes jsonb, briefing_text, boardroom_transcript jsonb null, created_at)

**To create for Atelier Rank:**
- Add to profiles: atelier_rank int, rank_deviation int,
  rank_established boolean, handle text unique, profile_public boolean,
  open_to_opportunities boolean, stripe_customer_id text
- rank_audit_log (id, user_id, submission_id, module_slug, score,
  axis_breakdown jsonb, rank_before int, rank_after int,
  anticheat_flags jsonb, created_at)

**To create for Corporate/Academic:**
- organizations (id, name, type [corporate/academic], tier, stripe_subscription_id,
  seat_count, seat_limit, campus_count, campus_limit, created_at)
- organization_members (org_id, user_id, role [admin/member/instructor/student],
  invited_at, joined_at)
- cohorts (id, org_id, name, module_slug, start_date, end_date, created_by)
- cohort_members (cohort_id, user_id, joined_at)

---

## PART 6 — COPY THAT MUST CHANGE ON THE LIVE SITE

### 6.1 Landing page — what to keep

These lines are strong and must be preserved:

> "Don't read about the business. Interrogate its dynamics in data."

> "The credential names the crisis you solved, not the course you finished."

> "DataCamp grades whether your SQL returned the right rows. Coursera grades
> whether your peers liked your essay. Atelier grades whether you would be
> hired as the analyst who saved the company."

> "$3.1B — TD Bank's 2024 AML penalty — attributed by the OCC to inadequate
> training, not missing technology."

### 6.2 Landing page — what to change

**Remove this stat:**
"11% of employees feel fully confident working with data"
← This is a data literacy stat, not a business acumen stat.
← It pulls positioning toward analytics training.

**Replace with:**
"70% of employees rarely or never have access to critical business
information — even when it determines their next decision."
(Harvard Business Publishing)

OR:

"Only 36% of organizations are career development champions. Those
organizations outperform on retention, attraction, and AI readiness."
(LinkedIn Workplace Learning Report 2025)

**Change "Six modules live":**
The landing page says "Six modules live" but NovaPay's positioning as
a module vs the 5 production-quality packs needs clarification.
Use: "Five production modules live · New module monthly · Hot Cases every Monday"

**Add one sentence that names the category:**
Under the hero, before the module cards:
"Atelier develops business acumen. Data is the medium. The briefing is the proof."

**Change the built-for section audience framing:**
Current: "L&D & Analytics Leaders", "Compliance & Clinical Ops", "MBA Programs"
Updated: align with the three-segment architecture:
- Segment 1: "For professionals investing in themselves"
- Segment 2: "For organizations investing in their workforce"
- Segment 3: "For institutions investing in student outcomes"

### 6.3 Pricing page — full replacement needed

The pricing page needs a complete rewrite to reflect:
1. Three-segment layout (Individual / Corporate / Academic)
2. Canonical prices from §3
3. Monthly/Annual toggle for Individual
4. Correct tier names throughout
5. "Coming soon" labels on unbuilt features (Boardroom, Rank, Co-Pilot)
6. Stripe self-checkout live for Individual; "Contact us" for Corporate/Academic

### 6.4 Briefs page — rename and update

- All instances of "Brief" / "Weekly Brief" → "Hot Case"
- Route /briefs/ → /hot-cases/
- "Brief 001" → "Hot Case 001"
- The preview copy ("The Cohort Collapse") is excellent — keep the content,
  update the naming only

---

## PART 7 — BUILD SEQUENCE (WHAT CLAUDE CODE EXECUTES NEXT)

### 7.1 Sprint 0 — Stripe wiring (before June 14 launch)

Must complete before anything else. No revenue is possible without this.

**Step 1: Stripe dashboard (Eddy does this manually)**
- Create Stripe account for Mpingo Systems LLC, verify bank
- Enable Stripe Tax
- Create 5 products and 10 prices per §3.6
- Create webhook endpoint pointing to /api/webhook/stripe
- Save all secrets to .env.local and Vercel

**Step 2: Database migration**
```sql
-- Add to profiles
alter table public.profiles
  add column if not exists stripe_customer_id text;

-- purchases table
create table public.purchases (
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

-- subscriptions table
create table public.subscriptions (
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

-- RLS
alter table public.purchases enable row level security;
alter table public.subscriptions enable row level security;
create policy "purchases_select_own" on public.purchases
  for select using (user_id = auth.uid());
create policy "subscriptions_select_own" on public.subscriptions
  for select using (user_id = auth.uid());
```

**Step 3: New files**
- lib/stripe.ts — server client + createCheckoutSession + createPortalSession
- lib/entitlements.ts — canAccess(userId, moduleSlug, exerciseDifficulty)
- app/api/checkout/route.ts
- app/api/webhook/stripe/route.ts (signature verify, idempotent upserts)
- app/api/portal/route.ts
- app/checkout/start/page.tsx
- app/checkout/success/page.tsx
- app/checkout/cancel/page.tsx
- app/account/billing/page.tsx

**Step 4: UI wires**
- Pricing page: full replacement per §6.3
- Landing page: copy updates per §6.1 and §6.2
- Briefs page: rename to Hot Cases per §6.4
- Auth signup: preserve ?plan= redirect to /checkout/start

**Step 5: Env vars needed**
```
STRIPE_SECRET_KEY=sk_test_…
STRIPE_WEBHOOK_SECRET=whsec_…
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_…
STRIPE_PRICE_MODULE_MONTHLY=price_…
STRIPE_PRICE_MODULE_ANNUAL=price_…
STRIPE_PRICE_ALLACCESS_MONTHLY=price_…
STRIPE_PRICE_ALLACCESS_ANNUAL=price_…
STRIPE_PRICE_TEAM=price_…
STRIPE_PRICE_CORPORATE_PRO=price_…
STRIPE_PRICE_PROGRAM_SEMESTER=price_…
STRIPE_PRICE_INSTITUTION_SEMESTER=price_…
STRIPE_PRICE_UNIVERSITY_SEMESTER=price_…
STRIPE_PRICE_UNIVERSITY_ANNUAL=price_…
ENABLE_PAYWALL=false
```

### 7.2 Sprint 1 — Hot Cases (Week 1 after Stripe)

- Create /hot-cases/ routes
- Create hot_cases and hot_case_submissions tables
- Build brief-pack.json → hot-case-pack.json pipeline
- Build Monday publish workflow
- Build 3 reserve cases before first publish
- Wire email send pipeline (Resend)
- Rename all /briefs/ routes to /hot-cases/

### 7.3 Sprint 2 — The Boardroom (Weeks 2–3)

- Build /api/grade-boardroom endpoint
- Build three AI personas (CFO, GC, independent director)
- Wire pre-render on briefing submit
- Add boardroom_transcript column to hot_case_submissions
- Build Boardroom UI in workbench

### 7.4 Sprint 3 — Co-Pilot (Week 4)

- Build Co-Pilot side panel in workbench
- "Stuck?" button → Claude API call with schema + exercise context
- Socratic constraint: questions only, never SQL
- Log nudge-use to briefing metadata

### 7.5 Sprint 4 — Atelier Rank (Weeks 5–6)

- Implement Glicko-2 with three customizations
- Build /profile/<handle> public page
- Build /account/profile settings
- Build /account/rank history
- Create rank_audit_log table
- Wire rank calculation per submission

---

## PART 8 — CANONICAL NAMING (ENFORCED EVERYWHERE)

| Use this | Never use this |
|---|---|
| Hot Cases | Weekly Briefs, Briefs, Hot Briefs |
| Company modules | Full modules, paid modules, cases |
| Atelier Rank | Rating, score, leaderboard rank |
| The Boardroom | AI Q&A, director round, defense round |
| Co-Pilot | Tutor, hint system, chatbot |
| hot_cases (table) | briefs |
| hot_case_submissions (table) | brief_submissions |
| hot-case-pack.json | brief-pack.json |
| /hot-cases/ (route) | /briefs/ |
| AI-Augmented Knowledge Worker | AI skills, AI readiness, AI training |
| Business acumen | Analytics skills, data skills, SQL skills |
| Segment 1 / Individual | B2C |
| Segment 2 / Corporate | B2B (too vague) |
| Segment 3 / Academic | Education (too vague) |
| Segment 4 / Strategic Enterprise | Enterprise (reserved for Seg 2 tier) |

---

## PART 9 — WHAT TO SAY NO TO

1. No mobile-native app. It's a laptop activity.
2. No live video instructor cohorts. That is HBS Online.
3. No general-purpose chatbot tutor. Co-Pilot is the only chatbot surface.
4. No NFT / blockchain credential anchoring.
5. No i18n before $1M ARR.
6. No second AI provider abstraction layer until Claude 5.
7. No reconstruction of victims' data in any module.
8. No paid placement of named companies without counsel-signed consent.
9. No Atelier Open before N≥500 ranked learners.
10. No open-sourcing RealityDB engine before content moat is established.
11. No positioning Atelier as a SQL course, data course, or analytics platform.
12. No "AI skills" as a standalone product category.
13. No per-month pricing for Corporate or Academic segments.
14. No individual billing for Corporate or Academic learners.
15. No multi-campus access below University System tier.

---

## PART 10 — CHANGELOG

| Version | Date | What changed |
|---|---|---|
| v1.0 | 2026-05-20 | First complete source of truth. Consolidates all prior adjusted docs. Four-segment architecture locked. Pricing unified (Individual monthly/annual, Corporate annual, Academic semester/annual). University System tier added for multi-campus. Segment 4 Strategic Enterprise defined but not yet active. Business acumen grain restored — Atelier is not a SQL platform. AI-Augmented Knowledge Worker framing locked. All canonical names enforced. Build status documented. Stripe sprint sequence defined. |

---

*Mpingo Systems LLC · Charlotte, NC*
*The business school that runs on live data.*
