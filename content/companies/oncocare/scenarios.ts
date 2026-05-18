import type { ScenarioMeta } from "../novapay/scenarios";

export const ONCOCARE_SCENARIOS: ScenarioMeta[] = [
  {
    id: "baseline",
    label: "Baseline — investigate the interim",
    shortLabel: "Baseline",
    description:
      "DSMB flagged ORR at 49.8% — just below the FDA 50% accelerated-approval threshold. CMO needs the diagnosis before the FDA advisory meeting in 6 weeks.",
    studentRole: "Investigate",
  },
  {
    id: "scenario-a",
    label: "Scenario A — Exclude SITE-07 (per-protocol)",
    shortLabel: "A: Exclude SITE-07",
    description:
      "SITE-07 patients moved out of the primary analysis population; their week_16 response_assessments marked not_evaluable. ORR rises 49.8% → 54.1%, above the FDA threshold. DSMB switches to 'continue'. Risk: FDA may challenge post-hoc exclusion of 18% of enrolled patients.",
    studentRole: "Verify the recovery",
  },
  {
    id: "scenario-b",
    label: "Scenario B — Remediate SITE-07",
    shortLabel: "B: Remediate",
    description:
      "Future SITE-07 visits dose-corrected to 400mg (100% of protocol). Three new for_cause monitoring visits with elevated findings. Existing deviations marked retrain_staff. Historical ORR unchanged at 49.8% — sponsor demonstrates integrity but NDA timeline slips 6-12 months.",
    studentRole: "Compare integrity vs timeline",
  },
];
