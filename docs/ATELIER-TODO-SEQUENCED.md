# Atelier — Sequenced To-Do List
**Version:** 1.0 · September 2026  
**Owner:** Eddy Mkwambe · Mpingo Systems LLC  
**Purpose:** Single source of truth for what to build next and in what order  
**Read by:** Eddy, any new Claude Chat session, Claude Code before sprints

---

## How to read this list

Every item has:
- A **sprint label** (what to call it in a Claude Code prompt)
- A **depends on** line (what must be done first)
- A **definition of done** (how to know it is complete)
- A **who does it** line (Claude Chat, Claude Code, or Eddy)

Items are sequenced. Do not skip ahead. Each block unlocks the next.

---

## BLOCK 1 — Production stabilization
*Must complete before any university outreach or new module work*

---

### 1.1 Fix Stripe webhook — subscriptions table not writing on production
**Sprint label:** `fix-stripe-webhook`  
**Depends on:** Nothing — this is the current blocker  
**Status:** 🔴 BLOCKING  
**Who:** Claude Code  

**Context:**
- Production URL: https://atelier.realitydb.dev
- Stripe account: Mpingo Systems (acct_1TLxaa6sezd2LSNW)
- Atelier Production webhook: we_1Taqj86sezd2LSNWB1UomNxs
- Webhook secret in Vercel: whsec_mDbMrr9KaEB3F9ZG5f01qeFVsbXJtmGA
- CLI returns 200 to production endpoint ✅
- Real checkout shows payment confirmed page ✅
- subscriptions table remains empty after real checkout ❌
- Webhook shows zero deliveries in Stripe dashboard ❌

**Next diagnostic steps:**
1. Check Vercel Logs → filter `/api/webhook/stripe` → any POST after real checkout?
2. Add `console.log("webhook hit")` at top of `app/api/webhook/stripe/route.ts`
3. Redeploy → test checkout → check Vercel logs for the log line
4. If log line appears but table still empty → Supabase connection issue
5. If log line never appears → webhook not reaching the endpoint

**Definition of done:**
- Complete a test checkout with card `4242 4242 4242 4242`
- Run `SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5` in Supabase
- At least one row appears with correct user_id and status = 'active'

---

### 1.2 Upgrade Supabase to Pro
**Sprint label:** N/A — Eddy action only  
**Depends on:** Nothing  
**Status:** 🔴 URGENT  
**Who:** Eddy  

Supabase Free tier paused the project during active development — it will pause again on launch day if not upgraded.

**Steps:**
1. Go to supabase.com → realitydb-atelier project
2. Settings → Billing → Upgrade to Pro ($25/month)
3. Confirm daily backups are enabled after upgrade

**Definition of done:** Project shows Pro tier, no more pausing risk.

---

### 1.3 Upgrade grader to anchor-based 5-axis ADAI
**Sprint label:** `upgrade-grader-adai`  
**Depends on:** 1.1 (production stable)  
**Status:** 🟡 HIGH PRIORITY  
**Who:** Claude Chat (write anchors + new prompt) → Claude Code (implement)  

**Context:**
Current grader: 3-axis, on-the-fly judgment, temperature 0.
Target: 5-axis anchor-based comparison. The grader compares learner briefing
against three locked anchor briefings rather than judging independently.

**5 axes (ADAI):**
- Pattern detection (0-20)
- Data fidelity (0-20)
- Causal reasoning (0-20)
- Decision quality (0-20)
- Executive communication (0-20)

**Anchors needed for cohort-collapse (Claude Chat writes these):**
- Generic anchor (~40): vague, no numbers, no pattern named
- Competent anchor (~65): names cohort problem, some numbers, one action — NOT YET WRITTEN
- Ideal anchor (~90): existing reference briefing

**Definition of done:**
- Submit generic anchor → score 35-45
- Submit competent anchor → score 60-70
- Submit ideal anchor → score 88-97
- All three pass calibration before going live

---

## BLOCK 2 — Institutional readiness
*Must complete before university pilot conversations begin*

