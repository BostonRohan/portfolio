const SLOW_REQUEST_THRESHOLD_MS = 6_000;

export interface HomepageDiagnostics {
  measure<T>(dependency: string, operation: () => Promise<T>): Promise<T>;
  mark(event: string): void;
  finish(outcome: "response-created" | "failed", status?: number): void;
}

declare global {
  namespace App {
    interface Locals {
      homepageDiagnostics?: HomepageDiagnostics;
    }
  }
}

// This ordinal identifies reuse of this module instance, not a guaranteed cold start.
let requestOrdinal = 0;

export function createHomepageDiagnostics(): HomepageDiagnostics {
  const requestId = crypto.randomUUID();
  const startedAt = performance.now();
  const pending = new Map<string, number>();
  const completed: Record<string, number> = {};
  requestOrdinal += 1;

  const log = (
    event: string,
    details: Record<string, unknown> = {},
    isWarning = false,
  ): void => {
    const message = `[homepage-timing] ${JSON.stringify({
      requestId,
      event,
      timestamp: new Date().toISOString(),
      elapsedMs: Math.round(performance.now() - startedAt),
      ...details,
    })}`;
    if (isWarning) console.warn(message);
    else console.info(message);
  };

  log("request-start", {
    requestOrdinal,
    runtimeClockMs: Math.round(performance.now()),
  });

  const slowRequestTimer = setTimeout(() => {
    log(
      "request-slow",
      {
        pending: Object.fromEntries(
          [...pending].map(([name, start]) => [
            name,
            Math.round(performance.now() - start),
          ]),
        ),
        completed,
      },
      true,
    );
  }, SLOW_REQUEST_THRESHOLD_MS);
  // Node timers can be unreferenced; the optional shape also works with DOM typings.
  (
    slowRequestTimer as ReturnType<typeof setTimeout> & { unref?: () => void }
  ).unref?.();

  return {
    async measure<T>(
      dependency: string,
      operation: () => Promise<T>,
    ): Promise<T> {
      const dependencyStartedAt = performance.now();
      pending.set(dependency, dependencyStartedAt);
      log("dependency-start", { dependency });
      let outcome: "resolved" | "rejected" = "resolved";
      try {
        return await operation();
      } catch (error) {
        outcome = "rejected";
        throw error;
      } finally {
        const durationMs = Math.round(performance.now() - dependencyStartedAt);
        pending.delete(dependency);
        completed[dependency] = durationMs;
        log("dependency-end", { dependency, durationMs, outcome });
      }
    },
    mark(event: string): void {
      log(event);
    },
    finish(outcome: "response-created" | "failed", status?: number): void {
      clearTimeout(slowRequestTimer);
      log(outcome, { status, completed, pending: [...pending.keys()] });
    },
  };
}
