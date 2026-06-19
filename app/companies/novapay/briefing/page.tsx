import { novaPayExercises } from "@/content/companies/novapay/exercises";
import { novaPayRubric } from "@/content/companies/novapay/rubric";
import { NOVAPAY_SCENARIOS } from "@/content/companies/novapay/scenarios";
import { BriefingForm, type PartItem } from "@/components/exercise/BriefingForm";
import { BriefingGate } from "@/components/exercise/BriefingGate";
import { gateOrUpgrade } from "@/lib/auth/access";

const COMPANY = "novapay";

const PARTS: PartItem[] = [
  {
    letter: "1",
    name: "Diagnosis",
    body: "What did you find in the baseline data? Segment by tier, name the smoking gun, cite numbers.",
  },
  {
    letter: "2",
    name: "Intervention",
    body: "Which scenario did you test, and why that one? Quantify what changed vs. baseline.",
  },
  {
    letter: "3",
    name: "Decision",
    body: "What do you recommend? Include cost, payback period, and the trade-off you accept.",
  },
  {
    letter: "4",
    name: "Epistemic honesty",
    body: "What can you NOT confirm from this data? How would you resolve it before betting the company?",
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
      moduleLabel="NovaPay · Module 01"
      title="CEO Briefing — NovaPay Series B"
      intro="Board meeting in 2 weeks. 700–900 words. Four-part structure below. Cite the queries that support each point — that may be the numbered exercises, or any saved query you ran yourself. The best briefings often include original analysis."
      parts={PARTS}
      exercises={novaPayExercises.map((e) => ({ id: e.id, title: e.title }))}
      scenarios={NOVAPAY_SCENARIOS.map((s) => ({ id: s.id, shortLabel: s.shortLabel }))}
      rubricAxes={Object.values(novaPayRubric.axes).map((a) => ({
        name: a.name,
        maxScore: a.maxScore,
        passCriteria: a.passCriteria,
      }))}
      passingScore={novaPayRubric.passingScore}
    />
  );
}
