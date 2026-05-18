# RealityDB Atelier — Marketing & Brand Implementation
**Version:** 1.0
**Date:** 2026-05-18
**Status:** Live on landing + pricing

This document records the marketing-research findings that have been
implemented in the codebase, the visual rules that govern them, and the
canonical voice/language pieces that should be reused across new pages,
emails, and decks.

It is the source of truth for: tri-color accent system, persona
positioning, evidence-backed proof points, pricing surface, and the
voice we use when we write anything outward-facing.

---

## 1. Tri-color accent system

Atelier inherits the dark surface plus brand green from the original TRD
§9, and adds two accents from the parent realitydb.dev brand: cyan and
purple. These are the only three accent colors used on marketing
surfaces.

| Token (in `app/globals.css`) | Hex | Role |
|---|---|---|
| `--color-brand` | `#06d6a0` | Primary CTAs, success states, active nav, "the deliverable" copy |
| `--color-accent-cyan` | `#00f5d4` | The *one* highlighted phrase per heading; "the discovery" copy; learner cohort accent |
| `--color-accent-purple` | `#a855f7` | Terminal punctuation, secondary outline CTAs, "the credential" copy; enterprise / institution accent |

### Visual rules

1. **One accent per word.** Never two accents on the same word.
2. **One accent per heading.** Pick the keyword that carries the meaning
   and color *that* word. The rest of the heading stays foreground
   (`#e2e8f0`). The screenshot reference for this is the parent
   realitydb.dev hero ("Create realistic system environments
   **instantly**.").
3. **Purple is rare.** Use it for: a closing period on a major heading,
   a single secondary-CTA outline, the Enterprise pricing card.
4. **Cyan is for the verb.** "Interrogate," "Discover," "Investigation"
   — the action the user takes — gets cyan.
5. **Green is for the outcome.** "Brief the CEO," "Earn the credential,"
   "Start NovaPay" — the thing the user produces — stays brand green.
6. **No gradients.** Ever. Flat solid color, single hex.

### Where this is applied today

- `app/page.tsx` — hero ("Interrogate its dynamics in data" cyan; period
  purple). Three-card value-prop strip uses green / cyan / purple in
  sequence. Persona band uses one accent per persona. Closing reframe
  block uses cyan on the verb, purple on the outcome.
- `app/pricing/page.tsx` — section headings carry the accent for the
  audience (green for learners/teams, cyan for instructors, purple for
  Enterprise). Highlighted tier card in each row inherits the section
  accent for its border + check icons + CTA fill.
- `app/account/progress/page.tsx` — kept green-only for now (utility
  surface, not a marketing surface).

When you add a new marketing surface, follow the same rule: pick the
audience or the moment, pick the accent that matches the role table
above, do not mix more than three accents on one screen.

---

## 2. Persona-keyed positioning

Six personas from the marketing research, each with a single-sentence
headline, a sourced pain, and a falsifiable proof tied to a real
platform feature. These are the canonical headlines — reuse them in
emails, demo decks, and new landing variants.

### VP1 — L&D / Analytics Director at Series B+ SaaS

- **Headline:** "Your analysts can read a dashboard. After this, they
  brief the CEO from the database."
- **Pain (sourced):** Forrester 2022 — share of data-driven decisions
  dropped from 50% → 48% despite rising literacy spend.
  https://www.forrester.com/blogs/want-to-improve-employees-insights-driven-decision-making-data-literacy-programs-alone-wont-help/
- **Proof:** 10-seat cohort, $9,999 ($999.90/learner). Each learner
  ships a Claude-graded CEO briefing per module on a 5-axis rubric.
- **Live on:** `app/page.tsx` PersonaCard "L&D & Analytics Leaders".

### VP2 — Chief Compliance Officer at a regional bank

- **Headline:** "TD Bank paid $3.1B for AML training that was
  check-the-box. Yours doesn't have to be."
- **Pain (sourced):** OCC explicitly cited inadequate training as the
  root cause of TD's BSA failure.
  https://bankingjournal.aba.com/2024/11/td-bank-agrees-to-pay-3-1-billion-to-resolve-aml-allegations/
- **Proof:** ClearBank module ships an 18-month synthetic transaction
  set with a three-account structuring pattern worth $15M+ in FinCEN
  exposure. Graded on epistemic honesty, not just MCQ.
- **Live on:** `app/page.tsx` PersonaCard "Compliance & Clinical Ops".

### VP3 — VP Clinical Operations at biotech

- **Headline:** "When your CRC quits at 18 months, the protocol training
  quits with them. Build replicable judgment instead."
- **Pain (sourced):** SCRS 2024 — clinical research coordinator turnover
  35–61%/yr, average tenure 1.5–2 years.
  https://myscrs.org/resources/new-model-clinical-site-staffing-retention-challenges/
- **Proof:** OncoCare module — one trial site is underdosing patients,
  dragging ORR from 54.1% → 49.8%. Learners detect, decide, brief.
- **Live on:** `app/page.tsx` PersonaCard "Compliance & Clinical Ops"
  (shares the card with ClearBank — note the stat line carries both).

### VP4 — MBA Program Director

- **Headline:** "AACSB Digital Agility — not just a slide."
- **Pain (sourced):** GMAC 2024 Corporate Recruiters Survey — recruiters
  rate problem-solving and strategic thinking as top deficits in new
  MBAs while analytics hiring grows fastest of any function.
  https://www.gmac.com/-/media/files/gmac/research/employment-outlook/2024-corporate-recruiters-survey/2024_gmac_research_crs_deansummary.pdf
- **Proof:** Semester license $14,999 for unlimited students across all
  six modules. ≈$250/student in a 60-person cohort. Public verification
  URL per credential.
- **Live on:** `app/page.tsx` PersonaCard "MBA Programs"; pricing page
  MBA License tier.

### VP5 — Head of Data Analytics at enterprise

- **Headline:** "Your team writes the SQL. Now train them to be the ones
  who *decide* with the answer."
- **Pain (sourced):** McKinsey — 77% of companies lack data talent;
  Wharton–Accenture 2026 — execution skills structurally undersupplied.
  https://fortune.com/2026/01/22/skills-mismatch-economy-wharton-accenture-eric-bradlow-interview-will-ai-replace-jobs/
- **Proof:** All-Access $1,499/learner across six industry-specific
  modules. Scenario injection forces learners to commit to a position
  and own their uncertainty.
- **Status:** Not yet on landing — candidate for a dedicated
  `/for-analytics-leaders` page when we add it.

### VP6 — CHRO at Fortune 500

- **Headline:** "$400B is spent on L&D every year. 81% of it never
  transfers. Pay for the 19% that does."
- **Pain (sourced):** Bersin 2026 + Capsim transfer-of-training research.
  https://www.prnewswire.com/news-releases/ai-is-disrupting-the-400-billion-corporate-training-market-at-a-quickening-pace-warns-the-josh-bersin-company-302684945.html
- **Proof:** Enterprise tier $2,500/mo. Cohort dashboards report skill
  *demonstration* (per-axis briefing scores), not skill exposure.
- **Status:** Not yet on landing — candidate for a `/for-chro` page.

---

## 3. Sourced proof strip

A row of three statistics with primary sources is live on the landing
page (`app/page.tsx` ProofStat). When adding new ones, follow these
rules:

- **Every figure carries a clickable source URL.** No exceptions.
- **Source label includes year.** Recency matters: 2024 sources rank
  above 2020 sources for the same figure.
- **One claim per stat.** Do not chain numbers.
- **Color the figure with the accent that matches its theme.** $3.1B
  AML penalty → purple (enterprise risk). 11% confident → cyan
  (investigation gap). 48% data-driven → green (the outcome we move).

Currently live:

| Figure | Color | Claim | Source |
|---|---|---|---|
| $3.1B | purple | TD Bank 2024 AML penalty, attributed to inadequate training | ABA Banking Journal 2024 |
| 11% | cyan | of employees fully confident with data vs. 85% of execs calling it critical | DataCamp 2025 |
| 48% | green | of business decisions are data-driven, down from 50% in 2021 | Forrester 2022 |

Candidates to swap in or add later (all in the marketing brief):
- $109.4B/year US productivity loss from data-anxiety (Accenture/Qlik)
- 81% of training never transfers to the job (Capsim, Broad & Newstrom)
- 35–61% annual turnover at clinical research sites (SCRS 2024)

---

## 4. Voice and language

The voice that fell out of the marketing research and that the landing
page now embodies:

1. **Direct over decorative.** "TD Bank paid $3.1B" beats "Compliance
   training carries significant financial risk."
2. **Active verbs, not capabilities.** "Interrogate the database." Not
   "Database interrogation capabilities."
3. **Name the artifact, not the process.** "A CEO briefing graded
   against a 5-axis rubric." Not "AI-assisted assessment."
4. **One promise per surface.** Each page makes exactly one falsifiable
   claim and offers proof.
5. **No banned words:** synergy, leverage, unlock, transformative,
   cutting-edge, best-in-class, world-class, revolutionize, next-gen,
   ecosystem, holistic.
6. **One- or two-sentence paragraphs.** Trading-terminal density.
7. **No vendor leakage in marketing copy.** Prefer **"auto-graded
   and ranked"** over "Claude-graded" / "LLM-graded" / "AI-graded"
   anywhere a buyer or learner sees it. The reasons:
   - Outcome-language, not vendor-language. Buyers care what they
     get, not which API we called.
   - Future-proof. If we move to Claude 5, swap providers, or run a
     local fine-tune for cost, the copy doesn't break.
   - Pre-empts the "why don't I just use Claude directly?" objection.
     The rubric and the rank ladder are ours; the model behind them
     is interchangeable.

   **Where "Claude" *is* fine:** technical docs, `CLAUDE.md`,
   `docs/TRD*`, code comments, the build-decisions section. Anything
   internal-engineering-facing.

   **Three forms of the phrase, by surface size:**
   | Surface | Phrasing |
   |---|---|
   | Pills, hero badges | `auto-graded and ranked` |
   | Subheads, persona cards | `auto-graded on a 5-axis rubric · public rank` |
   | Proof sections, pricing footers | `Auto-graded against a 5-axis rubric including epistemic honesty. Score feeds your public Atelier rank.` |

   Long-form copy must always tie "auto-graded" back to the rubric,
   so a casual reader does not mis-hear it as row-set matching (the
   DataCamp pattern we explicitly position against).

When in doubt, read the closing reframe block on the landing page out
loud — "Your analysts can read a dashboard. After this, they can
interrogate the database behind it and brief the CEO." That is the
canonical sentence; everything else either supports it or expands a
specific persona's version of it.

---

## 5. Pricing surface — what changed

The pricing page now ships **seven** tiers in two rows:

**Row 1 — Learners and teams (green section):**
- Module $499 · one-time
- All-Access $1,499 · one-time (highlighted)
- Team $9,999 · 10 seats · 1 year — the under-$10K procurement-threshold
  cohort tier
- MBA License $14,999 · semester

**Row 2 — Instructors and programs (cyan section):**
- Instructor Solo $299/mo
- Instructor Pro $799/mo (highlighted)
- Enterprise / MBA $2,500/mo (purple — the only purple card)

The instructor + enterprise tiers were specified in
`INSTRUCTORDASHBOARDPLAN.md` §7 but were not yet on the public pricing
page; they are now live. The pricing copy uses the canonical numbers
from the platform background brief — please update both this doc and
`INSTRUCTORDASHBOARDPLAN.md` §7 in lockstep if any number changes.

---

## 6. Files touched

- `app/globals.css` — added `--color-accent-cyan` and
  `--color-accent-purple` tokens with the usage-rule comment block.
- `app/page.tsx` — purple period in hero; tri-color value-prop strip;
  new ProofStat row with sourced figures; new "Built for" PersonaCard
  band; closing reframe block.
- `app/pricing/page.tsx` — refactored to two rows, added three new tiers
  (Instructor Solo / Pro / Enterprise), per-section accent + per-card
  accent driven by a single `Accent` union and `ACCENT_HEX` map.
- `docs/MARKETING-AND-BRAND.md` — this file.

Not touched (intentionally out of scope for this change):
- Any company module (`content/companies/**`, `app/companies/**`)
- Any exercise component (`components/exercise/**`)
- PGlite / grading / certificate libraries
- Auth code (already covered by the prior fix)

---

## 7. What's still on paper

These pieces from the marketing research have not been built yet and
are candidates for the next pass:

- **`/why` page** — long-form proof: the 12 pain points with sources,
  the competitive-gap matrix, and the one-page pitch as a sharable URL.
- **`/for-ld`, `/for-compliance`, `/for-mba`, `/for-cdo`, `/for-chro`
  micro-pages** — one persona per page, single CTA, designed to be
  linked from cold emails. The PersonaCard band on the landing is the
  preview; the dedicated pages would carry the full argument.
- **Outbound email templates** — three are in
  `/tmp/atelier-market-brief.md` (Sections 5.1–5.3). When we wire up an
  outbound CRM, those become the seed sequences.
- **VP5 + VP6 personas** — Head of Analytics and CHRO are documented
  here but do not yet have a card on the landing. Add when the
  PersonaCard band grows to a fourth column or a second row.

---

*Mpingo Systems LLC — Charlotte, NC. The business school that runs on
live data.*
