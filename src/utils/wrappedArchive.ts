import { createClient } from "@libsql/client";
import * as Sentry from "@sentry/astro";
import { between, sql } from "drizzle-orm";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import type { BatchItem } from "drizzle-orm/batch";

import * as schema from "../db/schema.ts";
import type { AiActivityData, AiActivityDay } from "./aiActivity.ts";
import type { FitnessRings, FitnessWorkout } from "./fitness.ts";

let database: LibSQLDatabase<typeof schema> | null = null;
let hasReportedMissingConfiguration = false;

function getDatabase(): LibSQLDatabase<typeof schema> | null {
  const url = import.meta.env.TURSO_DATABASE_URL;
  const authToken = import.meta.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;
  database ??= drizzle(createClient({ url, authToken }), { schema });
  return database;
}

function getArchiveDatabase(): LibSQLDatabase<typeof schema> | null {
  const db = getDatabase();
  if (!db && import.meta.env.PROD) {
    throw new Error("Turso is required for production activity archiving");
  }
  return db;
}

export async function archiveFitnessActivity({
  workout,
  rings,
  ringsDay,
}: {
  workout?: FitnessWorkout | null;
  rings?: FitnessRings | null;
  ringsDay: string;
}): Promise<void> {
  const db = getArchiveDatabase();
  if (!db) return;
  const statements: BatchItem<"sqlite">[] = [];
  if (workout) {
    statements.push(
      db
        .insert(schema.workouts)
        .values({
          id: `${workout.completedAt}:${workout.workoutType}`,
          ...workout,
        })
        .onConflictDoUpdate({
          target: schema.workouts.id,
          set: {
            duration: workout.duration,
            activeEnergy: workout.activeEnergy,
            distance: workout.distance,
            syncedAt: workout.syncedAt,
          },
        }),
    );
  }
  if (rings) {
    statements.push(
      db
        .insert(schema.fitnessDays)
        .values({ day: ringsDay, ...rings })
        .onConflictDoUpdate({ target: schema.fitnessDays.day, set: rings }),
    );
  }
  const [first, ...rest] = statements;
  if (first) await db.batch([first, ...rest]);
}

export async function archiveAiActivity(data: AiActivityData): Promise<void> {
  const db = getArchiveDatabase();
  if (!db) return;
  const historicalDays = [
    ...new Map<string, AiActivityDay>(
      data.history
        .filter((day) => day.date !== data.date)
        .map((day): [string, AiActivityDay] => [day.date, day]),
    ).values(),
  ];
  const existingDays = new Map<
    string,
    { sessions: number; toolCalls: number }
  >();
  if (historicalDays.length > 0) {
    const dates = historicalDays.map((day) => day.date).sort();
    const rows = await db
      .select({
        day: schema.aiDays.day,
        sessions: schema.aiDays.sessions,
        toolCalls: schema.aiDays.toolCalls,
      })
      .from(schema.aiDays)
      .where(between(schema.aiDays.day, dates[0], dates.at(-1)!));
    for (const row of rows) existingDays.set(row.day, row);
  }
  const history = historicalDays
    .filter((day) => {
      const existing = existingDays.get(day.date);
      return (
        !existing ||
        existing.sessions !== day.sessions ||
        existing.toolCalls !== day.toolCalls
      );
    })
    .map((day) => {
      const totals = {
        sessions: day.sessions,
        toolCalls: day.toolCalls,
        syncedAt: data.syncedAt,
      };
      // Historical totals preserve the provider/tool breakdown already stored.
      return db
        .insert(schema.aiDays)
        .values({ day: day.date, ...totals })
        .onConflictDoUpdate({ target: schema.aiDays.day, set: totals });
    });
  const current = {
    sessions: data.providers.codex.sessions + data.providers.claude.sessions,
    toolCalls: data.providers.codex.toolCalls + data.providers.claude.toolCalls,
    codexSessions: data.providers.codex.sessions,
    codexToolCalls: data.providers.codex.toolCalls,
    claudeSessions: data.providers.claude.sessions,
    claudeToolCalls: data.providers.claude.toolCalls,
    terminalCalls: data.tools.terminal,
    fileCalls: data.tools.files,
    webCalls: data.tools.web,
    browserCalls: data.tools.browser,
    otherCalls: data.tools.other,
    syncedAt: data.syncedAt,
  };
  const today = db
    .insert(schema.aiDays)
    .values({ day: data.date, ...current })
    .onConflictDoUpdate({ target: schema.aiDays.day, set: current });
  await db.batch([today, ...history]);
}

export async function getArchivedAiActivityDays(
  startDay: string,
  endDay: string,
): Promise<AiActivityDay[] | null> {
  const db = getDatabase();
  if (!db) {
    if (import.meta.env.PROD && !hasReportedMissingConfiguration) {
      hasReportedMissingConfiguration = true;
      Sentry.captureMessage("Turso is not configured for AI history reads", {
        level: "error",
        tags: { service: "turso", operation: "read-ai-history" },
      });
    }
    return null;
  }
  try {
    return await db
      .select({
        date: schema.aiDays.day,
        sessions: schema.aiDays.sessions,
        toolCalls: schema.aiDays.toolCalls,
      })
      .from(schema.aiDays)
      .where(between(schema.aiDays.day, startDay, endDay))
      .orderBy(schema.aiDays.day);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { service: "turso", operation: "read-ai-history" },
    });
    console.error("[wrapped-archive] AI history query failed", error);
    return null;
  }
}

export interface LetterboxdDiaryEntry {
  id: string;
  title: string;
  url: string;
  coverImage: string;
  rating: number | null;
  updatedAt: number;
  publishedAt: number;
}

export async function archiveLetterboxdDiary(
  entries: LetterboxdDiaryEntry[],
): Promise<number> {
  const db = getArchiveDatabase();
  if (!db) throw new Error("Turso is not configured for Letterboxd archiving");
  const statements = entries.map((entry) => {
    const fields = {
      occurredAt: new Date(entry.updatedAt * 1_000).toISOString(),
      title: entry.title,
      url: entry.url,
      imageUrl: entry.coverImage,
      metadata: JSON.stringify({
        rating: entry.rating,
        publishedAt: entry.publishedAt,
      }),
    };
    return db
      .insert(schema.events)
      .values({
        id: `letterboxd:${entry.id}`,
        source: "letterboxd",
        kind: "film",
        ...fields,
      })
      .onConflictDoUpdate({
        target: schema.events.id,
        set: fields,
        setWhere: sql`${schema.events.occurredAt} IS NOT ${fields.occurredAt}
          OR ${schema.events.title} IS NOT ${fields.title}
          OR ${schema.events.url} IS NOT ${fields.url}
          OR ${schema.events.imageUrl} IS NOT ${fields.imageUrl}
          OR ${schema.events.metadata} IS NOT ${fields.metadata}`,
      });
  });
  const [first, ...rest] = statements;
  if (first) await db.batch([first, ...rest]);
  return statements.length;
}
