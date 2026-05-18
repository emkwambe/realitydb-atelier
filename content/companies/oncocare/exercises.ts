import type { Exercise } from "@/lib/grading";

export const oncocareExercises: Exercise[] = [
  {
    id: 1,
    title: "Understand the trial",
    businessQuestion: "What does a healthy Phase III oncology trial look like?",
    skills: ["SELECT", "COUNT", "JOIN"],
    description:
      "Establish the baseline. How many patients are enrolled, across how many sites, on which treatment arms? The ITT (intent-to-treat) population includes everyone who consented; the per-protocol population includes only those who followed the protocol. The difference between them matters.",
    hint: "Count patients, sites with non-null enrollment, and treatment arms.",
    referenceSQL: `SELECT
  (SELECT COUNT(*) FROM patients) AS total_patients,
  (SELECT COUNT(DISTINCT site_code) FROM sites) AS distinct_sites,
  (SELECT COUNT(DISTINCT arm_code) FROM treatment_arms) AS arms;`,
    requiredColumns: ["total_patients", "distinct_sites", "arms"],
    difficulty: "beginner",
  },
  {
    id: 2,
    title: "Site enrollment map",
    businessQuestion: "Which sites enrolled the most patients?",
    skills: ["GROUP BY", "JOIN", "ranking"],
    description:
      "Show patient count per site by site_code. Geographic concentration matters — a global trial that's actually 80% US-based is less generalizable than the protocol claims.",
    hint: "GROUP BY sites.site_code. Use COUNT(p.id) to count patients enrolled per site.",
    referenceSQL: `SELECT
  s.site_code,
  MIN(s.country) AS country,
  COUNT(p.id) AS patients_enrolled
FROM sites s
LEFT JOIN patients p ON p.site_id = s.id
GROUP BY s.site_code
ORDER BY patients_enrolled DESC;`,
    requiredColumns: ["site_code", "country", "patients_enrolled"],
    difficulty: "beginner",
  },
  {
    id: 3,
    title: "Overall response rate",
    businessQuestion: "Is the trial above the FDA accelerated approval threshold?",
    skills: ["GROUP BY", "percentage calculation"],
    description:
      "Compute the overall response rate at the primary endpoint (week_16). Response is defined as complete_response or partial_response per RECIST criteria. The FDA threshold for accelerated approval in advanced NSCLC is 50%. Are we above or below?",
    hint: "Filter response_assessments to assessment_timepoint='week_16'. CR + PR over total = response rate.",
    referenceSQL: `SELECT
  response_category,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS pct
FROM response_assessments
WHERE assessment_timepoint = 'week_16'
GROUP BY response_category
ORDER BY count DESC;`,
    requiredColumns: ["response_category", "count", "pct"],
    difficulty: "beginner",
  },
  {
    id: 4,
    title: "Response rate by site",
    businessQuestion: "Which site has the lowest response rate?",
    skills: ["multi-table JOIN", "conditional aggregation"],
    description:
      "Drop one level deeper. Compute the response rate per site. A uniform rate across sites suggests the trial-level result reflects the drug. An outlier site suggests a site-specific issue — investigator practice, patient population, or protocol adherence.",
    hint: "JOIN response_assessments to sites, filter week_16, GROUP BY site_code.",
    referenceSQL: `SELECT
  s.site_code,
  MIN(s.country) AS country,
  COUNT(ra.id) AS assessments,
  SUM(CASE WHEN ra.response_category IN ('complete_response','partial_response') THEN 1 ELSE 0 END) AS responders,
  ROUND(
    SUM(CASE WHEN ra.response_category IN ('complete_response','partial_response') THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(ra.id), 0), 1
  ) AS response_rate_pct
FROM response_assessments ra
JOIN sites s ON ra.site_id = s.id
WHERE ra.assessment_timepoint = 'week_16'
GROUP BY s.site_code
ORDER BY response_rate_pct ASC;`,
    requiredColumns: ["site_code", "country", "assessments", "responders", "response_rate_pct"],
    difficulty: "intermediate",
  },
  {
    id: 5,
    title: "Protocol deviations by site",
    businessQuestion: "Where are protocol deviations concentrated?",
    skills: ["GROUP BY", "conditional aggregation"],
    description:
      "Count protocol_deviations per site, broken down by deviation_type. TransCelerate benchmark for a Phase III oncology trial: 8% deviation rate is acceptable, 15%+ is a quality concern. A single site driving the bulk of deviations is a different problem from systemic across-the-board lapses.",
    hint: "GROUP BY sites.site_code, count protocol_deviations, and isolate dose_modification share.",
    referenceSQL: `SELECT
  s.site_code,
  COUNT(pd.id) AS total_deviations,
  SUM(CASE WHEN pd.deviation_type = 'dose_modification' THEN 1 ELSE 0 END) AS dose_deviations,
  ROUND(
    SUM(CASE WHEN pd.deviation_type = 'dose_modification' THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(pd.id), 0), 1
  ) AS dose_deviation_pct
FROM protocol_deviations pd
JOIN sites s ON pd.site_id = s.id
GROUP BY s.site_code
ORDER BY total_deviations DESC;`,
    requiredColumns: ["site_code", "total_deviations", "dose_deviations", "dose_deviation_pct"],
    difficulty: "intermediate",
  },
  {
    id: 6,
    title: "Dose adherence at the outlier site",
    businessQuestion: "What dose is SITE-07 actually administering?",
    skills: ["multi-table JOIN", "AVG", "comparison vs protocol"],
    description:
      "The protocol mandates 400mg of ONC-441. Compute the average dose_administered_mg and dose_pct_of_protocol per site. A site running at 85% of protocol dose without documented medical justification is a major protocol violation.",
    hint: "AVG dose_pct_of_protocol per site. Filter to non-null dose values.",
    referenceSQL: `SELECT
  s.site_code,
  ROUND(AVG(v.dose_pct_of_protocol)::numeric * 100, 1) AS avg_dose_pct,
  ROUND(AVG(v.dose_administered_mg)::numeric, 0) AS avg_dose_mg,
  COUNT(CASE WHEN v.protocol_deviation_flag = 'true' THEN 1 END) AS deviation_visits,
  COUNT(v.id) AS total_visits
FROM visits v
JOIN sites s ON v.site_id = s.id
WHERE v.dose_administered_mg IS NOT NULL
GROUP BY s.site_code
ORDER BY avg_dose_pct ASC;`,
    requiredColumns: ["site_code", "avg_dose_pct", "avg_dose_mg", "deviation_visits", "total_visits"],
    difficulty: "intermediate",
  },
  {
    id: 7,
    title: "Adverse event severity by site",
    businessQuestion: "Are SITE-07 patients having FEWER severe adverse events?",
    skills: ["JOIN", "conditional aggregation", "severity grading"],
    description:
      "CTCAE grade 3-5 adverse events are serious — they require hospitalization or are life-threatening. ONC-441 has a known toxicity profile; you'd expect ~30% of patients to experience grade 3+ AEs. A site reporting only 15% grade 3+ AEs is either (a) underdosing — less drug means fewer side effects, or (b) recruiting healthier patients. Both are possible explanations; you need to hold both.",
    hint: "JOIN adverse_events to sites, count severity_grade IN ('3','4','5'). Note severity_grade is stored as VARCHAR, not INT.",
    referenceSQL: `SELECT
  s.site_code,
  COUNT(ae.id) AS total_aes,
  SUM(CASE WHEN ae.severity_grade IN ('3','4','5') THEN 1 ELSE 0 END) AS grade3plus,
  ROUND(
    SUM(CASE WHEN ae.severity_grade IN ('3','4','5') THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(ae.id), 0), 1
  ) AS grade3plus_pct
FROM adverse_events ae
JOIN sites s ON ae.site_id = s.id
GROUP BY s.site_code
ORDER BY grade3plus_pct ASC;`,
    requiredColumns: ["site_code", "total_aes", "grade3plus", "grade3plus_pct"],
    difficulty: "intermediate",
  },
  {
    id: 8,
    title: "Site monitoring findings",
    businessQuestion: "What did the sponsor's monitors find at SITE-07?",
    skills: ["JOIN", "GROUP BY", "AVG / MAX"],
    description:
      "FDA risk-based monitoring guidance recommends sponsor monitoring visits at every site, with `for_cause` visits triggered by quality signals. A site with 40% for_cause visits and double-digit findings_count rows is a site where the sponsor knew something was wrong and documented it.",
    hint: "GROUP BY sites.site_code on site_monitoring_visits; count for_cause visits and compute findings stats.",
    referenceSQL: `SELECT
  s.site_code,
  COUNT(smv.id) AS total_visits,
  SUM(CASE WHEN smv.visit_type = 'for_cause' THEN 1 ELSE 0 END) AS for_cause_visits,
  ROUND(AVG(smv.findings_count)::numeric, 1) AS avg_findings,
  MAX(smv.critical_findings) AS max_critical
FROM site_monitoring_visits smv
JOIN sites s ON smv.site_id = s.id
GROUP BY s.site_code
ORDER BY for_cause_visits DESC;`,
    requiredColumns: ["site_code", "total_visits", "for_cause_visits", "avg_findings", "max_critical"],
    difficulty: "advanced",
  },
  {
    id: 9,
    title: "The smoking gun",
    businessQuestion: "Does the underdosing signature appear at SITE-07?",
    skills: ["three-table JOIN", "co-correlation"],
    description:
      "Combine dose adherence, response rate, and AE severity per site. The underdosing signature is: low dose × low response rate × low AE rate. Healthier patients would predict low AEs but maintain response rate. Underdosing predicts BOTH dropping together. If you see SITE-07 at the bottom of all three columns, that's the underdosing fingerprint.",
    hint: "Join sites with visits, response_assessments (week_16), and adverse_events. Show the three columns side by side.",
    referenceSQL: `SELECT
  s.site_code,
  ROUND(AVG(v.dose_pct_of_protocol)::numeric * 100, 1) AS avg_dose_pct,
  ROUND(
    SUM(CASE WHEN ra.response_category IN ('complete_response','partial_response') THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(DISTINCT ra.patient_id), 0), 1
  ) AS response_rate_pct,
  ROUND(
    SUM(CASE WHEN ae.severity_grade IN ('3','4','5') THEN 1 ELSE 0 END) * 100.0
    / NULLIF(COUNT(DISTINCT ae.patient_id), 0), 1
  ) AS grade3plus_pct
FROM sites s
LEFT JOIN visits v
  ON v.site_id = s.id AND v.dose_pct_of_protocol IS NOT NULL
LEFT JOIN response_assessments ra
  ON ra.site_id = s.id AND ra.assessment_timepoint = 'week_16'
LEFT JOIN adverse_events ae
  ON ae.site_id = s.id
GROUP BY s.site_code
ORDER BY avg_dose_pct ASC;`,
    requiredColumns: ["site_code", "avg_dose_pct", "response_rate_pct", "grade3plus_pct"],
    difficulty: "advanced",
  },
  {
    id: 10,
    title: "Quantify the impact and recommend",
    businessQuestion: "Exclude SITE-07 or remediate?",
    skills: ["literal modeling", "regulatory citation"],
    description:
      "You have the pattern. Now model the decision. Option A — per-protocol exclusion of SITE-07: response rate rises 49.8% → 54.1%, NDA proceeds. Risk: FDA may question post-hoc exclusion. Option B — remediate SITE-07 with enhanced monitoring and dose correction: historical data unchanged, but sponsor demonstrates integrity. Cite ICH E6 GCP and the 6-week FDA advisory timeline.",
    hint: "Switch to literal modeling — numbers come from the comparison panel.",
    referenceSQL: `SELECT
  'Option A: Exclude SITE-07' AS scenario,
  0.541 AS response_rate,
  0.50 AS fda_threshold,
  'Above threshold' AS status,
  'NDA proceeds; FDA may question post-hoc exclusion' AS trade_off
UNION ALL
SELECT
  'Option B: Remediate SITE-07' AS scenario,
  0.498 AS response_rate,
  0.50 AS fda_threshold,
  'Below threshold' AS status,
  '6-12 month NDA delay; demonstrates protocol integrity' AS trade_off
UNION ALL
SELECT
  'Status quo' AS scenario,
  0.498 AS response_rate,
  0.50 AS fda_threshold,
  'Below threshold' AS status,
  'Likely DSMB stop-for-futility recommendation' AS trade_off;`,
    requiredColumns: ["scenario", "response_rate", "fda_threshold", "status", "trade_off"],
    difficulty: "advanced",
  },
];
