# Wrapped archive setup

The sync routes write durable history to Turso when both `TURSO_DATABASE_URL`
and `TURSO_AUTH_TOKEN` are configured. Without those variables, the existing
Vercel Runtime Cache behavior continues and archive writes are skipped.

## Create and connect the database

1. Add Turso from the Vercel Marketplace to the `bostonrohan.com` project.
2. Make sure the integration exposes `TURSO_DATABASE_URL` and
   `TURSO_AUTH_TOKEN` to the production deployment. Add the same values to the
   local development environment through your local secret manager; do not
   commit them.
3. Open the database SQL console in Turso and run [`schema.sql`](./schema.sql)
   once.
4. Redeploy the Vercel project. Subsequent fitness and AI activity syncs will
   be archived automatically.

The schema stores workouts, one ring snapshot per New York calendar day, daily
AI usage totals, and a general event table for future music, media, and
achievement records. The existing sync tokens continue to protect writes;
public Wrapped pages should use read-only queries.
