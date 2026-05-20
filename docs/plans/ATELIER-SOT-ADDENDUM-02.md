# Atelier Source of Truth — Addendum 02
**Date:** 2026-05-20
**Applies to:** ATELIER-SOURCE-OF-TRUTH.md §5 (Product Architecture)
**Status:** Canonical. Extends the SOT with the scaffolding layer architecture.

---

## A2.1 What these six modules are — and are not

These six modules are NOT:

- Standalone courses
- A separate product
- A competitor to the company modules
- A replacement for the workbench

They ARE:

The **conceptual scaffolding layer** — short, non-SQL content that
grounds the learner in business acumen before they touch data. The
layer that closes the gap between "I signed up" and "I understand
what I'm looking for in this dataset."

The problem the scaffolding layer solves: Atelier currently assumes
the learner arrives with foundational business knowledge already
internalized. Most don't. A learner who opens NovaPay without knowing
what a value chain is, what ARR means, or how churn connects to
revenue will query the data but not understand what they're finding.
The scaffolding layer changes that.

**The correct mental model:**

```
Scaffolding layer          Company module / Hot Case
──────────────────         ──────────────────────────
10–20 minutes              4–6 hours / 30 minutes
Conceptual                 Applied
Reads like a briefing      Feels like an investigation
Before the workbench       Inside the workbench
No SQL                     All SQL
Explains the framework     Tests the framework under pressure
Free (all tiers)           Paid (company modules) / Free (Hot Cases)
```

Every company module and Hot Case links to the relevant scaffolding
modules as prereading. The learner chooses whether to read them.
The rubric does not reward having read them — it rewards the judgment
that reading them would have built.

---

## A2.2 The six scaffolding modules — mapped to dimensions and content

### Module S1 — Foundations of Business

**Maps to:** Financial Intelligence (primary), Operational Intelligence (secondary)
**Dimension anchor question it prepares:** "Does this finding change how money moves through the business?"

**What it covers:**

*How companies work — functions, value chains*

Every company module in Atelier is a company in crisis. The learner
cannot find the crisis without understanding how the company is supposed
to work. This section covers:

- The five business functions (finance, operations, sales/marketing,
  HR, technology) and how they interact
- Porter's value chain — primary activities (inbound logistics,
  operations, outbound logistics, marketing & sales, service) and
  support activities (infrastructure, HR, technology, procurement)
- How value is created, captured, and destroyed at each link
- What "margin" means at each stage of the chain
- Why a problem in one function shows up as a number in another

*Business models explained — B2B, SaaS, subscription, marketplace, etc.*

Each Atelier company module uses a specific business model. The
learner who does not understand SaaS unit economics will miss the
currency-mix churn story in NovaPay. This section covers:

- B2B vs. B2C — how the sales motion changes the financial structure
- SaaS: ARR, MRR, churn, NRR, LTV, CAC — the six numbers that
  define a SaaS business's health
- Subscription: recurring vs. one-time, cohort dynamics, expansion revenue
- Marketplace: take rate, GMV, liquidity, supply/demand balance
- Healthcare: RCM, net collection rate, payer mix, denial rate
- Banking: NIM, AML exposure, capital ratios, regulatory risk

**Theoretical grounding:**
- Porter, M. (1985). *Competitive Advantage.* — Value chain analysis.
- Osterwalder, A. & Pigneur, Y. (2010). *Business Model Generation.*
  Wiley. — The Business Model Canvas. The clearest visual framework
  for understanding how companies create and capture value.
- Christensen, C. (1997). *The Innovator's Dilemma.* Harvard Business
  School Press. — Business model disruption. Why existing models
  fail under competitive pressure.

**Content format:**
- Two visual explainers: value chain diagram (interactive), business
  model canvas (fillable)
- One worked example per model type: "Here is NovaPay's business
  model. Here is where the churn story lives in it."
- Reading time: 12–15 minutes

**Linked to company modules:** NovaPay, all six modules as prereading

---

### Module S2 — Finance & Metrics

**Maps to:** Financial Intelligence (primary)
**Dimension anchor question it prepares:** "Does this finding change how money moves — and by how much?"

**What it covers:**

*Profit/loss, balance sheet, cash flow — the three statements*

