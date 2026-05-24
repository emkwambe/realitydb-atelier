# Hot Case Authoring Canon
**Version:** 1.0 · May 2026  
**Owner:** Eddy Mkwambe · Mpingo Systems LLC  
**Status:** Locked — read before authoring any new Hot Case  

> This document is the single source of truth for Hot Case authoring.  
> Every Hot Case must pass all criteria in this canon before it is published.  
> Claude Code reads this file before building or modifying any Hot Case route, 
> grading API, or content file.

---

## What a Hot Case is

A Hot Case is a 30-minute free business crisis exercise. A learner:

1. Receives a one-paragraph scenario — a CFO, a board meeting, a time pressure
2. Runs SQL queries against a live in-browser PostgreSQL database
3. Writes a CEO briefing graded by Claude on three axes
4. Receives a score, axis breakdown, and specific feedback in 60 seconds

A Hot Case is **not** a tutorial. It is not a lesson. It does not teach SQL.  
It tests whether the learner can translate data into a decision under pressure.

The credential — if earned — names the crisis solved, not the course finished.

---

## The naming canon

| Element | Correct | Never use |
|---|---|---|
| Product name | Hot Case / Hot Cases | Brief / Weekly Brief / Challenge |
| Database table | `hot_cases` | `briefs` |
| Submissions table | `hot_case_submissions` | `brief_submissions` |
| Content files | `content/hot-cases/[slug].json` | `briefs/` |
| Routes | `/hot-cases/[slug]` | `/briefs/[slug]` |
| API routes | `/api/hot-cases/[slug]/submit` | `/api/briefs/` |

---

## The drop schedule

- **Frequency:** Every Monday
- **Time:** 8:00am EST
- **Publish action:** Admin → /admin/hot-cases → Publish button
- **Email blast:** Sent simultaneously to full subscriber list via Resend broadcast
- **Cadence goal:** At least one Hot Case per vertical per month

### The 6-pack rotation

Rotate through all six production packs so each vertical gets at least  
one Hot Case per month. Suggested monthly rotation:

| Week | Vertical | Pack |
|---|---|---|
| Week 1 | B2B SaaS / Fintech | NovaPay (ClearBank) |
| Week 2 | Healthcare | MedCore |
| Week 3 | Supply Chain | SupplyLink |
| Week 4 | Telecom / Oncology | TowerNet or OncoCare |

Adjust based on news cycles and topical relevance. A healthcare data breach  
in the news → MedCore Hot Case that week.

---

## The Hot Case structure

Every Hot Case has exactly these components:

### 1. The slug
- Lowercase, hyphenated, descriptive of the crisis pattern
- Format: `[adjective]-[noun]` or `[noun]-[noun]`
- Examples: `cohort-collapse`, `margin-erosion`, `churn-blind-spot`
- Never use the company name in the slug

### 2. The title
- Format: "The [Crisis Name]"
- 2-4 words after "The"
- Must be evocative, not descriptive
- ✅ "The Cohort Collapse"
- ❌ "NovaPay Retention Analysis"

### 3. The scenario (the hook)
- Exactly one paragraph, 2-4 sentences
- Must include: a named role (CFO, VP of Growth, Board), a time pressure, one data point that seems fine on the surface
- The surface data point must be misleading — it is what makes the crisis non-obvious
- Template: "[Company] reports [metric that looks healthy]. [Senior person] sends [one message / one question] before [high-stakes event]. You have [time limit]."
- The time limit is always 90 minutes in the scenario copy, regardless of actual exercise time

**The Cohort Collapse example (locked reference):**
> "NovaPay reports 6% MRR growth this quarter. The CFO sends one message before the board meeting: 'Pull the cohort numbers first. Something feels soft.' You have 90 minutes."

### 4. The hidden crisis
- Never shown to learners — grading reference only
- Must be specific, quantifiable, and non-obvious from the surface metric
- Must be discoverable through the 3 exercises using only SQL
- Format: one paragraph describing exactly what the data shows when you look deeper
- The hidden crisis is what the grader checks for in pattern detection

### 5. The exercises (exactly 3)

Each exercise has:
- **id:** 1, 2, or 3
- **title:** Short action phrase ("Read the MRR", "Break it by cohort", "Find the inflection")
- **question:** The business question, not the SQL question. Never say "write a query". Say "what is the retention rate by cohort?"
- **hint:** One sentence, Socratic — points to the right table/function without giving the answer. Never reveals the hidden crisis.
- **tags:** 2-4 SQL concepts used (SELECT, GROUP BY, DATE_TRUNC, JOIN, etc.)

