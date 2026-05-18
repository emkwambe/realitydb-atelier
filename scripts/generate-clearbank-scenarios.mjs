#!/usr/bin/env node
// scripts/generate-clearbank-scenarios.mjs
//
// Reads clearbank-50k-baseline.sql (already enforced) and emits two scenario
// branches plus a pre-computed comparison JSON.
//
//   public/data/clearbank-50k-scenario-a.sql  File SAR, freeze accounts
//   public/data/clearbank-50k-scenario-b.sql  Enhanced monitoring, EDD window
//   public/data/clearbank-comparison-ab.json
//
// Pure INSERT-row mutation. No UPDATE/DELETE. Modeled on
// generate-towernet-scenarios.mjs.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const baselinePath = resolve(
  process.argv[2] || "public/data/clearbank-50k-baseline.sql"
);
const scenarioAPath = resolve("public/data/clearbank-50k-scenario-a.sql");
const scenarioBPath = resolve("public/data/clearbank-50k-scenario-b.sql");
const compareJson = resolve("public/data/clearbank-comparison-ab.json");

console.log(`[scenarios] reading ${baselinePath}`);
const raw = readFileSync(baselinePath, "utf8");

let _seed = 0xc1ea11ba;
function rng() {
  _seed = (_seed + 0x6d2b79f5) >>> 0;
  let t = _seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

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
const unstr = (v) => (v.startsWith("'") && v.endsWith("'") ? v.slice(1, -1) : v);
const rebuildRow = (values, ends) => `  (${values.join(", ")})${ends}`;
const colIdx = (b, name) => b.columns.indexOf(name);

function parseBlocks(sql) {
  const lines = sql.split("\n");
  const blocks = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^INSERT INTO "([^"]+)" \(([^)]+)\) VALUES\s*$/);
    if (m) {
      if (cur) blocks.push(cur);
      cur = { table: m[1], columns: m[2].split(",").map((s) => s.trim().replace(/"/g, "")), rows: [] };
      continue;
    }
    if (!cur) continue;
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("--") || !trimmed.startsWith("(")) {
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
    cur.rows.push({ lineIdx: i, ends, values: parseValues(line) });
    if (ends === ";") {
      blocks.push(cur);
      cur = null;
    }
  }
  if (cur) blocks.push(cur);
  return { lines, blocks };
}

function buildView(blocks) {
  const tablesIn = (name) => blocks.filter((b) => b.table === name);

  // Identify the three target accounts by replaying the enforcer's selection:
  // first three business_checking accounts opened 12-16 months ago. We
  // re-derive instead of hard-coding so scenarios stay consistent if the
  // enforcer's pick changes.
  const NOW_MS = Date.parse("2026-05-18T00:00:00Z");
  const MO = 30 * 24 * 3600 * 1000;
  const LO = NOW_MS - 16 * MO;
  const HI = NOW_MS - 12 * MO;
  const accounts = [];
  for (const b of tablesIn("accounts")) {
    const ixId = colIdx(b, "id");
    const ixCust = colIdx(b, "customer_id");
    const ixType = colIdx(b, "account_type");
    const ixStatus = colIdx(b, "status");
    const ixOpened = colIdx(b, "opened_date");
    for (const r of b.rows) {
      accounts.push({
        id: unstr(r.values[ixId]),
        customerId: unstr(r.values[ixCust]),
        type: unstr(r.values[ixType]),
        openedMs: Date.parse(unstr(r.values[ixOpened])),
        get status() { return unstr(r.values[ixStatus]); },
        set status(v) { r.values[ixStatus] = strLit(v); },
      });
    }
  }
  const eligible = accounts.filter(
    (a) =>
      a.type === "business_checking" &&
      Number.isFinite(a.openedMs) &&
      a.openedMs >= LO &&
      a.openedMs <= HI
  );
  const targets = eligible.slice(0, 3);
  const targetAccountIds = new Set(targets.map((a) => a.id));
  const targetCustomerIds = new Set(targets.map((a) => a.customerId));

  const wires = [];
  for (const b of tablesIn("wires")) {
    const ixAcct = colIdx(b, "account_id");
    const ixStatus = colIdx(b, "status");
    const ixInit = colIdx(b, "initiated_at");
    for (const r of b.rows) {
      wires.push({
        get accountId() { return unstr(r.values[ixAcct]); },
        get status() { return unstr(r.values[ixStatus]); },
        set status(v) { r.values[ixStatus] = strLit(v); },
        get initiatedMs() { return Date.parse(unstr(r.values[ixInit])); },
      });
    }
  }

  const fraudAlerts = [];
  for (const b of tablesIn("fraud_alerts")) {
    const ixAcct = colIdx(b, "account_id");
    const ixStatus = colIdx(b, "status");
    const ixDisp = colIdx(b, "disposition");
    const ixSev = colIdx(b, "severity");
    for (const r of b.rows) {
      fraudAlerts.push({
        get accountId() { return unstr(r.values[ixAcct]); },
        get severity() { return unstr(r.values[ixSev]); },
        set status(v) { r.values[ixStatus] = strLit(v); },
        set disposition(v) { r.values[ixDisp] = v === null ? "NULL" : strLit(v); },
      });
    }
  }

  const sarFilings = [];
  for (const b of tablesIn("sar_filings")) {
    const ixAcct = colIdx(b, "account_id");
    const ixStatus = colIdx(b, "status");
    const ixFiled = colIdx(b, "filed_date");
    for (const r of b.rows) {
      sarFilings.push({
        get accountId() { return unstr(r.values[ixAcct]); },
        set status(v) { r.values[ixStatus] = strLit(v); },
        set filed(v) { r.values[ixFiled] = v === null ? "NULL" : strLit(v); },
      });
    }
  }

  const kycRecords = [];
  for (const b of tablesIn("kyc_records")) {
    const ixCust = colIdx(b, "customer_id");
    const ixStatus = colIdx(b, "verification_status");
    for (const r of b.rows) {
      kycRecords.push({
        get customerId() { return unstr(r.values[ixCust]); },
        set status(v) { r.values[ixStatus] = strLit(v); },
      });
    }
  }

  return { targets, targetAccountIds, targetCustomerIds, accounts, wires, fraudAlerts, sarFilings, kycRecords, NOW_MS };
}

function emit(lines, blocks, outPath) {
  for (const b of blocks) {
    for (const r of b.rows) {
      lines[r.lineIdx] = rebuildRow(r.values, r.ends);
    }
  }
  writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`[scenarios] wrote ${outPath} (${(lines.join("\n").length / 1024).toFixed(1)} KB)`);
}

