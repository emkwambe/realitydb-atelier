import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadHotCase, toClientView } from "@/lib/hotCases";
import { HotCaseWorkbench } from "./_HotCaseWorkbench";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await loadHotCase(slug);
  if (!c) return { title: "Hot Case not found · Atelier" };
  return {
    title: `${c.title} — Exercise · Atelier`,
    description: c.context,
  };
}

export default async function HotCaseExercisePage({ params }: PageProps) {
  const { slug } = await params;
  const c = await loadHotCase(slug);
  if (!c) notFound();
  const hc = c!;

  return <HotCaseWorkbench content={toClientView(hc)} />;
}
