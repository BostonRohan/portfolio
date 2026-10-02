#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { userInfo } from "node:os";
import { dirname, join } from "node:path";

import {
  flushAiActivityFailures,
  queueAiActivityFailure,
} from "./aiActivityFailureReports.mjs";

const STATUS_PATH = join(
  userInfo().homedir,
  "Library",
  "Application Support",
  "portfolio-ai-activity",
  "last-success.json",
);
const NOTICE_PATH = join(
  userInfo().homedir,
  "Library",
  "Application Support",
  "portfolio-ai-activity",
  "last-failure-notice.json",
);
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

async function getLastSuccessDate() {
  try {
    const status = JSON.parse(await readFile(STATUS_PATH, "utf8"));
    return typeof status.date === "string" ? status.date : null;
  } catch (error) {
    console.warn("[ai-activity] success status unavailable", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

let lastSuccessDate = await getLastSuccessDate();
if (lastSuccessDate === today) {
  console.info("[ai-activity] daily sync confirmed", { date: today });
  process.exit(0);
}

// On wake or login, the sync and watchdog can start together. Give the sync
// time to complete before reporting a missing upload.
await new Promise((resolve) => setTimeout(resolve, 3 * 60 * 1000));
lastSuccessDate = await getLastSuccessDate();
if (lastSuccessDate === today) {
  console.info("[ai-activity] daily sync confirmed after startup", {
    date: today,
  });
  process.exit(0);
}

console.error("[ai-activity] daily sync missing", {
  expectedDate: today,
  lastSuccessDate,
});
let alreadyNotified = false;
try {
  const notice = JSON.parse(await readFile(NOTICE_PATH, "utf8"));
  alreadyNotified = notice.date === today;
} catch {
  // The sync did not record a failure notification today.
}
try {
  if (!alreadyNotified) {
    await queueAiActivityFailure("watchdog", "missing-success");
  }
  await flushAiActivityFailures();
} catch (error) {
  console.warn("[ai-activity] watchdog failure report queued locally", {
    error: error instanceof Error ? error.message : "Unknown error",
  });
}
if (alreadyNotified) {
  console.info("[ai-activity] failure notification already sent today");
  process.exit(1);
}
execFileSync(
  "/usr/bin/osascript",
  [
    "-e",
    'display notification "No successful AI activity sync was recorded today. Check the portfolio AI activity error log." with title "Portfolio AI activity"',
  ],
  { stdio: "ignore" },
);
await mkdir(dirname(NOTICE_PATH), { recursive: true });
await writeFile(NOTICE_PATH, JSON.stringify({ date: today }), { mode: 0o600 });
process.exitCode = 1;
