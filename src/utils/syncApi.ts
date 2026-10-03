import { timingSafeEqual } from "node:crypto";
import * as Sentry from "@sentry/astro";
import type { ZodIssue } from "zod";

export interface SyncIssue {
  path: string;
  code: string;
}

export function jsonResponse(
  payload: unknown,
  status = 200,
  requestId?: string,
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...(requestId ? { "X-Request-ID": requestId } : {}),
    },
  });
}

export function isAuthorized(
  request: Request,
  expectedToken: string | undefined,
): boolean {
  const authorization = request.headers.get("Authorization");
  if (!expectedToken || !authorization?.startsWith("Bearer ")) return false;

  const expected = Buffer.from(expectedToken);
  const supplied = Buffer.from(authorization.slice("Bearer ".length));
  return (
    supplied.length === expected.length && timingSafeEqual(supplied, expected)
  );
}

export function toSyncIssues(
  issues: ZodIssue[],
  prefix: string[] = [],
): SyncIssue[] {
  return issues.map((issue) => ({
    path: [...prefix, ...issue.path].join(".") || "body",
    code: issue.code,
  }));
}

export function reportRejectedSync(
  endpoint: string,
  requestId: string,
  stage: string,
  issues?: SyncIssue[],
): void {
  console.warn(`[${endpoint}] request rejected`, {
    requestId,
    stage,
    ...(issues ? { issues } : {}),
  });
  Sentry.captureMessage(`${endpoint} sync request rejected`, {
    level: "warning",
    tags: { endpoint, stage },
    extra: { requestId, ...(issues ? { issues } : {}) },
  });
}

export function reportSyncConfigurationError(
  endpoint: string,
  requestId: string,
): void {
  Sentry.captureMessage(`${endpoint} sync token is not configured`, {
    level: "error",
    tags: { endpoint, stage: "configuration" },
    extra: { requestId },
  });
}
