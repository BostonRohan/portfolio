#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { userInfo } from "node:os";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";

import {
  flushAiActivityFailures,
  queueAiActivityFailure,
  readAiActivityToken,
} from "./aiActivityFailureReports.mjs";

const PROFILE_ROOTS = {
  codex: [
    join(userInfo().homedir, ".codex"),
    join(userInfo().homedir, ".ec-codex"),
  ],
  claude: [
    join(userInfo().homedir, ".claude"),
    join(userInfo().homedir, ".ec-claude"),
  ],
};
const TIME_ZONE = "America/New_York";
const DEFAULT_ENDPOINT = "https://bostonrohan.com/api/ai-activity";
const STATUS_PATH = join(
  userInfo().homedir,
  "Library",
  "Application Support",
  "portfolio-ai-activity",
  "last-success.json",
);
const NOTICE_PATH = join(dirname(STATUS_PATH), "last-failure-notice.json");
const HISTORY_DAYS = 84;
const isDryRun = process.argv.includes("--dry-run");
let syncStage = "collection";

const dateKey = (value) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);

const today = dateKey(new Date());
const earliestDate = dateKey(
  new Date(Date.now() - (HISTORY_DAYS - 1) * 24 * 60 * 60 * 1000),
);
const dailyActivity = new Map();

function activityFor(date) {
  if (!dailyActivity.has(date)) {
    dailyActivity.set(date, {
      codexSessions: new Set(),
      claudeSessions: new Set(),
      codexToolCalls: 0,
      claudeToolCalls: 0,
      tools: { terminal: 0, files: 0, web: 0, browser: 0, other: 0 },
    });
  }
  return dailyActivity.get(date);
}

function classifyTool(name) {
  const normalized = String(name || "").toLowerCase();
  if (/bash|shell|terminal|exec|command/.test(normalized)) return "terminal";
  if (/read|write|edit|patch|glob|grep|file|notebook/.test(normalized))
    return "files";
  if (/browser|playwright|computer|cua|screenshot/.test(normalized))
    return "browser";
  if (/web|search|fetch|http/.test(normalized)) return "web";
  return "other";
}

function parseLine(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

async function visitJsonLines(path, visit) {
  const lines = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  });
  for await (const line of lines) {
    const record = parseLine(line);
    if (record) visit(record);
  }
}

function listJsonLines(root) {
  const files = [];
  if (!existsSync(root)) return files;
  const stack = [root];
  while (stack.length) {
    const directory = stack.pop();
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) stack.push(path);
      else if (entry.isFile() && entry.name.endsWith(".jsonl"))
        files.push(path);
    }
  }
  return files;
}

function activityDate(timestamp) {
  const value = new Date(timestamp);
  if (Number.isNaN(value.getTime())) return null;
  const date = dateKey(value);
  return date >= earliestDate && date <= today ? date : null;
}

