"use client";

import { PGlite } from "@electric-sql/pglite";

export type DatasetVariant = "baseline" | "scenario-a" | "scenario-b";

export interface QueryField {
  name: string;
  dataTypeID?: number;
}

export interface QueryResult {
  rows: Record<string, unknown>[];
  fields: QueryField[];
  rowCount: number;
  duration: number;
  error: string | null;
}

interface InitState {
  db: PGlite | null;
  initialized: boolean;
  initPromise: Promise<void> | null;
  variant: DatasetVariant | null;
  initError: string | null;
}

const state: InitState = {
  db: null,
  initialized: false,
  initPromise: null,
  variant: null,
  initError: null,
};

export function getDB(): PGlite | null {
  return state.db;
}

export function getInitError(): string | null {
  return state.initError;
}

export function getCurrentDataset(): DatasetVariant | null {
  return state.variant;
}

function datasetUrl(company: string, variant: DatasetVariant): string {
  return `/data/${company}-5k-${variant}.sql`;
}

export async function initPGlite(
  company: string,
  variant: DatasetVariant = "baseline"
): Promise<void> {
  if (state.initialized && state.variant === variant) return;
  if (state.initPromise && state.variant === variant) return state.initPromise;

  state.variant = variant;
  state.initError = null;

  state.initPromise = (async () => {
    const db = new PGlite();
    state.db = db;
    const url = datasetUrl(company, variant);
    // eslint-disable-next-line no-console
    console.log(`[pglite] Fetching ${url}`);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const msg = `Dataset ${url} not found (HTTP ${res.status}).`;
        state.initError = msg;
        // eslint-disable-next-line no-console
        console.warn(`[pglite] ${msg}`);
        state.initialized = true;
        return;
      }
      const sql = await res.text();
      // eslint-disable-next-line no-console
      console.log(`[pglite] Loaded ${sql.length} chars`);
      if (sql.trim().length === 0) {
        state.initError = "Dataset file is empty.";
        state.initialized = true;
        return;
      }
      // Chunked load: schema first, then data — isolates a CREATE-time error
      // from a row-level error so the UI can report which half failed.
      const dataMarker = "-- DATA";
      const splitIdx = sql.indexOf(dataMarker);
      if (splitIdx > 0) {
        const schemaSQL = sql.slice(0, splitIdx);
        const dataSQL = sql.slice(splitIdx);
        await db.exec(schemaSQL);
        // eslint-disable-next-line no-console
        console.log("[pglite] Schema loaded");
        await db.exec(dataSQL);
        // eslint-disable-next-line no-console
        console.log("[pglite] Data loaded");
      } else {
        await db.exec(sql);
        // eslint-disable-next-line no-console
        console.log("[pglite] SQL executed (no -- DATA split)");
      }
      state.initialized = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      state.initError = msg;
      // eslint-disable-next-line no-console
      console.error("[pglite] init failed:", err);
      state.initialized = true;
    }
  })();

  return state.initPromise;
}

export async function runQuery(sql: string): Promise<QueryResult> {
  if (!state.db) {
    return {
      rows: [],
      fields: [],
      rowCount: 0,
      duration: 0,
      error: "Database not initialized. Reload the page.",
    };
  }
  try {
    const start = performance.now();
    const result = await state.db.query(sql);
    const duration = performance.now() - start;
    const rows = (result.rows ?? []) as Record<string, unknown>[];
    const fields = (result.fields ?? []) as QueryField[];
    return {
      rows,
      fields,
      rowCount: rows.length,
      duration: Math.round(duration),
      error: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      rows: [],
      fields: [],
      rowCount: 0,
      duration: 0,
      error: message,
    };
  }
}

export function resetPGlite(): void {
  state.db = null;
  state.initialized = false;
  state.initPromise = null;
  state.variant = null;
  state.initError = null;
}

export async function switchDataset(
  company: string,
  variant: DatasetVariant
): Promise<void> {
  resetPGlite();
  return initPGlite(company, variant);
}
