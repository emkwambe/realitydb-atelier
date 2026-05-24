# Atelier — Curriculum Framework
**Version:** 1.0 · May 2026  
**Owner:** Eddy Mkwambe · Mpingo Systems LLC  
**Status:** Locked — governs all module design, exercise authoring, and dimension copy  

> This document defines the six dimensions of business acumen that
> Atelier develops, the pedagogical principles behind each, and the
> design rules for exercises and modules.
> Read before authoring any module content, exercise, or Hot Case.

---

## The core insight

Every synthetic company in Atelier contains data that can be
interrogated through all six dimensions. The dimensions are not
separate datasets — they are different questions asked of the
same data.

A single table (support_tickets) can be interrogated through:
- Financial: what is the cost of unresolved tickets in churned MRR?
- Operational: which category has the longest resolution time?
- Strategic: do ticket themes reveal where competitors outperform us?
- Decision: hire more agents or build self-serve?
- Communication: write a 3-bullet memo to the COO
- Augmented: could early escalation have prevented the churn?

Same rows. Same columns. Six entirely different learning experiences.

This is the platform's fundamental pedagogical innovation: dimensions
are lenses, not silos. Business acumen is the ability to look at a
company's data and ask all six questions — simultaneously, under
uncertainty, with real consequences.

---

## The six dimensions

### Dimension 01 — Financial Intelligence

**What it develops:**
The ability to read, interpret, and derive decisions from the financial
signals embedded in operational data — before those signals surface in
quarterly reports.

**What this looks like in practice:**
Financial intelligence is not reading a P&L. It is reading the
transaction-level data that will eventually become the P&L. An analyst
with financial intelligence sees deteriorating cohort retention in
subscription data two quarters before it appears in reported churn.
They calculate LTV:CAC not as a vanity ratio but as a decision input
about which acquisition channels to scale.

**The operational capability it builds:**
- Revenue recognition from transaction-level data
- Cohort retention analysis and its financial implications
- Unit economics: LTV, CAC, payback period by segment
- Margin analysis by customer segment, product line, or geography
- Cash flow vs. accrual reconciliation
- Identifying leading financial indicators before they become lagging ones

**Why it matters in real environments:**
Most analysts can run a revenue query. Few can explain what the revenue
trend means for the business in 18 months, which segments are
subsidizing which, and what financial signal should trigger a strategic
decision. Financial intelligence is the difference between reporting
numbers and understanding what the numbers are saying.

**The question this dimension answers:**
*What is the financial reality of this business, and what signals
in the data indicate where it is heading?*

---

### Dimension 02 — Operational Intelligence

**What it develops:**
The ability to find where a business is losing efficiency, capacity,
or quality — by reading the operational data that most analysts
overlook in favor of financial metrics.

**What this looks like in practice:**
Operational problems rarely announce themselves. They hide in resolution
times, failure rates, throughput gaps, and utilization patterns.
An analyst with operational intelligence sees that payment failures on
cross-border transactions generate support tickets that take 14 days
to resolve — and connects that directly to the churn rate in the
affected customer segment.

**The operational capability it builds:**
- Process efficiency analysis from log and transaction data
- Bottleneck identification and quantification
- Capacity utilization and its relationship to quality metrics
- Root cause analysis across multiple operational tables
- SLA performance and deviation analysis
- Linking operational failure to business outcome (churn, revenue, cost)

**Why it matters in real environments:**
Financial metrics show the score. Operational data shows why. A company
with deteriorating margins might have a pricing problem, a cost problem,
or an operational efficiency problem — and only the operational data
can distinguish between them. Analysts who can read operational data
alongside financial data are rare and disproportionately valuable.

**The question this dimension answers:**
*Where is the business losing efficiency or quality, how large is the
impact, and what is causing it?*

---

### Dimension 03 — Strategic Intelligence

**What it develops:**
The ability to identify competitive dynamics, market positioning risks,
and strategic trade-offs from internal operational data — without
access to external competitive intelligence.

