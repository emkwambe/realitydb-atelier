# Cascade Risk — Module Specification
## Atelier Module 07 · AI-Augmented Intelligence
**Version:** 1.0 · June 15, 2026  
**Owner:** Eddy Mkwambe · Mpingo Systems LLC  
**Status:** Approved — ready for synthetic data generation and UI implementation  
**Dimension:** AI-Augmented Intelligence (Dimension 06)  
**Read before:** Building any part of the Cascade Risk module

---

## Why this module exists

Every other Atelier module can be completed using SQL and human reasoning alone.
Cascade Risk cannot.

The dataset is deliberately designed so that:
- 500,000 claims rows overwhelm manual pattern matching
- 15,000 unstructured adjuster notes require AI summarization to find euphemisms
- 50,000 call center logs require AI clustering to surface complaint themes
- The hidden root cause requires correlating structured + unstructured + time-series data
- The AI will hallucinate (incorrectly claim fraud) — the learner must catch it

This makes Cascade Risk the only module that develops and measures
**AI-Augmented Intelligence** — the ability to use AI as an extension
of judgment, not a replacement for it.

---

## The six intelligence dimensions — completion status

| Dimension | Module | Status |
|---|---|---|
| Financial Intelligence | NovaPay | ✅ Built |
| Operational Intelligence | SupplyLink | ✅ Built |
| Strategic Intelligence | TowerNet | ✅ Built |
| Decision Intelligence | ClearBank | ✅ Built |
| Clinical/Healthcare Intelligence | OncoCare + MedCore | ✅ Built |
| **AI-Augmented Intelligence** | **Cascade Risk** | **📋 This spec** |

---

## Module identity

| Attribute | Value |
|---|---|
| Module name | Cascade Risk |
| Company | GulfStream Insurance |
| Industry | Property & Casualty InsurTech |
| Crisis | $22M claims leakage, root cause unknown |
| Learner role | Senior Analyst reporting to CEO |
| Time to complete | 4-6 hours |
| Difficulty | Advanced |
| AI use | Encouraged — required for Level 4 score |
| Tables | 8 |
| Total rows | ~585,000 |
| Time span | 24 months (2024-01-01 to 2025-12-31) |

---

## The crisis narrative

GulfStream Insurance writes property and casualty policies across five
U.S. regions. Eighteen months ago, the company deployed Reserve Model v2 —
a machine learning tool designed to improve reserve accuracy. The model
was validated and performed well in testing.

Fourteen months ago, something changed.

A whistleblower email landed in the CEO's inbox on December 1, 2025:

> *"I've been in Team_Delta for 6 years. Three of our adjusters never got
> the v2 training. They're still using the old reserve formula. Management
> said v2 was 'optional for high-performers.' It wasn't. We're leaving $22M
> on the table. I've flagged this in notes — 'legacy approach' — but no one
> reads them."*

The CEO has given you 48 hours to validate or disprove the claim.

---

## The hidden root cause (grader reference — never shown to learners)

Three adjusters in Team_Delta, Gulf Coast region
(ADJ_0847, ADJ_0912, ADJ_1034) never completed Reserve Model v2 training.
They have been using the deprecated v1 formula for 14 months.

**It is not fraud.** The AI will incorrectly suggest fraud based on an
unrelated note in the database. The learner must catch this hallucination
and correct it. The actual cause is a training gap compounded by
management calling v2 "optional for high-performers."

**The financial impact:** $22.4M in cumulative claims leakage over
14 months, concentrated entirely in Gulf Coast / Team_Delta.

**The data trail:**
- Adjuster notes contain euphemisms ("legacy approach", "v1 works fine")
- Reserve model outputs show drift starting November 15, 2024 for Gulf Coast
- Call center sentiment dropped to -0.6 (baseline -0.2) in affected region
- Training records show no v2 completion for the three adjusters
- Financial impact table shows $0 leakage before November 2024,
  $22.4M cumulative after

---

## The five investigation phases

### Phase 1 — Situation Awareness
*Competencies: Business Acumen, Data Literacy*

| Investigation | Business Question |
|---|---|
| 01 | Is GulfStream's loss ratio actually stable? |
| 02 | How are claims distributed across regions and teams? |

**Phase purpose:** Establish the baseline. The numbers look fine on the
surface. Loss ratios are stable. This phase builds false confidence
that everything is normal.

---

### Phase 2 — Whistleblower Validation
*Competencies: Analytical Reasoning, Data Literacy*

| Investigation | Business Question |
|---|---|
| 03 | Is there unusual claim leakage in any region or team? |
| 04 | Which adjusters are associated with leaking claims? |

**Phase purpose:** Test the whistleblower's credibility. Does the
structured claims data support the allegation? This is where the
Gulf Coast / Team_Delta signal first appears.

**AI opportunity:** Use AI to identify leakage patterns across
500,000 rows faster than manual SQL analysis.

---

### Phase 3 — Root Cause Analysis
*Competencies: Causal Reasoning, AI-Augmented Intelligence*

