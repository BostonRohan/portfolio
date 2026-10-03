import { createClient, type Client } from "@libsql/client";
import * as Sentry from "@sentry/astro";

import type { AiActivityData, AiActivityDay } from "./aiActivity.ts";
import type { FitnessRings, FitnessWorkout } from "./fitness.ts";

let client: Client | null = null;
let hasReportedMissingConfiguration = false;

function getClient(): Client | null {
  const url = import.meta.env.TURSO_DATABASE_URL;
  const authToken = import.meta.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) return null;
  client ??= createClient({ url, authToken });
  return client;
}

function getArchiveClient(): Client | null {
  const db = getClient();
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
  const db = getArchiveClient();
  if (!db) return;

  const statements = [];
  if (workout) {
    statements.push({
      sql: `INSERT INTO wrapped_workouts
        (id, completed_at, workout_type, duration, active_energy, distance, synced_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          duration = excluded.duration,
          active_energy = excluded.active_energy,
          distance = excluded.distance,
          synced_at = excluded.synced_at`,
      args: [
        `${workout.completedAt}:${workout.workoutType}`,
        workout.completedAt,
        workout.workoutType,
        workout.duration,
        workout.activeEnergy,
        workout.distance,
        workout.syncedAt,
      ],
    });
  }

  if (rings) {
    statements.push({
      sql: `INSERT INTO wrapped_fitness_days
        (day, move, exercise, stand, synced_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(day) DO UPDATE SET
          move = excluded.move,
          exercise = excluded.exercise,
          stand = excluded.stand,
          synced_at = excluded.synced_at`,
      args: [ringsDay, rings.move, rings.exercise, rings.stand, rings.syncedAt],
    });
  }

  if (statements.length > 0) await db.batch(statements, "write");
}

export async function archiveAiActivity(data: AiActivityData): Promise<void> {
  const db = getArchiveClient();
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
    const result = await db.execute({
      sql: `SELECT day, sessions, tool_calls FROM wrapped_ai_days
        WHERE day >= ? AND day <= ?`,
      args: [dates[0], dates.at(-1)!],
    });
    for (const row of result.rows) {
      existingDays.set(String(row.day), {
        sessions: Number(row.sessions),
        toolCalls: Number(row.tool_calls),
      });
    }
  }

  const statements = historicalDays
    .filter((day) => {
      const existing = existingDays.get(day.date);
      return (
        !existing ||
        existing.sessions !== day.sessions ||
        existing.toolCalls !== day.toolCalls
      );
    })
    .map((day) => ({
      sql: `INSERT INTO wrapped_ai_days
        (day, sessions, tool_calls, codex_sessions, codex_tool_calls,
         claude_sessions, claude_tool_calls, terminal_calls, file_calls,
         web_calls, browser_calls, other_calls, synced_at)
        VALUES (?, ?, ?, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ?)
        ON CONFLICT(day) DO UPDATE SET
          sessions = excluded.sessions,
          tool_calls = excluded.tool_calls,
          synced_at = excluded.synced_at`,
      args: [day.date, day.sessions, day.toolCalls, data.syncedAt],
    }));

  statements.push({
    sql: `INSERT INTO wrapped_ai_days
      (day, sessions, tool_calls, codex_sessions, codex_tool_calls,
       claude_sessions, claude_tool_calls, terminal_calls, file_calls,
       web_calls, browser_calls, other_calls, synced_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(day) DO UPDATE SET
        sessions = excluded.sessions,
        tool_calls = excluded.tool_calls,
        codex_sessions = excluded.codex_sessions,
        codex_tool_calls = excluded.codex_tool_calls,
        claude_sessions = excluded.claude_sessions,
        claude_tool_calls = excluded.claude_tool_calls,
        terminal_calls = excluded.terminal_calls,
        file_calls = excluded.file_calls,
        web_calls = excluded.web_calls,
        browser_calls = excluded.browser_calls,
        other_calls = excluded.other_calls,
        synced_at = excluded.synced_at`,
    args: [
      data.date,
      data.providers.codex.sessions + data.providers.claude.sessions,
      data.providers.codex.toolCalls + data.providers.claude.toolCalls,
      data.providers.codex.sessions,
      data.providers.codex.toolCalls,
      data.providers.claude.sessions,
      data.providers.claude.toolCalls,
      data.tools.terminal,
      data.tools.files,
      data.tools.web,
      data.tools.browser,
      data.tools.other,
      data.syncedAt,
    ],
  });

  await db.batch(statements, "write");
}

export async function getArchivedAiActivityDays(
  startDay: string,
  endDay: string,
): Promise<AiActivityDay[] | null> {
  const db = getClient();
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
    const result = await db.execute({
      sql: `SELECT day, sessions, tool_calls
        FROM wrapped_ai_days
        WHERE day >= ? AND day <= ?
        ORDER BY day`,
      args: [startDay, endDay],
    });
    return result.rows.map((row) => ({
      date: String(row.day),
      sessions: Number(row.sessions),
      toolCalls: Number(row.tool_calls),
    }));
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
  const db = getArchiveClient();
  if (!db) throw new Error("Turso is not configured for Letterboxd archiving");

  const statements = entries.map((entry) => ({
    sql: `INSERT INTO wrapped_events
      (id, source, kind, occurred_at, title, url, image_url, metadata)
      VALUES (?, 'letterboxd', 'film', ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        occurred_at = excluded.occurred_at,
        title = excluded.title,
        url = excluded.url,
        image_url = excluded.image_url,
        metadata = excluded.metadata
      WHERE wrapped_events.occurred_at IS NOT excluded.occurred_at
        OR wrapped_events.title IS NOT excluded.title
        OR wrapped_events.url IS NOT excluded.url
        OR wrapped_events.image_url IS NOT excluded.image_url
        OR wrapped_events.metadata IS NOT excluded.metadata`,
    args: [
      `letterboxd:${entry.id}`,
      new Date(entry.updatedAt * 1_000).toISOString(),
      entry.title,
      entry.url,
      entry.coverImage,
      JSON.stringify({ rating: entry.rating, publishedAt: entry.publishedAt }),
    ],
  }));

  if (statements.length > 0) await db.batch(statements, "write");
  return statements.length;
}
