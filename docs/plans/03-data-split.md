# The Atelier Data Split — Briefs vs. Modules
**Status:** Draft v1 · 2026-05-18 · Owner: Eddy
**Audience:** Founder + content authors + future engineering hires

> This document is the contract between Atelier's two content surfaces:
> the **full company modules** (paid, deep, narrative) and the **Weekly
> Briefs** (free, short, focused). Every new piece of content goes
> through this contract. If a draft doesn't fit one of the two shapes
> cleanly, we either reshape it or we don't publish it.

---

## 1. Why this doc exists

Six modules ship today (NovaPay through OncoCare). Each takes 40–60
hours of authoring time. That cadence cannot be the funnel: it produces
one new artefact every 6–8 weeks, which is too slow for marketing
gravity and too expensive to repeat.

Bet 1 (Weekly Briefs) introduces a second content shape — small, fast,
free. Both shapes share the same RealityDb data engine, but they serve
different functions in the business:

- **Full modules** = the deliverable. They are what we sell.
- **Weekly Briefs** = the demonstration. They are why anyone visits.

This document codifies how the two shapes are different, how they
share infrastructure, how authors decide which one a piece of content
becomes, and what rules keep the two from blurring into a confusing
middle.

---

## 2. The split, on every axis

This table is canon. If a new content piece does not fit one column
cleanly, it is reshaped or rejected.

| Dimension | Full Module | Weekly Brief |
|---|---|---|
| **Authoring time** | 40–60 hours | 4–10 hours |
| **Tables in schema** | 10–13 | 3–4 |
| **Rows of data** | ~50,000 | ~5,000 |
| **Scenario variants** | 2–3 (baseline + scenario-a + scenario-b) | 1 |
| **Exercise count** | 10 | 1–2 |
| **Briefing length** | 500–1,000 words | ~250 words (4 bullets) |
| **Rubric** | 5-axis (segmentation, causal, quantification, recommendation, epistemic honesty) | 3-axis (pattern detection, quantification, recommendation specificity) |
| **Learner time end-to-end** | 4–6 hours | 30 minutes |
| **Hidden-pattern count** | 1 main crisis + 2–3 red herrings + side stories | 1 pattern, no red herrings |
| **Citations** | Primary-source bibliography | Optional light "what this teaches" note |
| **Credential** | Signed verifiable certificate at `/verify/<certId>` | Profile badge ("Brief 001 — Cohort Collapse") |
| **Price** | $499 (one) · $1,499 (all-access) · enterprise tiers | Free forever |
| **Storage path** | `content/companies/<slug>/` | `content/briefs/<slug>/` |
| **Dataset file** | `public/data/<slug>-5k.sql` | `public/data/briefs/<slug>-1k.sql` |
| **Route** | `/companies/<slug>` | `/briefs/<slug>` |
| **Pack file** | `pack.json` (full schema, multiple narratives, variants) | `brief-pack.json` (mini schema, single narrative, no variants) |
| **Auth required to start** | Yes (the workbench writes to localStorage; the certificate writes through to Supabase) | No (anonymous learners can run exercises; email required only at briefing submission) |
| **In `PROTECTED_PREFIXES`?** | Yes (`/companies` is gated) | No (`/briefs` is public) |

---

## 3. The design centers

Both shapes use the same data engine and the same workbench. They
diverge on *intent*. Authors should keep these intents in mind when
shaping any piece of content.

### 3.1 Full module — design center

> **The learner has set aside an afternoon. They are inside a company
> in crisis. The data is wide enough that they could spend two hours
> exploring before they find anything. We grade the quality of what
> they conclude after the full investigation.**

