# RealityDB Atelier — Product Requirements Document
**Version:** 1.0
**Date:** May 14, 2026
**Author:** Eddy Mkwambe, Mpingo Systems LLC
**Status:** Approved for development

---

## 1. Product Overview

### 1.1 Product Name
RealityDB Atelier

### 1.2 Tagline
The business school that runs on live data.

### 1.3 One-line description
Atelier teaches business acumen by putting students inside a synthetic
company's database — not a case study document.

### 1.4 The core insight
Every business acumen course teaches students to read about companies.
Atelier teaches students to interrogate them.

Students query a live synthetic company database, discover a hidden
business problem through SQL analysis, and write a CEO briefing memo
that proves they understood what they found.

---

## 2. Problem Statement

### 2.1 The gap in business education
Business professionals need to make data-driven decisions but existing
training options fall into two categories:

**Too qualitative:** HBS Online, Wharton, MBA case studies teach
business strategy but use static data exhibits. Students read about
what happened — they never touch the underlying data.

**Too technical:** DataCamp, Coursera teach SQL and Python but without
business context. Students learn syntax — not what to do with the answer.

**The gap:** No platform lets a non-technical business professional
write SQL against a realistic synthetic company and discover a hidden
business story. Atelier fills this gap.

### 2.2 Who is underserved
- Finance managers who can read a P&L but not query the database behind it
- FP&A analysts who know Excel but not SQL cohort analysis
- MBA students who can discuss a case but not interrogate the data
- Startup founders who don't know how to read their own metrics
- L&D teams who need data literacy training beyond dashboards

---

## 3. Target Users

### 3.1 Primary — Corporate L&D buyer
**Who:** Chief Learning Officer, L&D Director, VP Finance at
mid-market to enterprise companies (Series B+, 50-500 employees)

**Pain:** Team makes decisions from dashboards without understanding
what drives the numbers. Expensive mistakes result.

**Buying trigger:** "Our analysts can't explain why the metric moved —
they can only report that it did."

**Budget:** $5,000-$25,000 per cohort, L&D budget, no committee needed

**Sales cycle:** 30-90 days

### 3.2 Secondary — MBA program director
**Who:** Curriculum committee chair, Associate Dean of Analytics,
Finance or Strategy faculty at top-50 business schools

**Pain:** AACSB Digital Agility standards require demonstrable data
literacy. Current tools (Capsim, case studies) don't deliver it.

**Buying trigger:** "We need something that bridges our analytics
course and our strategy course."

**Budget:** $5,000-$15,000 per semester, program operating budget

**Sales cycle:** 6-18 months

### 3.3 Tertiary — Individual professional
**Who:** Analyst, associate, or manager investing in their own skills

**Pain:** Wants to move from "I can read reports" to "I can build the
analysis that drives the report"

**Budget:** $499 per course, personal credit card

**Sales cycle:** Self-serve, same day

---

## 4. Product Goals

### 4.1 Primary goals
1. Deliver a complete NovaPay module (10 exercises + CEO briefing)
   that a finance professional can complete in 4-6 hours
2. Generate a verifiable Business Acumen Certificate upon passing
3. Provide a schema explorer so students understand the database
   before writing SQL
4. Auto-grade SQL correctness + LLM-grade the CEO briefing

### 4.2 Secondary goals
1. Support all six synthetic companies by end of 2026
2. Enable corporate cohort management (invite team members)
3. Provide instructor dashboard showing student progress
4. Enable MBA program licensing with bulk student access

### 4.3 Non-goals (v1)
1. Mobile app — desktop web only for v1
2. Video content — text and SQL only
3. Real-time multiplayer — single student sessions only
4. Natural language query interface — SQL only
5. Light mode — dark theme only

---

## 5. User Journey

### 5.1 Individual learner journey

```
Landing page
  → Read the pitch ("interrogate the company")
  → Click "Start with NovaPay"
  → Sign up / sign in (Supabase Auth)
  → Company intro page
      → Read company context (NovaPay, Series B, retention problem)
      → See database schema overview
      → Begin Exercise 1
  → Exercise flow (repeat x10)
      → Read business question
      → Write SQL in editor
      → Run query against PGlite
      → See results
      → Check answer (after attempt)
      → Mark complete → next exercise
  → CEO Briefing
      → Read prompt (SCQA framework)
      → Write 800-word memo
      → Cite exercises by number
      → Submit for grading
  → Results page
      → Score (pass/fail + percentage)
      → Per-exercise breakdown
      → Briefing feedback (LLM-graded)
      → If pass: Certificate generated
          → Download PDF
          → Copy shareable link
          → Share on LinkedIn
```

