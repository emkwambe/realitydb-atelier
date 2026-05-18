// Quick-queries are exploration prompts, NOT exercise answers.
import type { CompanyQuickQueries } from "../novapay/quickQueries";

export const ONCOCARE_QUICK_QUERIES: CompanyQuickQueries = {
  trials: [
    {
      label: "Trial overview",
      sql: `SELECT trial_id, title, phase, drug_name,
       target_enrollment, actual_enrollment, primary_endpoint
FROM trials
LIMIT 1;`,
    },
  ],
  sites: [
    {
      label: "Sites by country",
      sql: `SELECT site_code, MIN(site_name) AS site_name,
       MIN(country) AS country, MIN(performance_tier) AS tier,
       ROUND(AVG(deviation_rate_pct)::numeric, 2) AS avg_deviation_rate
FROM sites
GROUP BY site_code
ORDER BY site_code;`,
    },
    {
      label: "Sites on probation or watch list",
      sql: `SELECT site_code, MIN(site_name) AS site_name,
       MIN(performance_tier) AS tier
FROM sites
WHERE performance_tier IN ('probation','watch_list')
GROUP BY site_code;`,
    },
  ],
  patients: [
    {
      label: "Patient mix by age and ECOG",
      sql: `SELECT age_bracket, ecog_status, COUNT(*) AS patients
FROM patients
GROUP BY age_bracket, ecog_status
ORDER BY age_bracket, ecog_status;`,
    },
    {
      label: "Patient status overview",
      sql: `SELECT status, COUNT(*) AS patients
FROM patients
GROUP BY status
ORDER BY patients DESC;`,
    },
  ],
  visits: [
    {
      label: "Visit type mix",
      sql: `SELECT visit_type, COUNT(*) AS visits,
       SUM(CASE WHEN visit_status = 'missed' THEN 1 ELSE 0 END) AS missed
FROM visits
GROUP BY visit_type
ORDER BY visits DESC;`,
    },
    {
      label: "Dose distribution",
      sql: `SELECT
  ROUND(AVG(dose_pct_of_protocol)::numeric * 100, 1) AS avg_pct,
  MIN(dose_pct_of_protocol) AS min_pct,
  MAX(dose_pct_of_protocol) AS max_pct,
  COUNT(*) AS rows_with_dose
FROM visits
WHERE dose_pct_of_protocol IS NOT NULL;`,
    },
  ],
  adverse_events: [
    {
      label: "AE categories overall",
      sql: `SELECT ae_category, COUNT(*) AS aes,
       SUM(CASE WHEN severity_grade IN ('3','4','5') THEN 1 ELSE 0 END) AS grade3plus
FROM adverse_events
GROUP BY ae_category
ORDER BY aes DESC;`,
    },
    {
      label: "Serious AE rate by AE term",
      sql: `SELECT ae_term, COUNT(*) AS aes,
       SUM(CASE WHEN is_serious = 'true' THEN 1 ELSE 0 END) AS serious,
       ROUND(SUM(CASE WHEN is_serious = 'true' THEN 1 ELSE 0 END) * 100.0
             / NULLIF(COUNT(*), 0), 1) AS serious_pct
FROM adverse_events
GROUP BY ae_term
ORDER BY serious_pct DESC;`,
    },
  ],
  response_assessments: [
    {
      label: "Response distribution at week_16",
      sql: `SELECT response_category, COUNT(*) AS assessments,
       ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) AS pct
FROM response_assessments
WHERE assessment_timepoint = 'week_16'
GROUP BY response_category
ORDER BY assessments DESC;`,
    },
    {
      label: "Blinded vs unblinded assessments",
      sql: `SELECT assessor_blinded, COUNT(*) AS assessments
FROM response_assessments
GROUP BY assessor_blinded;`,
    },
  ],
  protocol_deviations: [
    {
      label: "Deviations by severity",
      sql: `SELECT severity, deviation_category, COUNT(*) AS deviations
FROM protocol_deviations
GROUP BY severity, deviation_category
ORDER BY deviations DESC;`,
    },
    {
      label: "Open and escalated deviations",
      sql: `SELECT status, COUNT(*) AS deviations
FROM protocol_deviations
WHERE status IN ('open','escalated','under_review')
GROUP BY status;`,
    },
  ],
  site_monitoring_visits: [
    {
      label: "Monitoring visit mix",
      sql: `SELECT visit_type, COUNT(*) AS visits,
       ROUND(AVG(findings_count)::numeric, 1) AS avg_findings,
       MAX(critical_findings) AS max_critical
FROM site_monitoring_visits
GROUP BY visit_type
ORDER BY visits DESC;`,
    },
  ],
  dropout_events: [
    {
      label: "Dropout reasons",
      sql: `SELECT dropout_reason, COUNT(*) AS dropouts
FROM dropout_events
GROUP BY dropout_reason
ORDER BY dropouts DESC;`,
    },
  ],
  interim_analyses: [
    {
      label: "All interim analyses",
      sql: `SELECT analysis_number, analysis_date, patients_included,
       overall_response_rate, response_rate_ci_low, response_rate_ci_high,
       recommendation, dsmb_decision
FROM interim_analyses
ORDER BY analysis_date DESC
LIMIT 10;`,
    },
  ],
};