| Investigation | Business Question |
|---|---|
| 05 | What do the adjuster notes reveal about working methods? |
| 06 | Do training records explain the leakage pattern? |
| 07 | When did reserve model outputs begin diverging from predictions? |

**Phase purpose:** Find the why. This phase requires AI — 15,000
unstructured notes cannot be manually scanned in 48 hours. The
training records confirm the missing v2 completion. The reserve
model drift shows exactly when the problem started.

**The hallucination trap:** When asked to summarize adjuster notes,
AI will surface an unrelated note containing the word "fraud" and
may incorrectly conclude fraud is the root cause. The learner must
verify this against the claims data (no fraud pattern exists) and
correct the AI's conclusion.

---

### Phase 4 — Strategic Evaluation
*Competencies: Decision Intelligence, Business Acumen*

| Investigation | Business Question |
|---|---|
| 08 | What is the monthly financial impact of the leakage? |
| 09 | What does customer experience data show for the affected region? |

**Phase purpose:** Quantify the damage and understand the full
business impact. Call center sentiment and escalation data confirm
that customers are experiencing the downstream effects.

---

### Phase 5 — Executive Communication
*Competency: Executive Communication, Epistemic Integrity*

| Investigation | Business Question |
|---|---|
| → | CEO Briefing — 1,000 words max, 6 required sections |

**Phase purpose:** Translate the investigation into a decision.
The briefing must include what was ruled out (fraud, model error)
and how AI was used and validated. Epistemic honesty is weighted
as heavily as accuracy in the grading rubric.

---

## Database schema

### Table 1: adjusters (120 rows)

```sql
CREATE TABLE adjusters (
    adjuster_id         VARCHAR(10) PRIMARY KEY,
    full_name           VARCHAR(100) NOT NULL,
    region              VARCHAR(20) NOT NULL,
    team                VARCHAR(20) NOT NULL,
    hire_date           DATE NOT NULL,
    last_training_date  DATE,
    training_module     VARCHAR(50),
    avg_reserve_error   DECIMAL(5,2),
    claim_count         INTEGER DEFAULT 0,
    created_at          TIMESTAMP DEFAULT NOW()
);

ALTER TABLE adjusters ADD CONSTRAINT chk_adjusters_region
    CHECK (region IN ('Northeast', 'Southeast', 'Midwest', 'West', 'Gulf_Coast'));
ALTER TABLE adjusters ADD CONSTRAINT chk_adjusters_team
    CHECK (team IN ('Team_Alpha', 'Team_Bravo', 'Team_Charlie', 'Team_Delta'));
ALTER TABLE adjusters ADD CONSTRAINT chk_adjusters_training_module
    CHECK (training_module IN ('Reserve_Model_v1', 'Reserve_Model_v2', 'Legacy_Only', NULL));
```

**Generator requirements:**
- 120 rows total
- ADJ_0847, ADJ_0912, ADJ_1034: `training_module = 'Reserve_Model_v1'`, `last_training_date < 2024-11-01`
- All other adjusters: `training_module = 'Reserve_Model_v2'`, `last_training_date within 90 days of hire`

---

### Table 2: claims (500,000 rows)

```sql
CREATE TABLE claims (
    claim_id            VARCHAR(20) PRIMARY KEY,
    region              VARCHAR(20) NOT NULL,
    state               CHAR(2) NOT NULL,
    claim_type          VARCHAR(30) NOT NULL,
    incident_date       DATE NOT NULL,
    reported_date       DATE NOT NULL,
    closed_date         DATE,
    reserve_initial     DECIMAL(12,2) NOT NULL,
    reserve_final       DECIMAL(12,2),
    amount_paid         DECIMAL(12,2) NOT NULL,
    adjuster_id         VARCHAR(10) NOT NULL,
    adjuster_team       VARCHAR(20) NOT NULL,
    days_to_close       INTEGER,
    is_leaking          BOOLEAN,
    created_at          TIMESTAMP DEFAULT NOW()
);

ALTER TABLE claims ADD CONSTRAINT fk_claims_adjuster
    FOREIGN KEY (adjuster_id) REFERENCES adjusters(adjuster_id);
ALTER TABLE claims ADD CONSTRAINT chk_claims_region
    CHECK (region IN ('Northeast', 'Southeast', 'Midwest', 'West', 'Gulf_Coast'));
ALTER TABLE claims ADD CONSTRAINT chk_claims_type
    CHECK (claim_type IN ('Auto', 'Home', 'Commercial', 'Flood'));
ALTER TABLE claims ADD CONSTRAINT chk_claims_dates
    CHECK (reported_date >= incident_date);
ALTER TABLE claims ADD CONSTRAINT chk_claims_closed
    CHECK (closed_date IS NULL OR closed_date >= reported_date);
```

**Generator requirements:**
- 500,000 rows
- `is_leaking = TRUE` when `reserve_final > reserve_initial * 1.20`
- ~18,000 leaking claims (3.6%) concentrated in: `region = 'Gulf_Coast'`, `adjuster_team = 'Team_Delta'`, `incident_date >= 2024-11-01`
- `closed_date NULL` for ~10% of claims

---

### Table 3: adjuster_notes (15,000 rows)

