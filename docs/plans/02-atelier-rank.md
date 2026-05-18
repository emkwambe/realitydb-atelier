# Bet 2 — Atelier Rank
**Pre-PRD plan · 2026-05-18 · Owner: Eddy**

> Status: research phase. **No code is written until §6 (Pre-PRD
> research) is complete and §3 (Rating Math Decision) is signed off.**

---

## 1. The bet, restated

Every learner has a single public number — an **Atelier Rank** — that
moves up or down with each module they solve. The number, combined
with the modules-solved list and per-axis percentiles, becomes a
career signal: a recruiter can validate a candidate's analyst
judgement at `atelier.realitydb.dev/profile/<handle>` in three
seconds.

The credential we already ship is the verifiable proof. Rank converts
that proof into a *comparison*, which is what makes it a market.

**Why this compounds with Hot Cases (Bet 1):** Hot Cases produce new
graded data every week. Without them, rank stagnates between paid
modules. With them, rank changes weekly, so the profile page is alive.

**What success looks like in 90 days:**
- Public profile page shipped at `/profile/<handle>` for every learner.
- ≥500 profiles with at least one ranked module.
- ≥20 learners enable "Open to opportunities."
- ≥1 inbound deal closed where the buyer saw a candidate profile first.
- Zero account-takeover or rank-manipulation incidents.

---

## 2. Why we research before writing the PRD

Three categories of failure mode, distinct from Hot Cases:

1. **Pedagogical failure.** Rank-chasing replaces learning. We
   accidentally optimize for "the highest scorer" instead of "the
   best analyst." The rubric warps.
2. **Privacy failure.** A learner's professional information ends up
   exposed without consent. PII leak. Or a profile becomes a
   harassment vector.
3. **Trust failure.** LLM-ghostwritten briefings inflate the
   leaderboard. The number stops meaning anything. The credential
   collapses.

These failure modes are not theoretical. Every credential platform
(Codeforces, Kaggle, LinkedIn Skill Assessments, HackerRank) has
fought all three. Codeforces survived because they took anti-cheat
seriously from day one; Kaggle survived because they version the
data behind every competition. We inherit those lessons explicitly.

---

## 3. Rating Math Decision (load-bearing artifact)

The rating algorithm is the most important decision in this bet.
Wrong here = the leaderboard is meaningless. Decision must be made
**before any UI is built**.

### 3.1 Candidate systems

| System | Strengths | Weaknesses | Used by |
|---|---|---|---|
| **Elo** | Simple, well-understood, transparent | No uncertainty modeling; new players have inflated impact | Chess, Codeforces (modified) |
| **Glicko-2** | Models rating uncertainty (RD), handles inactivity well | More complex; some users find RD confusing | Lichess, many esports |
| **TrueSkill** | Designed for teams + matches with N≥2 players | Overkill for solo briefings; Bayesian assumptions strict | Halo, Xbox Live |
| **Per-module percentile, no aggregate** | Doesn't warp behavior; honest "you are at the 84th percentile on OncoCare epistemic honesty" | No single number — recruiters want one number | None we model after |
| **Custom: weighted EMA** | Tunable, designed for our specific axes | We have to defend the math ourselves; no precedent | None |

### 3.2 Recommendation (subject to §6 validation)

**Glicko-2, with three customizations:**

1. **Rating Deviation (RD) decay.** New learners start with high
   RD (200). RD drops as more modules are scored. After 3 modules,
   RD < 80 and rank is "established." Before that, the public
   profile shows "Provisional" instead of a number.

2. **Module difficulty weighting.** Each module has a difficulty
   constant derived from the historical pass-rate distribution.
   OncoCare and ClearBank carry higher K-factor than NovaPay because
   the domain depth is genuinely greater. Difficulty is recalibrated
   quarterly, not per-submission, to keep rank stable.

