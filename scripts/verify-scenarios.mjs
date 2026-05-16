import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

async function load(file) {
  const sql = readFileSync(file, "utf8");
  const db = new PGlite();
  const m = sql.indexOf("-- DATA");
  if (m > 0) {
    await db.exec(sql.slice(0, m));
    await db.exec(sql.slice(m));
  } else {
    await db.exec(sql);
  }
  return db;
}

const ENT_CHURN_QUERY = `
SELECT segment,
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status='churned') AS churned,
       ROUND(COUNT(*) FILTER (WHERE status='churned') * 100.0 / COUNT(*), 1) AS churn_pct
FROM customers GROUP BY segment ORDER BY churn_pct DESC;`;

const ENT_SUB_STATUS = `
SELECT s.status, COUNT(*)
FROM subscriptions s JOIN customers c ON c.id = s.customer_id
WHERE c.segment='enterprise' GROUP BY s.status;`;

const MRR_QUERY = `
SELECT c.segment, SUM(s.mrr_cents)/100 AS mrr_usd
FROM customers c JOIN subscriptions s ON c.id = s.customer_id
WHERE s.status='active' GROUP BY c.segment ORDER BY mrr_usd DESC;`;

const SMOKING_GUN = `
WITH ent AS (
  SELECT c.id, s.status FROM customers c JOIN subscriptions s ON c.id=s.customer_id
  WHERE c.segment='enterprise'
), cc AS (
  SELECT DISTINCT customer_id FROM support_tickets
  WHERE category IN ('currency_support','fx_reconciliation')
)
SELECT CASE WHEN cc.customer_id IS NOT NULL THEN 'filed' ELSE 'none' END AS grp,
       COUNT(*) AS total,
       SUM(CASE WHEN ent.status='cancelled' THEN 1 ELSE 0 END) AS churned
FROM ent LEFT JOIN cc ON ent.id=cc.customer_id GROUP BY grp ORDER BY grp;`;

for (const file of [
  "public/data/novapay-5k-baseline.sql",
  "public/data/novapay-5k-scenario-a.sql",
  "public/data/novapay-5k-scenario-b.sql",
]) {
  console.log(`\n===== ${file} =====`);
  const db = await load(file);
  for (const [label, q] of [
    ["churn by segment", ENT_CHURN_QUERY],
    ["enterprise sub status", ENT_SUB_STATUS],
    ["active MRR by segment", MRR_QUERY],
    ["smoking gun", SMOKING_GUN],
  ]) {
    console.log(`-- ${label}`);
    const r = await db.query(q);
    for (const row of r.rows) console.log("  " + JSON.stringify(row));
  }
}
