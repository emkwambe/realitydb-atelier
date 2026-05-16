// Fetches the dataset from the *running dev server* (same path the browser
// takes) and runs Exercise 9's exact reference SQL through PGlite.

import { PGlite } from "@electric-sql/pglite";
import { novaPayExercises } from "../content/companies/novapay/exercises.ts";

const url = "http://localhost:3001/data/novapay-5k-baseline.sql";
console.log(`[ex9] fetching ${url}`);
const res = await fetch(url);
if (!res.ok) {
  console.error(`HTTP ${res.status}`);
  process.exit(1);
}
const sql = await res.text();
console.log(`[ex9] fetched ${(sql.length / 1024).toFixed(1)} KB`);

const db = new PGlite();
const marker = sql.indexOf("-- DATA");
await db.exec(sql.slice(0, marker));
await db.exec(sql.slice(marker));
console.log("[ex9] PGlite loaded (schema + data)");

console.log("\n--- SELECT * FROM customers LIMIT 5 ---");
const five = await db.query("SELECT * FROM customers LIMIT 5");
console.log(`rowCount=${five.rows.length}`);
for (const r of five.rows) {
  console.log(`  ${r.company_name} | ${r.segment} | ${r.status}`);
}

const ex9 = novaPayExercises.find((e) => e.id === 9);
console.log(`\n--- Exercise 9: "${ex9.title}" ---`);
console.log(`Question: ${ex9.businessQuestion}`);
console.log("\nReference SQL:");
console.log(ex9.referenceSQL);
console.log("\nResult:");
const r9 = await db.query(ex9.referenceSQL);
for (const row of r9.rows) console.log("  " + JSON.stringify(row));

const filed = r9.rows.find((r) => r.group_label === "filed_currency_ticket");
const none = r9.rows.find((r) => r.group_label === "no_currency_ticket");
if (!filed || !none) {
  console.error("\n[FAIL] missing one of the smoking-gun groups");
  process.exit(1);
}
const ratio = Number(filed.churn_rate_pct) / Number(none.churn_rate_pct);
console.log(`\n[smoking gun] filed=${filed.churn_rate_pct}% vs none=${none.churn_rate_pct}% (${ratio.toFixed(1)}× signal)`);

console.log("\n--- Exercise 4 spot-check: segment churn ---");
const r4 = await db.query(`
  SELECT segment,
         COUNT(*) AS total,
         COUNT(*) FILTER (WHERE status='churned') AS churned,
         ROUND(COUNT(*) FILTER (WHERE status='churned') * 100.0 / COUNT(*), 1) AS pct
  FROM customers GROUP BY segment ORDER BY pct DESC;`);
for (const row of r4.rows) console.log("  " + JSON.stringify(row));
