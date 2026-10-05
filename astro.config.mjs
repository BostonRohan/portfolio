import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

import react from "@astrojs/react";

import sentry from "@sentry/astro";
import { fileURLToPath } from "node:url";

const isStartupExperiment =
  process.env.VERCEL_ENV === "preview" &&
  process.env.VERCEL_GIT_COMMIT_REF === "codex/homepage-startup-investigation";

// https://astro.build/config
export default defineConfig({
  site: "https://bostonrohan.com",
  output: "server",
  adapter: vercel({
    imageService: true,
  }),
  integrations: [
    ...(!isStartupExperiment
      ? [
          sentry({
            dsn: import.meta.env.SENTRY_DSN,
            sourceMapsUploadOptions: {
              project: "portfolio",
              authToken: import.meta.env.SENTRY_AUTH_TOKEN,
            },
          }),
        ]
      : []),
    sitemap(),
    icon(),
    react(),
  ],
  vite: {
    ssr: {
      noExternal: isStartupExperiment ? ["drizzle-orm"] : [],
    },
    resolve: {
      alias: isStartupExperiment
        ? [
            {
              find: "@sentry/astro",
              replacement: fileURLToPath(
                new URL(
                  "./scripts/diagnostics/sentryDisabled.mjs",
                  import.meta.url,
                ),
              ),
            },
          ]
        : [],
    },
    plugins: [tailwindcss()],
  },
});
