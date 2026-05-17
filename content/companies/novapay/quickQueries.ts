// Quick-queries are exploration prompts, NOT exercise answers.
// They give students (and teachers writing new exercises) a fast way
// to poke at a table without typing column names from scratch.
// Keep them open-ended — they should invite questions, not point at the
// hidden story.

export interface QuickQuery {
  label: string;
  sql: string;
}

export type CompanyQuickQueries = Record<string, QuickQuery[]>;

export const NOVAPAY_QUICK_QUERIES: CompanyQuickQueries = {
  customers: [
    {
      label: "Customer count by segment",
      sql: `SELECT segment, COUNT(*) AS customers
FROM customers
GROUP BY segment
ORDER BY customers DESC;`,
    },
    {
      label: "Customers by country (top 10)",
      sql: `SELECT country, COUNT(*) AS customers
FROM customers
GROUP BY country
ORDER BY customers DESC
LIMIT 10;`,
    },
    {
      label: "New customers per month (last year)",
      sql: `SELECT DATE_TRUNC('month', signed_at) AS month,
       COUNT(*) AS new_customers
FROM customers
WHERE signed_at >= NOW() - INTERVAL '12 months'
GROUP BY month
ORDER BY month;`,
    },
  ],
  subscriptions: [
    {
      label: "Active vs cancelled subscriptions",
      sql: `SELECT status, COUNT(*) AS n
FROM subscriptions
GROUP BY status
ORDER BY n DESC;`,
    },
    {
      label: "Average MRR by plan",
      sql: `SELECT plan_name,
       COUNT(*) AS subs,
       ROUND(AVG(mrr_cents) / 100.0, 2) AS avg_mrr
FROM subscriptions
WHERE status = 'active'
GROUP BY plan_name
ORDER BY avg_mrr DESC;`,
    },
  ],
  support_tickets: [
    {
      label: "Top ticket categories",
      sql: `SELECT category, COUNT(*) AS tickets
FROM support_tickets
GROUP BY category
ORDER BY tickets DESC;`,
    },
    {
      label: "Tickets in last 90 days",
      sql: `SELECT DATE_TRUNC('week', opened_at) AS week, COUNT(*) AS tickets
FROM support_tickets
WHERE opened_at >= NOW() - INTERVAL '90 days'
GROUP BY week
ORDER BY week;`,
    },
    {
      label: "Average resolution time by priority",
      sql: `SELECT priority,
       ROUND(AVG(resolution_time_hours)::numeric, 1) AS avg_hours
FROM support_tickets
GROUP BY priority
ORDER BY avg_hours DESC;`,
    },
  ],
  payments: [
    {
      label: "Failure code distribution",
      sql: `SELECT failure_code, COUNT(*) AS n
FROM payments
WHERE failure_code IS NOT NULL
GROUP BY failure_code
ORDER BY n DESC;`,
    },
    {
      label: "Payment volume by month",
      sql: `SELECT DATE_TRUNC('month', created_at) AS month,
       SUM(amount_cents) / 100.0 AS total_paid
FROM payments
WHERE status = 'succeeded'
GROUP BY month
ORDER BY month;`,
    },
  ],
  marketing_attribution: [
    {
      label: "Spend by channel",
      sql: `SELECT channel,
       COUNT(*) AS touches,
       ROUND(SUM(cost_cents) / 100.0, 2) AS total_cost
FROM marketing_attribution
GROUP BY channel
ORDER BY total_cost DESC;`,
    },
  ],
};
