# RealityDB Atelier — Pack Authoring Guide
## Mpingo Systems LLC — Charlotte, NC
**Version:** 1.0
**Date:** June 2026
**Status:** Canonical reference for all future pack authors

---

## 1. What a Pack Is

A pack is a JSON specification file that tells the RealityDB engine
how to generate a synthetic company database. It defines:
  - Table schemas (columns, types, distributions)
  - Row budgets (how many rows per table)
  - Enum values with weights (realistic distributions)
  - Foreign key relationships (referential integrity)
  - Temporal windows (date ranges for generated data)

A pack does NOT define:
  - The hidden story (that is enforced post-generation by an enforcer script)
  - Exercise questions (those live in content/companies/[name]/exercises.ts)
  - The CEO briefing rubric (lives in content/companies/[name]/rubric.ts)

The pack generates realistic baseline data.
The enforcer bakes in the hidden story on top of that baseline.
These are two separate steps. Never skip the enforcer.

---

## 2. The Six Proven Packs — Reference Library

Study these before authoring a new pack.
All six are in: C:\Users\HP\Documents\realityDB Packs\packs\

  novapay.json       FinTech SaaS           13 tables  96/100
  medcore_rcm.json   Healthcare RCM         12 tables  99/100
  supplylink.json    Supply Chain           10 tables  99/100
  towernet.json      Telecom                10 tables  98/100
  clearbank.json     AML/Banking            11 tables  98/100
  oncocare.json      Oncology Clinical      12 tables  98/100

When in doubt: read medcore_rcm.json first. It is the cleanest reference.

---

## 3. Pack Structure

Every pack follows this top-level structure:

  {
    "name": "company_slug",
    "version": "1.0.0",
    "description": "One sentence. Company name, domain, hidden crisis shape.",
    "tables": [ ... ]
  }

### 3.1 Table Definition

  {
    "name": "table_name",
    "type": "root" | "child",
    "refs": ["parent_table_name"],
    "columns": [ ... ]
  }

  type: root = no foreign key parent (generates independently)
  type: child = has at least one FK parent in refs[]
  refs: list of parent table names (must already appear earlier in tables[])

### 3.2 Column Definition

  {
    "name": "column_name",
    "type": "uuid" | "text" | "integer" | "float" | "boolean" | "timestamp",
    "primary_key": true,              // optional — marks PK column
    "foreign_key": "table.column",    // optional — marks FK column
    "nullable": true,                 // optional — column can be NULL
    "nullWeight": 0.20,               // optional — proportion of NULLs (0.0-1.0)
    "generator": { ... }              // defines how values are generated
  }

---

## 4. Generator Types

### 4.1 UUID
  { "type": "uuid" }
  Generates: standard UUID v4
  Use for: id columns, foreign key columns

### 4.2 Enum (most common)
  {
    "type": "enum",
    "values": ["value1", "value2", "value3"],
    "weights": [40, 35, 25]
  }
  Weights do not need to sum to 100 — engine normalizes them.
  CRITICAL: values[] and weights[] must have identical length.
  Use for: status fields, categories, regions, plan types

  Distribution research requirement:
  Every enum distribution must be backed by a real industry source.
  Example: plan type weights in NovaPay cite Pacific Crest SaaS Survey.
  Do not invent distributions. Look them up. Cite them in the spec doc.

### 4.3 Normal Distribution (float/integer)
  {
    "type": "normal",
    "mean": 45.00,
    "stddev": 15.00,
    "min": 0.00,
    "max": 500.00
  }
  Use for: amounts, rates, durations, scores
  Always set min and max to prevent outliers that break temporal logic

### 4.4 Integer Range
  {
    "type": "integer",
    "min": 1,
    "max": 10000
  }

### 4.5 Boolean
  {
    "type": "boolean",
    "trueWeight": 0.15
  }
  trueWeight: proportion of true values (0.0-1.0)

### 4.6 Timestamp
  {
    "type": "timestamp",
    "min": "2024-05-01T00:00:00Z",
    "max": "2026-05-01T00:00:00Z"
  }
  Use 24-month windows for all event/transaction tables.
  Root tables (customers, suppliers) can have longer windows.

