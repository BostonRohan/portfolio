import type { APIRoute } from "astro";
import * as Sentry from "@sentry/astro";
import { getCache } from "@vercel/functions";
import { musicProfile } from "../../data/music.js";
import { fetchLastfmNowPlaying } from "../../utils/lastfm.js";

const NOW_PLAYING_CACHE_KEY = "current-track";
const NOW_PLAYING_TTL_SECONDS = 2 * 60;

interface NowPlayingPayload {
  track: Awaited<ReturnType<typeof fetchLastfmNowPlaying>>["track"];
  profileUrl: string;
}

export const GET: APIRoute = async () => {
  try {
    const cache = getCache({ namespace: "portfolio-now-playing" });

    try {
      const cached = (await cache.get(
        NOW_PLAYING_CACHE_KEY,
      )) as NowPlayingPayload | null;
      if (cached) {
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: "runtime-cache", operation: "get-now-playing" },
      });
    }

    const hasToken = Boolean(import.meta.env.LASTFM_API_KEY);
    if (!hasToken) {
      console.warn("/api/now-playing called without LASTFM_API_KEY");
    }

    const data = await fetchLastfmNowPlaying({
      apiKey: import.meta.env.LASTFM_API_KEY,
      username: import.meta.env.LASTFM_USERNAME || musicProfile.lastfmUsername,
    });

    if (data.error) {
      Sentry.captureMessage(`Last.fm now-playing error: ${data.error}`, {
        level: "warning",
        tags: { service: "lastfm" },
      });
    }

    console.log("/api/now-playing result", {
      hasToken,
      nowPlaying: Boolean(data.track),
      track: data.track
        ? { name: data.track.name, artist: data.track.artist }
        : null,
    });

    const payload: NowPlayingPayload = {
      track: data.track,
      profileUrl: data.profileUrl,
    };

    try {
      await cache.set(NOW_PLAYING_CACHE_KEY, payload, {
        name: "Current Last.fm track",
        tags: ["now-playing"],
        ttl: NOW_PLAYING_TTL_SECONDS,
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: { service: "runtime-cache", operation: "set-now-playing" },
      });
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: "/api/now-playing" },
    });
    console.error("/api/now-playing error", error);
    return new Response(
      JSON.stringify({
        track: null,
        profileUrl: musicProfile.lastfmUrl,
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
