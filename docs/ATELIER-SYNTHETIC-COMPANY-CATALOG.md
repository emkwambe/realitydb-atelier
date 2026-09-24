# Atelier — Synthetic Company Catalog
## Complete Registry of Current and Pipeline Companies
**Version:** 1.0 · June 15, 2026  
**Owner:** Eddy Mkwambe · Mpingo Systems LLC  
**Status:** Living document — update when new companies are added  
**Read before:** Authoring any Hot Case, planning any new module, or updating the waitlist page

---

## Registry overview

Atelier's synthetic companies are the core intellectual asset of the platform.
Each company is a complete synthetic enterprise — production-realistic schema,
temporal data, FK integrity, lifecycle rules, and a hidden business crisis
discoverable only through structured investigation.

This catalog is the single source of truth for:
- Which companies exist and their current status
- Which dimension each company primarily develops
- What crisis is hidden in each dataset
- What companies are planned and when they ship
- How to reference companies in marketing copy

---

## Status definitions

| Status | Meaning |
|---|---|
| ✅ Live | Available in Atelier, accessible to learners |
| 📋 Specified | Full spec written, pending data generation |
| 🔬 Research | Design phase, no spec yet |
| 💡 Concept | Named and positioned, not yet designed |

---

## Current companies (live)

### 01 — NovaPay
| Attribute | Value |
|---|---|
| **Status** | ✅ Live |
| **Industry** | B2B SaaS / Payments |
| **Stage** | Series B |
| **ARR** | $2.1M |
| **Primary dimension** | Financial Intelligence |
| **Supporting dimensions** | Decision Intelligence, Operational Intelligence |
| **Learner role** | VP of Growth |
| **Tables** | 13 |
| **Rows** | 50,000 |
| **Time span** | 24 months |
| **Hidden crisis** | Blended MRR growth masks cohort retention decay. The 2025 acquisition cohort churns at 3x the rate of the 2023 cohort. New volume offsets churn in aggregate — the business looks healthy until you decompose by cohort vintage. |
| **Smoking gun** | 2025 cohort churns at ~3.2%/month (~32% annualized) vs 2023 cohort at ~6%/year |
| **Crisis type** | Cohort collapse masked by volume growth |
| **Pattern ID** | mrr-growth-masking-cohort-decay |
| **Exercises** | 10 + CEO Briefing |
| **Investigation arc** | Read the room → Revenue sources → Churn trend → Who churns → LTV:CAC → NRR → Concentration risk → Complaints → Causation → Quantify the decision |
| **Hot Case** | The Cohort Collapse (live, slug: cohort-collapse) |

---

### 02 — MedCore Health
| Attribute | Value |
|---|---|
| **Status** | ✅ Live |
| **Industry** | Healthcare / Regional Hospital System |
| **Primary dimension** | Healthcare Systems Intelligence |
| **Supporting dimensions** | Operational Intelligence, Financial Intelligence |
| **Learner role** | Chief Analytics Officer |
| **Tables** | TBD |
| **Rows** | TBD |
| **Hidden crisis** | TBD — confirm from existing module content |
| **Pattern ID** | TBD |

---

### 03 — SupplyLink Operations
| Attribute | Value |
|---|---|
| **Status** | ✅ Live |
| **Industry** | Manufacturing / Supply Chain |
| **Primary dimension** | Operational Intelligence |
| **Supporting dimensions** | Strategic Intelligence, Financial Intelligence |
| **Learner role** | VP of Supply Chain |
| **Tables** | TBD |
| **Rows** | 50,000 |
| **Hidden crisis** | One supplier causing 40% of delays — discoverable by joining shipments to suppliers and calculating delay concentration |
| **Pattern ID** | concentration-risk-invisible-in-aggregate |

---

### 04 — TowerNet Communications
| Attribute | Value |
|---|---|
| **Status** | ✅ Live |
| **Industry** | Telecom / Mobile Network Operator |
| **Primary dimension** | Growth Intelligence / Strategic Intelligence |
| **Supporting dimensions** | Financial Intelligence, Operational Intelligence |
| **Learner role** | Head of Strategy |
| **Tables** | TBD |
| **Rows** | 50,000 |
| **Hidden crisis** | Regional churn spike masked by blended ARPU |
| **Pattern ID** | leading-indicator-divergence |

---