**Exercise progression rule:**
- Exercise 1: Surface metric — confirms the headline number, builds false confidence
- Exercise 2: The decomposition — breaks the surface metric by the key dimension that reveals the crisis
- Exercise 3: The quantification — puts a number on the impact

This progression means a learner who only does Exercise 1 will miss the crisis.  
A learner who completes all 3 has everything they need to write a 90+ briefing.

### 6. The briefing prompt
- One paragraph, 2-3 sentences
- Sets the scene for the writing task
- Always ends with a short, direct instruction: "Write the briefing." or "Make the call."
- The locked scaffold (4 bullets) appears automatically after Exercise 3 — do not repeat it in the briefing prompt

### 7. The grading rubric
Three axes. Always these three. Always these point values:

| Axis | Points | What it measures |
|---|---|---|
| Pattern detection | 0–33 | Did the analyst identify the specific crisis pattern? |
| Quantification | 0–33 | Did they derive specific numbers from the data? |
| Recommendation specificity | 0–34 | Did they give a specific action with a timeline + epistemic honesty? |

Each axis must have:
- A description (the question it answers)
- Scoring bands: 28-33/28-33/29-34 (excellent), 18-27 (competent), 8-17 (surface), 0-7 (generic)
- Reference data: the actual numbers from the dataset that a 30+ answer would cite
- What the next band requires: specific feedback for each band

### 8. The reference briefing
- A model answer that scores 88-97
- Written after the dataset is confirmed and exercises are designed
- Must include: specific cohort/segment data, derived numbers, 3 actions with timelines, epistemic honesty paragraph
- Used in the reference answer panel (shown only after submission)
- Used by the grader as reference context

---

## The content file format

Every Hot Case is a JSON file at `content/hot-cases/[slug].json`:

```json
{
  "slug": "cohort-collapse",
  "title": "The Cohort Collapse",
  "vertical": "B2B SaaS",
  "primary_dimension": "Financial Intelligence",
  "secondary_dimension": "Decision Intelligence",
  "pattern_id": "mrr-growth-masking-cohort-decay",
  "context": "One paragraph scenario. Surface metric. Time pressure.",
  "hidden_crisis": "Never shown to learners. Full description of what the data reveals.",
  "exercises": [
    {
      "id": 1,
      "title": "Read the [surface metric]",
      "question": "Business question — what does the surface metric show?",
      "hint": "Socratic hint pointing to table/function without revealing answer.",
      "tags": ["SELECT", "GROUP BY", "DATE_TRUNC"]
    },
    {
      "id": 2,
      "title": "Break it by [key dimension]",
      "question": "Business question — how does it look when decomposed?",
      "hint": "Socratic hint for the decomposition query.",
      "tags": ["JOIN", "cohort analysis"]
    },
    {
      "id": 3,
      "title": "Quantify the [impact]",
      "question": "Business question — what is the size of the problem?",
      "hint": "Socratic hint for the quantification query.",
      "tags": ["calculation", "aggregation"]
    }
  ],
  "briefing_prompt": "One paragraph. Sets the scene. Ends with direct instruction.",
  "grading_rubric": {
    "pattern_detection": "Question this axis answers.",
    "quantification": "Question this axis answers.",
    "recommendation_specificity": "Question this axis answers."
  },
  "reference_data": {
    "note": "Actual numbers from the dataset for grader context.",
    "key_finding_1": "Specific number or rate.",
    "key_finding_2": "Specific number or rate.",
    "key_finding_3": "Specific number or rate."
  },
  "reference_briefing": "Full model answer scoring 88-97. Written after dataset confirmed."
}
```

---

## The grading prompt requirements

Every Hot Case grading prompt must include:

1. **The hidden crisis** — injected as grader context, never shown to learner
2. **Reference data** — actual numbers the ideal answer would cite
3. **Scoring bands per axis** — not just descriptions, but what each band range requires
4. **Feedback rules** — specific, never revealing, always pointing to next band
5. **JSON-only output** — schema: `{ axes: { pattern, quant, rec }, feedback: { pattern, quant, rec } }`
6. **Validation** — pattern 0-33, quant 0-33, rec 0-34, total 0-100
7. **Temperature: 0** — consistent scoring across submissions

---

## The calibration test (mandatory before publishing)

Every Hot Case must pass calibration before going live.  
Run both test submissions against the live grader with ANTHROPIC_API_KEY set.

**Generic answer template (should score 55-72):**
> "[Company] reports [surface metric] but [key segment] is [direction].  
> I recommend [vague action] and [vague action].  
> The blended number is misleading."