**What this looks like in practice:**
Strategy is visible in data indirectly. If a competitor launches
multi-currency support, the consequence appears in NovaPay's data as
accelerating churn in European enterprise customers. An analyst with
strategic intelligence sees the geographic concentration of churn,
connects it to a product gap, and frames it as a competitive threat
rather than an operational anomaly.

**The operational capability it builds:**
- Competitive vulnerability analysis from internal data patterns
- Market segmentation and opportunity sizing from customer data
- Trend analysis that distinguishes cyclical from structural change
- Identifying strategic trade-offs hidden in operational metrics
- Benchmarking internal performance against industry norms
- Recognizing when a data pattern signals a market-level force

**Why it matters in real environments:**
Most strategic decisions are made with incomplete information.
The analysts who contribute to strategy are those who can read the
strategic signal in operational data — who understand that a customer
segment's churn pattern is not just an operational problem but a
competitive exposure. Strategic intelligence is operational pattern
recognition applied to market-level questions.

**The question this dimension answers:**
*What does the operational data reveal about the company's competitive
position, and what strategic decisions does it point toward?*

---

### Dimension 04 — Decision Intelligence

**What it develops:**
The ability to translate data analysis into defensible recommendations
under uncertainty — including the ability to identify and honestly
acknowledge what the data cannot confirm.

**What this looks like in practice:**
Decision intelligence is where the CEO Briefing exercise lives.
Two analysts can query the same data correctly and reach opposite
recommendations. The one with decision intelligence makes a specific,
time-bound recommendation, quantifies the trade-offs, and explicitly
names what they cannot yet confirm and what additional data they would
need. The one without it says "further investigation is recommended."

**The operational capability it builds:**
- Trade-off quantification from data (build vs. buy vs. partner)
- Risk analysis and opportunity cost modeling
- Decision framing under uncertainty
- Epistemic honesty: distinguishing what the data shows from what
  it cannot confirm
- Scenario analysis and sensitivity testing in SQL
- Structuring a recommendation that a non-technical stakeholder can act on

**Why it matters in real environments:**
Data is abundant. Judgment is scarce. The most common failure mode for
technically strong analysts is producing excellent analysis and then
declining to recommend. Decision intelligence is the bridge between
analysis and action — the ability to say "given what I found and what
I cannot yet confirm, here is what I recommend and why."

**The question this dimension answers:**
*What does the data recommend we do, what are we trading away, and
what do we not yet know that would change the recommendation?*

---

### Dimension 05 — Communication Intelligence

**What it develops:**
The ability to translate data analysis into stakeholder-specific
narratives that drive decisions — understanding that the same finding
requires different framing for different audiences.

**What this looks like in practice:**
A CFO, an engineering lead, and a board member looking at the same
churn analysis need completely different communications. The CFO needs
revenue impact and a recommendation. The engineering lead needs the
specific failure mode and a fix specification. The board needs the
strategic context and a resource request. Communication intelligence
is the ability to make the right argument to the right audience —
and to make the data impossible to ignore.

**The operational capability it builds:**
- Audience analysis and stakeholder-specific framing
- Data narrative structure: problem → evidence → recommendation
- Quantified impact statements that drive urgency
- Handling uncertainty and counter-evidence honestly
- Executive briefing format and discipline
- The discipline of leading with the finding, not the methodology

**Why it matters in real environments:**
Analysis that does not change a decision is wasted. Communication
intelligence is what ensures analysis reaches the people who can act
on it, in a form they can use, with the urgency it deserves. The most
common reason good analysis fails to drive change is poor communication
— not poor analysis.

**The question this dimension answers:**
*How do I translate what I found into a communication that compels
the right person to take the right action?*

---

### Dimension 06 — Augmented Intelligence

**What it develops:**
The ability to use data systems, signals, and models as extensions
of human judgment — treating the database not as a record of what
happened but as a source of leading indicators for what will happen.

**What this looks like in practice:**
Augmented intelligence is the shift from backward-looking reporting
to forward-looking signal detection. An analyst with augmented
intelligence asks: which customers are most likely to churn in the
next 90 days based on usage patterns and complaint history? What
does the early-stage data tell us about whether this strategy is
working before the quarterly numbers confirm it?

