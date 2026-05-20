# Instructor Dashboard and Custom Questions
## RealityDB Atelier — Platform Design Document
**Version:** 1.0
**Date:** May 18, 2026
**Author:** Mpingo Systems LLC — Charlotte, NC
**Status:** Design complete — ready for Claude Code sprint

---

## 1. Strategic Intent

The six Atelier modules teach students to find a business problem
using SQL. That is a necessary skill. But it is not sufficient.

A VP of Finance who finds the MidState Mutual denial spike still
needs to know:
  - Who do I tell first?
  - How do I frame this for the board?
  - What happens if I am wrong?
  - Is there a contractual obligation before I escalate?

These questions cannot be answered by SQL.
They require business judgment, stakeholder awareness,
and domain knowledge built over time.

The Instructor Dashboard gives educators the tools to inject
these questions into the Atelier workflow — making the platform
a complete business acumen training environment, not just
a SQL exercise platform.

The student cannot escape SQL entirely.
SQL remains the instrument that surfaces the evidence.
But the judgment questions force students to reason about
what to do with the evidence — which is the harder skill.

---

## 2. Two Question Types

### Type 1 — Data Questions (SQL-linked)

Student must write SQL to answer.
Platform grades: SQL output correctness + answer quality.
These extend the existing 10-exercise structure.

Example (NovaPay):
  'Which customer segment has the highest churn rate
   in the last 6 months? Show the data.'

Example (ClearBank):
  'Find all wires from the flagged accounts to offshore
   jurisdictions in the last 90 days. Show amount,
   destination, and correspondent bank.'

Grading:
  SQL runs successfully:           20 pts
  Output contains required columns: 20 pts
  Answer interpretation correct:    20 pts
  Total:                            60 pts

### Type 2 — Judgment Questions (SQL-informed)

Student uses data they already found to reason about a decision.
No new SQL required — judgment is the deliverable.
Platform grades: reasoning quality only via LLM rubric.

Example (MedCore):
  'You have found that MidState Mutual changed its prior
   authorization rules 6 months ago. The CFO meeting is
   in 48 hours. You have three options:
   A) Present findings immediately with a recommendation
   B) Request a contract review from Legal before presenting
   C) Escalate to the CMO first to align on messaging
   Which do you choose and why? What could go wrong?'

Example (ClearBank):
  'Before filing a SAR you need to notify someone internally.
   Do you call your direct manager, the BSA Officer, or Legal?
   In what order? What are the consequences of getting this wrong?'

Example (OncoCare):
  'SITE-07 has enrolled 18% of all trial patients.
   The site investigator has been with the trial since day one.
   Do you recommend immediate site closure or enhanced monitoring?
   What is the cost of being wrong in each direction?'

Example (SupplyLink):
  'You have confirmed that Zhonghe Industrial is the root cause.
   Zhonghe is also your only approved supplier for this component.
   You cannot exit them immediately without a 6-month supply gap.
   Write a one-paragraph memo to the CPO explaining your
   recommended path and why dual-sourcing should have been
   policy from the start.'

Example (TowerNet):
  'The maintenance team knew about the SE-447 backlog for
   8 months and never escalated. The CRO is asking whether
   this is a people problem or a process problem.
   What is your answer and what evidence from the data
   supports it?'

Grading (LLM rubric — 3 axes x 10 pts = 30 pts):
  Clarity:      Is the recommendation specific and actionable?
                Does the student commit to a position?
                (Vague answers score low)
  Reasoning:    Does the student show awareness of tradeoffs?
                Are alternative paths acknowledged?
                Is the logic internally consistent?
  Stakeholders: Does the student consider who is affected?
                Are downstream consequences named?
                Is organizational context shown?

---

## 3. Instructor Dashboard Features

### 3.1 Cohort Management

  Create cohort
    Name (e.g. 'Q3 2026 Analyst Cohort')
    Company assignment (one or all six modules)
    Start date and submission deadline
    Difficulty level: Standard / Advanced / Expert
    Scenario variant: Baseline / Scenario A / Scenario B
    Lock answers until deadline flag

  Invite students
    Generate invite link (expires in 7 days)
    Bulk invite via CSV (email list)
    Manual add by email

  Progress view
    Per-student: exercises completed, exercises remaining
    Briefing submitted: yes/no, score if graded
    Custom question responses: submitted/pending
    Completion rate across cohort
    Average briefing score per axis

  Export
    CSV export: student scores, briefing responses, question answers
    PDF certificates for passing students (score >= 70)

