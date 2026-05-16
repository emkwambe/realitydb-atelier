// Citations as a visible moat (PRD §5).
//
// Each table that has distribution-meaningful columns lists the source we
// used to set its weights. SchemaExplorer renders these inline so students
// see that the synthetic data is grounded in published benchmarks, not
// pulled from thin air.

export interface Citation {
  distribution: string;
  source: string;
  url: string;
}

export type CompanyCitations = Record<string, Record<string, Citation>>;

export const NOVAPAY_CITATIONS: CompanyCitations = {
  customers: {
    segment: {
      distribution: "SMB 70% / Mid-market 25% / Enterprise 5%",
      source: "Bessemer State of the Cloud 2024",
      url: "https://www.bvp.com/atlas/state-of-the-cloud-2024",
    },
    country: {
      distribution: "US 62% / UK 11% / DE 8% / FR 5% / other 14%",
      source: "Stripe Atlas — B2B SaaS Geographic Benchmark 2024",
      url: "https://stripe.com/atlas",
    },
  },
  subscriptions: {
    status: {
      distribution: "Blended monthly churn 1.4% (3.2% enterprise, 0.9% SMB)",
      source: "ChurnZero 2024 SaaS Churn Benchmark Report",
      url: "https://churnzero.com/saas-metrics-benchmarks",
    },
    mrr_cents: {
      distribution:
        "Enterprise $8K–$25K / Mid-market $999–$1,999 / SMB $99–$299 monthly",
      source: "OpenView 2024 SaaS Pricing Benchmark",
      url: "https://openviewpartners.com/2024-saas-benchmarks",
    },
  },
  support_tickets: {
    category: {
      distribution: "14% of B2B SaaS tickets are billing/currency related",
      source: "Stripe Atlas B2B SaaS Benchmark 2024",
      url: "https://stripe.com/atlas",
    },
    resolution_time_hours: {
      distribution: "Median first response 12h, full resolution 48–72h",
      source: "Intercom Customer Support Trends Report 2024",
      url: "https://www.intercom.com/customer-support-trends-report",
    },
  },
  payments: {
    failure_code: {
      distribution: "card_declined 3% / insufficient_funds 2% / fraud 0.4%",
      source: "Stripe Radar Fraud Report 2024",
      url: "https://stripe.com/radar",
    },
  },
  marketing_attribution: {
    channel: {
      distribution:
        "Organic 30% / Paid search 22% / Referral 18% / Outbound 14% / Partner 11% / Other 5%",
      source: "HubSpot State of Marketing 2024",
      url: "https://www.hubspot.com/state-of-marketing",
    },
  },
  board_metrics: {
    metric_name: {
      distribution:
        "Values stored as percentage points (1.40 = 1.4%) — story metrics for 2025-03 reflect the enforced narrative",
      source: "RealityDB Atelier story enforcer (T6)",
      url: "https://atelier.realitydb.dev/companies/novapay",
    },
  },
};
