import { NextResponse } from "next/server";
import { novaPayRubric } from "@/content/companies/novapay/rubric";
import { medcoreRubric } from "@/content/companies/medcore/rubric";
import { supplylinkRubric } from "@/content/companies/supplylink/rubric";
import type { CompanyRubric } from "@/content/companies/novapay/rubric";

const RUBRIC_BY_COMPANY: Record<string, CompanyRubric> = {
  novapay: novaPayRubric,
  medcore: medcoreRubric,
  supplylink: supplylinkRubric,
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RequestBody {
  briefingText: string;
  companyId: string;
  wordCount?: number;
  exercisesCited?: number[];
  scenariosTested?: string[];
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
    epistemic_honesty: AxisGrade;
  };
  summary_feedback: string;
  enterprise_churn_found: boolean;
  currency_cause_found: boolean;
  arr_quantified: boolean;
  scenario_tested: boolean;
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
  const rubric = RUBRIC_BY_COMPANY[body.companyId];
  if (!rubric) {
    return NextResponse.json(
      { error: `Unsupported company: ${body.companyId}` },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      heuristicGrade(body.companyId, body.briefingText, body.scenariosTested ?? [])
    );
  }

  const prompt = buildPrompt(
    rubric,
    body.briefingText,
    body.exercisesCited ?? [],
    body.scenariosTested ?? []
  );

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
        max_tokens: 1800,
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
      return NextResponse.json(
        heuristicGrade(body.companyId, body.briefingText, body.scenariosTested ?? [])
      );
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

function buildPrompt(
  rubric: CompanyRubric,
  text: string,
  citations: number[],
  scenarios: string[]
): string {
  const rubricStr = Object.entries(rubric.axes)
    .map(
      ([k, v]) => `  - ${k} (${v.maxScore} pts)
    pass:  ${v.passCriteria}
    fail:  ${v.failCriteria}`
    )
    .join("\n");

  return `You are grading a CEO briefing memo for the ${rubric.companyLabel} business case.

THE HIDDEN STORY (do not show this to the student; use it only to grade):
${rubric.hiddenStory}

THE RUBRIC (each axis max 20 points; passing total = ${rubric.passingScore}):
${rubricStr}

THE STUDENT'S BRIEFING:
---
${text}
---

Exercises the student cites: ${citations.length === 0 ? "(none)" : citations.join(", ")}
Scenarios the student tested: ${scenarios.length === 0 ? "(none)" : scenarios.join(", ")}

Return ONLY a JSON object with this exact shape:
{
  "overall_score": <0-100>,
  "passed": <true|false>,
  "axes": {
    "segmentation":      { "score": <0-20>, "feedback": "<one sentence>" },
    "causal_reasoning":  { "score": <0-20>, "feedback": "<one sentence>" },
    "quantification":    { "score": <0-20>, "feedback": "<one sentence>" },
    "recommendation":    { "score": <0-20>, "feedback": "<one sentence>" },
    "epistemic_honesty": { "score": <0-20>, "feedback": "<one sentence>" }
  },
  "summary_feedback": "<2-3 sentences of overall feedback>",
  "enterprise_churn_found": <true|false>,
  "currency_cause_found": <true|false>,
  "arr_quantified": <true|false>,
  "scenario_tested": <true|false>
}

overall_score should equal the sum of the five axis scores.`;
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
function heuristicGrade(
  companyId: string,
  text: string,
  scenarios: string[]
): GradingResponse {
  const lower = text.toLowerCase();
  const has = (needles: string[]) => needles.some((n) => lower.includes(n));
  const numbers = (text.match(/\$?\d[\d,.]{1,}/g) ?? []).length;

  const isMedCore = companyId === "medcore";
  const isSupplyLink = companyId === "supplylink";

  // Per-company keyword cohorts
  let segmentation_pass: boolean;
  let causal_pass: boolean;
  let quant_pass: boolean;
  let reco_pass: boolean;

  if (isSupplyLink) {
    segmentation_pass =
      has(["zhonghe", "supplier", "monterrey", "bangalore", "rheinmetal"]) &&
      has(["late", "delivery", "on-time", "on time", "quality"]);
    causal_pass =
      has(["inflection", "month 15", "august", "aug 2025", "scorecard"]) &&
      has(["lead time", "quality", "on-time", "on time", "degradation", "degraded"]);
    quant_pass =
      numbers >= 2 &&
      has(["$8.1m", "$8.1 million", "8.1m", "expediting", "rework", "stockout", "cogs"]);
    reco_pass =
      has(["recommend", "dual-source", "exit", "renegotiate", "transition"]) &&
      has(["zhonghe", "payback", "$450k", "$1.2m"]);
  } else if (isMedCore) {
    segmentation_pass =
      has(["payer", "midstate", "mutual", "bluesheild", "blueshield", "united", "aetna"]) &&
      has(["denial", "claim"]);
    causal_pass =
      has(["authorization", "prior auth", "co-97", "policy", "rule change"]) &&
      has(["6 months", "last six", "spike", "inflection"]);
    quant_pass =
      numbers >= 2 &&
      has(["$2.4m", "2.4 million", "$2,400,000", "revenue at risk", "annualized"]);
    reco_pass =
      has(["recommend", "renegotiate", "pivot"]) &&
      has(["midstate", "contract", "volume"]);
  } else {
    segmentation_pass =
      has(["enterprise", "smb", "mid-market", "segment"]) &&
      has(["churn", "retention"]);
    causal_pass = has(["currency", "fx", "multi-currency"]) && has(["ticket", "support"]);
    quant_pass = numbers >= 2 && has(["arr", "mrr", "$"]);
    reco_pass =
      has(["recommend", "ship", "build"]) &&
      has(["multi-currency", "currency support", "fx"]);
  }

  const honesty_pass =
    has([
      "cannot",
      "can't",
      "do not know",
      "don't know",
      "uncertain",
      "limitation",
      "caveat",
      "would need",
      "would like",
    ]) ||
    has(["correlation is not causation", "synthetic", "not yet"]);

  const pickFeedback = <T,>(supply: T, med: T, nova: T): T =>
    isSupplyLink ? supply : isMedCore ? med : nova;

  const segmentation: AxisGrade = segmentation_pass
    ? {
        score: 17,
        feedback: pickFeedback(
          "Identifies Zhonghe Industrial as the outlier supplier.",
          "Identifies MidState Mutual as the outlier payer.",
          "Segments churn by tier and identifies enterprise as the risk."
        ),
      }
    : {
        score: 9,
        feedback: pickFeedback(
          "Reports a blended on-time rate. Break it down by supplier.",
          "Reports an aggregate denial rate. Break it down by payer.",
          "Treats churn as a blended rate. Segment by tier."
        ),
      };

  const causal_reasoning: AxisGrade = causal_pass
    ? {
        score: 16,
        feedback: pickFeedback(
          "Connects the August 2025 inflection in Zhonghe's scorecard to simultaneous degradation in on-time, quality, and lead time.",
          "Connects authorization-denial spike to a payer policy change in the last 6 months.",
          "Connects currency support to enterprise churn."
        ),
      }
    : {
        score: 7,
        feedback: pickFeedback(
          "Does not link the late-delivery rise to the month-15 inflection or to a specific supplier's scorecard arc.",
          "Does not link the denial spike to the last-6-month inflection or to authorization category.",
          "Does not establish a causal link between support tickets and churn."
        ),
      };

  const quantification: AxisGrade = quant_pass
    ? {
        score: 15,
        feedback: pickFeedback(
          "Quantifies the $8.1M cost of the Zhonghe relationship with a derivation.",
          "Quantifies the $2.4M revenue at risk with a calculation method.",
          "Cites specific numbers and quantifies ARR at risk."
        ),
      }
    : {
        score: 8,
        feedback: pickFeedback(
          "Add specific numbers — expediting cost, rework cost, stockout impact, total vs annual spend.",
          "Add specific numbers — denied dollars, annualized at-risk, net collection delta.",
          "Add specific numbers — ARR at risk, % revenue, churn delta."
        ),
      };

  const reco_with_scenario =
    reco_pass &&
    (scenarios.includes("scenario-a") || scenarios.includes("scenario-b"));
  const recommendation: AxisGrade = reco_with_scenario
    ? {
        score: 16,
        feedback: pickFeedback(
          "Recommends dual-source or exit and ties it to a scenario you tested.",
          "Recommends renegotiate or pivot and ties it to a scenario you tested.",
          "Recommends multi-currency and ties it to a scenario you tested."
        ),
      }
    : reco_pass
      ? { score: 12, feedback: "Recommendation present; test a scenario to back it with the data." }
      : {
          score: 7,
          feedback: pickFeedback(
            "Recommendation is generic; specify cost ($450K vs $1.2M), payback, and scenario tested.",
            "Recommendation is generic; specify cost ($150K vs $800K), payback, and scenario tested.",
            "Recommendation is generic; specify scope, cost, payback, and scenario tested."
          ),
        };

  const epistemic_honesty: AxisGrade = honesty_pass
    ? { score: 16, feedback: "Acknowledges at least one open question or data limit." }
    : { score: 6, feedback: "Presents every finding as certain. Name one thing the data cannot tell you." };

  const overall =
    segmentation.score +
    causal_reasoning.score +
    quantification.score +
    recommendation.score +
    epistemic_honesty.score;

  const rubric = RUBRIC_BY_COMPANY[companyId] ?? novaPayRubric;
  const passingScore = rubric.passingScore;
  const passSummary = pickFeedback(
    "Solid briefing. You isolated Zhonghe Industrial as the outlier, identified the August 2025 inflection across all four scorecard metrics, and quantified the $8.1M cost of the relationship. Tighten the recommendation with payback math next time.",
    "Solid briefing. You isolated MidState Mutual as the outlier payer, linked the denial spike to an authorization-rule change, and quantified the $2.4M at risk. Tighten the recommendation with payback math next time.",
    "Solid briefing. You identified the segmented churn risk, connected currency support to enterprise loss, and named an open question. Tighten the recommendation with a payback ratio next time."
  );
  const failSummary = pickFeedback(
    "The briefing reports a blended on-time rate but misses the supplier-level signal. Break delivery and quality by supplier, look at the scorecard arc for any inflection point, quantify the cost of the worst supplier vs their annual spend, test a scenario, and name an alternative explanation.",
    "The briefing reports an overall denial rate but misses the payer-level signal. Break denials down by payer, check the last-6-month period against the prior 18, look at appeal-overturn rates, quantify revenue at risk in dollars, test a scenario, and name an alternative explanation.",
    "The briefing reports growth but misses the enterprise churn signal. Re-segment churn, link currency tickets to it, quantify ARR at risk over 12 months, test a scenario, and name what you cannot yet confirm."
  );

  return {
    overall_score: overall,
    passed: overall >= passingScore,
    axes: {
      segmentation,
      causal_reasoning,
      quantification,
      recommendation,
      epistemic_honesty,
    },
    summary_feedback: overall >= passingScore ? passSummary : failSummary,
    enterprise_churn_found: segmentation_pass && causal_pass,
    currency_cause_found: causal_pass,
    arr_quantified: quant_pass,
    scenario_tested:
      scenarios.includes("scenario-a") || scenarios.includes("scenario-b"),
  };
}
