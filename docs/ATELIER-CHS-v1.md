# Atelier — Comprehensive Handover Summary (CHS) v1
**Date:** September 24, 2026  
**Prepared by:** Claude Chat (this session)  
**Supersedes:** docs/ATELIER-CHS-v0.md (June 15, 2026)  
**For:** Any new Claude Chat session continuing Atelier work  
**Project:** Atelier by Mpingo Systems LLC  
**Live URL:** https://atelier.realitydb.dev

---

## 1. What Atelier is (locked — do not reopen)

**Atelier is a Decision Intelligence Measurement System.**

Not a learning platform. Not a SQL course. Not DataCamp with business cases.

The one-sentence definition:
> Atelier measures and develops business judgment through structured
> investigation of realistic synthetic company data.

The locked copy that governs all marketing:
> "Atelier is not a SQL course. It assumes you can query. It teaches you
> what to look for. However, by continuously interacting with realistic schemas,
> relationships, operational data environments, and revealed solutions, users
> naturally strengthen, refine, and modernize their SQL thinking and
> practical query skills over time."

**Read before writing any copy:**
- `docs/ATELIER-PRODUCT-PHILOSOPHY.md`
- `docs/ATELIER-CURRICULUM-FRAMEWORK.md`
- `docs/ATELIER-REFRAME-FROM-EXERCISES-TO-INVESTIGATIONS.md`

---

## 2. Current production state

**Live at:** https://atelier.realitydb.dev  
**Platform:** Vercel (eddy-mkwambes-projects/realitydb-atelier)  
**Repo:** github.com/emkwambe/realitydb-atelier — branch: master  
**Database:** Supabase (realitydb-atelier project)  
**Stack:** Next.js 16.2.6, Supabase, TypeScript, Tailwind, Stripe, Anthropic API, PGlite

**What is working:**
- Six modules: NovaPay, MedCore, SupplyLink, TowerNet, ClearBank, OncoCare
- Hot Cases pipeline: The Cohort Collapse live and published
- Auth: password, magic link (Resend SMTP via noreply@realitydb.dev)
- Payments: Stripe checkout, payment confirmed page
- Waitlist: /waitlist live, 2 subscribers, /admin/waitlist with CSV export
- Legal: /legal/privacy and /legal/terms
- Admin: /admin/hot-cases, /admin/waitlist, publish/unpublish Hot Cases
- Credentials: Ed25519 signed, publicly verifiable at /verify/[certId]

**What is broken:**
- Stripe webhook: subscriptions table not writing on production after real checkout
  - CLI trigger returns 200 ✅
  - Real checkout shows payment confirmed page ✅
  - subscriptions table remains empty ❌
  - This is the current #1 blocker

**Accounts and locations:**
- Stripe: dashboard.stripe.com — Mpingo Systems (acct_1TLxaa6sezd2LSNW)
- Supabase: supabase.com — realitydb-atelier project (upgrade to Pro — Free tier pauses)
- Vercel: vercel.com — eddy-mkwambes-projects/realitydb-atelier
- GitHub: github.com/emkwambe/realitydb-atelier
- Resend: resend.com — realitydb.dev domain verified
- Admin email: emkwambe1@gmail.com (role = admin in profiles table)

---

## 3. The six competency dimensions (locked — final)

1. **Financial Intelligence** — reading financial signals before they appear in reports
2. **Operational Intelligence** — finding efficiency/quality losses in process data
3. **Strategic Intelligence** — identifying competitive dynamics from internal data
4. **Decision Intelligence** — translating analysis into defensible recommendations
5. **Communication Intelligence** — making the right argument to the right audience
6. **Augmented Intelligence** — using data systems as extensions of judgment

**Full definitions:** `docs/ATELIER-CURRICULUM-FRAMEWORK.md`

---

## 4. The investigation framework (locked)

Every module has 5 phases, 10 investigations, 1 CEO Briefing:

1. Situation Awareness
2. Problem Identification
3. Root Cause Analysis
4. Strategic Evaluation
5. Executive Communication

