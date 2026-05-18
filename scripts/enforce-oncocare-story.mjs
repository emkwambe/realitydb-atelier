#!/usr/bin/env node
// scripts/enforce-oncocare-story.mjs
//
// RealityDB Atelier — OncoCare Story Enforcer
//
// Patches the freshly-generated oncocare-30k-v1.0.sql INSERT rows IN PLACE
// to enforce the SITE-07 underdosing story, then emits a pure CREATE +
// INSERT baseline that PGlite loads cleanly (no UPDATE/DELETE).
//
// Modeled on enforce-clearbank-story.mjs and enforce-towernet-story.mjs.
//
// Enforced invariants:
//   T0: SITE-07 site rows identified (engine generates ~8 rows per site_code
//       due to cascade math; we treat them as the same logical site).
//   T1: SITE-07 site profile fixed — deviation_rate_pct=0.34,
//       performance_tier=probation, site_name/country/region/city aligned
//       to "Instituto do Cancer Sao Paulo / Brazil / Latin America / Sao Paulo".
//   T2: SITE-07 protocol_deviations relabelled — 65% dose_modification,
//       45% major, 35% significant impact.
//       SITE-07 visits: dose_administered_mg=340, dose_pct_of_protocol=0.85,
//       34% protocol_deviation_flag='true'.
//   T3: Response rate differential (the smoking gun)
//       SITE-07 share of week_16 response_assessments = ~18%
//       SITE-07: CR 5%, PR 26%, SD 35%, PD 30%, NE 4% (responders=31%)
//       Others:  CR 14%, PR 40%, SD 28%, PD 12%, NE 6% (responders=54%)
//   T4: Adverse event severity — milder at SITE-07
//       SITE-07: grade 1/2/3/4/5 = 55/30/12/2/1, serious=8%
//       Others:  grade 1/2/3/4/5 = 40/30/18/9/3, serious=18%
//   T5: Site monitoring visits — SITE-07: 40% for_cause,
//       findings 8-20, critical_findings 2-5.
//   T6: Most recent interim_analyses row: ORR=0.498, CI 0.461-0.535,
//       dsmb_decision=request_additional_data, recommendation=modify_protocol.
//   T7: Temporal ordering — patients.consent_date <= enrollment_date;
//       visits.actual_date near scheduled_date;
//       adverse_events.resolution_date > onset_date;
//       protocol_deviations.reported_date > detected_date;
//       dropout_events.last_visit_date < dropout_date.
//   T8: NOT NULL stripped from nullable columns.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { argv } from "node:process";

const inputPath = resolve(
  argv[2] ||
    "C:/Users/HP/Documents/realityDB Packs/oncocare-30k-v1.0.sql"
);
const outputPath = resolve(
  argv[3] || "public/data/oncocare-30k-baseline.sql"
);

console.log(`[enforce] in  ${inputPath}`);
console.log(`[enforce] out ${outputPath}`);

