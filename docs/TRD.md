# RealityDB Atelier — Technical Requirements Document
**Version:** 1.0
**Date:** May 14, 2026
**Author:** Eddy Mkwambe, Mpingo Systems LLC
**Status:** Approved for development

---

## 1. System Overview

RealityDB Atelier is a Next.js 14 web application deployed on Cloudflare Pages.
Students run SQL against PGlite (in-browser PostgreSQL), submit CEO briefing
memos graded by Claude API, and earn Business Acumen Certificates stored in Supabase.

---

## 2. Technology Stack

| Layer | Technology | Version | Reason |
|---|---|---|---|
| Framework | Next.js | 14.x | App Router, static export for Cloudflare |
| Language | TypeScript | 5.x | Type safety across all layers |
| Styling | Tailwind CSS | 3.x | Utility-first, works with shadcn |
| Components | shadcn/ui | latest | Dark-theme professional components |
| In-browser DB | PGlite | latest | PostgreSQL in WebAssembly |
| Auth | Supabase Auth | 2.x | Email + Google OAuth |
| Database | Supabase PostgreSQL | latest | Progress, certificates, cohorts |
| AI Grading | Anthropic Claude API | claude-sonnet-4-6 | CEO briefing grading |
| Deployment | Cloudflare Pages | — | Static export, edge delivery |
| Package mgr | npm | — | Not pnpm — Cloudflare Pages compat |

---

## 3. Repository Structure

    atelier/
      app/
        layout.tsx                    Global layout, nav, footer
        page.tsx                      Landing page
        pricing/page.tsx              Pricing tiers
        companies/
          page.tsx                    Company selector
          novapay/
            page.tsx                  NovaPay intro + exercise list
            exercise/[n]/page.tsx      Exercise environment 1-10
            briefing/page.tsx          CEO Briefing submission
            results/page.tsx           Score + certificate
        verify/[certId]/page.tsx       Public certificate verification
        api/
          grade-briefing/route.ts      Claude API grading endpoint
          save-certificate/route.ts    Supabase certificate save
          check-cooldown/route.ts      24h retake cooldown check
      components/
        ui/                            shadcn/ui components
        layout/Header.tsx
        layout/Footer.tsx
        layout/Nav.tsx
        exercise/ExercisePanel.tsx
        exercise/SqlEditor.tsx
        exercise/ResultsTable.tsx
        exercise/SchemaExplorer.tsx
        exercise/QueryHistory.tsx
        exercise/ExerciseNav.tsx
        briefing/BriefingEditor.tsx
        briefing/ScqaGuide.tsx
        briefing/WordCounter.tsx
        certificate/CertificateCard.tsx
        company/CompanyCard.tsx
        company/CompanyHero.tsx
      lib/
        pglite.ts
        supabase.ts
        supabase-server.ts
        grading.ts
        certificate.ts
      content/
        companies/novapay/
          module.md
          exercises.ts
          rubric.ts
      public/
        data/novapay-5k.sql
      docs/PRD.md
      docs/TRD.md
      CLAUDE.md

---

## 4. Database Schema (Supabase)

### 4.1 profiles

    CREATE TABLE profiles (
      id          UUID PRIMARY KEY REFERENCES auth.users(id),
      full_name   TEXT,
      email       TEXT,
      tier        TEXT DEFAULT 'free'
                  CHECK (tier IN ('free','module','all_access','team','mba')),
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );

### 4.2 module_progress

    CREATE TABLE module_progress (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id         UUID REFERENCES auth.users(id),
      company         TEXT NOT NULL,
      exercise_number INTEGER NOT NULL,
      status          TEXT DEFAULT 'not_started'
                      CHECK (status IN ('not_started','in_progress','completed')),
      sql_submitted   TEXT,
      sql_score       INTEGER,
      attempts        INTEGER DEFAULT 0,
      completed_at    TIMESTAMPTZ,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, company, exercise_number)
    );

### 4.3 briefing_submissions

    CREATE TABLE briefing_submissions (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id           UUID REFERENCES auth.users(id),
      company           TEXT NOT NULL,
      briefing_text     TEXT NOT NULL,
      word_count        INTEGER,
      exercises_cited   INTEGER[],
      overall_score     INTEGER,
      passed            BOOLEAN,
      grading_breakdown JSONB,
      grading_feedback  TEXT,
      attempt_number    INTEGER DEFAULT 1,
      submitted_at      TIMESTAMPTZ DEFAULT NOW(),
      graded_at         TIMESTAMPTZ
    );