// ===========================================================================
// SCENARIO A — File SAR, freeze accounts
// ---------------------------------------------------------------------------
// Effect:
//   * ACT-A/B/C accounts: status = 'frozen'
//   * SAR filings on target accounts: status='filed', filed_date=today
//   * Fraud alerts on target accounts: status='closed_filed_sar',
//     disposition='filed_sar'
//   * Wires initiated on/after the freeze date for target accounts:
//     status='held' or 'returned' (60/40 split)
// ===========================================================================
{
  _seed = 0xa1a2a3a4;
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);
  const FREEZE_MS = v.NOW_MS - 1 * 24 * 3600 * 1000; // 1 day ago = decision date

  let frozen = 0;
  for (const a of v.accounts) {
    if (v.targetAccountIds.has(a.id)) {
      a.status = "frozen";
      frozen++;
    }
  }
  let sarFiled = 0;
  const todayISO = new Date(v.NOW_MS).toISOString();
  for (const s of v.sarFilings) {
    if (!v.targetAccountIds.has(s.accountId)) continue;
    s.status = "filed";
    s.filed = todayISO;
    sarFiled++;
  }
  let alertsClosed = 0;
  for (const f of v.fraudAlerts) {
    if (!v.targetAccountIds.has(f.accountId)) continue;
    f.status = "closed_filed_sar";
    f.disposition = "filed_sar";
    alertsClosed++;
  }
  let wiresHeld = 0;
  for (const w of v.wires) {
    if (!v.targetAccountIds.has(w.accountId)) continue;
    if (Number.isFinite(w.initiatedMs) && w.initiatedMs >= FREEZE_MS) {
      w.status = rng() < 0.6 ? "held" : "returned";
      wiresHeld++;
    }
  }
  console.log(
    `[scenarios] A: ${frozen} accounts frozen, ${sarFiled} SARs filed, ${alertsClosed} alerts closed, ${wiresHeld} wires held/returned`
  );
  emit(lines, blocks, scenarioAPath);
}