### 05 — ClearBank Financial
| Attribute | Value |
|---|---|
| **Status** | ✅ Live |
| **Industry** | Regional Bank / AML Compliance |
| **Primary dimension** | Decision Intelligence / Risk Intelligence |
| **Supporting dimensions** | Operational Intelligence, Communication Intelligence |
| **Learner role** | Chief Compliance Officer |
| **Tables** | TBD |
| **Rows** | 50,000 |
| **Hidden crisis** | Suspicious wire transfer pattern requiring SAR filing — not obviously fraudulent on the surface |
| **Pattern ID** | compliance-gap-surfacing-in-data |

---

### 06 — OncoCare Therapeutics
| Attribute | Value |
|---|---|
| **Status** | ✅ Live |
| **Industry** | Oncology / Phase III Clinical Trial |
| **Primary dimension** | Clinical Intelligence |
| **Supporting dimensions** | Decision Intelligence, Epistemic Integrity |
| **Learner role** | VP of Clinical Operations |
| **Tables** | TBD |
| **Rows** | 30,000 |
| **Hidden crisis** | SITE-07 is systematically under-dosing patients (avg_dose_pct ~85% vs ~98% at other sites), producing artificially lower response rates and grade 3+ toxicity. The interim analysis ORR threshold passes — but the site anomaly would distort the final trial result if not corrected. |
| **Smoking gun** | SITE-07: avg_dose_pct ~85%, response_rate ~31%, grade3plus ~15% vs other sites: avg_dose_pct ~98%, response_rate ~54%, grade3plus ~30% |
| **Pattern ID** | operational-site-anomaly-masking-trial-validity |
| **Exercises** | 10 + CEO Briefing |

---

## Pipeline companies (specified)

### 07 — GulfStream Insurance
| Attribute | Value |
|---|---|
| **Status** | 📋 Specified |
| **Module name** | Cascade Risk |
| **Industry** | Property & Casualty InsurTech |
| **Primary dimension** | AI-Augmented Intelligence |
| **Supporting dimensions** | Decision Intelligence, Epistemic Integrity |
| **Learner role** | Senior Analyst reporting to CEO |
| **Tables** | 8 |
| **Rows** | ~585,000 |
| **Time span** | 24 months (2024-01-01 to 2025-12-31) |
| **Hidden crisis** | Three adjusters (ADJ_0847, ADJ_0912, ADJ_1034) in Team_Delta, Gulf Coast region, never completed Reserve Model v2 training. They have used the deprecated v1 formula for 14 months, causing $22.4M in cumulative claims leakage. It is not fraud — the AI will hallucinate this conclusion and the learner must catch it. |
| **Smoking gun** | Training records show no v2 completion for three adjusters. Reserve model variance drifts from +5% to +34% starting November 15, 2024, exclusively in Gulf Coast. |
| **Pattern ID** | operational-training-gap-masking-as-model-error |
| **Special features** | Unstructured text (15K adjuster notes, 8 whistleblower emails), AI hallucination trap, Level 4 requires post-mortem and reusable prompt templates |
| **AI use** | Encouraged — required for Level 4 score |
| **Full spec** | docs/CASCADE-RISK-MODULE-SPEC.md |
| **Exercises** | 5 phases, 10 investigations + CEO Briefing |
| **Est. time** | 4-6 hours |
| **Dependencies** | Proprietary data generator must handle unstructured text fields |

---

### 08 — Meridian Law Partners (LegalTech Discovery)
| Attribute | Value |
|---|---|
| **Status** | 📋 Specified (concept level) |
| **Module name** | Discovery Accelerator |
| **Industry** | LegalTech / Pharmaceutical Defense |
| **Primary dimension** | AI-Augmented Intelligence (Level 4 complement to Cascade Risk) |
| **Supporting dimensions** | Epistemic Integrity, Communication Intelligence |
| **Learner role** | Senior Discovery Analyst |
| **Tables** | 4 (emails, slack_messages, clinical_trial_data, legal_hold_records) |
| **Rows** | ~30,000 |
| **Crisis summary** | A law firm defending a pharmaceutical company receives 25,000 internal emails and Slack messages from a plaintiff's discovery request. The plaintiff alleges the pharma company knew about a side effect and suppressed it. The partner needs to know: is there a smoking gun? |
| **Hidden pattern** | No smoking gun — but a pattern of willful ignorance. Three scientists discussed a signal in Slack but never escalated to formal adverse event reporting. Legal risk: $400M. The pattern is discoverable via sentiment analysis ("weird", "should we tell someone", "probably nothing") and entity extraction linking scientist names to clinical trial data. |
| **AI necessity** | 25,000 emails + Slack messages are impossible to read manually in time. AI is required for summarization, sentiment extraction, and entity resolution. |
| **Special features** | Learner must know when NOT to use AI (confidential data handling — must use local model or API with privacy controls). |
| **Data types** | Emails (unstructured), Slack messages (conversational), clinical trial data (PostgreSQL), legal hold records |
| **Key competency evidence** | Using AI to summarize 25K documents; catching AI hallucination (fabricated smoking gun email); designing prompts for legal relevance; privacy-aware AI deployment |
| **Relationship to Cascade Risk** | Cascade Risk = Level 3 AI-Aug competency. Discovery Accelerator = Level 4. Both together complete the AI-Augmented Intelligence dimension. |
| **Build priority** | After Cascade Risk ships and AI-Aug competency framework is validated |