---

### 2.1 Build instructor role and cohort onboarding (Sprint ID-1)
**Sprint label:** `instructor-dashboard-sprint-1`  
**Depends on:** 1.1, 1.2  
**Status:** 🟡 HIGH PRIORITY  
**Who:** Claude Code  
**Spec:** `docs/ATELIER-INSTRUCTOR-DASHBOARD-PRD.md` Sprint ID-1  

**What ships:**
- `institutions`, `cohorts`, `cohort_content`, `cohort_enrollments` tables
- `instructor` role added to profiles
- `/instructor` home (cohort list)
- `/instructor/cohorts/new` (create cohort form)
- `/instructor/cohorts/[id]` (cohort detail)
- Enrollment link and access code generation
- Student enrollment flow

**Definition of done:**
- Eddy can create a cohort at `/instructor/cohorts/new`
- Generate an enrollment link
- Sign in as a test student account, click link, confirm enrolled in cohort
- Student sees assigned content on their dashboard

---

### 2.2 Build progress monitoring and score override (Sprint ID-2)
**Sprint label:** `instructor-dashboard-sprint-2`  
**Depends on:** 2.1  
**Status:** 🟡 HIGH PRIORITY  
**Who:** Claude Code  
**Spec:** `docs/ATELIER-INSTRUCTOR-DASHBOARD-PRD.md` Sprint ID-2  

**What ships:**
- `/instructor/cohorts/[id]/progress` (progress grid)
- `/instructor/submissions/[id]` (four-tab layout)
- Override form and `score_overrides` table
- Progress grid flags (stuck student, score anomaly)

**Definition of done:**
- Progress grid shows all enrolled students with status per content item
- Clicking a cell opens the student submission
- Override form saves to `score_overrides` table
- Overridden score replaces AI score in the grid with ✏️ indicator

---

### 2.3 Build answer keys system (Sprint AK-1 and AK-2)
**Sprint label:** `answer-keys-sprint`  
**Depends on:** 2.2  
**Status:** 🟡 IMPORTANT  
**Who:** Claude Chat (write Path B for cohort-collapse) → Claude Code (build UI)  
**Spec:** `docs/ATELIER-ANSWER-KEYS-PRD.md`  

**What ships:**
- `answer_keys` table with Path A and Path B for cohort-collapse
- `/instructor/answer-keys/[slug]` (two-panel display)
- Answer keys visible in Tab 3 of submission review
- Grader prompt updated with path detection logic

**Definition of done:**
- Instructor sees both solution paths for cohort-collapse in their dashboard
- Path B for cohort-collapse is written and locked
- Grader correctly identifies Path B briefings and does not penalize them

---

### 2.4 Build competency analytics and exports (Sprint ID-3)
**Sprint label:** `instructor-dashboard-sprint-3`  
**Depends on:** 2.2  
**Status:** 🟡 IMPORTANT  
**Who:** Claude Code  
**Spec:** `docs/ATELIER-INSTRUCTOR-DASHBOARD-PRD.md` Sprint ID-3  

**What ships:**
- `/instructor/cohorts/[id]/analytics` (competency heatmap)
- Cohort vs benchmark comparison
- Grade-book CSV export
- Cohort completion report PDF
- `/admin/institutions` management pages

**Definition of done:**
- Competency heatmap renders for a cohort with 5+ submissions
- CSV export opens correctly in Excel
- PDF report generates with correct data
- Admin can create an institution and assign an instructor

---

## BLOCK 3 — University outreach
*Run parallel with Block 2 — outreach does not require the dashboard to be complete*

---

### 3.1 UNC Charlotte — first contact
**Sprint label:** N/A — Eddy action  
**Depends on:** Nothing (outreach starts before dashboard is built)  
**Status:** 🟢 START NOW  
**Who:** Eddy  
**Target:** Belk College of Business — Business Analytics or Data Science faculty  

**Context:**
- Local institution — in-person meeting possible
- AACSB accredited business school
- Strong analytics program

