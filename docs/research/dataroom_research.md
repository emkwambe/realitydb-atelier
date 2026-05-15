# DataRoom — Deep Research Report

**Prepared for:** Eddy Mkwambe, Mpingo Systems LLC
**Date:** May 14, 2026
**Scope:** Market opportunity, curriculum design, pedagogical evidence, NovaPay company design, go-to-market strategy, and platform naming for a synthetic-data-powered business education platform.

---

## 1. Executive summary

### What the research found

The opportunity is real, sizeable, and structurally underserved — but the working title "DataRoom" should not survive contact with the market. The strategic insight you've identified (every business acumen course teaches *about* businesses; none lets students *interrogate* one) is correct, and the underlying infrastructure you've already built (RealityDB + SimLab) is rare. The corporate training market sits at roughly $353B in 2025, projected to reach $739B by 2035, with data and AI literacy now the fastest-growing subsegment. DataCamp's 2026 enterprise research found that 88% of leaders say data literacy is essential, only 42% provide foundational training at scale, and 74% would pay higher salaries for it — a gap that's been measured the same way for four years and isn't closing.

There is also a competitive opening that should determine your wedge. The two dominant approaches — Harvard's case method (passive, narrative, $1,500–$1,850 per HBS Online course) and business simulations like Capsim/Marketplace (active but decision-tree-driven, not data-driven) — both stop short of what RealityDB makes possible. **The case method puts the student outside the decision and asks them to argue. Simulations put the student inside a decision tree and let them feel consequences. Neither lets the student do what real analysts do: query a database and discover something the case author didn't pre-write.** That is the white space.

### Key recommendations (with the supporting work that follows)

1. **Rename the platform.** "DataRoom" collides irreparably with the M&A virtual-data-room category (datarooms.com, dataroom.com, datasite, intralinks, ideals — multi-hundred-million-dollar incumbents). My top recommendation is **Quorum** or **Ledger Lab**; full options in section 6.
2. **Lead with the corporate L&D wedge in one vertical, not MBA programs.** MBA procurement is slow (12–24 month sales cycles, curriculum committees, AACSB accreditation alignment). Corporate L&D for finance teams in regulated industries (banks, insurance, healthcare CFO orgs) can buy in 30–90 days and already pays $1,500–$2,500 per seat for HBS Online–style content. This also matches your RealityDB Path A vertical strategy (Healthcare → Financial Services at $2,500/mo).
3. **Reposition pricing.** Your draft pricing is too low. $199/course is DataCamp Premium territory ($156–$320/yr) and signals consumer-grade content. The market you're targeting pays $1,500–$2,500 per learner. Recommended: $499 self-paced course / $1,499 all-access / $24,999 50-seat corporate cohort / $14,999/semester MBA license. Full pricing rationale in section 5.
4. **Build NovaPay first, but as a teaching company, not a database.** The dataset is the easy part. The hard part is the narrative scaffolding — the SQL exercises, the CEO briefing prompt, the rubric. I've designed the full thing in section 4.
5. **Build a defensible moat early: research-backed distributions.** This is your unfair advantage and should be visible. Every synthetic table should ship with a citation trail ("churn distribution modeled on Pacific Crest 2024 SaaS Survey"). Nobody else in this space can do this credibly. It's also a hedge against AI commoditizing course content — the data is the durable artifact.

### What's open

The biggest open question is **whether the CEO briefing can be auto-graded well enough to scale**. Rubrics for SQL correctness are mechanical; rubrics for business insight are not. I recommend a hybrid: auto-grade the SQL, LLM-grade the briefing against a structured rubric, human-spot-check at the certification tier. More on this in section 4.

---

## 2. Market opportunity

### 2.1 The macro numbers

The total addressable space is comfortably large enough that the question is wedge selection, not market size. Several independent sources converge:

- **Global corporate training market**: $326B in 2024 → $353B in 2025 → $739B by 2035 (Roots Analysis, 7.68% CAGR). A separate Research and Markets report puts the 2025 figure at $360B with similar trajectory.
- **Data literacy as fastest-growing subsegment**: Qlik's research found data literacy is forecast to be the most in-demand skill by 2030, with 85% of C-suite executives saying it will be as essential as computer literacy.
- **The training gap is measurable and persistent**: DataCamp's 2026 State of Data & AI Literacy Report (500+ enterprise leaders, conducted with YouGov) found 88% of leaders say data literacy is essential, only 42% provide foundational training at scale, 60% report a data skills gap, and 74% would pay higher salaries for strong data literacy. Tableau's Forrester-commissioned research found 84% of decision-makers expect data literacy but only 51% of employees say their company offers training.

The gap is structural and has been measured the same way for four years without narrowing. That is not a fad. That is unmet demand.

### 2.2 Who the real competitors are (and where each one is weak)

The market has three rough tiers, each with a different weakness:

**Tier 1 — Elite case-method providers (HBS Online, Wharton Online, Booth Exec Ed)**

- HBS Online courses run $1,500–$1,850 per course. Their new *Data Science and AI for Decision Making* (launched February 2026, co-led by Karim Lakhani) is $1,850 and uses "Julius" (an AI data analysis tool) for hands-on work — meaningful that HBS itself has moved in this direction, but the dataset is still scripted.
- The Harvard Business Analytics Program (joint with SEAS and FAS) is $51,500 for 10–24 months and explicitly targets executives who want to "infuse data into business strategies."
- **Weakness**: Cases are pre-written narratives. Students argue what they would do given the facts the case author chose to give. They don't query data; they read about data. Even HBS's newer "data" courses use curated datasets where the answer is engineered to be findable. Critics on the record (Dr. Rajesh Pillania, MDI Gurgaon; various Find-MBA pieces) note the case method's overdependence and that "the case is about the past, but management is about the future."

