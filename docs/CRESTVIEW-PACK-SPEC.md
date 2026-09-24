# Crestview National Bank — Pack Specification
## Atelier Module 08 · Financial Intelligence (Treasury & Model Risk)
**Version:** 1.0 · September 2026  
**Owner:** Eddy Mkwambe · Mpingo Systems LLC  
**Status:** Approved — ready for pack JSON authoring and data generation  
**Environment:** Time Series Workbench (DuckDB WASM) · Bridge: SQL Workbench (PGlite)  
**Read alongside:** PACK-AUTHORING-GUIDE.md · ATELIER-INFRASTRUCTURE-ROADMAP.md · CASCADE-RISK-MODULE-SPEC.md

---

## What this chat does

- Authors the Crestview pack JSON specification
- Defines the hidden story and all three crisis layers
- Specifies all table schemas, row budgets, and generator requirements
- Documents enforcer transformation rules and self-check targets
- Produces the Atelier module content spec (exercises, rubric, citations)

## What Claude Code does (separate session)

- Builds the enforcer script (`enforce-crestview-story.mjs`)
- Builds the scenario generator (`generate-crestview-scenarios.mjs`)
- Builds `content/companies/crestview/exercises.ts`
- Builds `content/companies/crestview/rubric.ts`
- Builds `content/companies/crestview/citations.ts`
- Builds `content/companies/crestview/scenarios.ts`
- Builds all app pages (`/companies/crestview/*`)
- Wires module into the platform router

---

## Company profile

| Attribute | Value |
|---|---|
| **Company name** | Crestview National Bank |
| **Slug** | `crestview` |
| **Industry** | Regional Banking / Treasury & Model Risk Management |
| **Charter type** | National bank (OCC-regulated) |
| **Size** | Mid-size regional — $4.2B total assets |
| **Geography** | Southeast US, 12 branch locations |
| **Core products** | Commercial lending, retail deposits, sweep accounts, treasury services |
| **Regulatory framework** | OCC, Federal Reserve SR 11-7 (Model Risk Management) |
| **Learner role** | VP of Model Risk Management |
| **Time to complete** | 4-5 hours |
| **Difficulty** | Advanced |
| **Dimension** | Financial Intelligence (primary) · Decision Intelligence (secondary) |
| **Environment** | Time Series Workbench (DuckDB) · Bridge: SQL Workbench |
| **Tables** | 10 |
| **Total rows** | ~1,825 daily snapshots + ~15,000 supporting transactional rows |

---

## The crisis narrative (learner-facing)

> "Crestview National Bank has operated with stable headline liquidity metrics for three
> years. Net Interest Margin is under pressure but within guidance. The deposit base
> looks diversified. Reserves appear compliant.
>
> You are the VP of Model Risk Management. The Federal Reserve's CCAR/DFAST stress
> test submission window opens in 72 hours. The internal model validation team flagged
> a Population Stability Index score of 0.31 on the liquidity forecasting model —
> above the 0.25 SR 11-7 alert threshold. Nobody has acted on it.
>
> If Crestview submits the current model to the Fed unchanged, examiners will find
> what the PSI score is already telling you: the model was built for a zero-rate world.
> The world changed 250 basis points ago.
>
> You have the database. You have 72 hours. Find out how bad it is and brief the CEO."

---

## The hidden crisis — three interlocking failure modes

### Crisis Layer 1 — Deposit concentration and sweep flight

**Surface signal:** Aggregate retail deposit balances are stable. NIM compression is within guidance. No depositor panic.

**The hidden reality:**
Decomposed by customer tier and product type, commercial sweep accounts —
representing 40% of total deposit volume — are systematically routing funds
off-balance-sheet every business day at 4:30pm into money market funds
to capture the higher yields following the Fed's 250bps rate hike cycle.

The flight is not random. It is concentrated in two NAICS segments:
- Technology companies (NAICS 54) — rate-elastic, treasury-managed cash
- Real estate investment firms (NAICS 53) — large balances, daily sweep discipline

These segments represent 67% of the commercial sweep volume.
They have been silently draining $18-22M per day from settled balances
since month 15 of the dataset (when the Fed crossed the 2.75% threshold).

**What the learner discovers:**
By decomposing `daily_deposit_snapshots` by `product_type` and `naics_segment`,
the learner sees stable aggregate but collapsing commercial sweep balances.
The pattern is invisible in the headline number and obvious in the decomposition.

**Quantified impact:** $1.4B in rate-sensitive commercial sweep deposits
at flight risk if the Fed raises another 25bps. Current model treats these
deposits as stable retail — it does not know they sweep daily.

---

### Crisis Layer 2 — Model drift under SR 11-7

**Surface signal:** The liquidity forecasting model (v1_static_2021) produces
daily outflow predictions. The predictions look plausible. Nobody has
challenged them since the model was validated in 2021.

**The hidden reality:**
The model was trained during a zero-rate regime (Fed funds: 0.25%).
Its behavioral assumptions about commercial deposit retention were calibrated
on 2019-2021 data when sweep activity was minimal — commercial clients held
balances for relationship reasons, not yield reasons.

After the Fed raised rates 250bps, commercial client behavior changed
fundamentally. But the model's parameters did not. It continued predicting
outflows based on pre-hike behavioral coefficients.

