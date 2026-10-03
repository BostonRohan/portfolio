import type { AiActivityData } from "../src/utils/aiActivity.ts";
import type { FitnessWorkout } from "../src/utils/fitness.ts";

export const NOW = "2026-10-03T02:00:00.000Z";
export const workout: FitnessWorkout = {
  workoutType: "Running",
  duration: "30",
  activeEnergy: "200",
  distance: "3",
  completedAt: "2026-10-03T01:00:00.000Z",
  syncedAt: NOW,
};
export const activity: AiActivityData = {
  date: "2026-10-02",
  syncedAt: NOW,
  providers: {
    codex: { sessions: 2, toolCalls: 5 },
    claude: { sessions: 1, toolCalls: 3 },
  },
  tools: { terminal: 2, files: 3, web: 1, browser: 1, other: 1 },
  history: [{ date: "2026-10-01", sessions: 4, toolCalls: 10 }],
};
