import type { CompanyRubric } from "../novapay/rubric";

export const clearbankRubric: CompanyRubric = {
  company: "clearbank",
  companyLabel: "ClearBank Financial",
  passingScore: 70,
  axes: {
    segmentation: {
      name: "Segmentation",
      maxScore: 20,
      passCriteria:
        "Identifies the three accounts as a coordinated network — not a single suspicious account in isolation. Names the layering relationship (ACT-A receives, ACT-B/C forward to offshore) and the shared beneficial owner.",
      failCriteria:
        "Reports only one account as suspicious without identifying the relationship between all three. Treats the pattern as an isolated anomaly.",
    },
    causal_reasoning: {
      name: "Causal reasoning",
      maxScore: 20,
      passCriteria:
        "Correctly names the activity as structuring under BSA 31 USC 5324. Links sub-$9,500 wire amounts to deliberate CTR avoidance. Identifies the 48-hour velocity from ACT-A to ACT-B/C as layering. Cites the FinCEN CDD rule for the EDD failure.",
      failCriteria:
        "Describes unusual wire activity without naming the regulatory violation. Treats the sub-threshold pattern as coincidence rather than design.",
    },
    quantification: {
      name: "Quantification",
      maxScore: 20,
      passCriteria:
        "Quantifies the total structured amount ($3.2M+), the FinCEN civil money penalty range ($1M-$15M for willful BSA violations), and the relationship revenue at risk ($180K annually). Shows the arithmetic.",
      failCriteria:
        "Describes risk qualitatively. No dollar amount or no range cited.",
    },
    recommendation: {
      name: "Recommendation",
      maxScore: 20,
      passCriteria:
        "Recommends a specific action (file SAR OR enhanced monitoring) with regulatory citation (31 CFR 1020.320), the 30-day SAR filing requirement, and the escalation path (BSA Officer → Legal → Board). Notes the FinCEN exam timeline pressure.",
      failCriteria:
        "Generic recommendation to monitor or investigate the accounts. No regulatory citation, no specific timeline, no escalation path.",
    },
    epistemic_honesty: {
      name: "Epistemic honesty",
      maxScore: 20,
      passCriteria:
        "Acknowledges that the pattern COULD reflect legitimate business activity — a cash-intensive consulting practice or a legitimate offshore advisory firm. Recommends completing EDD and requesting source-of-funds documentation before final SAR decision. Notes the 60-day FinCEN exam creates time pressure that argues against deferring.",
      failCriteria:
        "Presents the structuring conclusion as certain without considering legitimate explanations or the need for additional documentation.",
    },
  },
  hiddenStory: `The data tells this story in order:
1. Aggregate wire volume looks ordinary at ClearBank — most SMB wires are under $50K, paid through major US correspondents.
2. Three business_checking accounts (opened 12-16 months ago) appear as outliers on outgoing wire count — roughly 100, 40, 40 wires versus the SMB average near 1.
3. Of those outgoing wires, 94%+ are below the $9,500 CTR threshold under BSA 31 USC 5324. That is structuring by definition.
4. The largest outlier (ACT-A) receives 8-12 large incoming wires averaging ~$87K each from major US banks (purpose: trade_payment or consulting_fees), and within 48 hours splits each into 8-12 sub-$9,500 outgoing wires.
5. The destinations of ACT-A's outgoing wires are ACT-B and ACT-C, two other accounts at the same bank — the layering step.
6. ACT-B and ACT-C in turn forward funds offshore: 100% of their outgoing wires go to KY (Cayman), CY (Cyprus), or PA (Panama) via Cayman National Bank, Bank of Cyprus, or Banistmo Panama.
7. The beneficial-owners table shows all three accounts share one owner name. The owner's country_of_residence is KY/CY/PA. id_verified is false. Ownership is 100% on each.
8. KYC EDD was requested 11 months ago. verification_status is still 'pending' or 'failed' on every EDD document. edd_completed_date is null. This is a CDD Final Rule violation in itself.
9. Six open fraud_alerts on the three accounts with severity='critical', alert_type='structuring' or 'unusual_wire_pattern'. Three SAR filings exist on the accounts in status='draft' with filed_date=null.
10. Total structured amount ~$3.2M. FinCEN exam in 60 days. Civil money penalty range $1M-$15M for willful BSA violations. Filing the SAR within the 30-day statutory window mitigates the principal regulatory exposure.`,
};
