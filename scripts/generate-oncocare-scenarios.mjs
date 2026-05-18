#!/usr/bin/env node
// scripts/generate-oncocare-scenarios.mjs
//
// Reads oncocare-30k-baseline.sql (already enforced) and emits two scenario
// branches plus a pre-computed comparison JSON.
//
//   public/data/oncocare-30k-scenario-a.sql  Exclude SITE-07 from primary analysis
//   public/data/oncocare-30k-scenario-b.sql  Remediate SITE-07 — enhanced monitoring
//   public/data/oncocare-comparison-ab.json

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const baselinePath = resolve(
  process.argv[2] || "public/data/oncocare-30k-baseline.sql"
);
const scenarioAPath = resolve("public/data/oncocare-30k-scenario-a.sql");
const scenarioBPath = resolve("public/data/oncocare-30k-scenario-b.sql");
const compareJson = resolve("public/data/oncocare-comparison-ab.json");

console.log(`[scenarios] reading ${baselinePath}`);
const raw = readFileSync(baselinePath, "utf8");

let _seed = 0xfeed0c0c;
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

  const sites = [];
  for (const b of tablesIn("sites")) {
    const ixId = colIdx(b, "id");
    const ixCode = colIdx(b, "site_code");
    for (const r of b.rows) {
      sites.push({ id: unstr(r.values[ixId]), code: unstr(r.values[ixCode]) });
    }
  }
  const site7Ids = new Set(sites.filter((s) => s.code === "SITE-07").map((s) => s.id));

  const patients = [];
  for (const b of tablesIn("patients")) {
    const ixId = colIdx(b, "id");
    const ixSite = colIdx(b, "site_id");
    const ixStatus = colIdx(b, "status");
    for (const r of b.rows) {
      patients.push({
        id: unstr(r.values[ixId]),
        get siteId() { return unstr(r.values[ixSite]); },
        get status() { return unstr(r.values[ixStatus]); },
        set status(v) { r.values[ixStatus] = strLit(v); },
      });
    }
  }

  const responseAssessments = [];
  for (const b of tablesIn("response_assessments")) {
    const ixSite = colIdx(b, "site_id");
    const ixCat = colIdx(b, "response_category");
    for (const r of b.rows) {
      responseAssessments.push({
        get siteId() { return unstr(r.values[ixSite]); },
        get category() { return unstr(r.values[ixCat]); },
        set category(v) { r.values[ixCat] = strLit(v); },
      });
    }
  }

  const visits = [];
  for (const b of tablesIn("visits")) {
    const ixSite = colIdx(b, "site_id");
    const ixDoseMg = colIdx(b, "dose_administered_mg");
    const ixDosePct = colIdx(b, "dose_pct_of_protocol");
    const ixDeviation = colIdx(b, "protocol_deviation_flag");
    const ixScheduled = colIdx(b, "scheduled_date");
    for (const r of b.rows) {
      visits.push({
        get siteId() { return unstr(r.values[ixSite]); },
        get scheduledMs() { return Date.parse(unstr(r.values[ixScheduled])); },
        set doseMg(v) { r.values[ixDoseMg] = String(v); },
        set dosePct(v) { r.values[ixDosePct] = v.toFixed(2); },
        set deviationFlag(v) { r.values[ixDeviation] = strLit(v); },
      });
    }
  }

  const interimAnalyses = [];
  for (const b of tablesIn("interim_analyses")) {
    const ixDate = colIdx(b, "analysis_date");
    const ixOrr = colIdx(b, "overall_response_rate");
    const ixLow = colIdx(b, "response_rate_ci_low");
    const ixHigh = colIdx(b, "response_rate_ci_high");
    const ixRec = colIdx(b, "recommendation");
    const ixDsmb = colIdx(b, "dsmb_decision");
    for (const r of b.rows) {
      interimAnalyses.push({
        get analysisMs() { return Date.parse(unstr(r.values[ixDate])); },
        set orr(v) { r.values[ixOrr] = v.toFixed(2); },
        set ciLow(v) { r.values[ixLow] = v.toFixed(2); },
        set ciHigh(v) { r.values[ixHigh] = v.toFixed(2); },
        set recommendation(v) { r.values[ixRec] = strLit(v); },
        set dsmbDecision(v) { r.values[ixDsmb] = strLit(v); },
      });
    }
  }

  const siteMonitoringVisits = [];
  let smvBlock = null;
  for (const b of tablesIn("site_monitoring_visits")) {
    smvBlock = b;
    const ixSite = colIdx(b, "site_id");
    const ixType = colIdx(b, "visit_type");
    const ixFindings = colIdx(b, "findings_count");
    const ixCritical = colIdx(b, "critical_findings");
    for (const r of b.rows) {
      siteMonitoringVisits.push({
        get siteId() { return unstr(r.values[ixSite]); },
        set visitType(v) { r.values[ixType] = strLit(v); },
        set findings(v) { r.values[ixFindings] = String(v); },
        set critical(v) { r.values[ixCritical] = String(v); },
      });
    }
  }

  const protocolDeviations = [];
  for (const b of tablesIn("protocol_deviations")) {
    const ixSite = colIdx(b, "site_id");
    const ixAction = colIdx(b, "corrective_action");
    for (const r of b.rows) {
      protocolDeviations.push({
        get siteId() { return unstr(r.values[ixSite]); },
        set correctiveAction(v) { r.values[ixAction] = strLit(v); },
      });
    }
  }

  return { sites, site7Ids, patients, responseAssessments, visits, interimAnalyses, siteMonitoringVisits, protocolDeviations, smvBlock };
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
// SCENARIO A — Exclude SITE-07 from primary analysis
// ===========================================================================
{
  _seed = 0xa1a2a3a4;
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);

  let patientsExcluded = 0;
  for (const p of v.patients) {
    if (!v.site7Ids.has(p.siteId)) continue;
    p.status = "completed"; // keep enum valid; the spec's "excluded_per_protocol" isn't in the enum
    patientsExcluded++;
  }
  let raMarked = 0;
  for (const r of v.responseAssessments) {
    if (!v.site7Ids.has(r.siteId)) continue;
    r.category = "not_evaluable";
    raMarked++;
  }
  let latest = null, latestMs = -Infinity;
  for (const ia of v.interimAnalyses) {
    if (ia.analysisMs > latestMs) { latestMs = ia.analysisMs; latest = ia; }
  }
  if (latest) {
    latest.orr = 0.54;
    latest.ciLow = 0.50;
    latest.ciHigh = 0.58;
    latest.recommendation = "continue";
    latest.dsmbDecision = "continue";
  }
  console.log(
    `[scenarios] A: ${patientsExcluded} SITE-07 patients marked completed (excluded per-protocol), ${raMarked} response_assessments set not_evaluable, latest interim ORR=0.54`
  );
  emit(lines, blocks, scenarioAPath);
}

