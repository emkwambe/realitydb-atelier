// Hot Cases content loader + types. Server-only — these JSON files ship with
// the build, not via the network. Module-level cache keeps lookups O(1).
//
// Naming canon (SOT §8): Hot Case, hot_cases table, /hot-cases routes,
// hot-case-pack.json filename. Never "brief" / "Weekly Brief".

import { promises as fs } from "node:fs";
import path from "node:path";

export interface HotCaseExercise {
  id: number;
  title: string;
  question: string;
  hint?: string;
  tags?: string[];
  referenceSQL?: string;
}

export interface HotCaseRubric {
  pattern_detection: string;
  quantification: string;
  recommendation_specificity: string;
}

export interface HotCaseContent {
  slug: string;
  title: string;
  vertical: string;
  primary_dimension: string;
  secondary_dimension: string;
  pattern_id: string;
  context: string;
  hidden_crisis: string; // Used by the grader prompt — never exposed to UI
  dataset_company: string; // Which company-module dataset powers the workbench
  exercises: HotCaseExercise[];
  briefing_prompt: string;
  grading_rubric: HotCaseRubric;
}

const HOT_CASES_DIR = path.join(process.cwd(), "content", "hot-cases");

// Module-level cache so we read each JSON file at most once per server instance.
const cache = new Map<string, HotCaseContent>();

export async function loadHotCase(slug: string): Promise<HotCaseContent | null> {
  if (cache.has(slug)) return cache.get(slug)!;
  const file = path.join(HOT_CASES_DIR, `${slug}.json`);
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as HotCaseContent;
    cache.set(slug, parsed);
    return parsed;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
}

// Strip server-only fields before sending to client components.
export type HotCaseClientView = Omit<HotCaseContent, "hidden_crisis">;

export function toClientView(content: HotCaseContent): HotCaseClientView {
  const { hidden_crisis: _hidden, ...client } = content;
  void _hidden;
  return client;
}
