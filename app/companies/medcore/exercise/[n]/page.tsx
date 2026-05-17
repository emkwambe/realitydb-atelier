"use client";

import { useParams, notFound } from "next/navigation";
import { medcoreExercises } from "@/content/companies/medcore/exercises";
import { ExerciseWorkbench } from "@/components/exercise/ExerciseWorkbench";

export default function ExercisePage() {
  const params = useParams<{ n: string }>();
  const n = Number(params?.n ?? "0");
  const exercise = medcoreExercises.find((ex) => ex.id === n);
  if (!exercise) notFound();

  return (
    <ExerciseWorkbench
      exercise={exercise!}
      exerciseNumber={n}
      totalExercises={medcoreExercises.length}
      hasNext={n < medcoreExercises.length}
      hasPrev={n > 1}
      company="medcore"
    />
  );
}
