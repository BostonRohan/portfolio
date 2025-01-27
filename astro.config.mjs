import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://bostonrohan.com",
  integrations: [sitemap(), mdx(), icon(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
});