# RealityDB Atelier
## The business school that runs on live data.

> "Don't read about the business. Interrogate it."

---

## What is Atelier?

RealityDB Atelier is a business education platform where professionals
learn to make strategic decisions by querying live synthetic company data.

Unlike MBA case studies where students read about business problems,
Atelier students discover problems themselves by querying a company
database. They find the churn crisis. They write the CEO briefing.
They learn business acumen through experience -- not lecture.

---

## The Six Companies

| Company | Domain | Hidden Story |
|---|---|---|
| NovaPay | FinTech SaaS | Enterprise churn driven by missing multi-currency |
| MedCore Health | Healthcare | Claims rising but outcomes declining |
| SupplyLink | Logistics | One supplier causing 40% of delays |
| TowerNet | Telecom | Churn spike concentrated in one region |
| ClearBank | AML/Banking | Suspicious wire patterns across three accounts |
| OncoCare | Oncology | Clinical trial cohort underperforming |

Each company is a RealityDB-generated dataset with a hidden business
story baked into the distributions. Students discover the story
through SQL queries -- not by reading it in a case document.

---

## The Five-Layer Model

  Layer 1 -- Raw transactions     (database rows)
  Layer 2 -- SQL aggregations     (GROUP BY, JOIN, window functions)
  Layer 3 -- Business metrics     (MRR, churn rate, LTV, NRR)
  Layer 4 -- Financial statements (P&L, balance sheet, cash flow)
  Layer 5 -- Executive decisions  (pricing, hiring, fundraising)

Every module starts at Layer 1 and ends at Layer 5.
Students build the insight themselves from the ground up.

---

## The Deliverable

Every company module ends with a CEO Briefing memo.

Students write 800 words using the McKinsey SCQA framework:
  Situation    -- what is true right now
  Complication -- what has changed or is at risk
  Question     -- the decision that needs to be made
  Answer       -- recommendation with supporting evidence

Briefings are graded on four axes:
  1. SQL correctness     (auto-graded)
  2. Diagnostic depth    (LLM-graded against rubric)
  3. Decision quality    (LLM-graded against rubric)
  4. Communication       (LLM-graded, lighter rubric)

---

## Pricing

| Tier | Price | What |
|---|---|---|
| Self-paced single course | $499 | One company, full module |
| All-access | $1,499 | All six companies |
| Corporate cohort 10 seats | $9,999 | Team training |
| MBA semester license | $14,999 | Program-wide access |
| Business Acumen Certificate | Included | Ed25519 signed, verifiable |

---

## Competitive Position

| | HBS Online | DataCamp | Atelier |
|---|---|---|---|
| Data interactivity | Low (static exhibits) | High (syntax tasks) | Very high (live company) |
| Business context | High (real stories) | Low (technical tasks) | High (synthetic entities) |
| Discovery | Pre-told | Not applicable | Student discovers |
| Price | $1,850/course | $300/year | $499/course |
| Outcome | Credential/prestige | Technical skill | Strategic acumen |

---

## Technology Stack

Built on the RealityDB platform:
  RealityDB engine -- generates production-realistic datasets
  SimLab          -- disposable Neon PostgreSQL databases
  PGlite          -- in-browser SQL execution
  Ed25519 signing -- cryptographic certificate verification

---

## Repository Structure

  atelier/
    src/
      content/
        companies/
          novapay/    -- Module 1 (built)
          medcore/    -- Module 2 (planned)
          supplylink/ -- Module 3 (planned)
          towernet/   -- Module 4 (planned)
          clearbank/  -- Module 5 (planned)
          oconocare/  -- Module 6 (planned)
      components/     -- React components
      data/           -- Question banks, rubrics
      utils/          -- Certificate generation, grading
      services/       -- Supabase, AI grading
      db/
        migrations/   -- Schema migrations
    public/
      data/           -- Pre-generated SQL datasets
    docs/
      research/       -- Market research and design docs
      companies/      -- Company design documents
      curriculum/     -- Curriculum framework

---

## Status

| Asset | Status |
|---|---|
| NovaPay pack JSON (13 tables) | Ready to generate |
| NovaPay module (10 exercises + CEO briefing) | Written |
| Platform scaffold | Sprint ready |
| Grading rubric | Written |
| Certificate infrastructure | Reuse from Certify |

---

## Built by Mpingo Systems LLC
Precision tools built to stay.
Charlotte, NC -- atelier.realitydb.dev
