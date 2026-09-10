import type { APIRoute } from "astro";
import * as Sentry from "@sentry/astro";

const ALLOWED_IMAGE_HOSTS = new Set([
  "a.ltrbxd.com",
  "lastfm-img.freetls.fastly.net",
  "lastfm.freetls.fastly.net",
]);

function isAllowedImageHost(hostname: string): boolean {
  return (
    ALLOWED_IMAGE_HOSTS.has(hostname) ||
    hostname.endsWith(".anilist.co") ||
    hostname.endsWith(".lastfmusercontent.com")
  );
}

export const GET: APIRoute = async ({ url }) => {
  const source = url.searchParams.get("url");

  try {
    if (!source) {
      return new Response("Missing image URL", { status: 400 });
    }

    const imageUrl = new URL(source);
    if (
      imageUrl.protocol !== "https:" ||
      !isAllowedImageHost(imageUrl.hostname)
    ) {
      return new Response("Image host is not allowed", { status: 403 });
    }

    const response = await fetch(imageUrl, {
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
      headers: { "User-Agent": "bostonrohan.com media proxy" },
    });
    const contentType = response.headers.get("Content-Type") || "";

    if (!response.ok || !contentType.startsWith("image/") || !response.body) {
      return new Response("Image could not be loaded", { status: 502 });
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: "/api/media-image" },
    });
    return new Response("Image proxy request failed", { status: 502 });
  }
};
