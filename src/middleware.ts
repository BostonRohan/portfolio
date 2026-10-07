import { defineMiddleware } from "astro:middleware";

const CACHEABLE_HOMEPAGE_ISLANDS = new Set([
  "HomepageAiActivity",
  "HomepageFitness",
  "HomepageMusic",
  "HomepageWatching",
  "HomepageWeather",
]);

export const onRequest = defineMiddleware(async (context, next) => {
  const islandName = context.url.pathname.match(
    /^\/_server-islands\/([^/]+)$/,
  )?.[1];
  if (!islandName || !CACHEABLE_HOMEPAGE_ISLANDS.has(islandName)) {
    return next();
  }

  const response = await next();
  // Astro streams island components after creating the Response. Finish rendering
  // before reading the cache result recorded by the component's frontmatter.
  const body = await response.text();
  const { ttlSeconds, isAvailable } = context.locals.serverIslandCache ?? {
    ttlSeconds: 0,
    isAvailable: false,
  };
  const headers = new Headers(response.headers);
  headers.set(
    "Cache-Control",
    response.ok && isAvailable
      ? `public, max-age=0, s-maxage=${ttlSeconds}`
      : "no-store",
  );
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
