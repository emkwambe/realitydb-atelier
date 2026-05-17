# RealityDB Platform — Claude Code Skill
## Purpose
This skill gives Claude Code full context about the RealityDB platform,
Atelier, conventions, and active work so new sessions start immediately.

## Read these files first in every session

### Core platform context (always)
C:\Users\HP\Documents\databox\REALITYDB-SYSTEM-KNOWLEDGE.md
C:\Users\HP\Documents\atelier\docs\PRD-TRD-v2.md
C:\Users\HP\Documents\atelier\docs\HANDOVER-2026-05-15.md
C:\Users\HP\Documents\atelier\CLAUDE.md

### Pack authoring & data generation work (read whenever creating/editing packs or running generation pipeline)
C:\Users\HP\Documents\realitydb-internal\01-cli-engine\PACK-AUTHORING-CHECKLIST.md
C:\Users\HP\Documents\realitydb-internal\PACK-CREATION-GUIDE.md
C:\Users\HP\Documents\realitydb-internal\COMMAND-INVENTORY.md
C:\Users\HP\Documents\realitydb-internal\00-platform\PROBLEMS-LIST-2026-05-03.md

### Working pack references (ground truth — read these BEFORE writing any new pack)
C:\Users\HP\Documents\realitydb-internal\demo_library.json
C:\Users\HP\Documents\research\grid-silent-cascade\packs\grid_silent_cascade.json

## Platform Overview
Mpingo Systems LLC builds RealityDB — a synthetic data generation engine
and suite of developer/EdTech products. Owner: Eddy Mkwambe, Charlotte NC.

### Product Family
| Product | Repo | URL | Status |
|---|---|---|---|
| CLI v2.40.0 | github.com/emkwambe/databox | npm: @realitydb/cli | Live |
| Sandbox (Learn/HireSQL/SimLab/Certify/Store) | github.com/emkwambe/realitydb-sandbox | sandbox.realitydb.dev | Live |
| Atelier | github.com/emkwambe/realitydb-atelier | atelier.realitydb.dev | Building |
| Studio | github.com/emkwambe/realityDB-sutudio | studio.realitydb.dev | Live |

## Key File Locations
### RealityDB Engine (databox)
  Root:        C:\Users\HP\Documents\databox\
  Engine:      packages\engine\src\engine.ts
  CLI index:   apps\cli\src\index.ts
  Packs:       apps\cli\src\packs\ (6 built-in packs)
  System doc:  REALITYDB-SYSTEM-KNOWLEDGE.md

### RealityDB Sandbox
  Root:        C:\Users\HP\Documents\realitydb-sandbox\
  App:         src\App.tsx
  SimLab:      src\components\SimLabV3.jsx
  HireSQL:     src\components\ (CandidateExam, AssessmentDashboard)
  Learn:       src\content\lessons\ (30 chapters)
  Certify:     src\components\CertifyPage.tsx
  CLAUDE.md:   CLAUDE.md
  Audit tools: .audit-tmp\ (flatten.mjs, audit-runner.mjs, temporal-scan.mjs, verify-load.mjs)

### RealityDB Atelier
  Root:        C:\Users\HP\Documents\atelier\
  PRD+TRD v2:  docs\PRD-TRD-v2.md
  Handover:    docs\HANDOVER-2026-05-15.md
  NovaPay mod: src\content\companies\novapay\module.md
  Exercises:   content\companies\novapay\exercises.ts
  Rubric:      content\companies\novapay\rubric.ts
  PGlite:      lib\pglite.ts
  Grading:     lib\grading.ts
  Certificate: lib\certificate.ts
  Enforcer:    scripts\enforce-novapay-story.ps1
  Dataset:     public\data\novapay-5k.sql
  Pack:        C:\Users\HP\Documents\realityDB Packs\packs\novapay.json
  CLAUDE.md:   CLAUDE.md

### Internal Docs
  Root:        C:\Users\HP\Documents\realitydb-internal\
  Organized by topic folders:
    00-platform     (platform-wide handovers, problems list, sprint plans)
    01-cli-engine   (CLI, engine, pack authoring, data generation guides)
    02-studio       (Studio docs)
    03-sandbox      (Sandbox specs, audits, challenges)
    04-simlab       (SimLab sprints)
    05-safesql      (SafeSQL product docs)
    06-data-store   (Data Store roadmap, pricing)
    07-assess       (Assess/Certify PRD-TRD, sprints)
    08-hiresql      (HireSQL brief)
    09-marketing    (GTM, EU strategy, sprint prompts)
    10-sprints-archive (historical sprint blueprints)
    11-research     (NIST, EU AI Act, oncology, financial)
  Sprint prompts: 09-marketing\PRODUCT-SPRINT-PROMPTS.md
  Engine backups: engine-backups\ (timestamped pre-edit snapshots — never delete)

