import type { CompanyCitations } from "../novapay/citations";

export const CLEARBANK_CITATIONS: CompanyCitations = {
  wires: {
    amount_cents: {
      distribution:
        "Currency Transaction Report (CTR) reporting threshold: $10,000 per cash transaction. Structuring transactions to evade reporting is prohibited under BSA 31 USC 5324.",
      source: "BSA 31 USC 5324 — Structuring transactions to evade reporting requirements",
      url: "https://www.govinfo.gov/content/pkg/USCODE-2022-title31/pdf/USCODE-2022-title31-subtitleIV-chapter53-subchapterII-sec5324.pdf",
    },
    destination_country: {
      distribution:
        "Cayman Islands (KY), Cyprus (CY), Panama (PA) appear on the FFIEC BSA/AML Examination Manual as high-risk jurisdictions for layering. Most US small business wires destination is US (~85%) or major trade partners.",
      source: "FFIEC BSA/AML Examination Manual",
      url: "https://bsaaml.ffiec.gov/manual",
    },
  },
  fraud_alerts: {
    alert_type: {
      distribution:
        "Alert mix: velocity_breach 15% / round_dollar 12% / geographic 10% / EDD overdue 8% / structuring 5%. Structuring + unusual_wire_pattern co-occurrence on the same account is a top-tier escalation signal.",
      source: "FinCEN Enforcement Actions 2024",
      url: "https://www.fincen.gov/news/enforcement-actions",
    },
    severity: {
      distribution:
        "Critical-severity alerts represent 5-10% of total fraud_alerts at most US banks. Sustained critical alerts on a small set of accounts with overlapping beneficial owners triggers BSA officer escalation.",
      source: "FFIEC BSA/AML Examination Manual",
      url: "https://bsaaml.ffiec.gov/manual",
    },
  },
  sar_filings: {
    activity_type: {
      distribution:
        "Suspicious Activity Report (SAR) must be filed within 30 days of detection per 31 CFR 1020.320. Activity_type 'structuring' or 'money_laundering' carries the highest priority. Late filing is a separate willful BSA violation.",
      source: "31 CFR 1020.320 — Reports by banks of suspicious transactions",
      url: "https://www.ecfr.gov/current/title-31/subtitle-B/chapter-X/part-1020/section-1020.320",
    },
    filed_date: {
      distribution:
        "FinCEN civil money penalty range: $1M-$15M for willful BSA violations. Penalty escalates with delay between detection and filing.",
      source: "FinCEN Enforcement Actions 2024",
      url: "https://www.fincen.gov/news/enforcement-actions",
    },
  },
  customers: {
    edd_required: {
      distribution:
        "Enhanced Due Diligence is required for high-risk customers under FinCEN CDD Final Rule. EDD must be completed before the relationship reaches steady-state monitoring. An EDD request open more than 90 days is a recordkeeping violation.",
      source: "FinCEN Customer Due Diligence Final Rule 2024",
      url: "https://www.fincen.gov/resources/statutes-and-regulations/cdd-final-rule",
    },
    risk_rating: {
      distribution:
        "High-risk customer mix typically 5-10% of an SMB-heavy commercial portfolio. High-risk plus high-volume wire activity plus offshore beneficial owners is the classic structuring/layering signature.",
      source: "FFIEC BSA/AML Examination Manual",
      url: "https://bsaaml.ffiec.gov/manual",
    },
  },
  beneficial_owners: {
    country_of_residence: {
      distribution:
        "Beneficial owners with KY/CY/PA residency on a US commercial account warrant Enhanced Due Diligence under the FinCEN CDD Final Rule. Country must be documented; id_verified must be true before account activation.",
      source: "FinCEN Customer Due Diligence Final Rule 2024",
      url: "https://www.fincen.gov/resources/statutes-and-regulations/cdd-final-rule",
    },
    ownership_pct: {
      distribution:
        "Beneficial-ownership threshold for reporting: any individual owning 25% or more must be identified. 100% ownership concentrated in a non-resident with unverified ID is an escalation trigger.",
      source: "FinCEN CDD Final Rule 2024",
      url: "https://www.fincen.gov/resources/statutes-and-regulations/cdd-final-rule",
    },
  },
  kyc_records: {
    verification_status: {
      distribution:
        "Healthy kyc_records mix: verified 68% / pending 15% / expired 7% / failed 6% / waived 4%. Sustained 'pending' or 'failed' on EDD documents for a high-risk customer is a CDD compliance gap.",
      source: "FFIEC BSA/AML Examination Manual",
      url: "https://bsaaml.ffiec.gov/manual",
    },
  },
};
