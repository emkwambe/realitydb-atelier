import { clearbankExercises } from "@/content/companies/clearbank/exercises";
import { clearbankRubric } from "@/content/companies/clearbank/rubric";
import { CLEARBANK_SCENARIOS } from "@/content/companies/clearbank/scenarios";
import { BriefingForm, type PartItem } from "@/components/exercise/BriefingForm";
import { BriefingGate } from "@/components/exercise/BriefingGate";
import { gateOrUpgrade } from "@/lib/auth/access";

const COMPANY = "clearbank";

const PARTS: PartItem[] = [
  {
    letter: "1",
    name: "Diagnosis",
    body: "What pattern did you find in the wire data? Name the three accounts, the regulatory basis, and the evidence.",
  },
  {
    letter: "2",
    name: "Intervention",
    body: "Which scenario did you test, and what changed? File-SAR vs enhanced-monitoring.",
  },
  {
    letter: "3",
    name: "Decision",
    body: "What do you recommend to the CCO? Cite the regulation, the timeline, and the escalation path.",
  },
  {
    letter: "4",
    name: "Epistemic honesty",
    body: "What alternative explanations exist, and what additional documentation would resolve them before the SAR decision?",
  },
];

export default async function BriefingPage() {
  const gate = await gateOrUpgrade(COMPANY, "advanced");
  if (!gate.allowed) {
    return (
      <BriefingGate
        company={COMPANY}
        reason={gate.reason}
        upgradeHref={gate.upgradeHref ?? "/pricing"}
      />
    );
  }

  return (
    <BriefingForm
      company={COMPANY}
      moduleLabel="ClearBank Financial · Module 05"
      title="SAR Recommendation Memo — ClearBank CCO"
      intro="FinCEN exam in 60 days. 700–900 words. Four-part structure below. Cite specific exercises, name the regulatory basis (BSA 31 USC 5324, 31 CFR 1020.320), and quantify the regulatory exposure."
      parts={PARTS}
      exercises={clearbankExercises.map((e) => ({ id: e.id, title: e.title }))}
      scenarios={CLEARBANK_SCENARIOS.map((s) => ({ id: s.id, shortLabel: s.shortLabel }))}
      rubricAxes={Object.values(clearbankRubric.axes).map((a) => ({
        name: a.name,
        maxScore: a.maxScore,
        passCriteria: a.passCriteria,
      }))}
      passingScore={clearbankRubric.passingScore}
    />
  );
}
