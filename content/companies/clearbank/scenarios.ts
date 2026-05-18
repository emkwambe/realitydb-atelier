import type { ScenarioMeta } from "../novapay/scenarios";

export const CLEARBANK_SCENARIOS: ScenarioMeta[] = [
  {
    id: "baseline",
    label: "Baseline — investigate the alert",
    shortLabel: "Baseline",
    description:
      "FinCEN exam in 60 days. Three accounts flagged for unusual wire patterns. Determine whether this is structuring, layering, or a false positive before the examiner arrives.",
    studentRole: "Investigate",
  },
  {
    id: "scenario-a",
    label: "Scenario A — File SAR, freeze accounts",
    shortLabel: "A: File SAR",
    description:
      "Three accounts frozen, SAR filed under 31 CFR 1020.320, fraud alerts closed with disposition=filed_sar. Costs $180K annual relationship revenue. Mitigates up to $15M FinCEN civil money penalty exposure.",
    studentRole: "Verify the action",
  },
  {
    id: "scenario-b",
    label: "Scenario B — Enhanced monitoring, 30-day EDD",
    shortLabel: "B: Monitor + EDD",
    description:
      "Accounts under heightened monitoring. EDD request open (Level 3). SAR decision deferred. Cheaper short-term but risks late-SAR penalty if structuring continues — and the 30-day EDD window closes inside the 60-day FinCEN exam window.",
    studentRole: "Compare deferral risk",
  },
];
