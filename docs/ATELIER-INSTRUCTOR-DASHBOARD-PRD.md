# Atelier — Instructor Dashboard
## Product Requirements Document v1.0
**Date:** September 2026  
**Owner:** Eddy Mkwambe · Mpingo Systems LLC  
**Status:** Approved — first institutional feature, builds before university sales begin  
**Depends on:** ATELIER-ANSWER-KEYS-PRD.md · ATELIER-CURRICULUM-FRAMEWORK.md  
**Read before:** Any sprint touching instructor routes, cohort management, or institutional pricing

---

## Why this exists before university sales

You cannot sell Atelier to a university without an instructor dashboard.
Not because universities demand it as a feature — because without it,
no faculty member can responsibly assign Atelier in a course.

A faculty member assigning Atelier to 30 students needs to:
- Know which students have started and which have not
- See individual scores without opening 30 separate accounts
- Review and override AI grades before they become official
- Export a grade report for their LMS
- Show the department chair that the assessment is rigorous and human-reviewable

Without these five capabilities, Atelier is a self-study tool.
With them, it is a course platform — and that is what universities buy.

The instructor dashboard is also the IES research infrastructure.
Every pilot study, every learning gains measurement, every human vs AI
scoring comparison runs through instructor dashboard data.

---

## User types

**Instructor**
A faculty member who assigns Atelier modules or Hot Cases to a cohort.
Can see all student work in their cohorts. Can override AI scores.
Cannot see students outside their cohorts.

**Institution Admin**
A department director or LMS administrator who manages instructor accounts
and institutional licensing. Can see aggregate data across all cohorts at
their institution. Cannot see individual student briefings (privacy).

**Atelier Admin (Eddy)**
Full access. Can create institutions, assign instructors, manage licensing.

---

## The five capabilities

### Capability 1 — Cohort onboarding

**What it is:** The ability to create a structured cohort — a named group of
students working through specific Atelier content on a defined timeline.

**Routes:**
- `/instructor` — dashboard home, list of cohorts
- `/instructor/cohorts/new` — create a cohort
- `/instructor/cohorts/[id]` — cohort detail and management

**Cohort creation form:**
- Cohort name (e.g. "BUS 542 — Fall 2026")
- Institution name
- Semester / term
- Content assigned (select modules and/or Hot Cases from available catalog)
- Start date and submission deadline per content item
- Enrollment method: link (shareable URL) or access code (6-digit)
- Maximum enrollment (optional cap)

**Enrollment link behavior:**
When a student clicks the enrollment link, they:
1. Create an Atelier account (or sign into existing)
2. Are automatically added to the cohort
3. See only the content assigned to this cohort on their dashboard
4. See the submission deadline for each assigned item

**Access code behavior:**
Student enters the 6-digit code on signup or in their account settings.
Same outcome as enrollment link — added to cohort, sees assigned content.

---

### Capability 2 — Cohort progress monitoring

**What it is:** A real-time view of where every student in a cohort stands
across all assigned content items.

**Route:** `/instructor/cohorts/[id]/progress`

**The progress grid:**

A table with one row per student, one column per assigned content item.

Each cell shows one of five states:
- ⬜ Not started
- 🟡 In progress (started at least one exercise)
- 🟠 Briefing submitted, awaiting grade
- 🟢 Graded — pass (score ≥ 70)
- 🔴 Graded — below pass (score < 70)

Clicking any cell opens the student's submission detail.

**Summary row at top:**
- % of cohort not started / in progress / submitted / passed / below pass
- Average score across all graded submissions
- Time remaining to deadline (if deadline set)

**Flags:**
- 🚩 Student has been in progress on the same exercise for 5+ days without advancing
- ⚠️ Student submitted but score is outside normal range (possible grader anomaly)

**Export:**
- "Export progress CSV" — one row per student, columns per content item showing status and score
- For LMS gradebook import

---

### Capability 3 — Score review and instructor override

**What it is:** The ability to read every student's briefing, compare it
against the answer keys, and override the AI score with a documented
justification.

**Route:** `/instructor/submissions/[submission_id]`

**Layout (four tabs):**

**Tab 1 — Student briefing**
Full text of the submitted briefing. Read-only.
Submission timestamp. Time from first exercise start to submission.

**Tab 2 — AI scores**
Per-axis ADAI scores (5 axes × 20 points each = 100).
Axis-level feedback text from the grader.
Overall score and pass/fail status.
Path detected (Path A / Path B / Other).

