// Quick-queries are exploration prompts, NOT exercise answers.
import type { CompanyQuickQueries } from "../novapay/quickQueries";

export const SUPPLYLINK_QUICK_QUERIES: CompanyQuickQueries = {
  suppliers: [
    {
      label: "All suppliers by country",
      sql: `SELECT name, country, region, category, currency
FROM suppliers
ORDER BY name, country;`,
    },
    {
      label: "Compare on-time rates by tier",
      sql: `SELECT tier,
       ROUND(AVG(on_time_delivery_rate)::numeric, 2) AS avg_on_time,
       COUNT(*) AS suppliers
FROM suppliers
GROUP BY tier
ORDER BY avg_on_time DESC;`,
    },
    {
      label: "High spend × low quality rating",
      sql: `SELECT name, country, annual_spend_usd, quality_rating
FROM suppliers
WHERE annual_spend_usd > 10000000 AND quality_rating < 75
ORDER BY annual_spend_usd DESC;`,
    },
    {
      label: "Spend share by region",
      sql: `SELECT region,
       ROUND(SUM(annual_spend_usd)::numeric, 0) AS total_spend,
       ROUND(SUM(annual_spend_usd) * 100.0
             / SUM(SUM(annual_spend_usd)) OVER (), 1) AS pct_of_total
FROM suppliers
GROUP BY region
ORDER BY total_spend DESC;`,
    },
  ],
  purchase_orders: [
    {
      label: "PO status distribution",
      sql: `SELECT status, COUNT(*) AS n
FROM purchase_orders
GROUP BY status
ORDER BY n DESC;`,
    },
    {
      label: "PO volume per month",
      sql: `SELECT DATE_TRUNC('month', ordered_at) AS month,
       COUNT(*) AS pos,
       ROUND(SUM(total_value_usd)::numeric, 0) AS total_value
FROM purchase_orders
GROUP BY month
ORDER BY month;`,
    },
  ],
  deliveries: [
    {
      label: "Late vs on-time totals",
      sql: `SELECT is_late, COUNT(*) AS n
FROM deliveries
GROUP BY is_late
ORDER BY n DESC;`,
    },
    {
      label: "Average days late (when late)",
      sql: `SELECT ROUND(AVG(days_late)::numeric, 1) AS avg_days_late,
       MAX(days_late) AS max_days_late,
       COUNT(*) AS late_deliveries
FROM deliveries
WHERE is_late = 'true';`,
    },
    {
      label: "Expedited deliveries by month",
      sql: `SELECT DATE_TRUNC('month', delivered_at) AS month,
       SUM(CASE WHEN expedited_flag = 'true' THEN 1 ELSE 0 END) AS expedited,
       COUNT(*) AS total
FROM deliveries
GROUP BY month
ORDER BY month;`,
    },
  ],
  quality_inspections: [
    {
      label: "Average failure rate per supplier",
      sql: `SELECT s.name AS supplier,
       ROUND(AVG(qi.failure_rate_pct)::numeric, 2) AS avg_failure_rate,
       COUNT(qi.id) AS inspections
FROM quality_inspections qi
JOIN suppliers s ON qi.supplier_id = s.id
GROUP BY s.name
ORDER BY avg_failure_rate DESC;`,
    },
    {
      label: "Failure categories overall",
      sql: `SELECT failure_category, COUNT(*) AS n
FROM quality_inspections
WHERE failure_category IS NOT NULL
GROUP BY failure_category
ORDER BY n DESC;`,
    },
    {
      label: "Disposition mix",
      sql: `SELECT disposition, COUNT(*) AS n
FROM quality_inspections
WHERE disposition IS NOT NULL
GROUP BY disposition
ORDER BY n DESC;`,
    },
  ],
  expediting_events: [
    {
      label: "Expediting reasons",
      sql: `SELECT reason, COUNT(*) AS n
FROM expediting_events
GROUP BY reason
ORDER BY n DESC;`,
    },
    {
      label: "Total expediting cost by supplier",
      sql: `SELECT s.name AS supplier,
       ROUND(SUM(e.cost_usd)::numeric, 0) AS total_cost,
       COUNT(e.id) AS events
FROM expediting_events e
JOIN suppliers s ON e.supplier_id = s.id
GROUP BY s.name
ORDER BY total_cost DESC;`,
    },
  ],
  supplier_scorecards: [
    {
      label: "Average scorecard grade per supplier",
      sql: `SELECT s.name AS supplier,
       ROUND(AVG(sc.on_time_rate)::numeric, 2) AS on_time,
       ROUND(AVG(sc.quality_rate)::numeric, 2) AS quality,
       ROUND(AVG(sc.lead_time_avg_days)::numeric, 1) AS lead_time
FROM supplier_scorecards sc
JOIN suppliers s ON sc.supplier_id = s.id
GROUP BY s.name
ORDER BY on_time DESC;`,
    },
    {
      label: "Grade distribution",
      sql: `SELECT scorecard_grade, COUNT(*) AS n
FROM supplier_scorecards
GROUP BY scorecard_grade
ORDER BY scorecard_grade;`,
    },
  ],
};
