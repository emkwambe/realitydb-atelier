# Atelier — Infrastructure Roadmap
## Multi-Modal Investigation Workbench Architecture
**Version:** 1.0 · September 2026  
**Owner:** Eddy Mkwambe · Mpingo Systems LLC  
**Status:** Approved — governs all future module design and platform infrastructure decisions  
**Read before:** Authoring any new company pack spec, planning any new workbench, or writing IES grant narrative

---

## The founding insight

Atelier's current architecture constrains every investigation to PostgreSQL via PGlite.
This was the right constraint for the first six modules — it forced clean schema design,
taught relational reasoning, and kept the infrastructure simple enough to ship.

But business judgment does not live in SQL alone.

A treasury analyst detecting liquidity model drift works in time-series.
A legal discovery analyst surfacing willful ignorance works in unstructured text.
A fraud investigator mapping transaction networks works in graph structures.
A clinical trial analyst catching site anomalies works across structured and
unstructured data simultaneously.

Forcing all of these into SQL is an architectural compromise — it limits what
Atelier can authentically teach and weakens its credibility with domain experts
who know what treasury risk analysis actually looks like.

The solution is not to build separate products for each domain.
The solution is to build a **multi-modal investigation layer** — different analytical
environments that share one framework, one competency instrument, one credential system,
and one executive briefing format.

The framework stays constant. The tool changes.

---

## The shared framework (never changes across environments)

Regardless of which workbench a learner uses, every Atelier investigation produces:

**The same five investigation phases:**
1. Situation Awareness
2. Problem Identification
3. Root Cause Analysis
4. Strategic Evaluation
5. Executive Communication

**The same six competency dimensions:**
1. Financial Intelligence
2. Operational Intelligence
3. Strategic Intelligence
4. Decision Intelligence
5. Communication Intelligence
6. Augmented Intelligence

**The same assessment instrument (ADAI):**
- Pattern detection
- Data fidelity
- Causal reasoning
- Decision quality
- Executive communication

**The same culminating artifact:**
The CEO Briefing — graded by the ADAI, producing competency evidence,
generating a publicly verifiable credential.

**The same credential format:**
"Solved [Crisis Name] at [Company] — Evidence: [Competency Dimensions]"

What changes across workbenches is only the analytical environment
the learner uses to interrogate the data. The business judgment being
measured is identical.

---

## The four investigation environments

### Environment 1 — SQL Workbench
**Status:** ✅ Live  
**Tool:** PostgreSQL via PGlite (in-browser, no install)  
**Best for:** Relational data, transactional systems, operational databases  

**What it teaches:**
Cohort analysis, segmentation, aggregation, JOIN reasoning, window functions,
date arithmetic, operational pattern detection, concentration risk identification.

**Current modules:**
- NovaPay (Financial Intelligence — SaaS payments)
- MedCore Health (Healthcare Systems Intelligence)
- SupplyLink Operations (Operational Intelligence — supply chain)
- TowerNet Communications (Strategic Intelligence — telecom)
- ClearBank Financial (Decision Intelligence — AML)
- OncoCare Therapeutics (Clinical Intelligence — oncology)
- GulfStream Insurance (AI-Augmented Intelligence — P&C claims) ← specified, pending build

**Expansion path:**
Every new SQL module follows the existing pack authoring workflow:
pack JSON → generate → enforce → assess → exercises.ts → rubric.ts → deploy.

---

### Environment 2 — Time Series Workbench
**Status:** 🔬 Designed — pending infrastructure build  
**Tool:** DuckDB (in-browser via WASM) + optional Pyodide for Python-native analysis  
**Best for:** Daily/hourly time-series data, macro regime analysis, forecasting,
drift detection, seasonal decomposition, regulatory capital modeling  

**What it teaches:**
Regime detection, rolling statistics, structural break identification,
forecast validation, model drift detection, capital reserve calculation,
seasonal pattern decomposition, stress testing.

