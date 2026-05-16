#!/usr/bin/env node
// scripts/generate-scenarios.mjs
//
// Reads novapay-5k-baseline.sql (already enforced) and emits two scenario
// branches:
//   public/data/novapay-5k-scenario-a.sql  Multi-currency shipped Q3
//   public/data/novapay-5k-scenario-b.sql  SMB-only pivot
// Plus a pre-computed metric comparison:
//   public/data/novapay-comparison-ab.json
//
// Same INSERT-row patching technique as the enforcer — no UPDATE / DELETE.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const baselinePath = resolve(
  process.argv[2] || "public/data/novapay-5k-baseline.sql"
);
const scenarioADir = resolve("public/data/novapay-5k-scenario-a.sql");
const scenarioBDir = resolve("public/data/novapay-5k-scenario-b.sql");
const compareDir = resolve("public/data/novapay-comparison-ab.json");

console.log(`[scenarios] reading ${baselinePath}`);
const raw = readFileSync(baselinePath, "utf8");

// ---------- shared parser (mirror of enforcer) ----------
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
        } else inStr = false;
      }
    } else if (ch === "'") {
      inStr = true;
      buf += ch;
    } else if (ch === ",") {
      out.push(buf.trim());
      buf = "";
    } else buf += ch;
  }
  if (buf.trim().length) out.push(buf.trim());
  return out;
}
const strLit = (v) => `'${String(v).replace(/'/g, "''")}'`;
const unstr = (v) =>
  v.startsWith("'") && v.endsWith("'") ? v.slice(1, -1) : v;

function parseBlocks(sql) {
  const lines = sql.split("\n");
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
    const ends = trimmed.endsWith(";")
      ? ";"
      : trimmed.endsWith(",")
        ? ","
        : "";
    if (!ends) {
      blocks.push(cur);
      cur = null;
      continue;
    }
    cur.rows.push({ lineIdx: i, ends, values: parseValues(line) });
    if (ends === ";") {
      blocks.push(cur);
      cur = null;
    }
  }
  if (cur) blocks.push(cur);
  return { lines, blocks };
}
const rebuildRow = (values, ends) => `  (${values.join(", ")})${ends}`;
const colIdx = (b, name) => b.columns.indexOf(name);
const tablesIn = (blocks, name) => blocks.filter((b) => b.table === name);

// ---------- domain views ----------
function buildView(blocks) {
  const customers = [];
  for (const b of tablesIn(blocks, "customers")) {
    const ixId = colIdx(b, "id");
    const ixSeg = colIdx(b, "segment");
    const ixStatus = colIdx(b, "status");
    for (const r of b.rows) {
      customers.push({
        id: unstr(r.values[ixId]),
        get segment() {
          return unstr(r.values[ixSeg]);
        },
        get status() {
          return unstr(r.values[ixStatus]);
        },
        set status(v) {
          r.values[ixStatus] = strLit(v);
        },
        row: r,
      });
    }
  }
  const subs = [];
  for (const b of tablesIn(blocks, "subscriptions")) {
    const ixCust = colIdx(b, "customer_id");
    const ixStatus = colIdx(b, "status");
    const ixMrr = colIdx(b, "mrr_cents");
    const ixStart = colIdx(b, "started_at");
    const ixCanc = colIdx(b, "cancelled_at");
    for (const r of b.rows) {
      subs.push({
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
        row: r,
      });
    }
  }
  const tickets = [];
  for (const b of tablesIn(blocks, "support_tickets")) {
    const ixCust = colIdx(b, "customer_id");
    const ixCat = colIdx(b, "category");
    for (const r of b.rows) {
      tickets.push({
        customerId: unstr(r.values[ixCust]),
        get category() {
          return unstr(r.values[ixCat]);
        },
        set category(v) {
          r.values[ixCat] = strLit(v);
        },
        row: r,
      });
    }
  }
  return { customers, subs, tickets };
}

function emit(lines, blocks, outPath) {
  for (const b of blocks) {
    for (const r of b.rows) {
      lines[r.lineIdx] = rebuildRow(r.values, r.ends);
    }
  }
  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(
    `[scenarios] wrote ${outPath} (${(lines.join("\n").length / 1024).toFixed(1)} KB)`
  );
}

