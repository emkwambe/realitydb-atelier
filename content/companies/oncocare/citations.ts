import type { CompanyCitations } from "../novapay/citations";

export const ONCOCARE_CITATIONS: CompanyCitations = {
  protocol_deviations: {
    deviation_type: {
      distribution:
        "TransCelerate BioPharma benchmark: 8% protocol deviation rate is acceptable for Phase III oncology trials. Above 15% triggers a quality investigation. Above 25% is a Form FDA 483 risk.",
      source: "TransCelerate BioPharma Clinical Quality Metrics 2024",
      url: "https://transceleratebiopharmainc.com",
    },
    deviation_category: {
      distribution:
        "Healthy mix: 20% major / 55% minor / 25% administrative. Concentration of major deviations at one site is an investigator-conduct signal.",
      source: "ICH E6 Good Clinical Practice guidelines",
      url: "https://www.ich.org/page/efficacy-guidelines",
    },
  },
  response_assessments: {
    response_category: {
      distribution:
        "FDA accelerated approval threshold for advanced NSCLC targeted therapy: overall response rate (CR+PR) of 50% at the primary endpoint. RECIST 1.1 criteria.",
      source:
        "FDA Oncology Center of Excellence — Accelerated Approval guidance",
      url: "https://www.fda.gov/patients/fast-track-breakthrough-therapy-accelerated-approval-priority-review/accelerated-approval-program",
    },
    assessment_timepoint: {
      distribution:
        "Standard NSCLC response rates for targeted therapy: ORR 45-55%, CR rate 8-15%, PR rate 35-45%. Lower rates may signal underdosing, treatment resistance, or measurement bias.",
      source: "IQVIA Global Oncology Trends Report 2024",
      url: "https://www.iqvia.com/insights/the-iqvia-institute/reports/global-oncology-trends-2024",
    },
  },
  adverse_events: {
    severity_grade: {
      distribution:
        "CTCAE grading: 1 mild / 2 moderate / 3 severe / 4 life-threatening / 5 death. Healthy Phase III oncology trial profile: ~30% grade 3+ AEs. Significantly lower rates may indicate underdosing or under-reporting.",
      source: "NCI CTCAE v5.0",
      url: "https://ctep.cancer.gov/protocoldevelopment/electronic_applications/ctc.htm",
    },
    is_serious: {
      distribution:
        "Serious adverse event rate baseline for Phase III oncology targeted therapy: ~18%. Sites reporting significantly lower SAE rates while peers report normal rates warrant a sponsor for-cause monitoring visit.",
      source: "FDA Guidance on Drug Safety Reporting 2024",
      url: "https://www.fda.gov/safety/medical-product-safety-information",
    },
  },
  site_monitoring_visits: {
    visit_type: {
      distribution:
        "FDA risk-based monitoring: routine visits cover ~65% of monitoring; for_cause visits ~15% under normal conditions. A site at >30% for_cause has triggered the sponsor's quality system.",
      source: "FDA Guidance on Risk-Based Approach to Monitoring 2024",
      url: "https://www.fda.gov/media/116754/download",
    },
  },
  dropout_events: {
    dropout_reason: {
      distribution:
        "Phase III oncology dropout rate: 18% over a 24-month trial is the Tufts CSDD benchmark. Disease_progression dominates (~30%), followed by adverse_event (~25%).",
      source: "Tufts CSDD Impact Report on Clinical Trial Retention 2024",
      url: "https://csdd.tufts.edu",
    },
  },
  interim_analyses: {
    dsmb_decision: {
      distribution:
        "DSMB charter requirements under ICH E6: dsmb_decision in {continue, pause, stop, request_additional_data}. 'Request_additional_data' is the standard escalation when the trial is at the efficacy threshold with site-level heterogeneity.",
      source: "ICH E6 Good Clinical Practice guidelines",
      url: "https://www.ich.org/page/efficacy-guidelines",
    },
  },
};
