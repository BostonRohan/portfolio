import { defineConfig } from "drizzle-kit";

// Schema generation is offline. Migration credentials are supplied by the caller.
export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});
