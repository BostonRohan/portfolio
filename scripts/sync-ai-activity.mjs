#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, readdirSync, statSync } from "node:fs";
import { userInfo } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline";

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
const isDryRun = process.argv.includes("--dry-run");

const dateKey = (value) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);

const today = dateKey(new Date());
const toolCounts = { terminal: 0, files: 0, web: 0, browser: 0, other: 0 };

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

function isToday(timestamp) {
  const value = new Date(timestamp);
  return !Number.isNaN(value.getTime()) && dateKey(value) === today;
}

async function collectCodex() {
  const sessions = new Set();
  let toolCalls = 0;

  for (const root of PROFILE_ROOTS.codex) {
    const database = join(root, "state_5.sqlite");
    if (!existsSync(database)) continue;
    const paths = execFileSync(
      "/usr/bin/sqlite3",
      [
        "-readonly",
        database,
        "select id || char(9) || rollout_path from threads where rollout_path <> '';",
      ],
      { encoding: "utf8" },
    );

    for (const row of paths.trim().split("\n")) {
      if (!row) continue;
      const [threadId, path] = row.split("\t");
      if (!threadId || !path || !existsSync(path)) continue;
      await visitJsonLines(path, (record) => {
        if (!isToday(record.timestamp)) return;
        sessions.add(threadId);
        const itemType = record.payload?.type;
        if (record.type !== "response_item") return;
        if (itemType !== "custom_tool_call" && itemType !== "function_call")
          return;
        toolCalls += 1;
        toolCounts[
          classifyTool(record.payload?.name || record.payload?.tool_name)
        ] += 1;
      });
    }
  }

  return { sessions: sessions.size, toolCalls };
}

async function collectClaude() {
  const sessions = new Set();
  let toolCalls = 0;

  for (const root of PROFILE_ROOTS.claude) {
    const projects = join(root, "projects");
    for (const path of listJsonLines(projects)) {
      if (statSync(path).mtimeMs < Date.now() - 3 * 24 * 60 * 60 * 1000)
        continue;
      await visitJsonLines(path, (record) => {
        if (!isToday(record.timestamp)) return;
        const sessionId = record.sessionId;
        if (typeof sessionId === "string") sessions.add(sessionId);
        if (
          record.type !== "assistant" ||
          !Array.isArray(record.message?.content)
        )
          return;
        for (const item of record.message.content) {
          if (item?.type !== "tool_use") continue;
          toolCalls += 1;
          toolCounts[classifyTool(item.name)] += 1;
        }
      });
    }
  }

  return { sessions: sessions.size, toolCalls };
}

function readToken() {
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

const [codex, claude] = await Promise.all([collectCodex(), collectClaude()]);
const payload = {
  date: today,
  providers: { codex, claude },
  tools: toolCounts,
};

if (isDryRun) {
  console.log(JSON.stringify(payload, null, 2));
  process.exit(0);
}

const endpoint = process.env.AI_ACTIVITY_URL || DEFAULT_ENDPOINT;
const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${readToken()}`,
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

console.log(
  `[ai-activity] synced ${codex.sessions + claude.sessions} sessions and ${codex.toolCalls + claude.toolCalls} tool calls`,
);
