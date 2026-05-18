"use client";

import { useParams, notFound } from "next/navigation";
import { clearbankExercises } from "@/content/companies/clearbank/exercises";
import { ExerciseWorkbench } from "@/components/exercise/ExerciseWorkbench";

export default function ExercisePage() {
  const params = useParams<{ n: string }>();
  const n = Number(params?.n ?? "0");
  const exercise = clearbankExercises.find((ex) => ex.id === n);
  if (!exercise) notFound();

  return (
    <ExerciseWorkbench
      exercise={exercise!}
      exerciseNumber={n}
      totalExercises={clearbankExercises.length}
      hasNext={n < clearbankExercises.length}
      hasPrev={n > 1}
      company="clearbank"
    />
  );
}
