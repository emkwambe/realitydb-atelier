# Atelier — From Exercises to Executive Investigations
## Product Reframe Document v1.0
**Date:** June 15, 2026  
**Owner:** Eddy Mkwambe · Mpingo Systems LLC  
**Status:** Approved — governs all future sprint language, UI copy, and IES positioning  
**Read before:** Any sprint touching module UI, exercise copy, credential display, or grader output

---

## The core insight

Atelier already has the skeleton of a research-grade competency assessment system.

The problem is not what was built. The problem is how it is presented.

**Current presentation:**
> 10 SQL exercises and a memo.

**What it actually is:**
> A structured executive investigation that progressively measures business acumen, analytical reasoning, causal inference, decision quality, and executive communication through interaction with a realistic synthetic enterprise dataset.

That repositioning is worth more than adding five new modules.

---

## What was accidentally built

Reading the NovaPay investigation arc:

```
01  Read the room
02  Where is revenue coming from?
03  Is churn getting better or worse?
04  Who is actually churning?
05  Are we acquiring customers profitably?
06  Are existing customers growing or shrinking?
07  Revenue concentration risk
08  Follow the complaints
09  Confirm the cause
10  Quantify the decision
→   CEO Briefing
```

This is not a sequence of SQL exercises.

This is a decision-making workflow:

```
Observe
    ↓
Investigate
    ↓
Diagnose
    ↓
Validate
    ↓
Decide
    ↓
Communicate
```

Which is exactly what executives do under time pressure with incomplete information.

The investigations are evidence collection checkpoints.
The CEO Briefing is the decision output.
The competencies are what the system is actually measuring.

---

## The language transformation (locked)

Every sprint touching module UI, copy, or credentials must use the new language.

| Old language | New language |
|---|---|
| Module | Executive Incident |
| Exercise | Investigation |
| Exercise 1-10 | Evidence collection checkpoint |
| Score | Competency Evidence |
| Complete the module | Resolve the incident |
| 10 exercises + CEO briefing | Structured investigation → Executive Briefing |
| Your score | Competencies demonstrated |
| Module completed | Incident resolved |
| Beginner / Intermediate / Advanced | Phase label (see below) |

---

## The investigation phases (NovaPay reference model)

Every Executive Incident is organized into 5 phases. Each phase maps
to one or two competency domains. This replaces the flat numbered list.

### Phase 1 — Situation Awareness
*Competencies: Business Acumen, Data Literacy*

| Investigation | Business Question | Competency |
|---|---|---|
| 01 Read the room | Is the company healthy? | Business Acumen |
| 02 Revenue sources | Where is revenue concentrated? | Data Literacy |

**Phase purpose:** Establish the baseline. What does the surface data say?
This phase deliberately builds false confidence — the numbers look fine.

---

### Phase 2 — Problem Identification
*Competencies: Analytical Reasoning, Data Literacy*

| Investigation | Business Question | Competency |
|---|---|---|
| 03 Churn trend | Is churn worsening? | Analytical Reasoning |
| 04 Churn segmentation | Who is actually leaving? | Analytical Reasoning |

**Phase purpose:** Surface the signal beneath the noise. The learner
starts to suspect something is wrong with the narrative from Phase 1.

---

### Phase 3 — Root Cause Analysis
*Competencies: Causal Reasoning, Analytical Reasoning*

| Investigation | Business Question | Competency |
|---|---|---|
| 05 LTV:CAC analysis | Are we acquiring profitably? | Analytical Reasoning |
| 06 Net Revenue Retention | Are existing customers growing? | Causal Reasoning |
| 07 Concentration risk | How dependent are we on top customers? | Causal Reasoning |

**Phase purpose:** Move from "what is happening" to "why it is happening."
This is the hardest phase analytically. The competency shifts from
pattern recognition to causal inference.

---

### Phase 4 — Strategic Evaluation
*Competencies: Decision Intelligence, Business Acumen*

