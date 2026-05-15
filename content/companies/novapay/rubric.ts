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

export const novaPayRubric: CompanyRubric = {
  company: "novapay",
  companyLabel: "NovaPay",
  passingScore: 70,
  axes: {
    segmentation: {
      name: "Segmentation",
      maxScore: 25,
      passCriteria:
        "Briefing segments churn by tier (SMB / mid-market / enterprise) rather than reporting a single blended rate. Calls out that enterprise is the concentrated risk.",
      failCriteria:
        "Briefing reports only a blended churn rate or growth headline. Does not break the customer base into segments.",
    },
    causal_reasoning: {
      name: "Causal reasoning",
      maxScore: 25,
      passCriteria:
        "Links currency support tickets to enterprise churn with a specific percentage. Compares churn rate for currency complainers vs. non-complainers.",
      failCriteria:
        "Mentions support tickets in passing but does not connect them causally to enterprise churn. No comparison group, no percentage.",
    },
    quantification: {
      name: "Quantification",
      maxScore: 25,
      passCriteria:
        "Quantifies ARR at risk over 12 months. Cites at least two specific numbers from the analysis (e.g. % of revenue from enterprise, $ ARR at risk, churn rate delta).",
      failCriteria:
        "Discusses the problem qualitatively. No dollar figure, no concrete projection.",
    },
    recommendation: {
      name: "Recommendation",
      maxScore: 25,
      passCriteria:
        "Recommends multi-currency with a cost estimate and a payback period. Acknowledges one limitation of the analysis (epistemic honesty).",
      failCriteria:
        "Generic recommendation such as 'improve retention' or 'focus on enterprise'. No cost, no payback, no caveat.",
    },
  },
  hiddenStory: `The data tells this story in order:
1. NovaPay looks healthy on aggregate — 8% MoM growth, 1.4% blended churn.
2. Enterprise customers are 5% of customers but 58% of revenue.
3. Enterprise churn has risen from 1.1% to 3.2% over 6 months.
4. 64% of churned enterprise customers filed currency-related tickets in their final 90 days.
5. Enterprise customers without currency tickets churn at 2.1%.
6. At current trajectory NovaPay loses ~$610K enterprise ARR in 12 months — 29% of total ARR.
7. Multi-currency at ~$400K engineering cost pays back in under 18 months.`,
};
