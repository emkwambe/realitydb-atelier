# RealityDB Atelier — Claude Code Context

## What this is
Business education platform. Students query synthetic company
databases and write CEO briefing memos.
**The business school that runs on live data.**

## Stack
- Next.js 14 (App Router) on TypeScript 5
- Tailwind CSS v4 (CSS-first `@theme inline`) with shadcn/ui v4 components (`@base-ui/react`)
- PGlite (in-browser PostgreSQL via WASM) for live student queries
- Supabase (auth, progress, certificates)
- Anthropic Claude API (CEO briefing grading) — model `claude-sonnet-4-6`
- Deployment: Cloudflare Pages via `@cloudflare/next-on-pages`, or Vercel

## Design system (TRD §9)
| Token              | HSL                | Hex      | Usage                      |
|--------------------|--------------------|----------|----------------------------|
| --background       | 222 47% 7%         | #0a0f1a  | Page background (navy)     |
| --foreground       | 213 31% 91%        | #e2e8f0  | Primary text               |
| --card             | 222 47% 11%        | #111827  | Card surfaces              |
| --input            | 222 47% 14%        | #1a2235  | Inputs / nested surfaces   |
| --border           | 222 47% 17%        | #1e293b  | All borders                |
| --primary          | 161 84% 43%        | #06d6a0  | Brand green / CTAs         |
| --muted-foreground | 215 16% 47%        | #64748b  | Muted secondary text       |
| --destructive      | 0 84% 60%          | #ef4444  | Errors                     |
| --radius           | 0.375rem           |          | Default radius             |

**Rules — enforce on every component:**
- Dark theme only. No light mode anywhere. `<html className="dark">`.
- Monospace for all SQL and tabular data.
- No rounded corners on data tables (use `.data-grid`).
- Brand green (#06d6a0) only for CTAs, success, active nav.
- No gradients. Generous spacing. Trading-terminal aesthetic.

## Repository layout
```
atelier/
  app/                       Next.js routes (App Router)
    layout.tsx               Global dark layout, header, footer
    page.tsx                 Landing
    pricing/                 Pricing tiers
    auth/                    login, signup, callback (Supabase OAuth)
    companies/novapay/
      page.tsx               NovaPay intro + exercise list
      exercise/[n]/          Workbench (PGlite + editor + schema)
      briefing/              CEO Briefing editor
      results/               Score + certificate
    verify/[certId]/         Public certificate verification
    api/
      grade-briefing/        POST → Claude API grade
      save-certificate/      POST → Supabase insert (requires Bearer token)
  components/
    ui/                      shadcn v4 primitives (base-ui)
    company/CompanyCard.tsx
    exercise/                SchemaExplorer, SqlEditor, ResultsTable,
                             ExercisePanel, ExerciseNav
  content/companies/novapay/
    exercises.ts             10 Exercise objects with reference SQL
    rubric.ts                4-axis rubric + hidden story
    module.md                Source content
  lib/
    pglite.ts                initPGlite, runQuery, QueryResult
    grading.ts               gradeSQL, Exercise interface
    certificate.ts           generateCertId, signCertificate, BizCertificate
    supabase.ts              Browser Supabase singleton
    utils.ts                 cn() class-merge helper
  public/data/               *-5k.sql datasets (NovaPay generated separately)
  docs/PRD.md docs/TRD.md
  CLAUDE.md
```

## Build decisions made during the initial scaffold
1. **Tailwind v4 over v3.** Shadcn v4 components (`@base-ui/react`) require
   Tailwind v4 syntax (`@theme`, `data-active:`, container queries). TRD
   originally specified v3; switching to v4 keeps the v4 components working
   without rewriting them. Theme tokens are expressed in `app/globals.css` via
   `@theme inline` with HSL triples per TRD §9.
2. **Dropped `output: 'export'`.** TRD §10 calls for static export to
   Cloudflare Pages, but TRD §11/§25 also mandate POST route handlers at
   `app/api/grade-briefing` and `app/api/save-certificate`. Next.js 14 cannot
   statically export non-GET handlers, so the project builds with the default
   Next output and ships to Cloudflare Pages via `@cloudflare/next-on-pages`
   (or Vercel). Static export can be re-enabled if the API surface is moved
   to Cloudflare Pages Functions in `/functions`.
3. **Supabase optional at build time.** `lib/supabase.ts` returns `null` when
   env vars are missing so the UI builds and runs without a Supabase project.
   The middleware lets `/companies/*` through when Supabase isn't configured;
   it only enforces auth when both env vars are present.
4. **Claude grader has a heuristic fallback.** `app/api/grade-briefing` returns
   a deterministic keyword-based grade when `ANTHROPIC_API_KEY` is missing, so
   the briefing → results flow is testable end-to-end in local dev. Real
   grading uses `claude-sonnet-4-6` with the rubric pulled from
   `content/companies/novapay/rubric.ts`.
5. **PGlite dataset missing is non-fatal.** `initPGlite` warns and leaves the
   DB empty when `/data/novapay-5k.sql` 404s, so the schema explorer renders
   an empty-state instead of crashing. Generate `novapay-5k.sql` with the
   RealityDB CLI before going live.
6. **Progress is in `localStorage` for v1.** Exercise completion and the in-
   flight briefing draft live under `atelier:novapay:*` keys. v2 will mirror
   these to Supabase `module_progress` and `briefing_submissions`.
7. **Certificate signing is SHA-256 MVP.** `lib/certificate.ts` canonicalises
   the certificate JSON and hashes it with a shared secret. Phase 2 swaps in
   Ed25519 from a Cloudflare Worker.

## Guardrails
- NEVER modify `C:\Users\HP\Documents\realitydb-sandbox`
- NEVER modify `C:\Users\HP\Documents\databox`
- Work only in `C:\Users\HP\Documents\atelier`
- `npm run build` must pass before any commit

## Environment variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEXT_PUBLIC_SITE_URL=https://atelier.realitydb.dev
```

## What's not yet wired (next session)
- Supabase project: create at supabase.com, run schema from TRD §4, paste env vars
- `public/data/novapay-5k.sql`: generate with
  `realitydb run --pack novapay.json --rows 5000 --format sql`
- Stripe checkout for the pricing tiers
- Google OAuth (Supabase provider config)
- Cohort dashboard for the Team tier
- Five remaining company modules (MedCore, SupplyLink, TowerNet, ClearBank, OncoCare)