```sql
CREATE TABLE adjuster_notes (
    note_id             SERIAL PRIMARY KEY,
    claim_id            VARCHAR(20) NOT NULL,
    adjuster_id         VARCHAR(10) NOT NULL,
    note_date           TIMESTAMP NOT NULL,
    note_text           TEXT NOT NULL,
    note_type           VARCHAR(20) DEFAULT 'internal',
    created_at          TIMESTAMP DEFAULT NOW()
);

ALTER TABLE adjuster_notes ADD CONSTRAINT fk_notes_claim
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id);
ALTER TABLE adjuster_notes ADD CONSTRAINT fk_notes_adjuster
    FOREIGN KEY (adjuster_id) REFERENCES adjusters(adjuster_id);
ALTER TABLE adjuster_notes ADD CONSTRAINT chk_notes_type
    CHECK (note_type IN ('internal', 'supervisor', 'qa'));
ALTER TABLE adjuster_notes ADD CONSTRAINT chk_notes_date
    CHECK (note_date >= (SELECT reported_date FROM claims
                         WHERE claims.claim_id = adjuster_notes.claim_id));
```

**Generator requirements:**
- 15,000 rows, `note_date >= claim.reported_date`
- For ADJ_0847, ADJ_0912, ADJ_1034 after 2024-11-01: inject 10-15 euphemisms per adjuster:
  - "legacy approach", "old guidelines", "pre-model update"
  - "v1 works fine", "prior approval needed"
  - "optional training", "what works for me"
- All other adjusters: normal notes ("per v2 model, reserve set at $X")

---

### Table 4: reserve_model_outputs (365 rows)

```sql
CREATE TABLE reserve_model_outputs (
    output_id           SERIAL PRIMARY KEY,
    model_date          DATE NOT NULL,
    model_version       VARCHAR(10) NOT NULL,
    region              VARCHAR(20) NOT NULL,
    predicted_reserve   DECIMAL(12,2) NOT NULL,
    actual_reserve      DECIMAL(12,2),
    variance            DECIMAL(8,2),
    model_confidence    DECIMAL(3,2) DEFAULT 0.95,
    created_at          TIMESTAMP DEFAULT NOW()
);

ALTER TABLE reserve_model_outputs ADD CONSTRAINT chk_outputs_version
    CHECK (model_version IN ('v1', 'v2'));
ALTER TABLE reserve_model_outputs ADD CONSTRAINT chk_outputs_region
    CHECK (region IN ('Northeast', 'Southeast', 'Midwest', 'West', 'Gulf_Coast'));
```

**Generator requirements:**
- Before 2024-11-01: `model_version = 'v1'` for all regions
- After 2024-11-01: `model_version = 'v2'` for all regions
- Gulf Coast drift pattern after 2024-11-15:
  - Week 1-2: variance = +5%
  - Week 3-4: variance = +12%
  - Month 2: variance = +18%
  - Month 3-6: variance = +34% (peak)
- All other regions: variance stays within ±5% after v2 deployment

---

### Table 5: call_center_logs (50,000 rows)

```sql
CREATE TABLE call_center_logs (
    log_id              SERIAL PRIMARY KEY,
    call_date           DATE NOT NULL,
    claim_id            VARCHAR(20) NOT NULL,
    region              VARCHAR(20) NOT NULL,
    adjuster_id         VARCHAR(10) NOT NULL,
    call_duration_sec   INTEGER,
    customer_text       TEXT,
    sentiment_score     DECIMAL(3,2),
    topic               VARCHAR(30),
    escalated_to_supervisor BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT NOW()
);

ALTER TABLE call_center_logs ADD CONSTRAINT fk_calls_claim
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id);
ALTER TABLE call_center_logs ADD CONSTRAINT fk_calls_adjuster
    FOREIGN KEY (adjuster_id) REFERENCES adjusters(adjuster_id);
ALTER TABLE call_center_logs ADD CONSTRAINT chk_calls_topic
    CHECK (topic IN ('Settlement', 'Timing', 'Amount', 'Appeal', NULL));
ALTER TABLE call_center_logs ADD CONSTRAINT chk_sentiment_range
    CHECK (sentiment_score BETWEEN -1.0 AND 1.0);
```

**Generator requirements:**
- Gulf Coast / Team_Delta after 2024-11-01:
  - `sentiment_score` average = -0.6 (baseline -0.2)
  - `topic = 'Amount'` 3x more frequent than baseline
  - `escalated_to_supervisor` rate = 18% (baseline 5%)
  - Call volume +40% vs pre-drift period

---

### Table 6: whistleblower_emails (8 rows — seeded, not generated)

```sql
CREATE TABLE whistleblower_emails (
    email_id            SERIAL PRIMARY KEY,
    email_date          TIMESTAMP NOT NULL,
    sender              VARCHAR(100) NOT NULL,
    recipient           VARCHAR(100) NOT NULL,
    subject             VARCHAR(200),
    email_body          TEXT NOT NULL,
    is_whistleblower    BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT NOW()
);

ALTER TABLE whistleblower_emails ADD CONSTRAINT chk_emails_date
    CHECK (email_date BETWEEN '2025-10-01' AND '2025-12-31');
```