This justifies the depth:
- Red herrings teach the analyst what *not* to chase.
- Scenario variants force comparison ("what would happen if we fixed
  this?").
- The 5-axis rubric, including epistemic honesty, is calibrated for
  a learner who has had hours to think.
- The signed certificate carries the weight because the investigation
  has weight.

A full module that ships with only one pattern, no red herrings, and a
single scenario is *not* a module — it is a Brief mis-labelled, and
the credential is over-issued.

### 3.2 Weekly Brief — design center

> **The learner has 30 minutes on a Monday morning. They came from
> an email. They want to feel something specific happen with the
> data, and walk away with a small badge that means something.**

This forces the discipline:
- One pattern only. No red herrings (they don't have time to discard
  them).
- No scenario variants (they don't have time to compare).
- Schema small enough to absorb in two minutes via the explorer.
- Rubric trims to 3 axes: pattern detection, quantification,
  recommendation specificity.
- Badge — not certificate — because the investigation is short.

A Brief that requires the learner to skim 12 tables, find one of three
patterns, and write 800 words is *not* a Brief — it's a half-built
module, and the funnel will not work.

---

## 4. Directory layout

The two shapes live in parallel folders. Neither imports from the
other. The shared dependency is the engine.

```
content/
  companies/                          # full modules — existing
    novapay/
      exercises.ts                    # 10 Exercise objects
      rubric.ts                       # 5-axis rubric + hidden story
      module.md                       # source narrative
    medcore/
    supplylink/
    towernet/
    clearbank/
    oncocare/
  briefs/                             # Weekly Briefs — NEW
    001-cohort-collapse/
      brief-pack.json                 # input to the engine
      narrative.md                    # 90-second setup copy
      exercises.ts                    # 1–2 Exercise objects
      rubric.ts                       # 3-axis rubric

public/
  data/
    novapay-5k.sql                    # full module datasets
    medcore-5k.sql
    …
    briefs/                           # NEW
      001-cohort-collapse-1k.sql      # smaller, single-variant
      …

app/
  companies/                          # existing — paid, auth-gated
    [slug]/
  briefs/                             # NEW — public, no auth
    page.tsx                          # index of briefs (latest 12 + archive)
    [slug]/
      page.tsx                        # the brief itself
      results/                        # graded result page
```

### 4.1 Naming convention for briefs

- Slug prefix is a zero-padded integer (`001`, `002`, …) to preserve
  publication order in the filesystem.
- Followed by a short kebab-case title (`cohort-collapse`,
  `supplier-concentration`, `discount-spiral`).
- Examples: `001-cohort-collapse`, `002-supplier-concentration`,
  `003-discount-spiral`.

### 4.2 Naming convention for modules

Existing pattern is preserved: company-slug-only, no number prefix
(`novapay`, `medcore`). Modules are positioned as named companies,
not sequenced exercises.

---

## 5. Pack schemas

Both shapes are inputs to the same RealityDb engine. The difference is
*shape*, not *grammar*.

### 5.1 Full-module pack — `pack.json`

```jsonc
{
  "name": "novapay",
  "label": "NovaPay",
  "industry": "fintech_saas",
  "tables": [ /* 10–13 tables */ ],
  "variants": [
    { "name": "baseline",   "narrative": { /* … */ } },
    { "name": "scenario-a", "narrative": { /* … */ } },
    { "name": "scenario-b", "narrative": { /* … */ } }
  ],
  "narrative": {
    "main_pattern":     { "id": "currency-churn", /* … */ },
    "red_herrings":     [ { "id": "geo-spike",       /* … */ },
                          { "id": "support-volume",  /* … */ } ],
    "side_stories":     [ { "id": "free-tier-trial", /* … */ } ]
  },
  "citations": [
    { "source": "Stripe Atlas 2023",   "url": "…", "claim": "…" },
    { "source": "ChurnZero 2024",      "url": "…", "claim": "…" }
    /* … */
  ],
  "quality_target": { "min_score": 97, "max_score": 99 }
}
```

### 5.2 Brief pack — `brief-pack.json`

```jsonc
{
  "name": "001-cohort-collapse",
  "label": "The Cohort Collapse",
  "industry_hint": "b2b_saas",
  "tables": [ /* 3–4 tables */ ],
  "variant": {
    "name": "default",
    "narrative": {
      "pattern": {
        "id": "cohort-churn-spike",
        "description": "Q1 2024 cohort churn at month 18, 2.5x avg",
        "bounds": {
          "cohort_share_of_signups_pct":     [18, 26],
          "cohort_churn_multiplier":          [2.2, 2.8],
          "existing_mrr_change_q3_usd":       [-30000, -15000],
          "new_mrr_added_q3_usd":             [70000, 95000],
          "headline_growth_pct":              [5, 8]
        }
      }
    }
  },
  "citations": [],                    /* optional, often empty */
  "quality_target": { "min_score": 95, "max_score": 99 }
}
```

The brief pack omits: `variants` (plural), `red_herrings`, `side_stories`.
It includes a `variant` (singular) with a single `pattern` block. The
`bounds` are the per-learner rotation ranges so two learners don't see
identical numbers but the pattern is preserved (Bet 2 anti-memorization).

### 5.3 Quality bars

- **Modules** target 97–99/100 quality on the RealityDb scorer
  (foreign-key integrity, temporal ordering, enum integrity,
  distributional realism, narrative enforcement).
- **Briefs** target 95–99/100. Slightly lower floor is *intentional*
  because the schema is smaller and certain quality dimensions
  (multi-table FK integrity, long temporal windows) carry less weight.
  A Brief that scores 96/100 is fine; a Module that scores 96/100 is
  reshaped before publish.

---

## 6. The narrative-enforcement contract

This is the single most important difference between a Brief and a
Module, beyond size.

### 6.1 Modules enforce many patterns at once

NovaPay's pack enforces:
- The currency-churn main pattern (enterprise customers with
  multi-currency needs churn at elevated rates)
- The geo-spike red herring (a single region looks bad but is
  actually noise)
- The support-volume red herring (support tickets up doesn't equal
  customer dissatisfaction)
- The free-tier-trial side story (separate cohort with different
  dynamics)

A learner who runs exercise 9 sees ~85% currency-related churn vs.
~14% non-currency. A learner who ran the wrong cut sees 22% vs. 78%.
*Both* must hold true in the same dataset, and the engine verifies
that distribution after generation.

### 6.2 Briefs enforce one pattern, cleanly

Brief 001 enforces exactly:
- Q1 2024 cohort churn rate is 2.2×–2.8× the rest of the company
- That cohort is 18%–26% of 2024 signups
- Existing-MRR change Q3 is −$15K to −$30K
- New-MRR added Q3 is $70K to $95K
- Total MRR growth Q3 is 5%–8%

Nothing else. If the engine introduces secondary patterns (a region
that happens to be over-represented, a plan tier that's churning),
those are *bugs* in the brief pack and must be flattened out before
publish.

This is what makes a brief authorable in 4–10 hours: the engine has
exactly one job, not five.

### 6.3 Why bounded variance matters

Both shapes use bounded variance for per-learner rotation. This
defends Atelier Rank (Bet 2) against rote memorization. A learner
who solves Brief 001 today sees one specific number set; tomorrow's
learner sees a different number set in the same band. They cannot
share answers; they must run the queries themselves.

The bands are tight enough to teach the same lesson, wide enough that
the answer text varies meaningfully between learners.

---

## 7. Cross-pollination — the rules

The two surfaces are siblings, not duplicates. To keep them clean:

### 7.1 What is allowed

- **A Brief pattern may be promoted into a future Module's Exercise 1.**
  If Brief 003 on supplier concentration goes viral, a future
  "SupplyOps" module can open with that pattern as the first
  exercise. The Module then expands with red herrings and a
  scenario variant. The Brief stays free; the Module is paid.
- **A Module's Exercise 1 may be republished as a Brief.** Useful
  for marketing pull tests — does this pattern land outside the paid
  context? The Brief uses a fully separate synthetic schema (not the
  Module's PostgreSQL); only the *pattern shape* is reused.
- **A Brief may reference, in passing, "this kind of thing happens at
  a Series B SaaS." A Module is the deep version.** Editorial
  freedom to mention the relationship without diluting either.

### 7.2 What is forbidden

- **A Brief never references a paid module by name in its data.**
  Cintra (Brief 001) is *not* NovaPay shrunk. They are distinct
  fictional companies with distinct synthetic schemas. Confusion
  here dilutes the Module's mystique and confuses the funnel.
- **A Brief badge is never granted credential weight equal to a
  Module certificate.** They roll up to the same `/profile/<handle>`
  page but are stored in distinct tables and rendered with distinct
  visual treatment.
- **A Module cannot ship with Brief-level narrative depth.** If a
  draft Module has only one pattern and no red herrings, it is
  reshaped into a Brief or it is not published. We do not weaken
  the Module bar to ship faster.
- **A Brief cannot ship with Module-level narrative depth.** If a
  draft Brief has three patterns and a scenario variant, it is
  promoted to a Module roadmap slot or it is trimmed. We do not
  bloat Briefs to look more substantial.

---

## 8. Credential and badge spaces

Modules and Briefs both contribute to a learner's `/profile/<handle>`
page (the public Atelier Rank surface). They contribute differently.

### 8.1 Module → signed certificate

- Generated by `lib/certificate.ts` with a SHA-256 signature.
- Public verification URL: `/verify/<certId>`.
- Recruiter-readable: "This learner solved NovaPay's
  enterprise-churn-currency-mix crisis on 2026-MM-DD."
- Counts toward Atelier Rank with full K-factor weighting.

### 8.2 Brief → profile badge

- Stored in a separate Supabase table (`brief_submissions`, distinct
  from `biz_certifications`).
- No standalone verification URL. The badge surfaces on the
  `/profile/<handle>` page only.
- Visual: a smaller badge with the brief number and pattern name
  ("Brief 001 · Cohort Collapse").
- Counts toward Atelier Rank with **reduced K-factor** (Bet 2 §4.4
  proposes 90 days of separate "Hot Case score" then integrate at
  reduced weight).

### 8.3 Why the asymmetry

Modules cost $499 (or are earned via the funnel through a fully-
priced All-Access). Briefs are free. A free 30-minute artefact must
not grant the same credential weight as a paid 4-hour investigation,
or the credential market breaks. Briefs *feed* the credential ladder;
Modules *anchor* it.

---

## 9. Authoring workflow per shape

### 9.1 Module — the existing process

Already documented in `docs/PRD-TRD-v2.md` and the per-company files.
Not repeated here. Cadence: a new module every 6–8 weeks of focused
authoring. Six modules live as of 2026-05-18.

### 9.2 Brief — the new process

Per the Weekly Brief example doc (`/tmp/atelier-weekly-brief-001-example.md`
in the team's records), one Brief is ~10 hours of authoring time
split as:

| Step | Time |
|---|---|
| Write `brief-pack.json` | 4 hours |
| Generate + QA dataset | 1 hour |
| Write 90-second narrative | 30 min |
| Write 1–2 exercises + reference SQL | 1.5 hours |
| Write briefing prompt | 20 min |
| Define 3-axis rubric for grader | 1 hour |
| Self-solve QA | 1.5 hours |
| Write Monday email | 20 min |
| Publish-page assembly | 30 min |
| **Total** | **~10 hours** |

A buffer of 3 pre-built Briefs must exist before Brief 001 publishes
(non-negotiable, per `docs/plans/01-hot-cases.md` §6.6). The cadence
is then publish-from-buffer, build-to-buffer — never publish-this-
week's-work.

---

## 10. Authoring decision tree

When someone (Eddy, a contractor, a future contributor) has an idea
for new content, they decide which shape it becomes using this tree:

```
Does the pattern require investigation across 10+ tables to be
realistic?
  ├── Yes → Module candidate
  └── No  → continue
       │
Does the pattern have meaningful red herrings the learner must
discard?
  ├── Yes → Module candidate
  └── No  → continue
       │
Does the pattern's lesson benefit from a scenario variant
("what if we fixed it?")?
  ├── Yes → Module candidate
  └── No  → continue
       │
Can a competent analyst learn the lesson in 30 minutes?
  ├── Yes → Brief candidate
  └── No  → reshape until the lesson trims to 30 min, or shelve
```

Anything that lands in the middle ("kind of a Module but also kind of
a Brief") is reshaped. There is no third shape.

---

## 11. Routing, gating, and surface area

### 11.1 Routes

| Route | Public? | In `PROTECTED_PREFIXES`? |
|---|---|---|
| `/companies` | Yes | No |
| `/companies/<slug>` | Workbench: no. Briefing + results: **yes** (auth required to grade). | Yes |
| `/briefs` | **Yes** (index of all briefs, anonymous-friendly) | No |
| `/briefs/<slug>` | **Yes** (the brief itself, anonymous can run exercises) | No |
| `/briefs/<slug>/results` | Yes — but submission requires email | No |
| `/profile/<handle>` | Yes | No |
| `/verify/<certId>` | Yes | No |

### 11.2 Auth gate placement

The Module workbench writes progress to `localStorage`, so the
exercise UI works anonymously. The briefing-submission step writes to
Supabase, so it requires an account. Same pattern for Briefs:

- Anonymous learners can hit `/briefs/<slug>` and run the SQL
  exercises.
- The "Submit briefing" button on a Brief prompts for an email
  (anonymous account, low friction). The brief result + badge land
  in `brief_submissions`.
- The learner can later "claim" their anonymous brief submissions by
  signing up with the same email.

This anonymous-first pattern is a Brief-specific accommodation. It is
*not* used on Modules, which always require an account before the
workbench loads.

---

## 12. Storage schemas (Supabase additions)

The existing `biz_certifications`, `module_progress`, and
`briefing_submissions` tables stay as-is. Briefs add two new tables.

### 12.1 `briefs` — the catalog

| Column | Type | Notes |
|---|---|---|
| `slug` | text | Primary key. `001-cohort-collapse` etc. |
| `title` | text | "The Cohort Collapse" |
| `pattern_id` | text | `cohort-churn-spike` etc. |
| `published_at` | timestamptz | When this Brief went live |
| `pack_hash` | text | SHA-256 of `brief-pack.json` |
| `dataset_hash` | text | SHA-256 of the generated `.sql` |
| `engine_version` | text | RealityDb version that built the data |
| `status` | text | `live`, `archived`, `withdrawn` |

### 12.2 `brief_submissions` — graded work

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `auth.users`, nullable (anonymous-first) |
| `email` | text | Captured at submission time |
| `brief_slug` | text | FK → `briefs.slug` |
| `score` | int | 0–100 |
| `axes` | jsonb | `{ pattern_detection: 36, quantification: 26, recommendation: 20 }` |
| `briefing_text` | text | The learner's submitted briefing |
| `created_at` | timestamptz |  |

RLS: `brief_submissions` rows are visible to `user_id = auth.uid()` or
to public if the learner has set their profile public *and* opted-in
to share submission text. Default is private to learner.

---

## 13. Decision log

Decisions made while drafting this doc, captured so future authors
don't relitigate.

1. **Two shapes only.** No "mini-module" or "extended brief" middle
   ground. Authors either fit one of the two shapes or shelve the
   draft. Reason: confusion is the death of edu-tech catalogs.
2. **Briefs are anonymous-first.** The funnel demands low friction
   at the start; we capture email at submission, not at first
   workbench load. Reason: the goal of a Brief is email capture, not
   account creation.
3. **Briefs cost $0 forever.** Even after they leave the front
   page. Reason: archive Briefs are SEO real-estate; archiving them
   behind paywall would kill the long-tail funnel.
4. **Brief badges count toward rank at reduced K-factor.** The
   per-Brief score still moves rank, just less than a Module score.
   Reason: the rank ladder must reflect the depth of work.
5. **Module datasets stay at 5K rows; Brief datasets at 1K rows.**
   Smaller Brief datasets keep PGlite load times under 2s. Reason:
   30-minute experience demands sub-second startup.
6. **No real company is named in either shape.** Existing rule on
   Modules. Now codified for Briefs. Reason: legal exposure,
   editorial cleanliness.

---

## 14. What to update when a Brief ships

The first Brief publish requires editing four places. Document this
checklist now so weeks 2 and 3 are mechanical:

1. `content/briefs/<slug>/` — the four files (pack, narrative,
   exercises, rubric).
2. `public/data/briefs/<slug>-1k.sql` — the generated dataset.
3. `briefs` table in Supabase — INSERT one row with slug, hashes,
   pubdate.
4. The `/briefs` index page — auto-populates from the table; no
   code change needed once the route is built.

The Brief publish workflow becomes one git commit + one Supabase
INSERT once the scaffolding is in place. No code per brief; only
content.

---

## 15. Open questions deferred

1. **Brief tournaments.** Can a Brief become an Atelier Open
   tournament round? Bet 6 specifies tournaments use Hot-Case format;
   that means tournament rounds are large-format Briefs. Decision:
   defer until Bet 6 PRD lands.
2. **Multi-language Briefs.** If a Brief is translated into French,
   does it count as a separate Brief or as a localised version?
   Decision: defer until i18n (post-$1M ARR, per master roadmap §6).
3. **Brief co-branding.** A sponsor (Snowflake, Stripe) sponsors a
   Brief — does it appear in the catalog? Decision: defer until
   first sponsor request.
4. **Brief author attribution.** When a contractor authors a Brief
   under contract, do they get a byline? Decision: defer until first
   commissioned Brief.

---

*Mpingo Systems LLC · Charlotte, NC · The business school that runs on
live data.*
