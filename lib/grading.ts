import { runQuery, type QueryResult } from "./pglite";

export interface Exercise {
  id: number;
  title: string;
  businessQuestion: string;
  skills: string[];
  description: string;
  hint: string;
  referenceSQL: string;
  requiredColumns: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface SqlGrade {
  score: number;
  passed: boolean;
  feedback: string;
  result?: QueryResult;
}

// Score on three dimensions:
//  1. No error thrown       (30 pts)
//  2. Returns rows          (30 pts)
//  3. Required cols present (40 pts, prorated)
export async function gradeSQL(
  studentSQL: string,
  _referenceSQL: string,
  exercise: Pick<Exercise, "requiredColumns">
): Promise<SqlGrade> {
  const result = await runQuery(studentSQL);
  if (result.error) {
    return { score: 0, passed: false, feedback: result.error, result };
  }

  const cols = result.fields.map((f) => (f.name ?? "").toLowerCase());
  const required = (exercise.requiredColumns ?? []).map((c) => c.toLowerCase());
  const colMatch =
    required.length === 0
      ? 1
      : required.filter((c) => cols.includes(c)).length / required.length;

  const score = Math.round(
    30 + (result.rowCount > 0 ? 30 : 0) + colMatch * 40
  );

  const missing = required.filter((c) => !cols.includes(c));
  let feedback = `Returned ${result.rowCount} row(s) in ${result.duration}ms.`;
  if (missing.length > 0) {
    feedback += ` Missing required columns: ${missing.join(", ")}.`;
  }

  return { score, passed: score >= 70, feedback, result };
}
