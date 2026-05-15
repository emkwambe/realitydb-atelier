"use client";

import { PGlite } from "@electric-sql/pglite";

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

let db: PGlite | null = null;
let initialized = false;
let initPromise: Promise<void> | null = null;

export function getDB(): PGlite | null {
  return db;
}

export async function initPGlite(company: string): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    db = new PGlite();
    const datasetUrl = `/data/${company}-5k.sql`;
    try {
      const res = await fetch(datasetUrl);
      if (res.ok) {
        const sql = await res.text();
        if (sql.trim().length > 0) {
          await db.exec(sql);
        }
      } else {
        // Dataset not yet generated — leave an empty database so the UI still loads.
        // eslint-disable-next-line no-console
        console.warn(
          `[pglite] Dataset ${datasetUrl} not found (${res.status}). PGlite initialized empty.`
        );
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[pglite] Dataset load failed:", err);
    }
    initialized = true;
  })();

  return initPromise;
}

export async function runQuery(sql: string): Promise<QueryResult> {
  if (!db) {
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
    const result = await db.query(sql);
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
  db = null;
  initialized = false;
  initPromise = null;
}
