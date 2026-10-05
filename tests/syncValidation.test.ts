import { describe, expect, it } from "vitest";
import {
  parseFitnessSync,
  applyFitnessSync,
} from "../src/utils/fitnessSync.ts";
import { parseAiActivity } from "../src/utils/aiActivitySync.ts";
import { isAuthorized } from "../src/utils/syncApi.ts";
import { activity, NOW, workout } from "./fixtures.ts";

const rings = { move: "75%", exercise: 0.5, stand: 100 };

describe("fitness sync", () => {
  it("normalizes rings and accepts an empty workout", () => {
    const parsed = parseFitnessSync({ workout: { duration: "" }, rings });
    expect(parsed).toMatchObject({
      success: true,
      data: { workout: null, rings: { move: 75, exercise: 50, stand: 100 } },
    });
  });
  it("keeps valid rings when a workout is malformed", () => {
    expect(
      parseFitnessSync({ workout: { workoutType: "Running" }, rings }),
    ).toMatchObject({
      success: true,
      data: { workout: null, ignoredUpdates: [{ field: "workout" }] },
    });
  });
  it("keeps a valid workout when rings are malformed", () => {
    expect(parseFitnessSync({ workout, rings: { move: -1 } })).toMatchObject({
      success: true,
      data: { rings: null, ignoredUpdates: [{ field: "rings" }] },
    });
  });
  it.each([null, [], {}, { workout: {} }, { rings: { move: -1 } }])(
    "rejects a payload without usable data: %j",
    (body) => {
      expect(parseFitnessSync(body).success).toBe(false);
    },
  );
  it.each([
    ["2026-10-03T01:30:00.000Z", "saved", true, true],
    ["2026-10-03T01:00:00.000Z", "saved", true, true],
    ["2026-10-03T00:00:00.000Z", "older", false, true],
    ["2026-10-02T00:00:00.000Z", "stale", false, true],
    ["2026-10-03T03:00:00.000Z", "future", false, false],
  ])("handles %s as %s", (completedAt, status, updatesCache, archives) => {
    const parsed = parseFitnessSync({
      workout: { ...workout, completedAt },
      rings,
    });
    if (!parsed.success) throw new Error("Fixture is invalid");
    const result = applyFitnessSync({ workout, rings: null }, parsed.data, NOW);
    expect(result.workoutStatus).toBe(status);
    expect(result.updatedWorkout).toBe(updatesCache);
    expect(Boolean(result.workoutToArchive)).toBe(archives);
    expect(result.data.workout?.completedAt).toBe(
      updatesCache ? completedAt : workout.completedAt,
    );
    expect(result.updatedRings).toBe(true);
  });
  it("accepts exactly 15 hours but archives only after the boundary", () => {
    for (const age of [15 * 3600000, 15 * 3600000 + 1]) {
      const parsed = parseFitnessSync({
        workout: {
          ...workout,
          completedAt: new Date(Date.parse(NOW) - age).toISOString(),
        },
      });
      if (!parsed.success) throw new Error("Fixture is invalid");
      const result = applyFitnessSync(
        { workout: null, rings: null },
        parsed.data,
        NOW,
      );
      expect(result.updatedWorkout).toBe(age === 15 * 3600000);
      expect(result.workoutToArchive).not.toBeNull();
    }
  });
  it("defaults omitted completion time and metrics", () => {
    const parsed = parseFitnessSync({
      workout: { workoutType: "Walking", duration: 20 },
    });
    if (!parsed.success) throw new Error("Fixture is invalid");
    expect(
      applyFitnessSync({ workout: null, rings: null }, parsed.data, NOW)
        .workoutToArchive,
    ).toMatchObject({
      completedAt: NOW,
      duration: "20",
      activeEnergy: null,
      distance: null,
    });
  });
  it("preserves the cached workout for rings-only updates", () => {
    const parsed = parseFitnessSync({ rings });
    if (!parsed.success) throw new Error("Fixture is invalid");
    const result = applyFitnessSync({ workout, rings: null }, parsed.data, NOW);
    expect(result.data.workout).toEqual(workout);
    expect(result.workoutToArchive).toBeNull();
  });
});

describe("AI payload validation", () => {
  it("accepts aggregate payloads and validates optional session details", () => {
    expect(parseAiActivity(activity).success).toBe(true);
    expect(
      parseAiActivity({ ...activity, sessions: [{ prompt: "private" }] })
        .success,
    ).toBe(false);
  });
  it.each([-1, 0.5, 1000001, NaN])("rejects invalid counts: %s", (sessions) => {
    expect(
      parseAiActivity({
        ...activity,
        providers: { ...activity.providers, codex: { sessions, toolCalls: 0 } },
      }).success,
    ).toBe(false);
  });
  it("bounds history size", () => {
    expect(
      parseAiActivity({
        ...activity,
        history: Array(101).fill(activity.history[0]),
      }).success,
    ).toBe(false);
  });
});

describe("sync authorization", () => {
  it.each([
    undefined,
    "Basic token",
    "Bearer wrong",
    "Bearer tokem",
    "Bearer ",
  ])("rejects %s", (authorization) => {
    expect(
      isAuthorized(
        new Request("https://example.test", {
          headers: authorization ? { Authorization: authorization } : {},
        }),
        "token",
      ),
    ).toBe(false);
  });
  it("accepts the exact bearer token only when configured", () => {
    const request = new Request("https://example.test", {
      headers: { Authorization: "Bearer token" },
    });
    expect(isAuthorized(request, "token")).toBe(true);
    expect(isAuthorized(request, undefined)).toBe(false);
  });
});
