import * as Sentry from "@sentry/astro";

const LANYARD_API_BASE = "https://api.lanyard.rest/v1/users";

const STATUS_LABELS = {
  online: "online",
  idle: "away",
  dnd: "do not disturb",
  offline: "offline",
};

/**
 * @param {{ userId?: string }} [options]
 */
export async function fetchDiscordPresence({ userId } = {}) {
  const emptyPresence = {
    status: "unknown",
    statusText: "unavailable",
    error: null,
  };

  const normalizedUserId = typeof userId === "string" ? userId.trim() : "";
  const requestContext = {
    hasUserId: Boolean(normalizedUserId),
    userIdLength: normalizedUserId.length,
    userIdSuffix: normalizedUserId ? normalizedUserId.slice(-4) : null,
  };

  console.info("[discord-presence] preparing request", requestContext);

  if (!normalizedUserId) {
    console.warn("[discord-presence] DISCORD_USER_ID was not provided");
    return { ...emptyPresence, error: "Missing Discord user ID" };
  }

  if (!/^\d{17,20}$/.test(normalizedUserId)) {
    console.warn("[discord-presence] DISCORD_USER_ID has an invalid format", {
      ...requestContext,
      expected: "17–20 digits",
    });
    return { ...emptyPresence, error: "Invalid Discord user ID" };
  }

  try {
    const response = await fetch(`${LANYARD_API_BASE}/${normalizedUserId}`, {
      signal: AbortSignal.timeout(4_000),
    });

    console.info("[discord-presence] Lanyard responded", {
      ...requestContext,
      httpStatus: response.status,
      isHttpOk: response.ok,
    });

    if (!response.ok) {
      throw new Error(`Discord presence request failed (${response.status})`);
    }

    const payload = await response.json();
    console.info("[discord-presence] parsed response", {
      ...requestContext,
      success: payload?.success === true,
      hasData: Boolean(payload?.data),
      discordStatus: payload?.data?.discord_status || null,
      activityCount: Array.isArray(payload?.data?.activities)
        ? payload.data.activities.length
        : 0,
    });

    if (!payload?.success || !payload?.data) {
      throw new Error("Discord presence response was invalid");
    }

    const status = payload.data.discord_status || "offline";
    const customStatus = Array.isArray(payload.data.activities)
      ? payload.data.activities.find(
          (activity) => activity?.type === 4 && activity?.state,
        )?.state
      : "";

    return {
      status,
      statusText: customStatus || STATUS_LABELS[status] || "offline",
      error: null,
    };
  } catch (error) {
    console.error("[discord-presence] request failed", {
      ...requestContext,
      error: error instanceof Error ? error.message : String(error),
    });
    Sentry.captureException(error, {
      tags: { service: "discord", method: "fetchDiscordPresence" },
      extra: requestContext,
    });

    return {
      ...emptyPresence,
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch Discord presence",
    };
  }
}