| Investigation | Business Question | Competency |
|---|---|---|
| 08 Complaint analysis | What are churned customers saying? | Decision Intelligence |
| 09 Causal validation | Do complaints explain churn? | Decision Intelligence |
| 10 Impact quantification | What is the financial cost of inaction? | Business Acumen |

**Phase purpose:** Force the trade-off. The learner must now quantify
the impact of action vs. inaction and prepare a defensible position.

---

### Phase 5 — Executive Communication
*Competency: Executive Communication, Business Acumen*

| Investigation | Business Question | Competency |
|---|---|---|
| → CEO Briefing | Write the memo. Cite queries. Earn credential. | Executive Communication |

**Phase purpose:** Translate evidence into a decision. The briefing is
graded on whether a CFO can act on it — not on whether the SQL was correct.

---

## The full competency map (NovaPay reference)

| Investigation | Competency Domain | What is being measured |
|---|---|---|
| 01 Read the room | Business Acumen | Recognizes key business health signals |
| 02 Revenue sources | Data Literacy | Interprets revenue distribution correctly |
| 03 Churn trend | Analytical Reasoning | Identifies trend direction and magnitude |
| 04 Churn segmentation | Analytical Reasoning | Decomposes aggregate into meaningful segments |
| 05 LTV:CAC | Analytical Reasoning | Calculates and interprets unit economics |
| 06 NRR by segment | Causal Reasoning | Links retention to specific customer cohorts |
| 07 Concentration risk | Causal Reasoning | Identifies structural vulnerability |
| 08 Complaint analysis | Decision Intelligence | Connects operational signal to strategic implication |
| 09 Causal validation | Decision Intelligence | Validates hypothesis with evidence |
| 10 Impact quantification | Business Acumen | Quantifies cost of inaction for decision-making |
| CEO Briefing | Executive Communication | Translates evidence into an actionable executive narrative |

---

## The reframed NovaPay incident brief

Replace the current module landing page copy with this framing:

---

**Executive Incident · NovaPay**
*B2B SaaS Payments Platform · Series B · $2.1M ARR*

**Your role:** VP of Growth

**The situation:**
The board meeting is in two weeks. The lead investor has flagged retention metrics and wants answers before the meeting. You have access to NovaPay's complete operational database — 13 tables, 50,000 rows, real PostgreSQL.

**Your investigation:**
Five phases. Ten evidence checkpoints. One executive briefing.
The data contains the answer. Your job is to find it, quantify it, and brief the board.

**What this incident measures:**
Business Acumen · Analytical Reasoning · Causal Reasoning · Decision Intelligence · Executive Communication

**Deliverable:**
An executive briefing graded on pattern detection, analytical depth, and recommendation specificity. The credential names the crisis you solved.

---

## The missing layer — hypothesis capture

Currently every investigation is only a task.
IES reviewers and employers want to see thinking, not just answers.

**Add before each investigation:**

> "Before you query — what do you believe is causing this pattern?"
> Select your working hypothesis:
> - [ ] Pricing issue
> - [ ] Customer support failures
> - [ ] Product reliability
> - [ ] Competitive pressure
> - [ ] Customer mix shift

**Add after each investigation:**

> "Did the data change your hypothesis? If so, what changed?"

This captures behavioral evidence — the revision of hypotheses under
evidence — which is the single most valuable signal for both employers
and IES assessors. It measures thinking, not just outputs.

**This data should be stored in:**
`hot_case_submissions.boardroom_transcript` (already in schema)
or a new `investigation_telemetry` table per the behavioral telemetry
sprint planned for Phase 2 R&D.

---

## The competency transcript (replaces score display)

### Current display (deprecated)
```
NovaPay Assessment
Score: 88/100
```

### New display (target)
```
Executive Incident Resolved

NovaPay Retention Crisis
Investigated June 2026 · Dataset: NovaPay v3.1 · 50,000 rows

Competencies Demonstrated:

Business Acumen .............. 84
Analytical Reasoning ......... 91
Causal Reasoning ............. 88
Decision Intelligence ......... 86
Executive Communication ...... 82

Evidence generated:
  10 investigation checkpoints completed
  1 executive briefing submitted and graded
  Incident resolved: cohort retention decay masked by volume growth

Credential: Publicly verifiable at atelier.realitydb.dev/verify/[id]
```

