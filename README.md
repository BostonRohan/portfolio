# bostonrohan.com

[bostonrohan.com](https://bostonrohan.com/) is my personal website: a living index of what I am making, watching, listening to, and paying attention to.

The homepage combines personal writing and experience with live data from Last.fm, AniList, Letterboxd, Discord, Open-Meteo, Apple Fitness, Codex, and Claude.

## Stack

- Astro 5 with server-side rendering
- React 18, Svelte 5, and Tailwind CSS 4
- Vercel hosting and Runtime Cache
- Sentry error monitoring
- Zod validation for authenticated sync endpoints

Node.js 24 and pnpm 11 are expected.

## Local development

```bash
pnpm install
pnpm dev
```

Create a local environment file with the integrations you want to enable. Missing integrations degrade to an unavailable or empty state rather than preventing the homepage from rendering.

| Variable                 | Purpose                                                      |
| ------------------------ | ------------------------------------------------------------ |
| `LASTFM_API_KEY`         | Last.fm listening and album data                             |
| `LASTFM_USERNAME`        | Last.fm profile; falls back to the configured public profile |
| `ANILIST_USERNAME`       | AniList activity; falls back to `bosston`                    |
| `LETTERBOXD_USERNAME`    | Latest Letterboxd diary entry                                |
| `DISCORD_USER_ID`        | Discord presence through Lanyard                             |
| `FITNESS_SYNC_TOKEN`     | Bearer token for `/api/fitness`                              |
| `AI_ACTIVITY_SYNC_TOKEN` | Bearer token for `/api/ai-activity`                          |
| `SENTRY_DSN`             | Sentry event destination                                     |
| `SENTRY_AUTH_TOKEN`      | Production source-map uploads                                |

Do not commit environment files or tokens.

## Commands

```bash
pnpm dev       # start the local development server
pnpm build     # create a production build
pnpm preview   # preview the production build
pnpm astro     # run the Astro CLI
```

## Live data and caching

The public homepage uses a five-minute CDN cache with a two-minute stale-while-revalidate window. Status and now-playing load separately, refresh every 60 seconds while the page is visible, and use 15-second CDN caches. Failed live-data requests are not cached.

- Fitness stores the latest workout and rings for up to one year, but the homepage only presents values synced for the current Eastern date.
- AI activity keeps today's totals and a recent history snapshot in Runtime Cache for eight days. The 12-week grid reads daily rows from Turso and uses cached dates as a fallback. Today's totals are only shown when the stored date matches the current Eastern date.
- Proxied AniList, Letterboxd, and Last.fm images use longer public cache headers.
- Authenticated sync responses and the fitness and AI activity data APIs use `no-store`.

Runtime Cache falls back to process memory during local development.

## Fitness sync

`POST /api/fitness` accepts a workout, activity rings, or both. Requests require `Authorization: Bearer <FITNESS_SYNC_TOKEN>` and a JSON body.

Workout updates may include the actual completion time as an ISO 8601 timestamp
with an offset. When it is omitted, the endpoint uses the server receipt time:

```json
{
  "workout": {
    "workoutType": "Outdoor Run",
    "duration": 31,
    "activeEnergy": 284,
    "distance": "3.1 mi",
    "completedAt": "2026-09-13T18:42:00-04:00"
  },
  "rings": {
    "move": 72,
    "exercise": 64,
    "stand": 83
  }
}
```

Ring values may be percentages or decimal progress values between `0` and `1`. The endpoint records a separate server-generated sync time.
The server accepts rings even when the accompanying workout is empty, malformed,
or more than 15 hours old. It saves a valid workout only when its completion
time is within the past 15 hours and is no older than the saved workout for
the homepage cache. Turso archives every valid, nonfuture workout, including
delayed uploads and workouts received out of order. Both fitness and AI syncs
write to Turso before updating Runtime Cache, so cache failures cannot prevent
the archive write.
The response includes `workoutStatus` (`saved`, `absent`, `invalid`, `stale`,
`future`, or `older`) so ignored workout uploads can be diagnosed without
rejecting valid rings. Invalid workout or ring fields are reported to Sentry.

## AI activity sync

[`scripts/sync-ai-activity.mjs`](scripts/sync-ai-activity.mjs) reads local Codex and Claude session logs, aggregates only daily session and tool-call counts, and sends an 84-day history to `POST /api/ai-activity`.

On macOS, store the value matching `AI_ACTIVITY_SYNC_TOKEN` in Keychain with:

- service: `portfolio-ai-activity`
- account: your macOS username

Then run:

```bash
node scripts/sync-ai-activity.mjs --dry-run
node scripts/sync-ai-activity.mjs
```

Set `AI_ACTIVITY_URL` to target a non-production endpoint. The script defaults to `https://bostonrohan.com/api/ai-activity`.

On this Mac, a LaunchAgent defined in
[`scripts/launchd/com.bostonrohan.portfolio-ai-activity.plist`](scripts/launchd/com.bostonrohan.portfolio-ai-activity.plist)
runs the sync at 8:00 AM local time and when the user logs in. It also syncs
hourly while the Mac is on, so activity later in the day is uploaded.
A separate
LaunchAgent, defined in
[`scripts/launchd/com.bostonrohan.portfolio-ai-activity-watchdog.plist`](scripts/launchd/com.bostonrohan.portfolio-ai-activity-watchdog.plist),
checks at 10:00 AM local time that a successful sync was recorded for the current Eastern
date. The sync records success only after the API returns a successful response.
The sync and watchdog show a macOS notification on failure; their logs are in
`~/Library/Logs/portfolio-ai-activity*.log`.
Failures detected while the Mac is running are queued locally in
`~/Library/Application Support/portfolio-ai-activity/failures/` and sent to the
authenticated `POST /api/ai-activity-failure` route. That route records a
Sentry error without including session logs or credentials. Queued reports are
retried after the next successful upload. A powered-off Mac produces no failure
report.
In Sentry, route issues tagged `endpoint:/api/ai-activity-failure` to the
desired notification destination. Server events alone do not send an alert
without a matching Sentry alert rule.

## Monitoring

Server-side integration, cache, validation, and upstream failures are logged with request or service context. Unexpected operational failures and rejected authenticated sync requests are reported to Sentry. Sync responses include request IDs for correlating client failures with server events.

## Deployment

The site is deployed to [Vercel](https://vercel.com/). Configure the production environment variables above before deploying, then verify the fitness and AI sync clients against the production endpoints.

## Automated tests

Run `pnpm test` for the full sync suite, or `pnpm test:watch` while editing.
Tests cover payload validation, authentication, workout freshness and archive
eligibility, database-before-cache ordering, failure responses, and Eastern
calendar dates. Archive integration tests execute real Drizzle queries against
in-memory SQLite, including idempotent upserts, batch rollback, history reads,
and migration adoption of the legacy schema.

Vitest uses a separate config with environment-file loading disabled. All
fixtures are synthetic; routes mock cache, database calls, and Sentry, while
archive tests use isolated local databases. No production credentials or
network services are needed. These tests do not exercise macOS launchd,
Health shortcuts, or live Vercel/Turso connectivity.

GitHub Actions runs the suite on every pull request and push to `main`, with
manual runs also available. The workflow uses Node 24, the pinned pnpm version,
and a frozen lockfile. The `Sync tests` check is required by `main` branch protection,
including an up-to-date branch before merging.
