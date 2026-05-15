

---

## **Business Acumen Through Live Data — Course Concept**

### **The Core Insight**

Every business acumen course teaches concepts through case studies, slides, and hypothetical numbers. The problem: students never *touch* the data. They read about a company's churn rate — they never query it.

RealityDB flips this. You generate a synthetic company that **behaves like a real business** — with customers, revenue, churn, fraud, supply chain failures, hiring cycles — and students learn business dynamics by interrogating the data directly.

**The student doesn't read about a struggling SaaS company. They become its data analyst.**

---

### **What Makes This Uniquely Possible with RealityDB**

* **Lifecycle rules** — revenue goes down before a company recovers. Churn spikes before a product pivot. Fraud increases during holiday seasons. RealityDB generates temporally coherent data that tells a business story.  
* **Scenario injection** — simulate a fraud spike, a churn wave, a holiday rush, a data breach. Students see how the numbers change.  
* **Scale** — 50,000 rows means real statistical patterns emerge. You can't fake a cohort analysis on 20 rows.  
* **Multi-domain** — FinTech, Healthcare, Supply Chain, SaaS, Telecom. Each domain teaches different business dynamics.  
* **Quality scoring** — 97-100/100 means distributions are research-backed. Churn rates, fraud rates, payment failure rates all match industry benchmarks.

---

### **Course Architecture**

**Course Title:** *Reading the Business: Data-Driven Business Acumen*

**Target audience:** MBA students, business analysts, startup founders, product managers, non-technical executives who want to understand their data

**Philosophy:** Every concept is introduced as a business question first, then answered with a SQL query on live synthetic data.

---

### **Module Structure**

**Module 1 — The Language of Business Numbers** *How do you know if a business is healthy?*

Concepts: Revenue, costs, margins, growth rate, burn rate Dataset: SaaS Starter (users, plans, subscriptions, payments)

\-- Is this business growing?  
SELECT DATE\_TRUNC('month', created\_at) AS month,  
       COUNT(\*) AS new\_customers,  
       SUM(p.price\_cents / 100.0) AS monthly\_revenue  
FROM subscriptions s  
JOIN plans p ON s.plan\_id \= p.id  
GROUP BY month ORDER BY month;

Students see a growth curve in real data. They adjust the query. They ask: *what happened in month 6?*

---

**Module 2 — Customer Dynamics** *Who are your best customers? Who is about to leave?*

Concepts: LTV, CAC, churn, retention cohorts, NPS proxies Dataset: SaaS Starter \+ Telecom

\-- Which customers have the highest lifetime value?  
SELECT u.name,  
       SUM(p.amount\_cents / 100.0) AS lifetime\_value,  
       MIN(p.created\_at) AS first\_payment,  
       MAX(p.created\_at) AS last\_payment,  
       COUNT(p.id) AS payment\_count  
FROM users u  
JOIN subscriptions s ON u.id \= s.user\_id  
JOIN payments p ON s.id \= p.subscription\_id  
GROUP BY u.id, u.name  
ORDER BY lifetime\_value DESC;

Then SimLab injects a churn wave scenario. Students see the numbers change and must diagnose why.

---

**Module 3 — Financial Risk & Fraud** *How do you spot when something is wrong?*

Concepts: Anomaly detection, fraud patterns, risk scoring, AML red flags Dataset: AML Compliance \+ FinTech

\-- Which accounts have unusual transaction velocity?  
SELECT account\_id,  
       COUNT(\*) AS transaction\_count,  
       SUM(amount) AS total\_amount,  
       MAX(amount) AS largest\_transaction,  
       STDDEV(amount) AS volatility  
FROM transactions  
WHERE created\_at \> NOW() \- INTERVAL '7 days'  
GROUP BY account\_id  
HAVING COUNT(\*) \> 10 OR SUM(amount) \> 50000  
ORDER BY total\_amount DESC;

Students learn to build a risk dashboard from scratch.

---

**Module 4 — Operations & Supply Chain** *How do you know your operations are efficient?*

Concepts: Inventory turnover, fulfillment rates, supplier reliability, demand forecasting Dataset: Supply Chain (24 tables)

\-- Which suppliers are causing delays?  
SELECT s.name AS supplier,  
       COUNT(po.id) AS total\_orders,  
       AVG(EXTRACT(DAY FROM (sh.actual\_delivery \- sh.expected\_delivery))) AS avg\_delay\_days,  
       COUNT(CASE WHEN de.id IS NOT NULL THEN 1 END) AS exceptions  
FROM suppliers s  
JOIN purchase\_orders po ON s.id \= po.supplier\_id  
JOIN shipments sh ON po.id \= sh.order\_id  
LEFT JOIN delivery\_exceptions de ON sh.id \= de.shipment\_id  
GROUP BY s.id, s.name  
ORDER BY avg\_delay\_days DESC;

---

**Module 5 — Healthcare Economics** *How do hospital systems manage costs and patient outcomes?*

