import { NextResponse } from "next/server";
import { novaPayRubric } from "@/content/companies/novapay/rubric";
import { medcoreRubric } from "@/content/companies/medcore/rubric";
import { supplylinkRubric } from "@/content/companies/supplylink/rubric";
import { towernetRubric } from "@/content/companies/towernet/rubric";
import { clearbankRubric } from "@/content/companies/clearbank/rubric";
import { oncocareRubric } from "@/content/companies/oncocare/rubric";
import type { CompanyRubric } from "@/content/companies/novapay/rubric";

const RUBRIC_BY_COMPANY: Record<string, CompanyRubric> = {
  novapay: novaPayRubric,
  medcore: medcoreRubric,
  supplylink: supplylinkRubric,
  towernet: towernetRubric,
  clearbank: clearbankRubric,
  oncocare: oncocareRubric,
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
  const isTowerNet = companyId === "towernet";
  const isClearBank = companyId === "clearbank";
  const isOncoCare = companyId === "oncocare";

  // Per-company keyword cohorts
  let segmentation_pass: boolean;
  let causal_pass: boolean;
  let quant_pass: boolean;
  let reco_pass: boolean;

  if (isOncoCare) {
    segmentation_pass =
      has(["site-07", "site 7", "site7", "sao paulo", "outlier site"]) &&
      has(["response rate", "31%", "54%", "underperform"]);
    causal_pass =
      has(["underdos", "85%", "dose modification", "deviation"]) &&
      has(["adverse event", "grade 3", "milder", "fewer side effects", "less efficacy"]);
    quant_pass =
      numbers >= 2 &&
      has(["49.8%", "54.1%", "fda threshold", "50%", "4.3", "above threshold", "below threshold"]);
    reco_pass =
      has(["recommend", "exclude", "remediate", "per-protocol", "per protocol"]) &&
      has(["site-07", "site 7", "ich e6", "gcp", "6 weeks", "fda advisory"]);
  } else if (isClearBank) {
    segmentation_pass =
      has(["act-a", "act-b", "act-c", "three accounts", "network", "beneficial owner"]) &&
      has(["structuring", "layering", "sub-threshold", "sub-$9,500", "sub-9500"]);
    causal_pass =
      has(["31 usc 5324", "5324", "bsa", "31 cfr 1020.320", "1020.320", "ctr"]) &&
      has(["sub-$9,500", "sub-9500", "sub-threshold", "48 hours", "48-hour", "layering"]);
    quant_pass =
      numbers >= 2 &&
      has(["$3.2m", "$3,200,000", "$15m", "$1m-$15m", "$15 million", "fincen", "penalty"]);
    reco_pass =
      has(["recommend", "file sar", "sar", "enhanced monitoring", "edd", "freeze"]) &&
      has(["31 cfr", "1020.320", "30 days", "30-day", "5324"]);
  } else if (isTowerNet) {
    segmentation_pass =
      has(["se-447", "se447", "tower", "cluster"]) &&
      has(["churn", "subscriber", "outlier"]);
    causal_pass =
      has(["incident", "outage", "maintenance", "backlog", "uptime"]) &&
      has(["14", "8 months", "inflection", "spike", "correlat"]);
    quant_pass =
      numbers >= 2 &&
      has(["$1.58m", "1.58 million", "$1.58", "131,580", "arpu", "arr at risk", "annual"]);
    reco_pass =
      has(["recommend", "maintenance", "credits", "capex", "retention"]) &&
      has(["payback", "$2.1m", "$1.8m", "trade-off", "tradeoff"]);
  } else if (isSupplyLink) {
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

  const pickFeedback = <T,>(supply: T, med: T, nova: T, tower?: T, bank?: T, onco?: T): T =>
    isOncoCare && onco !== undefined
      ? onco
      : isClearBank && bank !== undefined
        ? bank
        : isTowerNet && tower !== undefined
          ? tower
          : isSupplyLink
            ? supply
            : isMedCore
              ? med
              : nova;

  const segmentation: AxisGrade = segmentation_pass
    ? {
        score: 17,
        feedback: pickFeedback(
          "Identifies Zhonghe Industrial as the outlier supplier.",
          "Identifies MidState Mutual as the outlier payer.",
          "Segments churn by tier and identifies enterprise as the risk.",
          "Drops past the regional aggregate to tower-level and identifies SE-447 as the outlier.",
          "Identifies the three flagged accounts as a coordinated network sharing one beneficial owner.",
          "Identifies SITE-07 (Sao Paulo) as the outlier site with 18% of patients and the 31% response rate."
        ),
      }
    : {
        score: 9,
        feedback: pickFeedback(
          "Reports a blended on-time rate. Break it down by supplier.",
          "Reports an aggregate denial rate. Break it down by payer.",
          "Treats churn as a blended rate. Segment by tier.",
          "Reports only regional churn. Drop one level deeper to the tower and name the outlier.",
          "Treats the alerts as isolated. Connect ACT-A/B/C through the shared beneficial owner.",
          "Reports only the trial-level response rate. Drop to the site level and name SITE-07."
        ),
      };

  const causal_reasoning: AxisGrade = causal_pass
    ? {
        score: 16,
        feedback: pickFeedback(
          "Connects the August 2025 inflection in Zhonghe's scorecard to simultaneous degradation in on-time, quality, and lead time.",
          "Connects authorization-denial spike to a payer policy change in the last 6 months.",
          "Connects currency support to enterprise churn.",
          "Correlates SE-447's 14 incidents with its 6.2% churn, contrasted against system averages of ~1 incident and 1.9% churn.",
          "Names the violation correctly: structuring under BSA 31 USC 5324, sub-$9,500 wires to evade the CTR threshold, 48-hour layering to ACT-B/C, offshore forwarding.",
          "Names the underdosing signature: SITE-07's 85% dose explains BOTH its 31% response rate AND its milder grade 3+ AE rate — less drug, less efficacy, fewer side effects."
        ),
      }
    : {
        score: 7,
        feedback: pickFeedback(
          "Does not link the late-delivery rise to the month-15 inflection or to a specific supplier's scorecard arc.",
          "Does not link the denial spike to the last-6-month inflection or to authorization category.",
          "Does not establish a causal link between support tickets and churn.",
          "Does not link SE-447's incident count to its subscriber churn rate — examine network_incidents alongside the churn data.",
          "Describes the pattern without naming BSA 31 USC 5324 or connecting the sub-threshold amounts to CTR avoidance.",
          "Does not name the underdosing signature — connect SITE-07's 85% dose to BOTH lower response AND milder AEs."
        ),
      };

  const quantification: AxisGrade = quant_pass
    ? {
        score: 15,
        feedback: pickFeedback(
          "Quantifies the $8.1M cost of the Zhonghe relationship with a derivation.",
          "Quantifies the $2.4M revenue at risk with a calculation method.",
          "Cites specific numbers and quantifies ARR at risk.",
          "Quantifies $1.58M ARR at risk with the derivation (excess churn × subscribers × ARPU × 12).",
          "Quantifies $3.2M structured amount and the $1M-$15M FinCEN civil money penalty range with the relationship-revenue trade-off.",
          "Quantifies the SITE-07 impact: 49.8% → 54.1% ORR if excluded, a 4.3 percentage-point drag against the FDA 50% threshold."
        ),
      }
    : {
        score: 8,
        feedback: pickFeedback(
          "Add specific numbers — expediting cost, rework cost, stockout impact, total vs annual spend.",
          "Add specific numbers — denied dollars, annualized at-risk, net collection delta.",
          "Add specific numbers — ARR at risk, % revenue, churn delta.",
          "Add specific numbers — excess churn delta, ARPU, monthly revenue loss, annualized ARR at risk.",
          "Add specific numbers — total structured amount, FinCEN penalty range ($1M-$15M), and the $180K relationship-revenue cost of action.",
          "Add specific numbers — the per-protocol ORR (54.1%), the FDA threshold (50%), and the percentage-point drag from SITE-07."
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
          "Recommends multi-currency and ties it to a scenario you tested.",
          "Recommends maintenance or retention credits and ties it to a scenario you tested.",
          "Recommends file-SAR or enhanced-monitoring with the regulatory citation and ties it to a scenario you tested.",
          "Recommends per-protocol exclusion or remediation with ICH E6 GCP and the FDA timeline, and ties it to a scenario you tested."
        ),
      }
    : reco_pass
      ? { score: 12, feedback: "Recommendation present; test a scenario to back it with the data." }
      : {
          score: 7,
          feedback: pickFeedback(
            "Recommendation is generic; specify cost ($450K vs $1.2M), payback, and scenario tested.",
            "Recommendation is generic; specify cost ($150K vs $800K), payback, and scenario tested.",
            "Recommendation is generic; specify scope, cost, payback, and scenario tested.",
            "Recommendation is generic; specify cost ($2.1M vs $1.8M), payback, and scenario tested.",
            "Recommendation is generic; cite 31 CFR 1020.320, specify 30-day timeline, and name the escalation path (BSA Officer → Legal → Board).",
            "Recommendation is generic; cite ICH E6 GCP, name the 6-week FDA advisory timeline, and pick exclude-vs-remediate."
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
    "Solid briefing. You identified the segmented churn risk, connected currency support to enterprise loss, and named an open question. Tighten the recommendation with a payback ratio next time.",
    "Solid briefing. You found SE-447 at the tower level, linked its 14 incidents to the 6.2% churn rate, and quantified the $1.58M ARR at risk. Tighten the trade-off framing between capex and retention credits next time.",
    "Solid memo. You identified ACT-A/B/C as a coordinated network, named structuring under BSA 31 USC 5324, and quantified the FinCEN penalty exposure against the relationship-revenue cost. Tighten the alternative-explanation paragraph next time — the EDD documentation request is the strongest hedge.",
    "Solid memo. You found SITE-07 at the site level, named the underdosing signature, and quantified the 49.8% → 54.1% per-protocol shift. Strong epistemic-honesty paragraph would acknowledge the healthier-patient hypothesis alongside underdosing — a blinded chart review is the strongest hedge before the FDA advisory."
  );
  const failSummary = pickFeedback(
    "The briefing reports a blended on-time rate but misses the supplier-level signal. Break delivery and quality by supplier, look at the scorecard arc for any inflection point, quantify the cost of the worst supplier vs their annual spend, test a scenario, and name an alternative explanation.",
    "The briefing reports an overall denial rate but misses the payer-level signal. Break denials down by payer, check the last-6-month period against the prior 18, look at appeal-overturn rates, quantify revenue at risk in dollars, test a scenario, and name an alternative explanation.",
    "The briefing reports growth but misses the enterprise churn signal. Re-segment churn, link currency tickets to it, quantify ARR at risk over 12 months, test a scenario, and name what you cannot yet confirm.",
    "The briefing reports a regional churn problem but doesn't drop to the tower level. Break churn by tower, look at network_incidents per tower, quantify revenue at risk in dollars, test a scenario, and name an alternative explanation worth checking.",
    "The memo names the alerts but doesn't connect ACT-A/B/C as a network or cite the BSA. Re-examine sub-threshold wire share, name 31 USC 5324, quantify FinCEN penalty exposure, test a scenario, and name what additional documentation would resolve the alternative explanation.",
    "The memo reports the ORR but doesn't name SITE-07 or the underdosing signature. Break response rate by site, examine dose adherence at the outlier, connect milder AEs to lower drug exposure, quantify the per-protocol shift, test a scenario, and name what additional data would confirm underdosing over the healthier-patient hypothesis."
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