**The drift pattern:**
- Months 1-14 (low rate regime): model predictions within ±3% of actuals
- Month 15 (Fed crosses 2.75%): prediction error begins widening
- Month 18-24 (peak rate regime): model systematically under-predicts
  actual outflows by 18-34% on commercial sweep settlement days

**The PSI signal:**
Population Stability Index on prediction residuals = 0.31
Threshold for "significant drift" under SR 11-7 = 0.25
The flag was raised. No action was taken. The submission window is now open.

**Regulatory exposure:**
Submitting a model with PSI > 0.25 to the Fed's CCAR/DFAST process without
a documented remediation plan or model overlay constitutes a violation of
SR 11-7 conceptual soundness requirements. The consequence: capital add-on
penalty, mandatory model redevelopment timeline, possible MRA (Matter
Requiring Attention) in the exam report.

---

### Crisis Layer 3 — Settlement lag cascade

**Surface signal:** Treasury reports available balance each morning.
The number looks adequate. Reserves appear compliant.

**The hidden reality:**
ACH and wire settlement lags of 1-2 business days create systematic
overstatement of available liquidity in the morning balance report.

On Monday mornings specifically, the available balance report reflects
Friday's settled position PLUS Saturday and Sunday's incoming ACH credits
that have NOT yet cleared. The weekend ACH queue (2 days of retail payroll
direct deposits and business receipts) artificially inflates the Monday
morning balance by $31-47M on average.

Treasury uses the Monday morning available balance to make intraday
borrowing decisions. On weeks when commercial sweep flight is elevated
(typically month-end, when real estate firms rebalance), the combination of:
- Overstated available balance (settlement lag illusion)
- Underpredicted outflows (model drift)
- Elevated sweep departure (deposit flight)

...has forced Crestview into the Federal Reserve Discount Window three times
in the last six months. Each Discount Window borrowing was classified as
"routine short-term funding" in internal reports. They are not routine —
they are the symptom of three simultaneous structural failures.

**Quantified impact:** On the worst day in the dataset, actual settled liquidity
was $54M lower than reported available balance. The model predicted $12M in
outflows. Actual net outflows were $67M. The gap was $55M — covered by
$50M Discount Window borrowing at penalty rates.

---

## The decision the CEO must make

Two options the learner must evaluate and recommend from:

**Option A — Immediate model overlay + regulatory disclosure (recommended)**
- Apply a +22% conservative overlay to all model outflow predictions
  before the CCAR/DFAST submission (covers the observed drift margin)
- Disclose the PSI finding proactively to the OCC examiner in a
  pre-submission conversation
- Begin formal SR 11-7 model redevelopment with 90-day timeline
- Cost: regulatory goodwill, 90-day redevelopment sprint, no capital penalty

**Option B — Submit unchanged, manage findings reactively**
- Submit current model as-is to the Fed
- Rely on the compliance team to respond to examiner questions
- Risk: MRA, capital add-on (estimated $180-240M based on exposure),
  public disclosure of model risk deficiency, reputational damage
- This option is not recommended — the data makes the exposure undeniable

The learner must quantify both options from the data and recommend Option A
with specific numbers — not as a generic compliance recommendation but as
a financially justified business decision.

---

## What cannot be confirmed yet (epistemic honesty requirements)

The CEO Briefing must acknowledge:

1. The PSI calculation uses internal residuals — independent validation
   by a third party has not been completed
2. The $1.4B sweep flight estimate assumes current client behavior persists —
   a Fed rate cut would change the calculus materially
3. Three Discount Window borrowings are confirmed in the data — whether
   this has been reported to the board's risk committee is not visible
   in the available tables
4. The 90-day model redevelopment timeline assumes no additional rate changes —
   a surprise Fed move during redevelopment would require a timeline extension

---

## Database schema — 10 tables

### Architecture note

Crestview uses a hybrid schema:
- Daily time-series tables (rows = one per day = 1,825 rows for 5 years)
- Reference/entity tables (static — customers, products, rate environments)
- Event tables (Discount Window borrowings, model validation flags)

The time-series tables are the investigation backbone.
The entity tables provide the decomposition dimensions.
The event tables provide the smoking gun evidence.

---

### Table 1: rate_environments (6 rows — seeded, not generated)

```sql
CREATE TABLE rate_environments (
    env_id              VARCHAR(10) PRIMARY KEY,
    regime_name         VARCHAR(50) NOT NULL,
    start_date          DATE NOT NULL,
    end_date            DATE,
    fed_funds_rate      DECIMAL(5,2) NOT NULL,
    regime_type         VARCHAR(20) NOT NULL,
    model_trained_in    BOOLEAN NOT NULL DEFAULT FALSE
);
```

**Seeded rows (fixed):**