**Seeded content requirements:**
- 8 rows total — manually crafted, not generated
- 1 row with `is_whistleblower = TRUE`, `sender = 'jennifer.chen@gulfstream.com'`
- Whistleblower email body must contain: "ADJ_0847", "ADJ_0912", "ADJ_1034",
  "legacy approach", "v2 optional", "$22M", "Team_Delta"

---

### Table 7: training_records (450 rows)

```sql
CREATE TABLE training_records (
    record_id           SERIAL PRIMARY KEY,
    adjuster_id         VARCHAR(10) NOT NULL,
    training_date       DATE NOT NULL,
    training_module     VARCHAR(50) NOT NULL,
    completion_status   VARCHAR(20) DEFAULT 'Complete',
    test_score          DECIMAL(5,2),
    trainer_notes       TEXT,
    created_at          TIMESTAMP DEFAULT NOW()
);

ALTER TABLE training_records ADD CONSTRAINT fk_training_adjuster
    FOREIGN KEY (adjuster_id) REFERENCES adjusters(adjuster_id);
ALTER TABLE training_records ADD CONSTRAINT chk_training_module
    CHECK (training_module IN
           ('Reserve_Model_v1', 'Reserve_Model_v2', 'Compliance', 'Customer_Service'));
ALTER TABLE training_records ADD CONSTRAINT chk_training_date
    CHECK (training_date >= (SELECT hire_date FROM adjusters
                             WHERE adjusters.adjuster_id = training_records.adjuster_id));
```

**Generator requirements:**
- Every adjuster: `Reserve_Model_v1` record within 60 days of hire
- Non-leaking adjusters: `Reserve_Model_v2` record between 2024-10-01 and 2024-11-15
- ADJ_0847, ADJ_0912, ADJ_1034: **no** `Reserve_Model_v2` record

---

### Table 8: financial_impact (24 rows)

```sql
CREATE TABLE financial_impact (
    month_id            SERIAL PRIMARY KEY,
    impact_month        DATE NOT NULL,
    region              VARCHAR(20) NOT NULL,
    team                VARCHAR(20) NOT NULL,
    leakage_amount      DECIMAL(12,2) DEFAULT 0,
    claims_affected     INTEGER DEFAULT 0,
    avg_leakage_per_claim DECIMAL(10,2),
    created_at          TIMESTAMP DEFAULT NOW()
);

ALTER TABLE financial_impact ADD CONSTRAINT chk_financial_month
    CHECK (EXTRACT(DAY FROM impact_month) = 1);
ALTER TABLE financial_impact ADD CONSTRAINT chk_financial_region
    CHECK (region IN ('Northeast', 'Southeast', 'Midwest', 'West', 'Gulf_Coast'));
ALTER TABLE financial_impact ADD CONSTRAINT chk_financial_team
    CHECK (team IN ('Team_Alpha', 'Team_Bravo', 'Team_Charlie', 'Team_Delta'));
```

**Generator requirements:**
- Gulf Coast / Team_Delta monthly pattern:
  - Months 2024-01 to 2024-10: `leakage_amount = $0`
  - Month 2024-11: $1.2M, 450 claims
  - Month 2024-12: $2.8M, 890 claims
  - Months 2025-01 to 2025-10: $2.0M–$2.5M per month
  - Months 2025-11 to 2025-12: $1.5M (mitigation begins)
  - Cumulative total: $22.4M
- All other region/team combinations: `leakage_amount = $0`

---

## Relationship diagram

```
adjusters (120) ─────────< claims (500K)
                ─────────< adjuster_notes (15K)
                ─────────< call_center_logs (50K)
                ─────────< training_records (450)

claims (500K) ───────────< adjuster_notes (15K)
              ───────────< call_center_logs (50K)

reserve_model_outputs (365) — aggregated, no FK
financial_impact (24)       — aggregated, no FK
whistleblower_emails (8)    — seeded, no FK
```

---

## Temporal ordering rules (critical for generator)

| Entity | Temporal constraint |
|---|---|
| `adjusters.hire_date` | 2020-2024 |
| `claims.incident_date` | 2024-01-01 to 2025-12-31 |
| `claims.reported_date` | ≥ `incident_date`, ≤ `incident_date + 30 days` |
| `claims.closed_date` | ≥ `reported_date`, ≤ `reported_date + 180 days` (or NULL) |
| `adjuster_notes.note_date` | ≥ `claim.reported_date` |
| `call_center_logs.call_date` | ≥ `claim.reported_date` |
| `training_records.training_date` | ≥ `adjuster.hire_date` |
| `reserve_model_outputs.model_date` | Daily, no gaps |
| `financial_impact.impact_month` | First day of month, no gaps |

---

## Cardinality summary

| Relationship | Cardinality |
|---|---|
| adjusters → claims | 1 : ~4,000 avg |
| adjusters → adjuster_notes | 1 : ~125 avg |
| adjusters → call_center_logs | 1 : ~400 avg |
| adjusters → training_records | 1 : 3-5 |
| claims → adjuster_notes | 1 : 0-3 |
| claims → call_center_logs | 1 : 0-2 |

