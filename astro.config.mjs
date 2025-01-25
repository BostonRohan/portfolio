import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

import svelte from "@astrojs/svelte";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://bostonrohan.com",
  integrations: [sitemap(), mdx(), svelte(), icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});