### 5.2 Corporate cohort journey

```
Admin signs up
  → Creates cohort ("Q3 Finance Team Training")
  → Invites team members via email
  → Sets deadline
Team members receive invite
  → Complete individual learner journey above
Admin views dashboard
  → See progress per learner
  → See completion rates
  → Download cohort report
  → Renew or expand seats
```

---

## 6. Features — v1 (NovaPay module)

### 6.1 Landing page
- Hero with headline, subhead, CTA
- Six company cards (1 available, 5 coming soon)
- Three value proposition blocks
- No pricing on landing page (go to /pricing)

### 6.2 Authentication
- Supabase Auth (email + password)
- Google OAuth (optional for v1)
- Required before starting any module
- Free tier: Module 1 only
- Paid tier: All modules

### 6.3 Company intro page (/companies/novapay)
- Company overview (name, stage, ARR, growth)
- Student role assignment ("You are VP of Growth")
- Mission statement ("Find the retention problem")
- Database overview (13 tables, 50K rows)
- Exercise list with progress indicators
- "Start Module" CTA

### 6.4 Exercise environment (/companies/novapay/exercise/[n])
**Left panel (40%):**
- Exercise number and title
- Business question (bold)
- Skills required (tags)
- Description (2-3 paragraphs)
- Hint toggle (hidden by default)
- Reference answer (hidden until submitted)

**Right panel (60%):**
- SQL editor (CodeMirror or simple textarea v1)
- Run Query button
- Results table (sortable, paginated)
- Tab: Schema explorer
- Tab: Query history

**Bottom bar:**
- Exercise progress (X of 10)
- Previous / Next navigation
- "Go to CEO Briefing" (enabled after exercise 10)

### 6.5 Schema explorer
- Lists all 13 NovaPay tables
- Per table: column names, data types, nullable
- FK relationships shown with arrows
- Expand to see 3 sample rows
- Search/filter columns

### 6.6 CEO Briefing (/companies/novapay/briefing)
- Full-page writing environment
- SCQA framework guide (collapsible)
- Large textarea (min-height 500px)
- Live word count (target 600-800)
- Exercise citation checklist (1-10)
- Submit button
- Rubric preview (collapsed by default)

### 6.7 Results page (/companies/novapay/results)
- Pass/Fail banner
- Overall score (0-100)
- Per-exercise SQL scores
- CEO Briefing feedback (LLM-generated)
- Certificate section (if pass):
  - Certificate ID (RDB-CERT-...)
  - Download PDF button
  - Copy shareable link
  - LinkedIn share button
- "Retry" button (after 24h cooldown if fail)

### 6.8 Certificate
- Format: RDB-BIZ-[timestamp-base36]-[random-8-hex]
- Distinct from SQL certs (RDB-CERT-...)
- Fields: name, company completed, score, date, signature
- Public verification at atelier.realitydb.dev/verify/[cert-id]
- SHA-256 signed (Ed25519 Phase 2)
- PDF via window.print()
- LinkedIn share URL pre-built

### 6.9 Pricing page (/pricing)
| Tier | Price | Access |
|---|---|---|
| Module | $499 | One company, lifetime |
| All-Access | $1,499 | All six companies |
| Team (10 seats) | $9,999 | One company, 1 year |
| MBA License | $14,999/semester | All companies, unlimited students |

### 6.10 Verification page (/verify/[cert-id])
- Public, no auth required
- Shows: name, company, score, date, valid/invalid
- Employer-friendly design

---

## 7. Content Requirements

### 7.1 NovaPay dataset
- Generated by RealityDB CLI from novapay.json pack
- 13 tables, 50K rows
- Served as static SQL file: public/data/novapay-5k.sql (v1)
- Loaded into PGlite on module start

### 7.2 NovaPay module content
- 10 exercises with reference SQL
- CEO briefing prompt (SCQA framework)
- Grading rubric (pass/borderline/fail criteria)
- Company context paragraph (2-3 sentences per company)
- Already written at:
  C:\Users\HP\Documents\atelier\src\content\companies\novapay\module.md