---

## Hidden pattern summary (for generator logic)

| Pattern | Location | Value |
|---|---|---|
| Leaking claims | region='Gulf_Coast', team='Team_Delta', date ≥ 2024-11-01 | 18,000 claims, $22.4M |
| Missing v2 training | adjuster_id IN ('ADJ_0847','ADJ_0912','ADJ_1034') | No v2 record |
| Euphemisms in notes | Same three adjusters, date ≥ 2024-11-01 | 10-15 per adjuster |
| Model drift | region='Gulf_Coast', date ≥ 2024-11-15 | Variance +5% → +34% |
| Call center degradation | Gulf_Coast / Team_Delta, date ≥ 2024-11-01 | Sentiment -0.6, escalations 18% |
| Hallucination trap | Unrelated note in adjuster_notes | Contains "fraud" — unrelated to the three adjusters |

---

## Validation queries suite

Run all 15 before releasing the module to confirm patterns are embedded.

### V1 — Row counts
```sql
SELECT 'adjusters' AS table_name, COUNT(*) AS row_count FROM adjusters
UNION ALL SELECT 'claims', COUNT(*) FROM claims
UNION ALL SELECT 'adjuster_notes', COUNT(*) FROM adjuster_notes
UNION ALL SELECT 'reserve_model_outputs', COUNT(*) FROM reserve_model_outputs
UNION ALL SELECT 'call_center_logs', COUNT(*) FROM call_center_logs
UNION ALL SELECT 'whistleblower_emails', COUNT(*) FROM whistleblower_emails
UNION ALL SELECT 'training_records', COUNT(*) FROM training_records
UNION ALL SELECT 'financial_impact', COUNT(*) FROM financial_impact;
```

### V2 — Foreign key integrity (all should return 0)
```sql
SELECT COUNT(*) AS orphaned_claims FROM claims c
LEFT JOIN adjusters a ON c.adjuster_id = a.adjuster_id WHERE a.adjuster_id IS NULL;

SELECT COUNT(*) AS orphaned_notes FROM adjuster_notes n
LEFT JOIN claims c ON n.claim_id = c.claim_id WHERE c.claim_id IS NULL;

SELECT COUNT(*) AS orphaned_calls FROM call_center_logs cl
LEFT JOIN claims c ON cl.claim_id = c.claim_id WHERE c.claim_id IS NULL;
```

### V3 — Temporal ordering (all should return 0)
```sql
SELECT COUNT(*) AS invalid_claim_dates FROM claims
WHERE reported_date < incident_date;

SELECT COUNT(*) AS invalid_note_dates FROM adjuster_notes n
JOIN claims c ON n.claim_id = c.claim_id WHERE n.note_date < c.reported_date;

SELECT COUNT(*) AS invalid_training_dates FROM training_records tr
JOIN adjusters a ON tr.adjuster_id = a.adjuster_id
WHERE tr.training_date < a.hire_date;
```

### V4 — Leaking claims pattern
```sql
SELECT region, adjuster_team,
    COUNT(*) AS leaking_claims,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct_of_all_leaks
FROM claims WHERE is_leaking = TRUE
GROUP BY region, adjuster_team ORDER BY leaking_claims DESC;
-- Expected: Gulf_Coast + Team_Delta = ~97% of all leaks
```

### V5 — Three leaking adjusters
```sql
SELECT adjuster_id, training_module, last_training_date
FROM adjusters WHERE training_module = 'Reserve_Model_v1'
AND last_training_date < '2024-11-01';
-- Expected: exactly 3 rows (ADJ_0847, ADJ_0912, ADJ_1034)
```

### V6 — Euphemisms in notes
```sql
WITH euphemisms AS (
    SELECT adjuster_id, COUNT(*) AS euphemism_count
    FROM adjuster_notes
    WHERE note_text ILIKE '%legacy approach%'
       OR note_text ILIKE '%old guidelines%'
       OR note_text ILIKE '%pre-model%'
       OR note_text ILIKE '%v1%'
       OR note_text ILIKE '%optional%'
       OR note_text ILIKE '%prior approval%'
       OR note_text ILIKE '%what works%'
    GROUP BY adjuster_id
)
SELECT a.adjuster_id, a.training_module, COALESCE(e.euphemism_count, 0) AS euphemism_count
FROM adjusters a LEFT JOIN euphemisms e ON a.adjuster_id = e.adjuster_id
ORDER BY euphemism_count DESC;
-- Expected: ADJ_0847, ADJ_0912, ADJ_1034 have 10-15 each; all others have 0
```

### V7 — Model drift
```sql
SELECT model_date, region, variance,
    CASE
        WHEN model_date < '2024-11-15' THEN 'pre-drift'
        WHEN model_date <= '2024-11-30' THEN 'drift-start'
        WHEN model_date <= '2025-02-28' THEN 'accelerating'
        WHEN model_date <= '2025-08-31' THEN 'peak'
        ELSE 'detection'
    END AS drift_phase
FROM reserve_model_outputs
WHERE region = 'Gulf_Coast' AND model_version = 'v2'
ORDER BY model_date;
-- Expected: variance progression +5% → +34% across phases
```