### 3.2 Custom Question Injection

  Instructors can add up to 5 custom questions per module.
  Questions appear at one of these positions:
    After exercise 3  (early -- tests initial orientation)
    After exercise 6  (mid -- tests intermediate understanding)
    After exercise 9  (late -- tests smoking gun comprehension)
    Before CEO briefing (final -- tests synthesis and judgment)

  Question creation flow:
    1. Instructor opens cohort -> Add Question
    2. Selects: SQL Question or Judgment Question
    3. Selects: injection position
    4. Writes question text (500 char max)
    5. Optionally adds rubric notes for grader context
    6. Previews how it appears to student
    7. Publishes (immediately visible to enrolled students)

  Question visibility:
    Questions are visible to students once published
    Instructors can unpublish before any student answers
    Once one student answers: question is locked (no edits)

### 3.3 Question Response Review

  Instructor sees per-question:
    All student responses in a list
    AI-generated score and axis breakdown
    AI feedback text (editable by instructor)
    Override score (instructor can adjust AI score)
    Flag for discussion (highlight for class debrief)

  Anonymized class view:
    Show all responses without names
    Useful for class discussion -- 'which of these is strongest?'

---

## 4. Technical Architecture

### 4.1 New Supabase Tables

  cohorts (already exists -- extend it)
    Add: difficulty_level TEXT DEFAULT 'standard'
    Add: scenario_variant TEXT DEFAULT 'baseline'
    Add: answer_lock_until TIMESTAMPTZ nullable
    Add: company TEXT (which module this cohort uses)

  instructor_questions (new)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
    cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE
    company TEXT NOT NULL
    position TEXT NOT NULL
      -- values: after_ex3, after_ex6, after_ex9, before_briefing
    question_type TEXT NOT NULL
      -- values: sql, judgment
    question_text TEXT NOT NULL
    rubric_notes TEXT nullable
    published BOOLEAN DEFAULT false
    created_by UUID REFERENCES auth.users(id)
    created_at TIMESTAMPTZ DEFAULT now()

  student_question_responses (new)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid()
    user_id UUID REFERENCES auth.users(id)
    question_id UUID REFERENCES instructor_questions(id)
    response_text TEXT NOT NULL
    sql_query TEXT nullable -- for sql question type only
    sql_result TEXT nullable -- JSON of query output rows
    ai_score INTEGER nullable -- 0-30 for judgment, 0-60 for sql
    ai_feedback TEXT nullable
    axis_clarity INTEGER nullable
    axis_reasoning INTEGER nullable
    axis_stakeholders INTEGER nullable
    instructor_score_override INTEGER nullable
    instructor_feedback_override TEXT nullable
    submitted_at TIMESTAMPTZ DEFAULT now()
    graded_at TIMESTAMPTZ nullable

### 4.2 New API Routes

  POST /api/grade-judgment-question
    Body: { responseText, questionText, rubricNotes, company }
    Returns: {
      score: 0-30,
      axes: {
        clarity: { score: 0-10, feedback: string },
        reasoning: { score: 0-10, feedback: string },
        stakeholders: { score: 0-10, feedback: string }
      },
      overall_feedback: string,
      passing: boolean (score >= 21 = passing)
    }

  POST /api/grade-sql-question
    Body: { sqlResult, expectedColumns, questionText, answerText }
    Returns: {
      score: 0-60,
      sql_valid: boolean,
      columns_present: boolean,
      interpretation_score: 0-20,
      feedback: string
    }

  GET /api/instructor/cohort/[id]/questions
    Returns all questions for a cohort with response counts

  GET /api/instructor/cohort/[id]/responses/[questionId]
    Returns all student responses for a question

  PATCH /api/instructor/response/[id]/override
    Body: { score, feedback }
    Instructor score override

### 4.3 New Pages

  /instructor
    Dashboard home -- list of cohorts, create new cohort button

  /instructor/cohort/[id]
    Cohort overview -- students, progress, completion rate

  /instructor/cohort/[id]/questions
    Question management -- add, edit, reorder, publish questions

  /instructor/cohort/[id]/responses/[questionId]
    Response review -- all student answers, AI scores, overrides

  /instructor/cohort/[id]/export
    CSV export of all scores and responses

