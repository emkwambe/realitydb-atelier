# NovaPay — Business Intelligence Case
## RealityDB Atelier · Module 1

> **Your role:** VP of Growth at NovaPay
> **Situation:** Series B board meeting in two weeks. Lead investor flagged retention metrics. CEO needs a briefing.
> **Your access:** Full production database. No hints from management.
> **Deliverable:** CEO briefing memo + 10 SQL analyses

---

## The Company

NovaPay is a 3-year-old B2B SaaS payments platform.
$2.1M ARR. 8% month-over-month growth. 400+ customers.

The CEO is proud of the growth numbers.
The lead investor is not so sure.

Your job is to find out who is right.

---

## The Database

```sql
customers              -- who buys NovaPay
plans                  -- what they pay
subscriptions          -- the contract lifecycle
invoices               -- monthly billing
payments               -- transactions processed (the product)
support_tickets        -- where problems surface first
ticket_messages        -- what customers actually say
product_usage          -- how engaged customers are
marketing_attribution  -- how customers were acquired
churn_signals          -- leading indicators
employees              -- the team and costs
expansion_events       -- upgrades and downgrades
board_metrics          -- what management reports to the board
```

Start by exploring. Run SELECT * FROM customers LIMIT 10.
Look at the columns. Understand the shape of the data.
Then work through the exercises below in order.

---

## Exercise 1 — Read the room
**Business question:** Is the business growing?
**Skill:** Basic SELECT, GROUP BY, date functions
**Maps to:** Q1 — Where is revenue coming from?

Count NovaPay active customers by month for the last 18 months.
Is the customer count growing consistently?

```sql
SELECT
  DATE_TRUNC('month', signed_at) AS month,
  COUNT(*) AS new_customers
FROM customers
WHERE signed_at >= NOW() - INTERVAL '18 months'
GROUP BY month
ORDER BY month;
```

**What to notice:** The growth curve. Is it accelerating, decelerating,
or flat? Does the shape tell you anything about the business?

---

## Exercise 2 — Where is revenue coming from?
**Business question:** Which customers generate the most revenue?
**Skill:** JOIN, aggregation, ranking
**Maps to:** Q1 — Revenue concentration

Calculate total MRR by customer segment.
What percentage of revenue comes from each tier?

```sql
SELECT
  c.segment,
  COUNT(DISTINCT c.id)        AS customer_count,
  SUM(s.mrr_cents) / 100.0   AS total_mrr,
  ROUND(
    SUM(s.mrr_cents) * 100.0 /
    SUM(SUM(s.mrr_cents)) OVER (), 1
  )                           AS revenue_pct
FROM customers c
JOIN subscriptions s ON c.id = s.customer_id
WHERE s.status = 'active'
GROUP BY c.segment
ORDER BY total_mrr DESC;
```

**What to notice:** Enterprise customers are 5% of the customer base.
What percentage of revenue are they?
Does that concentration concern you?

---

## Exercise 3 — Is churn getting better or worse?
**Business question:** Are customers leaving faster than before?
**Skill:** Cohort math, window functions, date arithmetic
**Maps to:** Q2 — Churn trend

Calculate NovaPay monthly churn rate for the last 12 months.
Show the trend — is it improving or deteriorating?

```sql
SELECT
  DATE_TRUNC('month', cancelled_at) AS churn_month,
  COUNT(*)                           AS churned_customers
FROM subscriptions
WHERE status = 'cancelled'
  AND cancelled_at >= NOW() - INTERVAL '12 months'
GROUP BY churn_month
ORDER BY churn_month;
```

**What to notice:** The direction of the trend.
Is the churn rate flat, improving, or accelerating?

---

## Exercise 4 — Who is actually churning?
**Business question:** Is churn concentrated in a specific segment?
**Skill:** GROUP BY segment, comparative analysis
**Maps to:** Q2 — Segment-level churn

Break churn down by customer segment for the last 6 months.
Calculate churn rate separately for SMB, mid-market, and enterprise.

