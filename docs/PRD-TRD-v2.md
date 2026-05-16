# RealityDB Atelier PRD and TRD v2.0
**Version:** 2.0
**Date:** May 15, 2026
**Author:** Eddy Mkwambe, Mpingo Systems LLC

---

## The v2 Insight

v1: Students query a synthetic company and discover a hidden story.
v2: Students query a synthetic company, intervene on it, compare
    baseline vs intervention, and prove their hypothesis.

This is not about differentiating students from each other.
It shifts pedagogy from memorization to problem-solving.

    Memorization:    student reads -> identifies pre-written insight
    Problem-solving: student queries baseline -> forms hypothesis
                     -> injects scenario -> queries outcome
                     -> compares before/after -> proves or disproves
                     -> briefs CEO with evidence from both states

The original state is always preserved.
Every intervention is a branch.
The student cannot memorize the answer. They must derive it.

---

# PART 1 -- PRODUCT REQUIREMENTS

## 1. Product Vision

RealityDB Atelier is the only business education platform where the
dataset responds to student decisions. Students diagnose a baseline,
inject an intervention, compare before and after, and brief the CEO
on what they found AND what they tested.

    Tagline:     The business school that runs on live data.
    Sub-tagline: Don't read about the business. Interrogate it.

---

## 2. The Scenario System

### 2.1 Three Dataset States

    [company]-baseline.sql     Problem exists. Undiscovered. Original truth.
    [company]-scenario-a.sql   Fix applied. What if we solve it?
    [company]-scenario-b.sql   Alternative path. What if we changed strategy?

Baseline is never modified. Scenarios are always branches.

### 2.2 Scenario Categories

CATEGORY A -- Instructor-Set (before cohort begins)

  A1: Hidden Story Variants (anti-memorization)
      Same surface symptoms, different root causes.
      NovaPay variants:
        A1a: Enterprise churn from missing multi-currency (default)
        A1b: Enterprise churn from broken API documentation
        A1c: Enterprise churn from pricing above market rate
        A1d: Enterprise churn from support SLA breach
        A1e: Enterprise churn from missing key integration

  A2: Difficulty Levels
      Introductory: currency tickets 80% of churned enterprise
      Standard:     currency tickets 64% (default)
      Advanced:     currency tickets 45% multi-variable required
      Expert:       no category tags -- must read ticket text

  A3: Time Pressure Variants
      Pre-fundraise:  Series B closes in 30 days
      Post-spike:     Three enterprise customers churned this week
      Competitive:    Stripe launching competing product in 60 days
      Acquisition:    PE firm doing due diligence right now

  A4: Data Quality Challenges
      Missing data:  30% of tickets have NULL category
      Duplicates:    5% of customers appear twice
      Outliers:      3 whale customers skew all averages
      Schema drift:  two tables have column name inconsistencies

CATEGORY B -- Student-Controlled (after diagnosis)

  B1: Fix Scenarios
      B1a: Ship multi-currency Q3 -- enterprise churn 3.2% -> 1.1%
      B1b: Hire 5 support engineers -- resolution 14d -> 2d
      B1c: Launch enterprise SLA -- churn drops 40%
      B1d: Reduce enterprise price 20% -- churn drops, MRR drops
      B1e: Automate SMB onboarding -- LTV improves

  B2: Escalation Scenarios
      B2a: Do nothing 6 months -- churn compounds to 5.8%
      B2b: Lose top 3 enterprise -- ARR drops 
      B2c: Competitor launches multi-currency -- churn to 6%
      B2d: Support burns out -- churn spreads to mid-market

  B3: Pivot Scenarios
      B3a: Enterprise-only pivot
      B3b: SMB-only pivot
      B3c: Usage-based pricing
      B3d: Exit EMEA geographic focus

  B4: Temporal Scenarios
      B4a: Multi-currency shipped 6 months earlier
      B4b: Churn detected month 3 not month 9
      B4c: Series B delayed 6 months -- cash runway

