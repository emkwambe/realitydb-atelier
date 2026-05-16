import type { DatasetVariant } from "@/lib/pglite";

export interface ScenarioMeta {
  id: DatasetVariant;
  label: string;
  shortLabel: string;
  description: string;
  studentRole: string;
}

export const NOVAPAY_SCENARIOS: ScenarioMeta[] = [
  {
    id: "baseline",
    label: "Baseline — diagnose the problem",
    shortLabel: "Baseline",
    description:
      "The world as it is today. Enterprise churn is rising and you don't yet know why. Query the data and form a hypothesis.",
    studentRole: "Diagnose",
  },
  {
    id: "scenario-a",
    label: "Scenario A — multi-currency fix",
    shortLabel: "A: Multi-currency",
    description:
      "Engineering ships multi-currency in Q3. Most churned enterprise customers come back; currency complaints disappear; active enterprise expands. Test whether the fix is worth ~$400K.",
    studentRole: "Quantify ROI",
  },
  {
    id: "scenario-b",
    label: "Scenario B — SMB-only pivot",
    shortLabel: "B: SMB pivot",
    description:
      "All enterprise customers are sunset. SMB support burden drops, churn improves, but you lose 58% of revenue overnight. Evaluate the alternative.",
    studentRole: "Compare strategic options",
  },
];