### 7.3 Grading
**SQL grading (auto):**
- Execute student SQL against PGlite
- Compare output structure to reference answer
- Score: correct columns present, correct row count range,
  no error thrown

**CEO Briefing grading (LLM):**
- Send briefing + rubric to Claude API
- Structured JSON response with scores per rubric axis
- Axes: segmentation, causal reasoning, quantification,
  recommendation quality, epistemic honesty
- Model: claude-sonnet-4-6

---

## 8. Design Requirements

### 8.1 Design language
- Dark theme only. No light mode.
- Professional, clinical, serious — like a trading terminal
  meets a business school
- No gradients, no illustrations, no stock photos
- Typography: monospace for all SQL and data,
  sans-serif for prose

### 8.2 Color system
| Token | Value | Usage |
|---|---|---|
| brand | #06d6a0 | CTAs, success states, active indicators |
| navy | #0a0f1a | Page background |
| surface | #111827 | Card backgrounds |
| surface-2 | #1a2235 | Nested surfaces, inputs |
| border | #1e293b | All borders |
| muted | #64748b | Secondary text, placeholders |
| text | #e2e8f0 | Primary text |
| danger | #ef4444 | Errors, fail states |
| warning | #f59e0b | Warnings |

### 8.3 Component library
- shadcn/ui (dark theme, customized to color system above)
- Tailwind CSS for layout and spacing
- No other UI library

### 8.4 Typography
- Headings: Inter or system-ui, weight 500-600
- Body: Inter or system-ui, weight 400
- Code/SQL: JetBrains Mono or Fira Code, weight 400
- Data tables: monospace, 13px

### 8.5 Layout
- Max content width: 1280px
- Exercise environment: full viewport height (no scroll on outer)
- Left/right panels: resizable (v2) — fixed 40/60 split (v1)
- Mobile: not supported in v1

---

## 9. Success Metrics

### 9.1 v1 launch metrics (first 90 days)
- 100 registered users
- 20 completed NovaPay modules
- 10 certificates issued
- 3 paying customers (individual or cohort)
- NPS > 50 from completers

### 9.2 Engagement metrics
- Exercise completion rate per exercise (target >70%)
- CEO Briefing submission rate (target >50% of exercise completers)
- Certificate pass rate (target >60%)
- Return visit rate (target >40%)

### 9.3 Revenue metrics (90 days)
- Target: $5,000-$15,000 MRR
- First corporate cohort: $9,999
- First 10 individual purchases: $4,990

---

## 10. Constraints and Assumptions

### 10.1 Technical constraints
- PGlite runs in browser — max practical dataset: 50K rows
- No server-side SQL execution in v1
- CEO Briefing grading requires Anthropic API (billing cap lifts June 1)
- Cloudflare Pages deployment (static export from Next.js)

### 10.2 Assumptions
- Students have basic SQL knowledge (SELECT, WHERE, GROUP BY)
- Students use desktop browsers (Chrome, Firefox, Safari)
- Corporate buyers have L&D budget approval for <$10K
- MBA programs require 6-month lead time for curriculum adoption

### 10.3 Dependencies
- RealityDB CLI — generates novapay-5k.sql dataset
- Supabase — auth, certificate storage, progress tracking
- Anthropic API — CEO Briefing grading
- Cloudflare Pages — deployment
- Neon (via SimLab) — optional live database mode (v2)

---

## 11. Roadmap

### v1 — NovaPay (this sprint)
- Landing page
- Auth (Supabase)
- NovaPay module (10 exercises + briefing)
- PGlite in-browser SQL
- Schema explorer
- CEO Briefing submission
- LLM grading
- Certificate generation
- Verification page

### v2 — Platform (next month)
- MedCore module
- Cohort management (invite team)
- Instructor dashboard
- Resizable panels
- Live SimLab mode (Neon PostgreSQL)
- Stripe payments

### v3 — Scale (Q3 2026)
- All six companies
- MBA license portal
- API for LMS integration
- Mobile-responsive (not native app)
- Custom company modules (enterprise)

---

*RealityDB Atelier PRD v1.0*
*Mpingo Systems LLC · Charlotte, NC*
*The business school that runs on live data.*
