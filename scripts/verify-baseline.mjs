#!/usr/bin/env node
// scripts/verify-baseline.mjs
// Loads novapay-5k-baseline.sql into a Node-side PGlite and runs the
// Exercise 4 + Exercise 9 queries to confirm the story numbers.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";

const path = resolve(process.argv[2] || "public/data/novapay-5k-baseline.sql");
const sql = readFileSync(path, "utf8");

console.log(`[verify] loading ${path} (${(sql.length / 1024).toFixed(1)} KB)`);
const db = new PGlite();
const marker = sql.indexOf("-- DATA");
if (marker > 0) {
  await db.exec(sql.slice(0, marker));
  await db.exec(sql.slice(marker));
} else {
  await db.exec(sql);
}
console.log("[verify] loaded");

async function show(label, q) {
  console.log("");
  console.log(`---- ${label} ----`);
  console.log(q.trim());
  try {
    const r = await db.query(q);
    for (const row of r.rows) console.log(JSON.stringify(row));
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}

await show(
  "row counts",
  `SELECT 'customers' AS t, COUNT(*) FROM customers
   UNION ALL SELECT 'subscriptions', COUNT(*) FROM subscriptions
   UNION ALL SELECT 'support_tickets', COUNT(*) FROM support_tickets
   UNION ALL SELECT 'board_metrics', COUNT(*) FROM board_metrics;`
);

await show(
  "first 5 customers",
  `SELECT id, company_name, segment, status FROM customers LIMIT 5;`
);

await show(
  "enterprise churn (customer.status)",
  `SELECT segment,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE status = 'churned') AS churned,
          ROUND(COUNT(*) FILTER (WHERE status = 'churned') * 100.0 / COUNT(*), 1) AS churn_pct
   FROM customers GROUP BY segment ORDER BY churn_pct DESC;`
);

await show(
  "enterprise subscriptions by status",
  `SELECT s.status, COUNT(*)
   FROM subscriptions s JOIN customers c ON c.id = s.customer_id
   WHERE c.segment = 'enterprise'
   GROUP BY s.status ORDER BY COUNT(*) DESC;`
);

await show(
  "exercise 9 — currency-ticket correlation",
  `WITH enterprise_customers AS (
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
     SELECT ec.id, ec.status,
       CASE WHEN cc.customer_id IS NOT NULL
            THEN 'filed_currency_ticket'
            ELSE 'no_currency_ticket' END AS group_label
     FROM enterprise_customers ec
     LEFT JOIN currency_complainers cc ON ec.id = cc.customer_id
   )
   SELECT group_label,
          COUNT(*) AS total,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS churned,
          ROUND(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) AS churn_rate_pct
   FROM classified
   GROUP BY group_label
   ORDER BY churn_rate_pct DESC;`
);

await show(
  "MRR by segment",
  `SELECT c.segment,
          COUNT(DISTINCT c.id) AS customers,
          SUM(s.mrr_cents) / 100 AS total_mrr_usd,
          ROUND(SUM(s.mrr_cents) * 100.0 / SUM(SUM(s.mrr_cents)) OVER (), 1) AS revenue_pct
   FROM customers c JOIN subscriptions s ON c.id = s.customer_id
   WHERE s.status = 'active'
   GROUP BY c.segment ORDER BY total_mrr_usd DESC;`
);

await show(
  "board_metrics — story rows",
  `SELECT metric_name, value_decimal, period FROM board_metrics
   WHERE period = '2025-03' ORDER BY metric_name;`
);

await show(
  "board_metrics — enterprise churn arc",
  `SELECT period, value_decimal FROM board_metrics
   WHERE metric_name = 'enterprise_churn_rate' ORDER BY period;`
);

console.log("");
console.log("[verify] done");