**Why DuckDB over PGlite:**
DuckDB's WASM build runs in-browser without a server, like PGlite.
But DuckDB is built for analytical workloads — columnar storage, native
time-series functions, efficient window operations over large date ranges.
A five-year daily dataset (1,825 rows) that requires 30-day rolling
statistics across multiple columns runs orders of magnitude faster in
DuckDB than PGlite. DuckDB also supports Parquet file loading natively,
which is the natural format for time-series financial data.

**First module:** Crestview National Bank (Treasury & Model Risk Management)

**Planned modules:**
- Crestview National Bank — liquidity stress, model drift, capital adequacy
- RetailEdge (concept) — demand forecasting, inventory planning, seasonal analysis
- ApexClinical (concept) — patient recruitment velocity, trial timeline forecasting

**Infrastructure requirements:**
- DuckDB WASM bundle in the Next.js build
- Time Series Workbench UI component (replacing SqlEditor for this environment)
  - Date range selector
  - Rolling window controls
  - Regime period highlighter (visual bands on the timeline)
  - Chart panel (line charts for time-series, not just table results)
- Pack format extension: `environment: "timeseries"` flag in pack JSON
- Same briefing submission, same ADAI grader, same credential system

**Bridge strategy (Path A):**
Until the Time Series Workbench is built, Crestview ships as a SQL module
with the time-series data flattened into PostgreSQL tables. Window functions,
date arithmetic, and GROUP BY on date ranges approximate the native
time-series analysis. When the workbench ships, Crestview migrates.
The competency framework and grading do not change on migration.

---

### Environment 3 — Document Intelligence Workbench
**Status:** 💡 Concept — no infrastructure design yet  
**Tool:** In-browser LLM (Claude API) + structured extraction layer  
**Best for:** Unstructured text corpora, legal discovery, compliance review,
clinical notes analysis, contract review, whistleblower investigation  

**What it teaches:**
AI-augmented investigation, prompt engineering, hallucination detection,
entity extraction, sentiment analysis, document clustering, epistemic honesty
about AI output limitations.

**Why this environment exists:**
The Cascade Risk (GulfStream) module already requires AI interaction
with unstructured adjuster notes and whistleblower emails.
Currently this happens through the SQL Workbench with the learner
bringing their own AI tool. The Document Intelligence Workbench
formalizes this — it provides a structured interface for prompting,
reviewing, and validating AI-extracted information, with the hallucination
trap built into the environment itself.

**First module:** Meridian Law Partners (LegalTech Discovery) ← already specified
**Second module:** GulfStream Insurance migration from SQL Workbench

**Infrastructure requirements:**
- Claude API integration in the workbench UI
- Document viewer (renders email chains, notes, reports)
- Prompt editor with guardrail suggestions
- Extraction validation panel (compare AI output to structured data)
- Hallucination detection layer (flags AI claims that contradict database facts)
- Post-mortem submission form (required for Level 4 AI-Aug competency)

---

### Environment 4 — Graph Workbench
**Status:** 💡 Concept — no infrastructure design yet  
**Tool:** In-browser graph engine (Cytoscape.js or D3-force)  
**Best for:** Fraud networks, relationship mapping, supply chain concentration,
AML correspondent banking, org structure analysis  

**What it teaches:**
Network reasoning, centrality analysis, concentration risk in connected systems,
multi-hop relationship tracing, community detection, graph-based anomaly detection.

**Why this environment exists:**
ClearBank's AML module currently uses SQL to detect suspicious wire patterns.
But real AML investigation is network reasoning — who sent money to whom,
through which intermediaries, in what sequence. SQL can approximate this
with self-joins and recursive CTEs, but the native representation is a graph.
The Graph Workbench makes the network visible and interrogable.

**First module:** ClearBank migration (AML network investigation)
**Second module:** New fraud network module (TBD company)

**Infrastructure requirements:**
- Cytoscape.js or D3-force graph renderer in the workbench UI
- Node and edge data loaded from PostgreSQL or DuckDB
- Query interface that builds graph views from SQL results
- Path analysis tools (shortest path, n-hop traversal)
- Community detection visualization
- Same briefing submission and ADAI grader