**Tier 2 — Data skill platforms (DataCamp, Coursera for Business, LinkedIn Learning)**

- DataCamp: $13/mo individual ($156/yr), $25/mo Teams ($300/yr), Enterprise custom. Has "Analyzing Business Data in SQL" and similar. 600+ courses. Their SQL for Business Analysts track is 20 hours.
- Coursera for Business: $399/user/year Teams, custom Enterprise (typically negotiated 25–35% off list for multi-year, per Vendr data).
- **Weakness**: They teach SQL. They don't teach what to *do* with the answer. DataCamp's own customer-facing G2 reviews are explicit about wanting "more real business cases" and "more open projects where one can define the approach, not just follow instructions." This is verbatim from a current DataCamp user. That gap is your product spec.

**Tier 3 — Business simulations (Capsim, Marketplace, StratX, Cesim, BTS, Harvard Business Publishing simulations)**

- Capsim Capstone, Foundation, CapsimGlobal — used widely in MBA capstone courses; pricing typically $50–$120 per student license per cohort.
- These are "perceptual map" or "spreadsheet" decision games — students set marketing spend, R&D allocation, production capacity, and see simulated competitive outcomes.
- **Weakness**: The data is computed forward from student decisions, not queried backward to discover a hidden story. They build decision intuition; they don't build data fluency. Per a recent StratX-published industry comparison: "Capsim / Cesim: solid competitive mechanics but can feel spreadsheet-heavy."

**A particularly relevant edge case**: BCG's free *Data Science & Analytics Virtual Experience Program* on Forage (the PowerCo churn analysis) is the closest existing pedagogy to what you're building. Students get data, build a churn model, write a recommendation. It's free, it's good, and it shows the format works — but it's a recruiting funnel, not a paid product, it covers one scenario, and the dataset is small and static. **DataRoom/Quorum is "BCG Forage but commercial, scalable, multi-vertical, and with real database querying."** That positioning is clean.

### 2.3 The gap that matters

Synthesizing across tiers: **there is no product on the market today that lets a non-technical business learner write SQL against a synthetic-but-realistic company and discover a hidden business story.** Every alternative is missing at least one of those four pieces:

| Provider | SQL? | Realistic data? | Hidden story? | Business framing? |
|---|---|---|---|---|
| HBS Online | No | N/A | Pre-told | Strong |
| DataCamp | Yes | Generic | No | Weak |
| Capsim | No | Computed forward | Decision-tree | Strong |
| BCG Forage | Some | Small scenario | One company | Strong |
| **Your platform** | **Yes** | **Research-backed** | **Discoverable** | **Strong** |

### 2.4 Price points that work

What corporate L&D and individual professional buyers actually pay (USD, current market):

- HBS Online single course: $1,500–$1,850
- HBS CORe bundle (3 courses): ~$2,500 after discount
- Wharton Online Business Acumen for Rising Executives: ~$2,800
- DataCamp Premium individual: $156–$320/yr
- DataCamp Teams: $300/seat/yr; Enterprise: $400–$600/seat/yr typical
- Coursera for Teams: $399/seat/yr; Enterprise: negotiated $250–$350/seat after volume discount
- Capsim license: typically $50–$120/student for a semester deployment
- Harvard Business Publishing simulations: $15–$25/student license
- Acumen Learning custom business acumen training: $1,500–$3,000/seat for live cohort delivery
- Forrester research: 78% of employees pay out of pocket for data skill development, averaging $2,800/year personally

The takeaway: there's a *gap between $400 (DataCamp tier) and $1,500 (HBS tier) where almost nothing sits*. That gap is where premium-positioned but-not-elite content can live, and it's where most corporate L&D buyers are most comfortable approving without committee escalation.

### 2.5 What MBA programs currently lack

I looked at the analytics curricula of Booth, Tepper (CMU), Michigan Ross, BC Carroll, Wharton, Rutgers, and FIU. All have data analytics concentrations. All teach SQL, Python, R, Tableau in some combination. **What none of them has is a single integrated multi-vertical synthetic company library that lets a finance professor and a marketing professor and a strategy professor pull from the same data with shared, realistic distributions.** Right now each professor builds (or licenses) their own datasets. A platform that gives a B-school *one* NovaPay-style company that an MBA encounters in their finance class, their strategy class, *and* their analytics class is institutionally valuable in a way DataCamp can't be.

That's an institutional license play — but it's a slow sale (see section 5).

### 2.6 Evidence that "learn by doing with real data" works better

This is solid but more nuanced than the "simulations win" framing might suggest:

- A 2019 *Journal of Business Ethics* experimental study found simulations slightly more effective than case studies for teaching multidimensional, inter-temporal concepts (sustainable development), but both methods were effective.
- Tracey Sitzmann's 2011 meta-analysis (the canonical reference for simulation efficacy) found simulations produce stronger *procedural* knowledge ("knowing how") and roughly equivalent *declarative* knowledge ("knowing what") versus traditional teaching.
- The honest synthesis from a recent (May 2026) pedagogical analysis: **"Simulations are best at operational and tactical layers and weakest at the genuinely strategic. A simulation cannot teach a student to decide whether a brand should reposition. The case method can. The combination matters."**
- This is your opening. DataRoom isn't replacing case studies — it's the missing third leg of the stool. Case studies for strategic intuition, business simulations for tactical decision-making, **DataRoom-style synthetic data exploration for data fluency and analytical reasoning**.

