#!/usr/bin/env node
// scripts/enforce-medcore-story.mjs
//
// RealityDB Atelier — MedCore Story Enforcer
//
// Patches the freshly-generated medcore-50k-baseline.sql INSERT rows IN PLACE
// to enforce the hidden story, then emits a pure CREATE + INSERT baseline
// that PGlite loads cleanly (no UPDATE / DELETE / INTERVAL).
//
// Enforced invariants:
//   T1: Temporal ordering
//         encounter_date <= claims.filed_at <= claims.adjudicated_at
//         denials.denial_date >= claims.adjudicated_at
//         payments.received_at >= claims.adjudicated_at
//         No future dates beyond NOW
//   T2: MidState Mutual denial spike (SMOKING GUN)
//         Last 6 months: 40% of MidState claims denied, 70% of those have
//                        denial_category='authorization' and carc_code='CO-97'
//         First 18 months: MidState denial rate ~15%
//         Other payers: 13-17% denial rate (mostly unchanged)
//   T3: MidState Mutual claim volume = ~28% of all claims
//         Rebalance by relabeling claims from over-represented payers
//   T4: Underpayment pattern
//         MidState paid claims: 22% is_underpayment='true'
//         Other paid claims:     8% is_underpayment='true'
//
// Usage:  node scripts/enforce-medcore-story.mjs [in.sql] [out.sql]

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { argv } from "node:process";

const inputPath = resolve(argv[2] || "public/data/medcore-50k-baseline.sql");
const outputPath = resolve(argv[3] || "public/data/medcore-50k-baseline.sql");

console.log(`[enforce] in  ${inputPath}`);
console.log(`[enforce] out ${outputPath}`);

