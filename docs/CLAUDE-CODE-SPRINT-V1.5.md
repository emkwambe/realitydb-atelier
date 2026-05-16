# RealityDB Atelier — Claude Code Session
## Read First (mandatory)
C:\Users\HP\Documents\realitydb-internal\skills\REALITYDB-SKILL.md
C:\Users\HP\Documents\atelier\CLAUDE.md
C:\Users\HP\Documents\atelier\docs\PRD-TRD-v2.md
C:\Users\HP\Documents\atelier\lib\pglite.ts

---

## VISION (never lose sight of this)

RealityDB Atelier is a business flight simulator.
Students do not read about business problems. They interrogate them.

The learning loop:
  Phase 1 -- Diagnose: query the baseline dataset, find the hidden problem
  Phase 2 -- Intervene: switch to a scenario dataset, test a hypothesis
  Phase 3 -- Brief: write a CEO memo proving what they found and tested

The dataset responds to interventions. The original state is always preserved.
Every scenario is a branch. Students cannot memorize answers -- they derive them.

This is what separates Atelier from every other business education tool:
  HBS Online:  students read a pre-written story
  DataCamp:    students learn SQL syntax without business context
  Capsim:      students make decisions in a decision tree
  Atelier:     students query a live database and discover the story themselves

The NovaPay hidden story that must emerge from the data:
  Enterprise churn rising from 1.1% to 3.2% over 18 months
  Root cause: missing multi-currency support
  Smoking gun: 64% of churned enterprise customers filed currency_support
               or fx_reconciliation tickets in final 90 days
  Active enterprise customers: only 4% have currency tickets
  Enterprise = 5% of customers but 58% of MRR
  At current trajectory: $610K ARR lost in 12 months

A student who runs Exercise 9 must find this correlation.
If they cannot, the product fails its core promise.

---

## ACTIVE PROBLEM: PGlite Not Loading NovaPay Dataset

### Symptoms
- Exercise page loads correctly
- SQL editor renders correctly
- Running any query returns: ERROR 42P01: relation "customers" does not exist
- The SQL file IS accessible: http://localhost:3001/data/novapay-5k.sql downloads at 880KB
- Debug logs added to pglite.ts but NOT printing in console
- This means db.exec() is never being called OR pglite.ts is not the version running

### What was working before
- Earlier in this session SELECT * FROM customers LIMIT 5 returned 5 rows
- The original novapay-5k.sql file (before enforcement attempts) worked
- Something broke during the story enforcement attempts

### What changed
1. enforce-novapay-story.ps1 was run -- it APPENDED UPDATE/DELETE statements
   to create novapay-5k-baseline.sql (889KB)
2. pglite.ts was changed to load novapay-5k-baseline.sql
3. Then reverted back to novapay-5k.sql
4. Debug console.log statements were added to pglite.ts
5. But the logs do not appear in browser console
6. This suggests the built JS bundle is stale / not reflecting code changes

### Root Cause Hypothesis
The Next.js dev server is serving a stale compiled bundle that does not
include the pglite.ts changes. The .next cache needs clearing.

### Files involved
  C:\Users\HP\Documents\atelier\lib\pglite.ts
  C:\Users\HP\Documents\atelier\public\data\novapay-5k.sql  (880KB, works)
  C:\Users\HP\Documents\atelier\public\data\novapay-5k-baseline.sql (889KB, broken)

---

## TASK 1: Fix PGlite Loading (Priority 1 -- nothing else works without this)

STEP 1 -- Clear Next.js cache and rebuild
  Stop the dev server
  Remove-Item -Recurse -Force C:\Users\HP\Documents\atelier\.next -ErrorAction SilentlyContinue
  cd C:\Users\HP\Documents\atelier
  npm run dev

STEP 2 -- Verify pglite.ts has debug logs
  Read lib\pglite.ts
  Confirm these console.log lines exist inside the if (sql.trim().length > 0) block:
    console.log("[pglite] SQL length:", sql.length, "chars");
    console.log("[pglite] First 200 chars:", sql.substring(0, 200));
    console.log("[pglite] exec() completed successfully");
  If not -- add them

