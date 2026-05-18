import type { CompanyRubric } from "../novapay/rubric";

export const towernetRubric: CompanyRubric = {
  company: "towernet",
  companyLabel: "TowerNet Communications",
  passingScore: 70,
  axes: {
    segmentation: {
      name: "Segmentation",
      maxScore: 20,
      passCriteria:
        "Identifies SE-447 as the outlier tower — not just the Southeast region. Drops past the regional aggregate to the tower-level breakdown and calls out SE-447 by name.",
      failCriteria:
        "Reports only regional churn rate (Southeast is high) without breaking down to the tower-cluster level or naming SE-447.",
    },
    causal_reasoning: {
      name: "Causal reasoning",
      maxScore: 20,
      passCriteria:
        "Links SE-447's 14-incident count to its 6.2% churn rate with specific numbers. Compares to the system average of ~1 incident per tower and ~1.9% churn. Treats the correlation as a working hypothesis pending customer-exit-survey confirmation.",
      failCriteria:
        "Attributes the SE-447 churn spike to regional demographics, competition, or pricing without examining the network_incidents table.",
    },
    quantification: {
      name: "Quantification",
      maxScore: 20,
      passCriteria:
        "Calculates monthly revenue loss ($131,580) and annualized ARR at risk ($1.58M). Shows the derivation: (6.2% − 1.9%) × 68,000 subscribers × $45 ARPU × 12.",
      failCriteria:
        "Describes the churn problem qualitatively without a dollar figure or shows numbers without a derivation.",
    },
    recommendation: {
      name: "Recommendation",
      maxScore: 20,
      passCriteria:
        "Recommends a specific option (maintenance OR credits) with upfront cost, payback period, and 12-month net position. Compares the two options against each other and against doing nothing.",
      failCriteria:
        "Generic recommendation to 'improve network quality' or 'invest in retention' without naming a specific option, cost, or payback.",
    },
    epistemic_honesty: {
      name: "Epistemic honesty",
      maxScore: 20,
      passCriteria:
        "Acknowledges that SE-447 churn could also be driven by a competitor entering the coverage area or a demographic shift — the incident correlation is suggestive, not conclusive. Recommends running a customer exit survey before committing $2.1M capex.",
      failCriteria:
        "Presents the incident-churn correlation as proof of causation. Does not consider alternative explanations or recommend confirmatory evidence.",
    },
  },
  hiddenStory: `The data tells this story in order:
1. Blended churn at 2.1% looks healthy by GSMA benchmarks (industry mean) — until you segment.
2. Churn by region reveals Southeast is the outlier (~3% vs ~1.9% elsewhere).
3. Drop to the tower level: SE-447 is at ~6.2% churn while every other tower clusters around ~1.9%. The Southeast regional figure is just an SE-447 footprint.
4. Time-bucket subscription cancellations: SE-447 cancellations spike in the last 8 months; other towers stay flat. Something changed in mid-2025.
5. Network incidents per tower: SE-447 has 14, system mean is ~1. All 14 are outage/equipment_failure at high/critical severity. The maintenance backlog was known internally and never escalated.
6. Support tickets for SE-447 subscribers: 65% network_quality/coverage versus the system 36%. The customer experience matches the network reality.
7. Churn signals for SE-447 subscribers: 45% network_complaint vs system 18%, 60% at high/critical severity. Customers are telling you why before they leave.
8. Financial impact: 68,000 SE-447-area subscribers × 4.3% excess churn × $45 ARPU × 12 = $1.58M ARR at risk.
9. Two options on the table: emergency maintenance ($2.1M capex, 23.7mo payback, $1.06M ARR recovered, fixes the root cause) vs retention credits ($1.8M cost, $0.63M retained, network still broken).`,
};