**Tab 3 — Answer keys**
Side-by-side Path A and Path B for this content item.
Investigation sequences, key findings, briefing requirements.
Scoring anchors (generic / competent / ideal) with example text.
Instructor notes explaining path differences.

**Tab 4 — Instructor review**
Override form (only activatable by clicking "Override AI score" button):
- Path identified: Path A / Path B / Other (describe)
- Override score per axis (5 inputs, 0-20 each)
- Total auto-calculated
- Justification textarea (minimum 50 words, word count shown)
- Internal note to student (optional, returned with grade)
- Submit override

After submit: confirmation, score updated in progress grid,
audit log entry created.

**Override visibility:**
Overridden scores show a small ✏️ icon in the progress grid.
Student sees the override score and instructor note when they
view their results — but not the instructor's internal notes.

---

### Capability 4 — Competency analytics

**What it is:** Cohort-level and individual-level views of competency
dimension performance — the data that makes Atelier useful for
curriculum design and research.

**Route:** `/instructor/cohorts/[id]/analytics`

**Cohort competency heatmap:**
A 5-row × N-column grid.
Rows: the five ADAI axes (Pattern Detection, Data Fidelity, Causal Reasoning,
Decision Quality, Executive Communication).
Columns: each student (anonymized by default, named when instructor toggles).
Cell color: red (0-8) → yellow (9-13) → green (14-20).

This immediately shows:
- Which dimensions the whole cohort struggles with
- Which students are outliers (high or low)
- Where instruction needs to focus

**Cohort vs benchmark:**
A comparison table showing this cohort's average per axis vs:
- Atelier global average (all learners, same module)
- Atelier institutional average (all cohorts at this institution)

**Individual student profile:**
Click any student → see their dimension scores across all content
they have completed (not just this cohort's content).
Shows growth over time if they have completed multiple modules.

**Export:**
- "Export competency report (PDF)" — formatted for curriculum committee presentation
- "Export raw data (CSV)" — for research use, one row per submission per student

---

### Capability 5 — Learning outcomes export

**What it is:** Formal documentation of student achievement suitable for
academic reporting, portfolio use, and LMS integration.

**Route:** `/instructor/cohorts/[id]/exports`

**Three export types:**

**Cohort completion report (PDF)**
For curriculum committees and accreditation bodies.
Shows: cohort name, content completed, pass rate, average scores per dimension,
comparison to Atelier benchmark, date range.
Formatted with Atelier branding. Suitable for institutional reporting.

**Individual competency transcripts (bulk PDF)**
One PDF per student, same format as their public competency transcript.
Includes: student name, content completed, dimension scores, credentials earned,
verification URLs. Bulk download as ZIP.

**Grade-book CSV**
One row per student. Columns: student name, email, content item, submission date,
AI score, instructor override score (if any), pass/fail, credential issued (Y/N).
Compatible with Canvas, Blackboard, D2L import formats.

---

## Database schema additions

### New table: `cohorts`

```sql
CREATE TABLE public.cohorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid NOT NULL REFERENCES public.profiles(id),
  institution_id uuid REFERENCES public.institutions(id),
  name text NOT NULL,
  term text,
  enrollment_code text UNIQUE,
  enrollment_url_token text UNIQUE,
  max_enrollment integer,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'closed', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### New table: `cohort_content`

```sql
CREATE TABLE public.cohort_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id),
  content_type text NOT NULL CHECK (content_type IN ('module', 'hot_case')),
  content_slug text NOT NULL,
  available_from timestamptz,
  deadline timestamptz,
  display_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### New table: `cohort_enrollments`

```sql
CREATE TABLE public.cohort_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id uuid NOT NULL REFERENCES public.cohorts(id),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  enrollment_method text NOT NULL CHECK (enrollment_method IN ('link', 'code', 'manual')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'dropped', 'completed')),
  UNIQUE(cohort_id, user_id)
);
```

### New table: `institutions`

```sql
CREATE TABLE public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  country text,
  type text CHECK (type IN ('university', 'college', 'community_college', 'bootcamp', 'corporate')),
  license_tier text NOT NULL DEFAULT 'semester'
    CHECK (license_tier IN ('semester', 'annual', 'enterprise')),
  license_expires_at timestamptz,
  max_instructors integer,
  max_students integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## New routes (full list)

```
/instructor                              dashboard home, cohort list
/instructor/cohorts/new                  create cohort
/instructor/cohorts/[id]                 cohort detail
/instructor/cohorts/[id]/progress        progress grid
/instructor/cohorts/[id]/analytics       competency heatmap
/instructor/cohorts/[id]/exports         export center
/instructor/submissions/[id]             submission detail + override
/instructor/answer-keys                  answer key browser
/instructor/answer-keys/[slug]           specific answer key