### 2.3 Learning Loop v2

    Phase 1 -- Diagnose (baseline)
      Query baseline, complete exercises 1-10
      Identify the hidden problem

    Phase 2 -- Intervene (scenario)
      Select fix or escalation scenario
      Query scenario dataset
      Compare to baseline, quantify impact

    Phase 3 -- Brief (v2 CEO briefing)
      What I found (diagnosis)
      What I tested (intervention)
      What the data shows (outcome)
      What I recommend (decision)
      What I don't yet know (epistemic honesty)

---

## 3. Grading Rubric v2 -- Five Axes

Previous: 4 axes x 25 points = 100
v2:       5 axes x 20 points = 100

  Axis 1: segmentation (20 pts)
    Pass: segments churn by tier not just blended
    Fail: reports only aggregate metrics

  Axis 2: causal_reasoning (20 pts)
    Pass: links currency tickets to churn with percentage
    Fail: describes correlation without causation

  Axis 3: quantification (20 pts)
    Pass: quantifies ARR at risk over 12 months with number
    Fail: vague terms like significant revenue at risk

  Axis 4: recommendation (20 pts)
    Pass: multi-currency with cost and payback period
    Fail: generic recommendation without financial justification

  Axis 5: epistemic_honesty (20 pts) NEW
    Pass: names specific unknown and how to resolve it
    Fail: presents findings as certain without limits
    Note: separates useful analyst from confident wrong one

---

## 4. Dataset Scale Strategy

  Free -- PGlite in-browser
    novapay-5k-baseline.sql     5K rows, 15 second load
    novapay-5k-scenario-a.sql   5K fix scenario
    novapay-5k-scenario-b.sql   5K pivot scenario

  Paid -- SimLab Neon cloud
    novapay-50k-baseline.sql    50K rows, disposable PostgreSQL
    Full scenario branching via SimLab API
    Real statistical patterns at scale

  Upgrade path:
    Free: 5K in-browser, 2 scenarios, exercises 1-10
    Paid: 50K in cloud, all scenarios, full certification

---

## 5. Citations as Visible Moat

Every table in schema explorer shows distribution sources.
Nobody else ships synthetic data with citation trails.

  customers.segment: SMB 70% / Mid-market 25% / Enterprise 5%
    Source: Pacific Crest 2024 SaaS Survey

  subscriptions.churn: blended 1.4% monthly
    Source: ChurnZero 2024 SaaS Churn Benchmark Report

  support_tickets.currency_support: 14% of all tickets
    Source: Stripe Atlas B2B SaaS Benchmark 2024

  payments.failure_code: card declined 3%, insufficient funds 2%
    Source: Stripe Radar Fraud Report 2024

---

## 6. Product Roadmap

  v1:   NovaPay baseline (built)
  v1.5: Scenario Branching (this sprint)
  v2:   CLI commands + instructor dashboard + MedCore + Stripe
  v3:   All 6 companies + difficulty levels + hypothesis testing

---

# PART 2 -- TECHNICAL REQUIREMENTS

## 7. New CLI Commands

  C1: realitydb atelier enforce
      Enforces hidden story correlations post-generation
      Usage: --baseline x.sql --pack x.json --output y.sql

  C2: realitydb atelier branch
      Creates scenario branch from baseline
      Usage: --baseline x.sql --scenario name --pack x.json --output y.sql

  C3: realitydb atelier compare
      Statistical comparison between two states
      Usage: --baseline x.sql --scenario y.sql --output report.json

  C4: realitydb atelier diff
      Human-readable summary of changes
      Output: enterprise churn 3.2% -> 1.1%, ARR .1M -> .7M

  C5: realitydb atelier variant
      Generates hidden-story variant for anti-memorization
      Usage: --pack x.json --variant name --rows 5000 --output y.sql

  C6: realitydb atelier difficulty
      Adjusts signal clarity for difficulty level
      Expert: removes category tags, student reads message_body

---

## 8. enforce-novapay-story.ps1 Specification