The three financial statements are the financial nervous system of
every company. A learner who cannot read them cannot understand what
ClearBank's structuring pattern costs, what MedCore's collection rate
drop means in dollar terms, or why OncoCare's ORR matters to investors.
This section covers:

- Income statement (P&L): revenue, COGS, gross margin, operating
  expenses, EBITDA, net income — what each line means and what moves it
- Balance sheet: assets, liabilities, equity — what a company owns,
  owes, and is worth at a moment in time
- Cash flow statement: operating, investing, financing activities —
  why a profitable company can run out of cash
- How the three statements connect: net income → retained earnings →
  equity; depreciation → P&L and cash flow

*KPIs, breakeven, ROI, IRR — the decision metrics*

Financial intelligence is not just reading statements — it is using
financial metrics to evaluate decisions. This section covers:

- KPIs by vertical: SaaS (ARR, churn, NRR, CAC, LTV), Healthcare
  (net collection rate, denial rate, days in AR), Banking (NIM,
  efficiency ratio, AML exposure), Supply chain (COGS %, on-time %)
- Breakeven analysis: fixed costs, variable costs, contribution margin
- ROI: how to calculate, how to present, how to challenge
- IRR: what it measures, when it matters, how to interpret it without
  a spreadsheet
- Unit economics: the one metric per business model that tells you
  whether the engine is working

**Theoretical grounding:**
- Penman, S. (2013). *Financial Statement Analysis and Security
  Valuation.* McGraw-Hill.
- Ittelson, T. (2009). *Financial Statements: A Step-by-Step Guide.*
  Career Press. — The most accessible entry point.
- Koller, T., Goedhart, M. & Wessels, D. (2020). *Valuation.*
  McKinsey & Company / Wiley. — The practitioner standard for
  connecting financial metrics to business value.

**Content format:**
- Three annotated statement templates (P&L, balance sheet, cash flow)
  with hover-over explanations on every line
- KPI reference table by vertical — downloadable
- One worked example: "Here is MedCore's collection rate. Here is
  where it lives in the P&L. Here is what a 4-point drop means
  in dollar terms at this revenue scale."
- Reading time: 15–20 minutes

**Linked to company modules:** MedCore (primary), ClearBank, all modules

---

### Module S3 — Strategy & Markets

**Maps to:** Strategic Intelligence (primary)
**Dimension anchor question it prepares:** "What does this finding tell us about where the organization is winning, losing, or about to lose?"

**What it covers:**

*Competitive advantage — why some companies win and others don't*

The CEO briefing recommendation axis requires the learner to frame
their finding in strategic context. This section covers:

- What competitive advantage actually means: sustained ability to
  create more value than competitors at a lower cost or higher
  willingness to pay
- Porter's three generic strategies: cost leadership, differentiation,
  focus — and what each implies about the data patterns that matter
- Sustainable vs. transient advantage: why most advantages erode
  and what the data signals of erosion look like
- The resource-based view: valuable, rare, inimitable, non-substitutable
  (VRIN) — the four conditions for durable advantage

*Porter's Five Forces — reading the competitive environment*

- Threat of new entrants: what the data patterns of competitive entry
  look like (price compression, customer acquisition cost spikes)
- Bargaining power of suppliers: what single-source concentration
  looks like in procurement data (SupplyLink)
- Bargaining power of buyers: what churn data reveals about customer
  power (NovaPay, TowerNet)
- Threat of substitutes: what usage pattern changes signal substitution
- Competitive rivalry: what margin compression and win-rate changes reveal

*SWOT, PESTEL — structured environmental analysis*

- SWOT as a synthesis tool, not a brainstorm: it is only useful when
  each cell is grounded in data, not opinion
- PESTEL: Political, Economic, Social, Technological, Environmental,
  Legal — the six external forces that shape industry dynamics
- How to use PESTEL to contextualize a Hot Case (the real event that
  inspired the dataset existed in a specific PESTEL environment)

**Theoretical grounding:**
- Porter, M. (1980). *Competitive Strategy.* Free Press.
- Porter, M. (1985). *Competitive Advantage.* Free Press.
- Rumelt, R. (2011). *Good Strategy / Bad Strategy.* Crown Business.
- Barney, J. (1991). "Firm Resources and Sustained Competitive
  Advantage." *Journal of Management, 17(1), 99–120.* — The
  foundational resource-based view paper.

