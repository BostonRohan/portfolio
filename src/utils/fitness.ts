const FITNESS_KEY = "portfolio:fitness:latest-workout";

export interface FitnessWorkout {
  workoutType: string;
  duration: string;
  activeEnergy: string | null;
  distance: string | null;
  completedAt: string;
  syncedAt: string;
}

interface UpstashResponse<T> {
  result?: T;
  error?: string;
}

function getRedisConfig(): { url: string; token: string } | null {
  const url =
    import.meta.env.UPSTASH_REDIS_REST_URL || import.meta.env.KV_REST_API_URL;
  const token =
    import.meta.env.UPSTASH_REDIS_REST_TOKEN ||
    import.meta.env.KV_REST_API_TOKEN;

  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function runRedisCommand<T>(command: unknown[]): Promise<T> {
  const config = getRedisConfig();
  if (!config) {
    throw new Error("Fitness storage is not configured");
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`Fitness storage request failed (${response.status})`);
  }

  const payload = (await response.json()) as UpstashResponse<T>;
  if (payload.error) {
    throw new Error(`Fitness storage error: ${payload.error}`);
  }

  return payload.result as T;
}

export async function getLatestFitnessWorkout(): Promise<FitnessWorkout | null> {
  try {
    const stored = await runRedisCommand<string | null>(["GET", FITNESS_KEY]);
    if (!stored) return null;

    return JSON.parse(stored) as FitnessWorkout;
  } catch (error) {
    console.warn("[fitness] latest workout unavailable", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

export async function saveLatestFitnessWorkout(
  workout: FitnessWorkout,
): Promise<void> {
  await runRedisCommand(["SET", FITNESS_KEY, JSON.stringify(workout)]);
}
