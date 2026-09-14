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

The public homepage uses a one-minute CDN cache with a short stale-while-revalidate window. This keeps the live context reasonably fresh without making every visit wait on every upstream service.

- Now-playing data uses Vercel Runtime Cache for two minutes.
- Fitness stores the latest workout and rings for up to one year, but the homepage only presents values synced for the current Eastern date.
- AI activity stores an 84-day history and expires after eight days without a sync. Today’s totals are only shown when the stored date matches the current Eastern date.
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

## Monitoring

Server-side integration, cache, validation, and upstream failures are logged with request or service context. Unexpected operational failures are also reported to Sentry; authentication and ordinary client-validation failures return structured errors without generating exception noise.

## Deployment

The site is deployed to [Vercel](https://vercel.com/). Configure the production environment variables above before deploying, then verify the fitness and AI sync clients against the production endpoints.
