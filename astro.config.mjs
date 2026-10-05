import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

import react from "@astrojs/react";

import sentry from "@sentry/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://bostonrohan.com",
  output: "server",
  adapter: vercel({
    imageService: true,
  }),
  integrations: [
    sentry({
      dsn: import.meta.env.SENTRY_DSN,
      sourceMapsUploadOptions: {
        project: "portfolio",
        authToken: import.meta.env.SENTRY_AUTH_TOKEN,
      },
    }),
    sitemap(),
    icon(),
    react(),
  ],
  vite: {
    ssr: {
      // Bundle Drizzle to avoid loading its module graph on the first SSR request.
      noExternal: ["drizzle-orm"],
    },
    plugins: [tailwindcss()],
  },
});