## Critical Build Rules

### NEVER do this in databox
  pnpm add/remove in apps\cli\  -- breaks @realitydb/engine junction
  Restore junction if broken:
    New-Item -ItemType Junction `
      -Path C:\Users\HP\Documents\databox\node_modules\@realitydb\engine `
      -Target C:\Users\HP\Documents\databox\packages\engine -Force

### Always use absolute paths in PowerShell
### Always use [System.IO.File]::WriteAllText() for UTF-8 files
### Build order if engine changes: schema -> generators -> templates -> core -> cli

## Pack Format (Critical)
Correct enum format:
  "column_name": {
    "strategy": "enum",
    "options": {
      "values": ["val1", "val2"],
      "weights": [70, 30]
    }
  }

FK format:
  "column_name": {
    "strategy": "uuid",
    "foreignKey": { "table": "other_table", "column": "id" }
  }

Nullable:
  "column_name": {
    "strategy": "timestamp",
    "options": { "nullable": true, "nullWeight": 0.75 }
  }

Tables are objects keyed by name (NOT arrays):
  "tables": {
    "customers": {
      "match": "customers",
      "columns": { ... }
    }
  }

## Key Commands

### CLI
  realitydb --version
  realitydb pack:validate -p [pack.json]
  realitydb run -p [pack.json] --rows 5000 --format sql -o [output.sql]
  realitydb examine assess [file.sql] --pack [pack.json]

### Sandbox deployment
  cd C:\Users\HP\Documents\realitydb-sandbox
  npm run build
  npx wrangler pages deploy dist --project-name realitydb-sandbox --branch main --commit-dirty=true

### Atelier dev
  cd C:\Users\HP\Documents\atelier
  npm run dev                    (runs on localhost:3001)
  npm run build
  npx wrangler pages deploy out --project-name realitydb-atelier --branch main

