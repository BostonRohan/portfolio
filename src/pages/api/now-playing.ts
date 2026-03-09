import type { APIRoute } from "astro";
import { musicProfile } from "../../data/music.js";
import { fetchLastfmNowPlaying } from "../../utils/lastfm.js";

const NOW_PLAYING_TTL_MS = 5 * 60 * 1000;

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

  const data = await fetchLastfmNowPlaying({
    apiKey: import.meta.env.LASTFM_API_KEY,
    username: import.meta.env.LASTFM_USERNAME || musicProfile.lastfmUsername,
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
