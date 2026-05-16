#!/usr/bin/env node
// scripts/enforce-novapay-story.mjs
//
// RealityDB Atelier — NovaPay Story Enforcer (v2)
//
// Patches the freshly-generated novapay-5k.sql INSERT rows IN PLACE to enforce
// the hidden story, then emits a pure CREATE + INSERT baseline that PGlite
// loads cleanly (no UPDATE / DELETE / INTERVAL / correlated subqueries).
//
// Enforced invariants:
//   T1: failure_code becomes nullable
//   T2: signed_at <= created_at on every customer
//   T3: mrr_cents respects segment ranges
//         enterprise   $8,000 – $25,000 / mo
//         mid_market   $999  – $1,999 / mo
//         smb          $99   – $299 / mo
//   T4: ~32% of enterprise customers are churned (3.2% × 10 months snapshot)
//         distribution: 11% in 18-12mo window, 13% in 12-6mo, 8% in last 6mo
//         (subscription.status='cancelled', customer.status='churned',
//          cancelled_at staggered, started_at <= cancelled_at)
//   T5: SMOKING GUN — currency-ticket correlation
//         churned enterprise: 64% have at least one currency_support /
//                             fx_reconciliation ticket
//         active enterprise:  ~4% have at least one
//   T6: board_metrics rows rewritten with story values + 18-month arc
//
// Usage:  node scripts/enforce-novapay-story.mjs [in.sql] [out.sql]

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { argv } from "node:process";

const inputPath = resolve(
  argv[2] || "public/data/novapay-5k.sql"
);
const outputPath = resolve(
  argv[3] || "public/data/novapay-5k-baseline.sql"
);

console.log(`[enforce] in  ${inputPath}`);
console.log(`[enforce] out ${outputPath}`);