### V8 — Call center degradation
```sql
SELECT region, adjuster_team,
    AVG(sentiment_score) AS avg_sentiment,
    AVG(CASE WHEN topic = 'Amount' THEN 1 ELSE 0 END) AS pct_amount_topic,
    AVG(CASE WHEN escalated_to_supervisor THEN 1 ELSE 0 END) AS escalation_rate
FROM call_center_logs WHERE call_date >= '2024-11-01'
GROUP BY region, adjuster_team ORDER BY avg_sentiment ASC;
-- Expected: Gulf_Coast+Team_Delta: sentiment -0.6, amount 25%, escalation 18%
```

### V9 — Whistleblower email
```sql
SELECT email_id, sender, is_whistleblower, LEFT(email_body, 300) AS preview
FROM whistleblower_emails WHERE is_whistleblower = TRUE;
-- Expected: 1 row, sender = jennifer.chen@gulfstream.com
-- email_body contains ADJ_0847, ADJ_0912, ADJ_1034
```

### V10 — Missing v2 training
```sql
SELECT a.adjuster_id, COUNT(tr.record_id) AS v2_count
FROM adjusters a
LEFT JOIN training_records tr
    ON a.adjuster_id = tr.adjuster_id AND tr.training_module = 'Reserve_Model_v2'
GROUP BY a.adjuster_id HAVING COUNT(tr.record_id) = 0;
-- Expected: exactly 3 rows (the three leaking adjusters)
```

### V11 — Financial impact
```sql
SELECT SUM(leakage_amount) AS total_leakage
FROM financial_impact WHERE region = 'Gulf_Coast' AND team = 'Team_Delta';
-- Expected: $22,400,000 (±$500,000 tolerance)
```

### V12 — Cross-table consistency
```sql
SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE c.is_leaking) / COUNT(*), 1) AS leak_pct
FROM claims c JOIN adjusters a ON c.adjuster_id = a.adjuster_id
WHERE c.region = 'Gulf_Coast' AND c.adjuster_team = 'Team_Delta'
  AND c.incident_date >= '2024-11-01'
  AND a.training_module = 'Reserve_Model_v2';
-- Expected: leak_pct = 0 (v2 adjusters have no leaks)
```

### V13-V15 — Null checks, domain constraints, pattern density
```sql
-- V13: Null checks (all should return 0)
SELECT COUNT(*) FROM claims WHERE reserve_initial IS NULL;
SELECT COUNT(*) FROM adjuster_notes WHERE note_text IS NULL;

-- V14: Domain constraints (all should return empty)
SELECT DISTINCT region FROM claims
WHERE region NOT IN ('Northeast', 'Southeast', 'Midwest', 'West', 'Gulf_Coast');

-- V15: Pattern density
SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE is_leaking) / COUNT(*), 2) AS leak_pct
FROM claims;
-- Expected: between 3.0% and 4.5%
```

---

## Grading rubric (6-axis)

Cascade Risk uses 6 axes (the standard 5 + AI Augmentation).
Total score: 6-24. Passing: 16. Excellence: 21+.

### Axis 1 — Investigative Reasoning (Weight: High)

| Score | Description | Cascade Risk specific |
|---|---|---|
| 1 | Surface pattern only — did not name adjusters | Failed to name ADJ_0847, ADJ_0912, ADJ_1034 |
| 2 | Named leakage but attributed to wrong cause (fraud, model error) | Blamed systemic issue without adjuster-level evidence |
| 3 | Named three adjusters, cited missing v2 training | Correct root cause with evidence |
| 4 | Also named management failure ("optional") and drift start date | Full causal chain, temporal precision |

### Axis 2 — Data Literacy (Weight: High)

| Score | Description | Cascade Risk specific |
|---|---|---|
| 1 | Queries returned wrong rows, misused JOINs | Could not isolate Gulf_Coast + Team_Delta |
| 2 | Correct queries but missed data quality flags | Ignored open claims (10% null closed_date) |
| 3 | Correct queries + flagged limitations | Noted open claims, date ranges, unstructured text |
| 4 | Advanced SQL + AI-assisted unstructured text analysis | Window functions, CTEs, euphemism detection via AI |

### Axis 3 — Decision Intelligence (Weight: Medium)

| Score | Description | Cascade Risk specific |
|---|---|---|
| 1 | No recommendations or vague ("fix the problem") | "Retrain adjusters" with no timeline or owner |
| 2 | Generic recommendations, no owners | "Audit Team_Delta" without backfill or region scope |
| 3 | Three specific, owned, timed recommendations | Retrain (Feb 1), backfill reserves (Mar 1), audit other regions (Apr 1) |
| 4 | Included decision criteria and thresholds | "If variance not <5% within 60 days, escalate to board" |

### Axis 4 — Executive Communication (Weight: Medium)

| Score | Description | Cascade Risk specific |
|---|---|---|
| 1 | Disorganized, >1500 words, missing sections | No executive summary or "what we ruled out" |
| 2 | All sections present but verbose | Buried the lead |
| 3 | Clear, concise, decision-ready | CEO can read first 3 sentences and act |
| 4 | Anticipates follow-up questions, includes confidence levels | "95% confident the three adjusters caused $22.4M leakage" |

