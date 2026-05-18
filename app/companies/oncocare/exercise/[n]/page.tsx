"use client";

import { useParams, notFound } from "next/navigation";
import { oncocareExercises } from "@/content/companies/oncocare/exercises";
import { ExerciseWorkbench } from "@/components/exercise/ExerciseWorkbench";

export default function ExercisePage() {
  const params = useParams<{ n: string }>();
  const n = Number(params?.n ?? "0");
  const exercise = oncocareExercises.find((ex) => ex.id === n);
  if (!exercise) notFound();

  return (
    <ExerciseWorkbench
      exercise={exercise!}
      exerciseNumber={n}
      totalExercises={oncocareExercises.length}
      hasNext={n < oncocareExercises.length}
      hasPrev={n > 1}
      company="oncocare"
    />
  );
}