STEP 3 -- Verify the dataset URL
  Confirm pglite.ts is fetching: /data/novapay-5k.sql (NOT baseline)
  The file at public/data/novapay-5k.sql is 880KB and was working earlier

STEP 4 -- Check if PGlite WASM is loading correctly
  In pglite.ts add before db = new PGlite():
    console.log("[pglite] Initializing PGlite WASM...");
  And after:
    console.log("[pglite] PGlite WASM ready");
  This tells us if WASM loads but exec fails, or if WASM itself fails

STEP 5 -- If exec fails on full file, try chunked loading
  The SQL file has CREATE TABLE statements followed by INSERT statements
  Try splitting: first exec only the CREATE TABLE statements
  Then exec the INSERT statements separately
  This isolates whether the schema or the data is the problem

  Approach:
    const schemaSQL = sql.split('-- DATA')[0];  // everything before inserts
    const dataSQL = sql.split('-- DATA')[1];    // everything after
    await db.exec(schemaSQL);
    console.log("[pglite] Schema loaded");
    await db.exec(dataSQL);
    console.log("[pglite] Data loaded");

  Check the actual SQL file to find the right split point:
    Get-Content "C:\Users\HP\Documents\atelier\public\data\novapay-5k.sql" |
      Select-String -Pattern "^-- " |
      Select-Object -First 20 LineNumber, Line

STEP 6 -- Verify by running in exercise
  Open http://localhost:3001/companies/novapay/exercise/1
  Run: SELECT * FROM customers LIMIT 5
  Must return 5 rows before proceeding to Task 2

---

## TASK 2: Fix the Story Enforcer (Priority 2)

The enforce-novapay-story.ps1 script appends UPDATE/DELETE statements
to the SQL file. This approach fails in PGlite because:
  - PGlite may not support all PostgreSQL UPDATE syntax
  - gen_random_uuid() may not be available in PGlite context
  - INTERVAL arithmetic may differ from server PostgreSQL

BETTER APPROACH: Patch the INSERT data directly
Instead of appending UPDATEs, modify the INSERT rows themselves.

STEP 1 -- Read the enforcer script
  C:\Users\HP\Documents\atelier\scripts\enforce-novapay-story.ps1

STEP 2 -- Rewrite the enforcer to patch INSERT data
  For T5 (currency ticket correlation -- THE SMOKING GUN):
    Parse the INSERT INTO support_tickets lines
    For each ticket belonging to a churned enterprise customer:
      If random < 0.64: change category value to 'currency_support'
    For each ticket belonging to an active enterprise customer:
      If random < 0.04: change category value to 'currency_support'
      Otherwise: keep original category

  For T3 (MRR concentration):
    Parse INSERT INTO subscriptions lines
    For enterprise customer subscriptions: set mrr_cents to 800000-2500000
    For SMB subscriptions: set mrr_cents to 9900-29900

  For T2 (temporal ordering):
    Parse INSERT INTO customers lines
    For each row where signed_at > created_at: swap the values

  For T6 (board_metrics):
    Find the board_metrics INSERT block
    Replace the generated values with the story values

STEP 3 -- The enforcer output
  Input:  public\data\novapay-5k.sql (freshly generated, 880KB)
  Output: public\data\novapay-5k-baseline.sql (story enforced, same size)
  The output file should ONLY contain CREATE TABLE + INSERT statements
  NO UPDATE, DELETE, or procedural SQL
  PGlite can handle pure CREATE + INSERT but struggles with UPDATE

STEP 4 -- Validate enforcement
  After generating baseline, verify in browser:
    -- Exercise 4 check: enterprise churn ~3.2%
    SELECT segment,
           COUNT(CASE WHEN status = 'churned' THEN 1 END) as churned,
           COUNT(*) as total,
           ROUND(COUNT(CASE WHEN status='churned' THEN 1 END)*100.0/COUNT(*),1) as pct
    FROM customers GROUP BY segment ORDER BY pct DESC;

    -- Exercise 9 check: currency ticket correlation
    SELECT c.status,
           COUNT(CASE WHEN st.category IN ('currency_support','fx_reconciliation')
                 THEN 1 END) as currency_tickets,
           COUNT(*) as total,
           ROUND(COUNT(CASE WHEN st.category IN ('currency_support','fx_reconciliation')
                 THEN 1 END)*100.0/NULLIF(COUNT(*),0),1) as pct
    FROM customers c
    JOIN support_tickets st ON c.id = st.customer_id
    WHERE c.segment = 'enterprise'
    GROUP BY c.status;

  Expected results:
    Exercise 4: enterprise churn_pct ~30-35% (of enterprise customers)
    Exercise 9: churned enterprise ~64% currency tickets
                active enterprise ~4% currency tickets