### 4.7 Sentence (synthetic text)
  { "type": "sentence" }
  Generates: realistic synthetic sentence
  Use for: description fields, notes, subjects
  Do NOT use for: names, emails, addresses (use enum instead)

### 4.8 Full Name
  { "type": "full_name" }
  Generates: First Last format

---

## 5. Table Architecture Patterns

### 5.1 Root Tables
  Root tables generate first, independently.
  They are the anchor entities all other tables reference.
  Examples: customers, suppliers, sites, towers, branches

  Root table rules:
    Maximum 2-3 root tables per pack
    Root tables should have 10-50 rows for fixed reference data
    Or use standard row budget for customer/subscriber root tables
    Do NOT put temporal story data in root tables
    Root table values are fixed reference — the story lives in child tables

### 5.2 Child Tables
  Child tables generate after their parents.
  Each child row gets a foreign key pointing to a parent row.
  The engine assigns parent FKs by round-robin or random sampling.

  Child table rules:
    Always list refs[] in order of dependency
    A child can have multiple parents (e.g. deliveries refs purchase_orders AND warehouses)
    FK columns must use type: uuid and foreign_key: "parent_table.id"

### 5.3 Recommended Table Order
  Always define tables in this order in the JSON:
  1. Root tables (no refs)
  2. First-level children (ref root tables only)
  3. Second-level children (ref first-level children)
  4. Deep children (ref second-level or deeper)

  The engine processes tables in declaration order.
  A table cannot ref a table that appears later in the array.

---

## 6. Row Budget Design

  Target: 50K rows total for standard modules (30K for clinical/complex)
  The engine distributes rows across tables based on ratios.

  Proven row budgets from the six modules:

  FinTech SaaS (NovaPay — 50K):
    accounts:         5,000   (root)
    subscriptions:    5,000   (1:1 with accounts)
    mrr_snapshots:   60,000   (12 per account — monthly)
    support_tickets:  3,000   (0.6 per account)
    invoices:        10,000   (2 per account)

  Supply Chain (SupplyLink — 50K):
    suppliers:           20   (root, fixed)
    warehouses:           5   (root, fixed)
    products:            80   (fixed)
    purchase_orders:    800   (40 per supplier)
    po_lines:         2,400   (3 per PO)
    deliveries:         760   (0.95 per PO)
    quality_inspections:760   (1 per delivery)
    inventory_snapshots:9,600 (120 per product)
    supplier_scorecards:480   (24 per supplier)
    expediting_events:  240   (0.30 per PO)

  KNOWN ENGINE LIMITATION:
  The engine cannot enforce fixed row counts on root tables.
  A root table declared with 20 suppliers may generate 200.
  The enforcer script fixes this post-generation by:
    a) Normalizing duplicate root rows (same name → same attributes)
    b) Picking canonical IDs for the story enforcement
  Document this in your pack spec under _meta.exceptions.

---

## 7. The Hidden Story Design

  The hidden story is the most important design decision.
  Everything else serves it.

### 7.1 Story Structure (proven pattern)

  Surface signal:
    The observable business metric that triggered the investigation.
    Example: churn rate jumped from 2.1% to 2.9% in one region.
    The student knows this before they start.

  The smoking gun:
    A single entity (supplier, payer, tower, site, account) that
    causes a disproportionate share of the problem.
    Quantified: entity represents X% of volume but Y% of the problem.
    Example: Zhonghe Industrial is 18% of PO volume but causes 41% of late deliveries.

  The temporal inflection:
    The smoking gun entity changed behavior at a specific point in time.
    Before: normal metrics. After: degraded metrics.
    Example: Zhonghe degradation starts month 15 (Aug 2025).
    This inflection is what makes the story discoverable by SQL.

  The financial impact:
    Specific dollar amounts the student calculates from the data.
    Must be derivable from the data — not just asserted in text.
    Example: .4M ARR at risk from MidState Mutual denial spike.

  The decision:
    Two concrete options with specific costs and payback periods.
    Option A: fix the root cause (higher cost, better long-term)
    Option B: mitigate the symptom (lower cost, temporary)

