# Atelier — Answer Keys System
## Product Requirements Document v1.0
**Date:** September 2026  
**Owner:** Eddy Mkwambe · Mpingo Systems LLC  
**Status:** Approved — build after instructor dashboard foundation  
**Depends on:** ATELIER-CURRICULUM-FRAMEWORK.md · HOT-CASE-AUTHORING-CANON.md  
**Read before:** Any sprint touching grader, instructor dashboard, or briefing submission

---

## Problem statement

Atelier currently has one reference answer per Hot Case and module —
the canonical ideal briefing used to calibrate the AI grader.

This creates three institutional problems:

**Problem 1 — Instructor blindness**
A faculty member who assigns Atelier to 30 students has no independent
basis for evaluating student work. They see an AI score. They cannot
verify whether the score is correct, challenge it, or defend it to a
student who disputes their grade. In academic environments this is
not acceptable — every assessed work must have a human-reviewable
standard behind it.

**Problem 2 — Single path bias**
The ADAI grader is calibrated around one discovery sequence — the
canonical investigation path. A student who reaches the correct finding
through a legitimate but non-canonical analytical route may score
artificially low on pattern detection, because the grader does not
recognize the alternate path as valid. This produces false negatives
and undermines the assessment instrument's validity.

**Problem 3 — AI dependency without audit trail**
Universities operating under academic integrity policies need a documented
human-reviewable standard for every graded assessment. "The AI said 74"
is not a defensible grade. Two documented solution paths with instructor
override capability and an audit trail is.

---

## Goals

1. Every Hot Case and module ships with two documented solution paths
2. Instructors can view both paths in their dashboard
3. The AI grader recognizes both paths and scores them equivalently
4. Instructors can override AI scores with documented justification
5. All overrides are logged with instructor ID, timestamp, and rationale
6. The answer key system is invisible to learners until after submission

---

## Non-goals

- This is not a "show the answer" feature for learners
- This is not a hint system during the investigation
- This does not replace the AI grader — it supplements it with human oversight
- This does not expose solution paths before submission under any circumstance

---

## The two solution path model

### What a solution path is

A solution path is a documented investigation route that reaches
the correct finding through a specific analytical sequence.
It includes:
- The investigation sequence (which questions in which order)
- The key queries that reveal the crisis
- The expected findings at each step
- A reference briefing that scores 88-97 on the ADAI
- Instructor notes explaining what distinguishes this path

### Path A — The canonical path

The intended investigation sequence. Designed by the Hot Case author.
Follows the exercise progression as built. The ADAI grader is calibrated
primarily against Path A.

Every Hot Case and module already has Path A — it is the existing
reference briefing and calibration anchors.

### Path B — The alternate path

A legitimate non-obvious investigation route that reaches the same
finding through different analytical choices.

Path B exists because experienced analysts do not always follow
the designed exercise sequence. They may:
- Start with a different diagnostic question
- Use a different decomposition dimension
- Arrive at the crisis from a different angle

Path B documents that this alternate route is valid, so instructors
can recognize it and the grader can score it fairly.

### The equivalence principle

Path A and Path B must reach the same root cause finding and the
same recommendation. A briefing following either path correctly
should score equivalently on all five ADAI axes. The path taken
is irrelevant — the quality of reasoning and evidence is what matters.

---

## Content specification — what each path contains

### For Hot Cases (JSON format)