### 4.4 biz_certifications

    CREATE TABLE biz_certifications (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cert_id         TEXT UNIQUE NOT NULL,
      user_id         UUID REFERENCES auth.users(id),
      user_name       TEXT NOT NULL,
      user_email      TEXT NOT NULL,
      company         TEXT NOT NULL,
      company_label   TEXT NOT NULL,
      score           INTEGER NOT NULL,
      passed          BOOLEAN NOT NULL,
      submission_id   UUID REFERENCES briefing_submissions(id),
      signature       TEXT NOT NULL,
      public_key_id   TEXT DEFAULT 'realitydb-atelier-2026',
      issued_at       TIMESTAMPTZ DEFAULT NOW()
    );

### 4.5 RLS Policies

    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY users_own_profile ON profiles FOR ALL USING (auth.uid() = id);

    ALTER TABLE module_progress ENABLE ROW LEVEL SECURITY;
    CREATE POLICY users_own_progress ON module_progress FOR ALL USING (auth.uid() = user_id);

    ALTER TABLE briefing_submissions ENABLE ROW LEVEL SECURITY;
    CREATE POLICY users_own_submissions ON briefing_submissions FOR ALL USING (auth.uid() = user_id);

    ALTER TABLE biz_certifications ENABLE ROW LEVEL SECURITY;
    CREATE POLICY public_read_certs ON biz_certifications FOR SELECT USING (true);
    CREATE POLICY users_insert_certs ON biz_certifications FOR INSERT WITH CHECK (auth.uid() = user_id);

---

## 5. PGlite Integration

PGlite runs entirely in the browser via WebAssembly.
No server-side SQL execution in v1.

    // lib/pglite.ts
    import { PGlite } from '@electric-sql/pglite';

    let db: PGlite | null = null;
    let initialized = false;

    export async function initPGlite(company: string): Promise<void> {
      if (initialized) return;
      db = new PGlite();
      const sql = await fetch('/data/' + company + '-5k.sql').then(r => r.text());
      await db.exec(sql);
      initialized = true;
    }

    export async function runQuery(sql: string): Promise<QueryResult> {
      if (!db) throw new Error('Database not initialized');
      try {
        const start = performance.now();
        const result = await db.query(sql);
        const duration = performance.now() - start;
        return {
          rows: result.rows,
          fields: result.fields,
          rowCount: result.rows.length,
          duration: Math.round(duration),
          error: null,
        };
      } catch (err: any) {
        return { rows: [], fields: [], rowCount: 0, duration: 0, error: err.message };
      }
    }

Loading states:
  - Show overlay while PGlite WASM downloads (~8MB)
  - Show progress while SQL dataset loads
  - Cache in IndexedDB after first load (v2)

Dataset: public/data/novapay-5k.sql
Generated by: realitydb run --pack novapay.json --rows 5000 --format sql

---

## 6. SQL Grading Logic

    // lib/grading.ts
    // Score on three dimensions:
    // 1. No error thrown       (30 points)
    // 2. Returns rows          (30 points)
    // 3. Required cols present (40 points)

    export async function gradeSQL(studentSQL, referenceSQL, exercise) {
      const result = await runQuery(studentSQL);
      if (result.error) return { score: 0, passed: false, feedback: result.error };
      const cols = result.fields.map(f => f.name.toLowerCase());
      const required = exercise.requiredColumns || [];
      const colMatch = required.length === 0 ? 1 :
        required.filter(c => cols.includes(c)).length / required.length;
      const score = Math.round(30 + (result.rowCount > 0 ? 30 : 0) + colMatch * 40);
      return { score, passed: score >= 70 };
    }

---

## 7. CEO Briefing Grading (Claude API)

    // app/api/grade-briefing/route.ts
    // POST { briefingText, companyId, userId }
    // Sends briefing + rubric to claude-sonnet-4-6
    // Returns structured JSON — no free-form prose

    Response format:
    {
      overall_score: 0-100,
      passed: true/false,
      axes: {
        segmentation:     { score: 0-25, feedback: string },
        causal_reasoning: { score: 0-25, feedback: string },
        quantification:   { score: 0-25, feedback: string },
        recommendation:   { score: 0-25, feedback: string }
      },
      summary_feedback: string,
      enterprise_churn_found: boolean,
      currency_cause_found: boolean,
      arr_quantified: boolean
    }

    Rubric axes (25 points each):
      segmentation      segments churn by tier not just blended rate
      causal_reasoning  links currency tickets to churn with percentage
      quantification    quantifies ARR at risk over 12 months
      recommendation    multi-currency with cost and payback estimate

