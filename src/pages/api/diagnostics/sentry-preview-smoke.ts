import type { APIRoute } from "astro";
import * as Sentry from "@sentry/astro";

export const POST: APIRoute = async () => {
  if (
    process.env.VERCEL_ENV !== "preview" ||
    process.env.VERCEL_GIT_COMMIT_REF !== "codex/sentry-startup-profiling"
  ) {
    return new Response(null, { status: 404 });
  }

  const eventId = Sentry.captureMessage(
    "Codex preview Sentry bundling smoke test",
    {
      level: "error",
      tags: {
        verification: "codex-sentry-bundling",
        deployment: "codex/sentry-startup-profiling",
      },
    },
  );
  const flushed = await Sentry.flush(2000);

  return Response.json(
    { ok: flushed, eventId },
    { status: flushed ? 200 : 503 },
  );
};
