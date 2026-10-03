import { readFile } from "node:fs/promises";

import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  if (process.env.VERCEL) {
    throw new Error("Turso credentials are required for a Vercel build");
  }
  console.info("[turso] skipping local migration without credentials");
} else {
  const sql = await readFile(new URL("./schema.sql", import.meta.url), "utf8");
  const statements = sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  const client = createClient({ url, authToken });
  try {
    await client.batch(statements, "write");
    console.info(`[turso] applied ${statements.length} schema statements`);
  } finally {
    client.close();
  }
}