### Atelier dataset pipeline
  # Step 1: Generate
  node "C:\Users\HP\Documents\databox\apps\cli\dist\index.js" run `
    -p "C:\Users\HP\Documents\realityDB Packs\packs\novapay.json" `
    --rows 5000 --format sql `
    -o "C:\Users\HP\Documents\atelier\public\data\novapay-5k.sql"

  # Step 2: Enforce story
  C:\Users\HP\Documents\atelier\scripts\enforce-novapay-story.ps1

  # Step 3: Assess quality
  node "C:\Users\HP\Documents\databox\apps\cli\dist\index.js" examine assess `
    "C:\Users\HP\Documents\atelier\public\data\novapay-5k.sql" `
    --pack "C:\Users\HP\Documents\realityDB Packs\packs\novapay.json"

### SimLab API
  Base URL: https://realitydb-lab-api.eddy-078.workers.dev
  API Key:  rdb_lab_mpingo_2026
  List labs:   GET /v1/labs
  Create lab:  POST /v1/labs { template, rows }
  Delete lab:  DELETE /v1/labs/:id
  Gallery:     GET /v1/gallery

### Supabase Projects
  HireSQL/Learn/Certify: roruzpilgspfzhvclwhb (realitydb-sandbox project)
  Atelier:               separate project (see .env.local)

## Tech Stack Per Product

### Sandbox (realitydb-sandbox)
  Next.js (Vite), TypeScript, Tailwind
  Supabase (auth + data)
  PGlite (in-browser PostgreSQL)
  Cloudflare Pages + Workers
  Neon (SimLab disposable databases)

### Atelier
  Next.js 14 App Router, TypeScript, Tailwind v4
  shadcn/ui dark theme
  PGlite (in-browser PostgreSQL)
  Supabase (auth, progress, certificates)
  Anthropic claude-sonnet-4-6 (CEO briefing grading)
  Cloudflare Pages

### CLI (databox)
  Node.js, TypeScript, tsup
  Published: @realitydb/cli on npm
  Current version: 2.40.0

## Atelier Active Work (May 2026)

### Immediate Problem
PGlite not loading novapay-5k.sql despite file being accessible.
File downloads at http://localhost:3001/data/novapay-5k.sql
No error in console -- loads silently empty.
Next debug step: add console.log to pglite.ts exec() to see if SQL runs.

### NovaPay Hidden Story (must be enforced)
  Enterprise churn: 1.1% -> 3.2% over 18 months (rising arc)
  SMB churn: ~1.4% (flat)
  Enterprise = 5% of customers, 58% of MRR
  Smoking gun: 64% of churned enterprise filed currency_support tickets
  Active enterprise: only 4% have currency tickets
  Root cause: missing multi-currency support

### Story Enforcement Script
  C:\Users\HP\Documents\atelier\scripts\enforce-novapay-story.ps1
  Appends UPDATE statements to SQL file -- may be causing PGlite issues
  May need to refactor to patch INSERT data directly instead

### Scenario Files Needed
  public\data\novapay-5k-baseline.sql   (enforced baseline)
  public\data\novapay-5k-scenario-a.sql (multi-currency fix)
  public\data\novapay-5k-scenario-b.sql (SMB pivot)

### v1.5 Sprint Plan
  See: C:\Users\HP\Documents\atelier\docs\PRD-TRD-v2.md section 12
  Priority: fix PGlite loading -> enforce story -> generate scenarios
  -> dataset switcher UI -> 5-axis rubric -> citations -> deploy

## Design System (Atelier)
  Brand:      #06d6a0  (green CTAs)
  Background: #0a0f1a  (navy)
  Surface:    #111827
  Surface-2:  #1a2235
  Border:     #1e293b
  Muted:      #64748b
  Text:       #e2e8f0
  Danger:     #ef4444
  Dark theme ONLY. No light mode. No gradients.
  Monospace font for all SQL and data.
  shadcn/ui components with custom CSS variables.

## Guardrails (enforce in every session)
  NEVER modify C:\Users\HP\Documents\realitydb-sandbox (unless explicitly told)
  NEVER modify C:\Users\HP\Documents\databox\apps\cli (unless CLI sprint)
  NEVER run pnpm add/remove in apps\cli\
  npm run build must pass before any commit
  Baseline dataset never modified -- scenarios are always new files
  Pack JSON is source of truth for all data generation

## Quality Assurance & Discipline

This section captures lessons earned the hard way during May 1-10, 2026 sessions.
These rules prevent recurrence of specific failures that cost hours of recovery work.

### Core discipline rule (apply to ALL documentation and code work)

**Verify against working files, NOT memory.** When documenting any system convention
(pack format, engine API, schema), the 4-step rule is:
  1. Identify a working reference (a file/system that demonstrably works)
  2. Read the reference directly — do not paraphrase from memory
  3. Document only what is observed in the working reference
  4. Note open questions explicitly when the reference doesn't cover a case

Source: PACK-AUTHORING-CHECKLIST v1 was written from memory and had wrong field
names (`type` instead of `strategy`, array vs object columns). Caught when
pack:validate produced 18 warnings on a v1-spec demo pack. Recovery: ~1 hour of
ground-truth reading and rewriting. v2 is the canonical reference now.

### Pack format — silent failure modes

The engine accepts these errors silently and produces garbage output:

| Wrong (silent failure)              | Correct                                              |
|-------------------------------------|------------------------------------------------------|
| `"type": "uuid"`                    | `"strategy": "uuid"` (columns generate as text "0","1","2" otherwise) |
| `"columns": [{"name":"id",...}]`    | `"columns": {"id": {...}}` (object keyed by name)    |
| `"primaryKey": "id"` (table-level)  | `"match": "tablename"` + first column = `id` w/ uuid |
| `"foreignKeys": [...]` (table-level)| Inline `"foreignKey": {"table","column"}` on the column |
| `"count_factor": N`                 | Use `relationships[].cardinality.mean` instead (engine ignores count_factor silently) |

**Always run pack:validate BEFORE generation.** It surfaces format errors that
would otherwise produce silent garbage. 0 errors required; 0 warnings ideal.

### Multi-FK column ORDER matters (M5 semantics)

When a child table has multiple FKs, the FIRST FK column in JSON column order is
treated as the primary parent for cardinality. List the semantically-owning
parent FIRST.

Example: ferroresonance_events with `switching_event_id` listed BEFORE `line_id`
gets sized against switching_events (correct), not against lines.

### Watermark preservation (privacy scoring)

The engine embeds `_realitydb_meta` table in generated SQL. This drives
PII detection scoring: presence = 100 ("synthetic provenance verified"),
absence = 70.

**Known issue**: `flatten.mjs` (in `realitydb-sandbox/.audit-tmp/`) STRIPS the
watermark when dumping post-update INSERT state. Caps assess privacy score at ~70
on flattened SQL, drops overall score from 95+ down to ~91-92.

Workarounds:
  - Skip flattening if pack doesn't need post-INSERT UPDATEs
  - Fix flatten.mjs to preserve `_realitydb_meta` (engineering pending)
  - Accept the score ceiling and document the cause

### Critical engine fixes (verify CLI is current)

| Commit  | Fix                                                          |
|---------|--------------------------------------------------------------|
| afe1750 | parseSql FK detection — without this, FK integrity reports 0/0 and cardinality scoring is a no-op for engine-default CONSTRAINT-prefixed FK syntax |
| ceed075 | H3: pack-aware cardinality scoring (`--pack` flag) — required for declared-cardinality validation; tolerance ±20% |

If your CLI predates these, results may be misleading. Pull latest:
  Set-Location C:\Users\HP\Documents\databox
  git pull origin main
  pnpm --filter cli build

### Known limitations (design around these)

| ID | Limitation                                                  | Workaround                                    |
|----|-------------------------------------------------------------|-----------------------------------------------|
| H6 | BUILT_IN_PACKS defined in two places (index.ts AND run.ts) | Update both when adding marketplace packs    |
| H7 | examine assess fails on outputs >512 MB (V8 string limit) | Assess at 1M rows; trust math at higher scales |
| M5 | Multi-FK children sized by first FK only                  | Order FK columns intentionally (see above)    |
| M8 | Fintech smoke test occasionally flakes at quality 95      | Re-run; not a real regression                 |
| M1 | PowerShell `return` at script top level is unreliable     | Use `exit 1` instead, or wrap in functions    |

### Backup-before-edit pattern (engine code)

Before editing any file under `databox/packages/engine/` or `databox/apps/cli/src/`:

  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $bakDir = "C:\Users\HP\Documents\realitydb-internal\engine-backups"
  $source = "<file-being-edited>"
  $backup = Join-Path $bakDir ("$([System.IO.Path]::GetFileName($source)).before-<purpose>-$timestamp")
  Copy-Item -LiteralPath $source -Destination $backup -Force

After edit: rebuild → smoke test (158/158) → verify behavior → commit.
Backups stay forever. Small cost, large insurance. Source: May 1 near-miss with
engine.ts heredoc corruption recovered from backup.

### Atomic commit principle

One logical change per commit. When fixing two issues, commit separately even if
discovered in the same session. Source: parseSql fix (afe1750) and H3 feature
(ceed075) were two atomic commits in one session — clean history, each
independently revertable.

### Smoke test before publishing pack-related changes

  Set-Location C:\Users\HP\Documents\databox\apps\cli
  node smoke-test.cjs

Required: 158/158 (or current count). Known M8 flake on fintech at quality 95.

### Pre-publish checklist for any new pack

  [ ] pack:validate returns 0 errors
  [ ] Generates without error at 10K rows
  [ ] Generates without error at 100K rows
  [ ] Smoke test passes 158/158
  [ ] examine assess overall score >= 95 (domain-honest target)
  [ ] examine assess --pack cardinality score >= 95 (if cardinality declared)
  [ ] Scale confidence is HIGH (CV +/- 5% or better)
  [ ] All enum weight arrays match value array lengths
  [ ] No count_factor field present
  [ ] Multi-FK columns: primary parent FK column listed FIRST
  [ ] Float min/max bounds set on Normal/Weibull/Lognormal distributions
  [ ] _meta.citations block present (research-backed OR honest "illustrative")
  [ ] _realitydb_meta watermark present in final SQL output

### Budget-aware cardinality math (sizing packs to row budgets)

For row budget B and cardinality means r1, r2, ...:
  per_root_rows = 1 + r1 + (r1 * r2) + ...
  expected_roots = B / per_root_rows

Example: B=100,000; books mean=18 per library; loans mean=0.3 per book
  per_library = 1 + 18 + (18 * 0.3) = 24.4
  libraries = 100000 / 24.4 ~= 4,098

Plan cardinality declarations against expected production scale BEFORE generating.

### Honest scope limits (97% target may not be achievable everywhere)

Some packs may not reach 97% overall regardless of effort:
  - Phone-number-identified domains (M-Pesa, telecom) — PII detection inherent ceiling
  - Low-cardinality status enums (medical with 4 values) — distribution diversity ceiling
  - Deterministic post-INSERT UPDATE patterns — flatten strips watermark
  - Rare-event packs — Poisson variance limits scale confidence

For these, document the inherent ceiling in `_meta.exceptions`:

  "_meta": {
    "exceptions": [
      {
        "rule": "examine assess overall >= 95",
        "actual": "91",
        "reason": "M-Pesa domain has phone-number PII inherent to use case",
        "approved_by": "Eddy Mkwambe",
        "date": "2026-05-09"
      }
    ]
  }

### Discipline lesson capture (when new failure modes are discovered)

When a new failure mode is discovered during work:
  1. Document it in PROBLEMS-LIST-2026-05-03.md (or current dated equivalent)
  2. Capture the recovery path (what worked, how long it took)
  3. Append the lesson here if it has cross-cutting application
  4. Update COMMAND-INVENTORY.md "Fixes" section if it has a command-level workaround

Source: This entire section is the result of doing exactly this for the May 1-10
sessions' lessons. The pattern is self-applying.

End of Quality Assurance & Discipline section.