// ===========================================================================
// SCENARIO A — Multi-currency fix shipped Q3 2025
// ---------------------------------------------------------------------------
// Effect:
//   * Of the 9 churned enterprise customers, REACTIVATE 6 (~65% recovery):
//     subscriptions.status -> 'active', cancelled_at cleared
//     customers.status     -> 'active'
//   * The currency_support / fx_reconciliation tickets on reactivated
//     customers are reclassified as 'billing_question' (problem is fixed)
//   * Active enterprise NRR improves via small MRR bumps (+15% expansion)
// ===========================================================================
{
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);

  const churnedEnt = v.customers.filter(
    (c) => c.segment === "enterprise" && c.status === "churned"
  );
  // Deterministic selection: first 6 of the 9 churned enterprise customers
  const reactivate = new Set(churnedEnt.slice(0, 6).map((c) => c.id));

  for (const c of v.customers) {
    if (reactivate.has(c.id)) c.status = "active";
  }
  let reactivatedSubs = 0;
  for (const s of v.subs) {
    if (reactivate.has(s.customerId) && s.status === "cancelled") {
      s.status = "active";
      reactivatedSubs++;
    }
  }
  // Currency tickets on reactivated customers — fix-applied means the issue
  // is resolved, so the category gets relabelled.
  let scrubbed = 0;
  for (const t of v.tickets) {
    if (
      reactivate.has(t.customerId) &&
      (t.category === "currency_support" || t.category === "fx_reconciliation")
    ) {
      t.category = "billing_question";
      scrubbed++;
    }
  }
  // Expansion on active enterprise: bump MRR 15%
  let bumped = 0;
  const segMap = new Map(v.customers.map((c) => [c.id, c.segment]));
  for (const s of v.subs) {
    if (segMap.get(s.customerId) === "enterprise" && s.status === "active") {
      s.mrr = Math.round(s.mrr * 1.15);
      bumped++;
    }
  }
  console.log(
    `[scenarios] A: reactivated ${reactivate.size} customers / ${reactivatedSubs} subs, scrubbed ${scrubbed} tickets, bumped ${bumped} active-enterprise MRRs`
  );
  emit(lines, blocks, scenarioADir);
}

// ===========================================================================
// SCENARIO B — SMB-only pivot (exit enterprise)
// ---------------------------------------------------------------------------
// Effect:
//   * ALL enterprise customers churn (status='churned' / 'cancelled')
//   * Cancelled_at = 2026-03-15 (clean cut)
//   * SMB churn improves (some currently-cancelled SMB subscriptions
//     reactivate, capturing the support-focus benefit)
//   * Support ticket categories: currency tickets disappear entirely (none
//     of the SMB customers used multi-currency to begin with)
// ===========================================================================
{
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);

  const exitDate = "2026-03-15T00:00:00.000Z";
  const segMap = new Map(v.customers.map((c) => [c.id, c.segment]));
  const enterpriseIds = new Set(
    v.customers.filter((c) => c.segment === "enterprise").map((c) => c.id)
  );

  let churnedCustomers = 0;
  let cancelledSubs = 0;
  for (const c of v.customers) {
    if (enterpriseIds.has(c.id) && c.status !== "churned") {
      c.status = "churned";
      churnedCustomers++;
    }
  }
  for (const s of v.subs) {
    if (enterpriseIds.has(s.customerId) && s.status !== "cancelled") {
      s.status = "cancelled";
      s.cancelledAt = exitDate;
      cancelledSubs++;
    }
  }
  // SMB churn improves: reactivate every 3rd currently-cancelled SMB sub
  let smbReactivated = 0;
  let cnt = 0;
  for (const s of v.subs) {
    if (segMap.get(s.customerId) === "smb" && s.status === "cancelled") {
      cnt++;
      if (cnt % 3 === 0) {
        s.status = "active";
        smbReactivated++;
      }
    }
  }
  // sync SMB customers whose subs reactivated
  const reactivatedSmbCust = new Set();
  for (const s of v.subs) {
    if (
      segMap.get(s.customerId) === "smb" &&
      s.status === "active"
    ) {
      reactivatedSmbCust.add(s.customerId);
    }
  }
  for (const c of v.customers) {
    if (
      c.segment === "smb" &&
      c.status === "churned" &&
      reactivatedSmbCust.has(c.id)
    ) {
      c.status = "active";
    }
  }
  // No currency tickets in SMB-only world
  let scrubbed = 0;
  for (const t of v.tickets) {
    if (t.category === "currency_support" || t.category === "fx_reconciliation") {
      t.category = "billing_question";
      scrubbed++;
    }
  }
  console.log(
    `[scenarios] B: enterprise churned ${churnedCustomers} customers / ${cancelledSubs} subs, SMB reactivated ${smbReactivated}, scrubbed ${scrubbed} currency tickets`
  );
  emit(lines, blocks, scenarioBDir);
}

// ===========================================================================
// Comparison JSON
// ===========================================================================
const comparison = {
  generated_at: new Date().toISOString(),
  baseline: {
    label: "Baseline",
    enterprise_churn_pct: 31.0,
    blended_churn_pct: 19.7,
    enterprise_mrr_pct: 68.1,
    arr_projected_12mo: 2_810_000,
    nrr_enterprise: 85,
    payback_months: null,
    engineering_cost: null,
  },
  scenario_a: {
    label: "Scenario A — Multi-currency fix",
    enterprise_churn_pct: 10.3,
    blended_churn_pct: 16.2,
    enterprise_mrr_pct: 72.0,
    arr_projected_12mo: 3_420_000,
    nrr_enterprise: 108,
    arr_delta_vs_baseline: 610_000,
    engineering_cost: 400_000,
    payback_months: 7.9,
  },
  scenario_b: {
    label: "Scenario B — SMB-only pivot",
    enterprise_churn_pct: 100.0,
    blended_churn_pct: 14.0,
    enterprise_mrr_pct: 0.0,
    arr_projected_12mo: 1_180_000,
    nrr_enterprise: 0,
    arr_delta_vs_baseline: -1_630_000,
    engineering_cost: 0,
    payback_months: null,
  },
};
writeFileSync(compareDir, JSON.stringify(comparison, null, 2), "utf8");
console.log(`[scenarios] wrote ${compareDir}`);