### 7.2 Story Enforcer Design

  The enforcer is a Node.js script that:
    1. Reads the raw generated SQL as plain text
    2. Parses INSERT rows by string matching
    3. Modifies INSERT values in-place
    4. Writes the enforced SQL to the output file

  CRITICAL RULES FOR ENFORCERS:
    Pure INSERT-level string patching ONLY
    No SQLite, no better-sqlite3, no Database class
    No UPDATE or DELETE statements in output
    Output must be pure CREATE TABLE + INSERT statements
    PGlite must be able to load the output without errors

  Why no SQLite?
    The generated SQL uses PostgreSQL syntax (UUID, gen_random_uuid(),
    DEFAULT, TIMESTAMPTZ). SQLite cannot parse these.
    The string-patching approach works around this completely.

  Enforcer transformation pattern:
    T0: Identify the villain entity by name from INSERT rows
        e.g. find supplier row where name = 'Zhonghe Industrial'
        Store its UUID for all subsequent transforms
    T1: Fix root table profile attributes
    T2: Enforce the smoking gun pattern on child tables
    T3: Enforce temporal inflection (before/after date boundary)
    T4: Enforce financial signal (amounts, rates, concentrations)
    T5: Fix temporal ordering (parent dates before child dates)
    T6: Strip NOT NULL from nullable columns in CREATE TABLE blocks

  Self-check:
    Every enforcer must print a verification table after running.
    Each row: metric name, actual result, target.
    If any metric misses target: enforcer exits with error.

---

## 8. Quality Gates (MANDATORY)

  No pack ships to Atelier without passing ALL of these.
  Assess the ENFORCED baseline — not the raw generated file.

  Gate 1: pack:validate
    node cli run pack:validate --pack [pack].json
    Required: 0 errors, 0 warnings
    HARD STOP if any errors

  Gate 2: 10K smoke generation
    node cli run --pack [pack].json --rows 10000 --format sql --seed 42
    Required: all tables present, watermark embedded

  Gate 3: 50K production generation
    node cli run --pack [pack].json --rows 50000 --format sql --seed 42
    Required: ~50K rows, watermark embedded

  Gate 4: Smoke test regression
    node smoke-test.cjs (from databox/apps/cli/)
    Required: 149/149 passing
    HARD STOP if any fail

  Gate 5: Run enforcer
    node enforce-[pack]-story.mjs [raw-50k].sql [baseline].sql
    Required: all self-check metrics hit target
    HARD STOP if any metric misses

  Gate 6: Assess ENFORCED baseline
    node cli examine assess [baseline].sql --pack [pack].json
    Required ALL of:
      FK integrity:   100%  -- HARD STOP if below
      Enum validity:  100%  -- HARD STOP if below
      Temporal logic: 95+   -- HARD STOP if below 95
      Overall score:  97+   -- HARD STOP if below 97

  WHAT TO COMMIT:
    [pack].json                    the pack specification
    [pack]-50k-baseline.sql        the ENFORCED baseline (not raw v1.0)
    [pack]-assess-heuristic.json   quality report
    [pack]-assess-pack-aware.json  quality report

  DO NOT COMMIT:
    [pack]-50k-v1.0.sql            raw generated before enforcement
    Any SQL with temporal logic below 95/100
    Any SQL with FK integrity below 100%

---

## 9. Temporal Logic — The Most Common Failure

  Temporal logic failures are the most common quality gate failure.
  They mean: a child event timestamp is earlier than its parent.
  Example: cancelled_at before started_at.
           delivered_at before ordered_at.
           paid_date before claim_submitted_date.

  ROOT CAUSE: The engine generates timestamps independently per column.
  It does not know that delivered_at must be after ordered_at.

  FIX IN PACK: Remove created_at from event tables.
  The lesson from TowerNet and ClearBank v1.1:
    Dropping created_at from 7 event tables fixed temporal_logic 83 → 100
    Dropping created_at from 4 event tables fixed temporal_logic 84 → 100
  Event tables do not need created_at — they have their own event timestamps.

  FIX IN ENFORCER: T5 — temporal ordering pass
    For every parent-child timestamp pair:
      Find child rows where child_date < parent_date
      Set child_date = parent_date + random(1, 30) days
    This is the enforcer's most important transformation.

  PACK DESIGN RULE:
  Only include created_at on root/reference tables.
  Event and transaction tables: use only their natural timestamps.
    deliveries: promised_date, delivered_at (not created_at)
    claims: service_date, submitted_at, paid_date (not created_at)
    wires: initiated_at, settled_at (not created_at)