// ---------------- Deterministic RNG (mulberry32) ----------------
let _seed = 0x9e3779b1;
function rng() {
  _seed = (_seed + 0x6d2b79f5) >>> 0;
  let t = _seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// ---------------- T1: failure_code nullability ----------------
let sql = readFileSync(inputPath, "utf8");
sql = sql.replace(
  /"failure_code" VARCHAR\(50\) NOT NULL,/g,
  '"failure_code" VARCHAR(50),'
);

const lines = sql.split("\n");

// ---------------- Parse INSERT blocks ----------------
//
// CLI emits:
//   INSERT INTO "table" ("c1", "c2", ...) VALUES
//     (v, v, ...),
//     (v, v, ...);
//
// We capture each row as { lineIdx, ends } and re-serialize after mutation.

/**
 * @typedef {Object} RowRef
 * @property {number} lineIdx     - index into `lines`
 * @property {string} ends        - ',' or ';'
 * @property {string[]} values    - parsed cell strings (still SQL-literal form)
 */
/**
 * @typedef {Object} Block
 * @property {string} table
 * @property {string[]} columns
 * @property {number} headerIdx
 * @property {RowRef[]} rows
 */

/** @type {Block[]} */
const blocks = [];
let cur = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const m = line.match(/^INSERT INTO "([^"]+)" \(([^)]+)\) VALUES\s*$/);
  if (m) {
    if (cur) blocks.push(cur);
    cur = {
      table: m[1],
      columns: m[2].split(",").map((s) => s.trim().replace(/"/g, "")),
      headerIdx: i,
      rows: [],
    };
    continue;
  }
  if (!cur) continue;
  const trimmed = line.trim();
  if (
    trimmed.length === 0 ||
    trimmed.startsWith("--") ||
    !trimmed.startsWith("(")
  ) {
    blocks.push(cur);
    cur = null;
    continue;
  }
  const ends = trimmed.endsWith(";") ? ";" : trimmed.endsWith(",") ? "," : "";
  if (!ends) {
    blocks.push(cur);
    cur = null;
    continue;
  }
  cur.rows.push({
    lineIdx: i,
    ends,
    values: parseValues(line),
  });
  if (ends === ";") {
    blocks.push(cur);
    cur = null;
  }
}
if (cur) blocks.push(cur);

console.log(
  `[enforce] parsed ${blocks.length} INSERT blocks, ${blocks
    .reduce((a, b) => a + b.rows.length, 0)} rows`
);

// ---------------- Value parsing / serialization ----------------
function parseValues(rowLine) {
  const start = rowLine.indexOf("(");
  const end = rowLine.lastIndexOf(")");
  const inner = rowLine.slice(start + 1, end);
  const out = [];
  let buf = "";
  let inStr = false;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (inStr) {
      buf += ch;
      if (ch === "'") {
        if (inner[i + 1] === "'") {
          buf += "'";
          i++;
        } else {
          inStr = false;
        }
      }
    } else if (ch === "'") {
      inStr = true;
      buf += ch;
    } else if (ch === ",") {
      out.push(buf.trim());
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim().length) out.push(buf.trim());
  return out;
}
function rebuildRow(values, ends) {
  return `  (${values.join(", ")})${ends}`;
}
function strLit(v) {
  return `'${String(v).replace(/'/g, "''")}'`;
}
function unstr(v) {
  return v.startsWith("'") && v.endsWith("'") ? v.slice(1, -1) : v;
}

const blocksByTable = (name) => blocks.filter((b) => b.table === name);
const colIdx = (b, name) => b.columns.indexOf(name);

// ---------------- Build domain maps ----------------
const customers = []; // { id, segmentRef:{block,row,ix}, statusRef, signedRef, createdRef }
for (const b of blocksByTable("customers")) {
  const ixId = colIdx(b, "id");
  const ixSeg = colIdx(b, "segment");
  const ixStatus = colIdx(b, "status");
  const ixSigned = colIdx(b, "signed_at");
  const ixCreated = colIdx(b, "created_at");
  for (const r of b.rows) {
    customers.push({
      id: unstr(r.values[ixId]),
      get segment() {
        return unstr(r.values[ixSeg]);
      },
      set segment(v) {
        r.values[ixSeg] = strLit(v);
      },
      get status() {
        return unstr(r.values[ixStatus]);
      },
      set status(v) {
        r.values[ixStatus] = strLit(v);
      },
      get signedAt() {
        return unstr(r.values[ixSigned]);
      },
      set signedAt(v) {
        r.values[ixSigned] = strLit(v);
      },
      get createdAt() {
        return unstr(r.values[ixCreated]);
      },
      set createdAt(v) {
        r.values[ixCreated] = strLit(v);
      },
      block: b,
      row: r,
    });
  }
}
console.log(`[enforce] customers parsed: ${customers.length}`);

const subscriptions = [];
for (const b of blocksByTable("subscriptions")) {
  const ixId = colIdx(b, "id");
  const ixCust = colIdx(b, "customer_id");
  const ixStatus = colIdx(b, "status");
  const ixMrr = colIdx(b, "mrr_cents");
  const ixStart = colIdx(b, "started_at");
  const ixCanc = colIdx(b, "cancelled_at");
  for (const r of b.rows) {
    subscriptions.push({
      id: unstr(r.values[ixId]),
      customerId: unstr(r.values[ixCust]),
      get status() {
        return unstr(r.values[ixStatus]);
      },
      set status(v) {
        r.values[ixStatus] = strLit(v);
      },
      get mrr() {
        return parseInt(r.values[ixMrr], 10);
      },
      set mrr(v) {
        r.values[ixMrr] = String(Math.round(v));
      },
      get startedAt() {
        return unstr(r.values[ixStart]);
      },
      set startedAt(v) {
        r.values[ixStart] = strLit(v);
      },
      get cancelledAt() {
        return unstr(r.values[ixCanc]);
      },
      set cancelledAt(v) {
        r.values[ixCanc] = strLit(v);
      },
    });
  }
}
console.log(`[enforce] subscriptions parsed: ${subscriptions.length}`);

const tickets = [];
for (const b of blocksByTable("support_tickets")) {
  const ixCust = colIdx(b, "customer_id");
  const ixCat = colIdx(b, "category");
  const ixOpened = colIdx(b, "opened_at");
  for (const r of b.rows) {
    tickets.push({
      customerId: unstr(r.values[ixCust]),
      get category() {
        return unstr(r.values[ixCat]);
      },
      set category(v) {
        r.values[ixCat] = strLit(v);
      },
      get openedAt() {
        return unstr(r.values[ixOpened]);
      },
      set openedAt(v) {
        r.values[ixOpened] = strLit(v);
      },
    });
  }
}
console.log(`[enforce] support_tickets parsed: ${tickets.length}`);

// ---------------- T2: signed_at <= created_at ----------------
let t2Fixed = 0;
for (const c of customers) {
  const s = Date.parse(c.signedAt);
  const cr = Date.parse(c.createdAt);
  if (Number.isFinite(s) && Number.isFinite(cr) && s > cr) {
    c.signedAt = new Date(cr).toISOString();
    c.createdAt = new Date(s).toISOString();
    t2Fixed++;
  }
}
console.log(`[enforce] T2 temporal-order fixed: ${t2Fixed} rows`);

// ---------------- T3: MRR by segment ----------------
const custSegment = new Map(customers.map((c) => [c.id, c.segment]));
const mrrRange = {
  enterprise: [800_000, 2_500_000], // $8k - $25k
  mid_market: [99_900, 199_900], // $999 - $1,999
  smb: [9_900, 29_900], // $99 - $299
};
let t3Fixed = 0;
for (const s of subscriptions) {
  const seg = custSegment.get(s.customerId);
  const range = mrrRange[seg];
  if (!range) continue;
  const [lo, hi] = range;
  const v = lo + Math.floor(rng() * (hi - lo));
  s.mrr = v;
  t3Fixed++;
}
console.log(`[enforce] T3 MRR set on ${t3Fixed} subscriptions`);

// ---------------- T4: Enterprise churn arc ----------------
//
// Target 32% of enterprise customers churned (snapshot of 3.2%/mo × ~10 mo).
// Arc distribution among the churned cohort:
//   18-12 months ago:  ~34% of churn  (early-stage)
//   12-6  months ago:  ~41% of churn  (acceleration)
//   6-0   months ago:  ~25% of churn  (recent)
//
// Subscriptions whose customer is enterprise get reset to consistent state:
//   active   -> started_at preserved, cancelled_at = signed_at + ε (placeholder
//               we never read because status != cancelled)
//   churned  -> status='cancelled', started_at <= cancelled_at, cancelled_at
//               within the chosen window
//
// All other (non-enterprise) customers/subs left alone.

const enterpriseCustomers = customers.filter((c) => c.segment === "enterprise");
console.log(`[enforce] enterprise customers: ${enterpriseCustomers.length}`);

const subsByCustomer = new Map();
for (const s of subscriptions) {
  const arr = subsByCustomer.get(s.customerId) || [];
  arr.push(s);
  subsByCustomer.set(s.customerId, arr);
}

const targetChurnPct = 0.32;
const enterpriseToChurn = Math.max(
  1,
  Math.round(enterpriseCustomers.length * targetChurnPct)
);

// Deterministic shuffle
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const NOW = Date.parse("2026-05-15T00:00:00Z");
const MO = 30 * 24 * 3600 * 1000;
function dateInMonthsAgoWindow(loMo, hiMo) {
  const span = (loMo - hiMo) * MO;
  const offset = rng() * span;
  return new Date(NOW - hiMo * MO - offset).toISOString();
}

const churnArcBuckets = [
  { loMo: 18, hiMo: 12, weight: 0.34 },
  { loMo: 12, hiMo: 6, weight: 0.41 },
  { loMo: 6, hiMo: 0, weight: 0.25 },
];

const shuffledEnt = shuffle(enterpriseCustomers);
const churnedSet = new Set();
let cursor = 0;
for (const bucket of churnArcBuckets) {
  const n = Math.round(enterpriseToChurn * bucket.weight);
  for (let i = 0; i < n && cursor < enterpriseToChurn; i++, cursor++) {
    const cust = shuffledEnt[cursor];
    if (!cust) break;
    cust.status = "churned";
    churnedSet.add(cust.id);
    const subs = subsByCustomer.get(cust.id) || [];
    for (const s of subs) {
      s.status = "cancelled";
      const cancelledAt = dateInMonthsAgoWindow(bucket.loMo, bucket.hiMo);
      s.cancelledAt = cancelledAt;
      // make sure started_at precedes cancelled_at by 6-30 months
      const startedAt = new Date(
        Date.parse(cancelledAt) - (6 + rng() * 24) * MO
      ).toISOString();
      s.startedAt = startedAt;
    }
  }
}

// Force the remaining enterprise customers to be active (override their
// possibly-random initial status, and reset any cancelled subs they have)
for (let i = cursor; i < shuffledEnt.length; i++) {
  const c = shuffledEnt[i];
  c.status = "active";
  const subs = subsByCustomer.get(c.id) || [];
  for (const s of subs) {
    if (s.status === "cancelled") s.status = "active";
  }
}
console.log(
  `[enforce] T4 enterprise churned=${churnedSet.size} active=${enterpriseCustomers.length - churnedSet.size}`
);

// ---------------- T5: SMOKING GUN currency-ticket correlation ----------------

const ticketsByCustomer = new Map();
for (const t of tickets) {
  const arr = ticketsByCustomer.get(t.customerId) || [];
  arr.push(t);
  ticketsByCustomer.set(t.customerId, arr);
}

// Target: 64% of churned enterprise customers have AT LEAST ONE currency
// ticket; ~4% of active enterprise customers do.
//
// Pack-generated data assigns most tickets to SMB customers, leaving most
// enterprise customers with zero tickets. We synthesize fresh ticket rows
// here so the smoking gun fires reliably regardless of the random sample.

// 1. Scrub pre-existing currency-category tickets from ALL enterprise
//    customers (clean slate so step 3 controls the signal fully).
let scrubbed = 0;
for (const cust of enterpriseCustomers) {
  const arr = ticketsByCustomer.get(cust.id) || [];
  for (const t of arr) {
    if (t.category === "currency_support" || t.category === "fx_reconciliation") {
      t.category = "billing_question";
      scrubbed++;
    }
  }
}
console.log(`[enforce] T5 scrubbed ${scrubbed} pre-existing enterprise currency tickets`);

// 2. Decide who gets a synthesized currency ticket.
const churnedEnt = enterpriseCustomers.filter((c) => churnedSet.has(c.id));
const activeEnt = enterpriseCustomers.filter((c) => !churnedSet.has(c.id));
const nChurnedWithCurrency = Math.round(churnedEnt.length * 0.64);
const nActiveWithCurrency = Math.max(0, Math.round(activeEnt.length * 0.04));

const churnedPicks = shuffle(churnedEnt).slice(0, nChurnedWithCurrency);
const activePicks = shuffle(activeEnt).slice(0, nActiveWithCurrency);

// 3. Build synthetic ticket rows. Each row is shaped exactly like the
//    pack-generated rows so the CLI's appended INSERT lines parse identically.
const ticketHeader = `INSERT INTO "support_tickets" ("id", "customer_id", "category", "priority", "status", "satisfaction_score", "resolution_time_hours", "subject", "opened_at", "resolved_at", "created_at") VALUES`;
const subByCustChurned = new Map();
for (const s of subscriptions) {
  if (s.status === "cancelled" && custSegment.get(s.customerId) === "enterprise") {
    subByCustChurned.set(s.customerId, s);
  }
}
function uuidV4() {
  const b = new Uint8Array(16);
  for (let i = 0; i < 16; i++) b[i] = Math.floor(rng() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10).join("")}`;
}

const syntheticTicketLines = [];
function pushTicket(custId, category, openedAtISO, resolvedAtISO, ends) {
  const v = [
    strLit(uuidV4()),
    strLit(custId),
    strLit(category),
    strLit("high"),
    strLit("open"),
    String(2),
    String(72),
    strLit(
      category === "currency_support"
        ? "Multi-currency support required for European customers"
        : "FX reconciliation discrepancy in EUR/GBP invoices"
    ),
    strLit(openedAtISO),
    strLit(resolvedAtISO),
    strLit(openedAtISO),
  ];
  syntheticTicketLines.push(`  (${v.join(", ")})${ends}`);
}

const allSynth = [];
for (const cust of churnedPicks) {
  const sub = subByCustChurned.get(cust.id);
  const cancelled = sub ? Date.parse(sub.cancelledAt) : NOW;
  const opened = new Date(
    (Number.isFinite(cancelled) ? cancelled : NOW) -
      Math.floor(10 + rng() * 70) * 24 * 3600 * 1000
  ).toISOString();
  const resolved = new Date(
    Date.parse(opened) + (24 + Math.floor(rng() * 120)) * 3600 * 1000
  ).toISOString();
  const category = rng() < 0.6 ? "currency_support" : "fx_reconciliation";
  allSynth.push({ custId: cust.id, category, opened, resolved });
}
for (const cust of activePicks) {
  const opened = new Date(NOW - Math.floor(rng() * 60) * 24 * 3600 * 1000).toISOString();
  const resolved = new Date(
    Date.parse(opened) + (24 + Math.floor(rng() * 240)) * 3600 * 1000
  ).toISOString();
  allSynth.push({ custId: cust.id, category: "currency_support", opened, resolved });
}

// Emit synthesized rows as INSERT-row strings (with provisional ',' end;
// the trailing one will be flipped to ';' just before splice-in below).
allSynth.forEach((s, i) => {
  pushTicket(
    s.custId,
    s.category,
    s.opened,
    s.resolved,
    i === allSynth.length - 1 ? ";" : ","
  );
});

// Update in-memory ticketsByCustomer so the self-check below is accurate.
for (const s of allSynth) {
  const arr = ticketsByCustomer.get(s.custId) || [];
  arr.push({ category: s.category, customerId: s.custId, openedAt: s.opened });
  ticketsByCustomer.set(s.custId, arr);
}

console.log(
  `[enforce] T5 synthesized ${allSynth.length} currency tickets (churned=${churnedPicks.length}/${churnedEnt.length}, active=${activePicks.length}/${activeEnt.length})`
);

// ---------------- T6: board_metrics ----------------
//
// We can't issue DELETE in PGlite-safe baseline, so we rewrite the existing
// board_metrics INSERT blocks. Because the original block has more rows than
// the story needs, we let the leftover slots carry harmless current-period
// blended metrics that won't contradict the story.

const storyMetrics = [
  ["blended_churn_rate", 0.014, "2025-03"],
  ["enterprise_churn_rate", 0.032, "2025-03"],
  ["smb_churn_rate", 0.009, "2025-03"],
  ["mid_market_churn_rate", 0.013, "2025-03"],
  ["nrr_blended", 0.96, "2025-03"],
  ["nrr_enterprise", 0.85, "2025-03"],
  ["nrr_smb", 1.1, "2025-03"],
  ["ltv_cac_ratio", 3.2, "2025-03"],
  ["cac_payback_months", 14.0, "2025-03"],
  ["gross_margin_pct", 71.0, "2025-03"],
  ["runway_months", 18.0, "2025-03"],
  ["total_arr_dollars", 2100000.0, "2025-03"],
  ["mrr_growth_pct", 0.08, "2025-03"],
];
// Enterprise-churn 18-month arc (rising)
const arc = [
  ["2023-10", 0.011],
  ["2023-11", 0.013],
  ["2023-12", 0.012],
  ["2024-01", 0.014],
  ["2024-02", 0.015],
  ["2024-03", 0.017],
  ["2024-04", 0.019],
  ["2024-05", 0.021],
  ["2024-06", 0.024],
  ["2024-07", 0.026],
  ["2024-08", 0.028],
  ["2024-09", 0.029],
  ["2024-10", 0.030],
  ["2024-11", 0.031],
  ["2024-12", 0.032],
  ["2025-01", 0.032],
  ["2025-02", 0.032],
];
const arcMetrics = arc.map(([period, val]) => [
  "enterprise_churn_rate",
  val,
  period,
]);
const allMetricRows = [...storyMetrics, ...arcMetrics];

// Get existing board_metrics blocks, count slots
const bmBlocks = blocksByTable("board_metrics");
const bmSlots = bmBlocks.reduce((acc, b) => acc + b.rows.length, 0);
console.log(
  `[enforce] T6 board_metrics: have ${bmSlots} slots, want ${allMetricRows.length}`
);

// Overwrite the FIRST N rows with our story metrics, then leave the rest
// of the original CLI-generated rows untouched. That way the story-period
// queries (WHERE period='2025-03' AND metric_name=...) return clean values
// and the remaining rows carry harmless background variation.
//
// Values are stored as percentage points (0.014 -> 1.40, 0.96 -> 96.00,
// 3.2 -> 320.00) because NUMERIC(12,2) only keeps 2 decimal places and
// 0.014 would round to 0.01. Briefing UI and rubric reference these as
// already-percentage values.
let mi = 0;
outer: for (const b of bmBlocks) {
  const ixName = colIdx(b, "metric_name");
  const ixVal = colIdx(b, "value_decimal");
  const ixPeriod = colIdx(b, "period");
  const ixRec = colIdx(b, "recorded_at");
  const ixCreated = colIdx(b, "created_at");
  for (const r of b.rows) {
    if (mi >= allMetricRows.length) break outer;
    const [name, val, period] = allMetricRows[mi++];
    const stored = Math.round(val * 100 * 100) / 100;
    r.values[ixName] = strLit(name);
    r.values[ixVal] = stored.toFixed(2);
    r.values[ixPeriod] = strLit(period);
    r.values[ixRec] = "NOW()";
    r.values[ixCreated] = "NOW()";
  }
}
console.log(`[enforce] T6 wrote ${mi} story metrics (rest untouched)`);

// ---------------- Re-serialize ----------------
for (const b of blocks) {
  for (const r of b.rows) {
    lines[r.lineIdx] = rebuildRow(r.values, r.ends);
  }
}

// Append synthesized currency tickets as a new INSERT block AFTER the
// last existing support_tickets block (we insert in line order by index
// to keep CREATE-then-INSERT ordering intact for PGlite).
let finalLines = lines;
if (syntheticTicketLines.length > 0) {
  // mark last row with `;`, others with `,`
  const formatted = syntheticTicketLines.map((row, i, arr) =>
    i === arr.length - 1
      ? row.replace(/,$/, ";")
      : row.replace(/;$/, ",")
  );
  const stBlocks = blocksByTable("support_tickets");
  const lastStBlock = stBlocks[stBlocks.length - 1];
  const lastRow = lastStBlock.rows[lastStBlock.rows.length - 1];
  const insertAt = lastRow.lineIdx + 1;
  const block = ["", ticketHeader, ...formatted];
  finalLines = [
    ...lines.slice(0, insertAt),
    ...block,
    ...lines.slice(insertAt),
  ];
}

const finalSql = finalLines.join("\n");
writeFileSync(outputPath, finalSql, "utf8");
const kb = (finalSql.length / 1024).toFixed(1);
console.log(`[enforce] wrote ${kb} KB to ${outputPath}`);

// ---------------- Self-check ----------------
console.log("");
console.log("[enforce] self-check (in-memory snapshot)");
const entAll = customers.filter((c) => c.segment === "enterprise");
const entChurned = entAll.filter((c) => c.status === "churned");
const entActive = entAll.filter((c) => c.status === "active");
console.log(
  `  enterprise: total=${entAll.length} churned=${entChurned.length} active=${entActive.length} (${((entChurned.length / entAll.length) * 100).toFixed(1)}%)`
);
const currencyCats = new Set(["currency_support", "fx_reconciliation"]);
function pctWithCurrency(cohort) {
  if (cohort.length === 0) return 0;
  let n = 0;
  for (const c of cohort) {
    const arr = ticketsByCustomer.get(c.id) || [];
    if (arr.some((t) => currencyCats.has(t.category))) n++;
  }
  return ((n / cohort.length) * 100).toFixed(1);
}
console.log(
  `  churned ent with currency ticket: ${pctWithCurrency(entChurned)}%`
);
console.log(
  `  active  ent with currency ticket: ${pctWithCurrency(entActive)}%`
);
console.log("[enforce] done");
