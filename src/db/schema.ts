import { sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

export const workouts = sqliteTable(
  "wrapped_workouts",
  {
    id: text("id").primaryKey(),
    completedAt: text("completed_at").notNull(),
    workoutType: text("workout_type").notNull(),
    duration: text("duration").notNull(),
    activeEnergy: text("active_energy"),
    distance: text("distance"),
    syncedAt: text("synced_at").notNull(),
  },
  (table) => [index("wrapped_workouts_completed_at_idx").on(table.completedAt)],
);

export const fitnessDays = sqliteTable("wrapped_fitness_days", {
  day: text("day").primaryKey(),
  move: real("move").notNull(),
  exercise: real("exercise").notNull(),
  stand: real("stand").notNull(),
  syncedAt: text("synced_at").notNull(),
});

export const aiDays = sqliteTable("wrapped_ai_days", {
  day: text("day").primaryKey(),
  sessions: integer("sessions").notNull(),
  toolCalls: integer("tool_calls").notNull(),
  codexSessions: integer("codex_sessions"),
  codexToolCalls: integer("codex_tool_calls"),
  claudeSessions: integer("claude_sessions"),
  claudeToolCalls: integer("claude_tool_calls"),
  terminalCalls: integer("terminal_calls"),
  fileCalls: integer("file_calls"),
  webCalls: integer("web_calls"),
  browserCalls: integer("browser_calls"),
  otherCalls: integer("other_calls"),
  syncedAt: text("synced_at").notNull(),
});

export const events = sqliteTable(
  "wrapped_events",
  {
    id: text("id").primaryKey(),
    source: text("source").notNull(),
    kind: text("kind").notNull(),
    occurredAt: text("occurred_at").notNull(),
    title: text("title").notNull(),
    details: text("details"),
    url: text("url"),
    imageUrl: text("image_url"),
    metadata: text("metadata").notNull().default("{}"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    unique("wrapped_events_source_id_unique").on(table.source, table.id),
    index("wrapped_events_occurred_at_idx").on(table.occurredAt),
    index("wrapped_events_source_kind_idx").on(table.source, table.kind),
  ],
);
