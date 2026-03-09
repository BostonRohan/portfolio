import type { APIRoute } from "astro";
import { musicProfile } from "../../data/music.js";
import { fetchLastfmNowPlaying } from "../../utils/lastfm.js";

export const GET: APIRoute = async () => {
  const data = await fetchLastfmNowPlaying({
    apiKey: import.meta.env.LASTFM_API_KEY,
    username: import.meta.env.LASTFM_USERNAME || musicProfile.lastfmUsername,
  });

  return new Response(
    JSON.stringify({
      track: data.track,
      profileUrl: data.profileUrl,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
};
