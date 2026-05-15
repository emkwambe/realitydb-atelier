### **1\. Executive Summary**

The market for business data literacy is large and growing, with U.S. training expenditures reaching $102.8 billion in 2025 . However, existing solutions fall into a clear gap: traditional business acumen courses from elite institutions like Harvard and Wharton rely on static case studies, while data literacy platforms focus on technical coding skills without business context. DataRoom’s core insight—that interrogating live, synthetic data teaches business acumen more effectively than reading about it—is well-supported by academic research on simulation-based learning. The study on high-fidelity simulation in medical education found that while knowledge retention is similar, students show a greater preference for simulation, finding it more varied, better at reinforcing learning, and "closer to reality" .

Key Recommendations:

* Lead with corporate L\&D first for faster revenue cycles (3-9 months) before pursuing longer MBA program sales cycles (12-18 months) .  
* Frame the platform around strategic outcomes, not SQL skills. Corporate buyers need "reduce time to productivity" and "lower voluntary turnover," not "learn window functions" .  
* Position against HBS Online strategically. At   
* 1,850−  
* 1,850−2,622 per course for passive case study learning , DataRoom’s   
* 199−  
* 199−499 self-paced pricing offers a more practical, hands-on alternative at a fraction of the cost.  
* The "flight simulator" analogy is your strongest marketing asset. It resonates across segments and is academically defensible.

### **2\. Market Opportunity**

Market Size: The corporate L\&D market is substantial. U.S. companies spent an average of $874 per learner in 2025, with 16% of training budgets going to learning technologies . The World Economic Forum projects that 39% of workers' core skills will be outdated by 2030, driving demand for reskilling platforms . MBA programs are increasingly mandating data analytics—Edinburgh's MBA now includes "Data and Analytics for Leaders" covering "data-driven decision making and data analytics across business functions" , and universities like John Brown offer entire MBA concentrations in Data Analytics .

Competitor Weaknesses:

* HBS Online / Wharton: Prestigious but expensive (  
* 1,850−  
* 1,850−2,622/course) and fundamentally limited by the static case study method. Students read about data rather than querying it .  
* DataCamp / Coursera: Technical training platforms that teach SQL but lack business context. Their corporate sales motion validates the model but targets data practitioners, not business leaders.  
* Existing business acumen courses: Harvard DCE's "Financial Fluency for Business Leaders" covers revenue drivers and profit patterns through traditional instruction but lacks live data interaction entirely .

The Gap DataRoom Fills: MBA programs currently lack tools that bridge data literacy and strategic decision-making. Edinburgh's MBA course teaches "how to drive value from data" but explicitly notes students "will not specialise in detailed aspects of data management or analysis" . DataRoom makes that "driving value" component tangible and experiential. No existing platform combines live SQL querying with business narrative discovery.

Price Points That Work:

* Self-paced professional:   
* 199−  
* 199−499 aligns with premium online courses  
* Corporate cohort:   
* 2,999for10seats(  
* 2,999*for*10*seats*(299/learner) is competitive with corporate training averages  
* MBA program license: $4,999/semester undercuts per-course fees from traditional publishers  
* HBS Online charges $1,850 for one 8-week course —DataRoom offers more practical skill development at roughly 1/6th the price

### **3\. Curriculum Framework**

Foundational Principle: Business acumen requires both technical data skills and interpretive business judgment. The curriculum must scaffold from mechanical querying to strategic insight, mirroring the five-layer model you've designed.

10 Critical Business Questions the Curriculum Must Answer:

1. Where is revenue actually coming from? (cohort analysis, customer segmentation)  
2. Is churn getting better or worse, and for whom? (retention curves, segment comparison)  
3. Which customers generate the most profit, not just revenue? (unit economics)  
4. What happens if we raise prices by 10%? (price sensitivity, elasticity)  
5. Where are costs growing faster than revenue? (margin analysis)  
6. Which leading indicators predict problems 3-6 months out? (predictive signals)  
7. Is growth sustainable or are we buying unprofitable customers? (LTV/CAC)  
8. What story would this data tell the board? (narrative construction)  
9. What decision would you make with $5M in new funding? (resource allocation)  
10. How do you know you're measuring the right things? (metric design)

Scaffolding Sequence:

* Phase 1 \- Data Access Fundamentals: SELECT, WHERE, GROUP BY, basic JOINs on familiar business entities (customers, orders)  
* Phase 2 \- Business Metric Construction: Building MRR, churn rate, LTV directly from transactions (Layer 2 → Layer 3\)  
* Phase 3 \- Pattern Recognition: Identifying anomalies in time-series data, cohort breakdowns, seasonality  
* Phase 4 \- Narrative Synthesis: The "CEO briefing" exercise—translating query results into strategic recommendations  
* Phase 5 \- Decision-Making Under Uncertainty: What analysis would you commission with limited time and resources?

Adapting the HBS Case Study Method: The classic case study has three elements: a protagonist facing a decision, contextual richness, and a discussion-based pedagogy. DataRoom transforms this by making the data the case protagonist—the student discovers the problem through exploration rather than having it described. The instructor facilitates discussion around what students found and what they might have missed. This aligns with Kolb's experiential learning cycle: concrete experience (querying), reflective observation (analyzing results), abstract conceptualization (forming hypotheses), and active experimentation (testing new queries) .

### **4\. NovaPay Company Design**

NovaPay: B2B SaaS Payments Platform

The Hidden Story: NovaPay has been celebrating 8% MoM revenue growth and $2.1M ARR. But accelerating churn among enterprise customers threatens everything. The root cause—missing multi-currency support—is discoverable through support ticket data, not revenue metrics. The churn didn't happen suddenly; warning signs appeared 4-6 months before customers actually left.

Database Schema:

`sql`

*`-- Core Tables`*  
`customers (customer_id, company_name, plan_tier, country, currency,`   
           `acquisition_source, signed_date, monthly_revenue, status)`

`subscriptions (subscription_id, customer_id, plan_tier, start_date,`   
               `end_date, monthly_amount, status, cancelled_at)`

`invoices (invoice_id, customer_id, subscription_id, amount, currency,`  
          `issued_date, paid_date, status)`

`support_tickets (ticket_id, customer_id, created_date, category,`   
                 `priority, resolution_time_hours, status, subject, body)`

*`-- Where the story hides: support_tickets.body contains`*   
*`-- multi-currency complaints`*

`payment_transactions (transaction_id, customer_id, invoice_id,`   
                      `amount, currency, exchange_rate_applied,`   
                      `processor_fee, settled_date, status)`

*`-- Enterprise customers with cross-border needs hit exchange rate pain`*

Data Distributions That Tell the Story:

1. Churn by Segment: When students GROUP BY plan\_tier and calculate churn, enterprise tier shows 4.2% monthly churn vs. 1.8% for SMB—despite higher revenue per customer.  
2. Churn Acceleration: A 6-month rolling churn window shows enterprise churn was 1.9% six months ago and has climbed steadily to 4.2%. SMB churn remained flat at \~1.8%.  
3. Support Ticket Clue \#1: Filtering support tickets for "currency" or "multi-currency" shows tickets from enterprise customers started spiking 6 months ago—precisely when churn began accelerating.  
4. Support Ticket Clue \#2: Enterprise tickets mentioning "exchange rate" or "EUR" or "GBP" have average resolution times of 14 days vs. 2 days for other categories, and satisfaction scores 40% lower.  
5. Revenue Impact: Enterprise customers represent 35% of customer count but 65% of revenue. The 10 largest churned accounts represented $15,400 in lost MRR in the last quarter alone.  
6. The Smoking Gun: JOIN customers, support\_tickets, and subscriptions. Enterprise customers who filed multi-currency tickets churned at 68% within 90 days. Enterprise customers without multi-currency tickets churned at 2.1%.

10 Guided Exercises (Basic → Strategic):

1. Basic Exploration: Write a query to count customers by plan\_tier and status. What percentage of enterprise customers are active vs. churned?  
2. Revenue Concentration: Calculate total MRR by plan\_tier. What percentage of revenue comes from enterprise customers?  
3. Churn Rate Calculation: Write a query to calculate monthly churn rate. Is it getting better or worse over the last 6 months?  
4. Cohort Analysis: Break churn rates down by plan\_tier. Where is the problem concentrated?  
5. Support Investigation: Examine support ticket categories and volumes over time. Which category grew fastest?  
6. Correlation Discovery: JOIN support tickets to customer churn. Which ticket category has the highest correlation with cancellation?  
7. Root Cause Confirmation: Filter for multi-currency tickets specifically. What percentage of customers who filed these tickets churned?  
8. Revenue Impact Analysis: Calculate the total MRR lost to churn over the last 6 months. If this rate continues, what happens to ARR in 12 months?  
9. Predictive Modeling: Using ticket data from 6 months ago, which customers should have been flagged as "at risk"?  
10. Strategic Recommendation: Based on everything you've found, what is the single most impactful change NovaPay should make? Support your answer with specific queries and metrics.

CEO Briefing Prompt:

"You are the Head of Analytics at NovaPay. The CEO has asked for a 500-word briefing on the company's biggest strategic risk. Using your analysis of the data, write a memo that:

1. Identifies the most critical business problem  
2. Provides specific evidence from your SQL analysis (reference your queries)  
3. Quantifies the financial impact  
4. Recommends a specific course of action  
5. Anticipates one objection to your recommendation and addresses it"

Grading Rubric (Business Insight, Not SQL Correctness):

Passing (80%+):

* Correctly identifies enterprise churn as the critical issue  
* Uses at least 3 different SQL analyses to support claims  
* Quantifies revenue impact with actual numbers from the data  
* Recommends multi-currency feature development with timeline  
* Addresses the cost/speed tradeoff of building vs. buying

Borderline (60-79%):

* Identifies churn but doesn't segment by plan  
* Cites one query but conclusions are shallow  
* Recommendation is generic ("improve customer retention")  
* Doesn't connect support data to churn

Failing (Below 60%):

* Misses the churn problem entirely  
* Reports revenue growth as the main story  
* No specific data evidence cited  
* No actionable recommendation

### **5\. Go-to-Market Recommendations**

Target Corporate L\&D First. Higher education sales cycles run 12-18 months with formal RFPs . Corporate L\&D cycles run 3-9 months with faster approval, and December creates a "use it or lose it" spending window . The fastest path to revenue is through corporate buyers.

First 10 Paying Customers Plan (90 Days):

\*Month 1 \- Validation & Pilot (Weeks 1-4):\*

* Recruit 3 startups (your network) for a free pilot. Gather case study data: "Founder X identified their churn problem 3 months earlier after using DataRoom."  
* Approach 3 mid-market tech companies through L\&D leaders. Frame as "strategic data acumen" training, not SQL training. Price: $2,999/10 seats.  
* Key metric: Net Promoter Score and willingness to renew.

\*Month 2 \- Content Marketing & Partnerships (Weeks 5-8):\*

* Publish "The Case Study is Broken" thought leadership piece targeting MBA program directors and CLOs on LinkedIn.  
* Offer a free 1-hour "Business Acumen Diagnostic" where professionals answer 10 data-interpretation questions and receive a score.  
* Reach out to 20 MBA program directors at top-50 schools with a specific proposal: pilot DataRoom in one course for free in exchange for feedback and a potential case study.

\*Month 3 \- Revenue Closing & Q4 Budget Capture (Weeks 9-12):\*

* Convert pilots to paid with year-end budget urgency. Corporate L\&D teams have remaining budget expiring December 31 .  
* Launch the Business Acumen Certificate (Ed25519-signed) as a standalone product at $499.  
* Target: 10 paying customers (  
* 20,000−  
* 20,000−30,000 in initial revenue) and 3 MBA program pilots committed for spring semester.

Positioning Against HBS Online: HBS charges 

1,850foran8−weekcoursewherestudentsreadaboutdata\[citation:1\].DataRoomoffershands−onexperiencewithrealbusinessdataat

1,850*foran*8−*weekcoursewherestudentsreadaboutdata*\[*citation*:1\].*DataRoomoffershands*−*onexperiencewithrealbusinessdataat*199-$499. Your competitive wedge: "HBS teaches you what a churn curve looks like. We put you inside the database of a company with a churn crisis and ask you to fix it."

### **6\. Platform Naming and Positioning**

5 Name Options:

1. DataRoom (current working title) — Professional, evokes data-driven decision spaces. Slightly cold but clear.  
2. QueryCase — Describes the core innovation: querying data to solve business cases. Memorable and distinctive.  
3. BusinessLab — Emphasizes the experiential, laboratory approach. Parallels "SimLab" and evokes experimentation.  
4. Metrica — Suggests metrics-driven business thinking. Clean, modern, domainable.  
5. Acumen — Directly targets the skill being taught. Aspirational and executive-friendly. May be harder to trademark/domain.

Recommended: QueryCase or DataRoom. QueryCase best captures the "learn by querying cases" concept. DataRoom is stronger for corporate buyers who need to justify platform purchases.

Positioning Statement:

"DataRoom is the first business acumen platform where professionals learn to make strategic decisions by querying live company data—not by reading static case studies."

Tagline:

"Don't read about the business. Interrogate it."

10-Second Pitch to an MBA Dean:

"Every MBA program teaches case studies where students read about business problems. DataRoom lets students discover those problems themselves by querying a synthetic company's database. They find the churn crisis, write the CEO briefing, and learn business acumen through experience—not lecture. We have six companies ready, and I'd love to pilot one in your analytics course this semester."

Pitch to a Chief Learning Officer:

"Your managers are expected to make data-driven decisions, but most business acumen training still uses spreadsheets and slide decks. DataRoom puts your team inside a synthetic company's actual database. They query real transaction data, discover business problems, and practice making strategic recommendations. It's a flight simulator for business judgment. Our corporate cohorts see measurable improvement in their ability to interpret their own company's data and make faster decisions."

### **7\. Open Questions**

1. Assessment Validity: How do we validate that performance on DataRoom exercises correlates with real-world business decision quality? This requires a longitudinal study tracking learners post-completion—high-value for enterprise sales but resource-intensive.  
2. Instructor Facilitation Model: In HBS case discussions, the instructor guides students toward insights through Socratic questioning. How does this translate to a data exploration environment? Do we need an instructor dashboard showing which students have found which insights?  
3. Synthetic Data "Realness" Threshold: What level of data complexity and messiness is optimal for learning? Too clean and students don't develop critical thinking; too messy and they get frustrated. User testing will be essential.  
4. MBA Curriculum Integration Form: Would DataRoom replace existing analytics courses, supplement them, or serve as a capstone experience? The Edinburgh MBA model suggests integration into existing "Data and Analytics for Leaders" courses is the most realistic entry point .  
5. Enterprise Pricing Structure: Should corporate pricing be per-seat, per-cohort, or based on a platform license? The cohort model (  
6. 2,999/10)worksforpilotsbutmayneedtieredvolumepricingforenterprisedealsthatcanreach  
7. 2,999/10)*worksforpilotsbutmayneedtieredvolumepricingforenterprisedealsthatcanreach*20M+, as Guild Education's experience shows .  
8. Real-Time vs. Pre-Seeded Data: Should the synthetic data be static (every student sees the same NovaPay) or dynamic (each student's queries slightly alter the data, introducing consequences)? The flight simulator analogy favors dynamic, but this significantly increases complexity.  
9. Multi-Language SQL Support: Your target audience includes non-technical executives. Should the platform support natural language query interfaces in addition to SQL, or is learning basic SQL part of the pedagogical value?

