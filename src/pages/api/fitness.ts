import { timingSafeEqual } from "node:crypto";

import type { APIRoute } from "astro";
import * as Sentry from "@sentry/astro";
import { z } from "zod";

import {
  getLatestFitnessWorkout,
  saveLatestFitnessWorkout,
  type FitnessWorkout,
} from "../../utils/fitness.ts";

const metricSchema = z
  .union([z.string().trim().min(1).max(80), z.number().finite()])
  .transform((value) => String(value));

const workoutSchema = z.object({
  workoutType: z.string().trim().min(1).max(80),
  duration: metricSchema,
  activeEnergy: metricSchema.optional().nullable(),
  distance: metricSchema.optional().nullable(),
  completedAt: z.iso.datetime({ offset: true }).optional(),
});

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
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
  const workout = await getLatestFitnessWorkout();
  return json({ workout });
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const contentType = request.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      return json({ error: "Request body must be JSON" }, 415);
    }

    const parsed = workoutSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json(
        {
          error: "Invalid workout payload",
          fields: parsed.error.issues.map((issue) => issue.path.join(".")),
        },
        400,
      );
    }

    const now = new Date().toISOString();
    const workout: FitnessWorkout = {
      workoutType: parsed.data.workoutType,
      duration: parsed.data.duration,
      activeEnergy: parsed.data.activeEnergy ?? null,
      distance: parsed.data.distance ?? null,
      completedAt: parsed.data.completedAt ?? now,
      syncedAt: now,
    };

    await saveLatestFitnessWorkout(workout);
    return json({ ok: true, workout }, 201);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: "/api/fitness" },
    });
    console.error("[fitness] sync failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return json({ error: "Fitness sync failed" }, 503);
  }
};
