#!/usr/bin/env node
// scripts/enforce-towernet-story.mjs
//
// RealityDB Atelier — TowerNet Story Enforcer
//
// Patches the freshly-generated towernet-50k-v1.1.sql INSERT rows IN PLACE
// to enforce the SE-447 tower-cluster degradation arc, then emits a pure
// CREATE + INSERT baseline that PGlite loads cleanly (no UPDATE / DELETE).
//
// Modeled on enforce-medcore-story.mjs and enforce-supplylink-story.mjs.
//
// Enforced invariants:
//   T0: Identify SE-447 tower rows (engine generates ~7 rows per
//       declared tower_code due to cascade math; we treat all of them
//       as the same logical tower).
//   T1: SE-447 tower profile fixed
//         uptime_pct_ytd = 0.94, maintenance_status = 'critical_backlog',
//         last_maintenance_date = 14 months ago
//   T2: Network incident concentration at SE-447
//         Exactly 14 incidents on SE-447, all outage/equipment_failure,
//         severity high/critical, distributed across last 8 months.
//         Excess SE-447 incidents (above 14) relabeled to non-SE-447 towers.
//   T3: Subscriber churn near SE-447 = 6.2%
//         Other towers churn = 1.9%
//         Synced subscriptions.status (cancelled), cancelled_at within 8mo.
//   T4: Support ticket concentration
//         For SE-447 subscribers, 65% of tickets in network_quality/coverage
//   T5: Churn signals near SE-447
//         45% of SE-447 churn signals = network_complaint
//         60% of SE-447 churn signals = high or critical severity
//   T6: Temporal ordering
//         subscriptions.cancelled_at >= started_at when status='cancelled'
//         network_incidents.resolved_at >= started_at
//         support_tickets.resolved_at >= opened_at
//         invoices.paid_at >= issued_at when status='paid'
//   T7: Strip NOT NULL from columns the pack spec marks nullable
//
// Usage:  node scripts/enforce-towernet-story.mjs [in.sql] [out.sql]

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { argv } from "node:process";

const inputPath = resolve(
  argv[2] ||
    "C:/Users/HP/Documents/realityDB Packs/towernet-50k-v1.1.sql"
);
const outputPath = resolve(
  argv[3] || "public/data/towernet-50k-baseline.sql"
);

console.log(`[enforce] in  ${inputPath}`);
console.log(`[enforce] out ${outputPath}`);

// Deterministic RNG.
let _seed = 0x70e1be71;
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
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// ---------------- T7: Strip NOT NULL (raw text replace before parse) ----------------
let sql = readFileSync(inputPath, "utf8");
const notNullStrips = [
  ['"cancelled_at" TIMESTAMPTZ NOT NULL,',         '"cancelled_at" TIMESTAMPTZ,'],
  ['"resolved_at" TIMESTAMPTZ NOT NULL,',          '"resolved_at" TIMESTAMPTZ,'],
  ['"satisfaction_score" INTEGER NOT NULL,',       '"satisfaction_score" INTEGER,'],
  ['"paid_at" TIMESTAMPTZ NOT NULL,',              '"paid_at" TIMESTAMPTZ,'],
  ['"last_maintenance_date" VARCHAR(255) NOT NULL,', '"last_maintenance_date" VARCHAR(255),'],
];
let t7 = 0;
for (const [from, to] of notNullStrips) {
  const before = sql.length;
  sql = sql.split(from).join(to);
  if (sql.length !== before) t7++;
}
console.log(`[enforce] T7: stripped NOT NULL from ${t7} columns`);

// ---------------- Parse INSERT blocks ----------------
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
      headerIdx: i,
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

console.log(
  `[enforce] parsed ${blocks.length} INSERT blocks, ${blocks.reduce((a, b) => a + b.rows.length, 0)} rows`
);

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
const tablesIn = (name) => blocks.filter((b) => b.table === name);

// ---------------- Time constants ----------------
const NOW_MS = Date.parse("2026-05-17T00:00:00Z");
const DAY = 24 * 3600 * 1000;
const MO = 30 * DAY;
const EIGHT_MO_AGO = NOW_MS - 8 * MO;
const FOURTEEN_MO_AGO = NOW_MS - 14 * MO;

