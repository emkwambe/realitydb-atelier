import type { Exercise } from "@/lib/grading";

export const supplylinkExercises: Exercise[] = [
  {
    id: 1,
    title: "Read the room",
    businessQuestion: "Is the on-time delivery rate acceptable?",
    skills: ["SELECT", "GROUP BY", "percentage calculation"],
    description:
      "Calculate overall on-time delivery rate across all deliveries. ISM benchmark for manufacturing: 85%+ is acceptable, 90%+ is excellent. Anything below 85% is a warning sign for procurement. What does SupplyLink look like?",
    hint: "Count deliveries where is_late = 'false' divided by total deliveries. is_late is stored as the text 'true'/'false', not a boolean.",
    referenceSQL: `SELECT
  COUNT(*) AS total_deliveries,
  SUM(CASE WHEN is_late = 'false' THEN 1 ELSE 0 END) AS on_time,
  ROUND(
    SUM(CASE WHEN is_late = 'false' THEN 1 ELSE 0 END) * 100.0
    / COUNT(*), 1
  ) AS on_time_pct
FROM deliveries;`,
    requiredColumns: ["total_deliveries", "on_time", "on_time_pct"],
    difficulty: "beginner",
  },
  {
    id: 2,
    title: "Supplier volume map",
    businessQuestion: "Which suppliers represent the most spend and PO volume?",
    skills: ["JOIN", "aggregation", "ranking"],
    description:
      "Join purchase_orders to suppliers. Show PO count and total value by supplier name. Single-source dependencies are a known supply-chain risk — McKinsey: a single supplier above 20% of spend warrants a dual-source plan.",
    hint: "JOIN purchase_orders to suppliers on supplier_id, SUM total_value_usd. Note: the same supplier name can appear on multiple supplier rows; GROUP BY name to roll up.",
    referenceSQL: `SELECT
  s.name AS supplier,
  COUNT(po.id) AS po_count,
  ROUND(SUM(po.total_value_usd)::numeric, 2) AS total_spend,
  ROUND(COUNT(po.id) * 100.0 / SUM(COUNT(po.id)) OVER (), 1) AS volume_pct
FROM purchase_orders po
JOIN suppliers s ON po.supplier_id = s.id
GROUP BY s.name
ORDER BY po_count DESC;`,
    requiredColumns: ["supplier", "po_count", "total_spend", "volume_pct"],
    difficulty: "beginner",
  },
  {
    id: 3,
    title: "On-time delivery by supplier",
    businessQuestion: "Which suppliers are consistently late?",
    skills: ["multi-table JOIN", "conditional aggregation"],
    description:
      "Calculate late delivery rate per supplier. A few consistently-late suppliers will hide inside a blended rate. Industry benchmark: an outlier supplier below 70% on-time is a contract problem, not a capacity problem.",
    hint: "Chain JOINs from deliveries through purchase_orders to suppliers. Count is_late='true' per supplier.",
    referenceSQL: `SELECT
  s.name AS supplier,
  COUNT(*) AS total_deliveries,
  SUM(CASE WHEN d.is_late = 'true' THEN 1 ELSE 0 END) AS late_deliveries,
  ROUND(
    SUM(CASE WHEN d.is_late = 'true' THEN 1 ELSE 0 END) * 100.0
    / COUNT(*), 1
  ) AS late_rate_pct
FROM deliveries d
JOIN purchase_orders po ON d.po_id = po.id
JOIN suppliers s ON po.supplier_id = s.id
GROUP BY s.name
ORDER BY late_rate_pct DESC;`,
    requiredColumns: ["supplier", "total_deliveries", "late_deliveries", "late_rate_pct"],
    difficulty: "beginner",
  },
  {
    id: 4,
    title: "Has it always been this bad?",
    businessQuestion: "Is the on-time rate getting worse over time?",
    skills: ["date bucketing", "comparative analysis"],
    description:
      "Split the 24-month window into two periods using delivered_at: first 14 months vs last 10 months (cutoff 2025-08-01). Compare late delivery rate per supplier across both periods. A uniform deterioration suggests something systemic. A single supplier inflection points at one specific cause.",
    hint: "Bucket with CASE WHEN delivered_at < '2025-08-01' THEN 'first_14mo' ELSE 'last_10mo' END.",
    referenceSQL: `SELECT
  s.name AS supplier,
  CASE WHEN d.delivered_at < '2025-08-01'
       THEN 'first_14mo' ELSE 'last_10mo' END AS period,
  COUNT(*) AS total_deliveries,
  ROUND(
    SUM(CASE WHEN d.is_late = 'true' THEN 1 ELSE 0 END) * 100.0
    / COUNT(*), 1
  ) AS late_rate_pct
FROM deliveries d
JOIN purchase_orders po ON d.po_id = po.id
JOIN suppliers s ON po.supplier_id = s.id
GROUP BY s.name, period
ORDER BY s.name, period;`,
    requiredColumns: ["supplier", "period", "total_deliveries", "late_rate_pct"],
    difficulty: "intermediate",
  },
  {
    id: 5,
    title: "Quality rejection by supplier",
    businessQuestion: "Which supplier has the highest quality rejection rate?",
    skills: ["aggregation", "comparison across cohort"],
    description:
      "Average failure_rate_pct per supplier from quality_inspections. Gartner benchmark: 2-4% rejection rate is acceptable, above 5% requires corrective action plan. Is the high-rejection supplier the same as the high-late-delivery supplier? If yes, you have a single root cause.",
    hint: "GROUP BY suppliers.name, AVG(failure_rate_pct).",
    referenceSQL: `SELECT
  s.name AS supplier,
  COUNT(qi.id) AS inspections,
  ROUND(AVG(qi.failure_rate_pct)::numeric, 2) AS avg_failure_rate_pct,
  SUM(qi.units_failed) AS total_units_failed
FROM quality_inspections qi
JOIN suppliers s ON qi.supplier_id = s.id
GROUP BY s.name
ORDER BY avg_failure_rate_pct DESC;`,
    requiredColumns: ["supplier", "inspections", "avg_failure_rate_pct", "total_units_failed"],
    difficulty: "intermediate",
  },
  {
    id: 6,
    title: "Lead time variability",
    businessQuestion: "Which suppliers are unpredictable?",
    skills: ["coefficient of variation", "STDDEV", "AVG"],
    description:
      "Calculate coefficient of variation (CV = stddev / mean) for lead time per supplier. MIT Center for Transportation and Logistics benchmark: CV under 0.20 is predictable, CV above 0.35 forces expensive safety stock buildup. A high-CV supplier costs you twice — in inventory carrying and in expediting.",
    hint: "Lead time = days between purchase_orders.ordered_at and deliveries.delivered_at. Use EXTRACT(EPOCH FROM ...) / 86400 to get days, then STDDEV() / AVG().",
    referenceSQL: `SELECT
  s.name AS supplier,
  COUNT(*) AS deliveries,
  ROUND(AVG(EXTRACT(EPOCH FROM (d.delivered_at - po.ordered_at)) / 86400)::numeric, 1) AS lead_time_avg_days,
  ROUND(
    STDDEV(EXTRACT(EPOCH FROM (d.delivered_at - po.ordered_at)) / 86400)::numeric
    / NULLIF(AVG(EXTRACT(EPOCH FROM (d.delivered_at - po.ordered_at)) / 86400), 0),
    2
  ) AS lead_time_cv
FROM deliveries d
JOIN purchase_orders po ON d.po_id = po.id
JOIN suppliers s ON po.supplier_id = s.id
GROUP BY s.name
ORDER BY lead_time_cv DESC;`,
    requiredColumns: ["supplier", "deliveries", "lead_time_avg_days", "lead_time_cv"],
    difficulty: "intermediate",
  },
  {
    id: 7,
    title: "Expediting concentration",
    businessQuestion: "Which supplier drives most of the expediting cost?",
    skills: ["GROUP BY", "percentage of total"],
    description:
      "Count expediting_events per supplier and compute the share of total expediting events. Deloitte benchmark: 5-8% of POs being expedited is acceptable. If one supplier drives over 30% of expediting events, that's the cost of someone else being late — and it's quantifiable.",
    hint: "GROUP BY suppliers.name on expediting_events, then compute COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ().",
    referenceSQL: `SELECT
  s.name AS supplier,
  COUNT(e.id) AS expediting_events,
  ROUND(
    COUNT(e.id) * 100.0
    / SUM(COUNT(e.id)) OVER (), 1
  ) AS pct_of_total
FROM expediting_events e
JOIN suppliers s ON e.supplier_id = s.id
GROUP BY s.name
ORDER BY expediting_events DESC;`,
    requiredColumns: ["supplier", "expediting_events", "pct_of_total"],
    difficulty: "intermediate",
  },
  {
    id: 8,
    title: "The cost of Zhonghe",
    businessQuestion: "Does the Zhonghe relationship make financial sense?",
    skills: ["multi-table SUM", "filter"],
    description:
      "Sum expediting costs and rework cost proxy (units_failed × estimated rework cost) attributable to Zhonghe Industrial. Compare to Zhonghe's annual purchase value. If Zhonghe's total cost-of-relationship exceeds their annual spend, the relationship is net-negative.",
    hint: "Sum cost_usd from expediting_events filtered to Zhonghe. Add units_failed × $50/unit rework proxy from quality_inspections. Compare to total purchase_orders.total_value_usd for Zhonghe.",
    referenceSQL: `WITH zhonghe_expediting AS (
  SELECT SUM(e.cost_usd) AS expediting_cost
  FROM expediting_events e
  JOIN suppliers s ON e.supplier_id = s.id
  WHERE s.name = 'Zhonghe Industrial'
),
zhonghe_rework AS (
  SELECT SUM(qi.units_failed) * 50.0 AS rework_cost_proxy
  FROM quality_inspections qi
  JOIN suppliers s ON qi.supplier_id = s.id
  WHERE s.name = 'Zhonghe Industrial'
),
zhonghe_spend AS (
  SELECT SUM(po.total_value_usd) AS annual_spend
  FROM purchase_orders po
  JOIN suppliers s ON po.supplier_id = s.id
  WHERE s.name = 'Zhonghe Industrial'
)
SELECT
  ROUND(COALESCE(ze.expediting_cost, 0)::numeric, 2) AS expediting_cost,
  ROUND(COALESCE(zr.rework_cost_proxy, 0)::numeric, 2) AS rework_cost_proxy,
  ROUND((COALESCE(ze.expediting_cost, 0) + COALESCE(zr.rework_cost_proxy, 0))::numeric, 2) AS total_relationship_cost,
  ROUND(COALESCE(zs.annual_spend, 0)::numeric, 2) AS annual_spend,
  ROUND(
    (COALESCE(ze.expediting_cost, 0) + COALESCE(zr.rework_cost_proxy, 0)) * 100.0
    / NULLIF(zs.annual_spend, 0),
    1
  ) AS cost_as_pct_of_spend
FROM zhonghe_expediting ze, zhonghe_rework zr, zhonghe_spend zs;`,
    requiredColumns: [
      "expediting_cost",
      "rework_cost_proxy",
      "total_relationship_cost",
      "annual_spend",
      "cost_as_pct_of_spend",
    ],
    difficulty: "advanced",
  },
  {
    id: 9,
    title: "The smoking gun",
    businessQuestion: "What changed at Zhonghe, and when?",
    skills: ["temporal series", "scorecard analysis", "inflection detection"],
    description:
      "Look at Zhonghe's supplier_scorecards across all 24 monthly periods. On-time rate, quality rate, lead time, scorecard grade — all four should show a clean inflection at month 15 (period '2025-08'). If every metric breaks at the same month, something changed inside Zhonghe at that point. That's the smoking gun for the CFO.",
    hint: "WHERE s.name = 'Zhonghe Industrial', GROUP BY period, ORDER BY period. Look for the row where grade flips from B/C to D/F.",
    referenceSQL: `SELECT
  sc.period,
  ROUND(AVG(sc.on_time_rate)::numeric, 2) AS on_time_rate,
  ROUND(AVG(sc.quality_rate)::numeric, 2) AS quality_rate,
  ROUND(AVG(sc.lead_time_avg_days)::numeric, 1) AS lead_time_avg_days,
  ROUND(AVG(sc.lead_time_cv)::numeric, 2) AS lead_time_cv,
  MIN(sc.scorecard_grade) AS scorecard_grade
FROM supplier_scorecards sc
JOIN suppliers s ON sc.supplier_id = s.id
WHERE s.name = 'Zhonghe Industrial'
GROUP BY sc.period
ORDER BY sc.period;`,
    requiredColumns: [
      "period",
      "on_time_rate",
      "quality_rate",
      "lead_time_avg_days",
      "lead_time_cv",
      "scorecard_grade",
    ],
    difficulty: "advanced",
  },
  {
    id: 10,
    title: "Quantify the decision",
    businessQuestion: "Dual-source, exit, or renegotiate?",
    skills: ["literal modeling", "ROI math", "UNION ALL"],
    description:
      "You have the problem, the cause, and the cost. Now model three options. Option A — dual-source Zhonghe with Monterrey Precision ($450K cost, 9-month payback, $3.6M net 12mo). Option B — exit Zhonghe ($1.2M cost, 18-month payback, $1.8M net 12mo / $6.9M net 24mo). Option C — renegotiate with SLA penalties ($75K cost, partial fix, $1.1M net 12mo). Bring the comparison to the CFO.",
    hint: "Switch from querying the dataset to literal modeling — numbers come from the comparison panel and Exercise 8.",
    referenceSQL: `SELECT
  'Option A: Dual-source' AS strategy,
  450000 AS transition_cost,
  3600000 AS net_12mo_benefit,
  9.0 AS payback_months,
  6900000 AS net_24mo_benefit
UNION ALL
SELECT
  'Option B: Exit Zhonghe' AS strategy,
  1200000 AS transition_cost,
  1800000 AS net_12mo_benefit,
  18.0 AS payback_months,
  6900000 AS net_24mo_benefit
UNION ALL
SELECT
  'Option C: Renegotiate (SLA)' AS strategy,
  75000 AS transition_cost,
  1100000 AS net_12mo_benefit,
  3.0 AS payback_months,
  2200000 AS net_24mo_benefit;`,
    requiredColumns: [
      "strategy",
      "transition_cost",
      "net_12mo_benefit",
      "payback_months",
      "net_24mo_benefit",
    ],
    difficulty: "advanced",
  },
];
