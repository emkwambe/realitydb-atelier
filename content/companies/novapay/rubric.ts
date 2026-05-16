export interface RubricAxis {
  name: string;
  maxScore: number;
  passCriteria: string;
  failCriteria: string;
}

export interface CompanyRubric {
  company: string;
  companyLabel: string;
  passingScore: number;
  axes: Record<string, RubricAxis>;
  hiddenStory: string;
}

// v1.5: 5 axes × 20 pts = 100 (was 4 × 25). The new axis — epistemic_honesty —
// rewards students who acknowledge what they cannot confirm. With scenario
// branching, "I tested X and it produced Y" is now provable; "I do not yet
// know Z because the data does not contain it" is what separates a careful
// analyst from a confidently wrong one.
export const novaPayRubric: CompanyRubric = {
  company: "novapay",
  companyLabel: "NovaPay",
  passingScore: 70,
  axes: {
    segmentation: {
      name: "Segmentation",
      maxScore: 20,
      passCriteria:
        "Briefing segments churn by tier (SMB / mid-market / enterprise) rather than reporting a single blended rate. Calls out that enterprise is the concentrated risk.",
      failCriteria:
        "Briefing reports only a blended churn rate or growth headline. Does not break the customer base into segments.",
    },
    causal_reasoning: {
      name: "Causal reasoning",
      maxScore: 20,
      passCriteria:
        "Links currency support tickets to enterprise churn with a specific percentage. Compares churn rate for currency complainers vs. non-complainers.",
      failCriteria:
        "Mentions support tickets in passing but does not connect them causally to enterprise churn. No comparison group, no percentage.",
    },
    quantification: {
      name: "Quantification",
      maxScore: 20,
      passCriteria:
        "Quantifies ARR at risk over 12 months. Cites at least two specific numbers from the analysis (e.g. % of revenue from enterprise, $ ARR at risk, churn rate delta).",
      failCriteria:
        "Discusses the problem qualitatively. No dollar figure, no concrete projection.",
    },
    recommendation: {
      name: "Recommendation",
      maxScore: 20,
      passCriteria:
        "Recommends an intervention with cost estimate and payback period. Compares baseline to the scenario tested and quantifies the delta.",
      failCriteria:
        "Generic recommendation such as 'improve retention' or 'focus on enterprise'. No cost, no payback, no scenario comparison.",
    },
    epistemic_honesty: {
      name: "Epistemic honesty",
      maxScore: 20,
      passCriteria:
        "Names at least one specific thing the data cannot tell them and proposes how they would resolve it. Distinguishes correlation from causation. Acknowledges the limits of the scenario they tested.",
      failCriteria:
        "Presents every finding as certain. Does not acknowledge data limits, the gap between a synthetic intervention and a real one, or any open question.",
    },
  },
  hiddenStory: `The data tells this story in order:
1. NovaPay looks healthy on aggregate — 8% MoM growth, 1.4% blended churn.
2. Enterprise customers are 5% of customers but ~68% of active MRR.
3. Enterprise churn has risen from 1.1% to 3.2% over 18 months (board_metrics arc).
4. 64-80% of churned enterprise customers filed currency-related tickets in their final 90 days (smoking gun).
5. Enterprise customers without currency tickets churn at ~5%.
6. At current trajectory NovaPay loses ~$610K enterprise ARR in 12 months.
7. Multi-currency at ~$400K engineering cost pays back in under 8 months.
8. Scenario A (fix) drops enterprise churn to ~10%; Scenario B (SMB pivot) eliminates the ARR risk by exiting enterprise at the cost of 58% of revenue.`,
};