3. **Epistemic-honesty weighting.** The 5-axis briefing rubric
   contributes to rank but the epistemic-honesty axis is weighted
   **2×**. This is the single most important anti-gaming feature: a
   learner who fabricates confidence to inflate "recommendation
   specificity" loses more on "epistemic honesty" than they gain.

### 3.3 What we're *not* doing

- No team / pair ranking. Solo only.
- No anonymous head-to-head. Rank changes from absolute briefing
  scores against module-difficulty constants, not from comparing
  two learners' briefings.
- No regional rankings (avoids the "top in <country>" gaming spiral).
- No daily ranking — updates land on submission, not on a schedule.

---

## 4. Guardrails

### 4.1 Pedagogical — don't warp the learning

| Risk | Mitigation |
|---|---|
| Learners optimize for rank, not skill | Variant rotation (PRD v2 A1a–A1e plan) — no two learners get the exact same hidden answer on the same module. |
| Rubric-gaming briefings (overconfident style, padded specificity) | Epistemic-honesty axis weighted 2× toward rank (§3.2.3). |
| LLM-ghostwriting inflates scores | §4.3 (anti-cheat) is the primary defense. Boardroom (Bet 3, Q4) is the structural defense. |
| Drop-off in difficulty as learners chase easy modules | Diminishing returns: re-submitting a module the learner has already passed gives 0 rank change after first attempt. |
| New learners discouraged by low rank | Provisional period (§3.2.1) hides the number until 3 modules submitted. Plus "Recent improvers" surface on the leaderboard so growth is visible. |

### 4.2 Privacy

- **Default profile state is private.** A learner must explicitly
  toggle "Public profile" to surface their handle and score
  externally.
- **Handles are pseudonyms by default.** Learner picks a handle on
  signup; the handle is never their real name unless they set
  `full_name` and toggle "Show real name."
- **No email exposure on public profiles.** Email is never on the
  public surface, ever, under any toggle.
- **"Open to opportunities" is a separate, double-opt-in toggle.**
  It surfaces the profile to recruiters (Phase 2). Setting the toggle
  requires re-confirming via email link, to prevent accidental
  disclosure.
- **Right-to-delete is one click.** Deleting profile removes the
  public page within 60 seconds; rank is anonymized in aggregated
  Atelier Index data (the data point survives but the linkage to
  the account does not).
- **No follower/follow lists.** No social graph features. Atelier
  Rank is a profile of the work, not a social network.
- **No "view count" or "who looked at your profile" features.** Those
  create surveillance loops, not value.

### 4.3 Anti-cheat / anti-gaming

- **LLM-output detection on briefings.** Every submitted briefing is
  scored by a separate model pass that estimates "likelihood of LLM
  authorship." A high score doesn't auto-reject but flags the
  submission for review. After the first 1000 submissions we
  calibrate the threshold.
- **Account-age gating.** A submission counts toward public rank
  only if the account is ≥7 days old. New-account farming is
  expensive.
- **IP/device fingerprint deduplication.** Multiple accounts from
  the same fingerprint cannot all gain rank from the same module.
  First account counts; the rest go to a "shadow" leaderboard.
- **Submission rate-limit.** ≤3 briefing submissions per learner per
  24h. Prevents brute-force iteration against the grader.
- **Cohort submissions don't count toward public rank by default.**
  When an instructor seats a cohort, those submissions hit the
  cohort leaderboard but the public rank toggle is off unless the
  learner explicitly turns it on.
- **Boardroom dependency (Q4).** When Bet 3 ships, every rank-bearing
  submission must pass a Boardroom round. LLM-ghostwritten briefings
  collapse under live Boardroom questioning. This is the strongest
  structural anti-cheat we have planned.
- **Audit log per rank change.** Every submission that moved rank
  has a stored audit record: submission ID, module, score, axis
  breakdown, rank-before, rank-after, anti-cheat scores. Public
  profile can link to "How did this score?" page that shows the
  rubric breakdown (not the full audit log — internal-only).

### 4.4 Equity — don't punish people for being new