This becomes hiring evidence — not a course grade.

---

## What the AI grader must score (future state)

Current grader evaluates: final briefing quality on 3 axes.

Future grader evaluates: per-investigation + briefing on 5 axes.

**Per-investigation scoring (future):**

| Dimension | What it measures |
|---|---|
| Observation quality | Did they notice the important signal? |
| Evidence quality | Did they support claims with data? |
| Reasoning quality | Did they connect evidence to cause correctly? |
| Decision quality | Would their recommended action plausibly improve outcomes? |
| Communication quality | Can leadership act on this recommendation? |

**Briefing scoring (current 3-axis → target 5-axis ADAI):**

| Axis | Points | What it measures |
|---|---|---|
| Pattern detection | 0-20 | Identified the specific crisis |
| Data fidelity | 0-20 | Claims grounded in actual query results |
| Causal reasoning | 0-20 | Correct link between data anomaly and business cause |
| Decision quality | 0-20 | Specific action, trade-offs acknowledged |
| Executive communication | 0-20 | Right argument for right audience |

---

## The IES alignment

This reframe is what makes Atelier IES Phase IB competitive.

| What IES looks for | What Atelier provides |
|---|---|
| Defined competency framework | Six dimensions, each with observable behaviors |
| Assessment instrument | ADAI (Atelier Data Acumen Instrument) |
| Behavioral evidence | Investigation telemetry, hypothesis capture |
| Formative assessment | Per-phase competency feedback |
| Summative assessment | Executive Briefing graded by ADAI |
| Learning gains measurement | Pre/post incident competency scores |
| Inter-rater reliability | Human vs AI scoring validation study (Phase 2) |

**IES language translations:**

| Commercial language | IES language |
|---|---|
| "Learn business judgment" | "Develop authentic data acumen through situated, scenario-based inquiry" |
| "Find the answer in the data" | "Engage in authentic hypothesis-driven investigation" |
| "Write a CEO briefing" | "Produce an evidence-based executive communication demonstrating causal reasoning" |
| "AI grades your briefing" | "Automated formative assessment of critical thinking and technical communication" |
| "Real PostgreSQL data" | "High-fidelity synthetic enterprise datasets that replicate production-scale operational environments" |

---

## The sprint roadmap for this reframe

### Sprint R1 — Language and framing (2 weeks, post-launch)
- Replace "Module" with "Executive Incident" throughout UI
- Replace "Exercise" with "Investigation" throughout UI
- Replace score-first display with competency transcript
- Update module landing pages with incident brief format
- Update credential display to name crisis, not course

### Sprint R2 — Competency mapping (2 weeks)
- Map all 10 NovaPay investigations to competency domains
- Add competency tags to each investigation card
- Build competency evidence display in results page
- Publish Atelier Competency Framework v1 at /framework

### Sprint R3 — Hypothesis capture (3 weeks)
- Add hypothesis selection before each investigation
- Add hypothesis revision prompt after each investigation
- Store in investigation_telemetry table
- Display hypothesis revision trail in results

### Sprint R4 — ADAI grader upgrade (2 weeks)
- Write competent anchor briefing for cohort-collapse
- Upgrade to 5-axis anchor-based grader
- Re-calibrate: generic ~40, competent ~65, ideal ~90
- Update canon to require 3 anchors per incident

### Sprint R5 — Behavioral telemetry (4 weeks)
- Log query execution sequence per investigation
- Log time spent per investigation
- Log hints used
- Log reference answer accessed (after submission only)
- Build behavioral analytics dashboard for admin

---

## What does NOT change

1. The underlying exercise content — 10 investigations per module is correct
2. The CEO Briefing as the culminating artifact — correct
3. The six dimension names — locked, do not change
4. The Hot Cases structure — already uses correct language ("Hot Case" not "exercise module")
5. The PGlite SQL workbench — the instrument stays the same
6. The pricing structure — individual, corporate, academic tiers unchanged