**The operational capability it builds:**
- Leading indicator identification from operational data
- Anomaly detection and early warning pattern recognition
- A/B test design and analysis from experimental data
- Predictive signal extraction from historical patterns
- Using the database as a scenario modeling tool
- Understanding the limits of predictive analysis and communicating
  those limits honestly

**Why it matters in real environments:**
The most valuable analytical work is not explaining what happened —
it is anticipating what will happen. Augmented intelligence teaches
analysts to use the same data they already have as a forward-looking
instrument. This is the dimension that most directly separates
analytical contributors from analytical leaders.

**The question this dimension answers:**
*What does the data tell us about what is about to happen, and what
should we do before the lagging indicators confirm it?*

---

## How the dimensions relate to each other

The dimensions are not sequential — they are simultaneous lenses.

In practice, a complete business investigation uses all six:

```
Financial Intelligence    → establishes what the numbers say
Operational Intelligence  → explains why the numbers are what they are
Strategic Intelligence    → contextualizes the numbers in the market
Decision Intelligence     → translates the numbers into a recommendation
Communication Intelligence → delivers the recommendation to the right audience
Augmented Intelligence    → identifies what the numbers predict about the future
```

Each module's 10-exercise arc naturally moves through multiple
dimensions. Early exercises tend toward Financial and Operational.
Middle exercises move toward Strategic and Decision. The CEO Briefing
culminates in Communication and Augmented Intelligence.

---

## The exercise design principles

Every exercise in Atelier follows these rules:

**1. Business questions, not SQL questions**
Exercise prompt: "Is churn getting worse?"
Not: "Write a query that calculates monthly churn rate."
The learner decides what to query. The business question is the prompt.

**2. The story is in the data, not the documentation**
Learners discover the NovaPay multi-currency problem because European
enterprise churn correlates with support tickets containing currency
keywords — not because a tooltip tells them to look there.

**3. Escalation from guided to open**
Exercise 1-3: Guided business questions with clear scope
Exercise 4-7: Open business questions with indirect hints
Exercise 8-10: "The CEO is worried about something. Find it."

**4. Assessment measures insight, not syntax**
A correct query with no business interpretation fails.
An imperfect query with correct business reasoning passes.
The rubric grades judgment, not correctness.

**5. The arc has a direction**
Exercise 1: Surface metric — establishes false confidence
Exercise 2-4: Decomposition — reveals what is hiding underneath
Exercise 5-8: Root cause — explains the why
Exercise 9-10: Quantification — sizes the impact for a decision
CEO Briefing: Recommendation — translates findings into action

---

## The module design rules

Each module must have:

- Exactly 10 exercises following the arc above
- One CEO Briefing (graded by AI on three axes)
- One hidden crisis discoverable only through exercise 5-8
- One surface metric that looks healthy until decomposed
- Reference data: specific numbers a complete investigation would find
- A reference briefing scoring 88-97 on the three-axis rubric

Each module maps primarily to one or two dimensions but contains
data that supports investigation through all six.

---

## What this means for Hot Cases

Hot Cases are 30-minute excerpts of the module investigation arc.
They take exercises 1-2 (surface) and exercise 3 (decomposition)
from the full module arc and compress them into a standalone crisis.

A Hot Case teaches Financial Intelligence and Decision Intelligence
by default — because pattern detection and quantified recommendation
are always the axes graded.

Hot Cases are the on-ramp. Modules are the full experience.

---

## The curriculum progression

A learner who completes all six modules has:

- Investigated six companies across six industries
- Applied all six dimensions of business acumen in different contexts
- Written six graded CEO briefings
- Earned up to six publicly verifiable credentials
- Built a portfolio of analytical work on production-realistic data

The Atelier Rank profile shows their performance across all six
dimensions — where they are strong and where to develop next.
This is the value of the six-company structure: not coverage, but
depth across multiple contexts.

---

*Mpingo Systems LLC · Raleigh, NC*  
*ATELIER-CURRICULUM-FRAMEWORK v1.0 · May 2026*
