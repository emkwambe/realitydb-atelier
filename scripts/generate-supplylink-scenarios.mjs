#!/usr/bin/env node
// scripts/generate-supplylink-scenarios.mjs
//
// Reads supplylink-50k-baseline.sql (already enforced) and emits two scenario
// branches:
//   public/data/supplylink-50k-scenario-a.sql  Dual-source Zhonghe
//   public/data/supplylink-50k-scenario-b.sql  Exit Zhonghe
// Plus a pre-computed metric comparison:
//   public/data/supplylink-comparison-ab.json
//
// Pure INSERT-row mutation. No UPDATE/DELETE. Modeled on
// generate-medcore-scenarios.mjs.
//
// Note on Scenario B suppliers: the SupplyLink spec calls for "Seoul
// Components" and "Hanoi Precision" to absorb Zhonghe's volume, but the
// baseline dataset doesn't include those supplier rows. We use the existing
// reliable suppliers (Monterrey Precision and Carolina Fasteners) as the
// volume-redistribution proxies. The narrative still reads correctly to
// students; what changed is that the proxy suppliers already exist.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const baselinePath = resolve(
  process.argv[2] || "public/data/supplylink-50k-baseline.sql"
);
const scenarioAPath = resolve("public/data/supplylink-50k-scenario-a.sql");
const scenarioBPath = resolve("public/data/supplylink-50k-scenario-b.sql");
const compareJson = resolve("public/data/supplylink-comparison-ab.json");

console.log(`[scenarios] reading ${baselinePath}`);
const raw = readFileSync(baselinePath, "utf8");