| env_id | regime_name | start_date | end_date | fed_funds_rate | regime_type | model_trained_in |
|---|---|---|---|---|---|---|
| ENV_001 | Zero Rate Floor | 2021-01-01 | 2022-02-28 | 0.25 | low_rate | TRUE |
| ENV_002 | Initial Liftoff | 2022-03-01 | 2022-08-31 | 1.00 | rising_rate | FALSE |
| ENV_003 | Aggressive Hike | 2022-09-01 | 2023-01-31 | 2.75 | rising_rate | FALSE |
| ENV_004 | Peak Rate | 2023-02-01 | 2024-06-30 | 5.25 | high_rate | FALSE |
| ENV_005 | Initial Easing | 2024-07-01 | 2025-03-31 | 4.50 | falling_rate | FALSE |
| ENV_006 | Continued Easing | 2025-04-01 | NULL | 3.75 | falling_rate | FALSE |

**Critical design note:** `model_trained_in = TRUE` only for ENV_001.
This is the smoking gun in the rate environment table —
the model was validated in a world that no longer exists.

---

### Table 2: customer_segments (12 rows — seeded)

```sql
CREATE TABLE customer_segments (
    segment_id          VARCHAR(10) PRIMARY KEY,
    segment_name        VARCHAR(50) NOT NULL,
    tier                VARCHAR(20) NOT NULL,
    naics_code          VARCHAR(10),
    naics_description   VARCHAR(100),
    sweep_eligible      BOOLEAN NOT NULL DEFAULT FALSE,
    rate_elasticity     VARCHAR(10) NOT NULL,
    est_balance_pct     DECIMAL(5,2) NOT NULL
);
```

**Seeded rows (fixed):**

| segment_id | segment_name | tier | naics_code | sweep_eligible | rate_elasticity | est_balance_pct |
|---|---|---|---|---|---|---|
| SEG_001 | Retail Checking | retail | NULL | FALSE | low | 18.5 |
| SEG_002 | Retail Savings | retail | NULL | FALSE | low | 12.3 |
| SEG_003 | Small Business | commercial | 44-45 | FALSE | medium | 8.2 |
| SEG_004 | Commercial Tech | commercial | 54 | TRUE | high | 14.7 |
| SEG_005 | Commercial RE | commercial | 53 | TRUE | high | 11.8 |
| SEG_006 | Commercial Mfg | commercial | 31-33 | TRUE | medium | 9.4 |
| SEG_007 | Commercial Health | commercial | 62 | TRUE | medium | 6.1 |
| SEG_008 | Municipal | public | NULL | FALSE | low | 7.3 |
| SEG_009 | Wealth Mgmt | retail | NULL | FALSE | low | 5.9 |
| SEG_010 | Commercial Agri | commercial | 11 | TRUE | low | 3.2 |
| SEG_011 | Nonprofit | nonprofit | NULL | FALSE | low | 1.8 |
| SEG_012 | Commercial Other | commercial | NULL | TRUE | medium | 0.8 |

**Critical design note:** SEG_004 (Tech) and SEG_005 (Real Estate) are
`rate_elasticity = high` and `sweep_eligible = TRUE`. Together they represent
26.5% of estimated balances but will drive 67% of sweep flight activity.

---

### Table 3: daily_deposit_snapshots (1,825 rows)

The primary investigation table. One row per calendar day, 5 years.

```sql
CREATE TABLE daily_deposit_snapshots (
    snapshot_date           DATE PRIMARY KEY,
    env_id                  VARCHAR(10) NOT NULL,
    total_deposits_mm       DECIMAL(12,2) NOT NULL,
    retail_deposits_mm      DECIMAL(12,2) NOT NULL,
    commercial_deposits_mm  DECIMAL(12,2) NOT NULL,
    sweep_deposits_mm       DECIMAL(12,2) NOT NULL,
    non_sweep_commercial_mm DECIMAL(12,2) NOT NULL,
    tech_segment_mm         DECIMAL(12,2) NOT NULL,
    re_segment_mm           DECIMAL(12,2) NOT NULL,
    other_commercial_mm     DECIMAL(12,2) NOT NULL,
    day_over_day_change_mm  DECIMAL(10,2),
    is_month_end            BOOLEAN NOT NULL DEFAULT FALSE,
    is_monday              BOOLEAN NOT NULL DEFAULT FALSE,
    day_of_week             INTEGER NOT NULL
);

ALTER TABLE daily_deposit_snapshots ADD CONSTRAINT fk_deposits_env
    FOREIGN KEY (env_id) REFERENCES rate_environments(env_id);
```

**Generator requirements:**

- 1,825 rows (Jan 1 2021 — Dec 31 2025, daily, no gaps)
- `env_id` assigned by date range matching `rate_environments`
- `total_deposits_mm` starts at ~$2,800M (aggregate of all segments)
- `retail_deposits_mm` stays stable throughout (~$870M ± 5%)
- `commercial_deposits_mm` = sweep + non-sweep commercial
- `sweep_deposits_mm` behavior by regime:
  - ENV_001 (low rate): stable at ~$1,050M ± 3%
  - ENV_002 (initial liftoff): begins slow decline, ~$1,020M
  - ENV_003 (aggressive hike): accelerating decline, ~$940M
  - ENV_004 (peak rate): rapid flight, ~$760M (peak outflow period)
  - ENV_005-006 (easing): partial recovery, ~$820M
- `tech_segment_mm` and `re_segment_mm` drive 67% of sweep decline
- `is_month_end = TRUE` on last business day of each month
- `is_monday = TRUE` on Mondays
- `day_over_day_change_mm` = today - yesterday (can be negative)

