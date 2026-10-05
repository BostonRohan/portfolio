import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createHomepageDiagnostics } from "../src/utils/homepageDiagnostics.ts";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
  vi.spyOn(console, "info").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
});

describe("homepage request diagnostics", () => {
  it("reports a stalled dependency before the platform cutoff without aborting it", async () => {
    const diagnostics = createHomepageDiagnostics();
    let resolveCache!: (value: string) => void;
    const cache = new Promise<string>((resolve) => {
      resolveCache = resolve;
    });
    const result = diagnostics.measure("fitness-cache", () => cache);
    await diagnostics.measure("weather", async () => "clear");
    await vi.advanceTimersByTimeAsync(6_000);

    const message = vi.mocked(console.warn).mock.calls[0][0] as string;
    expect(JSON.parse(message.replace("[homepage-timing] ", ""))).toMatchObject(
      {
        event: "request-slow",
        pending: { "fitness-cache": 6_000 },
        completed: { weather: 0 },
      },
    );
    resolveCache("cached value");
    await expect(result).resolves.toBe("cached value");
    diagnostics.finish("response-created", 200);
  });

  it("preserves failures and cancels the diagnostic timer when rendering ends", async () => {
    const diagnostics = createHomepageDiagnostics();
    const error = new Error("original failure");
    await expect(
      diagnostics.measure("ai-archive", async () => {
        throw error;
      }),
    ).rejects.toBe(error);
    diagnostics.finish("failed");
    await vi.advanceTimersByTimeAsync(10_000);
    expect(console.warn).not.toHaveBeenCalled();
    expect(
      vi
        .mocked(console.info)
        .mock.calls.some(([message]) =>
          String(message).includes('"outcome":"rejected"'),
        ),
    ).toBe(true);
  });

  it("keeps concurrent request snapshots separate", async () => {
    const slow = createHomepageDiagnostics();
    const fast = createHomepageDiagnostics();
    const pending = slow.measure(
      "fitness-cache",
      () => new Promise<void>(() => {}),
    );
    void pending;
    await fast.measure("fitness-cache", async () => null);
    fast.finish("response-created", 200);
    await vi.advanceTimersByTimeAsync(6_000);
    expect(console.warn).toHaveBeenCalledTimes(1);
    slow.finish("failed");
  });
});