Only the **framing, language, and measurement display** changes.
The product architecture remains intact.

---

## Summary — the single most important sentence

> **NovaPay is already 60-70% of a strong IES-aligned assessment experience. The problem is not the workflow. The problem is the framing.**

Fix the framing. The workflow is already correct.

---

*Mpingo Systems LLC · Raleigh, NC*  
*ATELIER-REFRAME-FROM-EXERCISES-TO-INVESTIGATIONS v1.0 · June 15, 2026*  
*Reference document for all future sprints touching module UI, copy, credentials, and grader output*

---

## The Auxiliary Layer Principle
**Version addition:** 1.1 · June 15, 2026

### The rule

The current exercise language does not disappear.
It becomes supporting infrastructure — subordinate to the executive
investigation framing but always present for learners who need it.

This serves three audiences simultaneously without compromising
the platform's credibility with any of them:

**Universities and IES reviewers** see a structured competency
assessment system with defined phases, mapped competencies, and
a measurable investigation arc. They see research-grade assessment
design — not a SQL tutorial.

**Individual learners (analysts, MBA students, career changers)**
see a business investigation that feels like real executive work.
The SQL scaffolding is available when they need it without making
the platform feel like a coding bootcamp.

**Emerging analysts and self-taught learners** find the SQL concept
tags, difficulty indicators, and hints exactly where they need them —
present, accessible, never condescending.

---

### The information hierarchy (locked)

Every investigation panel must follow this exact visual hierarchy.
Claude Code must implement this order. No sprint may invert it.

**Layer 1 — Executive framing (PRIMARY, always visible, prominent)**

```
PHASE 2 · PROBLEM IDENTIFICATION
Competency: Analytical Reasoning

Who is actually churning?
─────────────────────────────────────────────────
Is churn concentrated in a specific segment?
Look at plan tier, acquisition channel, and
geography. The aggregate number hides the story.
```

This is what universities see. This is what IES reviewers see.
This is what a VP of Growth would read before opening a database.

**Layer 2 — Investigation guidance (SECONDARY, visible but smaller)**

```
What to investigate:
→ Break churn by plan tier
→ Break churn by acquisition channel
→ Break churn by customer geography
→ Compare against overall churn rate
```

These are the current business questions — preserved exactly as
written. They guide the investigation without being the headline.
They answer: "what should I look for?" not "write this query."

**Layer 3 — Technical scaffolding (AUXILIARY, subordinate, on-demand)**

```
─────────────────────────────────────────────────
SQL concepts   GROUP BY · JOIN · CASE WHEN
Difficulty     Intermediate
[Show hint ↓]
```

Visually separated by a divider. Present for learners who need
orientation. Invisible to experienced analysts who do not.
The hint is collapsed by default — available on demand, never
pushed. The SQL concept tags are informational, not instructional.

**Layer 4 — Reference answer (LOCKED until submission)**

```
[Show reference answer] — appears only after graded submission
```

Never visible before submission. The unlock is the reward for
completing the investigation, not a scaffold during it.

---

### What the current questions become

The existing exercise questions are not removed. They are repositioned
as investigation guidance — the "what to look for" layer between the
executive framing and the SQL scaffolding.

**Before (current display):**
```
Exercise 04
Who is actually churning?
Is churn concentrated in a specific segment?
[intermediate]
[GROUP BY] [JOIN] [date functions]
```

**After (new display):**
```
PHASE 2 · PROBLEM IDENTIFICATION         Analytical Reasoning
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Who is actually churning?
Investigation 04 · 10

Is churn concentrated in a specific segment? The aggregate
churn number you found in Investigation 03 may be hiding a
more dangerous story underneath it.

What to investigate:
→ Break churn by plan tier — does enterprise churn differ
  from SMB?
→ Break churn by acquisition channel — are some channels
  producing higher-risk customers?
→ Break churn by cohort — is the 2025 cohort behaving
  differently from 2023?

───────────────────────────────────────────────────────────
SQL concepts   GROUP BY · JOIN · CASE WHEN   Intermediate
[Show hint ↓]                    [Show reference answer 🔒]
```