/admin/institutions                      institution management (admin only)
/admin/institutions/new                  create institution
/admin/institutions/[id]                 institution detail
/admin/institutions/[id]/instructors     manage instructors
```

---

## The role model

Add `instructor` to the existing role system:

```sql
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('learner', 'instructor', 'admin'));
```

Instructor role assignment: admin sets role in
`/admin/users` → find user → set role to instructor →
assign to institution.

An instructor is always also a learner — they can attempt
modules and Hot Cases themselves. Their own submissions
are excluded from cohort analytics.

---

## The IES research layer

The instructor dashboard doubles as research infrastructure.
Two capabilities are added specifically for the IES pilot study:

**Research export (instructor + admin only):**
`/instructor/cohorts/[id]/research-export`

Exports anonymized behavioral telemetry:
- Query execution sequences per student
- Time spent per exercise
- Hints used (Y/N per exercise)
- Reference answer accessed (Y/N, post-submission only)
- Hypothesis revisions (once hypothesis capture is built)

This is the data that makes the IES proposal competitive.
It shows process-level evidence of how analysts think —
not just final briefing scores.

**Human scoring comparison (admin only):**
`/admin/research/scoring-comparison`

Shows side-by-side: AI score vs instructor override score
for every overridden submission. Calculates inter-rater
agreement (Cohen's Kappa). This is the human vs AI scoring
validation study the IES proposal requires.

---

## Build sequence (three sprints)

### Sprint ID-1 — Foundation
- Migrations: `institutions`, `cohorts`, `cohort_content`, `cohort_enrollments`
- Add `instructor` to profiles role check
- `/instructor` home (cohort list, empty state)
- `/instructor/cohorts/new` (create form)
- `/instructor/cohorts/[id]` (cohort detail)
- Enrollment link and access code generation
- Student enrollment flow (link → account → cohort)

### Sprint ID-2 — Monitoring and review
- `/instructor/cohorts/[id]/progress` (progress grid)
- `/instructor/submissions/[id]` (four-tab layout)
- Override form and `score_overrides` table
- Answer key display (read-only, Tab 3 of submission view)
- Progress grid flags (stuck student, score anomaly)

### Sprint ID-3 — Analytics and exports
- `/instructor/cohorts/[id]/analytics` (competency heatmap)
- Cohort vs benchmark comparison
- Individual student profile view
- Grade-book CSV export
- Cohort completion report PDF
- `/admin/institutions` management pages

---

## Pricing implications

The instructor dashboard unlocks the institutional pricing tiers:

| Tier | What it requires | Price |
|---|---|---|
| Individual learner | No dashboard needed | $32.50/month |
| Team (10 seats) | Basic progress view only | $9,999/year |
| Semester license | Full instructor dashboard | $4,999/semester |
| Annual institutional | Full dashboard + research export | $14,999/year |
| Enterprise | Dashboard + LMS integration + custom branding | Custom |

The dashboard is what moves Atelier from the individual pricing tier
into the institutional pricing tier. It is not a feature — it is
the unlock mechanism for the higher-value customer segment.

---

## Definition of done

Sprint ID-1:
- [ ] Instructor can create a cohort with name, term, content, deadline
- [ ] Enrollment link generates and works (student clicks → creates account → enrolled)
- [ ] Access code generates and works
- [ ] Instructor sees their cohorts on `/instructor` home
- [ ] Build passes, no TypeScript errors

Sprint ID-2:
- [ ] Progress grid shows all enrolled students with status per content item
- [ ] Instructor can click any cell and see the student's full submission
- [ ] Override form saves to `score_overrides` table with audit log
- [ ] Answer keys display in Tab 3 of submission view
- [ ] Overridden score replaces AI score in progress grid (✏️ indicator)

Sprint ID-3:
- [ ] Competency heatmap renders correctly for a cohort with 5+ submissions
- [ ] Grade-book CSV exports and opens correctly in Excel
- [ ] Cohort completion report PDF generates
- [ ] Admin can create institutions and assign instructors

---

*Mpingo Systems LLC · Raleigh, NC*  
*ATELIER-INSTRUCTOR-DASHBOARD-PRD v1.0 · September 2026*
