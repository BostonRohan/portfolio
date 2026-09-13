import { getCache } from "@vercel/functions";

const AI_ACTIVITY_KEY = "daily-activity";
const AI_ACTIVITY_CACHE_TTL_SECONDS = 60 * 60 * 24 * 8;

export interface AiProviderActivity {
  sessions: number;
  toolCalls: number;
}

export interface AiToolActivity {
  terminal: number;
  files: number;
  web: number;
  browser: number;
  other: number;
}

export interface AiActivityData {
  date: string;
  providers: {
    codex: AiProviderActivity;
    claude: AiProviderActivity;
  };
  tools: AiToolActivity;
  syncedAt: string;
}

export async function getAiActivity(): Promise<AiActivityData | null> {
  try {
    const cache = getCache({ namespace: "portfolio-ai-activity" });
    return (await cache.get(AI_ACTIVITY_KEY)) as AiActivityData | null;
  } catch (error) {
    console.warn("[ai-activity] data unavailable", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

export async function saveAiActivity(data: AiActivityData): Promise<void> {
  const cache = getCache({ namespace: "portfolio-ai-activity" });
  await cache.set(AI_ACTIVITY_KEY, data, {
    name: "Daily AI activity",
    tags: ["ai-activity"],
    ttl: AI_ACTIVITY_CACHE_TTL_SECONDS,
  });
}