---

## The unified platform architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATELIER PLATFORM LAYER                       │
│                                                                  │
│  Module Registry → Investigation Router → Workbench Selector    │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────┐ │
│  │ SQL          │ │ Time Series  │ │ Document     │ │ Graph  │ │
│  │ Workbench    │ │ Workbench    │ │ Intelligence │ │ Work-  │ │
│  │ (PGlite)     │ │ (DuckDB)     │ │ Workbench    │ │ bench  │ │
│  │              │ │              │ │ (Claude API) │ │ (Cyto) │ │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └───┬────┘ │
│         │                │                │              │      │
│         └────────────────┴────────────────┴──────────────┘      │
│                                    │                             │
│                    ┌───────────────▼───────────────┐            │
│                    │   SHARED INVESTIGATION LAYER   │            │
│                    │                                │            │
│                    │  Five Investigation Phases     │            │
│                    │  Six Competency Dimensions     │            │
│                    │  ADAI Grading Instrument       │            │
│                    │  CEO Briefing Format           │            │
│                    │  Competency Transcript         │            │
│                    │  Credential System             │            │
│                    └───────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## The company-to-environment mapping (full curriculum)

| Company | Environment | Dimension | Status |
|---|---|---|---|
| NovaPay | SQL | Financial Intelligence | ✅ Live |
| MedCore Health | SQL | Healthcare Systems Intelligence | ✅ Live |
| SupplyLink Operations | SQL | Operational Intelligence | ✅ Live |
| TowerNet Communications | SQL | Strategic Intelligence | ✅ Live |
| ClearBank Financial | SQL → Graph | Decision Intelligence | ✅ Live / 🔬 Migration |
| OncoCare Therapeutics | SQL | Clinical Intelligence | ✅ Live |
| GulfStream Insurance | SQL → Document | AI-Augmented Intelligence | 📋 Specified |
| **Crestview National Bank** | **Time Series** | **Financial Intelligence** | **📋 Specifying now** |
| Meridian Law Partners | Document | AI-Augmented Intelligence | 📋 Specified (concept) |
| RetailEdge | Time Series | Growth Intelligence | 💡 Concept |
| HorizonBank | SQL | Financial Intelligence | 💡 Concept |
| ApexClinical | Time Series | Operational Intelligence | 💡 Concept |
| VerdantFoods | SQL | Strategic Intelligence | 💡 Concept |

---

## The IES positioning this enables

The current six SQL modules position Atelier as:
> "A structured business investigation platform using synthetic PostgreSQL databases."

The multi-modal workbench architecture positions Atelier as:
> "A domain-agnostic decision intelligence measurement system that develops and
> measures business judgment across multiple analytical environments while
> maintaining a consistent competency framework and validated assessment
> instrument across all domains."

For IES Phase IB, the multi-modal architecture is a significantly stronger
technical innovation claim because:

**1. The competency framework is environment-agnostic.**
The ADAI instrument measures the same five dimensions of judgment whether
the learner is writing SQL, querying a time-series database, or prompting
an LLM. This makes it a genuine assessment instrument — not a course that
happens to include assessment.

**2. The behavioral telemetry spans environments.**
Query sequences in SQL, window function choices in time-series, prompt
iterations in document intelligence — all generate behavioral evidence of
how analysts think. This is the kind of process-level data IES reviewers
find most compelling.

**3. The synthetic data architecture scales infinitely.**
Each environment uses your proprietary generator, which already handles
FK integrity, lifecycle rules, temporal ordering, and cardinality. Extending
it to time-series and graph data structures is an engineering sprint, not
a research breakthrough. The methodological innovation is the shared
framework — not any individual environment.

**4. Cross-environment comparison studies are possible.**
Can a learner who scores well on SQL investigations transfer that judgment
to time-series analysis? Does AI-augmented investigation improve performance
on SQL investigations? These are research questions IES reviewers find
compelling — and they require multiple environments to ask them.