**The hidden pattern:**
Sweep deposits decline 27.6% from ENV_001 to ENV_004 peak.
Retail deposits decline only 2.1% over same period.
The aggregate `total_deposits_mm` declines only 11.3% — retail stability masks the sweep flight.

---

### Table 4: daily_liquidity_model_outputs (1,825 rows)

The model's daily predictions vs actuals. The drift evidence lives here.

```sql
CREATE TABLE daily_liquidity_model_outputs (
    snapshot_date           DATE PRIMARY KEY,
    env_id                  VARCHAR(10) NOT NULL,
    model_version           VARCHAR(20) NOT NULL,
    predicted_net_outflow_mm DECIMAL(10,2) NOT NULL,
    actual_net_outflow_mm   DECIMAL(10,2) NOT NULL,
    prediction_error_mm     DECIMAL(10,2) NOT NULL,
    prediction_error_pct    DECIMAL(6,2) NOT NULL,
    psi_rolling_90d         DECIMAL(6,4),
    stress_event_flag       BOOLEAN NOT NULL DEFAULT FALSE,
    model_alert_flag        BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE daily_liquidity_model_outputs ADD CONSTRAINT fk_model_env
    FOREIGN KEY (env_id) REFERENCES rate_environments(env_id);
```

**Generator requirements:**

- 1,825 rows, one per day
- `model_version = 'v1_static_2021'` throughout (model never updated)
- Prediction error pattern by regime:
  - ENV_001: error within ±3% (model trained here — accurate)
  - ENV_002: error widens to ±6%
  - ENV_003: error widens to ±12%, starts skewing negative (under-predicting)
  - ENV_004: error -18% to -34% on commercial sweep settlement days
  - ENV_005-006: error narrows slightly but remains negative
- `prediction_error_pct` = (actual - predicted) / predicted × 100
  - Negative = under-prediction (model thinks less cash is leaving than actually is)
- `psi_rolling_90d`:
  - NULL for first 90 days (insufficient history)
  - Stays below 0.10 through ENV_001 and ENV_002
  - Crosses 0.25 alert threshold at month 18 (ENV_003)
  - Reaches 0.31 at the investigation start date (the PSI flag)
- `stress_event_flag = TRUE` on days when actual outflow > 99th percentile
- `model_alert_flag = TRUE` when `psi_rolling_90d > 0.25`
  - First alert: month 18 — never acted upon
  - Active for last 6 months of dataset

---

### Table 5: daily_available_balance (1,825 rows)

The settlement lag illusion lives here.

```sql
CREATE TABLE daily_available_balance (
    snapshot_date               DATE PRIMARY KEY,
    reported_available_mm       DECIMAL(12,2) NOT NULL,
    actual_settled_mm           DECIMAL(12,2) NOT NULL,
    pending_ach_credits_mm      DECIMAL(10,2) NOT NULL DEFAULT 0,
    pending_wire_credits_mm     DECIMAL(10,2) NOT NULL DEFAULT 0,
    settlement_overstatement_mm DECIMAL(10,2) NOT NULL,
    is_monday                   BOOLEAN NOT NULL DEFAULT FALSE,
    is_post_holiday             BOOLEAN NOT NULL DEFAULT FALSE,
    discount_window_used        BOOLEAN NOT NULL DEFAULT FALSE
);
```

**Generator requirements:**

- 1,825 rows
- `reported_available_mm` = `actual_settled_mm` + pending credits (what treasury sees)
- `actual_settled_mm` = true cleared funds (what is actually available)
- `settlement_overstatement_mm` = reported - actual
  - Normal days: overstatement $2-8M (routine ACH float)
  - Monday mornings: overstatement $31-47M (2 days of weekend ACH queue)
  - Post-holiday: overstatement $38-55M (holiday queue clearing)
- `discount_window_used = TRUE` on 3 specific dates in ENV_004/005
  (the three Discount Window borrowings — exact dates seeded by enforcer)
- The worst day: `settlement_overstatement_mm = 54`, same day as
  highest model under-prediction and peak sweep flight
  (this three-way overlap is the smoking gun the learner must find)

---

### Table 6: model_validation_log (18 rows — seeded with enforcer)

The governance trail. Who knew what and when.

```sql
CREATE TABLE model_validation_log (
    log_id              SERIAL PRIMARY KEY,
    validation_date     DATE NOT NULL,
    model_version       VARCHAR(20) NOT NULL,
    validator_name      VARCHAR(100) NOT NULL,
    validation_type     VARCHAR(30) NOT NULL,
    psi_score           DECIMAL(6,4),
    outcome             VARCHAR(20) NOT NULL,
    action_required     TEXT,
    action_taken        TEXT,
    sr11_7_compliant    BOOLEAN NOT NULL DEFAULT TRUE
);
```

**Seeded content (critical for governance narrative):**