---

## 8. Certificate Generation

    ID format: RDB-BIZ-[unix-ts-base36]-[random-8-hex]
    Example:   RDB-BIZ-LP3K2-4F9A1B2C

    Distinct from SQL certs which use RDB-CERT prefix.

    Signing MVP:     SHA-256 of canonical JSON + shared secret
    Signing Phase 2: Ed25519 via Cloudflare Worker

    Verification: atelier.realitydb.dev/verify/[certId]
    PDF: window.print() with @media print styles
    LinkedIn: pre-built share URL

---

## 9. shadcn/ui Setup

    npx shadcn@latest init
    # Dark theme, CSS variables, default style, Slate base color

    npx shadcn@latest add button card tabs dialog badge progress
    npx shadcn@latest add textarea input separator tooltip
    npx shadcn@latest add collapsible scroll-area table

    CSS variable overrides in globals.css:
    --background:        222 47% 7%     #0a0f1a  navy
    --foreground:        213 31% 91%    #e2e8f0  text
    --card:              222 47% 11%    #111827  surface
    --border:            222 47% 17%    #1e293b  border
    --input:             222 47% 14%    #1a2235  surface-2
    --primary:           161 84% 43%    #06d6a0  brand green
    --muted-foreground:  215 16% 47%    #64748b  muted
    --destructive:       0 84% 60%      #ef4444  danger
    --radius:            0.375rem

---

## 10. Deployment

    // next.config.ts
    output: 'export'           static export for Cloudflare Pages
    trailingSlash: true
    images: { unoptimized: true }

    Build:  npm run build
    Deploy: npx wrangler pages deploy out --project-name realitydb-atelier --branch main

    Environment variables:
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY
    ANTHROPIC_API_KEY
    NEXT_PUBLIC_SITE_URL=https://atelier.realitydb.dev

    Cloudflare Pages project settings:
    Project name:    realitydb-atelier
    Production branch: main
    Build command:   npm run build
    Build output:    out
    Custom domain:   atelier.realitydb.dev

---

## 11. Build Order for Claude Code

Execute in this exact order to avoid dependency issues:

     1. create-next-app (base scaffold)
     2. shadcn/ui init + component installation
     3. Tailwind + CSS variable configuration
     4. Global layout (Header, Footer, Nav)
     5. Landing page
     6. Auth pages (login, signup)
     7. lib/pglite.ts
     8. lib/grading.ts
     9. lib/certificate.ts
    10. content/companies/novapay/exercises.ts
    11. content/companies/novapay/rubric.ts
    12. SchemaExplorer component
    13. SqlEditor component
    14. ResultsTable component
    15. ExercisePanel component
    16. NovaPay company page
    17. Exercise page [n]
    18. CEO Briefing page
    19. Results page
    20. Verification page
    21. API routes (grade-briefing, save-certificate)
    22. Middleware (auth protection)
    23. CLAUDE.md
    24. npm run build + fix errors
    25. git init + first commit

---

## 12. Performance Targets

| Metric | Target |
|---|---|
| PGlite init time | < 15 seconds |
| Query execution | < 500ms on 5K rows |
| Page load LCP | < 2 seconds |
| CEO briefing grading | < 10 seconds |
| Bundle size | < 3MB (PGlite WASM loaded async) |

---

## 13. CLAUDE.md Content

    # RealityDB Atelier — Claude Code Context

    What this is:
    Business education platform. Students query synthetic company
    databases and write CEO briefing memos.
    The business school that runs on live data.

    Stack:
    Next.js 14 (App Router, static export)
    TypeScript 5, Tailwind CSS 3, shadcn/ui (dark theme)
    PGlite (in-browser PostgreSQL via WASM)
    Supabase (auth, progress, certificates)
    Anthropic Claude API (CEO briefing grading)
    Cloudflare Pages (deployment)

    Design system:
    Brand:      #06d6a0  Background: #0a0f1a
    Surface:    #111827  Surface-2:  #1a2235
    Border:     #1e293b  Muted:      #64748b
    Text:       #e2e8f0  Danger:     #ef4444
    Dark theme only. No light mode. No gradients.
    Monospace font for all SQL and data.

    Guardrails:
    NEVER modify C:\Users\HP\Documents\realitydb-sandbox
    NEVER modify C:\Users\HP\Documents\databox
    Work only in C:\Users\HP\Documents\atelier
    npm run build must pass before any commit

---

*RealityDB Atelier TRD v1.0*
*Mpingo Systems LLC — Charlotte, NC*
*The business school that runs on live data.*