**Ideal answer template (should score 88-97):**
> "[Company]'s [surface metric] [looks healthy/grew X%] but that number is hiding  
> a structural problem. [Segment A] [retains/performs] at [specific rate]. [Segment B]  
> [retains/performs] at [specific rate]. [Mechanism explaining why surface metric  
> looks healthy despite underlying decay]. The unit economics of [problem segment]  
> are deeply negative. [Quantified impact statement]. Recommendation: [specific  
> action 1] immediately. In [X] days [specific action 2]. By day [Y] [specific  
> action 3]. Do not [specific thing NOT to do]. What I cannot confirm yet:  
> [specific unknowns]. I need [specific additional data] to [specific question]."

If generic scores outside 55-72 OR ideal scores outside 88-97:
- Adjust scoring band thresholds in the grading prompt
- Re-run calibration
- Do not publish until both ranges hold

---

## The briefing scaffold (locked copy — do not modify)

Appears automatically after Exercise 3 completes. Content-neutral.  
Never reveals the pattern, the numbers, or the hidden crisis.

```
Ready to write your briefing?

The CFO needs four things in the next 10 minutes:
1. What you found — the specific pattern in the data
2. The number that matters — quantified impact
3. What you recommend — a specific action with a timeline
4. What you cannot confirm yet — the limits of your analysis

You have the data. Now make the call.
```

**Trigger condition:** `exercisesCompleted === totalExercises`  
**Placement:** Right panel of workbench, replaces exercise prompt after Exercise 3  
**CTA:** "Write your briefing →" links to `/hot-cases/[slug]/briefing`

---

## The Hot Case pattern library

Each Hot Case is built around a named pattern. The pattern is the hidden crisis.  
Patterns are reusable across verticals — the same pattern can appear in healthcare,  
supply chain, and fintech with different data.

### Current patterns (expand over time)

| Pattern ID | Name | Description |
|---|---|---|
| `mrr-growth-masking-cohort-decay` | Cohort Collapse | Blended growth metric hides deteriorating cohort retention |
| `margin-compression-hidden-by-volume` | Margin Mirage | Revenue growth masks declining unit margins |
| `concentration-risk-invisible-in-aggregate` | Silent Concentration | Aggregate health hides dangerous customer/supplier concentration |
| `leading-indicator-divergence` | Signal Split | Lagging metrics look healthy while leading indicators deteriorate |
| `channel-mix-shift-obscuring-cac` | CAC Illusion | Blended CAC looks stable while high-CAC channels grow as share |
| `seasonal-baseline-masking-decline` | Seasonal Cover | YoY comparison hides underlying decline masked by seasonal lift |
| `compliance-gap-surfacing-in-data` | Quiet Exposure | Operational data reveals regulatory or compliance exposure |
| `retention-cliff-post-cohort-maturity` | Cliff Edge | Retention looks stable until cohorts hit maturity threshold |

### Pattern selection rules

- No pattern repeats within the same vertical in the same month
- Patterns that require industry knowledge (compliance, clinical) use the matching vertical pack
- Patterns visible to non-specialists (churn, margin, concentration) can use any vertical

---

## The pre-publish checklist

Before clicking Publish in /admin/hot-cases, verify:

**Content:**
- [ ] Slug is unique and follows format
- [ ] Title follows "The [Crisis Name]" format
- [ ] Scenario has surface metric, named role, time pressure
- [ ] Hidden crisis is specific and quantifiable
- [ ] 3 exercises follow surface → decomposition → quantification progression
- [ ] Each exercise has a business question (not a SQL question)
- [ ] Each hint is Socratic — does not reveal the hidden crisis
- [ ] Briefing prompt ends with a direct instruction
- [ ] Reference briefing scores 88-97 in calibration test
- [ ] Reference data includes at least 3 specific numbers from the dataset

**Grader:**
- [ ] Grading prompt includes hidden crisis and reference data
- [ ] Scoring bands defined for all three axes
- [ ] Calibration test passed: generic 55-72, ideal 88-97
- [ ] JSON validation in place — out-of-range scores rejected before DB write

**Technical:**
- [ ] JSON file at `content/hot-cases/[slug].json`
- [ ] Row inserted in `hot_cases` table with status='draft'
- [ ] Dataset confirmed — exercises run correctly against the pack
- [ ] `/hot-cases/[slug]` route returns 200
- [ ] `/hot-cases/[slug]/exercise` SQL workbench loads correct dataset
- [ ] `/hot-cases/[slug]/briefing` form submits and returns score
- [ ] `/hot-cases/[slug]/results/[id]` renders score and axis breakdown