| validation_date | validation_type | psi_score | outcome | action_required | action_taken | sr11_7_compliant |
|---|---|---|---|---|---|---|
| 2021-06-15 | Initial Validation | 0.04 | APPROVED | None | Model approved for production | TRUE |
| 2022-01-10 | Annual Review | 0.07 | APPROVED | Monitor closely | Scheduled next review | TRUE |
| 2022-09-01 | Ad-hoc Review | 0.14 | APPROVED | Increase monitoring frequency | Added to quarterly queue | TRUE |
| 2023-01-15 | Quarterly Review | 0.22 | WARNING | Consider recalibration | Under review | FALSE |
| 2023-04-20 | Quarterly Review | 0.26 | **ALERT** | **Recalibration required** | **No action documented** | **FALSE** |
| 2023-07-18 | Quarterly Review | 0.28 | **ALERT** | **Immediate remediation** | **Deferred to Q4** | **FALSE** |
| 2023-10-12 | Quarterly Review | 0.29 | **ALERT** | **Escalate to CRO** | **Escalation email drafted, not sent** | **FALSE** |
| 2024-01-08 | Annual Review | 0.31 | **CRITICAL** | **CCAR submission at risk** | **Under investigation** | **FALSE** |

**This table is the governance failure evidence.** The PSI crossed 0.25 eight months ago.
Four consecutive alerts. No remediation. The learner finds this and it becomes
the most damning element of the CEO Briefing.

---

### Table 7: discount_window_events (3 rows — seeded)

The three emergency borrowings that no one called emergency.

```sql
CREATE TABLE discount_window_events (
    event_id            SERIAL PRIMARY KEY,
    event_date          DATE NOT NULL,
    amount_borrowed_mm  DECIMAL(10,2) NOT NULL,
    rate_charged_pct    DECIMAL(5,2) NOT NULL,
    duration_days       INTEGER NOT NULL,
    internal_classification VARCHAR(50) NOT NULL,
    reported_to_board   BOOLEAN NOT NULL DEFAULT FALSE,
    trigger_description TEXT NOT NULL
);
```

**Seeded rows (fixed):**

| event_date | amount_mm | rate_pct | duration | internal_classification | reported_to_board |
|---|---|---|---|---|---|
| 2023-09-29 | 50 | 5.75 | 1 | Routine Short-Term Funding | FALSE |
| 2024-01-31 | 75 | 5.75 | 1 | Routine Short-Term Funding | FALSE |
| 2024-03-29 | 50 | 5.75 | 1 | Routine Short-Term Funding | FALSE |

**The smoking gun triple:** All three events occur on the same date pattern —
quarter-end and month-end — when commercial sweep flight is at peak and
the settlement lag illusion is largest. The classification as
"routine short-term funding" is the governance failure the learner exposes.

---

### Table 8: fed_funds_rate_history (1,825 rows)

Daily macro environment. Supports the regime detection investigation.

```sql
CREATE TABLE fed_funds_rate_history (
    rate_date           DATE PRIMARY KEY,
    env_id              VARCHAR(10) NOT NULL,
    fed_funds_rate      DECIMAL(5,2) NOT NULL,
    rate_change_bps     INTEGER NOT NULL DEFAULT 0,
    is_fomc_decision_day BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE fed_funds_rate_history ADD CONSTRAINT fk_rate_env
    FOREIGN KEY (env_id) REFERENCES rate_environments(env_id);
```

**Generator requirements:**
- 1,825 rows, one per day
- `fed_funds_rate` matches the regime in `rate_environments`
- `rate_change_bps != 0` on FOMC decision dates only
- Actual FOMC dates from 2021-2025 seeded by enforcer (use real calendar)
- `is_fomc_decision_day = TRUE` on those dates

---

### Table 9: liquidity_coverage_ratio_daily (1,825 rows)

The regulatory compliance metric. Looks fine on the surface.

```sql
CREATE TABLE liquidity_coverage_ratio_daily (
    snapshot_date           DATE PRIMARY KEY,
    hqla_mm                 DECIMAL(12,2) NOT NULL,
    net_cash_outflow_30d_mm DECIMAL(12,2) NOT NULL,
    lcr_ratio               DECIMAL(6,2) NOT NULL,
    regulatory_minimum      DECIMAL(6,2) NOT NULL DEFAULT 100.00,
    lcr_buffer_pct          DECIMAL(6,2) NOT NULL,
    model_version_used      VARCHAR(20) NOT NULL DEFAULT 'v1_static_2021',
    actual_lcr_if_corrected DECIMAL(6,2)
);
```

**Generator requirements:**
- `lcr_ratio` stays above 105% throughout (appears compliant)
- `actual_lcr_if_corrected` = what LCR would be using corrected outflow predictions
  - ENV_001-002: matches `lcr_ratio` (model accurate)
  - ENV_003: `actual_lcr_if_corrected` dips to 102-103%
  - ENV_004: `actual_lcr_if_corrected` dips to 98-101% (below regulatory minimum)
  - Three dates in ENV_004: `actual_lcr_if_corrected` = 96-97%
    (same dates as Discount Window events — not coincidence)
- The key insight: reported LCR > 100% but corrected LCR < 100%
  on three dates. The model is hiding a regulatory breach.

---

### Table 10: reserve_buffer_calculations (1,825 rows)

Daily capital buffer required vs held. The financial impact quantification table.

