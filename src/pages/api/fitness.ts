import type { APIRoute } from "astro";
import * as Sentry from "@sentry/astro";

import { applyFitnessSync, parseFitnessSync } from "../../utils/fitnessSync.ts";
import { getFitnessData, saveFitnessData } from "../../utils/fitness.ts";
import { archiveFitnessActivity } from "../../utils/wrappedArchive.ts";
import {
  isAuthorized,
  jsonResponse,
  reportRejectedSync,
  reportSyncConfigurationError,
} from "../../utils/syncApi.ts";

const ENDPOINT = "/api/fitness";

export const GET: APIRoute = async () => jsonResponse(await getFitnessData());

export const POST: APIRoute = async ({ request }) => {
  const requestId = crypto.randomUUID();
  const expectedToken = import.meta.env.FITNESS_SYNC_TOKEN;

  console.info("[fitness] sync received", {
    requestId,
    hasAuthorization: request.headers.has("Authorization"),
    hasConfiguredToken: Boolean(expectedToken),
  });

  if (!expectedToken) reportSyncConfigurationError(ENDPOINT, requestId);
  if (!isAuthorized(request, expectedToken)) {
    if (request.headers.has("Authorization")) {
      reportRejectedSync(ENDPOINT, requestId, "authorization");
    }
    return jsonResponse({ error: "Unauthorized", requestId }, 401, requestId);
  }

  if (!request.headers.get("Content-Type")?.includes("application/json")) {
    reportRejectedSync(ENDPOINT, requestId, "content-type");
    return jsonResponse(
      { error: "Request body must be JSON", requestId },
      415,
      requestId,
    );
  }

  try {
    const parsed = parseFitnessSync(await request.json());
    if (!parsed.success) {
      reportRejectedSync(ENDPOINT, requestId, "validation", parsed.issues);
      return jsonResponse(
        {
          error:
            parsed.reason === "invalid-payload"
              ? "Invalid fitness payload"
              : "A valid workout or rings update is required",
          issues: parsed.issues,
          requestId,
        },
        400,
        requestId,
      );
    }

    for (const ignored of parsed.data.ignoredUpdates) {
      Sentry.captureMessage(`Fitness ${ignored.field} update ignored`, {
        level: "warning",
        tags: { endpoint: ENDPOINT, stage: `${ignored.field}-validation` },
        extra: { requestId, issues: ignored.issues },
      });
    }

    const now = new Date().toISOString();
    const current = await getFitnessData();
    const update = applyFitnessSync(current, parsed.data, now);

    const ringsDay = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(now));
    await archiveFitnessActivity({
      workout: update.updatedWorkout ? update.incomingWorkout : null,
      rings: update.updatedRings ? update.data.rings : null,
      ringsDay,
    });
    await saveFitnessData(update.data);

    console.info("[fitness] sync saved", {
      requestId,
      updatedWorkout: update.updatedWorkout,
      updatedRings: update.updatedRings,
      workoutStatus: update.workoutStatus,
    });
    return jsonResponse(
      {
        ok: true,
        updatedWorkout: update.updatedWorkout,
        workoutStatus: update.workoutStatus,
        ...update.data,
        requestId,
      },
      201,
      requestId,
    );
  } catch (error) {
    Sentry.captureException(error, { tags: { endpoint: ENDPOINT } });
    console.error("[fitness] sync failed", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse(
      { error: "Fitness sync failed", requestId },
      503,
      requestId,
    );
  }
};