**Distribution:**
- [ ] Resend broadcast scheduled for Monday 8am EST
- [ ] Subject line written (pattern: "[Crisis Name] — [one-line hook]")
- [ ] LinkedIn post scheduled for Monday 8am EST (same time as email)

---

## The Hot Case as a Claude Code skill

When Claude Code builds a new Hot Case, it reads this file first.  
The inputs Claude Code needs from Eddy:

1. **Pattern ID** — which pattern from the library (or a new one)
2. **Vertical** — which of the 6 packs to use
3. **Company name** — from the selected pack
4. **The surface metric** — what looks healthy on the surface
5. **The hidden crisis** — what the data actually shows
6. **3 reference numbers** — specific figures from the dataset

With those 6 inputs and this canon, Claude Code can produce a complete,  
calibration-ready Hot Case JSON file, grading prompt, and database row.

---

## Version history

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-24 | Initial canon. Derived from The Cohort Collapse build session. Locked decisions from Blueprint v1.1 incorporated. |

---

*Mpingo Systems LLC · Raleigh, NC*  
*The business school that runs on live data.*

---

## Addendum 1 — Interactive verification checklist (Sprint spec)

The pre-publish checklist must be enforced in the UI — not just documented.

### Route: `/admin/hot-cases/[slug]/verify`

A verification page accessible from the admin Hot Cases table.  
The **Publish** button in `/admin/hot-cases` is disabled until all  
checklist items are marked complete for that slug.

**Database table: `hot_case_verifications`**

```sql
CREATE TABLE public.hot_case_verifications (
  id uuid primary key default gen_random_uuid(),
  hot_case_slug text not null references public.hot_cases(slug),
  item_key text not null,
  checked boolean not null default false,
  checked_by uuid references public.profiles(id),
  checked_at timestamptz,
  created_at timestamptz default now(),
  UNIQUE(hot_case_slug, item_key)
);
```

**Checklist items (item_key → label):**

Content group:
- `slug_unique` → Slug is unique and follows format
- `title_format` → Title follows "The [Crisis Name]" format
- `scenario_complete` → Scenario has surface metric, named role, time pressure
- `hidden_crisis_specific` → Hidden crisis is specific and quantifiable
- `exercises_progression` → 3 exercises follow surface → decomposition → quantification
- `exercises_business_questions` → Each exercise has a business question, not a SQL question
- `hints_socratic` → Each hint is Socratic — does not reveal the hidden crisis
- `briefing_prompt_complete` → Briefing prompt ends with a direct instruction
- `reference_briefing_written` → Reference briefing written and stored
- `reference_data_three_numbers` → Reference data includes at least 3 specific numbers

Grader group:
- `grading_prompt_has_crisis` → Grading prompt includes hidden crisis and reference data
- `grading_bands_defined` → Scoring bands defined for all three axes
- `calibration_generic_passed` → Generic answer scored 55-72 ✓
- `calibration_ideal_passed` → Ideal answer scored 88-97 ✓
- `json_validation_in_place` → Out-of-range scores rejected before DB write

Technical group:
- `json_file_exists` → JSON file at content/hot-cases/[slug].json
- `db_row_exists` → Row in hot_cases table with status='draft'
- `route_detail_200` → /hot-cases/[slug] returns 200
- `route_exercise_loads` → SQL workbench loads correct dataset
- `route_briefing_submits` → Briefing form submits and returns score
- `route_results_renders` → Results page renders score and axis breakdown

Distribution group:
- `resend_broadcast_scheduled` → Resend broadcast scheduled for Monday 8am EST
- `subject_line_written` → Email subject line written
- `linkedin_post_scheduled` → LinkedIn post scheduled for Monday 8am EST

**UI behavior:**
- Each item shows as a checkbox with label and group header
- Checking an item writes to `hot_case_verifications` with `checked_by` and `checked_at`
- All 23 items must be checked before the Publish button activates
- A progress bar shows: "18 / 23 items verified"
- Publish button shows disabled state with tooltip: "Complete all checklist items to publish"
- Once published, checklist is locked (read-only)

---

## Addendum 2 — The Hot Case generation prompt template

Use this template to generate a new Hot Case. Fill in the 6 variables,  
paste into Claude Chat, and receive a complete ready-to-use JSON file  
plus a calibration-ready grading prompt.

### The template (copy and fill in)

