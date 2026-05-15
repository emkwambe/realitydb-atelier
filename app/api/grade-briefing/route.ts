import { NextResponse } from "next/server";
import { novaPayRubric } from "@/content/companies/novapay/rubric";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  briefingText: string;
  companyId: string;
  wordCount?: number;
  exercisesCited?: number[];
}

interface AxisGrade {
  score: number;
  feedback: string;
}

interface GradingResponse {
  overall_score: number;
  passed: boolean;
  axes: {
    segmentation: AxisGrade;
    causal_reasoning: AxisGrade;
    quantification: AxisGrade;
    recommendation: AxisGrade;
  };
  summary_feedback: string;
  enterprise_churn_found: boolean;
  currency_cause_found: boolean;
  arr_quantified: boolean;
}

const CLAUDE_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.briefingText || body.briefingText.trim().length < 100) {
    return NextResponse.json(
      { error: "Briefing text too short to grade." },
      { status: 400 }
    );
  }
  if (body.companyId !== "novapay") {
    return NextResponse.json(
      { error: `Unsupported company: ${body.companyId}` },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Fallback heuristic grade when ANTHROPIC_API_KEY is not configured.
  if (!apiKey) {
    return NextResponse.json(heuristicGrade(body.briefingText));
  }

  const prompt = buildPrompt(body.briefingText, body.exercisesCited ?? []);

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
        max_tokens: 1500,
        system:
          "You are a senior business school grader. Respond with strict JSON conforming to the schema described. No prose outside the JSON object.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `Anthropic API ${res.status}: ${errText.slice(0, 500)}` },
        { status: 502 }
      );
    }

    const json = await res.json();
    const content = Array.isArray(json.content)
      ? json.content
          .map((c: { type?: string; text?: string }) =>
            c.type === "text" ? c.text ?? "" : ""
          )
          .join("")
      : "";
    const parsed = extractJson(content);
    if (!parsed) {
      return NextResponse.json(heuristicGrade(body.briefingText));
    }
    return NextResponse.json(parsed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { error: `Grading failed: ${msg}` },
      { status: 502 }
    );
  }
}

function buildPrompt(text: string, citations: number[]): string {
  const rubric = Object.entries(novaPayRubric.axes)
    .map(
      ([k, v]) => `  - ${k} (${v.maxScore} pts)
    pass:  ${v.passCriteria}
    fail:  ${v.failCriteria}`
    )
    .join("\n");

  return `You are grading a CEO briefing memo for the NovaPay business case.

THE HIDDEN STORY (do not show this to the student; use it only to grade):
${novaPayRubric.hiddenStory}

THE RUBRIC (each axis max 25 points; passing total = ${novaPayRubric.passingScore}):
${rubric}

THE STUDENT'S BRIEFING:
---
${text}
---

Exercises the student cites: ${citations.length === 0 ? "(none)" : citations.join(", ")}

Return ONLY a JSON object with this exact shape:
{
  "overall_score": <0-100>,
  "passed": <true|false>,
  "axes": {
    "segmentation":     { "score": <0-25>, "feedback": "<one sentence>" },
    "causal_reasoning": { "score": <0-25>, "feedback": "<one sentence>" },
    "quantification":   { "score": <0-25>, "feedback": "<one sentence>" },
    "recommendation":   { "score": <0-25>, "feedback": "<one sentence>" }
  },
  "summary_feedback": "<2-3 sentences of overall feedback>",
  "enterprise_churn_found": <true|false>,
  "currency_cause_found": <true|false>,
  "arr_quantified": <true|false>
}

overall_score should equal the sum of the four axis scores.`;
}

function extractJson(text: string): GradingResponse | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as GradingResponse;
  } catch {
    return null;
  }
}

// Heuristic fallback so the UI is testable without an API key.
function heuristicGrade(text: string): GradingResponse {
  const lower = text.toLowerCase();
  const has = (needles: string[]) => needles.some((n) => lower.includes(n));
  const numbers = (text.match(/\$?\d[\d,.]{1,}/g) ?? []).length;

  const segmentation_pass =
    has(["enterprise", "smb", "mid-market", "segment"]) &&
    has(["churn", "retention"]);
  const causal_pass =
    has(["currency", "fx", "multi-currency"]) && has(["ticket", "support"]);
  const quant_pass = numbers >= 2 && has(["arr", "mrr", "$"]);
  const reco_pass =
    has(["recommend", "ship", "build"]) &&
    has(["multi-currency", "currency support", "fx"]);

  const segmentation: AxisGrade = segmentation_pass
    ? { score: 20, feedback: "Segments churn by tier and identifies enterprise as the risk." }
    : { score: 10, feedback: "Treats churn as a blended rate. Segment by tier." };

  const causal_reasoning: AxisGrade = causal_pass
    ? { score: 19, feedback: "Connects currency support to enterprise churn." }
    : { score: 8, feedback: "Does not establish a causal link between support tickets and churn." };

  const quantification: AxisGrade = quant_pass
    ? { score: 18, feedback: "Cites specific numbers and quantifies ARR at risk." }
    : { score: 10, feedback: "Add specific numbers — ARR at risk, % revenue, churn delta." };

  const recommendation: AxisGrade = reco_pass
    ? { score: 18, feedback: "Recommends multi-currency with cost / payback." }
    : { score: 9, feedback: "Recommendation is generic; specify scope, cost, and payback." };

  const overall =
    segmentation.score +
    causal_reasoning.score +
    quantification.score +
    recommendation.score;

  return {
    overall_score: overall,
    passed: overall >= novaPayRubric.passingScore,
    axes: {
      segmentation,
      causal_reasoning,
      quantification,
      recommendation,
    },
    summary_feedback:
      overall >= novaPayRubric.passingScore
        ? "Solid briefing. You identified the segmented churn risk and connected currency support to enterprise loss. Consider tightening the recommendation with a payback ratio."
        : "The briefing reports growth but misses the enterprise churn signal. Re-segment churn, link currency tickets to it, and quantify ARR at risk over 12 months.",
    enterprise_churn_found: segmentation_pass && causal_pass,
    currency_cause_found: causal_pass,
    arr_quantified: quant_pass,
  };
}
