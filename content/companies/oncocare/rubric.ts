import type { CompanyRubric } from "../novapay/rubric";

export const oncocareRubric: CompanyRubric = {
  company: "oncocare",
  companyLabel: "OncoCare Therapeutics",
  passingScore: 70,
  axes: {
    segmentation: {
      name: "Segmentation",
      maxScore: 20,
      passCriteria:
        "Identifies SITE-07 (Instituto do Cancer Sao Paulo) as the specific outlier. Quantifies its share of enrolled patients (~18%) and the response-rate gap (31% vs 54% at other sites).",
      failCriteria:
        "Reports only the overall trial response rate without identifying a site-level outlier.",
    },
    causal_reasoning: {
      name: "Causal reasoning",
      maxScore: 20,
      passCriteria:
        "Connects dose-modification deviations at SITE-07 to BOTH lower response rate AND milder adverse events. Names this as the underdosing signature: less drug → less efficacy → fewer side effects. Cites the 34% deviation rate and 85% dose-of-protocol.",
      failCriteria:
        "Attributes SITE-07 underperformance to patient population differences without examining dose adherence or the deviation data.",
    },
    quantification: {
      name: "Quantification",
      maxScore: 20,
      passCriteria:
        "Calculates the exact impact of SITE-07 exclusion: 49.8% → 54.1% response rate. Names the FDA 50% threshold and the 4.3 percentage-point drag attributable to SITE-07.",
      failCriteria:
        "Describes the site as underperforming without calculating its quantitative impact on the trial-level result.",
    },
    recommendation: {
      name: "Recommendation",
      maxScore: 20,
      passCriteria:
        "Recommends one option with specific justification: Option A (per-protocol exclusion of SITE-07) — NDA proceeds, FDA post-hoc-exclusion risk acknowledged. Option B (remediate) — protocol integrity preserved, 6-12 month NDA delay. Cites ICH E6 GCP and notes the 6-week FDA advisory meeting timeline.",
      failCriteria:
        "Generic recommendation to 'investigate SITE-07' without committing to a specific action, regulatory citation, or timeline.",
    },
    epistemic_honesty: {
      name: "Epistemic honesty",
      maxScore: 20,
      passCriteria:
        "Explicitly acknowledges that milder AEs at SITE-07 could mean EITHER underdosing OR a healthier patient population. Recommends a retrospective chart review and a blinded re-assessment of SITE-07 responses before presenting the exclusion rationale to the FDA.",
      failCriteria:
        "Presents underdosing as the certain explanation without acknowledging the alternative hypothesis or recommending additional data collection.",
    },
  },
  hiddenStory: `The data tells this story in order:
1. Overall response rate at week_16 is 49.8% — just below the FDA accelerated approval threshold of 50% for advanced NSCLC.
2. Response rate by site shows SITE-07 (Instituto do Cancer Sao Paulo) at ~31% while every other site clusters around 54%.
3. Protocol deviations by site show SITE-07 with a 34% deviation rate vs the 8% TransCelerate benchmark; 65% of SITE-07's deviations are dose_modification.
4. Dose adherence at SITE-07: avg 85% of protocol dose vs 98% elsewhere. Investigators reduced dose due to tolerability concerns that were never escalated.
5. Adverse events at SITE-07 are MILDER (grade 3+ rate 15% vs 30% elsewhere). This is the epistemic honesty moment — milder AEs could mean underdosing OR healthier patients.
6. Site monitoring visits at SITE-07: 40% for_cause vs 15% elsewhere; findings_count averages 13 vs 4. The sponsor's own monitors flagged this.
7. Latest interim_analyses: ORR=0.498, DSMB recommendation=request_additional_data.
8. Without SITE-07 (per-protocol population): ORR=54.1%, above FDA threshold.
9. Two options: exclude (NDA proceeds, FDA risk) vs remediate (integrity preserved, 6-12 month delay).`,
};