### Axis 5 — Epistemic Integrity (Weight: High — Signature Axis)

| Score | Description | Cascade Risk specific |
|---|---|---|
| 1 | Claimed fraud or systemic failure without evidence | "Adjusters committed fraud" — no fraud evidence exists |
| 2 | Correct findings but omitted null results | Did not state other regions have zero leakage |
| 3 | Explicitly documented what was ruled out | "No evidence of fraud. Model is correct. Cause: missing training." |
| 4 | Also disclosed ambiguity and what additional data would resolve it | "Cannot confirm if management directive was in writing. HR records audit needed." |

### Axis 6 — AI-Augmented Intelligence (Weight: Medium — Required for Level 4)

| Score | Description | Cascade Risk specific |
|---|---|---|
| 1 | No AI use or AI use not disclosed | Briefing does not mention AI |
| 2 | AI used for one task, not integrated | Used AI to summarize whistleblower email only |
| 3 | AI used across 3+ tasks, hallucination caught and corrected | AI fraud claim caught, corrected, documented |
| 4 | Reusable prompts submitted, post-mortem completed | Three prompt templates + post-mortem (see below) |

### Score interpretation

| Range | Label | Meaning |
|---|---|---|
| 21-24 | Distinguished | Board-ready briefing. Would hire as Head of Analytics. |
| 18-20 | Proficient | Would trust with complex investigation. Minor improvements. |
| 16-17 | Developing | Meets minimum. Missed nuance or buried key finding. |
| <16 | Incomplete | Would not brief CEO. Module retake required. |

---

## The AI hallucination trap (critical design element)

The database contains one adjuster note from an unrelated department
that uses the word "fraud." When a learner asks an AI to summarize the
adjuster notes, a hallucinating AI will surface this note and conclude
fraud is the root cause.

**The correct answer:** There is no fraud. The three adjusters used
an outdated formula because they missed training. The management
called v2 "optional." No evidence of deliberate wrongdoing exists
in the claims data, model outputs, or training records.

**What a Level 3 learner does:** Notices the AI's fraud conclusion,
checks the claims data to verify, finds no fraud pattern, and
corrects the briefing.

**What a Level 4 learner does:** Catches the hallucination, documents
it in the AI use disclosure section of the briefing, adds a guardrail
to the prompt template to prevent recurrence, and includes it in the
post-mortem.

---

## Level 4 prompt engineering guide

Level 4 requires three reusable prompt templates and a post-mortem.

### Prompt Template 1 — Adjuster notes summarization

```
## ROLE
You are a forensic data analyst specializing in insurance claims leakage.

## CONTEXT
I have 15,000 adjuster notes from a P&C insurer.
Three adjusters in the Gulf Coast region may be using an outdated
reserve formula. They insert euphemisms rather than stating directly
that they skipped v2 training.

## TASK
Analyze the attached notes (CSV) and:
1. Cluster euphemisms — identify all variations of: "legacy approach",
   "old guidelines", "pre-model update", "v1", "optional",
   "prior approval needed", "what works for me"
2. Flag adjusters who use these euphemisms >3 times in last 12 months
3. Time-series the usage frequency — did it increase after month 14?
4. Output a summary table:
   | adjuster_id | euphemism_count | first_use | last_use | trend |
5. Confidence score (0-100%) for each adjuster being "outdated"

## HALLUCINATION GUARDRAILS
- Do NOT invent adjuster IDs that don't exist in the data
- If a euphemism appears <3 times, flag as "low confidence"
- Explicitly state: "The following patterns were NOT found in the data"
- Do NOT conclude fraud unless verified across claims, model, and training data

## OUTPUT FORMAT
Return JSON: flagged_adjusters, euphemism_clusters,
time_series_summary, confidence_notes
```

### Prompt Template 2 — Reserve model drift detection

```
## ROLE
You are a quantitative analyst specializing in time-series anomaly detection.

## CONTEXT
Daily model_outputs data (365 days):
- predicted_reserve: what v2 model recommended
- actual_reserve: what adjusters set
- variance: (actual - predicted) / predicted * 100

## TASK
1. Identify the exact date when variance first exceeded +10% in any region
2. Run three methods and compare:
   - Moving average (30-day, 2 std deviations)
   - CUSUM (cumulative sum control chart)
   - Simple threshold (variance >+15% for 7 consecutive days)
3. Recommend which method is most appropriate for insurance reserve data
4. Segment by region and team — where is drift concentrated?
5. Project cumulative leakage if trend continues 3 more months

## HALLUCINATION GUARDRAILS
- Do NOT extrapolate beyond 3 months
- If variance reverts to normal in any region, state that explicitly
- Provide reproducible code (pseudo or Python) for all methods

## OUTPUT FORMAT
Return: drift_start_date, affected_segments, method_recommendation,
projected_leakage, reproducibility_note
```

### Prompt Template 3 — CEO briefing draft (with hallucination trap)

