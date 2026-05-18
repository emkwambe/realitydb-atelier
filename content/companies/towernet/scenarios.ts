import type { ScenarioMeta } from "../novapay/scenarios";

export const TOWERNET_SCENARIOS: ScenarioMeta[] = [
  {
    id: "baseline",
    label: "Baseline — diagnose the problem",
    shortLabel: "Baseline",
    description:
      "Subscriber growth stalled, churn jumped from 2.1% to 2.9% in one region. Find the tower before the investor call.",
    studentRole: "Diagnose",
  },
  {
    id: "scenario-a",
    label: "Scenario A — Emergency tower maintenance",
    shortLabel: "A: Maintenance",
    description:
      "Fast-track SE-447 cluster maintenance — $2.1M capex. Outages stop, uptime returns to 99.8%, SE-447 churn drops 6.2% → 2.3%, 60% of churned subscribers reactivate. Payback 23.7 months.",
    studentRole: "Quantify ROI",
  },
  {
    id: "scenario-b",
    label: "Scenario B — Proactive retention credits",
    shortLabel: "B: Retention credits",
    description:
      "$1.8M in 3-month bill credits to SE-447 area subscribers. 40% accept and stay; network stays broken. Cheaper upfront, but the root cause is unaddressed — churn will resume after the credits expire.",
    studentRole: "Compare strategic options",
  },
];
