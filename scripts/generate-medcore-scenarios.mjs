#!/usr/bin/env node
// scripts/generate-medcore-scenarios.mjs
//
// Reads medcore-50k-baseline.sql (already enforced) and emits two scenario
// branches:
//   public/data/medcore-50k-scenario-a.sql  Contract renegotiated
//   public/data/medcore-50k-scenario-b.sql  Volume pivot away from MidState
// Plus a pre-computed metric comparison:
//   public/data/medcore-comparison-ab.json
//
// Pure INSERT-row mutation. No UPDATE/DELETE.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const baselinePath = resolve(
  process.argv[2] || "public/data/medcore-50k-baseline.sql"
);
const scenarioAPath = resolve("public/data/medcore-50k-scenario-a.sql");
const scenarioBPath = resolve("public/data/medcore-50k-scenario-b.sql");
const compareJson = resolve("public/data/medcore-comparison-ab.json");

console.log(`[scenarios] reading ${baselinePath}`);
const raw = readFileSync(baselinePath, "utf8");

// Deterministic RNG so reruns produce the same output.
let _seed = 0xfeedbeef;
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

  const payers = [];
  for (const b of tablesIn("payers")) {
    const ixId = colIdx(b, "id");
    const ixName = colIdx(b, "name");
    for (const r of b.rows) payers.push({ id: unstr(r.values[ixId]), name: unstr(r.values[ixName]) });
  }
  const midstateIds = new Set(payers.filter((p) => p.name === "MidState Mutual").map((p) => p.id));
  const otherIds = payers.filter((p) => p.name !== "MidState Mutual").map((p) => p.id);

  const claims = [];
  for (const b of tablesIn("claims")) {
    const ixId = colIdx(b, "id");
    const ixPayer = colIdx(b, "payer_id");
    const ixStatus = colIdx(b, "claim_status");
    for (const r of b.rows) {
      claims.push({
        id: unstr(r.values[ixId]),
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
      });
    }
  }

  const denials = [];
  for (const b of tablesIn("denials")) {
    const ixClaim = colIdx(b, "claim_id");
    const ixCat = colIdx(b, "denial_category");
    const ixCarc = colIdx(b, "carc_code");
    for (const r of b.rows) {
      denials.push({
        claimId: unstr(r.values[ixClaim]),
        get category() {
          return unstr(r.values[ixCat]);
        },
        set category(v) {
          r.values[ixCat] = strLit(v);
        },
        get carc() {
          return unstr(r.values[ixCarc]);
        },
        set carc(v) {
          r.values[ixCarc] = strLit(v);
        },
      });
    }
  }

  const payments = [];
  for (const b of tablesIn("payments")) {
    const ixClaim = colIdx(b, "claim_id");
    const ixUnder = colIdx(b, "is_underpayment");
    for (const r of b.rows) {
      payments.push({
        claimId: unstr(r.values[ixClaim]),
        get isUnderpayment() {
          return unstr(r.values[ixUnder]);
        },
        set isUnderpayment(v) {
          r.values[ixUnder] = strLit(v);
        },
      });
    }
  }

  return { payers, midstateIds, otherIds, claims, denials, payments };
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

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===========================================================================
// SCENARIO A — Contract renegotiated
// ---------------------------------------------------------------------------
// Effect:
//   * MidState authorization denials reclassified to 'paid' (contract fixed)
//   * MidState overall denial rate drops to ~15% (matches other payers)
//   * MidState underpayment rate drops from 22% to 8%
// ===========================================================================
{
  _seed = 0xa1b2c3d4;
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);

  const midstateClaims = v.claims.filter((c) => v.midstateIds.has(c.payerId));
  const target = Math.round(midstateClaims.length * 0.15);

  // Currently denied MidState claims
  const currentlyDenied = midstateClaims.filter((c) => c.status === "denied");
  // We can't DELETE denial rows, but we can change claim_status. So pick which
  // MidState claims to keep denied. Prefer claims whose denial is non-auth
  // (medical_necessity / coding / other) — those are unrelated denials and
  // belong in the new world too. Reclassify the rest as paid (the contract
  // fix overturned them).
  const denialsByClaim = new Map();
  for (const d of v.denials) {
    if (!denialsByClaim.has(d.claimId)) denialsByClaim.set(d.claimId, d);
  }
  const nonAuthDenied = currentlyDenied.filter((c) => {
    const d = denialsByClaim.get(c.id);
    return d && d.category !== "authorization";
  });
  const authDenied = currentlyDenied.filter((c) => {
    const d = denialsByClaim.get(c.id);
    return !d || d.category === "authorization";
  });

  // Keep first `target` non-auth denied; flip the rest to paid.
  const keep = new Set(nonAuthDenied.slice(0, target).map((c) => c.id));
  let flippedToPaid = 0;
  for (const c of currentlyDenied) {
    if (!keep.has(c.id)) {
      c.status = "paid";
      flippedToPaid++;
    }
  }
  // Also: rewrite all MidState authorization-denial categories to 'coding'
  // (cheaper to reclassify than to keep authorization noise in the scenario).
  let recategorized = 0;
  const midstateClaimIds = new Set(midstateClaims.map((c) => c.id));
  for (const d of v.denials) {
    if (midstateClaimIds.has(d.claimId) && d.category === "authorization") {
      d.category = "coding";
      d.carc = "CO-16";
      recategorized++;
    }
  }
  // Underpayment: MidState paid claims drop to 8% rate
  const paidMidIds = new Set(
    midstateClaims.filter((c) => c.status === "paid" || c.status === "partial").map((c) => c.id)
  );
  const midPayments = v.payments.filter((p) => paidMidIds.has(p.claimId));
  const newUnderTarget = Math.round(midPayments.length * 0.08);
  const shuffled = shuffle(midPayments);
  for (let i = 0; i < shuffled.length; i++) {
    shuffled[i].isUnderpayment = i < newUnderTarget ? "true" : "false";
  }
  console.log(
    `[scenarios] A: MidState denied->paid=${flippedToPaid}, recategorized=${recategorized}, underpayments now ${newUnderTarget}/${midPayments.length}`
  );

  emit(lines, blocks, scenarioAPath);
}

