-- Baseline adopts the existing Wrapped schema; subsequent migrations are generated normally.
CREATE TABLE IF NOT EXISTS `wrapped_ai_days` (
	`day` text PRIMARY KEY NOT NULL,
	`sessions` integer NOT NULL,
	`tool_calls` integer NOT NULL,
	`codex_sessions` integer,
	`codex_tool_calls` integer,
	`claude_sessions` integer,
	`claude_tool_calls` integer,
	`terminal_calls` integer,
	`file_calls` integer,
	`web_calls` integer,
	`browser_calls` integer,
	`other_calls` integer,
	`synced_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `wrapped_events` (
	`id` text PRIMARY KEY NOT NULL,
	`source` text NOT NULL,
	`kind` text NOT NULL,
	`occurred_at` text NOT NULL,
	`title` text NOT NULL,
	`details` text,
	`url` text,
	`image_url` text,
	`metadata` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `wrapped_events_occurred_at_idx` ON `wrapped_events` (`occurred_at`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `wrapped_events_source_kind_idx` ON `wrapped_events` (`source`,`kind`);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `wrapped_events_source_id_unique` ON `wrapped_events` (`source`,`id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `wrapped_fitness_days` (
	`day` text PRIMARY KEY NOT NULL,
	`move` real NOT NULL,
	`exercise` real NOT NULL,
	`stand` real NOT NULL,
	`synced_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `wrapped_workouts` (
	`id` text PRIMARY KEY NOT NULL,
	`completed_at` text NOT NULL,
	`workout_type` text NOT NULL,
	`duration` text NOT NULL,
	`active_energy` text,
	`distance` text,
	`synced_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `wrapped_workouts_completed_at_idx` ON `wrapped_workouts` (`completed_at`);