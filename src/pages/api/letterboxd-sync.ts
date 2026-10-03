import type { APIRoute } from "astro";
import * as Sentry from "@sentry/astro";

import { fetchLetterboxdDiary } from "../../utils/letterboxd.js";
import { archiveLetterboxdDiary } from "../../utils/wrappedArchive.ts";
import { jsonResponse } from "../../utils/syncApi.ts";

export const GET: APIRoute = async ({ request }) => {
  const secret = import.meta.env.CRON_SECRET;
  if (!secret || request.headers.get("Authorization") !== `Bearer ${secret}`) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const username = import.meta.env.LETTERBOXD_USERNAME;
  if (!username)
    return jsonResponse({ error: "Letterboxd is not configured" }, 503);

  try {
    const diary = await fetchLetterboxdDiary({ username });
    if (diary.error) throw new Error(diary.error);
    const archived = await archiveLetterboxdDiary(diary.entries);
    return jsonResponse({ ok: true, archived });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: "/api/letterboxd-sync" },
    });
    console.error("[letterboxd-sync] failed", error);
    return jsonResponse({ error: "Letterboxd sync failed" }, 503);
  }
};