// ===========================================================================
// SCENARIO B — Enhanced monitoring, 30-day EDD window
// ---------------------------------------------------------------------------
// Effect:
//   * Target accounts: status unchanged (still 'active' or whatever they were)
//   * Fraud alerts on target accounts: status='under_review'
//   * SAR filings: status='under_review' (decision deferred)
//   * KYC records on target customers: status='pending' (we already set this
//     in baseline, kept the same to represent the open EDD request)
//   * Wires: unchanged (monitoring only, not frozen)
// ===========================================================================
{
  _seed = 0xb1b2b3b4;
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);

  let alertsMoved = 0;
  for (const f of v.fraudAlerts) {
    if (!v.targetAccountIds.has(f.accountId)) continue;
    f.status = "under_review";
    alertsMoved++;
  }
  let sarsDeferred = 0;
  for (const s of v.sarFilings) {
    if (!v.targetAccountIds.has(s.accountId)) continue;
    s.status = "under_review";
    sarsDeferred++;
  }
  // Add a pending KYC marker via existing rows on target customers
  let kycReinforced = 0;
  for (const k of v.kycRecords) {
    if (!v.targetCustomerIds.has(k.customerId)) continue;
    k.status = "pending";
    kycReinforced++;
  }
  console.log(
    `[scenarios] B: ${alertsMoved} alerts under_review, ${sarsDeferred} SARs under_review, ${kycReinforced} KYC records reinforced as pending`
  );
  emit(lines, blocks, scenarioBPath);
}

// ===========================================================================
// Comparison JSON
// ===========================================================================
const comparison = {
  generated_at: new Date().toISOString(),
  baseline: {
    label: "Baseline",
    structured_wire_count: 94,
    pct_below_9500: 0.94,
    avg_incoming_wire: 87000,
    total_structured_amount: 3_200_000,
    offshore_destinations: ["KY", "CY", "PA"],
    edd_completion_rate: 0.0,
    open_fraud_alerts: 6,
    sar_status: "draft",
    regulatory_exposure_max: 15_000_000,
  },
  scenario_a: {
    label: "Scenario A — File SAR, freeze accounts",
    sar_filed: true,
    accounts_frozen: 3,
    relationship_revenue_lost: 180_000,
    regulatory_fine_avoided: 15_000_000,
    net_benefit: 14_820_000,
    timeline: "SAR filed within 30 days of detection",
  },
  scenario_b: {
    label: "Scenario B — Enhanced monitoring, 30-day EDD",
    sar_filed: false,
    accounts_monitored: true,
    edd_requested: true,
    edd_deadline_days: 30,
    risk: "late SAR filing penalty if structuring continues during the 30-day window",
    fincen_exam_days_remaining: 60,
    timeline_risk: "EDD 30-day window plus 60-day FinCEN exam — tight overlap",
  },
};
writeFileSync(compareJson, JSON.stringify(comparison, null, 2), "utf8");
console.log(`[scenarios] wrote ${compareJson}`);