```sql
CREATE TABLE reserve_buffer_calculations (
    snapshot_date               DATE PRIMARY KEY,
    model_predicted_buffer_mm   DECIMAL(10,2) NOT NULL,
    stress_adjusted_buffer_mm   DECIMAL(10,2) NOT NULL,
    actual_buffer_held_mm       DECIMAL(10,2) NOT NULL,
    buffer_gap_mm               DECIMAL(10,2) NOT NULL,
    k_factor                    DECIMAL(4,2) NOT NULL,
    market_volatility_index     DECIMAL(6,2) NOT NULL,
    buffer_adequate             BOOLEAN NOT NULL
);
```

**Generator requirements:**
- `model_predicted_buffer_mm` = model's recommendation (based on drifted predictions)
- `stress_adjusted_buffer_mm` = what buffer would be required using corrected outflows
- `buffer_gap_mm` = stress_adjusted - actual_held (negative = shortfall)
- `buffer_adequate = FALSE` when buffer_gap_mm < 0
  - Should be FALSE on the three Discount Window dates and surrounding days
- `k_factor` scales with `market_volatility_index`:
  - Low volatility (VIX proxy < 20): k = 1.65
  - Medium (20-30): k = 1.96
  - High (> 30): k = 2.58
  - Stress periods: k = 3.00

---

## Relationship diagram

```
rate_environments (6) ────────< daily_deposit_snapshots (1,825)
                      ────────< daily_liquidity_model_outputs (1,825)
                      ────────< fed_funds_rate_history (1,825)

customer_segments (12) — reference table, no FK in time-series tables
                         (decomposition via segment columns in deposit snapshots)

daily_available_balance (1,825) — standalone, aligned by date
model_validation_log (18) — standalone, aligned by date
discount_window_events (3) — standalone, aligned by date
liquidity_coverage_ratio_daily (1,825) — standalone, aligned by date
reserve_buffer_calculations (1,825) — standalone, aligned by date
```

**Note on schema design:** Most tables join by `snapshot_date` rather than FK.
This reflects real banking data architecture — time-series systems are
date-aligned, not FK-joined. DuckDB's ASOF JOIN handles this naturally.
In the SQL bridge (PGlite), learners use date equality joins.

---

## Row budget

| Table | Rows | Type |
|---|---|---|
| rate_environments | 6 | Seeded |
| customer_segments | 12 | Seeded |
| daily_deposit_snapshots | 1,825 | Generated + enforced |
| daily_liquidity_model_outputs | 1,825 | Generated + enforced |
| daily_available_balance | 1,825 | Generated + enforced |
| fed_funds_rate_history | 1,825 | Generated + enforced |
| liquidity_coverage_ratio_daily | 1,825 | Generated + enforced |
| reserve_buffer_calculations | 1,825 | Generated + enforced |
| model_validation_log | 18 | Seeded (enforcer) |
| discount_window_events | 3 | Seeded (enforcer) |
| **Total** | **~10,984** | |

---

## Story enforcement notes

### T0 — Seed static tables
Insert `rate_environments` (6 rows), `customer_segments` (12 rows),
`model_validation_log` (18 rows), `discount_window_events` (3 rows).
These are fixed — do not modify after seeding.

### T1 — Enforce regime-based deposit flight pattern
In `daily_deposit_snapshots`:
- Identify all rows where `env_id IN ('ENV_003', 'ENV_004')`
- Apply progressive `sweep_deposits_mm` decline to reach -27.6% by ENV_004 midpoint
- Concentrate decline in `tech_segment_mm` (-34%) and `re_segment_mm` (-31%)
- Keep `retail_deposits_mm` stable (±2% max variation)
- Ensure `total_deposits_mm` decline is only 11.3% (retail stability masks commercial flight)

### T2 — Enforce model drift pattern
In `daily_liquidity_model_outputs`:
- Rows in ENV_001: `prediction_error_pct` within ±3%
- Rows in ENV_003: `prediction_error_pct` -8% to -15% (negative = under-predicting)
- Rows in ENV_004: `prediction_error_pct` -18% to -34% on is_month_end and is_monday dates
- `psi_rolling_90d` crosses 0.25 at month 18, reaches 0.31 by investigation date
- Set `model_alert_flag = TRUE` for all rows where `psi_rolling_90d > 0.25`

### T3 — Enforce settlement lag pattern
In `daily_available_balance`:
- Monday rows: `settlement_overstatement_mm` = 31-47M
- Post-holiday rows: `settlement_overstatement_mm` = 38-55M
- Normal weekday rows: `settlement_overstatement_mm` = 2-8M
- Three specific dates (matching `discount_window_events`):
  `settlement_overstatement_mm` = 45-54M (worst cases)

### T4 — Enforce three-way overlap (the smoking gun)
On the three Discount Window event dates:
- `daily_deposit_snapshots.sweep_deposits_mm` at monthly low
- `daily_liquidity_model_outputs.prediction_error_pct` at -28% to -34%
- `daily_available_balance.settlement_overstatement_mm` at 45-54M
- `liquidity_coverage_ratio_daily.actual_lcr_if_corrected` = 96-97%
- `reserve_buffer_calculations.buffer_adequate = FALSE`

This is the convergence learners must find to write a 90+ CEO Briefing.
All five metrics misaligning simultaneously on the same three dates.

