import { timingSafeEqual } from "node:crypto";

import type { APIRoute } from "astro";
import * as Sentry from "@sentry/astro";
import { z } from "zod";

import {
  getFitnessData,
  saveFitnessData,
  type FitnessWorkout,
  type FitnessRings,
} from "../../utils/fitness.ts";

const metricSchema = z
  .union([z.string().trim().min(1).max(80), z.number().finite()])
  .transform((value) => String(value));

const optionalMetricSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  metricSchema.optional().nullable(),
);

const workoutSchema = z.object({
  workoutType: z.string().trim().min(1).max(80),
  duration: metricSchema,
  activeEnergy: optionalMetricSchema,
  distance: optionalMetricSchema,
});

const progressSchema = z
  .union([z.string().trim().min(1).max(40), z.number().finite()])
  .transform((value, context) => {
    const text = String(value).trim();
    const parsed = Number.parseFloat(text.replace("%", ""));
    if (!Number.isFinite(parsed) || parsed < 0) {
      context.addIssue({ code: "custom", message: "Invalid ring progress" });
      return z.NEVER;
    }

    return Math.min(
      !text.includes("%") && parsed <= 1 ? parsed * 100 : parsed,
      999,
    );
  });

const ringsSchema = z.object({
  move: progressSchema,
  exercise: progressSchema,
  stand: progressSchema,
});

const fitnessSchema = z
  .object({
    workout: workoutSchema.optional(),
    rings: ringsSchema.optional(),
  })
  .refine((value) => value.workout || value.rings, {
    message: "A workout or rings update is required",
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

function describePayload(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { body: Array.isArray(value) ? "array" : typeof value };
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, field]) => [
      key,
      field === null ? "null" : Array.isArray(field) ? "array" : typeof field,
    ]),
  );
}

function isAuthorized(request: Request): boolean {
  const expectedToken = import.meta.env.FITNESS_SYNC_TOKEN;
  const authorization = request.headers.get("Authorization");
  if (!expectedToken || !authorization?.startsWith("Bearer ")) return false;

  const suppliedToken = authorization.slice("Bearer ".length);
  const expected = Buffer.from(expectedToken);
  const supplied = Buffer.from(suppliedToken);

  return (
    supplied.length === expected.length && timingSafeEqual(supplied, expected)
  );
}

export const GET: APIRoute = async () => {
  return json(await getFitnessData());
};

export const POST: APIRoute = async ({ request }) => {
  const requestId = crypto.randomUUID();
  const contentType = request.headers.get("Content-Type") || "";
  const authorization = request.headers.get("Authorization");

  console.info("[fitness] request received", {
    requestId,
    contentType: contentType || "missing",
    hasAuthorization: Boolean(authorization),
    hasBearerScheme: authorization?.startsWith("Bearer ") ?? false,
    hasConfiguredToken: Boolean(import.meta.env.FITNESS_SYNC_TOKEN),
  });

  if (!isAuthorized(request)) {
    console.warn("[fitness] request rejected", {
      requestId,
      stage: "authorization",
    });
    return json({ error: "Unauthorized", requestId }, 401, requestId);
  }

  try {
    if (!contentType.includes("application/json")) {
      console.warn("[fitness] request rejected", {
        requestId,
        stage: "content-type",
      });
      return json(
        { error: "Request body must be JSON", requestId },
        415,
        requestId,
      );
    }

    const body: unknown = await request.json();
    console.info("[fitness] payload parsed", {
      requestId,
      fields: describePayload(body),
    });

    const parsed = fitnessSchema.safeParse(body);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => ({
        path: issue.path.join(".") || "body",
        code: issue.code,
      }));
      console.warn("[fitness] request rejected", {
        requestId,
        stage: "validation",
        issues,
      });
      return json(
        {
          error: "Invalid workout payload",
          issues,
          requestId,
        },
        400,
        requestId,
      );
    }

    const now = new Date().toISOString();
    const current = await getFitnessData();
    const workout: FitnessWorkout | null = parsed.data.workout
      ? {
          ...parsed.data.workout,
          activeEnergy: parsed.data.workout.activeEnergy ?? null,
          distance: parsed.data.workout.distance ?? null,
          completedAt: now,
          syncedAt: now,
        }
      : current.workout;
    const rings: FitnessRings | null = parsed.data.rings
      ? { ...parsed.data.rings, syncedAt: now }
      : current.rings;
    const fitness = { workout, rings };

    console.info("[fitness] saving activity", {
      requestId,
      updatesWorkout: Boolean(parsed.data.workout),
      updatesRings: Boolean(parsed.data.rings),
    });
    await saveFitnessData(fitness);
    console.info("[fitness] activity saved", { requestId });
    return json({ ok: true, ...fitness, requestId }, 201, requestId);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: "/api/fitness" },
    });
    console.error("[fitness] sync failed", {
      requestId,
      stage: "parse-or-storage",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return json({ error: "Fitness sync failed", requestId }, 503, requestId);
  }
};