**Action:**
1. Find the right faculty member: search "UNC Charlotte Belk College business analytics faculty"
   or "UNC Charlotte data analytics course" on the university website
2. Send the faculty outreach email from `docs/ATELIER-FACULTY-PILOT-PROGRAM.md` (Part 4)
3. Reference Charlotte connection — you are a local founder
4. Goal: 20-minute demo call scheduled

**Definition of done:** Demo call scheduled or explicit decline received.

---

### 3.2 Queens University of Charlotte — first contact
**Sprint label:** N/A — Eddy action  
**Depends on:** Nothing  
**Status:** 🟢 START NOW  
**Who:** Eddy  
**Target:** McColl School of Business — Finance, Analytics, or MBA faculty  

**Context:**
- Local institution — 10 minutes from Charlotte
- Smaller program — faster decision-making
- MBA program ideal for Atelier's executive briefing format

**Action:**
1. Find the right faculty: McColl School of Business → Faculty directory
2. Target MBA analytics or data-driven decision making courses
3. Send personalized outreach — reference Charlotte proximity, offer in-person demo
4. Goal: in-person meeting or video demo

**Definition of done:** Demo scheduled or explicit decline received.

---

### 3.3 Brandeis University — first contact
**Sprint label:** N/A — Eddy action  
**Depends on:** Nothing  
**Status:** 🟢 START NOW  
**Who:** Eddy  
**Target:** MS Strategic Analytics program — Eddy's alma mater  

**Context:**
- Personal connection — Eddy completed MS Strategic Analytics here
- The MS Strategic Analytics program is the ideal fit for Atelier
- Alumni relationship creates warm entry — reference the program directly
- Faculty may remember Eddy or know colleagues who do

**Action:**
1. Identify current MS Strategic Analytics program director and faculty
2. Send outreach referencing the program and Eddy's graduation
3. Frame Atelier as something Eddy built to address the gap he saw as a student
4. Goal: program director intro or faculty demo call

**Opening line for Brandeis:**
"I completed the MS in Strategic Analytics at Brandeis and spent the years
after building a platform to close the gap I noticed between analytical
skill and business judgment. I would love to show it to you."

**Definition of done:** Demo scheduled with program faculty or director.

---

### 3.4 ECPI University — first contact
**Sprint label:** N/A — Eddy action  
**Depends on:** Nothing  
**Status:** 🟢 START NOW  
**Who:** Eddy  
**Target:** Data Science / Technology faculty — former employer  

**Context:**
- Eddy worked here — warm relationship, bypass cold outreach entirely
- Reach out directly to former colleagues in data science or analytics
- Not AACSB but serves a workforce-ready student population — good fit

**Definition of done:** Demo scheduled with a former colleague.

---

### 3.5 Sign first pilot agreements
**Sprint label:** N/A — Eddy action  
**Depends on:** 3.1-3.4 (outreach) + 2.1 (instructor dashboard foundation)  
**Status:** 🟡 TARGET: November 2026  
**Who:** Eddy  

**Goal:** 3 signed pilot agreements for Spring 2027 courses  
**Template:** `docs/ATELIER-FACULTY-PILOT-PROGRAM.md` Part 1  

**Definition of done:**
- 3 faculty members have signed pilot agreements
- Cohorts created in Atelier for Spring 2027
- Enrollment links ready to share on first day of class

---

## BLOCK 4 — New module development
*Run parallel with Block 3 — module work does not block university outreach*

---

### 4.1 Build GulfStream Insurance module (Cascade Risk)
**Sprint label:** `cascade-risk-module`  
**Depends on:** Nothing (spec is complete)  
**Status:** 🟡 IMPORTANT  
**Who:** Eddy (data generation) → Claude Code (module UI)  
**Spec:** `docs/CASCADE-RISK-MODULE-SPEC.md`  

