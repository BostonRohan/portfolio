import { getCache } from "@vercel/functions";

const FITNESS_KEY = "latest-workout";
const FITNESS_CACHE_TTL_SECONDS = 60 * 60 * 24 * 365;

export interface FitnessWorkout {
  workoutType: string;
  duration: string;
  activeEnergy: string | null;
  distance: string | null;
  completedAt: string;
  syncedAt: string;
}

export interface FitnessRings {
  move: number;
  exercise: number;
  stand: number;
  syncedAt: string;
}

export interface FitnessData {
  workout: FitnessWorkout | null;
  rings: FitnessRings | null;
}

function isLegacyWorkout(value: unknown): value is FitnessWorkout {
  return Boolean(
    value &&
      typeof value === "object" &&
      "workoutType" in value &&
      "duration" in value,
  );
}

export async function getFitnessData(): Promise<FitnessData> {
  try {
    const cache = getCache({ namespace: "portfolio-fitness" });
    const stored = await cache.get(FITNESS_KEY);

    if (isLegacyWorkout(stored)) {
      return { workout: stored, rings: null };
    }

    return (stored as FitnessData | null) ?? { workout: null, rings: null };
  } catch (error) {
    console.warn("[fitness] data unavailable", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return { workout: null, rings: null };
  }
}

export async function saveFitnessData(data: FitnessData): Promise<void> {
  const cache = getCache({ namespace: "portfolio-fitness" });
  await cache.set(FITNESS_KEY, data, {
    name: "Latest Apple Watch activity",
    tags: ["fitness"],
    ttl: FITNESS_CACHE_TTL_SECONDS,
  });
}