```json
{
  "slug": "cohort-collapse",
  "answer_keys": {
    "path_a": {
      "label": "Canonical Path",
      "description": "Cohort decomposition first — moves from surface MRR growth to cohort vintage analysis to retention decay quantification.",
      "investigation_sequence": [
        "Exercise 1: Confirm MRR growth (surface metric — 6% looks healthy)",
        "Exercise 2: Decompose revenue by acquisition cohort — 2025 cohort underperforms",
        "Exercise 3: Calculate monthly retention by cohort — 2025 churns at 3.2%/month",
        "Exercise 4: Quantify financial impact — 2025 cohort = 40% of base, $X ARR at risk"
      ],
      "key_findings": [
        "2025 cohort churns at ~3.2%/month (~32% annualized)",
        "2023 cohort retains at ~94% at 24 months",
        "2025 cohort represents ~40% of active customer base",
        "Volume growth from new customers masks decay in aggregate MRR"
      ],
      "briefing_requirements": [
        "Names the cohort vintage as the unit of analysis",
        "Cites 3.2%/month as the derived churn rate",
        "Explains the volume offset mechanism",
        "Recommends freeze on 2025 acquisition channels",
        "Acknowledges what cannot yet be confirmed"
      ],
      "scoring_anchors": {
        "generic": { "score": 59, "text": "Names churn is elevated without cohort specificity" },
        "competent": { "score": 76, "text": "Names cohort problem, some numbers, one action" },
        "ideal": { "score": 94, "text": "Full cohort breakdown, derived rates, 3 actions, epistemic honesty" }
      }
    },
    "path_b": {
      "label": "Alternate Path",
      "description": "LTV concentration first — starts with revenue concentration risk, notices 2025 cohort LTV anomaly, traces back to retention decay.",
      "investigation_sequence": [
        "Exercise 2: Revenue by customer segment — top customers identified",
        "Exercise 5: LTV:CAC by acquisition cohort — 2025 cohort LTV is 60% lower",
        "Exercise 3: Trace back to retention — 2025 churn rate explains LTV gap",
        "Exercise 4: Quantify base exposure — 40% of customers at risk"
      ],
      "key_findings": [
        "Same four findings as Path A — reached through different analytical sequence",
        "2025 cohort LTV is ~60% lower than 2023 cohort — the anomaly that reveals the crisis"
      ],
      "briefing_requirements": [
        "Same as Path A — root cause and recommendation are identical",
        "May frame the finding through LTV lens rather than retention lens — both valid"
      ],
      "scoring_anchors": {
        "generic": { "score": 59, "text": "Same as Path A" },
        "competent": { "score": 76, "text": "Same as Path A" },
        "ideal": { "score": 94, "text": "Same as Path A — LTV framing equally valid" }
      },
      "instructor_note": "A student following Path B will frame the finding as 'the 2025 cohort has deeply negative unit economics' rather than 'the 2025 cohort is churning at 3.2%/month.' Both framings are analytically correct. The grader may score Path B slightly lower on data fidelity if the student cites LTV numbers without deriving them from retention — instructor should check the student's query history before accepting a low data fidelity score."
    },
    "grader_instructions": {
      "path_detection": "If briefing leads with LTV or unit economics analysis before retention, likely Path B. Score equivalently if root cause finding is correct.",
      "common_partial_credit_scenarios": [
        "Student identifies cohort decay but not the volume offset mechanism — score competent on pattern detection, low on causal reasoning",
        "Student identifies volume offset but uses wrong cohort numbers — high pattern detection, low data fidelity",
        "Student recommends correct action but no timeline — high decision quality axis, minus 3-4 points"
      ]
    },
    "instructor_override_protocol": {
      "trigger_conditions": [
        "Student disputes AI score with coherent analytical argument",
        "Student clearly followed Path B but scored low on pattern detection",
        "AI grader produced obviously incorrect axis score (e.g., 5/20 on a clearly strong briefing)",
        "Student used a third legitimate path not documented here"
      ],
      "override_process": "Admin → Submissions → [submission_id] → Instructor Review tab → enter override score per axis → add justification text (minimum 50 words) → Submit override",
      "audit_requirements": "All overrides logged: instructor_id, submission_id, original_scores, override_scores, justification, timestamp. Cannot be deleted."
    }
  }
}
```

---

## Database schema

### New table: `answer_keys`

```sql
CREATE TABLE public.answer_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('hot_case', 'module')),
  content_slug text NOT NULL,
  path_id text NOT NULL CHECK (path_id IN ('path_a', 'path_b')),
  label text NOT NULL,
  description text NOT NULL,
  investigation_sequence jsonb NOT NULL,
  key_findings jsonb NOT NULL,
  briefing_requirements jsonb NOT NULL,
  scoring_anchors jsonb NOT NULL,
  instructor_note text,
  grader_instructions jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(content_slug, path_id)
);

ALTER TABLE public.answer_keys ENABLE ROW LEVEL SECURITY;

-- Only instructors and admins can read answer keys
CREATE POLICY "answer_keys_instructor_only" ON public.answer_keys
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'instructor')
  )
);
```