let _seed = 0x07c0ca7e;
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
function pickWeighted(items, weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ---------------- T8: Strip NOT NULL ----------------
let sql = readFileSync(inputPath, "utf8");
const notNullStrips = [
  ['"actual_date" TIMESTAMPTZ NOT NULL,',        '"actual_date" TIMESTAMPTZ,'],
  ['"dose_administered_mg" NUMERIC(12,2) NOT NULL,', '"dose_administered_mg" NUMERIC(12,2),'],
  ['"dose_pct_of_protocol" NUMERIC(12,2) NOT NULL,', '"dose_pct_of_protocol" NUMERIC(12,2),'],
  ['"resolution_date" TIMESTAMPTZ NOT NULL,',    '"resolution_date" TIMESTAMPTZ,'],
  ['"abnormality_grade" VARCHAR(50) NOT NULL,',  '"abnormality_grade" VARCHAR(50),'],
  ['"tumor_measurement_mm" NUMERIC(12,2) NOT NULL,', '"tumor_measurement_mm" NUMERIC(12,2),'],
];
let t8 = 0;
for (const [from, to] of notNullStrips) {
  const before = sql.length;
  sql = sql.split(from).join(to);
  if (sql.length !== before) t8++;
}
console.log(`[enforce] T8: stripped NOT NULL from ${t8} columns`);

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

const NOW_MS = Date.parse("2026-05-18T00:00:00Z");
const DAY = 24 * 3600 * 1000;

// ---------------- T0: SITE-07 identification ----------------
const sites = [];
for (const b of tablesIn("sites")) {
  const ixId = colIdx(b, "id");
  const ixCode = colIdx(b, "site_code");
  const ixName = colIdx(b, "site_name");
  const ixCountry = colIdx(b, "country");
  const ixRegion = colIdx(b, "region");
  const ixCity = colIdx(b, "city");
  const ixDev = colIdx(b, "deviation_rate_pct");
  const ixTier = colIdx(b, "performance_tier");
  const ixEnrolled = colIdx(b, "enrollment_actual");
  for (const r of b.rows) {
    sites.push({
      id: unstr(r.values[ixId]),
      get code() { return unstr(r.values[ixCode]); },
      set name(v) { r.values[ixName] = strLit(v); },
      set country(v) { r.values[ixCountry] = strLit(v); },
      set region(v) { r.values[ixRegion] = strLit(v); },
      set city(v) { r.values[ixCity] = strLit(v); },
      set deviationRate(v) { r.values[ixDev] = v.toFixed(2); },
      set tier(v) { r.values[ixTier] = strLit(v); },
      set enrollment(v) { r.values[ixEnrolled] = String(v); },
    });
  }
}
const site7Ids = new Set(sites.filter((s) => s.code === "SITE-07").map((s) => s.id));
console.log(`[enforce] T0: SITE-07 site rows: ${site7Ids.size} / ${sites.length} total sites`);
if (site7Ids.size === 0) {
  console.error("[enforce] FATAL: no SITE-07 rows in baseline");
  process.exit(1);
}

// ---------------- T1: SITE-07 profile fix ----------------
let t1 = 0;
const site7Distribution = Math.floor(355 / site7Ids.size); // 18% of 1970 patients ≈ 355
for (const s of sites) {
  if (!site7Ids.has(s.id)) continue;
  s.name = "Instituto do Cancer Sao Paulo";
  s.country = "Brazil";
  s.region = "Latin America";
  s.city = "Sao Paulo";
  s.deviationRate = 0.34;
  s.tier = "probation";
  s.enrollment = site7Distribution;
  t1++;
}
console.log(`[enforce] T1: SITE-07 site rows fixed: ${t1} (enrollment_actual=${site7Distribution} each)`);

// ---------------- Domain views ----------------
function buildView(tableName, columnMap) {
  const out = [];
  for (const b of tablesIn(tableName)) {
    const idx = {};
    for (const k of Object.keys(columnMap)) idx[k] = colIdx(b, columnMap[k]);
    for (const r of b.rows) {
      const view = { _row: r };
      for (const k of Object.keys(columnMap)) {
        const i = idx[k];
        Object.defineProperty(view, k, {
          get() { return unstr(r.values[i]); },
          set(v) { r.values[i] = v === null ? "NULL" : (typeof v === "number" ? String(v) : strLit(v)); },
        });
      }
      out.push(view);
    }
  }
  return out;
}

const patients = buildView("patients", {
  id: "id", siteId: "site_id", status: "status",
  enrollmentDate: "enrollment_date", consentDate: "consent_date",
});
console.log(`[enforce] patients: ${patients.length}`);

const visits = buildView("visits", {
  patientId: "patient_id", siteId: "site_id",
  scheduledDate: "scheduled_date", actualDate: "actual_date",
  doseMg: "dose_administered_mg", dosePct: "dose_pct_of_protocol",
  deviationFlag: "protocol_deviation_flag",
});
console.log(`[enforce] visits: ${visits.length}`);

const adverseEvents = buildView("adverse_events", {
  siteId: "site_id", patientId: "patient_id",
  severityGrade: "severity_grade", isSerious: "is_serious",
  onsetDate: "onset_date", resolutionDate: "resolution_date",
});
console.log(`[enforce] adverse_events: ${adverseEvents.length}`);

const protocolDeviations = buildView("protocol_deviations", {
  siteId: "site_id", patientId: "patient_id",
  type: "deviation_type", category: "deviation_category",
  impact: "impact_on_data", correctiveAction: "corrective_action",
  detectedDate: "detected_date", reportedDate: "reported_date",
});
console.log(`[enforce] protocol_deviations: ${protocolDeviations.length}`);

const dropoutEvents = buildView("dropout_events", {
  siteId: "site_id", patientId: "patient_id",
  reason: "dropout_reason", dropoutDate: "dropout_date",
  lastVisitDate: "last_visit_date",
});
console.log(`[enforce] dropout_events: ${dropoutEvents.length}`);

const responseAssessments = buildView("response_assessments", {
  siteId: "site_id", patientId: "patient_id",
  timepoint: "assessment_timepoint", category: "response_category",
  assessmentDate: "assessment_date",
});
console.log(`[enforce] response_assessments: ${responseAssessments.length}`);

const siteMonitoringVisits = buildView("site_monitoring_visits", {
  siteId: "site_id", visitType: "visit_type",
  findingsCount: "findings_count", criticalFindings: "critical_findings",
});
console.log(`[enforce] site_monitoring_visits: ${siteMonitoringVisits.length}`);

const interimAnalyses = buildView("interim_analyses", {
  analysisDate: "analysis_date",
  orr: "overall_response_rate",
  ciLow: "response_rate_ci_low",
  ciHigh: "response_rate_ci_high",
  recommendation: "recommendation",
  dsmbDecision: "dsmb_decision",
});
console.log(`[enforce] interim_analyses: ${interimAnalyses.length}`);

// ---------------- Patient relabel to reach ~18% SITE-07 share ----------------
// The pack's 18% target needs SITE-07 to own ~18% of patients (and via cascade
// their visits, AEs, response_assessments, etc). With ~8 SITE-07 site rows out
// of ~98, natural share is ~8%. We relabel patient.site_id and the downstream
// child rows' site_id to hit 18%.
const TARGET_SITE7_PATIENT_SHARE = 0.18;
const targetSite7Patients = Math.round(patients.length * TARGET_SITE7_PATIENT_SHARE);
const site7IdArr = Array.from(site7Ids);
const currentSite7Patients = patients.filter((p) => site7Ids.has(p.siteId));
console.log(
  `[enforce] patient share: current ${currentSite7Patients.length}/${patients.length} (${((currentSite7Patients.length / patients.length) * 100).toFixed(1)}%) target ${targetSite7Patients} (${(TARGET_SITE7_PATIENT_SHARE * 100).toFixed(0)}%)`
);

let patientsRelabeled = 0;
const relabeledPatientIds = new Set();
if (currentSite7Patients.length < targetSite7Patients) {
  const need = targetSite7Patients - currentSite7Patients.length;
  const donors = shuffle(patients.filter((p) => !site7Ids.has(p.siteId))).slice(0, need);
  for (const p of donors) {
    p.siteId = site7IdArr[Math.floor(rng() * site7IdArr.length)];
    relabeledPatientIds.add(p.id);
    patientsRelabeled++;
  }
}
console.log(`[enforce] relabelled ${patientsRelabeled} patients to SITE-07`);

// Sync child-row site_ids when their patient was relabelled.
function syncChildSiteIds(rows, label) {
  const patientToSite = new Map(patients.map((p) => [p.id, p.siteId]));
  let synced = 0;
  for (const r of rows) {
    const ps = patientToSite.get(r.patientId);
    if (ps && r.siteId !== ps) {
      r.siteId = ps;
      synced++;
    }
  }
  console.log(`[enforce] synced ${synced} ${label} site_ids to their patient's site_id`);
}
syncChildSiteIds(visits, "visits");
syncChildSiteIds(adverseEvents, "adverse_events");
syncChildSiteIds(protocolDeviations, "protocol_deviations");
syncChildSiteIds(dropoutEvents, "dropout_events");
syncChildSiteIds(responseAssessments, "response_assessments");

// ---------------- T2: SITE-07 protocol deviations + visit dose ----------------
const site7Deviations = protocolDeviations.filter((d) => site7Ids.has(d.siteId));
const DEV_TARGET_DOSE_MOD = 0.65;
const DEV_TARGET_MAJOR = 0.45;
const DEV_TARGET_SIGNIFICANT = 0.35;

const devShuffle = shuffle(site7Deviations);
let t2Devs = 0;
for (let i = 0; i < devShuffle.length; i++) {
  const d = devShuffle[i];
  const fr = i / Math.max(1, devShuffle.length);
  if (fr < DEV_TARGET_DOSE_MOD) {
    d.type = "dose_modification";
    d.correctiveAction = "retrain_staff";
  } else {
    d.type = pickWeighted(
      ["visit_window_deviation", "assessment_timing", "concomitant_medication", "sample_collection", "documentation_error"],
      [25, 22, 18, 15, 20]
    );
  }
  d.category = fr < DEV_TARGET_MAJOR ? "major" : (rng() < 0.6 ? "minor" : "administrative");
  d.impact = fr < DEV_TARGET_SIGNIFICANT ? "significant" : (rng() < 0.6 ? "moderate" : "minimal");
  t2Devs++;
}
console.log(`[enforce] T2: SITE-07 deviations rewritten: ${t2Devs}`);

// SITE-07 visits: dose=340mg, dose_pct=0.85, 34% flagged as protocol_deviation
const site7Visits = visits.filter((v) => site7Ids.has(v.siteId));
const VISIT_DEV_TARGET = 0.34;
const vShuffle = shuffle(site7Visits);
let t2Visits = 0;
let t2Flagged = 0;
for (let i = 0; i < vShuffle.length; i++) {
  const v = vShuffle[i];
  // Dose: ~340mg with small noise, pct ~0.85
  const dose = clamp(Math.round(335 + rng() * 12), 320, 360);
  v.doseMg = dose;
  v.dosePct = +(dose / 400).toFixed(2);
  const flagged = i / Math.max(1, vShuffle.length) < VISIT_DEV_TARGET;
  v.deviationFlag = flagged ? "true" : "false";
  if (flagged) t2Flagged++;
  t2Visits++;
}
console.log(`[enforce] T2: SITE-07 visits dose-corrected: ${t2Visits} (${t2Flagged} flagged as deviation, target ${VISIT_DEV_TARGET * 100}%)`);

// Other sites: ensure their dose is near 100% (the pack-gen normal mean=390/0.98 is fine,
// but T1 may have left some at 340. Restore if a site is NOT SITE-07.)
let t2Others = 0;
for (const v of visits) {
  if (site7Ids.has(v.siteId)) continue;
  // Skip rows where dose_administered_mg or dose_pct_of_protocol are NULL — those represent
  // visits where dose wasn't given. The schema is now nullable; leave as-is.
  const raw = v._row.values[v._row.values.length - 1]; // doesn't matter; just check both fields
  void raw;
  // Only normalize numeric values that are present and below 0.90
  const pctStr = v._row.values[colIdx(blocks.filter((b)=>b.table==="visits")[0],"dose_pct_of_protocol")];
  if (pctStr === "NULL" || pctStr === "null") continue;
  const pct = parseFloat(pctStr);
  if (Number.isFinite(pct) && pct < 0.90) {
    const newPct = clamp(0.96 + rng() * 0.06, 0.92, 1.02);
    v.dosePct = +newPct.toFixed(2);
    v.doseMg = Math.round(newPct * 400);
    t2Others++;
  }
}
console.log(`[enforce] T2: other-site visits normalized to ~98% dose: ${t2Others}`);

// ---------------- T3: Response rate differential ----------------
function applyResponseDistribution(cohort, distribution) {
  // distribution: array of [category, weight]
  const total = cohort.length;
  const cumulative = [];
  let running = 0;
  for (const [cat, w] of distribution) {
    running += w;
    cumulative.push([cat, running]);
  }
  const shuffled = shuffle(cohort);
  for (let i = 0; i < shuffled.length; i++) {
    const r = i / total;
    for (const [cat, threshold] of cumulative) {
      if (r < threshold) {
        shuffled[i].category = cat;
        break;
      }
    }
  }
}

const SITE7_DIST = [
  ["complete_response", 0.05],
  ["partial_response", 0.26],
  ["stable_disease", 0.35],
  ["progressive_disease", 0.30],
  ["not_evaluable", 0.04],
];
const OTHER_DIST = [
  ["complete_response", 0.14],
  ["partial_response", 0.40],
  ["stable_disease", 0.28],
  ["progressive_disease", 0.12],
  ["not_evaluable", 0.06],
];

// Apply the distribution to week_16 rows specifically (exercises 3, 4, 9 all
// filter to assessment_timepoint='week_16'). Other timepoints keep their
// generator-supplied categories to preserve realistic timepoint variation.
const site7Responses = responseAssessments.filter((r) => site7Ids.has(r.siteId));
const otherResponses = responseAssessments.filter((r) => !site7Ids.has(r.siteId));
const site7Week16 = site7Responses.filter((r) => r.timepoint === "week_16");
const otherWeek16 = otherResponses.filter((r) => r.timepoint === "week_16");
applyResponseDistribution(site7Week16, SITE7_DIST);
applyResponseDistribution(otherWeek16, OTHER_DIST);
console.log(
  `[enforce] T3: week_16 response_assessments — SITE-07: ${site7Week16.length}/${site7Responses.length} rows (31% responders), others: ${otherWeek16.length}/${otherResponses.length} rows (54% responders)`
);

// ---------------- T4: Adverse events severity ----------------
const SITE7_AE_GRADES = [["1", 0.55], ["2", 0.30], ["3", 0.12], ["4", 0.02], ["5", 0.01]];
const OTHER_AE_GRADES = [["1", 0.40], ["2", 0.30], ["3", 0.18], ["4", 0.09], ["5", 0.03]];
const SITE7_SERIOUS_RATE = 0.08;
const OTHER_SERIOUS_RATE = 0.18;

function applySeverityDistribution(cohort, gradeDist, seriousRate) {
  const total = cohort.length;
  const cumulative = [];
  let running = 0;
  for (const [grade, w] of gradeDist) {
    running += w;
    cumulative.push([grade, running]);
  }
  const shuffled = shuffle(cohort);
  for (let i = 0; i < shuffled.length; i++) {
    const r = i / total;
    for (const [grade, threshold] of cumulative) {
      if (r < threshold) {
        shuffled[i].severityGrade = grade;
        break;
      }
    }
    shuffled[i].isSerious = rng() < seriousRate ? "true" : "false";
  }
}

const site7AEs = adverseEvents.filter((a) => site7Ids.has(a.siteId));
const otherAEs = adverseEvents.filter((a) => !site7Ids.has(a.siteId));
applySeverityDistribution(site7AEs, SITE7_AE_GRADES, SITE7_SERIOUS_RATE);
applySeverityDistribution(otherAEs, OTHER_AE_GRADES, OTHER_SERIOUS_RATE);
console.log(`[enforce] T4: adverse_events — SITE-07: ${site7AEs.length} milder, others: ${otherAEs.length} normal`);

// ---------------- T5: Site monitoring visits at SITE-07 ----------------
const site7Mon = siteMonitoringVisits.filter((m) => site7Ids.has(m.siteId));
const otherMon = siteMonitoringVisits.filter((m) => !site7Ids.has(m.siteId));
const SITE7_FORCAUSE_RATE = 0.40;
const OTHER_FORCAUSE_RATE = 0.15;
const VISIT_TYPES_NON_FORCAUSE = ["initiation", "routine", "closeout"];
const VISIT_TYPE_WEIGHTS = [10, 65, 10];

let t5Site7 = 0;
const shufSite7Mon = shuffle(site7Mon);
for (let i = 0; i < shufSite7Mon.length; i++) {
  const m = shufSite7Mon[i];
  const isForCause = i / Math.max(1, shufSite7Mon.length) < SITE7_FORCAUSE_RATE;
  m.visitType = isForCause ? "for_cause" : pickWeighted(VISIT_TYPES_NON_FORCAUSE, VISIT_TYPE_WEIGHTS);
  // SITE-07: findings_count 8-20, critical_findings 2-5
  m.findingsCount = 8 + Math.floor(rng() * 13);
  m.criticalFindings = 2 + Math.floor(rng() * 4);
  t5Site7++;
}
let t5Other = 0;
const shufOtherMon = shuffle(otherMon);
for (let i = 0; i < shufOtherMon.length; i++) {
  const m = shufOtherMon[i];
  const isForCause = i / Math.max(1, shufOtherMon.length) < OTHER_FORCAUSE_RATE;
  m.visitType = isForCause ? "for_cause" : pickWeighted(VISIT_TYPES_NON_FORCAUSE, VISIT_TYPE_WEIGHTS);
  // Others: findings_count 0-8, critical_findings 0-2
  m.findingsCount = Math.floor(rng() * 9);
  m.criticalFindings = Math.floor(rng() * 3);
  t5Other++;
}
console.log(`[enforce] T5: site_monitoring_visits — SITE-07: ${t5Site7} (40% for_cause), others: ${t5Other} (15% for_cause)`);

// ---------------- T6: Most recent interim analysis ----------------
let latest = null;
let latestMs = -Infinity;
for (const ia of interimAnalyses) {
  const ms = Date.parse(ia.analysisDate);
  if (Number.isFinite(ms) && ms > latestMs) {
    latestMs = ms;
    latest = ia;
  }
}
if (latest) {
  latest.orr = 0.50; // NUMERIC(12,2) rounds 0.498 -> 0.50 anyway; store 0.50 explicitly
  latest.ciLow = 0.46;
  latest.ciHigh = 0.54;
  latest.recommendation = "modify_protocol";
  latest.dsmbDecision = "request_additional_data";
  // For the briefing copy we'll continue to refer to 0.498 (rounds to 0.50)
  console.log(`[enforce] T6: latest interim_analyses ORR=0.50 (NUMERIC(12,2)) — DSMB request_additional_data`);
} else {
  console.warn("[enforce] T6: no interim_analyses rows found");
}

// ---------------- T7: Temporal ordering ----------------
let t7Patients = 0;
for (const p of patients) {
  const cMs = Date.parse(p.consentDate);
  const eMs = Date.parse(p.enrollmentDate);
  if (Number.isFinite(cMs) && Number.isFinite(eMs) && cMs > eMs) {
    // Swap: consent must be <= enrollment
    p.consentDate = new Date(eMs - (1 + Math.floor(rng() * 14)) * DAY).toISOString();
    t7Patients++;
  }
}
console.log(`[enforce] T7: patients consent_date fixed: ${t7Patients}`);

let t7Visits = 0;
for (const v of visits) {
  const sMs = Date.parse(v.scheduledDate);
  // actual_date is now nullable; only normalize when present and out of range
  const aRaw = v._row.values[colIdx(blocks.filter((b)=>b.table==="visits")[0],"actual_date")];
  if (aRaw === "NULL" || aRaw === "null") continue;
  const aMs = Date.parse(unstr(aRaw));
  if (!Number.isFinite(sMs) || !Number.isFinite(aMs)) continue;
  const drift = Math.abs(aMs - sMs);
  if (drift > 14 * DAY) {
    // Bring actual_date within +/- 7 days of scheduled
    const newActual = sMs + (Math.floor(rng() * 15) - 7) * DAY;
    v.actualDate = new Date(newActual).toISOString();
    t7Visits++;
  }
}
console.log(`[enforce] T7: visits actual_date normalized to scheduled: ${t7Visits}`);

let t7AE = 0;
for (const a of adverseEvents) {
  const oMs = Date.parse(a.onsetDate);
  const rMs = Date.parse(a.resolutionDate);
  if (!Number.isFinite(oMs)) continue;
  if (!Number.isFinite(rMs) || rMs < oMs) {
    a.resolutionDate = new Date(Math.min(NOW_MS, oMs + (7 + Math.floor(rng() * 24)) * DAY)).toISOString();
    t7AE++;
  }
}
console.log(`[enforce] T7: adverse_events resolution_date fixed: ${t7AE}`);

let t7PD = 0;
for (const d of protocolDeviations) {
  const dMs = Date.parse(d.detectedDate);
  const rMs = Date.parse(d.reportedDate);
  if (!Number.isFinite(dMs)) continue;
  if (!Number.isFinite(rMs) || rMs < dMs) {
    d.reportedDate = new Date(Math.min(NOW_MS, dMs + (1 + Math.floor(rng() * 5)) * DAY)).toISOString();
    t7PD++;
  }
}
console.log(`[enforce] T7: protocol_deviations reported_date fixed: ${t7PD}`);

let t7Drop = 0;
for (const d of dropoutEvents) {
  const dpMs = Date.parse(d.dropoutDate);
  const lMs = Date.parse(d.lastVisitDate);
  if (!Number.isFinite(dpMs)) continue;
  if (!Number.isFinite(lMs) || lMs >= dpMs) {
    d.lastVisitDate = new Date(dpMs - (7 + Math.floor(rng() * 24)) * DAY).toISOString();
    t7Drop++;
  }
}
console.log(`[enforce] T7: dropout_events last_visit_date fixed: ${t7Drop}`);

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

const site7DevsFinal = protocolDeviations.filter((d) => site7Ids.has(d.siteId));
console.log(
  `  SITE-07 protocol_deviations:           ${site7DevsFinal.length} rows`
);

// SITE-07 deviation share among patients (proxy for rate): deviations per visit
const site7VisitsFinal = visits.filter((v) => site7Ids.has(v.siteId));
const site7FlaggedFinal = site7VisitsFinal.filter((v) => v.deviationFlag === "true").length;
console.log(
  `  SITE-07 visit deviation rate:          ${site7VisitsFinal.length ? ((site7FlaggedFinal / site7VisitsFinal.length) * 100).toFixed(1) : 0}% (target 34%)`
);

// SITE-07 dose pct
const site7DoseAvg = site7VisitsFinal.length === 0
  ? 0
  : site7VisitsFinal.reduce((s, v) => s + parseFloat(v.dosePct || "0"), 0) / site7VisitsFinal.length;
console.log(`  SITE-07 dose pct of protocol:          ${(site7DoseAvg * 100).toFixed(1)}% (target 85%)`);

// SITE-07 response rate at week_16
function responderRate(rows, label) {
  const week16 = rows.filter((r) => r.timepoint === "week_16");
  if (week16.length === 0) return [0, 0, label];
  const responders = week16.filter((r) => r.category === "complete_response" || r.category === "partial_response").length;
  return [responders, week16.length, label];
}
const [s7Resp, s7Total] = responderRate(site7Responses, "SITE-07");
const [oResp, oTotal] = responderRate(otherResponses, "other");
console.log(
  `  SITE-07 response rate (week_16):       ${s7Total ? ((s7Resp / s7Total) * 100).toFixed(1) : 0}% (target 31%)`
);
console.log(
  `  Other sites response rate (week_16):   ${oTotal ? ((oResp / oTotal) * 100).toFixed(1) : 0}% (target 54%)`
);
// Overall ORR
const allWeek16 = responseAssessments.filter((r) => r.timepoint === "week_16");
const allResp = allWeek16.filter((r) => r.category === "complete_response" || r.category === "partial_response").length;
console.log(
  `  Overall ORR (week_16):                 ${allWeek16.length ? ((allResp / allWeek16.length) * 100).toFixed(1) : 0}% (target ~49.8%)`
);

// SITE-07 grade 3-5 AE rate
const s7Grade35 = site7AEs.filter((a) => ["3", "4", "5"].includes(a.severityGrade)).length;
const oGrade35 = otherAEs.filter((a) => ["3", "4", "5"].includes(a.severityGrade)).length;
console.log(
  `  SITE-07 grade 3-5 AE rate:             ${site7AEs.length ? ((s7Grade35 / site7AEs.length) * 100).toFixed(1) : 0}% (target 15%)`
);
console.log(
  `  Other sites grade 3-5 AE rate:         ${otherAEs.length ? ((oGrade35 / otherAEs.length) * 100).toFixed(1) : 0}% (target 30%)`
);

// SITE-07 for_cause monitoring
const s7ForCause = site7Mon.filter((m) => m.visitType === "for_cause").length;
console.log(
  `  SITE-07 for_cause monitoring:          ${site7Mon.length ? ((s7ForCause / site7Mon.length) * 100).toFixed(1) : 0}% (target 40%)`
);

// Latest interim ORR
if (latest) {
  console.log(`  Most recent interim_analyses ORR:      ${latest.orr} (target 0.50 after NUMERIC(12,2) round)`);
}

console.log("[enforce] done");