---

## TASK 3: Generate Scenario Files (Priority 3)

After Task 2 produces a working novapay-5k-baseline.sql:

STEP 1 -- Generate Scenario A (multi-currency fix)
  Copy baseline to novapay-5k-scenario-a.sql
  Patch the INSERT data:
    -- Enterprise churn drops: churned enterprise customers -> reactivate 60%
    -- Currency tickets for reactivated customers -> change to billing_question
    -- Enterprise NRR improves: expansion_events show more upgrades
  This represents: multi-currency shipped Q3, churn drops 3.2% -> 1.1%

STEP 2 -- Generate Scenario B (SMB-only pivot)
  Copy baseline to novapay-5k-scenario-b.sql
  Patch the INSERT data:
    -- All enterprise customers -> status = churned
    -- SMB churn improves slightly: 1.4% -> 0.9%
    -- Support ticket volume drops (no complex enterprise needs)
  This represents: strategic exit from enterprise, focus on SMB

STEP 3 -- Generate comparison JSON
  public\data\novapay-comparison-ab.json
  Pre-computed metrics for ComparisonPanel:
  {
    "baseline": {
      "enterprise_churn_pct": 3.2,
      "blended_churn_pct": 1.4,
      "enterprise_mrr_pct": 58,
      "arr_projected_12mo": 1490000,
      "nrr_enterprise": 85
    },
    "scenario_a": {
      "enterprise_churn_pct": 1.1,
      "blended_churn_pct": 0.9,
      "enterprise_mrr_pct": 62,
      "arr_projected_12mo": 2710000,
      "nrr_enterprise": 108,
      "arr_delta": 610000,
      "engineering_cost": 400000,
      "payback_months": 7.9
    }
  }

---

## TASK 4: Build UI Components (Priority 4 -- after data works)