### 4.4 RLS Policies

  instructor_questions:
    SELECT: authenticated users in the cohort OR the instructor
    INSERT: instructor role only
    UPDATE: instructor role only, locked after first response
    DELETE: instructor role only, locked after first response

  student_question_responses:
    SELECT: own rows only (student) OR cohort instructor
    INSERT: authenticated users in the cohort
    UPDATE: instructor only (for score override)

### 4.5 Role System Extension

  Current roles: learner, admin
  Add: instructor

  Instructor capabilities:
    Create and manage cohorts
    Add custom questions to their own cohorts
    View all student responses in their cohorts
    Override AI scores
    Export cohort data
    Cannot view other instructors cohorts

---

## 5. LLM Grading Prompt — Judgment Questions

  System prompt for /api/grade-judgment-question:

  'You are grading a business judgment response from a data analyst
   student completing a business acumen training module.
   The student has just completed a data investigation exercise
   using SQL to find a business problem. You are now grading
   their judgment response to a follow-up question.

   Grade on exactly three axes, 10 points each, 30 points total:

   CLARITY (0-10):
     10: Recommendation is specific, actionable, and commits to a position.
         The reader knows exactly what to do next.
     7:  Recommendation is clear but missing one specific detail.
     4:  Recommendation is vague or hedges without committing.
     1:  No clear recommendation. Student lists options without choosing.

   REASONING (0-10):
     10: Student shows awareness of tradeoffs, names what could go wrong,
         and explains why their chosen path is better than alternatives.
     7:  Good reasoning but one tradeoff not acknowledged.
     4:  Reasoning is one-sided. Only upside or only downside considered.
     1:  No reasoning shown. Conclusion without justification.

   STAKEHOLDERS (0-10):
     10: Student names specific stakeholders affected, considers their
         interests, and addresses downstream consequences.
     7:  Stakeholders mentioned but consequences not fully traced.
     4:  Generic stakeholder reference without specifics.
     1:  No stakeholder consideration shown.'

---

## 6. Question Library — Starter Questions per Module

These are pre-built judgment questions instructors can use
or customize. They ship with the platform as defaults.

### NovaPay (FinTech SaaS)

  After Exercise 6 (intermediate):
  'You found that enterprise customers are churning at 3x the
   rate of SMB customers. The Head of Sales argues this is
   because enterprise deals take longer to close and those
   customers have higher expectations. The Head of Product
   argues it is because enterprise customers need multi-currency
   support that does not exist yet. Both cannot be fully right.
   How do you determine which explanation the data supports?
   What additional query would you run?'

  Before CEO Briefing:
  'The fix for multi-currency support costs  and takes
   6 months. The CFO wants to defer it to next fiscal year.
   Using the revenue at risk you calculated, write a one-paragraph
   argument for why this should be funded now. Be specific about
   the cost of waiting.'

### MedCore Health (Healthcare RCM)

  After Exercise 6 (intermediate):
  'You have confirmed the MidState Mutual denial spike.
   Before presenting to the CFO you need to speak to
   someone internally. In what order do you contact:
   the Billing Director, the CMO, and Legal?
   What is the risk of getting the order wrong?'

  Before CEO Briefing:
  'MidState Mutual represents 28% of claim volume.
   If you renegotiate aggressively and they terminate the contract,
   what happens to your revenue in the next 90 days?
   How does this change your recommendation?'

### SupplyLink Operations (Supply Chain)

  After Exercise 6 (intermediate):
  'Zhonghe Industrial is your only approved supplier for
   this component category. The qualification process for
   a new supplier takes 6 months. You cannot exit immediately.
   What do you do in the next 30 days to reduce exposure
   while the long-term fix is being planned?'

  Before CEO Briefing:
  'The CPO asks: how did we get to single-source dependency
   on a supplier that now costs more than it provides?
   Write a one-paragraph answer that acknowledges the process
   failure and recommends the policy change that prevents this
   from happening again.'