The business question ("Who is actually churning?") becomes the
headline. The current sub-question ("Is churn concentrated in a
specific segment?") becomes the first line of investigation guidance.
The SQL tags and difficulty move to the auxiliary layer.

Nothing is thrown away. Everything is reordered by importance.

---

### The three audiences and what each sees

**University faculty and IES reviewers:**
They see phases, competency domains, and a structured investigation
arc. They see "Analytical Reasoning" as the competency being
developed in Phase 2. They see behavioral evidence capture through
hypothesis revision. They see a measurement instrument, not a course.

**Individual professionals and MBA students:**
They see a business crisis and their role in resolving it. They see
"Who is actually churning?" as their assignment. They feel like an
analyst briefing a board — not a student completing homework. The
SQL scaffolding is there if they need it, invisible if they do not.

**Emerging analysts and self-taught learners:**
They see the investigation guidance ("what to look for") which
translates the business question into analytical direction without
writing the query for them. They see SQL concept tags that help
them orient. They find the hint when they are stuck without having
it pushed at them before they try.

---

### What this means for Claude Code

Every sprint that touches the exercise workbench, module landing
page, or investigation display must:

1. **Lead with phase and competency** — always the first visible element
2. **Use the investigation title as the business headline** — not "Exercise 04"
3. **Preserve the current guidance questions** — reposition as
   investigation direction under the headline, never as the primary label
4. **Move SQL tags and difficulty to the auxiliary layer** — below a
   visual divider, smaller text, subordinate styling
5. **Keep hint collapsed by default** — available on demand
6. **Lock reference answer until post-submission** — no exceptions

The workbench SQL editor, schema browser, and results panel are
unchanged. Only the left-column investigation panel changes.

---

### The trust signal this creates

Universities evaluating Atelier for curriculum integration look at
three things:

1. **Is the competency framework defensible?**
   Yes — six dimensions, each with observable behaviors, mapped to
   each investigation.

2. **Is the assessment rigorous?**
   Yes — LLM-as-judge with anchor-based comparison, 5-axis ADAI,
   calibrated scoring bands, behavioral telemetry.

3. **Does it feel like professional development or like a course?**
   With this reframe: professional development. The executive incident
   framing, the phase structure, and the competency transcript make
   the platform feel like a credentialing system — not a course catalog.

IES reviewers evaluating Phase IB proposals look at:

1. **Is there a defined competency being measured?** Yes — ADAI.
2. **Is assessment tied to observable behaviors?** Yes — per-investigation
   competency mapping.
3. **Is there behavioral evidence beyond the final output?** Yes —
   hypothesis capture and investigation telemetry (Phase 2 R&D).
4. **Is the grading instrument validated?** In progress — human vs AI
   scoring study planned for Phase 2.

Individual learners looking for career differentiation need to feel:

1. **This is real work, not a tutorial.** The executive incident framing
   delivers this.
2. **This credential means something.** The competency transcript and
   public verification URL deliver this.
3. **I am being challenged, not hand-held.** The collapsed hints, locked
   reference answers, and phase escalation deliver this.

---

### Summary of the auxiliary layer principle

> The current exercise questions, SQL tags, difficulty indicators,
> and hints are not removed. They are repositioned as supporting
> infrastructure — subordinate to the executive investigation framing.
>
> The learner encounters the business problem first.
> The analytical direction second.
> The technical scaffolding third, on demand.
>
> This serves universities and IES reviewers who need to see a
> rigorous competency measurement system, individual learners who
> need to feel like executive investigators, and emerging analysts
> who need scaffolding without being condescended to.
>
> Nothing is thrown away. Everything is reordered by importance.

---

*Addendum to ATELIER-REFRAME-FROM-EXERCISES-TO-INVESTIGATIONS v1.0*  
*Version 1.1 · June 15, 2026*  
*Mpingo Systems LLC · Raleigh, NC*