```sql
SELECT
  c.segment,
  DATE_TRUNC('month', s.cancelled_at) AS churn_month,
  COUNT(*)                             AS churned
FROM subscriptions s
JOIN customers c ON s.customer_id = c.id
WHERE s.status = 'cancelled'
  AND s.cancelled_at >= NOW() - INTERVAL '6 months'
GROUP BY c.segment, churn_month
ORDER BY c.segment, churn_month;
```

**What to notice:** Compare churn rates across segments.
One segment should stand out significantly.
Which one? By how much? What does this mean for the business?

---

## Exercise 5 — Are we acquiring customers profitably?
**Business question:** What is LTV:CAC by segment?
**Skill:** Multi-table JOIN, unit economics
**Maps to:** Q3 — Profitable acquisition

Calculate customer lifetime value and acquisition cost per segment.
Is NovaPay profitable at the unit level in each tier?

```sql
WITH ltv AS (
  SELECT
    c.segment,
    AVG(s.mrr_cents / 100.0)         AS avg_mrr,
    AVG(s.mrr_cents / 100.0) / 0.014 AS estimated_ltv
  FROM customers c
  JOIN subscriptions s ON c.id = s.customer_id
  WHERE s.status = 'active'
  GROUP BY c.segment
),
cac AS (
  SELECT
    c.segment,
    AVG(m.cost_cents / 100.0) AS avg_cac
  FROM customers c
  JOIN marketing_attribution m ON c.id = m.customer_id
  GROUP BY c.segment
)
SELECT
  l.segment,
  ROUND(l.avg_mrr, 0)                              AS avg_mrr,
  ROUND(l.estimated_ltv, 0)                        AS estimated_ltv,
  ROUND(c.avg_cac, 0)                              AS avg_cac,
  ROUND(l.estimated_ltv / NULLIF(c.avg_cac, 0), 2) AS ltv_cac_ratio
FROM ltv l
JOIN cac c ON l.segment = c.segment
ORDER BY ltv_cac_ratio DESC;
```

**What to notice:** Healthy benchmark is LTV:CAC >= 3.
Which segment is below that threshold?
What does that mean for the Series B fundraise?

---

## Exercise 6 — Are existing customers growing or shrinking?
**Business question:** What is Net Revenue Retention by segment?
**Skill:** Cohort analysis, expansion vs. contraction
**Maps to:** Q5 — NRR

Calculate NRR for each customer segment.
NRR > 100% means existing customers are worth more than last period.
NRR < 100% means you are losing ground even before counting new sales.

```sql
WITH period_mrr AS (
  SELECT
    c.segment,
    s.customer_id,
    SUM(CASE
      WHEN DATE_TRUNC('month', s.started_at) <= '2024-09-01'
      THEN s.mrr_cents ELSE 0
    END) AS mrr_start,
    SUM(CASE
      WHEN s.status = 'active'
       AND DATE_TRUNC('month', s.started_at) <= '2024-09-01'
      THEN s.mrr_cents ELSE 0
    END) AS mrr_end
  FROM subscriptions s
  JOIN customers c ON s.customer_id = c.id
  GROUP BY c.segment, s.customer_id
)
SELECT
  segment,
  ROUND(
    SUM(mrr_end) * 100.0 / NULLIF(SUM(mrr_start), 0), 1
  ) AS nrr_pct
FROM period_mrr
WHERE mrr_start > 0
GROUP BY segment
ORDER BY nrr_pct DESC;
```

**What to notice:** SMB NRR and enterprise NRR will diverge sharply.
One segment is growing through expansion.
One segment is contracting even among customers who have not left yet.

---

## Exercise 7 — Revenue concentration risk
**Business question:** How dependent is NovaPay on its top customers?
**Skill:** Ranking, window functions, cumulative percentage
**Maps to:** Q6 — Concentration

Calculate what percentage of total ARR comes from
the top 10 and top 20 customers.