Path: C:\Users\HP\Documents\atelier\scripts\enforce-novapay-story.ps1
Run after every realitydb run command.

  T1: Remove NOT NULL from failure_code
  T2: Fix temporal ordering -- signed_at <= created_at
  T3: Enforce enterprise MRR -, SMB -
  T4: Enforce enterprise churn rising arc
      18-12 months ago: low cancellation density
      12-6 months ago:  medium cancellation density
      6-0 months ago:   high cancellation density
  T5: Enforce currency ticket correlation -- THE SMOKING GUN
      64% of churned enterprise: category = currency_support or fx_reconciliation
      Active enterprise: only 4% have currency tickets
  T6: Enforce board_metrics values
      blended_churn_rate: 0.014
      enterprise_churn_rate: 0.032
      smb_churn_rate: 0.009
      nrr_enterprise: 0.85
      nrr_smb: 1.10

---

## 9. Scenario Specifications

  Baseline: novapay-5k-baseline.sql
    Enforced. Enterprise churn 3.2%, currency tickets 64%.
    Student role: diagnose the problem

  Scenario A: novapay-5k-scenario-a.sql
    Multi-currency shipped Q3
    enterprise churn: 3.2% -> 1.1% from month 7
    currency tickets: 64% -> 8%
    enterprise NRR: 85% -> 108%
    projected ARR: .1M -> .7M
    Student role: prove the fix, quantify ROI

  Scenario B: novapay-5k-scenario-b.sql
    SMB-only pivot -- exit enterprise
    enterprise customers: all churned
    total MRR drops 58% then recovers via SMB
    support volume drops 40%
    Student role: evaluate strategic option

---

## 10. UI Changes for v1.5

  DatasetSwitcher component
    Tabs: Baseline / Scenario A: Fix / Scenario B: Pivot
    Switch reinitializes PGlite with new SQL file

  ComparisonPanel component
    Side-by-side metric table: Baseline vs Scenario A vs Delta
    Powered by novapay-comparison-ab.json

  CEO Briefing v2 prompt (4 parts)
    Part 1: Diagnosis from baseline
    Part 2: Intervention tested
    Part 3: Decision and recommendation
    Part 4: Epistemic honesty

  SchemaExplorer citations
    Each table shows distribution source
    Loaded from citations.ts

---

## 11. New Files Required

  scripts/enforce-novapay-story.ps1
  scripts/generate-scenarios.ps1
  public/data/novapay-5k-baseline.sql
  public/data/novapay-5k-scenario-a.sql
  public/data/novapay-5k-scenario-b.sql
  public/data/novapay-comparison-ab.json
  content/companies/novapay/citations.ts
  content/companies/novapay/scenarios.ts
  components/exercise/DatasetSwitcher.tsx
  components/exercise/ComparisonPanel.tsx

---

## 12. Build Order

   1. Write enforce-novapay-story.ps1
   2. Run enforcer -> novapay-5k-baseline.sql
   3. Verify Exercise 9 correlation
   4. Write generate-scenarios.ps1
   5. Generate scenario-a and scenario-b
   6. Generate comparison JSON
   7. Update rubric.ts -- 5 axes
   8. Create citations.ts
   9. Create scenarios.ts
  10. Build DatasetSwitcher
  11. Build ComparisonPanel
  12. Update ExerciseWorkbench
  13. Update SchemaExplorer
  14. Update CEO Briefing prompt
  15. Update grade-briefing API
  16. npm run build
  17. Test all 10 exercises
  18. Test scenario switching
  19. Deploy to atelier.realitydb.dev
  20. git commit

---

## 13. Success Criteria

  Exercise 9: enterprise+currency -> churn ~65%
  Exercise 9: enterprise+no currency -> churn ~2%
  Temporal: signed_at <= created_at for all rows
  Scenario A: enterprise churn shows 1.1% vs 3.2% baseline
  5-axis rubric scores correctly
  Citations show for 5+ distributions
  atelier.realitydb.dev loads and PGlite initializes

---

## 14. Guardrails

  NEVER modify realitydb-sandbox
  NEVER modify databox\apps\cli
  Work ONLY in C:\Users\HP\Documents\atelier
  npm run build must pass before any commit
  Baseline never modified -- scenarios are always new files
  Pack JSON is source of truth

---

*RealityDB Atelier PRD + TRD v2.0*
*Mpingo Systems LLC -- Charlotte, NC*
*The business school that runs on live data.*