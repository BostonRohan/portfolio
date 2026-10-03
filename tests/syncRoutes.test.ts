import type { APIContext } from "astro";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST as fitnessPost } from "../src/pages/api/fitness.ts";
import { POST as aiPost } from "../src/pages/api/ai-activity.ts";
import { activity, NOW, workout } from "./fixtures.ts";

const mocks = vi.hoisted(() => ({
  getFitnessData: vi.fn(),
  saveFitnessData: vi.fn(),
  getAiActivity: vi.fn(),
  saveAiActivity: vi.fn(),
  archiveFitnessActivity: vi.fn(),
  archiveAiActivity: vi.fn(),
}));
vi.mock("../src/utils/fitness.ts", () => mocks);
vi.mock("../src/utils/aiActivity.ts", () => mocks);
vi.mock("../src/utils/wrappedArchive.ts", () => mocks);

function context(body: unknown, token = "test-token"): APIContext {
  return {
    request: new Request("https://example.test/api/sync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),
  } as APIContext;
}
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("FITNESS_SYNC_TOKEN", "test-token");
  vi.stubEnv("AI_ACTIVITY_SYNC_TOKEN", "test-token");
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(NOW));
  mocks.getFitnessData.mockResolvedValue({ workout: null, rings: null });
});

afterEach(() => {
  vi.useRealTimers();
});

for (const route of [
  {
    name: "fitness",
    post: fitnessPost,
    body: { rings: { move: 50, exercise: 50, stand: 50 } },
    archive: mocks.archiveFitnessActivity,
    cache: mocks.saveFitnessData,
  },
  {
    name: "AI",
    post: aiPost,
    body: activity,
    archive: mocks.archiveAiActivity,
    cache: mocks.saveAiActivity,
  },
]) {
  describe(`${route.name} route`, () => {
    it("rejects unauthorized requests before writes", async () => {
      expect((await route.post(context(route.body, "wrong"))).status).toBe(401);
      expect(route.archive).not.toHaveBeenCalled();
      expect(route.cache).not.toHaveBeenCalled();
    });
    it("rejects invalid payloads before writes", async () => {
      expect((await route.post(context({}))).status).toBe(400);
      expect(route.archive).not.toHaveBeenCalled();
      expect(route.cache).not.toHaveBeenCalled();
    });
    it("awaits the archive before starting the cache write", async () => {
      let finishArchive!: () => void;
      let started!: () => void;
      const archiveStarted = new Promise<void>((resolve) => {
        started = resolve;
      });
      route.archive.mockImplementationOnce(() => {
        started();
        return new Promise<void>((resolve) => {
          finishArchive = resolve;
        });
      });
      const response = route.post(context(route.body));
      await archiveStarted;
      expect(route.cache).not.toHaveBeenCalled();
      finishArchive();
      const result = await response;
      expect(result.status).toBe(201);
      expect(result.headers.get("cache-control")).toBe("no-store");
      expect(result.headers.get("x-request-id")).toBeTruthy();
      expect(route.cache).toHaveBeenCalledOnce();
    });
    it("does not cache a failed archive write", async () => {
      route.archive.mockRejectedValueOnce(new Error("database unavailable"));
      expect((await route.post(context(route.body))).status).toBe(503);
      expect(route.cache).not.toHaveBeenCalled();
    });
    it("has archived the payload even when cache storage fails", async () => {
      const writes: string[] = [];
      route.archive.mockImplementationOnce(async () => {
        writes.push("archive");
      });
      route.cache.mockImplementationOnce(async () => {
        writes.push("cache");
        throw new Error("cache unavailable");
      });
      expect((await route.post(context(route.body))).status).toBe(503);
      expect(writes).toEqual(["archive", "cache"]);
    });
  });
}
it("archives a stale workout without replacing the cached workout", async () => {
  const current = { ...workout, completedAt: "2000-01-02T12:00:00.000Z" };
  const incoming = { ...workout, completedAt: "2000-01-01T12:00:00.000Z" };
  mocks.getFitnessData.mockResolvedValue({ workout: current, rings: null });
  expect((await fitnessPost(context({ workout: incoming }))).status).toBe(201);
  expect(mocks.archiveFitnessActivity).toHaveBeenCalledWith(
    expect.objectContaining({
      workout: expect.objectContaining({ completedAt: incoming.completedAt }),
    }),
  );
  expect(mocks.saveFitnessData).toHaveBeenCalledWith({
    workout: current,
    rings: null,
  });
});

it("assigns rings to the Eastern date rather than the UTC date", async () => {
  await fitnessPost(context({ rings: { move: 50, exercise: 50, stand: 50 } }));
  expect(mocks.archiveFitnessActivity).toHaveBeenCalledWith(
    expect.objectContaining({ ringsDay: "2026-10-02" }),
  );
});