---

## The build sequence

**Now (Q3-Q4 2026):**
- GulfStream Insurance pack spec and SQL module (SQL Workbench, AI-Aug dimension)
- Crestview National Bank pack spec (Time Series Workbench, Financial Intelligence)
- Crestview ships as SQL bridge module until Time Series Workbench is ready

**Q1 2027:**
- Time Series Workbench infrastructure (DuckDB WASM, chart panel, regime highlighter)
- Crestview migrates from SQL bridge to native Time Series Workbench
- RetailEdge pack spec begins

**Q2 2027:**
- Document Intelligence Workbench infrastructure
- GulfStream migrates from SQL to Document Intelligence Workbench
- Meridian Law Partners pack spec begins

**Q3 2027:**
- IES Phase IB proposal — multi-modal architecture as the novel component
- Human vs AI scoring validation study across at least two environments
- University pilot cohort (at least one module per environment)

**Q4 2027:**
- Graph Workbench infrastructure
- ClearBank migration to Graph Workbench
- New fraud network module begins

---

## What this means for every new pack spec

Every new company pack spec must now specify:

```
Environment: SQL | Time Series | Document Intelligence | Graph
Bridge strategy: [if native environment not yet built]
Migration path: [when native environment ships]
```

This is added to the Pack Spec Document Template in `PACK-AUTHORING-GUIDE.md`
as a required field before any other section.

---

## What this means for the Time Series Workbench (DuckDB) specifically

Before Crestview can ship in its native environment, three infrastructure
components need to be built:

**Component 1 — DuckDB WASM integration**
DuckDB ships a WASM build that runs in the browser. It loads a `.duckdb`
or `.parquet` file directly, no server required. The integration pattern
is identical to PGlite — load the data file, expose a query interface,
return results as JSON. One Claude Code sprint.

**Component 2 — Time Series Workbench UI**
The SQL editor panel is replaced with:
- A SQL/DuckDB query editor (DuckDB supports standard SQL + time-series extensions)
- A chart panel below the results table (line chart for time-series, bar for aggregates)
- A regime period highlighter (visual bands marking stress periods on the timeline)
- A rolling window control (set the window for rolling statistics)

One Claude Code sprint.

**Component 3 — Pack format extension**
The pack JSON gains an `environment` field and a `data_format` field:

```json
{
  "name": "crestview",
  "environment": "timeseries",
  "data_format": "parquet",
  "temporal_window": {
    "start": "2021-01-01",
    "end": "2025-12-31",
    "granularity": "daily"
  }
}
```

The Atelier module router reads `environment` and loads the correct
workbench component. All other module infrastructure (exercises, rubric,
briefing, grader) is unchanged.

---

## The naming canon for multi-modal modules

All existing naming conventions from `PACK-AUTHORING-GUIDE.md` apply.
Additional conventions for non-SQL environments:

| Element | Convention | Example |
|---|---|---|
| Environment flag | lowercase | `timeseries`, `document`, `graph` |
| Data file | `[slug]-[rows]-baseline.[ext]` | `crestview-1825-baseline.parquet` |
| Workbench component | `[Env]Workbench.tsx` | `TimeSeriesWorkbench.tsx` |
| Pack field | `"environment": "[env]"` | `"environment": "timeseries"` |

---

## One principle above all others

> The investigation framework is the product.
> The workbench is the instrument.
> The credential is the evidence.
>
> No matter which environment a learner uses, they are doing the same thing:
> observing signals, forming hypotheses, investigating evidence, diagnosing
> causes, making decisions, and communicating findings to an executive.
>
> The workbench changes. The judgment being measured does not.

---

*Mpingo Systems LLC · Raleigh, NC*  
*ATELIER-INFRASTRUCTURE-ROADMAP v1.0 · September 2026*  
*Reference document for all platform infrastructure decisions and IES grant narrative*
