# Wrapped archive setup

The `portfolio-wrapped` Turso Starter resource is connected to Vercel's
`portfolio` project in `iad1` for production, preview, and development.

The sync routes write durable history to Turso. Vercel builds and production
syncs require both `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. Local builds
without those variables skip the migration and can use the existing cache.

## Create and connect the database

1. Add Turso from the Vercel Marketplace to the `bostonrohan.com` project.
2. Make sure the integration exposes `TURSO_DATABASE_URL` and
   `TURSO_AUTH_TOKEN` to the production deployment. Add the same values to the
   local development environment through your local secret manager; do not
   commit them.
3. Deploy the site. The build runs [`migrate.mjs`](./migrate.mjs), which applies
   [`schema.sql`](./schema.sql) before the new routes receive traffic. Run
   `pnpm run db:migrate` when applying the schema independently of a build.

The schema stores workouts, one ring snapshot per New York calendar day, daily
AI usage totals, and dated Letterboxd diary entries in the general event table.
The homepage reads its 12-week AI grid from the archived daily rows and uses
the cache to fill dates not yet archived or when Turso is unavailable. The
first AI sync preserves any older days still present in the cache snapshot.
Later syncs compare historical totals with archived rows and only write changed
days; the current day is refreshed on each sync. Both fitness and AI syncs
archive before updating the cache, so a database failure returns an error
without presenting a cache-only update as durable.
The existing sync tokens continue to protect fitness and AI writes. The
Letterboxd sync runs once daily at 08:00 UTC through Vercel Cron. Its route
requires a production `CRON_SECRET`; Vercel sends that value in the
Authorization header. The sync checks every dated diary entry in the current
RSS feed and only updates stored rows when their content changes. It does not recover
entries that have already left the feed. Backfill those from one Letterboxd
account export before relying on 2026 totals. Public Wrapped pages should use
read-only queries.
