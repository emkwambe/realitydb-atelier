import type { ScenarioMeta } from "../novapay/scenarios";

export const MEDCORE_SCENARIOS: ScenarioMeta[] = [
  {
    id: "baseline",
    label: "Baseline — diagnose the problem",
    shortLabel: "Baseline",
    description:
      "Net collection rate dropped 4 points in the last two quarters. Query the data and find out why before the board meeting.",
    studentRole: "Diagnose",
  },
  {
    id: "scenario-a",
    label: "Scenario A — Contract renegotiated",
    shortLabel: "A: Renegotiate",
    description:
      "We took the data to MidState Mutual and renegotiated. Authorization denials reclassified to paid, underpayment rate drops to industry baseline. Cost: $150K. Verify the recovery is real.",
    studentRole: "Quantify ROI",
  },
  {
    id: "scenario-b",
    label: "Scenario B — Volume pivot",
    shortLabel: "B: Volume pivot",
    description:
      "We stopped sending elective cases to MidState and rerouted to BlueShield Premier and United Health Plan. MidState volume drops 60%. Short-term revenue dips, long-term denial rate improves. Evaluate the trade.",
    studentRole: "Compare strategic options",
  },
];