```sql
WITH customer_arr AS (
  SELECT
    c.id,
    c.company_name,
    c.segment,
    SUM(s.mrr_cents * 12) / 100.0 AS arr
  FROM customers c
  JOIN subscriptions s ON c.id = s.customer_id
  WHERE s.status = 'active'
  GROUP BY c.id, c.company_name, c.segment
),
ranked AS (
  SELECT *,
    RANK() OVER (ORDER BY arr DESC)         AS rank,
    SUM(arr) OVER ()                        AS total_arr,
    SUM(arr) OVER (ORDER BY arr DESC)       AS cumulative_arr
  FROM customer_arr
)
SELECT
  rank,
  company_name,
  segment,
  arr,
  ROUND(cumulative_arr * 100.0 / total_arr, 1) AS cumulative_pct
FROM ranked
WHERE rank <= 20
ORDER BY rank;
```

**What to notice:** If the top 5 enterprise customers all churned,
what would happen to ARR?
Is that a realistic scenario given what you found in Exercise 4?

---

## Exercise 8 — Follow the complaints
**Business question:** What are churned customers complaining about?
**Skill:** Multi-table JOIN, filtering, pattern recognition
**Maps to:** Q9 — Leading indicators

For customers who churned in the last 6 months,
what support ticket categories were most common
in their final 90 days before cancellation?

```sql
SELECT
  st.category,
  COUNT(*)                              AS ticket_count,
  ROUND(AVG(st.resolution_time_hours), 1) AS avg_resolution_hours,
  ROUND(AVG(st.satisfaction_score), 2)    AS avg_satisfaction
FROM subscriptions s
JOIN customers c ON s.customer_id = c.id
JOIN support_tickets st ON c.id = st.customer_id
WHERE s.status = 'cancelled'
  AND s.cancelled_at >= NOW() - INTERVAL '6 months'
  AND st.opened_at >= s.cancelled_at - INTERVAL '90 days'
  AND st.opened_at <= s.cancelled_at
GROUP BY st.category
ORDER BY ticket_count DESC;
```

**What to notice:** Which category dominates?
How does resolution time compare across categories?
What does a low satisfaction score on a specific category tell you?

---

## Exercise 9 — Confirm the cause
**Business question:** Is there a causal link between complaints and churn?
**Skill:** Correlation analysis, percentage calculations
**Maps to:** Q9 — Root cause confirmation

Calculate the churn rate for enterprise customers
who filed currency-related tickets vs. those who did not.

```sql
WITH enterprise_customers AS (
  SELECT c.id, s.status
  FROM customers c
  JOIN subscriptions s ON c.id = s.customer_id
  WHERE c.segment = 'enterprise'
),
currency_complainers AS (
  SELECT DISTINCT customer_id
  FROM support_tickets
  WHERE category IN ('currency_support', 'fx_reconciliation')
),
classified AS (
  SELECT
    ec.id,
    ec.status,
    CASE WHEN cc.customer_id IS NOT NULL
      THEN 'filed_currency_ticket'
      ELSE 'no_currency_ticket'
    END AS group_label
  FROM enterprise_customers ec
  LEFT JOIN currency_complainers cc ON ec.id = cc.customer_id
)
SELECT
  group_label,
  COUNT(*)                                                    AS total,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)      AS churned,
  ROUND(
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)
    * 100.0 / COUNT(*), 1
  )                                                           AS churn_rate_pct
FROM classified
GROUP BY group_label;
```

**What to notice:** The churn rate difference between the two groups
is the smoking gun. If customers with currency tickets churn at 60%+
and those without churn at 2-3%, you have found the cause.

---

## Exercise 10 — Quantify the decision
**Business question:** What is the financial impact of fixing vs. not fixing?
**Skill:** Forecasting, sensitivity analysis, business case construction
**Maps to:** Q10 — Decision under uncertainty

Model two scenarios for the next 12 months.

Scenario A — Do nothing. Enterprise churn continues at 3.2% monthly.
Scenario B — Ship multi-currency in Q3. Recover 65% of at-risk revenue.

