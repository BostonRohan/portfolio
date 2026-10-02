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
  completedAt: z.string().datetime({ offset: true }).optional(),
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

const fitnessSchema = z.object({
  workout: z.unknown().optional(),
  rings: z.unknown().optional(),
});
const MAX_WORKOUT_AGE_MS = 15 * 60 * 60 * 1000;

type WorkoutStatus =
  | "absent"
  | "saved"
  | "invalid"
  | "stale"
  | "future"
  | "older";

function isEmptyWorkout(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((field) => field == null || field === "");
}

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
  const hasConfiguredToken = Boolean(import.meta.env.FITNESS_SYNC_TOKEN);

  console.info("[fitness] request received", {
    requestId,
    contentType: contentType || "missing",
    hasAuthorization: Boolean(authorization),
    hasBearerScheme: authorization?.startsWith("Bearer ") ?? false,
    hasConfiguredToken,
  });

  if (!hasConfiguredToken) {
    Sentry.captureMessage("Fitness sync token is not configured", {
      level: "error",
      tags: { endpoint: "/api/fitness", stage: "configuration" },
      extra: { requestId },
    });
  }

  if (!isAuthorized(request)) {
    console.warn("[fitness] request rejected", {
      requestId,
      stage: "authorization",
    });
    if (authorization) {
      Sentry.captureMessage("Fitness sync request rejected", {
        level: "warning",
        tags: { endpoint: "/api/fitness", stage: "authorization" },
        extra: { requestId },
      });
    }
    return json({ error: "Unauthorized", requestId }, 401, requestId);
  }

  try {
    if (!contentType.includes("application/json")) {
      console.warn("[fitness] request rejected", {
        requestId,
        stage: "content-type",
      });
      Sentry.captureMessage("Fitness sync request rejected", {
        level: "warning",
        tags: { endpoint: "/api/fitness", stage: "content-type" },
        extra: { requestId },
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
      Sentry.captureMessage("Fitness sync request rejected", {
        level: "warning",
        tags: { endpoint: "/api/fitness", stage: "validation" },
        extra: { requestId, issues },
      });
      return json(
        {
          error: "Invalid fitness payload",
          issues,
          requestId,
        },
        400,
        requestId,
      );
    }

    const ringsResult =
      parsed.data.rings === undefined
        ? null
        : ringsSchema.safeParse(parsed.data.rings);
    const hasValidRings = Boolean(ringsResult?.success);
    const hasWorkout = !isEmptyWorkout(parsed.data.workout);
    const workoutResult = hasWorkout
      ? workoutSchema.safeParse(parsed.data.workout)
      : null;
    const hasValidWorkout = Boolean(workoutResult?.success);

    if (!hasValidRings && !hasValidWorkout) {
      const issues = [
        ...(ringsResult && !ringsResult.success
          ? ringsResult.error.issues.map((issue) => ({
              path: ["rings", ...issue.path].join("."),
              code: issue.code,
            }))
          : []),
        ...(workoutResult && !workoutResult.success
          ? workoutResult.error.issues.map((issue) => ({
              path: ["workout", ...issue.path].join("."),
              code: issue.code,
            }))
          : []),
      ];
      Sentry.captureMessage("Fitness sync request rejected", {
        level: "warning",
        tags: { endpoint: "/api/fitness", stage: "validation" },
        extra: { requestId, issues },
      });
      return json(
        {
          error: "A valid workout or rings update is required",
          issues,
          requestId,
        },
        400,
        requestId,
      );
    }

    if (hasWorkout && !hasValidWorkout && hasValidRings) {
      Sentry.captureMessage("Fitness workout ignored", {
        level: "warning",
        tags: { endpoint: "/api/fitness", stage: "workout-validation" },
        extra: {
          requestId,
          issues:
            workoutResult && !workoutResult.success
              ? workoutResult.error.issues.map((issue) => ({
                  path: issue.path.join("."),
                  code: issue.code,
                }))
              : [],
        },
      });
    }
    if (ringsResult && !ringsResult.success && hasValidWorkout) {
      Sentry.captureMessage("Fitness rings ignored", {
        level: "warning",
        tags: { endpoint: "/api/fitness", stage: "rings-validation" },
        extra: {
          requestId,
          issues: ringsResult.error.issues.map((issue) => ({
            path: issue.path.join("."),
            code: issue.code,
          })),
        },
      });
    }

    const now = new Date().toISOString();
    const current = await getFitnessData();
    const incomingWorkout: FitnessWorkout | null = workoutResult?.success
      ? {
          ...workoutResult.data,
          activeEnergy: workoutResult.data.activeEnergy ?? null,
          distance: workoutResult.data.distance ?? null,
          completedAt: workoutResult.data.completedAt ?? now,
          syncedAt: now,
        }
      : null;
    const recordedWorkoutTime = current.workout?.completedAt
      ? Date.parse(current.workout.completedAt)
      : Number.NEGATIVE_INFINITY;
    const currentWorkoutTime = Number.isNaN(recordedWorkoutTime)
      ? Number.NEGATIVE_INFINITY
      : recordedWorkoutTime;
    let workoutStatus: WorkoutStatus = hasWorkout ? "invalid" : "absent";
    if (incomingWorkout) {
      const workoutAge = Date.now() - Date.parse(incomingWorkout.completedAt);
      if (workoutAge < 0) workoutStatus = "future";
      else if (workoutAge > MAX_WORKOUT_AGE_MS) workoutStatus = "stale";
      else if (Date.parse(incomingWorkout.completedAt) < currentWorkoutTime) {
        workoutStatus = "older";
      } else workoutStatus = "saved";
    }
    const shouldSaveWorkout = workoutStatus === "saved";
    const workout: FitnessWorkout | null = shouldSaveWorkout
      ? incomingWorkout
      : current.workout;
    const rings: FitnessRings | null = ringsResult?.success
      ? { ...ringsResult.data, syncedAt: now }
      : current.rings;
    const fitness = { workout, rings };

    console.info("[fitness] saving activity", {
      requestId,
      updatesWorkout: shouldSaveWorkout,
      updatesRings: hasValidRings,
      workoutStatus,
    });
    await saveFitnessData(fitness);
    console.info("[fitness] activity saved", { requestId });
    return json(
      {
        ok: true,
        updatedWorkout: shouldSaveWorkout,
        workoutStatus,
        ...fitness,
        requestId,
      },
      201,
      requestId,
    );
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
