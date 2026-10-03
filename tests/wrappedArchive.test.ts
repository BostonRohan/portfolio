import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { activity, workout } from "./fixtures.ts";

const state = vi.hoisted(() => ({ client: null as Client | null }));
vi.mock("@libsql/client", async (original) => {
  const actual = await original<typeof import("@libsql/client")>();
  return {
    ...actual,
    createClient: vi.fn(() => {
      if (!state.client) throw new Error("Test database not initialized");
      return state.client;
    }),
  };
});
const migrationsFolder = fileURLToPath(new URL("../drizzle/", import.meta.url));
let archive: typeof import("../src/utils/wrappedArchive.ts");
beforeEach(async () => {
  vi.resetModules();
  const actual =
    await vi.importActual<typeof import("@libsql/client")>("@libsql/client");
  state.client = actual.createClient({ url: ":memory:" });
  await migrate(drizzle(state.client), { migrationsFolder });
  vi.stubEnv("TURSO_DATABASE_URL", "file:test-only");
  vi.stubEnv("TURSO_AUTH_TOKEN", "fake-test-token");
  archive = await import("../src/utils/wrappedArchive.ts");
});
afterEach(() => {
  state.client?.close();
  state.client = null;
});

describe("Drizzle archive against real in-memory SQLite", () => {
  it("upserts repeated workouts and daily rings instead of duplicating them", async () => {
    const payload = {
      workout,
      rings: {
        move: 50,
        exercise: 75,
        stand: 100,
        syncedAt: activity.syncedAt,
      },
      ringsDay: activity.date,
    };
    await archive.archiveFitnessActivity(payload);
    await archive.archiveFitnessActivity({
      ...payload,
      workout: { ...workout, duration: "45" },
      rings: { ...payload.rings, move: 90 },
    });
    const workouts = await state.client!.execute(
      "SELECT * FROM wrapped_workouts",
    );
    const rings = await state.client!.execute(
      "SELECT * FROM wrapped_fitness_days",
    );
    expect(workouts.rows).toHaveLength(1);
    expect(workouts.rows[0].duration).toBe("45");
    expect(rings.rows).toHaveLength(1);
    expect(rings.rows[0].move).toBe(90);
  });
  it("preserves provider details when later uploads update historical totals", async () => {
    await archive.archiveAiActivity(activity);
    await archive.archiveAiActivity({
      ...activity,
      date: "2026-10-03",
      history: [{ date: activity.date, sessions: 6, toolCalls: 20 }],
    });
    const result = await state.client!.execute({
      sql: "SELECT * FROM wrapped_ai_days WHERE day = ?",
      args: [activity.date],
    });
    expect(result.rows[0]).toMatchObject({
      sessions: 6,
      tool_calls: 20,
      codex_sessions: 2,
      claude_sessions: 1,
      terminal_calls: 2,
    });
  });
  it("uses current provider totals even when today's history disagrees", async () => {
    const payload = {
      ...activity,
      history: [{ date: activity.date, sessions: 999, toolCalls: 999 }],
    };
    await archive.archiveAiActivity(payload);
    await archive.archiveAiActivity(payload);
    expect(
      await archive.getArchivedAiActivityDays(activity.date, activity.date),
    ).toEqual([{ date: activity.date, sessions: 3, toolCalls: 8 }]);
  });
  it("returns ordered, inclusive history and leaves missing dates absent", async () => {
    await archive.archiveAiActivity({
      ...activity,
      history: [
        { date: "2026-09-01", sessions: 9, toolCalls: 9 },
        { date: "2026-09-30", sessions: 0, toolCalls: 0 },
      ],
    });
    expect(
      await archive.getArchivedAiActivityDays("2026-09-30", "2026-10-02"),
    ).toEqual([
      { date: "2026-09-30", sessions: 0, toolCalls: 0 },
      { date: "2026-10-02", sessions: 3, toolCalls: 8 },
    ]);
  });
  it("rolls back the whole fitness batch if a later statement fails", async () => {
    await state.client!.execute("DROP TABLE wrapped_fitness_days");
    await expect(
      archive.archiveFitnessActivity({
        workout,
        rings: { move: 1, exercise: 1, stand: 1, syncedAt: activity.syncedAt },
        ringsDay: activity.date,
      }),
    ).rejects.toThrow();
    expect(
      (await state.client!.execute("SELECT * FROM wrapped_workouts")).rows,
    ).toHaveLength(0);
  });
  it("returns null on read failure so callers can use cache", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await state.client!.execute("DROP TABLE wrapped_ai_days");
    expect(
      await archive.getArchivedAiActivityDays(activity.date, activity.date),
    ).toBeNull();
  });
  it("skips the connection when credentials are absent", async () => {
    vi.stubEnv("TURSO_AUTH_TOKEN", "");
    vi.mocked(createClient).mockClear();
    await archive.archiveAiActivity(activity);
    expect(
      await archive.getArchivedAiActivityDays(activity.date, activity.date),
    ).toBeNull();
    expect(createClient).not.toHaveBeenCalled();
  });
  it("adopts the legacy schema without losing rows and can migrate twice", async () => {
    const actual =
      await vi.importActual<typeof import("@libsql/client")>("@libsql/client");
    const legacy = actual.createClient({ url: ":memory:" });
    try {
      await legacy.executeMultiple(
        await readFile(
          new URL("../scripts/turso/schema.sql", import.meta.url),
          "utf8",
        ),
      );
      await legacy.execute(
        "INSERT INTO wrapped_fitness_days VALUES ('2026-01-01', 1, 2, 3, 'original')",
      );
      await migrate(drizzle(legacy), { migrationsFolder });
      await migrate(drizzle(legacy), { migrationsFolder });
      expect(
        (await legacy.execute("SELECT * FROM wrapped_fitness_days")).rows[0],
      ).toMatchObject({ day: "2026-01-01", synced_at: "original" });
      expect(
        (await legacy.execute("SELECT * FROM __drizzle_migrations")).rows,
      ).toHaveLength(1);
    } finally {
      legacy.close();
    }
  });
});
