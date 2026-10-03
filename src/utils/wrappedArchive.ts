import { createClient, type Client } from "@libsql/client";

import type { AiActivityData } from "./aiActivity.ts";
import type { FitnessRings, FitnessWorkout } from "./fitness.ts";

let client: Client | null = null;
let schemaPromise: Promise<void> | null = null;

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS wrapped_workouts (
    id TEXT PRIMARY KEY,
    completed_at TEXT NOT NULL,
    workout_type TEXT NOT NULL,
    duration TEXT NOT NULL,
    active_energy TEXT,
    distance TEXT,
    synced_at TEXT NOT NULL
  )`,
  "CREATE INDEX IF NOT EXISTS wrapped_workouts_completed_at_idx ON wrapped_workouts (completed_at)",
  `CREATE TABLE IF NOT EXISTS wrapped_fitness_days (
    day TEXT PRIMARY KEY,
    move REAL NOT NULL,
    exercise REAL NOT NULL,
    stand REAL NOT NULL,
    synced_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS wrapped_ai_days (
    day TEXT PRIMARY KEY,
    sessions INTEGER NOT NULL,
    tool_calls INTEGER NOT NULL,
    codex_sessions INTEGER,
    codex_tool_calls INTEGER,
    claude_sessions INTEGER,
    claude_tool_calls INTEGER,
    terminal_calls INTEGER,
    file_calls INTEGER,
    web_calls INTEGER,
    browser_calls INTEGER,
    other_calls INTEGER,
    synced_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS wrapped_events (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    kind TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT,
    url TEXT,
    image_url TEXT,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (source, id)
  )`,
  "CREATE INDEX IF NOT EXISTS wrapped_events_occurred_at_idx ON wrapped_events (occurred_at)",
  "CREATE INDEX IF NOT EXISTS wrapped_events_source_kind_idx ON wrapped_events (source, kind)",
];

function getClient(): Client | null {
  const url = import.meta.env.TURSO_DATABASE_URL;
  const authToken = import.meta.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) return null;
  client ??= createClient({ url, authToken });
  return client;
}

async function ensureSchema(db: Client): Promise<void> {
  schemaPromise ??= db.batch(SCHEMA_STATEMENTS, "write").then(
    () => undefined,
    (error: unknown) => {
      schemaPromise = null;
      throw error;
    },
  );
  await schemaPromise;
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
  await ensureSchema(db);

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
  await ensureSchema(db);

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
  const db = getClient();
  if (!db) throw new Error("Turso is not configured for Letterboxd archiving");
  await ensureSchema(db);

  const statements = entries.map((entry) => ({
    sql: `INSERT INTO wrapped_events
      (id, source, kind, occurred_at, title, url, image_url, metadata)
      VALUES (?, 'letterboxd', 'film', ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        occurred_at = excluded.occurred_at,
        title = excluded.title,
        url = excluded.url,
        image_url = excluded.image_url,
        metadata = excluded.metadata`,
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
