// Quick-queries are exploration prompts, NOT exercise answers.
import type { CompanyQuickQueries } from "../novapay/quickQueries";

export const TOWERNET_QUICK_QUERIES: CompanyQuickQueries = {
  towers: [
    {
      label: "Towers by maintenance status",
      sql: `SELECT maintenance_status, COUNT(*) AS towers,
       ROUND(AVG(uptime_pct_ytd)::numeric, 3) AS avg_uptime
FROM towers
GROUP BY maintenance_status
ORDER BY towers DESC;`,
    },
    {
      label: "Lowest-uptime towers",
      sql: `SELECT tower_code, region, maintenance_status,
       ROUND(uptime_pct_ytd::numeric, 3) AS uptime,
       last_maintenance_date
FROM towers
ORDER BY uptime_pct_ytd ASC
LIMIT 15;`,
    },
    {
      label: "Tower mix by technology and region",
      sql: `SELECT region, technology_type, COUNT(*) AS towers
FROM towers
GROUP BY region, technology_type
ORDER BY region, towers DESC;`,
    },
  ],
  subscribers: [
    {
      label: "Subscribers by status",
      sql: `SELECT status, COUNT(*) AS subscribers
FROM subscribers
GROUP BY status
ORDER BY subscribers DESC;`,
    },
    {
      label: "Subscribers by acquired channel",
      sql: `SELECT acquired_channel, COUNT(*) AS subs,
       SUM(CASE WHEN status = 'churned' THEN 1 ELSE 0 END) AS churned
FROM subscribers
GROUP BY acquired_channel
ORDER BY subs DESC;`,
    },
    {
      label: "Tenure distribution",
      sql: `SELECT
  CASE
    WHEN tenure_months < 12 THEN '< 1 year'
    WHEN tenure_months < 24 THEN '1-2 years'
    WHEN tenure_months < 60 THEN '2-5 years'
    ELSE '5+ years'
  END AS tenure_band,
  COUNT(*) AS subscribers
FROM subscribers
GROUP BY tenure_band
ORDER BY subscribers DESC;`,
    },
  ],
  network_incidents: [
    {
      label: "Incidents by type",
      sql: `SELECT incident_type, severity, COUNT(*) AS incidents,
       ROUND(AVG(duration_minutes)::numeric, 0) AS avg_minutes
FROM network_incidents
GROUP BY incident_type, severity
ORDER BY incidents DESC;`,
    },
    {
      label: "Incidents per month",
      sql: `SELECT DATE_TRUNC('month', started_at) AS month,
       COUNT(*) AS incidents
FROM network_incidents
GROUP BY month
ORDER BY month;`,
    },
    {
      label: "Top root causes",
      sql: `SELECT root_cause, COUNT(*) AS incidents
FROM network_incidents
GROUP BY root_cause
ORDER BY incidents DESC;`,
    },
  ],
  support_tickets: [
    {
      label: "Ticket categories overall",
      sql: `SELECT category, COUNT(*) AS tickets
FROM support_tickets
GROUP BY category
ORDER BY tickets DESC;`,
    },
    {
      label: "Average satisfaction by category",
      sql: `SELECT category,
       COUNT(*) AS tickets,
       ROUND(AVG(satisfaction_score)::numeric, 2) AS avg_score
FROM support_tickets
WHERE satisfaction_score IS NOT NULL
GROUP BY category
ORDER BY avg_score ASC;`,
    },
    {
      label: "Open tickets by priority",
      sql: `SELECT priority, COUNT(*) AS open_tickets
FROM support_tickets
WHERE status IN ('open','in_progress')
GROUP BY priority
ORDER BY open_tickets DESC;`,
    },
  ],
  churn_signals: [
    {
      label: "Signal types",
      sql: `SELECT signal_type, severity, COUNT(*) AS signals
FROM churn_signals
GROUP BY signal_type, severity
ORDER BY signals DESC;`,
    },
    {
      label: "Signal volume by month",
      sql: `SELECT DATE_TRUNC('month', detected_at) AS month,
       COUNT(*) AS signals
FROM churn_signals
GROUP BY month
ORDER BY month;`,
    },
  ],
  plans: [
    {
      label: "Plan mix",
      sql: `SELECT name, type, monthly_fee_cents, contract_months
FROM plans
ORDER BY monthly_fee_cents::int;`,
    },
  ],
  invoices: [
    {
      label: "Invoice status mix",
      sql: `SELECT status, COUNT(*) AS invoices,
       ROUND(SUM(amount_cents)::numeric / 100.0, 2) AS total_dollars
FROM invoices
GROUP BY status
ORDER BY invoices DESC;`,
    },
  ],
  usage_records: [
    {
      label: "Average data usage per subscriber",
      sql: `SELECT subscriber_id,
       ROUND(AVG(data_mb_used)::numeric, 1) AS avg_mb,
       SUM(voice_minutes_used) AS total_min
FROM usage_records
GROUP BY subscriber_id
ORDER BY avg_mb DESC
LIMIT 20;`,
    },
  ],
};
