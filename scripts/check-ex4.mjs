import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
const sql = readFileSync("public/data/novapay-5k-baseline.sql", "utf8");
const db = new PGlite();
const m = sql.indexOf("-- DATA");
await db.exec(sql.slice(0, m));
await db.exec(sql.slice(m));

console.log("--- Ex4: churn by segment in last 18mo ---");
const r = await db.query(`
SELECT c.segment,
       DATE_TRUNC('month', s.cancelled_at) AS month,
       COUNT(*) AS churned
FROM subscriptions s JOIN customers c ON s.customer_id = c.id
WHERE s.status = 'cancelled' AND s.cancelled_at >= NOW() - INTERVAL '18 months'
GROUP BY c.segment, month
ORDER BY c.segment, month;`);
for (const row of r.rows) console.log(JSON.stringify(row));

console.log("\n--- enterprise arc (subscriptions) ---");
const r2 = await db.query(`
SELECT DATE_TRUNC('month', s.cancelled_at) AS month,
       COUNT(*) AS cancellations
FROM subscriptions s JOIN customers c ON c.id = s.customer_id
WHERE c.segment='enterprise' AND s.status='cancelled'
GROUP BY month ORDER BY month;`);
for (const row of r2.rows) console.log(JSON.stringify(row));
