import { timingSafeEqual } from "node:crypto";

import type { APIRoute } from "astro";
import * as Sentry from "@sentry/astro";
import { z } from "zod";

import {
  getAiActivity,
  saveAiActivity,
  type AiActivityData,
} from "../../utils/aiActivity.ts";

const countSchema = z.number().int().min(0).max(1_000_000);
const providerSchema = z.object({
  sessions: countSchema,
  toolCalls: countSchema,
});
const activitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  providers: z.object({
    codex: providerSchema,
    claude: providerSchema,
  }),
  tools: z.object({
    terminal: countSchema,
    files: countSchema,
    web: countSchema,
    browser: countSchema,
    other: countSchema,
  }),
});

function json(payload: unknown, status = 200, requestId?: string): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...(requestId ? { "X-Request-ID": requestId } : {}),
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

export const GET: APIRoute = async () => json(await getAiActivity());

export const POST: APIRoute = async ({ request }) => {
  const requestId = crypto.randomUUID();
  console.info("[ai-activity] request received", {
    requestId,
    hasAuthorization: Boolean(request.headers.get("Authorization")),
    hasConfiguredToken: Boolean(import.meta.env.AI_ACTIVITY_SYNC_TOKEN),
  });

  if (!isAuthorized(request)) {
    console.warn("[ai-activity] request rejected", {
      requestId,
      stage: "authorization",
    });
    return json({ error: "Unauthorized", requestId }, 401, requestId);
  }

  try {
    const parsed = activitySchema.safeParse(await request.json());
    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        path: issue.path.join(".") || "body",
        code: issue.code,
      }));
      console.warn("[ai-activity] request rejected", {
        requestId,
        stage: "validation",
        issues,
      });
      return json(
        { error: "Invalid AI activity payload", issues, requestId },
        400,
        requestId,
      );
    }

    const activity: AiActivityData = {
      ...parsed.data,
      syncedAt: new Date().toISOString(),
    };
    await saveAiActivity(activity);
    console.info("[ai-activity] activity saved", {
      requestId,
      date: activity.date,
      sessions:
        activity.providers.codex.sessions + activity.providers.claude.sessions,
      toolCalls:
        activity.providers.codex.toolCalls +
        activity.providers.claude.toolCalls,
    });
    return json({ ok: true, ...activity, requestId }, 201, requestId);
  } catch (error) {
    Sentry.captureException(error, { tags: { endpoint: "/api/ai-activity" } });
    console.error("[ai-activity] sync failed", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return json(
      { error: "AI activity sync failed", requestId },
      503,
      requestId,
    );
  }
};
