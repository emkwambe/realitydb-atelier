import { towernetExercises } from "@/content/companies/towernet/exercises";
import { towernetRubric } from "@/content/companies/towernet/rubric";
import { TOWERNET_SCENARIOS } from "@/content/companies/towernet/scenarios";
import { BriefingForm, type PartItem } from "@/components/exercise/BriefingForm";
import { BriefingGate } from "@/components/exercise/BriefingGate";
import { gateOrUpgrade } from "@/lib/auth/access";

const COMPANY = "towernet";

const PARTS: PartItem[] = [
  {
    letter: "1",
    name: "Diagnosis",
    body: "What did you find in the baseline data? Segment to the tower level, name the outlier, cite numbers.",
  },
  {
    letter: "2",
    name: "Intervention",
    body: "Which scenario did you test, and why? Quantify what changed vs. baseline.",
  },
  {
    letter: "3",
    name: "Decision",
    body: "What do you recommend to the board? Include capex, payback period, and the trade-off you accept.",
  },
  {
    letter: "4",
    name: "Epistemic honesty",
    body: "What can you NOT confirm from the data alone? Name an alternative explanation worth checking.",
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
      moduleLabel="TowerNet Communications · Module 04"
      title="CEO Briefing — TowerNet Investor Call"
      intro="Board meeting in 2 weeks. 700–900 words. Four-part structure below. Cite the queries that support each point — that may be the numbered exercises, or any saved query you ran yourself. The best briefings often include original analysis."
      parts={PARTS}
      exercises={towernetExercises.map((e) => ({ id: e.id, title: e.title }))}
      scenarios={TOWERNET_SCENARIOS.map((s) => ({ id: s.id, shortLabel: s.shortLabel }))}
      rubricAxes={Object.values(towernetRubric.axes).map((a) => ({
        name: a.name,
        maxScore: a.maxScore,
        passCriteria: a.passCriteria,
      }))}
      passingScore={towernetRubric.passingScore}
    />
  );
}
