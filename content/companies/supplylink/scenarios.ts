import type { ScenarioMeta } from "../novapay/scenarios";

export const SUPPLYLINK_SCENARIOS: ScenarioMeta[] = [
  {
    id: "baseline",
    label: "Baseline — diagnose the problem",
    shortLabel: "Baseline",
    description:
      "On-time delivery dropped 91% to 79%. COGS up 11 points. Find the supplier that broke and prove it before the board meeting.",
    studentRole: "Diagnose",
  },
  {
    id: "scenario-a",
    label: "Scenario A — Dual-source Zhonghe with Monterrey Precision",
    shortLabel: "A: Dual-source",
    description:
      "Qualify Monterrey Precision as backup for 50% of Zhonghe volume. Late delivery rate cut in half, quality failures halved. $450K transition cost, 9-month payback. Verify the recovery on the data.",
    studentRole: "Quantify ROI",
  },
  {
    id: "scenario-b",
    label: "Scenario B — Exit Zhonghe entirely",
    shortLabel: "B: Exit Zhonghe",
    description:
      "Qualify Seoul Components and Hanoi Precision to absorb all Zhonghe volume. Higher transition cost ($1.2M), longer payback (18 months), but the cleanest long-term outcome. Compare against the dual-source approach.",
    studentRole: "Compare strategic options",
  },
];