**Steps:**
1. Author `gulfstream.json` pack JSON following `docs/PACK-AUTHORING-GUIDE.md`
2. Run proprietary generator
3. Run enforcer (inject euphemisms, drift pattern, hallucination trap)
4. Run 15 validation queries from CASCADE-RISK-MODULE-SPEC.md
5. Claude Code builds: `content/companies/gulfstream/exercises.ts`, `rubric.ts`, `citations.ts`
6. Claude Code builds: `/companies/gulfstream/*` app pages
7. Add 6th axis (AI Augmentation) to rubric

**Definition of done:**
- `/companies/gulfstream` loads correctly
- All 10 investigations accessible
- Briefing submits and returns 6-axis score
- Calibration passes: generic ~40, competent ~65, ideal ~90

---

### 4.2 Build Crestview National Bank module (SQL bridge)
**Sprint label:** `crestview-module-sql-bridge`  
**Depends on:** 4.1 (learn from GulfStream build)  
**Status:** 🟡 IMPORTANT  
**Who:** Eddy (data generation) → Claude Code (module UI)  
**Spec:** `docs/CRESTVIEW-PACK-SPEC.md`  

**Steps:**
1. Generate 10-table Crestview dataset using proprietary generator
2. Run enforcer (regime patterns, three-way overlap, Discount Window events)
3. Convert to PostgreSQL INSERT format for SQL bridge (PGlite)
4. Claude Code builds module UI — same pattern as existing modules
5. Note `environment: timeseries` in pack for future DuckDB migration

**Definition of done:**
- `/companies/crestview` loads correctly in SQL Workbench (PGlite bridge)
- All 10 investigations accessible across 5 phases
- Three-layer crisis discoverable through SQL queries
- Briefing submits and returns 5-axis score

---

### 4.3 Write Path B answer keys for all existing modules
**Sprint label:** `answer-keys-content`  
**Depends on:** 2.3 (answer keys system built)  
**Status:** 🟡 IMPORTANT  
**Who:** Claude Chat  

**Modules needing Path B:**
- cohort-collapse (Hot Case) — write in Claude Chat
- novapay — write in Claude Chat
- medcore — write in Claude Chat
- supplylink — write in Claude Chat
- towernet — write in Claude Chat
- clearbank — write in Claude Chat
- oncocare — write in Claude Chat

**Definition of done:**
- Path B documented for all 7 content items
- Each Path B has: investigation sequence, key findings, instructor notes
- Loaded into `answer_keys` table

---

## BLOCK 5 — IES research preparation
*Target: IES Phase IB submission April 2027*

---

### 5.1 Build behavioral telemetry layer
**Sprint label:** `behavioral-telemetry`  
**Depends on:** 2.2 (instructor dashboard), pilot data from Block 3  
**Status:** 🟡 Q1 2027  
**Who:** Claude Code  

**What to capture:**
- Query execution sequence per exercise (which queries, in what order)
- Time spent per exercise
- Hints used (Y/N per exercise)
- Reference answer accessed post-submission (Y/N)
- Hypothesis revisions (once hypothesis capture is built)

**New table:** `investigation_telemetry`

**Definition of done:**
- Every exercise interaction logged with timestamp and user_id
- Instructor dashboard shows time-on-task per student
- Research export endpoint returns anonymized telemetry CSV

---

### 5.2 Build hypothesis capture layer
**Sprint label:** `hypothesis-capture`  
**Depends on:** 5.1  
**Status:** 🟡 Q1 2027  
**Who:** Claude Code  

**What it adds:**
- Before each investigation: "What do you think is causing this pattern?" (dropdown)
- After each investigation: "Did the data change your hypothesis?" (text field)
- Stored in `investigation_telemetry`

**Definition of done:**
- Hypothesis selection appears before Exercise 2 of each module
- Revision prompt appears after Exercise 4
- Data stored and visible in research export

---

### 5.3 Build human vs AI scoring comparison dashboard
**Sprint label:** `scoring-comparison-dashboard`  
**Depends on:** 2.2 (instructor overrides exist), pilot data  
**Status:** 🟡 Q2 2027  
**Who:** Claude Code  

