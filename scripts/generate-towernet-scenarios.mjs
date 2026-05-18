#!/usr/bin/env node
// scripts/generate-towernet-scenarios.mjs
//
// Reads towernet-50k-baseline.sql (already enforced) and emits two scenario
// branches plus a pre-computed comparison JSON.
//
//   public/data/towernet-50k-scenario-a.sql  Emergency tower maintenance
//   public/data/towernet-50k-scenario-b.sql  Proactive retention credits
//   public/data/towernet-comparison-ab.json
//
// Pure INSERT-row mutation. No UPDATE/DELETE. Modeled on
// generate-medcore-scenarios.mjs.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const baselinePath = resolve(
  process.argv[2] || "public/data/towernet-50k-baseline.sql"
);
const scenarioAPath = resolve("public/data/towernet-50k-scenario-a.sql");
const scenarioBPath = resolve("public/data/towernet-50k-scenario-b.sql");
const compareJson = resolve("public/data/towernet-comparison-ab.json");

console.log(`[scenarios] reading ${baselinePath}`);
const raw = readFileSync(baselinePath, "utf8");

let _seed = 0xabbacafe;
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

  const towers = [];
  for (const b of tablesIn("towers")) {
    const ixId = colIdx(b, "id");
    const ixCode = colIdx(b, "tower_code");
    const ixUptime = colIdx(b, "uptime_pct_ytd");
    const ixStatus = colIdx(b, "maintenance_status");
    const ixLastMaint = colIdx(b, "last_maintenance_date");
    for (const r of b.rows) {
      towers.push({
        id: unstr(r.values[ixId]),
        get code() { return unstr(r.values[ixCode]); },
        set uptime(v) { r.values[ixUptime] = v.toFixed(3); },
        set status(v) { r.values[ixStatus] = strLit(v); },
        set lastMaint(v) { r.values[ixLastMaint] = strLit(v); },
      });
    }
  }

  const incidents = [];
  for (const b of tablesIn("network_incidents")) {
    const ixTower = colIdx(b, "tower_id");
    const ixStart = colIdx(b, "started_at");
    const ixRes = colIdx(b, "resolved_at");
    const ixDur = colIdx(b, "duration_minutes");
    for (const r of b.rows) {
      incidents.push({
        get towerId() { return unstr(r.values[ixTower]); },
        get startedAt() { return unstr(r.values[ixStart]); },
        get resolvedAt() { return unstr(r.values[ixRes]); },
        set resolvedAt(v) { r.values[ixRes] = strLit(v); },
        get duration() { return parseInt(r.values[ixDur], 10); },
        set duration(v) { r.values[ixDur] = String(Math.max(5, v)); },
      });
    }
  }

  const subscribers = [];
  for (const b of tablesIn("subscribers")) {
    const ixId = colIdx(b, "id");
    const ixTower = colIdx(b, "tower_id");
    const ixStatus = colIdx(b, "status");
    for (const r of b.rows) {
      subscribers.push({
        id: unstr(r.values[ixId]),
        get towerId() { return unstr(r.values[ixTower]); },
        get status() { return unstr(r.values[ixStatus]); },
        set status(v) { r.values[ixStatus] = strLit(v); },
      });
    }
  }

  const subscriptions = [];
  for (const b of tablesIn("subscriptions")) {
    const ixSub = colIdx(b, "subscriber_id");
    const ixStatus = colIdx(b, "status");
    for (const r of b.rows) {
      subscriptions.push({
        get subscriberId() { return unstr(r.values[ixSub]); },
        get status() { return unstr(r.values[ixStatus]); },
        set status(v) { r.values[ixStatus] = strLit(v); },
      });
    }
  }

  const tickets = [];
  for (const b of tablesIn("support_tickets")) {
    const ixSub = colIdx(b, "subscriber_id");
    const ixCat = colIdx(b, "category");
    for (const r of b.rows) {
      tickets.push({
        get subscriberId() { return unstr(r.values[ixSub]); },
        get category() { return unstr(r.values[ixCat]); },
        set category(v) { r.values[ixCat] = strLit(v); },
      });
    }
  }

  const churnSignals = [];
  let csBlock = null;
  for (const b of tablesIn("churn_signals")) {
    csBlock = b;
    const ixSub = colIdx(b, "subscriber_id");
    const ixType = colIdx(b, "signal_type");
    const ixSev = colIdx(b, "severity");
    for (const r of b.rows) {
      churnSignals.push({
        get subscriberId() { return unstr(r.values[ixSub]); },
        get type() { return unstr(r.values[ixType]); },
        set type(v) { r.values[ixType] = strLit(v); },
        get severity() { return unstr(r.values[ixSev]); },
        set severity(v) { r.values[ixSev] = strLit(v); },
      });
    }
  }

  return { towers, incidents, subscribers, subscriptions, tickets, churnSignals, csBlock };
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

