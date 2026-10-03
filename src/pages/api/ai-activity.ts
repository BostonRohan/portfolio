import type { APIRoute } from "astro";
import * as Sentry from "@sentry/astro";

import { parseAiActivity } from "../../utils/aiActivitySync.ts";
import {
  getAiActivity,
  saveAiActivity,
  type AiActivityData,
} from "../../utils/aiActivity.ts";
import { archiveAiActivity } from "../../utils/wrappedArchive.ts";
import {
  isAuthorized,
  jsonResponse,
  reportRejectedSync,
  reportSyncConfigurationError,
  toSyncIssues,
} from "../../utils/syncApi.ts";

const ENDPOINT = "/api/ai-activity";

export const GET: APIRoute = async () => jsonResponse(await getAiActivity());

export const POST: APIRoute = async ({ request }) => {
  const requestId = crypto.randomUUID();
  const expectedToken = import.meta.env.AI_ACTIVITY_SYNC_TOKEN;

  console.info("[ai-activity] sync received", {
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

  try {
    const parsed = parseAiActivity(await request.json());
    if (!parsed.success) {
      const issues = toSyncIssues(parsed.error.issues);
      reportRejectedSync(ENDPOINT, requestId, "validation", issues);
      return jsonResponse(
        { error: "Invalid AI activity payload", issues, requestId },
        400,
        requestId,
      );
    }

    const activity: AiActivityData = {
      ...parsed.data,
      syncedAt: new Date().toISOString(),
    };
    // Secure the durable record before updating the display cache.
    await archiveAiActivity(activity);
    await saveAiActivity(activity);

    const totals = {
      sessions:
        activity.providers.codex.sessions + activity.providers.claude.sessions,
      toolCalls:
        activity.providers.codex.toolCalls +
        activity.providers.claude.toolCalls,
    };
    console.info("[ai-activity] sync saved", {
      requestId,
      date: activity.date,
      ...totals,
    });
    return jsonResponse({ ok: true, ...activity, requestId }, 201, requestId);
  } catch (error) {
    Sentry.captureException(error, { tags: { endpoint: ENDPOINT } });
    console.error("[ai-activity] sync failed", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse(
      { error: "AI activity sync failed", requestId },
      503,
      requestId,
    );
  }
};