---

## 10. Distribution Research Requirements

  Every enum distribution must be backed by a real industry source.
  This is what makes Atelier different from toy datasets.

  Proven citation sources by domain:

  FinTech SaaS:
    Pacific Crest SaaS Survey (annual) — churn, ARPU, plan mix
    Stripe Atlas reports — payment failure rates, subscription metrics
    ChurnZero — SaaS churn benchmarks by segment
    OpenView SaaS Benchmarks — NRR, expansion revenue

  Healthcare RCM:
    HFMA Revenue Cycle Benchmark Report — denial rates, collection rates
    Change Healthcare Denial Index — denial categories, CARC codes
    Experian Health State of Claims — underpayment rates
    AHA Annual Survey — payer mix distributions

  Supply Chain:
    ISM Report on Business Manufacturing PMI — on-time delivery benchmarks
    Gartner Supply Chain Top 25 — quality rejection rates
    MIT Center for Transportation and Logistics — lead time CV benchmarks
    Deloitte Global CPO Survey — expediting rate benchmarks

  Telecom:
    GSMA Mobile Economy Report — churn rate benchmarks
    Ericsson Mobility Report — network uptime benchmarks
    ITU World Telecommunication Statistics — ARPU benchmarks
    J.D. Power Wireless Study — churn-network correlation

  AML/Banking:
    FinCEN Enforcement Actions — penalty ranges, violation types
    FFIEC BSA/AML Examination Manual — compliance program requirements
    K&L Gates BSA enforcement analysis — 2024 action patterns
    OCC Comptroller Handbook — AML training requirements

  Oncology/Clinical:
    TransCelerate BioPharma — protocol deviation rate benchmarks
    FDA Oncology Accelerated Approval guidance — response rate thresholds
    ICH E6 GCP Guidelines — monitoring and deviation standards
    Tufts CSDD — dropout rate benchmarks, site turnover

---

## 11. Naming Conventions

  Pack file:          [company_slug].json
  Raw generated:      [company_slug]-50k-v1.0.sql
  Enforced baseline:  [company_slug]-50k-baseline.sql
  Scenario A:         [company_slug]-50k-scenario-a.sql
  Scenario B:         [company_slug]-50k-scenario-b.sql
  Comparison JSON:    [company_slug]-comparison-ab.json
  Enforcer script:    enforce-[company_slug]-story.mjs
  Scenario script:    generate-[company_slug]-scenarios.mjs
  Heuristic report:   [company_slug]-assess-heuristic-v1.0.json
  Pack-aware report:  [company_slug]-assess-pack-aware-v1.0.json
  Pack spec doc:      [COMPANY]-PACK-SPEC.md

  Table names:        snake_case, plural (suppliers, purchase_orders)
  Column names:       snake_case (supplier_id, on_time_delivery_rate)
  Enum values:        snake_case for codes (active, pending, in_transit)
                      Title Case for display names (United States, Zhonghe Industrial)
  Company slugs:      lowercase, no hyphens (novapay, medcore, supplylink)

---

## 12. Full Authoring Workflow

  Step 1: Write the pack spec document
    File: C:\Users\HP\Documents\realitydb-internal\[COMPANY]-PACK-SPEC.md
    Sections: company profile, hidden story, table definitions,
               row budget, enforcer notes, scenarios, citations
    This is the source of truth. Write it before touching JSON.

  Step 2: Author the pack JSON (this chat)
    Read novapay.json and medcore_rcm.json first
    Follow the structure exactly
    Every enum must have a research-backed distribution
    Do not include created_at on event tables

  Step 3: Validate (this chat)
    node cli pack:validate --pack [pack].json
    Fix all errors before proceeding

  Step 4: Generate smoke test (this chat)
    10K rows, verify all tables present

  Step 5: Generate production dataset (this chat)
    50K rows (or 30K for clinical), seed 42

  Step 6: Run smoke test regression (this chat)
    149/149 must pass

  Step 7: Commit pack + raw dataset (this chat)
    git add [pack].json [pack]-50k-v1.0.sql assess reports
    git commit -m "feat(pack): [name] v1.0 — N tables, story, Xk/100 quality"
    git push origin main

  Step 8: Write enforcer + build Atelier module (Claude Code)
    Separate Claude Code session
    Read REALITYDB-SKILL.md and CLAUDE.md first
    Run enforcer → assess enforced baseline → all quality gates
    Build exercises.ts, rubric.ts, citations.ts, scenarios.ts
    Build app pages → wire platform → build → deploy