// ---------------- T0: Identify SE-447 tower rows ----------------
const towers = [];
for (const b of tablesIn("towers")) {
  const ixId = colIdx(b, "id");
  const ixCode = colIdx(b, "tower_code");
  const ixCluster = colIdx(b, "cluster_id");
  const ixUptime = colIdx(b, "uptime_pct_ytd");
  const ixStatus = colIdx(b, "maintenance_status");
  const ixLastMaint = colIdx(b, "last_maintenance_date");
  for (const r of b.rows) {
    towers.push({
      id: unstr(r.values[ixId]),
      get code() { return unstr(r.values[ixCode]); },
      get cluster() { return unstr(r.values[ixCluster]); },
      set uptime(v) { r.values[ixUptime] = v.toFixed(2); },
      set status(v) { r.values[ixStatus] = strLit(v); },
      set lastMaint(v) { r.values[ixLastMaint] = strLit(v); },
    });
  }
}
const se447Ids = new Set(towers.filter((t) => t.code === "SE-447").map((t) => t.id));
console.log(`[enforce] T0: SE-447 tower rows: ${se447Ids.size} / ${towers.length} total towers`);
if (se447Ids.size === 0) {
  console.error("[enforce] ERROR: no SE-447 tower rows. Did baseline use the right pack?");
  process.exit(1);
}

// ---------------- T1: Fix SE-447 tower profile ----------------
let t1Fixed = 0;
const lastMaintISO = new Date(FOURTEEN_MO_AGO).toISOString();
for (const t of towers) {
  if (!se447Ids.has(t.id)) continue;
  t.uptime = 0.94;
  t.status = "critical_backlog";
  t.lastMaint = lastMaintISO;
  t1Fixed++;
}
console.log(`[enforce] T1: SE-447 tower rows fixed: ${t1Fixed}`);

// ---------------- Build domain views for downstream T2-T6 ----------------
const incidents = [];
for (const b of tablesIn("network_incidents")) {
  const ixId = colIdx(b, "id");
  const ixTower = colIdx(b, "tower_id");
  const ixType = colIdx(b, "incident_type");
  const ixSev = colIdx(b, "severity");
  const ixStart = colIdx(b, "started_at");
  const ixResolved = colIdx(b, "resolved_at");
  const ixDuration = colIdx(b, "duration_minutes");
  for (const r of b.rows) {
    incidents.push({
      id: unstr(r.values[ixId]),
      get towerId() { return unstr(r.values[ixTower]); },
      set towerId(v) { r.values[ixTower] = strLit(v); },
      get type() { return unstr(r.values[ixType]); },
      set type(v) { r.values[ixType] = strLit(v); },
      get severity() { return unstr(r.values[ixSev]); },
      set severity(v) { r.values[ixSev] = strLit(v); },
      get startedAt() { return unstr(r.values[ixStart]); },
      set startedAt(v) { r.values[ixStart] = strLit(v); },
      get resolvedAt() { return unstr(r.values[ixResolved]); },
      set resolvedAt(v) { r.values[ixResolved] = strLit(v); },
      get duration() { return parseInt(r.values[ixDuration], 10); },
      set duration(v) { r.values[ixDuration] = String(Math.max(5, v)); },
    });
  }
}
console.log(`[enforce] incidents: ${incidents.length}`);

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
console.log(`[enforce] subscribers: ${subscribers.length}`);

const subscriptions = [];
for (const b of tablesIn("subscriptions")) {
  const ixSub = colIdx(b, "subscriber_id");
  const ixStatus = colIdx(b, "status");
  const ixStart = colIdx(b, "started_at");
  const ixCanc = colIdx(b, "cancelled_at");
  for (const r of b.rows) {
    subscriptions.push({
      get subscriberId() { return unstr(r.values[ixSub]); },
      get status() { return unstr(r.values[ixStatus]); },
      set status(v) { r.values[ixStatus] = strLit(v); },
      get startedAt() { return unstr(r.values[ixStart]); },
      set startedAt(v) { r.values[ixStart] = strLit(v); },
      get cancelledAt() { return unstr(r.values[ixCanc]); },
      set cancelledAt(v) { r.values[ixCanc] = strLit(v); },
    });
  }
}
console.log(`[enforce] subscriptions: ${subscriptions.length}`);

