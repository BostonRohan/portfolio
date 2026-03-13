import type { APIRoute } from "astro";
import { checkRateLimit } from "@vercel/firewall";
import bundledContext from "../../../generated/ai-context.json";
import { musicProfile } from "../../data/music.js";
import { fetchPinnedGithubData, computeLanguageStats } from "../../utils/github.js";
import { fetchLastfmData } from "../../utils/lastfm.js";

interface ContextChunk {
  id: string;
  type: "bio" | "project" | "experience" | "blog" | "contact" | "music";
  title?: string;
  content: string;
  url?: string;
  section?: string;
  keywords?: string[];
}

type ChatAction = "scroll" | "navigate" | "highlight" | "none";

interface ChatResponsePayload {
  message: string;
  action: ChatAction;
  target?: string;
  suggestions?: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface DynamicContextCacheEntry {
  expiresAt: number;
  chunks: ContextChunk[];
}

const ACTION_TARGETS: Record<Exclude<ChatAction, "none">, string[]> = {
  scroll: ["projects", "experience", "blog", "contact", "home"],
  navigate: ["blog", "home", "projects", "experience", "contact"],
  highlight: ["projects", "experience", "blog", "contact"],
};

const DEFAULT_SUGGESTIONS = ["projects", "experience", "music", "blog", "contact"];
const CHAT_RATE_LIMIT_ID = import.meta.env.CHAT_RATE_LIMIT_ID || "chat-api";
const GITHUB_CONTEXT_TTL_MS = 30 * 60 * 1000;
const LASTFM_CONTEXT_TTL_MS = 10 * 60 * 1000;
const PROJECT_QUERY_TERMS = ["project", "projects", "repo", "repos", "repository", "repositories", "github", "code", "stack", "language", "languages", "built", "build"];
const MUSIC_QUERY_TERMS = ["music", "song", "songs", "album", "albums", "artist", "artists", "listen", "listening", "track", "tracks", "lastfm"];

let contextCache: ContextChunk[] | null = null;
let githubContextCache: DynamicContextCacheEntry | null = null;
let lastfmContextCache: DynamicContextCacheEntry | null = null;

function getAllowedOrigins(requestOrigin: string) {
  const configuredOrigins = String(import.meta.env.CHAT_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([requestOrigin, ...configuredOrigins]);
}

function extractRequestOrigin(request: Request) {
  const originHeader = request.headers.get("origin");
  if (originHeader) return originHeader;

  const referer = request.headers.get("referer");
  if (!referer) return "";

  try {
    return new URL(referer).origin;
  } catch {
    return "";
  }
}

function isAllowedOrigin(request: Request, serverOrigin: string) {
  const requestOrigin = extractRequestOrigin(request);
  if (!requestOrigin) return false;

  const allowedOrigins = getAllowedOrigins(serverOrigin);
  return allowedOrigins.has(requestOrigin);
}

async function isRateLimited(request: Request) {
  try {
    const { rateLimited } = await checkRateLimit(CHAT_RATE_LIMIT_ID, { request });
    return rateLimited;
  } catch (error) {
    console.error("Rate limit check failed", error);
    return false;
  }
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createContextChunk({ id, type, title, content, url, section }: Omit<ContextChunk, "keywords">) {
  return {
    id,
    type,
    title,
    content,
    url,
    section,
    keywords: normalizeText([type, title, content, section].filter(Boolean).join(" "))
      .split(" ")
      .filter((token) => token.length > 2)
      .filter((token, index, tokens) => tokens.indexOf(token) === index)
      .slice(0, 50),
  };
}

function messageHasAnyTerm(message: string, terms: string[]) {
  const normalized = normalizeText(message);
  return terms.some((term) => normalized.includes(term));
}

function shouldFetchGithubContext(message: string) {
  return messageHasAnyTerm(message, PROJECT_QUERY_TERMS);
}

function shouldFetchMusicContext(message: string) {
  return messageHasAnyTerm(message, MUSIC_QUERY_TERMS);
}

async function getGithubRuntimeContext() {
  if (githubContextCache && githubContextCache.expiresAt > Date.now()) {
    return githubContextCache.chunks;
  }

  const githubData = await fetchPinnedGithubData({
    githubUsername: import.meta.env.GITHUB_USERNAME,
    githubAccessToken: import.meta.env.GITHUB_ACCESS_TOKEN,
  });

  if (githubData.error) {
    throw new Error(githubData.error);
  }

  const projectChunks = (githubData.projects || [])
    .filter((repo) => repo.name !== "portfolio")
    .map((repo) => {
      const languages = (repo.languages?.edges || [])
        .map((edge) => edge?.node?.name)
        .filter(Boolean);
      const topics = (repo.repositoryTopics?.edges || [])
        .map((edge) => edge?.node?.topic?.name)
        .filter(Boolean);
      const content = [
        repo.description || "",
        languages.length ? `Languages: ${languages.join(", ")}.` : "",
        topics.length ? `Topics: ${topics.join(", ")}.` : "",
        repo.homepageUrl ? `Homepage: ${repo.homepageUrl}.` : "",
        repo.latestRelease?.tagName ? `Latest release: ${repo.latestRelease.tagName}.` : "",
      ]
        .filter(Boolean)
        .join(" ");

      return createContextChunk({
        id: `runtime-project:${repo.name}`,
        type: "project",
        title: repo.name,
        content,
        url: repo.url,
        section: "projects",
      });
    });

  const languageStats = computeLanguageStats(githubData.projects || []);
  if (languageStats.length) {
    projectChunks.push(
      createContextChunk({
        id: "runtime-project:language-stats",
        type: "project",
        title: "Pinned project language percentages",
        content: `Language distribution across pinned projects. ${languageStats
          .map(
            (entry) =>
              `${entry.language}: ${entry.percent}% (${entry.projectCount}/${entry.totalProjects} pinned projects).`,
          )
          .join(" ")}`,
        url: "/#projects",
        section: "projects",
      }),
    );
  }

  githubContextCache = {
    expiresAt: Date.now() + GITHUB_CONTEXT_TTL_MS,
    chunks: projectChunks,
  };

  return projectChunks;
}

async function getLastfmRuntimeContext() {
  if (lastfmContextCache && lastfmContextCache.expiresAt > Date.now()) {
    return lastfmContextCache.chunks;
  }

  const lastfmData = await fetchLastfmData({
    apiKey: import.meta.env.LASTFM_API_KEY,
    username: import.meta.env.LASTFM_USERNAME || musicProfile.lastfmUsername,
  });

  if (lastfmData.error) {
    throw new Error(lastfmData.error);
  }

  const musicChunks: ContextChunk[] = [];

  if (lastfmData.recentTracks.length) {
    musicChunks.push(
      createContextChunk({
        id: "runtime-music:recent-tracks",
        type: "music",
        title: "Recent Last.fm tracks",
        content: lastfmData.recentTracks
          .map((track) => `${track.name} by ${track.artist}${track.album ? ` from ${track.album}` : ""}.`)
          .join(" "),
        url: lastfmData.profileUrl || musicProfile.lastfmUrl,
        section: "music",
      }),
    );
  }

  if (lastfmData.topArtists.length) {
    musicChunks.push(
      createContextChunk({
        id: "runtime-music:top-artists",
        type: "music",
        title: "Top artists this month",
        content: lastfmData.topArtists
          .map((artist) => `${artist.name}${artist.playcount ? ` (${artist.playcount} plays)` : ""}.`)
          .join(" "),
        url: lastfmData.profileUrl || musicProfile.lastfmUrl,
        section: "music",
      }),
    );
  }

  if (lastfmData.topAlbums.length) {
    musicChunks.push(
      createContextChunk({
        id: "runtime-music:top-albums",
        type: "music",
        title: "Top albums this month",
        content: lastfmData.topAlbums
          .map((album) => `${album.name} by ${album.artist}${album.playcount ? ` (${album.playcount} plays)` : ""}.`)
          .join(" "),
        url: lastfmData.profileUrl || musicProfile.lastfmUrl,
        section: "music",
      }),
    );
  }

  lastfmContextCache = {
    expiresAt: Date.now() + LASTFM_CONTEXT_TTL_MS,
    chunks: musicChunks,
  };

  return musicChunks;
}

async function getDynamicContext(message: string) {
  const dynamicChunks: ContextChunk[] = [];

  if (shouldFetchGithubContext(message)) {
    try {
      dynamicChunks.push(...(await getGithubRuntimeContext()));
    } catch (error) {
      console.error("GitHub dynamic context failed", error);
    }
  }

  if (shouldFetchMusicContext(message)) {
    try {
      dynamicChunks.push(...(await getLastfmRuntimeContext()));
    } catch (error) {
      console.error("Last.fm dynamic context failed", error);
    }
  }

  return dynamicChunks;
}

function scoreChunk(messageTokens: string[], chunk: ContextChunk) {
  const haystack = normalizeText(
    [chunk.type, chunk.title, chunk.content, chunk.section, ...(chunk.keywords || [])]
      .filter(Boolean)
      .join(" "),
  );

  if (!haystack) return 0;

  let score = 0;
  for (const token of messageTokens) {
    if (haystack.includes(` ${token} `) || haystack.startsWith(`${token} `) || haystack.endsWith(` ${token}`)) {
      score += 3;
    } else if (haystack.includes(token)) {
      score += 1;
    }
  }

  if (chunk.type === "project" && messageTokens.some((token) => ["project", "projects", "build", "built", "repo"].includes(token))) {
    score += 2;
  }

  if (chunk.type === "experience" && messageTokens.some((token) => ["work", "worked", "experience", "job", "jobs"].includes(token))) {
    score += 2;
  }

  if (chunk.type === "blog" && messageTokens.some((token) => ["blog", "post", "writing"].includes(token))) {
    score += 2;
  }

  if (chunk.type === "music" && messageTokens.some((token) => ["music", "song", "songs", "album", "albums", "artist", "artists", "listen", "listening"].includes(token))) {
    score += 2;
  }

  if (chunk.type === "contact" && messageTokens.some((token) => ["contact", "reach", "email", "linkedin"].includes(token))) {
    score += 2;
  }

  return score;
}

async function loadContext() {
  if (contextCache) return contextCache;
  const parsed = bundledContext;

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid ai-context.json format: expected an array.");
  }

  contextCache = parsed;
  return contextCache;
}

function retrieveTopContext(message: string, context: ContextChunk[]) {
  const tokens = [...new Set(normalizeText(message).split(" ").filter((token) => token.length > 2))];

  const ranked = context
    .map((chunk) => ({ chunk, score: scoreChunk(tokens, chunk) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((entry) => entry.chunk);

  if (ranked.length > 0) return ranked;
  return context.slice(0, 5);
}

function parseJsonObject(raw: string) {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const maybeJson = trimmed.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(maybeJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function isValidActionTarget(action: Exclude<ChatAction, "none">, target: string) {
  return ACTION_TARGETS[action].includes(target);
}

function validateAssistantPayload(payload: unknown): ChatResponsePayload | null {
  if (!payload || typeof payload !== "object") return null;

  const candidate = payload as Record<string, unknown>;

  if (typeof candidate.message !== "string" || !candidate.message.trim()) {
    return null;
  }

  if (
    candidate.action !== "scroll" &&
    candidate.action !== "navigate" &&
    candidate.action !== "highlight" &&
    candidate.action !== "none"
  ) {
    return null;
  }

  const action = candidate.action;
  const cleaned: ChatResponsePayload = {
    message: candidate.message.trim(),
    action,
  };

  if (action !== "none") {
    if (typeof candidate.target !== "string" || !isValidActionTarget(action, candidate.target)) {
      return null;
    }
    cleaned.target = candidate.target;
  }

  if (Array.isArray(candidate.suggestions)) {
    cleaned.suggestions = candidate.suggestions.filter((item): item is string => typeof item === "string").slice(0, 5);
  }

  if (!cleaned.suggestions || cleaned.suggestions.length === 0) {
    cleaned.suggestions = DEFAULT_SUGGESTIONS;
  }

  return cleaned;
}

function fallbackResponse(): ChatResponsePayload {
  return {
    message:
      "I don’t have enough confirmed context for that yet. You can ask about projects, experience, music, blog posts, or contact details.",
    action: "none",
    suggestions: DEFAULT_SUGGESTIONS,
  };
}

async function callModel({ message, history, context }: { message: string; history: ChatMessage[]; context: ContextChunk[] }) {
  const gatewayKey = import.meta.env.AI_GATEWAY_API_KEY;
  const model = import.meta.env.AI_MODEL || "openai/gpt-4.1-mini";

  if (!gatewayKey) {
    throw new Error("Missing AI_GATEWAY_API_KEY environment variable.");
  }

  const contextBlock = context
    .map((chunk) => {
      const heading = [chunk.type.toUpperCase(), chunk.title].filter(Boolean).join(" - ");
      const source = chunk.url ? `Source: ${chunk.url}` : "";
      return `${heading}\n${source}\n${chunk.content}`.trim();
    })
    .join("\n\n---\n\n");

  const systemPrompt = [
    "You are Boston Rohan's portfolio assistant.",
    "Only answer with facts supported by provided context.",
    "If the answer is not in context, say so briefly and suggest relevant sections.",
    "Avoid explicit language and profanity in your responses.",
    "Return JSON only with this shape:",
    '{"message":"string","action":"scroll|navigate|highlight|none","target":"projects|experience|blog|contact|home(optional when action=none)","suggestions":["projects","experience","music","blog","contact"]}',
    "Use action rules:",
    "- scroll: when user asks to see a section on this page",
    "- navigate: when user asks to go to a page/area (blog/home/etc)",
    "- highlight: optional emphasis after showing requested section",
    "- none: when no UI action is needed",
    "Never include markdown code fences.",
  ].join("\n");

  const userPrompt = `Context:\n${contextBlock}\n\nConversation:\n${history
    .map((item) => `${item.role}: ${item.content}`)
    .join("\n")}\nuser: ${message}`;

  const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${gatewayKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Gateway request failed (${response.status}): ${details}`);
  }

  const json = await response.json();
  return json?.choices?.[0]?.message?.content || "";
}

export const POST: APIRoute = async ({ request, url }) => {
  try {
    if (!isAllowedOrigin(request, url.origin)) {
      return new Response(JSON.stringify({ error: "forbidden origin" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (await isRateLimited(request)) {
      return new Response(JSON.stringify({ error: "rate limit exceeded" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const history = Array.isArray(body?.history)
      ? body.history
          .filter(
            (item): item is ChatMessage =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string" &&
              item.content.trim().length > 0,
          )
          .slice(-8)
      : [];

    if (!message) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const context = await loadContext();
    const dynamicContext = await getDynamicContext(message);
    const topContext = retrieveTopContext(message, [...dynamicContext, ...context]);

    const rawModelOutput = await callModel({
      message,
      history,
      context: topContext,
    });

    const parsed = parseJsonObject(rawModelOutput);
    const validated = validateAssistantPayload(parsed);

    return new Response(JSON.stringify(validated || fallbackResponse()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("/api/chat error", error);
    return new Response(JSON.stringify(fallbackResponse()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};