---

## 3. Curriculum framework

### 3.1 What business acumen actually is

The most operationally useful definition comes from Acumen Learning's "5 Business Drivers" framework (based on Kevin Cope's *Seeing the Big Picture*, a NYT bestseller and the basis of training delivered to 30+ Fortune 500 companies): **Cash, Profit, Assets, Growth, People**. Their internal data claims a 300%+ ROI on business acumen training. Wharton's executive education program uses a similar but more academic frame: strategic management, finance/accounting, talent, marketing, and data analytics as the five "primary functions of a business."

Synthesizing: business acumen is the ability to (1) read what a business is doing through its numbers, (2) connect those numbers to operational decisions, and (3) connect operational decisions to financial outcomes. Your five-layer model (transactions → SQL aggregations → metrics → financial statements → executive decisions) maps cleanly onto this and is, frankly, better articulated than what most providers offer. Keep it.

### 3.2 The 10 most important business questions every professional should be able to answer with data

These are derived from synthesizing the SaaS metrics literature (Baremetrics, re:cap, The SaaS CFO, finmodelbuilder, getholdings — all current as of 2026), the McKinsey/BCG/Deloitte analyst training materials I could surface, and the Acumen Learning and Wharton curricula:

1. **Is the business growing?** Decompose MRR (or revenue) into new, expansion, churned, contraction. Net new MRR is the trend that matters; gross is a vanity number.
2. **Are customers leaving faster than we're acquiring?** Cohort churn analysis. The math is brutal: 5% monthly churn means losing 46% of customers annually; 2% means losing 21%.
3. **Are we acquiring customers profitably?** LTV:CAC ratio. The market benchmark is ≥3:1 (best-in-class ≥4:1). Below 1:1 is unsustainable.
4. **How long until we earn back the cost of acquiring a customer?** CAC payback period — under 12–18 months for healthy SaaS.
5. **Are our existing customers growing or shrinking?** Net Revenue Retention. >100% is the dream metric — growth without new sales. 110–120%+ is investor-grade.
6. **Where is the money actually coming from?** Revenue concentration by customer, segment, geography. The "is one customer 40% of revenue?" question kills more startups than any other.
7. **Where is the money actually going?** Gross margin trends, cost-of-goods-sold by line, operating expense composition.
8. **What's our cash runway?** Burn rate ÷ cash on hand. The single most important survival metric for any early-stage business.
9. **Which cohort, segment, or product is the leading indicator of where we're heading?** Cohort analysis — last quarter's signups tell you what next quarter's revenue looks like.
10. **What would have to be true for our plan to work?** Reverse-engineer assumptions. If we need to triple revenue and our funnel converts at 2%, what does the top-of-funnel have to look like? Sensitivity analysis.

Every NovaPay exercise should map to one of these. So should every other synthetic company's exercises. This is the through-line that ties your curriculum together.

### 3.3 Recommended curriculum sequence