```
## ROLE
Senior analyst writing a briefing for the CEO of GulfStream Insurance.

## CONTEXT (verified findings only)
- Three adjusters (ADJ_0847, ADJ_0912, ADJ_1034) used outdated v1 formula
- Drift started 2024-11-15, Gulf Coast, Team_Delta
- Estimated leakage: $22.4M over 12 months
- Root cause: missing v2 training, NOT fraud

## TASK
Draft a CEO briefing (max 800 words) with:
1. Executive Summary (3 sentences max)
2. What We Found (root cause, evidence)
3. What We Recommend (3 specific actions, owners, timelines)
4. What We Ruled Out (explicitly: not fraud, not model error)
5. AI Use Disclosure (what AI tools used, how validated)

## HALLUCINATION TRAP — DO NOT INCLUDE IN OUTPUT
The database contains a note with the word "fraud" from an unrelated
department. This is NOT evidence of fraud. Do NOT mention fraud in the
briefing unless you have verified it across claims data, model outputs,
AND training records. You will find no evidence of fraud.

## TONE
Direct, quantified, actionable. CEO assigns owners tomorrow.
```

---

## Post-mortem template (required for Level 4)

```markdown
# AI-Augmentation Post-Mortem: Cascade Risk

## Analyst: [Name] · Date: [Date]

### 1. AI tools used
- [ ] LLM (specify): ___
- [ ] Code generation: ___
- [ ] Other: ___

### 2. Where AI succeeded
| Task | AI Output | How Validated | Time Saved |
|------|-----------|---------------|------------|
| | | | |

### 3. Where AI failed or hallucinated (required — be honest)
| Hallucination | How Detected | How Corrected | Prompt Fix |
|---------------|--------------|---------------|------------|
| | | | |

### 4. Reusable prompts (attach)
- [ ] Prompt 1: Adjuster notes summarization
- [ ] Prompt 2: Drift detection
- [ ] Prompt 3: Briefing draft

### 5. What you would change for the next analyst
[1-3 specific improvements]

### 6. One-sentence lesson for your team
[Example: "Always ask AI to state what it did NOT find."]
```

---

## Learner-facing module card copy

**For /companies page:**

```
Cascade Risk
InsurTech / Property & Casualty · Advanced · AI use encouraged

"The numbers say we're profitable.
The whistleblower says we're leaking $22M."

GulfStream Insurance has seen stable loss ratios for two years. But an
internal email to the CEO claims three adjusters in the Gulf Coast region
have been using an outdated reserve formula — and management called v2
"optional for high-performers." Estimated leakage: $22 million.

Is the whistleblower credible? Where is the money going?
You have 500,000 claims, 15,000 adjuster notes, and one email chain.
Find the root cause. Brief the CEO.

8 tables · ~585,000 rows · PostgreSQL · Unstructured text included
Est. time: 4-6 hours · AI use: encouraged (required for Level 4 score)

Credential: Solved Cascade Risk leakage using AI-augmented investigation
```

---

## Implementation checklist

**Data generation:**
- [ ] Run schema through proprietary generator
- [ ] Pass all 15 validation queries
- [ ] Manually seed 8 whistleblower emails
- [ ] Verify hallucination trap note exists (unrelated "fraud" mention)
- [ ] Confirm ADJ_0847, ADJ_0912, ADJ_1034 have no v2 training records
- [ ] Confirm cumulative leakage = $22.4M (±$500K)

**UI implementation (same pattern as existing modules):**
- [ ] Module card on /companies page
- [ ] Module landing page (company profile, crisis narrative, role)
- [ ] 5-phase investigation arc with phase labels
- [ ] SQL workbench (same PGlite implementation as other modules)
- [ ] AI tool disclosure field in briefing submission form
- [ ] 6-axis grading rubric in submit API
- [ ] Level 4 post-mortem submission (additional artifact)
- [ ] Credential display showing AI-Augmented Intelligence competency

**Grader configuration:**
- [ ] Update grading prompt to include 6th axis (AI Augmentation)
- [ ] Add hallucination trap detection to grader context
- [ ] Calibrate: generic ~16/24, competent ~18/24, ideal ~22/24
- [ ] Reference briefing written and locked before publish

---

## Relationship to the curriculum

Cascade Risk completes the six-dimension curriculum:

```
NovaPay       → Financial Intelligence
SupplyLink    → Operational Intelligence
TowerNet      → Strategic Intelligence
ClearBank     → Decision Intelligence
MedCore       → Healthcare Systems Intelligence
OncoCare      → Clinical Intelligence
Cascade Risk  → AI-Augmented Intelligence ← This module
```

A learner who completes all seven modules has interrogated seven
companies, resolved seven crises, written seven CEO briefings,
and earned up to seven publicly verifiable credentials.

The Atelier Rank profile will show competency evidence across
all six dimensions — including AI-Augmented Intelligence for
learners who complete Cascade Risk.

---

*Mpingo Systems LLC · Raleigh, NC*  
*CASCADE-RISK-MODULE-SPEC v1.0 · June 15, 2026*  
*Reference document for data generation, UI implementation, and grader configuration*