let _seed = 0xc0ffee5d;
function rng() {
  _seed = (_seed + 0x6d2b79f5) >>> 0;
  let t = _seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
      cur = {
        table: m[1],
        columns: m[2].split(",").map((s) => s.trim().replace(/"/g, "")),
        rows: [],
      };
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

  const suppliers = [];
  for (const b of tablesIn("suppliers")) {
    const ixId = colIdx(b, "id");
    const ixName = colIdx(b, "name");
    for (const r of b.rows) {
      suppliers.push({ id: unstr(r.values[ixId]), name: unstr(r.values[ixName]) });
    }
  }

  const purchaseOrders = [];
  for (const b of tablesIn("purchase_orders")) {
    const ixId = colIdx(b, "id");
    const ixSup = colIdx(b, "supplier_id");
    const ixStatus = colIdx(b, "status");
    for (const r of b.rows) {
      purchaseOrders.push({
        id: unstr(r.values[ixId]),
        get supplierId() { return unstr(r.values[ixSup]); },
        set supplierId(v) { r.values[ixSup] = strLit(v); },
        get status() { return unstr(r.values[ixStatus]); },
        set status(v) { r.values[ixStatus] = strLit(v); },
      });
    }
  }

  const deliveries = [];
  for (const b of tablesIn("deliveries")) {
    const ixPo = colIdx(b, "po_id");
    const ixLate = colIdx(b, "is_late");
    const ixDays = colIdx(b, "days_late");
    const ixExp = colIdx(b, "expedited_flag");
    for (const r of b.rows) {
      deliveries.push({
        poId: unstr(r.values[ixPo]),
        get isLate() { return unstr(r.values[ixLate]); },
        set isLate(v) { r.values[ixLate] = strLit(v); },
        set daysLate(v) { r.values[ixDays] = String(v); },
        get expedited() { return unstr(r.values[ixExp]); },
        set expedited(v) { r.values[ixExp] = strLit(v); },
      });
    }
  }

  const qualityInspections = [];
  for (const b of tablesIn("quality_inspections")) {
    const ixSup = colIdx(b, "supplier_id");
    const ixRate = colIdx(b, "failure_rate_pct");
    const ixCat = colIdx(b, "failure_category");
    const ixDisp = colIdx(b, "disposition");
    const ixUnits = colIdx(b, "units_inspected");
    const ixFailed = colIdx(b, "units_failed");
    for (const r of b.rows) {
      qualityInspections.push({
        get supplierId() { return unstr(r.values[ixSup]); },
        set supplierId(v) { r.values[ixSup] = strLit(v); },
        get failureRatePct() { return parseFloat(r.values[ixRate]); },
        set failureRatePct(v) { r.values[ixRate] = v.toFixed(2); },
        set category(v) { r.values[ixCat] = strLit(v); },
        set disposition(v) { r.values[ixDisp] = strLit(v); },
        get unitsInspected() { return parseInt(r.values[ixUnits], 10); },
        set unitsFailed(v) { r.values[ixFailed] = String(Math.max(0, Math.round(v))); },
      });
    }
  }

  const expeditingEvents = [];
  for (const b of tablesIn("expediting_events")) {
    const ixPo = colIdx(b, "po_id");
    const ixSup = colIdx(b, "supplier_id");
    const ixReason = colIdx(b, "reason");
    const ixEsc = colIdx(b, "escalation_level");
    for (const r of b.rows) {
      expeditingEvents.push({
        get poId() { return unstr(r.values[ixPo]); },
        set poId(v) { r.values[ixPo] = strLit(v); },
        get supplierId() { return unstr(r.values[ixSup]); },
        set supplierId(v) { r.values[ixSup] = strLit(v); },
        set reason(v) { r.values[ixReason] = strLit(v); },
        set escalation(v) { r.values[ixEsc] = strLit(v); },
      });
    }
  }

  return { suppliers, purchaseOrders, deliveries, qualityInspections, expeditingEvents };
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
// SCENARIO A — Dual-source Zhonghe with Monterrey Precision
// ---------------------------------------------------------------------------
// Effect:
//   * Half of Zhonghe late deliveries flip to on-time (24% rate, was 48%)
//   * Quality failure rate halved (~6%, was ~11.5%)
//   * Half of Zhonghe expediting events get reassigned to Monterrey
//     (Zhonghe's share of expediting drops from 41% to ~22%)
// ===========================================================================
{
  _seed = 0xa1b2c3d4;
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);

  const zhongheIds = new Set(v.suppliers.filter((s) => s.name === "Zhonghe Industrial").map((s) => s.id));
  const monterreyIds = v.suppliers.filter((s) => s.name === "Monterrey Precision").map((s) => s.id);
  if (monterreyIds.length === 0) {
    console.warn("[scenarios] A: no Monterrey Precision rows — keeping events on Zhonghe.");
  }

  // Build PO id → supplier_id map (current).
  const poSupplier = new Map(v.purchaseOrders.map((p) => [p.id, p.supplierId]));
  const zhongheDeliveries = v.deliveries.filter((d) => zhongheIds.has(poSupplier.get(d.poId)));

  // Halve late deliveries: flip half of currently-late Zhonghe deliveries to on-time.
  const lateZhonghe = zhongheDeliveries.filter((d) => d.isLate === "true");
  const flipCount = Math.round(lateZhonghe.length * 0.5);
  const shuffled = shuffle(lateZhonghe);
  for (let i = 0; i < flipCount; i++) {
    shuffled[i].isLate = "false";
    shuffled[i].daysLate = 0;
    shuffled[i].expedited = "false";
  }

  // Halve quality failure rate on Zhonghe inspections (was ~11.5% post-Aug,
  // ~2% pre — scale all by ~0.5 with floor at 1%).
  let qiFixed = 0;
  for (const qi of v.qualityInspections) {
    if (!zhongheIds.has(qi.supplierId)) continue;
    const newRate = Math.max(1.0, qi.failureRatePct * 0.5);
    qi.failureRatePct = newRate;
    const inspected = qi.unitsInspected;
    if (Number.isFinite(inspected) && inspected > 0) {
      qi.unitsFailed = Math.round((inspected * newRate) / 100);
    }
    qiFixed++;
  }

  // Reassign half of Zhonghe expediting events to Monterrey to drop Zhonghe's
  // share of expediting from 41% to ~22%.
  let expFixed = 0;
  if (monterreyIds.length > 0) {
    const zhongheExp = v.expeditingEvents.filter((e) => zhongheIds.has(e.supplierId));
    const halfExp = shuffle(zhongheExp).slice(0, Math.round(zhongheExp.length * 0.46));
    // Need a Monterrey PO id pool. If no Monterrey POs exist, skip the po_id reassignment.
    const monterreyPoIds = v.purchaseOrders
      .filter((p) => monterreyIds.includes(p.supplierId))
      .map((p) => p.id);
    for (const e of halfExp) {
      e.supplierId = monterreyIds[Math.floor(rng() * monterreyIds.length)];
      if (monterreyPoIds.length > 0) {
        e.poId = monterreyPoIds[Math.floor(rng() * monterreyPoIds.length)];
      }
      e.reason = "supplier_delay";
      e.escalation = "routine";
      expFixed++;
    }
  }

  console.log(
    `[scenarios] A: Zhonghe deliveries flipped on-time=${flipCount}/${lateZhonghe.length}, quality halved on ${qiFixed} inspections, ${expFixed} expediting events reassigned to Monterrey`
  );
  emit(lines, blocks, scenarioAPath);
}

// ===========================================================================
// SCENARIO B — Exit Zhonghe entirely
// ---------------------------------------------------------------------------
// Effect:
//   * 60% of Zhonghe POs get relabeled to Monterrey/Carolina (volume
//     redistributed to existing reliable suppliers — Seoul/Hanoi proxies)
//   * Remaining 40% of Zhonghe POs marked status='cancelled' (winding down)
//   * Deliveries on relabeled POs reset to on-time/clean
//   * Zhonghe quality_inspections on those deliveries get supplier_id
//     redirected so they no longer hit Zhonghe's row
//   * All Zhonghe expediting events relabeled
// ===========================================================================
{
  _seed = 0xb1b2b3b4;
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);

  const zhongheIds = new Set(v.suppliers.filter((s) => s.name === "Zhonghe Industrial").map((s) => s.id));
  const replacementIds = v.suppliers
    .filter((s) => s.name === "Monterrey Precision" || s.name === "Carolina Fasteners")
    .map((s) => s.id);
  if (replacementIds.length === 0) {
    console.warn("[scenarios] B: no replacement suppliers found.");
  }

  // 60% of Zhonghe POs reassigned to replacement suppliers; 40% cancelled.
  const zhonghePOs = v.purchaseOrders.filter((p) => zhongheIds.has(p.supplierId));
  const shuffled = shuffle(zhonghePOs);
  const reassignCount = Math.round(zhonghePOs.length * 0.6);
  const reassignSet = new Set();
  for (let i = 0; i < reassignCount && i < shuffled.length; i++) {
    const po = shuffled[i];
    if (replacementIds.length > 0) {
      po.supplierId = replacementIds[Math.floor(rng() * replacementIds.length)];
    }
    reassignSet.add(po.id);
  }
  let cancelled = 0;
  for (let i = reassignCount; i < shuffled.length; i++) {
    shuffled[i].status = "cancelled";
    cancelled++;
  }

  // For deliveries on reassigned POs, reset to on-time / clean.
  const reassignedDeliveries = v.deliveries.filter((d) => reassignSet.has(d.poId));
  // Apply 9% late rate (new supplier baseline) instead of 48%.
  const newLateTarget = Math.round(reassignedDeliveries.length * 0.09);
  const dShuffled = shuffle(reassignedDeliveries);
  for (let i = 0; i < dShuffled.length; i++) {
    if (i < newLateTarget) {
      dShuffled[i].isLate = "true";
      dShuffled[i].daysLate = 3;
      dShuffled[i].expedited = "false";
    } else {
      dShuffled[i].isLate = "false";
      dShuffled[i].daysLate = 0;
      dShuffled[i].expedited = "false";
    }
  }

  // Relabel quality_inspections whose supplier was Zhonghe — point them to a
  // replacement supplier and clean the failure rate (1.8% mean per spec).
  let qiRelabeled = 0;
  for (const qi of v.qualityInspections) {
    if (!zhongheIds.has(qi.supplierId)) continue;
    if (replacementIds.length > 0) {
      qi.supplierId = replacementIds[Math.floor(rng() * replacementIds.length)];
    }
    const newRate = 1.5 + rng() * 0.6; // 1.5-2.1%
    qi.failureRatePct = newRate;
    qi.category = "cosmetic";
    qi.disposition = "rework";
    const inspected = qi.unitsInspected;
    if (Number.isFinite(inspected) && inspected > 0) {
      qi.unitsFailed = Math.round((inspected * newRate) / 100);
    }
    qiRelabeled++;
  }

  // All Zhonghe expediting events get reassigned to a replacement supplier.
  let expReassigned = 0;
  const replacementPoIds = v.purchaseOrders
    .filter((p) => replacementIds.includes(p.supplierId))
    .map((p) => p.id);
  for (const e of v.expeditingEvents) {
    if (!zhongheIds.has(e.supplierId)) continue;
    if (replacementIds.length > 0) {
      e.supplierId = replacementIds[Math.floor(rng() * replacementIds.length)];
    }
    if (replacementPoIds.length > 0) {
      e.poId = replacementPoIds[Math.floor(rng() * replacementPoIds.length)];
    }
    e.reason = "supplier_delay";
    e.escalation = "routine";
    expReassigned++;
  }

  console.log(
    `[scenarios] B: ${reassignCount} POs reassigned, ${cancelled} cancelled, ${qiRelabeled} quality inspections cleaned, ${expReassigned} expediting events reassigned`
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
    zhonghe_late_rate_post: 0.479,
    zhonghe_quality_failure_post: 0.1148,
    zhonghe_expediting_share: 0.41,
    total_expediting_cost_annual: 2_800_000,
    quality_rework_cost_annual: 1_100_000,
    stockout_losses_annual: 4_200_000,
    total_zhonghe_cost: 8_100_000,
    zhonghe_annual_spend: 6_400_000,
  },
  scenario_a: {
    label: "Scenario A — Dual-source Zhonghe",
    zhonghe_late_rate: 0.24,
    zhonghe_late_rate_post: 0.24,
    zhonghe_quality_failure: 0.06,
    zhonghe_quality_failure_post: 0.06,
    zhonghe_expediting_share: 0.22,
    total_zhonghe_cost: 4_500_000,
    transition_cost: 450_000,
    net_12mo_benefit: 3_600_000,
    payback_months: 9,
    net_24mo_benefit: 7_200_000,
  },
  scenario_b: {
    label: "Scenario B — Exit Zhonghe",
    zhonghe_late_rate: 0,
    zhonghe_late_rate_post: 0,
    zhonghe_quality_failure: 0,
    zhonghe_quality_failure_post: 0,
    zhonghe_expediting_share: 0,
    zhonghe_volume_remaining: 0,
    new_supplier_late_rate: 0.09,
    total_zhonghe_cost: 0,
    transition_cost: 1_200_000,
    net_12mo_benefit: 1_800_000,
    payback_months: 18,
    net_24mo_benefit: 6_900_000,
  },
};
writeFileSync(compareJson, JSON.stringify(comparison, null, 2), "utf8");
console.log(`[scenarios] wrote ${compareJson}`);
