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

export async function getLatestFitnessWorkout(): Promise<FitnessWorkout | null> {
  try {
    const cache = getCache({ namespace: "portfolio-fitness" });
    return (await cache.get(FITNESS_KEY)) as FitnessWorkout | null;
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
  const cache = getCache({ namespace: "portfolio-fitness" });
  await cache.set(FITNESS_KEY, workout, {
    name: "Latest Apple Watch workout",
    tags: ["fitness"],
    ttl: FITNESS_CACHE_TTL_SECONDS,
  });
}