**Content format:**
- Interactive Five Forces mapper: learner inputs signals from a
  dataset, tool maps them to the relevant force
- SWOT template with data-grounding prompts ("What in the data
  supports this strength?")
- PESTEL reference card by vertical
- Reading time: 15–20 minutes

**Linked to company modules:** All modules (primary strategic context
for every CEO briefing recommendation)

---

### Module S4 — Decision-Making Skills

**Maps to:** Decision Intelligence (primary), Augmented Intelligence (secondary)
**Dimension anchor question it prepares:** "What would you need to believe for this recommendation to be wrong — and have you considered it?"

**What it covers:**

*Risk analysis, opportunity cost, trade-offs*

Decision intelligence is where most business acumen development fails:
learners are taught frameworks but not the cognitive errors that
frameworks are supposed to prevent. This section covers:

- Opportunity cost: every decision forecloses alternatives — what is
  the real cost of the recommended action?
- Risk analysis: probability × impact; the difference between risk
  (quantifiable uncertainty) and uncertainty (unquantifiable)
- Trade-off analysis: short-term vs. long-term, local vs. systemic,
  certain vs. uncertain outcomes
- The pre-mortem: Kahneman's technique for finding what could go wrong
  before committing to a recommendation
- The confirmation bias trap: why analysts find what they're looking
  for in data and how to structure analysis to prevent it
- Epistemic honesty in practice: how to calibrate confidence language
  to evidence strength ("the data suggests" vs. "the data proves")

*Game-based decision-making practice*

This section is interactive, not text-based:

- Decision scenario: the learner is given an incomplete dataset and
  must make a recommendation with acknowledged uncertainty
- Three branching paths: each choice reveals new information that
  either validates or challenges the initial recommendation
- The learner cannot replay with different choices — the first
  decision is the data point (mirrors the Boardroom constraint)
- Debrief: the learner sees where their reasoning matched the
  "expert consensus" recommendation and where it diverged

**Theoretical grounding:**
- Kahneman, D. (2011). *Thinking, Fast and Slow.* Farrar, Straus
  and Giroux.
- Kahneman, D., Sibony, O. & Sunstein, C. (2021). *Noise.*
  Little, Brown.
- Russo, J. & Schoemaker, P. (2002). *Winning Decisions.*
  Currency Doubleday.
- Taleb, N. (2007). *The Black Swan.* Random House.
- Klein, G. (1998). *Sources of Power: How People Make Decisions.*
  MIT Press. — Naturalistic decision-making. How experts actually
  decide under time pressure and uncertainty.

**Content format:**
- One interactive decision scenario (branching, non-replayable)
- Cognitive bias reference card: the seven biases most likely to
  distort business analysis (confirmation, anchoring, availability,
  representativeness, overconfidence, sunk cost, groupthink)
- Pre-mortem template
- Reading time + interactive: 20–25 minutes

**Linked to company modules:** All modules (primary decision scaffold
for the CEO briefing); Boardroom (direct preparation for adversarial
Q&A)

---

### Module S5 — Communication & Influence

**Maps to:** Communication & Influence Intelligence (primary)
**Dimension anchor question it prepares:** "If the CEO read only the first two sentences and acted, would they make the right call?"

**What it covers:**

*Business storytelling — the Pyramid Principle*

The CEO briefing is the deliverable. This section teaches the
structure that makes a briefing land rather than get filed:

- SCQA structure (Situation, Complication, Question, Answer):
  the four elements of every effective executive communication
- Answer first: state the recommendation before the evidence —
  the opposite of how analysis is done but how it must be communicated
- The pyramid: the recommendation at the top, supported by three
  key findings, each supported by data — top-down logic, bottom-up
  verification
- What to cut: the evidence that is interesting but not decision-relevant
- Confidence calibration: matching language to evidence strength
  (avoiding both overconfidence and hedging so heavy the recommendation
  disappears)

*Stakeholder mapping*

A briefing that is analytically correct but addressed to the wrong
audience's concerns will not drive action. This section covers:

- Stakeholder identification: who is affected by this decision, who
  has influence over it, who needs to approve it
- The interest/power matrix: where each stakeholder sits and what
  that implies about how to communicate with them
- Audience-specific framing: the CFO wants financial impact and risk;
  the COO wants operational feasibility; the board wants strategic
  alignment and governance — same finding, three different lead sentences

*Business writing — email, report summaries, presentations*

- The one-page memo: structure, length discipline, active voice
- Executive summary: how to compress 10 pages of analysis into
  three paragraphs without losing precision
- Presentation structure: the slide that replaces the briefing vs.
  the briefing that stands alone
- Email precision: subject lines that get read, opening sentences
  that establish context, asks that are specific and actionable

**Theoretical grounding:**
- Minto, B. (1987). *The Pyramid Principle.* Minto International.
- Duarte, N. (2010). *Resonate.* Wiley.
- Heath, C. & Heath, D. (2007). *Made to Stick.* Random House.
- Freeman, R.E. (1984). *Strategic Management: A Stakeholder
  Approach.* Pitman.
- Strunk, W. & White, E.B. (1959). *The Elements of Style.*
  Macmillan. — Still the most efficient guide to clear writing.

**Content format:**
- Annotated CEO briefing example: the same finding written badly
  and then rewritten using SCQA — learner identifies what changed
- Stakeholder map template (interactive: learner maps stakeholders
  for the module they are about to attempt)
- One-page memo template with annotation
- Reading time: 15–20 minutes

**Linked to company modules:** All modules (direct preparation for
the CEO briefing deliverable); Boardroom (communication under pressure)

---

### Module S6 — Entrepreneur's Toolkit

**Maps to:** Strategic Intelligence (primary), Financial Intelligence (secondary)
**Dimension anchor question it prepares:** "What does this finding tell us about whether this business model creates sustainable value?"

**What it covers:**

*Lean startup concepts, MVP thinking*

This module exists because a significant segment of Atelier's
Individual users are founders or aspiring founders — professionals
who need to evaluate business decisions, not just analyze existing ones.
This section covers:

- The Build-Measure-Learn loop: how validated learning reduces risk
  in new ventures
- MVP design: what is the minimum that tests the most critical
  assumption?
- Pivoting vs. persisting: how to use data to decide when a model
  is not working vs. when it needs more time
- Product-market fit signals: what the data looks like when you
  have it vs. when you don't (cohort retention, NPS inflection,
  CAC/LTV ratio)

