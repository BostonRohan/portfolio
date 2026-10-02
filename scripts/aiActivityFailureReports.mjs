import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { userInfo } from "node:os";
import { join } from "node:path";

const DEFAULT_ACTIVITY_ENDPOINT = "https://bostonrohan.com/api/ai-activity";
const FAILURE_DIRECTORY = join(
  userInfo().homedir,
  "Library",
  "Application Support",
  "portfolio-ai-activity",
  "failures",
);
const SOURCES = new Set(["sync", "watchdog"]);
const STAGES = new Set(["collection", "upload", "status", "missing-success"]);

function easternDate(value) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function readAiActivityToken() {
  return execFileSync(
    "/usr/bin/security",
    [
      "find-generic-password",
      "-w",
      "-a",
      userInfo().username,
      "-s",
      "portfolio-ai-activity",
    ],
    { encoding: "utf8" },
  ).trim();
}

export async function queueAiActivityFailure(source, stage) {
  if (!SOURCES.has(source) || !STAGES.has(stage)) {
    throw new Error("Invalid AI activity failure category");
  }

  const occurredAt = new Date();
  const name = `${easternDate(occurredAt)}-${source}-${stage}`;
  const pendingPath = join(FAILURE_DIRECTORY, `${name}.pending.json`);
  const sentPath = join(FAILURE_DIRECTORY, `${name}.sent.json`);
  await mkdir(FAILURE_DIRECTORY, { recursive: true });
  if (existsSync(sentPath)) return;

  try {
    await writeFile(
      pendingPath,
      JSON.stringify({ source, stage, occurredAt: occurredAt.toISOString() }),
      { flag: "wx", mode: 0o600 },
    );
  } catch (error) {
    if (error?.code !== "EEXIST") throw error;
  }
}

export async function flushAiActivityFailures() {
  let names;
  try {
    names = (await readdir(FAILURE_DIRECTORY)).filter((name) =>
      name.endsWith(".pending.json"),
    );
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }
  if (names.length === 0) return;

  const endpoint = new URL(
    "/api/ai-activity-failure",
    process.env.AI_ACTIVITY_URL || DEFAULT_ACTIVITY_ENDPOINT,
  );
  const token = readAiActivityToken();

  for (const name of names) {
    const pendingPath = join(FAILURE_DIRECTORY, name);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: await readFile(pendingPath, "utf8"),
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        console.warn("[ai-activity] failure report not accepted", {
          status: response.status,
        });
        break;
      }
      await rename(
        pendingPath,
        pendingPath.replace(/\.pending\.json$/, ".sent.json"),
      );
    } catch (error) {
      console.warn("[ai-activity] failure report deferred", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      break;
    }
  }
}
