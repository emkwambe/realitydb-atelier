"use client";

import { useParams, notFound } from "next/navigation";
import { towernetExercises } from "@/content/companies/towernet/exercises";
import { ExerciseWorkbench } from "@/components/exercise/ExerciseWorkbench";

export default function ExercisePage() {
  const params = useParams<{ n: string }>();
  const n = Number(params?.n ?? "0");
  const exercise = towernetExercises.find((ex) => ex.id === n);
  if (!exercise) notFound();

  return (
    <ExerciseWorkbench
      exercise={exercise!}
      exerciseNumber={n}
      totalExercises={towernetExercises.length}
      hasNext={n < towernetExercises.length}
      hasPrev={n > 1}
      company="towernet"
    />
  );
}
