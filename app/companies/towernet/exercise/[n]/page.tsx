import { notFound } from "next/navigation";
import { towernetExercises } from "@/content/companies/towernet/exercises";
import { ExerciseWorkbench } from "@/components/exercise/ExerciseWorkbench";
import { ExerciseGate } from "@/components/exercise/ExerciseGate";
import { gateOrUpgrade } from "@/lib/auth/access";

const COMPANY = "towernet";

interface PageProps {
  params: Promise<{ n: string }>;
}

export default async function ExercisePage({ params }: PageProps) {
  const { n: nRaw } = await params;
  const n = Number(nRaw);
  const exercise = towernetExercises.find((ex) => ex.id === n);
  if (!exercise) notFound();

  // Server-side gate: a denied exercise renders <ExerciseGate> and never
  // receives the exercise object, so referenceSQL/hint are not sent to it.
  const gate = await gateOrUpgrade(COMPANY, exercise.difficulty);
  if (!gate.allowed) {
    return (
      <ExerciseGate
        company={COMPANY}
        exerciseNumber={n}
        difficulty={exercise.difficulty}
        reason={gate.reason}
        upgradeHref={gate.upgradeHref ?? "/pricing"}
      />
    );
  }

  return (
    <ExerciseWorkbench
      exercise={exercise}
      exerciseNumber={n}
      totalExercises={towernetExercises.length}
      hasNext={n < towernetExercises.length}
      hasPrev={n > 1}
      company={COMPANY}
    />
  );
}
