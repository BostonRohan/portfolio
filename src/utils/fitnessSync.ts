import { z } from "zod";

import type { FitnessData, FitnessRings, FitnessWorkout } from "./fitness.ts";
import { toSyncIssues, type SyncIssue } from "./syncApi.ts";

const metricSchema = z
  .union([z.string().trim().min(1).max(80), z.number().finite()])
  .transform((value) => String(value));

const optionalMetricSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  metricSchema.optional().nullable(),
);

const workoutSchema = z.object({
  workoutType: z.string().trim().min(1).max(80),
  duration: metricSchema,
  activeEnergy: optionalMetricSchema,
  distance: optionalMetricSchema,
  completedAt: z.string().datetime({ offset: true }).optional(),
});

const progressSchema = z
  .union([z.string().trim().min(1).max(40), z.number().finite()])
  .transform((value, context) => {
    const text = String(value).trim();
    const progress = Number.parseFloat(text.replace("%", ""));
    if (!Number.isFinite(progress) || progress < 0) {
      context.addIssue({ code: "custom", message: "Invalid ring progress" });
      return z.NEVER;
    }

    return Math.min(
      !text.includes("%") && progress <= 1 ? progress * 100 : progress,
      999,
    );
  });

const ringsSchema = z.object({
  move: progressSchema,
  exercise: progressSchema,
  stand: progressSchema,
});

const payloadSchema = z.object({
  workout: z.unknown().optional(),
  rings: z.unknown().optional(),
});

const MAX_WORKOUT_AGE_MS = 15 * 60 * 60 * 1000;

export type WorkoutStatus =
  | "absent"
  | "saved"
  | "invalid"
  | "stale"
  | "future"
  | "older";

export interface IgnoredUpdate {
  field: "workout" | "rings";
  issues: SyncIssue[];
}

export interface ParsedFitnessSync {
  workout: z.infer<typeof workoutSchema> | null;
  rings: z.infer<typeof ringsSchema> | null;
  workoutStatus: WorkoutStatus;
  ignoredUpdates: IgnoredUpdate[];
}

export type FitnessSyncParseResult =
  | { success: true; data: ParsedFitnessSync }
  | {
      success: false;
      reason: "invalid-payload" | "no-valid-update";
      issues: SyncIssue[];
    };

function isEmptyWorkout(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((field) => field == null || field === "");
}

export function parseFitnessSync(value: unknown): FitnessSyncParseResult {
  const payload = payloadSchema.safeParse(value);
  if (!payload.success) {
    return {
      success: false,
      reason: "invalid-payload",
      issues: toSyncIssues(payload.error.issues),
    };
  }

  const workoutIsPresent = !isEmptyWorkout(payload.data.workout);
  const workoutResult = workoutIsPresent
    ? workoutSchema.safeParse(payload.data.workout)
    : null;
  const ringsResult =
    payload.data.rings === undefined
      ? null
      : ringsSchema.safeParse(payload.data.rings);

  const workout = workoutResult?.success ? workoutResult.data : null;
  const rings = ringsResult?.success ? ringsResult.data : null;
  if (!workout && !rings) {
    return {
      success: false,
      reason: "no-valid-update",
      issues: [
        ...(workoutResult && !workoutResult.success
          ? toSyncIssues(workoutResult.error.issues, ["workout"])
          : []),
        ...(ringsResult && !ringsResult.success
          ? toSyncIssues(ringsResult.error.issues, ["rings"])
          : []),
      ],
    };
  }

  const ignoredUpdates: IgnoredUpdate[] = [];
  if (workoutResult && !workoutResult.success && rings) {
    ignoredUpdates.push({
      field: "workout",
      issues: toSyncIssues(workoutResult.error.issues, ["workout"]),
    });
  }
  if (ringsResult && !ringsResult.success && workout) {
    ignoredUpdates.push({
      field: "rings",
      issues: toSyncIssues(ringsResult.error.issues, ["rings"]),
    });
  }

  return {
    success: true,
    data: {
      workout,
      rings,
      workoutStatus: workoutIsPresent && !workout ? "invalid" : "absent",
      ignoredUpdates,
    },
  };
}

export function applyFitnessSync(
  current: FitnessData,
  updates: ParsedFitnessSync,
  now: string,
): {
  data: FitnessData;
  incomingWorkout: FitnessWorkout | null;
  workoutStatus: WorkoutStatus;
  updatedWorkout: boolean;
  updatedRings: boolean;
} {
  const incomingWorkout: FitnessWorkout | null = updates.workout
    ? {
        ...updates.workout,
        activeEnergy: updates.workout.activeEnergy ?? null,
        distance: updates.workout.distance ?? null,
        completedAt: updates.workout.completedAt ?? now,
        syncedAt: now,
      }
    : null;

  let workoutStatus = updates.workoutStatus;
  if (incomingWorkout) {
    const workoutTime = Date.parse(incomingWorkout.completedAt);
    const workoutAge = Date.parse(now) - workoutTime;
    const previousWorkoutTime = current.workout?.completedAt
      ? Date.parse(current.workout.completedAt)
      : Number.NEGATIVE_INFINITY;

    if (workoutAge < 0) workoutStatus = "future";
    else if (workoutAge > MAX_WORKOUT_AGE_MS) workoutStatus = "stale";
    else if (workoutTime < previousWorkoutTime) workoutStatus = "older";
    else workoutStatus = "saved";
  }

  const updatedWorkout = workoutStatus === "saved";
  const rings: FitnessRings | null = updates.rings
    ? { ...updates.rings, syncedAt: now }
    : current.rings;

  return {
    data: {
      workout: updatedWorkout ? incomingWorkout : current.workout,
      rings,
    },
    incomingWorkout,
    workoutStatus,
    updatedWorkout,
    updatedRings: Boolean(updates.rings),
  };
}
