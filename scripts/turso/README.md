# Wrapped archive and migrations

Archive queries use Drizzle over the existing `@libsql/client` connection.
`src/db/schema.ts` defines the four Wrapped tables with their existing SQL names.
The routes archive activity before updating the display cache. Historical AI
updates preserve any provider/tool breakdown already stored for that day.

## Database setup

Supply `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` through the Turso Vercel
integration or your shell's secret manager. No command here loads env files.

The build runs `pnpm db:migrate` with Turso credentials injected on Vercel.
For a manual run, use `pnpm db:migrate` with credentials injected before
deploying code that needs a schema change. This applies checked-in migrations and records
successful migrations in `__drizzle_migrations`; it does not run on requests.
The initial migration uses `IF NOT EXISTS` to support both a new database and
an existing database created from the legacy `schema.sql`. It assumes existing
tables match that legacy schema; it does not reconcile arbitrary schema drift.
The named events uniqueness index duplicates the legacy inline constraint on
existing databases but allows Drizzle to manage it consistently going forward.

## Schema changes

1. Edit `src/db/schema.ts`.
2. Run `pnpm db:generate` (offline, no database credentials required).
3. Review and commit the generated SQL and snapshots under `drizzle/`.
4. Apply with `pnpm db:migrate` before deploying the dependent application code.

`schema.sql` is retained as the legacy schema reference. Use Drizzle migrations
for new databases and future changes instead of editing that file.

Without Turso credentials, runtime archive calls retain their existing behavior:
writes are skipped and reads fall back to cache. The migration command instead
fails explicitly when credentials are missing.
