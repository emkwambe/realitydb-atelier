import type { CompanyCitations } from "../novapay/citations";

export const MEDCORE_CITATIONS: CompanyCitations = {
  claims: {
    claim_status: {
      distribution: "Blended denial rate 13-15% (band of acceptable performance)",
      source: "HFMA Revenue Cycle Benchmark Report 2024",
      url: "https://www.hfma.org/revenue-cycle",
    },
    total_charges: {
      distribution:
        "Mean charge per claim ~$12K, long tail to $250K for inpatient cardiac/orthopedic cases",
      source: "AHA Annual Survey 2024",
      url: "https://www.aha.org/statistics",
    },
  },
  payers: {
    name: {
      distribution:
        "Commercial 52% / Medicare 28% / Medicaid 15% / Self-pay 5% (claim volume)",
      source: "AHA Annual Survey 2024",
      url: "https://www.aha.org/statistics",
    },
  },
  denials: {
    carc_code: {
      distribution:
        "CO-97 (authorization) ~23% of all denials industry-wide; CO-16 (information missing) ~18%; CO-50 (medical necessity) ~14%",
      source: "Change Healthcare Denial Index 2024",
      url: "https://www.changehealthcare.com",
    },
    denial_category: {
      distribution:
        "Authorization 23% / Coding 19% / Medical necessity 14% / Other 44%",
      source: "Change Healthcare Denial Index 2024",
      url: "https://www.changehealthcare.com",
    },
  },
  appeals: {
    outcome: {
      distribution:
        "Overturn rate ~63% on first-level appeals (denied claims often reversed when contested)",
      source: "KFF Hospital Denied Claims Analysis 2024",
      url: "https://www.kff.org",
    },
  },
  payments: {
    is_underpayment: {
      distribution:
        "8% underpayment rate industry baseline; outliers above 15% indicate payer policy issues",
      source: "Experian Health State of Claims 2024",
      url: "https://www.experianhealth.com",
    },
  },
  encounters: {
    encounter_type: {
      distribution:
        "Outpatient 72% / Inpatient 18% / Emergency 10% (community hospital mix)",
      source: "CMS Hospital Outpatient Services Report 2024",
      url: "https://www.cms.gov",
    },
  },
};