async function collectCodex() {
  for (const root of PROFILE_ROOTS.codex) {
    const database = join(root, "state_5.sqlite");
    if (!existsSync(database)) continue;
    let paths;
    for (let attempt = 1; ; attempt += 1) {
      try {
        paths = execFileSync(
          "/usr/bin/sqlite3",
          [
            "-readonly",
            database,
            "select id || char(9) || rollout_path from threads where rollout_path <> '';",
          ],
          { encoding: "utf8" },
        );
        break;
      } catch (error) {
        if (attempt >= 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    for (const row of paths.trim().split("\n")) {
      if (!row) continue;
      const [threadId, path] = row.split("\t");
      if (!threadId || !path || !existsSync(path)) continue;
      await visitJsonLines(path, (record) => {
        const date = activityDate(record.timestamp);
        if (!date) return;
        const activity = activityFor(date);
        activity.codexSessions.add(threadId);
        const itemType = record.payload?.type;
        if (record.type !== "response_item") return;
        if (itemType !== "custom_tool_call" && itemType !== "function_call")
          return;
        activity.codexToolCalls += 1;
        activity.tools[
          classifyTool(record.payload?.name || record.payload?.tool_name)
        ] += 1;
      });
    }
  }
}

async function collectClaude() {
  for (const root of PROFILE_ROOTS.claude) {
    const projects = join(root, "projects");
    for (const path of listJsonLines(projects)) {
      if (
        statSync(path).mtimeMs <
        Date.now() - (HISTORY_DAYS + 2) * 24 * 60 * 60 * 1000
      )
        continue;
      await visitJsonLines(path, (record) => {
        const date = activityDate(record.timestamp);
        if (!date) return;
        const activity = activityFor(date);
        const sessionId = record.sessionId;
        if (typeof sessionId === "string")
          activity.claudeSessions.add(sessionId);
        if (
          record.type !== "assistant" ||
          !Array.isArray(record.message?.content)
        )
          return;
        for (const item of record.message.content) {
          if (item?.type !== "tool_use") continue;
          activity.claudeToolCalls += 1;
          activity.tools[classifyTool(item.name)] += 1;
        }
      });
    }
  }
}

async function notifyFailure() {
  try {
    const notice = JSON.parse(await readFile(NOTICE_PATH, "utf8"));
    if (notice.date === today) return;
  } catch {
    // A missing or invalid notice means no alert was recorded for today.
  }

  try {
    execFileSync(
      "/usr/bin/osascript",
      [
        "-e",
        'display notification "The AI activity sync failed. Check the portfolio AI activity error log." with title "Portfolio AI activity"',
      ],
      { stdio: "ignore" },
    );
    await mkdir(dirname(NOTICE_PATH), { recursive: true });
    await writeFile(NOTICE_PATH, JSON.stringify({ date: today }), {
      mode: 0o600,
    });
  } catch (notificationError) {
    console.error("[ai-activity] notification failed", notificationError);
  }
}

async function runSync() {
  await Promise.all([collectCodex(), collectClaude()]);
  const current = activityFor(today);
  const codex = {
    sessions: current.codexSessions.size,
    toolCalls: current.codexToolCalls,
  };
  const claude = {
    sessions: current.claudeSessions.size,
    toolCalls: current.claudeToolCalls,
  };
  const history = [...dailyActivity.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, activity]) => ({
      date,
      sessions: activity.codexSessions.size + activity.claudeSessions.size,
      toolCalls: activity.codexToolCalls + activity.claudeToolCalls,
    }));
  const payload = {
    date: today,
    providers: { codex, claude },
    tools: current.tools,
    history,
  };

  if (isDryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  syncStage = "upload";
  const endpoint = process.env.AI_ACTIVITY_URL || DEFAULT_ENDPOINT;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${readAiActivityToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const requestId = response.headers.get("x-request-id") || "unknown";
    throw new Error(
      `AI activity sync failed (${response.status}, request ${requestId})`,
    );
  }

  syncStage = "status";
  await mkdir(dirname(STATUS_PATH), { recursive: true });
  await writeFile(
    STATUS_PATH,
    JSON.stringify({ date: today, syncedAt: new Date().toISOString() }),
    { mode: 0o600 },
  );
  console.log(
    `[ai-activity] synced ${codex.sessions + claude.sessions} sessions and ${codex.toolCalls + claude.toolCalls} tool calls`,
  );
  try {
    await flushAiActivityFailures();
  } catch (error) {
    console.warn("[ai-activity] queued failure reports remain", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

try {
  await runSync();
} catch (error) {
  if (!isDryRun) {
    await notifyFailure();
    try {
      await queueAiActivityFailure("sync", syncStage);
      await flushAiActivityFailures();
    } catch (reportError) {
      console.warn("[ai-activity] failure report queued locally", {
        error:
          reportError instanceof Error ? reportError.message : "Unknown error",
      });
    }
  }
  throw error;
}
