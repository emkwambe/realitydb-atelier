// GET /api/dataset/[company]/[variant]
// Authenticated dataset download for the PREMIUM dataset variants:
//   scenario-a, scenario-b  → <company>-<token>-<variant>.sql
//   comparison              → <company>-comparison-ab.json
// Baseline is NOT served here — it is public and loaded directly from /data so
// anonymous Hot Cases and free beginner exercises keep working (Decision A).
//
// All variants served here require an advanced-tier entitlement (gateDataset →
// gateApi advanced). With ENABLE_PAYWALL=false this returns allowed.
//
// Files live OUTSIDE public/ (in /datasets) so they have no direct static URL.
// next.config.mjs outputFileTracingIncludes ships them into this function. The
// response is STREAMED — the 50k SQL files (~9MB) exceed the buffered function
// response limit, so we must stream rather than return a buffer.

import { NextResponse } from "next/server";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { gateDataset } from "@/lib/auth/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Per-company row-count token — mirrors lib/pglite.ts. Server-side here so the
// client never needs it for premium variants.
const COMPANY_ROW_TOKEN: Record<string, string> = {
  novapay: "5k",
  medcore: "50k",
  supplylink: "50k",
  towernet: "50k",
  clearbank: "50k",
  oncocare: "30k",
};

const DATASETS_DIR = path.join(process.cwd(), "datasets");

interface RouteContext {
  params: Promise<{ company: string; variant: string }>;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { company, variant } = await params;

  const token = COMPANY_ROW_TOKEN[company];
  if (!token) {
    return NextResponse.json({ error: "Unknown company" }, { status: 404 });
  }

  let filename: string;
  let contentType: string;
  if (variant === "scenario-a" || variant === "scenario-b") {
    filename = `${company}-${token}-${variant}.sql`;
    contentType = "text/plain; charset=utf-8";
  } else if (variant === "comparison") {
    filename = `${company}-comparison-ab.json`;
    contentType = "application/json; charset=utf-8";
  } else {
    return NextResponse.json({ error: "Unknown variant" }, { status: 404 });
  }

  // Entitlement gate. datasetTier(scenario-*/comparison) === "advanced".
  const gate = await gateDataset(company, variant);
  if (!gate.allowed) {
    return NextResponse.json(
      {
        error:
          gate.status === 401 ? "Sign in required." : "Subscription required.",
      },
      { status: gate.status }
    );
  }

  // Resolve + contain the path (company/variant are already constrained above).
  const filePath = path.join(DATASETS_DIR, filename);
  if (!filePath.startsWith(DATASETS_DIR) || !existsSync(filePath)) {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  }

  const size = statSync(filePath).size;
  const webStream = Readable.toWeb(
    createReadStream(filePath)
  ) as unknown as ReadableStream;

  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(size),
      // Private, per-user entitlement — never cache at a shared layer.
      "Cache-Control": "private, no-store",
    },
  });
}
