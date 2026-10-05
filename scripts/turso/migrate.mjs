import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

// Credentials must be injected by the deployment or caller; no env files are read.
const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  if (process.env.VERCEL) {
    throw new Error("Turso credentials are required for a Vercel build");
  }
  console.info("[turso] skipping local migration without credentials");
}
if (url && authToken) {
  const client = createClient({ url, authToken });
  try {
    await migrate(drizzle(client), {
      migrationsFolder: fileURLToPath(
        new URL("../../drizzle/", import.meta.url),
      ),
    });
    console.info("[turso] Drizzle migrations applied");
  } finally {
    client.close();
  }
}