const NOW_MS = Date.parse("2026-05-17T00:00:00Z");
const DAY = 24 * 3600 * 1000;
const NQ_CATS = ["network_quality", "coverage"];
const NON_NQ_CATS = ["billing", "device", "roaming", "account", "speed", "other"];

// ===========================================================================
// SCENARIO A — Emergency tower maintenance
// ---------------------------------------------------------------------------
// Effect:
//   * SE-447 tower profile: uptime 0.94 → 0.998, status → 'current',
//     last_maintenance_date → today
//   * All 14 SE-447 incidents: resolved_at = started_at + duration (already
//     true after T6, but we explicitly normalize and tighten duration)
//   * SE-447 subscriber churn: 6.2% → 2.3% (reactivate ~60% of churned subs;
//     sync subscriptions.status = active for those)
//   * Support tickets near SE-447: network_quality/coverage drops 65% → 35%
// ===========================================================================
{
  _seed = 0xa1a2a3a4;
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);

  const se447Ids = new Set(v.towers.filter((t) => t.code === "SE-447").map((t) => t.id));
  if (se447Ids.size === 0) {
    console.warn("[scenarios] A: no SE-447 tower rows in baseline");
  }

  // Tower profile
  let towersFixed = 0;
  const todayISO = new Date(NOW_MS).toISOString();
  for (const t of v.towers) {
    if (!se447Ids.has(t.id)) continue;
    t.uptime = 0.998;
    t.status = "current";
    t.lastMaint = todayISO;
    towersFixed++;
  }

  // Incidents — tighten resolution
  let incFixed = 0;
  for (const inc of v.incidents) {
    if (!se447Ids.has(inc.towerId)) continue;
    const startMs = Date.parse(inc.startedAt);
    if (!Number.isFinite(startMs)) continue;
    const dur = Math.min(inc.duration || 60, 90); // capped at 90 minutes
    inc.duration = dur;
    inc.resolvedAt = new Date(Math.min(NOW_MS, startMs + dur * 60 * 1000)).toISOString();
    incFixed++;
  }

  // Subscriber churn — drop from 6.2% to 2.3% by reactivating ~60% of churned
  const se447Subs = v.subscribers.filter((s) => se447Ids.has(s.towerId));
  const churnedSe447 = se447Subs.filter((s) => s.status === "churned");
  const reactivateCount = Math.round(churnedSe447.length * 0.60);
  const reactivateSet = new Set(
    shuffle(churnedSe447).slice(0, reactivateCount).map((s) => s.id)
  );
  let reactivated = 0;
  for (const s of v.subscribers) {
    if (reactivateSet.has(s.id)) {
      s.status = "active";
      reactivated++;
    }
  }
  // Sync subscriptions
  let subFlipped = 0;
  for (const sub of v.subscriptions) {
    if (reactivateSet.has(sub.subscriberId) && sub.status === "cancelled") {
      sub.status = "active";
      subFlipped++;
    }
  }

  // Tickets near SE-447 — drop NQ share from 65% to 35%
  const se447SubIds = new Set(se447Subs.map((s) => s.id));
  const se447Tickets = v.tickets.filter((t) => se447SubIds.has(t.subscriberId));
  const newNQTarget = Math.round(se447Tickets.length * 0.35);
  const shuffledT = shuffle(se447Tickets);
  let nqFixed = 0;
  for (let i = 0; i < shuffledT.length; i++) {
    if (i < newNQTarget) {
      shuffledT[i].category = NQ_CATS[Math.floor(rng() * NQ_CATS.length)];
    } else {
      shuffledT[i].category = NON_NQ_CATS[Math.floor(rng() * NON_NQ_CATS.length)];
    }
    nqFixed++;
  }

  console.log(
    `[scenarios] A: ${towersFixed} SE-447 tower rows refreshed, ${incFixed} incidents tightened, ` +
      `${reactivated} subscribers reactivated, ${subFlipped} subscriptions re-activated, ` +
      `${nqFixed} tickets re-categorized (NQ target ${newNQTarget})`
  );
  emit(lines, blocks, scenarioAPath);
}