```
Generate a complete Hot Case JSON file following the 
HOT-CASE-AUTHORING-CANON.md specification.

INPUTS:
1. Pattern ID: [choose from pattern library or describe a new pattern]
2. Vertical: [NovaPay / MedCore / SupplyLink / TowerNet / ClearBank / OncoCare]
3. Company name: [from the selected pack]
4. Surface metric: [the number that looks healthy on the surface]
5. Hidden crisis: [what the data actually shows when decomposed]
6. Reference numbers: [3 specific figures from the dataset]
   - [Number 1: e.g. "2023 cohort retains at 94% at 24 months"]
   - [Number 2: e.g. "2025 cohort churns at 3.2%/month in first 90 days"]
   - [Number 3: e.g. "2025 cohort represents ~40% of active base"]

DELIVERABLES:
1. Complete JSON file matching the canon schema
2. Slug and title following canon format
3. Scenario paragraph with surface metric, named role, time pressure
4. Hidden crisis paragraph (grader reference only)
5. 3 exercises following surface → decomposition → quantification progression
6. Briefing prompt ending with direct instruction
7. Grading rubric with scoring bands for all three axes
8. Reference data block with the 3 numbers provided
9. Reference briefing scoring 88-97 (ideal answer model)
10. Grading system prompt ready to paste into the submit API route

After generating, run the calibration test:
- Submit the generic answer template — confirm it scores 55-72
- Submit the ideal answer (the reference briefing) — confirm it scores 88-97
- If either is outside the band, adjust scoring bands and regenerate
```

### Example filled template (The Cohort Collapse)

```
1. Pattern ID: mrr-growth-masking-cohort-decay
2. Vertical: NovaPay (B2B SaaS Fintech)
3. Company name: NovaPay
4. Surface metric: 6% MRR growth this quarter
5. Hidden crisis: Blended MRR growth masks cohort retention decay.
   The 2025 acquisition cohort churns at 3x the rate of the 2023 cohort.
   New volume offsets churn in aggregate — the business looks healthy
   until you decompose by cohort vintage.
6. Reference numbers:
   - 2023 cohort retains at ~94% at 24 months
   - 2025 cohort churns at ~3.2%/month (~32% annualized)
   - 2025 cohort represents ~40% of active customer base
```

---

## Addendum 3 — Pattern deduplication registry

### The rule

No pattern × vertical combination may be published twice.  
No pattern may repeat in the same vertical within 6 months.  
No vertical may appear in back-to-back weeks.

### Database enforcement

```sql
-- Add pattern tracking to hot_cases table
ALTER TABLE public.hot_cases
ADD COLUMN IF NOT EXISTS pattern_id text,
ADD COLUMN IF NOT EXISTS last_used_vertical text;

-- View: check for conflicts before authoring
CREATE OR REPLACE VIEW hot_case_pattern_registry AS
SELECT 
  pattern_id,
  vertical,
  slug,
  title,
  published_at,
  status
FROM public.hot_cases
WHERE status IN ('published', 'archived')
ORDER BY published_at DESC;
```

### Admin UI: pattern conflict check

In `/admin/hot-cases/new` (future sprint), before authoring begins:

1. Show the pattern registry table — all published/archived pattern × vertical combinations
2. Show a "conflict check" input: select pattern + vertical → system warns if combination was used in last 6 months
3. Show the last 4 weeks of published verticals — prevents back-to-back same vertical

### The deduplication query (run before each authoring session)

```sql
-- Check if pattern × vertical combination was used recently
SELECT slug, title, published_at
FROM public.hot_cases
WHERE pattern_id = '[your-pattern-id]'
  AND vertical = '[your-vertical]'
  AND published_at > now() - interval '6 months'
  AND status IN ('published', 'archived');

-- Check last 4 weeks of verticals to avoid back-to-back
SELECT vertical, title, published_at
FROM public.hot_cases
WHERE published_at > now() - interval '4 weeks'
  AND status = 'published'
ORDER BY published_at DESC;
```

If the first query returns any rows — choose a different pattern or vertical.  
If the second query shows the same vertical last week — choose a different vertical.

### The pattern exhaustion plan

With 8 patterns × 6 verticals = 48 unique combinations.  
At 1 per week = 48 weeks of unique Hot Cases before any repeat.  
New patterns should be added to the library before the 40-week mark.

Target: add 4 new patterns per quarter starting Q3 2026.

---

## Version history (updated)

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-05-24 | Initial canon. Derived from The Cohort Collapse build session. |
| 1.1 | 2026-05-24 | Added Addendum 1 (interactive verification checklist sprint spec), Addendum 2 (Hot Case generation prompt template with example), Addendum 3 (pattern deduplication registry with SQL and UI spec). |