**Route:** `/admin/research/scoring-comparison`

**What it shows:**
- All overridden submissions: AI score vs instructor override score
- Cohen's Kappa coefficient (inter-rater agreement)
- Per-axis agreement breakdown
- This is the IES validation study evidence

**Definition of done:**
- Dashboard renders for at least 20 overridden submissions
- Cohen's Kappa calculated correctly
- Exportable as CSV for IES proposal appendix

---

### 5.4 Write IES Phase IB proposal
**Sprint label:** N/A — Claude Chat  
**Depends on:** 5.1, 5.2, pilot data from Block 3  
**Status:** 🟡 TARGET: March 2027  
**Who:** Claude Chat + Eddy  

**Note:** `docs/IES-SBIR-PHASE-IB-PROPOSAL-2026.md` already exists in `02-atelier`.
Read it in the new chat session before starting this item.

**Definition of done:**
- Complete IES Phase IB proposal ready for submission
- Submitted by April 2027 deadline

---

## BLOCK 6 — Infrastructure expansion
*Q1-Q2 2027 — after pilot data validates the approach*

---

### 6.1 Build Time Series Workbench (DuckDB)
**Sprint label:** `timeseries-workbench`  
**Depends on:** 4.2 (Crestview SQL bridge live), pilot feedback  
**Status:** 🟡 Q1 2027  
**Who:** Claude Code  
**Spec:** `docs/ATELIER-INFRASTRUCTURE-ROADMAP.md`  

**What ships:**
- DuckDB WASM bundle integrated into Next.js build
- `TimeSeriesWorkbench.tsx` component
- Chart panel (line charts for time-series)
- Regime period highlighter (visual bands by rate environment)
- Crestview migrated from PGlite to DuckDB

---

### 6.2 LMS integration (Canvas first)
**Sprint label:** `canvas-lms-integration`  
**Depends on:** 2.4 (instructor dashboard complete)  
**Status:** 🟡 Q2 2027  
**Who:** Claude Code  

**What ships:**
- Canvas LTI integration
- Students launch Atelier from within Canvas course shell
- Grades sync back to Canvas gradebook automatically

---

## Current status summary

```
BLOCK 1 — Production stabilization
  1.1 Fix Stripe webhook          🔴 BLOCKING — fix first
  1.2 Upgrade Supabase Pro        🔴 URGENT — do today
  1.3 Upgrade grader to ADAI      🟡 Next sprint

BLOCK 2 — Institutional readiness
  2.1 Instructor dashboard ID-1   🟡 After 1.1
  2.2 Instructor dashboard ID-2   🟡 After 2.1
  2.3 Answer keys system          🟡 After 2.2
  2.4 Instructor dashboard ID-3   🟡 After 2.2

BLOCK 3 — University outreach
  3.1 UNC Charlotte outreach      🟢 START NOW
  3.2 Queens University outreach  🟢 START NOW
  3.3 Brandeis outreach           🟢 START NOW
  3.4 ECPI outreach               🟢 START NOW
  3.5 Sign pilot agreements       🟡 Target November 2026

BLOCK 4 — New modules
  4.1 Cascade Risk (GulfStream)   🟡 Spec complete, build now
  4.2 Crestview National Bank     🟡 Spec complete, after 4.1
  4.3 Path B answer keys          🟡 After 2.3

BLOCK 5 — IES research
  5.1 Behavioral telemetry        🟡 Q1 2027
  5.2 Hypothesis capture          🟡 Q1 2027
  5.3 Scoring comparison dashboard 🟡 Q2 2027
  5.4 IES Phase IB proposal       🟡 March 2027

BLOCK 6 — Infrastructure
  6.1 Time Series Workbench       🟡 Q1 2027
  6.2 Canvas LMS integration      🟡 Q2 2027
```

---

*Mpingo Systems LLC · Raleigh, NC*  
*ATELIER-TODO-SEQUENCED v1.0 · September 2026*
