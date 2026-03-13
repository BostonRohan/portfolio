import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

import react from "@astrojs/react";

import sentry from "@sentry/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://bostonrohan.com",
  output: "server",
  adapter: vercel(),
  integrations: [
    sentry({
      dsn: import.meta.env.SENTRY_DSN,
      sourceMapsUploadOptions: {
        project: "portfolio",
        authToken: import.meta.env.SENTRY_AUTH_TOKEN,
      },
    }),
    sitemap(),
    mdx(),
    icon(),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
