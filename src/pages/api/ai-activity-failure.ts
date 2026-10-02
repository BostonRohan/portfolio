import { timingSafeEqual } from "node:crypto";

import type { APIRoute } from "astro";
import * as Sentry from "@sentry/astro";
import { z } from "zod";

const failureSchema = z
  .object({
    source: z.enum(["sync", "watchdog"]),
    stage: z.enum(["collection", "upload", "status", "missing-success"]),
    occurredAt: z.string().datetime({ offset: true }),
  })
  .strict();

function json(payload: unknown, status: number, requestId: string): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "X-Request-ID": requestId,
    },
  });
}

function isAuthorized(request: Request): boolean {
  const expectedToken = import.meta.env.AI_ACTIVITY_SYNC_TOKEN;
  const authorization = request.headers.get("Authorization");
  if (!expectedToken || !authorization?.startsWith("Bearer ")) return false;

  const suppliedToken = authorization.slice("Bearer ".length);
  const expected = Buffer.from(expectedToken);
  const supplied = Buffer.from(suppliedToken);
  return (
    supplied.length === expected.length && timingSafeEqual(supplied, expected)
  );
}

export const POST: APIRoute = async ({ request }) => {
  const requestId = crypto.randomUUID();
  if (!isAuthorized(request)) {
    return json({ error: "Unauthorized", requestId }, 401, requestId);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON", requestId }, 400, requestId);
  }
  const parsed = failureSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Invalid failure report", requestId }, 400, requestId);
  }
  if (!import.meta.env.SENTRY_DSN) {
    return json(
      { error: "Error reporting unavailable", requestId },
      503,
      requestId,
    );
  }

  Sentry.captureMessage("AI activity sync failed on Mac", {
    level: "error",
    fingerprint: [
      "ai-activity-sync-failure",
      parsed.data.source,
      parsed.data.stage,
    ],
    tags: {
      endpoint: "/api/ai-activity-failure",
      source: parsed.data.source,
      stage: parsed.data.stage,
    },
    extra: { requestId, occurredAt: parsed.data.occurredAt },
  });
  const delivered = await Sentry.flush(2000);
  if (!delivered) {
    return json({ error: "Error report deferred", requestId }, 503, requestId);
  }
  return json({ ok: true, requestId }, 202, requestId);
};
