# Wrapped archive setup

The `portfolio-wrapped` Turso Starter resource is connected to Vercel's
`portfolio` project in `iad1` for production, preview, and development.

The sync routes write durable history to Turso when both `TURSO_DATABASE_URL`
and `TURSO_AUTH_TOKEN` are configured. Without those variables, the existing
Vercel Runtime Cache behavior continues and archive writes are skipped.

## Create and connect the database

1. Add Turso from the Vercel Marketplace to the `bostonrohan.com` project.
2. Make sure the integration exposes `TURSO_DATABASE_URL` and
   `TURSO_AUTH_TOKEN` to the production deployment. Add the same values to the
   local development environment through your local secret manager; do not
   commit them.
3. Deploy the site. The first fitness, AI activity, or Letterboxd sync creates the tables
   and indexes automatically, then archives the update. [`schema.sql`](./schema.sql)
   documents the same schema for manual inspection or recovery.

The schema stores workouts, one ring snapshot per New York calendar day, daily
AI usage totals, and dated Letterboxd diary entries in the general event table.
The homepage reads its 12-week AI grid from the archived daily rows and uses
the cache to fill dates not yet archived or when Turso is unavailable. The
first AI sync preserves any older days still present in the cache snapshot.
The existing sync tokens continue to protect fitness and AI writes. The
Letterboxd sync runs once daily at 08:00 UTC through Vercel Cron. Its route
requires a production `CRON_SECRET`; Vercel sends that value in the
Authorization header. The sync upserts every dated diary entry in the current
RSS feed, including changes to a rating or watch date. It does not recover
entries that have already left the feed. Backfill those from one Letterboxd
account export before relying on 2026 totals. Public Wrapped pages should use
read-only queries.
