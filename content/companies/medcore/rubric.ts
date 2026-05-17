import type { CompanyRubric } from "../novapay/rubric";

export const medcoreRubric: CompanyRubric = {
  company: "medcore",
  companyLabel: "MedCore Health",
  passingScore: 70,
  axes: {
    segmentation: {
      name: "Segmentation",
      maxScore: 20,
      passCriteria:
        "Identifies MidState Mutual as an outlier payer with a denial-rate sharply above the other payers. Does not stop at a blended rate. Names the payer.",
      failCriteria:
        "Reports only an aggregate denial rate across all payers. Does not segment by payer or notice the outlier.",
    },
    causal_reasoning: {
      name: "Causal reasoning",
      maxScore: 20,
      passCriteria:
        "Links the authorization-denial spike specifically to the last 6 months and identifies it as a payer policy change rather than a coding issue. Uses appeal-overturn-rate evidence to support that the denials are wrong.",
      failCriteria:
        "Attributes the denial spike to internal coding problems without checking the temporal pattern or appeal outcomes. Treats correlation as causation.",
    },
    quantification: {
      name: "Quantification",
      maxScore: 20,
      passCriteria:
        "Quantifies revenue at risk ($2.4M annualized) and shows the calculation method (denied charges × annualization factor, or comparison panel reading).",
      failCriteria:
        "Describes the denial problem qualitatively. No dollar amount or no derivation shown.",
    },
    recommendation: {
      name: "Recommendation",
      maxScore: 20,
      passCriteria:
        "Recommends a specific action (renegotiate the MidState contract or pivot volume away from MidState) with cost, payback period, and 12-month net position. Compares the two options against each other and against doing nothing.",
      failCriteria:
        "Generic recommendation to 'improve denial management' without naming the payer, the cost, or the payback.",
    },
    epistemic_honesty: {
      name: "Epistemic honesty",
      maxScore: 20,
      passCriteria:
        "Acknowledges that the authorization-denial spike could also reflect a change in our own clinical documentation practices. Recommends reviewing a sample of denied claims with the clinical team before escalating to MidState Mutual. Names at least one unknown the data cannot resolve.",
      failCriteria:
        "Presents findings as certain. No alternative explanation considered. No data limit acknowledged.",
    },
  },
  hiddenStory: `The data tells this story in order:
1. The overall denial rate looks acceptable on paper but the trend is hidden in the blended number.
2. Segmenting by payer reveals MidState Mutual is the outlier — its denial rate is roughly 2x the band the other payers occupy.
3. Splitting by encounter_date (first 18mo vs last 6mo) shows MidState's rate jumped from ~15% to ~40% in the last 6 months; every other payer remains flat at 13-17%.
4. Joining denials shows the spike is concentrated in authorization denials (CO-97) — the signature of a prior-authorization rule change, not a coding mistake.
5. Appeals overturn rates corroborate: the denials are being overturned at a high rate when contested. The payer is wrong, not the hospital.
6. MidState also shows ~22% underpayment rate on paid claims vs ~8% for other payers — confirming a broader posture shift.
7. Annualized revenue at risk: $2.4M.
8. Two interventions worth modeling: renegotiate ($150K cost, ~1 month payback) vs pivot volume away from MidState ($800K short-term hit, ~$1.6M net 12-month benefit).`,
};