const tickets = [];
for (const b of tablesIn("support_tickets")) {
  const ixSub = colIdx(b, "subscriber_id");
  const ixCat = colIdx(b, "category");
  const ixOpened = colIdx(b, "opened_at");
  const ixResolved = colIdx(b, "resolved_at");
  for (const r of b.rows) {
    tickets.push({
      get subscriberId() { return unstr(r.values[ixSub]); },
      get category() { return unstr(r.values[ixCat]); },
      set category(v) { r.values[ixCat] = strLit(v); },
      get openedAt() { return unstr(r.values[ixOpened]); },
      set openedAt(v) { r.values[ixOpened] = strLit(v); },
      get resolvedAt() { return unstr(r.values[ixResolved]); },
      set resolvedAt(v) { r.values[ixResolved] = strLit(v); },
    });
  }
}
console.log(`[enforce] tickets: ${tickets.length}`);

const churnSignals = [];
for (const b of tablesIn("churn_signals")) {
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
console.log(`[enforce] churn_signals: ${churnSignals.length}`);

const invoices = [];
for (const b of tablesIn("invoices")) {
  const ixStatus = colIdx(b, "status");
  const ixIssued = colIdx(b, "issued_at");
  const ixPaid = colIdx(b, "paid_at");
  for (const r of b.rows) {
    invoices.push({
      get status() { return unstr(r.values[ixStatus]); },
      get issuedAt() { return unstr(r.values[ixIssued]); },
      set issuedAt(v) { r.values[ixIssued] = strLit(v); },
      get paidAt() { return unstr(r.values[ixPaid]); },
      set paidAt(v) { r.values[ixPaid] = strLit(v); },
    });
  }
}
console.log(`[enforce] invoices: ${invoices.length}`);

// ---------------- T2: Network incident concentration on SE-447 ----------------
// Target: exactly 14 incidents on SE-447 (currently 0..many; relabel to/from
// non-SE-447 towers). All SE-447 incidents: type outage|equipment_failure,
// severity high|critical, distributed across last 8 months with proper
// resolved_at within 1-72 hours.

const TARGET_SE447_INCIDENTS = 14;
const SE447_INCIDENT_TYPES = ["outage", "equipment_failure"];
const SE447_INCIDENT_SEVS = ["high", "critical"];

const nonSe447TowerIds = towers.filter((t) => !se447Ids.has(t.id)).map((t) => t.id);
const se447IdArr = Array.from(se447Ids);

const currentSe447Incidents = incidents.filter((i) => se447Ids.has(i.towerId));
const currentOtherIncidents = incidents.filter((i) => !se447Ids.has(i.towerId));

let t2Promoted = 0; // non-SE447 → SE447
let t2Demoted = 0;  // SE447 → non-SE447

if (currentSe447Incidents.length < TARGET_SE447_INCIDENTS) {
  const need = TARGET_SE447_INCIDENTS - currentSe447Incidents.length;
  const pool = shuffle(currentOtherIncidents).slice(0, need);
  for (const inc of pool) {
    inc.towerId = se447IdArr[Math.floor(rng() * se447IdArr.length)];
    currentSe447Incidents.push(inc);
    t2Promoted++;
  }
} else if (currentSe447Incidents.length > TARGET_SE447_INCIDENTS) {
  const surplus = currentSe447Incidents.length - TARGET_SE447_INCIDENTS;
  const toMove = shuffle(currentSe447Incidents.slice()).slice(0, surplus);
  const toRemove = new Set(toMove.map((x) => x.id));
  for (const inc of toMove) {
    inc.towerId = nonSe447TowerIds[Math.floor(rng() * nonSe447TowerIds.length)];
    t2Demoted++;
  }
  // rebuild list
  currentSe447Incidents.length = 0;
  for (const inc of incidents) {
    if (se447Ids.has(inc.towerId) && !toRemove.has(inc.id)) {
      currentSe447Incidents.push(inc);
    }
  }
}

// Now stamp type/severity/timing on the final 14
for (let i = 0; i < currentSe447Incidents.length; i++) {
  const inc = currentSe447Incidents[i];
  inc.type = SE447_INCIDENT_TYPES[Math.floor(rng() * SE447_INCIDENT_TYPES.length)];
  inc.severity = SE447_INCIDENT_SEVS[Math.floor(rng() * SE447_INCIDENT_SEVS.length)];
  // Spread across last 8 months
  const slot = (i + 0.5) / TARGET_SE447_INCIDENTS; // 0..1
  const startedMs = EIGHT_MO_AGO + slot * (NOW_MS - EIGHT_MO_AGO);
  const durationMin = 30 + Math.floor(rng() * 4 * 60); // 30 min - 4 hours
  const resolvedMs = Math.min(NOW_MS, startedMs + durationMin * 60 * 1000);
  inc.startedAt = new Date(startedMs).toISOString();
  inc.resolvedAt = new Date(resolvedMs).toISOString();
  inc.duration = durationMin;
}
console.log(
  `[enforce] T2: SE-447 incidents → ${currentSe447Incidents.length} (target ${TARGET_SE447_INCIDENTS}); promoted=${t2Promoted}, demoted=${t2Demoted}`
);

// Optional: also fix timing on other incidents so resolved_at >= started_at
// (handled in T6 pass below for the whole table).

// ---------------- T3: Subscriber churn near SE-447 ----------------
const TARGET_SE447_CHURN = 0.062;
const TARGET_OTHER_CHURN = 0.019;

const se447Subs = subscribers.filter((s) => se447Ids.has(s.towerId));
const otherSubs = subscribers.filter((s) => !se447Ids.has(s.towerId));

function applyChurnRate(cohort, rate) {
  const targetChurned = Math.round(cohort.length * rate);
  // Prefer to keep currently-churned subs (preserves their churn signals).
  const alreadyChurned = cohort.filter((s) => s.status === "churned");
  const notChurned = cohort.filter((s) => s.status !== "churned");
  const keepChurned = new Set();
  // Start with all alreadyChurned, then trim or extend
  if (alreadyChurned.length >= targetChurned) {
    for (const s of shuffle(alreadyChurned).slice(0, targetChurned)) keepChurned.add(s.id);
  } else {
    for (const s of alreadyChurned) keepChurned.add(s.id);
    const need = targetChurned - alreadyChurned.length;
    for (const s of shuffle(notChurned).slice(0, need)) keepChurned.add(s.id);
  }
  let flippedToActive = 0;
  let flippedToChurned = 0;
  for (const s of cohort) {
    if (keepChurned.has(s.id)) {
      if (s.status !== "churned") {
        s.status = "churned";
        flippedToChurned++;
      }
    } else {
      if (s.status === "churned") {
        s.status = "active";
        flippedToActive++;
      } else if (s.status === "suspended") {
        // leave suspended alone; spec accounts for ~3% suspended
      }
    }
  }
  return { keepChurned, flippedToChurned, flippedToActive, target: targetChurned };
}

const t3Se447 = applyChurnRate(se447Subs, TARGET_SE447_CHURN);
const t3Other = applyChurnRate(otherSubs, TARGET_OTHER_CHURN);
console.log(
  `[enforce] T3: SE-447 churn ${t3Se447.target}/${se447Subs.length} (${(TARGET_SE447_CHURN * 100).toFixed(1)}%); other churn ${t3Other.target}/${otherSubs.length} (${(TARGET_OTHER_CHURN * 100).toFixed(1)}%)`
);
const churnedIds = new Set([...t3Se447.keepChurned, ...t3Other.keepChurned]);

// Sync subscriptions: status='cancelled' iff their subscriber is churned.
let t3SubFlipped = 0;
for (const sub of subscriptions) {
  if (churnedIds.has(sub.subscriberId)) {
    if (sub.status !== "cancelled") {
      sub.status = "cancelled";
      t3SubFlipped++;
    }
  } else {
    // Non-churned subscribers' subscriptions should not be 'cancelled'.
    if (sub.status === "cancelled") {
      sub.status = "active";
    }
  }
}
console.log(`[enforce] T3: subscriptions synced (cancelled flag): ${t3SubFlipped} flipped to cancelled`);

// ---------------- T4: Support ticket concentration near SE-447 ----------------
// For SE-447 subscribers' tickets, set 65% to network_quality/coverage.
const se447SubIds = new Set(se447Subs.map((s) => s.id));
const se447Tickets = tickets.filter((t) => se447SubIds.has(t.subscriberId));
const TARGET_NQ_PCT = 0.65;
const NQ_CATS = ["network_quality", "coverage"];
const NON_NQ_CATS = ["billing", "device", "roaming", "account", "speed", "other"];

const nqTarget = Math.round(se447Tickets.length * TARGET_NQ_PCT);
const shuffledTickets = shuffle(se447Tickets);
let t4Set = 0;
for (let i = 0; i < shuffledTickets.length; i++) {
  if (i < nqTarget) {
    shuffledTickets[i].category = NQ_CATS[Math.floor(rng() * NQ_CATS.length)];
  } else {
    // Only override if currently in NQ_CATS — otherwise leave alone to preserve
    // organic distribution for non-network categories.
    if (NQ_CATS.includes(shuffledTickets[i].category)) {
      shuffledTickets[i].category = NON_NQ_CATS[Math.floor(rng() * NON_NQ_CATS.length)];
    }
  }
  t4Set++;
}
console.log(`[enforce] T4: SE-447 tickets — ${nqTarget}/${se447Tickets.length} set to network_quality/coverage`);

// ---------------- T5: Churn signals near SE-447 ----------------
const se447Signals = churnSignals.filter((c) => se447SubIds.has(c.subscriberId));
const TARGET_NC_PCT = 0.45;
const TARGET_HC_PCT = 0.60;
const NC_TYPES = ["network_complaint"];
const OTHER_SIGNAL_TYPES = ["usage_drop", "payment_failure", "support_spike", "competitor_inquiry", "plan_downgrade"];
const HIGH_CRIT = ["high", "critical"];
const LOW_MED = ["low", "medium"];

const ncTarget = Math.round(se447Signals.length * TARGET_NC_PCT);
const hcTarget = Math.round(se447Signals.length * TARGET_HC_PCT);
const ncPick = new Set(shuffle(se447Signals.slice()).slice(0, ncTarget).map((s, i) => i));
// Actually we need stable IDs — but churn_signals here are referenced by array
// position only. Use indices into se447Signals.
const ncIdx = new Set(shuffle(se447Signals.map((_, i) => i)).slice(0, ncTarget));
const hcIdx = new Set(shuffle(se447Signals.map((_, i) => i)).slice(0, hcTarget));

for (let i = 0; i < se447Signals.length; i++) {
  const s = se447Signals[i];
  if (ncIdx.has(i)) {
    s.type = "network_complaint";
  } else {
    // If currently network_complaint but not picked, reassign to another type
    // so we don't overshoot. Otherwise leave organic.
    if (s.type === "network_complaint") {
      s.type = OTHER_SIGNAL_TYPES[Math.floor(rng() * OTHER_SIGNAL_TYPES.length)];
    }
  }
  if (hcIdx.has(i)) {
    s.severity = HIGH_CRIT[Math.floor(rng() * HIGH_CRIT.length)];
  } else {
    if (s.severity === "high" || s.severity === "critical") {
      s.severity = LOW_MED[Math.floor(rng() * LOW_MED.length)];
    }
  }
}
console.log(
  `[enforce] T5: SE-447 churn signals — ${ncTarget}/${se447Signals.length} network_complaint, ${hcTarget}/${se447Signals.length} high/critical`
);
// Suppress lint: ncPick is unused now (kept for clarity above).
void ncPick;

// ---------------- T6: Temporal ordering ----------------
// subscriptions: cancelled_at >= started_at when status='cancelled'
let t6Subs = 0;
for (const sub of subscriptions) {
  if (sub.status !== "cancelled") continue;
  const startMs = Date.parse(sub.startedAt);
  let cancMs = Date.parse(sub.cancelledAt);
  if (!Number.isFinite(startMs)) continue;
  // For SE-447 churned subs, anchor cancellation within last 8 months.
  const wantSe447Recent = churnedIds.has(sub.subscriberId);
  if (!Number.isFinite(cancMs) || cancMs < startMs) {
    if (wantSe447Recent) {
      cancMs = EIGHT_MO_AGO + Math.floor(rng() * (NOW_MS - EIGHT_MO_AGO));
      if (cancMs < startMs) cancMs = startMs + Math.floor(rng() * 7) * DAY;
    } else {
      cancMs = startMs + (30 + Math.floor(rng() * 720)) * DAY;
    }
    sub.cancelledAt = new Date(Math.min(cancMs, NOW_MS)).toISOString();
    t6Subs++;
  } else if (wantSe447Recent && cancMs < EIGHT_MO_AGO) {
    // Push SE-447 cancellations into the last 8 months for the story window.
    const ms = EIGHT_MO_AGO + Math.floor(rng() * (NOW_MS - EIGHT_MO_AGO));
    sub.cancelledAt = new Date(Math.max(ms, startMs + DAY)).toISOString();
    t6Subs++;
  }
}
console.log(`[enforce] T6: subscriptions cancelled_at fixed: ${t6Subs}`);

// network_incidents: resolved_at >= started_at
let t6Inc = 0;
for (const inc of incidents) {
  const startMs = Date.parse(inc.startedAt);
  const resMs = Date.parse(inc.resolvedAt);
  if (!Number.isFinite(startMs)) continue;
  if (!Number.isFinite(resMs) || resMs < startMs) {
    const dur = Math.max(15, inc.duration || 60);
    const newRes = Math.min(NOW_MS, startMs + dur * 60 * 1000);
    inc.resolvedAt = new Date(newRes).toISOString();
    t6Inc++;
  }
}
console.log(`[enforce] T6: incidents resolved_at fixed: ${t6Inc}`);

// support_tickets: resolved_at >= opened_at (always, since the column is now
// nullable — we keep dates and just normalize order)
let t6Tix = 0;
for (const t of tickets) {
  const openMs = Date.parse(t.openedAt);
  const resMs = Date.parse(t.resolvedAt);
  if (!Number.isFinite(openMs)) continue;
  if (!Number.isFinite(resMs) || resMs < openMs) {
    const newRes = Math.min(NOW_MS, openMs + (1 + Math.floor(rng() * 14)) * DAY);
    t.resolvedAt = new Date(newRes).toISOString();
    t6Tix++;
  }
}
console.log(`[enforce] T6: tickets resolved_at fixed: ${t6Tix}`);

// invoices: paid_at >= issued_at (when status='paid')
let t6Inv = 0;
for (const inv of invoices) {
  const issMs = Date.parse(inv.issuedAt);
  const paidMs = Date.parse(inv.paidAt);
  if (!Number.isFinite(issMs)) continue;
  if (inv.status === "paid") {
    if (!Number.isFinite(paidMs) || paidMs < issMs) {
      const newPaid = Math.min(NOW_MS, issMs + (1 + Math.floor(rng() * 30)) * DAY);
      inv.paidAt = new Date(newPaid).toISOString();
      t6Inv++;
    }
  } else {
    // For non-paid invoices the column has a junk date; ensure >= issued_at
    if (!Number.isFinite(paidMs) || paidMs < issMs) {
      inv.paidAt = new Date(issMs + DAY).toISOString();
      t6Inv++;
    }
  }
}
console.log(`[enforce] T6: invoices paid_at fixed: ${t6Inv}`);

// ---------------- Re-serialize ----------------
for (const b of blocks) {
  for (const r of b.rows) {
    lines[r.lineIdx] = rebuildRow(r.values, r.ends);
  }
}

const finalSql = lines.join("\n");
writeFileSync(outputPath, finalSql, "utf8");
const kb = (finalSql.length / 1024).toFixed(1);
console.log(`[enforce] wrote ${kb} KB to ${outputPath}`);

// ---------------- Self-check ----------------
console.log("");
console.log("[enforce] self-check (in-memory snapshot)");

const finalSe447Incidents = incidents.filter((i) => se447Ids.has(i.towerId));
console.log(`  SE-447 incident count:                 ${finalSe447Incidents.length} (target 14)`);

const finalSe447Churned = se447Subs.filter((s) => s.status === "churned").length;
console.log(
  `  SE-447 churn rate:                     ${((finalSe447Churned / Math.max(1, se447Subs.length)) * 100).toFixed(1)}% (target 6.2%)`
);
const finalOtherChurned = otherSubs.filter((s) => s.status === "churned").length;
console.log(
  `  Other towers churn rate:               ${((finalOtherChurned / Math.max(1, otherSubs.length)) * 100).toFixed(1)}% (target 1.9%)`
);

const finalSe447NQ = se447Tickets.filter((t) =>
  NQ_CATS.includes(t.category)
).length;
console.log(
  `  SE-447 network_quality+coverage pct:   ${((finalSe447NQ / Math.max(1, se447Tickets.length)) * 100).toFixed(1)}% (target 65%)`
);

const allNQ = tickets.filter((t) => NQ_CATS.includes(t.category)).length;
console.log(
  `  System network_quality+coverage pct:   ${((allNQ / Math.max(1, tickets.length)) * 100).toFixed(1)}% (target 36%)`
);

const finalSe447NC = se447Signals.filter((s) => s.type === "network_complaint").length;
console.log(
  `  SE-447 network_complaint signal pct:   ${((finalSe447NC / Math.max(1, se447Signals.length)) * 100).toFixed(1)}% (target 45%)`
);

console.log("[enforce] done");