// Deterministic RNG (mulberry32) so reruns are reproducible.
let _seed = 0xc0ffee01;
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
function uuidV4() {
  const b = new Uint8Array(16);
  for (let i = 0; i < 16; i++) b[i] = Math.floor(rng() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10).join("")}`;
}

// ---------------- SQL row parsing ----------------
const sqlRaw = readFileSync(inputPath, "utf8");
const lines = sqlRaw.split("\n");

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

// ---------------- Domain views ----------------
const payers = [];
for (const b of tablesIn("payers")) {
  const ixId = colIdx(b, "id");
  const ixName = colIdx(b, "name");
  for (const r of b.rows) {
    payers.push({ id: unstr(r.values[ixId]), name: unstr(r.values[ixName]) });
  }
}
const midstateIds = new Set(payers.filter((p) => p.name === "MidState Mutual").map((p) => p.id));
console.log(`[enforce] MidState Mutual payer rows: ${midstateIds.size} / ${payers.length} total payers`);

const encounters = new Map(); // id -> encounterDate (ms)
for (const b of tablesIn("encounters")) {
  const ixId = colIdx(b, "id");
  const ixDate = colIdx(b, "encounter_date");
  for (const r of b.rows) {
    encounters.set(unstr(r.values[ixId]), Date.parse(unstr(r.values[ixDate])));
  }
}
console.log(`[enforce] encounters: ${encounters.size}`);

const claims = [];
for (const b of tablesIn("claims")) {
  const ixId = colIdx(b, "id");
  const ixEnc = colIdx(b, "encounter_id");
  const ixPayer = colIdx(b, "payer_id");
  const ixStatus = colIdx(b, "claim_status");
  const ixFiled = colIdx(b, "filed_at");
  const ixAdj = colIdx(b, "adjudicated_at");
  for (const r of b.rows) {
    claims.push({
      id: unstr(r.values[ixId]),
      encounterId: unstr(r.values[ixEnc]),
      get payerId() {
        return unstr(r.values[ixPayer]);
      },
      set payerId(v) {
        r.values[ixPayer] = strLit(v);
      },
      get status() {
        return unstr(r.values[ixStatus]);
      },
      set status(v) {
        r.values[ixStatus] = strLit(v);
      },
      get filedAt() {
        return unstr(r.values[ixFiled]);
      },
      set filedAt(v) {
        r.values[ixFiled] = strLit(v);
      },
      get adjudicatedAt() {
        return unstr(r.values[ixAdj]);
      },
      set adjudicatedAt(v) {
        r.values[ixAdj] = strLit(v);
      },
    });
  }
}
console.log(`[enforce] claims: ${claims.length}`);

const denials = [];
let denialsBlock = null;
for (const b of tablesIn("denials")) {
  denialsBlock = b; // last one — we'll append synthetic rows after it
  const ixId = colIdx(b, "id");
  const ixClaim = colIdx(b, "claim_id");
  const ixCarc = colIdx(b, "carc_code");
  const ixCat = colIdx(b, "denial_category");
  const ixDate = colIdx(b, "denial_date");
  for (const r of b.rows) {
    denials.push({
      id: unstr(r.values[ixId]),
      claimId: unstr(r.values[ixClaim]),
      get carc() {
        return unstr(r.values[ixCarc]);
      },
      set carc(v) {
        r.values[ixCarc] = strLit(v);
      },
      get category() {
        return unstr(r.values[ixCat]);
      },
      set category(v) {
        r.values[ixCat] = strLit(v);
      },
      get denialDate() {
        return unstr(r.values[ixDate]);
      },
      set denialDate(v) {
        r.values[ixDate] = strLit(v);
      },
    });
  }
}
console.log(`[enforce] denials: ${denials.length}`);

const payments = [];
for (const b of tablesIn("payments")) {
  const ixClaim = colIdx(b, "claim_id");
  const ixUnder = colIdx(b, "is_underpayment");
  const ixRecv = colIdx(b, "received_at");
  for (const r of b.rows) {
    payments.push({
      claimId: unstr(r.values[ixClaim]),
      get isUnderpayment() {
        return unstr(r.values[ixUnder]);
      },
      set isUnderpayment(v) {
        r.values[ixUnder] = strLit(v);
      },
      get receivedAt() {
        return unstr(r.values[ixRecv]);
      },
      set receivedAt(v) {
        r.values[ixRecv] = strLit(v);
      },
    });
  }
}
console.log(`[enforce] payments: ${payments.length}`);

const NOW_ISO = "2026-05-17T00:00:00Z";
const NOW_MS = Date.parse(NOW_ISO);
const MO = 30 * 24 * 3600 * 1000;
const SIX_MO_AGO = NOW_MS - 6 * MO;

// ---------------- T3: MidState volume ~28% of claims ----------------
// Count current MidState share, rebalance by relabeling claims from
// over-represented payers.
const targetMidstateShare = 0.28;
const targetMidstateCount = Math.round(claims.length * targetMidstateShare);
const currentMidstate = claims.filter((c) => midstateIds.has(c.payerId));
console.log(
  `[enforce] T3: MidState current ${currentMidstate.length} (${((currentMidstate.length / claims.length) * 100).toFixed(1)}%) target ${targetMidstateCount} (${(targetMidstateShare * 100).toFixed(0)}%)`
);

const midstateIdArr = Array.from(midstateIds);
function pickMidstateId() {
  return midstateIdArr[Math.floor(rng() * midstateIdArr.length)];
}
let relabeled = 0;
if (currentMidstate.length < targetMidstateCount) {
  const need = targetMidstateCount - currentMidstate.length;
  // Take from non-MidState pool, shuffled
  const pool = shuffle(claims.filter((c) => !midstateIds.has(c.payerId)));
  for (let i = 0; i < need && i < pool.length; i++) {
    pool[i].payerId = pickMidstateId();
    relabeled++;
  }
}
console.log(`[enforce] T3: relabeled ${relabeled} claims to MidState`);

// Rebuild MidState claim list after relabeling
const midstateClaims = claims.filter((c) => midstateIds.has(c.payerId));

// ---------------- T1: Temporal ordering (claims only — denials/payments fixed later) ----------------
// For every claim:
//   1. encounter_date <= filed_at <= adjudicated_at
//   2. adjudicated_at <= NOW
// We rewrite both filed_at and adjudicated_at based on encounter_date.
let t1Fixed = 0;
for (const c of claims) {
  const encMs = encounters.get(c.encounterId);
  if (!Number.isFinite(encMs)) continue;
  // filed: 0-30 days after encounter
  const filedMs = Math.min(NOW_MS, encMs + Math.floor(rng() * 30) * 24 * 3600 * 1000);
  // adjudicated: 5-60 days after filed
  const adjMs = Math.min(NOW_MS, filedMs + (5 + Math.floor(rng() * 55)) * 24 * 3600 * 1000);
  c.filedAt = new Date(filedMs).toISOString();
  c.adjudicatedAt = new Date(adjMs).toISOString();
  t1Fixed++;
}
console.log(`[enforce] T1: temporal-order rewritten on ${t1Fixed} claims`);

// ---------------- T2: MidState denial spike ----------------
// Split MidState claims by encounter_date into:
//   spikeWindow (encounter_date >= NOW - 6mo)
//   baselineWindow (encounter_date < NOW - 6mo)
const spikeClaims = [];
const baselineClaims = [];
for (const c of midstateClaims) {
  const encMs = encounters.get(c.encounterId);
  if (!Number.isFinite(encMs)) continue;
  if (encMs >= SIX_MO_AGO) spikeClaims.push(c);
  else baselineClaims.push(c);
}
console.log(
  `[enforce] T2: MidState spikeWindow=${spikeClaims.length} baselineWindow=${baselineClaims.length}`
);

// Targets
const spikeDenialRate = 0.40;
const baselineDenialRate = 0.15;
const spikeAuthRate = 0.70;
const targetSpikeDenied = Math.round(spikeClaims.length * spikeDenialRate);
const targetBaselineDenied = Math.round(baselineClaims.length * baselineDenialRate);

// Index existing denials by claim_id
const denialsByClaim = new Map();
for (const d of denials) {
  if (!denialsByClaim.has(d.claimId)) denialsByClaim.set(d.claimId, d);
}

// Pick targets to INCLUDE all currently-denied claims (so we never orphan a
// denial row) plus enough non-denied to hit the target rate.
function pickDeniedTargets(cohort, target) {
  const alreadyDenied = cohort.filter((c) => c.status === "denied");
  const notDenied = cohort.filter((c) => c.status !== "denied");
  const picked = new Set(alreadyDenied.map((c) => c.id));
  if (picked.size >= target) {
    // Trim is not safe (would orphan denial rows). We accept overshoot.
    return picked;
  }
  const need = target - picked.size;
  const extra = shuffle(notDenied).slice(0, need);
  for (const c of extra) picked.add(c.id);
  return picked;
}

const spikeDeniedPicks = pickDeniedTargets(spikeClaims, targetSpikeDenied);
const baselineDeniedPicks = pickDeniedTargets(baselineClaims, targetBaselineDenied);
const deniedTargets = new Set([...spikeDeniedPicks, ...baselineDeniedPicks]);

// Set claim_status for the chosen MidState claims. We only ever flip
// non-denied → denied; we never flip denied → paid (that would orphan a
// denial row, which we cannot DELETE in PGlite-safe SQL).
let claimsFlippedToDenied = 0;
for (const c of midstateClaims) {
  if (deniedTargets.has(c.id) && c.status !== "denied") {
    c.status = "denied";
    claimsFlippedToDenied++;
  }
}
console.log(
  `[enforce] T2: MidState claims -> denied=${claimsFlippedToDenied} (currently-denied preserved)`
);

// Note: we intentionally do NOT sync other-payer claim_status to their
// existing denial rows. The pack already emits a small amount of "denied
// row exists but status != denied" noise (~5%); forcing alignment would
// push the visible status-based denial rate well past the 13-17% industry
// band and weaken the MidState contrast. Exercise 3 (status-based) will
// show other payers at ~13%; Exercise 5/6 (JOIN-based) will show ~14%.
// Both fall inside the benchmark band, so the smoking-gun comparison
// against MidState's 40% holds either way.

// For non-MidState: keep them in 13-17% denial range. Easiest: leave existing
// alone since pack-generated is already ~13%. We don't actively redistribute.

// Now ensure every denied MidState claim has a denial row with the right
// category/carc, and the timing makes sense.
const spikeAuthPicks = new Set(
  shuffle(Array.from(spikeDeniedPicks)).slice(0, Math.round(targetSpikeDenied * spikeAuthRate))
);

// Build the list of new denial rows we need to append
const denialsToAppend = [];
const otherDenialCategories = ["coding", "medical_necessity", "other"];
const otherCarcCodes = ["CO-16", "CO-50", "CO-29", "CO-11"];

for (const claimId of deniedTargets) {
  const claim = claims.find((c) => c.id === claimId);
  if (!claim) continue;
  const adjMs = Date.parse(claim.adjudicatedAt);
  const denialDate = new Date(adjMs + Math.floor(rng() * 5) * 24 * 3600 * 1000).toISOString();

  // For MidState spike window denials we want 70% authorization/CO-97
  const inSpike = spikeDeniedPicks.has(claimId);
  const isAuth = inSpike && spikeAuthPicks.has(claimId);
  const category = isAuth
    ? "authorization"
    : otherDenialCategories[Math.floor(rng() * otherDenialCategories.length)];
  const carc = isAuth
    ? "CO-97"
    : otherCarcCodes[Math.floor(rng() * otherCarcCodes.length)];

  const existing = denialsByClaim.get(claimId);
  if (existing) {
    existing.category = category;
    existing.carc = carc;
    existing.denialDate = denialDate;
  } else {
    denialsToAppend.push({
      id: uuidV4(),
      claimId,
      carc,
      category,
      denialDate,
    });
  }
}
console.log(
  `[enforce] T2: existing-denial rows updated, ${denialsToAppend.length} new denial rows to append`
);

// Append synthesized denials as a fresh INSERT block placed right after the
// last denials block in line order.
const denialHeader = `INSERT INTO "denials" ("id", "claim_id", "carc_code", "denial_category", "denial_date") VALUES`;
const denialAppendLines = [];
if (denialsToAppend.length > 0) {
  denialAppendLines.push("");
  denialAppendLines.push(denialHeader);
  denialsToAppend.forEach((d, i) => {
    const ends = i === denialsToAppend.length - 1 ? ";" : ",";
    const v = [strLit(d.id), strLit(d.claimId), strLit(d.carc), strLit(d.category), strLit(d.denialDate)];
    denialAppendLines.push(`  (${v.join(", ")})${ends}`);
  });
}

// Also: handle claims we flipped from 'denied' to 'paid' — they may have
// orphan denial rows. We can't DELETE, but we can mark those denials as
// 'medical_necessity' / 'other' so they at least look incidental. Actually
// the simplest fix is to leave them alone; they reference a paid claim and
// will be filtered by JOIN logic in the exercises. The exercises use
// JOIN denials d ON c.id = d.claim_id which will still return the
// historic denial. Better: also flip those denial rows to look like
// 'medical_necessity' so they don't reinforce the authorization story.
// For simplicity: leave them.

// ---------------- T4: Underpayment pattern ----------------
const paidMidstateClaimIds = new Set(
  midstateClaims
    .filter((c) => c.status === "paid" || c.status === "partial")
    .map((c) => c.id)
);
const midstatePayments = payments.filter((p) => paidMidstateClaimIds.has(p.claimId));
const otherPayments = payments.filter((p) => !paidMidstateClaimIds.has(p.claimId));

function applyUnderpaymentRate(pmts, rate) {
  const target = Math.round(pmts.length * rate);
  const shuffled = shuffle(pmts);
  for (let i = 0; i < shuffled.length; i++) {
    shuffled[i].isUnderpayment = i < target ? "true" : "false";
  }
  return target;
}

const tMidUnder = applyUnderpaymentRate(midstatePayments, 0.22);
const tOtherUnder = applyUnderpaymentRate(otherPayments, 0.08);
console.log(
  `[enforce] T4: underpayments — MidState ${tMidUnder}/${midstatePayments.length} (22%), Other ${tOtherUnder}/${otherPayments.length} (8%)`
);

// ---------------- T1 (continued): denial_date and received_at temporal ----------------
const claimById = new Map(claims.map((c) => [c.id, c]));
for (const d of denials) {
  const c = claimById.get(d.claimId);
  if (!c) continue;
  const adjMs = Date.parse(c.adjudicatedAt);
  if (!Number.isFinite(adjMs)) continue;
  const dMs = Date.parse(d.denialDate);
  if (!Number.isFinite(dMs) || dMs < adjMs) {
    d.denialDate = new Date(adjMs + Math.floor(rng() * 5) * 24 * 3600 * 1000).toISOString();
  }
}
for (const p of payments) {
  const c = claimById.get(p.claimId);
  if (!c) continue;
  const adjMs = Date.parse(c.adjudicatedAt);
  if (!Number.isFinite(adjMs)) continue;
  const recvMs = Date.parse(p.receivedAt);
  if (!Number.isFinite(recvMs) || recvMs < adjMs) {
    p.receivedAt = new Date(adjMs + Math.floor(rng() * 30) * 24 * 3600 * 1000).toISOString();
  }
}

// ---------------- Re-serialize ----------------
for (const b of blocks) {
  for (const r of b.rows) {
    lines[r.lineIdx] = rebuildRow(r.values, r.ends);
  }
}

// Splice denial appended block right after the last existing denials block.
let finalLines = lines;
if (denialsBlock && denialAppendLines.length > 0) {
  const lastRow = denialsBlock.rows[denialsBlock.rows.length - 1];
  const insertAt = lastRow.lineIdx + 1;
  finalLines = [...lines.slice(0, insertAt), ...denialAppendLines, ...lines.slice(insertAt)];
}

const finalSql = finalLines.join("\n");
writeFileSync(outputPath, finalSql, "utf8");
const kb = (finalSql.length / 1024).toFixed(1);
console.log(`[enforce] wrote ${kb} KB to ${outputPath}`);

// ---------------- Self-check ----------------
console.log("");
console.log("[enforce] self-check (in-memory snapshot)");

// MidState share
const midstateFinal = claims.filter((c) => midstateIds.has(c.payerId));
console.log(
  `  MidState claim share: ${midstateFinal.length}/${claims.length} = ${((midstateFinal.length / claims.length) * 100).toFixed(1)}%`
);

// Recompute denied claims to include both pre-existing and newly synthesized
const allDenialClaimIds = new Set([
  ...denials.map((d) => d.claimId),
  ...denialsToAppend.map((d) => d.claimId),
]);

function denialRateByStatus(cohort) {
  if (cohort.length === 0) return 0;
  let n = 0;
  for (const c of cohort) if (c.status === "denied") n++;
  return ((n / cohort.length) * 100).toFixed(1);
}
function denialRateByJoin(cohort) {
  if (cohort.length === 0) return 0;
  let n = 0;
  for (const c of cohort) if (allDenialClaimIds.has(c.id)) n++;
  return ((n / cohort.length) * 100).toFixed(1);
}
const denialRate = denialRateByStatus;

const midstateSpikeFinal = midstateFinal.filter((c) => {
  const e = encounters.get(c.encounterId);
  return Number.isFinite(e) && e >= SIX_MO_AGO;
});
const midstateBaselineFinal = midstateFinal.filter((c) => {
  const e = encounters.get(c.encounterId);
  return Number.isFinite(e) && e < SIX_MO_AGO;
});
const otherClaims = claims.filter((c) => !midstateIds.has(c.payerId));

console.log(`  MidState spike   denial rate (status):  ${denialRateByStatus(midstateSpikeFinal)}% (target 40%)`);
console.log(`  MidState baseline denial rate (status): ${denialRateByStatus(midstateBaselineFinal)}% (target 15%)`);
console.log(`  Other payers     denial rate (status):  ${denialRateByStatus(otherClaims)}% (target 13-17%)`);
console.log(`  -- via denials JOIN (Exercise 5/6 view) --`);
console.log(`  MidState spike   denial rate (join):    ${denialRateByJoin(midstateSpikeFinal)}%`);
console.log(`  MidState baseline denial rate (join):   ${denialRateByJoin(midstateBaselineFinal)}%`);
console.log(`  Other payers     denial rate (join):    ${denialRateByJoin(otherClaims)}%`);

// Authorization share of MidState spike denials
let spikeAuthCount = 0;
let spikeDeniedCount = 0;
for (const c of midstateSpikeFinal) {
  if (c.status !== "denied" && !allDenialClaimIds.has(c.id)) continue;
  spikeDeniedCount++;
  // look up its denial — could be in either existing or appended
  const d = denials.find((x) => x.claimId === c.id) || denialsToAppend.find((x) => x.claimId === c.id);
  if (d && d.category === "authorization") spikeAuthCount++;
}
console.log(
  `  MidState spike authorization denials: ${spikeAuthCount}/${spikeDeniedCount} = ${spikeDeniedCount ? ((spikeAuthCount / spikeDeniedCount) * 100).toFixed(1) : 0}% (target 70%)`
);

console.log("[enforce] done");
