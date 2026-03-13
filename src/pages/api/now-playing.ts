import type { APIRoute } from "astro";
import { musicProfile } from "../../data/music.js";
import { fetchLastfmNowPlaying } from "../../utils/lastfm.js";

const NOW_PLAYING_TTL_MS = 2 * 60 * 1000;

let nowPlayingCache:
  | {
      expiresAt: number;
      payload: {
        track: Awaited<ReturnType<typeof fetchLastfmNowPlaying>>["track"];
        profileUrl: string;
      };
    }
  | null = null;

export const GET: APIRoute = async () => {
  if (nowPlayingCache && nowPlayingCache.expiresAt > Date.now()) {
    return new Response(JSON.stringify(nowPlayingCache.payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
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
  console.log("/api/now-playing result", {
    hasToken,
    nowPlaying: Boolean(data.track),
    track: data.track ? { name: data.track.name, artist: data.track.artist } : null,
  });

  const payload = {
    track: data.track,
    profileUrl: data.profileUrl,
  };

  nowPlayingCache = {
    expiresAt: Date.now() + NOW_PLAYING_TTL_MS,
    payload,
  };

  return new Response(
    JSON.stringify(payload),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};