Concepts: Cost per patient, procedure profitability, insurance claim patterns, resource allocation Dataset: Healthcare Analytics (14 tables)

---

**Module 6 — Building a Business Dashboard** *How do executives make decisions from data?*

Capstone: Students build a complete executive dashboard using all prior skills. They pick a domain, generate a dataset at 50K rows, and present 5 key business insights with supporting queries.

---

### **The SimLab Integration**

Each module uses SimLab to inject business scenarios:

| Scenario | Business lesson |
| ----- | ----- |
| Fraud spike | Risk management, internal controls |
| Churn wave | Retention strategy, product-market fit |
| Holiday rush | Demand planning, operational scaling |
| Payment failures | Cash flow management, payment infrastructure |
| Supplier delay | Supply chain resilience, vendor management |
| Data breach | Incident response, compliance costs |

Students run the scenario, watch the numbers change, and must write a "CEO briefing" — a short narrative explaining what happened and what to do.

---

### **Certification Integration**

Upon completing all 6 modules:

* **Business Data Analyst Certificate** — Ed25519 signed, shareable  
* Different from SQL Analyst cert — this is business-focused, not technical  
* Verifiable by employers: "This person can read a P\&L in SQL"

---

### **Delivery Options**

**Option A — Self-paced inside Learn** Add as a 6-chapter business track alongside the SQL track. Same PGlite engine, same auto-grading. Free for Foundations module, Learner tier for full course.

**Option B — Standalone course platform** Separate product at `learn.realitydb.dev` — designed for corporate training, MBA programs, bootcamps. Bulk licensing at $299/cohort.

**Option C — Partner with business schools** Position as the practicum layer for MBA data analytics courses. Schools provide curriculum, RealityDB provides the live synthetic company datasets. $4,999/semester per program.

---

### **What Makes This Different from Every Other Business Course**

| Existing courses | RealityDB Business Acumen |
| ----- | ----- |
| Harvard Business School cases | Synthetic live data you can query |
| Static spreadsheets | 50,000 rows with real distributions |
| "Imagine a company that..." | Here is the company. Query it. |
| Professor explains churn | You discover churn by running a cohort query |
| Pass/fail multiple choice | Write the SQL that proves your insight |
| Certificate says "completed" | Certificate proves you found the fraud pattern |

---

### **Next Steps to Build This**

1. **Define the 6 datasets** — one per module, tuned for business storytelling (SimLab scenarios pre-configured)  
2. **Write 6 markdown lesson files** — business concept → SQL query → business insight  
3. **Build the question bank** — 10 business questions per module, graded by SQL output  
4. **Create the Business Acumen Certificate** — separate from SQL certs, different branding  
5. **Pilot with one module** — Module 1 (SaaS business dynamics) can be built in one sprint

**Module 1 can be live in 3 days.** The SaaS Starter dataset already exists at 97/100 quality. The SimLab scenarios already work. The Learn engine already supports new chapters.

The mindmap shows four layers of proximity between business acumen and data:

**Layer 1 — Operational** (teal, left): Financial reporting, operations metrics, supply chain, risk and fraud. These people live inside the data every day. They need SQL Foundations.

**Layer 2 — Analytical** (blue, right): Customer dynamics, product analytics, market intelligence, workforce. These people interpret patterns across systems. They need SQL Analyst skills.

**Layer 3 — Strategic** (amber, above center): Executive decisions and capital allocation. These people read summaries but must understand what's behind the numbers. They need SQL Advanced \+ business narrative.

**Layer 4 — Systems** (coral, below): The actual platforms that generate the data — ERP/CRM, payment rails, healthcare ops, telecom. These are what RealityDB simulates.

**The course design implication:** Each domain in the course should start at the system level (here's the data this business generates), move through the analytical layer (here's what the patterns mean), and arrive at a strategic insight (here's the decision a leader would make from this).

This is the core bridge — the one most business people never see. Let me show it as a flow from raw database rows to the P\&L a CFO reads.This is the bridge most business courses never show. The five layers:

**Layer 1** — three database tables: `payments`, `subscriptions`, `plans`. These are just rows. No business meaning yet.

**Layer 2** — a SQL query joins them and groups by month. This is where meaning begins. A data analyst writes this.

**Layer 3** — the query output becomes named metrics: MRR, ARR, churn rate, NRR. This is the language finance teams speak.

**Layer 4** — those metrics flow into the income statement. The CFO sees "$842,000 revenue" — but it came from `SUM(amount_cents)`.

**Layer 5** — the P\&L drives decisions: raise prices, cut costs, expand into new markets, conserve cash before the next fundraise.

**The business acumen gap** most people have: they can read Layer 4 and make Layer 5 decisions — but they can't trace back to Layer 1\. When the CFO says "revenue was soft this quarter," someone who can query Layer 1 can immediately answer *why* — was it fewer new subscriptions? Higher churn? Lower average plan price? A payment failure spike?

That's what the course teaches. Click any node to go deeper on that specific connection.