- **Provisional period** (§3.2.1) hides numeric rank until 3 modules
  submitted.
- **Bonus K-factor for first attempt** — a brand-new learner getting
  a 60/100 on NovaPay sees more rank movement than the same score
  from a 50-module veteran. Standard Glicko behavior; calling it out
  here so it's not "fixed" by accident later.
- **Module accessibility.** If we lock high-difficulty modules behind
  paid tiers, we must surface free pathways to substantial rank
  (NovaPay free + Hot Cases free should both be rank-bearing).
- **English-language briefings only at launch.** When we go multi-
  language (post-$1M ARR per master roadmap §6), per-language ranks
  exist; we never mix.
- **Disability-accessible UI.** Profile and leaderboard must pass
  WCAG AA contrast in all three accent colors (cyan and purple need
  testing against the dark-bg foreground — purple #a855f7 on navy
  is the tightest contrast and may need to lift).

### 4.5 Recruiter-side (Phase 2, not at launch)

- **Recruiters pay.** Free for learners forever; recruiters subscribe
  ($500–$2,000/mo, TBD by §6.5 research).
- **Recruiters cannot bulk-export profiles.** API is search +
  contact-request, not download. Reasonable rate limits.
- **Contact requires double opt-in.** Recruiter requests contact;
  learner approves or rejects from inside the platform. No emails
  are exposed without explicit per-recruiter approval.
- **No "salary expectations" or other compensation fields.** Profile
  is about analytical work product, not bargaining position. We do
  not become a comp data broker.
- **Recruiter terms of service forbid harassment, discrimination,
  cold-spam.** Violations = banned. Bans are permanent and
  rate-limited from re-registering.

---

## 5. Surface area

| Surface | Purpose |
|---|---|
| `/profile/<handle>` | Public learner profile. Rank, axis percentiles, modules solved with crisis names. |
| `/account/profile` | Authenticated edit-your-profile surface. Handle, public/private toggle, "Open to opportunities" toggle. |
| `/leaderboard` (Phase 1.5) | Global top-100, recent-improvers, by-axis filters. Optional opt-in to appear. |
| `/account/rank` | Authenticated view of "your rank history" — chart, audit log of changes. |
| `/recruiters` (Phase 2) | Recruiter portal. Search by axis, module solved, "open to opportunities" filter. |

Routes that **do not exist** today and should not be created until the
PRD lands. We extend existing `/account/*` for the authenticated
half, and add `/profile/*` for the public half.

---

## 6. Pre-PRD research (must complete before PRD)

### 6.1 Rating math validation
- **Owner:** Eddy + lead eng.
- **Output:** A simulation notebook (Python or TypeScript) that
  replays the existing ~N graded briefings through Glicko-2 with
  the §3.2 customizations. Stress-tests: (a) new-learner growth
  curve, (b) sandbagging defense, (c) decay behavior under
  inactivity, (d) module-difficulty calibration stability.
  Output recommendation: confirm Glicko-2 or pivot to alternative.
  Lives in `docs/research/atelier-rank/rating-math-sim/`.
- **Deadline:** Before PRD draft.

### 6.2 Privacy review
- **Owner:** Eddy + external counsel (combined GDPR/CCPA review).
- **Output:** Privacy memo specifying: data we store, data we
  expose publicly, data we expose to recruiters, retention windows,
  right-to-delete flow, data-portability response time, breach-
  notification policy. Lives in
  `docs/research/atelier-rank/privacy-memo.md`.
- **Deadline:** Before PRD draft.

### 6.3 Anti-cheat prior-art research
- **Owner:** Eddy.
- **Output:** A 5–10 page summary of how Codeforces, Kaggle,
  HackerRank, LeetCode, and Lichess handle cheating, with specific
  applicability notes for Atelier. Includes the current state of
  LLM-text detectors (false positive rates, adversarial robustness)
  and the realistic ceiling we should set. Lives in
  `docs/research/atelier-rank/anti-cheat-prior-art.md`.