### New table: `score_overrides`

```sql
CREATE TABLE public.score_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL,
  submission_type text NOT NULL CHECK (submission_type IN ('hot_case', 'module')),
  instructor_id uuid NOT NULL REFERENCES public.profiles(id),
  original_scores jsonb NOT NULL,
  override_scores jsonb NOT NULL,
  justification text NOT NULL CHECK (length(justification) >= 50),
  path_identified text CHECK (path_identified IN ('path_a', 'path_b', 'path_other')),
  path_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.score_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "score_overrides_instructor_read" ON public.score_overrides
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'instructor')
  )
);

CREATE POLICY "score_overrides_instructor_insert" ON public.score_overrides
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'instructor')
  )
);
```

---

## UI specification

### Where answer keys appear

Answer keys are accessible only from the instructor dashboard.
They never appear in the learner-facing interface.

**Route:** `/instructor/answer-keys/[slug]`

**Layout:**
- Left panel: Path A (canonical)
- Right panel: Path B (alternate)
- Each panel shows: investigation sequence, key findings, briefing requirements, scoring anchors, instructor notes
- Toggle at top: "Hot Cases" / "Modules"
- Selector: choose which Hot Case or module to view

### Where overrides appear

**Route:** `/instructor/submissions/[submission_id]`

Tabs:
1. **Student briefing** — full text the student submitted
2. **AI scores** — per-axis ADAI scores with axis-level feedback
3. **Answer keys** — Path A and Path B side by side for comparison
4. **Instructor review** — override form (only activates if instructor clicks "Override AI score")

**Override form fields:**
- Path identified (dropdown: Path A / Path B / Other — describe)
- Override score per axis (5 number inputs, each 0-20)
- Justification (textarea, minimum 50 words, character count shown)
- Internal note to student (optional — sent with grade return)
- Submit override button

---

## The grader upgrade required

To properly support Path B scoring, the ADAI grading prompt must be
updated to include path detection logic:

```
GRADER INSTRUCTION ADDITION:

Before scoring, determine which investigation path the learner took:
- Path A: briefing leads with retention/churn decomposition by cohort
- Path B: briefing leads with LTV or unit economics analysis
- Path Other: note the approach used

If Path B is detected, do not penalize for different framing of
the same finding. Score pattern detection based on whether the
correct root cause is identified, not whether the canonical
analytical sequence was followed.

Both paths are documented in the answer key. A briefing that
correctly identifies [hidden crisis] through either path should
score 14-20 on pattern detection.
```

---

## Implementation sequence

**Sprint AK-1 (Claude Code):**
- Create `answer_keys` and `score_overrides` tables via migration
- Seed `answer_keys` for `cohort-collapse` (Path A already exists as reference briefing — structure it into the new format, write Path B)
- API route: `GET /api/instructor/answer-keys/[slug]`
- API route: `POST /api/instructor/submissions/[id]/override`

**Sprint AK-2 (Claude Code):**
- Build `/instructor/answer-keys/[slug]` UI (two-panel layout)
- Build override form in `/instructor/submissions/[id]`
- Update ADAI grading prompt with path detection logic

**Sprint AK-3 (Content — Claude Chat):**
- Write Path B for all six existing modules
- Write Path B for Hot Case 001 (cohort-collapse)
- Write Path B for each new Hot Case before it publishes
- Add to HOT-CASE-AUTHORING-CANON.md: "Every Hot Case must have Path B documented before publishing"

---

## Canon update required

Add to `HOT-CASE-AUTHORING-CANON.md` pre-publish checklist:

```
Answer Keys:
- [ ] Path A investigation sequence documented (minimum 4 steps)
- [ ] Path A key findings documented (minimum 3 specific findings with numbers)
- [ ] Path B investigation sequence documented (different analytical entry point)
- [ ] Path B instructor note written (explains what distinguishes this path)
- [ ] Grader instructions updated with path detection guidance
- [ ] Both paths reach the same root cause finding
```

---

*Mpingo Systems LLC · Raleigh, NC*  
*ATELIER-ANSWER-KEYS-PRD v1.0 · September 2026*