### T5 — Enforce temporal consistency
Ensure all daily tables have continuous date coverage with no gaps.
No NULL values in any `snapshot_date` column.
`day_of_week` and `is_monday` flags consistent with actual calendar.

### Self-check targets (enforcer must verify before completing)

| Metric | Target | HARD STOP if missed |
|---|---|---|
| Sweep deposit decline ENV_001→ENV_004 | -27.6% (±1%) | YES |
| Tech segment decline | -34% (±2%) | YES |
| RE segment decline | -31% (±2%) | YES |
| Retail deposit variation | ±2% max | YES |
| PSI first alert date | Month 18 (±1 month) | YES |
| PSI at investigation date | 0.31 (±0.02) | YES |
| Monday overstatement range | $31M-$47M | YES |
| Worst-day overstatement | $54M (±$3M) | YES |
| Discount Window events | Exactly 3 | YES |
| actual_lcr_if_corrected < 100% | Exactly 3 dates | YES |
| Three-way overlap dates | Same as Discount Window dates | YES |
| model_validation_log alerts | 4 consecutive ALERT rows | YES |

---

## The five investigation phases

### Phase 1 — Situation Awareness
*Competencies: Financial Intelligence, Data Literacy*

| Investigation | Business Question |
|---|---|
| 01 | Is Crestview's deposit base actually stable? |
| 02 | What does the Fed rate environment look like over the dataset period? |

**Phase purpose:** The surface metrics look fine. Total deposits have declined
modestly. The learner must establish the baseline before decomposing it.

---

### Phase 2 — Problem Identification
*Competencies: Analytical Reasoning, Financial Intelligence*

| Investigation | Business Question |
|---|---|
| 03 | How do deposit trends differ across product types and customer segments? |
| 04 | Which customer segments are driving the change, and why? |

**Phase purpose:** Decompose the aggregate. The retail/sweep split and the
NAICS segment breakdown are where the deposit flight becomes visible.
This is the first "aha" — the aggregate is fine, but the composition is not.

---

### Phase 3 — Root Cause Analysis
*Competencies: Causal Reasoning, Analytical Reasoning*

| Investigation | Business Question |
|---|---|
| 05 | How accurate has the liquidity forecasting model been over time? |
| 06 | When did prediction error begin widening, and what was happening in the macro environment? |
| 07 | What does the model validation log show about known issues? |

**Phase purpose:** Connect the deposit flight to the model failure.
The learner sees the PSI crossing 0.25, finds the validation log showing
four consecutive unacted alerts, and calculates the prediction error widening
by regime. This is the governance failure revelation.

---

### Phase 4 — Strategic Evaluation
*Competencies: Decision Intelligence, Financial Intelligence*

| Investigation | Business Question |
|---|---|
| 08 | What does the reported LCR look like vs what it would be with corrected outflow predictions? |
| 09 | What happened on the three dates when Crestview borrowed from the Discount Window? |
| 10 | What is the total financial exposure if the model is submitted to the Fed unchanged? |

**Phase purpose:** Quantify the stakes. The LCR gap, the Discount Window
convergence, and the regulatory exposure calculation give the CEO the
numbers needed to make the Option A vs Option B decision.

---

### Phase 5 — Executive Communication
*Competency: Executive Communication, Epistemic Integrity*

| Investigation | Business Question |
|---|---|
| → | CEO Briefing — 1,000 words max, 6 required sections |

**Briefing sections:**
1. Executive Summary (3 sentences — CEO can act on these alone)
2. What the Data Shows (three crisis layers, quantified)
3. The Regulatory Exposure (LCR gap, SR 11-7 violation, CCAR risk)
4. What We Recommend (Option A with specific numbers)
5. What We Ruled Out (retail deposit panic? exogenous shock? model error not drift?)
6. What We Cannot Yet Confirm (4 epistemic honesty requirements from crisis spec)

---

## Grading rubric (5-axis ADAI)

### Axis 1 — Pattern Detection (0-20)

| Score | Description | Crestview specific |
|---|---|---|
| 0-7 | Named one crisis only or described generic "model problems" | "The model is inaccurate" with no layer separation |
| 8-13 | Named two of the three crisis layers | Deposit flight + model drift, missed settlement lag |
| 14-17 | Named all three layers with evidence | Deposit flight, model drift, settlement lag — each cited |
| 18-20 | Named all three + identified the three-way convergence dates | Found the Discount Window overlap and quantified the compounding effect |

### Axis 2 — Data Fidelity (0-20)

| Score | Description | Crestview specific |
|---|---|---|
| 0-7 | Claims not grounded in data | "Deposits declined significantly" with no numbers |
| 8-13 | Some claims quantified, others asserted | Named the PSI but not the sweep decline percentage |
| 14-17 | All key claims quantified from data | -27.6% sweep decline, PSI 0.31, $54M worst-day gap |
| 18-20 | Quantified all three layers + cited specific dates | Three Discount Window dates named, three-way overlap quantified |

### Axis 3 — Causal Reasoning (0-20)