*Fundraising basics, valuation tools*

A founder who cannot explain their company's valuation to an investor
in financial terms will not close funding. This section covers:

- Pre-money vs. post-money valuation: the arithmetic that determines
  dilution
- DCF in plain language: why future cash flows, discounted to today,
  is the foundational logic of all valuation
- Comparables: how investors use market multiples to value companies
  without enough history for DCF
- The cap table: how equity is structured, how it changes through
  funding rounds, what dilution means for founders
- Term sheet basics: the five terms that matter most and what
  they actually mean

**Theoretical grounding:**
- Ries, E. (2011). *The Lean Startup.* Crown Business. — The
  foundational text on validated learning and MVP development.
- Blank, S. (2013). "Why the Lean Start-Up Changes Everything."
  *Harvard Business Review, 91(5), 63–72.* — The practitioner
  articulation of customer development.
- Damodaran, A. (2012). *Investment Valuation.* Wiley. — The
  standard reference on valuation methods. Damodaran's free online
  materials at NYU Stern are the best practitioner resource.
- Kawasaki, G. (2004). *The Art of the Start.* Portfolio. —
  Practical fundraising and pitch structure for early-stage ventures.

**Content format:**
- Build-Measure-Learn loop diagram (interactive: learner maps their
  own venture or a case study through the loop)
- Cap table calculator (simple: inputs equity percentages, shows
  dilution through three funding rounds)
- Valuation comparables template
- Reading time: 15–20 minutes

**Linked to company modules:** NovaPay (SaaS unit economics, ARR
structure), all modules (valuation context for the CEO briefing
recommendation)

---

## A2.3 How the scaffolding layer integrates with the product

### Placement in the user journey