```sql
WITH enterprise_mrr AS (
  SELECT SUM(s.mrr_cents) / 100.0 AS monthly_mrr
  FROM subscriptions s
  JOIN customers c ON s.customer_id = c.id
  WHERE c.segment = 'enterprise'
    AND s.status = 'active'
)
SELECT
  ROUND(monthly_mrr, 0)                               AS current_enterprise_mrr,
  -- Scenario A: 12 months at 3.2% monthly churn
  ROUND(monthly_mrr * POWER(0.968, 12), 0)            AS scenario_a_12mo_mrr,
  -- Scenario B: 3 months at 3.2%, then 9 months at 1.1% after fix
  ROUND(monthly_mrr * POWER(0.968, 3)
        * POWER(0.989, 9), 0)                         AS scenario_b_12mo_mrr,
  -- ARR delta
  ROUND((monthly_mrr * POWER(0.968, 3) * POWER(0.989, 9)
       - monthly_mrr * POWER(0.968, 12)) * 12, 0)     AS arr_delta,
  -- Payback ratio assuming $400K engineering cost
  ROUND((monthly_mrr * POWER(0.968, 3) * POWER(0.989, 9)
       - monthly_mrr * POWER(0.968, 12)) * 12
       / 400000.0, 2)                                 AS payback_ratio
FROM enterprise_mrr;
```

**What to notice:** The ARR delta is the size of the opportunity.
If payback ratio exceeds 1.0 the investment recovers within 12 months.
If it exceeds 2.0 the case is compelling for the board.

---

## CEO Briefing — The Deliverable

> You are the VP of Growth at NovaPay.
> The board meeting is in two weeks.
> The lead Series B investor has flagged retention metrics.
> The CEO needs a one-page briefing before the meeting.

Write an 800-word memo that answers:

1. What is the current state of customer retention? Is it healthy?
2. Where is the problem and what is causing it?
3. What is the financial impact if left unaddressed?
4. What do you recommend and what would it cost?
5. What do you not yet know — and how would you find out?

Structure your memo using SCQA:
- **Situation:** What is true right now (facts from your queries)
- **Complication:** What has changed or what is at risk
- **Question:** The decision that needs to be made
- **Answer:** Your recommendation with supporting evidence

Cite at least 4 exercises by number.
Include at least 2 specific numbers from your analysis.
Acknowledge one thing you cannot fully confirm from the data alone.

---

## Grading Rubric

### Pass — 80% and above
- Correctly identifies enterprise churn as the primary risk
- Segments churn by tier — not just blended rate
- Links currency tickets to enterprise churn with a percentage
- Quantifies ARR at risk over 12 months
- Recommends multi-currency with cost and payback estimate
- Acknowledges one limitation of the analysis

### Borderline — 60 to 79%
- Identifies churn but does not segment by tier
- Cites data but conclusions are surface-level
- Recommendation is generic such as "improve retention"
- Does not connect support data to churn causally

### Fail — below 60%
- Reports revenue growth as the main story
- Misses or ignores the enterprise churn signal
- No specific numbers cited from the analysis
- No actionable recommendation

---

## What a Passing Student Should Have Found

The data tells this story in order:

1. NovaPay looks healthy on aggregate — 8% MoM growth, 1.4% blended churn
2. Enterprise customers are 5% of customers but 58% of revenue
3. Enterprise churn has risen from 1.1% to 3.2% over 6 months
4. 64% of churned enterprise customers filed currency-related tickets in their final 90 days
5. Enterprise customers without currency tickets churn at 2.1%
6. At current trajectory NovaPay loses approximately $610K enterprise ARR in 12 months — 29% of total ARR
7. Multi-currency at approximately $400K engineering cost pays back in under 18 months

A student who finds all seven points passes with distinction.
A student who finds points 1 through 4 passes.
A student who only finds point 1 fails.

---

*NovaPay is a synthetic company generated by RealityDB.*
*All data is fictional. Distributions are research-backed.*
*RealityDB Atelier — the business school that runs on live data.*