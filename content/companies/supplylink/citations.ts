import type { CompanyCitations } from "../novapay/citations";

export const SUPPLYLINK_CITATIONS: CompanyCitations = {
  suppliers: {
    on_time_delivery_rate: {
      distribution:
        "Industry benchmark: 85% on-time is acceptable, 90%+ excellent. Below 70% requires immediate corrective action.",
      source: "ISM Report on Business Manufacturing PMI 2024",
      url: "https://www.ismworld.org",
    },
    lead_time_cv: {
      distribution:
        "Coefficient of variation benchmark: 0.20 acceptable, 0.35+ forces expensive safety stock buildup.",
      source: "MIT Center for Transportation and Logistics 2024",
      url: "https://ctl.mit.edu",
    },
    quality_rating: {
      distribution:
        "Quality rating 75+ is acceptable, 85+ is preferred-tier, below 65 is probation.",
      source: "Gartner Supply Chain Top 25 Report 2024",
      url: "https://www.gartner.com/supply-chain",
    },
  },
  deliveries: {
    is_late: {
      distribution:
        "Overall manufacturing on-time delivery declined to 79% in 2024 (from 91% pre-2023). Single-supplier outliers are typically the driver, not market-wide effects.",
      source: "ISM Report on Business Manufacturing PMI 2024",
      url: "https://www.ismworld.org",
    },
    expedited_flag: {
      distribution:
        "Expediting rate: 5-8% of POs acceptable. Above 15% suggests a supplier reliability problem.",
      source: "Deloitte Global CPO Survey 2024",
      url: "https://www.deloitte.com/supply-chain",
    },
  },
  quality_inspections: {
    failure_rate_pct: {
      distribution:
        "Quality rejection rate: 1-3% is normal, 3-5% acceptable with corrective action plan, above 5% requires escalation.",
      source: "Gartner Supply Chain Top 25 Report 2024",
      url: "https://www.gartner.com/supply-chain",
    },
    failure_category: {
      distribution:
        "Dimensional 45% / Material 35% / Cosmetic 20% — among non-cosmetic, dimensional indicates tooling or process change at the supplier.",
      source: "ASQ Supplier Quality Benchmark 2024",
      url: "https://asq.org",
    },
  },
  expediting_events: {
    reason: {
      distribution:
        "Single supplier accounting for >30% of expediting events is a known indicator of single-source dependency risk.",
      source: "McKinsey Supply Chain Resilience Report 2024",
      url: "https://www.mckinsey.com/supply-chain",
    },
    escalation_level: {
      distribution:
        "Urgent + critical events should be under 20% of all expediting events; above that signals a structural rather than incidental problem.",
      source: "Deloitte Global CPO Survey 2024",
      url: "https://www.deloitte.com/supply-chain",
    },
  },
  supplier_scorecards: {
    scorecard_grade: {
      distribution:
        "Grade distribution at healthy suppliers: A 30% / B 45% / C 20% / D 4% / F 1%. A D or F over multiple periods indicates terminal performance.",
      source: "ISM Supplier Performance Benchmark 2024",
      url: "https://www.ismworld.org",
    },
  },
};
