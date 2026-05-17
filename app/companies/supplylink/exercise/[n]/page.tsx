"use client";

import { useParams, notFound } from "next/navigation";
import { supplylinkExercises } from "@/content/companies/supplylink/exercises";
import { ExerciseWorkbench } from "@/components/exercise/ExerciseWorkbench";

export default function ExercisePage() {
  const params = useParams<{ n: string }>();
  const n = Number(params?.n ?? "0");
  const exercise = supplylinkExercises.find((ex) => ex.id === n);
  if (!exercise) notFound();

  return (
    <ExerciseWorkbench
      exercise={exercise!}
      exerciseNumber={n}
      totalExercises={supplylinkExercises.length}
      hasNext={n < supplylinkExercises.length}
      hasPrev={n > 1}
      company="supplylink"
    />
  );
}