The progression that consistently works in adult professional education (this is supported by Manu Kapur's productive-failure research and the scaffolding literature) goes from concrete to abstract, from descriptive to predictive to prescriptive:

**Module 1 — Reading the rows (Layer 1 → Layer 2)**
Goal: Get learners comfortable that databases are just rows describing things that happened.
- What is a transaction?
- How do tables relate? (FK intuition before FK syntax)
- The 3 SQL verbs that matter most: SELECT, GROUP BY, JOIN
- First exercise: "Count how many customers NovaPay had in March 2024." (90% of learners can do this within 20 minutes.)

**Module 2 — Computing the metrics (Layer 2 → Layer 3)**
Goal: Convert raw transactions into the metrics businesses actually use.
- MRR calculation from subscription tables
- Churn rate computation (monthly cohort vs. annualized)
- LTV and CAC from first principles
- Window functions (running totals, period-over-period change)

**Module 3 — Building the statements (Layer 3 → Layer 4)**
Goal: Construct a P&L from query results.
- Revenue waterfall from MRR components
- COGS aggregation
- Gross margin and operating margin
- Reconciling your computed numbers to a published financial statement

**Module 4 — Making the decision (Layer 4 → Layer 5)**
Goal: Frame an executive recommendation from the data.
- The CEO briefing structure (situation, complication, question, answer — i.e., the McKinsey SCQA framework, which is genuinely how consulting decks are built)
- Identifying the root cause vs. the symptom
- Writing recommendations as testable hypotheses
- Sensitivity analysis: "what would have to be true for this not to work?"

**Module 5 — Telling the story**
Goal: Communicate findings to a non-technical audience. This is where Cole Nussbaumer Knaflic's *Storytelling with Data* framework comes in — context, audience, exploratory vs. explanatory analysis, focusing attention, eliminating clutter. Her book is used as a textbook at 100+ universities, which means citing it gives you instant pedagogical credibility.

This sequence is intentionally aligned to the McKinsey Problem-Solving Approach (define, structure, prioritize, plan-analysis, conduct-analysis, synthesize, communicate) which is the framework MBB analysts actually use day-to-day. That's not coincidence — it's the most thoroughly battle-tested business problem-solving framework in existence, and it's a useful spine.

### 3.4 What makes a great HBS-style case (and how to adapt it for live data)

The HBS case formula is well-documented: a 10–20 page document written from the viewpoint of a real person leading a real organization, ending in a key decision to be made, with information that is deliberately incomplete. Students sift through, decide, defend their position to a discussion group. The strengths are real — it builds critical listening, decision-making under ambiguity, comfort with incomplete information.

To adapt for live data, you keep the framing but invert the workflow:

- **HBS case**: Here are 15 pages of curated information. What would you decide?
- **DataRoom case**: Here is a question from the CEO and access to the database. Go find out what's actually happening, then tell us what to do.

The pedagogical move is *making the discovery itself the deliverable*, not the framework application. Students who do this learn that data analysis is messy, that the obvious metric often isn't the answer, that the story is in the cohort rather than the average. This is exactly what consulting analysts learn in their first six months on the job — and it's exactly what MBA case-method students don't.

### 3.5 How to assess business acumen (not just SQL correctness)

This is the hardest pedagogical problem in the platform and worth dwelling on. A four-axis rubric:

1. **Correctness (auto-gradable)**: Did the SQL produce the right numbers? Binary or scored against a test harness. This is your existing certification logic.
2. **Diagnostic depth (LLM-gradable with rubric)**: Did the student identify the *cause* of the trend, not just describe the trend? A good submission says "churn spiked because enterprise customers without multi-currency support left." A weak submission says "churn went up in Q2."
3. **Decision quality (LLM-gradable with rubric)**: Is the recommended action proportional to the problem, costed (even loosely), and tied to a measurable outcome? "Build multi-currency in Q3 at ~$400K eng cost, recover $1.2M ARR within 6 months" beats "we should add features customers want."
4. **Communication (LLM-gradable, lighter rubric)**: Is the briefing crisp? Does it lead with the answer? Does it acknowledge what it doesn't know?

For the certification tier, add human review of axes 2–4 on a sample basis. The cost is real but the credential value justifies it — and you can charge for it.

---

## 4. NovaPay company design

This is the heart of the platform. I've designed NovaPay to embody the pedagogical principle: the data should *tell* the story to a careful reader, not *hide* it from a careless one. Students should be able to surface the hidden insight, but only by asking the right questions in the right order.

### 4.1 The story

NovaPay is a 3-year-old B2B SaaS payments platform. $2.1M ARR, 8% MoM growth on aggregate. The CEO is preparing for a Series B. **The hidden problem**: enterprise customers (defined as ≥$2,000 MRR) are churning at 3.2% monthly while SMB customers are churning at 0.9% monthly. Because there are far more SMB customers, the aggregate churn looks acceptable (~1.4%). But enterprise customers represent 58% of revenue. The enterprise churn is being driven by lack of multi-currency support — visible in support ticket categories ("can't accept EUR/GBP", "FX reconciliation manual"), in the cohort of enterprise customers with international operations, and in expansion MRR collapsing for the EMEA-headquartered cohort.

A student who only looks at aggregate metrics will report "growth is healthy, churn is in line." A student who segments by customer tier will see the enterprise problem. A student who joins to support tickets will find the cause. A student who computes the revenue-at-risk will quantify the urgency.

This is the assessment ladder built into the dataset itself.

### 4.2 The database schema

13 tables, all PostgreSQL-compatible, ~50,000–500,000 rows depending on table:

```
customers (customer_id PK, company_name, segment, country,
           industry, headcount, signup_date, ...)

users (user_id PK, customer_id FK, email, role, last_active_at, ...)

subscriptions (subscription_id PK, customer_id FK, plan_id FK,
               started_at, cancelled_at, status, mrr, currency, ...)

plans (plan_id PK, plan_name, tier, base_mrr, features_json, ...)

invoices (invoice_id PK, subscription_id FK, amount, currency,
          issued_at, paid_at, status, ...)

payments (payment_id PK, invoice_id FK, amount, currency,
          payment_method, processed_at, ...)

transactions (transaction_id PK, customer_id FK, amount,
              currency, transaction_type, occurred_at, ...)
       -- the actual payment-processing volume; NovaPay's
          customers process payments through them

support_tickets (ticket_id PK, customer_id FK, category,
                 priority, status, opened_at, resolved_at,
                 first_response_at, satisfaction_score, ...)

ticket_messages (message_id PK, ticket_id FK, sender_type,
                 message_body, sent_at)
       -- contains the multi-currency complaints

product_usage (usage_id PK, customer_id FK, feature_name,
               event_count, recorded_at, ...)

feature_flags (flag_id PK, customer_id FK, feature_name,
               enabled, granted_at)

marketing_attribution (attribution_id PK, customer_id FK,
                       channel, campaign, cost, signup_date)

employees (employee_id PK, name, role, department,
           hire_date, manager_id FK)
       -- needed for CAC computation that includes
          fully-loaded sales costs
```

### 4.3 The distributions that tell the story

This is where your engineering matters. Distributions that should be baked in:

- **Customer segment distribution**: 70% SMB, 25% mid-market, 5% enterprise. Realistic for a 3-year-old payments SaaS.
- **Enterprise churn rate by month**: starts at 1.1% in month -18, rises to 3.2% by month 0. The rise is *monotonic over the last 6 months* — discoverable as a trend with a `GROUP BY DATE_TRUNC('month')`.
- **Geographic skew of enterprise churn**: 78% of churned enterprise customers have ≥1 international subsidiary (extractable from the `customers.country` plus a `subsidiaries` table I'd add — or, simpler, encode it in customer metadata).
- **Support ticket category for churned enterprise customers**: 64% have ≥1 ticket in category `currency_support` or `fx_reconciliation` in the 90 days before cancellation. Other customers: 4%. This is the *causal arrow* the rigorous student finds.
- **Revenue concentration**: top 20 customers = 58% of revenue. Top 5 = 31%. (Pareto-shaped, realistic for early B2B SaaS, and explains why aggregate metrics mask the enterprise problem.)
- **Expansion MRR by cohort**: SMB cohorts show ~110% NRR, enterprise cohorts show ~85% NRR. This is a separate (but related) finding — and it's actually *the more financially damaging* of the two if a student probes deeper. NovaPay's headline growth comes mostly from new SMB acquisition, while enterprise contraction is hollowing out the revenue base.
- **Marketing attribution**: Enterprise CAC is $18K (long sales cycle, AE-driven), SMB CAC is $340 (self-serve + light touch). At current enterprise churn, enterprise LTV:CAC is approaching 1.8:1 — *unprofitable acquisition* at the segment that drives most of the revenue. This is a third-layer finding.
- **Time-of-day and seasonal patterns in transactions**: realistic but not story-relevant. (Important to include because real data has texture and red herrings. Students should learn to ignore what doesn't matter.)

### 4.4 The 10 guided exercises

Designed as a deliberate progression from basic to strategic, each mapped to one of the ten universal business questions from section 3.2.

| # | Exercise | Skill | Maps to |
|---|---|---|---|
| 1 | How many active customers did NovaPay have on March 1, 2024? | Basic SELECT, WHERE on date | Q1 (growth) |
| 2 | Plot monthly new customer signups for the last 18 months. | GROUP BY date_trunc | Q1 |
| 3 | Calculate NovaPay's MRR for each of the last 12 months, broken into new, expansion, churned, contraction. | Subquery / CTE, window functions | Q1, Q2 |
| 4 | What is NovaPay's monthly churn rate over the last 12 months? Aggregate, then segmented by customer tier. | GROUP BY segment + cohort math | Q2 |
| 5 | Compute LTV and CAC by customer segment. Comment on whether each segment is profitable to acquire. | JOINs across subs + marketing | Q3, Q4 |
| 6 | What is NovaPay's Net Revenue Retention for each customer cohort by signup quarter? | Cohort analysis, complex CTE | Q5 |
| 7 | What share of NovaPay's revenue comes from its top 10 customers? Top 20? | Ranking, window functions | Q6 |
| 8 | For customers who churned in the last 6 months, what support ticket categories were most common in their final 90 days? | JOIN tickets + subs + filter | Q9 |
| 9 | What is the relationship between multi-currency-related support tickets and customer churn? Quantify. | Correlation via SQL or export | Q9 (causal) |
| 10 | If NovaPay shipped multi-currency support in Q3 and recovered 70% of at-risk enterprise revenue, what would the ARR impact be vs. continuing the current churn trajectory? | Forecast + sensitivity | Q10 |

Exercises 1–4 are the entry tier: any learner with basic SQL exposure can complete. 5–7 require comfort with JOINs and window functions. 8–10 are where business acumen meets technical capability — this is where you separate learners who get certified from those who don't.

### 4.5 The CEO briefing prompt

> **Briefing memo to the CEO** (max 800 words, due as part of your capstone)
>
> The board meeting is in two weeks. The CEO has asked you to prepare a one-page briefing on the state of customer retention at NovaPay. The board is being asked to approve the Series B fundraise, and the lead investor has flagged that they want comfort on retention metrics before they commit.
>
> Your briefing must answer:
>
> 1. What is the current state of customer retention? Is it healthy?
> 2. If there are problems, what is causing them?
> 3. What would you recommend the company do, and what would be the financial impact?
> 4. What do you not know that you would want to know before fully committing to your recommendation?
>
> You have full access to NovaPay's production database. Cite the queries that support your conclusions.

The prompt is structured to surface all four assessment axes (correctness, diagnostic depth, decision quality, communication). Question 4 is the most important and the most underrated — it teaches epistemic honesty, the thing that separates a useful analyst from a confident wrong one.

### 4.6 What a passing vs. failing submission looks like

**Failing submission (illustrative)**
> NovaPay's MRR is $175K (March 2024). The company has been growing 8% MoM. Churn is 1.4%, which is healthy. We recommend the board approve the Series B raise. With continued growth, NovaPay will reach $5M ARR by year-end.

This is failing because it doesn't segment, doesn't probe causality, doesn't quantify risk, and doesn't acknowledge uncertainty. It mistakes the aggregate for the truth.

**Passing submission (illustrative)**
> NovaPay's headline metrics look healthy (8% MoM growth, 1.4% blended monthly churn), but the picture deteriorates significantly when segmented. Enterprise customers (5% of customer count, 58% of revenue) are churning at 3.2% monthly — a rate that has tripled over the last 6 months. Investigation of support tickets shows 64% of churned enterprise customers filed at least one ticket related to multi-currency or FX in their final 90 days, vs. 4% of retained customers. The cohort with the highest churn risk is enterprise customers with international operations.
>
> **Quantified risk**: at current enterprise churn, NovaPay will lose ~$610K in enterprise ARR over the next 12 months — roughly 29% of total ARR. This will compress NRR from current 96% to ~78%, which is below the threshold most Series B investors will accept.
>
> **Recommendation**: Prioritize multi-currency support for Q3 ship. Estimated eng cost based on team size and apparent feature complexity is $300–500K. If the fix retains 60% of at-risk enterprise revenue, the recovered ARR (~$365K) pays back the investment within 18 months and meaningfully de-risks the fundraise.
>
> **What I don't yet know**: I am inferring causality from a strong correlation between ticket categories and churn — a customer survey of churned enterprise accounts would confirm the mechanism. I also don't have full visibility into the eng team's capacity or competing priorities. If multi-currency cannot ship in Q3, a stopgap (third-party FX rails, manual reconciliation tooling) should be evaluated.

The passing submission demonstrates all four axes. A grader (human or LLM) should be able to score it within a few minutes against a rubric that asks: did you segment? did you probe causality? did you quantify? did you acknowledge uncertainty?

### 4.7 How to grade business insight at scale

The honest answer: a hybrid. Auto-grade SQL correctness deterministically. LLM-grade the briefing against a structured rubric that asks specific yes/no questions — "did the student segment by customer tier?", "did the student quantify revenue at risk?", "did the student acknowledge what they don't know?". Sample 5–10% for human review at the certification tier. This is broadly the same pattern AP exams use for free-response scoring, and it's defensible.

The critical implementation note: the LLM rubric must produce structured output (JSON), not free-form prose. You want auditable scoring, not vibes-based grading. This is straightforward with Claude or GPT structured output modes — I'd recommend keeping the prompt and rubric in your repo as versioned artifacts so you can A/B test rubric revisions and benchmark inter-rater reliability against human graders.

---

## 5. Go-to-market recommendations

### 5.1 The two-customer dilemma

You have two distinct buyer segments with very different procurement cycles:

**Corporate L&D (recommended first wedge)**
- Sales cycle: 30–90 days
- Decision maker: CLO, L&D Director, or VP of Finance for finance-team training
- Budget source: existing L&D budget; under $25K typically requires no committee approval
- Buying signal: "We need our finance/analyst team to be able to read the data, not just look at dashboards."
- Anchor pricing: HBS Online ($1,500–$2,500/seat) — your reference point, not DataCamp

**MBA programs (recommended second wedge)**
- Sales cycle: 6–18 months
- Decision maker: Curriculum committee, Department Chair (Analytics or Finance), Associate Dean
- Budget source: program operating budget or fee-shifted to student technology fees
- Buying signal: Faculty member adopts independently, then expands to department-wide license
- Anchor pricing: Capsim institutional license ($5K–$20K), Harvard Business Publishing simulations
- AACSB accreditation alignment: AACSB Standard 4 (curriculum content) increasingly emphasizes data literacy; this is a useful institutional hook

The temptation is to go after MBA programs because they're the natural intellectual home of business acumen. The reality is that they buy too slowly to support your runway. Corporate L&D will pay you in 60 days. MBA programs will pay you in 18 months. Lead with the former, follow with the latter.

### 5.2 The fastest path to first 10 paying customers

A 90-day plan that maps onto your existing assets:

**Days 1–14: Position and price**
- Lock the new name (see section 6)
- Build a landing page that leads with the NovaPay demo, not a feature list
- Price at $499 self-paced single course, $1,499 all-access (6 companies), $9,999 cohort-of-10 corporate package
- Build a 10-minute video walkthrough of a student discovering NovaPay's enterprise churn problem

**Days 15–45: First 50 conversations**
- 50 LinkedIn outreach messages per week to: CFOs at Series A/B SaaS companies (your scenario matches their reality), finance team L&D leads at mid-market companies, FP&A managers at banks and insurance companies
- Message frame: "I built a synthetic SaaS company called NovaPay where your team can practice diagnosing a real business problem from the database. I'd like to send you a 10-minute walkthrough."
- Goal: 10–15 demo calls

**Days 46–75: First 5 customers**
- Convert demos to paid pilots at $2,500–$4,999 (small-team cohort pricing). The price is high enough to be taken seriously and low enough to not require procurement.
- Run pilots with extreme attentiveness — Slack channel with each customer, weekly check-ins, gather quotes
- Aim for 2–3 customers in financial services / fintech and 2–3 in SaaS

**Days 76–90: First 5 case studies, first 5 more customers**
- Convert pilot quotes into anonymized case studies
- Use case studies to enable a self-serve pricing tier
- Begin direct outreach to MBA program directors at second-tier business schools (UNC Kenan-Flagler, Emory Goizueta, Vanderbilt Owen, IU Kelley — top-25 but not top-10, more willing to experiment than HBS/Wharton)

### 5.3 MBA / academic distribution

The realistic academic strategy is **bottom-up faculty adoption**, not top-down committee sale. This is how Wolfram Alpha, Jupyter, Stata, Posit Cloud, and Capsim itself all penetrated higher ed.

The mechanic:
1. Free tier for individual faculty (one full company access, semester-long, with student licenses bundled)
2. Single department adoption (one course, all students) at $999/semester
3. Program license (all MBA students access all companies) at $14,999/semester for a 100-student program — works out to ~$150/student, comparable to a Capstone simulation license

This won't move fast. It will compound. Plan for 5–10 academic customers in year 1, growing to 30+ in year 3.

### 5.4 Partnership opportunities

- **AACSB** (1,000+ accredited business schools): Sponsor or speak at their annual conference. AACSB doesn't directly endorse vendors but their accreditation framework now explicitly emphasizes data and AI literacy.
- **Harvard Business Publishing**: Long shot but worth a conversation — they license simulations and case studies to thousands of schools. A NovaPay-style "live data case" could be a new product line for them.
- **Forage**: They already host BCG's free PowerCo simulation. They monetize through employer recruiting partnerships. A premium tier built on your tech could be a meaningful channel.
- **CFA Institute**: The CFA designation increasingly emphasizes data analysis. Continuing education credit for DataRoom courses would be enormously valuable.
- **Local pilot**: Charlotte has a strong financial services concentration (Bank of America HQ, Truist HQ, Honeywell). Pilot with a regional bank's analyst training program — a story you can sell to national banks afterward.

### 5.5 How to position against HBS Online

Don't compete on credibility. You won't win that fight. Compete on what HBS Online cannot offer:

> "HBS Online teaches you to read a case. We teach you to read a database. Your team will encounter both in their career — but only one of them is what they're asked to do every day at work."

The CLO of a financial services L&D org reads that and immediately knows which one their analysts actually need. HBS Online's brand is unmatched at the executive-MBA-aspirant tier; it's far weaker at the working-analyst tier where DataCamp dominates but with weak business framing. Your wedge is right between those two.

---

## 6. Platform naming options

### 6.1 Why "DataRoom" doesn't work

The biggest single risk in your current plan. "Data room" / "DataRoom" is a heavily occupied term in the M&A and capital-raising world — it specifically means "virtual data room" (VDR), the secure document repository used during M&A due diligence and IPOs. The category is dominated by Datasite, Intralinks (SS&C), Ideals, Firmex, DataRooms.com, Dealroom, Ansarada, EthosData, Papermark, and others, with combined revenue well into the hundreds of millions.

Consequences if you launch as DataRoom:
- A finance professional Googling "DataRoom" gets 10 M&A vendors before they find you
- A CFO reading "DataRoom for business education" wonders why an M&A vendor is teaching analytics
- SEO is a permanent uphill battle
- Trademark risk if any incumbent decides to be aggressive about it

The name needs to change. Below are five candidates with rationale, ordered from my strongest to weakest recommendation.

### 6.2 Five options

**1. Quorum** *(top recommendation)*
- The corporate-governance meaning ("the number of people required to make a decision valid") evokes the boardroom and decision-making
- Short, two syllables, easy to spell and say
- Quorum.io, quorum.com, quorum.app — likely taken; quorum.learn, quorum.ai, getquorum.com, quorumlabs.com — likely available variants
- Slogan: "Where your team learns to read the room."
- Slight risk: there's a Quorum political/lobbying SaaS company (quorum.us); not in your space but worth a trademark check

**2. Ledger Lab**
- "Ledger" = the original record of business truth; "Lab" = experimentation, learning, safety
- The compound noun is distinctive and doesn't collide with M&A or banking-ledger software in a category-defining way
- ledgerlab.io and similar likely available
- Slogan: "Practice on the books before you have to."

**3. Live Case** *(or LiveCase)*
- Positions explicitly against HBS's case method ("our case is *live*")
- The pun is intentional and clarifying — communicates the product in two words
- livecase.io, livecase.app — worth checking
- Slight risk: feels descriptive rather than brandable

**4. Praxis Data** *(or just Praxis)*
- "Praxis" = practice, application, the place where theory meets action — straight Aristotelian word
- Resonates with academic audiences; works for corporate L&D
- praxis.com is a generic registration; praxisdata.com and praxisdata.io likely available
- Slight risk: "Praxis" is also a teacher certification exam in the US — minor confusion risk

**5. Synthetica** *(or SyntheticaEd)*
- Foregrounds the synthetic-data engineering, which is your unique technical asset
- Distinctive and memorable
- synthetica.io and similar to be checked
- Risk: foregrounds the *how* before the *why*, which is usually wrong for consumer-facing branding (though potentially right for technical/academic positioning)

### 6.3 Positioning statement (recommended)

> *[Platform Name] is the live-data alternative to the business case study. We give MBA programs, corporate finance teams, and aspiring analysts a synthetic company they can query, investigate, and brief — so they learn to read a business the way real analysts do.*

### 6.4 Tagline

A few options graded by audience fit:

- *"Where data becomes decisions."* (broad, safe, slightly generic)
- *"Practice the company. Brief the CEO."* (specific, evocative, my preferred)
- *"The case method, now with a database."* (clearest positioning vs. HBS)
- *"Read the company. Not the case."* (sharpest, possibly too aggressive)

### 6.5 Ten-second descriptions

**To an MBA dean:**
> "We give your MBA students a real company's database to investigate. Same case-method discipline, but they discover the insight from the data instead of reading it in a case. Our six synthetic companies span the industries your students will actually work in — fintech, healthcare, telecom, supply chain — and ship with research-backed distributions so your finance, strategy, and analytics faculty can all teach from the same data."

**To a Chief Learning Officer:**
> "Your finance and analyst teams already use dashboards. We teach them to read what the dashboards are made of — by giving them a synthetic company they can query SQL against, with a hidden business problem to diagnose. Eight hours of training. Briefing-memo deliverable graded against an executive rubric. We pilot with 10 seats at $9,999."

---

## 7. Open questions and what needs more research

These are the genuinely unresolved questions I'd want to validate before committing capital:

### 7.1 Pedagogical

- **How reliably can an LLM grade business insight against a structured rubric?** Until you A/B test with human graders on, say, 50 sample submissions, the unit economics of certification grading remain uncertain. The single biggest threat to the cohort/certification tier.
- **What's the right ratio of guided to open-ended exercises?** Manu Kapur's productive-failure research suggests early failure improves later retention, but too much failure crushes motivation. For a working-professional audience paying $499, the tolerance is lower than for an MBA student.
- **Does discovering the NovaPay enterprise churn problem produce durable transfer to a learner's own job?** This is the only outcome that matters long-term and you should measure it. 90-day follow-up survey: "Have you applied what you learned in your own work?" If yes → strong NPS and word-of-mouth. If no → repositioning needed.

### 7.2 Market

- **Is corporate L&D willing to pay $1,499 for a self-paced product with no live instructor?** DataCamp's price ceiling at $320/yr suggests yes only if the credential is meaningfully more valued than DataCamp's, which it can be if positioned correctly.
- **Will MBA faculty adopt without a textbook publisher relationship?** Capsim and Marketplace both grew via direct faculty sales without Harvard Business Publishing distribution. Possible but slow.
- **How much do credibility signals matter at launch?** A single recognizable advisor (a former CFO, a finance professor at a top-30 school, a recognized data educator) could compress the trust-building timeline by months.

### 7.3 Product

- **Does the multi-currency-story-in-NovaPay land for international students?** If 50% of your MBA buyers are non-US, the cultural specificity of the story matters. The fix is to have multiple "hidden stories" per company that can be A/B'd or rotated.
- **Should the SQL environment be persistent (students keep their queries forever) or session-based (clean slate each time)?** Persistent feels better for learners but creates support burden and copy-paste risk for assessment. SimLab's disposable model probably wins.
- **Is there a non-SQL entry path?** Tableau / Looker / Power BI users will balk at SQL. A "guided exploration" mode that produces SQL underneath could double your addressable audience.

### 7.4 Strategic

- **Is the bigger long-term business the educational platform or the synthetic data engine?** Snowflake started as a database and ended up an ecosystem. RealityDB's optionality as a foundational technology may be larger than DataRoom-the-course-platform — and the course platform may be the demand-generation engine for the database. Worth pressure-testing.
- **What does competitive response look like from DataCamp, HBS Online, or Coursera?** DataCamp is the most likely to copy. They have the platform; they don't have the synthetic data engine. A 12–18 month head start matters. Filing relevant trademarks and a provisional patent on the synthetic-data-as-pedagogy method would extend the moat.
- **Where does AI itself fit in the long term?** If GPT-5 can answer "what's happening at NovaPay" by reading the schema and generating queries, the *discovery* exercise loses some value. The countermove: assessment shifts from "did you find the insight" to "did you decide what to do about it" — i.e., the briefing memo becomes the durable artifact, not the SQL query.

---

## Sources cited (selected)

- DataCamp 2026 State of Data & AI Literacy Report (with YouGov, 500+ enterprise leaders)
- Tableau / Forrester Consulting global data literacy survey (2,000+ decision-makers, 10 countries)
- Qlik *Data Literacy: The Upskilling Evolution* (Censuswide, 1,209 C-level executives, 6,197 employees)
- Roots Analysis *Corporate Training Market 2035*
- Allied Market Research *Global Corporate Training* (via Edstellar)
- ResearchAndMarkets *Corporate Training Market Outlook to 2030* (July 2025)
- HBS Online program pages and pricing (Data Science and AI for Decision Making, CORe, Business Analytics)
- Harvard Business Analytics Program (analytics.hbs.edu)
- Wharton Online Business Acumen for Rising Executives
- Acumen Learning *Building Business Acumen* (based on Kevin Cope, *Seeing the Big Picture*)
- Celemi business simulation suite
- Capsim product catalog and academic pricing
- Marketplace business simulations (capstone variants)
- StratX Simulations comparison framework
- BCG / Forage *Data Science & Analytics Virtual Experience Program* (PowerCo churn)
- Sitzmann (2011) meta-analysis on simulation efficacy
- *Journal of Business Ethics* (2019), simulations vs. case studies in sustainable development education
- Manu Kapur, productive-failure research
- Cole Nussbaumer Knaflic, *Storytelling with Data*
- Baremetrics, re:cap, The SaaS CFO, finmodelbuilder, getholdings — SaaS metrics curriculum sources
- Liu et al. (2025), *British Journal of Educational Technology* — synthetic data in education
- *Scientific Reports* (March 2026), SynEdu-HEDL synthetic learner dataset
- Pillania, *Education Post* (need for experiential learning beyond case method in MBA)
- Vendr Coursera pricing benchmarks dataset
- G2 enterprise reviews for DataCamp, Coursera for Business, HBS Online
- Find-MBA, *Harvard's Case Studies Retain Their Luster in MBAs*
- 360Learning *How to Get Training Budget and Exec Buy-In* (procurement-side perspective)

---

*Report compiled May 14, 2026. Total research depth: ~140 web sources surfaced, ~50 directly cited. Synthesized for a real product launch, not a market scan — accuracy prioritized over comprehensiveness as requested.*
