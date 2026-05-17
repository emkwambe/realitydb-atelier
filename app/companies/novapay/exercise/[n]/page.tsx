"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { novaPayExercises } from "@/content/companies/novapay/exercises";
import { ExerciseWorkbench } from "@/components/exercise/ExerciseWorkbench";

export default function ExercisePage() {
  const params = useParams<{ n: string }>();
  const n = Number(params?.n ?? "0");
  const exercise = novaPayExercises.find((ex) => ex.id === n);
  if (!exercise) notFound();

  return (
    <ExerciseWorkbench
      exercise={exercise!}
      exerciseNumber={n}
      totalExercises={novaPayExercises.length}
      hasNext={n < novaPayExercises.length}
      hasPrev={n > 1}
      company="novapay"
    />
  );
}