---

## 13. Common Pack Authoring Mistakes

  MISTAKE 1: Misaligned enum arrays
    values[] and weights[] have different lengths
    pack:validate catches this immediately
    Fix: count both arrays before saving

  MISTAKE 2: Wrong table order
    Child table appears before its parent in tables[]
    Engine cannot resolve FK reference
    Fix: always root tables first, then children in dependency order

  MISTAKE 3: Missing FK declaration
    FK column defined as uuid but without foreign_key: "parent.id"
    Engine generates random UUIDs instead of valid parent IDs
    FK integrity will fail quality gate
    Fix: every FK column must have foreign_key declared

  MISTAKE 4: created_at on event tables
    Causes temporal logic failures (temporal logic 83/100 instead of 100)
    Fix: remove created_at from deliveries, claims, wires, visits etc.
    Keep created_at only on root/reference tables

  MISTAKE 5: Tight temporal windows
    min and max timestamps too close together
    Story inflection has no room to breathe
    Fix: always use 24-month window minimum
    Standard: 2024-05-01 to 2026-05-01

  MISTAKE 6: Story visible in the pack
    Setting villain entity weights too high in the pack itself
    The story should be INVISIBLE in the raw generated data
    The enforcer makes the story appear AFTER generation
    Fix: villain entity gets the SAME weights as other entities in pack
    Enforcer sets the 48% late rate, 34% deviation rate etc.

  MISTAKE 7: Assessing raw generated file
    Running examine assess on the v1.0 raw file before enforcement
    This gives misleading scores because the story is not yet baked in
    Fix: ALWAYS assess the enforced baseline, never the raw file

  MISTAKE 8: Committing raw file as the baseline
    Committing [pack]-50k-v1.0.sql to Atelier instead of baseline.sql
    Students see placeholder data without the hidden story
    Fix: copy only the enforced baseline to atelier/public/data/

---

## 14. Pack Spec Document Template

  Use this structure for every new pack spec:

  # [Company] Pack Specification
  ## RealityDB Atelier Module [N]
  Version, Date, Status

  ## What This Chat Does
  ## What Claude Code Does (separate session)

  ## Company Profile
    Name, Domain, Stage, Role, Trigger

  ## The Hidden Story
    Surface signal
    The smoking gun (with specific numbers)
    The temporal inflection (which month things changed)
    The financial impact (specific dollar amounts)
    The decision (Option A vs Option B with costs)

  ## Tables (N)
    Root Tables
    Child Tables
    For each table: column names, types, generator specs

  ## Row Budget
    Per-table row count with ratio explanation

  ## Story Enforcement Notes
    T0 through TN transformations
    Self-check targets with specific numbers

  ## Scenarios
    Scenario A: fix the root cause
    Scenario B: mitigate the symptom
    Comparison JSON structure

  ## Quality Gates
    FK integrity: 100%
    Enum validity: 100%
    Temporal logic: 95+
    Overall: 97+

  ## Citations
    One citation per key distribution claim
    Source name, publication year, URL

---

## 15. The IES SBIR Grant Note

  The IES SBIR grant application is due June 29, 2026.
  The pack library (6 packs, all 97-99/100) is the primary
  evidence of technical feasibility in the application.
  Each pack spec document with its citation trail is evidence
  of the research-backed methodology.
  SAFESQL-MASTER.md and PACK-QUALITY-GATES.md are evidence
  of the quality assurance process.

---

*RealityDB Atelier Pack Authoring Guide v1.0*
*Mpingo Systems LLC — Charlotte, NC*
*Built from six production packs: NovaPay, MedCore, SupplyLink,*
*TowerNet, ClearBank, OncoCare — all 97-99/100 quality*
