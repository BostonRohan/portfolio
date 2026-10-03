import { createClient } from "@libsql/client";
import { between } from "drizzle-orm";
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import type { BatchItem } from "drizzle-orm/batch";

import * as schema from "../db/schema.ts";
import type { AiActivityData, AiActivityDay } from "./aiActivity.ts";
import type { FitnessRings, FitnessWorkout } from "./fitness.ts";

let database: LibSQLDatabase<typeof schema> | null = null;

function getDatabase(): LibSQLDatabase<typeof schema> | null {
  const url = import.meta.env.TURSO_DATABASE_URL;
  const authToken = import.meta.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) return null;
  database ??= drizzle(createClient({ url, authToken }), { schema });
  return database;
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
  const db = getDatabase();
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
  const db = getDatabase();
  if (!db) return;
  const history = data.history
    .filter((day) => day.date !== data.date)
    .map((day) => {
      const totals = {
        sessions: day.sessions,
        toolCalls: day.toolCalls,
        syncedAt: data.syncedAt,
      };
      // Historical totals must not erase the provider/tool breakdown already stored.
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
  if (!db) return null;
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
    console.error("[wrapped-archive] AI history query failed", error);
    return null;
  }
}