```
Learner arrives at /companies/novapay or /hot-cases/001
        │
        │
        ▼
Module intro page shows:
"Before you open the workbench, you may want to review:"
  → S1: Foundations of Business (recommended — 12 min)
  → S2: Finance & Metrics (recommended — 15 min)
        │
        │ (learner chooses — not gated)
        ▼
Workbench opens
        │
        ▼
CEO Briefing
        │
        ▼
Boardroom
        │
        ▼
Credential / Badge
```

The scaffolding layer is never gated. The rubric does not
reward having read it. The learner who skips it and still
writes a strong briefing has demonstrated the knowledge was
already internalized — which is the point.

### Placement in the pricing structure

| Tier | Scaffolding access |
|---|---|
| Free (no account) | S1 preview only (first section of Foundations) |
| Free account | All six scaffolding modules, full access |
| Module subscriber | All six + module-specific reference cards |
| All-Access subscriber | All six + all reference cards + downloadable templates |
| Corporate / Academic | All six + instructor-configurable prereading assignments |

Scaffolding is free at the account level. It is not a paid feature.
Its value to the business is: lower drop-off, higher briefing quality,
higher credential completion rate, stronger Atelier Rank scores.

### Scaffolding modules are NOT Hot Cases

They do not:
- Generate a graded briefing
- Contribute to Atelier Rank
- Produce a credential or badge
- Use the workbench or PGlite

They do:
- Prepare the learner for the workbench
- Surface in /account/learning-path as "completed" with a checkmark
- Feed into the Co-Pilot context (the Co-Pilot knows which
  scaffolding modules the learner has completed and adjusts
  its Socratic questions accordingly)

---

## A2.4 The module that does not yet exist — and should

The six scaffolding modules map to five of the six business acumen
dimensions. **Augmented Intelligence has no scaffolding module yet.**

This is intentional for now: Augmented Intelligence is expressed
through the product itself (Co-Pilot, Boardroom) rather than through
prereading. The learner develops this dimension by using Atelier,
not by reading about it.

When a scaffolding module for Augmented Intelligence is ready, it
will cover:
- What AI tools are actually doing when they produce an analysis
- How to prompt for analysis vs. how to prompt for plausibility
- How to verify an AI output without re-doing the analysis from scratch
- The three failure modes of AI-augmented analysis:
  over-reliance, under-use, and false confidence in AI-verified errors
- Case: the analyst who submitted an AI-ghostwritten briefing and
  failed the Boardroom round — what collapsed and why

**Placeholder route:** /learn/augmented-intelligence (not yet built)

---

## A2.5 The Entrepreneur's Toolkit — segment note

Module S6 is the only scaffolding module that does not directly
prepare the learner for an existing company module. It serves
Segment 1 persona 6 (The Founder / Entrepreneur) and persona 5
(The MBA Alternative Learner) specifically.

It also has the highest potential for a standalone product surface:
a founder-facing tool that combines S6 scaffolding with a NovaPay-style
SaaS company module could be positioned as "the investor-readiness
simulation" — a 4-hour experience that proves the founder understands
their own unit economics well enough to brief a board.

This is not on the current roadmap. It is noted here because it is the
most natural expansion of the six scaffolding modules into a new
market surface.

---

## A2.6 Recommended build order for scaffolding modules

Build after Stripe, Hot Cases, Boardroom, and Co-Pilot are live.
The scaffolding layer is high-value but not blocking any revenue sprint.

| Order | Module | Why this slot |
|---|---|---|
| 1 | S2 — Finance & Metrics | Directly unblocks MedCore and ClearBank comprehension. Highest impact on briefing quality in the first 90 days. |
| 2 | S1 — Foundations of Business | Prereading for every module. Business model canvas makes NovaPay and OncoCare immediately more navigable. |
| 3 | S5 — Communication & Influence | Directly improves CEO briefing quality. Every learner benefits regardless of vertical. |
| 4 | S4 — Decision-Making Skills | Prepares learner for the Boardroom. Should ship before or alongside Boardroom. |
| 5 | S3 — Strategy & Markets | Deepens the recommendation axis of the CEO briefing. More impactful after learners have completed at least one module. |
| 6 | S6 — Entrepreneur's Toolkit | Serves a specific persona. Not universal prereading. |

---

*Mpingo Systems LLC · Charlotte, NC*
*The business school that runs on live data.*