// ===========================================================================
// SCENARIO B — Remediate SITE-07: enhanced monitoring + dose correction
// ===========================================================================
{
  _seed = 0xb1b2b3b4;
  const { lines, blocks } = parseBlocks(raw);
  const v = buildView(blocks);

  // Future visits (scheduled_date >= today) at SITE-07 get dose corrected
  const NOW_MS = Date.parse("2026-05-18T00:00:00Z");
  let visitsCorrected = 0;
  for (const vi of v.visits) {
    if (!v.site7Ids.has(vi.siteId)) continue;
    if (!Number.isFinite(vi.scheduledMs) || vi.scheduledMs < NOW_MS) continue;
    vi.doseMg = 400;
    vi.dosePct = 1.0;
    vi.deviationFlag = "false";
    visitsCorrected++;
  }
  if (visitsCorrected === 0) {
    // If no future visits exist, correct the most recent ones (last 30 days)
    const RECENT = NOW_MS - 30 * 24 * 3600 * 1000;
    for (const vi of v.visits) {
      if (!v.site7Ids.has(vi.siteId)) continue;
      if (!Number.isFinite(vi.scheduledMs) || vi.scheduledMs < RECENT) continue;
      vi.doseMg = 400;
      vi.dosePct = 1.0;
      vi.deviationFlag = "false";
      visitsCorrected++;
    }
  }

  // Add 3 new for_cause monitoring visit findings by relabelling 3 existing SITE-07 monitoring rows
  const site7Mon = v.siteMonitoringVisits.filter((m) => v.site7Ids.has(m.siteId));
  let monAdded = 0;
  for (let i = 0; i < Math.min(3, site7Mon.length); i++) {
    site7Mon[i].visitType = "for_cause";
    site7Mon[i].findings = 15;
    site7Mon[i].critical = 4;
    monAdded++;
  }

  // Protocol deviations corrective_action = retrain_staff for SITE-07 deviations
  let devsRetrain = 0;
  for (const d of v.protocolDeviations) {
    if (!v.site7Ids.has(d.siteId)) continue;
    d.correctiveAction = "retrain_staff";
    devsRetrain++;
  }

  // Interim analysis unchanged at 0.50 (historical data not changed)
  let latest = null, latestMs = -Infinity;
  for (const ia of v.interimAnalyses) {
    if (ia.analysisMs > latestMs) { latestMs = ia.analysisMs; latest = ia; }
  }
  if (latest) {
    latest.orr = 0.50;
    latest.ciLow = 0.46;
    latest.ciHigh = 0.54;
    latest.recommendation = "modify_protocol";
    latest.dsmbDecision = "request_additional_data";
  }

  console.log(
    `[scenarios] B: ${visitsCorrected} SITE-07 future visits dose-corrected to 100%, ${monAdded} for_cause monitoring visits added, ${devsRetrain} deviations marked retrain_staff`
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
    site7_deviation_rate: 0.34,
    site7_dose_pct_protocol: 0.85,
    site7_response_rate: 0.31,
    other_sites_response_rate: 0.54,
    overall_response_rate: 0.498,
    fda_threshold: 0.50,
    gap_to_threshold: -0.002,
    site7_patient_pct: 0.18,
    site7_ae_grade3plus_rate: 0.15,
    other_sites_ae_grade3plus_rate: 0.30,
  },
  scenario_a: {
    label: "Scenario A — Exclude SITE-07 (per-protocol)",
    overall_response_rate: 0.541,
    above_fda_threshold: true,
    fda_gap: 0.041,
    site7_excluded: true,
    risk: "FDA may question post-hoc exclusion of 18% of patients",
    benefit: "NDA submission proceeds on current timeline",
    dsmb_decision: "continue",
  },
  scenario_b: {
    label: "Scenario B — Remediate SITE-07 (enhanced monitoring)",
    overall_response_rate: 0.498,
    above_fda_threshold: false,
    site7_future_dose_corrected: true,
    new_monitoring_visits: 3,
    timeline_impact_months: 6,
    value: "demonstrates sponsor commitment to protocol integrity",
    dsmb_decision: "request_additional_data",
  },
};
writeFileSync(compareJson, JSON.stringify(comparison, null, 2), "utf8");
console.log(`[scenarios] wrote ${compareJson}`);
