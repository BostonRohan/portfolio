import type { APIRoute } from "astro";

import { fetchDiscordPresence } from "../../utils/discord.js";

export const GET: APIRoute = async () => {
  const data = await fetchDiscordPresence({
    userId: import.meta.env.DISCORD_USER_ID,
  });

  return new Response(
    JSON.stringify({ status: data.status, statusText: data.statusText }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": data.error
          ? "no-store"
          : "public, max-age=0, s-maxage=15",
      },
    },
  );
};