| Score | Description | Crestview specific |
|---|---|---|
| 0-7 | Correlation stated as causation, or wrong causal direction | "Rate hikes caused model failure" (incomplete) |
| 8-13 | Correct causal chain for one layer | Fed hike → sweep flight correctly identified |
| 14-17 | Correct causal chain for two layers | Fed hike → sweep flight → model under-prediction |
| 18-20 | Full three-layer causal chain | Fed hike → sweep flight → model drift (governance failure) → settlement lag illusion → Discount Window |

### Axis 4 — Decision Quality (0-20)

| Score | Description | Crestview specific |
|---|---|---|
| 0-7 | No recommendation or generic ("fix the model") | "We need to update our model risk framework" |
| 8-13 | Recommended Option A but without financial justification | "Apply a conservative overlay before submission" |
| 14-17 | Recommended Option A with numbers | "+22% overlay, 90-day redevelopment, proactive OCC disclosure" |
| 18-20 | Recommended Option A + quantified Option B risk | Option A cost vs Option B risk ($180-240M capital penalty) explicit |

### Axis 5 — Executive Communication (0-20)

| Score | Description | Crestview specific |
|---|---|---|
| 0-7 | Disorganized, missing sections, technical jargon for CEO | Deep model architecture explanation to a non-technical audience |
| 8-13 | All sections present, readable | CEO can understand the problem but not immediately act |
| 14-17 | Clear, concise, action-oriented | CEO reads 3-sentence summary and knows the decision they face |
| 18-20 | Anticipates CEO questions, confidence levels explicit | "We are 94% confident in the drift finding. The 6% uncertainty is..." |

**Passing score:** 70/100 · Excellence: 88/100

---

## Citation sources (research-backed distributions)

| Claim | Source |
|---|---|
| SR 11-7 model risk management requirements | Federal Reserve SR 11-7 (April 2011) — Model Risk Management |
| PSI thresholds (0.10 low, 0.25 significant) | OCC Model Risk Management Guidance (2011, updated 2021) |
| LCR regulatory minimum 100% | Basel III LCR Standard, BIS January 2013 |
| Commercial sweep account rate elasticity | FDIC Quarterly Banking Profile, 2023 Q4 — deposit migration analysis |
| ACH settlement lag 1-2 business days | NACHA Operating Rules, 2024 — standard ACH processing windows |
| Discount Window penalty rate = Fed funds + 50bps | Federal Reserve Regulation A — Extensions of Credit by Federal Reserve Banks |
| Commercial deposit beta post-rate hike cycle | Federal Reserve Bank of New York Staff Reports, 2023 — deposit betas in tightening cycles |
| Regional bank sweep account concentration risk | S&P Global Market Intelligence, 2023 — regional bank deposit analysis |
| CCAR/DFAST submission model documentation requirements | Federal Reserve Supervisory and Regulatory Letter SR 15-18 |
| 250bps hiking cycle timeline | Federal Reserve historical data — EFFR 2022-2023 |

---

## Learner-facing module card copy

**For /companies page:**

```
Crestview National Bank
Regional Banking · Treasury & Model Risk · Advanced

"The reserves look compliant.
The stress test submission opens in 72 hours.
The model that calculates those reserves was
built in a zero-rate world."

Crestview National Bank has $4.2B in assets and a deposit base
that looks stable on every headline metric. But the Federal Reserve
just opened the CCAR stress test submission window. The internal
model validation team flagged a PSI of 0.31 — above the SR 11-7
alert threshold — eight months ago. Nobody acted.

You are the VP of Model Risk. You have 72 hours to find out how
bad it really is and brief the CEO before the examiners find it first.

10 tables · ~11,000 rows · DuckDB (columnar analytics)
Est. time: 4-5 hours · Difficulty: Advanced

Credential: Solved the Crestview Model Risk Crisis —
Evidence: Financial Intelligence · Decision Intelligence
```

---

## Implementation checklist

**Data generation:**
- [ ] Seed `rate_environments` (6 rows) and `customer_segments` (12 rows)
- [ ] Generate 1,825-row time-series tables
- [ ] Run enforcer — all 12 self-check targets must pass
- [ ] Seed `model_validation_log` (18 rows) and `discount_window_events` (3 rows)
- [ ] Verify three-way overlap on Discount Window dates

**SQL bridge (ships first):**
- [ ] Convert all tables to PostgreSQL-compatible INSERT statements
- [ ] Load via PGlite in existing SQL Workbench
- [ ] Build exercises.ts (10 investigations, 5 phases)
- [ ] Build rubric.ts (5-axis ADAI)
- [ ] Build citations.ts (10 sources above)
- [ ] Build scenarios.ts (Option A vs Option B comparison)
- [ ] Build /companies/crestview app pages

**Time Series Workbench migration (Q1 2027):**
- [ ] DuckDB WASM integration sprint
- [ ] Convert data to Parquet format
- [ ] Build TimeSeriesWorkbench.tsx component
- [ ] Add chart panel (line charts for regime visualization)
- [ ] Add regime highlighter (visual bands by rate environment)
- [ ] Add ASOF JOIN support in query interface
- [ ] Migrate Crestview from PGlite to DuckDB

---

*Mpingo Systems LLC · Raleigh, NC*  
*CRESTVIEW-PACK-SPEC v1.0 · September 2026*  
*Atelier Module 08 · Financial Intelligence · Treasury & Model Risk Management*
