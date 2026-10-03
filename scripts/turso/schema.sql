-- Wrapped's durable archive. Apply once to a new Turso database.
CREATE TABLE IF NOT EXISTS wrapped_workouts (
  id TEXT PRIMARY KEY,
  completed_at TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  duration TEXT NOT NULL,
  active_energy TEXT,
  distance TEXT,
  synced_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS wrapped_workouts_completed_at_idx
  ON wrapped_workouts (completed_at);

CREATE TABLE IF NOT EXISTS wrapped_fitness_days (
  day TEXT PRIMARY KEY,
  move REAL NOT NULL,
  exercise REAL NOT NULL,
  stand REAL NOT NULL,
  synced_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wrapped_ai_days (
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
);

CREATE TABLE IF NOT EXISTS wrapped_events (
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
);

CREATE INDEX IF NOT EXISTS wrapped_events_occurred_at_idx
  ON wrapped_events (occurred_at);

CREATE INDEX IF NOT EXISTS wrapped_events_source_kind_idx
  ON wrapped_events (source, kind);
