import { oncocareExercises } from "@/content/companies/oncocare/exercises";
import { oncocareRubric } from "@/content/companies/oncocare/rubric";
import { ONCOCARE_SCENARIOS } from "@/content/companies/oncocare/scenarios";
import { BriefingForm, type PartItem } from "@/components/exercise/BriefingForm";
import { BriefingGate } from "@/components/exercise/BriefingGate";
import { gateOrUpgrade } from "@/lib/auth/access";

const COMPANY = "oncocare";

const PARTS: PartItem[] = [
  {
    letter: "1",
    name: "Diagnosis",
    body: "What did you find in the trial data? Which site is the outlier and what is the quantitative evidence?",
  },
  {
    letter: "2",
    name: "Intervention",
    body: "Which scenario did you test (exclude SITE-07 or remediate)? What changed when you applied it?",
  },
  {
    letter: "3",
    name: "Decision",
    body: "What do you recommend to the CMO? Cite the FDA threshold and the 6-week advisory timeline.",
  },
  {
    letter: "4",
    name: "Epistemic honesty",
    body: "What alternative explanations exist for SITE-07 underperformance? What additional data would confirm your conclusion?",
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
      moduleLabel="OncoCare Therapeutics · Module 06"
      title="CMO Recommendation Memo — ONC-441 Phase III"
      intro="FDA advisory meeting in 6 weeks. 700–900 words. Four-part structure below. Cite specific exercises, name the FDA 50% threshold and the ICH E6 GCP standard, and quantify the site-level impact on the trial-level result."
      parts={PARTS}
      exercises={oncocareExercises.map((e) => ({ id: e.id, title: e.title }))}
      scenarios={ONCOCARE_SCENARIOS.map((s) => ({ id: s.id, shortLabel: s.shortLabel }))}
      rubricAxes={Object.values(oncocareRubric.axes).map((a) => ({
        name: a.name,
        maxScore: a.maxScore,
        passCriteria: a.passCriteria,
      }))}
      passingScore={oncocareRubric.passingScore}
    />
  );
}