// ===========================================================================
// SCENARIO B — Proactive retention credits (network NOT fixed)
// ---------------------------------------------------------------------------
// Effect:
//   * Tower profile unchanged (SE-447 still degraded — the point of B)
//   * Mark 40% of churned SE-447 subscribers as retained (status → 'active'),
//     simulates credit-offer acceptance
//   * For each retained subscriber, ensure a churn_signal with
//     signal_type='promotion_accepted' exists (we relabel an existing signal
//     where possible; otherwise the change is implicit)
//   * Subscriptions synced
// ===========================================================================
{
  _seed = 0xb1b2b3b4;
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);

  const se447Ids = new Set(v.towers.filter((t) => t.code === "SE-447").map((t) => t.id));
  const se447Subs = v.subscribers.filter((s) => se447Ids.has(s.towerId));
  const churnedSe447 = se447Subs.filter((s) => s.status === "churned");
  const retainCount = Math.round(churnedSe447.length * 0.40);
  const retainSet = new Set(
    shuffle(churnedSe447).slice(0, retainCount).map((s) => s.id)
  );

  let retained = 0;
  for (const s of v.subscribers) {
    if (retainSet.has(s.id)) {
      s.status = "active";
      retained++;
    }
  }
  let subSynced = 0;
  for (const sub of v.subscriptions) {
    if (retainSet.has(sub.subscriberId) && sub.status === "cancelled") {
      sub.status = "active";
      subSynced++;
    }
  }

  // Relabel one churn_signal per retained subscriber to 'promotion_accepted'
  // where the subscriber has at least one churn_signal row.
  // Note: 'promotion_accepted' is not in the original enum; relabel to the
  // closest existing value 'plan_downgrade' instead to keep enum validity at
  // 100. The scenario's intent (a positive retention event) is conveyed by
  // the subscriber's status flip and the count, not by a new enum value.
  // (Adding a new enum value would require a CREATE TABLE change and that
  // breaks PGlite-friendly pure-CREATE-INSERT output.)
  let signalsRelabeled = 0;
  const seen = new Set();
  for (const sig of v.churnSignals) {
    if (!retainSet.has(sig.subscriberId)) continue;
    if (seen.has(sig.subscriberId)) continue;
    seen.add(sig.subscriberId);
    sig.type = "plan_downgrade";
    sig.severity = "low";
    signalsRelabeled++;
  }

  console.log(
    `[scenarios] B: ${retained}/${churnedSe447.length} SE-447 churned subscribers retained (40% target), ${subSynced} subscriptions re-activated, ${signalsRelabeled} churn signals relabeled`
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
    se447_incident_count: 14,
    se447_churn_rate: 0.062,
    other_towers_churn_rate: 0.019,
    se447_subscriber_count: 68000,
    excess_churn_monthly: 2924,
    arpu_dollars: 45,
    monthly_revenue_loss: 131580,
    arr_at_risk: 1579000,
  },
  scenario_a: {
    label: "Scenario A — Emergency tower maintenance",
    se447_incident_count: 14,
    se447_churn_rate: 0.023,
    other_towers_churn_rate: 0.019,
    capex_cost: 2100000,
    monthly_revenue_recovered: 88452,
    arr_recovered: 1061424,
    payback_months: 23.7,
    network_fixed: true,
  },
  scenario_b: {
    label: "Scenario B — Proactive retention credits",
    se447_incident_count: 14,
    se447_churn_rate: 0.037,
    other_towers_churn_rate: 0.019,
    credit_cost: 1800000,
    subscribers_retained: 1169,
    revenue_retained: 630126,
    network_fixed: false,
    risk: "SE-447 still degraded — churn will resume after credits expire",
  },
};
writeFileSync(compareJson, JSON.stringify(comparison, null, 2), "utf8");
console.log(`[scenarios] wrote ${compareJson}`);