**The auxiliary layer principle (critical):**
Current exercise questions, SQL tags, difficulty indicators, and hints
are NOT removed. They are repositioned as supporting infrastructure
subordinate to the executive investigation framing. Learner sees business
problem first, analytical direction second, technical scaffolding third.

**Full spec:** `docs/ATELIER-REFRAME-FROM-EXERCISES-TO-INVESTIGATIONS.md`

---

## 5. The grader — current state and needed upgrade

**Current (3-axis, needs upgrade):**
- Pattern detection (0-33)
- Quantification (0-33)
- Recommendation specificity (0-34)
- LLM-as-judge, temperature 0
- Calibrated: generic 59/100, ideal 94/100 (cohort-collapse)

**Target (5-axis ADAI — Atelier Data Acumen Instrument):**
- Pattern detection (0-20)
- Data fidelity (0-20)
- Causal reasoning (0-20)
- Decision quality (0-20)
- Executive communication (0-20)

**Target calibration:** generic ~40, competent ~65, ideal ~90

**The anchor-based approach (critical architectural change):**
Replace on-the-fly judgment with three locked anchor briefings per content item.
Grader compares learner briefing against anchors rather than judging independently.
This produces consistent, reproducible, defensible scores.

**Competent anchor for cohort-collapse NOT YET WRITTEN** — needed before upgrade.

---

## 6. The synthetic company catalog

### Live (6 modules)
| Company | Dimension | Crisis |
|---|---|---|
| NovaPay | Financial Intelligence | Cohort retention decay masked by MRR growth |
| MedCore Health | Healthcare Systems Intelligence | TBD — confirm from existing module |
| SupplyLink Operations | Operational Intelligence | One supplier causing 40% of delays |
| TowerNet Communications | Strategic Intelligence | Regional churn spike in aggregate data |
| ClearBank Financial | Decision Intelligence | AML suspicious wire pattern |
| OncoCare Therapeutics | Clinical Intelligence | SITE-07 under-dosing patients |

### Specified (2 modules — ready to build)
| Company | Dimension | Key spec |
|---|---|---|
| GulfStream Insurance | AI-Augmented Intelligence | `docs/CASCADE-RISK-MODULE-SPEC.md` |
| Crestview National Bank | Financial Intelligence (Treasury) | `docs/CRESTVIEW-PACK-SPEC.md` |

**Full catalog:** `docs/ATELIER-SYNTHETIC-COMPANY-CATALOG.md`  
**Pack authoring rules:** `docs/PACK-AUTHORING-GUIDE.md`  
**Pack spec location (realitydb-internal):** `01-cli-engine/`

---

## 7. The infrastructure roadmap

Four investigation environments (not four separate products):

| Environment | Tool | Status | First module |
|---|---|---|---|
| SQL Workbench | PGlite (PostgreSQL) | ✅ Live | NovaPay |
| Time Series Workbench | DuckDB WASM | 🔬 Q1 2027 | Crestview |
| Document Intelligence | Claude API | 💡 Q2 2027 | Meridian Law |
| Graph Workbench | Cytoscape.js | 💡 Q4 2027 | ClearBank migration |

The framework (5 phases, 6 dimensions, ADAI, CEO Briefing, credential) stays constant across all environments. Only the analytical tool changes.

**Full spec:** `docs/ATELIER-INFRASTRUCTURE-ROADMAP.md`

---

## 8. Institutional features built (PRDs complete)

### Instructor Dashboard
Three-sprint build. Five capabilities:
1. Cohort onboarding (enrollment links, access codes)
2. Progress monitoring (progress grid, stuck-student flags)
3. Score review and instructor override (with audit trail)
4. Competency analytics (heatmap, benchmark comparison)
5. Learning outcomes export (grade-book CSV, PDF report)

**New tables needed:** `institutions`, `cohorts`, `cohort_content`, `cohort_enrollments`, `score_overrides`  
**Full spec:** `docs/ATELIER-INSTRUCTOR-DASHBOARD-PRD.md`

### Answer Keys System
Two solution paths per content item:
- Path A: canonical investigation sequence
- Path B: alternate legitimate route to the same finding
- Instructor override with documented justification
- Immutable audit log

