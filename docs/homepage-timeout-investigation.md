# Homepage timeout investigation

Investigated October 4, 2026 (America/New_York).

## Incident

The homepage request `5lqzr-1791164383320-9ce698812c30` started at
9:39:43 p.m. Eastern and returned 504 after the function's 10-second limit.
It was a CDN cache miss. The deployment was
`dpl_EUx5HeXCbETe5xdsU4Ya4wn2rLnn`, built from GitHub commit
`a303f90dad443d387602dcf643d7287968b32c25`, not the local checkout's HEAD.
That deployed homepage includes the Turso archive query.

Vercel's logs contain only the platform timeout message for that request.
Sentry has no captured trace for the failed request. Successful homepage traces
immediately afterward took 348 and 562 ms. In the 348 ms trace, the two runtime
cache reads took approximately 21 ms each, and the archive query took 8 ms.
The longest recorded cache HTTP span over the preceding 24 hours was 178 ms.
These observations do not exclude an isolated cache stall on the failed request.

## Diagnostic deployment and observations

Temporary production deployment `dpl_43kmnhvJRDRszSkTFXXY6JXnnBwa` uses the exact
previous production source plus homepage timing logs. The matching instrumentation
is also in this checkout. The deployment does not contain the checkout's other
uncommitted work. Runtime limits, fetching, fallbacks, and page content are unchanged.

Three consecutive uncached requests returned 200:

| Request                          | Client time to first byte | Vercel request start to middleware marker | Middleware to response creation | Fitness / AI cache reads |
| -------------------------------- | ------------------------- | ----------------------------------------- | ------------------------------- | ------------------------ |
| First module invocation          | 5.893 s                   | 4.963 s                                   | 679 ms                          | 169 / 177 ms             |
| Second invocation of same module | 0.699 s                   | 125 ms                                    | 244 ms                          | 17 / 18 ms               |
| Third invocation of same module  | 0.520 s                   | 60 ms                                     | 184 ms                          | 20 / 20 ms               |

Connection setup on the first request took 135 ms. Its Vercel request began at
`2026-10-05T01:58:33.815Z`; the middleware marker was at
`2026-10-05T01:58:38.778Z`. The large delay precedes the measured homepage data
calls. Combined with module reuse on subsequent requests, this supports startup
or initialization as the main delay in these checks. It does not establish which
startup component was slow or prove the cause of the original timeout.

## Reading the diagnostic logs

Search Vercel logs for `[homepage-timing]`. Events include a random request ID,
UTC timestamp, and elapsed time from middleware entry. They contain operation
names and timings, not credentials, query strings, or fetched payloads.

- `request-start`: middleware entry; `requestOrdinal` tracks reuse of this
  diagnostics module instance and is not a guaranteed cold-start indicator.
- `dependency-start` / `dependency-end`: timings for each awaited data operation.
  `resolved` includes utilities that handled an upstream error by returning a fallback.
- `data-ready`: all homepage data calls have settled.
- `response-created`: Astro returned a Response; this is not a measurement of
  when the browser received all streamed HTML.
- `request-slow`: dependencies still pending six seconds after middleware entry.
  This snapshot might not run before a platform timeout if initialization has
  already consumed most of the invocation budget, or if the event loop is blocked.

Compare absolute marker timestamps with the Vercel request timestamp to locate
time before middleware entry. Started dependencies with no matching finish marker
identify operations that were pending when the process was killed, provided the
logs were delivered. A lack of timing logs alone is not proof of an initialization
failure, because logs may be incomplete.

Retrieve the latest records with:

```sh
vercel logs --project prj_NzY7qLcZ8dVYaErdplKwrfNRQQPx --since 1h --query homepage-timing --expand
```

The next timeout should distinguish a pending cache read, another data operation,
rendering after data loads, or a delay before the middleware marker. Remove the
temporary diagnostics after collecting enough evidence and choosing a remedy.

## Validation

Three diagnostic tests pass, covering a stalled operation, preservation of
failures, cleanup, and isolation between concurrent requests. The helper passed
TypeScript checking and the page passed Astro compiler transformation. The remote
production build passed, and the diagnostic events were verified in live logs.
A standalone middleware type check encountered an existing syntax error in the
installed Astro `client.d.ts` declaration with TypeScript 5.7.3.