---

## Planned companies (concept stage)

### 09 — RetailEdge (placeholder name)
| Attribute | Value |
|---|---|
| **Status** | 💡 Concept |
| **Industry** | Retail / E-commerce |
| **Target dimension** | Growth Intelligence |
| **Crisis concept** | Seasonal baseline masking underlying decline in core customer cohorts |
| **Pattern ID** | seasonal-baseline-masking-decline |
| **Build trigger** | When Growth Intelligence needs a dedicated retail context |

---

### 10 — HorizonBank (placeholder name)
| Attribute | Value |
|---|---|
| **Status** | 💡 Concept |
| **Industry** | Retail Banking / Consumer Finance |
| **Target dimension** | Financial Intelligence (consumer lending context) |
| **Crisis concept** | CAC illusion — blended CAC looks stable while high-cost channels grow as share |
| **Pattern ID** | channel-mix-shift-obscuring-cac |
| **Build trigger** | When corporate L&D buyers in financial services request a consumer banking context alongside ClearBank's AML focus |

---

### 11 — ApexClinical (placeholder name)
| Attribute | Value |
|---|---|
| **Status** | 💡 Concept |
| **Industry** | Contract Research Organization (CRO) |
| **Target dimension** | Operational Intelligence (clinical operations) |
| **Crisis concept** | Retention cliff — patient retention looks stable until cohorts hit maturity threshold |
| **Pattern ID** | retention-cliff-post-cohort-maturity |
| **Build trigger** | When IES research pathway requires a second clinical context for cross-module comparison studies |

---

### 12 — VerdantFoods (placeholder name)
| Attribute | Value |
|---|---|
| **Status** | 💡 Concept |
| **Industry** | Food & Beverage / CPG |
| **Target dimension** | Strategic Intelligence |
| **Crisis concept** | Silent concentration — aggregate supplier health hides dangerous dependency on single vendor |
| **Pattern ID** | concentration-risk-invisible-in-aggregate |
| **Build trigger** | When supply chain dimension needs a consumer goods context distinct from SupplyLink's manufacturing focus |

---

## The pattern library — company assignment

Each company is built around one or more named patterns from the Hot Case pattern library. This table shows which patterns are used, by which company, and which remain available for new companies or Hot Cases.

| Pattern ID | Pattern name | Used by | Available for |
|---|---|---|---|
| mrr-growth-masking-cohort-decay | Cohort Collapse | NovaPay | Other SaaS verticals |
| margin-compression-hidden-by-volume | Margin Mirage | Unassigned | Any module |
| concentration-risk-invisible-in-aggregate | Silent Concentration | SupplyLink (supplier), VerdantFoods (concept) | Other verticals |
| leading-indicator-divergence | Signal Split | TowerNet | Other verticals |
| channel-mix-shift-obscuring-cac | CAC Illusion | HorizonBank (concept) | Any module |
| seasonal-baseline-masking-decline | Seasonal Cover | RetailEdge (concept) | Any module |
| compliance-gap-surfacing-in-data | Quiet Exposure | ClearBank | Healthcare, pharma |
| retention-cliff-post-cohort-maturity | Cliff Edge | ApexClinical (concept) | Any module |
| operational-training-gap-masking-as-model-error | Training Gap | GulfStream (Cascade Risk) | InsurTech, healthcare |
| operational-site-anomaly-masking-trial-validity | Site Anomaly | OncoCare | Multi-site operations |
| willful-ignorance-in-unstructured-data | Discovery Pattern | Meridian Law (concept) | Legal, compliance |

