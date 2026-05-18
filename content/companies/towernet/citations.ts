import type { CompanyCitations } from "../novapay/citations";

export const TOWERNET_CITATIONS: CompanyCitations = {
  subscribers: {
    status: {
      distribution:
        "Postpaid wireless monthly churn 2.1% (industry mean). 2.5%+ triggers executive review. Single-tower outliers above 5% indicate network or coverage failure.",
      source: "GSMA Mobile Economy Report 2024",
      url: "https://www.gsma.com/mobileeconomy",
    },
    age_bracket: {
      distribution:
        "US wireless subscriber age mix: 18-24 15% / 25-34 25% / 35-44 25% / 45-54 20% / 55-64 10% / 65+ 5%",
      source: "Pew Research Mobile Fact Sheet 2024",
      url: "https://www.pewresearch.org/internet/fact-sheet/mobile/",
    },
  },
  towers: {
    uptime_pct_ytd: {
      distribution:
        "Network uptime benchmark: 99.7% YTD acceptable, 99.95% target for major operators. Below 95% on a cluster is a critical maintenance event.",
      source: "Ericsson Mobility Report 2024",
      url: "https://www.ericsson.com/mobility-report",
    },
    maintenance_status: {
      distribution:
        "Healthy maintenance distribution: current 60% / scheduled 20% / overdue 15% / critical_backlog 5%. Above 10% in critical_backlog is a leading indicator of incident concentration.",
      source: "TOWERCOS Annual Report 2024",
      url: "https://www.towerxchange.com",
    },
  },
  network_incidents: {
    incident_type: {
      distribution:
        "Incident mix: outage 20% / degraded 30% / planned_maintenance 25% / equipment_failure 12% / power_issue 8% / fiber_cut 5%. Tower with >10 incidents/year is a maintenance failure.",
      source: "Ericsson Mobility Report 2024",
      url: "https://www.ericsson.com/mobility-report",
    },
    severity: {
      distribution:
        "Severity mix: low 30% / medium 40% / high 20% / critical 10%. Sustained high/critical concentration on one tower indicates equipment EoL.",
      source: "Ericsson Mobility Report 2024",
      url: "https://www.ericsson.com/mobility-report",
    },
  },
  support_tickets: {
    category: {
      distribution:
        "Category mix: network_quality 28% / billing 22% / device 15% / account 12% / roaming 8% / coverage 8% / speed 5% / other 2%. Network + coverage above 50% near a tower indicates RF problems.",
      source: "J.D. Power Wireless Customer Satisfaction Study 2024",
      url: "https://www.jdpower.com/business/resources/wireless-customer-satisfaction",
    },
  },
  churn_signals: {
    signal_type: {
      distribution:
        "Signal mix: usage_drop 25% / payment_failure 20% / support_spike 20% / network_complaint 18% / competitor_inquiry 10% / plan_downgrade 7%. Network_complaint >35% on a sub-cohort is a leading churn indicator.",
      source: "J.D. Power Wireless Customer Satisfaction Study 2024",
      url: "https://www.jdpower.com/business/resources/wireless-customer-satisfaction",
    },
  },
  plans: {
    monthly_fee_cents: {
      distribution:
        "ARPU benchmark: $45 blended for US postpaid wireless. Range $25 (prepaid basic) to $120 (business premium).",
      source: "ITU World Telecommunication Statistics 2024",
      url: "https://www.itu.int/itu-d/statistics",
    },
  },
};
