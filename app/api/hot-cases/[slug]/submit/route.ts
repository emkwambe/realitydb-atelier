import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { loadHotCase } from "@/lib/hotCases";
import { getSupabaseAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_CHARS = 100;
const CLAUDE_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

interface SubmitBody {
  briefing_text?: string;
  email?: string | null;
}

interface AxisScores {
  pattern: number;
  quant: number;
  rec: number;
}

interface AxisFeedback {
  pattern: string;
  quant: string;
  rec: string;
}

interface GraderResponse {
  axes: AxisScores;
  feedback: AxisFeedback;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: SubmitBody;
  try {
    body = (await request.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (body.briefing_text ?? "").trim();
  if (text.length < MIN_CHARS) {
    return NextResponse.json(
      { error: `Briefing must be at least ${MIN_CHARS} characters.` },
      { status: 400 }
    );
  }

  const hot = await loadHotCase(slug);
  if (!hot) {
    return NextResponse.json({ error: "Hot Case not found" }, { status: 404 });
  }

  // Resolve current user (optional). Anonymous submissions are allowed iff
  // the body carries a valid email.
  const userId = await currentUserId();
  const email = body.email?.trim() ?? null;
  if (!userId && (!email || !/^\S+@\S+\.\S+$/.test(email))) {
    return NextResponse.json(
      { error: "Email is required when not signed in." },
      { status: 400 }
    );
  }

  const graded = await grade(hot.hidden_crisis, hot.grading_rubric, text);
  if (!graded) {
    return NextResponse.json(
      { error: "Grader unavailable. Try again in a minute." },
      { status: 502 }
    );
  }

  const safeAxes = {
    pattern: clamp(graded.axes.pattern, 0, 33),
    quant: clamp(graded.axes.quant, 0, 33),
    rec: clamp(graded.axes.rec, 0, 34),
  };
  const score = safeAxes.pattern + safeAxes.quant + safeAxes.rec;

  const admin = getSupabaseAdminClient();
  if (!admin) {
    // No Supabase configured — return the grade without persisting so the
    // local-dev flow stays usable.
    return NextResponse.json({
      submissionId: "local-dev",
      score,
      axes: safeAxes,
      feedback: graded.feedback,
      persisted: false,
    });
  }

  const { data, error } = await admin
    .from("hot_case_submissions")
    .insert({
      user_id: userId,
      email,
      hot_case_slug: slug,
      score,
      axes: { ...safeAxes, feedback: graded.feedback },
      briefing_text: text,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: `Failed to save submission: ${error?.message ?? "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    submissionId: data.id,
    score,
    axes: safeAxes,
    feedback: graded.feedback,
  });
}

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

async function currentUserId(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const store = await cookies();
    const sb = createServerClient(url, key, {
      cookies: {
        getAll: () => store.getAll(),
        setAll: () => {},
      },
    });
    const {
      data: { user },
    } = await sb.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

async function grade(
  hiddenCrisis: string,
  rubric: { pattern_detection: string; quantification: string; recommendation_specificity: string },
  text: string
): Promise<GraderResponse | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return heuristicGrade(text);

  const prompt = `You are grading a 4-bullet CEO briefing for an Atelier Hot Case.

HIDDEN CRISIS (do not reveal in feedback; use only to grade):
${hiddenCrisis}

THREE-AXIS RUBRIC (each axis defines what earns full marks):
- pattern (0-33): ${rubric.pattern_detection}
- quant   (0-33): ${rubric.quantification}
- rec     (0-34): ${rubric.recommendation_specificity}

STUDENT BRIEFING:
---
${text}
---

Score honestly. Do NOT reveal what the "correct" answer is in the feedback.
Phrase feedback as forward-looking guidance ("Tighten X", "Add Y") rather
than disclosing the hidden crisis. One sentence per axis.

Respond ONLY in this exact JSON shape — no prose:
{
  "axes":     { "pattern": <0-33>, "quant": <0-33>, "rec": <0-34> },
  "feedback": { "pattern": "<one sentence>", "quant": "<one sentence>", "rec": "<one sentence>" }
}`;

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 800,
        system:
          "You are an Atelier Hot Case grader. Respond with strict JSON conforming to the schema. No prose outside the JSON object. Never reveal the hidden crisis in feedback.",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return heuristicGrade(text);
    const json = await res.json();
    const content = Array.isArray(json.content)
      ? json.content
          .map((c: { type?: string; text?: string }) =>
            c.type === "text" ? c.text ?? "" : ""
          )
          .join("")
      : "";
    const parsed = extractJson(content);
    return parsed ?? heuristicGrade(text);
  } catch {
    return heuristicGrade(text);
  }
}

function extractJson(text: string): GraderResponse | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1)) as Partial<GraderResponse>;
    if (!obj.axes || !obj.feedback) return null;
    return {
      axes: {
        pattern: Number(obj.axes.pattern ?? 0),
        quant: Number(obj.axes.quant ?? 0),
        rec: Number(obj.axes.rec ?? 0),
      },
      feedback: {
        pattern: String(obj.feedback.pattern ?? ""),
        quant: String(obj.feedback.quant ?? ""),
        rec: String(obj.feedback.rec ?? ""),
      },
    };
  } catch {
    return null;
  }
}

// Heuristic fallback for local dev / API key missing. Gives a deterministic
// score so the briefing → results flow is testable end-to-end.
function heuristicGrade(text: string): GraderResponse {
  const lower = text.toLowerCase();
  const has = (needles: string[]) => needles.some((n) => lower.includes(n));
  const numbers = (text.match(/\$?\d[\d,.]{1,}/g) ?? []).length;

  // Cohort-collapse keyword heuristics — generic enough to work for v1.
  const patternHit =
    has(["cohort", "march", "feb", "february", "regression"]) &&
    has(["onboarding", "decay", "drop-off", "drop off"]);
  const quantHit = numbers >= 2 && has(["arr", "%", "$", "loss", "at risk"]);
  const recHit =
    has(["recommend", "rollback", "ramp", "freeze", "remediat"]) &&
    has(["onboarding", "experiment", "cohort"]);

  return {
    axes: {
      pattern: patternHit ? 24 : 11,
      quant: quantHit ? 24 : 10,
      rec: recHit ? 25 : 12,
    },
    feedback: {
      pattern: patternHit
        ? "Names the cohort that inflected and when."
        : "Segment retention by signup cohort and name the inflection month.",
      quant: quantHit
        ? "Quantifies the ARR at risk with at least one derivation."
        : "Add specific numbers — cohort size, retention delta, ARR at risk.",
      rec: recHit
        ? "Recommends a specific action tied to the cohort that broke."
        : "Recommendation is generic; tie it to the cohort that broke and propose a measurable rollback or freeze.",
    },
  };
}