**New tables needed:** `answer_keys`, `score_overrides`  
**Full spec:** `docs/ATELIER-ANSWER-KEYS-PRD.md`

---

## 9. University GTM

### The three-layer buyer model
1. Faculty Champion (entry point — pilot program)
2. Department Champion (AACSB AoL hook — institutional license)
3. Procurement (finishing move — stays under no-bid threshold)

### First three targets (start now)
| Institution | Connection | Contact strategy |
|---|---|---|
| UNC Charlotte | Local — in-person possible | Belk College of Business, analytics faculty |
| Queens University of Charlotte | Local — 10 minutes away | McColl School of Business, MBA analytics |
| Brandeis University | Eddy's alma mater (MS Strategic Analytics) | Program director, reference graduation |
| ECPI University | Former employer | Former colleagues, direct outreach |

### The AACSB hook (most powerful institutional message)
68% of AACSB-accredited schools are cited for AoL deficiencies.
Atelier produces AoL evidence automatically — competency scores, heatmap,
benchmark comparison, formatted report — ready for accreditation documentation
without additional rubric-building or data collection.

### Pilot program (ready to use)
- Pilot agreement template
- 3-email faculty onboarding sequence
- Outcomes report template for curriculum committee
- Faculty outreach email template

**Full package:** `docs/ATELIER-FACULTY-PILOT-PROGRAM.md`  
**Full GTM playbook:** `docs/ATELIER-UNIVERSITY-GTM-PLAYBOOK.md`

### Pricing for universities
| Tier | Price | Approval path |
|---|---|---|
| Faculty pilot | $0 | Pilot agreement only |
| Semester license | $4,999 | Department chair (under no-bid threshold) |
| Annual license | $14,999 | Department or dean |
| Program license | $29,999/year | Dean |

---

## 10. The IES SBIR pathway

**Target:** IES Phase IB submission, April 2027  
**Grant amount:** $250,000  
**The novel component:** The ADAI — automated competency measurement instrument
validated across multiple investigation environments

**IES positioning:**
> "A domain-agnostic decision intelligence measurement system that develops and
> measures business judgment across multiple analytical environments while
> maintaining a consistent competency framework and validated assessment
> instrument across all domains."

**What the proposal needs (not yet built):**
- Behavioral telemetry (query trails, time-on-task, hypothesis revision)
- Human vs AI scoring comparison data (from instructor overrides)
- University pilot cohort data (from Block 3 outreach)
- Published competency framework (the ADAI formally documented)

**Existing proposal draft:** `02-atelier/IES-SBIR-PHASE-IB-PROPOSAL-2026.md`

---

## 11. The trio workflow

**Claude Chat (this role):**
- Strategy, positioning, product decisions
- Sprint prompt authoring
- Document creation (PRDs, specs, canons, playbooks)
- Debugging diagnosis
- Content authoring (Hot Cases, grader prompts, copy)

**Eddy:**
- Runs PowerShell commands (Windows, absolute paths always)
- Runs SQL in Supabase SQL Editor
- Verifies in browser
- Makes product decisions
- Manages Stripe, Supabase, Vercel, GitHub dashboards
- Sends outreach emails

**Claude Code (CC):**
- Executes sprint prompts
- Writes and edits files
- Commits to branch
- Reports what shipped with file paths
- Does NOT make product decisions
- Does NOT deviate from sprint spec

**PowerShell conventions:**
- Always use absolute paths — never `cd` + relative path
- `[System.IO.File]::WriteAllText()` for all file writes
- BOM-free UTF-8
- Do not run `pnpm add` or `pnpm remove` without explicit instruction

---

## 12. Files to share with new Claude Chat (priority order)

**Must share (Priority 1):**
1. `docs/ATELIER-CHS-v1.md` — this document
2. `docs/ATELIER-PRODUCT-PHILOSOPHY.md`
3. `docs/ATELIER-CURRICULUM-FRAMEWORK.md`
4. `docs/ATELIER-INFRASTRUCTURE-ROADMAP.md`
5. `docs/ATELIER-TODO-SEQUENCED.md`