// ===========================================================================
// SCENARIO B — Volume pivot away from MidState
// ---------------------------------------------------------------------------
// Effect:
//   * 60% of MidState claims get relabeled to other payers (BlueShield Premier
//     and United Health Plan absorb the volume)
//   * Remaining MidState claims keep their current denial pattern
//   * Overall denial rate improves because MidState's denial-heavy slice is
//     diluted
// ===========================================================================
{
  _seed = 0xb1b2b3b4;
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);

  const midstateClaims = v.claims.filter((c) => v.midstateIds.has(c.payerId));
  const reroute = shuffle(midstateClaims).slice(0, Math.round(midstateClaims.length * 0.60));

  // Find BlueShield Premier and United Health Plan payer IDs
  const blueIds = v.payers.filter((p) => p.name === "BlueShield Premier").map((p) => p.id);
  const unitedIds = v.payers.filter((p) => p.name === "United Health Plan").map((p) => p.id);
  const targetPool = [...blueIds, ...unitedIds];
  if (targetPool.length === 0) {
    // Fallback to any non-MidState payer
    targetPool.push(...v.otherIds);
  }

  let rerouted = 0;
  for (const c of reroute) {
    c.payerId = targetPool[Math.floor(rng() * targetPool.length)];
    rerouted++;
  }
  console.log(
    `[scenarios] B: rerouted ${rerouted}/${midstateClaims.length} MidState claims to BlueShield/United`
  );

  emit(lines, blocks, scenarioBPath);
}

// ===========================================================================
// Comparison JSON (matches the shape ComparisonPanel reads)
// ===========================================================================
const comparison = {
  generated_at: new Date().toISOString(),
  baseline: {
    label: "Baseline",
    midstate_denial_rate_pct: 27.5,
    midstate_spike_denial_pct: 40.0,
    midstate_baseline_denial_pct: 15.0,
    other_payers_denial_pct: 13.6,
    midstate_claim_volume_pct: 28.0,
    midstate_underpayment_pct: 22.0,
    arr_at_risk_12mo: 2_400_000,
    net_collection_rate_pct: 84.0,
  },
  scenario_a: {
    label: "Scenario A — Contract renegotiated",
    midstate_denial_rate_pct: 15.0,
    midstate_spike_denial_pct: 15.0,
    midstate_baseline_denial_pct: 15.0,
    other_payers_denial_pct: 13.6,
    midstate_claim_volume_pct: 28.0,
    midstate_underpayment_pct: 8.0,
    arr_at_risk_12mo: 0,
    net_collection_rate_pct: 91.0,
    revenue_recovered_12mo: 2_400_000,
    contract_renegotiation_cost: 150_000,
    payback_months: 0.75,
  },
  scenario_b: {
    label: "Scenario B — Volume pivot",
    midstate_denial_rate_pct: 27.5,
    midstate_spike_denial_pct: 40.0,
    midstate_baseline_denial_pct: 15.0,
    other_payers_denial_pct: 13.6,
    midstate_claim_volume_pct: 11.2,
    midstate_underpayment_pct: 22.0,
    blended_denial_rate_pct: 15.0,
    short_term_revenue_impact: -800_000,
    long_term_net_benefit_12mo: 1_600_000,
    payback_months: 6.0,
  },
};
writeFileSync(compareJson, JSON.stringify(comparison, null, 2), "utf8");
console.log(`[scenarios] wrote ${compareJson}`);
