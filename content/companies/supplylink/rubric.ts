import type { CompanyRubric } from "../novapay/rubric";

export const supplylinkRubric: CompanyRubric = {
  company: "supplylink",
  companyLabel: "SupplyLink Operations",
  passingScore: 70,
  axes: {
    segmentation: {
      name: "Segmentation",
      maxScore: 20,
      passCriteria:
        "Identifies Zhonghe Industrial as the outlier supplier — not just an aggregate on-time rate, but a per-supplier breakdown that names Zhonghe. Calls out that Zhonghe's late rate is roughly 4x the next-worst supplier.",
      failCriteria:
        "Reports only the blended on-time delivery rate. Does not name a specific supplier or break down by supplier.",
    },
    causal_reasoning: {
      name: "Causal reasoning",
      maxScore: 20,
      passCriteria:
        "Links Zhonghe's degradation to a specific inflection point (month 15, August 2025) using the scorecard arc. Notes that on-time rate, quality rate, and lead time all degraded simultaneously — meaning something changed inside Zhonghe, not a market-wide trend.",
      failCriteria:
        "Attributes the late deliveries to general market disruption or internal SupplyLink issues. Does not check the temporal arc or identify the simultaneous degradation across all metrics.",
    },
    quantification: {
      name: "Quantification",
      maxScore: 20,
      passCriteria:
        "Quantifies the cost of Zhonghe relationship in dollars — expediting cost, rework cost, and stockout impact. Shows the calculation. Cites the $8.1M total cost vs $6.4M annual spend as a net-negative relationship.",
      failCriteria:
        "Describes Zhonghe as 'costly' without specific numbers. No comparison of cost vs spend. No annualization.",
    },
    recommendation: {
      name: "Recommendation",
      maxScore: 20,
      passCriteria:
        "Recommends a specific intervention (dual-source, exit, or renegotiate) with transition cost, payback period, and 12-month net position. Compares the three options against each other and against doing nothing. Picks one and defends the choice.",
      failCriteria:
        "Generic recommendation to 'find a new supplier' without naming an option, cost, or payback. No comparison.",
    },
    epistemic_honesty: {
      name: "Epistemic honesty",
      maxScore: 20,
      passCriteria:
        "Acknowledges what the data cannot reveal — what changed inside Zhonghe specifically (subcontractor change? equipment failure? ownership change?). Recommends a quality audit before final commitment. Notes that exit risks (single-source dependency on new supplier) are not modeled.",
      failCriteria:
        "Presents findings as certain. No alternative explanation considered. Does not acknowledge that the data shows the symptom but not the underlying cause inside Zhonghe.",
    },
  },
  hiddenStory: `The data tells this story in order:
1. The overall on-time delivery rate dropped 91% to 79% — looks like a market-wide issue at first glance.
2. Breaking down on-time delivery by supplier reveals one outlier: Zhonghe Industrial at ~52% on-time post-August 2025 (was 87% before). Every other supplier is steady at 86-94%.
3. Quality rejection by supplier confirms it: Zhonghe at ~11% failure rate post-August 2025 vs ~2% for everyone else. The same supplier is the late one AND the quality one.
4. Lead time CV by supplier shows Zhonghe at 0.68 (3x the industry benchmark of 0.20) — totally unpredictable, forcing safety stock buildup.
5. Expediting concentration: Zhonghe accounts for ~41% of all expediting events despite being ~18% of PO volume.
6. The scorecard for Zhonghe shows a clean inflection at period 2025-08: on-time rate 0.87 → 0.52, quality rate 0.98 → 0.89, lead time 18 → 34 days. Grade B/C → D/F. Every metric breaks at the same month.
7. Financial impact: expediting costs $2.8M/yr, rework $1.1M/yr, stockout losses $4.2M/yr — total $8.1M cost vs $6.4M annual spend. The relationship is net-negative by $1.7M.
8. Three options: dual-source ($450K, 9mo payback, $3.6M 12mo benefit), exit ($1.2M, 18mo payback, $6.9M 24mo benefit), renegotiate with SLA penalties ($75K, 3mo payback, $1.1M 12mo benefit but no guarantee Zhonghe agrees).`,
};