- **Deadline:** Before PRD draft.

### 6.4 Profile-page wireframes
- **Owner:** Design contractor (master roadmap §4) + Eddy.
- **Output:** Three wireframe options for `/profile/<handle>`:
  (a) minimal — rank + modules solved, (b) rich — adds axis
  percentiles + crisis names + chart, (c) recruiter-optimized —
  emphasizes "Open to opportunities" + filters. Lives in
  `docs/research/atelier-rank/profile-wireframes/`.
- **Deadline:** Before PRD draft.

### 6.5 Recruiter willingness-to-pay research
- **Owner:** Eddy.
- **Output:** ≥10 recorded conversations with talent-acquisition
  leads at Series B+ SaaS, F500 L&D, MBA-program career services
  offices. Specific questions: (a) what would you pay for a
  validated business-analyst rank that wasn't gameable; (b) would
  you accept a contact-request flow vs. direct email; (c) what
  filters matter most. Output is a memo + pricing recommendation.
  Lives in `docs/research/atelier-rank/recruiter-discovery.md`.
- **Deadline:** Before Phase 2 (~Q1 2027). Phase 1 doesn't need this.

### 6.6 Handle/username policy
- **Owner:** Eddy.
- **Output:** A one-page policy: allowed characters, reserved
  handles, profanity/impersonation handling, handle-change frequency
  limits. Lives in
  `docs/research/atelier-rank/handle-policy.md`.
- **Deadline:** Before PRD draft.

### 6.7 Migration plan for existing learners
- **Owner:** Lead eng.
- **Output:** How do we retroactively grant rank to learners who
  already completed modules before rank existed? Two options:
  (a) backfill all existing scores via the rating math —
  retrospective leaderboard; (b) rank starts from launch day,
  prior scores show on profile but don't move rank. Recommend (a)
  pending §6.1 simulation results. Lives in
  `docs/research/atelier-rank/migration-plan.md`.
- **Deadline:** Before PRD draft.

### 6.8 Accessibility audit
- **Owner:** Design contractor.
- **Output:** WCAG AA pass on the proposed profile-page wireframes,
  with specific attention to the cyan and purple accents on
  the navy background. Recommendations on contrast adjustments.
  Lives in `docs/research/atelier-rank/a11y-audit.md`.
- **Deadline:** Before PRD draft.

---

## 7. Open questions for the team

1. **Default handle on signup.** Auto-generate (`learner-7f3a2c`) and
   let the user rename, or force a chosen handle at signup? Friction
   tradeoff vs. cleaner first impressions.
2. **One rank or three.** Single Atelier Rank, or one-per-domain
   (Finance Rank, Healthcare Rank, Compliance Rank)? Counter: three
   ranks mean three weaker signals. Single rank is sharper.
3. **Public leaderboard from launch?** Or wait until N ≥ 1000
   profiles? Leaderboard is the most viral surface; also the most
   prone to gaming early. Recommendation: launch the leaderboard
   90 days after the profile page.
