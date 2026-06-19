import { medcoreExercises } from "@/content/companies/medcore/exercises";
import { medcoreRubric } from "@/content/companies/medcore/rubric";
import { MEDCORE_SCENARIOS } from "@/content/companies/medcore/scenarios";
import { BriefingForm, type PartItem } from "@/components/exercise/BriefingForm";
import { BriefingGate } from "@/components/exercise/BriefingGate";
import { gateOrUpgrade } from "@/lib/auth/access";

const COMPANY = "medcore";

const PARTS: PartItem[] = [
  {
    letter: "1",
    name: "Diagnosis",
    body: "What did you find in the baseline data? Segment by payer, name the smoking gun, cite numbers.",
  },
  {
    letter: "2",
    name: "Intervention",
    body: "Which scenario did you test, and why? Quantify what changed vs. baseline.",
  },
  {
    letter: "3",
    name: "Decision",
    body: "What do you recommend to the CFO? Include cost, payback period, and trade-off accepted.",
  },
  {
    letter: "4",
    name: "Epistemic honesty",
    body: "What can you NOT confirm from this data? Name an alternative explanation worth checking.",
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
      moduleLabel="MedCore Health · Module 02"
      title="CEO Briefing — MedCore Revenue Cycle"
      intro="Board meeting in 2 weeks. 700–900 words. Four-part structure below. Cite the queries that support each point — that may be the numbered exercises, or any saved query you ran yourself. The best briefings often include original analysis."
      parts={PARTS}
      exercises={medcoreExercises.map((e) => ({ id: e.id, title: e.title }))}
      scenarios={MEDCORE_SCENARIOS.map((s) => ({ id: s.id, shortLabel: s.shortLabel }))}
      rubricAxes={Object.values(medcoreRubric.axes).map((a) => ({
        name: a.name,
        maxScore: a.maxScore,
        passCriteria: a.passCriteria,
      }))}
      passingScore={medcoreRubric.passingScore}
    />
  );
}