STEP 1 -- DatasetSwitcher component
  File: components\exercise\DatasetSwitcher.tsx
  Props: { current: string, onSwitch: (dataset: string) => void }
  Renders three tabs:
    [Baseline] [Scenario A: Multi-currency fix] [Scenario B: SMB pivot]
  Active tab: brand green (#06d6a0) border and text
  On switch: call onSwitch(datasetName)
  Warning toast: "Switching dataset resets your query history"

STEP 2 -- Update ExerciseWorkbench to use DatasetSwitcher
  File: app\companies\novapay\exercise\[n]\_ExerciseWorkbench.tsx
  Add DatasetSwitcher above the SQL editor tabs
  On dataset switch: call resetPGlite() then initPGlite(newDataset)
  Show loading overlay during switch: "Loading scenario dataset..."

STEP 3 -- ComparisonPanel component
  File: components\exercise\ComparisonPanel.tsx
  Reads from public\data\novapay-comparison-ab.json
  Shows side-by-side table:
    Metric              | Baseline | Scenario A | Change
    Enterprise churn    | 3.2%     | 1.1%       | -2.1pp (green)
    Blended churn       | 1.4%     | 0.9%       | -0.5pp (green)
    ARR projected 12mo  | $1.49M   | $2.71M     | +$610K (green)
    Enterprise NRR      | 85%      | 108%       | +23pp  (green)
    Eng cost to fix     | --       | $400K      | --
    Payback period      | --       | 7.9 months | --
  Only shown after student has run queries on both baseline and scenario
  Trigger: show after student switches dataset at least once

STEP 4 -- Update rubric.ts to 5 axes
  File: content\companies\novapay\rubric.ts
  Change from 4 axes x 25pts to 5 axes x 20pts
  Add 5th axis:
    {
      name: 'epistemic_honesty',
      maxScore: 20,
      passCriteria: 'Names at least one specific unknown and explains
                     how they would resolve it. Shows awareness that
                     correlation is not causation.',
      failCriteria: 'Presents all findings as certain. Does not
                     acknowledge data limitations or missing context.',
    }
  Update all existing axis maxScore from 25 to 20

STEP 5 -- Update CEO Briefing prompt (v2)
  File: app\companies\novapay\briefing\page.tsx
  Update the briefing prompt to 4 parts:
    Part 1 Diagnosis: What did you find in the baseline data?
    Part 2 Intervention: What scenario did you test and why?
    Part 3 Decision: What do you recommend with financial evidence?
    Part 4 Epistemic honesty: What can you not confirm and how would you?
  Update word count guidance: 700-900 words (increased from 600-800)

STEP 6 -- Update grade-briefing API for 5 axes
  File: app\api\grade-briefing\route.ts
  Update the JSON schema in the Claude prompt to include epistemic_honesty
  Update total score calculation: sum of 5 axes each 0-20
  Passing threshold remains 70/100

STEP 7 -- Create citations.ts
  File: content\companies\novapay\citations.ts
  Export NOVAPAY_CITATIONS object keyed by table name:
  {
    customers: {
      segment: {
        distribution: "SMB 70% / Mid-market 25% / Enterprise 5%",
        source: "Pacific Crest 2024 SaaS Survey",
        url: "https://www.bvp.com/atlas/state-of-the-cloud-2024"
      }
    },
    subscriptions: {
      churn: {
        distribution: "Blended monthly churn 1.4%",
        source: "ChurnZero 2024 SaaS Churn Benchmark Report",
        url: "https://churnzero.com/saas-metrics-benchmarks"
      }
    },
    support_tickets: {
      category: {
        distribution: "currency_support: 14% of enterprise tickets",
        source: "Stripe Atlas B2B SaaS Benchmark 2024",
        url: "https://stripe.com/atlas"
      }
    },
    payments: {
      failure_code: {
        distribution: "card declined 3%, insufficient funds 2%",
        source: "Stripe Radar Fraud Report 2024",
        url: "https://stripe.com/radar"
      }
    }
  }

STEP 8 -- Update SchemaExplorer to show citations
  File: components\exercise\SchemaExplorer.tsx
  Import NOVAPAY_CITATIONS
  For each table that has citations: show a "Sources" collapsible section
  Display: distribution description + source name + link

---

## TASK 5: Deploy (Priority 5 -- after all above works)

STEP 1 -- Final build
  npm run build
  Fix any TypeScript errors

STEP 2 -- Deploy to Cloudflare Pages
  npx wrangler pages deploy out --project-name realitydb-atelier --branch main
  Set custom domain: atelier.realitydb.dev in Cloudflare dashboard

STEP 3 -- Verify live
  Open atelier.realitydb.dev
  Run SELECT * FROM customers LIMIT 5
  Must return rows

STEP 4 -- Commit everything
  git add -A
  git commit -m "feat(atelier): v1.5 scenario branching, story enforcement, 5-axis rubric, citations, deployed"
  git push origin master

---

## SUCCESS CRITERIA (in order)

1. SELECT * FROM customers LIMIT 5 returns 5 rows in exercise workbench
2. Exercise 9 query returns: churned enterprise ~64% currency tickets
3. Exercise 9 query returns: active enterprise ~4% currency tickets
4. Dataset switcher toggles between baseline and scenario-a without crash
5. Scenario A shows enterprise churn 1.1% vs baseline 3.2%
6. ComparisonPanel shows correct metric deltas
7. 5-axis rubric scores correctly (20pts each, 100 total)
8. Citations visible in schema explorer for 4+ tables
9. npm run build passes
10. atelier.realitydb.dev loads and PGlite initializes

---

## GUARDRAILS

NEVER modify C:\Users\HP\Documents\realitydb-sandbox
NEVER modify C:\Users\HP\Documents\databox\apps\cli
Work ONLY in C:\Users\HP\Documents\atelier
npm run build must pass before any commit
Baseline dataset never modified -- scenarios are always new files
Pack JSON is source of truth for data generation
All scenario files must be pure CREATE + INSERT SQL -- no UPDATE/DELETE
PGlite cannot handle server-side PostgreSQL extensions
Keep dark theme throughout -- no light mode, no gradients