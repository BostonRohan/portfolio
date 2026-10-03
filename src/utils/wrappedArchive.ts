import { createClient, type Client } from "@libsql/client";

import type { AiActivityData, AiActivityDay } from "./aiActivity.ts";
import type { FitnessRings, FitnessWorkout } from "./fitness.ts";

let client: Client | null = null;

function getClient(): Client | null {
  const url = import.meta.env.TURSO_DATABASE_URL;
  const authToken = import.meta.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) return null;
  client ??= createClient({ url, authToken });
  return client;
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
  const db = getClient();
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
  const db = getClient();
  if (!db) return;

  const statements = data.history
    .filter((day) => day.date !== data.date)
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
  if (!db) return null;

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
    console.error("[wrapped-archive] AI history query failed", error);
    return null;
  }
}