---

## Company expansion rules

### When to add a new company

Add a new company when:
1. A dimension has no live module (primary trigger — AI-Aug had no module, driving Cascade Risk)
2. A corporate L&D buyer requests a specific vertical not covered (demand-driven)
3. A university program requires a second context for a specific dimension for research validity
4. The IES research pathway requires cross-module comparison data
5. A Hot Case pattern has been used 3+ times but no module anchors it

Do NOT add a new company to:
- Increase module count without a clear dimension or pattern rationale
- Replicate an existing crisis in a different industry without adding new analytical challenge
- Respond to individual learner requests — wait for pattern across multiple users

### The quarterly expansion target

Starting Q3 2026: add one new company per quarter until all six dimensions
have at least two companies (12 companies total = full curriculum coverage).

| Quarter | Target | Company concept |
|---|---|---|
| Q3 2026 | Cascade Risk live | GulfStream Insurance |
| Q4 2026 | Financial Intelligence × 2 | HorizonBank (consumer banking) |
| Q1 2027 | Operational Intelligence × 2 | VerdantFoods (CPG supply chain) |
| Q2 2027 | Strategic Intelligence × 2 | RetailEdge (CPG/retail growth) |
| Q3 2027 | AI-Aug Intelligence × 2 | Meridian Law (LegalTech discovery) |
| Q4 2027 | Clinical Intelligence × 2 | ApexClinical (CRO) |

At Q4 2027: 12 companies, all six dimensions have two companies each.
This creates cross-module comparison studies needed for IES Phase IB.

### The "more companies added quarterly" commitment

The waitlist page and landing page carry the line:
**"More companies added quarterly."**

This is a public commitment. Do not add companies without completing:
1. Full schema specification
2. Data generation and validation (15-query suite)
3. Module UI implementation
4. Grader calibration (anchor-based, 3 anchors)
5. Pre-publish verification checklist (23 items)

A partially built company damages trust more than a smaller catalog.

---

## How to reference companies in marketing copy

### On the waitlist page (current)
Six companies across six verticals — each with a full operational history:
- NovaPay — B2B SaaS payments platform
- MedCore Health — Regional hospital system
- SupplyLink Operations — Manufacturing supply chain
- TowerNet Communications — Mobile network operator
- ClearBank Financial — Regional bank, AML compliance
- OncoCare Therapeutics — Phase III oncology trial

*More companies added quarterly.*

### When Cascade Risk ships (add)
- GulfStream Insurance — P&C InsurTech, claims leakage investigation

### In enterprise and academic sales conversations
> "Atelier currently has six live synthetic companies across six industries —
> SaaS, healthcare, supply chain, telecom, banking, and oncology. Each
> company has a full 24-month operational history with 50,000+ rows of
> production-realistic data. We add one new company per quarter. Every
> company teaches all six dimensions of business acumen — but each is
> designed to reward mastery of a specific combination of dimensions."

### What never to say
- "Practice databases" — these are synthetic enterprises, not practice tools
- "Sample data" — these are complete operational histories
- "Fake companies" — these are synthetic companies with realistic histories
- "SQL exercises" — these are executive investigations

---

## Internal naming conventions

| Element | Convention | Example |
|---|---|---|
| Company name | Real-sounding but fictitious | NovaPay, ClearBank, OncoCare |
| Module name | Two-word crisis name | The Cohort Collapse, Cascade Risk |
| Database name | snake_case of company | novapay, clearbank, cascade_risk |
| Slug | hyphenated crisis | cohort-collapse, cascade-risk |
| Pattern ID | hyphenated descriptor | mrr-growth-masking-cohort-decay |
| Credential | "Solved [Crisis Name]" | "Solved the NovaPay Retention Crisis" |

---

## Document maintenance

This catalog must be updated when:
- A new company reaches ✅ Live status
- A concept company is promoted to 📋 Specified
- A new pattern is added to the pattern library
- A company's hidden crisis or smoking gun is modified
- The quarterly expansion schedule changes

Owner of updates: Eddy Mkwambe
Update frequency: On each new company addition or status change
File location: `docs/ATELIER-SYNTHETIC-COMPANY-CATALOG.md`

---

*Mpingo Systems LLC · Raleigh, NC*  
*ATELIER-SYNTHETIC-COMPANY-CATALOG v1.0 · June 15, 2026*  
*Single source of truth for all synthetic companies in the Atelier curriculum*
