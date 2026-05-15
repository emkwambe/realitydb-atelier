import type { Exercise } from "@/lib/grading";

export const novaPayExercises: Exercise[] = [
  {
    id: 1,
    title: "Read the room",
    businessQuestion: "Is the business growing?",
    skills: ["SELECT", "GROUP BY", "date functions"],
    description:
      "Count NovaPay active customers by month for the last 18 months. Is the customer count growing consistently? Look at the shape of the curve — is it accelerating, decelerating, or flat?",
    hint: "Use DATE_TRUNC('month', signed_at) to bucket customers by month, then COUNT(*).",
    referenceSQL: `SELECT
  DATE_TRUNC('month', signed_at) AS month,
  COUNT(*) AS new_customers
FROM customers
WHERE signed_at >= NOW() - INTERVAL '18 months'
GROUP BY month
ORDER BY month;`,
    requiredColumns: ["month", "new_customers"],
    difficulty: "beginner",
  },
  {
    id: 2,
    title: "Where is revenue coming from?",
    businessQuestion: "Which customers generate the most revenue?",
    skills: ["JOIN", "aggregation", "ranking"],
    description:
      "Calculate total MRR by customer segment. What percentage of revenue comes from each tier? Enterprise customers are 5% of the customer base — what percentage of revenue are they? Does that concentration concern you?",
    hint: "JOIN customers to subscriptions, GROUP BY segment, and use a window SUM to compute revenue share.",
    referenceSQL: `SELECT
  c.segment,
  COUNT(DISTINCT c.id)        AS customer_count,
  SUM(s.mrr_cents) / 100.0    AS total_mrr,
  ROUND(
    SUM(s.mrr_cents) * 100.0 /
    SUM(SUM(s.mrr_cents)) OVER (), 1
  )                           AS revenue_pct
FROM customers c
JOIN subscriptions s ON c.id = s.customer_id
WHERE s.status = 'active'
GROUP BY c.segment
ORDER BY total_mrr DESC;`,
    requiredColumns: ["segment", "customer_count", "total_mrr", "revenue_pct"],
    difficulty: "beginner",
  },
  {
    id: 3,
    title: "Is churn getting better or worse?",
    businessQuestion: "Are customers leaving faster than before?",
    skills: ["cohort math", "window functions", "date arithmetic"],
    description:
      "Calculate NovaPay monthly churn for the last 12 months. Show the trend — is it improving or deteriorating?",
    hint: "Filter subscriptions WHERE status = 'cancelled' and bucket by DATE_TRUNC('month', cancelled_at).",
    referenceSQL: `SELECT
  DATE_TRUNC('month', cancelled_at) AS churn_month,
  COUNT(*)                           AS churned_customers
FROM subscriptions
WHERE status = 'cancelled'
  AND cancelled_at >= NOW() - INTERVAL '12 months'
GROUP BY churn_month
ORDER BY churn_month;`,
    requiredColumns: ["churn_month", "churned_customers"],
    difficulty: "intermediate",
  },
  {
    id: 4,
    title: "Who is actually churning?",
    businessQuestion: "Is churn concentrated in a specific segment?",
    skills: ["GROUP BY segment", "comparative analysis"],
    description:
      "Break churn down by customer segment for the last 6 months. Calculate churn separately for SMB, mid-market, and enterprise. One segment should stand out significantly — by how much?",
    hint: "JOIN subscriptions to customers and GROUP BY segment AND churn_month.",
    referenceSQL: `SELECT
  c.segment,
  DATE_TRUNC('month', s.cancelled_at) AS churn_month,
  COUNT(*)                             AS churned
FROM subscriptions s
JOIN customers c ON s.customer_id = c.id
WHERE s.status = 'cancelled'
  AND s.cancelled_at >= NOW() - INTERVAL '6 months'
GROUP BY c.segment, churn_month
ORDER BY c.segment, churn_month;`,
    requiredColumns: ["segment", "churn_month", "churned"],
    difficulty: "intermediate",
  },
  {
    id: 5,
    title: "Are we acquiring customers profitably?",
    businessQuestion: "What is LTV:CAC by segment?",
    skills: ["multi-table JOIN", "unit economics"],
    description:
      "Calculate customer lifetime value and acquisition cost per segment. Is NovaPay profitable at the unit level in each tier? Healthy benchmark is LTV:CAC ≥ 3.",
    hint: "Build two CTEs — one for LTV (avg MRR / churn rate) and one for CAC (avg marketing cost) — then JOIN by segment.",
    referenceSQL: `WITH ltv AS (
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
ORDER BY ltv_cac_ratio DESC;`,
    requiredColumns: ["segment", "avg_mrr", "estimated_ltv", "avg_cac", "ltv_cac_ratio"],
    difficulty: "intermediate",
  },
  {
    id: 6,
    title: "Are existing customers growing or shrinking?",
    businessQuestion: "What is Net Revenue Retention by segment?",
    skills: ["cohort analysis", "expansion vs contraction"],
    description:
      "Calculate NRR for each customer segment. NRR > 100% means existing customers are worth more than last period. NRR < 100% means you're losing ground even before new sales. SMB and enterprise NRR will diverge sharply.",
    hint: "Compare MRR for the same customer cohort at two timestamps. Group the deltas by segment.",
    referenceSQL: `WITH period_mrr AS (
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
ORDER BY nrr_pct DESC;`,
    requiredColumns: ["segment", "nrr_pct"],
    difficulty: "advanced",
  },
  {
    id: 7,
    title: "Revenue concentration risk",
    businessQuestion: "How dependent is NovaPay on its top customers?",
    skills: ["ranking", "window functions", "cumulative percentage"],
    description:
      "Calculate what percentage of total ARR comes from the top 10 and top 20 customers. If the top 5 enterprise customers all churned, what would happen to ARR? Is that realistic given Exercise 4?",
    hint: "Compute per-customer ARR in a CTE, then RANK() over ARR DESC and a cumulative SUM window.",
    referenceSQL: `WITH customer_arr AS (
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
ORDER BY rank;`,
    requiredColumns: ["rank", "company_name", "segment", "arr", "cumulative_pct"],
    difficulty: "advanced",
  },
  {
    id: 8,
    title: "Follow the complaints",
    businessQuestion: "What are churned customers complaining about?",
    skills: ["multi-table JOIN", "filtering", "pattern recognition"],
    description:
      "For customers who churned in the last 6 months, what support ticket categories were most common in their final 90 days before cancellation? Which category dominates? How does resolution time vary?",
    hint: "JOIN cancelled subscriptions to customers to support_tickets, filtering tickets opened in the 90 days before cancelled_at.",
    referenceSQL: `SELECT
  st.category,
  COUNT(*)                                AS ticket_count,
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
ORDER BY ticket_count DESC;`,
    requiredColumns: ["category", "ticket_count", "avg_resolution_hours", "avg_satisfaction"],
    difficulty: "intermediate",
  },
  {
    id: 9,
    title: "Confirm the cause",
    businessQuestion: "Is there a causal link between complaints and churn?",
    skills: ["correlation analysis", "percentage calculations"],
    description:
      "Calculate the churn rate for enterprise customers who filed currency-related tickets vs. those who did not. The difference between the two groups is the smoking gun.",
    hint: "Build two CTEs (enterprise customers, currency complainers), then LEFT JOIN and classify into two groups.",
    referenceSQL: `WITH enterprise_customers AS (
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
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)       AS churned,
  ROUND(
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)
    * 100.0 / COUNT(*), 1
  )                                                           AS churn_rate_pct
FROM classified
GROUP BY group_label;`,
    requiredColumns: ["group_label", "total", "churned", "churn_rate_pct"],
    difficulty: "advanced",
  },
  {
    id: 10,
    title: "Quantify the decision",
    businessQuestion: "What is the financial impact of fixing vs. not fixing?",
    skills: ["forecasting", "sensitivity analysis", "business case construction"],
    description:
      "Model two scenarios for the next 12 months. Scenario A — Do nothing; enterprise churn stays at 3.2% monthly. Scenario B — Ship multi-currency in Q3; recover 65% of at-risk revenue. The ARR delta is the size of the opportunity. Payback > 1.0 recovers within 12 months; > 2.0 is a compelling board case.",
    hint: "Compound monthly survival using POWER(1 - churn_rate, n). Compare two trajectories and divide the ARR delta by the engineering cost.",
    referenceSQL: `WITH enterprise_mrr AS (
  SELECT SUM(s.mrr_cents) / 100.0 AS monthly_mrr
  FROM subscriptions s
  JOIN customers c ON s.customer_id = c.id
  WHERE c.segment = 'enterprise'
    AND s.status = 'active'
)
SELECT
  ROUND(monthly_mrr, 0)                               AS current_enterprise_mrr,
  ROUND(monthly_mrr * POWER(0.968, 12), 0)            AS scenario_a_12mo_mrr,
  ROUND(monthly_mrr * POWER(0.968, 3)
        * POWER(0.989, 9), 0)                         AS scenario_b_12mo_mrr,
  ROUND((monthly_mrr * POWER(0.968, 3) * POWER(0.989, 9)
       - monthly_mrr * POWER(0.968, 12)) * 12, 0)     AS arr_delta,
  ROUND((monthly_mrr * POWER(0.968, 3) * POWER(0.989, 9)
       - monthly_mrr * POWER(0.968, 12)) * 12
       / 400000.0, 2)                                 AS payback_ratio
FROM enterprise_mrr;`,
    requiredColumns: [
      "current_enterprise_mrr",
      "scenario_a_12mo_mrr",
      "scenario_b_12mo_mrr",
      "arr_delta",
      "payback_ratio",
    ],
    difficulty: "advanced",
  },
];