4. **Rank decay for inactive accounts.** Glicko-2 has built-in
   uncertainty growth under inactivity. Do we surface that as
   visible decay ("your rank dropped 30 points after 6 months
   inactive") or only as a "Provisional again" badge?
5. **Hot Case rank counting.** Tie-in to Bet 1 §4.4 — separate
   "Hot Case score" for 90 days, then integrate. Decision needs to
   be made at both ends, here and there, jointly.
6. **Cohort-acquired rank.** If a Pro instructor cohort produces
   excellent briefings, should those count toward public rank? Risk:
   employers can sponsor strong candidates into rank. Recommendation:
   off by default, on by individual learner opt-in.
7. **Time-bounded rank.** Should we show "rank 6 months ago" too,
   so a learner can demonstrate growth? Easy add; only valuable if
   recruiters actually want it. Defer to §6.5.

---

## 8. The PRD that comes next (outline)

Once §6 (especially §6.1, §6.2, §6.6, §6.7) is complete, the PRD
writes in ~5 days. Outline:

- **§1 Goals + non-goals** — Inherit from this plan.
- **§2 User stories** — Learner signs up; learner submits first
  module; learner crosses provisional threshold; learner toggles
  public; recruiter views profile; learner deletes profile.
- **§3 Rating math spec** — Glicko-2 with §3.2 customizations.
- **§4 Privacy + permissions matrix** — Who sees what, when, with
  what consent.
- **§5 Anti-cheat measures and audit log schema**.
- **§6 UI surfaces** — Profile page, account settings, leaderboard
  (Phase 1.5), rank history.
- **§7 Migration plan** — From §6.7 research output.
- **§8 Metrics** — Profile creation rate, public-toggle rate,
  recruiter inbound (Phase 2), rank-distribution health.
- **§9 Phase 2 — Recruiter portal** — Deferred; specced separately
  in Q1 2027.
- **§10 Open issues** — From §7 of this plan.

The TRD covers: profiles table schema, public-profile rendering
(SSG vs. ISR — likely ISR with on-demand revalidation), rank
calculation job (per-submission), audit-log storage, LLM-detection
integration, sitemap inclusion, search/SEO for profile pages.

---

## 9. Sequencing — first 6 weeks of execution

Week 1–2 of Bet 2 overlap with Bet 1 (Hot Cases) launch. This is
intentional — Bet 2 read-only depends on graded data which Bet 1
generates.

| Week | Milestone |
|---|---|
| 1 | §6.1 rating-math simulation kicks off. §6.3 anti-cheat prior-art research. |
| 2 | §6.2 privacy memo. §6.4 wireframes drafted. §6.6 handle policy. |
| 3 | §6.7 migration plan. §6.8 accessibility audit. PRD §1–§5 drafted. |
| 4 | PRD complete. TRD drafted. Schema additions reviewed. |
| 5 | **Profile page + Glicko engine + account/profile settings build.** |
| 6 | **Public profile pages live for opted-in learners.** |

Week 7+: leaderboard buildout (Phase 1.5). Phase 2 (recruiter portal)
deferred to Q1 2027 per master roadmap.

---

## 10. How Bet 1 and Bet 2 fit together — the cohesive picture

This is why these two are first. Each makes the other viable.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Bet 1 — Hot Cases                                          │
│   ──────────────────                                         │
│   Every Monday: a free 30-minute module                      │
│   that generates a graded briefing.                          │
│                                                              │
│   Output: weekly stream of graded learner work.              │
│   That stream is the fuel for everything downstream.         │
│                                                              │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Bet 2 — Atelier Rank                                       │
│   ──────────────────                                         │
│   Every graded briefing updates a public number              │
│   that recruiters can read.                                  │
│                                                              │
│   Without Bet 1, rank ossifies between paid modules.         │
│   Without Bet 2, Hot Case submissions die at the briefing.   │
│                                                              │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Bet 3 — The Boardroom (Q4)                                 │
│   ──────────────────                                         │
│   Defends rank against LLM-ghostwritten briefings.           │
│                                                              │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Bet 6 — Atelier Open (Q4)                                  │
│   ──────────────────                                         │
│   Hot Case format + rank ladder + Boardroom defense          │
│   = the tournament product.                                  │
│                                                              │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   Bet 10 — Atelier Index (Q4)                                │
│   ──────────────────                                         │
│   Annual report on how the rank distribution                 │
│   moves across industry, axis, tenure.                       │
│                                                              │
│   Press funnel. Industry reference.                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Removing any one of Bets 1, 2, or 3 collapses the chain. That's why
they are the first three. Everything downstream (Open, Index,
Marketplace) is amplification on top.

---

*Signed-off when §3 (Rating Math Decision) is reviewed by founder +
first eng hire + simulation results from §6.1 are in hand. Before
that signature, this is a draft.*
