import type { TrainingExerciseId } from "@/constants/trainingExercises";

const BASE_REPS: Record<TrainingExerciseId, number> = {
  squat: 10,
  press: 10,
  pushup: 5,
};

const MIN_REPS = 3;
const MAX_MULTIPLIER = 2;

const SESSIONS_PER_BONUS = 3;

export type ProgressionInputs = {
  age?: number;
  gender?: "male" | "female";
  heightCm?: number;
  weightKg?: number;
};

function ageFactor(age?: number): number {
  if (!age || age <= 0) return 1.0;
  if (age <= 30) return 1.0;
  if (age <= 45) return 0.85;
  if (age <= 60) return 0.7;
  return 0.55;
}

function genderFactor(
  exerciseId: TrainingExerciseId,
  gender?: "male" | "female",
): number {
  if (exerciseId !== "pushup") return 1.0;
  return gender === "female" ? 0.6 : 1.0;
}

function bmiFactor(heightCm?: number, weightKg?: number): number {
  if (!heightCm || !weightKg) return 1.0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (bmi < 18.5) return 0.8;
  if (bmi < 25) return 1.0;
  if (bmi < 30) return 0.85;
  if (bmi < 35) return 0.65;
  return 0.5;
}

/** Compute the personalized baseline rep target before any progression bonus. */
export function startingReps(
  exerciseId: TrainingExerciseId,
  inputs: ProgressionInputs,
): number {
  const base = BASE_REPS[exerciseId];
  const mult =
    ageFactor(inputs.age) *
    genderFactor(exerciseId, inputs.gender) *
    bmiFactor(inputs.heightCm, inputs.weightKg);
  const computed = Math.round(base * mult);
  return Math.max(MIN_REPS, computed);
}

/** Bonus reps earned from consecutive completed sessions. */
export function progressionBonus(streak: number): number {
  return Math.floor(Math.max(0, streak) / SESSIONS_PER_BONUS);
}

/** Today's target = starting + progression bonus, capped at 2× starting. */
export function todayTargetReps(
  exerciseId: TrainingExerciseId,
  inputs: ProgressionInputs,
  streak: number,
): number {
  const start = startingReps(exerciseId, inputs);
  const cap = start * MAX_MULTIPLIER;
  const withBonus = start + progressionBonus(streak);
  return Math.min(cap, withBonus);
}

/** Sessions left until next +1 rep milestone. 0 means +1 applies on next completion. */
export function sessionsUntilNextBonus(streak: number): number {
  const inCycle = streak % SESSIONS_PER_BONUS;
  return SESSIONS_PER_BONUS - inCycle;
}

export { SESSIONS_PER_BONUS };