**Share for specific work:**
6. `docs/CASCADE-RISK-MODULE-SPEC.md` — for GulfStream module build
7. `docs/CRESTVIEW-PACK-SPEC.md` — for Crestview module build
8. `docs/ATELIER-INSTRUCTOR-DASHBOARD-PRD.md` — for dashboard sprint
9. `docs/ATELIER-ANSWER-KEYS-PRD.md` — for answer keys sprint
10. `docs/ATELIER-FACULTY-PILOT-PROGRAM.md` — for university outreach
11. `docs/ATELIER-UNIVERSITY-GTM-PLAYBOOK.md` — for GTM conversations
12. `docs/PACK-AUTHORING-GUIDE.md` — for new company pack authoring
13. `docs/HOT-CASE-AUTHORING-CANON.md` — for new Hot Case authoring

---

## 13. Key decisions locked (do not reopen)

1. Atelier is a Decision Intelligence Measurement System — not a learning platform
2. Six dimensions are final — names and definitions locked
3. Auxiliary layer principle — exercise language stays, repositioned as supporting infrastructure
4. Anchor-based grading — three anchors per content item, grader compares not judges
5. Two solution paths per content item — Path A canonical, Path B alternate
6. Hot Cases drop every Monday 8am EST
7. Pricing: $4,999 semester, $14,999 annual — stays under no-bid threshold
8. No pricing on waitlist page — pricing belongs on /pricing after product demo
9. DuckDB WASM for Time Series Workbench
10. Four investigation environments — one framework across all
11. IES Phase IB target: April 2027
12. First pilot targets: UNC Charlotte, Queens University, Brandeis, ECPI
13. Admin email: emkwambe1@gmail.com
14. Contact: atelier@realitydb.dev
15. Address: Raleigh, NC (registered agent)

---

## 14. What this session built (September 24, 2026)

**New documents committed to master:**
- `docs/ATELIER-INFRASTRUCTURE-ROADMAP.md` — four-workbench architecture
- `docs/ATELIER-SYNTHETIC-COMPANY-CATALOG.md` — 13 companies cataloged
- `docs/CASCADE-RISK-MODULE-SPEC.md` — GulfStream Insurance, Module 07
- `docs/CRESTVIEW-PACK-SPEC.md` — Crestview National Bank, Module 08
- `docs/PACK-AUTHORING-GUIDE.md` — recovered from previous session
- `docs/ATELIER-ANSWER-KEYS-PRD.md` — two solution paths, override system
- `docs/ATELIER-INSTRUCTOR-DASHBOARD-PRD.md` — five capabilities, three sprints
- `docs/ATELIER-FACULTY-PILOT-PROGRAM.md` — agreement, onboarding, outcomes report
- `docs/ATELIER-UNIVERSITY-GTM-PLAYBOOK.md` — research-backed, Capsim/Forage/AACSB
- `docs/ATELIER-TODO-SEQUENCED.md` — six-block sequenced to-do list
- `docs/ATELIER-CHS-v1.md` — this document

**Organized in realitydb-internal:**
- `02-atelier/` — 20 Atelier documents, clean
- `01-cli-engine/` — all pack specs consolidated

---

## 15. Opening message for new Claude Chat

Copy this exactly when starting a new session:

> "I am continuing work on Atelier by Mpingo Systems LLC.
> Please read docs/ATELIER-CHS-v1.md — it is the comprehensive handover
> summary from the previous session. The immediate priorities are:
> (1) Fix the Stripe webhook — subscriptions table not writing on production,
> (2) Build the instructor dashboard (Sprint ID-1),
> (3) Send outreach emails to UNC Charlotte, Queens University, and Brandeis.
> I will also share docs/ATELIER-TODO-SEQUENCED.md and
> docs/ATELIER-PRODUCT-PHILOSOPHY.md."

---

*Mpingo Systems LLC · Raleigh, NC*  
*ATELIER-CHS-v1 · September 24, 2026*  
*Supersedes ATELIER-CHS-v0 (June 15, 2026)*