### TowerNet Communications (Telecom)

  After Exercise 6 (intermediate):
  'The maintenance team knew about the SE-447 backlog for
   8 months and never escalated. The CRO wants to know
   if this is a people problem or a process problem.
   What is your answer? What evidence from the data
   supports your position?'

  Before CEO Briefing:
  'Subscribers near SE-447 are churning at 6.2%.
   You are recommending either .1M in capex or .8M
   in retention credits. The board asks: if we do the credits
   and not the maintenance, what happens in 12 months?
   Write a 3-sentence answer.'

### ClearBank Financial (AML/Banking)

  After Exercise 6 (intermediate):
  'You have identified what appears to be a structuring pattern.
   The account relationship generates  in annual fees.
   Your manager suggests waiting 30 days to gather more evidence
   before filing a SAR. The FinCEN examination is in 60 days.
   What is the risk of waiting? What is the cost of acting now?
   What do you recommend?'

  Before CEO Briefing:
  'If the SAR is filed and the accounts are frozen, the customer
   will know. If the customer is legitimate, the bank has destroyed
   a  relationship. If the customer is not legitimate, the bank
   has prevented a potentially larger loss. How do you present
   this tradeoff to the CCO in one clear paragraph?'

### OncoCare Therapeutics (Oncology)

  After Exercise 6 (intermediate):
  'SITE-07 has enrolled 432 patients over 18 months.
   Excluding them from the primary analysis raises the
   response rate from 49.8% to 54.1% -- above the FDA threshold.
   But the FDA may question a post-hoc exclusion of 18% of patients.
   What is the difference between a pre-specified exclusion criterion
   and a post-hoc one? Why does it matter to the FDA?'

  Before CEO Briefing:
  'The CMO asks: if we present Scenario A to the FDA and they
   reject the exclusion rationale, what happens to the trial?
   Write a one-paragraph risk assessment that names the worst-case
   outcome and the probability you would assign to it.
   Explain your reasoning.'

---

## 7. Pricing Model for Instructor Access

  Current pricing (student-facing):
    Single module:  
    All access:     ,499
    Team 10 seats:  ,999

  Instructor tier (new):
    Instructor Solo:      /month
      Up to 3 cohorts, 30 students, all 6 modules
      Custom questions: up to 5 per module
      Export: CSV

    Instructor Pro:       /month
      Unlimited cohorts, unlimited students
      Custom questions: unlimited
      Export: CSV + PDF certificates
      Priority grading (faster AI response)
      Anonymized class view for discussion

    Enterprise / MBA:     ,500/month
      All Pro features
      SSO integration
      LMS export (Canvas, Blackboard, Moodle)
      Dedicated onboarding call
      Custom branding (your institution logo)
      SLA: 99.9% uptime commitment

---

## 8. Build Priority

  Sprint 1 (2 days): Foundation
    Add instructor role to Supabase profiles
    Create instructor_questions table + RLS
    Create student_question_responses table + RLS
    Basic /instructor dashboard page (list cohorts)

  Sprint 2 (2 days): Question Creation
    /instructor/cohort/[id]/questions page
    Add question form (type, position, text, rubric notes)
    Question injection into exercise flow (student sees it)
    Response submission and storage

  Sprint 3 (2 days): Grading
    /api/grade-judgment-question route
    /api/grade-sql-question route
    Score display to student after submission
    Axis breakdown with feedback

  Sprint 4 (1 day): Review and Export
    /instructor/cohort/[id]/responses/[questionId] page
    Instructor score override
    CSV export
    Flag for discussion

  Sprint 5 (1 day): Starter Question Library
    Pre-built judgment questions per module (see Section 6)
    Instructors can use as-is or customize
    One-click add to cohort

  Total: 8 days of Claude Code sprints
  Parallel: landing page instructor CTA while sprints run

---

## 9. Success Metrics

  Platform:
    First instructor cohort created: Week 1 after launch
    First custom judgment question submitted: Week 2
    First instructor score override: Week 3

  Business:
    First Instructor Solo subscription: Month 1
    First MBA program on Enterprise tier: Month 3
    10 active instructor cohorts: Month 6

  Quality:
    AI grading agreement with instructor override: > 80%
    Student satisfaction with judgment question feedback: > 4.2/5
    Average judgment question score improvement
    session 1 vs session 3: > 15 points

---

*Instructor Dashboard and Custom Questions Design v1.0*
*Mpingo Systems LLC — Charlotte, NC*
*Ready for Claude Code Sprint 1*
